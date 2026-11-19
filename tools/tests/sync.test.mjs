import assert from 'node:assert/strict';
import { merge3, same, parseInvite, inviteUrl } from '../../scripts/campaign/sync.js';
import { setParty, setProsperity, setCharacter, addCharacter, availableClasses, renameCharacter } from '../../scripts/campaign/edit.js';
import { withChars } from './helpers.mjs';

const clone = v => JSON.parse(JSON.stringify(v));
const merge = (b, m, t) => { const conflicts = []; return { out: merge3(b, m, t, conflicts), conflicts }; };

export const tests = {
  'same compares deeply and ignores undefined keys'() {
    assert.ok(same({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
    assert.ok(same({ a: 1, b: undefined }, { a: 1 }));
    assert.ok(!same({ a: 1 }, { a: 2 }));
    assert.ok(!same([], {}));
    assert.ok(!same(null, {}));
  },
  'an edit on one side only is taken'() {
    const base = withChars(1), mine = setParty(base, 'diff', 2);
    assert.deepEqual(merge(base, mine, base).out, mine);
    assert.deepEqual(merge(base, base, mine).out, mine);
    assert.equal(merge(base, mine, base).conflicts.length, 0);
  },
  'edits to different fields both survive'() {
    const base = withChars(1), mine = setParty(base, 'diff', 2), theirs = setProsperity(base, 5);
    const { out, conflicts } = merge(base, mine, theirs);
    assert.equal(out.party.diff, 2);
    assert.deepEqual(out.prosperity ?? out.pros, (theirs.prosperity ?? theirs.pros));
    assert.equal(conflicts.length, 0);
  },
  'the same field changed differently is a conflict and theirs wins'() {
    const base = withChars(1), mine = setParty(base, 'diff', 2), theirs = setParty(base, 'diff', 3);
    const { out, conflicts } = merge(base, mine, theirs);
    assert.equal(out.party.diff, 3);
    assert.deepEqual(conflicts, ['party.diff']);
  },
  'the same field changed to the same value is no conflict'() {
    const base = withChars(1), a = setParty(base, 'diff', 2), b = setParty(base, 'diff', 2);
    assert.equal(merge(base, a, b).conflicts.length, 0);
  },
  'the edit counter takes the larger value'() {
    const { out, conflicts } = merge({ ver: 1 }, { ver: 3 }, { ver: 5 });
    assert.equal(out.ver, 5);
    assert.equal(conflicts.length, 0);
  },
  'characters merge by id'() {
    const base = withChars(2), [a, b] = base.chars.map(c => c.id);
    const mine = setCharacter(base, a, 'gold', 10), theirs = setCharacter(base, b, 'gold', 20);
    const { out, conflicts } = merge(base, mine, theirs);
    assert.equal(out.chars.find(c => c.id === a).gold, 10);
    assert.equal(out.chars.find(c => c.id === b).gold, 20);
    assert.equal(conflicts.length, 0);
  },
  'two fields of one character both survive'() {
    const base = withChars(1), id = base.chars[0].id;
    const mine = setCharacter(base, id, 'gold', 10), theirs = renameCharacter(base, id, 'Zed');
    const { out } = merge(base, mine, theirs);
    assert.equal(out.chars[0].gold, 10);
    assert.equal(out.chars[0].name, 'Zed');
  },
  'a character added by each side is kept (ids differ)'() {
    const base = withChars(1), cls = availableClasses(base).map(c => c.name);
    const mine = addCharacter(base, { cls: cls[0], name: 'Mine' }), theirs = addCharacter(base, { cls: cls[1], name: 'Theirs' });
    const { out, conflicts } = merge(base, mine, theirs);
    assert.deepEqual(out.chars.map(c => c.name).sort(), ['Mine', 'T1', 'Theirs']);
    assert.equal(conflicts.length, 0);
  },
  'a character added by one side survives the merge'() {
    const base = withChars(1), cls = availableClasses(base).map(c => c.name);
    const mine = addCharacter(base, { cls: cls[0], name: 'Mine' }), edited = setParty(base, 'diff', 1);
    const { out, conflicts } = merge(base, mine, edited);
    assert.deepEqual(out.chars.map(c => c.name), ['T1', 'Mine']);
    assert.equal(out.party.diff, 1);
    assert.equal(conflicts.length, 0);
  },
  'a character removed by the other side and untouched here is removed'() {
    const base = withChars(2), theirs = { ...base, chars: base.chars.slice(0, 1) };
    assert.equal(merge(base, base, theirs).out.chars.length, 1);
  },
  'a character removed by the other side but edited here is a conflict, removal wins'() {
    const base = withChars(2), id = base.chars[1].id;
    const mine = setCharacter(base, id, 'gold', 7), theirs = { ...base, chars: base.chars.slice(0, 1) };
    const { out, conflicts } = merge(base, mine, theirs);
    assert.equal(out.chars.length, 1);
    assert.equal(conflicts.length, 1);
  },
  'arrays that are not id lists conflict when both change'() {
    const { out, conflicts } = merge({ l: [1] }, { l: [1, 2] }, { l: [1, 3] });
    assert.deepEqual(out.l, [1, 3]);
    assert.deepEqual(conflicts, ['l']);
  },
  'both sides adding log entries keeps all, in time order, without duplicates'() {
    const e1 = { t: 1, d: 'a' }, e2 = { t: 2, d: 'b' }, e3 = { t: 3, d: 'c' }, e4 = { t: 4, d: 'd' };
    const base = { log: [e1] }, mine = { log: [e1, e3] }, theirs = { log: [e1, e2, e4] };
    const { out, conflicts } = merge(base, mine, theirs);
    assert.deepEqual(out.log, [e1, e2, e3, e4]);
    assert.equal(conflicts.length, 0);
    const dup = merge(base, { log: [e1, e2] }, { log: [e1, e2, e4] }).out.log;
    assert.deepEqual(dup, [e1, e2, e4]);
  },
  'merge does not change its inputs'() {
    const base = withChars(2), mine = setCharacter(base, base.chars[0].id, 'gold', 5), theirs = setParty(base, 'diff', 1);
    const snap = JSON.stringify([base, mine, theirs]);
    merge3(base, mine, theirs, []);
    assert.equal(JSON.stringify([base, mine, theirs]), snap);
  },
  'merging a record with itself returns it'() {
    const r = withChars(2);
    assert.deepEqual(merge(r, clone(r), clone(r)).out, r);
  },
  'invite links round trip'() {
    const url = inviteUrl('http://x/campaign/index.html#old', 'my-camp', 'a'.repeat(32), 'Sam Ö');
    const hash = url.slice(url.indexOf('#'));
    assert.deepEqual(parseInvite(hash), { cid: 'my-camp', token: 'a'.repeat(32), name: 'Sam Ö' });
    assert.ok(!url.includes('#old'));
  },
  'invite links without a name'() {
    assert.deepEqual(parseInvite(`#join=abc.${'0'.repeat(32)}`), { cid: 'abc', token: '0'.repeat(32), name: '' });
  },
  'bad invite links are refused'() {
    for (const h of ['', null, '#join=', '#join=abc.xyz', `#join=AB.${'0'.repeat(32)}`, `#join=abc.${'0'.repeat(31)}`, `#x=abc.${'0'.repeat(32)}`]) assert.equal(parseInvite(h), null, String(h));
  },
  'a broken name encoding gives an empty name'() {
    assert.equal(parseInvite(`#join=abc.${'0'.repeat(32)}&name=%E0%A4%A`).name, '');
  },
};
