#!/usr/bin/env python3
"""Solo scenario items of the Frosthaven and Mercenary Pack classes: data and pictures.

Writes
  scripts/games/solo_items.js         SOLO_ITEMS: { id, slug, slot, kind: 'solo', n: 1, ed: 'fh' | 'mp', cls, back? }
                                      back: true when the card has a second side that matters (a flip item)
  images/items/<ed>/<id>.webp         the card front, 196x300 WebP like images/items/gh2/ (cropped to that ratio, centred)
  images/items/<ed>/<id>b.webp        the back of a flip item (only those: the other Frosthaven backs are the plain item back)
  tools/images-manifest.json          one record per picture (src = the repo path, from = the source file), so that
                                      tools/generate-image-index.py lists them. Run that script afterwards.
Old pictures of these two editions that are no longer written are deleted, with their manifest records.

Sources (local copies; pass the folders that hold them)
  --secretariat  Gloomhaven Secretariat clone (Lurkars/gloomhavensecretariat): data/solo/items.json (id, name, slot, class
                 key) and data/fh/label/spoiler/en.json (the names of the locked Frosthaven classes)
  --worldhaven   worldhaven clone (any2cards/worldhaven): images/items/frosthaven/248-264/fh-<id>-<slug>[-back].png
  --mp           the Mercenary Pack pictures made by tools/prep-mp-solo-items.py: <id>.png and <id>b.png (back)

Basin of Prophecy: the Secretariat lists it as two items, CSA and CSB. It is one card: the A side carries the card number (16),
the B side does not and is its back (as the back of the Crest of Frosthaven). Here it is one item, CS, with a back.
The GH2E solo items (153 to 170) stay in scripts/games/gh2_items.js (tools/extract-campaign-tables.py).

Usage: python -I tools/extract-solo-items.py --secretariat D:/github/gloomhavensecretariat --worldhaven D:/github/worldhaven
       --mp <folder of tools/prep-mp-solo-items.py>
"""
import argparse
import json
import os
import re

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'scripts', 'games', 'solo_items.js')
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
REPO_IMAGES = 'C:/Users/hansen/ai/games/HavenMap/HavenMap/images/'   # the prefix generate-image-index.py reads as a repo image
SIZE = (196, 300)
EDITIONS = ('fh', 'mp')
SLOT = {'onehand': '1H', 'twohand': '2H', 'head': 'head', 'body': 'body', 'legs': 'legs', 'small': 'small'}
# Class names as the app writes them (scripts/games/perks.js for Frosthaven, gh2_classes.js for the Mercenary Pack), where
# they differ from the Secretariat label or the class key.
CLASS_FIX = {'prism': 'H.I.V.E.', 'banner-spear': 'Banner Spear'}
# Secretariat item -> (id, name) here; None drops the item (it is the back of another one).
MERGE = {'CSA': ('CS', 'Basin of Prophecy'), 'CSB': None}
# Frosthaven solo items whose back is a second side (checked by eye: the other 14 backs are the plain item back).
FH_BACK = {253, 259, 262}
MP_SOURCE = 'owner\'s Worldhaven folder characters/mp/character_solo_items (tools/prep-mp-solo-items.py)'


def slug_of(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().replace("'", '')).strip('-')


def class_names(sec):
    """Secretariat class key -> class name: the spoiler labels of Frosthaven, else the key in title case."""
    lab = json.load(open(os.path.join(sec, 'data', 'fh', 'label', 'spoiler', 'en.json'), encoding='utf-8'))
    out = {}
    for key, v in lab.get('character', {}).get('fh', {}).items():
        out[key] = v if isinstance(v, str) else v.get('')
    return out


def picture(src, dst):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    want = SIZE[0] / SIZE[1]
    if w / h > want:                                   # too wide: cut the sides
        nw = round(h * want)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    elif w / h < want:                                 # too tall: cut top and bottom
        nh = round(w / want)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize(SIZE, Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'WEBP', quality=85, method=6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--secretariat', default='D:/github/gloomhavensecretariat')
    ap.add_argument('--worldhaven', default='D:/github/worldhaven')
    ap.add_argument('--mp', required=True)
    a = ap.parse_args()

    items = json.load(open(os.path.join(a.secretariat, 'data', 'solo', 'items.json'), encoding='utf-8'))
    names = class_names(a.secretariat)
    rows, records = [], []

    def add(src, ed, rel, origin):
        if not os.path.isfile(src):
            raise SystemExit(f'missing picture: {src}')
        out = os.path.join(ROOT, 'images', *rel.split('/'))
        picture(src, out)
        records.append({'group': f'items solo {ed}', 'src': REPO_IMAGES + rel, 'dst': rel, 'status': 'ok', 'bytes': os.path.getsize(out),
                        'size': list(SIZE), 'from': origin})

    for it in items:
        ed = it.get('edition')
        if ed not in EDITIONS:
            continue
        iid, name = it['id'], it['name']
        if iid in MERGE:
            if MERGE[iid] is None:
                continue
            iid, name = MERGE[iid]
        key = it['solo']
        cls = CLASS_FIX.get(key) or names.get(key) or key.replace('-', ' ').title()
        slot = SLOT.get(it['slot'])
        if not slot:
            raise SystemExit(f"unknown slot {it['slot']} of item {it['id']}")
        row = {'id': iid, 'slug': slug_of(name), 'slot': slot, 'kind': 'solo', 'n': it.get('count', 1), 'ed': ed, 'cls': cls}
        if ed == 'fh':
            base = os.path.join(a.worldhaven, 'images', 'items', 'frosthaven', '248-264', f"fh-{iid}-{slug_of(it['name'])}")
            add(base + '.png', ed, f'items/fh/{iid}.webp', f'any2cards/worldhaven images/items/frosthaven/248-264/{os.path.basename(base)}.png')
            if iid in FH_BACK:
                add(base + '-back.png', ed, f'items/fh/{iid}b.webp', f'any2cards/worldhaven images/items/frosthaven/248-264/{os.path.basename(base)}-back.png')
                row['back'] = True
        else:
            add(os.path.join(a.mp, f'{iid}.png'), ed, f'items/mp/{iid}.webp', MP_SOURCE)
            if os.path.isfile(os.path.join(a.mp, f'{iid}b.png')):
                add(os.path.join(a.mp, f'{iid}b.png'), ed, f'items/mp/{iid}b.webp', MP_SOURCE)
                row['back'] = True
        rows.append(row)

    lines = [
        '// GENERATED by tools/extract-solo-items.py from the Gloomhaven Secretariat data (data/solo/items.json). Do not edit by hand.',
        "// Solo scenario items of the Frosthaven and Mercenary Pack classes: id, slug, slot, kind 'solo', n = copies, ed = edition, cls = class,",
        '// back = the card has a second side. Pictures: images/items/<ed>/<id>.webp, the back <id>b.webp. The GH2E solo items are in gh2_items.js.',
        '',
        'export const SOLO_ITEMS = [',
    ]
    lines += [f'  {json.dumps(r, ensure_ascii=False, separators=(",", ":"))},' for r in rows]
    lines += ['];', '']
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))

    # old pictures of these editions that were not written this time: delete the file and its manifest record
    written = {r['dst'] for r in records}
    for ed in EDITIONS:
        folder = os.path.join(ROOT, 'images', 'items', ed)
        for f in os.listdir(folder):
            if f'items/{ed}/{f}' not in written:
                os.remove(os.path.join(folder, f))
                print('deleted', f'items/{ed}/{f}')
    man = json.load(open(MANIFEST, encoding='utf-8'))
    man['files'] = [r for r in man['files'] if not str(r.get('group', '')).startswith('items solo ')] + records
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        f.write(json.dumps(man, ensure_ascii=False, indent=1))      # as the file was written: no final newline
    print(f'{len(rows)} items, {len(records)} pictures written')


if __name__ == '__main__':
    main()
