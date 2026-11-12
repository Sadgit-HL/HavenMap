// Campaign record edits. Every function takes a record and returns a NEW record with `ver` bumped (the record
// passed in is never changed), so callers can keep history for undo and the server can later use `ver` for
// optimistic locking. Invalid input is clamped or ignored, never thrown. Pure data logic, no DOM, no storage.
import { SCENARIOS, STICKERS } from '../games/gh2_scenarios.js';
import { ITEMS } from '../games/gh2_items.js';
import { CLASSES } from '../games/gh2_classes.js';
import { ALL_CLASSES } from './classList.js';
import { SCN_STATE, availableSet, CARD_ZONES, zoneOf, handList, cardLevel } from './record.js';
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

const PARTY_RANGE = { avg: [1, 9], diff: [-2, 4], insp: [0, 99] };
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

export function setImbuement(r, value) {
  const n = toInt(value);
  return n === null ? r : edit(r, x => { x.imb = clamp(n, 0, 80); });
}

export function setDonations(r, value) {
  const n = toInt(value);
  return n === null ? r : edit(r, x => { x.don = clamp(n, 0, 100); });
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

// --- campaign stickers ------------------------------------------------------------------------------------------

// Add a campaign sticker (record.stk holds the sticker names). Only known stickers, each at most once.
export function addSticker(r, name) {
  const st = STICKERS.find(s => s.name.toLowerCase() === String(name ?? '').trim().toLowerCase());
  if (!st || r.stk.some(v => String(v).toLowerCase() === st.name.toLowerCase())) return r;
  return edit(r, x => { x.stk = [...x.stk, st.name]; });
}

export function removeSticker(r, name) {
  const key = String(name ?? '').toLowerCase();
  if (!r.stk.some(v => String(v).toLowerCase() === key)) return r;
  return edit(r, x => { x.stk = x.stk.filter(v => String(v).toLowerCase() !== key); });
}

// --- unlocked classes ------------------------------------------------------------------------------------------

// record.cls holds the names of the classes unlocked in the campaign, record.avail (optional) the ones available.
// Unlocking a class makes it available; making a class unavailable locks it again.
const classOf = name => ALL_CLASSES.find(x => x.name.toLowerCase() === String(name ?? '').trim().toLowerCase());
const hasName = (list, name) => list.some(v => String(v).toLowerCase() === name.toLowerCase());
const without = (list, name) => list.filter(v => String(v).toLowerCase() !== name.toLowerCase());

export function addUnlockedClass(r, name) {
  const c = classOf(name);
  if (!c || hasName(r.cls, c.name)) return r;
  return edit(r, x => {
    x.cls = [...x.cls, c.name];
    if (x.avail && !hasName(x.avail, c.name)) x.avail = [...x.avail, c.name];
  });
}

export function removeUnlockedClass(r, name) {
  if (!hasName(r.cls, String(name ?? ''))) return r;
  return edit(r, x => { x.cls = without(x.cls, String(name)); });
}

export function setClassAvailable(r, name, on) {
  const c = classOf(name);
  if (!c) return r;
  const cur = availableSet(r).has(c.name.toLowerCase());
  if (cur === !!on) return r;
  return edit(r, x => {
    const list = ALL_CLASSES.map(k => k.name).filter(n => availableSet(r).has(n.toLowerCase()));
    x.avail = on ? [...list, c.name] : without(list, c.name);
    if (!on) x.cls = without(x.cls, c.name);
  });
}

// Whole editions at once (edition = a ClassList edition name). key 'avail' makes every class of the edition available
// (off: unavailable and locked), key 'unl' unlocks them (off: locks them).
export function setEditionClasses(r, edition, key, on) {
  const names = ALL_CLASSES.filter(c => c.edition === edition).map(c => c.name);
  if (!names.length || (key !== 'avail' && key !== 'unl')) return r;
  const lowered = new Set(names.map(n => n.toLowerCase()));
  const avail = availableSet(r);
  const unl = new Set(r.cls.map(n => String(n).toLowerCase()));
  const changed = names.some(n => (key === 'avail' ? avail.has(n.toLowerCase()) : unl.has(n.toLowerCase())) !== !!on);
  if (!changed) return r;
  return edit(r, x => {
    if (key === 'avail') {
      const keep = ALL_CLASSES.map(c => c.name).filter(n => avail.has(n.toLowerCase()) && !lowered.has(n.toLowerCase()));
      x.avail = on ? [...keep, ...names] : keep;
      if (!on) x.cls = x.cls.filter(n => !lowered.has(String(n).toLowerCase()));
    } else if (on) {
      x.cls = [...x.cls, ...names.filter(n => !unl.has(n.toLowerCase()))];
      if (x.avail) x.avail = [...x.avail, ...names.filter(n => !hasName(x.avail, n))];
    } else {
      x.cls = x.cls.filter(n => !lowered.has(String(n).toLowerCase()));
    }
  });
}

// --- retired characters ----------------------------------------------------------------------------------------

// record.retired = [{ cls, player, name, lv, perks, masteries, note }], entered by hand when a character retires.
const RETIRED_NUM = { lv: [1, 9], perks: [0, 99], masteries: [0, 99] };
export function addRetired(r) {
  return edit(r, x => { x.retired = [...x.retired, { cls: '', player: '', name: '', lv: 1, perks: 0, masteries: 0, note: null }]; });
}

export function setRetired(r, index, key, value) {
  const cur = r.retired[index];
  if (!cur) return r;
  let v;
  if (RETIRED_NUM[key]) {
    const n = toInt(value);
    if (n === null) return r;
    v = clamp(n, ...RETIRED_NUM[key]);
  } else if (key === 'cls') {
    const c = ALL_CLASSES.find(k => k.name.toLowerCase() === String(value ?? '').trim().toLowerCase());
    v = c ? c.name : '';
  } else if (key === 'player' || key === 'name') v = cleanName(value);
  else return r;
  if (cur[key] === v) return r;
  return edit(r, x => { x.retired[index] = { ...cur, [key]: v }; });
}

export function removeRetired(r, index) {
  if (!r.retired[index]) return r;
  return edit(r, x => { x.retired = x.retired.filter((_, i) => i !== index); });
}

// --- players --------------------------------------------------------------------------------------------------

// record.players = [{ seat, name }]; a seat number is how a player votes on events (see events.js seatList).
const cleanName = v => String(v ?? '').trim().slice(0, 40);
const nameTaken = (r, name, except) => r.players.some(p => p.seat !== except && p.name.toLowerCase() === name.toLowerCase());

export function addPlayer(r, name) {
  const n = cleanName(name);
  if (!n || nameTaken(r, n, -1)) return r;
  const used = new Set(r.players.map(p => p.seat));
  let seat = 0;
  while (used.has(seat)) seat++;
  return edit(r, x => { x.players = [...x.players, { seat, name: n }].sort((a, b) => a.seat - b.seat); });
}

export function renamePlayer(r, seat, name) {
  const n = cleanName(name);
  const p = r.players.find(q => q.seat === seat);
  if (!p || !n || p.name === n || nameTaken(r, n, seat)) return r;
  return edit(r, x => { x.players = x.players.map(q => (q.seat === seat ? { ...q, name: n } : q)); });
}

export function removePlayer(r, seat) {
  if (!r.players.some(p => p.seat === seat)) return r;
  return edit(r, x => { x.players = x.players.filter(p => p.seat !== seat); });
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

// --- resources -------------------------------------------------------------------------------------------------

// Override one resource link cell (scripts/games/resources.js' own RESOURCES[].{game}). An empty value clears the
// override, reverting to the shipped link. Only http(s) URLs are accepted (the value becomes an href).
export function setResourceLink(r, title, game, value) {
  const key = `${title}|${game}`;
  const v = String(value ?? '').trim();
  if (v && !/^https?:\/\//i.test(v)) return r;
  return edit(r, x => {
    if (v) x.resLinks[key] = v;
    else delete x.resLinks[key];
  });
}

// --- characters ----------------------------------------------------------------------------------------------

const CHAR_RANGE = { lv: [1, 9], xp: [0, 9999], gold: [0, 9999], inh: [0, 9999], hand: [1, 20] };
export function setCharacter(r, cid, key, value) {
  const range = CHAR_RANGE[key], n = toInt(value);
  if (!range || n === null || !r.chars.some(c => c.id === cid)) return r;
  return edit(r, x => { x.chars.find(c => c.id === cid)[key] = clamp(n, ...range); });
}

// The player who plays a character: seat = a seat number from record.players, or null for nobody.
export function setCharacterPlayer(r, cid, seat) {
  const c = r.chars.find(x => x.id === cid);
  if (!c) return r;
  const n = seat === null || seat === '' || seat === undefined ? null : toInt(seat);
  if (n !== null && !r.players.some(p => p.seat === n)) return r;
  if ((c.seat ?? null) === n) return r;
  return edit(r, x => {
    const t = x.chars.find(k => k.id === cid);
    if (n === null) delete t.seat; else t.seat = n;
  });
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
      deck: [], disc: [], act: [], lost: [], play: [null, null], hord: null, bench: [], items: [] });
  });
}

export function renameCharacter(r, cid, name) {
  const nm = String(name || '').trim().slice(0, 30);
  if (!nm || !r.chars.some(c => c.id === cid)) return r;
  return edit(r, x => { x.chars.find(c => c.id === cid).name = nm; });
}

// --- ability card piles ----------------------------------------------------------------------------------------

export const CARD_AREAS = CARD_ZONES;            // hand, active, play1, play2, discard, lost

// Move a card of the character's selected deck to a zone. A card is in one zone only. Rules:
//  - play1 and play2 take cards from the hand only; a card already in a play slot can go to the other slot (the two swap, or it
//    moves into the empty slot). A card that enters an occupied slot sends that slot's card back to the hand.
//  - a card entering a play slot is face down; leaving the slot drops the face state.
//  - the manual hand order (hord) follows: cards leaving the hand are removed from it, cards entering the hand go to its end.
//  - opts.before sets the place in the hand: a card id puts the card in front of that card, null at the end (the hand then follows a
//    manual order, hord); left out, a card entering the hand keeps the automatic initiative order (or goes to the end of a manual order).
// Cards that are not in the deck, unknown zones and moves the rules forbid return the record unchanged.
export function moveCard(r, cid, cardId, dest, opts = {}) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !CARD_ZONES.includes(dest) || !c.deck.includes(cardId)) return r;
  const now = zoneOf(c, cardId);
  const pos = dest === 'hand' && 'before' in opts ? opts.before : undefined;      // undefined = no place given
  if (pos === cardId) return r;
  if (now === dest && pos === undefined) return r;
  const order = pos !== undefined ? handList(c).filter(id => id !== cardId) : null;
  if (order) { let i = pos === null ? order.length : order.indexOf(pos); if (i < 0) i = order.length; order.splice(i, 0, cardId); if (now === 'hand' && !Array.isArray(c.hord) && order.join() === handList(c).join()) return r; }
  const toPlay = dest === 'play1' || dest === 'play2', inPlay = now === 'play1' || now === 'play2';
  if (toPlay && now !== 'hand' && !inPlay) return r;
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === cid);
    const play = ch.play || [null, null];
    const toHand = id => { if (Array.isArray(ch.hord) && !ch.hord.includes(id)) ch.hord.push(id); };
    if (toPlay && inPlay) {
      ch.play = [play[1], play[0]];
      return;
    }
    const without = list => (list || []).filter(v => v !== cardId);
    ch.disc = without(ch.disc); ch.lost = without(ch.lost); ch.act = without(ch.act);
    ch.play = play.map(p => (p && p.id === cardId ? null : p));
    if (Array.isArray(ch.hord)) ch.hord = without(ch.hord);
    if (dest === 'discard') ch.disc.push(cardId);
    else if (dest === 'lost') ch.lost.push(cardId);
    else if (dest === 'active') ch.act.push(cardId);
    else if (dest === 'hand') { if (order) ch.hord = order; else toHand(cardId); }
    else {
      const i = dest === 'play1' ? 0 : 1;
      if (ch.play[i]) toHand(ch.play[i].id);
      ch.play[i] = { id: cardId, up: false };
    }
  });
}

// Turn the card in a play slot (0 = slot 1, 1 = slot 2) face up or down.
export function flipPlayCard(r, cid, slot) {
  const c = r.chars.find(x => x.id === cid), i = Number(slot);
  if (!c || !(i === 0 || i === 1) || !c.play?.[i]) return r;
  return edit(r, x => { const p = x.chars.find(y => y.id === cid).play[i]; p.up = !p.up; });
}

// Sort the hand: 'ini' = automatic mode, always lowest initiative first (clears the manual order); 'lvl' = a one-time order by card level,
// then initiative, which stays until the hand is reordered or 'ini' is chosen.
export function sortHand(r, cid, mode) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !['ini', 'lvl'].includes(mode)) return r;
  if (mode === 'ini') return Array.isArray(c.hord) ? edit(r, x => { x.chars.find(y => y.id === cid).hord = null; }) : r;
  const cur = handList({ ...c, hord: null });
  const order = [...cur].sort((a, b) => cardLevel(a) - cardLevel(b));            // stable: initiative order inside a level
  if (order.join() === (Array.isArray(c.hord) ? c.hord : []).join()) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid).hord = order; });
}

// Put a hand card into the active area, or clear it from there (back to the hand). Kept for older callers; moveCard does the work.
export function setCardActive(r, cid, cardId, active) {
  const c = r.chars.find(x => x.id === cid);
  if (!c) return r;
  if (active) return moveCard(r, cid, cardId, zoneOf(c, cardId) === 'hand' ? 'active' : zoneOf(c, cardId));
  return zoneOf(c, cardId) === 'active' ? moveCard(r, cid, cardId, 'hand') : r;
}
