// Campaign record: shape, validation and derived values. Pure data logic (no DOM, no storage), so the read-only
// view, the future server and the session commit can share it. Draft schema: docs/campaign-schema.md section 4.
// Ids refer to the generated tables in scripts/games/gh2_*.js and battle_goals.js.
import { CLASSES } from '../games/gh2_classes.js';
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
  imb, stk, cls     imbuement ticks, sticker labels, unlocked class names
  scn               { "<number>": { s, l?, p?, ch?, d? } }   state, level, party size, chests, date
  chars             [{ id, cls, name, lv, xp, gold, inh, traits, hand, deck, disc, act, lost, bench, items:[{id, st}], am }]
  items             { unl: [itemId], taken: { itemId: copies in use } }
  events            { city, road: { top, bottom, out, locked }, pend? }   piles are ordered, see scripts/campaign/events.js
                    pend = the open event { kind, id, votes: { seat: label }, closed?, rnd? }
                    marks = { "road:4": [1] }   ticked box indexes of cards with boxes (the card keeps them in every pile)
                    notes = { "road:4": "text" }   free note on a card
  evlog             finished events [{ kind, id, opt, votes, rnd?, closed?, place }]
  decks             { bg, tre, mp }                 battle goals drawn, treasures claimed, med packs
  enh, retired      enhancement log, retired characters
*/
export function emptyRecord() {
  return {
    v: RECORD_VERSION, ver: 1, name: '', players: [],
    party: { insp: 0, avg: 1, diff: 0, diffName: 'Normal' },
    rep: { demons: 0, merchants: 0, guard: 0 }, pros: 0, imb: [], stk: [], cls: [],
    scn: {}, chars: [], items: { unl: [], taken: {} },
    events: { city: { top: [], bottom: [], out: [], locked: [] }, road: { top: [], bottom: [], out: [], locked: [] }, marks: {}, notes: {} }, evlog: [],
    decks: { bg: [], tre: [], mp: [] }, enh: [], retired: [],
  };
}

const REP_KEY = { 'Demons': 'demons', 'Merchants': 'merchants', 'City Guard': 'guard' };

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
  if (raw?.events?.pend) r.events.pend = raw.events.pend;
  r.events.marks = { ...(raw?.events?.marks || {}) };
  r.events.notes = { ...(raw?.events?.notes || {}) };
  r.evlog = Array.isArray(r.evlog) ? r.evlog : [];
  r.decks = { ...base.decks, ...(r.decks || {}) };
  r.scn = r.scn || {};
  r.chars = (r.chars || []).map(c => ({ traits: [], deck: [], disc: [], act: [], lost: [], bench: [], items: [], ...c }));
  return r;
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

// Ability card ids in the hand: the selected deck minus discard, active and lost.
export function handOf(c) {
  const out = new Set([...(c.disc || []), ...(c.act || []), ...(c.lost || [])]);
  return (c.deck || []).filter(id => !out.has(id));
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
