#!/usr/bin/env python3
"""Frosthaven and Jaws of the Lion ability cards for the Cards tab, from any2cards/worldhaven.

Input: data/character-ability-cards.js of a local clone of https://github.com/any2cards/worldhaven
(default D:\\github\\worldhaven). Output: scripts/games/wh_cards.js (GENERATED, do not edit by hand).

The source lists a card by name and again under its number (name "324", level "1"), and sometimes under the name
of the summon it creates: the numbered copies and the placeholder rows (level "#") are dropped, and a card is one
picture. The card's title is the picture's file name. Class names are mapped to the spelling of
scripts/games/perks.js (FH and JotL keys). Pictures are not copied: each card keeps its URL in the worldhaven
repository (raw.githubusercontent.com, branch master).

Initiative: the worldhaven value is used. Where it is missing (29 cards), the Gloomhaven Secretariat's Frosthaven and
Jaws deck file gives the number (its numbers only, AGPL-3.0; the same use as the GH2 initiative). Checked against the
card art: the worldhaven values are right where the two differ (Extra Fuel 17, Soaring Shield 11).

Usage: python -I tools/extract-worldhaven-cards.py [path/to/character-ability-cards.js] [path/to/gloomhavensecretariat/data]
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = r'D:\github\worldhaven\data\character-ability-cards.js'
DEFAULT_SEC = r'D:\github\gloomhavensecretariat\data'
# Secretariat deck file (name without .json) -> class; the files are named by icon, matched by card names (see the notes in the header)
SEC_FILES = {
    'fh': {'astral': 'Infuser', 'banner-spear': 'Banner Spear', 'blinkblade': 'Blinkblade', 'boneshaper': 'Boneshaper',
           'coral': 'Crashing Tide', 'deathwalker': 'Deathwalker', 'drifter': 'Drifter', 'drill': 'Metal Mosaic',
           'fist': 'Frozen Fist', 'geminate': 'Geminate', 'kelp': 'Deepwraith', 'meteor': 'Pyroclast', 'prism': 'H.I.V.E.',
           'shackles': 'Pain Conduit', 'shards': 'Shattersong', 'snowflake': 'Snowdancer', 'trap': 'Trapper'},
    'jotl': {'demolitionist': 'Demolitionist', 'hatchet': 'Hatchet', 'red-guard': 'Red Guard', 'voidwarden': 'Voidwarden'},
}

OUT = os.path.join(ROOT, 'scripts', 'games', 'wh_cards.js')
PERKS = os.path.join(ROOT, 'scripts', 'games', 'perks.js')
IMG_BASE = 'https://raw.githubusercontent.com/any2cards/worldhaven/master/images/'
EXPANSION = {'frosthaven': 'FH', 'jaws of the lion': 'JotL'}


def norm(t):
    return re.sub(r'[^a-z0-9]', '', str(t).lower())


# Class names as spelled in scripts/games/perks.js (FH and JotL sections). main() checks them against that file.
CLASSES = {
    'FH': ['Drifter', 'Blinkblade', 'Banner Spear', 'Deathwalker', 'Boneshaper', 'Geminate', 'Infuser', 'Pyroclast',
           'Shattersong', 'Trapper', 'Pain Conduit', 'Snowdancer', 'Frozen Fist', 'Deepwraith', 'Crashing Tide',
           'H.I.V.E.', 'Metal Mosaic'],
    'JotL': ['Hatchet', 'Demolitionist', 'Voidwarden', 'Red Guard'],
}


def class_names():
    """Normalised worldhaven name -> (class name, edition), checked against perks.js."""
    text = open(PERKS, encoding='utf-8').read()
    out = {}
    for ed, names in CLASSES.items():
        for name in names:
            if f'"{name}"' not in text and f"'{name}'" not in text and f'{name}:' not in text:
                raise SystemExit(f'{name} ({ed}) not found in {PERKS}')
            out[norm(name)] = (name, ed)
    return out


def secretariat_initiatives(root):
    """(class name, normalised card name) -> initiative from the Secretariat's fh and jotl deck files."""
    out = {}
    for ed, files in SEC_FILES.items():
        for fn, cls in files.items():
            path = os.path.join(root, ed, 'character', 'deck', fn + '.json')
            if not os.path.exists(path):
                continue
            for a in json.load(open(path, encoding='utf-8')).get('abilities', []):
                if a.get('initiative') is not None:
                    out.setdefault((cls, norm(a['name'])), int(a['initiative']))
    return out


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    sec = secretariat_initiatives(sys.argv[2] if len(sys.argv) > 2 else DEFAULT_SEC)
    data = json.load(open(src, encoding='utf-8'))
    names = class_names()
    classes, cards, skipped, unknown, filled = {}, [], 0, set(), 0
    for x in data:
        ed = EXPANSION.get(x.get('expansion'))
        if not ed:
            continue
        name, lv, ini = str(x.get('name', '')).strip(), str(x.get('level', '')).strip(), x.get('initiative')
        if re.fullmatch(r'\d+', name) or lv in ('#', '', 'None'):
            skipped += 1
            continue
        key = norm(x.get('character-xws', ''))
        if key not in names:
            unknown.add(x.get('character-xws'))
            continue
        cls, cls_ed = names[key]
        if cls_ed != ed:
            unknown.add(f'{cls} listed as {ed}')
            continue
        lv = 'X' if lv.lower() == 'x' else lv.lower() if lv.lower() in ('a', 'b') else lv
        ini = int(ini) if re.fullmatch(r'\d+', str(ini)) else None
        if ini is None and (cls, norm(name)) in sec:
            ini = sec[(cls, norm(name))]
            filled += 1
        img = IMG_BASE + x['image']
        classes.setdefault(cls, ed)
        # The name field is not always the card's title: some rows carry the name of the summon the card creates
        # (Driving Inspiration is listed as "Banner of Hope"). The picture file is the card, so its name is the title.
        base = re.sub(r'^(fh|jl)-', '', os.path.splitext(os.path.basename(x['image']))[0])
        cards.append({'c': cls, 'slug': base, 'lv': lv, 'ini': ini, 'img': img})
    # one card per class and picture: a repeated row (an alias name, or the same card under its number) is the same card
    seen, unique = set(), []
    for c in cards:
        k = (c['c'], c['img'])
        if k not in seen:
            seen.add(k)
            unique.append(c)
    unique.sort(key=lambda c: (c['c'], c['lv'], c['slug']))
    order = sorted(classes.items(), key=lambda kv: (kv[1] != 'FH', kv[0]))
    lines = [
        '// GENERATED by tools/extract-worldhaven-cards.py from any2cards/worldhaven data/character-ability-cards.js. Do not edit by hand.',
        '// Frosthaven and Jaws of the Lion ability cards for the Cards tab. Pictures are linked from the worldhaven repository.',
        '// c = class name (as scripts/games/perks.js), slug = card name, lv = level (1-9, X, a, b), ini = initiative or null, img = picture URL. Character mats come from the asset repository (Wordhaven_Assets), not from this file.',
        'export const WH_CLASSES = [',
    ]
    lines += [f'  {{ name: {json.dumps(n)}, edition: {json.dumps(e)} }},' for n, e in order]
    lines += ['];', 'export const WH_CARDS = [']
    lines += [f'  {json.dumps(c, ensure_ascii=False)},' for c in unique]
    lines += ['];', '']
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))
    per = {}
    for c in unique:
        per[c['c']] = per.get(c['c'], 0) + 1
    print(f'{len(unique)} cards in {len(classes)} classes; skipped {skipped} placeholder or numbered rows; initiative filled from the Secretariat for {filled}')
    print('still without initiative:', sum(1 for c in unique if c['ini'] is None))
    print('per class:', ', '.join(f'{k} {v}' for k, v in sorted(per.items())))
    if unknown:
        print('unmatched classes:', ', '.join(sorted(map(str, unknown))))


if __name__ == '__main__':
    main()
