import assert from 'node:assert/strict';
import { buyItem, sellItem, giveItem, returnItem, itemCost, sellPrice, setEquippedItems, setItemTaken } from '../../scripts/campaign/edit.js';
import { ownsItem } from '../../scripts/campaign/record.js';
import { ITEMS } from '../../scripts/campaign/itemList.js';
import { withChars, priced, unlock } from './helpers.mjs';

const it = priced[0], dear = priced[priced.length - 1];
const gold = (r, cid, g) => ({ ...r, chars: r.chars.map(c => c.id === cid ? { ...c, gold: g } : c) });

export const tests = {
  'sell price is half the cost rounded down'() {
    for (const i of priced.slice(0, 50)) assert.equal(sellPrice(i.id), Math.floor(itemCost(i.id) / 2));
  },
  'unknown or non-coin items have no cost'() {
    assert.equal(itemCost('nope'), null);
    assert.equal(sellPrice('nope'), null);
  },
  'buy pays the cost and gives the item'() {
    let r = unlock(withChars(1), it.id); const cid = r.chars[0].id, cost = itemCost(it.id);
    r = gold(r, cid, cost + 3);
    const b = buyItem(r, cid, it.id);
    assert.equal(b.chars[0].gold, 3);
    assert.ok(ownsItem(b.chars[0], it.id));
  },
  'buy is refused with too little gold'() {
    let r = unlock(withChars(1), dear.id); const cid = r.chars[0].id;
    r = gold(r, cid, itemCost(dear.id) - 1);
    assert.equal(buyItem(r, cid, dear.id), r);
  },
  'buy is refused for a locked item and for an item already owned'() {
    let r = gold(withChars(1), 1, 999); const cid = r.chars[0].id;
    assert.equal(buyItem(r, cid, it.id), r);
    r = gold(unlock(r, it.id), cid, 999);
    const b = buyItem(r, cid, it.id);
    assert.equal(buyItem(b, cid, it.id), b);
  },
  'buy is refused when no copy is left'() {
    let r = unlock(withChars(2), it.id); const [a, b] = r.chars.map(c => c.id), n = ITEMS.find(i => i.id === it.id).n || 0;
    r = gold(gold(r, a, 999), b, 999);
    let cur = r;
    for (let k = 0; k < n; k++) { const who = k % 2 ? b : a; if (ownsItem(cur.chars.find(c => c.id === who), it.id)) break; cur = buyItem(cur, who, it.id); }
    const other = cur.chars.find(c => !ownsItem(c, it.id));
    if (other && cur.chars.filter(c => ownsItem(c, it.id)).length >= n) assert.equal(buyItem(cur, other.id, it.id), cur);
  },
  'sell returns the item and pays half the cost'() {
    let r = unlock(withChars(1), it.id); const cid = r.chars[0].id;
    r = giveItem(r, cid, it.id);
    const s = sellItem(r, cid, it.id);
    assert.equal(s.chars[0].gold, sellPrice(it.id));
    assert.ok(!ownsItem(s.chars[0], it.id));
  },
  'sell removes an equipped item too'() {
    let r = unlock(withChars(1), it.id); const cid = r.chars[0].id;
    r = giveItem(r, cid, it.id);
    r = setEquippedItems(r, cid, [it.id]);
    const s = sellItem(r, cid, it.id);
    assert.equal(s.chars[0].items.length, 0);
  },
  'sell of an item not owned changes nothing'() {
    const r = unlock(withChars(1), it.id);
    assert.equal(sellItem(r, r.chars[0].id, it.id), r);
  },
  'sell caps gold at 9999'() {
    let r = unlock(withChars(1), it.id); const cid = r.chars[0].id;
    r = gold(giveItem(r, cid, it.id), cid, 9999);
    assert.equal(sellItem(r, cid, it.id).chars[0].gold, 9999);
  },
  'return leaves gold alone'() {
    let r = unlock(withChars(1), it.id); const cid = r.chars[0].id;
    r = giveItem(r, cid, it.id);
    assert.equal(returnItem(r, cid, it.id).chars[0].gold, 0);
  },
  'edits do not mutate the input'() {
    let r = unlock(withChars(1), it.id); const cid = r.chars[0].id;
    r = gold(r, cid, 999);
    const snap = JSON.stringify(r);
    buyItem(r, cid, it.id);
    assert.equal(JSON.stringify(r), snap);
  },
};
