import assert from 'node:assert/strict';
import { zoneOf, handList, normalize } from '../../scripts/campaign/record.js';
import { shortRest, shortRestRedo, moveCard } from '../../scripts/campaign/edit.js';
import { restRedoable, canShortRest } from '../../scripts/campaign/rest.js';
import { describeChange } from '../../scripts/campaign/changelog.js';
import { CARDS } from '../../scripts/games/gh2_cards.js';
import { CLASSES } from '../../scripts/games/gh2_classes.js';
import { withChars } from './helpers.mjs';

// A character with n level 1 cards; the first `disc` of them are in the discard pile, the rest in the hand.
function setup(n = 6, disc = 4, extra = {}) {
  let r = withChars(1); const c0 = r.chars[0], klass = CLASSES.find(k => k.name === c0.cls);
  const ids = CARDS.filter(k => k.cls === klass.i).slice(0, n).map(k => k.id);
  r = { ...r, chars: r.chars.map(c => ({ ...c, deck: ids, bench: [], disc: ids.slice(0, disc), act: [], lost: [], play: [null, null], hord: null, hgrid: null, ...extra })) };
  return { r, cid: r.chars[0].id, ids, pile: ids.slice(0, disc), hand: ids.slice(disc) };
}
const ch = (r, cid) => r.chars.find(c => c.id === cid);
const at = i => () => i;                                 // a fixed "random" number

export const tests = {
  'short rest loses the picked card and returns the rest of the discard pile to the hand'() {
    const { r, cid, pile } = setup(), x = pile[2];
    const n = shortRest(r, cid, () => 2.5 / pile.length), c = ch(n, cid);
    assert.deepEqual(c.lost, [x]);
    assert.deepEqual(c.disc, []);
    for (const id of pile) assert.equal(zoneOf(c, id), id === x ? 'lost' : 'hand');
    assert.deepEqual(c.rest, { x, pool: pile });
  },
  'short rest needs two cards in the discard pile'() {
    const { r, cid } = setup(6, 1);
    assert.equal(canShortRest(ch(r, cid)), false);
    assert.equal(shortRest(r, cid, at(0)), r);
    const none = setup(6, 0);
    assert.equal(shortRest(none.r, none.cid, at(0)), none.r);
  },
  'every card of the pile can be the lost one, each equally likely'() {
    const { r, cid, pile } = setup(), seen = new Map();
    const N = 1000;
    for (let i = 0; i < N; i++) { const x = ch(shortRest(r, cid, () => i / N), cid).rest.x; seen.set(x, (seen.get(x) || 0) + 1); }
    assert.deepEqual([...seen.keys()].sort(), [...pile].sort());
    for (const k of seen.values()) assert.equal(k, N / pile.length);
  },
  'a stale id in the discard pile is left alone'() {
    const { r, cid, pile } = setup(), bad = 999999;
    const n = shortRest({ ...r, chars: r.chars.map(c => ({ ...c, disc: [bad, ...c.disc] })) }, cid, at(0));
    assert.ok(ch(n, cid).disc.includes(bad));
    assert.ok(!ch(n, cid).rest.pool.includes(bad));
    assert.ok(pile.includes(ch(n, cid).rest.x));
  },
  'a manual hand order keeps the returned cards at the end'() {
    const { r, cid, pile, hand } = setup(6, 4, { hord: [] });
    const r0 = { ...r, chars: r.chars.map(c => ({ ...c, hord: [...hand] })) };
    const c = ch(shortRest(r0, cid, at(0)), cid);
    assert.deepEqual(c.hord, [...hand, ...pile.slice(1)]);
  },
  'redo: the first card goes back to the hand and is not picked again, another card is lost'() {
    const { r, cid, pile } = setup();
    const a = shortRest(r, cid, at(0)), x = ch(a, cid).rest.x;
    assert.equal(x, pile[0]);
    assert.ok(restRedoable(ch(a, cid)));
    for (let i = 0; i < 20; i++) {                                      // never the first card, whatever the number
      const b = shortRestRedo(a, cid, () => i / 20), c = ch(b, cid);
      assert.notEqual(c.rest.x, x);
      assert.deepEqual(c.lost, [c.rest.x]);
      assert.equal(zoneOf(c, x), 'hand');
      assert.equal(c.rest.first, x);
      assert.equal(c.rest.redo, 1);
      for (const id of pile) assert.equal(zoneOf(c, id), id === c.rest.x ? 'lost' : 'hand');
    }
    const b = shortRestRedo(a, cid, at(0.99));
    assert.equal(ch(b, cid).rest.x, pile.at(-1));
  },
  'a rest is redone once only'() {
    const { r, cid } = setup(), a = shortRest(r, cid, at(0)), b = shortRestRedo(a, cid, at(0));
    assert.equal(restRedoable(ch(b, cid)), false);
    assert.equal(shortRestRedo(b, cid, at(0)), b);
  },
  'no redo once a card of the pile was moved, or when there is nothing to redo'() {
    const { r, cid, pile } = setup(), a = shortRest(r, cid, at(0));
    assert.equal(shortRestRedo(r, cid, at(0)), r, 'no rest yet');
    const played = moveCard(a, cid, pile[1], 'play1');
    assert.equal(restRedoable(ch(played, cid)), false);
    assert.equal(shortRestRedo(played, cid, at(0)), played);
    const lostMore = moveCard(a, cid, pile[1], 'lost');
    assert.equal(restRedoable(ch(lostMore, cid)), false);
    const back = moveCard(a, cid, pile[0], 'hand');                       // the lost card taken back by hand
    assert.equal(restRedoable(ch(back, cid)), false);
  },
  'a pile of two: the redo takes the other card'() {
    const { r, cid, pile } = setup(6, 2), a = shortRest(r, cid, at(0)), b = shortRestRedo(a, cid, at(0));
    assert.equal(ch(a, cid).rest.x, pile[0]);
    assert.equal(ch(b, cid).rest.x, pile[1]);
  },
  'normalize keeps a valid rest and drops a broken one'() {
    const { r, cid, pile } = setup(), a = shortRest(r, cid, at(0));
    assert.deepEqual(ch(normalize(a), cid).rest, ch(a, cid).rest);
    const bad = x => ch(normalize({ ...a, chars: a.chars.map(c => ({ ...c, rest: x })) }), cid).rest;
    assert.equal(bad({ x: 999999, pool: [999999, pile[1]] }), undefined);
    assert.equal(bad({ x: pile[0], pool: [pile[0]] }), undefined, 'a pool of one is no rest');
    assert.equal(bad('x'), undefined);
    assert.deepEqual(bad({ x: pile[0], pool: [pile[0], pile[0], pile[1], 999999], redo: true }), { x: pile[0], pool: [pile[0], pile[1]], redo: 1 });
  },
  'History: one line for the rest and one for the redo, not a line per card'() {
    const { r, cid } = setup(), a = shortRest(r, cid, at(0)), b = shortRestRedo(a, cid, at(0));
    const l1 = describeChange(r, a), l2 = describeChange(a, b);
    assert.equal(l1.length, 1);
    assert.equal(l1[0].kind, 'Short rest');
    assert.match(l1[0].d, /short rest, lost /);
    assert.equal(l2.length, 1);
    assert.match(l2[0].d, /redone \(1 damage\)/);
  },
  'the cards stay in exactly one place'() {
    const { r, cid, ids } = setup(), a = shortRestRedo(shortRest(r, cid, at(0)), cid, at(0.5)), c = ch(a, cid);
    const all = [...c.disc, ...c.lost, ...c.act, ...handList(c)];
    assert.deepEqual([...all].sort(), [...ids].sort());
  },
};
