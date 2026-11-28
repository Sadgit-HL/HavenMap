import assert from 'node:assert/strict';
import { accepts, allowedStickers, offered, plusOneAbility, baseCost, enhancementCost, ELEMENTS, NEGATIVE, POSITIVE } from '../../scripts/campaign/enhancementRules.js';
import { MARK_STICKERS } from '../../scripts/campaign/classTokens.js';
import { ENHANCE_SLOTS } from '../../scripts/games/card_enhancement_slots.js';
import { ENHANCE_DOTS } from '../../scripts/games/card_enhancement_dots.js';

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
    assert.deepEqual(enhancementCost('plus_one', { w: 'attack', m: 1, l: 1 }, { level: 2, existing: 2 }).steps.map(s => s.label), ['Base', 'Multiple targets', 'Lost', 'Level 2', '2 already on the action']);
  },
  'enhancement cost: multiple targets do not double target, area hex or element enhancements'() {
    assert.equal(enhancementCost('plus_one', { w: 'target', m: 1 }).cost, 75);
    assert.equal(enhancementCost('fire', { w: 'attack', m: 1 }).cost, 100);
    assert.equal(enhancementCost('hex_attack', { w: 'area_hex', n: 4, m: 1 }).cost, 50);
    assert.equal(enhancementCost('poison', { w: 'attack', m: 1 }).cost, 100);
    assert.equal(enhancementCost('stun', { w: 'attack' }).cost, null);
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
