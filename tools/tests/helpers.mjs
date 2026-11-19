import { emptyRecord } from '../../scripts/campaign/record.js';
import { addCharacter, availableClasses, setItemUnlocked, itemCost } from '../../scripts/campaign/edit.js';
import { ITEMS } from '../../scripts/campaign/itemList.js';

export const first = (n = 1) => availableClasses(emptyRecord()).slice(0, n).map(c => c.name);
// A record with n characters (distinct classes, ids from the record).
export function withChars(n = 1) {
  let r = emptyRecord();
  first(n).forEach((cls, i) => { r = addCharacter(r, { cls, name: `T${i + 1}` }); });
  return r;
}
// Coin items that have a cost; the cheapest and a dearer one.
export const priced = ITEMS.filter(i => itemCost(i.id) !== null && itemCost(i.id) >= 2).sort((a, b) => itemCost(a.id) - itemCost(b.id));
export const unlock = (r, ...ids) => ids.reduce((x, id) => setItemUnlocked(x, id, true), r);
