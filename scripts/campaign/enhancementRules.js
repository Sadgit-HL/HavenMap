// Enhancement rules of Gloomhaven 2nd edition (owner's rules file: docs/enhancement_sticker_rules.md; costs: rules appendix D, page 65).
// Pure functions, no imports. A dot is { w, m, l, s, n } from scripts/games/card_enhancement_dots.js:
//   w  what the dot enhances: attack, move, heal, range, target, push, pull, pierce, shield, retaliate, teleport, a condition name,
//      summon_health, summon_move, summon_attack, summon_range, area_hex, custom (a dot the card code does not name)
//   m  1 when the ability targets multiple figures or tiles (doubles the cost)
//   l  1 when the action has a lost icon and is not a summon action (halves the cost)
//   n  area_hex only: the number of hexes of the area
//   a  optional: the ability a +1 sticker on this dot is priced as (attack, move, heal ...); null: no +1 is offered. Absent: the same as w, so a condition dot gets no +1
// The shape of the dot is the marker's shape (square, diamond, diamondPlus, circle, hex).

// Sticker categories (the sticker names of MARK_STICKERS in classTokens.js)
export const ELEMENTS = ['air', 'earth', 'fire', 'ice', 'light', 'dark', 'wild'];
export const NEGATIVE = ['poison', 'wound', 'muddle', 'immobilize', 'stun', 'disarm', 'curse'];
export const POSITIVE = ['bless', 'strengthen', 'regenerate', 'ward', 'safeguard'];
const SQUARE = ['plus_one', 'jump'];                                      // square stickers: +1, and jump on a non-summon move

// Base cost in gold of a +1 sticker by what the dot enhances (rules appendix D)
export const PLUS_ONE_COST = {
  move: 30, attack: 50, range: 30, target: 75, shield: 80, retaliate: 60, pierce: 30, heal: 30, push: 30, pull: 20, teleport: 50,
  summon_health: 40, summon_move: 60, summon_attack: 100, summon_range: 50,
};
// Base cost of the other stickers. null: the rules list no price (the owner enters it)
export const STICKER_COST = {
  jump: 60, ward: 75, strengthen: 100, bless: 75, wound: 75, poison: 50, immobilize: 150, muddle: 40, curse: 150, disarm: 150,
  stun: null, regenerate: null, safeguard: null,
  air: 100, earth: 100, fire: 100, ice: 100, light: 100, dark: 100, wild: 150,
};
// The ability a +1 sticker on a dot is priced as.
export const plusOneAbility = dot => (dot && 'a' in dot ? dot.a : dot?.w);
export const LEVEL_COST = 25, EXISTING_COST = 75, HEX_COST = 200;

// Which stickers a dot of a shape accepts. opts.dot (the dot, for the jump restriction) and opts.jotl (Jaws of the Lion and Forgotten Circles
// cards: every dot except a hex dot counts as a diamond or a diamond+, so it takes both kinds of condition).
export function accepts(shape, sticker, opts = {}) {
  const { dot = null, jotl = false } = opts;
  if (shape === 'hex') return sticker === 'hex_attack';
  if (sticker === 'hex_attack') return false;
  if (sticker === 'jump' && plusOneAbility(dot) !== 'move') return false; // jump: only on a non-summon move ability (a summon's move is summon_move)
  const sq = SQUARE.includes(sticker), el = ELEMENTS.includes(sticker), neg = NEGATIVE.includes(sticker), pos = POSITIVE.includes(sticker);
  if (shape === 'square') return sticker === 'plus_one' || sticker === 'jump';
  if (shape === 'circle') return sq || el;
  if (jotl) return sq || el || neg || pos;
  if (shape === 'diamond') return sq || el || neg;
  if (shape === 'diamondPlus') return sq || el || pos;
  return false;
}

// Every sticker a dot takes, in the order of `all`: the shape accepts it and, for +1, the dot has an ability to price it by.
export const offered = (shape, sticker, opts = {}) => accepts(shape, sticker, opts) && (sticker !== 'plus_one' || PLUS_ONE_COST[plusOneAbility(opts.dot)] !== undefined);
export const allowedStickers = (shape, all, opts = {}) => all.filter(k => offered(shape, k, opts));

// Base cost of a sticker on a dot before the modifiers; null when the rules give no price.
export function baseCost(sticker, dot) {
  if (sticker === 'hex_attack') return Math.ceil(HEX_COST / Math.max(1, dot?.n || 1));
  if (sticker === 'plus_one') return PLUS_ONE_COST[plusOneAbility(dot)] ?? null;
  return STICKER_COST[sticker] ?? null;
}

// Cost in gold of placing a sticker on a dot, with the modifiers applied one at a time in the order of the rules:
//   1 multiple targets doubles it (not for target, area hex or element enhancements), 2 a lost action halves it (rounded up),
//   3 +25 for each card level above 1, 4 +75 for each enhancement already on the action.
// opts: level (1 to 9; X counts as 1), existing (enhancements already on the action). Returns { cost, steps } or { cost: null, steps: [] }.
export function enhancementCost(sticker, dot, opts = {}) {
  const base = baseCost(sticker, dot);
  if (base === null) return { cost: null, steps: [] };
  const lv = Math.max(1, Number(opts.level) || 1), ex = Math.max(0, Number(opts.existing) || 0);
  const steps = [{ label: 'Base', value: base }];
  let c = base;
  const noDouble = sticker === 'hex_attack' || ELEMENTS.includes(sticker) || (sticker === 'plus_one' && plusOneAbility(dot) === 'target');
  if (dot?.m && !noDouble) { c *= 2; steps.push({ label: 'Multiple targets', value: c }); }
  if (dot?.l) { c = Math.ceil(c / 2); steps.push({ label: 'Lost', value: c }); }
  if (lv > 1) { c += LEVEL_COST * (lv - 1); steps.push({ label: `Level ${lv}`, value: c }); }
  if (ex) { c += EXISTING_COST * ex; steps.push({ label: `${ex} already on the action`, value: c }); }
  return { cost: c, steps };
}
