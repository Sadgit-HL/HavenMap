import assert from 'node:assert/strict';
import { normalize, zoneOf, handList, ownsItem } from '../../scripts/campaign/record.js';
import { lendFromSupply, returnToSupply, drawMedPack, moveCard, setItemState } from '../../scripts/campaign/edit.js';
import { MED_PACKS, QM_ITEMS, supplyKey, inSupply, lentTo, lentOf, lentCardCount, cleanSup, isSupplyCard } from '../../scripts/campaign/supply.js';
import { describeChange } from '../../scripts/campaign/changelog.js';
import { withChars } from './helpers.mjs';

const ch = (r, cid) => r.chars.find(c => c.id === cid);
const pack = MED_PACKS[2], key = supplyKey('c', pack), qm = QM_ITEMS[3], qkey = supplyKey('i', qm);

export const tests = {
  'supply: six medical packs and nine quartermaster items, all in the supply of a new record'() {
    const r = withChars(2);
    assert.equal(MED_PACKS.length, 6);
    assert.equal(QM_ITEMS.length, 9);
    assert.equal(inSupply(r, 'c').length, 6);
    assert.equal(inSupply(r, 'i').length, 9);
    assert.ok(isSupplyCard(pack) && !isSupplyCard(1));
  },
  'supply: a lent medical pack is a card in the hand of the receiver, a quartermaster item an equipped item without slot'() {
    const r = withChars(2), [a, b] = r.chars.map(c => c.id);
    const n = lendFromSupply(lendFromSupply(r, key, a), qkey, b);
    assert.equal(lentTo(n, key), a);
    assert.equal(lentTo(n, qkey), b);
    assert.equal(zoneOf(ch(n, a), pack), 'hand');
    assert.ok(handList(ch(n, a)).includes(pack));
    assert.ok(ownsItem(ch(n, b), qm));
    assert.deepEqual(ch(n, b).items.find(it => String(it.id) === qm), { id: qm, st: [false, false, false], s: 0 });
    assert.equal(inSupply(n, 'c').length, 5);
    assert.deepEqual(lentOf(n, a), [key]);
    assert.equal(lentCardCount(n, ch(n, a)), 1, 'lent packs do not count against the hand limit');
    assert.equal(ch(r, a).deck.includes(pack), false, 'the record passed in is not changed');
  },
  'supply: a lent card cannot be lent again, unknown keys and characters are refused'() {
    const r = withChars(2), [a, b] = r.chars.map(c => c.id), n = lendFromSupply(r, key, a);
    assert.equal(lendFromSupply(n, key, b), n);
    assert.equal(lendFromSupply(r, 'c:1', a), r);
    assert.equal(lendFromSupply(r, 'i:7', a), r);
    assert.equal(lendFromSupply(r, key, 'c99'), r);
  },
  'supply: a medical pack that is discarded or lost goes back to the supply at once'() {
    for (const dest of ['discard', 'lost']) {
      const r = withChars(1), a = r.chars[0].id, n = moveCard(lendFromSupply(r, key, a), a, pack, dest);
      assert.equal(lentTo(n, key), null, dest);
      assert.equal(ch(n, a).deck.includes(pack), false);
      assert.equal(ch(n, a).disc.includes(pack) || ch(n, a).lost.includes(pack), false, 'it is in no pile');
      assert.equal(inSupply(n, 'c').length, 6);
    }
  },
  'supply: a medical pack in a play slot or the active area stays lent'() {
    const r = withChars(1), a = r.chars[0].id, n = lendFromSupply(r, key, a);
    const played = moveCard(n, a, pack, 'play1');
    assert.equal(lentTo(played, key), a);
    assert.equal(zoneOf(ch(played, a), pack), 'play1');
    assert.equal(lentTo(moveCard(n, a, pack, 'active'), key), a);
    assert.equal(lentTo(moveCard(played, a, pack, 'discard'), key), null, 'discarded from the slot');
  },
  'supply: a quartermaster item that is spent or consumed goes back, one that is only available stays'() {
    for (const s of [1, 2]) {
      const r = withChars(1), a = r.chars[0].id, n = setItemState(lendFromSupply(r, qkey, a), a, qm, s);
      assert.equal(lentTo(n, qkey), null, 'state ' + s);
      assert.equal(ownsItem(ch(n, a), qm), false);
      assert.equal(inSupply(n, 'i').length, 9);
    }
    const r = withChars(1), a = r.chars[0].id, n = lendFromSupply(r, qkey, a);
    assert.equal(lentTo(setItemState(n, a, qm, 0), qkey), a);
  },
  'supply: Take back puts a card or an item back, markers on it go with it'() {
    const r = withChars(2), [a, b] = r.chars.map(c => c.id);
    let n = lendFromSupply(lendFromSupply(r, key, a), qkey, b);
    n = { ...n, chars: n.chars.map(c => (c.id === a ? { ...c, mk: { ['c:' + pack]: [{ k: 'plus_one', s: 1, x: 10, y: 10 }] } } : c)) };
    const back = returnToSupply(returnToSupply(n, key), qkey);
    assert.equal(Object.keys(back.sup).length, 0);
    assert.equal(ch(back, a).mk['c:' + pack], undefined);
    assert.equal(ownsItem(ch(back, b), qm), false);
    assert.equal(returnToSupply(back, key), back, 'nothing to take back');
  },
  'supply: the draw takes one of the packs in the supply, random or the one a roll gave'() {
    const r = withChars(1), a = r.chars[0].id;
    for (let i = 0; i < MED_PACKS.length; i++) assert.equal(lentTo(drawMedPack(r, a, () => (i + 0.5) / MED_PACKS.length), supplyKey('c', MED_PACKS[i])), a);
    assert.equal(lentTo(drawMedPack(r, a, () => 0, MED_PACKS[4]), supplyKey('c', MED_PACKS[4])), a, 'a roll gives the pack');
    let n = r;
    for (let i = 0; i < 6; i++) n = drawMedPack(n, a, () => 0);
    assert.equal(inSupply(n, 'c').length, 0);
    assert.deepEqual([...lentOf(n, a)].sort(), MED_PACKS.map(id => supplyKey('c', id)).sort());
    assert.equal(drawMedPack(n, a, () => 0), n, 'nothing left in the supply');
    const one = lendFromSupply(r, key, a);
    assert.equal(drawMedPack(one, a, () => 0, pack), one, 'a pack that is lent already cannot be the pick');
  },
  'supply: a returned pack can be drawn again'() {
    const r = withChars(1), a = r.chars[0].id;
    const n = returnToSupply(lendFromSupply(r, key, a), key);
    assert.equal(lentTo(drawMedPack(n, a, () => 0, pack), key), a);
  },
  'supply: a loan whose holder lost the card is back in the supply (record repair)'() {
    const r = withChars(1), a = r.chars[0].id, n = lendFromSupply(r, key, a);
    const broken = { ...n, chars: n.chars.map(c => ({ ...c, deck: c.deck.filter(id => id !== pack) })) };
    assert.deepEqual(cleanSup(broken.sup, broken.chars), {});
    assert.deepEqual(normalize(broken).sup, {});
    assert.deepEqual(normalize(n).sup, { [key]: a }, 'a good loan survives a load');
    assert.deepEqual(cleanSup({ 'c:1': a, 'i:9': a, [key]: 'nobody' }, n.chars), {});
  },
  'supply: a character that loses everything gives the loans back'() {
    const r = withChars(1), a = r.chars[0].id, n = lendFromSupply(lendFromSupply(r, key, a), qkey, a);
    const wiped = { ...n, chars: n.chars.map(c => ({ ...c, deck: [], own: [], items: [] })) };
    assert.deepEqual(normalize(wiped).sup, {});
  },
  'supply: the history says who got what, and the character lines stay quiet'() {
    const r = withChars(2), [a, b] = r.chars.map(c => c.id), lent = lendFromSupply(r, key, a);
    const lines = describeChange(r, lent, { draw: 'random' }).map(e => e.d);
    assert.equal(lines.length, 1, JSON.stringify(lines));
    assert.match(lines[0], /^Medical Pack 3 lent to .* \(random\)$/);
    const back = describeChange(lent, moveCard(lent, a, pack, 'discard')).map(e => e.d);
    assert.equal(back.length, 1, JSON.stringify(back));
    assert.match(back[0], /^Medical Pack 3 back in the supply \(from /);
    const item = describeChange(r, lendFromSupply(r, qkey, b)).map(e => e.d);
    assert.equal(item.length, 1, JSON.stringify(item));
    assert.match(item[0], new RegExp('\\(' + qm + '\\) lent to'));
  },
};
