import assert from 'node:assert/strict';
import { statValue, cardOptions, candidatesFor, cardCandidates, distinctCards, areaIndexes, infusedNames } from '../../scripts/monsterCard.js';
import { GH2_CARD_IDS } from '../../scripts/games/gh2_card_ids.js';
import { areaOffsets } from '../../scripts/monsterMove.js';
import { GH2_MONSTERS, GH2_MONSTER_DECKS } from '../../scripts/games/gh2_monsters.js';
import { GH_DECKS } from '../../scripts/games/gh_decks.js';

const card = (deck, name) => GH2_MONSTER_DECKS[deck].find(c => c.name === name);
const opts = (slug, kind, level, name, chars = 4) => cardOptions({ monster: GH2_MONSTERS[slug], kind, level, card: card(GH2_MONSTERS[slug].deck, name), chars });
const inf = (deck, name, infused, slug = deck) => cardOptions({ monster: GH2_MONSTERS[slug], kind: 'normal', level: 0, card: card(deck, name), chars: 4, infused });
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
  'monster card: infused elements, names from the element state'() {
    assert.deepEqual(infusedNames([0, 0, 0, 0, 0, 0]), []);
    assert.deepEqual(infusedNames([2, 0, 0, 1, 0, 2]), ['air', 'fire', 'light'], 'strong and waning both count, in the order of the element bar');
    assert.deepEqual(infusedNames([0, 0, 2, 0, 0, 0]), ['earth'], 'the third tile of the bar is earth');
    assert.deepEqual(infusedNames(undefined), []);
  },
  'monster card: a consume adds its target, area, range and attack only when infused'() {
    assert.equal(inf('earth-demon', 'Boulder Throw', []).targets, 1);
    assert.equal(inf('earth-demon', 'Boulder Throw', ['earth']).targets, 2, 'target +1');
    assert.equal(inf('earth-demon', 'Boulder Throw', ['fire']).targets, 1, 'another element does nothing');
    assert.equal(inf('chaos-demon', 'Seismic Punch', []).area.length, 0);
    const sp = inf('chaos-demon', 'Seismic Punch', ['earth']);
    assert.deepEqual([sp.area.length, sp.areaMelee], [2, true], 'melee area');
    assert.equal(inf('flame-demon', 'Explosive Blast', []).range, 4);
    const eb = inf('flame-demon', 'Explosive Blast', ['fire']);
    assert.deepEqual([eb.range, eb.area.length], [3, 7], 'range -1 and an area');
    const off = inf('frost-demon', 'Frozen Shards', []), on = inf('frost-demon', 'Frozen Shards', ['ice']);
    assert.deepEqual([on.damage - off.damage, on.range - off.range], [2, 1], 'attack +2 and range +1');
    assert.ok(inf('flame-demon', 'Intense Torch', ['fire']).effects.some(e => e.t === 'condition' && e.v === 'wound'));
    assert.ok(!inf('flame-demon', 'Intense Torch', []).effects.some(e => e.t === 'condition'));
    assert.equal(inf('sun-demon', 'Supernova', ['light']).targets, 6, 'all targets');
  },
  'monster card: an attack that exists only with the element'() {
    const off = inf('bloated-victim', 'Reckless Charge', []), on = inf('bloated-victim', 'Reckless Charge', ['earth']);
    assert.deepEqual([off.attack, on.attack, on.targets], [false, true, 2]);
    assert.equal(off.move, 3, 'the move is not conditional');
    assert.ok(off.notes.includes('Consume earth: not infused, bonus not applied') && on.notes.includes('Consume earth: infused, bonus applied'));
  },
  'monster card: no infused element leaves every card as before, all elements infused throw nothing'() {
    for (const m of Object.values(GH2_MONSTERS)) for (const c of GH2_MONSTER_DECKS[m.deck] ?? []) {
      const base = cardOptions({ monster: m, kind: 'normal', level: 0, card: c });
      assert.deepEqual(cardOptions({ monster: m, kind: 'normal', level: 0, card: c, infused: [] }), base);
      cardOptions({ monster: m, kind: 'normal', level: 0, card: c, infused: ['fire', 'ice', 'air', 'earth', 'light', 'dark'] });
    }
  },
  'monster card: a map card that shares its initiative is told apart by the id of its image'() {
    const ooze = GH_DECKS.ooze, sec = GH2_MONSTER_DECKS.ooze, byN = n => ooze.find(c => c.n === n);
    assert.equal(candidatesFor(sec, 66, false).length, 2, 'initiative alone: Calculated Strike or Feed');
    assert.deepEqual(cardCandidates('ooze', sec, byN(5)).map(c => c.name), ['Feed']);
    assert.deepEqual(cardCandidates('ooze', sec, byN(8)).map(c => c.name), ['Calculated Strike']);
    assert.deepEqual(cardCandidates('ooze', sec, byN(2)).map(c => c.name), ['Nothing Special'], 'a card without an entry: by initiative');
  },
  'monster card: every map card that needs an id entry has one, and every entry fits its card'() {
    for (const [slug, cards] of Object.entries(GH_DECKS)) {
      const sec = GH2_MONSTER_DECKS[slug], map = GH2_CARD_IDS[slug] ?? {}, seen = new Set();
      for (const c of cards) {
        const id = map[c.n];
        if (id === undefined) { assert.equal(distinctCards(candidatesFor(sec, c.init, c.s)).length, 1, `${slug} card ${c.n} (initiative ${c.init}) needs an entry in games/gh2_card_ids.js`); continue; }
        const card = sec.find(x => x.id === id);
        assert.ok(card, `${slug} card ${c.n}: id ${id} is not in the deck`);
        assert.equal(card.init, c.init, `${slug} card ${c.n}: initiative`);
        assert.equal(!!card.shuffle, !!c.s, `${slug} card ${c.n}: shuffle mark`);
        assert.ok(!seen.has(id), `${slug}: id ${id} used twice`);
        seen.add(id);
      }
      for (const n of Object.keys(map)) assert.ok(cards.some(c => c.n === Number(n)), `${slug}: entry for a card ${n} that the deck does not have`);
    }
  },
  'monster card: the permanent effects of the stat card go into the attack'() {
    const fx = (slug, kind, name, level = 0) => cardOptions({ monster: GH2_MONSTERS[slug], kind, level, card: card(GH2_MONSTERS[slug].deck, name) });
    const has = (o, t, v) => o.effects.some(e => e.t === t && (v === undefined || e.v === v));
    assert.ok(has(fx('chaos-demon', 'normal', 'Hungry Maw'), 'condition', 'muddle') && has(fx('chaos-demon', 'elite', 'Hungry Maw'), 'condition', 'muddle'), 'muddle on a Chaos Demon');
    const attackCard = (slug, kind) => GH2_MONSTER_DECKS[GH2_MONSTERS[slug].deck].find(c => cardOptions({ monster: GH2_MONSTERS[slug], kind, level: 0, card: c }).attack).name;
    const sun = fx('sun-demon', 'normal', attackCard('sun-demon', 'normal'));
    assert.ok(has(sun, 'advantage'), 'permanent advantage on a Sun Demon');
    assert.ok(has(fx('night-demon', 'normal', attackCard('night-demon', 'normal')), 'disadvantage'), 'disadvantage on a Night Demon');
    assert.ok(sun.notes.some(n => n.startsWith('Stat card effects on the attack:') && n.includes('advantage')), 'the panel says it');
    assert.ok(has(fx('chaos-demon', 'normal', 'White Claws'), 'advantage'), 'advantage written on the card itself');
    assert.equal(fx('chaos-demon', 'normal', 'White Claws').effects.filter(e => e.t === 'condition' && e.v === 'muddle').length, 1, 'shown once');
  },
  'monster card: stat card effects are only for attacks, targets and pierce add up, the same effect is not shown twice'() {
    let withAttack = 0, withoutAttack = 0;
    for (const [slug, m] of Object.entries(GH2_MONSTERS)) for (const kind of Object.keys(m.stats ?? {})) for (const c of GH2_MONSTER_DECKS[m.deck] ?? []) {
      const o = cardOptions({ monster: m, kind, level: 0, card: c });
      const keys = o.effects.filter(e => e.t === 'condition' || e.t === 'advantage' || e.t === 'disadvantage').map(e => e.t + ':' + e.v);
      assert.equal(new Set(keys).size, keys.length, `${slug} / ${c.name}: an effect twice`);
      assert.equal(o.effects.filter(e => e.t === 'pierce').length <= 1, true, `${slug} / ${c.name}: one pierce entry`);
      const stat = m.stats[kind][0], statFx = stat?.fx ?? [];
      if (!o.attack) { withoutAttack++; assert.ok(!o.effects.some(e => statFx.some(f => f.t === 'condition' && f.v === e.v)), `${slug} / ${c.name}: no attack, no stat card effects`); }
      else withAttack++;
      const t = statFx.find(f => f.t === 'target');
      if (o.attack && t && typeof t.v === 'number' && t.v > 1) assert.ok(o.targets >= Math.min(t.v, 6) || c.actions.some(a => a.t === 'attack'), `${slug} / ${c.name}: the targets of the stat card`);
    }
    assert.ok(withAttack > 300 && withoutAttack > 10, `${withAttack} cards with an attack, ${withoutAttack} without`);
    const lurker = cardOptions({ monster: GH2_MONSTERS['alpha-lurker'], kind: 'boss', level: 0, card: GH2_MONSTER_DECKS['lurker-soldier'].find(c => c.actions.some(a => a.t === 'attack')), chars: 3 });
    assert.ok(lurker.targets >= 2, 'a stat card with target 2: the attack has two targets');
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
    assert.deepEqual(candidatesFor(GH2_MONSTER_DECKS['lurker-soldier'], 23, true).map(c => c.name), ['Hardened by Frost'], 'card 6 of the map deck (corrected from 28 to 23 after its image)');
  },
  'monster card: the initiative and shuffle marks of every map deck agree with the Secretariat deck (31 decks)'() {
    const marks = (cards, init, shuffle) => cards.map(c => `${c[init]}${c[shuffle] ? 's' : ''}`).sort().join();
    for (const [slug, cards] of Object.entries(GH_DECKS)) assert.equal(marks(cards, 'init', 's'), marks(GH2_MONSTER_DECKS[slug], 'init', 'shuffle'), slug);
  },
  'monster card: every card of the map decks has a candidate in the Secretariat deck (248 cards, 33 ambiguous; living corpse card 3 was corrected from initiative 68 to 66)'() {
    let total = 0, ambiguous = 0; const none = [];
    for (const [slug, cards] of Object.entries(GH_DECKS)) for (const c of cards) {
      const cand = candidatesFor(GH2_MONSTER_DECKS[slug], c.init, c.s);
      total++;
      if (!cand.length) none.push(`${slug} n${c.n}`);
      if (distinctCards(cand).length > 1) ambiguous++;
    }
    assert.deepEqual(none, []);
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
  'monster card: the order of a card is top to bottom, extras by their index'() {
    const m = GH2_MONSTERS['savvas-icestorm'], c = GH2_MONSTER_DECKS[m.deck].find(x => x.id === 686);
    const o = cardOptions({ monster: m, kind: 'normal', level: 1, card: c });
    assert.deepEqual(o.order, [0, 'move', 'attack', 1], 'an action above the move, the move, the attack, an action below');
    assert.deepEqual(o.extras.map(e => e.t), ['condition', 'element']);
  },
};
