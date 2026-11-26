#!/usr/bin/env python3
"""Makes the four H.I.V.E. steam gauge tokens (the pressure states of its toggle token) from the owner's SVG remakes.

Source: P:/Guido/boardgames/Worldhaven/templates/SVG Icons/classes_FH/unofficial remakes (spoilers)/ SteamB, SteamG, SteamY, SteamR (.svg).
Renders them with ImageMagick (magick) at 156 px and writes images/icons/tokens-hive_steam_<colour>.webp, then records each in
tools/images-manifest.json under the address images/common/mercenary_tokens/hive_steam_<colour>. Run tools/generate-image-index.py afterwards.

Usage: python -I tools/make-hive-steam-tokens.py [folder with the SVG files]
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
DEFAULT_SRC = 'P:/Guido/boardgames/Worldhaven/templates/SVG Icons/classes_FH/unofficial remakes (spoilers)'
COLOURS = {'blue': 'SteamB', 'green': 'SteamG', 'yellow': 'SteamY', 'red': 'SteamR'}
SIZE = 156


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    with open(MANIFEST, encoding='utf-8') as f:
        man = json.load(f)
    byd = {r.get('dst'): r for r in man['files']}
    with tempfile.TemporaryDirectory() as tmp:
        for colour, name in COLOURS.items():
            png = os.path.join(tmp, colour + '.png')
            subprocess.run(['magick', '-background', 'none', '-density', '600', os.path.join(src, name + '.svg'), '-resize', f'{SIZE}x{SIZE}', png], check=True)
            dst = f'icons/tokens-hive_steam_{colour}.webp'
            out = os.path.join(ROOT, 'images', *dst.split('/'))
            Image.open(png).convert('RGBA').save(out, 'WEBP', quality=90, method=6)
            rec = byd.get(dst) or {}
            rec.update({'group': 'generated tokens', 'src': f'C:/Users/hansen/ai/games/HavenMap/HavenMap/images/common/mercenary_tokens/hive_steam_{colour}.png',
                        'dst': dst, 'status': 'ok', 'bytes': os.path.getsize(out), 'size': [SIZE, SIZE], 'generated': 'tools/make-hive-steam-tokens.py'})
            if dst not in byd:
                man['files'].append(rec)
            print(f'{name}: {dst}')
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
