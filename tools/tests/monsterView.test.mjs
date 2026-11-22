import assert from 'node:assert/strict';
import { solveMove } from '../../scripts/monsterMove.js';
import { turnView, viewStatus } from '../../scripts/monsterView.js';
import { hexKey } from '../../scripts/hexState.js';

// An open field of floor, cols 1..12, rows 0..9; `figs` are [side, col, row].
function field(figs = []) {
  const floor = new Set();
  for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) floor.add(hexKey(c, r));
  return {
    floor, floorKnown: true, tilesWithoutMask: [], ignored: {}, cells: new Map(),
    figures: figs.map(([side, col, row]) => ({ kind: side === 'monsters' ? 'monster' : 'mercenary', side, id: 1, col, row, role: null })),
  };
}
const M = (c, r) => ['monsters', c, r], C = (c, r) => ['characters', c, r];
// The view of a monster at (3, 5) with the given values; characters are placed by the test.
const view = (figs, { move, range = 0, attack = true }) => {
  const res = solveMove(field([M(3, 5), ...figs]), { active: { col: 3, row: 5 }, move, range, attack });
  return { res, v: turnView(res, { moves: move > 0, attacks: attack }) };
};

export const tests = {
  'monster view: a move and an attack, in reach and out of reach'() {
    assert.equal(view([C(5, 5)], { move: 3 }).v.kind, 'attack');
    const far = view([C(11, 5)], { move: 3 });
    assert.deepEqual([far.v.kind, far.v.showDest, far.v.showEnd, far.v.showFocus], ['approach', true, true, true]);
    assert.equal(viewStatus('approach', { attacks: true, hex: 'E5' }), 'Out of range, to E5');
    assert.equal(viewStatus('approach', { attacks: true, hex: 'C5', stays: true }), 'Out of range');
  },
  'monster view: a card without an attack never says out of range'() {
    const far = view([C(11, 5)], { move: 3, attack: false });
    assert.deepEqual([far.v.kind, far.v.showDest], ['approach', true], 'it moves towards the focus');
    assert.equal(viewStatus(far.v.kind, { attacks: false, hex: 'F5' }), 'Moves to F5');
    assert.ok(!/range/i.test(viewStatus(far.v.kind, { attacks: false, hex: 'F5', stays: true })));
    const near = view([C(7, 5)], { move: 5, attack: false });
    assert.deepEqual([near.v.kind, near.v.showDest], ['move', false], 'it gets next to the focus: no towards hexes');
    assert.equal(viewStatus('move', { attacks: false, hex: 'F5' }), 'Moves to F5');
  },
  'monster view: a card without a move shows no hexes it moves towards'() {
    const out = view([C(11, 5)], { move: 0, range: 2 });
    assert.deepEqual([out.v.kind, out.v.showDest, out.v.showEnd, out.v.showFocus], ['out', false, false, true]);
    assert.equal(viewStatus('out', { attacks: true }), 'Out of range');
    const inRange = view([C(5, 5)], { move: 0, range: 3 });
    assert.deepEqual([inRange.v.kind, inRange.v.showEnd, inRange.v.showDest], ['attack', true, false], 'attacks from where it stands');
    assert.deepEqual(inRange.res.actions.map(a => [a.col, a.row]), [[3, 5]]);
  },
  'monster view: neither a move nor an attack shows nothing'() {
    const { v } = view([C(5, 5)], { move: 0, attack: false });
    assert.deepEqual(v, { kind: 'idle', showFocus: false, showDest: false, showEnd: false });
    assert.equal(viewStatus('idle', { attacks: false }), '');
  },
  'monster view: no character to go for'() {
    const none = view([], { move: 3 });
    assert.equal(none.v.kind, 'nofocus');
    assert.equal(viewStatus('nofocus', { attacks: true }), 'No target in reach');
    assert.equal(viewStatus('nofocus', { attacks: false }), 'No target to move towards');
    assert.deepEqual([none.v.showFocus, none.v.showDest, none.v.showEnd], [false, false, false]);
  },
  'monster view: several end hexes to choose from'() {
    assert.equal(viewStatus('attack', { attacks: true, targets: 'A', hex: 'D5', options: 3 }), '3 options: pick a hex');
    assert.equal(viewStatus('attack', { attacks: true, targets: 'A', hex: 'D5', options: 1 }), 'Attack A from D5');
  },
};
