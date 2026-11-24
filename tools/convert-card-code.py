"""Convert the owner's card-code text (YAML-like, one card after another) of a character's ability cards into JSON in the action format of tools/hail-ability-cards.json.

Usage: python tools/convert-card-code.py <card code .md> [more card code .md ...] <output .json>
Needs PyYAML (a tool only, the app has no dependencies). The input is the structured text the owner writes the cards with (import/card_code_hail.md).

Card:    { name, level, initiative, top, bottom }; a half: { actions, xp?, lost?, remove?, duration?, infuse?, infuseEither? }
Action:  { type, value?, enhancement?, subActions? }   type is attack, move, heal, teleport, loot, push, pierce, range, target ... or condition (value = wound ...) or element
         { type: 'custom', text }       text with %tokens%: %resolve%, %xp% 1 ...; the layout tokens (%lf%, %nbsp1%, banners) are removed
         { type: 'mandatory', actions } a dark banner row with "!": the effect that must be applied (the target rule of an ability above)
         { type: 'optional', cost: { resolve: n | 'X' } | { consume: { elements, either? } } | null, actions, effects?, persistent? }   a dashed pill: only done if the ability above is performed;
         several lines in one dashed box: { type: 'optional', options: [{ cost, actions, effects? }] }; noLine: true when the box is an ability of its own
         { type: 'group', direction, actions }   { type: 'inline', actions }   { type: 'irritation' } the ribbon   { type: 'summon', name, stats: { health, move, attack, range }, special, enhancement?, image? }   { type: 'tokens', slots: [0, 1] } token slots, a 1 gives experience   { type: 'consume', elements } outside a pill   { type: 'area', pattern }
Layout keys (margin, padding, position, left, top, transform, lineHeight, fontSize, flexDirection, noLine) are dropped; 'divider' rows are dropped.
"""
import json
import re
import sys

import yaml

LAYOUT = {'margin', 'padding', 'position', 'left', 'top', 'transform', 'lineHeight', 'fontSize', 'flexDirection', 'noLine', 'enhancement', 'sub', 'duration', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'height', 'width', 'hpColor', 'hpTextColor', 'size'}
CONDITIONS = {'wound', 'stun', 'immobilize', 'poison', 'muddle', 'curse', 'bless', 'strengthen', 'ward', 'safeguard', 'invisible', 'disarm', 'bane', 'brittle', 'impair', 'regenerate', 'infect', 'chill'}
ELEMENTS = {'air', 'fire', 'ice', 'earth', 'light', 'dark', 'wild'}
TOKEN_TYPES = CONDITIONS | {'scry', 'attack', 'move', 'heal', 'teleport', 'loot', 'push', 'pierce', 'range', 'target', 'damage', 'xp', 'resolve', 'lost', 'persistent', 'recover', 'jump', 'fly', 'pull', 'retaliate', 'shield'}
COST = re.compile(r'^-(\d+|X)\s*%resolve%\s*:\s*(.*)$', re.S)
unknown = {}


def note(what, where=''):
    unknown[(what, where)] = unknown.get((what, where), 0) + 1


def number(v):
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return v
    if isinstance(v, str) and re.fullmatch(r'\d+,?', v.strip()):
        return int(v.strip().rstrip(','))
    return v


def clean_text(s):
    s = str(s)
    s = re.sub(r'%banner_[tb]%', '', s)
    s = s.replace('%resol%', '%resolve%').replace('%xp1%', '%xp% 1').replace('%classToken0%', '%rift%')   # Cassandra's class token is the rift overlay token
    s = re.sub(r'%(?:lf|ls|nbsp\d*)%', ' ', s)
    s = re.sub(r'%enhancement-[a-z]+%', '', s)
    return re.sub(r'\s+', ' ', s).strip()


def parse_effects(text):
    """'+3 %teleport%, %xp% 1' -> [{type, value, relative}]; None when the text is a sentence."""
    text = text.strip().strip(',').strip()
    if not text:
        return []
    out = []
    for raw in re.split(r',\s*', text.rstrip('.')):
        raw = raw.strip()
        if not raw:
            continue
        parts, i = [], 0
        rx = re.compile(r'\s*([+-]\d+)?\s*%(\w+)%(?:\s+(\d+))?')
        while i < len(raw):
            m = rx.match(raw, i)
            if not m or m.end() == i:
                return None
            parts.append(m)
            i = m.end()
        made = []
        for m in parts:
            t = m.group(2)
            if t not in TOKEN_TYPES:
                return None
            o = {'type': 'condition', 'value': t} if t in CONDITIONS else {'type': t}
            if m.group(3) is not None:
                o['value'] = int(m.group(3))
            elif m.group(1):
                o['value'] = int(m.group(1))
            if m.group(1):
                o['relative'] = True
            made.append(o)
        if not made:
            return None
        main = made[0]
        if len(made) > 1:
            main['subActions'] = made[1:]
        out.append(main)
    return out


def sub_item(x, where):
    """An entry of a `sub:` list: a bare name (self, wound ...) or a one-key mapping (range: 3, target: 1 enemy, wound: )."""
    if isinstance(x, str):
        if x == 'self':
            return {'type': 'target', 'value': 'self'}
        if x in CONDITIONS:
            return {'type': 'condition', 'value': x}
        if x in ELEMENTS:
            return {'type': 'element', 'value': x}
        if x in ('fly', 'flying', 'jump'):
            return {'type': 'jump' if x == 'jump' else 'fly'}
        if '/' in x and all(part in ELEMENTS for part in x.split('/')):        # light/dark: either element
            return {'type': 'element', 'value': x, 'either': True}
        note('sub name', x)
        return {'type': 'text', 'text': x}
    return item(x, where)


def item(x, where=''):
    """One entry of an actions list -> an action, or None for layout (divider)."""
    if isinstance(x, str):
        if x == 'divider':
            return None
        return sub_item(x, where)
    if not isinstance(x, dict):
        note('item', repr(x))
        return None
    keys = [k for k in x if k not in LAYOUT]
    if not keys:
        note('item without a main key', str(list(x)))
        return None
    key = keys[0]
    val = x[key]
    enh = x.get('enhancement')
    subs = [a for a in (sub_item(s, where + '/' + key) for s in (x.get('sub') or [])) if a]
    if key == 'custom':
        return {'type': 'custom', 'text': clean_text(val)}
    if key in ('group', 'multi'):
        kids = [a for a in (item(k, where + '/' + key) for k in (val or [])) if a]
        if any(k.get('type') == 'custom' and '%irri%' in str(k.get('text', '')) for k in kids) or any('%irri%' in json.dumps(k) for k in kids):
            return {'type': 'irritation'}
        out = {'type': 'inline' if key == 'multi' else 'group', 'actions': kids}
        if key == 'group' and x.get('flexDirection'):
            out['direction'] = x['flexDirection']
        return out
    if key in ('optional', 'mandatory'):
        kids = [a for a in (item(k, where + '/' + key) for k in (val or [])) if a]
        if key == 'mandatory':
            return {'type': 'mandatory', 'actions': kids}
        out = optional(kids)
        if x.get('noLine'):                                            # an ability of its own, not hung from the ability above (no T-shaped line)
            out['noLine'] = True
        return out
    if key == 'divider':                                             # "- divider:" written as a mapping
        return None
    if key == 'self' and val is None:                                # "- self:" inside a sub list
        return {'type': 'target', 'value': 'self'}
    if key == 'summon' and isinstance(val, dict):                    # stats: [health, move, attack, range] ('-' = none), special: [...], name, enhancement, image: {url}
        st = val.get('stats') or []
        out = {'type': 'summon', 'name': val.get('name'), 'stats': dict(zip(('health', 'move', 'attack', 'range'), st))}
        out['special'] = [a for a in (item(k, where + '/summon') for k in (val.get('special') or [])) if a]
        if val.get('enhancement'):
            out['enhancement'] = val['enhancement']
        if (val.get('image') or {}).get('url'):
            out['image'] = val['image']['url']
        return out
    if key == 'hex':
        return {'type': 'area', 'pattern': str(val)}
    if key == 'tokens':                                              # token slots (a 1 gives experience): [0,1,0,1]
        return {'type': 'tokens', 'slots': val}
    if key == 'consume':                                             # consume: [light] or [light/dark] (either element)
        names = [e for v in (val if isinstance(val, list) else [val]) for e in str(v).split('/')]
        out = {'type': 'consume', 'elements': names}
        if any('/' in str(v) for v in (val if isinstance(val, list) else [val])):
            out['either'] = True
        return out
    out = {'type': 'condition', 'value': key} if key in CONDITIONS else {'type': 'element', 'value': key} if key in ELEMENTS else {'type': key}
    if key not in CONDITIONS and key not in ELEMENTS and key not in TOKEN_TYPES and key not in ('xp', 'lost'):
        note('action key', key)
    v = number(val)
    if v not in (None, ''):
        out['value'] = v
    if enh:
        out['enhancement'] = enh
    if subs:
        out['subActions'] = subs
    return out


COST_AT = re.compile(r'-(?:\d+|X)\s*%resolve%\s*:')


def leaves(kids):
    """The entries of a pill in reading order, groups opened: ('text', str) and ('act', action)."""
    out = []
    for k in kids:
        if k.get('type') == 'group' or k.get('type') == 'inline':
            out += leaves(k['actions'])
        elif k.get('type') == 'custom':
            out.append(('text', k['text']))
        else:
            out.append(('act', k))
    return out


def optional(kids):
    """A dashed pill: lines that start with a cost ("-1 %resol% :") and what they do, only if the ability above is performed. The cost may be cut into
    several groups by the layout, so the texts are joined first and cut again at every cost. One line: { cost, actions, effects?, persistent? };
    several lines in one box: { options: [ ... ] }."""
    stream = []
    for kind, v in leaves(kids):                                   # join neighbouring texts, then cut them at each cost
        if kind == 'text' and stream and stream[-1][0] == 'text':
            stream[-1] = ('text', stream[-1][1] + ' ' + v)
        else:
            stream.append((kind, v))
    options, cur = [], None
    def start(cost):
        nonlocal cur
        cur = {'cost': cost, 'actions': []}
        options.append(cur)
    def add_text(t):
        t = re.sub(r'\s+', ' ', t).strip()
        if not t:
            return
        persistent = '%persistent%' in t
        t = t.replace('%persistent%', '').strip()
        if persistent:
            cur['persistent'] = True
        eff = parse_effects(t) if t else []
        if eff is None:
            cur['actions'].append({'type': 'custom', 'text': t})
        elif eff:
            cur.setdefault('effects', []).extend(eff)
    for kind, v in stream:
        if kind == 'act':
            if v.get('type') == 'consume' and (cur is None or cur.get('cost') is not None or cur['actions'] or cur.get('effects')):
                start({'consume': {k: v[k] for k in ('elements', 'either') if k in v}})   # an element is consumed instead of resolve
                continue
            if cur is None:
                start(None)
            if v.get('type') == 'consume':
                cur['cost'] = {'consume': {k: v[k] for k in ('elements', 'either') if k in v}}
            elif v.get('type') == 'xp':
                cur.setdefault('effects', []).append({'type': 'xp', 'value': v.get('value')})
            else:
                cur['actions'].append(v)
            continue
        pos = [m.start() for m in COST_AT.finditer(v)]
        cuts = ([0] if not pos or pos[0] > 0 else []) + pos
        for a, b in zip(cuts, cuts[1:] + [len(v)]):
            piece = v[a:b]
            m = COST.match(piece.strip())
            if m:
                start({'resolve': 'X' if m.group(1) == 'X' else int(m.group(1))})
                add_text(m.group(2))
            else:
                if cur is None:
                    start(None)
                add_text(piece)
    if not options:
        options = [{'cost': None, 'actions': []}]
    if len(options) == 1:
        return {'type': 'optional', **options[0]}
    return {'type': 'optional', 'options': options}


def half(h, where):
    if not h:
        return {'actions': []}
    out = {'actions': [a for a in (item(x, where) for x in (h.get('actions') or [])) if a]}
    if h.get('xp') is not None:
        out['xp'] = number(h['xp'])
    if h.get('lost'):
        out['lost'] = True
    if h.get('remove'):
        out['remove'] = True
    if h.get('duration'):
        out['duration'] = str(h['duration']).strip()
    if h.get('infuse'):                                              # the banner at the end of a half that creates an element: infuse: [light] or [light/dark] (either)
        names = [e for v in (h['infuse'] if isinstance(h['infuse'], list) else [h['infuse']]) for e in str(v).split('/')]
        out['infuse'] = names
        if any('/' in str(v) for v in (h['infuse'] if isinstance(h['infuse'], list) else [h['infuse']])):
            out['infuseEither'] = True
    return out


def split_cards(text):
    """The card chunks of a card code text: a card starts at "name:" (also "- name:" and indented) followed by "initiative:"."""
    lines = text.replace('\r\n', '\n').split('\n')

    def is_start(i):
        if not re.match(r'^\s*(?:-\s+)?name:\s*\S', lines[i]):
            return False
        nxt = next((l for l in lines[i + 1:] if l.strip() and not l.strip().startswith('#')), '')       # a comment may stand between name and initiative
        return bool(re.match(r'^\s*initiative:', nxt))

    starts = [i for i in range(len(lines)) if is_start(i)]
    chunks = []
    for n, s in enumerate(starts):
        e = starts[n + 1] if n + 1 < len(starts) else len(lines)
        chunk = lines[s:e]
        chunk[0] = re.sub(r'^\s*(?:-\s+)?', '', chunk[0])
        chunks.append((chunk[0], '\n'.join(chunk).replace('\t', '  ')))
    return chunks


def parse_text(text):
    """-> (cards, errors): the converted cards, and [(first line of the card, message)] for the cards whose YAML could not be read."""
    cards, errors = [], []
    for first, chunk in split_cards(text):
        try:
            d = yaml.safe_load(chunk)
            cards.append({'name': str(d['name']).strip(), 'level': number(d['level']), 'initiative': number(d['initiative']),
                          'top': half(d.get('top'), d['name']), 'bottom': half(d.get('bottom'), d['name'])})
        except Exception as ex:
            errors.append((first, str(ex).split('\n')[0]))
    return cards, errors


def main(sources, dst):
    text = '\n\n'.join(open(src, encoding='utf-8').read().replace('\r\n', '\n') for src in sources)
    cards, errors = parse_text(text)
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=1, ensure_ascii=False)
    print(len(cards), 'cards ->', dst)
    for first, msg in errors:
        print('  not readable:', first, '|', msg)
    for (what, where), n in sorted(unknown.items()):
        print('  not understood:', what, where, 'x' + str(n))


if __name__ == '__main__':
    main(sys.argv[1:-1], sys.argv[-1])
