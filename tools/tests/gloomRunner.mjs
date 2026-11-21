// Runs one converted scenario of the gloom monster mover (fixtures/gloom-scenarios.json, see tools/convert-gloom-scenarios.py) through solveMove.
import { readFileSync } from 'node:fs';
import { solveMove } from '../../scripts/monsterMove.js';
import { hexKey } from '../../scripts/hexState.js';
import { makeSightLine } from '../../scripts/los.js';

export const fixture = JSON.parse(readFileSync(new URL('./fixtures/gloom-scenarios.json', import.meta.url), 'utf8'));
const H = fixture.height, W = fixture.width;
const col = loc => Math.floor(loc / H) + 1, row = loc => loc % H, loc = (c, r) => (c - 1) * H + r;
const CELLS = { X: { blocked: true, blocksLos: true }, O: { blocked: true }, T: { trap: true }, H: { hazardous: true }, D: { difficult: true } };

// The hex state of a scenario: the whole 16 by 7 map is floor, X are walls, O obstacles, T traps, H hazards, D difficult terrain.
export function hexStateOf(rec) {
  const floor = new Set(), cells = new Map(), figures = [];
  for (let c = 1; c <= W; c++) for (let r = 0; r < H; r++) floor.add(hexKey(c, r));
  for (const [l, ch] of Object.entries(rec.contents)) if (CELLS[ch]) cells.set(hexKey(col(+l), row(+l)), { ...CELLS[ch] });
  for (const [l, ch] of Object.entries(rec.figures)) {
    figures.push({ kind: ch === 'C' ? 'mercenary' : 'monster', side: ch === 'C' ? 'characters' : 'monsters', id: 1, col: col(+l), row: row(+l), role: ch === 'A' ? 'active' : null });
  }
  return { floor, floorKnown: true, cells, figures, tilesWithoutMask: [], ignored: {} };
}

// The answer of the solver in gloom's form: sorted list of [end hex, attacked hexes...] as locations.
export function answerOf(rec) {
  const hs = hexStateOf(rec), a = hs.figures.find(f => f.role === 'active');
  const initiatives = {};
  for (const [l, v] of Object.entries(rec.initiatives)) initiatives[hexKey(col(+l), row(+l))] = v;
  const sight = makeSightLine(hs);
  const res = solveMove(hs, {
    active: { col: a.col, row: a.row }, move: rec.move, range: rec.range, attack: rec.target > 0, targets: rec.target,
    flying: rec.flying, jumping: rec.jumping, teleport: rec.teleport, muddled: rec.muddled, initiatives, canSee: (p, q) => sight(p, q) !== null,
  });
  const tuples = new Set();
  for (const x of res.actions) {
    if (x.attack) tuples.add(JSON.stringify([loc(x.col, x.row), ...x.targets.map(t => { const [tc, tr] = t.split(',').map(Number); return loc(tc, tr); }).sort((p, q) => p - q)]));
    else tuples.add(JSON.stringify([loc(x.col, x.row)]));
  }
  return [...tuples].map(t => JSON.parse(t)).sort((p, q) => JSON.stringify(p) < JSON.stringify(q) ? -1 : 1);
}

export const same = (p, q) => JSON.stringify(p) === JSON.stringify(q);
export const expectedOf = rec => [...rec.answer].sort((p, q) => JSON.stringify(p) < JSON.stringify(q) ? -1 : 1);
