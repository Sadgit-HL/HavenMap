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
//   area         area attack: axial offsets [q, r] of the pattern (areaOffsets() makes them from a 7 by 7 drawing); from the monster for range 0
//   canSee(a, b) line of sight between two hexes (scripts/los.js makeSightLine), default always true
//
// Output: { focuses, canAttackFocus, actions, floorKnown }
//   focuses         the tied focus figures; the players choose among them
//   canAttackFocus  the focus can be attacked this turn
//   actions         [{ col, row, focus: [key], attack: bool, targets: [key], area: [key], destinations: [key] }], one per end hex and group of targets that tie.
//                   attack: the monster attacks from there, targets are the figures it attacks (the focus is always one of them). Without a
//                   possible attack, destinations lists the hexes it moves towards. All tied actions are returned; the players choose.
// Several targets follow gloom: the best group of targets is found first (fewest traps, reachable, no disadvantage against the focus, most targets,
// shortest way, then the most targets of the best rank; rank is by proximity and initiative), then the end hex with the fewest disadvantaged targets.
// Area attacks follow gloom too: the area is put where it hits the most targets that count (patterns turn and mirror); the focus must be hit.
// Walls on hex edges (hs.walls) stop moving, ranges and adjacency. Not done: icy terrain (treated as plain floor).
import { COLS, ROWS } from './hex.js';
import { toAxial, toBoard } from './tileMask.js';
import { hexKey } from './hexState.js';
import { neighbors, hexDistance, edgeKey } from './hexGrid.js';

export { neighbors, hexDistance };
const INF = 1e9;

const cellOf = (hs, k) => hs.cells.get(k) ?? {};
const isVoid = (hs, k) => hs.floorKnown && !hs.floor.has(k);
// A wall on the edge between two neighbouring hexes (hs.walls: the borders of tiles that no door or corridor joins, and thin walls): nothing passes it, not
// moving, not measuring a range, and it blocks sight.
const walled = (hs, k1, k2) => !!hs.walls && hs.walls.has(edgeKey(k1, k2));

// Distance in hexes, walls and the void do not count as passable (obstacles and figures do), up to limit.
function proximity(hs, start, limit) {
  const dist = new Map([[hexKey(start.col, start.row), 0]]), queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i], d = dist.get(hexKey(cur.col, cur.row));
    if (d >= limit) continue;
    for (const n of neighbors(cur.col, cur.row)) {
      const k = hexKey(n.col, n.row);
      if (dist.has(k) || isVoid(hs, k) || cellOf(hs, k).blocksLos || walled(hs, hexKey(cur.col, cur.row), k)) continue;
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
      if (!mv.canTravel(k) || walled(hs, hexKey(cur.col, cur.row), k)) continue;
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

// ---- area attacks --------------------------------------------------------------------------------------------------------------------------------
// An area pattern is a list of axial offsets [q, r] (the grid of scripts/tileMask.js). A melee area attack (range 0) is drawn around the monster: the offsets
// are from the monster's hex. A ranged one is a shape that can be put anywhere in range: only the shape matters, so the offsets are from any hex of it.
// Patterns may be turned and mirrored (12 ways), like in gloom.
const rot60 = ([q, r]) => [-r, q + r];                                          // 60 degrees clockwise
const mirror = ([q, r]) => [q, -q - r];
const symmetry = (off, i) => { let p = i >= 6 ? mirror(off) : off; for (let s = 0; s < i % 6; s++) p = rot60(p); return p; };

// The offsets of a pattern drawn on a 7 by 7 grid like gloom's (cell index = column * 7 + row, odd columns shifted down by half a hex as on the board):
// from the centre cell (24) for a melee area attack, from the first cell otherwise.
export function areaOffsets(indexes, melee, height = 7) {
  if (!indexes.length) return [];
  const at = i => toAxial(Math.floor(i / height) + 1, i % height), ref = at(melee ? 24 : indexes[0]);
  return indexes.map(i => { const a = at(i); return [a.q - ref.q, a.r - ref.r]; });
}

// All placements of a ranged pattern with one of its hexes on the origin: every hex pinned to the origin, every turn and mirror, without duplicates.
function pinnedPatterns(area) {
  const seen = new Map();
  for (const pin of area) {
    for (let i = 0; i < 12; i++) {
      const cells = area.map(o => symmetry([o[0] - pin[0], o[1] - pin[1]], i)).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      seen.set(cells.map(c => c.join(',')).join(';'), cells);
    }
  }
  return [...seen.values()];
}

// The hex an offset from (col, row) is, or null off the board.
function offsetHex(col, row, off) {
  const a = toAxial(col, row), b = toBoard(a.q + off[0], a.r + off[1]);
  return b.col >= 1 && b.col <= COLS && b.row >= 0 && b.row <= ROWS ? b : null;
}

export function solveMove(hs, o) {
  const active = o.active, move = o.move ?? 0, canSee = o.canSee ?? (() => true);
  const attack = o.attack !== false, area = attack ? (o.area ?? []) : [];
  const aoe = area.length > 0, aoeMelee = aoe && !(o.range > 0);
  const melee = !(o.range > 0) || !attack, attackRange = melee ? 1 : o.range;
  const susceptible = !melee && !o.muddled;                                      // a ranged attack from a hex next to a target has disadvantage
  const allTargets = (o.targets ?? 1) === 6, plusTarget = (o.targets ?? 1) - 1;
  const numTargets = aoe ? Math.max(0, plusTarget) : 1 + Math.max(0, plusTarget);   // targets to add to those the area hits (or to the focus)
  const mv = movement(hs, active, o), from = paths(hs, active, mv), initOf = f => o.initiatives?.[hexKey(f.col, f.row)] ?? 99;
  const characters = hs.figures.filter(f => f.side === 'characters');
  const stay = { actions: [{ col: active.col, row: active.row, focus: [], attack: false, targets: [], area: [], destinations: [] }], focuses: [], canAttackFocus: false, floorKnown: hs.floorKnown };
  if (!characters.length) return stay;

  const proxFromActive = proximity(hs, active, INF);
  const endHexes = [...from.keys()].filter(k => mv.canEnd(k));
  const cell = k => { const [c, r] = k.split(',').map(Number); return { col: c, row: r }; };
  const keyOf = f => hexKey(f.col, f.row);
  const charAt = new Map(characters.map(f => [keyOf(f), f]));
  const patterns = aoe && !aoeMelee ? pinnedPatterns(area) : [];
  const proxCache = new Map();
  const proxAt = k => { if (!proxCache.has(k)) proxCache.set(k, proximity(hs, cell(k), attackRange)); return proxCache.get(k); };

  // can the character be hit by an attack made from the end hex k (the focus test)
  const proxFrom = new Map(characters.map(f => [keyOf(f), proximity(hs, f, attackRange)]));
  const canHit = (f, k) => {
    if (!aoe || plusTarget > 0) { if (proxFrom.get(keyOf(f)).has(k)) return true; }
    if (!aoe) return false;
    if (aoeMelee) {
      for (let i = 0; i < 12; i++) for (const off of area) { const h = offsetHex(cell(k).col, cell(k).row, symmetry(off, i)); if (h && h.col === f.col && h.row === f.row) return true; }
      return false;
    }
    const dist = proxAt(k);
    for (const pattern of patterns) for (const off of pattern) {
      const h = offsetHex(f.col, f.row, off);
      if (h && (dist.get(hexKey(h.col, h.row)) ?? INF) <= attackRange) return true;
    }
    return false;
  };

  // focus: for each character the hexes it can be attacked from; the best by (traps, distance, proximity, initiative)
  const options = [];
  for (const f of characters) {
    const fk = keyOf(f);
    for (const k of endHexes) {
      if (!canHit(f, k) || !canSee(f, cell(k))) continue;
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
  const adjacent = (k, f) => { const c = cell(k); return hexDistance(c.col, c.row, f.col, f.row) === 1 && !walled(hs, k, keyOf(f)); };
  const combos = (list, n) => {                                                  // all groups of n of the list
    if (n <= 0) return [[]];
    if (list.length < n) return [];
    const out = [];
    const rec = (start, acc) => { if (acc.length === n) { out.push(acc.slice()); return; } for (let i = start; i < list.length; i++) { acc.push(list[i]); rec(i + 1, acc); acc.pop(); } };
    rec(0, []);
    return out;
  };
  const groupKey = g => g.map(keyOf).sort(byHex).join(' ');

  // the ways an attack from the end hex k can be placed: [{ pre: characters the area hits, preDis: of them with disadvantage, hexes: the area }]
  const placements = k => {
    const here = cell(k), out = [];
    const hit = hexes => {
      const pre = [];
      for (const h of hexes) { const f = charAt.get(hexKey(h.col, h.row)); if (f && !pre.includes(f) && canSee(f, here)) pre.push(f); }
      return pre;
    };
    const place = (hexes) => {
      const pre = hit(hexes);
      return { pre, preDis: susceptible ? pre.filter(f => adjacent(k, f)).length : 0, hexes: hexes.map(keyOf) };
    };
    if (!aoe) return [{ pre: [], preDis: 0, hexes: [] }];
    if (aoeMelee) {
      for (let i = 0; i < 12; i++) {
        const p = place(area.map(off => offsetHex(here.col, here.row, symmetry(off, i))).filter(Boolean));
        if (p.pre.length) out.push(p);
      }
    } else {
      const dist = proxAt(k);
      for (const f of characters) for (const pattern of patterns) {
        const hexes = pattern.map(off => offsetHex(f.col, f.row, off)).filter(Boolean);
        if (!hexes.some(h => (dist.get(hexKey(h.col, h.row)) ?? INF) <= attackRange)) continue;
        const p = place(hexes);
        if (p.pre.length) out.push(p);
      }
    }
    return out;
  };

  const actions = new Map();                                                       // end hex (and group) -> action
  const add = (k, focusKey, isAttack, group, dest, hexes) => {
    const id = isAttack ? k + '|' + groupKey(group) : k;
    if (!actions.has(id)) actions.set(id, { ...cell(k), focus: [], attack: isAttack, targets: isAttack ? group.map(keyOf).sort(byHex) : [], area: isAttack ? hexes ?? [] : [], destinations: [] });
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
      if (!aoe && !list.includes(f)) continue;
      const here = from.get(k), reach = here.d <= move ? 0 : 1, focusDis = susceptible && adjacent(k, f) ? 1 : 0;
      for (const p of placements(k)) {
        const avail = list.filter(c => !p.pre.includes(c));
        const n = allTargets ? avail.length : Math.min(numTargets, avail.length);
        for (const g of combos(avail, n)) {
          const targets = p.pre.concat(g);
          if (!targets.includes(f)) continue;
          const counts = Array(rankCount).fill(0);
          for (const t of targets) counts[rankOf.get(keyOf(t))]++;
          const tuple = [here.t, reach, focusDis, -targets.length, here.d, ...counts.map(c => -c)];
          if (!best || lessTuple(tuple, best)) { best = tuple; groups = new Set([groupKey(targets)]); } else if (sameTuple(tuple, best)) groups.add(groupKey(targets));
        }
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
      if (!aoe && !list.includes(f)) continue;
      for (const p of placements(k)) {
        const avail = list.filter(c => !p.pre.includes(c));
        const n = allTargets ? avail.length : Math.min(numTargets, avail.length);
        if (p.pre.length + n !== -best[3]) continue;
        for (const g of combos(avail, n)) {
          const targets = p.pre.concat(g);
          if (!groups.has(groupKey(targets))) continue;
          const tuple = [p.preDis + (susceptible ? g.filter(t => adjacent(k, t)).length : 0), here.d];
          if (!bestDest || lessTuple(tuple, bestDest)) { bestDest = tuple; dest.length = 0; dest.push({ k, g: targets, hexes: p.hexes }); } else if (sameTuple(tuple, bestDest)) dest.push({ k, g: targets, hexes: p.hexes });
        }
      }
    }
    if (reachable) {
      for (const { k, g, hexes } of dest) add(k, fk, attack, g, null, hexes);
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
        for (const k of m.items) add(k, fk, false, [], dk, []);
      }
    }
  }
  if (!actions.size) return { ...stay, focuses, canAttackFocus, floorKnown: hs.floorKnown };
  return { focuses, canAttackFocus, actions: [...actions.values()], floorKnown: hs.floorKnown };
}
