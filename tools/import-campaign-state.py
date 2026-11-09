"""Import the current campaign state from the group's WHTracker.xlsx into a campaign record (docs/campaign-schema.md
section 4). Stage 1: campaign-level data. Stage 2: the character sheets (Class: in cell R2C17).

The output is the group's real campaign (player names, progress), so it is written OUTSIDE the repo by default
(asset-backups/campaign-import.json) and must not be committed.

Sheets read ("GH2 Campaign", "GH2 Events", "GH2 Decks", "Card DB"); layouts were worked out from the sheet and are
documented next to each reader. Cell coordinates are 0-based (row, column) as openpyxl gives them minus 1.
Scenario unlock/completion state is not imported here: it is tracked and edited directly in the campaign app.

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


# --- events --------------------------------------------------------------------------------------------------

def read_events(sh):
    """Two list blocks from row 13: city (# col 27, Out 29, Bottom 30, Top 32) and road (# col 34, Out 36, Bottom 37,
    Top 39). A box ticked under Out/Bottom/Top places the card there.

    The sheet lists only the cards that are in play (city 1 to 20 and the ones added later, road 1 to 20 and added ones).
    Every card of the game that is NOT listed has not been added to the deck yet: it is imported as locked. A listed card
    that is in no pile is part of the deck with no known position (the sheet keeps no order)."""
    notes, marks = {}, {}

    def block(cn, cout, cbot, ctop, table, kind):
        out, bottom, top, listed = [], [], [], set()
        for r in range(13, len(sh.rows)):
            n = sh(r, cn)
            if not isinstance(n, (int, float)):
                continue
            n = num(n)
            listed.add(n)
            if sh(r, cout) is True:
                out.append(n)
            if sh(r, cbot) is True:
                bottom.append(n)
            if sh(r, ctop) is True:
                top.append(n)
            for c in (cout, cbot, ctop):                      # a text typed into a tick box is a note on the card
                v = sh(r, c)
                if isinstance(v, str) and v.strip():
                    notes[f'{kind}:{n}'] = v.strip()
                    m = re.search(r'option\s*(\d+)\s*marked', v, re.I)
                    if m:                                     # "option 2 marked" = the second box of the card is ticked
                        marks.setdefault(f'{kind}:{n}', []).append(int(m.group(1)) - 1)
        locked = [e['id'] for e in static('gh2_events.js', table) if e['id'] not in listed]
        return {'top': top, 'bottom': bottom, 'out': out, 'locked': locked}
    city, road = block(27, 29, 30, 32, 'CITY_EVENTS', 'city'), block(34, 36, 37, 39, 'ROAD_EVENTS', 'road')
    return {'city': city, 'road': road, 'marks': marks, 'notes': notes}


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


# --- characters ----------------------------------------------------------------------------------------------

def read_character(sh, sheet_name, cls_index, cards_by_cls, items_by_slug, cid):
    """One character sheet. Layout (0-based row, col):
      header     (1,18) class, (2,18) level, (3,18) name, (1,28) XP (27 on some sheets), (2,28) gold, (3,28) inherited,
                 (1..3,40) the three traits, (1..2,45) extra marks (kept raw)
      modifier   (6,0) card count, (6,2) GeekRoller code, labels on row 6 from col 4 (4..23 then every second column
                 25..59), a tick on row 7 under each label. A tick means the card is OUT of the deck (drawn or unused:
                 the count in (6,0) equals the unticked labels). Faces are kept as raw label text.
      abilities  (11,4) hand size; rows 12.. column 0 = card slug, ticks in columns 7 / 9 / 11 = discard / active / lost
                 (the sheet labels only 'active'; the order follows campaign-schema.md 2.2). The first block of named
                 rows up to the first gap is the selected deck, a second block from row 32 the other owned cards.
      items      from row 45 (header at 43): column 0 item name, ticks in columns 6 / 7 / 9 (meaning not confirmed,
                 kept raw as `st`)."""
    cls_name = sh(1, 18)
    ci = cls_index.get(norm(cls_name))
    out = {'id': cid, 'sheet': sheet_name, 'cls': cls_name, 'name': sh(3, 18), 'lv': num(sh(2, 18)),
           'xp': next((num(sh(1, c)) for c in (28, 27) if isinstance(sh(1, c), (int, float))), None),
           'gold': num(sh(2, 28)), 'inh': num(sh(3, 28)),
           'traits': [sh(r, 40) for r in (1, 2, 3) if sh(r, 40)],
           'extra': [sh(r, 45) for r in (1, 2) if sh(r, 45)]}
    unmatched = []

    faces = []
    for c in list(range(4, 24)) + list(range(25, 60, 2)):
        if sh(6, c) not in (None, ''):
            faces.append({'f': str(sh(6, c)).strip(), 'out': sh(7, c) is True})
    out['am'] = {'n': num(sh(6, 0)), 'code': sh(6, 2), 'faces': faces}

    slugs = cards_by_cls.get(ci, {})
    deck, disc, act, lost, bench = [], [], [], [], []
    for r in range(12, 42):
        slug = sh(r, 0)
        if not slug:
            continue
        cid_ = slugs.get(norm(slug))
        if cid_ is None:
            unmatched.append(f'card {slug}')
            continue
        (deck if r < 32 else bench).append(cid_)
        if r < 32:
            if sh(r, 7) is True:
                disc.append(cid_)
            if sh(r, 9) is True:
                act.append(cid_)
            if sh(r, 11) is True:
                lost.append(cid_)
    out.update({'hand': num(sh(11, 4)), 'deck': deck, 'disc': disc, 'act': act, 'lost': lost, 'bench': bench})

    items = []
    for r in range(45, 61):
        name = sh(r, 0)
        if not name:
            continue
        iid = items_by_slug.get(norm(name))
        if iid is None:
            unmatched.append(f'item {name}')
            continue
        st = [sh(r, c) is True for c in (6, 7, 9)]
        items.append({'id': iid, 'st': st})
    out['items'] = items
    return out, unmatched


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ASSETS, 'WHTracker.xlsx')
    dest = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ASSETS, 'campaign-import.json')
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    cls_index = {norm(c['name']): c['i'] for c in static('gh2_classes.js', 'CLASSES')}
    cards_by_cls = {}
    for c in static('gh2_cards.js', 'CARDS'):
        cards_by_cls.setdefault(c['cls'], {})[norm(c['slug'])] = c['id']
    items_by_slug = {norm(i['slug']): i['id'] for i in static('gh2_items.js', 'ITEMS')}
    chars, char_unmatched = [], []
    for ws in wb.worksheets:
        sh = Sheet(ws)
        if sh(1, 16) == 'Class:':
            ch, un = read_character(sh, ws.title, cls_index, cards_by_cls, items_by_slug, f'c{len(chars) + 1}')
            chars.append(ch)
            char_unmatched += [f'{ws.title}: {u}' for u in un]
    camp = read_campaign(Sheet(wb['GH2 Campaign']))
    decks, unmatched = read_decks(Sheet(wb['GH2 Decks']))
    rec = {'v': 1, 'ver': 1, 'name': '', 'players': [{'seat': i, 'name': n} for i, n in enumerate(SEATS)],
           'party': camp['party'], 'rep': camp['rep'], 'pros': camp['pros'], 'imb': camp['imb'], 'stk': camp['stk'],
           'cls': camp['cls'], 'chars': chars,
           'items': read_items(wb), 'events': read_events(Sheet(wb['GH2 Events'])), 'decks': decks,
           'enh': camp['enh'], 'retired': camp['retired']}
    with open(dest, 'w', encoding='utf-8') as f:
        json.dump(rec, f, ensure_ascii=False, indent=1)
    print('written', dest)
    print('party', rec['party'], 'rep', rec['rep'], 'pros', rec['pros'], 'imb ticks', len(rec['imb']))
    print('stickers', rec['stk'])
    print('classes', len(rec['cls']), 'enh', len(rec['enh']), 'retired', len(rec['retired']))
    print('items unlocked', len(rec['items']['unl']), 'with copies out', len(rec['items']['taken']))
    print('events', {k: {a: len(b) for a, b in v.items()} for k, v in rec['events'].items() if k in ('city', 'road')},
          'marks', rec['events']['marks'], 'notes', rec['events']['notes'])
    for c in chars:
        print(c['sheet'], c['cls'], 'lv', c['lv'], 'xp', c['xp'], 'gold', c['gold'], 'hand', c['hand'], 'deck', len(c['deck']),
              'disc', len(c['disc']), 'act', len(c['act']), 'lost', len(c['lost']), 'bench', len(c['bench']),
              'items', len(c['items']), 'faces', len(c['am']['faces']), 'traits', c['traits'])
    print('unmatched', char_unmatched)
    print('decks', {k: len(v) for k, v in decks.items()}, 'unmatched battle goals', unmatched)


main()
