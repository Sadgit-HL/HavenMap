import assert from 'node:assert/strict';
import { buildHexState, cellAt, hexKey } from '../../scripts/hexState.js';
import { placeMask } from '../../scripts/tileMask.js';
import { GH2_TILE_MASKS } from '../../scripts/games/gh2_tile_masks.js';

const TILES = { 1: '01-A', 2: '07-A', 9: 'a frosthaven tile' };
const OVERLAYS = {
  10: { hexes: [], defaultRole: 'obstacle' }, 11: { hexes: ['S'], defaultRole: 'wall' }, 12: { hexes: [], defaultRole: 'trap' },
  13: { hexes: [], defaultRole: 'door' }, 14: { hexes: ['S'], defaultRole: 'corridor' }, 15: { hexes: [], defaultRole: 'scenario' },
  16: { hexes: [], defaultRole: 'difficult' }, 17: { hexes: [], defaultRole: 'hazardous' }, 18: { hexes: [], defaultRole: 'ice' },
};
const lookup = { tileTitle: id => TILES[id] ?? null, overlay: id => OVERLAYS[id] ?? null };
const keys = hexes => hexes.map(h => hexKey(h.col, h.row));

export const tests = {
  'hex state: the floor is the tile masks, turned and placed'() {
    const hs = buildHexState({ tiles: [{ id: 1, x: 5, y: 10, angle: 0 }, { id: 2, x: 20, y: 5, angle: 120 }] }, lookup);
    const expected = [...keys(placeMask(GH2_TILE_MASKS['01-A'], 5, 10, 0)), ...keys(placeMask(GH2_TILE_MASKS['07-A'], 20, 5, 120))];
    assert.deepEqual([...hs.floor].sort(), [...new Set(expected)].sort());
    assert.equal(hs.floorKnown, true);
  },
  'hex state: a tile without a mask makes the floor unknown'() {
    const hs = buildHexState({ tiles: [{ id: 1, x: 5, y: 10 }, { id: 9, x: 20, y: 5 }, { id: 77, x: 1, y: 1 }] }, lookup);
    assert.equal(hs.floorKnown, false);
    assert.deepEqual(hs.tilesWithoutMask, [{ id: 9, title: 'a frosthaven tile' }, { id: 77, title: null }]);
    assert.equal(hs.floor.size, 9, 'the tile with a mask still counts');
  },
  'hex state: obstacle blocks movement only, wall blocks line of sight too, over the whole footprint'() {
    const hs = buildHexState({ overlays: [{ id: 10, x: 5, y: 11 }, { id: 11, x: 8, y: 3 }] }, lookup);
    assert.deepEqual(cellAt(hs, 5, 11), { blocked: true });
    assert.deepEqual(cellAt(hs, 8, 3), { blocked: true, blocksLos: true });
    assert.deepEqual(cellAt(hs, 8, 4), { blocked: true, blocksLos: true }, 'second hex of the wall (S)');
    assert.deepEqual(cellAt(hs, 8, 5), {});
  },
  'hex state: traps, hazards, difficult and icy terrain keep their flags and stack on one hex'() {
    const o = (id) => ({ id, x: 6, y: 6 });
    const hs = buildHexState({ overlays: [o(12), o(16), o(17), o(18)] }, lookup);
    assert.deepEqual(cellAt(hs, 6, 6), { trap: true, difficult: true, hazardous: true, ice: true });
  },
  'hex state: a closed door blocks, an open door is floor, both are on the floor'() {
    const hs = buildHexState({ overlays: [{ id: 13, x: 4, y: 4, role: 'door' }, { id: 13, x: 9, y: 9, role: 'door', opened: true }] }, lookup);
    assert.deepEqual(cellAt(hs, 4, 4), { door: 'closed', blocked: true, blocksLos: true });
    assert.deepEqual(cellAt(hs, 9, 9), { door: 'open' });
    assert.ok(hs.floor.has('4,4') && hs.floor.has('9,9'));
  },
  'hex state: a corridor overlay adds floor, a sticker adds nothing'() {
    const hs = buildHexState({ overlays: [{ id: 14, x: 30, y: 30 }, { id: 15, x: 2, y: 2 }] }, lookup);
    assert.deepEqual([...hs.floor].sort(), ['30,30', '30,31']);
    assert.equal(hs.cells.size, 0);
    assert.deepEqual(hs.ignored, { scenario: 1 });
  },
  'hex state: the role of the placed object wins over the default role'() {
    const hs = buildHexState({ overlays: [{ id: 10, x: 3, y: 3, role: 'trap' }] }, lookup);
    assert.deepEqual(cellAt(hs, 3, 3), { trap: true });
  },
  'hex state: figures by side'() {
    const hs = buildHexState({ monsters: [{ id: 5, x: 3, y: 4, role: 'elite' }], mercenaries: [{ id: 2, x: 4, y: 4 }], summons: [{ id: 7, x: 4, y: 5 }] }, lookup);
    assert.deepEqual(hs.figures.map(f => [f.kind, f.side, f.col, f.row, f.role]),
      [['monster', 'monsters', 3, 4, 'elite'], ['mercenary', 'characters', 4, 4, null], ['summon', 'characters', 4, 5, null]]);
  },
  'hex state: a character name is kept on the figure, a missing name is null'() {
    const hs = buildHexState({ mercenaries: [{ id: 2, x: 4, y: 4, name: 'Mira' }, { id: 3, x: 5, y: 4 }] }, lookup);
    assert.deepEqual(hs.figures.map(f => f.name), ['Mira', null]);
  },
  'hex state: an empty or missing state is an empty hex state'() {
    for (const s of [undefined, {}]) {
      const hs = buildHexState(s, lookup);
      assert.deepEqual([hs.floor.size, hs.cells.size, hs.figures.length, hs.floorKnown], [0, 0, 0, true]);
    }
  },
};

// ---- the borders of tiles ----
import { edgeKey, neighbors as gridNeighbors } from '../../scripts/hexGrid.js';
import { solveMove } from '../../scripts/monsterMove.js';
import { makeCanSee } from '../../scripts/los.js';

const twoTiles = (overlays = [], extra = {}) => buildHexState({ tiles: [{ id: 1, x: 5, y: 2, angle: 0 }, { id: 1, x: 7, y: 2, angle: 0 }], overlays, ...extra }, lookup);
const edgesBetweenTiles = hs => { const a = new Set(); for (const w of hs.walls) { const [p, q] = w.split('|'); a.add(p); a.add(q); } return a; };

tests['hex state: neighbouring tiles are separated by walls on the border, none inside a tile'] = function () {
  const one = buildHexState({ tiles: [{ id: 1, x: 5, y: 2, angle: 0 }] }, lookup);
  assert.equal(one.walls.size, 0, 'one tile has no inner walls');
  const hs = twoTiles();
  assert.ok(hs.walls.size > 0, 'two tiles side by side');
  for (const w of hs.walls) {
    const [p, q] = w.split('|'), [pc] = p.split(',').map(Number), [qc] = q.split(',').map(Number);
    assert.ok(hs.floor.has(p) && hs.floor.has(q), 'both sides are floor');
    assert.ok(Math.abs(pc - qc) <= 1);
  }
  for (const k of hs.floor) for (const n of gridNeighbors(...k.split(',').map(Number))) {
    const nk = hexKey(n.col, n.row);
    if (hs.floor.has(nk) && hs.walls.has(edgeKey(k, nk))) assert.ok(edgesBetweenTiles(hs).has(k));
  }
};
tests['hex state: a door or a corridor between tiles opens the border, tiles that overlap have no wall where they overlap'] = function () {
  const closed = twoTiles(), openDoor = twoTiles([{ id: 13, x: 6, y: 3, role: 'door', opened: true }]), corridor = twoTiles([{ id: 14, x: 6, y: 3 }]);
  assert.ok(openDoor.walls.size < closed.walls.size, 'an open door joins the hexes it is on');
  assert.ok(corridor.walls.size < closed.walls.size, 'so does a corridor');
  const overlap = buildHexState({ tiles: [{ id: 1, x: 5, y: 2, angle: 0 }, { id: 1, x: 5, y: 3, angle: 0 }] }, lookup);
  for (const w of overlap.walls) { const [p, q] = w.split('|'); assert.ok(!(overlap.floor.has(p) && p === q)); }
};
tests['hex state: the solver does not cross the border of two tiles, it does through an open door'] = function () {
  const run = hs => solveMove({ ...hs, figures: [{ kind: 'monster', side: 'monsters', id: 1, col: 5, row: 3, role: null }, { kind: 'mercenary', side: 'characters', id: 1, col: 8, row: 3, role: null }] }, { active: { col: 5, row: 3 }, move: 8, range: 0 });
  const blocked = run(twoTiles());
  assert.deepEqual([blocked.focuses.length, blocked.actions[0].attack], [0, false], 'no way across, the monster stays');
  const through = run(twoTiles([{ id: 13, x: 6, y: 3, role: 'door', opened: true }]));
  assert.equal(through.canAttackFocus, true);
  assert.equal(through.actions[0].attack, true);
};
tests['hex state: sight does not cross the border of two tiles, nor does a range'] = function () {
  const see = makeCanSee(twoTiles());
  assert.equal(see({ col: 6, row: 3 }, { col: 7, row: 3 }), false, 'adjacent across the wall');
  assert.equal(see({ col: 5, row: 3 }, { col: 8, row: 3 }), false);
  const hs = twoTiles();
  const r = solveMove({ ...hs, figures: [{ kind: 'monster', side: 'monsters', id: 1, col: 5, row: 3, role: null }, { kind: 'mercenary', side: 'characters', id: 1, col: 8, row: 3, role: null }] }, { active: { col: 5, row: 3 }, move: 8, range: 6 });
  assert.equal(r.focuses.length, 0, 'a ranged attack does not reach across either');
};

// ---- ice terrain objects of the Gloomhaven game ----
import gh from '../../scripts/games/gh.js';

tests['hex state: the Gloomhaven game has ice terrain objects, the solver slides over them'] = function () {
  const rows = gh.overlays.filter(o => o.defaultRole === 'ice');
  assert.deepEqual(rows.map(o => [o.id, o.title, o.game, (o.hexes ?? []).length]), [[70, 'ice', 'fh', 0], [71, 'ice 2', 'fh', 1]]);
  const real = { tileTitle: () => null, overlay: id => gh.overlays.find(o => o.id === id) ?? null };
  const hs = buildHexState({ overlays: [{ id: 70, x: 6, y: 4 }, { id: 71, x: 8, y: 2 }] }, real);
  assert.deepEqual(hs.cells.get('6,4'), { ice: true });
  assert.ok(hs.cells.get('8,2').ice && hs.cells.get('8,3').ice, 'the two hex piece');
  // a strip of ice in a corridor: a walking monster slides over it in one point
  const strip = buildHexState({ overlays: [3, 4, 5].map(r => ({ id: 70, x: 4, y: r })) }, real);
  const floor = new Set(); for (let r = 0; r <= 9; r++) floor.add(hexKey(4, r));
  const w = { ...strip, floor, floorKnown: true, figures: [{ kind: 'monster', side: 'monsters', id: 1, col: 4, row: 2, role: null }, { kind: 'mercenary', side: 'characters', id: 1, col: 4, row: 9, role: null }] };
  const r = solveMove(w, { active: { col: 4, row: 2 }, move: 1, range: 0 });
  assert.deepEqual(r.actions.map(a => [a.col, a.row]), [[4, 6]], 'one step onto the ice at row 3, on over rows 4 and 5 to row 6');
};
