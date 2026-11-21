// Line of sight between two hexes (exploration, branch explore/monster-automation). Pure logic, no DOM.
//
// The rule of the app (owner, 2026-11-21: the Gloomhaven 2e rules are the only source of truth for the hex map): there is line of sight when a line from
// ANY POINT of one hex to ANY POINT of the other can be drawn that no wall interrupts (rule 'full', the default). Walls and closed doors block (cells with
// blocksLos, scripts/hexState.js); obstacles and figures do not; hexes outside the tiles (the void) block like walls when the floor is known. A blocking hex
// counts as its three long diagonals, a wall on a hex edge (hs.walls: the borders of tiles, thin walls) as that edge. A line that only touches a wall does not
// pass: there must be a gap of some width. Neighbouring hexes see each other unless the edge between them is walled and the corners next to it are walled too.
//
// How: the lines from one hex to the other are the lines between the diameters of the two hexes that are most across the way between them (corner to opposite
// corner, the same diameter of both hexes, so the two are parallel). Mapped onto a unit square (s along the first diameter, t along the second) every wall
// blocks an interval of t for each s, bounded by straight lines in the square; there is line of sight when some s has an interval of t that no wall covers.
// The s to look at are the ones between the places where the bounding lines cross, so the answer is exact. This is gloom's full hex method
// (https://github.com/AluminumAngel/gloom, MIT, server/solver.py test_full_hex_los_between_locations) in a simpler form, which relies on the occluders
// lying on the hex grid like gloom's.
//
// Rule 'vertex' (corner to corner, gloom's Gloomhaven set) is kept for the regression test against gloom's own answers (tools/tests/gloomScenarios.test.mjs).
import { COLS, ROWS } from './hex.js';
import { toAxial } from './tileMask.js';
import { hexKey } from './hexState.js';
import { neighbors, hexDistance, edgeKey } from './hexGrid.js';

const R = 45, H2 = 39, EPS = 1e-9, GAP = 1e-7;                                  // corner radius, half of the hex height (hex.js: 90 wide, 78 high)

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

// ---- the full hex rule ----------------------------------------------------------------------------------------------------------------------------
// The part of a segment inside the closed unit square (Liang and Barsky), or null.
function clipToSquare(p, q) {
  let t0 = 0, t1 = 1;
  const dx = q.al - p.al, dy = q.be - p.be;
  for (const [pp, qq] of [[-dx, p.al + EPS], [dx, 1 + EPS - p.al], [-dy, p.be + EPS], [dy, 1 + EPS - p.be]]) {
    if (Math.abs(pp) < 1e-15) { if (qq < 0) return null; continue; }
    const r = qq / pp;
    if (pp < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  const a = { al: p.al + t0 * dx, be: p.be + t0 * dy }, b = { al: p.al + t1 * dx, be: p.be + t1 * dy };
  return Math.hypot(a.al - b.al, a.be - b.be) < 1e-9 ? null : { p: a, q: b };
}

// Where the line from (s, 0) through the point (al, be) meets be = 1: t. A point on the source line (be = 0) is at plus or minus infinity.
const tOf = (pt, s) => (pt.be <= 1e-9 ? (pt.al > s ? Infinity : -Infinity) : s + (pt.al - s) / pt.be);

// The widest gap of t in [0, 1] that no occluder covers at this s, or null.
function gapAt(segs, s) {
  const iv = [];
  for (const sg of segs) {
    const a = tOf(sg.p, s), b = tOf(sg.q, s), lo = Math.max(0, Math.min(a, b)), hi = Math.min(1, Math.max(a, b));
    if (hi >= lo) iv.push([lo, hi]);
  }
  iv.sort((x, y) => x[0] - y[0]);
  let cur = 0, best = null;
  for (const [lo, hi] of iv) {
    if (lo > cur + GAP && (!best || lo - cur > best.hi - best.lo)) best = { lo: cur, hi: lo };
    if (hi > cur) cur = hi;
  }
  if (1 > cur + GAP && (!best || 1 - cur > best.hi - best.lo)) best = { lo: cur, hi: 1 };
  return best;
}

// The s at which the picture changes: where two of the bounding lines cross, and where one meets t = 0 or t = 1.
function breakpoints(segs) {
  const lines = [{ a: 0, b: 0 }, { a: 0, b: 1 }], points = [0, 1];
  for (const sg of segs) for (const pt of [sg.p, sg.q]) {
    if (pt.be <= 1e-9) points.push(pt.al); else lines.push({ a: 1 - 1 / pt.be, b: pt.al / pt.be });
  }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const da = lines[i].a - lines[j].a;
    if (Math.abs(da) > 1e-12) points.push((lines[j].b - lines[i].b) / da);
  }
  const s = points.filter(v => v >= 0 && v <= 1).sort((x, y) => x - y), out = [];
  for (const v of s) if (!out.length || v - out[out.length - 1] > 1e-9) out.push(v);
  return out;
}

// The sight line between two hexes that are not neighbours by the full hex rule: { x1, y1, x2, y2 } through the middle of the widest gap, or null.
function fullLine(a, b, occ) {
  const ca = centre(a.col, a.row), cb = centre(b.col, b.row), va = corners(a.col, a.row), vb = corners(b.col, b.row);
  const dx = cb.x - ca.x, dy = cb.y - ca.y;
  let k = 0, bestAcross = -1;                                                     // the diameter most across the way between the hexes
  for (let i = 0; i < 3; i++) {
    const ex = va[i + 3].x - va[i].x, ey = va[i + 3].y - va[i].y, across = Math.abs(dx * ey - dy * ex) / (Math.hypot(ex, ey) * Math.hypot(dx, dy));
    if (across > bestAcross) { bestAcross = across; k = i; }
  }
  const S0 = va[k], S1 = va[k + 3], T0 = vb[k], T1 = vb[k + 3];
  const e1 = { x: S1.x - S0.x, y: S1.y - S0.y }, e2 = { x: T0.x - S0.x, y: T0.y - S0.y }, det = e1.x * e2.y - e1.y * e2.x;
  const toSquare = P => { const px = P.x - S0.x, py = P.y - S0.y; return { al: (px * e2.y - py * e2.x) / det, be: (e1.x * py - e1.y * px) / det }; };
  const segs = [];
  for (const [P, Q] of occ) { const c = clipToSquare(toSquare(P), toSquare(Q)); if (c) segs.push(c); }
  let best = null;
  const tryS = s => { const g = gapAt(segs, s); if (g && (!best || g.hi - g.lo > best.gap.hi - best.gap.lo)) best = { s, gap: g }; };
  for (const s of [0.5, 0.25, 0.75, 0.1, 0.9]) tryS(s);                           // most walls leave a wide gap: these find it at once
  if (!best) {
    const bp = breakpoints(segs);
    for (let i = 0; i + 1 < bp.length; i++) { tryS((bp[i] + bp[i + 1]) / 2); if (best) break; }
  }
  if (!best) return null;
  const t = (best.gap.lo + best.gap.hi) / 2;
  return { x1: S0.x + best.s * e1.x, y1: S0.y + best.s * e1.y, x2: T0.x + t * (T1.x - T0.x), y2: T0.y + t * (T1.y - T0.y) };
}

// ---- both rules ------------------------------------------------------------------------------------------------------------------------------------
// The sight line between two hexes as { x1, y1, x2, y2 } (board pixels, exact grid; for the full rule through the middle of the widest gap, for the vertex rule
// the shortest unblocked corner to corner line), or null. canSee(a, b) is the same as a sight line existing; answers are cached. Both work on { col, row }
// hexes of a hex state. makeSightLine(hs, { rule: 'vertex' }) is the corner to corner rule, kept only for the regression test against gloom.
export function makeSightLine(hs, { rule = 'full' } = {}) {
  const wallSegs = [];                                                            // the walls on edges as segments: the two corners the hexes share
  for (const key of hs.walls ?? []) {
    const [k1, k2] = key.split('|'), [c1, r1] = k1.split(',').map(Number), [c2, r2] = k2.split(',').map(Number);
    const shared = corners(c1, r1).filter(p => corners(c2, r2).some(q => same(p, q)));
    if (shared.length === 2) wallSegs.push(shared);
  }
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
    const va = corners(c1, r1).concat(corners(c2, r2)), x0 = Math.min(...va.map(p => p.x)) - 1, x1 = Math.max(...va.map(p => p.x)) + 1, y0 = Math.min(...va.map(p => p.y)) - 1, y1 = Math.max(...va.map(p => p.y)) + 1;
    for (const seg of wallSegs) {
      if (Math.max(seg[0].x, seg[1].x) < x0 || Math.min(seg[0].x, seg[1].x) > x1 || Math.max(seg[0].y, seg[1].y) < y0 || Math.min(seg[0].y, seg[1].y) > y1) continue;
      out.push(seg);
    }
    return out;
  };

  // neighbouring hexes (full rule): free when the edge between them is free; else through a corner of the edge when the two other edges there are free
  const wall = (k1, k2) => !!hs.walls?.has(edgeKey(k1, k2)) || blocks(...k2.split(',').map(Number));
  const adjacentOpen = (a, b) => {
    const ka = hexKey(a.col, a.row), kb = hexKey(b.col, b.row);
    if (!wall(ka, kb)) return true;
    const ca = corners(a.col, a.row), cb = corners(b.col, b.row);
    for (const corner of ca.filter(p => cb.some(q => same(p, q)))) {
      const third = neighbors(a.col, a.row).find(n => hexKey(n.col, n.row) !== kb && corners(n.col, n.row).some(q => same(q, corner)));
      if (!third) return true;                                                    // off the board there is no wall
      const k3 = hexKey(third.col, third.row);
      if (!wall(ka, k3) && !wall(kb, k3)) return true;
    }
    return false;
  };

  return (a, b) => {
    if (a.col === b.col && a.row === b.row) { const c = centre(a.col, a.row); return { x1: c.x, y1: c.y, x2: c.x, y2: c.y }; }
    const key = a.col < b.col || (a.col === b.col && a.row < b.row) ? `${a.col},${a.row}|${b.col},${b.row}` : `${b.col},${b.row}|${a.col},${a.row}`;
    if (cache.has(key)) return cache.get(key);
    let best = null;
    const occ = occluders(a.col, a.row, b.col, b.row);
    if (rule === 'full') {
      if (hexDistance(a.col, a.row, b.col, b.row) === 1) {
        if (adjacentOpen(a, b)) { const p = centre(a.col, a.row), q = centre(b.col, b.row); best = { x1: p.x, y1: p.y, x2: q.x, y2: q.y }; }
      } else best = fullLine(a, b, occ);
    } else {
      const va = corners(a.col, a.row), vb = corners(b.col, b.row);
      const ends = occ.flat(), atWall = p => ends.some(e => same(p, e));
      let bestLen = Infinity;
      for (const p of va) {
        if (atWall(p)) continue;
        for (const q of vb) {
          if (atWall(q)) continue;
          const len = Math.hypot(p.x - q.x, p.y - q.y);
          if (len < bestLen && (same(p, q) || !occ.some(([o1, o2]) => meets(p, q, o1, o2)))) { best = { x1: p.x, y1: p.y, x2: q.x, y2: q.y }; bestLen = len; }
        }
      }
    }
    cache.set(key, best);
    return best;
  };
}

export function makeCanSee(hs, opts) {
  const line = makeSightLine(hs, opts);
  return (a, b) => line(a, b) !== null;
}
