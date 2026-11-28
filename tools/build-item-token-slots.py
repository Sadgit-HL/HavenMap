"""Builds scripts/games/item_token_slots.js: where the token circles of the item cards sit on the item picture (front and back).

Some items carry a track of circles (a dashed start circle, then solid ones: "on the next three sources of damage ... flip this card over"). A character token
placed on such an item snaps to these circles, like on an ability card (scripts/campaign/tokenSnap.js).

Items have no card code to count the circles against, so the pictures that carry a track were found by eye (all 214 item pictures, 2026-11-28) and are listed in
TRACKS below with their number of circles. The detector must find the same pictures with the same count, else the picture is left out and listed in
tools/item-token-slots-report.txt.

How: rings are found with a Hough transform (the same ring check as tools/build-token-slots.py), the lower half of the picture only. Rings of one row must have the
same size and an even spacing. The dashed start circle is often missed by the detector; it is added one spacing to the left of the first row when it fits on the card.

Usage: python tools/build-item-token-slots.py [--debug DIR]      (--debug: one overlay picture per item, circles drawn in red)
Output: ITEM_TOKEN_SLOTS['<item id>'] / ['<item id>b'] (the back side) = [ { x, y, r, h, t } ... ] in reading order, x, y, r as in card_token_slots.js
"""
import glob, importlib.util, os, re, sys
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
OUT = os.path.join(ROOT, 'scripts', 'games', 'item_token_slots.js')
REPORT = os.path.join(HERE, 'item-token-slots-report.txt')

# picture (edition/file name) -> circles of the track (one track, a long one wraps onto a second row). Checked by eye on all item pictures.
TRACKS = {
    'gh2/003': 2, 'gh2/028': 3, 'gh2/054': 3, 'gh2/069': 5, 'gh2/072': 3, 'gh2/072b': 3, 'gh2/089': 3, 'gh2/100': 3, 'gh2/106': 5, 'gh2/128b': 3,
    'fh/252': 3,
}

spec = importlib.util.spec_from_file_location('bts', os.path.join(HERE, 'build-token-slots.py'))
bts = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bts)


def hough(im, p2):
    h, w = im.shape[:2]
    k = w / 750.0
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    g = cv2.medianBlur(gray, 3)
    c = cv2.HoughCircles(g, cv2.HOUGH_GRADIENT, dp=1, minDist=18 * k, param1=100, param2=p2, minRadius=int(44 * k), maxRadius=int(70 * k))
    cand = [] if c is None else [tuple(float(v) for v in x) for x in c[0]]
    cand = [(x, y, r) for x, y, r in cand if y > 0.5 * h and bts.ring_ok(gray, x, y, r)]
    keep = []
    for x, y, r in cand:
        if all((x - a) ** 2 + (y - b) ** 2 > (1.25 * max(r, q)) ** 2 for a, b, q in keep):
            keep.append((x, y, r))
    return keep


def rows_of(circles, w):
    """Circles grouped into rows (same y, even spacing); only rows of two or more circles count."""
    rows = []
    for c in sorted(circles, key=lambda c: (c[1], c[0])):
        for row in rows:
            if abs(row[0][1] - c[1]) < 0.045 * w:
                row.append(c)
                break
        else:
            rows.append([c])
    good = []
    for row in rows:
        row.sort()
        if len(row) < 2:
            continue
        d = [row[i + 1][0] - row[i][0] for i in range(len(row) - 1)]
        if max(d) - min(d) < 0.25 * max(d) and 1.9 * row[0][2] < min(d) < 4.2 * row[0][2]:
            good.append(row)
    return sorted(good, key=lambda r: r[0][1])


def track(im):
    """The circles of the track of an item picture in reading order [(x, y, r) in pixels], or None when no row of rings is found."""
    h, w = im.shape[:2]
    for p2 in (22, 16, 12):
        rows = rows_of(hough(im, p2), w)
        if rows:
            break
    else:
        return None
    r = sum(c[2] for row in rows for c in row) / sum(len(row) for row in rows)
    out = []
    for n, row in enumerate(rows):
        y = sum(c[1] for c in row) / len(row)
        xs = [c[0] for c in row]
        s = (xs[-1] - xs[0]) / (len(xs) - 1)
        if n == 0 and xs[0] - s - r > 0.03 * w:                               # the dashed start circle one spacing to the left, when it fits on the card
            xs = [xs[0] - s] + xs
        out += [(x, y, r) for x in xs]
    return out


def item_key(ed, name):
    m = re.match(r'^(\d+)(b?)$', name)                                       # 072b -> 72b (the item id, a b for the back); QM2, AN ... stay as they are
    return str(int(m.group(1))) + m.group(2) if m else name


def main():
    debug = None
    args = sys.argv[1:]
    if args and args[0] == '--debug':
        debug = args[1]
        os.makedirs(debug, exist_ok=True)
    out, report = {}, []
    seen = set()
    for ed in ('gh2', 'fh', 'mp'):
        for p in sorted(glob.glob(os.path.join(ROOT, 'images', 'items', ed, '*.webp'))):
            name = os.path.basename(p)[:-5]
            tag = '%s/%s' % (ed, name)
            im = cv2.imread(p)
            if im is None:
                continue
            h, w = im.shape[:2]
            found = track(im)
            want = TRACKS.get(tag)
            if want is None:
                if found:
                    report.append('NOT A TRACK  %s: %d rings found, none expected (hexes or other art)' % (tag, len(found)))
                continue
            seen.add(tag)
            if not found:
                report.append('MISSING      %s: no row of rings found, %d expected' % (tag, want))
                continue
            if len(found) != want:
                report.append('COUNT        %s: %d circles, %d expected' % (tag, len(found), want))
                continue
            if debug:
                o = im.copy()
                for x, y, r in found:
                    cv2.circle(o, (int(x), int(y)), int(r), (0, 0, 255), 2)
                cv2.imwrite(os.path.join(debug, '%s_%s.png' % (ed, name)), cv2.resize(o, (w * 2, h * 2)))
            key = item_key(ed, name)
            out[key] = [{'x': round(x / w, 4), 'y': round(y / h, 4), 'r': round(r / w, 4), 'h': 'b', 't': 0} for x, y, r in found]
    for tag in sorted(set(TRACKS) - seen):
        report.append('NO PICTURE   %s' % tag)
    with open(OUT, 'w', encoding='utf8', newline='\n') as f:
        f.write('// GENERATED by tools/build-item-token-slots.py from the item pictures. Do not edit by hand.\n')
        f.write('// Token circles of the item cards by item id (a "b" after the id: the back side), in reading order: x, y = centre as a fraction of card width and height,\n')
        f.write('// r = radius as a fraction of card width, h = half, t = track (one per item side). Pictures whose circle count differs from the list in the generator are left out\n')
        f.write('// (tools/item-token-slots-report.txt).\n\n')
        f.write('export const ITEM_TOKEN_SLOTS = {\n')
        for k in sorted(out, key=lambda k: (not re.match(r'^\d', k), int(re.match(r'\d+', k).group()) if re.match(r'^\d', k) else 0, k)):
            f.write('  "%s": %s,\n' % (k, str(out[k]).replace("'", '"').replace(' ', '')))
        f.write('};\n')
    with open(REPORT, 'w', encoding='utf8', newline='\n') as f:
        f.write('item pictures with a track %d, written %d (%d circles)\n' % (len(TRACKS), len(out), sum(len(v) for v in out.values())))
        f.write('\n'.join(report) + ('\n' if report else ''))
    print(open(REPORT, encoding='utf8').read())


if __name__ == '__main__':
    main()
