// Snapping of character tokens to the token circles printed on an ability card (circle positions: scripts/games/card_token_slots.js).
// Markers are stored as x, y in percent of the card picture (0 to 100), see addMarker in edit.js.
import { TOKEN_SLOTS } from '../games/card_token_slots.js';

export const SNAP_REACH = 1.2;   // a drop snaps when it lands within this many circle radii of a circle centre (0.6 of the diameter)
const TAKEN = 0.5;               // a circle is taken when a token already sits within this many radii of its centre

// The card id of a marker key 'c:<id>', else null (items and other keys have no circles).
export const slotCardId = key => (/^c:\d+$/.test(String(key)) ? Number(String(key).slice(2)) : null);

// Snaps a point to the nearest free token circle of a card.
//   key      marker key of the card ('c:<id>')
//   x, y     the point, percent of the card picture
//   aspect   card picture height divided by width (distances are measured in card widths)
//   others   the markers already on the card ({ x, y, s? }), without the one being moved; stickers (s) do not take a circle
// Returns { x, y, slot } (percent, index in reading order) or null when no free circle is in reach.
export function snapToSlot(key, x, y, aspect, others = []) {
  const slots = TOKEN_SLOTS[slotCardId(key)];
  if (!slots) return null;
  const d = (px, py, s) => Math.hypot(px / 100 - s.x, (py / 100 - s.y) * aspect);   // card widths, like r
  let best = null;
  slots.forEach((s, slot) => {
    if (others.some(m => !m.s && d(m.x, m.y, s) < TAKEN * s.r)) return;
    const dist = d(x, y, s);
    if (dist <= SNAP_REACH * s.r && (!best || dist < best.dist)) best = { slot, dist, x: s.x * 100, y: s.y * 100 };
  });
  return best && { x: best.x, y: best.y, slot: best.slot };
}

// The arrow buttons on a card with circles: the nearest free circle of the token's own track in the direction (dx, dy) from the point (a unit step of the arrows, y down), or null when none lies that way.
// A circle counts when it is ahead of the point; sideways offset weighs double, so a row is followed along its line. The circle the point sits on is skipped.
export function stepToSlot(key, x, y, aspect, others, dx, dy) {
  const slots = TOKEN_SLOTS[slotCardId(key)];
  if (!slots) return null;
  const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, track = trackOf(key, x, y, aspect);
  if (dy === 0 && dx !== 0) {                                               // left and right follow the reading order of the track: along the row, then on to the next row (right) or back to the previous row (left)
    const free = [];
    slots.forEach((s, slot) => {
      if ((s.t || 0) !== track) return;
      const vx = s.x - x / 100, vy = (s.y - y / 100) * aspect;
      if (Math.hypot(vx, vy) < 0.5 * s.r || others.some(m => !m.s && Math.hypot(m.x / 100 - s.x, (m.y / 100 - s.y) * aspect) < 0.5 * s.r)) return;
      free.push({ s, slot, vx, vy, row: Math.abs(vy) < 0.5 * s.r });
    });
    const sgn = Math.sign(dx), along = free.filter(c => c.row && c.vx * sgn > 0).sort((a, b) => Math.abs(a.vx) - Math.abs(b.vx))[0];
    let pick = along;
    if (!pick) {                                                           // the row is used up: the nearest row below (right) or above (left), its first (right) or last (left) free circle
      const rows = free.filter(c => !c.row && c.vy * sgn > 0), near = Math.min(...rows.map(c => Math.abs(c.vy)));
      pick = rows.filter(c => Math.abs(c.vy) < near + 0.5 * c.s.r).sort((a, b) => (a.vx - b.vx) * sgn)[0];
    }
    return pick ? { x: pick.s.x * 100, y: pick.s.y * 100, slot: pick.slot } : null;
  }
  let best = null;
  slots.forEach((s, slot) => {
    if ((s.t || 0) !== track) return;                                       // a token stays on its own track
    const vx = s.x - x / 100, vy = (s.y - y / 100) * aspect, ahead = vx * ux + vy * uy, side = Math.abs(-vx * uy + vy * ux);
    if (Math.hypot(vx, vy) < 0.5 * s.r || ahead <= 0 || others.some(m => !m.s && Math.hypot(m.x / 100 - s.x, (m.y / 100 - s.y) * aspect) < 0.5 * s.r)) return;
    const score = ahead + 2 * side;
    if (!best || score < best.score) best = { score, slot, x: s.x * 100, y: s.y * 100 };
  });
  return best && { x: best.x, y: best.y, slot: best.slot };
}

// The track (number of the tokens action on the card) of the circle nearest to a point, or null when the card has no circles.
export function trackOf(key, x, y, aspect) {
  const slots = TOKEN_SLOTS[slotCardId(key)];
  if (!slots) return null;
  let best = null;
  for (const s of slots) {
    const dist = Math.hypot(x / 100 - s.x, (y / 100 - s.y) * aspect);
    if (!best || dist < best.dist) best = { dist, t: s.t || 0 };
  }
  return best.t;
}

// The track under the pointer on a card: among the tracks of the hovered half ('t' top, 'b' bottom, the initiative band is at half the height)
// the one whose nearest circle is closest to the point; null when that half has no track.
export function trackAtPoint(key, x, y, aspect) {
  const slots = TOKEN_SLOTS[slotCardId(key)];
  if (!slots) return null;
  const half = y < 50 ? 't' : 'b';
  let best = null;
  for (const s of slots) {
    if (s.h !== half) continue;
    const dist = Math.hypot(x / 100 - s.x, (y / 100 - s.y) * aspect);
    if (!best || dist < best.dist) best = { dist, t: s.t || 0 };
  }
  return best && best.t;
}

// Index in `markers` of the last token (no sticker) that sits on a track, or -1.
export const lastTokenOnTrack = (key, markers, aspect, track) => markers.reduce((r, m, i) => (!m.s && trackOf(key, m.x, m.y, aspect) === track ? i : r), -1);

// The circle a token sits on: the one nearest to the point. { slot, t (track), h (half) } or null when the card has no circles.
export function slotOf(key, x, y, aspect) {
  const slots = TOKEN_SLOTS[slotCardId(key)];
  if (!slots) return null;
  let best = null;
  slots.forEach((s, slot) => {
    const dist = Math.hypot(x / 100 - s.x, (y / 100 - s.y) * aspect);
    if (!best || dist < best.dist) best = { dist, slot, t: s.t || 0, h: s.h };
  });
  return { slot: best.slot, t: best.t, h: best.h };
}

// One circle forward on the token's track: the next free circle after the one it sits on, in reading order; null at the end of the track.
export function forwardSlot(key, x, y, aspect, others = []) {
  const slots = TOKEN_SLOTS[slotCardId(key)], at = slotOf(key, x, y, aspect);
  if (!slots || !at) return null;
  for (let i = at.slot + 1; i < slots.length; i++) {
    const s = slots[i];
    if ((s.t || 0) !== at.t) continue;
    if (others.some(m => !m.s && Math.hypot(m.x / 100 - s.x, (m.y / 100 - s.y) * aspect) < TAKEN * s.r)) continue;
    return { x: s.x * 100, y: s.y * 100, slot: i };
  }
  return null;
}
