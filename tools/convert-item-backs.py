#!/usr/bin/env python3
"""Backs of the GH2E flip items: images/items/gh2/<id>b.webp, 196x300 WebP like the fronts, and their manifest records.

Flip items have a second side that matters ("flip this card over"). The group's asset repository (Sadgit-HL/Wordhaven_Assets)
holds a back only for those: wh_items/gh2/<id>b.png, and for 74 and 80 without the leading zero (74b.png, 80b.png). Checked
on 2026-11-17: the flip icon was searched on all 179 fronts (template match); the same eight cards carry it, and the eight
backs are real second sides. The address in the manifest is the zero-padded one, as the app asks for it
(scripts/campaign/cardImages.js itemBackUrl). The backs of the Frosthaven and Mercenary Pack solo items come from
tools/extract-solo-items.py.

Run tools/generate-image-index.py afterwards.

Usage: python -I tools/convert-item-backs.py --assets D:/github/Wordhaven_Assets
"""
import argparse
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
SIZE = (196, 300)
FLIP = [54, 72, 74, 80, 100, 116, 128, 162]
FILE_FIX = {74: '74b.png', 80: '80b.png'}            # the file names in the asset repository without the leading zero
GROUP = 'items back gh2'


def picture(src, dst):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    want = SIZE[0] / SIZE[1]
    if w / h > want:                                 # the backs are 204 to 208 wide: cut the sides evenly
        nw = round(h * want)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    elif w / h < want:
        nh = round(w / want)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize(SIZE, Image.LANCZOS).save(dst, 'WEBP', quality=85, method=6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--assets', default='D:/github/Wordhaven_Assets')
    a = ap.parse_args()
    records = []
    for n in FLIP:
        name = f'{n:03d}b'
        src = os.path.join(a.assets, 'wh_items', 'gh2', FILE_FIX.get(n, name + '.png'))
        if not os.path.isfile(src):
            raise SystemExit(f'missing back: {src}')
        rel = f'items/gh2/{name}.webp'
        out = os.path.join(ROOT, 'images', *rel.split('/'))
        picture(src, out)
        records.append({'group': GROUP, 'src': f'D:/github/Wordhaven_Assets/wh_items/gh2/{name}.png', 'dst': rel, 'status': 'ok',
                        'bytes': os.path.getsize(out), 'size': list(SIZE),
                        'from': f'Sadgit-HL/Wordhaven_Assets wh_items/gh2/{os.path.basename(src)}'})
    man = json.load(open(MANIFEST, encoding='utf-8'))
    man['files'] = [r for r in man['files'] if r.get('group') != GROUP] + records
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        f.write(json.dumps(man, ensure_ascii=False, indent=1))      # as the file was written: no final newline
    print(f'{len(records)} backs written')


if __name__ == '__main__':
    main()
