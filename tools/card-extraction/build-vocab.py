"""Builds vocab.txt, the words that appear in the printed texts of Gloomhaven and Frosthaven ability cards, for check.py: a word in extracted card code that is not in the
list is probably misread (or a typo printed on the card).

Usage: python tools/card-extraction/build-vocab.py <path to a clone of https://github.com/Lurkars/gloomhavensecretariat> [more words from card code .md ...]
Reads the English labels of every edition (custom card texts of the classes, ability texts) and the owner's card code files given. Writes only a sorted word list, no
sentences. The Secretariat is AGPL-3.0 licensed (the licence question is an open owner decision, docs/ai/roadmap.md): a list of common English words is all that is kept."""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def flat(d, p=''):
    for k, v in d.items():
        if isinstance(v, dict):
            yield from flat(v, p + k + '.')
        else:
            yield p + k, v


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    root = sys.argv[1]
    words = set()
    for f in glob.glob(os.path.join(root, 'data', '*', 'label', 'en.json')):
        for k, v in flat(json.load(open(f, encoding='utf-8'))):
            if not isinstance(v, str) or not (k.startswith('custom.') or k.startswith('data.custom') or '.abilities.' in k):
                continue
            for w in re.findall(r"[A-Za-z][A-Za-z']+", re.sub(r'%[^%]*%|\*[^*]*\*|<[^>]*>', ' ', v)):
                words.add(w.lower())
    for path in sys.argv[2:]:
        text = open(path, encoding='utf-8').read()
        for t in re.findall(r"custom\s*:\s*(.+)", text):
            for w in re.findall(r"[A-Za-z][A-Za-z']+", re.sub(r'%[^%]*%', ' ', t)):
                words.add(w.lower())
    out = os.path.join(HERE, 'vocab.txt')
    open(out, 'w', encoding='utf-8').write('\n'.join(sorted(words)) + '\n')
    print(len(words), 'words ->', out)
    return 0


if __name__ == '__main__':
    sys.exit(main())
