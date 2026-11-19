import assert from 'node:assert/strict';
import { describeChange, foldLog } from '../../scripts/campaign/changelog.js';
import { setParty, buyItem, changeCharacterClass, availableClasses } from '../../scripts/campaign/edit.js';
import { withChars, priced, unlock } from './helpers.mjs';

const base = { tab: 'Mercenaries', kind: 'Gold', u: 'a' };

export const tests = {
  'no change gives no entries'() {
    const r = withChars(1);
    assert.deepEqual(describeChange(r, r), []);
  },
  'a party change is described'() {
    const r = withChars(1), e = describeChange(r, setParty(r, 'diff', 2));
    assert.equal(e.length, 1);
    assert.equal(e[0].tab, 'Overview');
  },
  'an item purchase gives entries'() {
    const it = priced[0];
    let r = unlock(withChars(1), it.id);
    r = { ...r, chars: r.chars.map(c => ({ ...c, gold: 999 })) };
    assert.ok(describeChange(r, buyItem(r, r.chars[0].id, it.id)).length > 0);
  },
  'a class change gives entries'() {
    const r = withChars(1), other = availableClasses(r).find(c => c.name !== r.chars[0].cls);
    assert.ok(describeChange(r, changeCharacterClass(r, r.chars[0].id, other.name)).length > 0);
  },
  'folding merges counter changes in the window'() {
    const log = foldLog([], [{ ...base, t: 1000, d: 'Sam: gold 42 to 45 (+3)' }, { ...base, t: 2000, d: 'Sam: gold 45 to 47 (+2)' }]);
    assert.equal(log.length, 1);
    assert.match(log[0].d, /42 to 47 \(\+5\)/);
  },
  'folding drops an entry that ends where it began'() {
    const log = foldLog([], [{ ...base, t: 1000, d: 'Sam: gold 42 to 45 (+3)' }, { ...base, t: 2000, d: 'Sam: gold 45 to 42 (-3)' }]);
    assert.equal(log.length, 0);
  },
  'folding keeps entries outside the window'() {
    const log = foldLog([], [{ ...base, t: 1000, d: 'Sam: gold 42 to 45 (+3)' }, { ...base, t: 9000, d: 'Sam: gold 45 to 47 (+2)' }]);
    assert.equal(log.length, 2);
  },
};
