// Campaign record edits. Every function takes a record and returns a NEW record with `ver` bumped (the record
// passed in is never changed), so callers can keep history for undo and the server can later use `ver` for
// optimistic locking. Invalid input is clamped or ignored, never thrown. Pure data logic, no DOM, no storage.
import { SCENARIOS, STICKERS } from '../games/gh2_scenarios.js';
import { ITEMS } from '../games/gh2_items.js';
import { CLASSES } from '../games/gh2_classes.js';
import { ALL_CLASSES } from './classList.js';
import { SCN_STATE, availableSet, CARD_ZONES, zoneOf, handList, cardLevel, ownedCards, pendingPicks, classByName, SLOT_ORDER, itemFits, itemsInUse, ownsItem } from './record.js';
import { CARDS } from '../games/gh2_cards.js';
import { SPECIAL_TRAITS } from './traits.js';
import { tokenDefs, markerTokens, MARK_STICKERS } from './classTokens.js';
import { perkList } from './amdDeck.js';
import { MASTERIES } from '../games/masteries.js';
import { BATTLE_GOALS } from '../games/battle_goals.js';
import { PERSONAL_QUESTS } from '../games/gh2_quests.js';
import { GH2_PQ } from '../games/gh2_pq_text.js';
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
      deck: [], disc: [], act: [], lost: [], play: [null, null], hord: null, tok: {}, bgo: null, pqo: null, pqc: {}, notes: '', bench: [], items: [] });
  });
}

// A character takes another class and starts over as a new character: name (the class name), player, level, XP, gold, ability cards (every zone),
// items, perks and masteries, markers, class tokens, hand size, the old modifier deck, and the battle goals and personal quests the character holds
// (they go back into their decks). Kept: the inherited perks, the event traits and the notes. The level 1 and X ability cards of the new class are
// unlocked (they wait in the pool; the hand is chosen in the hand editor). The enhancement log is a record of the campaign (each entry names its
// class), so it is not touched. Unknown classes, a class another character plays and the same class are ignored.
export function changeCharacterClass(r, cid, cls) {
  const c = r.chars.find(x => x.id === cid), klass = CLASSES.find(k => k.name.toLowerCase() === String(cls || '').toLowerCase());
  if (!c || !klass || klass.name.toLowerCase() === String(c.cls).toLowerCase()) return r;
  if (r.chars.some(x => x.id !== cid && String(x.cls).toLowerCase() === klass.name.toLowerCase())) return r;
  const start = CARDS.filter(k => k.cls === klass.i && cardLevel(k.id) < 2).map(k => k.id);                 // level 1 and X
  return edit(r, x => {
    const t = x.chars.find(k => k.id === cid);
    t.cls = klass.name; t.name = klass.name; delete t.seat;
    t.lv = 1; t.xp = 0; t.gold = 0; t.traits = [];
    t.deck = []; t.bench = start; t.disc = []; t.act = []; t.lost = []; t.play = [null, null]; t.hord = null; t.items = []; t.own = [];
    t.tok = {}; t.mk = {}; t.mp = {}; t.pk = { perks: [], boxes: {}, ms: [] };
    t.bgo = null; t.pqo = null; t.pqc = {};
    for (const map of [x.bgs, x.pq]) for (const k of Object.keys(map || {})) if (map[k] && map[k].c === cid) delete map[k];
    delete t.hand; delete t.am;
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

// --- journal: battle goals, personal quests, notes ---------------------------------------------------------------

const BG_SLUGS = new Set(BATTLE_GOALS.map(g => g.slug));
const PQ_SLUGS = new Set(PERSONAL_QUESTS.map(q => q.slug));
export const CARD_STATUS = ['deck', 'mine', 'other', 'done'];     // a goal or quest: in the deck, held by this character, held by another player, completed

// Where a goal or quest of the campaign (map = r.bgs or r.pq) is as seen from one character.
export function holdStatus(map, cid, slug) {
  const e = map?.[slug];
  if (!e) return 'deck';
  if (e.c !== cid) return 'other';
  return e.st === 'done' ? 'done' : 'mine';
}
export const goalDeck = r => BATTLE_GOALS.map(g => g.slug).filter(sl => !r.bgs[sl]);
export const questDeck = r => PERSONAL_QUESTS.map(q => q.slug).filter(sl => !r.pq[sl]);

// What the pure functions need from outside: the random draw is made by the caller and passed in as slugs, so everything here stays testable.
function offer(r, cid, field, slugs, deck, max) {
  const c = r.chars.find(x => x.id === cid);
  const list = Array.isArray(slugs) ? [...new Set(slugs)] : [];
  if (!c || !list.length || list.length > max || !list.every(sl => deck.includes(sl))) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid)[field] = list; });
}
function keep(r, cid, field, mapKey, slug) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !Array.isArray(c[field]) || !c[field].includes(slug) || r[mapKey][slug]) return r;
  return edit(r, x => { x[mapKey][slug] = { st: 'mine', c: cid }; x.chars.find(y => y.id === cid)[field] = null; });
}
function setStatus(r, cid, mapKey, slugs, slug, status) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !slugs.has(slug) || !CARD_STATUS.includes(status) || holdStatus(r[mapKey], cid, slug) === status) return r;
  return edit(r, x => {
    if (status === 'deck') delete x[mapKey][slug];
    else x[mapKey][slug] = { st: status === 'done' ? 'done' : 'mine', c: status === 'other' ? null : cid };
  });
}
export const offerBattleGoals = (r, cid, slugs) => offer(r, cid, 'bgo', slugs, goalDeck(r), 3);
export const keepBattleGoal = (r, cid, slug) => keep(r, cid, 'bgo', 'bgs', slug);
export const setBattleGoalStatus = (r, cid, slug, status) => setStatus(r, cid, 'bgs', BG_SLUGS, slug, status);
export const offerQuests = (r, cid, slugs) => offer(r, cid, 'pqo', slugs, questDeck(r), 2);
export const keepQuest = (r, cid, slug) => keep(r, cid, 'pqo', 'pq', slug);
export const setQuestStatus = (r, cid, slug, status) => setStatus(r, cid, 'pq', PQ_SLUGS, slug, status);

// Drop the goals or quests that were drawn and not kept ('bgo' or 'pqo').
export function clearOffer(r, cid, field) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !['bgo', 'pqo'].includes(field) || !c[field]) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid)[field] = null; });
}
// A new scenario: every battle goal goes back to the deck and the open offers are dropped.
export function returnAllBattleGoals(r) {
  if (!Object.keys(r.bgs).length && !r.chars.some(c => c.bgo)) return r;
  return edit(r, x => { x.bgs = {}; x.chars.forEach(c => { c.bgo = null; }); });
}

// Progress of one requirement of the quest this character holds. A requirement is locked until the ones it follows are complete.
// All requirements complete turns a held quest into a completed one, and un-ticking one turns it back.
export function setQuestCount(r, cid, slug, index, value) {
  const c = r.chars.find(x => x.id === cid), q = GH2_PQ[slug], i = toInt(index), n = toInt(value);
  if (!c || !q || i === null || n === null || !q.reqs[i] || !['mine', 'done'].includes(holdStatus(r.pq, cid, slug))) return r;
  const cur = (c.pqc?.[slug] || []).slice();
  while (cur.length < q.reqs.length) cur.push(0);
  const done = k => (cur[k] || 0) >= q.reqs[k].n;
  if (!q.reqs[i].after.every(done)) return r;
  const v = clamp(n, 0, q.reqs[i].n);
  if (cur[i] === v) return r;
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === cid);
    cur[i] = v;
    ch.pqc = { ...(ch.pqc || {}), [slug]: cur };
    const all = q.reqs.every((rq, k) => cur[k] >= rq.n);
    if (all && x.pq[slug].st === 'mine') x.pq[slug].st = 'done';
    else if (!all && x.pq[slug].st === 'done') x.pq[slug].st = 'mine';
  });
}

export function setNotes(r, cid, text) {
  const c = r.chars.find(x => x.id === cid), t = String(text ?? '').slice(0, 6000);
  if (!c || (c.notes || '') === t) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid).notes = t; });
}

// --- enhancements -----------------------------------------------------------------------------------------------

const enhText = v => { const t = String(v ?? '').trim().slice(0, 60); return t || null; };

// Log an enhancement of a card: { cls, card, top, bottom, price? }. A class and a card are required; price is gold (0 to 9999).
export function addEnhancement(r, { cls, card, top, bottom, price }) {
  const c = String(cls ?? '').trim().slice(0, 40), cd = enhText(card);
  if (!c || !cd) return r;
  const p = toInt(price);
  return edit(r, x => { x.enh.push({ cls: c, card: cd, top: enhText(top), bottom: enhText(bottom), ...(p !== null && p >= 0 ? { price: Math.min(p, 9999) } : {}) }); });
}

export function removeEnhancement(r, index) {
  const i = toInt(index);
  if (i === null || i < 0 || i >= r.enh.length) return r;
  return edit(r, x => { x.enh.splice(i, 1); });
}

// Price in gold of one enhancement; an empty value clears it.
export function setEnhancementPrice(r, index, price) {
  const i = toInt(index), blank = String(price ?? '').trim() === '', p = toInt(price);
  if (i === null || i < 0 || i >= r.enh.length || (!blank && (p === null || p < 0))) return r;
  const next = blank ? undefined : Math.min(p, 9999);
  if (r.enh[i].price === next) return r;
  return edit(r, x => { if (next === undefined) delete x.enh[i].price; else x.enh[i].price = next; });
}

// --- items of a character ---------------------------------------------------------------------------------------

// State of an item of a character: 0 available, 1 spent, 2 consumed.
export function setItemState(r, cid, itemId, state) {
  const c = r.chars.find(x => x.id === cid), s = toInt(state);
  if (!c || s === null || s < 0 || s > 2) return r;
  const i = c.items.findIndex(it => String(it.id) === String(itemId));
  if (i < 0 || c.items[i].s === s) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid).items[i].s = s; });
}

// The items a character carries: unlocked items only, one copy each, the copies of the shop and the slot limits respected (what does not fit is
// dropped, in the order given). Items kept keep their state, new ones start available.
export function setEquippedItems(r, cid, ids) {
  const c = r.chars.find(x => x.id === cid);
  if (!c) return r;
  const owned = new Set((c.own || []).map(String));                             // only owned items can be equipped
  const keep = [], chosen = [];
  for (const raw of [...new Set((ids || []).map(String))]) {
    const item = itemById.get(raw);
    if (!item || !r.items.unl.includes(item.id)) continue;
    if (!owned.has(raw)) continue;
    const mine = c.items.some(it => String(it.id) === raw);
    if (!itemFits(chosen, item, c.lv)) continue;
    chosen.push(item);
    keep.push(c.items.find(it => String(it.id) === raw) || { id: item.id, st: [false, false, false], s: 0 });
  }
  if (JSON.stringify(keep.map(i => i.id)) === JSON.stringify(c.items.map(i => i.id))) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid).items = keep; });
}

// Give an unlocked item with a copy left in the shop to a character: it joins the owned items (not equipped yet).
export function giveItem(r, cid, itemId) {
  const c = r.chars.find(x => x.id === cid), item = itemById.get(String(itemId));
  if (!c || !item || !r.items.unl.includes(item.id) || ownsItem(c, item.id) || itemsInUse(r, item) >= (item.n || 0)) return r;
  return edit(r, x => { const t = x.chars.find(y => y.id === cid); t.own = [...(t.own || []), item.id]; });
}

// Take an item away from a character (owned and equipped): the copy goes back to the shop.
export function returnItem(r, cid, itemId) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !ownsItem(c, itemId)) return r;
  return edit(r, x => { const t = x.chars.find(y => y.id === cid); t.own = (t.own || []).filter(i => String(i) !== String(itemId)); t.items = t.items.filter(it => String(it.id) !== String(itemId)); });
}

// Order the items of a character by slot (head, body, hands, legs, small), then by number.
export function sortItems(r, cid) {
  const c = r.chars.find(x => x.id === cid), rank = { head: 0, body: 1, '1H': 2, '2H': 2, legs: 3, small: 4 };
  if (!c) return r;
  const key = it => { const item = itemById.get(String(it.id)); return [rank[item?.slot] ?? 9, Number(it.id) || 0]; };
  const sorted = [...c.items].sort((a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1]);
  if (sorted.every((it, i) => it === c.items[i])) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid).items = sorted; });
}

// --- card pool and hand selection -------------------------------------------------------------------------------

// Level up: take a card of the class of level 2 up to the character's level into the pool (it is owned, not yet in the deck). One pick per level.
export function addPoolCard(r, cid, cardId) {
  const c = r.chars.find(x => x.id === cid), id = toInt(cardId), card = CARDS.find(k => k.id === id);
  if (!c || !card || card.cls !== classByName(c.cls)?.i || ownedCards(c).includes(id)) return r;
  const lv = cardLevel(id);
  if (lv < 2 || lv > (c.lv || 1) || lv >= 99 || pendingPicks(c) < 1) return r;
  return edit(r, x => { x.chars.find(y => y.id === cid).bench.push(id); });
}

// Take a picked card (level 2 and up) out of the pool again, from wherever it lies.
export function removePoolCard(r, cid, cardId) {
  const c = r.chars.find(x => x.id === cid), id = toInt(cardId), lv = cardLevel(id);
  if (!c || !ownedCards(c).includes(id) || lv < 2 || lv >= 99) return r;
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === cid), out = l => l.filter(n => n !== id);
    ch.deck = out(ch.deck); ch.bench = out(ch.bench); ch.disc = out(ch.disc); ch.lost = out(ch.lost); ch.act = out(ch.act);
    ch.play = ch.play.map(p => (p && p.id === id ? null : p)); if (ch.hord) ch.hord = out(ch.hord);
  });
}

// The hand for a scenario: the chosen owned cards become the deck (all in the hand), the other owned cards wait in the bench, and the scenario
// cards (discard, lost, active, play slots) are reset. At most the hand size of the character (when set).
export function applyHand(r, cid, ids) {
  const c = r.chars.find(x => x.id === cid), own = c && ownedCards(c);
  if (!c) return r;
  const pick = [...new Set((ids || []).map(Number))].filter(id => own.includes(id)), limit = c.hand || 0;
  if (!pick.length || (limit && pick.length > limit)) return r;
  const deck = own.filter(id => pick.includes(id));
  return edit(r, x => {
    const ch = x.chars.find(y => y.id === cid);
    ch.deck = deck; ch.bench = own.filter(id => !pick.includes(id)); ch.disc = []; ch.lost = []; ch.act = []; ch.play = [null, null]; ch.hord = null;
  });
}

// --- perks and masteries ----------------------------------------------------------------------------------------

// Tick or untick one checkbox of a perk (index into the class perk list). A perk with several boxes (double, triple) counts once all
// its boxes are ticked and stops counting as soon as one is unticked (the rule of scripts/attackMods.js).
export function togglePerkBox(r, cid, index, box = 0) {
  const c = r.chars.find(x => x.id === cid), i = toInt(index), b = toInt(box), perk = c && perkList(c.cls)[i];
  if (!perk || b === null || b < 0 || b >= perk.boxes) return r;
  return edit(r, x => {
    const pk = x.chars.find(y => y.id === cid).pk, full = (1 << perk.boxes) - 1, taken = pk.perks.includes(i);
    const m = (taken ? full : pk.boxes[i] || 0) ^ (1 << b);
    if ((m === full) !== taken) pk.perks = m === full ? [...pk.perks, i].sort((p, q) => p - q) : pk.perks.filter(n => n !== i);
    if (m && m !== full) pk.boxes[i] = m; else delete pk.boxes[i];
  });
}

// A mastery of the class (index into MASTERIES[class]) achieved or not.
export function setMastery(r, cid, index, on) {
  const c = r.chars.find(x => x.id === cid), i = toInt(index), n = c ? (MASTERIES[c.cls] || []).length : 0;
  if (!c || i === null || i < 0 || i >= n || c.pk.ms.includes(i) === !!on) return r;
  return edit(r, x => { const pk = x.chars.find(y => y.id === cid).pk; pk.ms = on ? [...pk.ms, i].sort((p, q) => p - q) : pk.ms.filter(m => m !== i); });
}

// A class token of a character: a count (0 to 99) or, for a token with states, the state index. Keys the class does not have are ignored.
export function setToken(r, cid, key, value) {
  const c = r.chars.find(x => x.id === cid);
  const d = c && tokenDefs(c.cls).find(t => t.k === key), n = toInt(value);
  if (!d || n === null) return r;
  const v = d.states ? clamp(n, 0, d.states.length - 1) : clamp(n, 0, 99);
  if ((c.tok?.[key] || 0) === v) return r;
  return edit(r, x => { const ch = x.chars.find(y => y.id === cid); ch.tok = { ...(ch.tok || {}), [key]: v }; });
}

// Turn the card in a play slot (0 = slot 1, 1 = slot 2) face up or down.
export function flipPlayCard(r, cid, slot) {
  const c = r.chars.find(x => x.id === cid), i = Number(slot);
  if (!c || !(i === 0 || i === 1) || !c.play?.[i]) return r;
  return edit(r, x => { const p = x.chars.find(y => y.id === cid).play[i]; p.up = !p.up; });
}

// Sort the hand: 'ini' = automatic mode, always lowest initiative first (clears the manual order); 'lvl' = a one-time order by card level,
// (level 1, then X, then 2 to 9), then initiative, which stays until the hand is reordered or 'ini' is chosen.
export function sortHand(r, cid, mode) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !['ini', 'lvl'].includes(mode)) return r;
  if (mode === 'ini') return Array.isArray(c.hord) ? edit(r, x => { x.chars.find(y => y.id === cid).hord = null; }) : r;
  const cur = handList({ ...c, hord: null });
  const key = id => { const l = cardLevel(id); return l === 0 ? 1.5 : l; };         // the X cards come right after level 1
  const order = [...cur].sort((a, b) => key(a) - key(b));                          // stable: initiative order inside a level
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

// --- markers on ability cards and items ('c:<card id>' or 'i:<item id>'; x and y in percent of the card) -----------------------------------------
const markKeyOk = (c, key) => (/^c:\d+$/.test(key) && [...c.deck, ...c.bench].includes(Number(key.slice(2)))) || (/^i:\w+$/.test(key) && c.items.some(it => `i:${it.id}` === key));
const pct = v => Math.round(clamp(Number(v), 0, 100) * 10) / 10;

export function addMarker(r, cid, key, m) {
  const c = r.chars.find(x => x.id === cid);
  if (!c || !markKeyOk(c, key) || !m || !Number.isFinite(Number(m.x)) || !Number.isFinite(Number(m.y))) return r;
  if (!(m.s ? MARK_STICKERS.includes(m.k) : markerTokens(c.cls).includes(m.k))) return r;
  return edit(r, x => { const ch = x.chars.find(y => y.id === cid); (ch.mk[key] = ch.mk[key] || []).push({ k: m.k, ...(m.s ? { s: 1 } : {}), x: pct(m.x), y: pct(m.y) }); });
}

export function moveMarker(r, cid, key, i, px, py) {
  const c = r.chars.find(x => x.id === cid), m = c?.mk?.[key]?.[i];
  if (!m || !Number.isFinite(Number(px)) || !Number.isFinite(Number(py)) || (m.x === pct(px) && m.y === pct(py))) return r;
  return edit(r, x => { const t = x.chars.find(y => y.id === cid).mk[key][i]; t.x = pct(px); t.y = pct(py); });
}

export function removeMarker(r, cid, key, i) {
  const c = r.chars.find(x => x.id === cid);
  if (!c?.mk?.[key]?.[i]) return r;
  return edit(r, x => { const ch = x.chars.find(y => y.id === cid); ch.mk[key].splice(i, 1); if (!ch.mk[key].length) delete ch.mk[key]; });
}

export function clearMarkers(r, cid, key) {
  const c = r.chars.find(x => x.id === cid);
  if (!c?.mk?.[key]) return r;
  return edit(r, x => { delete x.chars.find(y => y.id === cid).mk[key]; });
}

// Price of the enhancements shown for a card in the Enhancements table (rows derived from the stickers on the card), key 'c:<card id>'.
export function setMarkPrice(r, cid, key, price) {
  const c = r.chars.find(x => x.id === cid), raw = String(price ?? '').trim(), p = raw === '' ? null : toInt(raw);
  if (!c || !/^c:\d+$/.test(key) || (raw !== '' && (p === null || p < 0))) return r;
  if ((c.mp?.[key] ?? null) === (p === null ? null : Math.min(p, 9999))) return r;
  return edit(r, x => { const ch = x.chars.find(y => y.id === cid); ch.mp = ch.mp || {}; if (p === null) delete ch.mp[key]; else ch.mp[key] = Math.min(p, 9999); });
}
