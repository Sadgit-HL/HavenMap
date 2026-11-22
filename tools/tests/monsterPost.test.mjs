import assert from 'node:assert/strict';
import { turnPost, iconCode, extraText } from '../../scripts/monsterPost.js';
import { cardOptions } from '../../scripts/monsterCard.js';
import { GH2_MONSTERS, GH2_MONSTER_DECKS } from '../../scripts/games/gh2_monsters.js';

const attack = { damage: 3, range: 4, targets: 1, effects: [{ t: 'condition', v: 'wound' }, { t: 'pierce', v: 2 }] };
const lines = t => t.split('\n');

export const tests = {
  'monster post: icons come from the BGG codes of the campaign page'() {
    assert.equal(iconCode('move'), '[ImageID=7410469 inline]');
    assert.equal(iconCode('attack'), '[ImageID=7410466 inline]');
    assert.equal(iconCode('no such icon'), null);
  },
  'monster post: one line for a monster with one target, with forum codes'() {
    const t = turnPost({ name: 'Ancient Artillery', role: 'elite', standee: 3, from: 'E5', to: 'F4', attack, targets: [['Anaphi']] });
    assert.deepEqual(lines(t), ['[b]Ancient Artillery[/b] (elite) #3: [ImageID=7410469 inline] E5 to F4, [ImageID=7410466 inline]3 [ImageID=7410470 inline]4 [ImageID=4113446 inline] [ImageID=4123143 inline]2 on [b]Anaphi[/b]']);
  },
  'monster post: words instead of icons, disadvantage on the target, tied single targets on one line'() {
    const one = turnPost({ name: 'Bandit Archer', from: 'A1', to: 'B2', attack: { damage: 2, range: 3, targets: 1, effects: [{ t: 'condition', v: 'poison' }] }, targets: [['Anaphi']], disadvantage: ['Anaphi'], icons: false });
    assert.deepEqual(lines(one), ['[b]Bandit Archer[/b]: move A1 to B2, attack 2 range 3 poison on [b]Anaphi[/b] (disadvantage)']);
    const muddled = turnPost({ name: 'Guard', from: 'A1', to: 'B1', attack: { damage: 2, range: 0, targets: 2, effects: [] }, targets: [['Anaphi', 'Brute']], disadvantage: true, icons: false });
    assert.deepEqual(lines(muddled), ['[b]Guard[/b]: move A1 to B1', 'attack 2 on [b]Anaphi[/b] (disadvantage)', 'attack 2 on [b]Brute[/b] (disadvantage)'], 'muddled: every target');
    const tie = turnPost({ name: 'Bandit Archer', from: 'A1', to: 'B2', attack: { damage: 2, range: 3, targets: 1, effects: [] }, targets: [['Anaphi'], ['Brute']], icons: false });
    assert.deepEqual(lines(tie), ['[b]Bandit Archer[/b]: move A1 to B2, attack 2 range 3 on [b]Anaphi[/b] or [b]Brute[/b]']);
  },
  'monster post: several targets, a line for each target, the first line has the move and the other actions'() {
    const t = turnPost({ name: 'Guard', from: 'A1', to: 'B1', attack: { damage: 2, range: 3, targets: 2, effects: [{ t: 'condition', v: 'poison' }] }, targets: [['Anaphi', 'Brute']], focus: ['Brute'], disadvantage: ['Anaphi'], extras: [{ t: 'shield', v: 1 }], icons: false });
    assert.deepEqual(lines(t), [
      '[b]Guard[/b]: move A1 to B1, shield 1',
      'attack 2 range 3 poison on [b]Anaphi[/b] (disadvantage)',
      'attack 2 range 3 poison on [b]Brute[/b] (focus)',
    ]);
    const groups = turnPost({ name: 'Guard', from: 'A1', to: 'A1', attack: { damage: 1, range: 0, targets: 2, effects: [] }, targets: [['A', 'B'], ['A', 'C']], focus: ['A'], icons: false });
    assert.deepEqual(lines(groups), ['[b]Guard[/b]: stays at A1', 'attack 1 on [b]A[/b] (focus)', 'attack 1 on [b]B[/b]', 'or', 'attack 1 on [b]A[/b] (focus)', 'attack 1 on [b]C[/b]']);
  },
  'monster post: no ability card, the reason for no attack, stays, moves towards a hex'() {
    const out = turnPost({ name: 'Guard', from: 'A1', to: 'B1', towards: 'F4', noAttack: 'out of range', icons: false });
    assert.equal(out, '[b]Guard[/b]: move A1 to B1, towards F4, no attack: out of range');
    assert.ok(!/Ability/.test(out));
    assert.equal(turnPost({ name: 'Guard', role: 'boss', from: 'C3', to: 'C3', icons: false }), '[b]Guard[/b] (boss): stays at C3');
    assert.equal(turnPost({ name: 'Guard', from: 'C3', to: 'D3', towards: 'G7', icons: false }), '[b]Guard[/b]: move C3 to D3, towards G7');
    assert.equal(turnPost({ name: 'Guard', from: 'C3', to: 'C3', towards: 'G7', icons: false }), '[b]Guard[/b]: stays at C3', 'staying put: no towards');
    assert.equal(turnPost({ name: 'Guard', from: 'A1', to: 'B1', points: 3, icons: false }), '[b]Guard[/b]: move 3 A1 to B1', 'the move value after the move');
    assert.equal(turnPost({ name: 'Guard', from: 'A1', to: 'B1', points: 3 }), `[b]Guard[/b]: ${iconCode('move')}3 A1 to B1`, 'glued to the icon');
    assert.equal(turnPost({ name: 'Guard', from: 'A1', to: 'A1', points: 3, icons: false }), '[b]Guard[/b]: stays at A1', 'no value when it stays');
  },
  'monster post: the other actions of the card on the same line, shield and retaliate added to the stat card'() {
    const extras = [{ t: 'shield', v: 1, vt: 'plus' }, { t: 'retaliate', v: 2, vt: 'plus', sub: [{ t: 'range', v: 1 }] }, { t: 'heal', v: 3, sub: [{ t: 'range', v: 2 }, { t: 'target', v: 2 }] }, { t: 'heal', v: 1, sub: [{ t: 'specialTarget', v: 'self' }] }, { t: 'condition', v: 'strengthen', sub: [{ t: 'specialTarget', v: 'all' }, { t: 'range', v: 2 }] }, { t: 'element', v: 'ice', vt: 'minus', sub: [{ t: 'shield', v: 2 }] }, { t: 'summon', v: 'monsterStandee', obj: [{ monster: { name: 'living-bones', type: 'normal' } }] }, { t: 'custom', txt: 'Target all adjacent enemies' }];
    const plain = turnPost({ name: 'Guard', from: 'A1', to: 'A1', extras, statFx: [{ t: 'shield', v: 1 }, { t: 'retaliate', v: 1, sub: [{ t: 'range', v: 1 }] }], icons: false });
    assert.equal(plain, '[b]Guard[/b]: stays at A1, shield 2, retaliate 3 range 1, heal 3 range 2 target 2, heal 1 self, strengthen all range 2, consume ice: shield 2, summons living bones (normal), Target all adjacent enemies');
    const icons = turnPost({ name: 'Guard', from: 'A1', to: 'A1', extras: extras.slice(0, 3), icons: true });
    assert.ok(icons.includes(iconCode('shield')) && icons.includes(iconCode('retaliate')) && icons.includes(iconCode('heal')) && icons.includes(iconCode('range')) && icons.includes(iconCode('target')), icons);
    assert.equal(extraText({ t: 'shield', v: 1, vt: 'plus' }, { icons: false }), 'shield +1', 'no base on the stat card: the relative value');
    assert.equal(extraText({ t: 'heal', v: 'C' }, { icons: false, chars: 3 }), 'heal 3', 'C is worked out');
  },
  'monster post: every extra action in the decks gives text, none gives undefined or an object'() {
    let n = 0;
    for (const m of Object.values(GH2_MONSTERS)) for (const c of GH2_MONSTER_DECKS[m.deck] ?? []) {
      const o = cardOptions({ monster: m, kind: 'elite', level: 5, card: c });
      for (const e of o.extras) { n++; const t = extraText(e, { icons: true, statFx: o.statFx }); assert.ok(typeof t === 'string' && !/undefined|\[object|NaN/.test(t), `${m.deck} / ${c.name}: ${t}`); }
    }
    assert.ok(n > 300, `${n} extras`);
  },
  'monster post: extras follow the infused elements, a consume inside an action is merged into it'() {
    const text = (deck, name, infused) => {
      const o = cardOptions({ monster: GH2_MONSTERS[deck], card: GH2_MONSTER_DECKS[deck].find(c => c.name === name), infused });
      return o.extras.map(n => extraText(n, { icons: false, statFx: o.statFx })).join(' | ');
    };
    assert.equal(text('ooze', 'Feed', []), 'loot 1 | heal 2 self', 'dark not infused: no bonus, no consume text');
    assert.equal(text('ooze', 'Feed', ['dark']), 'loot 1 | heal 3 self consume dark', 'heal 2 and heal +1');
    assert.equal(text('ooze', 'Feed', ['fire']), 'loot 1 | heal 2 self');
    assert.equal(text('crystal-rot', 'Unholy Gifts', ['dark']), 'heal 1 target 3 range 3 ward consume dark', 'target +1');
    assert.equal(text('sun-demon', 'Ray of Warmth', ['light']), 'heal 3 range 3 target all consume light', 'a target of the consume');
    assert.equal(text('lurker-soldier', 'Defensive Claws', ['ice']), 'wound all range 1 | shield +2 consume ice', 'a relative shield adds up');
    assert.equal(text('savvas-icestorm', 'Repulsive Torrent', ['air']), 'push 4 target all range 1 consume air');
    assert.equal(text('bloated-victim', 'Reckless Charge', ['earth']).includes('consume'), false, 'the consume of the attack is not repeated in the extras');
  },
  'monster card: a relative attack of a consume inside a grid changes the attack before it'() {
    const o = infused => cardOptions({ monster: GH2_MONSTERS['wind-demon'], card: GH2_MONSTER_DECKS['wind-demon'].find(c => c.name === 'Cyclone'), infused });
    assert.deepEqual([o([]).damage, o([]).area.length, o([]).multi], [2, 3, false]);
    assert.deepEqual([o(['air']).damage, o(['air']).area.length, o(['air']).multi], [3, 6, false], 'attack +1, a bigger area, still one attack');
  },
  'monster post: advantage and disadvantage are words on the attack, the stat card effects come with the attack'() {
    const post = (slug, kind, icons) => {
      const m = GH2_MONSTERS[slug], c = GH2_MONSTER_DECKS[m.deck].find(x => cardOptions({ monster: m, kind, level: 0, card: x }).attack), o = cardOptions({ monster: m, kind, level: 0, card: c });
      return turnPost({ name: 'Demon', from: 'A1', to: 'A1', attack: { damage: o.damage, range: o.range, targets: o.targets, effects: o.effects }, targets: [['Anaphi']], icons });
    };
    assert.ok(/attack \d+ advantage on/.test(post('sun-demon', 'normal', false)), 'permanent advantage of the stat card');
    assert.ok(/attack \d+ .*muddle on/.test(post('chaos-demon', 'elite', false)), 'muddle of the stat card');
    assert.ok(post('chaos-demon', 'normal', true).includes(iconCode('muddle')), 'with the icon');
    assert.ok(post('sun-demon', 'normal', true).split(' ').includes('advantage'), 'advantage stays a word with icons on');
  },
  'monster post: a consumed element is the icon with the red cross, a created one the plain icon'() {
    for (const el of ['air', 'dark', 'earth', 'fire', 'ice', 'light', 'wild']) assert.ok(iconCode(`${el}_x`) && iconCode(el) && iconCode(`${el}_x`) !== iconCode(el), `${el} has both icons`);
    assert.equal(extraText({ t: 'element', v: 'dark' }), iconCode('dark'), 'a create');
    assert.equal(extraText({ t: 'element', v: 'dark', vt: 'minus', sub: [{ t: 'heal', v: 2 }] }), `${iconCode('dark_x')}: ${iconCode('heal')}2`, 'a consume, no word');
    assert.equal(extraText({ t: 'element', v: 'dark', vt: 'minus' }, { icons: false }), 'consume dark', 'words keep the word');
    const o = cardOptions({ monster: GH2_MONSTERS.ooze, card: GH2_MONSTER_DECKS.ooze.find(c => c.name === 'Feed'), infused: ['dark'] });
    assert.ok(extraText(o.extras.find(n => n.t === 'heal')).endsWith(iconCode('dark_x')), 'the merged heal ends with the consumed element');
    const fire = cardOptions({ monster: GH2_MONSTERS['flame-demon'], card: GH2_MONSTER_DECKS['flame-demon'].find(c => c.name === 'Intense Torch'), infused: ['fire'] });
    assert.ok(turnPost({ name: 'Demon', from: 'A1', to: 'A1', attack: { damage: 3, range: 0, targets: 1, effects: fire.effects }, targets: [['Anaphi']] }).includes(iconCode('fire_x')), 'an attack that consumes fire');
    const reckless = cardOptions({ monster: GH2_MONSTERS['bloated-victim'], card: GH2_MONSTER_DECKS['bloated-victim'].find(c => c.name === 'Reckless Charge'), infused: ['earth'] });
    assert.ok(reckless.effects.some(e => e.t === 'element' && e.v === 'earth' && e.vt === 'minus'), 'an attack that exists only with the element shows it');
  },
  'monster post: the effects of a card attack are read from the card, every effect in the decks has an icon'() {
    const seen = new Set();
    for (const m of Object.values(GH2_MONSTERS)) for (const c of GH2_MONSTER_DECKS[m.deck] ?? []) for (const e of cardOptions({ monster: m, card: c, infused: ['fire', 'ice', 'air', 'earth', 'light', 'dark'] }).effects) seen.add(['condition', 'element', 'elementHalf'].includes(e.t) ? String(e.v) : e.t);
    assert.ok(seen.size >= 15, [...seen].join());
    for (const name of seen) assert.ok(iconCode(name) || ['advantage', 'disadvantage'].includes(name), `${name} has no icon`);   // advantage and disadvantage are words
  },
};
