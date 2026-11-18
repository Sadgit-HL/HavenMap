"""Jaws of the Lion ability cards and card backs in the updated (GH2E style) design, from the group's asset repository.

Source: a local clone of Sadgit-HL/Wordhaven_Assets, wh_character_ability_cards/jotl/jl-<code>-<card>.png (400x600; the folder also
holds a few other classes' cards, fc-* and gh-*, which are skipped) and the backs jl-<code>-<class>-card-back.png.
Output: images/character-abilities/jotl/<code>-<card>.webp and images/card-backs/jotl/<code>-card-back.webp, recorded in
tools/images-manifest.json with the source path, so tools/generate-image-index.py maps the asset repository address to them.
Every other file under those two folders (the older worldhaven card scans in the JotL design, including the tutorial versions a and b,
and the older backs) is deleted, and its manifest record removed. Run tools/generate-image-index.py afterwards.

Usage: python -I tools/convert-jotl-ability-cards.py [path/to/Wordhaven_Assets]
"""
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = r'D:\github\Wordhaven_Assets'
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
CARDS_DIR, BACKS_DIR = 'character-abilities/jotl/', 'card-backs/jotl/'


def main():
    src_root = (sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC).replace('\\', '/').rstrip('/')
    folder = f'{src_root}/wh_character_ability_cards/jotl'
    with open(MANIFEST, encoding='utf-8') as f:
        man = json.load(f)
    new = {}
    for fn in sorted(os.listdir(folder)):
        m = re.fullmatch(r'jl-([a-z]{2})-(.+)\.png', fn)
        if not m:
            continue
        code, rest = m.groups()
        dst = f'{BACKS_DIR}{code}-card-back.webp' if rest.lower().endswith('card-back') else f'{CARDS_DIR}{code}-{rest}.webp'
        im = Image.open(f'{folder}/{fn}').convert('RGB')
        im.save(os.path.join(ROOT, 'images', *dst.split('/')), 'WEBP', quality=85, method=6)
        new[dst] = {'group': 'ability JotL', 'src': f'{folder}/{fn}', 'dst': dst, 'status': 'ok',
                    'bytes': os.path.getsize(os.path.join(ROOT, 'images', *dst.split('/'))), 'size': list(im.size)}
    removed = 0
    keep = []
    for rec in man['files']:
        d = rec.get('dst', '')
        if (d.startswith(CARDS_DIR) or d.startswith(BACKS_DIR)) and d not in new:
            p = os.path.join(ROOT, 'images', *d.split('/'))
            if os.path.exists(p):
                os.remove(p)
            removed += 1
            continue
        if d in new:
            continue                                   # replaced by the new record below
        keep.append(rec)
    for sub in (CARDS_DIR, BACKS_DIR):                 # files with no manifest record
        for fn in os.listdir(os.path.join(ROOT, 'images', *sub.strip('/').split('/'))):
            if sub + fn not in new:
                os.remove(os.path.join(ROOT, 'images', *sub.strip('/').split('/'), fn))
                removed += 1
    man['files'] = keep + list(new.values())
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
        f.write('\n')
    backs = sum(1 for d in new if d.startswith(BACKS_DIR))
    print(f'{len(new) - backs} cards and {backs} backs written; {removed} old files removed')


if __name__ == '__main__':
    main()
