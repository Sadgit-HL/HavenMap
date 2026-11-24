"""Unique attack modifier cards of the Jaws of the Lion classes, from the worldhaven scans.

The Jaws decks are built like the others: base and decorated cards are drawn from layers (scripts/amd/compose.js), only the
unique cards (perks.js kind "unique") are pictures. This copies those scans from a local clone of any2cards/worldhaven
(images/attack-modifiers/jaws-of-the-lion/<class>/jl-am-<class>-NN.png, 600x391) to
images/attack-modifiers/common/unique/<code>.webp, the file scripts/amd/card.js loads for a unique card, and records the source
in tools/images-manifest.json. The address in scripts/images-index.js does not change.

Jaws has one unique card: the Demolitionist's +0 "All adjacent enemies suffer 1 damage" (de1, two copies; card 140, the scan
jl-am-de-10.png; jl-am-de-11.png is the second copy).

Usage: python -I tools/convert-jotl-unique-amd.py [path/to/worldhaven]
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_WH = r'D:\github\worldhaven'
OUT = os.path.join(ROOT, 'images', 'attack-modifiers', 'common', 'unique')
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
UNIQUE = {'de1': 'de/jl-am-de-10.png'}          # unique code (perks.js) -> scan under images/attack-modifiers/jaws-of-the-lion/


def main():
    wh = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_WH
    with open(MANIFEST, encoding='utf-8') as f:
        man = json.load(f)
    for code, rel in UNIQUE.items():
        src = os.path.join(wh, 'images', 'attack-modifiers', 'jaws-of-the-lion', *rel.split('/'))
        dst_rel = f'attack-modifiers/common/unique/{code}.webp'
        dst = os.path.join(ROOT, 'images', *dst_rel.split('/'))
        im = Image.open(src).convert('RGB')
        im.save(dst, 'WEBP', quality=85, method=6)
        size, nbytes = list(im.size), os.path.getsize(dst)
        entry = next((e for e in man['files'] if e.get('dst') == dst_rel), None)
        if entry is None:
            entry = {'group': 'attack modifiers', 'dst': dst_rel}
            man['files'].append(entry)
        entry.update({'src': src.replace('\\', '/'), 'status': 'ok', 'bytes': nbytes, 'size': size})
        print(f'{code}: {rel} -> images/{dst_rel} {size[0]}x{size[1]} {nbytes} bytes')
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
