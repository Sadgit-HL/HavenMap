# Builds spheres/badge-m2.webp from badge-m1.webp: the "-1" is inpainted away to get a clean red
# disc, then the bevelled "-2" from numbers/c-m2.webp is scaled to the same size and pasted in the
# same place. (-2 was not exported from Photoshop.) Run: python make-badge-m2.py [ATTACK_MODS_DIR]
import os, sys
import numpy as np, cv2
from PIL import Image
D = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods')
M1_NUM_H = 204   # height of the "-1" glyph in numbers/c-m1.webp (alpha bbox)

im = np.array(Image.open(os.path.join(D, 'spheres', 'badge-m1.webp')).convert('RGBA'))
a = im[:, :, 3].astype(int)
ys, xs = np.where(a > 200)
cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
rad = xs.max() - xs.min()
rgb = im[:, :, :3].astype(int)
mx, mn = rgb.max(2), rgb.min(2)
sat = (mx - mn) / np.maximum(mx, 1)
yy, xx = np.mgrid[0:im.shape[0], 0:im.shape[1]]
inner = ((xx - cx) ** 2 + (yy - cy) ** 2) < (0.36 * rad) ** 2
mask = ((a > 200) & inner & (sat < 0.35) & (mx > 150)).astype(np.uint8) * 255
y0, x0 = np.where(mask)
nb = (x0.min(), y0.min(), x0.max() + 1, y0.max() + 1)           # bbox of the "-1" in the badge
mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
clean = cv2.inpaint(np.ascontiguousarray(im[:, :, :3]), mask, 6, cv2.INPAINT_TELEA)
disc = Image.fromarray(np.dstack([clean, im[:, :, 3]]), 'RGBA')

num = Image.open(os.path.join(D, 'numbers', 'c-m2.webp')).convert('RGBA')
g = num.crop(num.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox())
k = (nb[3] - nb[1]) / M1_NUM_H
g = g.resize((round(g.width * k), round(g.height * k)), Image.LANCZOS)
ncx, ncy = (nb[0] + nb[2]) / 2, (nb[1] + nb[3]) / 2
disc.alpha_composite(g, (round(ncx - g.width / 2), round(ncy - g.height / 2)))
disc.save(os.path.join(D, 'spheres', 'badge-m2.webp'), 'WEBP', quality=90, alpha_quality=100, method=6)
print('written spheres/badge-m2.webp; -1 bbox', nb, 'scale', round(k, 3))
