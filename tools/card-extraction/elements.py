"""Finds the element icons on an ability card picture (infusions and consumptions) and compares them with the card code.

Usage: python tools/card-extraction/elements.py <class code>... [--quiet]
  Classes are given by code (gh2_classes.js: mt2, ch2, hl ...). The card code JSON is read from card-code-current/<folder>/<class>-ability-cards.code.json, the pictures
  from images/character-abilities (pictures.py). Prints, per card and half, the elements the picture shows and the card code says, where they differ.
  python tools/card-extraction/elements.py --one <picture>     prints the icons found on one picture
Needs OpenCV (cv2), numpy and Pillow (a tool only; the app has no dependencies).

How: round candidates are found with a Hough transform, each is compared with the six element icons of the app (images/icons/elements-*.webp, colour, masked
correlation). A hit with a red badge (a small red disc with a cross at its lower right) is a consumption, any other hit an infusion (the dark banner with "!") or an
element in a text. The top half is above the initiative band. The wild icon (all colours) is not looked for.
"""
import json
import os
import re
import sys

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pictures import card_picture  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ELEMENTS = ['fire', 'ice', 'air', 'earth', 'light', 'dark']
THRESHOLD = {'fire': 0.85, 'ice': 0.94, 'air': 0.85, 'earth': 0.88, 'light': 0.90, 'dark': 0.60}      # without a badge (an infusion); strict, other round icons of a class colour look like an element (the dark icon is faint on a dark banner: a lower value)
LOW = {'fire': 0.70, 'ice': 0.70, 'air': 0.70, 'earth': 0.70, 'light': 0.70, 'dark': 0.40}       # with a red badge at the lower right (a consumption) the correlation is lower
BAND = 0.545                      # y of the initiative band as a share of the height: above it the top half
P = 40                            # the patch size: an icon of radius 18 (in a 450 pixel wide picture) with a little margin
CACHE = os.path.join(ROOT, 'tools', 'card-extraction', 'work', 'element-templates.npz')

_tpl = {}


def circles(rgb, rmin=10, rmax=20):
    H, W = rgb.shape[:2]
    scale = W / 450.0
    gray = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY), (5, 5), 1.2)
    c = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1, minDist=int(16 * scale), param1=90, param2=14, minRadius=int(rmin * scale), maxRadius=int(rmax * scale))
    return [] if c is None else [tuple(map(float, x)) for x in c[0]]


def patch_at(rgb, cx, cy, r):
    """The P x P patch around a circle, scaled so that an icon of radius 18 fills it the same way."""
    half = r * (P / 2) / 18.0 * 1.0
    half = max(8.0, half)
    H, W = rgb.shape[:2]
    x0, y0, x1, y1 = int(round(cx - half)), int(round(cy - half)), int(round(cx + half)), int(round(cy + half))
    if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
        return None
    return cv2.resize(rgb[y0:y1, x0:x1], (P, P), interpolation=cv2.INTER_AREA)


_yy, _xx = np.mgrid[0:P, 0:P]
_d = np.hypot(_xx - (P - 1) / 2, _yy - (P - 1) / 2)
MASK = (_d <= 16.5) & ~((_xx > P / 2 + 2) & (_yy > P / 2 + 2))             # the disc, without the lower right (the red badge of a consumption)


def build_templates(verbose=False):
    """Median banner icons of the element infusions that the card code of the Gloomhaven 2e classes says are alone in their half (the Secretariat classes are good enough for this)."""
    classes = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_classes.js'), encoding='utf-8').read()
    cards = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_cards.js'), encoding='utf-8').read()
    samples = {e: [] for e in ELEMENTS}
    for m in re.finditer(r'\{"i":(\d+),"code":"([a-z0-9]+)","name":"([^"]+)","src":"gh2"', classes):
        idx, code, name = int(m.group(1)), m.group(2), m.group(3)
        data, _ = card_json(name)
        if not data:
            continue
        for cm in re.finditer(r'\{"id":(\d+),"cls":%d,"slug":"([^"]+)","lv":"?([0-9X]+)"?,"ini":(\d+)' % idx, cards):
            slug, ini = cm.group(2), int(cm.group(4))
            j = next((x for x in data if x['initiative'] == ini), None)
            pic = card_picture('gh2', code, slug)
            if not j or not os.path.exists(pic):
                continue
            rgb = np.array(Image.open(pic).convert('RGB'))
            H, W = rgb.shape[:2]
            cs = circles(rgb, 15, 20)
            for h, (y0, y1) in (('top', (0.40, 0.49)), ('bottom', (0.85, 0.95))):
                w = code_elements(j[h])
                if len(w['infuse']) != 1 or w['consume'] or w['infuse'][0] not in samples:
                    continue
                near = [c for c in cs if y0 * H < c[1] < y1 * H and 0.30 * W < c[0] < 0.70 * W]
                if len(near) == 1:
                    pt = patch_at(rgb, *near[0])
                    if pt is not None:
                        samples[w['infuse'][0]].append(pt)
    out = {e: np.median(np.stack(v), axis=0).astype('float32') for e, v in samples.items() if v}
    if verbose:
        print({e: len(v) for e, v in samples.items()})
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    np.savez(CACHE, **out)
    return out


def templates():
    if not _tpl:
        if os.path.exists(CACHE):
            z = np.load(CACHE)
            _tpl.update({k: z[k] for k in z.files})
        else:
            _tpl.update(build_templates())
    return _tpl


def score(patch, e):
    t = templates()[e]
    a, b = patch[MASK].astype('float32').ravel(), t[MASK].astype('float32').ravel()
    a = a - a.mean()
    b = b - b.mean()
    d = np.linalg.norm(a) * np.linalg.norm(b)
    return float(a @ b / d) if d > 1e-6 else 0.0


QUAD = (_d <= 16.5) & (_xx > P / 2 + 1) & (_yy > P / 2 + 1)


def quadrant(pt, e):
    """How well the lower right quarter of the patch still matches the icon: a consumption has a red badge over it."""
    t = templates()[e]
    a, b = pt[QUAD].astype('float32').ravel(), t[QUAD].astype('float32').ravel()
    a = a - a.mean()
    b = b - b.mean()
    d = np.linalg.norm(a) * np.linalg.norm(b)
    return float(a @ b / d) if d > 1e-6 else 0.0


def badge(rgb, cx, cy, r):
    """True when a red badge (a disc with a cross) sticks out of the icon at its lower right: red pixels just outside the disc, between 10 and 80 degrees below the right."""
    H, W = rgb.shape[:2]
    x0, y0, x1, y1 = int(cx), int(cy), min(W, int(cx + 1.6 * r)), min(H, int(cy + 1.6 * r))
    if x1 <= x0 or y1 <= y0:
        return False
    p = rgb[y0:y1, x0:x1].astype(int)
    yy, xx = np.mgrid[0:p.shape[0], 0:p.shape[1]]
    d = np.hypot(xx, yy)
    region = (d >= 1.08 * r) & (d <= 1.5 * r) & (yy > 0.17 * xx) & (xx > 0.17 * yy)
    red = (p[..., 0] > 150) & (p[..., 1] < 120) & (p[..., 2] < 120) & (p[..., 0] - p[..., 1] > 60) & (abs(p[..., 1] - p[..., 2]) < 28)
    return int((red & region).sum()) >= max(6, int(r * r * 0.03))


def ring_dark(pt):
    """The dark element icon, on any background: a bright ring around a dark disc with a bright crescent."""
    lum = pt.astype('float32').mean(axis=2)
    ring = (_d >= 13.5) & (_d <= 16.5)
    disc = (_d <= 10) & ~((_xx > P / 2 + 2) & (_yy > P / 2 + 2))
    return float((lum[ring] > 135).mean()), float(lum[disc].mean())


def find(path):
    """-> [{'e': element, 'x', 'y', 'r', 'score', 'consume': bool, 'half': 'top'|'bottom'}]"""
    rgb = np.array(Image.open(path).convert('RGB'))
    H, W = rgb.shape[:2]
    out = []
    tpl = templates()
    for cx, cy, r in circles(rgb):
        if not (0.07 * H < cy < 0.97 * H and 0.05 * W < cx < 0.97 * W) or r < 15.0 * W / 450.0:       # icons in a text are smaller than banner and pill icons
            continue
        pt = patch_at(rgb, cx, cy, r)
        if pt is None:
            continue
        best = max((score(pt, e), e) for e in tpl)
        bd = badge(rgb, cx, cy, r)
        e = best[1] if best[0] >= (LOW if bd else THRESHOLD)[best[1]] else None
        if e is None:                                                              # the dark icon is faint on a dark banner: a bright ring round a dark disc
            frac, inner = ring_dark(pt)
            if frac > 0.55 and inner < 120 and score(pt, 'dark') > 0.35:
                e = 'dark'
        if e is None:
            continue
        out.append({'e': e, 'x': cx, 'y': cy, 'r': r, 'score': best[0], 'consume': bd, 'half': 'top' if cy < BAND * H else 'bottom'})
    return out


def summary(hits):
    out = {}
    for h in ('top', 'bottom'):
        mine = [k for k in hits if k['half'] == h]
        out[h] = {'infuse': sorted({k['e'] for k in mine if not k['consume']}), 'consume': sorted({k['e'] for k in mine if k['consume']})}
    return out


def code_elements(half):
    """The elements a half of the card code infuses (mandatory element banner, the half's infuse list) and consumes (a pill with a cost of elements)."""
    inf, con, txt = set(), set(), set()

    def walk(a, in_mand=False, in_pill=False):
        for x in a or []:
            if not isinstance(x, dict):
                continue
            t = x.get('type')
            for m in re.finditer(r'%(fire|ice|air|earth|light|dark)%', str(x.get('text') or '')):             # an element written into a text ("you may %ice%", "! %earth%:")
                txt.add(m.group(1))
            if t == 'element' and (in_mand or in_pill):
                inf.add(x.get('value'))
            cost = x.get('cost') or {}
            if isinstance(cost, dict) and cost.get('consume'):
                con.update(cost['consume'].get('elements', []))
            for o in x.get('options') or []:
                walk([o], False, True)
            for k in ('actions', 'subActions', 'effects'):
                walk(x.get(k), in_mand or t == 'mandatory', in_pill or t == 'optional')
    walk((half or {}).get('actions'))
    if (half or {}).get('infuse'):
        inf.update(half['infuse'])
    split = lambda xs: {y for x in xs if x for y in str(x).split('/')} - {'wild'}
    return {'infuse': sorted(split(inf)), 'consume': sorted(split(con)), 'text': sorted(txt)}


def card_json(name):
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    for f in ('confirmed', 'wip', 'start'):
        p = os.path.join(ROOT, 'card-code-current', f, '%s-ability-cards.code.json' % slug)
        if os.path.exists(p):
            return json.load(open(p, encoding='utf-8')), f
    return None, None


def main():
    argv = sys.argv[1:]
    if argv[:1] == ['--one']:
        for k in find(argv[1]):
            print('%-6s %-7s %-6s at %.0f,%.0f r %.1f score %.2f' % (k['e'], 'consume' if k['consume'] else 'infuse', k['half'], k['x'], k['y'], k['r'], k['score']))
        return 0
    args = [a for a in argv if not a.startswith('--')]
    if not args:
        print(__doc__)
        return 2
    classes = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_classes.js'), encoding='utf-8').read()
    cards = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_cards.js'), encoding='utf-8').read()
    total = bad = 0
    for code in args:
        m = re.search(r'\{"i":(\d+),"code":"%s","name":"([^"]+)","src":"([a-z0-9]+)"' % re.escape(code), classes)
        if not m:
            print('unknown class', code)
            continue
        idx, name, src = int(m.group(1)), m.group(2), m.group(3)
        data, folder = card_json(name)
        if not data:
            print('no card code for', name)
            continue
        cb = cb2 = 0
        for cm in re.finditer(r'\{"id":(\d+),"cls":%d,"slug":"([^"]+)","lv":"?([0-9X]+)"?,"ini":(\d+)' % idx, cards):
            slug, lv, ini = cm.group(2), cm.group(3), int(cm.group(4))
            norm = lambda t: re.sub(r'[^a-z0-9]+', '-', t.lower().replace("'", '').replace('’', '')).strip('-')
            j = (next((x for x in data if norm(x['name']) == slug), None) or next((x for x in data if x['initiative'] == ini and str(x['level']).upper() == lv), None)
                 or next((x for x in data if x['initiative'] == ini), None))                 # by name, else by initiative and level, else by initiative
            pic = card_picture(src, code, slug)
            if not j or not os.path.exists(pic):
                print('  %s %s: %s' % (name, slug, 'no card code' if not j else 'no picture'))
                continue
            seen = summary(find(pic))
            for h in ('top', 'bottom'):
                want = code_elements(j[h])
                total += 1
                cb += 1
                txt = set(want.pop('text'))
                for r in ('infuse', 'consume'):                                       # an element the picture shows and the half names in a text counts as present
                    seen[h][r] = [e for e in seen[h][r] if e not in txt or e in want[r]]
                if want != seen[h]:
                    bad += 1
                    cb2 += 1
                    extra = {r: sorted(set(seen[h][r]) - set(want[r])) for r in ('infuse', 'consume') if set(seen[h][r]) - set(want[r])}
                    lack = {r: sorted(set(want[r]) - set(seen[h][r])) for r in ('infuse', 'consume') if set(want[r]) - set(seen[h][r])}
                    print('%-12s %-30s %-6s %s%s' % (name, slug, h, ('picture shows more: %s  ' % json.dumps(extra, separators=(',', ':'))) if extra else '', ('picture shows less: %s' % json.dumps(lack, separators=(',', ':'))) if lack else ''))
        print('-- %s (%s): %d halves, %d differ' % (name, folder, cb, cb2))
    print('%d halves, %d differ' % (total, bad))
    return 0


if __name__ == '__main__':
    sys.exit(main())
