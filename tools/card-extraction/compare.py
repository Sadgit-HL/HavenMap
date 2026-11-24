"""Compares two readings of the same ability cards by what the cards DO, not by how they are written.

Usage: python tools/card-extraction/compare.py <A> <B> [--only "Card Name,..."] [--quiet]
A and B: a card code .md (import/card_code_*.md) or an action JSON (tools/*-ability-cards.code.json, tools/secretariat-cards/*.json). Cards are matched by name.

Each half of a card is reduced to a list of facts: an ability with its number (attack 3, range 2, push 2 ...), a condition, an element that is consumed or created,
experience, lost, persistent, round, a hex area, a summon with its stats, the numbers and icons inside the printed texts. Layout (dividers, groups, dashed boxes
written as text or as a structure), enhancement markers, punctuation and the words of the texts do not count. A fact written as structure in one reading and as
icons and numbers in a text in the other reading comes out the same. What the report lists per half is what only one reading has: each of those is a place to
look at the picture. Level and initiative are compared too.
"""
import importlib.util
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
spec = importlib.util.spec_from_file_location('ccc', os.path.join(ROOT, 'tools', 'convert-card-code.py'))
ccc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ccc)

FLAGS = {'lost', 'persistent', 'round', 'remove'}                 # counted once per half, wherever they are written
ALIAS = {'flying': 'fly', 'resol': 'resolve', 'xp1': 'xp'}
TOKEN = re.compile(r'%([\w/-]+)%')
LAYOUT = {'mandatory', 'group', 'inline', 'optional'}


def alias(t):
    t = t.lower()
    return ALIAS.get(t, t)


def text_facts(text, out):
    """Icons and numbers of a printed text: a number right after an icon, or a +N right before one, belongs to it; other numbers stand alone."""
    s = re.sub(r'%xp1%', '%xp% 1', str(text))
    s = re.sub(r'\s+', ' ', s)
    pos = 0
    items = []                                                   # (kind, value, start, end)
    for m in re.finditer(r'%([\w/-]+)%|(?<!\w)[+-]?(\d+|X)(?![\w%])', s):
        if m.group(1):
            items.append(('tok', alias(m.group(1)), m.start(), m.end()))
        else:
            items.append(('num', m.group(2), m.start(), m.end()))
    used = set()
    for i, (k, v, a, b) in enumerate(items):
        if k != 'tok':
            continue
        n = None
        if i + 1 < len(items) and items[i + 1][0] == 'num' and (i + 1) not in used and s[b:items[i + 1][2]].strip() == '':
            n = i + 1
        elif i > 0 and items[i - 1][0] == 'num' and (i - 1) not in used and s[items[i - 1][3]:a].strip() == '':
            n = i - 1
        if n is not None:
            used.add(n)
            out.append('%s %s' % (v, items[n][1]))
        else:
            out.append(v)
    for i, (k, v, a, b) in enumerate(items):
        if k == 'num' and i not in used:
            out.append('number %s' % v)


def pattern_key(p):
    return '_'.join(row.rstrip('e') for row in str(p).split('_'))


def walk(actions, out, flags):
    for a in actions or []:
        if not isinstance(a, dict):
            continue
        t = a.get('type')
        v = a.get('value')
        if t == 'custom':
            text_facts(a.get('text', ''), out)
            for tok in TOKEN.findall(str(a.get('text', ''))):
                if alias(tok) in FLAGS:
                    flags.add(alias(tok))
        elif t in LAYOUT:
            if t == 'optional':
                cost = a.get('cost') or {}
                if 'consume' in cost:
                    out.append('consume ' + '+'.join(sorted(cost['consume'].get('elements', []))))
                if 'resolve' in cost:
                    out.append('resolve %s' % cost['resolve'])
                for o in a.get('options') or []:
                    walk([{'type': 'optional', 'cost': o.get('cost'), 'actions': o.get('actions'), 'effects': o.get('effects')}], out, flags)
                for e in a.get('effects') or []:
                    out.append(('%s %s' % (e.get('type'), e.get('value'))).strip())
            walk(a.get('actions'), out, flags)
        elif t == 'condition':
            out.append(str(v))
        elif t == 'element':
            for e in str(v).split('/'):
                out.append('element ' + e)
        elif t == 'consume':
            out.append('consume ' + '+'.join(sorted(a.get('elements', []))))
        elif t == 'tokens':
            out.append('slots %d' % len(a.get('slots', [])))
            for n in a.get('slots', []):
                if n:
                    out.append('xp %s' % n)
        elif t == 'area':
            out.append('hex ' + pattern_key(a.get('pattern', '')))
        elif t == 'summon':
            st = a.get('stats') or {}
            out.append('summon ' + str(a.get('name', '')).lower())
            for k in ('health', 'move', 'attack', 'range'):
                if st.get(k) not in (None, '-', ''):
                    out.append('summon %s %s' % (k, re.sub(r'\D', '', str(st[k])) or str(st[k])))
            walk(a.get('special'), out, flags)
        elif t in ('irritation',):
            out.append('irritation')
        elif t == 'raw':
            out.append('RAW ' + json.dumps(a.get('secretariat'))[:60])
        elif t == 'grant':
            text_facts(a.get('text', ''), out)
            walk(a.get('actions'), out, flags)
        else:
            if isinstance(v, str) and not re.fullmatch(r'\d+|X', v):
                out.append(str(t))
                text_facts(v, out)
            elif v in (None, '', 0) and not isinstance(v, bool) and v != 0:
                out.append(str(t))
            else:
                out.append('%s %s' % (t, v))
        walk(a.get('subActions'), out, flags)
        if t not in ('summon',):
            pass


def half_facts(h):
    out, flags = [], set()
    walk((h or {}).get('actions'), out, flags)
    if (h or {}).get('xp'):
        out.append('xp %s' % h['xp'])
    for f in ('lost', 'remove'):
        if (h or {}).get(f):
            flags.add(f)
    if (h or {}).get('duration'):
        flags.add(str(h['duration']))
    for e in (h or {}).get('infuse') or []:
        out.append('element ' + str(e))
    if (h or {}).get('consume'):
        out.append('consume ' + '+'.join(sorted(h['consume'])))
    c = Counter(out)
    for f in flags:
        c[f] = 1
    return c


def load(path):
    if path.endswith('.json'):
        return json.load(open(path, encoding='utf-8'))
    cards, errors = ccc.parse_text(open(path, encoding='utf-8').read())
    for first, msg in errors:
        print('  not readable in %s: %s | %s' % (os.path.basename(path), first, msg))
    return cards


def main():
    args = sys.argv[1:]
    only, quiet = None, False
    if '--only' in args:
        i = args.index('--only')
        only = {x.strip().lower() for x in args[i + 1].split(',')}
        del args[i:i + 2]
    if '--quiet' in args:
        args.remove('--quiet')
        quiet = True
    if len(args) != 2:
        print(__doc__)
        return 2
    a_cards = {c['name'].strip().lower(): c for c in load(args[0])}
    b_cards = {c['name'].strip().lower(): c for c in load(args[1])}
    names = [n for n in a_cards if n in b_cards and (only is None or n in only)]
    for n in a_cards:
        if n not in b_cards:
            print('only in A:', a_cards[n]['name'])
    for n in b_cards:
        if n not in a_cards:
            print('only in B:', b_cards[n]['name'])
    bad = 0
    halves = 0
    diff_halves = 0
    for n in names:
        a, b = a_cards[n], b_cards[n]
        notes = []
        if str(a['initiative']) != str(b['initiative']):
            notes.append('initiative A %s, B %s' % (a['initiative'], b['initiative']))
        if str(a['level']) != str(b['level']):
            notes.append('level A %s, B %s' % (a['level'], b['level']))
        for half in ('top', 'bottom'):
            halves += 1
            fa, fb = half_facts(a.get(half)), half_facts(b.get(half))
            if fa != fb:
                diff_halves += 1
                oa, ob = fa - fb, fb - fa
                notes.append('%s: only A %s | only B %s' % (half, sorted(oa.elements()), sorted(ob.elements())))
        if notes:
            bad += 1
            if not quiet:
                print('%s' % a['name'])
                for x in notes:
                    print('   ' + x)
    print('%d cards compared, %d with a difference; %d of %d halves differ' % (len(names), bad, diff_halves, halves))
    return 0


if __name__ == '__main__':
    sys.exit(main())
