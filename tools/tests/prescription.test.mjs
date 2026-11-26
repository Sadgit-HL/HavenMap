import assert from 'node:assert/strict';
import { CARDS } from '../../scripts/games/gh2_cards.js';
import { normalize, zoneOf, handList, classByName } from '../../scripts/campaign/record.js';
import { moveCard, givePrescription, returnPrescription, addMarker } from '../../scripts/campaign/edit.js';
import { rxHeld } from '../../scripts/campaign/prescription.js';
import { withChars } from './helpers.mjs';

const ch = (r, cid) => r.chars.find(c => c.id === cid);
// two characters; the first has a card of its class in play slot 1
function setup() {
  const r = normalize(withChars(2)), [a, b] = r.chars.map(c => c.id), klass = classByName(ch(r, a).cls);
  const card = CARDS.find(k => k.cls === klass.i).id;
  const n = moveCard({ ...r, chars: r.chars.map(c => (c.id === a ? { ...c, deck: [card] } : c)) }, a, card, 'play1');
  return { r: n, a, b, card };
}

export const tests = {
  'prescription: a played card is given to another character, who holds it in the active area; the owner keeps it in the deck'() {
    const { r, a, b, card } = setup();
    assert.equal(zoneOf(ch(r, a), card), 'play1');
    const n = givePrescription(r, a, card, b);
    assert.equal(zoneOf(ch(n, a), card), 'lent');
    assert.equal(ch(n, a).play[0], null);
    assert.ok(ch(n, a).deck.includes(card) && !ch(n, b).deck.includes(card));
    assert.equal(handList(ch(n, a)).includes(card), false);
    assert.deepEqual(rxHeld(n.chars, b), [{ owner: a, card }]);
    assert.deepEqual(rxHeld(n.chars, a), []);
  },
  'prescription: only a card in a play slot can be given, not to oneself or to an unknown character'() {
    const { r, a, b, card } = setup();
    assert.equal(givePrescription(r, a, card, a), r);
    assert.equal(givePrescription(r, a, card, 'c99'), r);
    const inHand = moveCard(r, a, card, 'hand');
    assert.equal(givePrescription(inHand, a, card, b), inHand);
  },
  'prescription: a given card cannot be moved by the owner; the token is a marker of the owner and goes when the card is returned'() {
    const { r, a, b, card } = setup();
    const n = addMarker(givePrescription(r, a, card, b), a, `c:${card}`, { k: 'plus_one', s: 1, x: 50, y: 50 });
    assert.equal(moveCard(n, a, card, 'discard'), n);
    assert.equal(ch(n, a).mk[`c:${card}`].length, 1);
    assert.equal(ch(returnPrescription(n, a, card, 'discard'), a).mk[`c:${card}`], undefined);
  },
  'prescription: returned to the discard or lost pile of the owner'() {
    const { r, a, b, card } = setup();
    const n = givePrescription(r, a, card, b);
    const d = returnPrescription(n, a, card, 'discard'), l = returnPrescription(n, a, card, 'lost');
    assert.equal(zoneOf(ch(d, a), card), 'discard');
    assert.equal(zoneOf(ch(l, a), card), 'lost');
    assert.equal(ch(d, a).rx, undefined);
    assert.equal(returnPrescription(n, a, card, 'hand'), n);
    assert.equal(returnPrescription(d, a, card, 'discard'), d);
  },
  'prescription: repair on load drops an entry whose receiver is gone (card to the discard pile) or whose card left the deck'() {
    const { r, a, b, card } = setup();
    const n = givePrescription(r, a, card, b);
    const gone = normalize({ ...n, chars: n.chars.filter(c => c.id !== b) });
    assert.equal(zoneOf(ch(gone, a), card), 'discard');
    assert.equal(ch(gone, a).rx, undefined);
    const noCard = normalize({ ...n, chars: n.chars.map(c => (c.id === a ? { ...c, deck: c.deck.filter(x => x !== card) } : c)) });
    assert.equal(ch(noCard, a).rx, undefined);
    const kept = normalize(n);
    assert.equal(zoneOf(ch(kept, a), card), 'lent');
  },
};
