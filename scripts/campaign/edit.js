// Campaign record edits. Every function takes a record and returns a NEW record with `ver` bumped (the record
// passed in is never changed), so callers can keep history for undo and the server can later use `ver` for
// optimistic locking. Invalid input is clamped or ignored, never thrown. Pure data logic, no DOM, no storage.
import { SCENARIOS } from '../games/gh2_scenarios.js';
import { ITEMS } from '../games/gh2_items.js';
import { CLASSES } from '../games/gh2_classes.js';
import { SCN_STATE } from './record.js';
import { SPECIAL_TRAITS } from './traits.js';
import { EVENT_TABLE, PILES, frontOf, boxState, markKey, eventPlace, nextEvent, optionKeys, seatList, tally, cryptoRandom } from './events.js';

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
    if ('l' in patch) { const v = toInt(patch.l); if (v !== null) cur.l = clamp(v, -2, 3); }
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

export const EVENT_PLACES = ['', 'top', 'bottom', 'out', 'locked'];      // '' = the undefined part of the deck
const EVENT_KINDS_ = ['city', 'road'];

// Remove a card from every pile.
function unplace(x, kind, id) {
  for (const p of PILES) x.events[kind][p] = x.events[kind][p].filter(v => v !== id);
}
// Put a card into a pile. top: to the front (drawn first). bottom, out, locked: to the end.
function place(x, kind, id, where) {
  const list = x.events[kind][where];
  if (where === 'top') list.unshift(id); else if (list) list.push(id);
}

// Move a card to a pile (it leaves the pile it was in). Placing it where it already is changes nothing.
export function setEventPlace(r, kind, id, where) {
  if (!EVENT_KINDS_.includes(kind) || !EVENT_PLACES.includes(where) || !eventIds(kind).has(id)) return r;
  if (eventPlace(r, kind, id) === where) return r;
  return edit(r, x => { unplace(x, kind, id); if (where) place(x, kind, id, where); });
}

// Drop a card at a place: where is top, bottom, '' (deck), out or locked. For top and bottom `index` is the position in
// that pile (0 = first drawn); a card dropped into the deck, discarded or locked pile has no position (discarded and locked
// cards are appended, the deck is unordered). Dropping a card inside its own pile moves it to the index.
export function moveEventTo(r, kind, id, where, index = 0) {
  if (!EVENT_KINDS_.includes(kind) || !EVENT_PLACES.includes(where) || !eventIds(kind).has(id)) return r;
  const from = eventPlace(r, kind, id);
  const ordered = where === 'top' || where === 'bottom';
  if (from === where && !ordered) return r;
  return edit(r, x => {
    let i = Math.max(0, Math.trunc(Number(index)) || 0);
    if (from === where) {
      const old = x.events[kind][where].indexOf(id);
      if (old < i) i--;                              // the card itself no longer takes a place in front of the drop point
    }
    unplace(x, kind, id);
    if (!where) return;
    const list = x.events[kind][where];
    if (ordered) list.splice(Math.min(i, list.length), 0, id); else list.push(id);
  });
}

// Shuffle: the cards on top and on the bottom go back into the deck (the part with no known position, drawn at random).
// Discarded and locked cards stay where they are.
export function shuffleDeck(r, kind) {
  if (!EVENT_KINDS_.includes(kind) || !(r.events[kind].top.length || r.events[kind].bottom.length)) return r;
  return edit(r, x => { x.events[kind].top = []; x.events[kind].bottom = []; });
}

// Add locked cards to the deck (the part with no known position). Only locked cards are added: cards that are not in the
// card table of this deck, or are not locked, are skipped. Returns the new record.
export function addEventsToDeck(r, kind, ids) {
  if (!EVENT_KINDS_.includes(kind)) return r;
  const valid = eventIds(kind);
  const todo = [...new Set(ids)].filter(id => valid.has(id) && eventPlace(r, kind, id) === 'locked');
  if (!todo.length) return r;
  return edit(r, x => { for (const id of todo) unplace(x, kind, id); });
}

// Move a card up (-1) or down (+1) inside its pile (top, bottom or out).
export function moveEvent(r, kind, id, delta) {
  const where = eventPlace(r, kind, id);
  if (!['top', 'bottom', 'out'].includes(where)) return r;
  const i = r.events[kind][where].indexOf(id), j = i + (delta < 0 ? -1 : 1);
  if (j < 0 || j >= r.events[kind][where].length) return r;
  return edit(r, x => { const l = x.events[kind][where]; [l[i], l[j]] = [l[j], l[i]]; });
}

const eventIds = kind => new Set(EVENT_TABLE[kind].map(e => e.id));

// The event open in a deck (one per deck can be open at the same time), and helpers to set and clear it.
const openOf = (r, kind) => r.events.pend?.[kind];
function setOpen(x, kind, entry) { x.events.pend = { ...(x.events.pend || {}), [kind]: entry }; }
function clearOpen(x, kind) {
  delete x.events.pend[kind];
  if (!Object.keys(x.events.pend).length) delete x.events.pend;
}

// Draw the next card of a deck and open it for voting. Does nothing while this deck has an open event or is empty.
export function drawEvent(r, kind, rand) {
  if (!EVENT_KINDS_.includes(kind) || openOf(r, kind)) return r;
  const next = nextEvent(r, kind, rand);
  if (!next) return r;
  return edit(r, x => { unplace(x, kind, next.id); setOpen(x, kind, { kind, id: next.id, votes: {} }); });
}

// Open a card by number (a card read from the table, for a card that was drawn without the app). Any pile except locked.
export function openEvent(r, kind, id) {
  if (!EVENT_KINDS_.includes(kind) || openOf(r, kind) || !eventIds(kind).has(id) || eventPlace(r, kind, id) === 'locked') return r;
  return edit(r, x => { unplace(x, kind, id); setOpen(x, kind, { kind, id, votes: {} }); });
}

// Put the open event of a deck back on top without resolving it (an accidental draw).
export function cancelEvent(r, kind) {
  const p = openOf(r, kind);
  if (!p) return r;
  return edit(r, x => { clearOpen(x, kind); place(x, kind, p.id, 'top'); });
}

// A seat votes for an option key (or null to withdraw) in the open event of a deck. Seats can no longer vote once it is decided.
export function setVote(r, kind, seat, key) {
  const p = openOf(r, kind);
  if (!p) return r;
  const keys = optionKeys(frontOf(kind, p.id));
  if (!seatList(r).includes(seat) || (key !== null && !keys.includes(key))) return r;
  if (tally(p, keys, seatList(r)).state !== 'open') return r;
  return edit(r, x => {
    if (key === null) delete x.events.pend[kind].votes[seat]; else x.events.pend[kind].votes[seat] = key;
  });
}

// Count the missing votes as not voting. A tie that remains is settled by the random draw.
export function closeVote(r, kind) {
  const p = openOf(r, kind);
  return p && !p.closed ? edit(r, x => { x.events.pend[kind].closed = true; }) : r;
}

// Settle a tie by a random draw among the tied options. The result is stored, so it is the same for everybody.
export function rollTie(r, kind, rand = cryptoRandom) {
  const p = openOf(r, kind);
  if (!p) return r;
  const keys = optionKeys(frontOf(kind, p.id));
  const t = tally(p, keys, seatList(r));
  if (t.state !== 'tie' || !t.tied.length) return r;
  const pick = t.tied[Math.floor(rand() * t.tied.length)];
  return edit(r, x => { x.events.pend[kind].rnd = pick; });
}

// Tick or untick one box of a card (index into the card's boxes). The marks stay with the card in every pile.
export function toggleMark(r, kind, id, index) {
  if (!EVENT_KINDS_.includes(kind) || !Number.isInteger(index)) return r;
  const { boxes, ticked } = boxState(r, kind, id);
  if (index < 0 || index >= boxes.length) return r;
  return edit(r, x => {
    const key = markKey(kind, id);
    const next = ticked.includes(index) ? ticked.filter(i => i !== index) : [...ticked, index].sort((a, b) => a - b);
    if (next.length) x.events.marks[key] = next; else delete x.events.marks[key];
  });
}

// Free note on a card (empty text removes it). Limited to 500 characters.
export function setNote(r, kind, id, value) {
  if (!EVENT_KINDS_.includes(kind) || !eventIds(kind).has(id)) return r;
  const text = String(value ?? '').trim().slice(0, 500), key = markKey(kind, id);
  if ((r.events.notes?.[key] || '') === text) return r;
  return edit(r, x => { if (text) x.events.notes[key] = text; else delete x.events.notes[key]; });
}

// Finish the open event of a deck: place the card in a pile and log the result. The event must be decided.
export function finishEvent(r, kind, where) {
  const p = openOf(r, kind);
  if (!p || !['top', 'bottom', 'out'].includes(where)) return r;
  const keys = optionKeys(frontOf(kind, p.id));
  const t = tally(p, keys, seatList(r));
  if (t.state !== 'decided') return r;
  return edit(r, x => {
    const entry = { kind, id: p.id, opt: t.opt, votes: { ...p.votes }, place: where };
    if (t.random) entry.rnd = 1;
    if (p.closed) entry.closed = 1;
    x.evlog = [...(x.evlog || []), entry];
    clearOpen(x, kind);
    place(x, kind, p.id, where);
  });
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
// Switch one special trait of a character on or off. Unknown characters or traits are ignored.
export function setSpecialTrait(r, charId, key, on) {
  if (!SPECIAL_TRAITS.some(t => t.key === key)) return r;
  const c = r.chars.find(x => x.id === charId);
  if (!c) return r;
  const has = (c.special || []).includes(key);
  if (Boolean(on) === has) return r;
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === charId);
    const cur = ch.special || [];
    ch.special = on ? SPECIAL_TRAITS.map(t => t.key).filter(k => k === key || cur.includes(k)) : cur.filter(k => k !== key);
  });
}

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
