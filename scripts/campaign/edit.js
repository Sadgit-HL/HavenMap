// Campaign record edits. Every function takes a record and returns a NEW record with `ver` bumped (the record
// passed in is never changed), so callers can keep history for undo and the server can later use `ver` for
// optimistic locking. Invalid input is clamped or ignored, never thrown. Pure data logic, no DOM, no storage.
import { SCENARIOS } from '../games/gh2_scenarios.js';
import { ITEMS } from '../games/gh2_items.js';
import { CLASSES } from '../games/gh2_classes.js';
import { SCN_STATE } from './record.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const toInt = v => { const n = Math.trunc(Number(v)); return Number.isFinite(n) ? n : null; };

function edit(r, fn) {
  const n = structuredClone(r);
  fn(n);
  n.ver = (r.ver || 0) + 1;
  return n;
}

// --- party and campaign values -------------------------------------------------------------------------------

const PARTY_RANGE = { avg: [1, 9], diff: [-3, 5], insp: [0, 99] };
export function setParty(r, key, value) {
  const range = PARTY_RANGE[key], n = toInt(value);
  if (!range || n === null) return r;
  return edit(r, x => { x.party[key] = clamp(n, ...range); });
}

export const REP_FACTIONS = ['demons', 'merchants', 'guard'];
export function setReputation(r, faction, value) {
  const n = toInt(value);
  if (!REP_FACTIONS.includes(faction) || n === null) return r;
  return edit(r, x => { x.rep[faction] = clamp(n, -10, 20); });
}

export function setProsperity(r, value) {
  const n = toInt(value);
  return n === null ? r : edit(r, x => { x.pros = clamp(n, 0, 90); });
}

// --- scenarios -----------------------------------------------------------------------------------------------

const scenarioByNum = new Map(SCENARIOS.map(s => [String(s.n), s]));

// Set a scenario's state. Completing one also unlocks the scenarios it links to that are still locked
// (the flow chart arrows), unless `opts.unlockNext` is false. Leaving the completed state drops the result record.
export function setScenarioState(r, n, state, opts = {}) {
  const key = String(n);
  const s = scenarioByNum.get(key);
  if (!s || !Object.values(SCN_STATE).includes(state)) return r;
  return edit(r, x => {
    const cur = x.scn[key] || {};
    x.scn[key] = state === SCN_STATE.COMPLETED ? { ...cur, s: state } : { s: state };
    if (state === SCN_STATE.LOCKED) delete x.scn[key];
    if (state === SCN_STATE.COMPLETED && opts.unlockNext !== false) {
      for (const u of s.unl || []) {
        if (scenarioByNum.has(String(u)) && !(x.scn[String(u)]?.s > SCN_STATE.LOCKED)) x.scn[String(u)] = { s: SCN_STATE.UNLOCKED };
      }
    }
  });
}

// Result record of a completed scenario: l level, p party size, ch chest numbers (array or "1, 2" text), d ISO date.
export function setScenarioResult(r, n, patch) {
  const key = String(n);
  if (r.scn[key]?.s !== SCN_STATE.COMPLETED) return r;
  return edit(r, x => {
    const cur = x.scn[key];
    if ('l' in patch) { const v = toInt(patch.l); if (v !== null) cur.l = clamp(v, 0, 7); }
    if ('p' in patch) { const v = toInt(patch.p); if (v !== null) cur.p = clamp(v, 1, 4); }
    if ('d' in patch) { if (patch.d) cur.d = String(patch.d).slice(0, 10); else delete cur.d; }
    if ('ch' in patch) {
      const list = (Array.isArray(patch.ch) ? patch.ch : String(patch.ch).split(/[,\s]+/)).map(toInt).filter(v => v !== null && v > 0);
      if (list.length) cur.ch = list; else delete cur.ch;
    }
  });
}

// --- items ---------------------------------------------------------------------------------------------------

const itemById = new Map(ITEMS.map(i => [String(i.id), i]));

export function setItemUnlocked(r, id, unlocked) {
  const item = itemById.get(String(id));
  if (!item) return r;
  return edit(r, x => {
    const has = x.items.unl.includes(item.id);
    if (unlocked && !has) x.items.unl.push(item.id);
    if (!unlocked && has) {
      x.items.unl = x.items.unl.filter(v => v !== item.id);
      delete x.items.taken[String(item.id)];
    }
  });
}

// Copies of an item in use by players, 0 .. total copies.
export function setItemTaken(r, id, value) {
  const item = itemById.get(String(id)), n = toInt(value);
  if (!item || n === null) return r;
  return edit(r, x => {
    const v = clamp(n, 0, item.n || 0);
    if (v) x.items.taken[String(item.id)] = v; else delete x.items.taken[String(item.id)];
  });
}

// --- events and decks ----------------------------------------------------------------------------------------

export const EVENT_PLACES = ['', 'out', 'bottom', 'top'];      // '' = in the deck

export function setEventPlace(r, kind, id, place) {
  if (!['city', 'road'].includes(kind) || !EVENT_PLACES.includes(place)) return r;
  return edit(r, x => {
    for (const p of EVENT_PLACES.slice(1)) x.events[kind][p] = x.events[kind][p].filter(v => v !== id);
    if (place) x.events[kind][place].push(id);
  });
}

// Next place in the cycle in deck > out > bottom > top > in deck, for a click on an event number.
export function nextEventPlace(r, kind, id) {
  const cur = EVENT_PLACES.slice(1).find(p => r.events[kind][p].includes(id)) || '';
  return EVENT_PLACES[(EVENT_PLACES.indexOf(cur) + 1) % EVENT_PLACES.length];
}

export const DECK_LISTS = ['bg', 'tre', 'mp'];
export function toggleDeckEntry(r, list, id) {
  if (!DECK_LISTS.includes(list)) return r;
  return edit(r, x => {
    const has = x.decks[list].includes(id);
    x.decks[list] = has ? x.decks[list].filter(v => v !== id) : [...x.decks[list], id];
  });
}

// Replace a deck list from text such as "18, 32 49" (treasure numbers: the Card DB has no table to check them against).
export function setDeckList(r, list, value) {
  if (!DECK_LISTS.includes(list)) return r;
  const ids = [...new Set((Array.isArray(value) ? value : String(value).split(/[,\s]+/)).map(toInt).filter(v => v !== null && v > 0))];
  return edit(r, x => { x.decks[list] = ids.sort((a, b) => a - b); });
}

// --- characters ----------------------------------------------------------------------------------------------

const CHAR_RANGE = { lv: [1, 9], xp: [0, 9999], gold: [0, 9999], inh: [0, 9999], hand: [1, 20] };
export function setCharacter(r, cid, key, value) {
  const range = CHAR_RANGE[key], n = toInt(value);
  if (!range || n === null || !r.chars.some(c => c.id === cid)) return r;
  return edit(r, x => { x.chars.find(c => c.id === cid)[key] = clamp(n, ...range); });
}

// At most this many active characters (retired ones live in `retired`, not here).
export const MAX_CHARACTERS = 4;

// Next free character id: 'c1', 'c2', ...
function nextCharId(chars) {
  const used = new Set(chars.map(c => c.id));
  let n = 1;
  while (used.has('c' + n)) n++;
  return 'c' + n;
}

// Classes that can still be added: known classes not already played by an active character.
export function availableClasses(r) {
  const taken = new Set(r.chars.map(c => String(c.cls).toLowerCase()));
  return CLASSES.filter(c => !taken.has(c.name.toLowerCase()));
}

// Add a new level 1 character. Returns the same record when the class is unknown or already in play, the name is empty
// or there are already MAX_CHARACTERS characters. Cards, items and the modifier deck start empty (level-up flow comes later).
export function addCharacter(r, { cls, name }) {
  const klass = CLASSES.find(c => c.name.toLowerCase() === String(cls || '').toLowerCase());
  const nm = String(name || '').trim().slice(0, 30);
  if (!klass || !nm || r.chars.length >= MAX_CHARACTERS) return r;
  if (!availableClasses(r).some(c => c.i === klass.i)) return r;
  return edit(r, x => {
    x.chars.push({ id: nextCharId(x.chars), cls: klass.name, name: nm, lv: 1, xp: 0, gold: 0, inh: 0, traits: [],
      deck: [], disc: [], act: [], lost: [], bench: [], items: [] });
  });
}

export function renameCharacter(r, cid, name) {
  const nm = String(name || '').trim().slice(0, 30);
  if (!nm || !r.chars.some(c => c.id === cid)) return r;
  return edit(r, x => { x.chars.find(c => c.id === cid).name = nm; });
}

// --- ability card piles ----------------------------------------------------------------------------------------

export const CARD_AREAS = ['hand', 'discard', 'lost'];

// Move a card of the character's selected deck to an area. The hand is derived (deck minus discard, active and lost),
// so moving to 'hand' removes the card from every pile; moving to 'discard' or 'lost' also clears its active mark.
// Cards that are not in the deck are ignored.
export function moveCard(r, cid, cardId, area) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !CARD_AREAS.includes(area) || !c.deck.includes(cardId)) return r;
  const now = c.lost.includes(cardId) ? 'lost' : c.disc.includes(cardId) ? 'discard' : 'hand';
  if (now === area) return r;                     // already there (a hand card marked active stays active)
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === cid);
    const without = list => (list || []).filter(v => v !== cardId);
    ch.disc = without(ch.disc); ch.lost = without(ch.lost); ch.act = without(ch.act);
    if (area === 'discard') ch.disc.push(cardId);
    if (area === 'lost') ch.lost.push(cardId);
  });
}

// Mark a card in the hand as active (played in front of the player, not in the discard yet) or clear the mark.
export function setCardActive(r, cid, cardId, active) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !c.deck.includes(cardId)) return r;
  const inPile = c.disc.includes(cardId) || c.lost.includes(cardId);
  if (active && inPile) return r;                // active cards come from the hand
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === cid);
    ch.act = (ch.act || []).filter(v => v !== cardId);
    if (active) ch.act.push(cardId);
  });
}
