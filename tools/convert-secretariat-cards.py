"""Convert the Gloomhaven 2e character ability decks of the Gloomhaven Secretariat into the action JSON of tools/*-ability-cards.code.json.

Usage: python tools/convert-secretariat-cards.py <clone of Lurkars/gloomhavensecretariat, or its data/<edition> folder> [--edition gh2e|fh|jotl] [output folder] [class name ...]
Default output folder: tools/secretariat-cards/. No dependencies.

Input:  data/gh2e/character/deck/<icon>.json (cards with actions and bottomActions), label/en.json and label/spoiler/en.json (card texts).
Output: card_code_<class>.md (the owner's card code text, to read and correct) and <class>-ability-cards.code.json: a list of { name, level, initiative, sourceId, top, bottom }; a half is { actions, xp?, lost?, duration? }, the actions are
        in the format of tools/convert-card-code.py (attack, move, heal ... with value, enhancement, subActions; condition; element; target; custom with %tokens%;
        optional with a consume cost; mandatory; group; inline; tokens; summon; area).
What does not map is kept as { type: 'raw', secretariat: ... } and listed at the end, so nothing is lost silently.
The Secretariat marks level X cards as level 1. Classes without a deck there (Bladeswarm, Plagueherald) are not produced.
"""
import json
import os
import re
import sys

ICON_CLASS = {
    'angry-face': 'Doomstalker', 'bruiser': 'Bruiser', 'circles': 'Soultether', 'cragheart': 'Cragheart', 'eclipse': 'Nightshroud',
    'lightning': 'Berserker', 'mindthief': 'Mindthief', 'music-note': 'Soothsinger', 'saw': 'Sawbones', 'silent-knife': 'Silent Knife',
    'spellweaver': 'Spellweaver', 'sun': 'Sunkeeper', 'three-spears': 'Quartermaster', 'tinkerer': 'Tinkerer', 'triangles': 'Elementalist',
    'two-mini': 'Wildfury',
}   # lightning, three-spears and triangles are not named in the Secretariat labels; matched by the card names against gh2_cards.js

FH_CLASS = {
    'astral': 'Infuser', 'banner-spear': 'Banner Spear', 'blinkblade': 'Blinkblade', 'boneshaper': 'Boneshaper', 'coral': 'Crashing Tide', 'deathwalker': 'Deathwalker',
    'drifter': 'Drifter', 'drill': 'Metal Mosaic', 'fist': 'Frozen Fist', 'geminate': 'Geminate', 'kelp': 'Deepwraith', 'meteor': 'Pyroclast', 'prism': 'H.I.V.E.',
    'shackles': 'Pain Conduit', 'shards': 'Shattersong', 'snowflake': 'Snowdancer', 'trap': 'Trapper',
}   # the Secretariat names the Frosthaven decks by icon; names from label/spoiler/en.json
JOTL_CLASS = {'demolitionist': 'Demolitionist', 'hatchet': 'Hatchet', 'red-guard': 'Red Guard', 'voidwarden': 'Voidwarden'}
EDITIONS = {'gh2e': ICON_CLASS, 'fh': FH_CLASS, 'jotl': JOTL_CLASS}

NAME_FIX = {   # (class, name in the Secretariat, initiative): the name printed on the card (the app's card list, initiatives read from the pictures)
    ('Tinkerer', 'Potent Potable', 46): 'Potent Potables',
    ('Tinkerer', 'Potent Potables', 73): 'Disorienting Flash',
}

SIMPLE = {'attack', 'move', 'heal', 'shield', 'retaliate', 'push', 'pull', 'pierce', 'teleport', 'jump', 'loot', 'range', 'target', 'damage', 'fly'}
ENH = {'diamond_plus': 'diamondPlus'}
SPECIAL_TARGET = {'alliesAdjacent': 'all adjacent allies', 'allyAdjacent': '1 adjacent ally', 'enemyAdjacent': '1 adjacent enemy', 'selfAlliesAdjacentAffect': 'self and all adjacent allies', 'self': 'self', 'all': 'all', 'enemiesAdjacent': 'all adjacent enemies', 'enemiesMovedThrough': 'all enemies moved through', 'ally': '1 ally', 'allies': 'all allies'}
unmapped = {}


def note(what, where=''):
    unmapped[(what, where)] = unmapped.get((what, where), 0) + 1


class Labels:
    def __init__(self, root):
        self.tree = {}
        for rel in ('label/en.json', 'label/spoiler/en.json'):
            path = os.path.join(root, rel)
            if os.path.exists(path):
                self.merge(self.tree, json.load(open(path, encoding='utf-8')).get('custom', {}))

    def merge(self, a, b):
        for k, v in b.items():
            if isinstance(v, dict):
                self.merge(a.setdefault(k, {}), v)
            else:
                a[k] = v

    def get(self, key):
        """'%data.custom.gh2e.lightning.abilities.323.1%' -> the text."""
        node = self.tree.get(key.split('.')[2], {})
        for part in key.split('.')[3:]:
            if not isinstance(node, dict) or part not in node:
                note('label missing', key)
                return None
            node = node[part]
        return node if isinstance(node, str) else None


def token(m):
    t = m.group(1).strip()
    arg = None
    if ':' in t:
        t, arg = t.split(':', 1)
        arg = arg.strip()
    t = t.replace('game.condtition.', 'game.condition.')
    if t == 'game.damage':
        return '%damage%' + (arg or '')
    if t == 'game.card.experience':
        return '%xp%' + (' ' + arg if arg else '')
    m2 = re.fullmatch(r'game\.action\.(\w+)\.valueSign', t)
    if m2:
        return ('%s%s %%%s%%' % ('' if arg.startswith('-') else '+', arg, m2.group(1)))
    m2 = re.fullmatch(r'game\.action\.(\w+)', t)
    if m2:
        name = {'fly': 'flying'}.get(m2.group(1), m2.group(1))
        return '%' + name + '%' + (arg or '')
    m2 = re.fullmatch(r'game\.(?:condition|element|card|attackmodifier|characterIcon)\.(?:consume\.)?(\w+)', t)
    if m2:
        return '%' + m2.group(1) + '%'
    m2 = re.fullmatch(r'game\.elementHalf(?:\.consume)?', t)
    if m2 and arg:
        return '/'.join('%' + e + '%' for e in arg.split('|'))
    m2 = re.fullmatch(r'game\.(range|target)', t)
    if m2:
        return '%' + m2.group(1) + '%' + (arg or '')
    m2 = re.fullmatch(r'data\.damage', t)
    if m2:
        return '%damage%' + (arg or '')
    m2 = re.fullmatch(r'(?:data|game)\.(?:characterToken|characterIconIdentity)\.([\w.-]+)', t)
    if m2:
        return '%' + m2.group(1).replace('.', '-') + '%'     # a class token or identity icon: the name is kept for the owner to resolve
    if t == 'game.specialTarget.self':
        return 'self'
    if t == 'game.enhancement.square' or t.startswith('game.enhancement.'):
        return ''
    m2 = re.fullmatch(r'game\.itemSlot', t)
    if m2 and arg:
        return '%' + arg + '%'
    m2 = re.fullmatch(r'(?:data\.action\.custom|data\.customAction|game\.customAction|game\.action\.custom|game\.custom|data\.condition)[.:]?(?:gh2e-)?([\w-]+)', t + (':' + arg if arg and 'Action' in t else ''))
    if m2:
        return '%' + m2.group(1) + '%'
    note('text token', m.group(0))
    return m.group(0)


def sentence(s):
    """The Secretariat leaves out the full stop at the end of a printed sentence; the card code has it."""
    if s and len(s.split()) > 3 and re.search(r'[A-Za-z0-9)%]$', s) and not s.endswith('%'):
        return s + '.'
    return s


def text(s, labels):
    if isinstance(s, str) and s.startswith('%data.custom.'):
        s = labels.get(s[1:-1]) or s
    s = re.sub(r'%([^%]+)%', token, s)
    return re.sub(r'\s+', ' ', s).strip()


def enhancement(a):
    e = [ENH.get(x, x) for x in a.get('enhancementTypes') or []]
    return e


HEX = {'target': 't', 'active': 's', 'enhance': 'x', 'ally': 'a'}


def hex_pattern(value):
    """'(0,1,active)|(1,0,target)|...' (x = slot, y = row) -> the card creator's 'et_st_et': rows from top to bottom, 'e' for an empty slot."""
    cells = {}
    for p in value.split('|'):
        x, y, kind = re.match(r'\((-?\d+),(-?\d+),(.+)\)$', p).groups()
        letter = HEX.get(kind)
        if letter is None:
            note('hex type', kind)                       # a class token on the board (tear, ...): written as a blank hex
            letter = 'b'
        cells[(int(y), int(x))] = letter
    rows = sorted({y for y, _ in cells})
    return '_'.join(''.join(cells.get((y, x), 'e') for x in range(0, max(x for yy, x in cells if yy == y) + 1)) for y in range(rows[0], rows[-1] + 1))


def either(value):
    parts = value.split(':')
    if len(parts) > 1 and len(set(parts)) == 1:
        return parts, False
    return parts, len(parts) > 1


def element_cost(subs):
    """The consume element among the sub actions: ('fire', either) or None."""
    for s in subs or []:
        if s['type'] == 'element' and s.get('valueType') == 'minus':
            return either(s['value'])
    return None


def convert(actions, labels, where):
    out = []
    for a in actions or []:
        out += one(a, labels, where)
    return out


def one(a, labels, where):
    t = a['type']
    subs = a.get('subActions')
    if t == 'custom':
        return [{'type': 'custom', 'text': sentence(text(a['value'], labels))}] + convert(subs, labels, where + '/custom')
    if t == 'element':
        if a.get('valueType') == 'minus':
            els, ei = either(a['value'])
            if subs:                                          # a dashed pill: consume the element to do the sub actions
                c = {'consume': {'elements': els}}
                if ei:
                    c['consume']['either'] = True
                return [{'type': 'optional', 'cost': c, 'actions': convert(subs, labels, where + '/consume'), 'noLine': True}]
            r = {'type': 'consume', 'elements': els}
            if ei:
                r['either'] = True
            return [r]
        els, ei = either(a['value'])
        r = {'type': 'element', 'value': '/'.join(els)}
        if ei:
            r['either'] = True
        return [r]
    if t == 'elementHalf':
        els, _ = either(a['value'])
        return [{'type': 'element', 'value': '/'.join(els), 'either': True}]
    if t == 'forceBox':
        return [{'type': 'mandatory', 'actions': convert(subs, labels, where + '/forceBox')}]
    if t in SIMPLE or t == 'condition':
        cost = element_cost(subs)
        rest = [s for s in subs or [] if not (s['type'] == 'element' and s.get('valueType') == 'minus')]
        r = {'type': 'condition', 'value': a['value']} if t == 'condition' else {'type': t}
        v = a.get('value')
        if t == 'fly':
            r['type'] = 'fly'
        if t != 'condition' and v not in (None, ''):
            vt = a.get('valueType')
            r['value'] = -v if vt in ('minus', 'subtract') and isinstance(v, int) else (text(v, labels) if isinstance(v, str) and v.startswith('%data.custom') else v)
            if vt in ('plus', 'add') or (vt in ('minus', 'subtract')):
                r['relative'] = True
        if t == 'range' and 'value' not in r:
            pass
        e = enhancement(a)
        if e:
            r['enhancement'] = e
        texts = [x for x in rest if x['type'] == 'custom']
        rest = [x for x in rest if x['type'] != 'custom']
        sub = convert(rest, labels, where + '/' + t)
        if sub:
            r['subActions'] = sub
        flat = []
        for x in sub:                                    # a row of conditions with commas is a plain list of sub actions
            if x['type'] == 'inline' and all(k['type'] == 'condition' or k.get('text') == ',' for k in x['actions']):
                flat += [k for k in x['actions'] if k['type'] == 'condition']
            else:
                flat.append(x)
        sub = flat
        areas = [x for x in sub if x['type'] == 'area']
        if areas:                                        # an ability and its area hang together
            sub = [x for x in sub if x['type'] != 'area']
            if sub:
                r['subActions'] = sub
            else:
                r.pop('subActions', None)
            r = {'type': 'group', 'actions': [r] + areas}
        if texts and not cost:                           # a sentence under the ability: a dashed pill with no cost
            return [r, {'type': 'optional', 'cost': None, 'actions': convert(texts, labels, where + '/pilltext')}]
        if cost:
            els, ei = cost
            c = {'consume': {'elements': els}}
            if ei:
                c['consume']['either'] = True
            pill_subs = [s for s in subs if s['type'] == 'element' and s.get('valueType') == 'minus'][0].get('subActions')
            adds = [x for x in pill_subs or [] if x.get('valueType') in ('add', 'plus') and x['type'] in SIMPLE]
            rest_pill = [x for x in pill_subs or [] if x not in adds]
            pill = {'type': 'optional', 'cost': c, 'actions': convert(rest_pill, labels, where + '/pill')}
            if adds:                                       # "+1 retaliate": the bonus the element buys
                pill['effects'] = [{'type': x['type'], 'value': x['value']} for x in adds]
            return [r, pill]
        return [r]
    if t == 'specialTarget':
        v = SPECIAL_TARGET.get(a['value'])
        m = re.fullmatch(r'(enemies|allies|selfAllies)Range:(\d+)', a['value'])
        if v is None and m:
            v = {'enemies': 'all enemies', 'allies': 'all allies', 'selfAllies': 'self and all allies'}[m.group(1)] + ' within %s hexes' % m.group(2)
        if v is None:
            note('special target', a['value'])
            v = a['value']
        return [{'type': 'target', 'value': v}]
    if t == 'grid':
        kids = convert(subs, labels, where + '/grid')
        if any(k['type'] == 'area' for k in kids):         # an ability and its area hang together; other rows are plain
            return [{'type': 'group', 'actions': kids}]
        return kids
    if t == 'concatenation':
        cards = [s for s in subs or [] if s['type'] == 'card']
        if subs and len(cards) + sum(1 for s in subs if s['type'] == 'concatenationSpacer') == len(subs) and cards and all(c['value'].startswith('slot') for c in cards):
            slots = []
            for c in cards:
                v = c['value']
                if v.startswith('slot'):
                    slots.append(int(v.split(':')[1]) if ':' in v else 0)
                else:
                    note('card in slots', v)
            return [{'type': 'tokens', 'slots': slots}]
        kids = convert(subs, labels, where + '/concatenation')
        if a.get('value'):                                  # a separator between the parts
            kids = [x for k in kids for x in (k, {'type': 'custom', 'text': a['value']})][:-1]
        return [{'type': 'inline', 'actions': kids}]
    if t == 'card':
        v = a['value']
        if v.startswith('experience'):
            return [{'type': 'custom', 'text': '%xp% ' + v.split(':')[1]}]
        if v in ('round', 'persistent', 'lost'):
            if where.count('/') >= 1:                         # an icon inside a row of text
                return [{'type': 'custom', 'text': '%' + v + '%'}]
            return []                                         # the flag of the half, set from the card
        if v.startswith('slot'):                              # a single token slot (a number gives that much experience)
            return [{'type': 'tokens', 'slots': [int(v.split(':')[1]) if ':' in v else 0]}]
        note('card', v)
        return [{'type': 'raw', 'secretariat': a}]
    if t == 'concatenationSpacer':
        return []
    if t == 'hint':                                           # a hint of the Secretariat's own app, not printed on the card
        note('hint dropped', where)
        return []
    if t == 'extra':
        return convert(subs, labels, where + '/extra')
    if t == 'fontSize':
        return convert(subs, labels, where + '/fontSize')
    if t == 'boxFhSubActions':
        return [{'type': 'group', 'actions': convert(subs, labels, where + '/boxFh')}]
    if t == 'box':
        head = [{'type': 'custom', 'text': sentence(text(a['value'], labels))}] if a.get('value') else []
        return head + convert(subs, labels, where + '/box')
    if t == 'grant':
        r = {'type': 'grant', 'text': text(a['value'], labels), 'actions': convert(subs, labels, where + '/grant')}
        if a.get('multiTarget'):
            r['multiTarget'] = True
        return [r]
    if t == 'area':
        return [{'type': 'area', 'pattern': hex_pattern(a['value'])}]
    if t == 'summon':
        o = a['valueObject']
        name = o['name'].replace('-', ' ').title()
        special = convert([o['action']], labels, where + '/summon') if o.get('action') else []
        if len(special) == 1 and special[0].get('type') == 'group':
            special = special[0]['actions']
        r = {'type': 'summon', 'name': name, 'stats': {k: (text(v, labels) if isinstance(v, str) else v) for k, v in (('health', o.get('health')), ('move', o.get('movement')), ('attack', o.get('attack')), ('range', o.get('range', '-')))}, 'special': special}
        if o.get('enhancements'):
            r['enhancement'] = o['enhancements']
        return [r]
    note('action type', t)
    return [{'type': 'raw', 'secretariat': a}]


def half(card, labels, bottom):
    p = 'bottom' if bottom else ''
    def k(n):
        return (p + n[0].upper() + n[1:]) if p else n
    h = {'actions': convert(card.get('bottomActions' if bottom else 'actions'), labels, 'bottom' if bottom else 'top')}
    xp = card.get(k('xp'))
    if xp:
        h['xp'] = xp
    if card.get(k('lost')) or card.get(k('loss')):
        h['lost'] = True
    if card.get(k('loss')):                                   # the card is removed from the game for good, not only lost for the scenario
        h['remove'] = True
    if card.get(k('persistent')):
        h['duration'] = 'persistent'
    elif card.get(k('round')):
        h['duration'] = 'round'
    return h



# ---- card code text (the owner's YAML-like format, import/card_code_*.md) ----

def q(t):
    return '"' + str(t).replace('\\', '\\\\').replace('"', '\\"') + '"'


def flow(v):
    return '[' + ', '.join(q(x) if isinstance(x, str) and '%' in x else str(x) for x in v) + ']'


def elements(a):
    return flow(['/'.join(a['elements'])] if a.get('either') else a['elements'])


def sub_lines(subs, ind):
    out = []
    for a in subs:
        t = a['type']
        if t == 'target' and a.get('value') == 'self':
            out.append(ind + '- self')
        elif t == 'condition' and not a.get('enhancement') and not a.get('subActions'):
            out.append(ind + '- ' + a['value'])
        elif t == 'jump' and not a.get('enhancement'):
            out.append(ind + '- jump')
        elif t == 'element':
            out.append(ind + '- ' + a['value'])
        else:
            out += item_lines(a, ind)
    return out


def value_text(v):
    if isinstance(v, str) and not re.fullmatch(r'\d+|X', v):
        return q(v)
    return str(v)


def item_lines(a, ind):
    """One action -> the lines of a list entry at indent `ind` ('- key: value' and its attributes)."""
    t = a['type']
    p = ind + '- '
    c = ind + '  '
    if t == 'custom':
        return [p + 'custom: ' + q(re.sub(r'%xp% (\d+)', lambda m: '%xp' + m.group(1) + '%', a['text']))]
    if t == 'consume':
        return [p + 'consume: ' + elements(a)]
    if t == 'element':
        return [p + a['value']] if '/' not in a['value'] else [p + 'consume: ' + flow([a['value']])]
    if t in ('mandatory', 'group'):
        return [p + t + ':'] + [l for k in a['actions'] for l in item_lines(k, c)]
    if t == 'inline':
        return [p + 'multi:'] + [l for k in a['actions'] for l in item_lines(k, c)]
    if t == 'area':
        return [p + 'hex: ' + a['pattern']]
    if t == 'tokens':
        return [p + 'tokens: ' + flow(a['slots'])]
    if t == 'optional':
        out = [p + 'optional:']
        cost = a.get('cost')
        if cost and 'consume' in cost:
            out.append(c + '- consume: ' + elements(cost['consume']))
        for k in a.get('actions', []):
            out += item_lines(k, c)
        for e in a.get('effects', []):
            out.append(c + '- custom: ' + q('+%s %%%s%%' % (e['value'], e['type'])))
        if a.get('noLine'):
            out.append(c + 'noLine: true')
        return out
    if t == 'summon':
        st = a['stats']
        out = [p + 'summon:', c + '  name: ' + a['name'],
               c + '  stats: ' + flow(['-' if st.get(k) is None else st[k] for k in ('health', 'move', 'attack', 'range')])]
        if a.get('special'):
            out.append(c + '  special:')
            for k in a['special']:
                out += item_lines(k, c + '  ')
        if a.get('enhancement'):
            out.append(c + '  enhancement: ' + flow(a['enhancement']))
        return out
    if t == 'grant':
        return [p + 'custom: ' + q(a['text'])] + [l for k in a['actions'] for l in item_lines(k, ind)]
    if t == 'raw':
        return [ind + '# raw: ' + json.dumps(a['secretariat'])]
    if t == 'condition':                                    # attack, move, heal ... and conditions: value, enhancement, sub
        out = [p + a['value'] + ": ''"]
    else:
        v = a.get('value')
        out = [p + t + ': ' + value_text(v)] if v not in (None, '') else [p + t + ": ''"]
    if a.get('enhancement'):
        out.append(c + 'enhancement: ' + flow(a['enhancement']))
    if a.get('subActions'):
        out.append(c + 'sub:')
        out += sub_lines(a['subActions'], c)
    return out


ABILITY = SIMPLE | {'group', 'summon', 'condition'}


def half_lines(h, name):
    out = [name + ':', '  actions:']
    prev = None
    for a in h['actions']:
        if prev is not None and a['type'] in ABILITY and prev['type'] in ABILITY:
            out.append('  - divider')
        out += item_lines(a, '  ')
        prev = a
    if h.get('xp'):
        out.append('  xp: %s' % h['xp'])
    if h.get('lost'):
        out.append('  lost: t')
    if h.get('remove'):
        out.append('  remove: t')
    if h.get('duration'):
        out.append('  duration: ' + h['duration'])
    return out


def card_code(cls, cards):
    lines = ['# %s (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.' % cls,
             '# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.', '']
    for c in cards:
        lines += ['name: ' + c['name'], 'initiative: %s' % c['initiative'], 'level: %s' % c['level']]
        lines += half_lines(c['top'], 'top') + half_lines(c['bottom'], 'bottom') + ['']
    return '\n'.join(lines)


def app_initiatives():
    """{(class name, slug, level): initiative} of scripts/games/gh2_cards.js: the initiatives read from the card pictures, which win over the Secretariat's where they differ."""
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts', 'games')
    try:
        classes = {c['i']: c['name'] for c in (json.loads(m) for m in re.findall(r'\{"i":\d+,"code":[^}]*\}', open(os.path.join(root, 'gh2_classes.js'), encoding='utf-8').read()))}
        cards = [json.loads(m) for m in re.findall(r'\{"id":\d+,"cls":\d+,[^}]*\}', open(os.path.join(root, 'gh2_cards.js'), encoding='utf-8').read())]
    except OSError:
        return {}
    return {(classes[c['cls']], c['slug'], str(c['lv'])): c['ini'] for c in cards if c.get('ini') is not None and c['cls'] in classes}


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    edition = 'gh2e'
    if '--edition' in args:
        i = args.index('--edition')
        edition = args[i + 1]
        del args[i:i + 2]
    root = args.pop(0)
    root = os.path.join(root, 'data', edition) if os.path.isdir(os.path.join(root, 'data', edition)) else root
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'secretariat-cards')
    if args and re.search(r'[/\\:]', args[0]):
        out = args.pop(0)
    only = {a.lower() for a in args}
    os.makedirs(out, exist_ok=True)
    labels = Labels(root)
    app_ini = app_initiatives()
    for icon, cls in EDITIONS[edition].items():
        if only and cls.lower() not in only:
            continue
        deck = json.load(open(os.path.join(root, 'character', 'deck', icon + '.json'), encoding='utf-8'))
        cards = []
        if all('character.abilities.wip' in json.dumps(c) for c in deck['abilities']):
            print('%-12s skipped: the Secretariat has only placeholders (wip) for all %d cards' % (cls, len(deck['abilities'])))
            continue
        for c in deck['abilities']:
            ini = c['initiative'] if 'initiative' in c else c['identityInitiative'][0]
            mine = app_ini.get((cls, re.sub(r'[^a-z0-9]+', '-', c['name'].lower()).strip('-'), str(c['level'])))
            if 'initiative' in c and mine is not None and mine != ini and (cls, c['name'], ini) not in NAME_FIX and any(o is not c and o.get('initiative') == mine for o in deck['abilities']):
                print('  initiative of %s kept at %s: the app has %s, which is the initiative of another card of the deck (a name differs)' % (c['name'], ini, mine))
            elif 'initiative' in c and mine is not None and mine != ini and (cls, c['name'], ini) not in NAME_FIX:
                print('  initiative of %s: %s from the app (the Secretariat has %s)' % (c['name'], mine, ini))
                c = dict(c, initiative=mine)
            cards.append({'name': NAME_FIX.get((cls, c['name'], c.get('initiative')), c['name']), 'level': c['level'], 'initiative': c['initiative'] if 'initiative' in c else c['identityInitiative'][0], 'sourceId': c['cardId'], 'top': half(c, labels, False), 'bottom': half(c, labels, True), **({'identityInitiative': c['identityInitiative']} if 'identityInitiative' in c else {})})
        slug = re.sub(r'[^a-z0-9]+', '-', cls.lower()).strip('-')
        path = os.path.join(out, slug + '-ability-cards.code.json')
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(cards, f, indent=1, ensure_ascii=False)
            f.write('\n')
        with open(os.path.join(out, 'card_code_' + slug.replace('-', '_') + '.md'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(card_code(cls, cards))
        print('%-12s %2d cards -> %s' % (cls, len(cards), path))
    if unmapped:
        print('not mapped:')
        for (what, where), n in sorted(unmapped.items()):
            print('  %-18s %-40s %d' % (what, where, n))
    return 0


if __name__ == '__main__':
    sys.exit(main())
