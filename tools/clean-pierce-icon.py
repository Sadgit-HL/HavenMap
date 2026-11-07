# Removes the baked-in "X" from icons/center/conditions-pierce.webp (the amount is drawn as an overlay
# by the page) and closes the gap the X left in the arrow shaft. The "-" bar to the left of the X stays.
# Measured on the 600x391 canvas: X spans x 238-275, y 160-228 (box padded for its soft edge); the shaft rows are read from the icon.
import os, sys
import numpy as np
from PIL import Image
P = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods', 'icons', 'center', 'conditions-pierce.webp')
a = np.array(Image.open(P).convert('RGBA'))
X0, X1, Y0, Y1 = 238, 277, 157, 232
# shaft rows: white rows at a column just right of the X, inside the shaft only
col = a[:, 300, :]
white = (col[:, 3] > 128) & (col[:, :3].min(1) > 190)
rows = [y for y in range(180, 212) if white[y]]
print('shaft rows', rows[0], rows[-1])
# colour of the diamond fill just above the X (to paint over with)
fill = a[Y0 - 4, (X0 + X1) // 2].copy()
region = a[Y0:Y1, X0:X1]
region[:, :] = fill            # flat diamond fill: paint the whole box, no edge pixels survive
a[Y0:Y1, X0:X1] = region
# shaft: from x 266 to the X's old right edge
a[rows[0]:rows[-1] + 1, 266:X1 + 1] = [255, 255, 255, 255]   # bridge from the scan's shaft start (x 266)
Image.fromarray(a).save(P, 'WEBP', quality=92, alpha_quality=100, method=6)
print('cleaned', P)
