// Attack modifier decks (monsters, allies): draw/discard state, composition changes, reshuffle rules, GeekRoller code.
//
// Cards of one type are interchangeable, so state is kept as counts per type:
//   state.am = { deck: {p0: 4, ...}, discard: {p0: 2, ...}, base?: {key: n}, lvl?: 0|1|2 }
// deck/discard = current draw state. base = the full composition the deck returns to on a reshuffle
// (permanent changes: perks, imbuement, manual edits). lvl = imbuement level applied to base.
// A null entry means the standard 20-card deck with nothing discarded.
//
// Decks are addressed by a key: 'm' (monsters, state.am), 'a' (allies, state.amA) or 'h<i>' (the
// hero at state.mercenaries[i], stored on that entry as `am`). deckOf() maps a key to where it is
// read and written and to its card catalog, so all logic below is the same for every deck.
// Bless and curse cards live only in the deck: when drawn they leave the game instead of being discarded.

import { state, patch, withoutAm } from './state.js';
import { MERCENARIES } from './data.js';
import { heroCatalog, heroPerkClass, perkDelta, perkBoxes, perkLabel, groupPerks } from './amd/heroDeck.js';

// Order = order of faces in the GeekRoller code. Standard cards first, then cards added by imbuement.
export const AM_TYPES = [
  { key: 'p0',   face: '+0',   count: 6, value: '+0', img: 'monster/plus0',  shuffle: false },
  { key: 'p1',   face: '+1',   count: 5, value: '+1', img: 'monster/plus1',  shuffle: false },
  { key: 'm1',   face: '-1',   count: 5, value: '-1', img: 'monster/minus1',  shuffle: false },
  { key: 'p2',   face: '+2',   count: 1, value: '+2', img: 'monster/plus2',  shuffle: false },
  { key: 'm2',   face: '-2',   count: 1, value: '-2', img: 'monster/minus2',  shuffle: false },
  { key: 'x2',   face: 'x2',   count: 1, value: 'x2', img: 'monster/x2',  shuffle: true  },
  { key: 'miss', face: 'Miss', count: 1, value: 'null', img: 'monster/miss',  shuffle: true  },
  // not in the standard deck (count 0); shown when present or in edit mode
  { key: 'i2m',  face: '+2 Muddle', count: 0, img: 'imbuement/plus2muddle', shuffle: false, extra: true },
  { key: 'i0p',  face: '+0 Poison', count: 0, img: 'imbuement/plus0poison', shuffle: false, extra: true },
  { key: 'i3',   face: '+3',        count: 0, img: 'imbuement/plus3',       shuffle: false, extra: true },
  { key: 'i1h',  face: '+1 Heal1',  count: 0, img: 'imbuement/plus1heal1',  shuffle: false, extra: true },
  { key: 'i1c',  face: '+1 Curse',  count: 0, img: 'imbuement/plus1curse',  shuffle: false, extra: true },
  { key: 'i0w',  face: '+0 Wound',  count: 0, img: 'imbuement/plus0wound',  shuffle: false, extra: true },
];

// Added and removed by hand, temporary. Face text is what goes into the roller code.
export const AM_SPECIAL = [
  { key: 'bless', face: 'Bless', img: 'monster/bless', heroImg: 'hero/bless', label: 'Bless', max: 10 },
  { key: 'curse', face: 'Curse', img: 'monster/curse', heroImg: 'hero/curse', label: 'Curse', max: 10 },
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
const HERO_KEY = /^h(\d+)$/;
// Index of the hero a deck key 'h<i>' refers to (position in state.mercenaries), else undefined.
const heroIndex = g => { const m = HERO_KEY.exec(g); return m ? Number(m[1]) : undefined; };

// Where a deck lives and what cards it can hold. Unknown keys (e.g. a hero that was removed) read as
// the standard deck and ignore writes.
function deckOf(g) {
  if (g === 'm' || g === 'a') {
    const f = g === 'a' ? 'amA' : 'am';
    return { read: () => state[f], write: v => ({ [f]: v }), catalog: AM_TYPES, imbue: g === 'm' };
  }
  const i = heroIndex(g);
  return {
    read: () => state.mercenaries?.[i]?.am,
    write: v => ({ mercenaries: withHeroAm(state.mercenaries, i, v) }),
    catalog: heroCatalog(heroTitle(i), AM_TYPES),
    imbue: false,
    hero: i,
  };
}

function heroTitle(i) {
  return MERCENARIES.byId.get(Number(state.mercenaries?.[i]?.id))?.title || '';
}

// mercenaries with the am of entry i replaced (removed when null); same array if there is no entry i.
function withHeroAm(mercs = [], i, am) {
  if (!mercs[i]) return mercs;
  return mercs.map((h, j) => {
    if (j !== i) return h;
    return am != null ? { ...h, am } : withoutAm(h);
  });
}

// All decks to show as tabs: monsters, allies, then one per hero on the map.
export function amDecks() {
  const out = [...AM_GROUPS];
  const mercs = state.mercenaries || [];
  mercs.forEach((h, i) => {
    const title = heroTitle(i);
    if (!title) return;   // unknown class: no deck (the key of the others stays their entry index)
    const same = mercs.filter(x => x.id === h.id).length > 1;
    out.push({ key: 'h' + i, label: same ? `${title} #${mercs.slice(0, i + 1).filter(x => x.id === h.id).length}` : title });
  });
  return out;
}

// Hero decks (key 'h<i>') use the hero versions of bless/curse (no monster badge).
export const amIsHero = g => heroIndex(g) !== undefined;

// Only the monster deck is imbued.
export const amSupportsImbue = g => g === 'm';

// A hero's perk faces change only through its perks; its basic cards stay editable (scenario effects).
export const amCardLocked = (g, entry) => amIsHero(g) && !!entry.extra;

// Perk class (edition, name, perks) of a hero deck, null for other decks or a class without perk data.
function heroClassOf(g) {
  const i = heroIndex(g);
  return i === undefined ? null : heroPerkClass(heroTitle(i));
}

// Class name of a hero deck (for the class badge on its cards), else null.
export const amClassName = g => heroClassOf(g)?.name ?? null;

const isSpecial = key => AM_SPECIAL.some(s => s.key === key);
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

function defaultBase(catalog = AM_TYPES) {
  const b = {};
  for (const t of catalog) b[t.key] = t.count;
  return b;
}

function deckFrom(base) {
  const d = { ...base };
  for (const s of AM_SPECIAL) d[s.key] = 0;
  return d;
}

export function amState(g = 'm') {
  const d = deckOf(g);
  const s = d.read();
  const base = { ...defaultBase(d.catalog), ...(s?.base || {}) };
  return {
    deck:    { ...deckFrom(base), ...(s?.deck || {}) },
    discard: { ...(s?.discard || {}) },
    base,
    lvl:     s?.lvl || 0,
    perks:   s?.perks || [],   // taken perk entries of a hero (index into its class's perk list)
    boxes:   s?.boxes || {},   // ticked boxes of multi-box perks not yet taken: { perkIndex: bitmask }
    catalog: d.catalog,
  };
}

// Entries of obj that differ from ref (missing = 0). Reading merges them back over the defaults.
function diff(obj, ref) {
  const out = {};
  for (const k of new Set([...Object.keys(obj), ...Object.keys(ref)])) {
    if ((obj[k] || 0) !== (ref[k] || 0)) out[k] = obj[k] || 0;
  }
  return out;
}

// Compact value for state: only what differs from the standard deck; null when nothing does.
// Keeps hero decks short in the map link (their catalogs hold dozens of cards).
function pack(st) {
  const discard = {};
  for (const [k, v] of Object.entries(st.discard)) if (v > 0) discard[k] = v;
  const base = diff(st.base, defaultBase(st.catalog));
  const deck = diff(st.deck, deckFrom(st.base));
  const perks = st.perks || [];
  const boxes = st.boxes || {};
  if (!sum(discard) && !Object.keys(base).length && !Object.keys(deck).length && !st.lvl && !perks.length && !Object.keys(boxes).length) return null;
  const out = { discard };
  if (Object.keys(deck).length) out.deck = deck;
  if (Object.keys(base).length) out.base = base;
  if (st.lvl) out.lvl = st.lvl;
  if (perks.length) out.perks = perks;
  if (Object.keys(boxes).length) out.boxes = boxes;
  return out;
}

function save(g, st) {
  patch(deckOf(g).write(pack(st)));
}

// Standard cards back in the deck per the base composition; bless and curse cards that were not drawn stay.
function reshuffled(st) {
  const out = deckFrom(st.base);
  for (const s of AM_SPECIAL) out[s.key] = st.deck[s.key] || 0;
  return out;
}

export function amNeedsReshuffle(s = amState()) {
  const shuffleDrawn = s.catalog.some(t => t.shuffle && (s.discard[t.key] || 0) > 0);
  return sum(s.deck) === 0 || shuffleDrawn;
}

// Card count and reshuffle flag of a deck from one state read (for the tab strip).
export function amDeckInfo(g, st = amState(g)) {
  return { total: sum(st.deck), pending: amNeedsReshuffle(st) };
}

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

// For the end-of-round patch: the state changes that reshuffle every deck that needs it
// ({am, amA, mercenaries}; a key is only present when that deck changes).
export function amEndRoundPatch() {
  const out = {};
  let mercs = state.mercenaries;
  for (const { key } of amDecks()) {
    const st = amState(key);
    if (!amNeedsReshuffle(st)) continue;
    const packed = pack({ ...st, deck: reshuffled(st), discard: {} });
    const hero = heroIndex(key);
    if (hero !== undefined) mercs = withHeroAm(mercs, hero, packed);
    else Object.assign(out, deckOf(key).write(packed));
  }
  if (mercs !== state.mercenaries) out.mercenaries = mercs;
  return out;
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
  const entry = st.catalog.find(c => c.key === key);
  if (entry && amCardLocked(g, entry)) return;
  if (applyBase(st, key, delta)) save(g, st);
}

// ─── Hero perks ──────────────────────────────────────────────────────────────

// The perk list of a hero deck with the ticked ones marked, or null (not a hero, or no perk data).
export function amHeroPerks(g) {
  const cls = heroClassOf(g);
  if (!cls) return null;
  const { perks: taken, boxes } = amState(g);
  const fixed = classPerkLayout(cls);
  // on = taken (all boxes ticked); boxes = number of checkboxes; mask = which of them are ticked
  const perks = fixed.perks.map(p => ({ ...p, on: taken.includes(p.index), mask: boxes[p.index] || 0 }));
  // groups: repeated identical entries shown as one row with one box per entry
  const groups = fixed.groups.map(ix => perkGroup(ix.map(i => perks[i])));
  return { edition: cls.edition, name: cls.name, perks, groups };
}

// One row of the perk list: the entries that make up one perk (several when it is repeated), how its
// boxes are laid out and whether it is taken. kind: 'repeat' = one box per entry, each counts on its own;
// 'linked' = one entry with several boxes that must all be ticked; 'single' = one box.
function perkGroup(members) {
  const perk = members[0];
  const repeated = members.length > 1;
  const boxes = repeated
    ? members.map(m => ({ perk: m.index, box: 0, ticked: m.on }))
    : Array.from({ length: perk.boxes }, (_, i) => ({ perk: perk.index, box: i, ticked: perk.on || !!(perk.mask & (1 << i)) }));
  const done = repeated ? members.every(m => m.on) : perk.on;
  const partial = !done && (repeated ? members.some(m => m.on) : perk.mask !== 0);
  return { perk, members, kind: repeated ? 'repeat' : perk.boxes > 1 ? 'linked' : 'single', boxes, done, partial };
}

// The parts of a class's perk list that never change (box count, label without marker, which entries
// form a repeated group), computed once per class. perks[i].index === i in perks.js.
const perkLayouts = new Map();
function classPerkLayout(cls) {
  if (!perkLayouts.has(cls.name)) {
    const perks = cls.perks.map(p => ({ ...p, boxes: perkBoxes(p), label: perkLabel(p) }));
    perkLayouts.set(cls.name, { perks, groups: groupPerks(perks).map(g => g.members.map(m => m.index)) });
  }
  return perkLayouts.get(cls.name);
}

// Applies (sign +1) or reverts (-1) one perk entry on the composition and the list of taken perks.
function applyPerk(st, perk, sign) {
  for (const [k, n] of Object.entries(perkDelta(perk))) applyBase(st, k, sign * n);
  st.perks = sign > 0 ? [...st.perks, perk.index].sort((a, b) => a - b) : st.perks.filter(i => i !== perk.index);
}

// Tick or untick one checkbox of a perk (box = 0..boxes-1). A multi-box perk is applied only when all
// its boxes are ticked, and reverted as soon as one is unticked.
export function amToggleBox(index, box, g) {
  const info = amHeroPerks(g);
  const perk = info?.perks.find(p => p.index === index);
  if (!perk || !(box >= 0 && box < perk.boxes)) return;
  const st = amState(g);
  const full = (1 << perk.boxes) - 1;
  const was = perk.on || perk.mask === full;
  const mask = (perk.on ? full : perk.mask) ^ (1 << box);
  const now = mask === full;
  if (was !== now) applyPerk(st, perk, now ? 1 : -1);
  const boxes = { ...st.boxes };
  if (mask && !now) boxes[index] = mask; else delete boxes[index];   // a taken perk needs no mask
  st.boxes = boxes;
  save(g, st);
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
  const base = defaultBase(st.catalog);
  save(g, { ...st, base, lvl: 0, perks: [], boxes: {}, discard: {}, deck: reshuffled({ ...st, base }) });
}

// ─── Roller ──────────────────────────────────────────────────────────────────

// GeekRoller code, e.g. 1custom20{+0;+0;...;x2;Miss}
export function amRollerCode(g = 'm') {
  const { deck, catalog } = amState(g);
  const faces = [];
  for (const c of [...catalog, ...AM_SPECIAL]) for (let i = 0; i < (deck[c.key] || 0); i++) faces.push(c.face);
  return faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '';
}
