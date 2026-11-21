import assert from 'node:assert/strict';
import { cardTerms, compareCards, selectCard } from '../../scripts/campaign/amdCompare.js';
import { amOwner, deckOf, drawState, drawTwo, amdAct, isRolling, perkList } from '../../scripts/campaign/amdDeck.js';
import { charAm, monAm } from '../../scripts/campaign/edit.js';
import { emptyRecord } from '../../scripts/campaign/record.js';
import { CLASSES } from '../../scripts/games/gh2_classes.js';
import { withChars } from './helpers.mjs';

const num = n => ({ kind: 'num', num: n, effects: [] });
const fx = (n, ...e) => ({ kind: 'num', num: n, effects: e.sort() });
const X2 = { kind: 'x2', num: 0, effects: [] }, MISS = { kind: 'miss', num: 0, effects: [] };
const order = (a, b, attack) => compareCards(a, b, attack).order;
const M = amOwner('m');
const all = { p0: 6, p1: 5, m1: 5, p2: 1, m2: 1, x2: 1, miss: 1 };

// a class and a perk that give a rolling card
let found = null;
for (const k of CLASSES) for (const p of perkList(k.name)) {
  const c = { cls: k.name, pk: { perks: [p.index] } }, t = deckOf(c).find(x => isRolling(x) && x.base > 0 && x.card?.kind === 'shared');
  if (t && !found) found = { c, key: t.key };
}

export const tests = {
  'FAQ examples: x2 with the attack value'() {
    assert.equal(order(X2, num(2), 2), 0, 'x2 at attack 2 equals +2: equal (the FAQ calls it ambiguous, N is used)');
    assert.equal(order(X2, num(1), 2), 1, 'x2 at attack 2 beats +1');
    assert.equal(order(num(1), X2, 2), -1);
    assert.equal(compareCards(X2, num(1)).needAttack, true, 'without the attack value a x2 cannot be compared with a number');
    assert.equal(order(X2, X2), 0, 'two x2 cards are equal whatever the attack');
    assert.equal(order(X2, MISS), 1, 'x2 beats a Miss without the attack value');
    assert.equal(compareCards(X2, MISS).needAttack, undefined);
  },
  'FAQ examples: effects have a positive but unknown value'() {
    assert.equal(order(fx(1, 'stun'), num(1)), 1, '+1 Stun beats +1');
    assert.equal(order(num(1), fx(1, 'stun')), -1);
    assert.equal(order(fx(0, 'stun'), num(2)), null, '+0 Stun against +2 is ambiguous');
    assert.equal(order(num(2), fx(0, 'stun')), null);
    assert.equal(order(fx(1, 'stun'), fx(1, 'fire')), null, 'different effects');
    assert.equal(order(fx(1, 'stun'), fx(2, 'fire')), null, 'different effects: the numbers do not matter');
    assert.equal(order(fx(0, 'muddle'), fx(2, 'stun')), null);
    assert.equal(order(fx(1, 'stun'), fx(0, 'stun')), 1, 'the same effect on both: the numbers decide');
    assert.equal(order(fx(0, 'stun'), fx(1, 'stun')), -1);
    assert.equal(order(fx(1, 'stun'), fx(1, 'stun')), 0);
    assert.equal(order(fx(0, 'stun'), num(0)), 1, 'an effect card with an equal number beats a plain one');
    assert.equal(order(fx(0, 'stun'), num(-1)), 1);
    assert.equal(order(fx(1, 'fire', 'stun'), fx(1, 'stun')), null, 'one effect against two is not the same effect');
  },
  'comparing plain cards, Miss, and x2 against a card with an effect'() {
    assert.equal(order(num(1), num(0)), 1);
    assert.equal(order(num(-2), num(-1)), -1);
    assert.equal(order(num(0), num(0)), 0);
    assert.equal(order(MISS, num(-2)), -1, 'Miss is worse than every card');
    assert.equal(order(fx(5, 'stun'), MISS), 1);
    assert.equal(order(MISS, MISS), 0);
    assert.equal(order(X2, fx(1, 'stun'), 1), -1, 'x2 at attack 1 is +1: the card with the effect is better');
    assert.equal(order(X2, fx(1, 'stun'), 3), null, 'x2 at attack 3 against +1 Stun: ambiguous');
    assert.equal(order(X2, fx(1, 'stun')), null);
    assert.equal(compareCards(X2, fx(1, 'stun'), null).needAttack, true);
    assert.equal(compareCards(X2, fx(1, 'stun'), 3).needAttack, undefined);
    assert.equal(order(X2, fx(1, 'stun'), ''), null, 'an empty field is no attack value');
  },
  'card terms: standard, shared, unique, imbuement, bless and curse cards'() {
    const tile = (o, st, key) => drawState(o, st).tiles.find(t => t.key === key);
    assert.deepEqual(cardTerms(tile(M, {}, 'p1')), { kind: 'num', num: 1, effects: [] });
    assert.deepEqual(cardTerms(tile(M, {}, 'm2')), { kind: 'num', num: -2, effects: [] });
    assert.equal(cardTerms(tile(M, {}, 'x2')).kind, 'x2');
    assert.equal(cardTerms(tile(M, {}, 'miss')).kind, 'miss');
    const A = drawState(M, { bless: 1, curse: 1 });
    assert.equal(cardTerms(A.specials.find(s => s.key === 'bless')).kind, 'x2');
    assert.equal(cardTerms(A.specials.find(s => s.key === 'curse')).kind, 'miss');
    const imb = amOwner('m', { imb: 2 }), it = k => cardTerms(drawState(imb, { adj: { [k]: 1 } }).tiles.find(t => t.key === k));
    assert.deepEqual(it('i2m'), { kind: 'num', num: 2, effects: ['muddle'] });
    assert.deepEqual(it('i3'), { kind: 'num', num: 3, effects: [] });
    assert.deepEqual(it('i0w'), { kind: 'num', num: 0, effects: ['wound'] });
    const sh = cardTerms(drawState(found.c, {}).tiles.find(t => t.key === found.key));
    assert.equal(sh.kind, 'num');
    assert.ok(sh.effects.length >= 1 && !sh.effects.some(e => /flip|rolling/.test(e)), `a shared rolling card: its effect words, not the rolling mark (${sh.effects})`);
    const unique = [];
    for (const k of CLASSES) for (const p of perkList(k.name)) for (const t of drawState({ cls: k.name, pk: { perks: [p.index] } }, {}).tiles) if (t.card?.kind === 'unique' && t.base > 0 && t.extra) unique.push(t);
    const withNumber = unique.find(t => /^\+\d:/.test(t.face)), withoutNumber = unique.find(t => !/^(\+|-)\d:|^2x:/.test(t.face));
    assert.ok(withNumber && withoutNumber);
    const w = cardTerms(withNumber);
    assert.equal(w.num, parseInt(withNumber.face, 10));
    assert.equal(w.effects.length, 1);
    assert.equal(w.effects[0], withNumber.face.replace(/^[+-]\d+:\s*/, '').replace(/\s*>\s*$/, '').toLowerCase());
    assert.equal(cardTerms(withoutNumber).num, 0, 'no number before a colon: +0');
  },
  'selection: a character with advantage chooses, nobody else does'() {
    const r = selectCard({ mode: 'adv', who: 'hero', n: num(0), c: num(2) });
    assert.deepEqual([r.choose, r.selected], [true, null]);
    assert.equal(selectCard({ mode: 'adv', who: 'monster', n: num(0), c: num(2) }).choose, false);
    assert.equal(selectCard({ mode: 'dis', who: 'hero', n: num(0), c: num(2) }).choose, false);
  },
  'selection: advantage of a monster takes the better card, disadvantage the worse'() {
    const sel = (mode, n, c, who = 'monster', attack) => selectCard({ mode, who, n, c, attack }).selected;
    assert.equal(sel('adv', num(0), num(2)), 'C');
    assert.equal(sel('adv', num(2), num(0)), 'N');
    assert.equal(sel('dis', num(2), num(0)), 'C');
    assert.equal(sel('dis', num(0), num(2)), 'N');
    assert.equal(sel('dis', num(2), num(0), 'hero'), 'C', 'the same for a character');
    assert.equal(sel('dis', fx(1, 'stun'), num(1)), 'C', 'the plain +1 is the worse card');
    assert.equal(sel('dis', num(1), fx(1, 'stun')), 'N');
    assert.equal(sel('adv', num(1), fx(1, 'stun')), 'C');
    assert.equal(sel('adv', MISS, num(0)), 'C');
    assert.equal(sel('dis', num(0), MISS), 'C');
  },
  'selection: ambiguous and equal cards give N, the card drawn first'() {
    for (const mode of ['adv', 'dis']) {
      const a = selectCard({ mode, who: 'monster', n: fx(0, 'stun'), c: num(2) });
      assert.deepEqual([a.selected, a.ambiguous], ['N', true]);
      assert.equal(selectCard({ mode, who: 'monster', n: num(2), c: fx(0, 'stun') }).selected, 'N');
      const e = selectCard({ mode, who: 'monster', n: num(1), c: num(1) });
      assert.deepEqual([e.selected, e.equal, e.ambiguous], ['N', true, false]);
      assert.equal(selectCard({ mode, who: 'monster', n: fx(1, 'stun'), c: fx(2, 'fire') }).selected, 'N');
    }
  },
  'selection: a x2 card needs the attack value, then it is compared'() {
    const r = selectCard({ mode: 'adv', who: 'monster', n: num(1), c: X2 });
    assert.deepEqual([r.selected, r.needAttack, r.ambiguous], ['N', true, false]);
    assert.equal(selectCard({ mode: 'adv', who: 'monster', n: num(1), c: X2, attack: 3 }).selected, 'C');
    assert.equal(selectCard({ mode: 'dis', who: 'monster', n: num(1), c: X2, attack: 3 }).selected, 'N');
    assert.equal(selectCard({ mode: 'dis', who: 'monster', n: X2, c: num(1), attack: 3 }).selected, 'C');
    assert.equal(selectCard({ mode: 'adv', who: 'hero', n: num(1), c: X2 }).needAttack, false, 'a character chooses: no attack value needed');
  },
  'selection: a missing second card or no card at all'() {
    assert.equal(selectCard({ mode: 'dis', who: 'monster', n: num(1), c: null }).selected, 'N');
    assert.equal(selectCard({ mode: 'adv', who: 'hero', n: num(1), c: null }).choose, false, 'one card: nothing to choose');
    assert.equal(selectCard({ mode: 'adv', who: 'monster', n: null, c: null }).selected, null);
  },
  'two-card draw: N, then one more card'() {
    const r = drawTwo(M, {}, () => 0);
    assert.deepEqual([r.rolling, r.n, r.second, r.drawn], [[], 'p0', 'p0', ['p0', 'p0']]);
    assert.equal(drawState(M, r.st).disc, 2, 'both cards are in the discard');
    const hi = drawTwo(M, {}, () => 0.999);
    assert.deepEqual([hi.n, hi.second], ['miss', 'x2'], 'the second draw takes the next card of what is left');
  },
  'two-card draw: rolling cards come first, and the rolling icon of the second card is ignored'() {
    const chain = drawTwo(found.c, { top: [found.key, found.key, 'p1'] }, () => 0);
    assert.ok(chain.rolling.length >= 1, 'the rolling cards on top come first');
    assert.ok(!isRolling(deckOf(found.c).find(t => t.key === chain.n)), 'N is not rolling');
    assert.equal(chain.drawn.length, chain.rolling.length + 2, 'the rolling cards, N and one more card');
    assert.equal(chain.drawn.at(-1), chain.second);
    const ignored = drawTwo(found.c, { top: ['p1', found.key] }, () => 0);
    assert.deepEqual([ignored.rolling, ignored.n, ignored.second], [[], 'p1', found.key], 'a rolling second card is not followed by another draw');
    assert.equal(ignored.drawn.length, 2);
  },
  'two-card draw: an empty deck is shuffled at once, the cards in play stay out of it'() {
    const nearly = { disc: { ...all, p0: 5 }, order: Object.keys(all) };            // one card left in the deck
    const r = drawTwo(M, nearly, () => 0), d = drawState(M, r.st);
    assert.deepEqual([r.n, r.second, r.drawn], ['p0', 'p0', ['p0', 'p0']], 'N is the last card, C comes from the shuffled deck');
    assert.deepEqual(r.shuffles, [1], 'N was in play and stayed out of the shuffle');
    assert.deepEqual([d.disc, d.pool], [2, 18], 'N and C are in the discard, everything else went back into the deck');
    const rest = drawTwo(M, { disc: all, order: Object.keys(all) }, () => 0);          // the deck is empty at the start
    assert.deepEqual([rest.n, rest.second, rest.shuffles], ['p0', 'p0', [0]]);
    const none = drawTwo(M, { adj: Object.fromEntries(Object.entries(all).map(([k, n]) => [k, -n])) }, () => 0);
    assert.deepEqual([none.n, none.second, none.drawn], [null, null, []], 'a deck without any card');
  },
  'two-card draw: only rolling cards left, the shuffle brings the card that counts'() {
    const onlyRolling = deckOf(found.c).filter(t => !isRolling(t)), disc = Object.fromEntries(onlyRolling.map(t => [t.key, t.base]));
    const rolls = drawTwo(found.c, { disc, order: Object.keys(disc) }, () => 0);
    assert.ok(rolls.rolling.length >= 1, 'the rolling cards come first');
    assert.notEqual(rolls.n, null, 'the deck was shuffled and a card that is not rolling was drawn');
    assert.ok(rolls.second !== null);
    assert.deepEqual(rolls.shuffles, [rolls.rolling.length], 'the rolling cards stayed out of the shuffle');
  },
  'two-card draw through the edit functions reports the pair'() {
    const pair = {}, drawn = [], r = withChars(1), cid = r.chars[0].id;
    const a = charAm(r, cid, 'rdraw2', undefined, { rand: () => 0, pair, drawn });
    assert.equal(drawn.length, 2);
    assert.deepEqual([pair.n, pair.second, pair.rolling], [drawn[0], drawn[1], []]);
    assert.equal(a.chars[0].amd.order.length, 2);
    const p2 = {}, m = monAm(emptyRecord(), 'm', 'rdraw2', undefined, { rand: () => 0, pair: p2 });
    assert.deepEqual([p2.n, p2.second], ['p0', 'p0']);
    assert.equal(m.mon.am.m.order.length, 2);
    assert.equal(amdAct(M, {}, 'rdraw2', undefined, { rand: () => 0 }).order.length, 2, 'the sinks are optional');
  },
};
