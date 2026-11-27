import assert from 'node:assert/strict';
import { snapToSlot, stepToSlot, slotOf, forwardSlot, trackOf, trackAtPoint, lastTokenOnTrack, slotCardId, SNAP_REACH } from '../../scripts/campaign/tokenSnap.js';
import { TOKEN_SLOTS } from '../../scripts/games/card_token_slots.js';

const ASPECT = 1050 / 750;
const id = Object.keys(TOKEN_SLOTS).find(k => TOKEN_SLOTS[k].length >= 3);
const key = `c:${id}`, slots = TOKEN_SLOTS[id], pct = s => ({ x: s.x * 100, y: s.y * 100 });

export const tests = {
  'token snap: card id from the marker key'() {
    assert.equal(slotCardId('c:1234'), 1234);
    assert.equal(slotCardId('i:12'), null);
    assert.equal(slotCardId('c:'), null);
  },
  'token snap: a drop near a circle lands on its centre'() {
    const s = slots[1], p = pct(s), r = snapToSlot(key, p.x + 1.5, p.y - 1, ASPECT);
    assert.deepEqual([r.x, r.y, r.slot], [p.x, p.y, 1]);
  },
  'token snap: out of reach stays free'() {
    assert.equal(snapToSlot(key, 1, 1, ASPECT), null);
    const s = slots[0], p = pct(s);
    assert.equal(snapToSlot(key, p.x, p.y + (SNAP_REACH * s.r + 0.05) * 100 / ASPECT, ASPECT), null);
  },
  'token snap: a taken circle is skipped, the next free one in reach wins'() {
    const p0 = pct(slots[0]), p1 = pct(slots[1]);
    const r = snapToSlot(key, p1.x - 4, p0.y, ASPECT, [{ x: p0.x, y: p0.y }]);
    assert.equal(r.slot, 1);
    assert.equal(snapToSlot(key, p0.x, p0.y, ASPECT, [{ x: p0.x, y: p0.y }]), null);
  },
  'token snap: stickers do not take a circle; cards and items without circles do not snap'() {
    const p = pct(slots[0]);
    assert.equal(snapToSlot(key, p.x, p.y, ASPECT, [{ x: p.x, y: p.y, s: 1 }]).slot, 0);
    assert.equal(snapToSlot('i:5', p.x, p.y, ASPECT), null);
    assert.equal(snapToSlot('c:1', p.x, p.y, ASPECT), null);
  },
  'token snap: every generated circle is inside the card and has a half'() {
    for (const [cid, list] of Object.entries(TOKEN_SLOTS)) for (const s of list) {
      assert.ok(s.x > 0 && s.x < 1 && s.y > 0 && s.y < 1 && s.r > 0.05 && s.r < 0.1, `card ${cid}`);
      assert.ok(s.h === 't' || s.h === 'b', `card ${cid}`);
    }
  },
  'token snap: arrows hop to the next free circle in that direction'() {
    const p0 = pct(slots[0]), p1 = pct(slots[1]), p2 = pct(slots[2]);
    assert.equal(stepToSlot(key, p0.x, p0.y, ASPECT, [], 1, 0).slot, 1);
    assert.equal(stepToSlot(key, p1.x, p1.y, ASPECT, [], -1, 0).slot, 0);
    assert.equal(stepToSlot(key, p0.x, p0.y, ASPECT, [{ x: p1.x, y: p1.y }], 1, 0).slot, 2);
    assert.equal(stepToSlot(key, p2.x, p2.y, ASPECT, [], 1, 0), null);
    assert.equal(stepToSlot(key, p0.x, p0.y, ASPECT, [], 0, -1), null);
    assert.equal(stepToSlot('i:5', p0.x, p0.y, ASPECT, [], 1, 0), null);
  },
  'token snap: two-track cards keep hops inside a track and find the hovered track'() {
    const two = TOKEN_SLOTS[2010], A = ASPECT;                                // Spellweaver, Ice Armor: a track in each half
    const top = two.filter(s => s.t === 0), bot = two.filter(s => s.t === 1);
    assert.ok(top.length === 3 && bot.length === 3 && top.every(s => s.h === 't') && bot.every(s => s.h === 'b'));
    const k = 'c:2010', t0 = pct(top[2]), b0 = pct(bot[0]);
    assert.equal(trackOf(k, t0.x, t0.y, A), 0);
    assert.equal(trackOf(k, b0.x, b0.y, A), 1);
    assert.equal(stepToSlot(k, t0.x, t0.y, A, [], 0, 1), null);              // Down from the top track does not enter the bottom track
    assert.equal(stepToSlot(k, b0.x, b0.y, A, [], 0, -1), null);
    assert.equal(stepToSlot(k, pct(top[0]).x, pct(top[0]).y, A, [], 1, 0).slot, 1);
    assert.equal(trackAtPoint(k, 50, 20, A), 0);
    assert.equal(trackAtPoint(k, 50, 80, A), 1);
    const mk = [{ x: b0.x, y: b0.y }, { x: t0.x, y: t0.y }, { x: t0.x, y: t0.y, s: 1 }];
    assert.equal(lastTokenOnTrack(k, mk, A, 0), 1);                         // a sticker does not count
    assert.equal(lastTokenOnTrack(k, mk, A, 1), 0);
    assert.equal(lastTokenOnTrack(k, [], A, 0), -1);
  },
  'token snap: two single-circle tracks side by side (Terror Blade) are not connected'() {
    const k = 'c:1116', sl = TOKEN_SLOTS[1116], p0 = pct(sl[0]), p1 = pct(sl[1]);
    assert.deepEqual(sl.map(s => s.t), [0, 1]);
    assert.equal(stepToSlot(k, p0.x, p0.y, ASPECT, [], 1, 0), null);
    assert.equal(stepToSlot(k, p1.x, p1.y, ASPECT, [], -1, 0), null);
    assert.equal(trackAtPoint(k, p1.x, p1.y, ASPECT), 1);                    // the pointer picks the nearer track within the half
  },
  'token snap: forward goes to the next free circle of the track and stops at its end'() {
    const k = 'c:2010', two = TOKEN_SLOTS[2010], top = two.filter(s => s.t === 0), bot = two.filter(s => s.t === 1), A = ASPECT;
    const p = s => pct(s);
    assert.deepEqual([slotOf(k, p(top[1]).x, p(top[1]).y, A).t, slotOf(k, p(bot[0]).x, p(bot[0]).y, A).h], [0, 'b']);
    const f0 = forwardSlot(k, p(top[0]).x, p(top[0]).y, A);
    assert.deepEqual([f0.x, f0.y], [p(top[1]).x, p(top[1]).y]);
    const f1 = forwardSlot(k, p(top[0]).x, p(top[0]).y, A, [{ x: p(top[1]).x, y: p(top[1]).y }]);
    assert.deepEqual([f1.x, f1.y], [p(top[2]).x, p(top[2]).y]);                // a taken circle is skipped
    assert.equal(forwardSlot(k, p(top[2]).x, p(top[2]).y, A), null);            // end of the track: the bottom track is not entered
    assert.equal(forwardSlot('c:1116', TOKEN_SLOTS[1116][0].x * 100, TOKEN_SLOTS[1116][0].y * 100, A), null);   // one-circle tracks have no next circle
    assert.equal(forwardSlot('i:5', 50, 50, A), null);
  },
};
