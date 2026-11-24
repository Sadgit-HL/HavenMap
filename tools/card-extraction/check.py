"""Checks extracted card code, and compares it with card code known to be right.

Usage: python tools/card-extraction/check.py <extracted .md> [--truth <known .md> ...] [--class <class code or name>]
  Without --truth: parse every card, report what cannot be read, unknown keys, tokens and hex letters, icons marked %?...%, empty halves, and (with --class) cards
  whose level and initiative are not in the card list of the class (scripts/games/gh2_cards.js); notes on what is unusual (marker shapes, values, experience; plausible()) and on words
  that look like a misread known word (vocab.txt, built by build-vocab.py).
  With --truth: also the share of halves whose actions agree with the known card code, per feature, and the differing cards. Cards are matched by initiative and level.
Exit code 1 when a card cannot be read. Needs PyYAML (a tool only)."""
import collections
import difflib
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
spec = importlib.util.spec_from_file_location('ccc', os.path.join(ROOT, 'tools', 'convert-card-code.py'))
ccc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ccc)

KEYS = set('actions top bottom name initiative level xp lost remove duration infuse teleport attack move heal loot push pull pierce shield retaliate jump fly range target damage '
           'wound stun immobilize poison muddle disarm curse bless strengthen ward regenerate safeguard invisible bane brittle impair infect chill light dark fire ice air earth wild '
           'enhancement sub custom mandatory optional consume group multi hex summon stats special tokens divider self blind chill dodge empower enfeeble infect rupture swing taunt classToken mode '
           'plague namedAbility corner number style baseAttack baseMove snap hexIcons icon reverse h lines wind'.split())
TOKENS = set('lf ls nbsp1 nbsp2 nbsp3 nbsp6 nbsp7 nbsp10 attack move heal range target push pull pierce damage teleport loot shield retaliate jump flying stun wound poison muddle disarm '
             'immobilize invisible strengthen ward regenerate safeguard bless curse bane brittle impair infect chill light dark fire ice air earth wild xp1 xp2 recover lost persistent '
             'round resol irri classToken0 classToken1 classToken2 scry amd-double amd-null amd-minus-1 amd-rolling shuffle enhancement-square enhancement-circle enhancement-diamond '
             'enhance1 banner_t banner_b range3 self_dmg plague gain_pressure lose_pressure low_pressure regular_pressure high_pressure over_pressure'.split())
LAYOUT = set('margin padding position left top transform lineHeight fontSize flexDirection noLine height width marginLeft marginRight marginTop marginBottom hpColor hpTextColor size image url name'.split())


def load(paths):
    text = '\n\n'.join(open(p, encoding='utf-8').read() for p in paths)
    cards, errors = ccc.parse_text(text)
    return cards, errors, text


def vocabulary(text):
    """Unknown keys, tokens, hex letters and marked icons in a card code text, by card name."""
    problems = collections.defaultdict(list)
    for first, chunk in ccc.split_cards(text):
        name = first.replace('name:', '').strip()
        try:
            import yaml
            d = yaml.safe_load(chunk)
        except Exception:
            continue

        def walk(x, ctx):
            if isinstance(x, dict):
                for k, v in x.items():
                    if k not in KEYS and k not in LAYOUT:
                        problems[name].append('unknown key ' + str(k))
                    if k in ('range', 'target') and ctx != 'sub' and not (ctx == '' and k == 'target'):    # the card creator accepts them only in a sub block
                        problems[name].append(k + ' outside a sub block (the card creator gives an error): put it in sub: of the action it belongs to')
                    if k == 'hex':
                        bad = set(str(v)) - set('etsabxdhfc_')
                        if bad:
                            problems[name].append('hex letters ' + ''.join(sorted(bad)))
                    if k == 'enhancement':
                        for e in (v if isinstance(v, list) else [v]):
                            if str(e) not in ('circle', 'square', 'diamond', 'plus', 'diamondPlus', '0'):
                                problems[name].append('enhancement ' + str(e))
                    walk(v, k)
            elif isinstance(x, list):
                for i in x:
                    walk(i, ctx)
            elif isinstance(x, str):
                for t in re.findall(r'%([^%]+)%', x):
                    if t.startswith('?'):
                        problems[name].append('icon not identified: ' + t[1:])
                    elif re.sub(r'-(s|i)$', '', t) not in TOKENS and not (t.endswith('c') and t[:-1] in ('fire', 'ice', 'air', 'wind', 'earth', 'light', 'dark', 'wild')):
                        problems[name].append('token %' + t + '%')
        walk(d, '')
    return problems


def signature(h):
    """What a half does, as a counter of short facts: types and values, optional costs and effects, flags."""
    out = collections.Counter()

    def clean(v):                                       # a value may carry a token ('4 %enhancement-square%'): the number is what counts
        return re.sub(r'%[^%]*%', '', str(v)).strip() if isinstance(v, str) else v

    def eff(e):                                         # what a pill adds as text (+3 %teleport%) counts like the same action written out (teleport: 3); only a relative one is its own fact
        out['%s:%s%s' % (e['type'], '+' if e.get('relative') else '', clean(e.get('value')))] += 1
        for k in e.get('subActions', []):
            sub(k)

    def sub(a):
        t = a.get('type')
        if t in ('custom', 'divider', 'text'):
            return
        if t in ('group', 'inline'):
            for k in a['actions']:
                sub(k)
            return
        if t == 'mandatory':
            out['mandatory'] += 1
            for k in a['actions']:
                sub(k)
            return
        if t == 'optional':
            for o in (a.get('options') or [a]):
                out['optional:' + json.dumps(o.get('cost'), sort_keys=True)] += 1
                for e in o.get('effects', []):
                    eff(e)
                for k in o.get('actions', []):
                    sub(k)
            return
        if t in ('irritation', 'area', 'tokens', 'summon'):
            out[t + (':' + str(a.get('pattern')) if t == 'area' else '')] += 1
            return
        out['%s:%s' % (t, clean(a.get('value')))] += 1
        for k in a.get('subActions', []):
            sub(k)

    for a in h['actions']:
        sub(a)
    for f in ('xp', 'lost', 'remove', 'duration'):
        if h.get(f):
            out['flag:%s:%s' % (f, h[f])] += 1
    if h.get('infuse'):
        out['infuse:' + '/'.join(h['infuse'])] += 1
    return out


def texts(h):
    out = []

    def walk(a):
        for x in a:
            if x.get('type') == 'custom':
                out.append(x['text'])
            for k in ('actions', 'subActions', 'special'):
                if k in x:
                    walk(x[k])
            for o in x.get('options', []):
                walk(o.get('actions', []))
    walk(h['actions'])
    return out


def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9% ]', '', s.lower())).strip()


SHAPES = {'attack': {'diamond', 'square'}, 'move': {'circle', 'square'}, 'teleport': {'circle', 'square'}, 'jump': {'circle', 'square'}, 'fly': {'circle', 'square'},
          'heal': {'square', 'plus', 'diamondPlus', 'diamond'}, 'condition': {'diamond', 'plus', 'diamondPlus', 'circle'}, 'range': {'square', 'circle'}}
LIMITS = {'attack': 8, 'move': 8, 'heal': 10, 'shield': 3, 'retaliate': 4, 'range': 6}


def plausible(cards, unique_initiative=False):
    """Soft checks from what 205 Gloomhaven 2e cards and the owner's 57 Mercenary Pack cards look like (tools/card-extraction/gh2e-patterns.md): marker shapes by place,
    markers per card, values, experience, initiative and name repeats. A note is a reason to look at the picture again, not an error."""
    notes = []
    seen = collections.Counter(c['initiative'] for c in cards)
    names = collections.Counter(c['name'] for c in cards)
    for c in cards:
        total = 0

        def walk(actions, parent):
            nonlocal total
            for a in actions:
                t = a.get('type')
                for e in a.get('enhancement', []) or []:
                    total += 1
                    if t in SHAPES and str(e) not in SHAPES[t] and str(e) != '0':
                        notes.append('%s: %s with a %s marker is unusual (usual: %s)' % (c['name'], t, e, '/'.join(sorted(SHAPES[t]))))
                v = a.get('value')
                if t in LIMITS and isinstance(v, int) and v > LIMITS[t]:
                    notes.append('%s: %s %s is unusually high (usual at most %d)' % (c['name'], t, v, LIMITS[t]))
                walk(a.get('subActions', []), t)
                for k in ('actions', 'special'):
                    walk(a.get(k, []), parent)
                for o in a.get('options', []):
                    walk(o.get('actions', []), parent)
        for h in ('top', 'bottom'):
            walk(c[h]['actions'], '')
            xp = c[h].get('xp')
            if isinstance(xp, int) and xp > 3:
                notes.append('%s: %s experience %s is unusual (1 to 3)' % (c['name'], h, xp))
            if len(c[h]['actions']) > 6:
                notes.append('%s: %s has %d actions' % (c['name'], h, len(c[h]['actions'])))
        if total > 5:
            notes.append('%s: %d enhancement markers (usually 0 to 4)' % (c['name'], total))
        if unique_initiative and seen[c['initiative']] > 1:
            notes.append('%s: initiative %s is used by another card of the file' % (c['name'], c['initiative']))
        if names[c['name']] > 1:
            notes.append('%s: name used twice' % c['name'])
    return sorted(set(notes))


def odd_words(cards):
    """Words of the card texts that are not in vocab.txt but look like a known word (a letter wrong or missing): probably misread, or a typo printed on the card."""
    path = os.path.join(HERE, 'vocab.txt')
    if not os.path.exists(path):
        return []
    vocab = set(open(path, encoding='utf-8').read().split())
    confirmed = os.path.join(HERE, 'vocab-confirmed.txt')                 # words the owner confirmed as printed
    if os.path.exists(confirmed):
        vocab |= {w.strip() for w in open(confirmed, encoding='utf-8').read().splitlines() if w.strip() and not w.startswith('#')}
    out = []
    for c in cards:
        for h in ('top', 'bottom'):
            for t in texts(c[h]):
                for w in re.findall(r"[A-Za-z][A-Za-z']+", re.sub(r'%[^%]*%', ' ', t)):
                    w = w.lower()
                    if w in vocab or len(w) < 4:
                        continue
                    near = difflib.get_close_matches(w, vocab, n=1, cutoff=0.84)
                    if near:
                        out.append('%s: "%s" for "%s"?' % (c['name'], w, near[0]))
    return sorted(set(out))


def compare(cards, truth):
    byk = {(c['initiative'], str(c['level'])): c for c in truth}
    same = total = matched = 0
    feat = collections.Counter()
    ratio = []
    lines = []
    for c in cards:
        t = byk.get((c['initiative'], str(c['level'])))
        if not t:
            lines.append('  no known card for %s (initiative %s, level %s)' % (c['name'], c['initiative'], c['level']))
            continue
        matched += 1
        for h in ('top', 'bottom'):
            a, b = signature(c[h]), signature(t[h])
            total += 1
            if a == b:
                same += 1
            else:
                lines.append('  %s %s: missing %s | extra %s' % (c['name'], h, dict(b - a), dict(a - b)))
            for k, v in (b - a).items():
                feat['missing ' + k.split(':')[0]] += v
            for k, v in (a - b).items():
                feat['extra ' + k.split(':')[0]] += v
            ta, tb = norm(' '.join(texts(c[h]))), norm(' '.join(texts(t[h])))
            if ta or tb:
                ratio.append(difflib.SequenceMatcher(None, ta, tb).ratio())
    print('compared %d cards: %d of %d halves have the same actions, text similarity %.3f' % (matched, same, total, sum(ratio) / len(ratio) if ratio else 1))
    for k, v in feat.most_common():
        print('   %-24s %d' % (k, v))
    print('\n'.join(lines))
    return same, total


def main():
    args = sys.argv[1:]
    truth, cls, files = [], None, []
    while args:
        a = args.pop(0)
        if a == '--truth':
            truth.append(args.pop(0))
        elif a == '--class':
            cls = args.pop(0)
        else:
            files.append(a)
    if not files:
        print(__doc__)
        return 2
    cards, errors, text = load(files)
    print(len(cards), 'cards read from', ', '.join(files))
    bad = 0
    for first, msg in errors:
        print('  NOT READABLE:', first, '|', msg)
        bad += 1
    for name, ps in vocabulary(text).items():
        for p in sorted(set(ps)):
            print('  %s: %s' % (name, p))
    for note in plausible(cards, unique_initiative=bool(cls)):
        print('  unusual:', note)
    for note in odd_words(cards):
        print('  word:', note)
    for c in cards:
        for h in ('top', 'bottom'):
            if not c[h]['actions']:
                print('  %s: %s has no actions' % (c['name'], h))
    for (what, where), n in sorted(ccc.unknown.items()):
        print('  not understood:', what, where, 'x%d' % n)
    if cls:
        gh = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_cards.js'), encoding='utf-8').read()
        cl = open(os.path.join(ROOT, 'scripts', 'games', 'gh2_classes.js'), encoding='utf-8').read()
        info = [json.loads(m) for m in re.findall(r'\{"i":\d+,"code":[^}]*\}', cl)]
        match = [c for c in info if cls.lower() in (c['code'].lower(), c['name'].lower(), str(c['i']))]
        if not match:
            print('  unknown class', cls)
        else:
            idx = match[0]['i']
            known = [json.loads(m) for m in re.findall(r'\{"id":\d+,"cls":%d,[^}]*\}' % idx, gh)]
            keys = {(k['ini'], str(k['lv'])) for k in known}
            got = {(c['initiative'], str(c['level'])) for c in cards}
            for c in cards:
                if (c['initiative'], str(c['level'])) not in keys:
                    print('  %s: level %s initiative %s is not a card of %s' % (c['name'], c['level'], c['initiative'], match[0]['name']))
            print('  %s: %d of %d cards present; missing %s' % (match[0]['name'], len(got & keys), len(keys), [k['slug'] for k in known if (k['ini'], str(k['lv'])) not in got]))
    if truth:
        tcards, terrors, _ = load(truth)
        compare(cards, tcards)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
