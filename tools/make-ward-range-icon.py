# Builds icons/center/conditions-ward-range.webp: the ward diamond with its shield/flame glyph scaled
# down (x0.77) and moved up, to leave room for the "range N" line the real card has under it.
# Glyph box measured off the plus0wardrange1flip scan on the 600x391 canvas: x 252-340, y 103-231.
# Run: python make-ward-range-icon.py [ATTACK_MODS_DIR]
import os, sys
import numpy as np
from PIL import Image
D = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods')
src = np.array(Image.open(os.path.join(D, 'icons', 'center', 'conditions-ward.webp')).convert('RGBA')).astype(float)
cx, cy = 303.5, 198.5
yy, xx = np.mgrid[0:391, 0:600]
inner = (np.abs(xx - cx) + np.abs(yy - cy)) < 100            # inside the diamond, clear of its white outline
rgb = src[:, :, :3]
opaque = (src[:, :, 3] > 200) & inner
fill = np.median(rgb[opaque & (rgb.min(2) < 200)], axis=0)    # the diamond's flat colour
# soft glyph mask: 0 at the fill colour .. 1 at white
span = 255 - fill.min()
white = np.clip((rgb.min(2) - fill.min()) / span, 0, 1) * inner
glyph_mask = (white > 0.5)
ys, xs = np.where(glyph_mask)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
# diamond without the glyph: paint the glyph's box (inside the diamond) with the fill colour
base = src.copy()
region = inner & (white > 0.02)
base[region, :3] = fill
# glyph as white + alpha, cropped, scaled, pasted at the new box
g = np.zeros((391, 600, 4), np.uint8); g[:, :, :3] = 255; g[:, :, 3] = (white * 255).astype(np.uint8)
g = Image.fromarray(g, 'RGBA').crop(box)
nx0, ny0, nx1, ny1 = 252, 103, 340, 231
g = g.resize((nx1 - nx0, round((nx1 - nx0) * g.height / g.width)), Image.LANCZOS)
out = Image.fromarray(base.astype(np.uint8), 'RGBA')
out.alpha_composite(g, (nx0, ny0))
out.save(os.path.join(D, 'icons', 'center', 'conditions-ward-range.webp'), 'WEBP', quality=92, alpha_quality=100, method=6)
print('glyph box', box, '-> ', (nx0, ny0, nx1, ny0 + g.height), 'fill', fill.astype(int))
