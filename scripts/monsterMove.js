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
//   targets      number of targets of the attack, default 1; 6 means all targets in range
//   canSee(a, b) line of sight between two hexes (scripts/los.js makeSightLine), default always true
//
// Output: { focuses, canAttackFocus, actions, floorKnown }
//   focuses         the tied focus figures; the players choose among them
//   canAttackFocus  the focus can be attacked this turn
//   actions         [{ col, row, focus: [key], attack: bool, targets: [key], destinations: [key] }], one per end hex and group of targets that tie.
//                   attack: the monster attacks from there, targets are the figures it attacks (the focus is always one of them). Without a
//                   possible attack, destinations lists the hexes it moves towards. All tied actions are returned; the players choose.
// Several targets follow gloom: the best group of targets is found first (fewest traps, reachable, no disadvantage against the focus, most targets,
// shortest way, then the most targets of the best rank; rank is by proximity and initiative), then the end hex with the fewest disadvantaged targets.
// Not done: area attacks, thin walls, icy terrain (treated as plain floor).
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
const byHex = (p, q) => { const [pc, pr] = p.split(',').map(Number), [qc, qr] = q.split(',').map(Number); return pc - qc || pr - qr; };

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
  const active = o.active, move = o.move ?? 0, canSee = o.canSee ?? (() => true);
  const attack = o.attack !== false;
  const melee = !(o.range > 0) || !attack, attackRange = melee ? 1 : o.range;
  const susceptible = !melee && !o.muddled;                                      // a ranged attack from a hex next to a target has disadvantage
  const allTargets = (o.targets ?? 1) === 6, groupSize = Math.max(1, o.targets ?? 1);
  const mv = movement(hs, active, o), from = paths(hs, active, mv), initOf = f => o.initiatives?.[hexKey(f.col, f.row)] ?? 99;
  const characters = hs.figures.filter(f => f.side === 'characters');
  const stay = { actions: [{ col: active.col, row: active.row, focus: [], attack: false, targets: [], destinations: [] }], focuses: [], canAttackFocus: false, floorKnown: hs.floorKnown };
  if (!characters.length) return stay;

  const proxFromActive = proximity(hs, active, INF);
  const endHexes = [...from.keys()].filter(k => mv.canEnd(k));
  const cell = k => { const [c, r] = k.split(',').map(Number); return { col: c, row: r }; };
  const keyOf = f => hexKey(f.col, f.row);

  // focus: for each character the hexes it can be attacked from; the best by (traps, distance, proximity, initiative)
  const proxFrom = new Map(characters.map(f => [keyOf(f), proximity(hs, f, attackRange)]));
  const options = [];
  for (const f of characters) {
    const fk = keyOf(f), reach = proxFrom.get(fk);
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

  // rank of each character for the secondary targets: by (proximity, initiative); equal values share a rank
  const ranked = characters.map(f => ({ k: keyOf(f), info: [proxFromActive.get(keyOf(f)) ?? INF, initOf(f)] })).sort((p, q) => (lessTuple(p.info, q.info) ? -1 : lessTuple(q.info, p.info) ? 1 : 0));
  const rankOf = new Map(); let rank = 0;
  ranked.forEach((x, i) => { if (i && !sameTuple(x.info, ranked[i - 1].info)) rank++; rankOf.set(x.k, rank); });
  const rankCount = rank + 1;

  // the characters that can be attacked from an end hex (in range, in sight)
  const targetable = new Map();
  const targetsFrom = k => {
    if (!targetable.has(k)) targetable.set(k, characters.filter(f => proxFrom.get(keyOf(f)).has(k) && canSee(f, cell(k))));
    return targetable.get(k);
  };
  const adjacent = (k, f) => { const c = cell(k); return hexDistance(c.col, c.row, f.col, f.row) === 1; };
  const combos = (list, n) => {                                                  // all groups of n of the list
    if (n <= 0) return [[]];
    if (list.length < n) return [];
    const out = [];
    const rec = (start, acc) => { if (acc.length === n) { out.push(acc.slice()); return; } for (let i = start; i < list.length; i++) { acc.push(list[i]); rec(i + 1, acc); acc.pop(); } };
    rec(0, []);
    return out;
  };
  const groupKey = g => g.map(keyOf).sort(byHex).join(' ');

  const actions = new Map();                                                       // end hex (and group) -> action
  const add = (k, focusKey, isAttack, group, dest) => {
    const id = isAttack ? k + '|' + groupKey(group) : k;
    if (!actions.has(id)) actions.set(id, { ...cell(k), focus: [], attack: isAttack, targets: isAttack ? group.map(keyOf).sort(byHex) : [], destinations: [] });
    const a = actions.get(id);
    if (!a.focus.includes(focusKey)) a.focus.push(focusKey);
    if (dest && !a.destinations.includes(dest)) a.destinations.push(dest);
  };

  for (const f of focuses) {
    const fk = keyOf(f);
    // pass 1: the best group of targets, with the end hex it is attacked from
    let best = null, groups = new Set();
    for (const k of endHexes) {
      const list = targetsFrom(k);
      if (!list.includes(f)) continue;
      const here = from.get(k), reach = here.d <= move ? 0 : 1, focusDis = susceptible && adjacent(k, f) ? 1 : 0;
      const n = allTargets ? list.length : Math.min(groupSize, list.length);
      for (const g of combos(list, n)) {
        if (!g.includes(f)) continue;
        const counts = Array(rankCount).fill(0);
        for (const t of g) counts[rankOf.get(keyOf(t))]++;
        const tuple = [here.t, reach, focusDis, -g.length, here.d, ...counts.map(c => -c)];
        if (!best || lessTuple(tuple, best)) { best = tuple; groups = new Set([groupKey(g)]); } else if (sameTuple(tuple, best)) groups.add(groupKey(g));
      }
    }
    if (!best) continue;
    const reachable = best[1] === 0;
    // pass 2: the end hexes for those groups with the fewest disadvantaged targets, then the shortest way
    const dest = [];
    let bestDest = null;
    for (const k of endHexes) {
      const here = from.get(k);
      if (here.t !== best[0] || (here.d <= move ? 0 : 1) !== best[1] || (susceptible && adjacent(k, f) ? 1 : 0) !== best[2]) continue;
      const list = targetsFrom(k);
      if (!list.includes(f)) continue;
      const n = allTargets ? list.length : Math.min(groupSize, list.length);
      if (n !== -best[3]) continue;
      for (const g of combos(list, n)) {
        if (!groups.has(groupKey(g))) continue;
        const tuple = [susceptible ? g.filter(t => adjacent(k, t)).length : 0, here.d];
        if (!bestDest || lessTuple(tuple, bestDest)) { bestDest = tuple; dest.length = 0; dest.push({ k, g }); } else if (sameTuple(tuple, bestDest)) dest.push({ k, g });
      }
    }
    if (reachable) {
      for (const { k, g } of dest) add(k, fk, attack, g, null);
    } else {
      // out of reach: move to the reachable hex that is closest to an attack hex (fewest traps, then distance, then own way)
      const reachableHexes = endHexes.filter(k => from.get(k).d <= move);
      for (const dk of [...new Set(dest.map(x => x.k))]) {
        const back = paths(hs, cell(dk), mv);
        const m = minimize(reachableHexes.filter(k => back.has(k)), k => {
          const here = from.get(k), rest = back.get(k);                              // way from the destination, corrected for entering costs
          const traps = rest.t - (mv.isTrap(k) ? 1 : 0) + (mv.isTrap(dk) ? 1 : 0) + here.t;
          const dist = rest.d - mv.pen(k) + mv.pen(dk);
          return [traps, dist, here.d];
        });
        for (const k of m.items) add(k, fk, false, [], dk);
      }
    }
  }
  if (!actions.size) return { ...stay, focuses, canAttackFocus, floorKnown: hs.floorKnown };
  return { focuses, canAttackFocus, actions: [...actions.values()], floorKnown: hs.floorKnown };
}
