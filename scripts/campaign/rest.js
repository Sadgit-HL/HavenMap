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
//   roll   1 when the player chose the card after a GeekRoller (BGG) roll instead of the app's random pick
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

// The cards a BGG roll is over: the discard pile for a rest, the pile without the first lost card for the redo ([] when not allowed).
export const restCandidates = (c, redo) => (redo ? (restRedoable(c) ? c.rest.pool.filter(id => id !== c.rest.x) : []) : (canShortRest(c) ? restPool(c) : []));

// BGG caps a whole GeekRoller code at 241 characters (see scripts/amd/heroDeck.js).
export const REST_CODE_MAX = 241;

// GeekRoller code that rolls one of the given card names: 1custom<n>{name;name;...}. A long pile gets shortened names (each cut to the
// same length, as long as they stay different) so the code fits; '' when there are fewer than two cards or no short enough names exist.
export function restRollCode(names) {
  const list = names.map(n => String(n).replace(/[\u2010-\u2015]/g, '-').replace(/[;{}]/g, ' ').trim());
  if (list.length < REST_MIN) return '';
  for (let max = Math.max(...list.map(s => s.length)); max >= 6; max--) {
    const labels = list.map(s => (s.length > max ? s.slice(0, max).trimEnd() : s));
    const code = `1custom${labels.length}{${labels.join(';')}}`;
    if (code.length <= REST_CODE_MAX && new Set(labels).size === labels.length) return code;
  }
  return '';
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
  if (rs.roll) out.roll = 1;
  return out;
}
