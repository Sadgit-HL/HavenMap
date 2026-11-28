// The enhancement dots of an ability card as the marker editor uses them: which empty dot lies under a click, and which stickers it takes at what price.
// Positions: scripts/games/card_enhancement_slots.js; what a dot enhances: scripts/games/card_enhancement_dots.js; rules and prices: enhancementRules.js.
// A sticker (marker with s) sitting within DOT_TAKEN card widths of a dot occupies it.
import { ENHANCE_SLOTS } from '../games/card_enhancement_slots.js';
import { ENHANCE_DOTS } from '../games/card_enhancement_dots.js';
import { allowedStickers, enhancementCost } from './enhancementRules.js';
import { slotCardId } from './tokenSnap.js';

export const DOT_HIT = 0.035;         // a click opens the dot's popover within this many card widths of its centre
export const DOT_TAKEN = 0.015;       // a dot is occupied when a sticker sits this close to its centre

const dist = (m, s, aspect) => Math.hypot(m.x / 100 - s.x, (m.y / 100 - s.y) * aspect);

// Indexes of the dots of a card that carry a sticker. markers: the markers on the card ({ x, y, s? } in percent); skip: the index of a marker to ignore.
export function occupiedDots(cardId, markers, aspect, skip = -1) {
  const out = new Set();
  (ENHANCE_SLOTS[cardId] || []).forEach((s, i) => { if (markers.some((m, j) => m.s && j !== skip && dist(m, s, aspect) < DOT_TAKEN)) out.add(i); });
  return out;
}

// The empty dot under a point (percent of the card picture), nearest first, or null. A stray marker ('none' in the dot data) is not a dot.
export function dotAt(key, x, y, aspect, markers = []) {
  const id = slotCardId(key), slots = ENHANCE_SLOTS[id];
  if (!slots?.length) return null;
  const occ = occupiedDots(id, markers, aspect);
  let best = null;
  slots.forEach((s, i) => {
    if (occ.has(i) || ENHANCE_DOTS[id]?.[i]?.x) return;
    const d = Math.hypot(x / 100 - s.x, (y / 100 - s.y) * aspect);
    if (d <= DOT_HIT && (!best || d < best.d)) best = { i, d };
  });
  return best ? best.i : null;
}

// What a dot takes: { slot, shape, dot, existing, x, y (percent), options: [{ k, cost, steps }] }. existing = stickers already on the other dots of the same action, which is a half of the card
// (top or bottom), whatever ability the dot belongs to.
// opts: level (card level, X counts as 1), jotl (a Jaws of the Lion card), stickers (all sticker keys in display order).
export function dotChoices(key, slot, markers, aspect, { level = 1, jotl = false, stickers = [] } = {}) {
  const id = slotCardId(key), s = ENHANCE_SLOTS[id]?.[slot];
  if (!s) return null;
  const dot = ENHANCE_DOTS[id]?.[slot] || { w: null };
  if (dot.x) return null;
  const occ = occupiedDots(id, markers, aspect), dots = ENHANCE_DOTS[id] || [];
  const slots = ENHANCE_SLOTS[id], existing = [...occ].filter(i => i !== slot && !dots[i]?.x && slots[i].h === s.h).length;
  const options = allowedStickers(s.k, stickers, { dot, jotl }).map(k => { const r = enhancementCost(k, dot, { level, existing }); return { k, cost: r.cost, steps: r.steps }; });
  return { slot, shape: s.k, dot, existing, x: s.x * 100, y: s.y * 100, options };
}

// A short name of what a dot enhances, for the popover.
export const dotName = dot => (!dot || dot.w === null ? 'no card code match' : dot.w === 'area_hex' ? 'area hex' : dot.w === 'custom' ? 'other' : String(dot.w).replace(/_/g, ' '));
