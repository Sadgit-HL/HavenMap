import assert from 'node:assert/strict';
import { statValue, cardOptions, candidatesFor, distinctCards, areaIndexes } from '../../scripts/monsterCard.js';
import { areaOffsets } from '../../scripts/monsterMove.js';
import { GH2_MONSTERS, GH2_MONSTER_DECKS } from '../../scripts/games/gh2_monsters.js';
import { GH_DECKS } from '../../scripts/games/gh_decks.js';

const card = (deck, name) => GH2_MONSTER_DECKS[deck].find(c => c.name === name);
const opts = (slug, kind, level, name, chars = 4) => cardOptions({ monster: GH2_MONSTERS[slug], kind, level, card: card(GH2_MONSTERS[slug].deck, name), chars });
const norm = cells => { const m = [Math.min(...cells.map(c => c[0])), Math.min(...cells.map(c => c[1]))]; return cells.map(c => `${c[0] - m[0]},${c[1] - m[1]}`).sort().join(' '); };

export const tests = {
  'monster card: stat formulas of bosses'() {
    assert.deepEqual([statValue(7, 3), statValue('Cx9', 4), statValue('7xC', 3), statValue('C+1', 2), statValue('C', 4), statValue('[C-1]', 4)], [7, 36, 21, 3, 4, 3]);
    assert.equal(statValue('X', 4), null);
    assert.equal(statValue('[2+Math.floor(L/3)]', 4), null);
  },
  'monster card: a ranged attack of an immobile monster, relative attack value'() {
    const o = opts('ancient-artillery', 'normal', 3, 'Long Shot');
    assert.deepEqual([o.move, o.range, o.targets, o.attack, o.damage, o.area, o.flying], [0, 7, 1, true, 2, [], false]);
    assert.ok(o.notes.includes('Focus on the enemy farthest away within range 7'), 'the focus rule is shown as a note');
    assert.equal(opts('ancient-artillery', 'elite', 3, 'Long Shot').damage, 3, 'elite stat attack 4 minus 1');
  },
  'monster card: a ranged area and a melee area'() {
    const g = opts('ancient-artillery', 'normal', 0, 'Grenade');
    assert.deepEqual([g.range > 0, g.areaMelee, g.area.length], [true, false, 3]);
    const b = opts('chaos-demon', 'normal', 0, 'Chilling Breath');
    assert.deepEqual([b.range, b.areaMelee, b.area.length], [0, true, 2]);
  },
  'monster card: move relative to the stat card, jump, flying monsters'() {
    const archer = GH2_MONSTERS['bandit-archer'], mv = archer.stats.normal[1].move;
    const cards = GH2_MONSTER_DECKS[archer.deck];
    const moves = cards.map(c => cardOptions({ monster: archer, kind: 'normal', level: 1, card: c }).move);
    assert.ok(moves.every(m => m >= 0 && m <= mv + 3), JSON.stringify(moves));
    assert.ok(moves.some(m => m !== mv), 'some card changes the movement');
    let jumps = 0;
    for (const [slug, m] of Object.entries(GH2_MONSTERS)) for (const c of GH2_MONSTER_DECKS[m.deck] ?? []) if (cardOptions({ monster: m, kind: 'normal', level: 0, card: c }).jumping) jumps++;
    assert.ok(jumps >= 4, `${jumps} cards with a jump`);
    assert.equal(cardOptions({ monster: GH2_MONSTERS['alpha-lurker'], kind: 'boss', level: 0, card: GH2_MONSTER_DECKS[GH2_MONSTERS['alpha-lurker'].deck][0], chars: 3 }).flying, !!GH2_MONSTERS['alpha-lurker'].flying);
  },
  'monster card: targets, all adjacent enemies, formulas for the number of targets'() {
    const seen = new Set();
    for (const m of Object.values(GH2_MONSTERS)) for (const c of GH2_MONSTER_DECKS[m.deck] ?? []) seen.add(cardOptions({ monster: m, kind: 'normal', level: 0, card: c }).targets);
    assert.ok(seen.has(1) && seen.has(2) && seen.has(6), [...seen].join());
  },
  'monster card: cards with the same initiative are ambiguous for the map card numbers, equal copies are not'() {
    const deck = GH2_MONSTER_DECKS['ancient-artillery'];
    assert.deepEqual(distinctCards(candidatesFor(deck, 46, false)).map(c => c.name).sort(), ['Concussive Burst', 'Long Shot']);
    assert.deepEqual(distinctCards(candidatesFor(deck, 71, true)).map(c => c.name), ['Exploding Ammunition'], 'two copies of one card');
    assert.equal(candidatesFor(deck, 17, false).length, 1);
    assert.deepEqual(candidatesFor(GH2_MONSTER_DECKS['lurker-soldier'], 28, true).map(c => c.init), [28], 'no exact match on the shuffle mark: the initiative is used');
  },
  'monster card: the cards of the map decks have a candidate in the Secretariat deck (248 cards, 33 ambiguous, living corpse n3 has none: initiative 68 against 66)'() {
    let total = 0, ambiguous = 0; const none = [];
    for (const [slug, cards] of Object.entries(GH_DECKS)) for (const c of cards) {
      const cand = candidatesFor(GH2_MONSTER_DECKS[slug], c.init, c.s);
      total++;
      if (!cand.length) none.push(`${slug} n${c.n}`);
      if (distinctCards(cand).length > 1) ambiguous++;
    }
    assert.deepEqual(none, ['living-corpse n3']);
    assert.deepEqual([total, ambiguous], [248, 33]);
  },
  'monster card: area patterns go onto the 7 by 7 editor with the same shape'() {
    let n = 0, misfit = [];
    for (const [deck, cards] of Object.entries(GH2_MONSTER_DECKS)) for (const c of cards) {
      const o = cardOptions({ monster: { stats: {} }, card: c });
      if (!o.area.length) continue;
      n++;
      const { indexes, fits } = areaIndexes(o.area, o.areaMelee);
      if (!fits) { misfit.push(`${deck} / ${c.name}`); continue; }
      assert.equal(norm(areaOffsets(indexes, o.areaMelee)), norm(o.area), `${deck} / ${c.name}`);
      if (o.areaMelee) assert.equal(areaOffsets(indexes, true).map(String).sort().join(), o.area.map(String).sort().join(), 'melee: from the monster, not just the shape');
    }
    assert.ok(n >= 25, `${n} patterns`);
    assert.deepEqual([...new Set(misfit)].sort(), ['deep-terror / Beam of Annihilation', 'deep-terror-scenario-51 / Beam of Annihilation'], 'only the line of five hexes, reaching 5 out, is too big for the editor');
  },
};
