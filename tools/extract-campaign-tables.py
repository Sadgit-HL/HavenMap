"""Extract the Gloomhaven 2e campaign static tables from the group's WHTracker.xlsx ("Card DB" sheet).

Writes scripts/games/gh2_{classes,cards,items,scenarios,events,quests}.js (ES modules, generated, do not
hand-edit). See docs/campaign-schema.md section 5. The sheet has no header row; columns are read by
position (0-based, as openpyxl gives them):

    0 type   5 number/level  6 sub-number / letter  9 area (stickers)  16 code (class code, slot, ...)
    17 class code (abilities)  30 slug/name  34 display name (stickers)  36 class name / item kind
    39 copies (items; cols 8 = unlocked, 40 = copies left in shop and 41 = display marker are campaign state, not extracted)  46 source tag (gh2, mp, ...)  52 unlock links (stickers, "n - Name;next;next")

Usage:  python -I tools/extract-campaign-tables.py [path/to/WHTracker.xlsx] [path/to/gh2e/scenarios] [path/to/gh2e/character/deck]
Needs openpyxl. The workbook is not in git.
"""
import difflib
import json
import os
import re
import sys
from collections import defaultdict

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_XLSX = os.path.join(os.path.dirname(ROOT), 'asset-backups', 'WHTracker.xlsx')
OUT = os.path.join(ROOT, 'scripts', 'games')
DEFAULT_GHS_BG = os.path.join('D:' + os.sep, 'github', 'gloomhavensecretariat', 'data', 'fh', 'battle-goals.json')
DEFAULT_GHS_BG_LABEL = os.path.join('D:' + os.sep, 'github', 'gloomhavensecretariat', 'data', 'fh', 'label', 'en.json')
DEFAULT_GHS = os.path.join('D:' + os.sep, 'github', 'gloomhavensecretariat', 'data', 'gh2e', 'scenarios')
DEFAULT_GHS_DECKS = os.path.join('D:' + os.sep, 'github', 'gloomhavensecretariat', 'data', 'gh2e', 'character', 'deck')
INITIATIVE_OVERRIDES = os.path.join(ROOT, 'tools', 'card-initiative.json')

# Class names as the game spells them (the Card DB has 'Plague Herald'); keeps names identical across the campaign data.
CLASS_NAME_FIX = {'Plague Herald': 'Plagueherald'}

# Item slots the Card DB has wrong: item id -> slot (169 Staff of Command is a two-hander, 170 Crawling Carapace a body item; swapped in the Card DB).
ITEM_SLOT_FIX = {169: '2H', 170: 'body'}

# Corrections to the Card DB's ability cards: DB slug -> (class code, corrected slug or None). Found 2026-11-08 by comparing
# with the Secretariat data and the asset repository: these level 9 cards sit under the NEXT class's rows in the Card DB
# (their picture URLs give 404; the files are in the folders named here), and one slug has a typo.
CARD_FIX = {
    'vengeful-barrage': ('be2', None),
    'face-your-end': ('br2', None),
    'wasteland': ('bs2', None),
    'wave-of-destruction': ('ch2', None),
    'heart-of-doom': ('ds2', None),
    'phantasmal-killer': ('mt2', None),
    'voice-of-the-night': ('ns2', None),
    'lead-from-the-fron': ('sa', 'lead-from-the-front'),
}
ABILITY_SOURCES = ('gh2', 'mp')          # editions whose class ability cards the campaign can use


def num(v):
    """1.0 -> 1, '12' -> 12, anything else unchanged (None stays None)."""
    if isinstance(v, float) and v == int(v):
        return int(v)
    if isinstance(v, str) and re.fullmatch(r'\d+(\.0)?', v.strip()):
        return int(float(v))
    return v


def load_rows(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    out = []
    for r in wb['Card DB'].iter_rows(values_only=True):
        r = tuple(r) + (None,) * (60 - len(r))
        if r[0]:
            out.append(r)
    return out


def load_ghs_links(directory):
    """Unlock links per scenario index from Gloomhaven Secretariat's gh2e scenario files (AGPL-3.0 project):
    {index: {'name': str, 'unl': [...], 'forced': [...], 'init': bool}}. Indexes are ints, or strings like '23A'.
    Empty when the directory is missing."""
    out = {}
    if not os.path.isdir(directory):
        return out
    for fn in sorted(os.listdir(directory)):
        if not fn.endswith('.json'):
            continue
        with open(os.path.join(directory, fn), encoding='utf-8') as f:
            j = json.load(f)
        if j.get('solo'):
            continue          # solo scenarios reuse the indexes 85-100 and would overwrite the regular ones
        key = lambda v: int(v) if str(v).isdigit() else str(v)
        out[key(j['index'])] = {'name': j.get('name'), 'group': j.get('flowChartGroup'), 'unl': [key(v) for v in j.get('unlocks', [])],
                                'forced': [key(v) for v in j.get('forcedLinks', [])],
                                'init': bool(j.get('initial'))}
    return out


def load_flow_edges(path):
    """Unlock links from the sheet's "GH2 Flow" tab, which is a drawn flowchart on a cell grid: scenario boxes are
    9 columns wide and 13 rows tall (number in the top-left cell), and arrows are single characters in the cells
    between them, pointing from the unlocking scenario to the unlocked one. Horizontal arrows sit 5 rows into a
    box row, on the column between two boxes; arrows between box rows sit 12 rows in, either on a box boundary
    (diagonals) or inside a box column (vertical). Returns {from: [to, ...]}. Diagonals are interpreted by
    position and were checked only against the chart's other links."""
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows = [tuple(r) for r in wb['GH2 Flow'].iter_rows(values_only=True)]
    cell = lambda r, c: rows[r][c] if r < len(rows) and c < len(rows[r]) else None
    width = (max(len(r) for r in rows) + 8) // 9
    boxes = {}
    for br in range(12):
        for bc in range(width):
            v = cell(3 + 13 * br, 9 * bc)
            if v not in (None, ''):
                boxes[(br, bc)] = num(v)
    edges = set()
    for ri, r in enumerate(rows):
        for c, v in enumerate(r):
            if v not in ('→', '←', '↑', '↓', '↗', '↖', '↘', '↙'):
                continue
            band, off = divmod(ri - 3, 13)
            if off == 5 and (c - 8) % 9 == 0:                      # horizontal, between two boxes of a row
                bc = (c - 8) // 9
                a, b = boxes.get((band, bc)), boxes.get((band, bc + 1))
                edges.add((a, b) if v == '→' else (b, a) if v == '←' else (None, None))
            elif off == 12:                                         # between box row `band` and `band + 1`
                up = lambda k: boxes.get((band, k))
                lo = lambda k: boxes.get((band + 1, k))
                if (c - 8) % 9 == 0:
                    bc = (c - 8) // 9
                    edges.add({'↙': (up(bc + 1), lo(bc)), '↘': (up(bc), lo(bc + 1)),
                               '↗': (lo(bc), up(bc + 1)), '↖': (lo(bc + 1), up(bc))}.get(v, (None, None)))
                else:
                    bc = c // 9
                    edges.add({'↓': (up(bc), lo(bc)), '↑': (lo(bc), up(bc))}.get(v, (None, None)))
    out = defaultdict(list)
    for a, b in sorted((e for e in edges if None not in e), key=lambda e: (str(e[0]).zfill(4), str(e[1]).zfill(4))):
        out[a].append(b)
    return out


def load_initiative(directory, classes, by_class):
    """Initiative per ability card: {(class code, slug): number}. Source: Gloomhaven Secretariat gh2e deck files (AGPL-3.0;
    only the numbers are used), whose file names are icon names, so each file is assigned to the class sharing most card
    names with it. Names are matched exactly (letters and digits only), then by closest spelling within the class
    (ratio 0.8) for typos and plural forms. tools/card-initiative.json ({"<class code>/<slug>": number}) wins over both."""
    norm = lambda t: re.sub(r'[^a-z0-9]', '', str(t).lower())
    out, report = {}, []
    if os.path.isdir(directory):
        ours = {code: {norm(r[30]): r[30] for r in rows} for code, rows in by_class.items()}
        for fn in sorted(os.listdir(directory)):
            if not fn.endswith('.json'):
                continue
            with open(os.path.join(directory, fn), encoding='utf-8') as f:
                abilities = json.load(f).get('abilities', [])
            theirs = {norm(a['name']): a.get('initiative') for a in abilities if a.get('initiative') is not None}
            code, overlap = max(((c, len(set(slugs) & set(theirs))) for c, slugs in ours.items()), key=lambda x: x[1])
            if overlap < 10:
                continue
            todo = {k: v for k, v in ours[code].items() if k not in theirs}
            left = {k for k in theirs if k not in ours[code]}
            for k, slug in ours[code].items():
                if k in theirs:
                    out[(code, slug)] = int(theirs[k])
            pairs = sorted(((difflib.SequenceMatcher(None, a, b).ratio(), a, b) for a in todo for b in left), reverse=True)
            used_a, used_b = set(), set()
            for ratio, a, b in pairs:
                if ratio >= 0.8 and a not in used_a and b not in used_b:
                    out[(code, todo[a])] = int(theirs[b])
                    used_a.add(a)
                    used_b.add(b)
            report.append((code, len(out), [todo[a] for a in todo if a not in used_a]))
    if os.path.isfile(INITIATIVE_OVERRIDES):
        with open(INITIATIVE_OVERRIDES, encoding='utf-8') as f:
            for key, v in json.load(f).items():
                code, slug = key.split('/', 1)
                out[(code.lower(), slug)] = int(v)
    covered = {c for c, _ in out}
    print('initiative known for', len(out), 'cards in', len(covered), 'classes; classes without:',
          ', '.join(c['name'] for c in classes if c['code'] not in covered) or 'none')
    return out


def write_module(name, doc, exports):
    lines = ['// GENERATED by tools/extract-campaign-tables.py from WHTracker.xlsx (Card DB). Do not edit by hand.',
             '// ' + doc, '']
    for key, val in exports:
        if isinstance(val, list):
            lines.append(f'export const {key} = [')
            lines += ['  ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) + ',' for x in val]
            lines.append('];')
        else:
            lines.append(f'export const {key} = ' + json.dumps(val, ensure_ascii=False, separators=(',', ':')) + ';')
        lines.append('')
    with open(os.path.join(OUT, name), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))
    print(name, sum(len(v) if hasattr(v, '__len__') else 1 for _, v in exports))


def level_key(r):
    """Sort key for an ability card: its level (1, 1.1 -> '1x', 2..9, 'M' = mastery last)."""
    v = r[5]
    s = str(v)
    if s == 'M':
        return (99, '', r[30])
    try:
        f = float(s)
    except ValueError:
        return (98, s, r[30])
    return (int(f), '' if f == int(f) else s, r[30])


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
    rows = load_rows(path)

    # --- classes and ability cards -------------------------------------------------------------------
    abil = [r for r in rows if r[0] == 'Character Ability' and r[46] in ABILITY_SOURCES]
    by_class = defaultdict(list)
    names = {}
    for r in abil:                                      # class names come from rows the fix table does not touch
        if r[30] not in CARD_FIX:
            names[str(r[17]).lower()] = (r[36], r[46])
    for r in abil:
        r = list(r)
        code = str(r[17]).lower()
        if r[30] in CARD_FIX:
            code, slug = CARD_FIX[r[30]]
            r[17], r[36], r[46] = code.upper(), names[code][0], names[code][1]
            r[30] = slug or r[30]
        by_class[code].append(r)
        names.setdefault(code, (r[36], r[46]))
    classes, cards = [], []
    for ci, code in enumerate(sorted(by_class), start=1):
        classes.append({'i': ci, 'code': code, 'name': CLASS_NAME_FIX.get(names[code][0], names[code][0]), 'src': names[code][1]})
        for n, r in enumerate(sorted(by_class[code], key=level_key), start=1):
            cards.append({'id': ci * 100 + n, 'cls': ci, 'slug': r[30], 'lv': 'M' if r[5] == 'M' else 'X' if num(r[5]) == 1.1 else num(r[5])})   # X = the level 1.1 cards, sorted between 1 and 2
    ini = load_initiative(sys.argv[3] if len(sys.argv) > 3 else DEFAULT_GHS_DECKS, classes, by_class)
    for c in cards:
        v = ini.get((classes[c['cls'] - 1]['code'], c['slug']))
        if v is not None:
            c['ini'] = v
    write_module('gh2_classes.js', 'Class index -> code, name and source edition. Card ids are class index * 100 + n.',
                 [('CLASSES', classes)])
    write_module('gh2_cards.js', 'Class ability cards: id, class index, slug, level, ini = initiative (only where known: the Secretariat '
                                 'data covers 12 of the 22 classes, tools/card-initiative.json adds more). Ids are stable only while the Card DB '
                                 'rows are unchanged: regenerate and diff before committing.', [('CARDS', cards)])

    # --- items ---------------------------------------------------------------------------------------
    items = []
    for r in rows:
        if r[0] == 'Items' and r[46] == 'gh2' and r[13] == 'gloomhaven2':
            items.append({'id': num(r[5]), 'slug': r[30], 'slot': ITEM_SLOT_FIX.get(num(r[5]), r[16]), 'kind': r[36], 'n': num(r[39])})
    write_module('gh2_items.js', 'Items: id (number, or "QM5" style for quartermaster items), slug, slot, kind '
                                 '(coin/solo/qm), n = copies.', [('ITEMS', items)])

    # --- scenarios and campaign stickers --------------------------------------------------------------
    flow = load_flow_edges(path)
    ghs = load_ghs_links(sys.argv[2] if len(sys.argv) > 2 else DEFAULT_GHS)
    scn, stickers = [], []
    for r in rows:
        if r[0] == 'Stickers' and r[46] == 'gh2':
            if r[8] is not None:
                n = num(r[8])
                g = ghs.get(n, {})
                row = {'n': n, 'name': g.get('name') or re.sub(r'^GH ', 'Gloomhaven ', r[30]), 'area': r[9]}
                if r[47]:
                    row['img'] = r[47]
                if g.get('init'):
                    row['init'] = 1
                if flow.get(n):
                    row['unl'] = flow[n]
                forced = [f for f in g.get('forced', []) if f in flow.get(n, [])]
                if forced:
                    row['forced'] = forced
                scn.append(row)
            else:
                sticker = {'slug': r[30], 'name': r[34], 'area': r[9]}
                if r[47]:
                    sticker['img'] = r[47]
                stickers.append(sticker)
    write_module('gh2_scenarios.js', "Scenarios (number, name, area, img = sticker artwork URL) and campaign stickers (same "
                                     "fields, keyed by slug instead of number). unl = scenarios it unlocks, read from the "
                                     "arrows of the group's own GH2 Flow chart in the workbook (the source of truth); init = "
                                     "available at the start and forced = forced links, both from Gloomhaven Secretariat's gh2e "
                                     "data (AGPL-3.0). Scenarios unlocked by events, reputation or personal quests may have no "
                                     "incoming link. A pair of scenarios that share one physical sticker (23/24, 25/26) share "
                                     "the same img URL.",
                 [('SCENARIOS', scn), ('STICKERS', stickers)])

    # --- events --------------------------------------------------------------------------------------
    def events(t, sub):
        out = []
        for r in rows:
            if r[0] == t and r[46] == 'gh2':
                opts = sum(1 for c in (36, 37, 38, 39) if r[c])
                out.append({'id': int(r[30].split('-')[1]), 'img': r[30], 'opts': opts})
        return out
    write_module('gh2_events.js', 'City and road event cards: number and image count (front + option faces, '
                                  'the sheet has up to four per card).',
                 [('CITY_EVENTS', events('City Events', 'city')), ('ROAD_EVENTS', events('Road Events', 'road'))])

    # --- battle goals (the Frosthaven set, used for every edition by the owner's decision) -------------------
    norm = lambda t: re.sub(r'[^a-z0-9]', '', str(t).lower())
    checks = {}
    if os.path.isfile(DEFAULT_GHS_BG):
        with open(DEFAULT_GHS_BG, encoding='utf-8') as f:
            for g in json.load(f):
                checks[norm(g['name'])] = (int(g['cardId']), g.get('checks', 1))
    texts = {}                                  # card id -> the card's text (Secretariat label file)
    if os.path.isfile(DEFAULT_GHS_BG_LABEL):
        with open(DEFAULT_GHS_BG_LABEL, encoding='utf-8') as f:
            texts = {int(k): v.get('text', '') for k, v in json.load(f).get('battleGoals', {}).items()}
    SLUG_FIX = {'pincusion': 'pincushion'}     # typo in the Card DB
    goals = []
    for r in rows:
        if r[0] == 'Battle Goals' and r[46] == 'fh':
            slug = SLUG_FIX.get(r[30], r[30])
            cid, chk = checks.get(norm(slug), (None, 1))
            goals.append({'id': cid, 'slug': slug, 'chk': chk, 't': texts.get(cid, '')})
    goals.sort(key=lambda g: (g['id'] is None, g['id'] or 0, g['slug']))
    write_module('battle_goals.js', 'Battle goal cards (the Frosthaven set, used for all editions): id = Gloomhaven '
                                    'Secretariat card id (null if unmatched), slug, chk = checkmarks awarded, t = the card text.',
                 [('BATTLE_GOALS', goals)])

    # --- personal quests and traits --------------------------------------------------------------------
    pq = [{'id': int(re.sub(r'\D', '', r[30])), 'slug': r[30]} for r in rows if r[0] == 'Personal Quests' and r[46] == 'gh2']
    traits = {}
    for r in rows:
        if r[0] == 'Character Traits' and r[46] in ('gh2', 'mp'):
            traits[r[36]] = [t for t in (r[39], r[40], r[41]) if t]
    write_module('gh2_quests.js', 'Personal quests and the three character traits per class.',
                 [('PERSONAL_QUESTS', pq), ('TRAITS', traits)])


main()
