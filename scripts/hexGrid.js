// The hex grid of the map page as plain functions (no DOM): neighbours, distance and the key of an edge between two hexes.
// A hex is { col, row } (scripts/hex.js: flat top, even columns shifted down); keys are 'col,row' (scripts/hexState.js hexKey).
import { COLS, ROWS } from './hex.js';
import { toAxial, toBoard } from './tileMask.js';

const DIRS = [[0, -1], [0, 1], [1, 0], [1, -1], [-1, 0], [-1, 1]];

// The neighbours of a hex that are on the board.
export function neighbors(col, row) {
  const a = toAxial(col, row), out = [];
  for (const [dq, dr] of DIRS) {
    const b = toBoard(a.q + dq, a.r + dr);
    if (b.col >= 1 && b.col <= COLS && b.row >= 0 && b.row <= ROWS) out.push(b);
  }
  return out;
}

// The neighbour of a hex in direction d (0 to 5, a fixed order, the opposite direction is d + 1 for the pairs 0/1, 2/5 and 3/4), or null off the board.
export function neighborAt(col, row, d) {
  const a = toAxial(col, row), b = toBoard(a.q + DIRS[d][0], a.r + DIRS[d][1]);
  return b.col >= 1 && b.col <= COLS && b.row >= 0 && b.row <= ROWS ? b : null;
}

// Hex distance on an open board (cube distance).
export function hexDistance(c1, r1, c2, r2) {
  const a = toAxial(c1, r1), b = toAxial(c2, r2), dq = a.q - b.q, dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

// The key of the edge between two neighbouring hexes (given as keys), the same both ways round. Walls on edges are kept as such keys.
export const edgeKey = (k1, k2) => {
  const [a, b] = k1.split(',').map(Number), [c, d] = k2.split(',').map(Number);
  return a < c || (a === c && b < d) ? `${k1}|${k2}` : `${k2}|${k1}`;
};
