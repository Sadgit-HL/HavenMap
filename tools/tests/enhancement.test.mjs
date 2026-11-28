import assert from 'node:assert/strict';
import { accepts, allowedStickers, offered, plusOneAbility, baseCost, enhancementCost, ELEMENTS, NEGATIVE, POSITIVE } from '../../scripts/campaign/enhancementRules.js';
import { MARK_STICKERS } from '../../scripts/campaign/classTokens.js';
import { ENHANCE_SLOTS } from '../../scripts/games/card_enhancement_slots.js';
import { ENHANCE_DOTS } from '../../scripts/games/card_enhancement_dots.js';
import { dotAt, dotChoices, occupiedDots, DOT_HIT } from '../../scripts/campaign/enhanceDot.js';
import { enhanceCard, setCharacter } from '../../scripts/campaign/edit.js';
import { withChars } from './helpers.mjs';
import { normalize, classByName } from '../../scripts/campaign/record.js';
import { CARDS } from '../../scripts/games/gh2_cards.js';

const ASP = 1050 / 750;
// a card of the first character's hand with a +1 dot on an attack, and the character with some gold
function setup(gold = 500) {
  let r = normalize(withChars(1));
  const c0 = r.chars[0], klass = classByName(c0.cls), mine = CARDS.filter(k => k.cls === klass.i).map(k => k.id);
  const id = mine.find(i => (ENHANCE_DOTS[i] || []).some(d => d.w === 'attack' && !d.x && d.g));
  const slot = ENHANCE_DOTS[id].findIndex(d => d.w === 'attack' && !d.x && d.g);
  r = { ...r, chars: r.chars.map(c => ({ ...c, deck: [id] })) };
  r = setCharacter(r, c0.id, 'gold', gold);
  return { r, cid: c0.id, id, key: `c:${id}`, slot, s: ENHANCE_SLOTS[id][slot] };
}

const move = { w: 'move' }, atk = { w: 'attack' };
const ok = (shape, list, opts) => assert.deepEqual(allowedStickers(shape, MARK_STICKERS, opts), MARK_STICKERS.filter(k => list.includes(k)));

export const tests = {
  'enhancement rules: every sticker is in a category and the categories do not overlap'() {
    const cat = [...ELEMENTS, ...NEGATIVE, ...POSITIVE, 'plus_one', 'jump', 'hex_attack'];
    assert.deepEqual([...cat].sort(), [...MARK_STICKERS].sort());
    assert.equal(new Set(cat).size, cat.length);
  },
  'enhancement rules: a square takes +1, and jump only on a non-summon move'() {
    ok('square', ['plus_one'], { dot: atk });
    ok('square', ['plus_one', 'jump'], { dot: move });
    ok('square', ['plus_one'], { dot: { w: 'summon_move' } });
  },
  'enhancement rules: a circle takes square stickers and elements'() {
    ok('circle', ['plus_one', ...ELEMENTS], { dot: atk });
    assert.ok(accepts('circle', 'jump', { dot: move }) && !accepts('circle', 'jump', { dot: atk }));
  },
  'enhancement rules: a diamond takes square, circle and negative conditions, a diamond+ the positive ones'() {
    ok('diamond', ['plus_one', ...ELEMENTS, ...NEGATIVE], { dot: atk });
    ok('diamondPlus', ['plus_one', ...ELEMENTS, ...POSITIVE], { dot: atk });
  },
  'enhancement rules: a hex takes only the hex sticker; Jaws of the Lion dots take both condition kinds'() {
    ok('hex', ['hex_attack']);
    ok('diamond', ['plus_one', ...ELEMENTS, ...NEGATIVE, ...POSITIVE], { dot: atk, jotl: true });
    ok('hex', ['hex_attack'], { jotl: true });
  },
  'enhancement rules: +1 on a dot is priced as its ability; a condition dot gets no +1 unless an ability is set'() {
    const cond = { w: 'muddle' };
    assert.equal(plusOneAbility(cond), 'muddle');
    assert.ok(accepts('diamond', 'plus_one', { dot: cond }) && !offered('diamond', 'plus_one', { dot: cond }));
    ok('diamond', [...ELEMENTS, ...NEGATIVE], { dot: cond });
    const set = { w: 'muddle', a: 'attack' };
    assert.ok(offered('diamond', 'plus_one', { dot: set }));
    assert.equal(baseCost('plus_one', set), 50);
    assert.equal(baseCost('poison', set), 50);                                          // a condition sticker is priced by the sticker
    assert.ok(!offered('diamond', 'plus_one', { dot: { w: 'muddle', a: null } }));
    assert.ok(offered('diamond', 'jump', { dot: { w: 'muddle', a: 'move' } }));
    assert.equal(enhancementCost('plus_one', { w: 'muddle', a: 'target', m: 1 }).cost, 75);
  },
  'enhancement cost: base prices of the rules table'() {
    assert.equal(baseCost('plus_one', { w: 'attack' }), 50);
    assert.equal(baseCost('plus_one', { w: 'pull' }), 20);
    assert.equal(baseCost('plus_one', { w: 'summon_attack' }), 100);
    assert.equal(baseCost('curse'), 150);
    assert.equal(baseCost('wild'), 150);
    assert.equal(baseCost('jump'), 60);
    assert.equal(baseCost('stun'), null);                                              // no price in the rules table
    assert.equal(baseCost('hex_attack', { n: 4 }), 50);
    assert.equal(baseCost('hex_attack', { n: 3 }), 67);                                // 200 / 3 rounded up
  },
  'enhancement cost: modifiers apply in order (multiple targets, lost, level, existing)'() {
    assert.equal(enhancementCost('plus_one', { w: 'attack' }).cost, 50);
    assert.equal(enhancementCost('plus_one', { w: 'attack', m: 1 }).cost, 100);
    assert.equal(enhancementCost('plus_one', { w: 'attack', m: 1, l: 1 }).cost, 50);                  // double, then halve
    assert.equal(enhancementCost('plus_one', { w: 'attack' }, { level: 3 }).cost, 100);               // +25 per level above 1
    assert.equal(enhancementCost('plus_one', { w: 'attack' }, { level: 'X' }).cost, 50);
    assert.equal(enhancementCost('plus_one', { w: 'attack', l: 1 }, { level: 2, existing: 1 }).cost, 25 + 25 + 75);
    const r = enhancementCost('plus_one', { w: 'attack', m: 1, l: 1 }, { level: 2, existing: 2 });
    assert.deepEqual(r.steps.map(s => [s.label, s.value]), [['Base', 50], ['Multiple targets', 50], ['Lost action', -50], ['Card level 2', 25], ['2 enhancements already on the action', 150]]);
    assert.equal(r.steps.reduce((a, s) => a + s.value, 0), r.cost);                                     // the lines add up to the price
    assert.equal(r.cost, 225);
  },
  'enhancement cost: multiple targets do not double target, area hex or element enhancements'() {
    assert.equal(enhancementCost('plus_one', { w: 'target', m: 1 }).cost, 75);
    assert.equal(enhancementCost('fire', { w: 'attack', m: 1 }).cost, 100);
    assert.equal(enhancementCost('hex_attack', { w: 'area_hex', n: 4, m: 1 }).cost, 50);
    assert.equal(enhancementCost('poison', { w: 'attack', m: 1 }).cost, 100);
    assert.equal(enhancementCost('stun', { w: 'attack' }).cost, null);
  },
  'enhancement dot: a click finds the empty dot under it, nearest first; a sticker occupies it'() {
    const { key, id, slot, s } = setup(), x = s.x * 100, y = s.y * 100;
    assert.equal(dotAt(key, x, y, ASP), slot);
    assert.equal(dotAt(key, x + (DOT_HIT + 0.05) * 100, y, ASP), null);
    assert.equal(dotAt(key, x, y, ASP, [{ x, y, s: 1 }]), null);
    assert.equal(dotAt(key, x, y, ASP, [{ x, y }]), slot);                                    // a token does not occupy a dot
    assert.ok(occupiedDots(id, [{ x, y, s: 1 }], ASP).has(slot));
    assert.equal(dotAt('i:5', x, y, ASP), null);
  },
  'enhancement dot: the choices are the stickers the shape takes, priced with the existing enhancements of the action'() {
    const { key, id, slot } = setup(), ch = dotChoices(key, slot, [], ASP, { level: 1, stickers: MARK_STICKERS });
    assert.equal(ch.dot.w, 'attack');
    assert.ok(ch.options.length && ch.options.every(o => o.cost !== undefined));
    const plus = ch.options.find(o => o.k === 'plus_one');
    if (plus) assert.equal(plus.cost, enhancementCost('plus_one', ch.dot, { level: 1 }).cost);
    const half = ENHANCE_SLOTS[id][slot].h, same = ENHANCE_SLOTS[id].findIndex((q, i) => i !== slot && q.h === half);
    if (same >= 0) {                                                                           // a sticker on another dot of the same card half (action) adds 75, whatever its ability
      const o = ENHANCE_SLOTS[id][same], more = dotChoices(key, slot, [{ x: o.x * 100, y: o.y * 100, s: 1 }], ASP, { level: 1, stickers: MARK_STICKERS });
      assert.equal(more.existing, 1);
      if (plus) assert.equal(more.options.find(q => q.k === 'plus_one').cost, plus.cost + 75);
    }
  },
  'enhancement dot: previous enhancements are counted per card half (action), over all its abilities, not over the other half'() {
    let hit = null;
    for (const [id, dots] of Object.entries(ENHANCE_DOTS)) {
      const sl = ENHANCE_SLOTS[id], pairs = dots.map((d, i) => i).filter(i => !dots[i].x);
      const a = pairs.find(i => pairs.some(j => j !== i && sl[j].h === sl[i].h && dots[j].g && dots[i].g && dots[j].g !== dots[i].g));
      const other = pairs.find(j => a !== undefined && sl[j].h !== sl[a].h);
      if (a !== undefined && other !== undefined) { hit = { id, a, b: pairs.find(j => j !== a && sl[j].h === sl[a].h && dots[j].g !== dots[a].g), other, sl }; break; }
    }
    assert.ok(hit, 'a card with two abilities on one half and a dot on the other half');
    const { id, a, b, other, sl } = hit, key = `c:${id}`, at = i => ({ x: sl[i].x * 100, y: sl[i].y * 100, s: 1 });
    const cost = markers => dotChoices(key, a, markers, ASP, { level: 1, stickers: MARK_STICKERS });
    assert.equal(cost([]).existing, 0);
    assert.equal(cost([at(b)]).existing, 1);                                                    // another ability of the same half counts
    assert.equal(cost([at(other)]).existing, 0);                                                // the other half does not
    assert.equal(cost([at(b), at(other)]).existing, 1);
  },
  'enhancement dot: enhanceCard places the sticker, takes the gold and adds the price to the card'() {
    const { r, cid, key, s } = setup(200), n = enhanceCard(r, cid, key, { k: 'plus_one', x: s.x * 100, y: s.y * 100 }, 50), c = n.chars[0];
    assert.equal(c.gold, 150);
    assert.equal(c.mp[key], 50);
    assert.deepEqual(c.mk[key].map(m => [m.k, m.s]), [['plus_one', 1]]);
    const again = enhanceCard(n, cid, key, { k: 'plus_one', x: 10, y: 10 }, 25).chars[0];
    assert.equal(again.gold, 125);
    assert.equal(again.mp[key], 75);
  },
  'enhancement dot: enhanceCard is refused without enough gold, for a bad sticker or key, and a free sticker costs nothing'() {
    const { r, cid, key, s } = setup(40), m = { k: 'plus_one', x: s.x * 100, y: s.y * 100 };
    assert.equal(enhanceCard(r, cid, key, m, 50), r);
    assert.equal(enhanceCard(r, cid, key, { ...m, k: 'nope' }, 10), r);
    assert.equal(enhanceCard(r, cid, 'i:5', m, 10), r);
    assert.equal(enhanceCard(r, cid, key, m, -5), r);
    const free = enhanceCard(r, cid, key, m, 0).chars[0];
    assert.equal(free.gold, 40);
    assert.equal(free.mp?.[key], undefined);
    assert.equal(free.mk[key].length, 1);
  },
  'enhancement dots: every card has one entry per dot of the slot file, with a known meaning or a flag'() {
    const known = new Set(['attack', 'move', 'heal', 'range', 'target', 'push', 'pull', 'pierce', 'shield', 'retaliate', 'teleport', 'jump', 'area_hex', 'custom', 'summon_health', 'summon_move', 'summon_attack', 'summon_range', 'none', 'condition', 'invisible', 'bane', 'brittle', 'plague', 'impair', ...NEGATIVE, ...POSITIVE]);
    assert.deepEqual(Object.keys(ENHANCE_DOTS).sort(), Object.keys(ENHANCE_SLOTS).filter(id => ENHANCE_SLOTS[id].length).sort());
    for (const [id, dots] of Object.entries(ENHANCE_DOTS)) {
      assert.equal(dots.length, ENHANCE_SLOTS[id].length, `card ${id}`);
      dots.forEach((d, i) => {
        assert.equal(d.i, i, `card ${id}`);
        assert.ok(d.w === null || known.has(d.w), `card ${id} dot ${i}: ${d.w}`);
        assert.ok(d.w !== null || d.u === 1, `card ${id} dot ${i} has no meaning and no flag`);
        if (d.w === 'area_hex') assert.ok(d.n >= 1, `card ${id} dot ${i}`);
      });
    }
  },
};
