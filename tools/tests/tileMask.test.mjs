import assert from 'node:assert/strict';
import { toAxial, toBoard, placeMask, tileFloorHexes } from '../../scripts/tileMask.js';
import { footprintHexes, hexCenter } from '../../scripts/hex.js';
import { GH2_TILE_MASKS } from '../../scripts/games/gh2_tile_masks.js';

const keys = hexes => hexes.map(h => `${h.col},${h.row}`).sort();
const ANCHORS = [[5, 10], [6, 10], [1, 3], [2, 3], [13, 20], [14, 21]];            // odd and even columns

export const tests = {
  'tile mask: board and axial coordinates convert both ways'() {
    for (let col = 1; col <= 40; col++) for (const row of [0, 1, 7, 49]) {
      const a = toAxial(col, row);
      assert.deepEqual(toBoard(a.q, a.r), { col, row });
    }
  },
  'tile mask: axial offsets match the pixel centres of the board'() {
    for (const [col, row] of ANCHORS) for (const [q, r] of [[1, 0], [0, 1], [2, -1], [-1, 1], [3, 2]]) {
      const a = toAxial(col, row), b = toBoard(a.q + q, a.r + r), c0 = hexCenter(col, row), c1 = hexCenter(b.col, b.row);
      assert.ok(Math.abs(c1.x - c0.x - 67.5 * q) <= 1, `x for ${col},${row} + ${q},${r}`);
      assert.ok(Math.abs(c1.y - c0.y - 78 * (r + q / 2)) < 0.001, `y for ${col},${row} + ${q},${r}`);
    }
  },
  'tile mask: turning agrees with the footprint of the map objects (hex.js)'() {
    for (const [col, row] of ANCHORS) for (const angle of [0, 60, 120, 180, 240, 300, 360, -60]) {
      for (const [dirs, mask] of [[['S'], [[0, 0], [0, 1]]], [['S', 'SE'], [[0, 0], [0, 1], [1, 0]]]]) {
        assert.deepEqual(keys(placeMask(mask, col, row, angle)), keys(footprintHexes(col, row, dirs, angle)), `${col},${row} at ${angle}`);
      }
    }
  },
  'tile mask: six turns of 60 degrees are a full turn, the shape is kept'() {
    const mask = GH2_TILE_MASKS['07-A'];
    for (const [col, row] of ANCHORS) {
      const base = keys(placeMask(mask, col, row, 0));
      assert.equal(new Set(base).size, mask.length);
      assert.deepEqual(keys(placeMask(mask, col, row, 360)), base);
      const turned = keys(placeMask(mask, col, row, 60));
      assert.equal(turned.length, mask.length);
      assert.notDeepEqual(turned, base);
      assert.deepEqual(keys(placeMask(mask, col, row, 180)), keys(placeMask(mask.map(([q, r]) => [-q, -r]), col, row, 0)), 'half a turn mirrors every offset through the anchor');
    }
  },
  'tile mask: tileFloorHexes by title'() {
    assert.equal(tileFloorHexes('01-A', 5, 10, 0).length, 9);
    assert.deepEqual(tileFloorHexes('no such tile', 5, 10), []);
    assert.deepEqual(keys(tileFloorHexes('01-A', 5, 10, 0)), keys(tileFloorHexes('01-A', 5, 10, 360)));
  },
};
