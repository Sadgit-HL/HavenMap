"""Builds scripts/games/card_token_slots.js: where the token circles of the ability cards sit on the card picture.

The card code says how many circles a half has (action type "tokens", slots [1, 0, 0]: 1 = gives experience) but not where they are.
This finds them in the card pictures (OpenCV Hough circles, a row of large rings in the card's text area) and checks the count against the card code.

Usage: python tools/build-token-slots.py [--assets DIR] [--folder confirmed] [class code ...]
  --assets  local clone of Sadgit-HL/Wordhaven_Assets (default D:/github/Wordhaven_Assets)
  --folder  card-code-current subfolder to read (default confirmed)
  --debug DIR  also writes one overlay picture per card (circles drawn in red) to DIR

Output: TOKEN_SLOTS[card id] = [ { x, y, r, xp, h } ... ], one entry per circle in reading order:
  x, y, r  centre and radius as fractions of the card width (x, r) and height (y), 4 decimals
  xp       1 when the circle gives experience (from the card code), else 0
  h        't' top half, 'b' bottom half
  t        track: 0 for the first tokens action of the card code, 1 for the second (a track that wraps onto two lines stays one track)
Cards where the detected circle count differs from the card code are NOT written; they are listed in the report (tools/token-slots-report.txt).
"""
import json, os, re, sys
import cv2

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'scripts', 'games', 'card_token_slots.js')
REPORT = os.path.join(ROOT, 'tools', 'token-slots-report.txt')


def norm(s):
    s = re.sub(r"['\u2019]", '', str(s).lower())
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', s))


def load_classes():
    src = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_classes.js'), encoding='utf8').read()
    return [json.loads(m) for m in re.findall(r'^\s*(\{"i":.*?\}),?$', src, re.M)]


def load_cards():
    src = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_cards.js'), encoding='utf8').read()
    return [json.loads(m) for m in re.findall(r'^\s*(\{"id":.*?\}),?$', src, re.M)]


def token_rows(card_json):
    """[(half, slots)] in reading order, from the card code."""
    rows = []
    for half in ('top', 'bottom'):
        def walk(a):
            if isinstance(a, list):
                for x in a: walk(x)
            elif isinstance(a, dict):
                if a.get('type') == 'tokens': rows.append((half[0], a.get('slots', [])))
                walk(a.get('subActions')); walk(a.get('actions'))
        walk((card_json.get(half) or {}).get('actions'))
    return rows


def image_path(assets, cls, card):
    if cls['src'] == 'fh':                                           # Frosthaven: the clone keeps them as fh/<class code>/fh-<slug>.png (the card's own address points to the worldhaven repository)
        slug = re.sub('[‐-―]', '-', card['slug'])
        p = os.path.join(assets, 'wh_character_ability_cards', 'fh', cls['code'].lower(), f'fh-{slug}.png')
        if os.path.exists(p): return p
    if card.get('img'):
        m = re.search(r'Wordhaven_Assets/refs/heads/main/(.+)$', card['img'])
        return os.path.join(assets, m.group(1)) if m else None
    slug = re.sub('[\u2010-\u2015]', '-', card['slug'])
    if cls['src'] == 'mp':
        return os.path.join(assets, 'wh_character_ability_cards', 'mp', cls['code'].lower(), f'mp-{slug}.png')
    return os.path.join(assets, 'wh_character_ability_cards', 'gh2', cls['code'].upper(), f'{slug}.jpeg')


def ring_ok(gray, x, y, r):
    """A token circle is a bright ring (solid or dashed, so 40 percent or more of the ring pixels are bright) around an empty dark inside
    (an icon such as the Soothsinger's music note fills it)."""
    import numpy as np
    h, w = gray.shape
    ang = np.linspace(0, 2 * np.pi, 120, endpoint=False)
    lit = 0
    for t in ang:
        best = 0
        for dr in (-4, -2, 0, 2, 4):
            px, py = int(round(x + (r + dr) * np.cos(t))), int(round(y + (r + dr) * np.sin(t)))
            if 0 <= px < w and 0 <= py < h: best = max(best, int(gray[py, px]))
        lit += best > 170
    yy, xx = np.ogrid[:h, :w]
    inside = gray[(xx - x) ** 2 + (yy - y) ** 2 < (0.72 * r) ** 2]
    return lit / len(ang) >= 0.40 and (inside > 150).mean() < 0.04


def detect(path):
    """Circles (x, y, r in pixels) of the token rows, plus the picture size. Rings of 5.9 to 9.3 % of the card width: a low Hough
    threshold finds the dashed start circle too, ring_ok drops what is not an empty ring."""
    im = cv2.imread(path)
    if im is None: return None, None
    h, w = im.shape[:2]
    k = w / 750.0
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    g = cv2.medianBlur(gray, 5)
    c = cv2.HoughCircles(g, cv2.HOUGH_GRADIENT, dp=1, minDist=30 * k, param1=120, param2=22, minRadius=int(44 * k), maxRadius=int(70 * k))
    cand = [] if c is None else [tuple(float(v) for v in x) for x in c[0]]
    cand = [(x, y, r) for x, y, r in cand if ring_ok(gray, x, y, r)]
    keep = []                                                              # the strongest first (Hough order); drop a circle that overlaps a kept one
    for x, y, r in cand:
        if all((x - a) ** 2 + (y - b) ** 2 > (1.2 * max(r, q)) ** 2 for a, b, q in keep): keep.append((x, y, r))
    return keep, (w, h, im)


def group_rows(circles):
    """Circles grouped into rows by y (a row is circles within 40 px at 750 px width), each row sorted by x; rows top to bottom."""
    rows = []
    for c in sorted(circles, key=lambda c: c[1]):
        if rows and abs(rows[-1][-1][1] - c[1]) < 40: rows[-1].append(c)
        else: rows.append([c])
    return [sorted(r, key=lambda c: c[0]) for r in rows]


def main():
    args = sys.argv[1:]
    assets, folder, debug, codes = 'D:/github/Wordhaven_Assets', 'confirmed', None, []
    while args:
        a = args.pop(0)
        if a == '--assets': assets = args.pop(0)
        elif a == '--folder': folder = args.pop(0)
        elif a == '--debug': debug = args.pop(0); os.makedirs(debug, exist_ok=True)
        else: codes.append(a)
    classes = load_classes(); cards = load_cards()
    out, report = {}, []
    stats = {'classes': 0, 'cards': 0, 'ok': 0, 'bad': 0, 'circles': 0}
    for cls in classes:
        if codes and cls['code'] not in codes: continue
        jf = os.path.join(ROOT, 'card-code-current', folder, f"{norm(cls['name'])}-ability-cards.code.json")
        if not os.path.exists(jf): continue
        stats['classes'] += 1
        lst = json.load(open(jf, encoding='utf8'))
        for card in (c for c in cards if c['cls'] == cls['i']):
            lv = str(card['lv']).upper()
            j = next((x for x in lst if norm(x['name']) == card['slug'] and str(x['level']).upper() == lv), None) or next((x for x in lst if norm(x['name']) == card['slug']), None)
            if not j: continue
            rows = token_rows(j)
            if not rows: continue
            stats['cards'] += 1
            tag = f"{cls['name']} / {card['slug']} (id {card['id']})"
            p = image_path(assets, cls, card)
            circles, info = detect(p) if p and os.path.exists(p) else (None, None)
            if circles is None:
                report.append(f'NO PICTURE  {tag}: {p}'); stats['bad'] += 1; continue
            w, h, im = info
            k = w / 750.0
            found = group_rows(circles)
            want = [len(s) for _, s in rows]
            flat = [c for r in found for c in r]                      # reading order: row by row, a row that wraps counts as its lines in turn
            have = [len(r) for r in found]
            if debug:
                o = im.copy()
                for x, y, r in circles: cv2.circle(o, (int(x), int(y)), int(r), (0, 0, 255), 3)
                cv2.imwrite(os.path.join(debug, f"{cls['code']}-{card['slug']}.png"), cv2.resize(o, (w // 2, h // 2)))
            if sum(want) != len(flat):
                report.append(f'COUNT       {tag}: card code {want}, detected {have}'); stats['bad'] += 1; continue
            slots = []
            for track, (half, xp) in enumerate(rows):                  # one track per tokens action of the card code
                for i in range(len(xp)):
                    x, y, r = flat[len(slots)]
                    slots.append({'x': round(x / w, 4), 'y': round(y / h, 4), 'r': round(r / w, 4), 'xp': 1 if xp[i] else 0, 'h': half, 't': track})
            out[card['id']] = slots
            stats['ok'] += 1; stats['circles'] += len(slots)
    with open(OUT, 'w', encoding='utf8', newline='\n') as f:
        f.write('// GENERATED by tools/build-token-slots.py from the card pictures and card-code-current. Do not edit by hand.\n')
        f.write('// Token circles of the ability cards by card id, in reading order: x, y = centre as a fraction of card width and height, r = radius as a fraction of card width, xp = 1 when the slot gives experience, h = half (t top, b bottom), t = track number (one per tokens action).\n')
        f.write('// Cards whose detected circle count differs from the card code are left out (tools/token-slots-report.txt).\n\n')
        f.write('export const TOKEN_SLOTS = {\n')
        for cid in sorted(out): f.write(f'  {cid}: {json.dumps(out[cid], separators=(",", ":"))},\n')
        f.write('};\n')
    with open(REPORT, 'w', encoding='utf8', newline='\n') as f:
        f.write(f"classes {stats['classes']}, cards with tokens {stats['cards']}, written {stats['ok']} ({stats['circles']} circles), not written {stats['bad']}\n")
        f.write('\n'.join(report) + ('\n' if report else ''))
    print(open(REPORT, encoding='utf8').read())


if __name__ == '__main__':
    main()
