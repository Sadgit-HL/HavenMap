// Line of sight between two hexes, Gloomhaven rule (exploration, branch explore/monster-automation). Pure logic, no DOM.
// Rule: draw a line from any corner of one hex to any corner of the other; there is line of sight when at least one of those lines is not
// blocked. Walls and closed doors block (cells with blocksLos, scripts/hexState.js); obstacles and figures do not. A line is blocked when it touches
// a blocking hex: each blocking hex counts as its three long diagonals, and touching one (also at the end points) blocks. Adjacent hexes always see
// each other (they share corners). When the floor is known, hexes outside the tiles (the void) block like walls.
// Follows the vertex rule of https://github.com/AluminumAngel/gloom (MIT), server/solver.py test_vertex_los_between_locations.
import { COLS, ROWS } from './hex.js';
import { toAxial } from './tileMask.js';
import { hexKey } from './hexState.js';

const R = 45, H2 = 39, EPS = 1e-9;                                              // corner radius, half of the hex height (hex.js: 90 wide, 78 high)

// Exact hex centre on the axial grid (hexCenter() rounds odd columns), and the six corners.
function centre(col, row) { const a = toAxial(col, row); return { x: 67.5 * a.q, y: 78 * (a.r + a.q / 2) }; }
function corners(col, row) {
  const c = centre(col, row);
  return [[R, 0], [R / 2, H2], [-R / 2, H2], [-R, 0], [-R / 2, -H2], [R / 2, -H2]].map(([dx, dy]) => ({ x: c.x + dx, y: c.y + dy }));
}

const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
const orient = (o, a, b) => { const v = cross(o, a, b); return Math.abs(v) < EPS ? 0 : v > 0 ? 1 : -1; };
const within = (a, b, p) => Math.min(a.x, b.x) - EPS <= p.x && p.x <= Math.max(a.x, b.x) + EPS && Math.min(a.y, b.y) - EPS <= p.y && p.y <= Math.max(a.y, b.y) + EPS;

// Closed segments: touching, an end point on the other segment, and overlapping all count as meeting.
function meets(p1, p2, q1, q2) {
  const o1 = orient(p1, p2, q1), o2 = orient(p1, p2, q2), o3 = orient(q1, q2, p1), o4 = orient(q1, q2, p2);
  if (o1 !== o2 && o3 !== o4) return true;
  return (o1 === 0 && within(p1, p2, q1)) || (o2 === 0 && within(p1, p2, q2)) || (o3 === 0 && within(q1, q2, p1)) || (o4 === 0 && within(q1, q2, p2));
}

const same = (a, b) => Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS;

// The sight line between two hexes: the shortest unblocked corner to corner line as { x1, y1, x2, y2 } (board pixels, exact grid), or null.
// canSee(a, b) is the same as a sight line existing; answers are cached. Both work on { col, row } hexes of a hex state.
export function makeSightLine(hs) {
  const cache = new Map(), blocks = (c, r) => { const k = hexKey(c, r); return !!hs.cells.get(k)?.blocksLos || (hs.floorKnown && !hs.floor.has(k)); };
  const occluders = (c1, r1, c2, r2) => {
    const out = [];
    for (let c = Math.max(1, Math.min(c1, c2) - 2); c <= Math.min(COLS, Math.max(c1, c2) + 2); c++) {
      for (let r = Math.max(0, Math.min(r1, r2) - 2); r <= Math.min(ROWS, Math.max(r1, r2) + 2); r++) {
        if (!blocks(c, r) || (c === c1 && r === r1) || (c === c2 && r === r2)) continue;
        const v = corners(c, r);
        for (let i = 0; i < 3; i++) out.push([v[i], v[i + 3]]);
      }
    }
    return out;
  };
  return (a, b) => {
    if (a.col === b.col && a.row === b.row) { const c = centre(a.col, a.row); return { x1: c.x, y1: c.y, x2: c.x, y2: c.y }; }
    const key = a.col < b.col || (a.col === b.col && a.row < b.row) ? `${a.col},${a.row}|${b.col},${b.row}` : `${b.col},${b.row}|${a.col},${a.row}`;
    if (cache.has(key)) return cache.get(key);
    const va = corners(a.col, a.row), vb = corners(b.col, b.row), occ = occluders(a.col, a.row, b.col, b.row);
    let best = null, bestLen = Infinity;
    for (const p of va) {
      for (const q of vb) {
        const len = Math.hypot(p.x - q.x, p.y - q.y);
        if (len < bestLen && (same(p, q) || !occ.some(([o1, o2]) => meets(p, q, o1, o2)))) { best = { x1: p.x, y1: p.y, x2: q.x, y2: q.y }; bestLen = len; }
      }
    }
    cache.set(key, best);
    return best;
  };
}

export function makeCanSee(hs) {
  const line = makeSightLine(hs);
  return (a, b) => line(a, b) !== null;
}
