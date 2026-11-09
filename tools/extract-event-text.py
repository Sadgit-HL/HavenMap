"""Generate the GH2 event card text from the Gloomhaven Secretariat data (data/gh2e/events.json).

Writes two ES modules into scripts/games/ (generated, do not hand-edit; re-run and diff):
  gh2_event_front.js  EVENT_FRONT[kind][id] = { n: narrative, o: [{ l: label, t: text, r?: 1 }], f?: 1 }
                      The front of the card: what the players read before they vote. Option labels are A, B, C ...;
                      a card with one unlabelled option gets "A". r = the option says "return to deck".
  gh2_event_back.js   EVENT_BACK[kind][id] = [ per option: [ { c?, t?, ta?, rp?, o?, n?, e?: [effect lines] } ] ]
                      The back of the card: the outcome text of an option. Loaded only when an option is revealed.
                      An option has several outcomes; some only apply when a requirement is met:
                        t  [traits]   a character in the party has one of these traits (species and class traits count)
                        ta [traits]   every character has the trait(s)
                        rp [faction, n]  reputation with the faction is above n
                        o  1          "otherwise": applies when no requirement before it was met
                        c  text       the requirement as text (also the only form of requirements that cannot be checked
                                      automatically: choices, payments, earlier answers, scenario results)
                      An outcome with none of these always applies.
  gh2_event_boxes.js  EVENT_BOXES[kind][id] = { b: [ { l?: label, s?: section } ], rule?: text }
                      The boxes a card has to tick (checked in the campaign, kept with the card): one entry per box.
                      l is the text printed next to a box, s the section to read when that box is ticked (hidden until
                      then), rule what happens when every box is ticked.
  gh2_class_traits.js CLASS_TRAITS[class name, lower case] = [the class's three traits, then its species]
`kind` is "city" or "road", `id` the card number (C-07 -> city 7, R-12 -> road 12).

Structured effects are turned into short English lines here (wording is ours, not the card's: check against the card
when in doubt). Item numbers are resolved to names from gh2_items.js.

Usage:  python -I tools/extract-event-text.py [path/to/gh2e/events.json]
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'scripts', 'games')
DEFAULT = os.path.join('D:' + os.sep, 'github', 'gloomhavensecretariat', 'data', 'gh2e', 'events.json')


def pretty(s):
    return re.sub(r'\b\w', lambda m: m.group(0).upper(), str(s).replace('-', ' ').replace('_', ' '))


def items_by_id():
    out = {}
    with open(os.path.join(OUT, 'gh2_items.js'), encoding='utf-8') as f:
        for line in f:
            line = line.strip().rstrip(',')
            if line.startswith('{"id"'):
                it = json.loads(line)
                out[str(it['id'])] = pretty(it['slug'])
    return out


ITEMS = items_by_id()


def text(s):
    """Card text: <br> to line breaks, other tags dropped, %game.x.y% icon tokens to plain words."""
    s = re.sub(r'<br\s*/?>', '\n', str(s))
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'%game\.section:([^%]+)%', r'section \1', s)
    s = re.sub(r'%game\.[a-zA-Z]+[.:]([^%]+)%', lambda m: m.group(1).replace('.', ' '), s)
    s = re.sub(r'%data\.[^%]*%', '', s)
    s = re.sub(r'%([^%]+)%', lambda m: m.group(1).split('.')[-1], s)
    return re.sub(r'[ \t]+', ' ', s).strip()


def item(v):
    return f'{v} {ITEMS[str(v)]}' if str(v) in ITEMS else str(v)


def cond(c):
    if c is None or c == {'type': 'otherwise'}:
        return None
    if isinstance(c, str):
        return text(c)
    t, v = c.get('type'), c.get('values', [])
    if t == 'traits':
        return 'Trait: ' + ' or '.join(pretty(x) for x in v)
    if t == 'traitsAll':
        return 'Every character has: ' + ', '.join(pretty(x) for x in v)
    if t == 'reputationFactionGT' and len(v) == 2:
        return f'Reputation with {pretty(v[0])} above {v[1]}'
    if t in ('payCollectiveGold', 'loseCollectiveGold'):
        return f'Pay {v[0]} collective gold'
    if t == 'payCollectiveItem':
        return f'Pay item {item(v[0])}'
    return pretty(t) + (': ' + ', '.join(map(str, v)) if v else '')


def evref(v):
    """Event reference from effect values such as ["city", "C-44"], ["C-27"] or ["road", "R-14"]: "city 44"."""
    m = re.search(r'([CR])-(\d+)', ' '.join(map(str, v)))
    return ('city ' if m.group(1) == 'C' else 'road ') + str(int(m.group(2))) if m else ' '.join(map(str, v))


def effect(x):
    if isinstance(x, str):
        return text(x)
    if 'type' not in x:                       # nested: { condition, effects, narrative? }
        inner = '; '.join(effect(e) for e in x.get('effects', []))
        c = cond(x.get('condition'))
        return (c + ': ' if c else '') + inner
    t, v = x['type'], x.get('values', [])
    a = v[0] if v else ''
    simple = {
        'noEffect': 'No effect',
        'collectiveGold': f'Gain {a} collective gold',
        'collectiveGoldAdditional': f'Gain {a} additional collective gold',
        'loseCollectiveGold': f'Lose {a} collective gold',
        'gold': f'Each character gains {a} gold',
        'goldAdditional': f'Each character gains {a} additional gold',
        'loseGold': f'Each character loses {a} gold',
        'prosperity': f'Gain {a} prosperity',
        'experience': f'Each character gains {a} XP',
        'unlockScenario': f'Unlock scenario {a}',
        'battleGoal': f'Gain {a} battle goal checkmark(s)',
        'battleCheck': f'Gain {a} battle goal checkmark(s)',
        'discard': f'Discard {a}',
        'scenarioDamage': f'Scenario: suffer {a} damage',
        'randomItemDesign': 'Gain a random item design',
        'drawAnotherEvent': 'Draw another event card',
        'outcome': f'Apply outcome {a}',
        'checkbox': 'Tick a box',
    }
    if t in simple:
        return simple[t]
    if t == 'reputationFaction':
        return f'Gain {v[1]} reputation with {pretty(v[0])}'
    if t == 'loseReputationFaction':
        return f'Lose {v[1]} reputation with {pretty(v[0])}'
    if t == 'item':
        return f'Gain item {item(a)}'
    if t == 'loseItem':
        return f'Lose item {item(a)}'
    if t == 'gainTrait':
        return f'Gain trait: {pretty(a)}'
    if t == 'loseTrait':
        return f'Lose trait: {pretty(a)}'
    if t in ('scenarioCondition', 'traitScenarioCondition'):
        return f'Scenario: start with {pretty(a)}'
    if t == 'event':
        return f'Event card {evref(v)}'
    if t == 'removeEvent':
        return f'Remove event card {evref(v)}'
    if t == 'drawEvent':
        return f'Draw event card {evref(v)}'
    return pretty(t) + (': ' + ', '.join(map(str, v)) if v else '')


def outcome(o):
    d = {}
    raw = o.get('condition')
    c = cond(raw)
    if raw == {'type': 'otherwise'}:
        d['o'] = 1
    elif isinstance(raw, dict) and raw.get('type') == 'traits':
        d['t'] = [str(x).lower() for x in raw.get('values', [])]
    elif isinstance(raw, dict) and raw.get('type') == 'traitsAll':
        d['ta'] = [str(x).lower() for x in raw.get('values', [])]
    elif isinstance(raw, dict) and raw.get('type') == 'reputationFactionGT' and len(raw.get('values', [])) == 2:
        d['rp'] = [str(raw['values'][0]), raw['values'][1]]
    if c:
        d['c'] = c
    if o.get('narrative'):
        d['n'] = text(o['narrative'])
    effs = [e for e in (effect(x) for x in o.get('effects', [])) if e]
    if effs:
        d['e'] = effs
    if o.get('removeFromDeck'):
        d['x'] = 1
    if o.get('returnToDeck'):
        d['r'] = 1
    return d


def walk_effects(effs):
    """Every effect of a list, including the ones nested in { condition, effects }."""
    for x in effs:
        yield x
        if isinstance(x, dict) and 'effects' in x:
            yield from walk_effects(x['effects'])


def boxes_for(card):
    """Boxes of one card, or None. Sources: "checkbox" effects (values = one label per box, or empty strings for blank
    boxes, or an item effect), and the text 'Check box "X" on the front of this event'."""
    blank, labelled, texts = 0, [], []
    for o in card['options']:
        for oc in o.get('outcomes', []):
            for x in walk_effects(oc.get('effects', [])):
                if isinstance(x, str):
                    texts.append(text(x))
                elif x.get('type') == 'checkbox':
                    vals = x.get('values', [])
                    if all(v == '' for v in vals):
                        blank = max(blank, len(vals))
                    else:
                        for v in vals:
                            lab = effect(v) if isinstance(v, dict) else text(v)
                            lab = re.sub(r'^Gain item ', '', lab)
                            if lab not in labelled:
                                labelled.append(lab)
    for t in texts:
        for m in re.finditer(r'Check box "([^"]+)" on the front', t):
            if m.group(1) not in labelled:
                labelled.append(m.group(1))
    boxes = []
    for lab in labelled:
        d = {}
        m = re.search(r'\s*Read (section \d+(?:\.\d+)*)\.?\s*$', lab)
        if m:                                              # "... Read section 66.1." -> label and a hidden section
            d['s'] = m.group(1)                              # "section 66.1"
            lab = lab[:m.start()].strip()
        if lab:
            d['l'] = lab
        boxes.append(d)
    boxes += [{} for _ in range(max(0, blank - len(boxes)))]
    if not boxes:
        return None
    out = {'b': boxes}
    narr = [text(o.get('narrative', '')) for o in card['options']]
    narr += [text(oc['narrative']) for o in card['options'] for oc in o.get('outcomes', []) if oc.get('narrative')]
    for t in texts + narr:
        m = re.search(r'(?:[Ww]hen|[Ii]f) all boxes are checked,?\s*(.*?)(?:\.(?=\s|$)|$)', t, re.S)
        if m and m.group(1).strip():
            r = m.group(1).strip()
            out['rule'] = r[0].upper() + r[1:] + '.'
            break
    return out


# Class folders in the Secretariat data are named by class icon. Names are matched through the species: every pair of
# classes sharing a species below is consistent with the species groups of the game (orchid, inox, aesther, savvas, ...).
CLASS_FOLDER = {
    'angry-face': 'Berserker', 'bruiser': 'Bruiser', 'circles': 'Elementalist', 'cragheart': 'Cragheart',
    'crossed-swords': 'Doomstalker', 'eclipse': 'Nightshroud', 'lightning': 'Wildfury', 'mindthief': 'Mindthief',
    'music-note': 'Soothsinger', 'saw': 'Sawbones', 'silent-knife': 'Silent Knife', 'spellweaver': 'Spellweaver',
    'squidface': 'Plagueherald', 'sun': 'Sunkeeper', 'three-spears': 'Soultether', 'tinkerer': 'Tinkerer',
    'triangles': 'Quartermaster', 'two-mini': 'Bladeswarm',
}


def class_traits():
    base = os.path.dirname(os.path.dirname(DEFAULT))                  # .../data
    out = {}
    for ed in ('gh2e', 'mp'):
        folder = os.path.join(base, ed, 'character')
        for fn in sorted(os.listdir(folder)):
            if not fn.endswith('.json'):
                continue                                              # e.g. the "deck" sub-folder
            with open(os.path.join(folder, fn), encoding='utf-8') as f:
                c = json.load(f)
            name = CLASS_FOLDER.get(c['name']) or pretty(c['name'])
            out[name.lower()] = [str(x).lower() for x in c.get('traits', [])] + ([str(c['characterClass']).lower()] if c.get('characterClass') else [])
    lines = ['// GENERATED by tools/extract-event-text.py from the Gloomhaven Secretariat data (gh2e and mp characters). Do not edit by hand.',
             '// Class name (lower case) -> its three traits, then its species. Used to check event requirements.', '',
             'export const CLASS_TRAITS = {']
    for k in sorted(out):
        lines.append(f'  {json.dumps(k)}: {json.dumps(out[k])},')
    lines.append('};')
    with open(os.path.join(OUT, 'gh2_class_traits.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines) + '\n')
    print('gh2_class_traits.js', len(out), 'classes')


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT
    with open(path, encoding='utf-8') as f:
        cards = json.load(f)
    front = {'city': {}, 'road': {}}
    boxes = {'city': {}, 'road': {}}
    back = {'city': {}, 'road': {}}
    for c in cards:
        m = re.fullmatch(r'([CR])-(\d+)', c['cardId'])
        if not m:
            print('skipped', c['cardId'])
            continue
        kind, n = ('city' if m.group(1) == 'C' else 'road'), int(m.group(2))
        opts, outs = [], []
        for i, o in enumerate(c['options']):
            label = o.get('label') or chr(65 + i)
            d = {'l': label, 't': text(o.get('narrative', ''))}
            if o.get('returnToDeck'):
                d['r'] = 1
            opts.append(d)
            outs.append([outcome(x) for x in o.get('outcomes', [])])
        bx = boxes_for(c)
        if bx:
            boxes[kind][n] = bx
        card = {'n': text(c.get('narrative', '')), 'o': opts}
        if c.get('returnToDeck'):
            card['r'] = 1
        front[kind][n] = card
        back[kind][n] = outs

    def write(name, doc, const, data):
        lines = ['// GENERATED by tools/extract-event-text.py from the Gloomhaven Secretariat data (gh2e/events.json). Do not edit by hand.',
                 '// ' + doc, '', f'export const {const} = {{']
        for kind in ('city', 'road'):
            lines.append(f'  {kind}: {{')
            for n in sorted(data[kind]):
                lines.append(f'    {n}: ' + json.dumps(data[kind][n], ensure_ascii=False, separators=(',', ':')) + ',')
            lines.append('  },')
        lines.append('};')
        with open(os.path.join(OUT, name), 'w', encoding='utf-8', newline='\n') as f:
            f.write('\n'.join(lines) + '\n')
        print(name, sum(len(data[k]) for k in data), 'cards', round(os.path.getsize(os.path.join(OUT, name)) / 1000), 'KB')

    class_traits()
    write('gh2_event_boxes.js', 'Boxes per card: b = [{ l label, s section }], rule = what happens when all are ticked.', 'EVENT_BOXES', boxes)
    write('gh2_event_front.js', 'Event card fronts: n narrative, o options [{l label, t text, r returns to deck}], r card returns to deck.', 'EVENT_FRONT', front)
    write('gh2_event_back.js', 'Event card backs per option: [{c condition, n narrative, e effect lines, x removed from deck, r returns to deck}].', 'EVENT_BACK', back)


main()
