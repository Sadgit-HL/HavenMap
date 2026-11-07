"""Import the current campaign state from the group's WHTracker.xlsx into a campaign record (docs/campaign-schema.md
section 4). Stage 1: campaign-level data. Characters are not imported yet.

The output is the group's real campaign (player names, progress), so it is written OUTSIDE the repo by default
(asset-backups/campaign-import.json) and must not be committed.

Sheets read ("GH2 Campaign", "GH2 Flow", "GH2 Events", "GH2 Decks", "Card DB"); layouts were worked out from the sheet
and are documented next to each reader. Cell coordinates are 0-based (row, column) as openpyxl gives them minus 1.

Usage:  python -I tools/import-campaign-state.py [WHTracker.xlsx] [output.json]
"""
import json
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(os.path.dirname(ROOT), 'asset-backups')
GAMES = os.path.join(ROOT, 'scripts', 'games')
SEATS = ['Guido', 'Mad', 'Kevin', 'Jeroen']          # voting columns on the events sheet (checked below)


def norm(t):
    return re.sub(r'[^a-z0-9]', '', str(t).lower())


def num(v):
    if isinstance(v, float) and v == int(v):
        return int(v)
    if isinstance(v, str) and re.fullmatch(r'\d+(\.0)?', v.strip()):
        return int(float(v))
    return v


def static(name, export):
    """Rows of a generated static table (scripts/games/<name>.js): the one-JSON-object-per-line arrays."""
    out, on = [], False
    with open(os.path.join(GAMES, name), encoding='utf-8') as f:
        for line in f:
            if line.startswith(f'export const {export} = ['):
                on = True
            elif on and line.startswith('];'):
                break
            elif on:
                out.append(json.loads(line.strip().rstrip(',')))
    return out


class Sheet:
    """Random access to one worksheet by 0-based (row, col)."""
    def __init__(self, ws):
        self.rows = [tuple(r) for r in ws.iter_rows(values_only=True)]

    def __call__(self, r, c):
        if 0 <= r < len(self.rows) and 0 <= c < len(self.rows[r]):
            v = self.rows[r][c]
            return None if v == '' else v
        return None

    def ticks(self, r, c0, c1):
        return [c for c in range(c0, c1 + 1) if self(r, c) is True]


# --- campaign sheet ------------------------------------------------------------------------------------------

def read_campaign(sh):
    out = {'party': {'insp': num(sh(1, 13)), 'avg': num(sh(2, 20)), 'diffName': sh(3, 16), 'diff': num(sh(3, 20))}}

    # reputation: header row 6 holds the value (20 ... -10) over columns 7..37; a ticked box is the current value
    rep = {}
    for r in (7, 8, 9):
        name = sh(r, 3)
        cols = sh.ticks(r, 7, 37)
        rep[name] = num(sh(6, cols[0])) if cols else None
    out['rep'] = rep

    # prosperity: boxes in rows 18 and 21, one tick per checkmark
    out['pros'] = len(sh.ticks(18, 3, 60)) + len(sh.ticks(21, 3, 60))

    # imbuement: the two 10-column box grids on rows 24..33 (left: columns 4..13, right: 21..30), kept as raw "row:col"
    imb = []
    for r in range(24, 34):
        for c in list(range(4, 14)) + list(range(21, 31)):
            if sh(r, c) is True:
                imb.append(f'{r}:{c}')
    out['imb'] = imb

    # campaign stickers: checkbox then label, three columns (3/4, 15/16, 26/27), rows 36..48
    stk = []
    for r in range(36, 49):
        for c in (3, 15, 26):
            if sh(r, c) is True and sh(r, c + 1):
                stk.append(sh(r, c + 1))
    out['stk'] = stk

    # unlocked classes: five checkbox/label pairs per row, rows 52..56
    cls = []
    for r in range(52, 57):
        for c in (3, 8, 13, 18, 24):
            if sh(r, c) is True and sh(r, c + 1):
                cls.append(sh(r, c + 1).strip())
    out['cls'] = cls

    # enhancements (columns 3 class, 7 card, 13 top, 18 bottom) and retirements (25 class, 29 player, 32 name, 36 level,
    # 38 perks, 40 masteries, 42 comments) share the rows below the header at row 60
    enh, ret = [], []
    for r in range(61, len(sh.rows)):
        if sh(r, 3) and sh(r, 7):
            enh.append({'cls': str(sh(r, 3)).strip(), 'card': sh(r, 7), 'top': sh(r, 13), 'bottom': sh(r, 18)})
        if sh(r, 25):
            ret.append({'cls': sh(r, 25), 'player': sh(r, 29), 'name': sh(r, 32), 'lv': num(sh(r, 36)),
                        'perks': num(sh(r, 38)), 'masteries': num(sh(r, 40)), 'note': sh(r, 42)})
    out['enh'] = enh
    out['retired'] = ret
    return out


# --- scenario flow -------------------------------------------------------------------------------------------

STATUS = {'Locked': 0, 'Unlocked': 1, 'Completed': 2, 'Locked Out': 3}


def read_scenarios(sh):
    """Per scenario box (9 columns x 13 rows from (3, 0)): number at the top-left cell, status 8 rows down, then
    'L:' level and 'P:' party size, 'Chests:' numbers and 'Date:'."""
    scn = {}
    width = (max(len(r) for r in sh.rows) + 8) // 9
    for br in range(12):
        for bc in range(width):
            r0, c0 = 3 + 13 * br, 9 * bc
            n = sh(r0, c0)
            if n in (None, ''):
                continue
            st = STATUS.get(sh(r0 + 8, c0))
            if st is None:
                continue
            row = {'s': st}
            lv, party = num(sh(r0 + 9, c0 + 1)), num(sh(r0 + 9, c0 + 5))
            if st == 2:
                row['l'], row['p'] = lv, party
                ch = [num(sh(r0 + 10, c)) for c in range(c0 + 1, c0 + 9) if isinstance(sh(r0 + 10, c), (int, float))]
                if ch:
                    row['ch'] = ch
                d = next((sh(r0 + 11, c) for c in range(c0 + 1, c0 + 9) if sh(r0 + 11, c)), None)
                if d:
                    row['d'] = d.date().isoformat() if hasattr(d, 'date') else str(d)
            scn[str(num(n))] = row
    return scn


# --- events --------------------------------------------------------------------------------------------------

def read_events(sh):
    """Two list blocks from row 13: city (# col 27, Out 29, Bottom 30, Top 32) and road (# col 34, Out 36, Bottom 37,
    Top 39). A box ticked under Out/Bottom/Top places the card there."""
    def block(cn, cout, cbot, ctop):
        out, bottom, top = [], [], []
        for r in range(13, len(sh.rows)):
            n = sh(r, cn)
            if not isinstance(n, (int, float)):
                continue
            n = num(n)
            if sh(r, cout) is True:
                out.append(n)
            if sh(r, cbot) is True:
                bottom.append(n)
            if sh(r, ctop) is True:
                top.append(n)
        return {'out': out, 'bottom': bottom, 'top': top}
    return {'city': block(27, 29, 30, 32), 'road': block(34, 36, 37, 39)}


# --- decks ---------------------------------------------------------------------------------------------------

def read_decks(sh):
    """Battle goals: tick col 0, number col 1, name col 2 (rows 7..). Treasure index: tick col 27, number col 28.
    Med packs: tick col 11, number col 12 (rows 20..). Ticked means drawn / claimed."""
    goals = {norm(g['slug']): g['id'] for g in static('battle_goals.js', 'BATTLE_GOALS')}
    bg, tre, mp, unmatched = [], [], [], []
    for r in range(7, len(sh.rows)):
        if sh(r, 0) is True and sh(r, 2):
            gid = goals.get(norm(sh(r, 2)))
            (bg if gid else unmatched).append(gid or sh(r, 2))
        if sh(r, 27) is True and isinstance(sh(r, 28), (int, float)):
            tre.append(num(sh(r, 28)))
        if sh(r, 11) is True and isinstance(sh(r, 12), (int, float)):
            mp.append(num(sh(r, 12)))
    return {'bg': bg, 'tre': tre, 'mp': mp}, unmatched


# --- items ---------------------------------------------------------------------------------------------------

def read_items(wb):
    """From the Card DB (see docs/HANDOVER.md section 14): column 8 = unlocked, column 39 = total copies, column 40 =
    copies left in the shop; copies in use by players = total - left."""
    ws = wb['Card DB']
    unl, taken = [], {}
    for r in ws.iter_rows(values_only=True):
        r = tuple(r) + (None,) * (60 - len(r))
        if r[0] == 'Items' and r[46] == 'gh2' and r[13] == 'gloomhaven2':
            iid = num(r[5])
            if r[8] is True:
                unl.append(iid)
                t = (num(r[39]) or 0) - (num(r[40]) or 0)
                if t > 0:
                    taken[str(iid)] = t
    return {'unl': unl, 'taken': taken}


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ASSETS, 'WHTracker.xlsx')
    dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ASSETS, 'campaign-import.json')
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    camp = read_campaign(Sheet(wb['GH2 Campaign']))
    decks, unmatched = read_decks(Sheet(wb['GH2 Decks']))
    rec = {'v': 1, 'ver': 1, 'name': '', 'players': [{'seat': i, 'name': n} for i, n in enumerate(SEATS)],
           'party': camp['party'], 'rep': camp['rep'], 'pros': camp['pros'], 'imb': camp['imb'], 'stk': camp['stk'],
           'cls': camp['cls'], 'scn': read_scenarios(Sheet(wb['GH2 Flow'])), 'chars': [],
           'items': read_items(wb), 'events': read_events(Sheet(wb['GH2 Events'])), 'decks': decks,
           'enh': camp['enh'], 'retired': camp['retired']}
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump(rec, f, ensure_ascii=False, indent=1)
    s = rec['scn']
    print('written', dest)
    print('party', rec['party'], 'rep', rec['rep'], 'pros', rec['pros'], 'imb ticks', len(rec['imb']))
    print('scenarios', len(s), {k: sum(1 for v in s.values() if v['s'] == i) for k, i in STATUS.items()})
    print('stickers', rec['stk'])
    print('classes', len(rec['cls']), 'enh', len(rec['enh']), 'retired', len(rec['retired']))
    print('items unlocked', len(rec['items']['unl']), 'with copies out', len(rec['items']['taken']))
    print('events', {k: {a: len(b) for a, b in v.items()} for k, v in rec['events'].items()})
    print('decks', {k: len(v) for k, v in decks.items()}, 'unmatched battle goals', unmatched)


main()
