import assert from 'node:assert/strict';
import { handGrid, handList, HAND_COLS, zoneOf } from '../../scripts/campaign/record.js';
import { placeInHand, moveCard, applyHand, changeCharacterClass, setSpecialTrait, availableClasses } from '../../scripts/campaign/edit.js';
import { CARDS } from '../../scripts/games/gh2_cards.js';
import { CLASSES } from '../../scripts/games/gh2_classes.js';
import { withChars } from './helpers.mjs';

// A character whose deck holds n level 1 cards, all in the hand.
function withHand(n) {
  let r = withChars(1); const c0 = r.chars[0], klass = CLASSES.find(k => k.name === c0.cls);
  const ids = CARDS.filter(k => k.cls === klass.i).slice(0, n).map(k => k.id);
  r = { ...r, chars: r.chars.map(c => ({ ...c, deck: ids, bench: [], disc: [], act: [], lost: [], play: [null, null], hord: null, hgrid: null })) };
  return { r, cid: r.chars[0].id, ids };
}

export const tests = {
  'grid has 6 columns and at least 2 rows'() {
    const { r } = withHand(3), g = handGrid(r.chars[0], 0);
    assert.equal(g.cols, HAND_COLS);
    assert.equal(g.cells.length, HAND_COLS * 2);
  },
  'grid adds a row only when every cell is taken'() {
    const a = withHand(11), b = withHand(12);
    assert.equal(handGrid(a.r.chars[0], 0).cells.length, 12);
    assert.equal(handGrid(b.r.chars[0], 0).cells.length, 18);
  },
  'grid lists every hand card once'() {
    const { r } = withHand(8), cells = handGrid(r.chars[0], 0).cells.filter(Boolean);
    assert.deepEqual([...cells].sort(), [...handList(r.chars[0])].sort());
  },
  'placeInHand moves a card to a free cell'() {
    const { r, cid, ids } = withHand(4), n = placeInHand(r, cid, ids[0], 10);
    assert.equal(handGrid(n.chars[0], 0).cells[10], ids[0]);
  },
  'placeInHand swaps with a taken cell'() {
    const { r, cid } = withHand(4), g = handGrid(r.chars[0], 0).cells, n = placeInHand(r, cid, g[0], 1);
    const h = handGrid(n.chars[0], 0).cells;
    assert.equal(h[1], g[0]); assert.equal(h[0], g[1]);
  },
  'placeInHand ignores bad cells and unknown cards'() {
    const { r, cid, ids } = withHand(3);
    assert.equal(placeInHand(r, cid, ids[0], -1), r);
    assert.equal(placeInHand(r, cid, ids[0], 1.5), r);
    assert.equal(placeInHand(r, cid, 'nope', 0), r);
  },
  'a card from another zone takes a free cell only'() {
    const { r, cid, ids } = withHand(3);
    const d = moveCard(r, cid, ids[0], 'discard');
    assert.equal(zoneOf(d.chars[0], ids[0]), 'discard');
    const taken = handGrid(d.chars[0], 0).cells.findIndex(x => x);
    const same = placeInHand(d, cid, ids[0], taken);
    assert.equal(zoneOf(same.chars[0], ids[0]), 'hand');
    assert.ok(!handGrid(same.chars[0], 0).cells.slice(taken, taken + 1).includes(ids[0]));
  },
  'class change clears event traits and the grid'() {
    let { r, cid } = withHand(3);
    r = setSpecialTrait(r, cid, 'hero', true);
    assert.deepEqual(r.chars[0].special, ['hero']);
    const other = availableClasses(r).find(c => c.name !== r.chars[0].cls);
    const n = changeCharacterClass(r, cid, other.name);
    assert.deepEqual(n.chars[0].special, []);
    assert.equal(n.chars[0].hgrid, null);
    assert.equal(n.chars[0].cls, other.name);
  },
  'class change to the same class does nothing'() {
    const { r, cid } = withHand(2);
    assert.equal(changeCharacterClass(r, cid, r.chars[0].cls), r);
  },
};
