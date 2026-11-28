"""Builds scripts/games/card_enhancement_slots.js: where the enhancement markers (square, diamond, diamondPlus, circle) sit on the ability card pictures.

The card code lists the markers of a card (`enhancement: [square]` on an action, the `x` hexes of an area pattern) but not where they are.
This finds them in the card pictures by template matching (templates in tools/enhancement-templates, cut from Wildfury cards) and checks the result
against the card code: the number of markers and their shapes must agree, else the card is left out and listed in tools/enhancement-slots-report.txt.

Usage: python tools/build-enhancement-slots.py [--bootstrap] [--assets DIR] [--folder confirmed] [--debug DIR] [class code ...]
       python tools/build-enhancement-slots.py --overrides-only      apply import/enhancement-overrides.json to the existing output, no detection (a second)
  --bootstrap  first build the class's own templates (tools/enhancement-templates/<class code>/) from the card pictures
  --assets  local clone of Sadgit-HL/Wordhaven_Assets (default D:/github/Wordhaven_Assets)
  --folder  card-code-current subfolder to read (default confirmed)
  --debug   directory for one overlay picture per card (markers boxed in green)

Output: ENHANCE_SLOTS[card id] = [ { x, y, k, h } ... ] in reading order (rows top to bottom, left to right):
  x, y  centre as fractions of the card width and height, 4 decimals
  k     shape: square, diamond, diamondPlus or circle (as found in the picture; a hex dot of an area pattern shows whatever shape it is drawn with)
  h     't' top half, 'b' bottom half
Checks: the shapes of the card code's enhancement entries must all be found, and the markers left over must equal the number of `x` hexes in the area patterns.
"""
import glob, importlib.util, json, os, re, sys
import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
OUT = os.path.join(ROOT, 'scripts', 'games', 'card_enhancement_slots.js')
REPORT = os.path.join(HERE, 'enhancement-slots-report.txt')
OVERRIDES = os.path.join(ROOT, 'import', 'enhancement-overrides.json')      # decisions made in tools/review/index.html: { card id: { status, markers, note } }


def load_overrides():
    ov = {}
    for f in (OVERRIDES,):
        if os.path.exists(f): ov.update(json.load(open(f, encoding='utf8')))
    return ov
REVIEW = os.path.join(HERE, 'review', 'review-data.json')          # what the review page shows: every card with its expected and detected markers
W0, R0, THR, THR_CLASS = 750.0, 13, 0.72, 0.85     # reference picture width, template half size, match threshold (generic seeds, class templates: real markers score 0.88 and up, letters and pill edges 0.72 to 0.79)

spec = importlib.util.spec_from_file_location('tokenslots', os.path.join(HERE, 'build-token-slots.py'))
ts = importlib.util.module_from_spec(spec); spec.loader.exec_module(ts)      # norm, load_classes, load_cards, image_path
spec2 = importlib.util.spec_from_file_location('ccc', os.path.join(HERE, 'convert-card-code.py'))
ccc = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(ccc)      # split_cards


def bandpass(im):
    """Grayscale band-pass (difference of Gaussians): removes the class colour and the background shading, keeps the outline and fill of the small markers."""
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    return cv2.GaussianBlur(g, (0, 0), 0.8) - cv2.GaussianBlur(g, (0, 0), 5)


MATCH = 'bgr'                                         # what the templates are matched on: 'bgr' (class colours, the per-class templates) or 'bp' (band-pass, the generic seed templates)
KINDS = ('square', 'diamond', 'diamondPlus', 'circle')
ENH_TOKEN = re.compile(r'%enh(?:ancement)?-(square|circle|diamondPlus|diamond|plus)%')
CONTRAST = (6.0, 40.0)                                 # band-pass standard deviation of a marker crop (seen: 8 to 33)


def prep(im, mode):
    return bandpass(im) if mode == 'bp' else im


def load_templates(sub='', mode='bp'):
    """{kind: [template]} from tools/enhancement-templates/<sub>/<kind>[_n].png, prepared for the matching mode."""
    t = {}
    dirs = [os.path.join(HERE, 'enhancement-templates', sub)] + ([os.path.join(HERE, 'enhancement-templates', 'manual', sub)] if sub else [])   # manual: crops picked by hand, never deleted by --bootstrap
    for d in dirs:
        for f in sorted(glob.glob(os.path.join(d, '*.png'))):
            n = os.path.basename(f)[:-4]
            t.setdefault(n.split('_')[0], []).append(prep(cv2.imread(f), mode))
    return t


def class_dir(cls): return cls['code']


def expected(card):
    """(enhancement shapes in reading order of the card code, number of x hexes in the area patterns)."""
    shapes, hexes = [], 0
    for half in ('top', 'bottom'):
        def walk(a):
            nonlocal hexes
            if isinstance(a, list):
                for x in a: walk(x)
            elif isinstance(a, dict):
                e = a.get('enhancement')
                if e:
                    for x in (e if isinstance(e, list) else [e]):
                        if x != 0: shapes.append(x)
                if a.get('type') == 'area': hexes += str(a.get('pattern', '')).count('x')
                for m in ENH_TOKEN.finditer(str(a.get('text', ''))): shapes.append(m.group(1))                  # a marker written inside a printed text: %enhancement-square%
                for k, v in a.items():
                    if k != 'enhancement' and isinstance(v, (dict, list)): walk(v)
        walk(card.get(half))
    return shapes, hexes


def scale(im):
    k = W0 / im.shape[1]
    return cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC) if abs(k - 1) > 0.01 else im


def in_zone(x, y, w, h):
    return not (y < 0.105 * h or y > 0.952 * h or x < 0.06 * w or x > 0.94 * w or 0.48 * h < y < 0.59 * h)      # header, edges, footer, initiative band


def candidates(im, templates, thr, mode):
    """Sorted [(score, x, y, kind)] of the template matches at or above thr, in the zone where markers can be."""
    h, w = im.shape[:2]
    pim = prep(im, mode)
    cand = []
    for kind, ts_ in templates.items():
        for t in ts_:
            r = cv2.matchTemplate(pim, t, cv2.TM_CCOEFF_NORMED)
            ys, xs = np.where((r >= thr) & (r >= cv2.dilate(r, np.ones((15, 15), np.uint8))))      # local maxima only: at a low threshold every pixel around a hit would be a candidate
            cand.extend(sorted(((float(r[y, x]), x + R0, y + R0, kind) for y, x in zip(ys, xs) if in_zone(x + R0, y + R0, w, h)), reverse=True)[:80])   # a flat template matches everywhere: keep the best 80
    cand.sort(reverse=True)
    return cand


def nms(cand, dist=20):
    keep = []
    for c in cand:
        if all((c[1] - a) ** 2 + (c[2] - b) ** 2 > dist ** 2 for _, a, b, _ in keep): keep.append(c)
    return keep


def expected_raw(d):
    """The same count from the owner's card code text (YAML) instead of the JSON: the JSON converter drops a marker written inside a printed text
    (%enhancement-square%), the card code text has it."""
    shapes, hexes = [], 0
    def walk(v, key=''):
        nonlocal hexes
        if isinstance(v, dict):
            for k, x in v.items(): walk(x, k)
        elif isinstance(v, list):
            if key == 'enhancement': shapes.extend(x for x in v if x != 0 and isinstance(x, str))
            else:
                for x in v: walk(x, key)
        elif isinstance(v, str):
            if key == 'enhancement' and v != '0': shapes.append(v)
            elif key == 'hex': hexes += v.count('x')
            else: shapes.extend(m.group(1) for m in ENH_TOKEN.finditer(v))
    walk({k: d.get(k) for k in ('top', 'bottom')})
    return shapes, hexes


def load_md(path):
    """{card name: parsed YAML, (card name, level): parsed YAML} of a card code text, or {} when there is none. The name alone gives the first card of that name (the
    Jaws of the Lion files also hold the tutorial cards A and B under the same names, after the regular cards)."""
    if not os.path.exists(path): return {}
    import yaml
    text = open(path, encoding='utf-8', newline=None).read()          # universal newlines: CRLF becomes LF
    out = {}
    for first, chunk in ccc.split_cards(text):
        try:
            d = yaml.safe_load(chunk); nm = str(d['name']).strip(); out.setdefault(nm, d); out[(nm, str(d.get('level')).upper())] = d
        except Exception:
            pass
    return out


def on_badge(im, x, y):
    """The red x badge of a consumed element icon (a saturated red disc) looks like a diamond to the matcher; a marker has none of that red around it."""
    p = im[max(0, y - 11):y + 12, max(0, x - 11):x + 12].astype(int)
    return int(((p[..., 2] > 200) & (p[..., 1] < 125) & (p[..., 0] < 125)).sum()) >= 25


def ring_marker(gray, x, y):
    """A circle marker is a thin ring with a filled centre that is lighter than the card around it and nothing bright just outside the ring. The letters o, c and e
    of a printed text match the circle template too: their centre is the card background (not lighter than the surroundings) and the strokes of the next letters
    lie just outside. Measured on the confirmed Frosthaven cards: markers have outside strokes 0 and centre minus surroundings 12 to 77, letters 0.1 to 0.3 and -54 to -2."""
    h, w = gray.shape
    yy, xx = np.ogrid[max(0, y - 18):y + 19, max(0, x - 18):x + 19]
    d2 = (xx - x) ** 2 + (yy - y) ** 2
    patch = gray[max(0, y - 18):y + 19, max(0, x - 18):x + 19]
    out = patch[(d2 > 14 ** 2) & (d2 < 17 ** 2)]
    if out.size == 0: return True
    return float(patch[d2 < 5 ** 2].mean()) - float(out.mean()) > 5 and float((out > out.mean() + 40).mean()) < 0.05


def detect(im, templates, mode=MATCH, thr=None, ring=False):
    """Markers [(x, y, kind)] in pixels of the picture scaled to 750 px width, plus that scale factor."""
    k = W0 / im.shape[1]
    im = scale(im)
    h, w = im.shape[:2]
    keep = [c for c in nms(candidates(im, templates, thr or (THR if mode == 'bp' else THR_CLASS), mode)) if not on_badge(im, c[1], c[2])]
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    out = []
    for s, x, y, kind in keep:
        if ring and kind == 'circle' and not ring_marker(gray, x, y): continue                  # a letter o, c or e of a text
        if kind == 'diamond' and 'diamondPlus' not in templates and float(gray[y - 1:y + 2, x - 1:x + 2].mean()) - float(np.mean([gray[y + dy, x + dx] for dx in (-3, 3) for dy in (-3, 3)])) > 30: kind = 'diamondPlus'   # a light plus in the diamond: its centre is brighter than the fill beside it (only for a class without a diamondPlus template of its own)
        out.append((x, y, kind))
    return out, k, (w, h, im)


def has_plus(crop):
    """A diamondPlus has a cross through its centre: the centre differs clearly from the fill on the diagonals."""
    g = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY).astype(float)
    c = R0
    return abs(g[c - 1:c + 2, c - 1:c + 2].mean() - np.mean([g[c + dy, c + dx] for dx in (-3, 3) for dy in (-3, 3)])) > 20


def bootstrap(cls, items, seeds):
    """Per-class templates. items: [(picture path, expected shapes)] of the class. The generic seed templates (low threshold) propose, for every shape
    of a card, its best matches; the crops of the best proposals of a shape are compared with each other and the three most alike are saved as the class's templates."""
    crops = {k: [] for k in KINDS}
    for p, shapes in items:
        if not (p and os.path.exists(p)) or not shapes: continue
        im = scale(cv2.imread(p)); h, w = im.shape[:2]
        cand = candidates(im, seeds, 0.45, 'bp')
        taken = []
        for kind in KINDS:
            n = sum(1 for s in shapes if ('diamondPlus' if s == 'plus' else s) == kind)
            if not n: continue
            mine = nms([c for c in cand if c[3] == kind or (kind == 'diamondPlus' and c[3] == 'diamond')])
            for sc, x, y, _ in [c for c in mine if all((c[1] - a) ** 2 + (c[2] - b) ** 2 > 20 ** 2 for a, b in taken)][:n]:
                if sc >= 0.5 and R0 <= x < w - R0 and R0 <= y < h - R0:
                    crops[kind].append((sc, im[y - R0:y + R0 + 1, x - R0:x + R0 + 1].copy())); taken.append((x, y))
    dest = os.path.join(HERE, 'enhancement-templates', class_dir(cls)); os.makedirs(dest, exist_ok=True)
    for old in glob.glob(os.path.join(dest, '*.png')): os.remove(old)
    got = {}
    manual = {os.path.basename(f)[:-4].split('_')[0] for f in glob.glob(os.path.join(HERE, 'enhancement-templates', 'manual', class_dir(cls), '*.png'))}
    for kind, lst in crops.items():
        if kind in manual: continue                                     # hand-picked crops of a shape win over what the seeds found
        if kind == 'diamondPlus': lst = [t for t in lst if has_plus(t[1])]                              # a plain diamond is no example of a diamondPlus
        lst = [t for t in lst if CONTRAST[0] <= float(bandpass(t[1]).std()) <= CONTRAST[1]]            # a real marker has a clear but not a busy outline; flat or busy crops are wrong picks
        lst = sorted(lst, key=lambda t: -t[0])[:10]
        if len(lst) < 2: continue
        bps = [bandpass(c) for _, c in lst]
        cons = [float(np.median([cv2.matchTemplate(a, b, cv2.TM_CCOEFF_NORMED)[0, 0] for j, b in enumerate(bps) if j != i])) for i, a in enumerate(bps)]
        for n, i in enumerate(sorted(range(len(lst)), key=lambda i: -cons[i])[:3]): cv2.imwrite(os.path.join(dest, f'{kind}_{n}.png'), lst[i][1])
        got[kind] = len(lst)
    return got


def picture_path(cls, card):
    """The card picture as the repo keeps it (images/character-abilities), for the review page."""
    slug = re.sub('[‐-―]', '-', card['slug'])
    name = f"{cls['code'].lower()}-fh-{slug}.webp" if cls['src'] == 'fh' else f"{cls['code'].lower()}-{slug}.webp"
    return f"images/character-abilities/{cls['src']}/{name}"


def frac_order(markers):
    """Reading order for markers given as fractions (rows within 25 px of a 1050 px tall card, then left to right)."""
    rows = []
    for m in sorted(markers, key=lambda m: m['y']):
        if rows and (m['y'] - rows[-1][0]['y']) * 1050 < 25: rows[-1].append(m)
        else: rows.append([m])
    return [m for r in rows for m in sorted(r, key=lambda m: m['x'])]


def reading_order(items, h):
    """Rows (markers within 25 px in y of the row's first marker, at 750 px width), then left to right."""
    rows = []
    for it in sorted(items, key=lambda t: t[1]):
        if rows and it[1] - rows[-1][0][1] < 25: rows[-1].append(it)
        else: rows.append([it])
    return [it for r in rows for it in sorted(r, key=lambda t: t[0])]


def write_output(out):
    with open(OUT, 'w', encoding='utf8', newline='\n') as f:
        f.write('// GENERATED by tools/build-enhancement-slots.py from the card pictures and card-code-current. Do not edit by hand.\n')
        f.write('// Enhancement markers of the ability cards by card id, in reading order: x, y = centre as a fraction of card width and height, k = shape (square, diamond, diamondPlus, circle, hex), h = half (t top, b bottom).\n')
        f.write('// Cards where the markers found differ from the card code are left out unless they were confirmed or edited on the review page (import/enhancement-overrides.json; tools/enhancement-slots-report.txt lists the rest).\n\n')
        f.write('export const ENHANCE_SLOTS = {\n')
        for cid in sorted(out): f.write(f'  {cid}: {json.dumps(out[cid], separators=(",", ":"))},\n')
        f.write('};\n')


def read_output():
    out = {}
    if os.path.exists(OUT):
        for m in re.finditer(r'^  (\d+): (\[.*\]),$', open(OUT, encoding='utf8').read(), re.M): out[int(m.group(1))] = json.loads(m.group(2))
    return out


def overrides_only():
    """--overrides-only: apply import/enhancement-overrides.json to the existing output and review data without any detection.
    A card with an override takes its markers; a card that had one and has none now (Reset on the review page) goes back to its detection,
    or out of the output when that did not agree with the card code."""
    ov = load_overrides()
    review = json.load(open(REVIEW, encoding='utf8'))
    out = read_output()
    changed = 0
    byc = {c['code']: c for c in ts.load_classes()}
    mds = {}
    for rec in review.values():                                            # the card code may have changed since the last full run: refresh what the page compares with
        if rec['cls'] not in mds:
            fn = f"card_code_{ts.norm(byc[rec['cls']]['name']).replace('-', '_')}.md"
            mds[rec['cls']] = next((m for m in (load_md(os.path.join(ROOT, 'card-code-current', f, fn)) for f in ('confirmed', 'wip', 'start')) if m), {})
        md = mds[rec['cls']]
        card_md = md.get((rec['name'], str(rec['lv']).upper())) or md.get(rec['name'])
        if card_md is None: continue
        shapes, hexes = expected_raw(card_md)
        rec['expected'] = {'shapes': shapes, 'hex': hexes}
        rest, missing = [m['k'] for m in rec['detected']], []
        for sh in shapes:
            want = 'diamondPlus' if sh == 'plus' else sh
            if want in rest: rest.remove(want)
            else: missing.append(sh)
        rec['ok_detected'] = not (missing or len(rest) != hexes)
        if 'status' not in rec: rec['ok'] = rec['ok_detected']
    for k, rec in review.items():
        o = ov.get(k)
        if o and o.get('markers') is not None:
            mk = frac_order([{'x': m['x'], 'y': m['y'], 'k': m['k'], 'h': 't' if m['y'] < 0.5 else 'b'} for m in o['markers']])
            rec.setdefault('ok_detected', rec['ok'] if 'status' not in rec else False)           # the detection result before the decision
            if out.get(int(k)) != mk or rec.get('status') != o.get('status', 'edited'): changed += 1
            out[int(k)] = mk
            rec.update(ok=True, status=o.get('status', 'edited'), markers=mk, note=o.get('note', ''))
        else:
            if 'status' in rec:
                changed += 1
                rec['ok'] = rec.get('ok_detected', False)
                rec.pop('status', None); rec.pop('markers', None)
            if o and o.get('note'): rec['note'] = o['note']
            if rec['ok']: out[int(k)] = rec['detected']
            else: out.pop(int(k), None)
    write_output(out)
    with open(REVIEW, 'w', encoding='utf8', newline='\n') as f: json.dump({k: review[k] for k in sorted(review, key=int)}, f, separators=(',', ':'))
    old = open(REPORT, encoding='utf8').read().splitlines()[1:] if os.path.exists(REPORT) else []
    lines = [l for l in old if l.startswith('NO PICTURE')]
    for k in sorted(review, key=int):
        rec = review[k]; tag = f"{rec['class']} / {rec.get('slug', rec['name'])} (id {k})"
        if not rec['ok']: lines.append(f"MISMATCH    {tag}: card code {sorted(rec['expected']['shapes'])} + {rec['expected']['hex']} hex dots, found {sorted(m['k'] for m in rec['detected'])}")
        if rec.get('note'): lines.append(f"NOTE        {tag}: {rec['note']}")
    bad = sum(1 for r in review.values() if not r['ok'])
    with open(REPORT, 'w', encoding='utf8', newline='\n') as f:
        f.write(f"classes {len({r['cls'] for r in review.values()})}, cards {len(review)}, written {len(out)} ({sum(len(v) for v in out.values())} markers), not written {bad}\n")
        f.write('\n'.join(lines) + ('\n' if lines else ''))
    print(f"overrides applied: {len(ov)} decisions, {changed} cards changed; written {len(out)} cards")


def review_all():
    """--review-all: add every card the review data lacks (all classes, with or without markers) from the existing output and the overrides, without any detection,
    so the review page can show the whole card set for a spot check. A card gets its current placement (what card_enhancement_slots.js has)."""
    review = json.load(open(REVIEW, encoding='utf8')) if os.path.exists(REVIEW) else {}
    out, ov, added = read_output(), load_overrides(), 0
    classes = {c['i']: c for c in ts.load_classes()}
    for cls in classes.values():
        folder = next((f for f in ('confirmed', 'wip', 'start') if os.path.exists(os.path.join(ROOT, 'card-code-current', f, f"{ts.norm(cls['name'])}-ability-cards.code.json"))), None)
        if not folder: continue
        lst = json.load(open(os.path.join(ROOT, 'card-code-current', folder, f"{ts.norm(cls['name'])}-ability-cards.code.json"), encoding='utf8'))
        md = load_md(os.path.join(ROOT, 'card-code-current', folder, f"card_code_{ts.norm(cls['name']).replace('-', '_')}.md"))
        for card in (c for c in ts.load_cards() if c['cls'] == cls['i']):
            if str(card['id']) in review: continue
            lv = str(card['lv']).upper()
            j = next((x for x in lst if ts.norm(x['name']) == card['slug'] and str(x['level']).upper() == lv), None) or next((x for x in lst if ts.norm(x['name']) == card['slug']), None)
            md_card = j and (md.get((j['name'], str(j['level']).upper())) or md.get(j['name']))
            shapes, hexes = expected_raw(md_card) if md_card else (expected(j) if j else ([], 0))
            det = [{'x': m['x'], 'y': m['y'], 'k': m['k'], 'h': m.get('h', 't' if m['y'] < 0.5 else 'b')} for m in out.get(card['id'], [])]
            rest, missing = [m['k'] for m in det], []
            for sh in shapes:
                want = 'diamondPlus' if sh == 'plus' else sh
                if want in rest: rest.remove(want)
                else: missing.append(sh)
            agrees = not (missing or len(rest) != hexes)
            rec = {'cls': cls['code'], 'class': cls['name'], 'name': j['name'] if j else card['slug'], 'slug': card['slug'], 'lv': card['lv'], 'pic': picture_path(cls, card),
                   'expected': {'shapes': shapes, 'hex': hexes}, 'detected': det, 'ok': agrees, 'ok_detected': agrees}
            o = ov.get(str(card['id']))
            if o and o.get('markers') is not None: rec.update(ok=True, status=o.get('status', 'edited'), markers=det, note=o.get('note', ''))
            review[str(card['id'])] = rec
            added += 1
    with open(REVIEW, 'w', encoding='utf8', newline='\n') as f:
        json.dump({k: review[k] for k in sorted(review, key=int)}, f, separators=(',', ':'))
    print(f"review data: {added} cards added, {len(review)} in all")


def main():
    if '--review-all' in sys.argv[1:]:
        review_all(); return
    if '--overrides-only' in sys.argv[1:]:
        overrides_only(); return
    args = sys.argv[1:]
    assets, folder, debug, codes, boot = 'D:/github/Wordhaven_Assets', 'confirmed', None, [], False
    while args:
        a = args.pop(0)
        if a == '--assets': assets = args.pop(0)
        elif a == '--folder': folder = args.pop(0)
        elif a == '--bootstrap': boot = True
        elif a == '--debug': debug = args.pop(0); os.makedirs(debug, exist_ok=True)
        else: codes.append(a)
    seeds = load_templates('', 'bp')
    classes, cards = ts.load_classes(), ts.load_cards()
    out, report, review = {}, [], {}
    overrides = load_overrides()
    if codes:                                                              # a run for some classes keeps what the other classes already have
        done = {c['i'] for c in classes if c['code'] in codes}
        out = {k: v for k, v in read_output().items() if k // 100 not in done}
        if os.path.exists(REVIEW):
            review = {k: v for k, v in json.load(open(REVIEW, encoding='utf8')).items() if int(k) // 100 not in done}
    st = {'classes': 0, 'cards': 0, 'ok': 0, 'bad': 0, 'marks': 0}
    for cls in classes:
        if codes and cls['code'] not in codes: continue
        jf = os.path.join(ROOT, 'card-code-current', folder, f"{ts.norm(cls['name'])}-ability-cards.code.json")
        if not os.path.exists(jf): continue
        st['classes'] += 1
        lst = json.load(open(jf, encoding='utf8'))
        def card_json(card):
            lv = str(card['lv']).upper()
            return next((x for x in lst if ts.norm(x['name']) == card['slug'] and str(x['level']).upper() == lv), None) or next((x for x in lst if ts.norm(x['name']) == card['slug']), None)
        mine = [c for c in cards if c['cls'] == cls['i']]
        md = load_md(os.path.join(ROOT, 'card-code-current', folder, f"card_code_{ts.norm(cls['name']).replace('-', '_')}.md"))
        def expect(c):
            j = card_json(c)
            md_card = j and (md.get((j['name'], str(j['level']).upper())) or md.get(j['name']))
            return expected_raw(md_card) if md_card else (expected(j) if j else ([], 0))
        if boot:
            got = bootstrap(cls, [(ts.image_path(assets, cls, c), expect(c)[0]) for c in mine if card_json(c)], seeds)
            print(f"{cls['name']}: class templates from {got}")
        templates = load_templates(class_dir(cls), 'bgr')
        mode = 'bgr' if templates else 'bp'
        if not templates: templates = seeds
        for card in mine:
            j = card_json(card)
            if not j: continue
            shapes, hexes = expect(card)
            st['cards'] += 1
            tag = f"{cls['name']} / {card['slug']} (id {card['id']})"
            p = ts.image_path(assets, cls, card)
            if not (p and os.path.exists(p)): p = os.path.join(ROOT, picture_path(cls, card).replace('/', os.sep))      # no asset clone: the repo's own picture
            im = cv2.imread(p) if p and os.path.exists(p) else None
            if im is None:
                report.append(f'NO PICTURE  {tag}: {p}'); st['bad'] += 1; continue
            for thr in ([THR_CLASS, THR] if mode == 'bgr' else [THR]):                    # the strict threshold first; a card that does not agree with its card code gets a second try with the loose one
                found, k, (w, h, scaled) = detect(im, templates, mode, thr, ring=cls['src'] == 'fh')
                rest0 = [kk for _, _, kk in found]; miss0 = []
                for sh in shapes:
                    want = 'diamondPlus' if sh == 'plus' else sh
                    if want in rest0: rest0.remove(want)
                    else: miss0.append(sh)
                if not miss0 and len(rest0) == hexes: break
            if debug:
                o = scaled.copy()
                for x, y, kind in found: cv2.rectangle(o, (x - R0, y - R0), (x + R0, y + R0), (0, 255, 0), 2)
                cv2.imwrite(os.path.join(debug, f"{cls['code']}-{card['slug']}.png"), cv2.resize(o, (int(w * .6), int(h * .6))))
            have = [kind for _, _, kind in found]
            rec = {'cls': cls['code'], 'class': cls['name'], 'name': j['name'], 'slug': card['slug'], 'lv': card['lv'], 'pic': picture_path(cls, card),
                   'expected': {'shapes': shapes, 'hex': hexes}, 'detected': [{'x': round(x / w, 4), 'y': round(y / h, 4), 'k': kind, 'h': 't' if y < h / 2 else 'b'} for x, y, kind in reading_order(found, h)]}
            rest, missing = list(have), []
            for s in shapes:                                           # the shapes of the card code: 'plus' is a plus sign, matched as a diamondPlus
                want = 'diamondPlus' if s == 'plus' else s
                if want in rest: rest.remove(want)
                else: missing.append(s)
            agrees = not (missing or len(rest) != hexes)
            ov = overrides.get(str(card['id']))
            if ov and ov.get('note'): report.append(f"NOTE        {tag}: {ov['note']}")
            if ov and ov.get('markers') is not None:                    # decided on the review page: it replaces the detection
                out[card['id']] = frac_order([{'x': m['x'], 'y': m['y'], 'k': m['k'], 'h': 't' if m['y'] < 0.5 else 'b'} for m in ov['markers']])
                rec.update(ok=True, ok_detected=agrees, status=ov.get('status', 'edited'), markers=out[card['id']], note=ov.get('note', ''))
                review[str(card['id'])] = rec
                st['ok'] += 1; st['marks'] += len(out[card['id']]); continue
            rec['ok'] = rec['ok_detected'] = agrees
            if ov and ov.get('note'): rec['note'] = ov['note']
            review[str(card['id'])] = rec
            if not agrees:
                report.append(f"MISMATCH    {tag}: card code {sorted(shapes)} + {hexes} hex dots, found {sorted(have)}")
                st['bad'] += 1; continue
            out[card['id']] = rec['detected']
            st['ok'] += 1; st['marks'] += len(found)
    write_output(out)
    os.makedirs(os.path.dirname(REVIEW), exist_ok=True)
    with open(REVIEW, 'w', encoding='utf8', newline='\n') as f:
        json.dump({k: review[k] for k in sorted(review, key=int)}, f, separators=(',', ':'))
    with open(REPORT, 'w', encoding='utf8', newline='\n') as f:
        f.write(f"classes {st['classes']}, cards {st['cards']}, written {st['ok']} ({st['marks']} markers), not written {st['bad']}\n")
        f.write('\n'.join(report) + ('\n' if report else ''))
    print(open(REPORT, encoding='utf8').read())


if __name__ == '__main__':
    main()
