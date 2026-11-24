"""Prepares the briefs for reading the ability cards of a class from their pictures.

Usage: python tools/card-extraction/prepare.py <class code, name or index> [--batch 7] [--out DIR] [--only slug,slug] [--assets PATH] [--examples N]
  Writes DIR/<class>/batch<N>.md for each batch of cards: the instructions (brief.md), the worked examples (pictures with the card code the owner wrote for them) and the
  cards of the batch (name, level, initiative, picture) with the output file to write. Give one batch to one reader (a Claude agent or a person), then run check.py on the
  output files. Also writes DIR/icons.png (make-icon-sheet.py) once.
  Examples are cards whose card code is known (import/card_code_hail.md, card_code_cassandra.md); cards of those files are never read as new work unless --only names them.
Classes of the Frosthaven and Jaws of the Lion books have the Secretariat data (tools/extract-*), only classes without it need this tool.
Needs PyYAML and Pillow (tools only)."""
import importlib.util
import json
import os
import re
import subprocess
import sys

import yaml
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
spec = importlib.util.spec_from_file_location('ccc', os.path.join(ROOT, 'tools', 'convert-card-code.py'))
ccc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ccc)

# (card code file, picture under wh_character_ability_cards, card name): cards whose card code is known to be right
EXAMPLES = [('import/card_code_hail.md', 'mp/hl/mp-interesting-specimen.png', 'Interesting Specimen'), ('import/card_code_cassandra.md', 'mp/ca/mp-tear-reality.png', 'Tear Reality'),
            ('import/card_code_cassandra.md', 'mp/ca/mp-peer-into-battle.png', 'Peer into Battle'), ('import/card_code_berserker_draft.md', 'gh2/BE2/blood-pact.jpeg', 'Blood Pact'),
            ('import/card_code_berserker_draft.md', 'gh2/BE2/flurry-of-axes.jpeg', 'Flurry of Axes')]


def strip_layout(x):
    if isinstance(x, dict):
        return {k: strip_layout(v) for k, v in x.items() if k not in ccc.LAYOUT or k in ('sub', 'enhancement', 'duration', 'name')}
    if isinstance(x, list):
        return [strip_layout(i) for i in x]
    return x


def make_crops(src, directory, slug, scale=2.5):
    """The top and the bottom half of a card picture, enlarged: the icons, numbers and hexes are small in a 433 x 600 picture. The halves overlap at the initiative band."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    cut = int(h * 0.575)
    out = []
    for name, box in (('top', (0, 0, w, min(h, cut + int(h * 0.04)))), ('bottom', (0, max(0, cut - int(h * 0.05)), w, h))):
        part = im.crop(box)
        part = part.resize((int(part.width * scale), int(part.height * scale)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
        target = os.path.join(directory, '%s-%s.png' % (slug, name))
        part.save(target)
        out.append(target.replace(os.sep, '/'))
    return out


def card_yaml(path, name):
    text = open(os.path.join(ROOT, path), encoding='utf-8').read()
    for first, chunk in ccc.split_cards(text):
        if first.replace('name:', '').strip().lower() == name.lower():
            d = yaml.safe_load(chunk)
            for h in ('top', 'bottom'):                                   # the layout keys go; the halves stay (top is also a layout key)
                d[h] = strip_layout(d.get(h))
            return yaml.safe_dump(d, sort_keys=False, allow_unicode=True, width=1000).rstrip()
    raise SystemExit('example card not found: ' + name)


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    cls, batch, out, only, assets, n_ex = args.pop(0), 7, os.path.join(HERE, 'work'), None, 'D:/github/Wordhaven_Assets', len(EXAMPLES)
    while args:
        a = args.pop(0)
        if a == '--batch':
            batch = int(args.pop(0))
        elif a == '--out':
            out = args.pop(0)
        elif a == '--only':
            only = set(args.pop(0).split(','))
        elif a == '--assets':
            assets = args.pop(0)
        elif a == '--examples':
            n_ex = int(args.pop(0))
    classes = [json.loads(m) for m in re.findall(r'\{"i":\d+,"code":[^}]*\}', open(os.path.join(ROOT, 'scripts/games/gh2_classes.js'), encoding='utf-8').read())]
    match = [c for c in classes if cls.lower() in (c['code'].lower(), c['name'].lower(), str(c['i']))]
    if not match:
        raise SystemExit('unknown class ' + cls)
    c = match[0]
    cards = [json.loads(m) for m in re.findall(r'\{"id":\d+,"cls":%d,[^}]*\}' % c['i'], open(os.path.join(ROOT, 'scripts/games/gh2_cards.js'), encoding='utf-8').read())]
    if 'img' in cards[0]:
        raise SystemExit('%s has its own card pictures and Secretariat data; this tool is for the classes without it' % c['name'])
    known = set()
    for path, _, _ in EXAMPLES:
        for first, _chunk in ccc.split_cards(open(os.path.join(ROOT, path), encoding='utf-8').read()):
            known.add(first.replace('name:', '').strip().lower())

    def picture(card):
        slug = re.sub(r'[\u2010-\u2015]', '-', card['slug'])
        if c['src'] == 'mp':
            return '%s/wh_character_ability_cards/mp/%s/mp-%s.png' % (assets, c['code'].lower(), slug)
        return '%s/wh_character_ability_cards/gh2/%s/%s.jpeg' % (assets, c['code'].upper(), slug)

    cards = [k for k in cards if (only is None or k['slug'] in only)]
    directory = os.path.join(out, c['code'].lower())
    os.makedirs(directory, exist_ok=True)
    crops = os.path.join(directory, 'crops')
    os.makedirs(crops, exist_ok=True)
    for k in cards:
        k['path'] = picture(k)
        if not os.path.exists(k['path']):
            print('  picture missing:', k['path'])
            k['crops'] = ['', '']
        else:
            k['crops'] = make_crops(k['path'], crops, k['slug'])
    sheet = os.path.join(out, 'icons.png')
    if not os.path.exists(sheet):
        subprocess.run([sys.executable, os.path.join(HERE, 'make-icon-sheet.py'), sheet, assets], check=True)
    brief = open(os.path.join(HERE, 'brief.md'), encoding='utf-8').read()
    examples = ''
    for path, rel, name in EXAMPLES[:n_ex]:
        examples += '### %s\n\nPicture: %s/wh_character_ability_cards/%s\n\n```\n%s\n```\n\n' % (name, assets, rel, card_yaml(path, name))
    n = 0
    for i in range(0, len(cards), batch):
        n += 1
        part = cards[i:i + batch]
        target = os.path.join(directory, 'batch%d.card.md' % n)
        lines = ['# Task: %s, batch %d' % (c['name'], n), '', 'Class: %s (%s). Read these %d cards and write their card code to:' % (c['name'], c['code'], len(part)), '', '    ' + target.replace(os.sep, '/'), '',
                 'Reference sheet of icons: ' + sheet.replace(os.sep, '/'), '', '| # | slug | name on the card | level | initiative | picture | top half enlarged | bottom half enlarged |', '|---|---|---|---|---|---|---|---|']
        for k in part:
            lines.append('| %d | %s | (read it) | %s | %s | %s | %s | %s |' % (k['id'], k['slug'], k['lv'], k['ini'], k['path'], k['crops'][0], k['crops'][1]))
        lines += ['', '---', '', brief, '', '## Worked examples', '', 'The layout keys the owner also writes (margin, fontSize ...) are left out here and are not wanted from you. These cards are not part of your task.', '', examples]
        open(os.path.join(directory, 'batch%d.md' % n), 'w', encoding='utf-8').write('\n'.join(lines))
    print('%s: %d cards, %d batches in %s' % (c['name'], len(cards), n, directory))
    print('output files to be written by the readers: batch<N>.card.md; then: python tools/card-extraction/check.py %s/batch*.card.md --class %s' % (directory.replace(os.sep, '/'), c['code']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
