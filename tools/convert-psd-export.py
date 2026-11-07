import os, re, glob, json
from PIL import Image
# Per machine: pass SRC and DST as argv[1] / argv[2], or set PSD_EXPORT_SRC / AM_DST.
import sys
SRC = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('PSD_EXPORT_SRC', r"C:\Users\hansen\ai\games\HavenMap\campaign_assets\psd-export")
DST = sys.argv[2] if len(sys.argv) > 2 else os.environ.get('AM_DST', r"C:\Users\hansen\ai\games\HavenMap\HavenMap-campaign\images\common\attack_mods")
BOX = (30, 30, 845, 561)      # card area on the 874x591 canvas
SIZE = (600, 391)             # output, keeps the 815x531 aspect ratio
SKIP = {'icon-c-conditions-empower', 'icon-c-conditions-enfeeble',
        'icon-s-conditions-side-empower', 'icon-s-conditions-side-enfeeble',
        'icon-s-conditions-side-brittle-2'}

def target(n):
    """source base name -> (subfolder, file name) or None"""
    if n.startswith('frame-'):   return 'frames', n[6:]
    if n.startswith('num-c-'):   return 'numbers', 'c-' + n[6:]
    if n.startswith('num-o-'):   return 'numbers', 'o-' + n[6:]
    if n.startswith('sphere-'):  return 'spheres', n[7:]
    if n.startswith('badge-'):   return 'spheres', n          # corner badge numbers (third export pass)
    m = re.match(r'icon-([cs])-(.*)$', n)
    if m:
        side = 'center' if m.group(1) == 'c' else 'side'
        rest = m.group(2)
        rest = re.sub(r'^(conditions|effects|elements|mixed-elements)-side-', r'\1-', rest)
        rest = re.sub(r'-side$', '', rest)
        return 'icons/' + side, rest
    return None

# Hand-exported icons that replace existing centre icons. They are cropped to the icon itself, so
# each is scaled to the box the old icon occupied on the 600x391 canvas and pasted there.
# Single diamonds (push, pull, wound): old icons filled (186,81)-(421,316).
# Dual-element pills ("fire or ice.png", 317x164): width of the old round icon (264 px), same centre.
DIAMOND_BOX = (186, 81, 421, 316)
PILL_W, PILL_CENTER = 264, (303, 198)
REPLACE_SINGLE = {'push': 'conditions-push', 'pull': 'conditions-pull', 'Wound': 'conditions-wound'}
# Existing mixed-elements file names use this order for each pair.
PAIR_ORDER = {'fire-earth': 'earth-fire', 'ice-earth': 'earth-ice', 'ice-light': 'light-ice',
              'wind-earth': 'earth-wind', 'wind-light': 'light-wind'}

def replacement_target(n):
    if n in REPLACE_SINGLE: return REPLACE_SINGLE[n]
    m = re.match(r'^(\w+) or (\w+)$', n)
    if m:
        pair = m.group(1) + '-' + m.group(2)
        return 'mixed-elements-' + PAIR_ORDER.get(pair, pair)
    return None

def paste_replacement(f, n, name):
    src = Image.open(f).convert('RGBA')
    canvas = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    if n in REPLACE_SINGLE:
        w, h = DIAMOND_BOX[2] - DIAMOND_BOX[0], DIAMOND_BOX[3] - DIAMOND_BOX[1]
        canvas.alpha_composite(src.resize((w, h), Image.LANCZOS), DIAMOND_BOX[:2])
    else:
        h = round(PILL_W * src.height / src.width)
        canvas.alpha_composite(src.resize((PILL_W, h), Image.LANCZOS),
                               (PILL_CENTER[0] - PILL_W // 2, PILL_CENTER[1] - h // 2))
    p = os.path.join(DST, 'icons', 'center', name + '.webp')
    canvas.save(p, 'WEBP', quality=88, alpha_quality=100, method=6)
    return p

replaced = []
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    n = os.path.basename(f)[:-4]
    name = replacement_target(n)
    if name:
        replaced.append(os.path.relpath(paste_replacement(f, n, name), DST))
print('replaced', len(replaced), 'centre icons')

out, collisions, total = [], {}, 0
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    n = os.path.basename(f)[:-4]
    if n in SKIP or replacement_target(n): continue
    t = target(n)
    if not t: print('unmapped', n); continue
    sub, name = t
    key = (sub, name)
    if key in collisions: print('COLLISION', n, collisions[key]); continue
    collisions[key] = n
    im = Image.open(f).convert('RGBA').crop(BOX).resize(SIZE, Image.LANCZOS)
    folder = os.path.join(DST, *sub.split('/')); os.makedirs(folder, exist_ok=True)
    p = os.path.join(folder, name + '.webp')
    if sub == 'frames': im.convert('RGB').save(p, 'WEBP', quality=88, method=6)
    else:               im.save(p, 'WEBP', quality=88, alpha_quality=100, method=6)
    sz = os.path.getsize(p); total += sz
    out.append({'src': n, 'file': (sub + '/' + name + '.webp'), 'bytes': sz})
print('written', len(out), 'files,', round(total/1e6, 2), 'MB')
by = {}
for o in out: by.setdefault(o['file'].split('/')[0], []).append(o['bytes'])
for k, v in by.items(): print(k, len(v), round(sum(v)/1e6, 2), 'MB')
json.dump(out, open(os.path.join(os.environ.get('TEMP', '.'), 'am_convert.json'), 'w'), indent=1)
