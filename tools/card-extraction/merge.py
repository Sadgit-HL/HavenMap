"""Merges the batch files written by the readers into one card code file, in the order of the class's card list (scripts/games/gh2_cards.js).

Usage: python tools/card-extraction/merge.py <class code or name> <output .md> <batch .card.md> [more ...] [--header "text"]
A card is matched by initiative and level, or by initiative alone when that is unique in the class (the level on the picture can differ from the list). A card read
twice (two list entries with the same picture) is kept once; the two readings are compared and reported. Prints what is missing or not matched."""
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ccc = load('ccc', os.path.join(ROOT, 'tools', 'convert-card-code.py'))
chk = load('chk', os.path.join(HERE, 'check.py'))


def main():
    args = sys.argv[1:]
    header = ''
    if '--header' in args:
        i = args.index('--header')
        header = args[i + 1] + '\n'
        del args[i:i + 2]
    if len(args) < 3:
        print(__doc__)
        return 2
    cls, out, files = args[0], args[1], args[2:]
    classes = [json.loads(m) for m in re.findall(r'\{"i":\d+,"code":[^}]*\}', open(os.path.join(ROOT, 'scripts/games/gh2_classes.js'), encoding='utf-8').read())]
    match = [c for c in classes if cls.lower() in (c['code'].lower(), c['name'].lower(), str(c['i']))]
    if not match:
        raise SystemExit('unknown class ' + cls)
    known = [json.loads(m) for m in re.findall(r'\{"id":\d+,"cls":%d,[^}]*\}' % match[0]['i'], open(os.path.join(ROOT, 'scripts/games/gh2_cards.js'), encoding='utf-8').read())]
    chunks, dups = {}, []
    for f in files:
        text = open(f, encoding='utf-8').read().replace('\r\n', '\n')
        cards, errors = ccc.parse_text(text)
        for first, msg in errors:
            print('NOT READABLE', f, first, msg)
        for (first, chunk), card in zip(ccc.split_cards(text), cards):
            key = (card['initiative'], str(card['level']))
            if key in chunks:
                dups.append((chunks[key][0], card))
            else:
                chunks[key] = (card, chunk.rstrip() + '\n')
    for a, b in dups:
        sa, sb = chk.signature(a['top']) + chk.signature(a['bottom']), chk.signature(b['top']) + chk.signature(b['bottom'])
        print('%s was read twice: the readings %s' % (b['name'], 'agree' if sa == sb else 'differ (only first %s, only second %s)' % (dict(sa - sb), dict(sb - sa))))
    result, seen, missing = [], set(), []
    for k in known:
        key = (k['ini'], str(k['lv']))
        if key not in chunks:
            alt = [c for c in chunks if c[0] == k['ini']]
            if len(alt) == 1:
                key = alt[0]
        if key in seen:
            continue
        if key in chunks:
            result.append(chunks[key][1])
            seen.add(key)
        else:
            missing.append(k['slug'])
    extra = [chunks[c][0]['name'] for c in chunks if c not in seen]
    open(out, 'w', encoding='utf-8', newline='').write(header + '\n'.join(result))
    print('%d cards written to %s; not in the files: %s; not matched to the card list: %s' % (len(result), out, missing or 'none', extra or 'none'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
