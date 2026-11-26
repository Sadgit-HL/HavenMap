#!/usr/bin/env python3
"""Converts the four H.I.V.E. pressure gauge pictures (the states of its toggle token) to WebP.

Source: images/icons/pressure_low.png, pressure_regular.png, pressure_high.png, pressure_over.png (150 px, the owner's artwork).
Writes images/icons/tokens-hive_pressure_<state>.webp and records each in tools/images-manifest.json under the address
images/common/mercenary_tokens/hive_pressure_<state>. Run tools/generate-image-index.py afterwards. The PNG files are not used by the app.

Usage: python -I tools/make-hive-pressure-tokens.py
"""
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
STATES = ['low', 'regular', 'high', 'over']


def main():
    with open(MANIFEST, encoding='utf-8') as f:
        man = json.load(f)
    # the first version of these tokens (steam gauge, hive_steam_*) is gone
    man['files'] = [r for r in man['files'] if 'hive_steam_' not in str(r.get('dst'))]
    byd = {r.get('dst'): r for r in man['files']}
    for s in STATES:
        im = Image.open(os.path.join(ROOT, 'images', 'icons', f'pressure_{s}.png')).convert('RGBA')
        dst = f'icons/tokens-hive_pressure_{s}.webp'
        out = os.path.join(ROOT, 'images', *dst.split('/'))
        im.save(out, 'WEBP', quality=90, method=6)
        rec = byd.get(dst) or {}
        rec.update({'group': 'repo images', 'src': f'C:/Users/hansen/ai/games/HavenMap/HavenMap/images/common/mercenary_tokens/hive_pressure_{s}.png',
                    'dst': dst, 'status': 'ok', 'bytes': os.path.getsize(out), 'size': list(im.size), 'generated': 'tools/make-hive-pressure-tokens.py'})
        if dst not in byd:
            man['files'].append(rec)
        print(dst)
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
