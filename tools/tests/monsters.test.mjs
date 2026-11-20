import assert from 'node:assert/strict';
import { emptyRecord, normalDifficulty, scenarioLevel } from '../../scripts/campaign/record.js';
import { MONSTERS, MON_MAX, monOf, deckSlug, deckCards, deckState, deckNeedsShuffle, deckRollCode, monSlugs } from '../../scripts/campaign/monsters.js';
import { GH_DECKS } from '../../scripts/games/gh_decks.js';
import { monAddType, monRemoveType, monDeck, monDraw, monDrawAll, monEndRound, monNewScenario, monImbue, monAm, monSetLevel } from '../../scripts/campaign/edit.js';
import { describeChange } from '../../scripts/campaign/changelog.js';

const archers = MONSTERS.filter(m => deckSlug(m.id) === 'archer').map(m => m.id);
const boss = MONSTERS.find(m => m.boss), plain = MONSTERS.find(m => !m.boss && deckSlug(m.id) && deckSlug(m.id) !== 'archer');
const slug = deckSlug(plain.id), cards = deckCards(slug);
const shuffleDeck = Object.keys(GH_DECKS).find(k => GH_DECKS[k].some(c => c.s));
const withType = (r, id) => monAddType(r, id);

export const tests = {
  'defaults of an empty record'() {
    const m = monOf(emptyRecord());
    assert.equal(m.round, 1); assert.deepEqual(m.types, []);
  },
  'archers and bosses share their decks'() {
    assert.ok(archers.length >= 2);
    assert.equal(new Set(archers.map(deckSlug)).size, 1);
    assert.equal(deckSlug(boss.id), 'boss');
    assert.equal(deckSlug(99999), null);
  },
  'monSlugs lists each shared deck once'() {
    assert.deepEqual(monSlugs({ types: [archers[0], archers[1], plain.id] }), ['archer', slug]);
  },
  'a missing deck state is a full deck'() {
    const ds = deckState(monOf(emptyRecord()), slug);
    assert.equal(ds.deck.length, cards.length); assert.deepEqual(ds.active, []);
  },
  'needs shuffle: empty draw pile or a shuffle card drawn'() {
    assert.equal(deckNeedsShuffle(slug, { deck: [], active: [], discard: [] }), true);
    const s = GH_DECKS[shuffleDeck].find(c => c.s).n;
    assert.equal(deckNeedsShuffle(shuffleDeck, { deck: [1], active: [s], discard: [] }), true);
    assert.equal(deckNeedsShuffle(shuffleDeck, { deck: [1], active: [], discard: [] }), false);
  },
  'roll code lists the cards left'() {
    assert.match(deckRollCode(slug, { deck: cards.slice(0, 2).map(c => c.n) }), /^1custom2\{iid:\d+;iid:\d+\}$/);
    assert.equal(deckRollCode(slug, { deck: [] }), '');
  },
  'types: add, no duplicates, no unknown, at most 8'() {
    let r = withType(emptyRecord(), plain.id);
    assert.equal(withType(r, plain.id), r);
    assert.equal(withType(r, 99999), r);
    for (const m of MONSTERS.filter(m => m.id !== plain.id).slice(0, 10)) r = withType(r, m.id);
    assert.equal(monOf(r).types.length, MON_MAX);
  },
  'removing a type drops its deck state unless another type shares it'() {
    let r = withType(withType(emptyRecord(), archers[0]), archers[1]);
    r = monDeck(r, 'archer', 'draw', deckCards('archer')[0].n);
    assert.ok(monOf(monRemoveType(r, archers[0])).decks.archer);
    assert.equal(monOf(monRemoveType(monRemoveType(r, archers[0]), archers[1])).decks.archer, undefined);
    assert.equal(monRemoveType(r, 99999), r);
  },
  'ability deck: draw, discard, back, shuffle'() {
    let r = withType(emptyRecord(), plain.id); const n = cards[0].n;
    r = monDeck(r, slug, 'draw', n);
    assert.deepEqual(deckState(monOf(r), slug).active, [n]);
    assert.equal(deckState(monOf(r), slug).deck.includes(n), false);
    assert.equal(monDeck(r, slug, 'draw', n), r);
    r = monDeck(r, slug, 'discard', n);
    assert.deepEqual(deckState(monOf(r), slug).discard, [n]);
    r = monDeck(r, slug, 'back', n);
    assert.equal(monOf(r).decks[slug], undefined);
    r = monDeck(monDeck(r, slug, 'draw', n), slug, 'shuffle');
    assert.equal(monOf(r).decks[slug], undefined);
  },
  'unknown deck or action changes nothing'() {
    const r = emptyRecord();
    assert.equal(monDeck(r, 'nope', 'draw', 1), r);
    assert.equal(monDeck(r, slug, 'bogus', 1), r);
  },
  'end of round: active to discard, round up'() {
    let r = withType(emptyRecord(), plain.id); const n = cards.find(c => !c.s).n;
    r = monEndRound(monDeck(r, slug, 'draw', n));
    const ds = deckState(monOf(r), slug);
    assert.deepEqual(ds.discard, [n]); assert.deepEqual(ds.active, []);
    assert.equal(monOf(r).round, 2);
  },
  'end of round shuffles a deck with a shuffle card drawn'() {
    const s = GH_DECKS[shuffleDeck].find(c => c.s).n, id = MONSTERS.find(m => deckSlug(m.id) === shuffleDeck).id;
    let r = monDeck(withType(emptyRecord(), id), shuffleDeck, 'draw', s);
    r = monEndRound(r);
    assert.equal(monOf(r).decks[shuffleDeck], undefined);
  },
  'new scenario: round 1, decks shuffled, imbuement and hand edits kept'() {
    let r = withType(emptyRecord(), plain.id);
    r = monDeck(r, slug, 'draw', cards[0].n);
    r = monImbue(r, 1);
    r = monAm(r, 'm', 'plus', 'p0');
    r = monAm(r, 'm', 'draw', 'p1');
    r = monEndRound(r);
    r = monNewScenario(r);
    const m = monOf(r);
    assert.equal(m.round, 1); assert.deepEqual(m.decks, {});
    assert.equal(m.am.m.imb, 1); assert.deepEqual(m.am.m.adj, { p0: 1 });
    assert.equal(m.am.m.disc, undefined);
    assert.deepEqual(m.types, [plain.id]);
  },
  'imbuement is clamped to 0..2'() {
    assert.equal(monOf(monImbue(emptyRecord(), 9)).am.m.imb, 2);
    assert.equal(monOf(monImbue(emptyRecord(), -4)).am.m.imb, 0);
    const r = emptyRecord(); assert.equal(monImbue(r, 'x'), r);
  },
  'modifier decks: draw and bad deck'() {
    const r = monAm(emptyRecord(), 'a', 'draw', 'p0');
    assert.deepEqual(monOf(r).am.a.disc, { p0: 1 });
    assert.equal(monAm(r, 'z', 'draw', 'p0'), r);
  },
  'scenario level is set through the difficulty'() {
    const base = emptyRecord(), r = monSetLevel(base, 4);
    assert.equal(r.party.diff, 4 - normalDifficulty(base));
    assert.equal(scenarioLevel(r), 4);
    assert.equal(monSetLevel(r, null).party.diff, 0);
  },
  'random draw takes the card the number points at and leaves the rest of the deck'() {
    const r = withType(emptyRecord(), plain.id), n = cards.length, all = cards.map(c => c.n);
    const d = deckState(monOf(monDraw(r, slug, () => 2.5 / n)), slug);
    assert.deepEqual(d.active, [all[2]]);
    assert.deepEqual(d.deck, all.filter(x => x !== all[2]));
    assert.deepEqual(d.discard, []);
  },
  'random draw: every card of the deck is equally likely'() {
    const r = withType(emptyRecord(), plain.id), N = 800, seen = new Map();
    for (let i = 0; i < N; i++) { const a = deckState(monOf(monDraw(r, slug, () => i / N)), slug).active[0]; seen.set(a, (seen.get(a) || 0) + 1); }
    assert.deepEqual([...seen.keys()].sort((a, b) => a - b), cards.map(c => c.n).sort((a, b) => a - b));
    for (const k of seen.values()) assert.equal(k, N / cards.length);
  },
  'random draw takes only from the cards left, and does nothing for an empty or unknown deck'() {
    let r = withType(emptyRecord(), plain.id);
    for (let i = 0; i < cards.length; i++) r = monDraw(r, slug, () => 0);      // draw the whole deck
    const d = deckState(monOf(r), slug);
    assert.equal(d.deck.length, 0);
    assert.deepEqual([...d.active].sort((a, b) => a - b), cards.map(c => c.n).sort((a, b) => a - b), 'no card twice');
    assert.equal(monDraw(r, slug, () => 0), r, 'empty draw pile');
    assert.equal(monDraw(r, 'no-such-deck', () => 0), r);
  },
  'draw all: one card for each deck without a card, a shared deck once'() {
    let r = withType(withType(withType(emptyRecord(), archers[0]), archers[1]), plain.id);
    const a = monDrawAll(r, () => 0), m = monOf(a);
    assert.equal(deckState(m, 'archer').active.length, 1, 'the archer decks are one deck');
    assert.equal(deckState(m, slug).active.length, 1);
    assert.equal(monDrawAll(a, () => 0), a, 'nothing more to draw while every deck has a card');
    // a deck that already has a drawn card keeps it; the other deck draws
    const one = monDeck(r, slug, 'draw', cards[3].n), b = monOf(monDrawAll(one, () => 0));
    assert.deepEqual(deckState(b, slug).active, [cards[3].n]);
    assert.equal(deckState(b, 'archer').active.length, 1);
    // next round: End of round clears the cards, Draw all draws again
    const next = monOf(monDrawAll(monEndRound(a), () => 0));
    assert.equal(next.round, 2);
    assert.equal(deckState(next, slug).active.length, 1);
    const none = emptyRecord();
    assert.equal(monDrawAll(none, () => 0), none, 'no monster types: nothing to draw');
  },
  'History: a draw is logged as drew, with the card and how it was drawn'() {
    const r = withType(emptyRecord(), plain.id), a = monDraw(r, slug, () => 0), lines = describeChange(r, a);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].kind, 'Ability deck');
    assert.match(lines[0].d, /drew card \d+ \(initiative \d+\)$/, 'no marker without a note');
    assert.match(describeChange(r, a, { draw: 'random' })[0].d, /drew card \d+ \(initiative \d+\) \(random\)$/);
    assert.match(describeChange(r, a, { draw: 'BGG roll' })[0].d, /\(BGG roll\)$/);
    const back = describeChange(a, r, { draw: 'random' });                                  // a card put back is not a draw: no marker
    assert.ok(back.length && back.every(l => !/random/.test(l.d)));
  },
  'History: Draw cards marks every deck it drew for'() {
    const r = withType(withType(emptyRecord(), archers[0]), plain.id), lines = describeChange(r, monDrawAll(r, () => 0), { draw: 'random' });
    assert.equal(lines.length, 2);
    assert.ok(lines.every(l => /drew card .*\(random\)$/.test(l.d)));
  },
  'edits do not change the input'() {
    const r = withType(emptyRecord(), plain.id), snap = JSON.stringify(r);
    monDeck(r, slug, 'draw', cards[0].n); monEndRound(r); monNewScenario(r); monDraw(r, slug, () => 0); monDrawAll(r, () => 0);
    assert.equal(JSON.stringify(r), snap);
  },
};
