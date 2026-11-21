import assert from 'node:assert/strict';
import { makeCanSee } from '../../scripts/los.js';
import { edgeKey } from '../../scripts/hexGrid.js';
import { hexKey } from '../../scripts/hexState.js';
import { hexDistance, solveMove } from '../../scripts/monsterMove.js';

// A field of floor (cols 1..12, rows 0..9) with cells; `floorKnown` false leaves the void alone.
function field(cells = {}, only = null, floorKnown = true) {
  const floor = new Set();
  for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) if (!only || only(c, r)) floor.add(hexKey(c, r));
  return { floor, floorKnown, cells: new Map(Object.entries(cells)), figures: [], tilesWithoutMask: [], ignored: {} };
}
const wall = { blocked: true, blocksLos: true };
const at = (c, r) => ({ col: c, row: r });

export const tests = {
  'line of sight: open floor, every pair sees each other'() {
    const see = makeCanSee(field());
    for (const [a, b] of [[at(3, 3), at(9, 7)], [at(1, 0), at(12, 9)], [at(5, 5), at(5, 5)], [at(4, 4), at(4, 5)]]) assert.equal(see(a, b), true);
  },
  'line of sight: a wall hex in a straight line between two hexes blocks'() {
    const see = makeCanSee(field({ [hexKey(5, 4)]: wall }));
    assert.equal(see(at(5, 2), at(5, 6)), false);
    assert.equal(see(at(5, 6), at(5, 2)), false, 'symmetric');
  },
  'line of sight: a wall beside the line does not block, there is a free corner pair'() {
    const see = makeCanSee(field({ [hexKey(7, 4)]: wall }));
    assert.equal(see(at(5, 2), at(5, 6)), true);
  },
  'line of sight: an obstacle and a figure do not block, a closed door does'() {
    const obstacle = makeCanSee(field({ [hexKey(5, 4)]: { blocked: true } }));
    assert.equal(obstacle(at(5, 2), at(5, 6)), true);
    const door = makeCanSee(field({ [hexKey(5, 4)]: { blocked: true, blocksLos: true, door: 'closed' } }));
    assert.equal(door(at(5, 2), at(5, 6)), false);
    const open = makeCanSee(field({ [hexKey(5, 4)]: { door: 'open' } }));
    assert.equal(open(at(5, 2), at(5, 6)), true);
  },
  'line of sight: adjacent hexes always see each other, walls around them or not'() {
    const around = field({ [hexKey(6, 5)]: wall, [hexKey(6, 4)]: wall, [hexKey(5, 6)]: wall, [hexKey(4, 5)]: wall });
    assert.equal(makeCanSee(around)(at(5, 5), at(5, 4)), true);
  },
  'line of sight: the void blocks when the floor is known, not when it is unknown'() {
    const only = (c) => c <= 4 || c >= 8;                                         // columns 5 to 7 are void
    assert.equal(makeCanSee(field({}, only, true))(at(3, 4), at(10, 4)), false);
    assert.equal(makeCanSee(field({}, only, false))(at(3, 4), at(10, 4)), true);
  },
  'line of sight: a wall with a gap lets the line through the gap only'() {
    const cells = {}; for (let r = 0; r <= 9; r++) if (r !== 4) cells[hexKey(6, r)] = wall;
    const see = makeCanSee(field(cells));
    assert.equal(see(at(2, 4), at(10, 4)), true, 'through the gap');
    assert.equal(see(at(2, 0), at(10, 0)), false, 'against the wall');
  },
  'line of sight: symmetric on random walls'() {
    let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const cells = {};
    for (let c = 1; c <= 12; c++) for (let r = 0; r <= 9; r++) if (rnd() < 0.25) cells[hexKey(c, r)] = wall;
    const see = makeCanSee(field(cells));
    for (let i = 0; i < 300; i++) {
      const a = at(1 + Math.floor(rnd() * 12), Math.floor(rnd() * 10)), b = at(1 + Math.floor(rnd() * 12), Math.floor(rnd() * 10));
      assert.equal(see(a, b), see(b, a), `${a.col},${a.row} ${b.col},${b.row}`);
      if (hexDistance(a.col, a.row, b.col, b.row) === 1) assert.equal(see(a, b), true, 'adjacent');
    }
  },
  'line of sight: the solver uses it, no sight means no focus'() {
    const hs = field(); hs.figures = [{ kind: 'monster', side: 'monsters', id: 1, col: 3, row: 5, role: null }, { kind: 'mercenary', side: 'characters', id: 1, col: 8, row: 5, role: null }];
    const r = solveMove(hs, { active: at(3, 5), move: 6, range: 0, canSee: () => false });
    assert.deepEqual([r.focuses.length, r.actions.map(a => [a.col, a.row, a.attack])], [0, [[3, 5, false]]]);
  },
};

// ---- the full hex rule: any point of one hex to any point of the other ----
import { toAxial } from '../../scripts/tileMask.js';

const R = 45, H2 = 39;
const centre = (c, r) => { const a = toAxial(c, r); return { x: 67.5 * a.q, y: 78 * (a.r + a.q / 2) }; };
const hexCorners = (c, r) => { const o = centre(c, r); return [[R, 0], [R / 2, H2], [-R / 2, H2], [-R, 0], [-R / 2, -H2], [R / 2, -H2]].map(([dx, dy]) => ({ x: o.x + dx, y: o.y + dy })); };
const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
const hits = (p, q, a, b) => cr(p, q, a) * cr(p, q, b) <= 1e-9 && cr(a, b, p) * cr(a, b, q) <= 1e-9;     // closed segments: touching blocks
const inside = (c, r, x, y) => { const o = centre(c, r), dx = Math.abs(x - o.x), dy = Math.abs(y - o.y); return dy <= H2 * 0.999 && dx * H2 + dy * (R / 2) <= R * H2 * 0.999; };
const samples = (c, r, n) => { const o = centre(c, r), out = []; for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) { const x = o.x + (i / n) * R * 0.99, y = o.y + (j / n) * H2 * 0.99; if (inside(c, r, x, y)) out.push({ x, y }); } return out; };
const scene = (seed, density) => {
  let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const cells = {}, walls = [];
  for (let c = 1; c <= 9; c++) for (let r = 0; r <= 7; r++) if (rnd() < density) { cells[hexKey(c, r)] = wall; walls.push([c, r]); }
  return { cells, walls, rnd };
};

tests['line of sight, full rule: sees everything the corner rule sees, and more, and agrees with a brute force over points of both hexes'] = function () {
  let pairs = 0, fullOnly = 0, vertexOnly = 0, brute = 0;
  for (let sc = 0; sc < 14; sc++) {
    const { cells, walls, rnd } = scene(100 + sc, 0.15 + (sc % 5) * 0.06), hs = field(cells, null, false);
    const full = makeCanSee(hs), vertex = makeCanSee(hs, { rule: 'vertex' });
    for (let k = 0; k < 14; k++) {
      const a = { col: 1 + Math.floor(rnd() * 9), row: Math.floor(rnd() * 8) }, b = { col: 1 + Math.floor(rnd() * 9), row: Math.floor(rnd() * 8) };
      if (cells[hexKey(a.col, a.row)] || cells[hexKey(b.col, b.row)] || hexDistance(a.col, a.row, b.col, b.row) < 2) continue;
      pairs++;
      const f = full(a, b), v = vertex(a, b);
      if (v && !f) vertexOnly++;
      if (f && !v) fullOnly++;
      const occ = [];
      for (const [c, r] of walls) { if ((c === a.col && r === a.row) || (c === b.col && r === b.row)) continue; const vv = hexCorners(c, r); for (let i = 0; i < 3; i++) occ.push([vv[i], vv[i + 3]]); }
      const sa = samples(a.col, a.row, 7), sb = samples(b.col, b.row, 7);
      let seen = false;
      outer: for (const p of sa) for (const q of sb) if (!occ.some(([x, y]) => hits(p, q, x, y))) { seen = true; break outer; }
      if (seen) brute++;
      assert.equal(f, seen, `${a.col},${a.row} to ${b.col},${b.row} with walls ${JSON.stringify(walls)}`);
    }
  }
  assert.equal(vertexOnly, 0, 'what the corner rule sees, the full rule sees');
  assert.ok(fullOnly > 5, `${fullOnly} pairs only the full rule sees`);
  assert.ok(pairs > 100 && brute > 30 && brute < pairs, `${pairs} pairs, ${brute} seen`);
};
tests['line of sight, full rule: a gap lets sight through at an angle'] = function () {
  const cells = {};
  for (let r = 0; r <= 9; r++) if (r !== 4) cells[hexKey(6, r)] = wall;               // a wall with a gap of one hex
  const see = makeCanSee(field(cells, null, false));
  assert.equal(see(at(2, 4), at(10, 4)), true, 'straight through the gap');
  assert.equal(see(at(2, 2), at(10, 6)), true, 'at an angle, through the same gap');
  assert.equal(see(at(2, 0), at(10, 0)), false, 'against the wall');
};
tests['line of sight, full rule: neighbours see each other unless the edge and the corners next to it are walled'] = function () {
  const open = makeCanSee(field({}, null, false));
  assert.equal(open(at(5, 5), at(5, 6)), true);
  const edge = field({}, null, false); edge.walls = new Set([edgeKey(hexKey(5, 5), hexKey(5, 6))]);
  assert.equal(makeCanSee(edge)(at(5, 5), at(5, 6)), true, 'a wall on the shared edge only: through a corner');
  const around = field({ [hexKey(4, 5)]: wall, [hexKey(6, 5)]: wall, [hexKey(4, 6)]: wall, [hexKey(6, 6)]: wall }, null, false); around.walls = new Set([edgeKey(hexKey(5, 5), hexKey(5, 6))]);
  assert.equal(makeCanSee(around)(at(5, 5), at(5, 6)), false, 'the edge and both corners walled');
};
