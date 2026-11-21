import assert from 'node:assert/strict';
import { GH2_TILE_MASKS } from '../../scripts/games/gh2_tile_masks.js';

export const tests = {
  'tile masks: every Gloomhaven 2e tile has a mask'() {
    const names = Object.keys(GH2_TILE_MASKS);
    assert.equal(names.length, 56);
    for (const n of names) assert.ok(GH2_TILE_MASKS[n].length >= 9, `${n}: too few hexes`);          // the anchor is not always a floor hex (03-B: it lies beside the tile)
  },
  'tile masks: variants of one tile have the same shape'() {
    const byNumber = {};
    for (const [n, m] of Object.entries(GH2_TILE_MASKS)) (byNumber[n.slice(0, 2)] ??= new Set()).add(m.length);
    const odd = Object.entries(byNumber).filter(([, s]) => s.size > 1).map(([k]) => k);
    assert.deepEqual(odd, [], 'tiles of one number differ in hex count');
  },
  'tile masks: hexes are unique and form one connected area'() {
    const dirs = () => [[0, -1], [0, 1], [1, 0], [1, -1], [-1, 0], [-1, 1]];                        // neighbours in the mask's [q, r] coordinates
    for (const [n, m] of Object.entries(GH2_TILE_MASKS)) {
      const key = ([q, r]) => `${q},${r}`, set = new Set(m.map(key));
      assert.equal(set.size, m.length, `${n}: duplicate hex`);
      const seen = new Set([key(m[0])]), todo = [m[0]];
      while (todo.length) {
        const [q, r] = todo.pop();
        for (const [dq, dr] of dirs()) { const h = [q + dq, r + dr]; if (set.has(key(h)) && !seen.has(key(h))) { seen.add(key(h)); todo.push(h); } }
      }
      assert.equal(seen.size, set.size, `${n}: hexes not connected`);
    }
  },
};
