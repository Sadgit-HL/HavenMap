"""Builds the reference sheet of icons that the readers of card pictures compare with (icons.png): the condition and element icons of the app, the modifier card
icons (bless, curse, pierce, push ...) and the class icons of the Mercenary Pack classes read so far.

Usage: python tools/card-extraction/make-icon-sheet.py [output.png] [path to Wordhaven_Assets]
Needs Pillow (a tool only). The app has no dependencies."""
import glob
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons.png')
ASSETS = sys.argv[2] if len(sys.argv) > 2 else 'D:/github/Wordhaven_Assets'
CELL, COLS = 118, 8

files = []                                                     # (path, label)
for f in sorted(glob.glob(os.path.join(ROOT, 'images', 'icons', 'conditions-*.webp'))):
    files.append((f, os.path.basename(f)[11:-5]))
for f in sorted(glob.glob(os.path.join(ROOT, 'images', 'icons', 'elements-*.webp'))):
    files.append((f, os.path.basename(f)[9:-5]))
mod = os.path.join(ROOT, 'images', 'attack-modifiers', 'common', 'icons', 'center')
for n in ('bless', 'curse', 'pierce', 'push', 'add-target', 'brittle', 'immobilize', 'impair', 'regenerate', 'safeguard-ally', 'ward-range', 'wound'):
    f = os.path.join(mod, 'conditions-%s.webp' % n)
    if os.path.exists(f):
        files.append((f, 'mod:' + n))
for n, label in (('irritation', 'irritation'), ('resolve_white', 'resolve'), ('resolve_black', 'resolve (dark)'), ('scry', 'scry')):
    f = os.path.join(ASSETS, 'MP', 'abilities', n + '.png')
    if os.path.exists(f):
        files.append((f, 'Hail ' + label))
f = os.path.join(ASSETS, 'MP', 'tokens', 'rift.png')
if os.path.exists(f):
    files.append((f, 'Cassandra rift'))

rows = (len(files) + COLS - 1) // COLS
sheet = Image.new('RGB', (COLS * CELL, rows * (CELL + 16)), (70, 60, 60))
d = ImageDraw.Draw(sheet)
for i, (f, label) in enumerate(files):
    im = Image.open(f).convert('RGBA')
    im.thumbnail((CELL - 10, CELL - 10))
    x, y = (i % COLS) * CELL, (i // COLS) * (CELL + 16)
    sheet.paste(im, (x + (CELL - im.width) // 2, y + (CELL - im.height) // 2), im)
    d.text((x + 3, y + CELL), label[:19], fill=(255, 255, 255))
sheet.save(OUT)
print(len(files), 'icons ->', OUT)
