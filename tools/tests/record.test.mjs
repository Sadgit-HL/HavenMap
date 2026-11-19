import assert from 'node:assert/strict';
import { emptyRecord, normalize, validate, scenarioLevel, normalDifficulty, SCN_STATE } from '../../scripts/campaign/record.js';
import { setScenarioState, setParty, addCharacter, setCharacter } from '../../scripts/campaign/edit.js';
import { SCENARIOS } from '../../scripts/games/gh2_scenarios.js';
import { withChars } from './helpers.mjs';

const linking = () => SCENARIOS.find(x => (x.unl || []).length);

export const tests = {
  'empty record is valid'() {
    assert.deepEqual(validate(emptyRecord()), []);
  },
  'normalize is idempotent'() {
    const a = normalize(JSON.parse(JSON.stringify(withChars(2))));
    assert.deepEqual(normalize(JSON.parse(JSON.stringify(a))), a);
  },
  'normalize survives junk'() {
    for (const raw of [null, undefined, {}]) {
      assert.ok(Array.isArray(normalize(raw).chars));
    }
  },
  'validate flags unknown scenario and item'() {
    const r = emptyRecord(); r.scn['99999'] = { s: 1 }; r.items.unl.push(-5);
    assert.equal(validate(r).length, 2);
  },
  'edit functions return a new record and bump ver'() {
    const r = emptyRecord(), n = setParty(r, 'diff', 1);
    assert.notEqual(n, r);
    assert.equal(n.ver, (r.ver || 0) + 1);
    assert.equal(r.party.diff, emptyRecord().party.diff);
  },
  'party values are clamped'() {
    assert.equal(setParty(emptyRecord(), 'diff', 99).party.diff, 4);
    assert.equal(setParty(emptyRecord(), 'diff', -99).party.diff, -2);
  },
  'completing a scenario unlocks the linked ones'() {
    const s = linking(), r = setScenarioState(emptyRecord(), s.n, SCN_STATE.COMPLETED);
    assert.equal(r.scn[String(s.n)].s, SCN_STATE.COMPLETED);
    for (const u of s.unl) if (SCENARIOS.some(x => x.n === u)) assert.ok(r.scn[String(u)].s >= SCN_STATE.UNLOCKED);
  },
  'completing with unlockNext false unlocks nothing'() {
    const r = setScenarioState(emptyRecord(), linking().n, SCN_STATE.COMPLETED, { unlockNext: false });
    assert.equal(Object.keys(r.scn).length, 1);
  },
  'setting a scenario back to locked removes its entry'() {
    const n = SCENARIOS[0].n, r = setScenarioState(setScenarioState(emptyRecord(), n, SCN_STATE.UNLOCKED), n, SCN_STATE.LOCKED);
    assert.equal(r.scn[String(n)], undefined);
  },
  'unknown scenario or state is ignored'() {
    const r = emptyRecord();
    assert.equal(setScenarioState(r, 99999, 1), r);
    assert.equal(setScenarioState(r, SCENARIOS[0].n, 42), r);
  },
  'scenario level follows party level and difficulty, clamped 0 to 7'() {
    let r = withChars(2);
    r = { ...r, chars: r.chars.map(c => ({ ...c, lv: 9 })) };
    assert.equal(normalDifficulty(r), 5);
    assert.equal(scenarioLevel(setParty(r, 'diff', 4)), 7);
    assert.equal(scenarioLevel(setParty({ ...r, chars: r.chars.map(c => ({ ...c, lv: 1 })) }, 'diff', -2)), 0);
  },
  'adding the same class twice is refused'() {
    const r = withChars(1);
    assert.equal(addCharacter(r, { cls: r.chars[0].cls, name: 'Dup' }), r);
  },
  'character values are clamped'() {
    const r = withChars(1), n = setCharacter(r, r.chars[0].id, 'gold', 99999);
    assert.ok(n.chars[0].gold <= 9999);
  },
};
