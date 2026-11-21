"""Extract the Gloomhaven 2e monster stat cards and monster ability decks from the Gloomhaven Secretariat data.

Usage: python tools/extract-monster-data.py <path to a clone of https://github.com/Lurkars/gloomhavensecretariat> [output.js]
Reads data/gh2e/monster/*.json (stats), data/gh2e/monster/deck/*.json (ability decks) and data/gh2e/label/en.json (names and card texts).
Writes scripts/games/gh2_monsters.js (GENERATED). The Secretariat is AGPL-3.0 licensed; the licence question is an open owner decision (docs/ai/roadmap.md).

Output:
  GH2_MONSTERS[slug] = { title, deck, count, boss?, flying?, hidden?, share?, immunities?, special?, stats }
    slug       Secretariat name, for example 'ancient-artillery'; HavenMap's monster title with spaces turned into hyphens
    stats      { normal | elite | boss: { level: { health, move, attack, immunities?, fx? } } }
               health and attack are numbers, or strings for bosses that scale with the number of characters (for example 'Cx9', 'C+1')
    special    boss stat card specials (two lists of actions)
    fx         extra actions of the stat card (shield, retaliate, conditions, pierce, target, custom text)
  GH2_MONSTER_DECKS[slug] = [{ id, name, init, shuffle?, actions }]   id is the Secretariat card id
Actions are a normalised tree: { t: type, v?: value, vt?: 'plus' | 'minus' (relative to the card or stat), sub?: [actions], txt?: text, area?: {...}, obj? }
  attack and move values with vt are relative (Move +1, Attack -1); without vt they are absolute. Range, target, pierce, conditions, elements, jump are in sub.
  area: { melee, cells } cells are axial offsets [q, r] (the grid of scripts/tileMask.js; the card's own hex layout is turned into axial coordinates, so
  the shape is right up to turning and mirroring, which the solver does anyway). melee: the pattern has the monster's own hex (type active), the cells are the
  target hexes from the first active hex; active > 1 means a monster of several hexes. Otherwise the shape can be put anywhere in range and the cells are all of
  its hexes from the first one.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KNOWN_CARD_KEYS = {'name', 'cardId', 'initiative', 'shuffle', 'actions'}


def load_labels(base):
    with open(os.path.join(base, 'data/gh2e/label/en.json'), encoding='utf-8') as f:
        return json.load(f)


def label(labels, path):
    cur = labels
    for p in path.split('.'):
        cur = cur.get(p) if isinstance(cur, dict) else None
        if cur is None:
            return None
    return cur if isinstance(cur, str) else None


def clean_text(s):
    """Plain text of a Secretariat label: tags and %tokens% turned into words."""
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)

    def token(m):
        name = m.group(1).split('.')[-1]
        arg = m.group(2)
        return f'{name} {arg}' if arg else name

    s = re.sub(r'%([^%:]+)(?::([^%]*))?%', token, s)
    return re.sub(r'\s+', ' ', s).strip()


def odd_r_to_axial(x, y):
    """The Secretariat draws areas on a pointy-top grid with odd rows shifted right; the axial coordinates of the same lattice."""
    return x - (y - (y & 1)) // 2, y


def parse_area(value):
    hexes = []
    for part in str(value).split('|'):
        m = re.match(r'\((-?\d+),(-?\d+),(\w+)\)', part.strip())
        if m:
            hexes.append((int(m.group(1)), int(m.group(2)), m.group(3)))
    active = [h for h in hexes if h[2] == 'active']
    target = [h for h in hexes if h[2] == 'target']
    ref = active[0] if active else (target[0] if target else None)
    if ref is None:
        return None
    rq, rr = odd_r_to_axial(ref[0], ref[1])
    cells = []
    for x, y, _ in (target if active else target):
        q, r = odd_r_to_axial(x, y)
        cells.append([q - rq, r - rr])
    area = {'melee': bool(active), 'cells': cells}
    if len(active) > 1:
        area['active'] = len(active)
    return area


def norm(action, labels, deck_ctx):
    """One action of a card as a compact node."""
    t = action['type']
    node = {'t': t}
    if t == 'area':
        area = parse_area(action.get('value'))
        if area:
            node['area'] = area
        return node
    if 'value' in action:
        v = action['value']
        if t == 'target' and v == '%game.target.all%':
            v = 'all'
        if t == 'custom' and isinstance(v, str):
            m = re.fullmatch(r'%data\.custom\.([\w.-]+)%', v)
            text = label(labels, 'custom.' + m.group(1)) if m else v
            node['txt'] = clean_text(text if text else v)
        else:
            node['v'] = v
    if 'valueType' in action:
        node['vt'] = action['valueType']
    if 'valueObject' in action:
        node['obj'] = action['valueObject']
    if action.get('subActions'):
        node['sub'] = [norm(a, labels, deck_ctx) for a in action['subActions']]
    return node


def flatten(actions, labels, ctx):
    out = []
    for a in actions:
        n = norm(a, labels, ctx)
        out.append(n)
    return out


def js(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    base = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'scripts/games/gh2_monsters.js')
    labels = load_labels(base)
    monsters, decks = {}, {}
    warnings = []

    for f in sorted(glob.glob(os.path.join(base, 'data/gh2e/monster/deck/*.json'))):
        d = json.load(open(f, encoding='utf-8'))
        cards = []
        for ab in d['abilities']:
            extra = set(ab) - KNOWN_CARD_KEYS
            if extra:
                warnings.append(f"deck {d['name']}: card {ab.get('name')} has unknown keys {sorted(extra)}")
            card = {k: ab[src] for k, src in (('id', 'cardId'), ('name', 'name'), ('init', 'initiative')) if src in ab}
            missing = [k for k in ('cardId', 'name', 'initiative') if k not in ab]
            if missing:
                warnings.append(f"deck {d['name']}: card {ab.get('name') or ab.get('cardId')} lacks {missing}")
            if ab.get('shuffle'):
                card['shuffle'] = True
            card['actions'] = flatten(ab.get('actions', []), labels, d['name'])
            cards.append(card)
        decks[d['name']] = cards

    for f in sorted(glob.glob(os.path.join(base, 'data/gh2e/monster/*.json'))):
        m = json.load(open(f, encoding='utf-8'))
        slug = m['name']
        base_stat = m.get('baseStat', {})
        rec = {'title': label(labels, 'monster.' + slug) or slug.replace('-', ' ').title()}
        rec['deck'] = m.get('deck', slug)
        if rec['deck'] not in decks:
            warnings.append(f'{slug}: deck {rec["deck"]} not found')
        for key in ('count', 'boss', 'flying', 'hidden'):
            if m.get(key):
                rec[key] = m[key]
        if m.get('standeeShare'):
            rec['share'] = m['standeeShare']
        if base_stat.get('immunities'):
            rec['immunities'] = base_stat['immunities']
        if base_stat.get('special'):
            rec['special'] = [flatten(group, labels, slug) for group in base_stat['special']]
        stats = {}
        for s in m['stats']:
            kind = s.get('type', base_stat.get('type', 'normal'))
            entry = {'health': s['health'], 'move': s.get('movement', base_stat.get('movement', 0)), 'attack': s.get('attack', base_stat.get('attack', 0))}
            if s.get('immunities'):
                entry['immunities'] = s['immunities']
            fx = s.get('actions', base_stat.get('actions'))
            if fx:
                entry['fx'] = flatten(fx, labels, slug)
            stats.setdefault(kind, {})[s['level']] = entry
        rec['stats'] = stats
        monsters[slug] = rec

    lines = [
        '// GENERATED by tools/extract-monster-data.py from the Gloomhaven Secretariat data (data/gh2e/monster, data/gh2e/label/en.json). Do not edit by hand.',
        '// Gloomhaven 2e monster stat cards and ability decks. Format: see the header of tools/extract-monster-data.py.',
        '',
        'export const GH2_MONSTERS = {',
    ]
    for slug, rec in monsters.items():
        lines.append(f"  '{slug}': {js(rec)},")
    lines += ['};', '', 'export const GH2_MONSTER_DECKS = {']
    for name, cards in decks.items():
        lines.append(f"  '{name}': [")
        for c in cards:
            lines.append(f'    {js(c)},')
        lines.append('  ],')
    lines += ['};', '']
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))
    n_cards = sum(len(c) for c in decks.values())
    print(f'{len(monsters)} monsters, {len(decks)} decks, {n_cards} ability cards written to {out_path}')
    for w in warnings:
        print('WARNING', w)


main()
