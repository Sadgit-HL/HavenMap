"""The Mercenary Pack Hail card "+1, Hail gains 1 resolve" (perk 17: add one to the monster attack modifier deck), as a picture.

Source: special/hail.png of a Frosthaven helper app's image folder (assets/images/attack/special/hail.png, 400x267), given as the
first argument. It is scaled to the 600x391 canvas of the other cards and written to
images/attack-modifiers/common/monster/hail-resolve.webp. The manifest record uses the repo address
images/common/attack_mods/monster/hail-resolve, which is how the code asks for it (amImg('monster/hail-resolve')); the address in
scripts/images-index.js comes from tools/generate-image-index.py.

Usage: python -I tools/convert-hail-resolve-amd.py path/to/hail.png
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
DST_REL = 'attack-modifiers/common/monster/hail-resolve.webp'
ADDRESS = 'C:/Users/hansen/ai/games/HavenMap/HavenMap/images/common/attack_mods/monster/hail-resolve.png'


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = sys.argv[1]
    im = Image.open(src).convert('RGB').resize((600, 391), Image.LANCZOS)
    dst = os.path.join(ROOT, 'images', *DST_REL.split('/'))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=85, method=6)
    with open(MANIFEST, encoding='utf-8') as f:
        man = json.load(f)
    entry = next((e for e in man['files'] if e.get('dst') == DST_REL), None)
    if entry is None:
        entry = {'group': 'repo images', 'dst': DST_REL}
        man['files'].append(entry)
    entry.update({'src': ADDRESS, 'status': 'ok', 'bytes': os.path.getsize(dst), 'size': [600, 391]})
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f'{src} -> images/{DST_REL} 600x391 {os.path.getsize(dst)} bytes')


if __name__ == '__main__':
    main()
