import assert from 'node:assert/strict';
import { solveMove, neighbors, hexDistance } from '../../scripts/monsterMove.js';
import { hexKey } from '../../scripts/hexState.js';

// An open field of floor, cols 1..12, rows 0..9; `figs` are [side, col, row]; `only(col, row)` limits the floor.
function field(figs = [], cells = {}, only = null) {
  const floor = new Set();
  for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) if (!only || only(c, r)) floor.add(hexKey(c, r));
  return {
    floor, floorKnown: true, tilesWithoutMask: [], ignored: {},
    cells: new Map(Object.entries(cells)),
    figures: figs.map(([side, col, row]) => ({ kind: side === 'monsters' ? 'monster' : 'mercenary', side, id: 1, col, row, role: null })),
  };
}
const M = (c, r) => ['monsters', c, r], C = (c, r) => ['characters', c, r];
const dist = (a, b) => hexDistance(a.col, a.row, b.col, b.row);
const run = (hs, active, o = {}) => solveMove(hs, { active, ...o });

export const tests = {
  'monster move: melee in the open, ends next to the focus by the shortest way'() {
    const hs = field([M(3, 5), C(8, 5)]), me = { col: 3, row: 5 }, ch = { col: 8, row: 5 };
    const r = run(hs, me, { move: 6, range: 0 });
    assert.equal(r.canAttackFocus, true);
    assert.deepEqual(r.focuses.map(f => [f.col, f.row]), [[8, 5]]);
    const best = Math.min(...neighbors(8, 5).map(n => dist(me, n)));
    assert.ok(r.actions.length >= 1);
    for (const a of r.actions) { assert.equal(dist(a, ch), 1); assert.equal(dist(a, me), best); assert.equal(a.attack, true); }
  },
  'monster move: out of reach, moves as far towards the attack hex as it can'() {
    const hs = field([M(2, 5), C(10, 5)]), me = { col: 2, row: 5 }, ch = { col: 10, row: 5 };
    const r = run(hs, me, { move: 2, range: 0 });
    assert.equal(r.canAttackFocus, false);
    const reach = [];
    for (let c = 1; c <= 12; c++) for (let rr = 0; rr <= 9; rr++) if (dist(me, { col: c, row: rr }) <= 2) reach.push({ col: c, row: rr });
    const closest = Math.min(...reach.map(h => dist(h, ch)));
    assert.ok(r.actions.length >= 1);
    for (const a of r.actions) { assert.equal(dist(a, me), 2); assert.equal(dist(a, ch), closest); assert.equal(a.attack, false); assert.ok(a.destinations.length >= 1); }
  },
  'monster move: focus ties go to the initiative, equal initiatives stay tied'() {
    const hs = field([M(6, 5), C(6, 2), C(6, 8)]), me = { col: 6, row: 5 };
    assert.deepEqual(run(hs, me, { move: 6, range: 0, initiatives: { '6,2': 30, '6,8': 10 } }).focuses.map(f => f.row), [8]);
    assert.deepEqual(run(hs, me, { move: 6, range: 0, initiatives: { '6,2': 10, '6,8': 30 } }).focuses.map(f => f.row), [2]);
    assert.deepEqual(run(hs, me, { move: 6, range: 0, initiatives: { '6,2': 10, '6,8': 10 } }).focuses.map(f => f.row).sort(), [2, 8]);
  },
  'monster move: a character that cannot be reached is not the focus'() {
    const wall = {}; for (let r = 0; r <= 9; r++) wall[hexKey(4, r)] = { blocked: true, blocksLos: true };
    const hs = field([M(2, 5), C(6, 5), C(1, 0)], wall), r = run(hs, { col: 2, row: 5 }, { move: 4, range: 0 });
    assert.deepEqual(r.focuses.map(f => [f.col, f.row]), [[1, 0]], 'the near one behind the wall is out, the far one on this side is in');
  },
  'monster move: fewer traps come before a shorter way'() {
    const cells = {}; for (const n of neighbors(3, 2)) cells[hexKey(n.col, n.row)] = { trap: true };
    const hs = field([M(3, 5), C(3, 2), C(9, 5)], cells), r = run(hs, { col: 3, row: 5 }, { move: 6, range: 0 });
    assert.deepEqual(r.focuses.map(f => [f.col, f.row]), [[9, 5]], 'the near character is ringed by traps, the far one is free');
    const flying = run(hs, { col: 3, row: 5 }, { move: 6, range: 0, flying: true });
    assert.deepEqual(flying.focuses.map(f => [f.col, f.row]), [[3, 2]], 'flying ignores traps');
  },
  'monster move: difficult terrain costs one more point, not for flying'() {
    const cells = {};
    for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) cells[hexKey(c, r)] = { difficult: true };
    const hs = field([M(2, 5), C(2, 1)], cells), me = { col: 2, row: 5 };         // 4 hexes away: 3 steps to the hex next to it, 6 points
    assert.equal(run(hs, me, { move: 5, range: 0 }).canAttackFocus, false);
    assert.equal(run(hs, me, { move: 6, range: 0 }).canAttackFocus, true);
    assert.equal(run(hs, me, { move: 3, range: 0, flying: true }).canAttackFocus, true);
  },
  'monster move: a ranged attack stops at range, away from the target when it can'() {
    const hs = field([M(3, 5), C(8, 5)]), me = { col: 3, row: 5 }, ch = { col: 8, row: 5 };
    const r = run(hs, me, { move: 6, range: 3 });
    assert.equal(r.canAttackFocus, true);
    for (const a of r.actions) { assert.equal(dist(a, ch), 3, 'in range, the shortest way'); assert.equal(dist(a, me), 2); }
  },
  'monster move: a ranged monster next to a target steps away, unless it is muddled'() {
    const hs = field([M(4, 5), C(5, 5)]), me = { col: 4, row: 5 }, ch = { col: 5, row: 5 };
    const r = run(hs, me, { move: 3, range: 3 });
    assert.ok(r.actions.length >= 1);
    for (const a of r.actions) assert.notEqual(dist(a, ch), 1, 'no disadvantage');
    const muddled = run(hs, me, { move: 3, range: 3, muddled: true });
    assert.deepEqual(muddled.actions.map(a => [a.col, a.row]), [[4, 5]], 'muddled: no reason to move');
  },
  'monster move: no characters, the monster stays'() {
    const r = run(field([M(3, 5)]), { col: 3, row: 5 }, { move: 4, range: 0 });
    assert.deepEqual([r.focuses, r.actions.map(a => [a.col, a.row, a.attack])], [[], [[3, 5, false]]]);
  },
  'monster move: no end hex on a figure'() {
    const hs = field([M(5, 5), M(6, 5), C(9, 5), C(9, 6)]), r = run(hs, { col: 5, row: 5 }, { move: 6, range: 0 });
    for (const a of r.actions) assert.ok(!hs.figures.some(f => f.col === a.col && f.row === a.row && !(f.col === 5 && f.row === 5)));
  },
  'monster move: movement types in a one hex wide corridor with an obstacle, a wall and an enemy'() {
    const corridor = (c) => c === 4;
    const hsObs = field([M(4, 8), C(4, 2)], { [hexKey(4, 5)]: { blocked: true } }, corridor);
    const me = { col: 4, row: 8 };
    assert.deepEqual(run(hsObs, me, { move: 6, range: 0 }).actions.map(a => [a.col, a.row, a.attack]), [[4, 8, false]], 'walking: blocked, stays');
    for (const type of [{ flying: true }, { jumping: true }]) {
      const r = run(hsObs, me, { move: 5, range: 0, ...type });
      assert.deepEqual(r.actions.map(a => [a.col, a.row, a.attack]), [[4, 3, true]], JSON.stringify(type));
    }
    const hsWall = field([M(4, 8), C(4, 2)], { [hexKey(4, 5)]: { blocked: true, blocksLos: true } }, corridor);
    assert.equal(run(hsWall, me, { move: 6, range: 0, flying: true }).actions[0].attack, false, 'a wall stops flying');
    assert.equal(run(hsWall, me, { move: 6, range: 0, jumping: true }).actions[0].attack, false, 'and jumping');
    assert.equal(run(hsWall, me, { move: 6, range: 0, teleport: true }).actions[0].attack, true, 'teleport goes through walls');
    const hsEnemy = field([M(4, 8), C(4, 5), C(4, 2)], {}, corridor);
    assert.deepEqual(run(hsEnemy, me, { move: 6, range: 0 }).focuses.map(f => f.row), [5], 'an enemy in the way is the focus, the one behind is out of reach');
  },
  'monster move: the void is not floor when the floor is known'() {
    const hs = field([M(2, 5), C(6, 5)], {}, (c) => c <= 3 || c >= 6);               // columns 4 and 5 are void
    const r = run(hs, { col: 2, row: 5 }, { move: 8, range: 0 });
    assert.equal(r.focuses.length, 0);
  },
  'monster move: walking monsters slide over ice in one point, flying ones do not, an ally stops the slide, no difficult terrain is paid on the slide'() {
    const corridor = (c) => c === 4, ice = {};
    for (let r = 1; r <= 4; r++) ice[hexKey(4, r)] = { ice: true };
    const end = (hs, o) => run(hs, { col: 4, row: 0 }, { move: 1, range: 0, ...o }).actions.map(a => [a.col, a.row]);
    const base = field([M(4, 0), C(4, 9)], ice, corridor);
    assert.deepEqual(end(base, {}), [[4, 5]], 'one step onto the ice, then on to the first hex that is not icy');
    assert.deepEqual(end(base, { flying: true }), [[4, 1]], 'flying: one step');
    assert.deepEqual(end(field([M(4, 0), M(4, 5), C(4, 9)], ice, corridor), {}), [[4, 4]], 'an ally in the way stops the slide before it');
    const difficult = { ...ice, [hexKey(4, 5)]: { difficult: true } };
    assert.deepEqual(end(field([M(4, 0), C(4, 9)], difficult, corridor), {}), [[4, 5]], 'the landing hex is difficult, the slide still costs one point');
  },
  'monster move: out of reach on a map with ice, the monster slides towards its destination, the way counts the slide as one point'() {
    const corridor = (c) => c === 4, ice = {};
    for (let r = 1; r <= 4; r++) ice[hexKey(4, r)] = { ice: true };
    const hs = field([M(4, 0), C(4, 9)], ice, corridor), me = { col: 4, row: 0 };
    const two = run(hs, me, { move: 2, range: 0 });
    assert.deepEqual([two.canAttackFocus, two.actions.map(a => [a.col, a.row, a.attack])], [false, [[4, 6, false]]], 'slide to row 5, one step to row 6');
    assert.equal(run(hs, me, { move: 4, range: 0 }).canAttackFocus, true, 'slide, then three steps to the hex next to the character');
  },
};
