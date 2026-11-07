# Converts assets/retaliate.png (815x531, fist in a round disc, no amount or label) to
# icons/center/effects-retaliate.webp (600x391). The export carries a faint texture over the whole
# canvas, so everything outside a circle around the disc is cleared.
import os, sys
import numpy as np
from PIL import Image
SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\guido\ai\games\HavenMap\asset-backups\amd\assets\retaliate.png"
DST = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods', 'icons', 'center', 'effects-retaliate.webp')
a = np.array(Image.open(SRC).convert('RGBA'))
ys, xs = np.where(a[:, :, 3] > 250)
cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
r = (xs.max() - xs.min()) / 2 + 4
yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
a[((xx - cx) ** 2 + (yy - cy) ** 2) > r * r, 3] = 0
Image.fromarray(a).resize((600, 391), Image.LANCZOS).save(DST, 'WEBP', quality=90, alpha_quality=100, method=6)
print('written', DST, 'centre on 600x391:', round(cx * 600 / 815), round(cy * 391 / 531), 'diameter', round(2 * (r - 4) * 600 / 815))
