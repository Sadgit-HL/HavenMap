// Campaign record: shape, validation and derived values. Pure data logic (no DOM, no storage), so the read-only
// view, the future server and the session commit can share it. Draft schema: docs/campaign-schema.md section 4.
// Ids refer to the generated tables in scripts/games/gh2_*.js and battle_goals.js.
import { CLASSES } from '../games/gh2_classes.js';
import { ALL_CLASSES } from './classList.js';
import { CARDS } from '../games/gh2_cards.js';
import { ITEMS } from '../games/gh2_items.js';
import { SCENARIOS } from '../games/gh2_scenarios.js';

export const RECORD_VERSION = 1;

// Scenario states (scn[n].s).
export const SCN_STATE = { LOCKED: 0, UNLOCKED: 1, COMPLETED: 2, LOCKED_OUT: 3 };
export const SCN_STATE_NAME = ['Locked', 'Unlocked', 'Completed', 'Locked out'];

/*
Record fields (all optional on load, defaults filled by normalize):
  v, ver            schema version, revision counter (optimistic locking)
  name, players     [{ seat, name }]
  party             { insp, avg, diff, diffName }   inspiration, average level, difficulty modifier
  rep               { demons, merchants, guard }    reputation, -10..20
  pros              prosperity checkmarks
  imb, don          imbuement boxes ticked (0..80) and gold donated to the Sanctuary of the Oak (0..100); counts. Older
                    records hold imb as the importer's raw "row:col" list of both box grids: normalize converts it
  stk, cls          sticker labels, unlocked class names
  avail             class names available in this campaign (optional; absent = every class in scripts/campaign/classList.js)
  scn               { "<number>": { s, l?, p?, ch?, d? } }   state, level, party size, chests, date
  chars             [{ id, cls, name, seat?, lv, xp, gold, inh, traits, special, hand, deck, disc, act, lost, play, hord, tok, bench, items:[{id, st}], am }]
                    Every ability card of `deck` is in exactly one place: lost, disc (discard pile, last = top), play, act (active area) or the hand
                    (all the rest). play = [slot 1, slot 2], each null or { id, up } (up = face up); only hand cards enter a slot, slot 1 sets the
                    initiative. hord = manual hand order [cardId] or null (null = sorted by initiative),
                    tok = class special tokens { key: count or state index } (scripts/campaign/classTokens.js)
                    special = special traits gained through events (keys of scripts/campaign/traits.js)
  items             { unl: [itemId], taken: { itemId: copies in use } }
  events            { city, road: { top, bottom, out, locked }, pend? }   piles are ordered, see scripts/campaign/events.js
                    pend = the open events, one per deck: { city?: e, road?: e } with e = { kind, id, votes: { seat: label }, closed?, rnd? }
                    marks = { "road:4": [1] }   ticked box indexes of cards with boxes (the card keeps them in every pile)
                    notes = { "road:4": "text" }   free note on a card
  evlog             finished events [{ kind, id, opt, votes, rnd?, closed?, place }]
  decks             { bg, tre, mp }                 battle goals drawn, treasures claimed, med packs
  enh, retired      enhancement log, retired characters
  log               edit history, oldest first: [{ t: epoch ms, u: user, tab, kind, d }] (scripts/campaign/changelog.js), the last 1000 kept
  resLinks          { "<resource title>|<game>": url }   overrides scripts/games/resources.js's own link for that cell
*/
// The class names available in the campaign: r.avail when set, otherwise every class. Unlocked classes are always available.
export function availableSet(r) {
  const names = r.avail ? [...r.avail, ...(r.cls || [])] : ALL_CLASSES.map(c => c.name);
  return new Set(names.map(n => String(n).toLowerCase()));
}

export function emptyRecord() {
  return {
    v: RECORD_VERSION, ver: 1, name: '', players: [],
    party: { insp: 0, avg: 1, diff: 0, diffName: 'Normal' },
    rep: { demons: 0, merchants: 0, guard: 0 }, pros: 0, imb: 0, don: 0, stk: [], cls: [],
    scn: {}, chars: [], items: { unl: [], taken: {} },
    events: { city: { top: [], bottom: [], out: [], locked: [] }, road: { top: [], bottom: [], out: [], locked: [] }, marks: {}, notes: {} }, evlog: [],
    decks: { bg: [], tre: [], mp: [] }, enh: [], retired: [], resLinks: {}, log: [],
  };
}

const REP_KEY = { 'Demons': 'demons', 'Merchants': 'merchants', 'City Guard': 'guard' };

// The open events of a record: { city?, road? }. Records saved while only one event could be open hold that one event
// ({ kind, id, votes }) and are converted.
function migratePend(p) {
  if (!p || typeof p !== 'object') return null;
  if (typeof p.kind === 'string' && p.id !== undefined) return { [p.kind]: p };
  const out = {};
  for (const k of ['city', 'road']) if (p[k] && typeof p[k] === 'object') out[k] = p[k];
  return Object.keys(out).length ? out : null;
}

// Fill defaults and accept the importer's slightly different spellings (tools/import-campaign-state.py).
export function normalize(raw) {
  const base = emptyRecord();
  const r = { ...base, ...(raw || {}) };
  r.party = { ...base.party, ...(r.party || {}) };
  const rep = { ...base.rep };
  for (const [k, v] of Object.entries(r.rep || {})) rep[REP_KEY[k] || k] = v;
  r.rep = rep;
  r.items = { unl: [], taken: {}, ...(r.items || {}) };
  r.events = { city: { ...base.events.city, ...(r.events?.city || {}) }, road: { ...base.events.road, ...(r.events?.road || {}) } };
  const pend = migratePend(raw?.events?.pend);
  if (pend) r.events.pend = pend;
  r.events.marks = { ...(raw?.events?.marks || {}) };
  r.events.notes = { ...(raw?.events?.notes || {}) };
  r.evlog = Array.isArray(r.evlog) ? r.evlog : [];
  r.decks = { ...base.decks, ...(r.decks || {}) };
  r.resLinks = { ...(r.resLinks || {}) };
  r.log = Array.isArray(r.log) ? r.log : [];
  // Imbuement is the sheet's left box grid (importer columns 4..13), the Sanctuary of the Oak donations the right one (21..30).
  if (Array.isArray(r.imb)) {
    const col = k => Number(String(k).split(':')[1]);
    const left = r.imb.filter(k => col(k) >= 4 && col(k) <= 13).length;
    r.don = r.imb.length - left;
    r.imb = left;
  }
  r.imb = Math.max(0, Math.min(80, Math.trunc(Number(r.imb)) || 0));
  r.don = Math.max(0, Math.min(100, Math.trunc(Number(r.don)) || 0));
  r.scn = r.scn || {};
  r.chars = (r.chars || []).map(normalizeChar);
  return r;
}

// A character with every field present. Each ability card is in one place only: a record that lists a card twice keeps it in
// the first of lost, discard, a play slot, active; play slots keep { id, up } or null; hord keeps hand cards only.
function normalizeChar(c) {
  const ch = { traits: [], special: [], deck: [], disc: [], act: [], lost: [], bench: [], items: [], play: [null, null], hord: null, tok: {}, ...c };
  const seen = new Set();
  const take = list => (Array.isArray(list) ? list : []).filter(id => !seen.has(id) && seen.add(id));
  ch.lost = take(ch.lost);
  ch.disc = take(ch.disc);
  const play = Array.isArray(ch.play) ? ch.play : [];
  ch.play = [0, 1].map(i => { const p = play[i]; return p && ch.deck.includes(p.id) && !seen.has(p.id) && seen.add(p.id) ? { id: p.id, up: !!p.up } : null; });
  ch.act = take(ch.act);
  ch.tok = ch.tok && typeof ch.tok === 'object' && !Array.isArray(ch.tok) ? Object.fromEntries(Object.entries(ch.tok).map(([k, v]) => [k, Math.max(0, Math.min(99, Math.trunc(Number(v)) || 0))])) : {};
  if (Array.isArray(ch.hord)) { const own = new Set(); ch.hord = ch.hord.filter(id => ch.deck.includes(id) && !seen.has(id) && !own.has(id) && own.add(id)); } else ch.hord = null;
  return ch;
}

// List of problems; an empty list means the record is usable. Does not throw.
export function validate(r) {
  const issues = [];
  if (!r || typeof r !== 'object') return ['not an object'];
  if (r.v !== undefined && r.v > RECORD_VERSION) issues.push(`record version ${r.v} is newer than ${RECORD_VERSION}`);
  const cardIds = new Set(CARDS.map(c => c.id));
  const itemIds = new Set(ITEMS.map(i => i.id));
  const scnNums = new Set(SCENARIOS.map(s => String(s.n)));
  for (const n of Object.keys(r.scn || {})) if (!scnNums.has(n)) issues.push(`unknown scenario ${n}`);
  for (const id of r.items?.unl || []) if (!itemIds.has(id)) issues.push(`unknown item ${id}`);
  for (const c of r.chars || []) {
    for (const id of [...(c.deck || []), ...(c.bench || [])]) if (!cardIds.has(id)) issues.push(`${c.name}: unknown card ${id}`);
    for (const it of c.items || []) if (!itemIds.has(it.id)) issues.push(`${c.name}: unknown item ${it.id}`);
  }
  return issues;
}

// --- derived values ---------------------------------------------------------------------------------------

// Scenario level: half the average party level (rounded up) plus the difficulty modifier, clamped 0..7.
// (Gloomhaven rule, using the sheet's own "Average Level" and difficulty value.) Unverified for GH2 2e edge cases.
export function scenarioLevel(party) {
  return Math.max(0, Math.min(7, Math.ceil((party.avg || 0) / 2) + (party.diff || 0)));
}

// Prosperity level from checkmarks. The sheet has 90 boxes in two rows of 45; level N starts at box index
// PROSPERITY_START[N-1] (read from the level numbers above the boxes), so level N is reached by ticking that box.
export const PROSPERITY_START = [0, 5, 12, 22, 33, 45, 59, 74, 89];
export function prosperityLevel(checks) {
  let lv = 1;
  for (let i = 0; i < PROSPERITY_START.length; i++) if (checks > PROSPERITY_START[i]) lv = i + 1;
  return lv;
}

export const classByName = name => CLASSES.find(c => c.name.toLowerCase() === String(name || '').toLowerCase());

// Where an ability card of the character's deck is: 'hand', 'active', 'play1', 'play2', 'discard' or 'lost'.
export const CARD_ZONES = ['hand', 'active', 'play1', 'play2', 'discard', 'lost'];
export function zoneOf(c, id) {
  if ((c.lost || []).includes(id)) return 'lost';
  if ((c.disc || []).includes(id)) return 'discard';
  const play = c.play || [];
  if (play[0]?.id === id) return 'play1';
  if (play[1]?.id === id) return 'play2';
  if ((c.act || []).includes(id)) return 'active';
  return 'hand';
}

// Ability card ids in the hand (deck order): the selected deck minus lost, discard, play slots and the active area.
export function handOf(c) {
  const out = new Set([...(c.disc || []), ...(c.act || []), ...(c.lost || []), ...(c.play || []).filter(Boolean).map(p => p.id)]);
  return (c.deck || []).filter(id => !out.has(id));
}

const CARD_INFO = new Map(CARDS.map(k => [k.id, k]));
const cardIni = id => CARD_INFO.get(id)?.ini ?? Infinity;             // unknown initiative sorts last
// Card level for sorting: X cards first, then 1 to 9, then the rest (M and unknown).
export const cardLevel = id => { const lv = CARD_INFO.get(id)?.lv; return lv === 'X' ? 0 : Number.isFinite(Number(lv)) && lv !== undefined ? Number(lv) : 99; };

// The hand in display order. hord null = automatic: lowest initiative first, deck order for ties and unknown initiatives.
// With a manual order (hord) the cards follow it; hand cards missing from hord (new in the deck) come after, by initiative.
export function handList(c) {
  const hand = handOf(c).sort((a, b) => (cardIni(a) === cardIni(b) ? 0 : cardIni(a) < cardIni(b) ? -1 : 1));
  if (!Array.isArray(c.hord)) return hand;
  const pos = id => { const i = c.hord.indexOf(id); return i < 0 ? Infinity : i; };
  return hand.sort((a, b) => (pos(a) === pos(b) ? 0 : pos(a) < pos(b) ? -1 : 1));
}

// Copies of an item in use: the number of characters holding it (calculated from the character sheets,
// not stored; `items.taken` of an imported record is ignored).
export function itemsInUse(r, item) {
  let n = 0;
  for (const c of r.chars) for (const it of c.items || []) if (String(it.id) === String(item.id)) n++;
  return n;
}

// Copies of an item still in the shop (total copies minus copies in use); 0 when locked.
export function shopCopies(r, item) {
  if (!r.items.unl.includes(item.id)) return 0;
  return Math.max(0, (item.n || 0) - itemsInUse(r, item));
}

// Scenarios that unlock this one (reverse arrows of the flow chart).
export function unlockedBy(n) {
  return SCENARIOS.filter(s => (s.unl || []).includes(n)).map(s => s.n);
}

// A scenario is available when it is unlocked or was a start scenario, and not yet completed.
export function isAvailable(r, s) {
  const st = r.scn[String(s.n)]?.s;
  return st === SCN_STATE.UNLOCKED;
}
