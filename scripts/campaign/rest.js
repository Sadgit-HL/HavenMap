// Short rest of a character: pure helpers (no record changes; those are shortRest and shortRestRedo in edit.js).
//
// Rule as the owner defined it (2026-11-20): a short rest loses one card of the discard pile at random and returns the rest of the pile
// to the hand. Once per rest the player may take 1 damage to redo it: the first card goes back to the hand (it is not part of the
// new pick) and one of the other cards of the pile is lost at random instead. A rest needs at least two cards in the discard pile.
//
// The record keeps the last rest in chars[].rest = { x, pool, first?, redo? }
//   x      the card now lost by the rest
//   pool   the cards of the discard pile when the rest began (x included)
//   first  after a redo: the card that was lost first, now back in the hand
//   redo   1 after a redo (a rest is redone only once)
// No imports: record.js uses cleanRest.

export const REST_MIN = 2;

// The cards of the discard pile that take part (cards of the deck; a stale id is left alone).
export const restPool = c => (c.disc || []).filter(id => (c.deck || []).includes(id));
export const canShortRest = c => restPool(c).length >= REST_MIN;

const inHand = (c, id) => !(c.lost || []).includes(id) && !(c.disc || []).includes(id) && !(c.act || []).includes(id) && !(c.play || []).some(p => p && p.id === id);

// The last rest can be redone while it has not been redone, its lost card is still lost and every other card of its pile is still in
// the hand: once one of them is played, moved or lost, the rest is over.
export function restRedoable(c) {
  const rs = c?.rest;
  if (!rs || rs.redo || !Array.isArray(rs.pool) || rs.pool.length < REST_MIN || !(c.lost || []).includes(rs.x)) return false;
  return rs.pool.every(id => id === rs.x || inHand(c, id));
}

// The cleaned rest of a character as saved in the record, or null.
export function cleanRest(rs, deck = []) {
  if (!rs || typeof rs !== 'object' || Array.isArray(rs)) return null;
  const id = v => Number.isInteger(v) && deck.includes(v);
  const pool = Array.isArray(rs.pool) ? [...new Set(rs.pool.filter(id))] : [];
  if (!id(rs.x) || !pool.includes(rs.x) || pool.length < REST_MIN) return null;
  const out = { x: rs.x, pool };
  if (id(rs.first) && pool.includes(rs.first) && rs.first !== rs.x) out.first = rs.first;
  if (rs.redo) out.redo = 1;
  return out;
}
