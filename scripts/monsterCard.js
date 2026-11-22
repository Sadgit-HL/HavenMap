// From a monster's ability card and stat card to the options of the solver (scripts/monsterMove.js). Pure logic, no DOM.
// The data comes from scripts/games/gh2_monsters.js (tools/extract-monster-data.py); the caller passes the records so this file also runs in Node.
//
// cardOptions({ monster, kind, level, card, chars }) -> { move, range, targets, area, areaMelee, attack, jumping, flying, damage, notes, multi }
//   monster  GH2_MONSTERS record     kind  'normal' | 'elite' | 'boss'     level  0 to 7     card  one card of GH2_MONSTER_DECKS[deck]
//   chars    number of characters, for the stat values of bosses that scale with it ('C', 'Cx2', 'C+1')
//   infused  names of the infused elements (infusedNames(state.elements)): a consume of one of them adds its attack, target, range, area and effects to the
//            attack, or gives the move or attack that only exists then; a consume of another one is left out. Nothing is consumed here, the player does that.
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
import { ELEMENTS } from './games/common.js';
import { GH2_CARD_IDS } from './games/gh2_card_ids.js';

// The value of a stat card entry: a number, or a formula of C (characters) and numbers such as 'Cx9', '7xC', 'C+1'; null when it cannot be worked out.
export function statValue(v, chars) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const expr = v.replace(/C/g, String(chars)).replace(/x/g, '*').replace(/\s+/g, '');
  if (!/^[0-9+\-*()\[\].]+$/.test(expr)) return null;
  try { const n = Function(`"use strict"; return (${expr.replace(/\[/g, '(').replace(/\]/g, ')')});`)(); return Number.isFinite(n) ? n : null; } catch { return null; }
}

// Elements. A consume node is { t: 'element', v: name, vt: 'minus', sub } (a create has no vt): its sub applies only when that element is infused. The map
// page keeps the elements as state.elements (0 inert, 1 waning, 2 strong, in the order of ELEMENTS in games/common.js); the caller passes the names of the infused ones. Consuming is left to the player.
export const infusedNames = elements => ELEMENTS.filter((_, i) => (elements?.[i] ?? 0) > 0).map(e => e.key);   // state.elements is in the order of ELEMENTS
const isConsume = n => n.t === 'element' && n.vt === 'minus';
const ADVANTAGE = /^(dis)?advantage$/i;                                          // a custom text that is just this: the attack has advantage or disadvantage
const consumeOn = (n, infused) => infused.includes(n.v) || (n.v === 'wild' && infused.length > 0);   // wild: any element
const addNote = (notes, text) => { if (!notes.includes(text)) notes.push(text); };
const consumeNote = (n, on) => `Consume ${n.v}: ${on ? 'infused, bonus applied' : 'not infused, bonus not applied'}`;
const signed = n => (n.vt === 'subtract' || n.vt === 'minus' ? -1 : 1) * (Number(n.v) || 0);   // nested modifiers: add or plus, subtract or minus

// A sub list with the consumes resolved: those whose element is infused are replaced by the element and their own sub, the others are dropped.
function expandConsumes(nodes, infused, notes) {
  const out = [];
  for (const n of nodes ?? []) {
    if (!isConsume(n)) { out.push(n); continue; }
    const on = consumeOn(n, infused);
    addNote(notes, consumeNote(n, on));
    if (on) out.push({ t: 'element', v: n.v, vt: 'minus' }, ...expandConsumes(n.sub, infused, notes));   // the consumed element stays in the effects (vt minus: the consume icon)
  }
  return out;
}

// The sub of a consume at the top of a card that holds an attack: the other entries (target, range, area, conditions ...) belong to that attack.
function attackWithSiblings(sub, element) {
  const atk = (sub ?? []).find(s => s.t === 'attack');
  if (!atk) return sub ?? [];
  const rest = sub.filter(s => s !== atk && s.t !== 'move' && s.t !== 'attack');
  const consumed = { t: 'element', v: element, vt: 'minus' };                    // the element it consumes is part of the attack in the effects
  return sub.filter(s => !rest.includes(s)).map(s => (s === atk ? { ...atk, sub: [...(atk.sub ?? []), ...rest, consumed] } : s));
}

// One action with the infused consumes in its sub merged in: heal 2 with consume dark: heal +1 is heal 3 (and the element, as it is consumed); a consume that is not
// infused is left out. A relative value of the consume is added, a target of the consume replaces the one of the action.
function resolveNode(n, infused, notes) {
  if (!(n.sub ?? []).some(isConsume)) return n;
  let v = n.v, vt = n.vt;
  const sub = [];
  const setOrAdd = (c, rel) => {
    const i = sub.findIndex(x => x.t === c.t);
    if (i < 0) sub.push(rel ? { t: c.t, v: signed(c) } : c);
    else sub[i] = { ...sub[i], v: rel && typeof sub[i].v === 'number' ? sub[i].v + signed(c) : c.v };
  };
  for (const s of n.sub) {
    if (!isConsume(s)) { sub.push(s); continue; }
    const on = consumeOn(s, infused);
    addNote(notes, consumeNote(s, on));
    if (!on) continue;
    for (const c of s.sub ?? []) {
      const rel = ['add', 'subtract', 'plus', 'minus'].includes(c.vt);
      if (c.t === n.t && rel && typeof v === 'number' && typeof c.v === 'number') {
        const now = (vt === 'minus' ? -1 : 1) * v + signed(c);
        v = vt ? Math.abs(now) : now;
        if (vt) vt = now < 0 ? 'minus' : 'plus';
      } else if (c.t === 'range' || c.t === 'target') setOrAdd(c, c.vt === 'add' || c.vt === 'subtract');
      else sub.push(c);
    }
    sub.push({ t: 'element', v: s.v, vt: 'minus' });
  }
  const out = { ...n, sub };
  if (v !== undefined) out.v = v;
  if (vt) out.vt = vt;
  return out;
}

// The other actions of a card for the player and the forum text: a consume of the attack or move is part of that (not repeated here), one that stands for
// itself shows when its element is infused, and a consume inside an action is merged into it.
function resolveExtras(nodes, infused, notes) {
  const out = [];
  for (const n of nodes) {
    if (isConsume(n)) {
      if ((n.sub ?? []).some(s => s.t === 'attack' || s.t === 'move')) continue;
      const on = consumeOn(n, infused);
      addNote(notes, consumeNote(n, on));
      if (on) out.push(n);
    } else out.push(resolveNode(n, infused, notes));
  }
  return out;
}

// Move and attack nodes of a card in reading order, inside grids and concatenations; monster type nodes only for the monster kind. A consume at the top
// of the card counts when its element is infused (its move or attack exists only then).
function findActions(nodes, kind, infused, notes, out = []) {
  for (const n of nodes ?? []) {
    if (n.t === 'move' || n.t === 'attack') out.push(n);
    else if (n.t === 'monsterType') { if (n.v === kind || kind === 'boss') findActions(n.sub, kind, infused, notes, out); }
    else if (isConsume(n)) {
      const on = consumeOn(n, infused);
      if ((n.sub ?? []).some(s => s.t === 'move' || s.t === 'attack')) addNote(notes, consumeNote(n, on));
      const mod = (n.sub ?? []).some(s => s.t === 'attack' && (s.vt === 'add' || s.vt === 'subtract')), last = out.map(o => o.t).lastIndexOf('attack');
      if (on && mod && last >= 0) out[last] = { ...out[last], sub: [...(out[last].sub ?? []), ...n.sub, { t: 'element', v: n.v, vt: 'minus' }] };      // attack +1 and an area for the attack before it
      else if (on) findActions(attackWithSiblings(n.sub, n.v), kind, infused, notes, out);
    }
    else if (n.sub) findActions(n.sub, kind, infused, notes, out);
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

export function cardOptions({ monster, kind = 'normal', level = 0, card, chars = 4, infused = [] }) {
  const stat = monster?.stats?.[kind]?.[level] ?? monster?.stats?.normal?.[level] ?? null;
  const notes = [];
  collectNotes(card.actions, notes);
  const found = findActions(card.actions, kind, infused, notes), moves = found.filter(n => n.t === 'move'), attacks = found.filter(n => n.t === 'attack');
  const out = { move: 0, range: 0, targets: 1, area: [], areaMelee: false, attack: attacks.length > 0, jumping: false, flying: !!monster?.flying, damage: null, effects: [], extras: findExtras(card.actions, kind), statFx: stat?.fx ?? [], notes, multi: moves.length > 1 || attacks.length > 1 };

  out.extras = resolveExtras(out.extras, infused, notes);
  const base = (v) => statValue(v, chars);
  const rel = (n, statNumber) => (n.vt ? (statNumber ?? 0) + (n.vt === 'minus' ? -1 : 1) * (statValue(n.v, chars) ?? 0) : statValue(n.v, chars));
  if (moves[0]) {
    const m = moves[0], statMove = stat ? base(stat.move) : 0;
    out.move = Math.max(0, rel(m, statMove) ?? 0);
    out.jumping = expandConsumes(m.sub, infused, notes).some(s => s.t === 'jump');
    if (stat && base(stat.move) === null) notes.push(`Stat card movement ${stat.move} not worked out`);
  }
  const applied = [];                                                              // the permanent effects of the stat card that went into the attack
  if (attacks[0]) {
    const a = attacks[0], statAttack = stat ? base(stat.attack) : null;
    out.damage = a.vt ? (statAttack === null ? null : rel(a, statAttack)) : statValue(a.v, chars);
    const statTarget = (stat?.fx ?? []).find(f => f.t === 'target'), baseTargets = statTarget ? (statTarget.v === 'all' ? 6 : statValue(statTarget.v, chars)) : null;
    if (baseTargets > 1) { out.targets = baseTargets; applied.push(baseTargets >= 6 ? 'all targets' : `target ${baseTargets}`); }   // the base of the targets: the card sets it again or adds to it
    let dmgMod = 0, rangeMod = 0, targetMod = 0;                                   // modifiers of an infused consume: attack +2, range -1, target +1
    for (const s of expandConsumes(a.sub, infused, notes)) {
      if (['pierce', 'push', 'pull', 'condition', 'element', 'elementHalf'].includes(s.t)) out.effects.push(s.vt === 'minus' ? { t: s.t, v: s.v, vt: 'minus' } : { t: s.t, v: s.v });
      if (s.t === 'custom' && ADVANTAGE.test((s.txt ?? '').trim())) { const t = s.txt.trim().toLowerCase(); if (!out.effects.some(e => e.t === t)) out.effects.push({ t }); }
      if (s.t === 'attack') dmgMod += signed(s);
      else if (s.t === 'range' && typeof s.v === 'number') { if (s.vt === 'add' || s.vt === 'subtract') rangeMod += signed(s); else out.range = s.v; }
      else if (s.t === 'target') {
        const t = s.v === 'all' ? 6 : statValue(s.v, chars);
        if (t === null) notes.push(`Target ${typeof s.v === 'string' ? s.v : ''}`.trim());
        else if (s.vt === 'add') targetMod += t;
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
    if (out.damage !== null) out.damage += dmgMod;
    if (rangeMod) out.range = Math.max(0, out.range + rangeMod);
    if (targetMod && out.targets < 6) out.targets += targetMod;
    if (out.area.length && out.areaMelee && out.range > 0) out.range = 0;                  // a melee area attack has no range
    if (out.area.length && !out.areaMelee && !(out.range > 0)) notes.push('Ranged area without a range on the card');
    // the permanent effects of the stat card belong to every attack: conditions, pierce (added to the card's), advantage or disadvantage
    for (const f of stat?.fx ?? []) {
      if (f.t === 'condition' && !out.effects.some(e => e.t === 'condition' && e.v === f.v)) { out.effects.push({ t: 'condition', v: f.v }); applied.push(String(f.v)); }
      else if (f.t === 'pierce' && typeof f.v === 'number') {
        const e = out.effects.find(x => x.t === 'pierce');
        if (e) e.v += f.v; else out.effects.push({ t: 'pierce', v: f.v });
        applied.push(`pierce ${f.v}`);
      } else if (f.t === 'custom' && ADVANTAGE.test((f.txt ?? '').trim())) {
        const t = f.txt.trim().toLowerCase();
        if (!out.effects.some(e => e.t === t)) out.effects.push({ t });
        applied.push(t);
      }
    }
    if (applied.length) notes.push(`Stat card effects on the attack: ${applied.join(', ')}`);
  }
  for (const f of stat?.fx ?? []) if (f.t === 'custom' && f.txt && !ADVANTAGE.test(f.txt.trim())) addNote(notes, `Stat card: ${f.txt}`);   // auras and the like: not part of the attack
  if (out.multi) notes.push(`The card has several moves or attacks: the first of each is used${applied.length ? '; the stat card effects apply to every attack' : ''}`);
  return out;
}

// The cards of a deck (GH2_MONSTER_DECKS[slug]) that can be the card seen on the map: same initiative and shuffle mark; when none has both, the same
// initiative. The map's own card numbers (the images) are not the Secretariat's card ids, so equal initiatives can be ambiguous.
export function candidatesFor(deck, init, shuffle) {
  const same = (deck ?? []).filter(c => c.init === init);
  const exact = same.filter(c => !!c.shuffle === !!shuffle);
  return exact.length ? exact : same;
}

// The cards of a deck that a map card can be: the one its number is mapped to (games/gh2_card_ids.js, for the cards that share their initiative with another
// one of the deck), otherwise candidatesFor(). c is a card of the map's deck: { n, init, s }.
export function cardCandidates(slug, deck, c) {
  const id = GH2_CARD_IDS[slug]?.[c.n];
  const exact = id ? (deck ?? []).filter(x => x.id === id) : [];
  return exact.length ? exact : candidatesFor(deck, c.init, c.s);
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
