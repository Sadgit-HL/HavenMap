// The supply of the Sawbones (the six medical packs) and the Quartermaster (items QM1 to QM9). Pure data logic, no DOM and no storage.
//
// A supply card is lent to a character and goes back to the supply as soon as it is discarded: a medical pack when it reaches the discard or lost
// pile, a quartermaster item when it is spent or consumed. record.sup holds the loans: { 'c:1530': 'c2', 'i:QM3': 'c1' } = card (or item) lent to the
// character with that id; a key that is not listed is in the supply. While it is lent, a medical pack is a card in the deck of the character (so
// the hand, the play slots and the piles work as they do for any card) and a quartermaster item is an owned and equipped item (it takes no slot).
// scripts/campaign/edit.js lends and returns; cleanSup repairs a record in which a loan and the holding of the card disagree.
import { CLASSES } from '../games/gh2_classes.js';
import { CARDS } from '../games/gh2_cards.js';
import { ITEMS } from './itemList.js';

const SAWBONES = CLASSES.find(k => k.name === 'Sawbones');
export const MED_PACKS = SAWBONES ? CARDS.filter(c => c.cls === SAWBONES.i && c.lv === 'M').map(c => c.id) : [];
export const QM_ITEMS = ITEMS.filter(i => i.kind === 'qm').map(i => String(i.id));
const MED = new Set(MED_PACKS), QM = new Set(QM_ITEMS);

export const SUPPLY_OWNER = { c: 'Sawbones', i: 'Quartermaster' };                    // the class whose site shows the supply
export const supplyKey = (kind, id) => `${kind}:${id}`;                              // 'c:1530' (a medical pack), 'i:QM3' (an item)
export const isSupplyCard = id => MED.has(Number(id));
export const isSupplyItem = id => QM.has(String(id));
export const validSupplyKey = key => /^c:\d+$/.test(key) ? MED.has(Number(key.slice(2))) : /^i:\w+$/.test(key) ? QM.has(key.slice(2)) : false;
export const allSupplyKeys = () => [...MED_PACKS.map(id => supplyKey('c', id)), ...QM_ITEMS.map(id => supplyKey('i', id))];

// The character a card or item is lent to, or null when it is in the supply.
export const lentTo = (r, key) => (r && r.sup && r.sup[key]) || null;
// The keys of one kind ('c' or 'i') that are in the supply.
export const inSupply = (r, kind) => (kind === 'c' ? MED_PACKS.map(id => supplyKey('c', id)) : QM_ITEMS.map(id => supplyKey('i', id))).filter(k => !lentTo(r, k));
// The keys lent to one character.
export const lentOf = (r, cid) => Object.keys(r.sup || {}).filter(k => r.sup[k] === cid);
// How many lent medical packs a character holds: they do not count against the hand limit.
export const lentCardCount = (r, c) => lentOf(r, c.id).filter(k => k.startsWith('c:') && (c.deck || []).includes(Number(k.slice(2)))).length;

// A record's loans, repaired: only known keys, only characters that exist, and only while the character still holds the card (in its deck) or the item
// (owned); anything else is back in the supply.
export function cleanSup(sup, chars) {
  const out = {};
  if (!sup || typeof sup !== 'object' || Array.isArray(sup)) return out;
  for (const [key, cid] of Object.entries(sup)) {
    if (!validSupplyKey(key)) continue;
    const c = (chars || []).find(x => x.id === cid);
    if (!c) continue;
    const holds = key.startsWith('c:') ? (c.deck || []).includes(Number(key.slice(2))) : (c.own || []).some(i => String(i) === key.slice(2)) || (c.items || []).some(it => String(it.id) === key.slice(2));
    if (holds) out[key] = cid;
  }
  return out;
}
