import assert from 'node:assert/strict';
import { solveMove, hexDistance } from '../../scripts/monsterMove.js';
import { solveTurn, stagesOf } from '../../scripts/monsterSteps.js';
import { cardOptions } from '../../scripts/monsterCard.js';
import { hexKey } from '../../scripts/hexState.js';
import { GH2_MONSTERS, GH2_MONSTER_DECKS } from '../../scripts/games/gh2_monsters.js';

// An open field of floor, cols 1..12, rows 0..9; `figs` are [side, col, row].
function field(figs = []) {
  const floor = new Set();
  for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) floor.add(hexKey(c, r));
  return { floor, floorKnown: true, tilesWithoutMask: [], ignored: {}, cells: new Map(), figures: figs.map(([side, col, row]) => ({ kind: side === 'monsters' ? 'monster' : 'mercenary', side, id: 1, col, row, role: null })) };
}
const M = (c, r) => ['monsters', c, r], C = (c, r) => ['characters', c, r];
const mv = n => ({ t: 'move', move: n, jumping: false });
const at = (range = 0, targets = 1, damage = 2) => ({ t: 'attack', damage, range, targets, area: [], areaMelee: false, effects: [] });
const dist = (a, b) => hexDistance(a.col, a.row, b.col, b.row);
const solve = (hs, me, steps, o = {}) => solveTurn(hs, { active: me, steps, ...o });
const keys = list => list.map(f => hexKey(f.col, f.row));

export const tests = {
  'monster steps: stages, a move takes the attack after it'() {
    assert.deepEqual(stagesOf([mv(2), at()]), [[0, 1]]);
    assert.deepEqual(stagesOf([at(), mv(1), at()]), [[0], [1, 2]]);
    assert.deepEqual(stagesOf([mv(2), at(), at()]), [[0, 1], [2]]);
    assert.deepEqual(stagesOf([at(), at(), at()]), [[0], [1], [2]]);
    assert.deepEqual(stagesOf([mv(2)]), [[0]]);
    assert.deepEqual(stagesOf([]), []);
  },
  'monster steps: one move and one attack is the same as solveMove'() {
    const hs = field([M(3, 5), C(8, 5), C(5, 1)]), me = { col: 3, row: 5 };
    const r = solve(hs, me, [mv(3), at(0)]), s = solveMove(hs, { active: me, move: 3, range: 0 });
    assert.equal(r.stages.length, 1);
    assert.deepEqual(r.stages[0].res, s);
    assert.deepEqual(r.focuses, s.focuses);
    assert.equal(r.canAttackFocus, s.canAttackFocus);
  },
  'monster steps: attack, move, attack: the first attack is made where it stands, the second after the move'() {
    const hs = field([M(3, 5), C(6, 5)]), me = { col: 3, row: 5 };           // 3 hexes away: no attack from the start hex, move 2 reaches it
    const r = solve(hs, me, [at(0), mv(2), at(0)]);
    assert.deepEqual(r.stages.map(s => s.steps), [[0], [1, 2]]);
    assert.equal(r.stages[0].chosen.attack, false, 'nothing to attack from where it stands');
    assert.deepEqual(r.stages[0].end, me, 'an attack alone does not move it');
    assert.equal(r.stages[1].chosen.attack, true);
    assert.equal(dist(r.stages[1].end, { col: 6, row: 5 }), 1);
    assert.deepEqual(r.end, r.stages[1].end);
  },
  'monster steps: attack, move, attack next to the focus attacks twice'() {
    const hs = field([M(3, 5), C(4, 5)]), me = { col: 3, row: 5 };
    const r = solve(hs, me, [at(0), mv(2), at(0)]);
    assert.deepEqual(r.stages.map(s => s.chosen.attack), [true, true]);
    assert.deepEqual(r.stages.map(s => dist(s.end, { col: 4, row: 5 })), [1, 1]);
  },
  'monster steps: move, attack, attack: the second attack is made from the end hex of the move'() {
    const hs = field([M(2, 5), C(6, 5)]), me = { col: 2, row: 5 };
    const r = solve(hs, me, [mv(3), at(0), at(0)]);
    assert.deepEqual(r.stages.map(s => s.steps), [[0, 1], [2]]);
    assert.equal(r.stages[0].chosen.attack, true);
    assert.deepEqual(r.stages[1].from, r.stages[0].end, 'the second stage starts where the first one ended');
    assert.equal(r.stages[1].chosen.attack, true);
    assert.deepEqual(r.stages[1].chosen.targets, r.stages[0].chosen.targets, 'the same target');
    assert.deepEqual(r.stages[1].end, r.stages[0].end, 'an attack does not move it');
  },
  'monster steps: three attacks, one stage each, all against the focus'() {
    const hs = field([M(5, 5), C(6, 5), C(5, 8)]), me = { col: 5, row: 5 };
    const r = solve(hs, me, [at(0), at(0), at(0)]);
    assert.equal(r.stages.length, 3);
    for (const s of r.stages) { assert.equal(s.chosen.attack, true); assert.deepEqual(s.chosen.targets, ['6,5']); }
  },
  'monster steps: the focus is fixed for the whole turn'() {
    // two characters equally far, a tie broken by the initiative; later stages must keep the same focus
    const hs = field([M(6, 5), C(6, 2), C(6, 8)]), me = { col: 6, row: 5 };
    const initiatives = { '6,2': 30, '6,8': 10 };
    const r = solve(hs, me, [mv(2), at(0), at(0)], { initiatives });
    assert.deepEqual(keys(r.focuses), ['6,8']);
    for (const s of r.stages) assert.deepEqual(keys(s.res.focuses), ['6,8']);
    assert.deepEqual(r.stages[1].chosen.targets, r.stages[0].chosen.targets);
  },
  'monster steps: solveMove focus option limits the focus to the given characters'() {
    const hs = field([M(6, 5), C(6, 2), C(6, 8)]), me = { col: 6, row: 5 };
    const tied = solveMove(hs, { active: me, move: 2, range: 0 });
    assert.equal(tied.focuses.length, 2);
    const one = solveMove(hs, { active: me, move: 2, range: 0, focus: ['6,8'] });
    assert.deepEqual(keys(one.focuses), ['6,8']);
    assert.ok(one.actions.every(a => a.focus.join() === '6,8'));
  },
  'monster steps: picks choose among tied end hexes and the next stage starts there'() {
    const hs = field([M(3, 5), C(7, 5)]), me = { col: 3, row: 5 };
    const free = solve(hs, me, [mv(3), at(0), at(0)]);
    const hexes = [...new Set(free.stages[0].res.actions.map(a => hexKey(a.col, a.row)))];
    assert.ok(hexes.length >= 1);
    const last = hexes[hexes.length - 1];
    const r = solve(hs, me, [mv(3), at(0), at(0)], { picks: [{ hex: last }] });
    assert.equal(hexKey(r.stages[0].end.col, r.stages[0].end.row), last);
    assert.deepEqual(r.stages[1].from, r.stages[0].end);
  },
  'monster steps: stun does nothing, immobilize cancels the moves, disarm cancels the attacks'() {
    const hs = field([M(2, 5), C(6, 5)]), me = { col: 2, row: 5 }, steps = [mv(3), at(0), at(0)];
    const stun = solve(hs, me, steps, { stunned: true });
    assert.deepEqual([stun.stages.length, stun.end], [0, me]);
    const imm = solve(hs, me, steps, { immobilized: true });
    assert.deepEqual(imm.end, me, 'it stays');
    assert.ok(imm.stages.every(s => !s.chosen.attack), 'out of reach where it stands');
    const dis = solve(hs, me, steps, { disarmed: true });
    assert.equal(dist(dis.end, { col: 6, row: 5 }), 1, 'it still moves as if it would attack');
    assert.ok(dis.stages.every(s => !s.chosen.attack && s.chosen.targets.length === 0));
  },
  'monster steps: no character, no stages'() {
    const hs = field([M(2, 5)]), me = { col: 2, row: 5 };
    const r = solve(hs, me, [mv(3), at(0), at(0)]);
    assert.deepEqual([r.focuses.length, r.stages.length, r.end], [0, 0, me]);
  },
  'monster steps: real cards, hound Sharp Fangs and rending drake Unending Frenzy'() {
    const card = (slug, id) => GH2_MONSTER_DECKS[GH2_MONSTERS[slug].deck].find(c => String(c.id) === String(id));
    const steps = (slug, id) => cardOptions({ monster: GH2_MONSTERS[slug], kind: 'normal', level: 0, card: card(slug, id) }).steps;
    const hs = field([M(3, 5), C(5, 5)]), me = { col: 3, row: 5 };            // two hexes away: the hound's move reaches the hex next to it
    const hound = solve(hs, me, steps('hound', 719));
    assert.deepEqual(hound.stages.map(s => s.steps), [[0], [1, 2]]);
    assert.deepEqual(hound.stages.map(s => s.chosen.attack), [false, true], 'out of reach first, the attack after the move');
    const drake = solve(field([M(5, 5), C(6, 5)]), { col: 5, row: 5 }, steps('rending-drake', 726));
    assert.deepEqual(drake.stages.map(s => s.chosen.attack), [true, true, true]);
  },
};
