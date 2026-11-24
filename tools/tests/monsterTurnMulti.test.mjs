import assert from 'node:assert/strict';
import { choicesOf, panelSteps, pickStageOf, solveMulti, postItems, stageSummaries } from '../../scripts/monsterTurnMulti.js';
import { stepsPost } from '../../scripts/monsterPost.js';
import { stagesStatus } from '../../scripts/monsterView.js';
import { cardOptions } from '../../scripts/monsterCard.js';
import { hexKey } from '../../scripts/hexState.js';
import { GH2_MONSTERS, GH2_MONSTER_DECKS } from '../../scripts/games/gh2_monsters.js';

function field(figs = []) {
  const floor = new Set();
  for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) floor.add(hexKey(c, r));
  return { floor, floorKnown: true, tilesWithoutMask: [], ignored: {}, cells: new Map(), figures: figs.map(([side, col, row]) => ({ kind: side === 'monsters' ? 'monster' : 'mercenary', side, id: 1, col, row, role: null })) };
}
const M = (c, r) => ['monsters', c, r], C = (c, r) => ['characters', c, r];
const label = h => `${String.fromCharCode(64 + h.col)}${h.row}`;
const T = { move: 1, range: 0, targets: 1, all: false, fly: false, jump: false, tele: false, noAttack: false, cells: null, area: [] };
const hound = () => cardOptions({ monster: GH2_MONSTERS.hound, kind: 'normal', level: 0, card: GH2_MONSTER_DECKS.hound.find(c => c.id === 719) });
const run = (hs, me, steps, choice = null, o = {}) => solveMulti(hs, { active: me, steps, ...o }, choice);
const names = new Map([['5,5', 'Anaphi'], ['6,5', 'Brute']]);

export const tests = {
  'monster turn multi: the panel values go to the first move and the first attack only'() {
    const o = hound(), steps = panelSteps(o.steps, { ...T, move: 3, range: 2, targets: 2 });
    assert.deepEqual(steps.map(s => s.src), [0, 1, 2]);
    assert.equal(steps[1].move, 3, 'the move');
    assert.deepEqual([steps[0].range, steps[0].targets], [2, 2], 'the first attack');
    assert.deepEqual([steps[2].range, steps[2].targets], [o.steps[2].range, o.steps[2].targets], 'the second attack is the card');
    assert.equal(panelSteps(o.steps, { ...T, all: true })[0].targets, 6);
    assert.equal(panelSteps(o.steps, { ...T, fly: true, jump: true })[1].jumping, false, 'flying is not jumping');
  },
  'monster turn multi: No attack leaves the attacks out and keeps the card indexes'() {
    const steps = panelSteps(hound().steps, { ...T, noAttack: true });
    assert.deepEqual(steps.map(s => [s.t, s.src]), [['move', 1]]);
  },
  'monster turn multi: the picking stage is the first one with a move, else the first'() {
    const o = hound(), steps = panelSteps(o.steps, T);
    const hs = field([M(3, 5), C(5, 5)]), r = run(hs, { col: 3, row: 5 }, steps);
    assert.equal(r.pickIdx, 1);
    assert.equal(pickStageOf([{ steps: [0] }, { steps: [1] }], [{ t: 'attack' }, { t: 'attack' }]), 0);
  },
  'monster turn multi: the choice is the pick when valid, else the only or the first hex, and later stages follow it'() {
    const steps = [{ t: 'move', move: 3, jumping: false, src: 0 }, { t: 'attack', range: 0, targets: 1, area: [], src: 1 }, { t: 'attack', range: 0, targets: 1, area: [], src: 2 }];
    const hs = field([M(2, 5), C(6, 5)]), me = { col: 2, row: 5 };
    const free = run(hs, me, steps);
    assert.ok(free.choices.length >= 1);
    assert.equal(free.choice, free.choices[0].key);
    const last = free.choices[free.choices.length - 1].key, pick = run(hs, me, steps, last);
    assert.equal(pick.choice, last);
    assert.deepEqual([pick.stages[0].end.col, pick.stages[0].end.row].join(','), last);
    assert.deepEqual(pick.stages[1].from, pick.stages[0].end);
    assert.equal(run(hs, me, steps, '99,99').choice, free.choices[0].key, 'a hex that is not a choice is ignored');
    assert.deepEqual(pick.end, pick.stages[1].end);
  },
  'monster turn multi: no character, no stages and no choices'() {
    const r = run(field([M(2, 5)]), { col: 2, row: 5 }, panelSteps(hound().steps, T));
    assert.deepEqual([r.stages.length, r.choices.length, r.choice, r.res.focuses.length], [0, 0, null, 0]);
  },
  'monster turn multi: text of attack, move, attack from the stages'() {
    const o = hound(), steps = panelSteps(o.steps, T), hs = field([M(3, 5), C(5, 5)]);
    const r = run(hs, { col: 3, row: 5 }, steps);
    const items = postItems({ plan: o.plan, steps, stages: r.stages, names, label, here: { col: 3, row: 5 } });
    assert.deepEqual(items.map(i => i.t), ['attack', 'move', 'attack']);
    assert.equal(items[0].attack, null);
    assert.equal(items[0].noAttack, 'out of range');
    assert.deepEqual([items[1].from, items[1].to, items[1].points], ['C5', 'D5', 1]);
    assert.deepEqual(items[2].targets, [['Anaphi']]);
    const text = stepsPost({ name: 'Hound', standee: 1, items, extras: o.extras, icons: false });
    assert.equal(text, `[b]Hound[/b] #1: no attack: out of range, move 1 C5 to D5, attack 1 pierce 2 on [b]Anaphi[/b]`);
  },
  'monster turn multi: immobilized monsters write no move value, a disarmed one no attack, with adjacent disadvantage on ranged attacks'() {
    const o = hound(), steps = panelSteps(o.steps, T), hs = field([M(3, 5), C(4, 5)]);
    const r = run(hs, { col: 3, row: 5 }, steps, null, { immobilized: true });
    const items = postItems({ plan: o.plan, steps, stages: r.stages, names: new Map([['4,5', 'Anaphi']]), label, here: { col: 3, row: 5 }, immobilized: true });
    assert.equal(items.find(i => i.t === 'move').points, null);
    const dis = run(hs, { col: 3, row: 5 }, steps, null, { disarmed: true });
    const di = postItems({ plan: o.plan, steps, stages: dis.stages, names: new Map([['4,5', 'Anaphi']]), label, attacks: false });
    assert.ok(di.filter(i => i.t === 'attack').every(i => i.attack === null && i.noAttack === null));
    const ranged = steps.map(s => (s.t === 'attack' ? { ...s, range: 3 } : s)), rr = run(field([M(3, 5), C(4, 5)]), { col: 3, row: 5 }, ranged);
    const ri = postItems({ plan: o.plan, steps: ranged, stages: rr.stages, names: new Map([['4,5', 'Anaphi']]), label });
    assert.deepEqual(ri.find(i => i.t === 'attack' && i.attack).disadvantage, ['Anaphi'], 'adjacent target of a ranged attack');
    assert.equal(postItems({ plan: o.plan, steps: ranged, stages: rr.stages, names: new Map([['4,5', 'Anaphi']]), label, muddled: true }).find(i => i.t === 'attack' && i.attack).disadvantage, true);
  },
  'monster turn multi: no focus, the turn says where it stays and why there is no attack'() {
    const o = hound(), steps = panelSteps(o.steps, T), r = run(field([M(3, 5)]), { col: 3, row: 5 }, steps);
    const items = postItems({ plan: o.plan, steps, stages: r.stages, names, label, here: { col: 3, row: 5 } });
    assert.deepEqual(items.map(i => i.noAttack ?? i.t), ['no target in reach', 'move', 'no target in reach']);
    assert.equal(stepsPost({ name: 'Hound', items, icons: false }), '[b]Hound[/b]: no attack: no target in reach, stays at C5, no attack: no target in reach');
  },
  'monster turn multi: status of each stage'() {
    const o = hound(), steps = panelSteps(o.steps, T), hs = field([M(3, 5), C(5, 5)]), r = run(hs, { col: 3, row: 5 }, steps);
    const s = stageSummaries({ steps, stages: r.stages, pickIdx: r.pickIdx, choices: r.choices.slice(0, 1), names, label });
    assert.equal(stagesStatus(s), 'Out of range; Attack Anaphi from D5');
    const tied = stageSummaries({ steps, stages: r.stages, pickIdx: r.pickIdx, choices: [1, 2, 3], names, label });
    assert.equal(stagesStatus(tied), 'Out of range; 3 options: pick a hex', 'the picking stage asks for a choice');
    assert.deepEqual(s.map(x => [x.moves, x.attacks, x.did]), [[false, true, false], [true, true, true]]);
  },
  'monster turn multi: choicesOf merges the groups of one hex'() {
    const res = { actions: [
      { col: 4, row: 5, focus: ['5,5'], attack: true, targets: ['5,5'], area: [], destinations: [] },
      { col: 4, row: 5, focus: ['5,5'], attack: true, targets: ['5,5', '6,5'], area: [], destinations: [] },
      { col: 4, row: 6, focus: [], attack: false, targets: [], area: [], destinations: [] },
    ] };
    const c = choicesOf(res);
    assert.equal(c.length, 1, 'an action with no focus is not a choice');
    assert.deepEqual(c[0].groups, [['5,5'], ['5,5', '6,5']]);
  },
};
