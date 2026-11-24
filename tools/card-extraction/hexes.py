"""Reads the hex areas of an ability card picture by colour and shape, and writes them as `hex:` patterns of the card creator. No reading by eye, no tokens.

Usage: python tools/card-extraction/hexes.py <picture> [more pictures]      prints the areas found, per half of the card
       python tools/card-extraction/hexes.py --test [path to an older Wordhaven_Assets clone]    runs the cards whose pattern the owner confirmed and reports the agreement
Needs Pillow and numpy (a tool only; the app has no dependencies).

How: the red target hexes (with a lighter X) and the grey self hex are found as blobs of colour, closed over the X, and kept when their size and shape are those of a
hexagon (about 42 x 48 pixels in a 433 x 600 picture). Hexes that touch (centres about one hex width apart) form one area. Rows are horizontal (the hexes stand with a
point up), every second row sits half a hex to the right; the pattern is written like the owner's: rows from top to bottom separated by `_`, hexes left to right, `e`
for an empty slot, `t` red, `s` grey, `x` a small enhancement hexagon. The leftmost hex gets slot 1."""
import math
import os
import sys
from collections import deque

import numpy as np
from PIL import Image

W_MIN, W_MAX = 26, 54            # width of the coloured blob of a hex in pixels (a 433 x 600 picture; the red inside is about 33, the grey with its shadow 46); scaled by the picture width
HEX_W = 42.5                     # the width of a whole hex (the distance of two neighbours) in a 433 pixel wide picture
BAND = 322                       # y of the initiative band at 600 pixels height: above it the top half, below the bottom half


def masks(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    red = (r > 140) & (g < 100) & (b < 100) & (r - g > 70) & (r - b > 70)
    grey = (abs(r - g) < 13) & (abs(g - b) < 15) & (r >= 80) & (r <= 128)
    return red, grey


def shift_max(m, k):
    out = np.zeros_like(m)
    h, w = m.shape
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            ys, yd = (slice(dy, h), slice(0, h - dy)) if dy >= 0 else (slice(0, h + dy), slice(-dy, h))
            xs, xd = (slice(dx, w), slice(0, w - dx)) if dx >= 0 else (slice(0, w + dx), slice(-dx, w))
            out[yd, xd] |= m[ys, xs]
    return out


def close(m, k=2):
    d = shift_max(m, k)
    return ~shift_max(~d, k)


def opened(m, k=3):
    """Erode, then dilate: thin strips (the shadow of a neighbouring hex) fall away, the grey hex stays."""
    e = ~shift_max(~m, k)
    return shift_max(e, k)


def components(m, min_area):
    h, w = m.shape
    seen = np.zeros_like(m, dtype=bool)
    out = []
    ys, xs = np.nonzero(m)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        pts = []
        while q:
            y, x = q.popleft()
            pts.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if len(pts) >= min_area:
            py = np.array([p[0] for p in pts])
            px = np.array([p[1] for p in pts])
            out.append((len(pts), px.min(), py.min(), px.max(), py.max(), px.mean(), py.mean()))
    return out


def find_hexes(path):
    im = Image.open(path).convert('RGB')
    scale = im.width / 433.0
    a = np.array(im)
    red, grey = masks(a)
    h, w = red.shape
    region = np.zeros_like(red)
    region[int(h * 0.07):int(h * 0.95), int(w * 0.05):int(w * 0.96)] = True            # inside the frame, below the title
    found = []
    for kind, m in (('t', red), ('s', grey)):
        cleaned = close(m & region) if kind == 't' else opened(m & region)
        for area, x0, y0, x1, y1, cx, cy in components(cleaned, int(500 * scale * scale)):
            bw, bh = (x1 - x0 + 1) / scale, (y1 - y0 + 1) / scale
            fill = area / float((x1 - x0 + 1) * (y1 - y0 + 1))
            if W_MIN <= bw <= W_MAX and 0.8 <= bw / bh <= (0.96 if kind == 't' else 1.06) and fill >= (0.62 if kind == 't' else 0.55):
                found.append({'kind': kind, 'cx': cx / scale, 'cy': cy / scale, 'w': bw})
    return found, scale


def clusters(hexes, nominal):
    """-> [(group, w)]: hexes that touch (centres about one hex width apart) form a group; w is the width of a hex there, from the distance of neighbours."""
    left, groups = list(hexes), []
    while left:
        group = [left.pop()]
        grow = True
        while grow:
            grow = False
            for h in left[:]:
                if any(((h['cx'] - g['cx']) ** 2 + (h['cy'] - g['cy']) ** 2) ** 0.5 <= 1.3 * nominal for g in group):
                    group.append(h)
                    left.remove(h)
                    grow = True
        near = []
        for g in group:
            d = [((g['cx'] - o['cx']) ** 2 + (g['cy'] - o['cy']) ** 2) ** 0.5 for o in group if o is not g]
            if d:
                near.append(min(d))
        groups.append((group, float(np.median(near)) if near else nominal))
    return groups


def find_dots(path, group, w, scale):
    """The small enhancement hexagons next to an area: a free neighbour slot of a hex whose surroundings are plain background (low variation in a ring around it) and
    that holds something (high variation inside). Returns [(cx, cy)] in picture pixels / scale."""
    lum = np.array(Image.open(path).convert('L')).astype(float)
    yy, xx = np.mgrid[0:lum.shape[0], 0:lum.shape[1]]
    cands = {}
    for h in group:
        for dx, dy in ((w, 0), (-w, 0), (w / 2, .866 * w), (-w / 2, .866 * w), (w / 2, -.866 * w), (-w / 2, -.866 * w)):
            cx, cy = h['cx'] + dx, h['cy'] + dy
            if any(math.hypot(cx - o['cx'], cy - o['cy']) < 0.5 * w for o in group):
                continue
            cands[(round(cx / 3), round(cy / 3))] = (cx, cy)
    out = []
    for cx, cy in cands.values():
        r = np.hypot(xx - cx * scale, yy - cy * scale) / scale
        ring = (r > 0.30 * w) & (r < 0.38 * w)
        inside = r < 0.26 * w
        if not ring.any() or not inside.any():
            continue
        rs, ins, rm, im = lum[ring].std(), lum[inside].std(), lum[ring].mean(), lum[inside].mean()
        if (rs <= 8 and ins >= 9) or (rs <= 20 and ins >= 40 and im > rm + 15):     # a faint dot on plain background, or a clear bright one with a little noise around it
            out.append((cx, cy))
    return out


def pattern(group, w, dots=()):
    """The pattern of one area. dots: (cx, cy) of small enhancement hexagons that belong to it."""
    items = [dict(h) for h in group] + [{'kind': 'x', 'cx': d[0], 'cy': d[1], 'w': w} for d in dots]
    x0 = min(i['cx'] for i in items)
    y0 = min(i['cy'] for i in items)
    step = 0.866 * w
    for i in items:
        i['r'] = int(round((i['cy'] - y0) / step))
        i['u'] = int(round(2 * (i['cx'] - x0) / w))
    parities = {(i['u'] + i['r']) % 2 for i in items}
    note = '' if len(parities) == 1 else 'rows are not on one hex grid'
    p = parities.pop() if len(parities) == 1 else 0
    for i in items:
        i['s'] = (i['u'] + p - i['r'] % 2) // 2
    smin = min(i['s'] for i in items)
    rows = []
    for r in range(max(i['r'] for i in items) + 1):
        slots = {i['s'] - smin + 1: i['kind'] for i in items if i['r'] == r}
        rows.append(''.join(slots.get(k, 'e') for k in range(1, (max(slots) if slots else 1) + 1)))
    return '_'.join(rows), note


def read(path):
    """-> [{'half': 'top'|'bottom', 'pattern': ..., 'hexes': n, 'note': ...}]"""
    hexes, scale = find_hexes(path)
    height = Image.open(path).height / scale
    out = []
    if not hexes:
        return out
    for g, w in clusters(hexes, HEX_W):
        if len(g) < 2:
            continue
        pat, note = pattern(g, w, find_dots(path, g, w, scale))
        cy = sum(h['cy'] for h in g) / len(g)
        out.append({'half': 'top' if cy < BAND * height / 600.0 else 'bottom', 'pattern': pat, 'hexes': len(g), 'note': note})
    return sorted(out, key=lambda a: (a['half'] != 'top', a['pattern']))


# cards whose hex pattern the owner confirmed: (source, class code, slug) of the picture, half, pattern
CONFIRMED = [
    (('mp', 'hl', 'withering-stare'), 'top', 'ett_st'), (('mp', 'hl', 'tear-a-new-one'), 'top', 'ett_ttt_ett'), (('mp', 'hl', 'interesting-specimen'), 'bottom', 'ett_ttt_ett'),
    (('mp', 'ca', 'tear-reality'), 'top', 'ete_tt_tst_tt_ete'), (('mp', 'ca', 'ethereal-vortex'), 'top', 'ett_ttt_ett'), (('mp', 'ca', 'careful-attunement'), 'top', 'etx_xtt_etx'),
    (('gh2', 'be2', 'devil-horns'), 'top', 'et_st_et'), (('mp', 'sa', 'implacable-advance'), 'top', 'et_st'), (('mp', 'sa', 'take-comman'), 'top', 'et_st_et'),
    (('mp', 'sa', 'send-them-reeling'), 'top', 'et_st_et'), (('mp', 'sa', 'dazing-sweep'), 'top', 'et_st_ex'),
]


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    if args[0] == '--test':
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import pictures
        assets = args[1] if len(args) > 1 else None
        ok = 0
        for pic, half, expected in CONFIRMED:
            rel = '/'.join(pic)
            got = [a for a in read(pictures.card_picture(*pic, assets=assets)) if a['half'] == half]
            pat = got[0]['pattern'] if got else '(none)'
            norm = lambda p: '_'.join(row.rstrip('e') for row in p.split('_'))
            good = norm(pat) == norm(expected)
            ok += good
            print('%-4s %-42s %-6s expected %-20s read %s' % ('ok' if good else 'DIFF', rel, half, expected, pat))
        print('%d of %d agree' % (ok, len(CONFIRMED)))
        return 0 if ok == len(CONFIRMED) else 1
    for path in args:
        for a in read(path):
            print('%s: hex: %s (%d hexes)%s' % (a['half'], a['pattern'], a['hexes'], ' ' + a['note'] if a['note'] else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main())
