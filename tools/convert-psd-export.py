import os, re, glob, json
from PIL import Image
SRC = r"C:\Users\hansen\ai\games\HavenMap\campaign_assets\psd-export"
DST = r"C:\Users\hansen\ai\games\HavenMap\HavenMap-campaign\images\common\attack_mods"
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

out, collisions, total = [], {}, 0
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    n = os.path.basename(f)[:-4]
    if n in SKIP: continue
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
