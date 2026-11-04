// Monster attack modifier deck (shared by all monsters): draw/discard state, reshuffle rules, GeekRoller code.
//
// Cards of one type are interchangeable, so state is kept as counts per type:
//   state.am = { deck: { p0: 4, ..., bless: 1, curse: 0 }, discard: { p0: 2, ... } }
// A null entry means the standard 20-card deck with nothing discarded.
// Bless and curse cards live only in the deck: when drawn they leave the game instead of being discarded.

import { state, patch } from './state.js';

// order = order of faces in the GeekRoller code
export const AM_TYPES = [
  { key: 'p0',   face: '+0',   count: 6, img: 'gh-am-m-01',  shuffle: false },
  { key: 'p1',   face: '+1',   count: 5, img: 'gh-am-m-07',  shuffle: false },
  { key: 'm1',   face: '-1',   count: 5, img: 'gh-am-m-12',  shuffle: false },
  { key: 'p2',   face: '+2',   count: 1, img: 'gh-am-m-18',  shuffle: false },
  { key: 'm2',   face: '-2',   count: 1, img: 'gh-am-m-17',  shuffle: false },
  { key: 'x2',   face: 'x2',   count: 1, img: 'gh-am-m-20',  shuffle: true  },
  { key: 'miss', face: 'Miss', count: 1, img: 'gh-am-m-19',  shuffle: true  },
];

// Added and removed by hand. Face text is what goes into the roller code.
export const AM_SPECIAL = [
  { key: 'bless', face: 'Bless', img: 'gh-am-pm-15', label: 'Bless', max: 10 },
  { key: 'curse', face: 'Curse', img: 'gh-am-mm-01', label: 'Curse', max: 10 },
];

const ALL = [...AM_TYPES, ...AM_SPECIAL];
const isSpecial = key => AM_SPECIAL.some(s => s.key === key);
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

function defaultDeck() {
  const d = {};
  for (const t of AM_TYPES) d[t.key] = t.count;
  for (const s of AM_SPECIAL) d[s.key] = 0;
  return d;
}

export function amState() {
  const s = state.am;
  return {
    deck:    { ...defaultDeck(), ...(s?.deck || {}) },
    discard: { ...(s?.discard || {}) },
  };
}

function isDefault(deck, discard) {
  const def = defaultDeck();
  return sum(discard) === 0 && ALL.every(c => (deck[c.key] || 0) === def[c.key]);
}

function save(deck, discard) {
  const d = {};
  for (const [k, v] of Object.entries(discard)) if (v > 0) d[k] = v;
  patch({ am: isDefault(deck, d) ? null : { deck, discard: d } });
}

// Standard cards back in the deck; bless and curse cards that were not drawn stay.
function reshuffled(deck) {
  const out = defaultDeck();
  for (const s of AM_SPECIAL) out[s.key] = deck[s.key] || 0;
  return out;
}

export function amNeedsReshuffle(s = amState()) {
  const shuffleDrawn = AM_TYPES.some(t => t.shuffle && (s.discard[t.key] || 0) > 0);
  return sum(s.deck) === 0 || shuffleDrawn;
}

export function amDeckTotal() { return sum(amState().deck); }

// ─── Actions ─────────────────────────────────────────────────────────────────

// Draw one card of this type: deck -> discard (bless/curse just leave the game).
export function amDraw(key) {
  const { deck, discard } = amState();
  if (!(deck[key] > 0)) return;
  deck[key] -= 1;
  if (!isSpecial(key)) discard[key] = (discard[key] || 0) + 1;
  save(deck, discard);
}

// Discard -> deck, to correct a misclick.
export function amReturn(key) {
  const { deck, discard } = amState();
  if (!(discard[key] > 0)) return;
  discard[key] -= 1;
  deck[key] += 1;
  save(deck, discard);
}

// Add (+1) or remove (-1) a bless or curse card.
export function amAdjust(key, delta) {
  const spec = AM_SPECIAL.find(s => s.key === key);
  if (!spec) return;
  const { deck, discard } = amState();
  const next = Math.max(0, Math.min(spec.max, deck[key] + delta));
  if (next === deck[key]) return;
  deck[key] = next;
  save(deck, discard);
}

export function amShuffleNow() {
  const { deck } = amState();
  save(reshuffled(deck), {});
}

// For the end-of-round patch: returns the new value of state.am.
export function amEndRound() {
  const s = amState();
  if (!amNeedsReshuffle(s)) return state.am ?? null;
  const deck = reshuffled(s.deck);
  return isDefault(deck, {}) ? null : { deck, discard: {} };
}

// GeekRoller code, e.g. 1custom20{+0;+0;...;x2;Miss}
export function amRollerCode() {
  const { deck } = amState();
  const faces = [];
  for (const c of ALL) for (let i = 0; i < deck[c.key]; i++) faces.push(c.face);
  return faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '';
}
