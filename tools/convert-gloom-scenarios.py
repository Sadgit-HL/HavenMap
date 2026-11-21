"""Convert the test scenarios of the monster mover https://github.com/AluminumAngel/gloom (MIT, Copyright 2022 Daniel Nelson) to JSON.

Usage: python tools/convert-gloom-scenarios.py <path to gloom/server/scenarios.py> [output.json]
Default output: tools/tests/fixtures/gloom-scenarios.json

scenarios.py is Python 2 code that also parses as Python 3. Its function init_from_test_scenario(s, index, rules) fills a scenario object with plain
assignments (figures, contents, initiatives, thin walls, the area pattern, the action, and the answer the solver must give). This script runs that
function with a stand-in object for every scenario and each rule set (0 Frosthaven, 1 Gloomhaven, 2 Jaws of the Lion) and writes what it set.

Locations are gloom's: column * 7 + row on a 16 by 7 map (0 based, odd columns shifted down by half a hex). In HavenMap's grid that is
col = column + 1 (1 based, even columns shifted down), row = row. An answer is a list of tuples: the end hex, then the hexes attacked.
thin: the pairs of neighbouring locations with a wall on the edge between them (walls are gloom's own edge numbers).
`supported` marks the scenarios the solver of scripts/monsterMove.js can answer now (no icy hex).
"""
import importlib.util
import json
import os
import sys

HEIGHT = 7
RULES = ['frosthaven', 'gloomhaven', 'jotl']


class Stub:
    valid = True
    correct_answer = None

    def set_rules(self, rules):
        self.FROST_RULES = rules == 0
        self.GLOOM_RULES = rules == 1
        self.JOTL_RULES = rules == 2

    def prepare_map(self):
        pass


def load(path):
    spec = importlib.util.spec_from_file_location('gloom_scenarios', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def neighbour(loc, edge, width=16):
    """The location across edge 0 to 5 of a location (gloom's neighbour order), or None off the map."""
    column, row = divmod(loc, HEIGHT)
    base = (column + 1) % 2
    dc, dr = [(1, 1 - base), (0, 1), (-1, 1 - base), (-1, -base), (0, -1), (1, -base)][edge]
    c, r = column + dc, row + dr
    return c * HEIGHT + r if 0 <= c < width and 0 <= r < HEIGHT else None


def record(index, rules, s):
    contents = {i: c for i, c in enumerate(s.contents) if c != ' '}
    figures = {i: c for i, c in enumerate(s.figures) if c != ' '}
    walls = [[i, e] for i, w in enumerate(s.walls) for e, on in enumerate(w) if on]
    thin = sorted({tuple(sorted((i, n))) for i, e in walls for n in [neighbour(i, e)] if n is not None})
    aoe = [i for i, on in enumerate(s.aoe) if on]
    reasons = []
    if 'I' in contents.values():
        reasons.append('icy terrain')
    if list(figures.values()).count('A') != 1:
        reasons.append('no single active monster')
    return {
        'n': index, 'rules': RULES[rules], 'message': s.message,
        'move': s.ACTION_MOVE, 'range': s.ACTION_RANGE, 'target': s.ACTION_TARGET,
        'flying': bool(s.FLYING), 'jumping': bool(s.JUMPING), 'teleport': bool(s.TELEPORT), 'muddled': bool(s.MUDDLED),
        'contents': {str(k): v for k, v in contents.items()}, 'figures': {str(k): v for k, v in figures.items()},
        'initiatives': {str(i): v for i, v in enumerate(s.initiatives) if v and figures.get(i) == 'C'},
        'walls': walls, 'thin': [list(t) for t in thin], 'aoe': aoe,
        'answer': sorted([list(t) for t in s.correct_answer]) if s.correct_answer else None,
        'supported': not reasons, 'unsupported': reasons,
    }


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tests', 'fixtures', 'gloom-scenarios.json')
    mod = load(path)
    records = []
    for rules in range(3):
        index = 0
        while True:
            index += 1
            s = Stub()
            mod.init_from_test_scenario(s, index, rules)
            if not s.valid:
                break
            records.append(record(index, rules, s))
    data = {
        '_source': 'https://github.com/AluminumAngel/gloom server/scenarios.py, converted by tools/convert-gloom-scenarios.py',
        '_licence': 'MIT License, Copyright (c) 2022 Daniel Nelson. Permission notice: https://github.com/AluminumAngel/gloom/blob/master/LICENSE',
        '_grid': 'location = column * 7 + row, 16 columns, 7 rows; HavenMap col = column + 1, row = row',
        'height': HEIGHT, 'width': 16, 'scenarios': records,
    }
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, separators=(',', ':'), sort_keys=False)
    sup = sum(1 for r in records if r['supported'])
    print(f'{len(records)} records ({len(records) // 3} scenarios x 3 rule sets), {sup} supported, written to {out}')


main()
