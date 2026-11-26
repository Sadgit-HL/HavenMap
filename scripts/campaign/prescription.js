// Prescription cards of the Sawbones. A played prescription is given to another character and sits in that character's active area; it stays a
// card of the Sawbones. Pure data logic, no DOM and no storage.
//
// The owner keeps the card in `deck` and in `rx`: chars[owner].rx = { <card id>: { to: charId, n: token slot } }. A card in rx is in no other zone of the
// owner (zoneOf says 'lent'), and it is never added to the deck of the receiver. The character token sits on the card as an ordinary marker of the owner
// (chars[owner].mk['c:<card id>']); the receiver's active area shows the card with the owner's markers, and the marker editor works on the owner.
// scripts/campaign/edit.js gives, steps and returns; cleanRx repairs a record in which an entry and the cards disagree.
// The prescriptions a character holds: [{ owner, card }] over all characters.
export const rxHeld = (chars, cid) => (chars || []).flatMap(o => Object.entries(o.rx || {}).filter(([, e]) => e.to === cid).map(([id]) => ({ owner: o.id, card: Number(id) })));

// An entry whose receiver no longer exists (or is the owner) or whose card left the owner's deck is dropped and the card goes to the discard pile of its owner. Changes the chars it is given.
export function cleanRx(chars) {
  for (const ch of chars || []) {
    if (!ch.rx) continue;
    for (const [id, e] of Object.entries(ch.rx)) {
      const card = Number(id);
      if ((chars || []).some(x => x.id === e.to && x.id !== ch.id) && (ch.deck || []).includes(card)) continue;
      delete ch.rx[id];
      if (ch.mk) delete ch.mk[`c:${card}`];                                           // the token on the card goes with it
      if (!(ch.deck || []).includes(card)) continue;                                  // the owner no longer has the card: nothing to put back
      if (!(ch.disc || []).includes(card) && !(ch.lost || []).includes(card)) ch.disc = [...(ch.disc || []), card];
    }
    if (!Object.keys(ch.rx).length) delete ch.rx;
  }
  return chars;
}

// The entries of one character in their stored form, as far as they can be checked without the other characters.
export function cleanRxOf(rx, deck, taken) {
  const out = {};
  if (!rx || typeof rx !== 'object' || Array.isArray(rx)) return out;
  for (const [k, e] of Object.entries(rx)) {
    const id = Number(k);
    if (!Number.isInteger(id) || !deck.includes(id) || taken.has(id) || !e || typeof e.to !== 'string') continue;
    out[id] = { to: e.to };
    taken.add(id);
  }
  return out;
}
