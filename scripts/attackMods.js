// Attack modifier decks (monsters, allies): draw/discard state, composition changes, reshuffle rules, GeekRoller code.
//
// Cards of one type are interchangeable, so state is kept as counts per type:
//   state.am = { deck: {p0: 4, ...}, discard: {p0: 2, ...}, base?: {key: n}, lvl?: 0|1|2 }
// deck/discard = current draw state. base = the full composition the deck returns to on a reshuffle
// (permanent changes: perks, imbuement, manual edits). lvl = imbuement level applied to base.
// A null entry means the standard 20-card deck with nothing discarded.
// Bless and curse cards live only in the deck: when drawn they leave the game instead of being discarded.

import { state, patch } from './state.js';

// Order = order of faces in the GeekRoller code. Standard cards first, then cards added by imbuement.
export const AM_TYPES = [
  { key: 'p0',   face: '+0',   count: 6, img: 'gh-am-m-01',  shuffle: false },
  { key: 'p1',   face: '+1',   count: 5, img: 'gh-am-m-07',  shuffle: false },
  { key: 'm1',   face: '-1',   count: 5, img: 'gh-am-m-12',  shuffle: false },
  { key: 'p2',   face: '+2',   count: 1, img: 'gh-am-m-18',  shuffle: false },
  { key: 'm2',   face: '-2',   count: 1, img: 'gh-am-m-17',  shuffle: false },
  { key: 'x2',   face: 'x2',   count: 1, img: 'gh-am-m-20',  shuffle: true  },
  { key: 'miss', face: 'Miss', count: 1, img: 'gh-am-m-19',  shuffle: true  },
  // not in the standard deck (count 0); shown when present or in edit mode
  { key: 'i2m',  face: '+2 Muddle', count: 0, img: 'gh-am-i-plus2muddle', shuffle: false, extra: true },
  { key: 'i0p',  face: '+0 Poison', count: 0, img: 'gh-am-i-plus0poison', shuffle: false, extra: true },
  { key: 'i3',   face: '+3',        count: 0, img: 'gh-am-i-plus3',       shuffle: false, extra: true },
  { key: 'i1h',  face: '+1 Heal1',  count: 0, img: 'gh-am-i-plus1heal1',  shuffle: false, extra: true },
  { key: 'i1c',  face: '+1 Curse',  count: 0, img: 'gh-am-i-plus1curse',  shuffle: false, extra: true },
  { key: 'i0w',  face: '+0 Wound',  count: 0, img: 'gh-am-i-plus0wound',  shuffle: false, extra: true },
];

// Added and removed by hand, temporary. Face text is what goes into the roller code.
export const AM_SPECIAL = [
  { key: 'bless', face: 'Bless', img: 'gh-am-pm-15', label: 'Bless', max: 10 },
  { key: 'curse', face: 'Curse', img: 'gh-am-mm-01', label: 'Curse', max: 10 },
];

// Monster imbuement (level 2 includes level 1): changes to the base composition.
const IMBUE = {
  1: { m1: -3, p1: 3, i2m: 1, i0p: 1 },
  2: { m2: -1, p0: -2, i3: 1, i1h: 2, i1c: 1, i0w: 1 },
};
export const AM_MAX_PER_TYPE = 20;

// Two independent decks: 'm' = monsters (state.am), 'a' = allies (state.amA).
export const AM_GROUPS = [
  { key: 'm', label: 'Monsters' },
  { key: 'a', label: 'Allies' },
];
const field = g => (g === 'a' ? 'amA' : 'am');

const ALL = [...AM_TYPES, ...AM_SPECIAL];
const isSpecial = key => AM_SPECIAL.some(s => s.key === key);
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

function defaultBase() {
  const b = {};
  for (const t of AM_TYPES) b[t.key] = t.count;
  return b;
}

function deckFrom(base) {
  const d = { ...base };
  for (const s of AM_SPECIAL) d[s.key] = 0;
  return d;
}

export function amState(g = 'm') {
  const s = state[field(g)];
  const base = { ...defaultBase(), ...(s?.base || {}) };
  return {
    deck:    { ...deckFrom(base), ...(s?.deck || {}) },
    discard: { ...(s?.discard || {}) },
    base,
    lvl:     s?.lvl || 0,
  };
}

// Compact value for state: null when it equals the standard deck.
function pack(st) {
  const discard = {};
  for (const [k, v] of Object.entries(st.discard)) if (v > 0) discard[k] = v;
  const def = defaultBase();
  const baseDefault = AM_TYPES.every(c => (st.base[c.key] || 0) === (def[c.key] || 0));
  const deckDefault = ALL.every(c => (st.deck[c.key] || 0) === (isSpecial(c.key) ? 0 : (st.base[c.key] || 0)));
  if (!sum(discard) && baseDefault && deckDefault && !st.lvl) return null;
  const out = { deck: st.deck, discard };
  if (!baseDefault) out.base = st.base;
  if (st.lvl) out.lvl = st.lvl;
  return out;
}

function save(g, st) {
  patch({ [field(g)]: pack(st) });
}

// Standard cards back in the deck per the base composition; bless and curse cards that were not drawn stay.
function reshuffled(st) {
  const out = deckFrom(st.base);
  for (const s of AM_SPECIAL) out[s.key] = st.deck[s.key] || 0;
  return out;
}

export function amNeedsReshuffle(s = amState()) {
  const shuffleDrawn = AM_TYPES.some(t => t.shuffle && (s.discard[t.key] || 0) > 0);
  return sum(s.deck) === 0 || shuffleDrawn;
}

export function amDeckTotal(g = 'm') { return sum(amState(g).deck); }

// ─── Draw / discard ──────────────────────────────────────────────────────────

// Draw one card of this type: deck -> discard (bless/curse just leave the game).
export function amDraw(key, g = 'm') {
  const st = amState(g);
  if (!(st.deck[key] > 0)) return;
  st.deck[key] -= 1;
  if (!isSpecial(key)) st.discard[key] = (st.discard[key] || 0) + 1;
  save(g, st);
}

// Discard -> deck, to correct a misclick.
export function amReturn(key, g = 'm') {
  const st = amState(g);
  if (!(st.discard[key] > 0)) return;
  st.discard[key] -= 1;
  st.deck[key] += 1;
  save(g, st);
}

// Add (+1) or remove (-1) a bless or curse card.
export function amAdjust(key, delta, g = 'm') {
  const spec = AM_SPECIAL.find(s => s.key === key);
  if (!spec) return;
  const st = amState(g);
  const next = Math.max(0, Math.min(spec.max, st.deck[key] + delta));
  if (next === st.deck[key]) return;
  st.deck[key] = next;
  save(g, st);
}

export function amShuffleNow(g = 'm') {
  const st = amState(g);
  save(g, { ...st, deck: reshuffled(st), discard: {} });
}

// For the end-of-round patch: returns the new value of state.am / state.amA.
export function amEndRound(g = 'm') {
  const st = amState(g);
  if (!amNeedsReshuffle(st)) return state[field(g)] ?? null;
  return pack({ ...st, deck: reshuffled(st), discard: {} });
}

// ─── Composition changes (permanent) ─────────────────────────────────────────

// Change the base count of one card type by delta (clamped). Draw state follows: an added card goes
// into the deck; a removed card leaves the deck first, then the discard. Returns the applied change.
function applyBase(st, key, delta) {
  const cur = st.base[key] || 0;
  const next = Math.max(0, Math.min(AM_MAX_PER_TYPE, cur + delta));
  const d = next - cur;
  if (!d) return 0;
  st.base[key] = next;
  if (d > 0) {
    st.deck[key] = (st.deck[key] || 0) + d;
  } else {
    let r = -d;
    const fromDeck = Math.min(r, st.deck[key] || 0);
    st.deck[key] = (st.deck[key] || 0) - fromDeck;
    r -= fromDeck;
    st.discard[key] = Math.max(0, (st.discard[key] || 0) - r);
  }
  return d;
}

// Manual edit: add (+1) or remove (-1) one card of this type, permanently.
export function amEditCard(key, delta, g = 'm') {
  if (isSpecial(key)) return;
  const st = amState(g);
  if (applyBase(st, key, delta)) save(g, st);
}

function imbueDelta(level) {
  const out = {};
  for (let l = 1; l <= level; l++) {
    for (const [k, v] of Object.entries(IMBUE[l] || {})) out[k] = (out[k] || 0) + v;
  }
  return out;
}

// Set the imbuement level (0 = off, 1, 2) by applying the difference to the base composition.
export function amSetImbue(level, g = 'm') {
  const st = amState(g);
  if (st.lvl === level) return;
  const from = imbueDelta(st.lvl), to = imbueDelta(level);
  for (const k of new Set([...Object.keys(from), ...Object.keys(to)])) {
    applyBase(st, k, (to[k] || 0) - (from[k] || 0));
  }
  st.lvl = level;
  save(g, st);
}

// Back to the standard 20 cards (bless and curse cards in the deck are kept).
export function amResetComposition(g = 'm') {
  const st = amState(g);
  const base = defaultBase();
  save(g, { base, lvl: 0, discard: {}, deck: reshuffled({ ...st, base }) });
}

// ─── Roller ──────────────────────────────────────────────────────────────────

// GeekRoller code, e.g. 1custom20{+0;+0;...;x2;Miss}
export function amRollerCode(g = 'm') {
  const { deck } = amState(g);
  const faces = [];
  for (const c of ALL) for (let i = 0; i < (deck[c.key] || 0); i++) faces.push(c.face);
  return faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '';
}
