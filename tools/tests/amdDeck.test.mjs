import assert from 'node:assert/strict';
import { AM_STANDARD, IMBUE, amOwner, deckOf, drawState, drawOdds, cleanAmd, amdAct, amdRollCode, drawRandom, drawTwo, isRolling, perkList, shuffleDue, canDraw } from '../../scripts/campaign/amdDeck.js';
import { emptyRecord } from '../../scripts/campaign/record.js';
import { charAm, monAm } from '../../scripts/campaign/edit.js';
import { describeChange } from '../../scripts/campaign/changelog.js';
import { CLASSES } from '../../scripts/games/gh2_classes.js';
import { withChars } from './helpers.mjs';

const M = amOwner('m'), A = amOwner('a');
const STD = { p0: 6, p1: 5, m1: 5, p2: 1, m2: 1, x2: 1, miss: 1 };
const NO_CARDS = { adj: Object.fromEntries(Object.entries(STD).map(([k, n]) => [k, -n])) };       // a deck without any card
const total = (o, st = {}) => drawState(o, st).total;
const sum = o => Object.values(o).reduce((s, n) => s + n, 0);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);

export const tests = {
  'monster and ally decks start with the 20 standard cards'() {
    assert.equal(AM_STANDARD.reduce((s, t) => s + t.count, 0), 20);
    assert.equal(total(M), 20); assert.equal(total(A), 20);
  },
  'imbuement changes the monster deck by its table, level 2 includes level 1'() {
    assert.equal(total(amOwner('m', { imb: 1 })), 20 + sum(IMBUE[1]));
    assert.equal(total(amOwner('m', { imb: 2 })), 20 + sum(IMBUE[1]) + sum(IMBUE[2]));
    assert.equal(amOwner('a', { imb: 2 }).imb, 0);
    assert.equal(amOwner('m', { imb: 9 }).imb, 2);
  },
  'draw moves a card to the discard, ret takes it back'() {
    let st = amdAct(M, {}, 'draw', 'p1');
    assert.equal(drawState(M, st).disc, 1); assert.equal(drawState(M, st).total, 19);
    assert.equal(drawState(M, st).top.key, 'p1');
    st = amdAct(M, st, 'ret', 'p1');
    assert.equal(drawState(M, st).disc, 0); assert.equal(drawState(M, st).total, 20);
  },
  'the discard shows the latest draw on top'() {
    const st = amdAct(M, amdAct(M, {}, 'draw', 'p0'), 'draw', 'm1');
    assert.equal(drawState(M, st).top.key, 'm1');
  },
  'shuffle empties the discard and keeps bless and curse'() {
    let st = amdAct(M, amdAct(M, {}, 'add', 'bless'), 'draw', 'p0');
    st = amdAct(M, st, 'shuffle');
    assert.equal(drawState(M, st).disc, 0); assert.equal(st.bless, 1);
  },
  'bless and curse: added by hand, at most 10, leave the game when drawn'() {
    let st = {};
    for (let i = 0; i < 12; i++) st = amdAct(M, st, 'add', 'bless');
    assert.equal(st.bless, 10);
    st = amdAct(M, st, 'draw', 'bless');
    assert.equal(st.bless, 9);
    assert.equal(amdAct(M, {}, 'rem', 'curse').curse, 0);
    assert.equal(total(M, { bless: 3 }), 23);
  },
  'plus and minus edit the count of a card type; minus below zero is refused'() {
    let st = amdAct(M, {}, 'plus', 'p0');
    assert.equal(total(M, st), 21);
    st = amdAct(M, st, 'minus', 'p0');
    assert.equal(total(M, st), 20);
    let s2 = {};
    for (let i = 0; i < 6; i++) s2 = amdAct(M, s2, 'minus', 'p0');
    assert.equal(total(M, s2), 14);
    assert.deepEqual(amdAct(M, s2, 'minus', 'p0'), s2);
  },
  'move: pool to top to discard, order lists'() {
    let st = amdAct(M, {}, 'move', 'p2', { from: 'pool', to: 'top' });
    assert.deepEqual(st.top, ['p2']);
    assert.equal(drawState(M, st).pool, 19); assert.equal(drawState(M, st).total, 20);
    st = amdAct(M, st, 'move', 'p1', { from: 'pool', to: 'top' });
    assert.deepEqual(st.top, ['p1', 'p2']);                                     // top: new card goes to the front
    st = amdAct(M, st, 'move', 'p0', { from: 'pool', to: 'bot' });
    st = amdAct(M, st, 'move', 'p3', { from: 'pool', to: 'bot' });
    assert.deepEqual(st.bot, ['p0']);                                           // p3 is not in the deck: refused
    st = amdAct(M, st, 'move', 'p1', { from: 'top', to: 'disc' });
    assert.equal(drawState(M, st).disc, 1); assert.deepEqual(st.top, ['p2']);
  },
  'move refuses unknown places and cards that are not there'() {
    const st = {};
    assert.deepEqual(amdAct(M, st, 'move', 'p0', { from: 'nowhere', to: 'top' }), { disc: {} });
    assert.equal(amdAct(M, st, 'move', 'p0', { from: 'disc', to: 'top' }).top, undefined);
  },
  'odds of the standard deck'() {
    const o = drawOdds(drawState(M, {}));
    near(o.miss, 1 / 20); near(o.crit, 1 / 20); near(o.z, 6 / 20);
    near(o.le2, 2 / 20); near(o.le1, 7 / 20); near(o.ge1, 7 / 20); near(o.ge2, 2 / 20);
  },
  'odds follow the cards left, and an empty pool gives null'() {
    let st = {};
    for (const t of AM_STANDARD) for (let i = 0; i < t.count; i++) st = amdAct(M, st, 'draw', t.key);
    assert.equal(drawOdds(drawState(M, st)), null);
    st = amdAct(M, {}, 'draw', 'miss');
    near(drawOdds(drawState(M, st)).miss, 0);
  },
  'odds count bless as x2 and curse as a miss'() {
    const o = drawOdds(drawState(M, { bless: 1 }));
    near(o.crit, 2 / 21);
    const c = drawOdds(drawState(M, { curse: 1 }));
    near(c.miss, 2 / 21);
  },
  'cleanAmd keeps known fields and drops the rest'() {
    assert.equal(cleanAmd(null), null); assert.equal(cleanAmd([]), null); assert.equal(cleanAmd({}), null);
    assert.equal(cleanAmd({ disc: { p0: 0 } }), null);
    const c = cleanAmd({ disc: { p0: 2, 'bad key!': 3 }, order: ['p0', 'p0', 7], adj: { p1: 99 }, bless: 50, junk: 1, top: ['p2'] });
    assert.deepEqual(c.disc, { p0: 2 });
    assert.equal(c.adj.p1, 20); assert.equal(c.bless, 10); assert.deepEqual(c.top, ['p2']);
    assert.equal(c.junk, undefined);
  },
  'roll code lists the faces left'() {
    assert.equal(amdRollCode(['+0', '+1']), '1custom2{+0;+1}');
    assert.equal(amdRollCode([]), '');
  },
  'a hero deck: draw and put back, retall, the state is cleaned'() {
    const r = withChars(1), cid = r.chars[0].id, key = deckOf(r.chars[0])[0].key;
    let n = charAm(r, cid, 'draw', key);
    assert.deepEqual(n.chars[0].amd.disc, { [key]: 1 });
    n = charAm(charAm(n, cid, 'draw', key), cid, 'retall');
    assert.equal(n.chars[0].amd, undefined);
    assert.equal(charAm(r, 'nope', 'draw', key), r);
    assert.equal(charAm(r, cid, 'shuffle'), r);
  },
  'edits do not change the state they are given'() {
    const st = { disc: { p0: 1 }, order: ['p0'] }, snap = JSON.stringify(st);
    amdAct(M, st, 'draw', 'p1'); amdAct(M, st, 'ret', 'p0'); amdAct(M, st, 'move', 'p0', { from: 'disc', to: 'top' });
    assert.equal(JSON.stringify(st), snap);
    assert.ok(emptyRecord());
  },
  'random draw: the card the number points at, one card of the whole deck'() {
    const first = drawRandom(M, {}, () => 0), last = drawRandom(M, {}, () => 0.999);
    assert.deepEqual(first.drawn, ['p0']);
    assert.deepEqual(last.drawn, ['miss']);
    assert.equal(drawState(M, first.st).disc, 1);
    assert.equal(drawState(M, first.st).pool, 19);
  },
  'random draw: every card of the deck is equally likely'() {
    const N = 2000, seen = {};
    for (let i = 0; i < N; i++) { const k = drawRandom(M, {}, () => i / N).drawn[0]; seen[k] = (seen[k] || 0) + 1; }
    for (const t of AM_STANDARD) assert.equal(seen[t.key], N * t.count / 20, t.key);
  },
  'random draw: bless and curse are in the draw and leave the game'() {
    const st = { bless: 1 }, n = total(M, st), r = drawRandom(M, st, () => 20.5 / n);          // the special cards come after the 20 standard ones
    assert.deepEqual(r.drawn, ['bless']);
    assert.equal(r.st.bless, 0);
    assert.equal(drawState(M, r.st).disc, 0, 'a drawn bless is not in the discard');
  },
  'random draw: the card on top first, the card on the bottom when nothing else is left'() {
    const top = drawRandom(M, { top: ['m2'] }, () => 0.5);
    assert.deepEqual(top.drawn, ['m2'], 'the known top card, whatever the number');
    assert.deepEqual(top.st.top ?? [], []);
    const all = { p0: 6, p1: 5, m1: 5, p2: 1, m2: 1, x2: 1, miss: 1 };          // every card of the random part discarded
    const bot = drawRandom(M, { disc: all, order: Object.keys(all), bot: ['p2', 'm1'] }, () => 0);
    assert.deepEqual(bot.drawn, ['p2'], 'the first card of the bottom');
    const again = drawRandom(M, { disc: all, order: Object.keys(all) }, () => 0);                  // nothing in the deck: it is shuffled at once, then drawn from
    assert.deepEqual([again.drawn, again.shuffles], [['p0'], [0]]);
    assert.deepEqual(drawRandom(M, NO_CARDS, () => 0).drawn, [], 'a deck without any card: nothing drawn');
  },
  'random draw: a rolling card is followed by the next card, until one that is not rolling'() {
    let found = null;                                                                                   // a class with a perk that adds a rolling card
    for (const k of CLASSES) for (const p of perkList(k.name)) {
      const c = { cls: k.name, pk: { perks: [p.index] } }, t = deckOf(c).find(x => isRolling(x) && x.base > 0);
      if (t && !found) found = { c, key: t.key };
    }
    assert.ok(found, 'some class has a rolling card');
    const chain = drawRandom(found.c, { top: [found.key] }, () => 0);
    assert.equal(chain.drawn[0], found.key);
    assert.ok(chain.drawn.length >= 2, 'the draw goes on after the rolling card');
    const last = deckOf(found.c).find(t => t.key === chain.drawn.at(-1));
    assert.ok(!isRolling(last), 'and ends with a card that is not rolling');
    assert.deepEqual(drawRandom(M, {}, () => 0).drawn.length, 1, 'a deck without rolling cards draws one card');
  },
  'random draw through the edit functions: heroes, and the monster and ally decks'() {
    const r = withChars(1), cid = r.chars[0].id, a = charAm(r, cid, 'rdraw', undefined, { rand: () => 0 });
    assert.ok(a.chars[0].amd?.disc && sum(a.chars[0].amd.disc) >= 1, 'a card is in the discard');
    assert.equal(charAm(r, cid, 'rdraw', undefined, { rand: () => 0 }).chars[0].amd?.order.length >= 1, true);
    const m = monAm(emptyRecord(), 'm', 'rdraw', undefined, { rand: () => 0 }), al = monAm(emptyRecord(), 'a', 'rdraw', undefined, { rand: () => 0.999 });
    assert.deepEqual(m.mon.am.m.order, ['p0']);
    assert.deepEqual(al.mon.am.a.order, ['miss']);
    const r2 = { ...emptyRecord(), mon: { am: { m: NO_CARDS } } };
    assert.equal(monAm(r2, 'm', 'rdraw', undefined, { rand: () => 0 }), r2, 'no card at all: the record is returned as it is');
  },
  'History: a modifier deck draw is marked random, or BGG roll when a card was marked by hand'() {
    const r = withChars(1), cid = r.chars[0].id, a = charAm(r, cid, 'rdraw', undefined, { rand: () => 0 });
    const line = d => describeChange(r, a, d ? { draw: d } : {}).find(l => l.kind === 'Modifier deck').d;
    assert.match(line('random'), /drew .* left in the deck\) \(random\)$/);
    assert.doesNotMatch(line(), /\((random|BGG roll)\)/);
    const m = monAm(emptyRecord(), 'm', 'rdraw', undefined, { rand: () => 0 });
    assert.match(describeChange(emptyRecord(), m, { draw: 'random' }).find(l => l.kind === 'Modifier deck').d, /drew .* left\) \(random\)$/);
    assert.match(describeChange(emptyRecord(), monAm(emptyRecord(), 'a', 'draw', 'p1'), { draw: 'BGG roll' }).find(l => l.kind === 'Modifier deck').d, /\(BGG roll\)$/);
  },
  'shuffle mark: due when a x2 or a Miss is in the discard, or nothing is left to draw'() {
    const due = (o, st) => shuffleDue(drawState(o, st));
    assert.equal(due(M, {}), false, 'a fresh deck');
    assert.equal(due(M, { disc: { p1: 2, m1: 1 }, order: ['p1', 'p1', 'm1'] }), false, 'ordinary cards in the discard');
    assert.equal(due(M, { disc: { x2: 1 }, order: ['x2'] }), true, 'a x2 was drawn');
    assert.equal(due(M, { disc: { miss: 1 }, order: ['miss'] }), true, 'a Miss was drawn');
    assert.equal(due(A, { disc: { miss: 1 }, order: ['miss'] }), true, 'the ally deck too');
    const all = { p0: 6, p1: 5, m1: 5, p2: 1, m2: 1, x2: 1, miss: 1 };
    assert.equal(due(M, { disc: all, order: Object.keys(all) }), true);
    assert.equal(due(M, { disc: { ...all, x2: 0, miss: 0 }, order: ['p0'] }), false, 'cards left in the deck and no x2 or Miss out');
    assert.equal(due(M, { disc: { p0: 6, p1: 5, m1: 5, p2: 1, m2: 1 }, bot: ['x2', 'miss'], order: ['p0'] }), false, 'a card placed on the bottom can still be drawn');
    const r = drawRandom(M, { top: ['x2'] }, () => 0);                                     // the draw of a x2 itself makes the shuffle due
    assert.equal(due(M, r.st), true);
    assert.equal(due(M, amdAct(M, r.st, 'shuffle')), false, 'and the shuffle clears it');
  },
  'shuffle mark: a hero deck with the standard cards'() {
    const c = { cls: 'Tinkerer', pk: {} };
    assert.equal(shuffleDue(drawState(c, {})), false);
    assert.equal(shuffleDue(drawState(c, { disc: { x2: 1 }, order: ['x2'] })), true);
    assert.equal(shuffleDue(drawState(c, { disc: { miss: 1 }, order: ['miss'] })), true);
  },
  'random draw reports the keys drawn, in the order drawn, through opts.drawn'() {
    const one = [], st = amdAct(M, {}, 'rdraw', undefined, { rand: () => 0, drawn: one });
    assert.deepEqual(one, ['p0']);
    assert.equal(drawState(M, st).disc, 1);
    let found = null;
    for (const k of CLASSES) for (const p of perkList(k.name)) { const c = { cls: k.name, pk: { perks: [p.index] } }, t = deckOf(c).find(x => isRolling(x) && x.base > 0); if (t && !found) found = { c, key: t.key }; }
    const chain = [];
    amdAct(found.c, { top: [found.key] }, 'rdraw', undefined, { rand: () => 0, drawn: chain });
    assert.equal(chain[0], found.key, 'the rolling card first');
    assert.ok(chain.length >= 2 && !isRolling(deckOf(found.c).find(t => t.key === chain.at(-1))), 'then the cards of the chain, the last one not rolling');
    const none = [];
    amdAct(M, NO_CARDS, 'rdraw', undefined, { rand: () => 0, drawn: none });
    assert.deepEqual(none, [], 'no card at all: nothing reported');
    const viaEdit = [];
    monAm(emptyRecord(), 'a', 'rdraw', undefined, { rand: () => 0.999, drawn: viaEdit });
    assert.deepEqual(viaEdit, ['miss']);
  },
  'empty deck: shuffled at once, before the draw when it is empty at the start'() {
    const st = { disc: STD, order: Object.keys(STD) };
    assert.equal(drawState(M, st).pool, 0);
    const r = drawRandom(M, st, () => 0), d = drawState(M, r.st);
    assert.deepEqual([r.drawn, r.shuffles], [['p0'], [0]], 'shuffled with nothing in play, then one card drawn');
    assert.equal(d.disc, 1, 'only the card drawn is in the discard');
    assert.equal(d.pool, 19);
  },
  'empty deck: after an attack that took the last card, the whole discard goes back, the cards of that attack included'() {
    const nearly = { disc: { ...STD, p0: 5 }, order: Object.keys(STD) };                     // one card left
    assert.equal(drawState(M, nearly).pool, 1);
    const r = drawRandom(M, nearly, () => 0), d = drawState(M, r.st);
    assert.deepEqual([r.drawn, r.shuffles], [['p0'], [0]], 'the shuffle comes when the attack is resolved: nothing stays out of it');
    assert.deepEqual([d.disc, d.pool], [0, 20], 'the card of the attack is shuffled in too');
    assert.equal(canDraw(d), true);
  },
  'empty deck: a rolling card as the last card, the cards in play stay out of the shuffle until the attack is resolved'() {
    const c = { cls: 'Berserker', pk: { perks: [6] } };                                      // two "wound >" rolling cards
    const roll = deckOf(c).find(t => t.key === 'plus0woundflip'), standard = deckOf(c).filter(t => t.key !== roll.key);
    assert.equal(roll.base, 2);
    const disc = Object.fromEntries(standard.map(t => [t.key, t.base])), st = { disc, order: Object.keys(disc) };
    assert.equal(drawState(c, st).pool, 2, 'only the two rolling cards are in the deck');
    const r = drawRandom(c, st, () => 0), d = drawState(c, r.st);
    assert.deepEqual(r.drawn.slice(0, 2), ['plus0woundflip', 'plus0woundflip'], 'both rolling cards first');
    assert.equal(r.drawn.length, 3, 'the deck was empty and another card was needed');
    assert.deepEqual(r.shuffles, [2], 'shuffled once, with the two rolling cards in play and so left out');
    assert.ok(!isRolling(deckOf(c).find(t => t.key === r.drawn[2])), 'the third card is not rolling');
    assert.equal(d.disc, 3, 'the cards of the attack are in the discard now, the rest of the discard went back into the deck');
    assert.equal(d.tiles.find(t => t.key === 'plus0woundflip').d, 2);
    assert.equal(d.pool, standard.reduce((n, t) => n + t.base, 0) - 1, 'every other card is in the deck, minus the third card drawn');
  },
  'empty deck: a bless card leaves the game, whether the shuffle comes after the attack or in the middle of it'() {
    const st = { bless: 1, disc: STD, order: Object.keys(STD) };
    assert.equal(drawState(M, st).pool, 1, 'only the bless card is in the deck');
    const one = drawRandom(M, st, () => 0), d = drawState(M, one.st);
    assert.deepEqual([one.drawn, one.st.bless, one.shuffles], [['bless'], 0, [0]], 'the attack is over after the bless card, then the discard is shuffled back');
    assert.deepEqual([d.disc, d.pool], [0, 20], 'the bless card is gone, every other card is in the deck');
    const two = drawTwo(M, st, () => 0), e = drawState(M, two.st);                           // advantage: a second card is needed in the middle of the attack
    assert.deepEqual([two.n, two.second, two.shuffles], ['bless', 'p0', [1]], 'the bless card was in play and stayed out of the shuffle');
    assert.deepEqual([two.st.bless, e.disc], [0, 1], 'it left the game after the attack; only the second card is in the discard');
  },
  'can draw: a card in the deck, or a discard to shuffle back'() {
    assert.equal(canDraw(drawState(M, {})), true);
    assert.equal(canDraw(drawState(M, { disc: STD, order: Object.keys(STD) })), true, 'the discard can be shuffled back');
    assert.equal(canDraw(drawState(M, { disc: STD, order: Object.keys(STD), top: ['p0'] })), true, 'a card placed on top');
    assert.equal(canDraw(drawState(M, NO_CARDS)), false);
  },
};
