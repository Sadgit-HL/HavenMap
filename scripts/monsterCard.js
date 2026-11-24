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
//   order    where things stand on the card, top to bottom: 'move' (the first move), 'attack' (the first attack) and the index of each extra in `extras`
//   statFx   the extras of the stat card (shield, retaliate ...), the base of a relative shield or retaliate on the card
//   notes    texts the solver cannot act on (custom card text, special targets, formulas), to show to the player
//   focusFarthest  the card makes the focus the farthest enemy in range instead of the closest (solveMove: farthest)
//   multi    the card has more than one attack or move (the panel works out every step, scripts/monsterTurnMulti.js; the fields above are the first of each)
//   plan     where everything stands on the card, top to bottom, with every move and attack: 's0', 's1' ... are the indexes into `steps`, a number the index of an extra
//   steps    every move and attack in reading order: { t: 'move', move, jumping } and { t: 'attack', damage, range, targets, area, areaMelee, effects, applied }; a step after
//            the first of its kind also has its own `notes`. The fields above (move, range, damage ...) are the first move and the first attack.
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

// The actions of a card in reading order, top to bottom: { t: 'move' }, { t: 'attack' } for every move and attack findActions finds, and { t: 'extra', node } for
// every other action (grids and concatenations opened, monster types only for this kind). A consume that is infused opens its move or attack where it stands;
// the actions inside another action are only searched for moves and attacks (extras: false), the action itself is the extra.
function readingOrder(nodes, kind, infused, extras = true, seq = []) {
  for (const n of nodes ?? []) {
    if (n.t === 'move' || n.t === 'attack') seq.push({ t: n.t });
    else if (n.t === 'monsterType') { if (n.v === kind || kind === 'boss') readingOrder(n.sub, kind, infused, extras, seq); }
    else if (isConsume(n)) {
      if (extras) seq.push({ t: 'extra', node: n });
      if (consumeOn(n, infused)) {
        const mod = (n.sub ?? []).some(s => s.t === 'attack' && (s.vt === 'add' || s.vt === 'subtract'));
        if (!(mod && seq.some(s => s.t === 'attack'))) readingOrder(attackWithSiblings(n.sub, n.v), kind, infused, false, seq);   // a modifier of the attack before it adds no attack
      }
    }
    else if (n.t === 'grid' || n.t === 'concatenation') readingOrder(n.sub, kind, infused, extras, seq);
    else {
      if (extras) seq.push({ t: 'extra', node: n });
      if (n.sub) readingOrder(n.sub, kind, infused, false, seq);
    }
  }
  return seq;
}

// A custom text of the card that matches `re`, inside the actions too.
const hasText = (nodes, re) => (nodes ?? []).some(n => (n.t === 'custom' && re.test(n.txt ?? '')) || hasText(n.sub, re));
const FARTHEST = /^focus on the enemy farthest away/i;                          // Long Shot: the focus is the farthest enemy in range, not the closest

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
  const out = { focusFarthest: hasText(card.actions, FARTHEST), move: 0, range: 0, targets: 1, area: [], areaMelee: false, attack: attacks.length > 0, jumping: false, flying: !!monster?.flying, damage: null, effects: [], extras: [], order: [], plan: [], statFx: stat?.fx ?? [], notes, multi: moves.length > 1 || attacks.length > 1 };

  // The extras one by one (a consume that is not infused is dropped), and where the first move, the first attack and each extra stand on the card.
  let sawMove = false, sawAttack = false, stepNo = 0;
  for (const it of readingOrder(card.actions, kind, infused)) {
    if (it.t === 'move') { if (!sawMove) { sawMove = true; out.order.push('move'); } out.plan.push(`s${stepNo++}`); }
    else if (it.t === 'attack') { if (!sawAttack) { sawAttack = true; out.order.push('attack'); } out.plan.push(`s${stepNo++}`); }
    else for (const x of resolveExtras([it.node], infused, notes)) { out.extras.push(x); out.order.push(out.extras.length - 1); out.plan.push(out.extras.length - 1); }
  }
  const base = (v) => statValue(v, chars);
  const rel = (n, statNumber) => (n.vt ? (statNumber ?? 0) + (n.vt === 'minus' ? -1 : 1) * (statValue(n.v, chars) ?? 0) : statValue(n.v, chars));

  // One move of the card as a step. `into` takes the notes of the step (the card's own notes for the first move, a list of the step for the others).
  const moveStep = (m, into) => {
    const statMove = stat ? base(stat.move) : 0;
    const step = { t: 'move', move: Math.max(0, rel(m, statMove) ?? 0), jumping: expandConsumes(m.sub, infused, into).some(s => s.t === 'jump') };
    if (stat && base(stat.move) === null) into.push(`Stat card movement ${stat.move} not worked out`);
    return step;
  };

  // One attack of the card as a step: damage, range, targets, area and what it does besides damage, with the permanent effects of the stat card (conditions,
  // pierce, advantage or disadvantage) that belong to every attack. `applied` lists those, for the note.
  const attackStep = (a, into) => {
    const step = { t: 'attack', damage: null, range: 0, targets: 1, area: [], areaMelee: false, effects: [], applied: [] };
    const applied = step.applied, statAttack = stat ? base(stat.attack) : null;
    step.damage = a.vt ? (statAttack === null ? null : rel(a, statAttack)) : statValue(a.v, chars);
    const statTarget = (stat?.fx ?? []).find(f => f.t === 'target'), baseTargets = statTarget ? (statTarget.v === 'all' ? 6 : statValue(statTarget.v, chars)) : null;
    if (baseTargets > 1) { step.targets = baseTargets; applied.push(baseTargets >= 6 ? 'all targets' : `target ${baseTargets}`); }   // the base of the targets: the card sets it again or adds to it
    let dmgMod = 0, rangeMod = 0, targetMod = 0;                                   // modifiers of an infused consume: attack +2, range -1, target +1
    for (const s of expandConsumes(a.sub, infused, into)) {
      if (['pierce', 'push', 'pull', 'condition', 'element', 'elementHalf'].includes(s.t)) step.effects.push(s.vt === 'minus' ? { t: s.t, v: s.v, vt: 'minus' } : { t: s.t, v: s.v });
      if (s.t === 'custom' && ADVANTAGE.test((s.txt ?? '').trim())) { const t = s.txt.trim().toLowerCase(); if (!step.effects.some(e => e.t === t)) step.effects.push({ t }); }
      if (s.t === 'attack') dmgMod += signed(s);
      else if (s.t === 'range' && typeof s.v === 'number') { if (s.vt === 'add' || s.vt === 'subtract') rangeMod += signed(s); else step.range = s.v; }
      else if (s.t === 'target') {
        const t = s.v === 'all' ? 6 : statValue(s.v, chars);
        if (t === null) into.push(`Target ${typeof s.v === 'string' ? s.v : ''}`.trim());
        else if (s.vt === 'add') targetMod += t;
        else step.targets = t;
      } else if (s.t === 'specialTarget') {
        if (s.v === 'enemiesAdjacent' || s.v === 'all') step.targets = 6;
        else into.push(`Special target: ${s.v}`);
      } else if (s.t === 'area' && s.area) {
        step.area = s.area.cells;
        step.areaMelee = s.area.melee;
        if (s.area.active > 1) into.push('The area is drawn for a monster of several hexes');
      }
    }
    if (step.damage !== null) step.damage += dmgMod;
    if (rangeMod) step.range = Math.max(0, step.range + rangeMod);
    if (targetMod && step.targets < 6) step.targets += targetMod;
    if (step.area.length && step.areaMelee && step.range > 0) step.range = 0;                  // a melee area attack has no range
    if (step.area.length && !step.areaMelee && !(step.range > 0)) into.push('Ranged area without a range on the card');
    for (const f of stat?.fx ?? []) {
      if (f.t === 'condition' && !step.effects.some(e => e.t === 'condition' && e.v === f.v)) { step.effects.push({ t: 'condition', v: f.v }); applied.push(String(f.v)); }
      else if (f.t === 'pierce' && typeof f.v === 'number') {
        const e = step.effects.find(x => x.t === 'pierce');
        if (e) e.v += f.v; else step.effects.push({ t: 'pierce', v: f.v });
        applied.push(`pierce ${f.v}`);
      } else if (f.t === 'custom' && ADVANTAGE.test((f.txt ?? '').trim())) {
        const t = f.txt.trim().toLowerCase();
        if (!step.effects.some(e => e.t === t)) step.effects.push({ t });
        applied.push(t);
      }
    }
    return step;
  };

  // The first move and the first attack go first, so that the card's notes keep their order; the others carry their notes with them (`notes` of the step).
  const made = new Map();
  if (moves[0]) made.set(moves[0], moveStep(moves[0], notes));
  if (attacks[0]) made.set(attacks[0], attackStep(attacks[0], notes));
  for (const n of found) if (!made.has(n)) { const own = []; const s = n.t === 'move' ? moveStep(n, own) : attackStep(n, own); s.notes = own; made.set(n, s); }
  out.steps = found.map(n => made.get(n));                                          // every move and attack in reading order

  const m0 = moves[0] && made.get(moves[0]), a0 = attacks[0] && made.get(attacks[0]);
  if (m0) { out.move = m0.move; out.jumping = m0.jumping; }
  const applied = a0 ? a0.applied : [];
  if (a0) {
    out.damage = a0.damage; out.range = a0.range; out.targets = a0.targets; out.area = a0.area; out.areaMelee = a0.areaMelee; out.effects = a0.effects;
    if (applied.length) notes.push(`Stat card effects on the attack: ${applied.join(', ')}`);
  }
  for (const f of stat?.fx ?? []) if (f.t === 'custom' && f.txt && !ADVANTAGE.test(f.txt.trim())) addNote(notes, `Stat card: ${f.txt}`);   // auras and the like: not part of the attack
  if (out.multi && applied.length) notes.push('The stat card effects apply to every attack');
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
