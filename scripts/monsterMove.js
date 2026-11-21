// Monster movement and focus, stage 1 (exploration, branch explore/monster-automation). Pure logic, no DOM.
// Follows the solver of https://github.com/AluminumAngel/gloom (MIT), server/solver.py calculate_monster_move, with the Gloomhaven rule set
// (the Gloomhaven 2e rules): focus ties are broken by proximity, then initiative; avoiding disadvantage against the focus comes first.
//
// Input: a hex state (scripts/hexState.js buildHexState) and the action of the active monster:
//   active       { col, row } of the active monster (a figure of the hex state)
//   move         movement points (0 for no move)
//   range        attack range, 0 for a melee attack or no attack (the monster then wants to be next to its focus)
//   attack       false when the action has no attack (default true; the monster still moves towards its focus)
//   flying, jumping, teleport   movement type (flying: over obstacles and figures, no traps or difficult terrain; jumping: over obstacles and
//                figures, only the last hex counts for traps and difficult terrain; teleport: through everything but the void)
//   muddled      muddled monsters are not made to avoid disadvantage
//   initiatives  { 'col,row': number } initiative of each character figure (mercenaries and summons), missing = 99
//   canSee(a, b) line of sight between two hexes, default always true (stage 1: not implemented)
//
// Output: { focuses, canAttackFocus, actions, floorKnown }
//   focuses         the tied focus figures; the players choose among them
//   canAttackFocus  the focus can be attacked this turn
//   actions         end hexes [{ col, row, focus: [key], attack: bool, destinations: [key] }]. attack: the focus is attacked from there. Without a
//                   possible attack, destinations lists the hexes it moves towards. All tied actions are returned; the players choose.
// Not in stage 1: several targets, area attacks, secondary targets, line of sight, thin walls, icy terrain (treated as plain floor).
import { COLS, ROWS } from './hex.js';
import { toAxial, toBoard } from './tileMask.js';
import { hexKey } from './hexState.js';

const INF = 1e9;
const DIRS = [[0, -1], [0, 1], [1, 0], [1, -1], [-1, 0], [-1, 1]];

export function neighbors(col, row) {
  const a = toAxial(col, row), out = [];
  for (const [dq, dr] of DIRS) {
    const b = toBoard(a.q + dq, a.r + dr);
    if (b.col >= 1 && b.col <= COLS && b.row >= 0 && b.row <= ROWS) out.push(b);
  }
  return out;
}

// Hex distance on an open board (cube distance).
export function hexDistance(c1, r1, c2, r2) {
  const a = toAxial(c1, r1), b = toAxial(c2, r2), dq = a.q - b.q, dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

const cellOf = (hs, k) => hs.cells.get(k) ?? {};
const isVoid = (hs, k) => hs.floorKnown && !hs.floor.has(k);

// Distance in hexes, walls and the void do not count as passable (obstacles and figures do), up to limit.
function proximity(hs, start, limit) {
  const dist = new Map([[hexKey(start.col, start.row), 0]]), queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i], d = dist.get(hexKey(cur.col, cur.row));
    if (d >= limit) continue;
    for (const n of neighbors(cur.col, cur.row)) {
      const k = hexKey(n.col, n.row);
      if (dist.has(k) || isVoid(hs, k) || cellOf(hs, k).blocksLos) continue;
      dist.set(k, d + 1);
      queue.push(n);
    }
  }
  return dist;
}

// The movement rules of one monster: what it can cross, where it can stop, what a hex costs.
function movement(hs, active, o) {
  const flying = !!o.flying, jumping = !!o.jumping && !flying, teleport = !!o.teleport;
  const free = flying || jumping || teleport;                                  // figures do not block
  const figureAt = new Map(hs.figures.map(f => [hexKey(f.col, f.row), f]));
  const own = hexKey(active.col, active.row);
  const enemyAt = k => { const f = figureAt.get(k); return f && f.side !== 'monsters'; };
  return {
    canTravel(k) {
      if (isVoid(hs, k)) return false;
      const c = cellOf(hs, k);
      if (teleport) return true;
      if (flying || jumping) return !c.blocksLos;
      return !c.blocked && !enemyAt(k);
    },
    canEnd(k) {
      if (isVoid(hs, k)) return false;
      const c = cellOf(hs, k);
      if (figureAt.has(k) && k !== own) return false;
      if (flying) return !c.blocksLos;
      return !c.blocked;
    },
    isTrap: k => !flying && !!(cellOf(hs, k).trap || cellOf(hs, k).hazardous),
    extra: k => (!free && cellOf(hs, k).difficult ? 1 : 0),
    pen: k => (jumping && !teleport ? (cellOf(hs, k).difficult ? 1 : 0) : !free && cellOf(hs, k).difficult ? 1 : 0),   // what the last hex adds to a way
    jumping, teleport, flying, free,
  };
}

// Shortest ways from start: Map key -> { d: movement points, t: traps }, ordered by (traps, distance) like the solver.
function paths(hs, start, mv) {
  const sk = hexKey(start.col, start.row), best = new Map([[sk, { d: 0, t: 0 }]]), queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i], b = best.get(hexKey(cur.col, cur.row));
    for (const n of neighbors(cur.col, cur.row)) {
      const k = hexKey(n.col, n.row);
      if (!mv.canTravel(k)) continue;
      const d = b.d + 1 + mv.extra(k), t = mv.isTrap(k) + (mv.jumping || mv.teleport ? 0 : b.t), old = best.get(k);
      if (!old || t < old.t || (t === old.t && d < old.d)) { best.set(k, { d, t }); queue.push(n); }
    }
  }
  if (mv.jumping && !mv.teleport) {                                              // the last hex of a jump pays for difficult terrain
    for (const [k, v] of best) if (k !== sk) v.d += cellOfExtra(hs, k);
  }
  return best;
}
const cellOfExtra = (hs, k) => (cellOf(hs, k).difficult ? 1 : 0);

const lessTuple = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
const sameTuple = (a, b) => a.every((v, i) => v === b[i]);

// Collect the minimum of a tuple over items; returns { best, items }.
function minimize(items, tupleOf) {
  let best = null, keep = [];
  for (const it of items) {
    const t = tupleOf(it);
    if (!best || lessTuple(t, best)) { best = t; keep = [it]; } else if (sameTuple(t, best)) keep.push(it);
  }
  return { best, items: keep };
}

export function solveMove(hs, o) {
  const active = o.active, ak = hexKey(active.col, active.row), move = o.move ?? 0, canSee = o.canSee ?? (() => true);
  const attack = o.attack !== false;
  const melee = !(o.range > 0) || !attack, attackRange = melee ? 1 : o.range;
  const susceptible = !melee && !o.muddled;                                      // a ranged attack from a hex next to a target has disadvantage
  const mv = movement(hs, active, o), from = paths(hs, active, mv), initOf = f => o.initiatives?.[hexKey(f.col, f.row)] ?? 99;
  const characters = hs.figures.filter(f => f.side === 'characters');
  const stay = { actions: [{ col: active.col, row: active.row, focus: [], attack: false, destinations: [] }], focuses: [], canAttackFocus: false, floorKnown: hs.floorKnown };
  if (!characters.length) return stay;

  const proxFromActive = proximity(hs, active, INF);
  const endHexes = [...from.keys()].filter(k => mv.canEnd(k));
  const cell = k => { const [c, r] = k.split(',').map(Number); return { col: c, row: r }; };

  // focus: for each character the hexes it can be attacked from; the best by (traps, distance, proximity, initiative)
  const proxFrom = new Map(characters.map(f => [hexKey(f.col, f.row), proximity(hs, f, attackRange)]));
  const options = [];
  for (const f of characters) {
    const fk = hexKey(f.col, f.row), reach = proxFrom.get(fk);
    for (const k of endHexes) {
      if (!reach.has(k) || !canSee(f, cell(k))) continue;
      options.push({ f, k, fk });
    }
  }
  const focusTuple = x => [from.get(x.k).t, from.get(x.k).d, proxFromActive.get(x.fk) ?? INF, initOf(x.f)];
  const bestFocus = minimize(options, focusTuple);
  if (!bestFocus.items.length) return { ...stay, floorKnown: hs.floorKnown };
  const focuses = [...new Map(bestFocus.items.map(x => [x.fk, x.f])).values()];
  const canAttackFocus = bestFocus.best[1] <= move;

  const actions = new Map();                                                       // end hex key -> action
  const add = (k, focusKey, isAttack, dest) => {
    if (!actions.has(k)) actions.set(k, { ...cell(k), focus: [], attack: isAttack, destinations: [] });
    const a = actions.get(k);
    if (!a.focus.includes(focusKey)) a.focus.push(focusKey);
    if (dest && !a.destinations.includes(dest)) a.destinations.push(dest);
  };

  for (const f of focuses) {
    const fk = hexKey(f.col, f.row), reach = proxFrom.get(fk), spots = endHexes.filter(k => reach.has(k) && canSee(f, cell(k)));
    // where to attack from: fewest traps, reachable, no disadvantage, shortest way
    const attackFrom = minimize(spots, k => [from.get(k).t, from.get(k).d <= move ? 0 : 1, susceptible && hexDistance(cell(k).col, cell(k).row, f.col, f.row) === 1 ? 1 : 0, from.get(k).d]);
    if (canAttackFocus) {
      for (const k of attackFrom.items) add(k, fk, attack, null);
    } else {
      // out of reach: move to the reachable hex that is closest to an attack hex (fewest traps, then distance, then own way)
      const reachable = endHexes.filter(k => from.get(k).d <= move);
      for (const dk of attackFrom.items) {
        const back = paths(hs, cell(dk), mv);
        const m = minimize(reachable.filter(k => back.has(k)), k => {
          const here = from.get(k), rest = back.get(k);                              // way from the destination, corrected for entering costs
          const traps = rest.t - (mv.isTrap(k) ? 1 : 0) + (mv.isTrap(dk) ? 1 : 0) + here.t;
          const dist = rest.d - mv.pen(k) + mv.pen(dk);
          return [traps, dist, here.d];
        });
        for (const k of m.items) add(k, fk, false, dk);
      }
    }
  }
  if (!actions.size) return { ...stay, focuses, canAttackFocus, floorKnown: hs.floorKnown };
  return { focuses, canAttackFocus, actions: [...actions.values()], floorKnown: hs.floorKnown };
}
