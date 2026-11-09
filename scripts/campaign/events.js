// Event deck logic without any record changes (those live in edit.js): which cards can be drawn, how a vote is
// counted and when it is decided. Pure functions, no DOM, no storage.
//
// Piles of one deck (record.events[kind]):
//   top      ordered, first entry is drawn first (a card placed on top goes to the front)
//   bottom   ordered, first entry is drawn first among the bottom cards (a card placed on the bottom goes to the end)
//   out      discarded, in the order they were discarded (newest last)
//   locked   not part of the deck yet, no order
//   (none)   "undefined": every other card, drawn at random
// Draw order: first top card, else a random undefined card, else the first bottom card.
import { CITY_EVENTS, ROAD_EVENTS } from '../games/gh2_events.js';
import { EVENT_FRONT } from '../games/gh2_event_front.js';
import { EVENT_BOXES } from '../games/gh2_event_boxes.js';   // the card fronts; the backs (outcomes) are loaded only when revealed

// Front of a card ({ n, o: [{ l, t, r }], r }) or undefined.
export const frontOf = (kind, id) => EVENT_FRONT[kind]?.[id];

// Boxes a card has to tick: { boxes: [{ l?, s? }], rule?, ticked: [index], complete } ; boxes is [] for a card without boxes.
export const markKey = (kind, id) => `${kind}:${id}`;
export function boxState(r, kind, id) {
  const cfg = EVENT_BOXES[kind]?.[id];
  const boxes = cfg?.b || [];
  const ticked = [...(r.events.marks?.[markKey(kind, id)] || [])].filter(i => i >= 0 && i < boxes.length).sort((a, b) => a - b);
  return { boxes, rule: cfg?.rule, ticked, complete: boxes.length > 0 && ticked.length === boxes.length };
}
export const noteOf = (r, kind, id) => r.events.notes?.[markKey(kind, id)] || '';

export const EVENT_KINDS = ['city', 'road'];
export const EVENT_TABLE = { city: CITY_EVENTS, road: ROAD_EVENTS };
export const PILES = ['top', 'bottom', 'out', 'locked'];

// Cards in no pile: the part of the deck with no known position.
export function eventPool(r, kind) {
  const st = r.events[kind];
  const used = new Set(PILES.flatMap(p => st[p] || []));
  return EVENT_TABLE[kind].map(e => e.id).filter(id => !used.has(id));
}

// The pile a card is in, '' for the undefined part of the deck.
export function eventPlace(r, kind, id) {
  return PILES.find(p => (r.events[kind][p] || []).includes(id)) || '';
}

// Random number in [0, 1). The default uses the browser's crypto source; tests pass their own.
export const cryptoRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

// Which card a draw takes: { id, from } or null when no card is left. Does not change anything.
export function nextEvent(r, kind, rand = cryptoRandom) {
  const st = r.events[kind];
  if (st.top.length) return { id: st.top[0], from: 'top' };
  const pool = eventPool(r, kind);
  if (pool.length) return { id: pool[Math.floor(rand() * pool.length)], from: '' };
  if (st.bottom.length) return { id: st.bottom[0], from: 'bottom' };
  return null;
}

// Option keys of a card front: the labels (A, B, C), "A" for a single unlabelled option.
export const optionKeys = front => (front?.o || []).map((o, i) => o.l || String.fromCharCode(65 + i));

// Seat numbers that vote: the record's players, else four seats.
export const seatList = r => (r.players?.length ? r.players.map(p => p.seat) : [0, 1, 2, 3]);

/*
Vote result for an open event `pend` (the entry of one deck: { kind, id, votes: { seat: label }, closed?, rnd? }).
  keys   the option keys of the card, seats the seat numbers that may vote
  state  'open'     not decided yet
         'decided'  one option wins: `opt` (by lead, by a click on the only option, by a closed vote, or by the random draw `rnd`)
         'tie'      everyone voted (or the vote was closed) and several options share the lead: `tied`
  A vote is decided as soon as the leader cannot be caught up: lead > seats that have not voted yet.
  Closing a vote counts the missing seats as not voting.
*/
export function tally(pend, keys, seats) {
  const counts = Object.fromEntries(keys.map(k => [k, 0]));
  let voted = 0;
  for (const s of seats) {
    const v = pend?.votes?.[s];
    if (v in counts) { counts[v]++; voted++; }
  }
  const remaining = pend?.closed ? 0 : seats.length - voted;
  const sorted = [...keys].sort((a, b) => counts[b] - counts[a]);
  const top = counts[sorted[0]] ?? 0, second = counts[sorted[1]] ?? 0;
  const leaders = keys.filter(k => counts[k] === top);
  const base = { counts, voted, remaining, tied: [] };
  // A card with a single option has nothing to choose: the outcome shows once somebody clicks the option (or the vote is closed).
  if (keys.length === 1) return voted > 0 || pend?.closed ? { ...base, state: 'decided', opt: keys[0] } : { ...base, state: 'open' };
  if (pend?.rnd && keys.includes(pend.rnd)) return { ...base, state: 'decided', opt: pend.rnd, random: true };
  if (top > 0 && leaders.length === 1 && top - second > remaining) return { ...base, state: 'decided', opt: leaders[0] };
  if (remaining === 0) return leaders.length === 1 && top > 0
    ? { ...base, state: 'decided', opt: leaders[0] }
    : { ...base, state: 'tie', tied: leaders };
  return { ...base, state: 'open' };
}

// Where a finished card goes by default: Top when an outcome that applies says so (outcome field p), Bottom (the last position of the deck) when it returns to the deck, else Discarded.
// It returns when the card, the chosen option or an outcome that applies says "return to deck" (the source data gives only one
// case of "back on top of the deck", city 55 option C, flagged p=top: every other returned card goes to the end of the bottom pile). An outcome that applies and removes the card wins.
// It also returns when every outcome that could apply returns it, even if the players still have to pick the outcome (an
// option with a single outcome that needs a payment, for example).
// `applicable` is the list from outcomes.js applicableOutcomes. Outcomes that are not met do not count.
export function defaultPlace(front, opt, applicable = []) {
  const o = (front?.o || []).find((x, i) => (x.l || String.fromCharCode(65 + i)) === opt);
  const sure = applicable.filter(a => a.state === 'always' || a.state === 'met' || a.state === 'otherwise');
  if (sure.some(a => a.o.x)) return 'out';
  if (sure.some(a => a.o.r && a.o.p === 'top')) return 'top';        // "Place this card back on top of the deck"
  const possible = applicable.filter(a => a.state !== 'unmet');
  const always = possible.length > 0 && possible.every(a => a.o.r && !a.o.x);
  return front?.r || o?.r || sure.some(a => a.o.r) || always ? 'bottom' : 'out';
}
