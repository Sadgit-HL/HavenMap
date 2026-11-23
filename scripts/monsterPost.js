// The forum text of a monster turn, with BGG forum codes where there is one. Pure logic, no DOM.
// The icon codes are the ones of the BGG codes modal of the campaign page (scripts/campaign/bggIcons.js): [ImageID=... inline]. A name without an icon
// (and everything when `icons` is false) is written as a word.
import { BGG_ICON_GROUPS } from './campaign/bggIcons.js';
import { statValue } from './monsterCard.js';

const CODES = new Map(BGG_ICON_GROUPS.flatMap(g => g.icons).map(i => [i.n, i.c]));

// The BGG code for an icon name, or null when there is none.
export const iconCode = name => CODES.get(name) ?? null;

// An icon, or its name as a word.
const ic = (name, icons) => (icons ? iconCode(name) : null) ?? name;

// An icon and its value, a space between them: [ImageID=7410466 inline] 3, or as words attack 3 and range all.
const iv = (name, value, icons) => `${ic(name, icons)} ${value}`.trim();

// A consumed element: the element with the small red cross (`fire_x`), or the words `consume fire` where there is no icon.
const consumeText = (v, icons) => (icons ? iconCode(`${v}_x`) : null) ?? `consume ${ic(String(v), icons)}`;

// The effects of an attack on a card as text: pierce 3, wound, push 1, fire, a consumed element ...
function effectText(e, icons) {
  if (e.t === 'element' && e.vt === 'minus') return consumeText(e.v, icons);
  if (['condition', 'element', 'elementHalf'].includes(e.t)) return ic(String(e.v), icons);
  if (typeof e.v === 'number') return iv(e.t, e.v, icons);
  return ic(e.t, icons);
}

const SPECIAL = { all: 'all', self: 'self', enemiesAdjacent: 'all adjacent enemies', enemyOneAll: 'one enemy and all adjacent to it', allies: 'allies', alliesAdjacent: 'adjacent allies' };

// The value of an action: a relative shield or retaliate on a card is added to the stat card's, formulas of C are worked out when they can be.
function valueText(n, statFx, chars) {
  if (n.v === undefined) return '';
  const num = typeof n.v === 'number' ? n.v : statValue(n.v, chars);
  if (n.vt) {
    const base = (statFx ?? []).find(f => f.t === n.t && typeof f.v === 'number')?.v ?? null, delta = (n.vt === 'minus' ? -1 : 1) * (num ?? 0);
    return num === null ? String(n.v) : base !== null ? String(base + delta) : delta >= 0 ? `+${delta}` : String(delta);
  }
  return num !== null ? String(num) : String(n.v);
}

// What an action adds on its own line, as words and icons: shield 2, retaliate 2 range 1, heal 3 range 2 target 2, consume fire: strengthen, summons ...
export function extraText(n, { icons = true, statFx = [], chars = 4 } = {}) {
  const subs = list => (list ?? []).map(s => subText(s, { icons, statFx, chars })).filter(Boolean).join(' ');
  const join = (...p) => p.filter(Boolean).join(' ');
  if (n.t === 'custom') return n.txt ?? '';
  if (n.t === 'summon') {
    const names = (n.obj ?? []).map(o => (o.monster ? `${String(o.monster.name).replace(/-/g, ' ')} (${o.monster.type})` : '')).filter(Boolean).join(', ');
    return join('summons', names || (typeof n.v === 'string' ? n.v : ''));
  }
  if (n.t === 'element') return n.vt === 'minus' ? join(consumeText(n.v, icons), n.sub?.length ? `: ${subs(n.sub)}` : '').replace(' :', ':') : join(ic(String(n.v), icons), subs(n.sub));
  if (n.t === 'condition') return join(ic(String(n.v), icons), subs(n.sub));
  if (n.t === 'elementHalf') return join(String(n.v).split(':').map(e => ic(e, icons)).join('/'), subs(n.sub));
  if (n.t === 'sufferDamage') return `suffers ${iv('damage', valueText(n, statFx, chars), icons)}`;
  if (n.t === 'spawn') return 'spawns a monster';
  if (n.t === 'area') return '';
  const val = valueText(n, statFx, chars);
  return join(val ? iv(n.t, val, icons) : ic(n.t, icons), subs(n.sub));
}

// The parts inside an action: range, targets, who, jump, the area, effects.
function subText(s, ctx) {
  const { icons } = ctx;
  if (s.t === 'range') return iv('range', s.v, icons);
  if (s.t === 'target') return iv('target', s.v === 'all' ? 'all' : (s.v ?? ''), icons);
  if (s.t === 'specialTarget') return SPECIAL[s.v] ?? String(s.v);
  if (s.t === 'jump') return ic('jump', icons);
  if (s.t === 'area') return 'area';
  return extraText(s, ctx);
}

// turnPost({ name, role, standee, from, to, towards, noAttack, attack, targets, focus, disadvantage, extras, statFx, chars, icons })
//   name     monster name              role     'normal' | 'elite' | 'boss'     standee  number of the standee or null
//   remove   the conditions that end with this turn ('stun', 'immobilize', 'disarm'), written at the end: remove [icons]     stunned  the monster does nothing: the text is only that it removes the stun
//   from, to hex labels ('E5')         points   the move value of the card, written after the move icon (move 3 E5 to F4), or null for none
//   towards  label of the hex it moves towards when it cannot attack this turn, or null
//   noAttack null, or why there is no attack this turn ('out of range', 'no target in reach')
//   attack   null without an attack, or { damage, range, targets: number, effects: [{ t, v }] }
//   targets  [[names]]: the groups of targets that tie (one group is the usual case)    focus  names of the focus, marked when there are several targets
//   extras   the other actions of the card (shield, retaliate, heal ...), statFx the stat card's extras, chars the number of characters
//   disadvantage  the attack is made with disadvantage: true, or the names of the targets it is made with disadvantage on
// One line per monster: the move, the attack on its target, the other actions of the card, separated by commas. When an attack has several targets the first line
// has the move and the other actions and every target has a line of its own with the attack, so that each roll can be filled in; tied groups of targets are
// separated by a line `or`.
export function turnPost({ name, role = 'normal', standee = null, stunned = false, remove = [], from, to, points = null, towards = null, noAttack = null, attack = null, targets = [], focus = [], disadvantage = false, extras = [], statFx = [], chars = 4, icons = true }) {
  const who = `[b]${name}[/b]${role === 'elite' ? ' (elite)' : role === 'boss' ? ' (boss)' : ''}${standee != null ? ` #${standee}` : ''}`;
  if (stunned) return `${who}: remove ${ic('stun', icons)}`;
  const rem = remove.length ? `remove ${remove.map(n => ic(n, icons)).join(' ')}` : '';
  const move = from === to ? `stays at ${from}` : `${points > 0 ? iv('move', points, icons) : ic('move', icons)} ${from} to ${to}${towards ? `, towards ${towards}` : ''}`;
  const more = extras.map(n => extraText(n, { icons, statFx, chars })).filter(Boolean);
  const dis = n => (Array.isArray(disadvantage) ? disadvantage.includes(n) : !!disadvantage);
  const parts = attack ? [iv('attack', attack.damage ?? '?', icons)] : [];
  if (attack && attack.range > 0) parts.push(iv('range', attack.range, icons));
  const effects = attack ? (attack.effects ?? []).map(e => effectText(e, icons)) : [];
  const name_ = (n, g) => `[b]${n}[/b]${g.length > 1 && focus.includes(n) ? ' (focus)' : ''}${dis(n) ? ' (disadvantage)' : ''}`;

  const several = attack && targets.some(g => g.length > 1);                      // several targets: a line for each of them
  if (!several) {
    const on = attack && targets.length ? `${[...parts, ...effects].join(' ')} on ${targets.map(g => g.map(n => name_(n, g)).join(' and ')).join(' or ')}` : '';
    return `${who}: ${[move, on, !on && noAttack ? `no attack: ${noAttack}` : '', ...more, rem].filter(Boolean).join(', ')}`;
  }
  const lines = [`${who}: ${[move, ...more].join(', ')}`];
  targets.forEach((g, i) => {
    if (i > 0) lines.push('or');
    for (const n of g) lines.push(`${[...parts, ...effects].join(' ')} on ${name_(n, g)}`);
  });
  if (rem) lines.push(rem);
  return lines.join('\n');
}
