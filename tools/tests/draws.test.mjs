import assert from 'node:assert/strict';
import { emptyRecord, SCN_STATE } from '../../scripts/campaign/record.js';
import { setScenarioState, setItemUnlocked, drawItemDesign } from '../../scripts/campaign/edit.js';
import { scenarioPool, itemDesignPool, pickOne, RANDOM_ITEM_IDS } from '../../scripts/campaign/draws.js';
import { describeChange } from '../../scripts/campaign/changelog.js';
import { SCENARIOS } from '../../scripts/games/gh2_scenarios.js';

const at = i => () => i;

export const tests = {
  'scenario pool: only scenarios in the Unlocked state'() {
    let r = emptyRecord();
    assert.deepEqual(scenarioPool(r), [], 'nothing unlocked in a new record');
    const [a, b, c, d] = SCENARIOS.slice(0, 4).map(s => s.n);
    r = setScenarioState(r, a, SCN_STATE.UNLOCKED);
    r = setScenarioState(r, b, SCN_STATE.COMPLETED);
    r = setScenarioState(r, c, SCN_STATE.LOCKED_OUT);
    r = setScenarioState(r, d, SCN_STATE.UNLOCKED);
    assert.deepEqual(scenarioPool(r), [a, d]);
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
  'History: a random item design is marked, an ordinary unlock is not'() {
    const r = emptyRecord(), a = drawItemDesign(r, () => 0);
    assert.deepEqual(describeChange(r, a, { draw: 'random' }).map(l => l.d), [`Unlocked item #${RANDOM_ITEM_IDS[0]} (random)`]);
    assert.deepEqual(describeChange(r, a).map(l => l.d), [`Unlocked item #${RANDOM_ITEM_IDS[0]}`]);
  },
};
