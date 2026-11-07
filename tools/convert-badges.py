# Converts the corner badge exports (815x531 PNGs: side_-1, side_0, side_+1.. and class_circle) to
# images/common/attack_mods/spheres/badge-<value>.webp and class-circle.webp (600x391, transparent).
# The exports carry a faint card-texture alpha over the whole canvas and a few stray pixels, so
# everything outside a circle around the badge itself is cleared. Run: python convert-badges.py [SRC] [DST]
import os, sys, glob
import numpy as np
from PIL import Image
SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\guido\ai\games\HavenMap\asset-backups\amd\assets"
DST = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods')
SIZE = (600, 391)
MARGIN = 6    # px beyond the opaque disc kept for its soft edge / shadow
os.makedirs(os.path.join(DST, 'spheres'), exist_ok=True)

def slug(v):
    return {'+': 'p', '-': 'm'}.get(v[0], 'p') + v.lstrip('+-')

def clean(im):
    a = np.array(im)
    ys, xs = np.where(a[:, :, 3] > 200)
    # Only the big opaque blob is the badge; ignore isolated stray pixels by using the dense core.
    cx0, cx1 = np.percentile(xs, [0.5, 99.5]); cy0, cy1 = np.percentile(ys, [0.5, 99.5])
    cx, cy = (cx0 + cx1) / 2, (cy0 + cy1) / 2
    r = max(cx1 - cx0, cy1 - cy0) / 2 + MARGIN
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    a[((xx - cx) ** 2 + (yy - cy) ** 2) > r * r, 3] = 0
    return Image.fromarray(a), (cx, cy, r)

n = 0
for f in sorted(glob.glob(os.path.join(SRC, 'side_*.png'))) + [os.path.join(SRC, 'class_circle.png')]:
    if not os.path.exists(f): continue
    base = os.path.basename(f)[:-4]
    name = 'class-circle' if base == 'class_circle' else 'badge-' + slug(base[5:])
    im, (cx, cy, r) = clean(Image.open(f).convert('RGBA'))
    im.resize(SIZE, Image.LANCZOS).save(os.path.join(DST, 'spheres', name + '.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
    s = SIZE[0] / 815
    print(f'{name}: centre ({cx*s:.0f},{cy*s:.0f}) on 600x391, diameter {2*(r-MARGIN)*s:.0f}')
    n += 1
print('written', n)
