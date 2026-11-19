import assert from 'node:assert/strict';
import { characterTraits, partyOf, checkRequirement, applicableOutcomes, flatApplicable } from '../../scripts/campaign/outcomes.js';
import { CLASS_TRAITS } from '../../scripts/games/gh2_class_traits.js';

const cls = Object.keys(CLASS_TRAITS)[0], clsTraits = CLASS_TRAITS[cls];
const ch = (name, extra = {}) => ({ name, cls: 'zzz-none', traits: [], special: [], ...extra });
const rec = (chars, rep = {}) => ({ chars, rep });
const states = list => list.map(x => x.state);

export const tests = {
  'traits: sheet, special and class traits, lower case'() {
    const t = characterTraits(ch('A', { cls, traits: ['Persuasive'], special: ['Hero'] }));
    assert.ok(t.has('persuasive') && t.has('hero'));
    for (const x of clsTraits) assert.ok(t.has(x));
  },
  'unknown class has only the sheet traits'() {
    assert.deepEqual([...characterTraits(ch('A', { traits: ['x'] }))], ['x']);
  },
  'party lists names with traits'() {
    assert.deepEqual(partyOf(rec([ch('A'), ch('B')])).map(p => p.name), ['A', 'B']);
    assert.deepEqual(partyOf({}), []);
  },
  'requirement t: any listed trait, lists who'() {
    const r = rec([ch('A', { traits: ['cunning'] }), ch('B')]);
    assert.deepEqual(checkRequirement({ t: ['cunning', 'brawny'] }, r), { ok: true, who: ['A'] });
    assert.deepEqual(checkRequirement({ t: ['brawny'] }, r), { ok: false, who: [] });
  },
  'requirement ta: every character has every trait'() {
    const both = rec([ch('A', { traits: ['x'] }), ch('B', { traits: ['x'] })]), one = rec([ch('A', { traits: ['x'] }), ch('B')]);
    assert.equal(checkRequirement({ ta: ['x'] }, both).ok, true);
    assert.equal(checkRequirement({ ta: ['x'] }, one).ok, false);
    assert.equal(checkRequirement({ ta: ['x'] }, rec([])).ok, false);
  },
  'requirement rp: reputation above the value'() {
    const r = rec([], { demons: 3, merchants: 5, guard: 0 });
    assert.equal(checkRequirement({ rp: ['demons', 3] }, r).ok, false);
    assert.equal(checkRequirement({ rp: ['demons', 2] }, r).ok, true);
    assert.equal(checkRequirement({ rp: ['merchant-guild', 4] }, r).ok, true);
    assert.equal(checkRequirement({ rp: ['military', -1] }, r).ok, true);
    assert.equal(checkRequirement({ rp: ['demons', 0] }, rec([])).ok, false);
  },
  'a requirement the app cannot check gives null'() {
    assert.equal(checkRequirement({ c: 'pay 10 gold' }, rec([])), null);
    assert.equal(checkRequirement({ rp: ['unknown', 1] }, rec([])), null);
  },
  'plain outcomes are always'() {
    assert.deepEqual(states(applicableOutcomes([{ n: 'a' }, { n: 'b' }], rec([]))), ['always', 'always']);
  },
  'met requirement, then otherwise is skipped'() {
    const r = rec([ch('A', { traits: ['x'] })]);
    const l = applicableOutcomes([{ t: ['x'] }, { o: 1 }], r);
    assert.deepEqual(states(l), ['met']);
    assert.deepEqual(l[0].who, ['A']);
  },
  'unmet requirement hides the text, otherwise applies'() {
    const l = applicableOutcomes([{ t: ['x'] }, { o: 1 }], rec([ch('A')]));
    assert.deepEqual(states(l), ['unmet', 'otherwise']);
    assert.equal(l[0].textHidden, true);
  },
  'an unchecked requirement makes the option manual for the players'() {
    const l = applicableOutcomes([{ t: ['x'] }, { c: 'pay' }, { o: 1 }], rec([ch('A')]));
    assert.deepEqual(states(l), ['unmet', 'manual', 'manual']);
  },
  'in a manual option a met requirement is still marked met'() {
    const l = applicableOutcomes([{ t: ['x'] }, { c: 'pay' }, { o: 1 }], rec([ch('A', { traits: ['x'] })]));
    assert.deepEqual(states(l), ['met', 'manual', 'manual']);
  },
  'redirects resolve through the lookup'() {
    const lookup = l => (l === 'B' ? [{ n: 'target' }] : undefined);
    const l = applicableOutcomes([{ g: ['B', 'C'] }], rec([]), lookup);
    assert.equal(l[0].via.length, 2);
    assert.deepEqual(states(l[0].via[0].list), ['always']);
    assert.equal(l[0].via[1].list, null);
  },
  'a redirect loop is cut'() {
    const lookup = l => (l === 'A' ? [{ g: ['B'] }] : [{ g: ['A'] }]);
    const l = applicableOutcomes([{ g: ['A'] }], rec([]), lookup, ['A']);
    assert.equal(l[0].via.length, 0);
    const deep = applicableOutcomes([{ g: ['A'] }], rec([]), lookup);
    assert.ok(JSON.stringify(deep).length < 5000);
  },
  'an unmet outcome is not redirected'() {
    const l = applicableOutcomes([{ t: ['x'], g: ['B'] }], rec([ch('A')]), () => [{ n: 1 }]);
    assert.equal(l[0].via, undefined);
  },
  'flatApplicable replaces a pure redirect by its targets'() {
    const lookup = () => [{ n: 'target' }];
    const flat = flatApplicable(applicableOutcomes([{ g: ['B'] }], rec([]), lookup));
    assert.deepEqual(flat.map(x => x.o.n), ['target']);
  },
  'flatApplicable marks everything below a manual outcome as manual'() {
    const lookup = () => [{ n: 'target' }];
    const flat = flatApplicable(applicableOutcomes([{ c: 'pay', g: ['B'] }], rec([]), lookup));
    assert.ok(flat.length > 0 && flat.every(x => x.state === 'manual'));
  },
};
