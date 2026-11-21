import assert from 'node:assert/strict';
import { makeCanSee } from '../../scripts/los.js';
import { hexKey } from '../../scripts/hexState.js';
import { hexDistance, solveMove } from '../../scripts/monsterMove.js';

// A field of floor (cols 1..12, rows 0..9) with cells; `floorKnown` false leaves the void alone.
function field(cells = {}, only = null, floorKnown = true) {
  const floor = new Set();
  for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) if (!only || only(c, r)) floor.add(hexKey(c, r));
  return { floor, floorKnown, cells: new Map(Object.entries(cells)), figures: [], tilesWithoutMask: [], ignored: {} };
}
const wall = { blocked: true, blocksLos: true };
const at = (c, r) => ({ col: c, row: r });

export const tests = {
  'line of sight: open floor, every pair sees each other'() {
    const see = makeCanSee(field());
    for (const [a, b] of [[at(3, 3), at(9, 7)], [at(1, 0), at(12, 9)], [at(5, 5), at(5, 5)], [at(4, 4), at(4, 5)]]) assert.equal(see(a, b), true);
  },
  'line of sight: a wall hex in a straight line between two hexes blocks'() {
    const see = makeCanSee(field({ [hexKey(5, 4)]: wall }));
    assert.equal(see(at(5, 2), at(5, 6)), false);
    assert.equal(see(at(5, 6), at(5, 2)), false, 'symmetric');
  },
  'line of sight: a wall beside the line does not block, there is a free corner pair'() {
    const see = makeCanSee(field({ [hexKey(7, 4)]: wall }));
    assert.equal(see(at(5, 2), at(5, 6)), true);
  },
  'line of sight: an obstacle and a figure do not block, a closed door does'() {
    const obstacle = makeCanSee(field({ [hexKey(5, 4)]: { blocked: true } }));
    assert.equal(obstacle(at(5, 2), at(5, 6)), true);
    const door = makeCanSee(field({ [hexKey(5, 4)]: { blocked: true, blocksLos: true, door: 'closed' } }));
    assert.equal(door(at(5, 2), at(5, 6)), false);
    const open = makeCanSee(field({ [hexKey(5, 4)]: { door: 'open' } }));
    assert.equal(open(at(5, 2), at(5, 6)), true);
  },
  'line of sight: adjacent hexes always see each other, walls around them or not'() {
    const around = field({ [hexKey(6, 5)]: wall, [hexKey(6, 4)]: wall, [hexKey(5, 6)]: wall, [hexKey(4, 5)]: wall });
    assert.equal(makeCanSee(around)(at(5, 5), at(5, 4)), true);
  },
  'line of sight: the void blocks when the floor is known, not when it is unknown'() {
    const only = (c) => c <= 4 || c >= 8;                                         // columns 5 to 7 are void
    assert.equal(makeCanSee(field({}, only, true))(at(3, 4), at(10, 4)), false);
    assert.equal(makeCanSee(field({}, only, false))(at(3, 4), at(10, 4)), true);
  },
  'line of sight: a wall with a gap lets the line through the gap only'() {
    const cells = {}; for (let r = 0; r <= 9; r++) if (r !== 4) cells[hexKey(6, r)] = wall;
    const see = makeCanSee(field(cells));
    assert.equal(see(at(2, 4), at(10, 4)), true, 'through the gap');
    assert.equal(see(at(2, 0), at(10, 0)), false, 'against the wall');
  },
  'line of sight: symmetric on random walls'() {
    let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const cells = {};
    for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) if (rnd() < 0.25) cells[hexKey(c, r)] = wall;
    const see = makeCanSee(field(cells));
    for (let i = 0; i < 300; i++) {
      const a = at(1 + Math.floor(rnd() * 12), Math.floor(rnd() * 10)), b = at(1 + Math.floor(rnd() * 12), Math.floor(rnd() * 10));
      assert.equal(see(a, b), see(b, a), `${a.col},${a.row} ${b.col},${b.row}`);
      if (hexDistance(a.col, a.row, b.col, b.row) === 1) assert.equal(see(a, b), true, 'adjacent');
    }
  },
  'line of sight: the solver uses it, no sight means no focus'() {
    const hs = field(); hs.figures = [{ kind: 'monster', side: 'monsters', id: 1, col: 3, row: 5, role: null }, { kind: 'mercenary', side: 'characters', id: 1, col: 8, row: 5, role: null }];
    const r = solveMove(hs, { active: at(3, 5), move: 6, range: 0, canSee: () => false });
    assert.deepEqual([r.focuses.length, r.actions.map(a => [a.col, a.row, a.attack])], [0, [[3, 5, false]]]);
  },
};
