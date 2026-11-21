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
  'hex state: an empty or missing state is an empty hex state'() {
    for (const s of [undefined, {}]) {
      const hs = buildHexState(s, lookup);
      assert.deepEqual([hs.floor.size, hs.cells.size, hs.figures.length, hs.floorKnown], [0, 0, 0, true]);
    }
  },
};
