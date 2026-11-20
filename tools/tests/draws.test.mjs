import assert from 'node:assert/strict';
import { emptyRecord, SCN_STATE } from '../../scripts/campaign/record.js';
import { setScenarioState, setItemUnlocked, drawItemDesign, drawSideScenario } from '../../scripts/campaign/edit.js';
import { scenarioPool, itemDesignPool, pickOne, RANDOM_ITEM_IDS, RANDOM_SCENARIO_NUMBERS } from '../../scripts/campaign/draws.js';
import { describeChange } from '../../scripts/campaign/changelog.js';
import { SCENARIOS } from '../../scripts/games/gh2_scenarios.js';

const at = i => () => i;

export const tests = {
  'scenario pool: the locked random scenarios 67 to 74'() {
    const r = emptyRecord(), all = [67, 68, 69, 70, 71, 72, 73, 74];
    assert.deepEqual(scenarioPool(r), all);
    assert.deepEqual(RANDOM_SCENARIO_NUMBERS, all);
    for (const n of all) assert.ok(SCENARIOS.some(s => s.n === n && s.area === 'Random'), `scenario ${n} exists, in the Random storyline`);
    assert.ok(!scenarioPool(r).includes(83), '83 (Lost Island) follows 70: it is not rolled');
  },
  'scenario pool: unlocked, completed and locked out scenarios are not drawn again'() {
    let r = emptyRecord();
    r = setScenarioState(r, 67, SCN_STATE.UNLOCKED);
    r = setScenarioState(r, 68, SCN_STATE.COMPLETED, { unlockNext: false });
    r = setScenarioState(r, 69, SCN_STATE.LOCKED_OUT);
    r = setScenarioState(r, 1, SCN_STATE.UNLOCKED);                      // outside the range: no effect on the pool
    assert.deepEqual(scenarioPool(r), [70, 71, 72, 73, 74]);
    r = setScenarioState(r, 70, SCN_STATE.COMPLETED);                    // completing 70 unlocks 83: still not part of the pool
    assert.equal(r.scn['83'].s, SCN_STATE.UNLOCKED);
    assert.deepEqual(scenarioPool(r), [71, 72, 73, 74]);
    r = setScenarioState(r, 67, SCN_STATE.LOCKED);                       // back to locked: drawable again
    assert.ok(scenarioPool(r).includes(67));
  },
  'random side scenario unlocks the scenario the number points at, and only one of the pool'() {
    const r = emptyRecord(), pool = scenarioPool(r), next = drawSideScenario(r, () => 2.5 / pool.length);
    assert.equal(next.scn[String(pool[2])].s, SCN_STATE.UNLOCKED);
    assert.equal(Object.keys(next.scn).length, 1, 'nothing else changes');
    assert.deepEqual(r.scn, {}, 'the input is not changed');
    for (let i = 0; i < 40; i++) assert.ok(pool.includes(Number(Object.keys(drawSideScenario(r, () => i / 40).scn)[0])));
  },
  'random side scenario: every locked one is equally likely'() {
    const r = emptyRecord(), N = 800, seen = new Map();
    for (let i = 0; i < N; i++) { const n = Object.keys(drawSideScenario(r, () => i / N).scn)[0]; seen.set(n, (seen.get(n) || 0) + 1); }
    assert.equal(seen.size, 8);
    for (const k of seen.values()) assert.equal(k, N / 8);
  },
  'random side scenario never takes an unlocked one, and stops when none is left'() {
    let r = emptyRecord();
    const total = scenarioPool(r).length;
    for (let i = 0; i < total; i++) { const before = Object.keys(r.scn).length; r = drawSideScenario(r, () => 0); assert.equal(Object.keys(r.scn).length, before + 1); }
    assert.deepEqual(Object.keys(r.scn).map(Number).sort((a, b) => a - b), [67, 68, 69, 70, 71, 72, 73, 74], 'each once');
    assert.equal(drawSideScenario(r, () => 0), r, 'no random scenario left');
    assert.equal(scenarioPool(r).length, 0);
  },
  'item design pool: the random items that are not unlocked yet'() {
    let r = emptyRecord();
    assert.deepEqual(itemDesignPool(r), RANDOM_ITEM_IDS);
    r = setItemUnlocked(r, 85, true);
    r = setItemUnlocked(r, 1, true);                                   // a shop item does not change the pool
    assert.deepEqual(itemDesignPool(r), RANDOM_ITEM_IDS.filter(id => id !== 85));
    for (const id of RANDOM_ITEM_IDS) r = setItemUnlocked(r, id, true);
    assert.deepEqual(itemDesignPool(r), []);
  },
  'pickOne: every entry equally likely, null for an empty list'() {
    const list = [10, 20, 30, 40], N = 400, seen = new Map();
    for (let i = 0; i < N; i++) { const v = pickOne(list, () => i / N); seen.set(v, (seen.get(v) || 0) + 1); }
    assert.deepEqual([...seen.keys()].sort((x, y) => x - y), list);
    for (const k of seen.values()) assert.equal(k, N / list.length);
    assert.equal(pickOne([], at(0)), null);
    assert.equal(pickOne([7], at(0.999)), 7);
  },
  'random item design unlocks the item the number points at, and only a random item'() {
    const r = emptyRecord(), next = drawItemDesign(r, () => 2.5 / RANDOM_ITEM_IDS.length);
    assert.deepEqual(next.items.unl, [RANDOM_ITEM_IDS[2]]);
    assert.deepEqual(r.items.unl, [], 'the input is not changed');
    for (let i = 0; i < 50; i++) assert.ok(RANDOM_ITEM_IDS.includes(drawItemDesign(r, () => i / 50).items.unl[0]));
  },
  'random item design never takes an unlocked item, and stops when none is left'() {
    let r = emptyRecord();
    for (let i = 0; i < RANDOM_ITEM_IDS.length; i++) {
      const before = r.items.unl.length;
      r = drawItemDesign(r, () => 0);
      assert.equal(r.items.unl.length, before + 1);
    }
    assert.deepEqual([...r.items.unl].sort((a, b) => a - b), RANDOM_ITEM_IDS, 'each item once');
    assert.equal(drawItemDesign(r, () => 0), r, 'no random item left');
  },
  'History: a random side scenario is marked, an ordinary unlock is not'() {
    const r = emptyRecord(), a = drawSideScenario(r, () => 0);
    assert.deepEqual(describeChange(r, a, { draw: 'random' }).map(l => l.d), ['Scenario 67: Locked to Unlocked (random)']);
    assert.deepEqual(describeChange(r, setScenarioState(r, 67, SCN_STATE.UNLOCKED)).map(l => l.d), ['Scenario 67: Locked to Unlocked']);
  },
  'History: a random item design is marked, an ordinary unlock is not'() {
    const r = emptyRecord(), a = drawItemDesign(r, () => 0);
    assert.deepEqual(describeChange(r, a, { draw: 'random' }).map(l => l.d), [`Unlocked item #${RANDOM_ITEM_IDS[0]} (random)`]);
    assert.deepEqual(describeChange(r, a).map(l => l.d), [`Unlocked item #${RANDOM_ITEM_IDS[0]}`]);
  },
};
