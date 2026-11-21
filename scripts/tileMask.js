// Floor hexes of a placed map tile. Pure logic, no DOM.
// A mask (scripts/games/gh2_tile_masks.js) lists [q, r] offsets from the tile anchor hex at angle 0. [q, r] are axial coordinates of the flat-top grid
// of scripts/hex.js: q = columns to the right, r = rows down, and the hex centre is 67.5 * q, 78 * (r + q / 2) pixels from the anchor centre.
// A tile placed at angle a is rotated clockwise about its anchor hex (as the SVG rotate() of scripts/render.js renderTiles), in steps of 60 degrees.
import { GH2_TILE_MASKS } from './games/gh2_tile_masks.js';

// Board hex (col 1-based, row 0-based, even columns shifted down) <-> axial coordinates.
export const toAxial = (col, row) => ({ q: col, r: row - Math.ceil(col / 2) });
export const toBoard = (q, r) => ({ col: q, row: r + Math.ceil(q / 2) });

// One 60 degree clockwise step in cube coordinates (x = q, z = r, y = -q - r): (x, y, z) -> (-z, -x, -y).
function rotateAxial(q, r, steps) {
  let x = q, z = r, y = -q - r;
  for (let i = 0; i < steps; i++) [x, y, z] = [-z, -x, -y];
  return { q: x, r: z };
}

// The board hexes a mask covers when its anchor is on (col, row) and it is turned by angle degrees (rounded to a multiple of 60).
export function placeMask(mask, col, row, angle = 0) {
  const steps = (((Math.round(angle / 60) % 6) + 6) % 6), a = toAxial(col, row);
  return (mask ?? []).map(([q, r]) => { const p = rotateAxial(q, r, steps); return toBoard(a.q + p.q, a.r + p.r); });
}

// The floor hexes of a Gloomhaven 2e tile by title ('01-A'); empty when the tile has no mask.
export const tileFloorHexes = (title, col, row, angle = 0) => placeMask(GH2_TILE_MASKS[title], col, row, angle);
