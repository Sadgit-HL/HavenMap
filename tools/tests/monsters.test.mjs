import assert from 'node:assert/strict';
import { emptyRecord, normalDifficulty, scenarioLevel } from '../../scripts/campaign/record.js';
import { MONSTERS, MON_MAX, monOf, deckSlug, deckCards, deckState, deckNeedsShuffle, deckRollCode, monSlugs } from '../../scripts/campaign/monsters.js';
import { GH_DECKS } from '../../scripts/games/gh_decks.js';
import { monAddType, monRemoveType, monDeck, monEndRound, monNewScenario, monImbue, monAm, monSetLevel } from '../../scripts/campaign/edit.js';

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
  'edits do not change the input'() {
    const r = withType(emptyRecord(), plain.id), snap = JSON.stringify(r);
    monDeck(r, slug, 'draw', cards[0].n); monEndRound(r); monNewScenario(r);
    assert.equal(JSON.stringify(r), snap);
  },
};
