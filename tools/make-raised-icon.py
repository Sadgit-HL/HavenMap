# Builds a copy of a centre icon with its glyph scaled and moved up inside the diamond, to leave room
# for a label (Ally, range line) under it. The diamond itself stays where it is.
# Usage: python make-raised-icon.py <icon name> <out name> <scale> <new glyph top y> [ATTACK_MODS_DIR]
#   e.g. python make-raised-icon.py conditions-safeguard conditions-safeguard-ally 0.85 112
# The glyph keeps its horizontal centre. Canvas is 600x391, diamond centre (303.5, 198.5).
import os, sys
import numpy as np
from PIL import Image
name, out_name, scale, top = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4])
D = sys.argv[5] if len(sys.argv) > 5 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods')
src = np.array(Image.open(os.path.join(D, 'icons', 'center', name + '.webp')).convert('RGBA')).astype(float)
cx, cy = 303.5, 198.5
yy, xx = np.mgrid[0:391, 0:600]
inner = (np.abs(xx - cx) + np.abs(yy - cy)) < 90             # inside the diamond, clear of its outline
rgb = src[:, :, :3]
opaque = (src[:, :, 3] > 200) & inner
fill = np.median(rgb[opaque & (rgb.min(2) < 200)], axis=0)    # the diamond's flat colour
white = np.clip((rgb.min(2) - fill.min()) / (255 - fill.min()), 0, 1) * inner
ys, xs = np.where(white > 0.5)
box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
base = src.copy()
base[inner & (white > 0.02), :3] = fill                      # diamond without the glyph
g = np.zeros((391, 600, 4), np.uint8); g[:, :, :3] = 255; g[:, :, 3] = (white * 255).astype(np.uint8)
g = Image.fromarray(g, 'RGBA').crop(box)
w, h = round(g.width * scale), round(g.height * scale)
g = g.resize((w, h), Image.LANCZOS)
gx = round((box[0] + box[2]) / 2 - w / 2)
out = Image.fromarray(base.astype(np.uint8), 'RGBA')
out.alpha_composite(g, (gx, top))
out.save(os.path.join(D, 'icons', 'center', out_name + '.webp'), 'WEBP', quality=92, alpha_quality=100, method=6)
print('glyph box', box, '->', (gx, top, gx + w, top + h))
