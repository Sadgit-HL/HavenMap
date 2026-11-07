# Converts the two-tone dual-element card backgrounds (815x531 PNGs named like E_D.png) into
# images/common/attack_mods/frames/mixed-elements-<a>-<b>.webp (600x391, opaque, same as the other frames).
# Usage: python convert-dual-frames.py [SRC_DIR] [DST_ATTACK_MODS_DIR]
import os, sys, glob
from PIL import Image
SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\guido\ai\games\HavenMap\asset-backups\amd\assets"
DST = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images', 'common', 'attack_mods')
SIZE = (600, 391)
EL = {'E': 'earth', 'F': 'fire', 'I': 'ice', 'L': 'light', 'W': 'wind', 'D': 'dark'}
os.makedirs(os.path.join(DST, 'frames'), exist_ok=True)
n = 0
for f in sorted(glob.glob(os.path.join(SRC, '?_?.png'))):
    a, b = os.path.basename(f)[0], os.path.basename(f)[2]
    im = Image.open(f).convert('RGBA')
    if im.getchannel('A').getextrema()[0] < 255: print('note: transparency in', f)
    name = f'mixed-elements-{EL[a]}-{EL[b]}'
    im.convert('RGB').resize(SIZE, Image.LANCZOS).save(os.path.join(DST, 'frames', name + '.webp'), 'WEBP', quality=88, method=6)
    n += 1
print('written', n, 'frames')

# Bless: frame (815x531, opaque) and centre icon (cropped diamond, scaled into the box the old icon filled).
DIAMOND_BOX = (186, 81, 421, 316)
b = os.path.join(SRC, 'bless.png')
if os.path.exists(b):
    Image.open(b).convert('RGB').resize(SIZE, Image.LANCZOS).save(os.path.join(DST, 'frames', 'bless.webp'), 'WEBP', quality=88, method=6)
    print('written frames/bless.webp')
bi = os.path.join(SRC, 'Bless_icon.png')
if os.path.exists(bi):
    w, h = DIAMOND_BOX[2] - DIAMOND_BOX[0], DIAMOND_BOX[3] - DIAMOND_BOX[1]
    canvas = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(Image.open(bi).convert('RGBA').resize((w, h), Image.LANCZOS), DIAMOND_BOX[:2])
    canvas.save(os.path.join(DST, 'icons', 'center', 'conditions-bless.webp'), 'WEBP', quality=88, alpha_quality=100, method=6)
    print('written icons/center/conditions-bless.webp')

# Curse frame (815x531, opaque, no petals).
cp = os.path.join(SRC, 'curse.png')
if os.path.exists(cp):
    Image.open(cp).convert('RGB').resize(SIZE, Image.LANCZOS).save(os.path.join(DST, 'frames', 'curse.webp'), 'WEBP', quality=88, method=6)
    print('written frames/curse.webp')
