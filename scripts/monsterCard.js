// From a monster's ability card and stat card to the options of the solver (scripts/monsterMove.js). Pure logic, no DOM.
// The data comes from scripts/games/gh2_monsters.js (tools/extract-monster-data.py); the caller passes the records so this file also runs in Node.
//
// cardOptions({ monster, kind, level, card, chars }) -> { move, range, targets, area, areaMelee, attack, jumping, flying, damage, notes, multi }
//   monster  GH2_MONSTERS record     kind  'normal' | 'elite' | 'boss'     level  0 to 7     card  one card of GH2_MONSTER_DECKS[deck]
//   chars    number of characters, for the stat values of bosses that scale with it ('C', 'Cx2', 'C+1')
//   move     movement points: the stat card's movement plus or minus the card's relative value (Move +1), an absolute value as it is; 0 without a move
//   range    attack range from the card, 0 for a melee attack or no attack
//   targets  number of targets, 6 for all; 1 when the card says nothing
//   area     axial offsets of the area pattern ([] without one); areaMelee: the pattern is drawn around the monster
//   attack   the card has an attack
//   damage   the attack value (stat card plus or minus the card), null when it cannot be worked out
//   effects  what the first attack does besides damage: [{ t, v }] pierce, push, pull, conditions and elements by name
//   extras   the other actions of the card (shield, retaliate, heal, conditions, summons, custom text ...) as they are in the data, without the moves and attacks
//   statFx   the extras of the stat card (shield, retaliate ...), the base of a relative shield or retaliate on the card
//   notes    texts the solver cannot act on (custom card text, special targets, formulas), to show to the player
//   multi    the card has more than one attack or move; the first of each is used
import { toAxial, toBoard } from './tileMask.js';

// The value of a stat card entry: a number, or a formula of C (characters) and numbers such as 'Cx9', '7xC', 'C+1'; null when it cannot be worked out.
export function statValue(v, chars) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const expr = v.replace(/C/g, String(chars)).replace(/x/g, '*').replace(/\s+/g, '');
  if (!/^[0-9+\-*()\[\].]+$/.test(expr)) return null;
  try { const n = Function(`"use strict"; return (${expr.replace(/\[/g, '(').replace(/\]/g, ')')});`)(); return Number.isFinite(n) ? n : null; } catch { return null; }
}

// Move and attack nodes of a card in reading order, inside grids and concatenations; monster type nodes only for the monster kind.
function findActions(nodes, kind, out = []) {
  for (const n of nodes ?? []) {
    if (n.t === 'move' || n.t === 'attack') out.push(n);
    else if (n.t === 'monsterType') { if (n.v === kind || kind === 'boss') findActions(n.sub, kind, out); }
    else if (n.sub) findActions(n.sub, kind, out);
  }
  return out;
}

// The actions of a card that are not moves or attacks, in reading order (grids and concatenations opened, monster types only for this kind).
function findExtras(nodes, kind, out = []) {
  for (const n of nodes ?? []) {
    if (n.t === 'move' || n.t === 'attack') continue;
    if (n.t === 'monsterType') { if (n.v === kind || kind === 'boss') findExtras(n.sub, kind, out); }
    else if (n.t === 'grid' || n.t === 'concatenation') findExtras(n.sub, kind, out);
    else out.push(n);
  }
  return out;
}

// Texts of a card the solver cannot act on: custom text outside the move and attack nodes, and inside them.
function collectNotes(nodes, notes) {
  for (const n of nodes ?? []) {
    if (n.t === 'custom' && n.txt) notes.push(n.txt);
    if (n.sub) collectNotes(n.sub, notes);
  }
}

export function cardOptions({ monster, kind = 'normal', level = 0, card, chars = 4 }) {
  const stat = monster?.stats?.[kind]?.[level] ?? monster?.stats?.normal?.[level] ?? null;
  const notes = [];
  collectNotes(card.actions, notes);
  const found = findActions(card.actions, kind), moves = found.filter(n => n.t === 'move'), attacks = found.filter(n => n.t === 'attack');
  const out = { move: 0, range: 0, targets: 1, area: [], areaMelee: false, attack: attacks.length > 0, jumping: false, flying: !!monster?.flying, damage: null, effects: [], extras: findExtras(card.actions, kind), statFx: stat?.fx ?? [], notes, multi: moves.length > 1 || attacks.length > 1 };

  const base = (v) => statValue(v, chars);
  const rel = (n, statNumber) => (n.vt ? (statNumber ?? 0) + (n.vt === 'minus' ? -1 : 1) * (statValue(n.v, chars) ?? 0) : statValue(n.v, chars));
  if (moves[0]) {
    const m = moves[0], statMove = stat ? base(stat.move) : 0;
    out.move = Math.max(0, rel(m, statMove) ?? 0);
    out.jumping = !!m.sub?.some(s => s.t === 'jump');
    if (stat && base(stat.move) === null) notes.push(`Stat card movement ${stat.move} not worked out`);
  }
  if (attacks[0]) {
    const a = attacks[0], statAttack = stat ? base(stat.attack) : null;
    out.damage = a.vt ? (statAttack === null ? null : rel(a, statAttack)) : statValue(a.v, chars);
    for (const s of a.sub ?? []) {
      if (['pierce', 'push', 'pull', 'condition', 'element', 'elementHalf'].includes(s.t)) out.effects.push({ t: s.t, v: s.v });
      if (s.t === 'range' && typeof s.v === 'number') out.range = s.v;
      else if (s.t === 'target') {
        const t = s.v === 'all' ? 6 : statValue(s.v, chars);
        if (t === null) notes.push(`Target ${typeof s.v === 'string' ? s.v : ''}`.trim());
        else out.targets = t;
      } else if (s.t === 'specialTarget') {
        if (s.v === 'enemiesAdjacent' || s.v === 'all') out.targets = 6;
        else notes.push(`Special target: ${s.v}`);
      } else if (s.t === 'area' && s.area) {
        out.area = s.area.cells;
        out.areaMelee = s.area.melee;
        if (s.area.active > 1) notes.push('The area is drawn for a monster of several hexes');
      }
    }
    if (out.area.length && out.areaMelee && out.range > 0) out.range = 0;                  // a melee area attack has no range
    if (out.area.length && !out.areaMelee && !(out.range > 0)) notes.push('Ranged area without a range on the card');
  }
  if (out.multi) notes.push('The card has several moves or attacks: the first of each is used');
  return out;
}

// The cards of a deck (GH2_MONSTER_DECKS[slug]) that can be the card seen on the map: same initiative and shuffle mark; when none has both, the same
// initiative. The map's own card numbers (the images) are not the Secretariat's card ids, so equal initiatives can be ambiguous.
export function candidatesFor(deck, init, shuffle) {
  const same = (deck ?? []).filter(c => c.init === init);
  const exact = same.filter(c => !!c.shuffle === !!shuffle);
  return exact.length ? exact : same;
}

// Candidates that differ in what they do (equal cards, such as two copies of one card, count once).
export function distinctCards(cards) {
  const seen = new Map();
  for (const c of cards) { const k = JSON.stringify(c.actions); if (!seen.has(k)) seen.set(k, c); }
  return [...seen.values()];
}

// The cells of a pattern on the 7 by 7 drawing of the map page editor (cell index = column * 7 + row): a melee pattern around the centre cell (24), a ranged
// one with its most central cell on the centre. Cells that do not fit are left out (fits: false).
export function areaIndexes(cells, melee) {
  if (!cells.length) return { indexes: [], fits: true };
  let origin = [0, 0];
  if (!melee) {                                                                   // the cell closest to the others
    const d = (p, q) => { const dq = p[0] - q[0], dr = p[1] - q[1]; return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)); };
    origin = cells.reduce((best, c) => (cells.reduce((s, o) => s + d(c, o) ** 2, 0) < cells.reduce((s, o) => s + d(best, o) ** 2, 0) ? c : best));
  }
  const centre = toAxial(4, 3), indexes = [];
  let fits = true;
  for (const c of cells) {
    const b = toBoard(centre.q + c[0] - origin[0], centre.r + c[1] - origin[1]);
    if (b.col >= 1 && b.col <= 7 && b.row >= 0 && b.row <= 6) indexes.push((b.col - 1) * 7 + b.row); else fits = false;
  }
  return { indexes: indexes.sort((p, q) => p - q), fits };
}
