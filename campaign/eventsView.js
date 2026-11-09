// The Events tab: draw a card, vote for an option, show the winning outcome, place the card, edit the piles.
// Pure record changes live in scripts/campaign/edit.js and scripts/campaign/events.js; this file only draws and
// forwards clicks. The card backs (outcome text) are a separate module, loaded the first time an option is revealed.
import { escapeHtml as esc } from '../scripts/escape.js';
import * as ed from '../scripts/campaign/edit.js';
import {
  EVENT_KINDS, EVENT_TABLE, eventPool, eventPlace, frontOf, optionKeys, seatList, tally, defaultPlace, boxState, noteOf,
} from '../scripts/campaign/events.js';
import { applicableOutcomes } from '../scripts/campaign/outcomes.js';

const KIND_NAME = { city: 'City', road: 'Road' };
const PILE_NAME = { top: 'Top', bottom: 'Bottom', out: 'Discarded', locked: 'Locked' };
const STORE = 'havenmap.campaign.events';

const NOTES = false;            // card notes are hidden for now; the record keeps them and edit.js can still set them
const SHUFFLE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0l0 0a2 2 0 0 1 0 3L8 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="currentColor" stroke-width="2"/></svg>';
let lastPend = '';             // the open event the tab was last switched for
const evState = { kind: 'city', seat: 0, filter: 'deck', view: null, peek: null, addMsg: '' };   // view: { kind, id } of the discarded card shown; filter: deck | out | locked | all
let api = { render() {}, record: () => null, commit() {}, editing: () => false };
let backData = null, backLoading = null;

export function evInit(hooks) {
  api = hooks;
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (s && EVENT_KINDS.includes(s.kind)) evState.kind = s.kind;
    if (s && Number.isInteger(s.seat)) evState.seat = s.seat;
    if (s && ['deck', 'out', 'locked', 'all'].includes(s.filter)) evState.filter = s.filter;
  } catch { /* ignore */ }
}
function saveState() {
  try { localStorage.setItem(STORE, JSON.stringify({ kind: evState.kind, seat: evState.seat, filter: evState.filter })); } catch { /* ignore */ }
}

// The outcome text is only fetched when an option has been decided.
function ensureBack() {
  if (backData || backLoading) return;
  backLoading = import('../scripts/games/gh2_event_back.js')
    .then(m => { backData = m.EVENT_BACK; api.render(); })
    .catch(() => { backLoading = null; });
}

const paras = t => String(t || '').split(/\n+/).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
const seatName = (r, seat) => r.players?.find(p => p.seat === seat)?.name || `Seat ${seat + 1}`;

const effectsHtml = (o, hasBoxes) => {
  const list = (o.e || []).filter(x => !(hasBoxes && x === 'Tick a box'));      // the boxes are shown on the card
  return list.length ? `<ul class="evfx">${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
};

// Heading of an outcome that depends on a requirement: met (who meets it), otherwise, or left to the players.
function reqLabel(o, state, who) {
  if (state === 'met') return `<div class="evcond met">Requirement met: ${esc(o.c || '')}${who.length ? ` (${esc(who.join(', '))})` : ''}</div>`;
  if (state === 'otherwise') return '<div class="evcond">Otherwise</div>';
  if (state === 'unmet') return `<div class="evcond unmet">Requirement not met: ${esc(o.c || '')}</div>`;
  if (state === 'manual') return `<div class="evcond manual">${esc(o.c || 'Otherwise')}: the players decide</div>`;
  return '';
}

// Boxes of a card (ticked by anybody: it is play, not editing) and its free note.
function boxesHtml(r, kind, id, compact = false) {
  const bs = boxState(r, kind, id);
  if (!bs.boxes.length) return '';
  const labelled = bs.boxes.some(b => b.l) && !compact;
  const box = (b, i) => {
    const on = bs.ticked.includes(i);
    return `<button type="button" class="evbox" data-ev="mark" data-kind="${esc(kind)}" data-id="${esc(id)}" data-i="${i}" aria-pressed="${on}" title="Box ${i + 1}">${on ? '&#10003;' : ''}</button>`;
  };
  const body = labelled
    ? `<ul class="evboxlist">${bs.boxes.map((b, i) => `<li>${box(b, i)} <span>${esc(b.l || `Box ${i + 1}`)}</span>${bs.ticked.includes(i) && b.s ? ` <span class="evsec">Read ${esc(b.s)}</span>` : ''}</li>`).join('')}</ul>`
    : `<div class="evboxrow">${bs.boxes.map(box).join('')}</div>`;
  if (compact) return `<div class="evboxrow" title="${esc(bs.boxes.map((b, i) => `${i + 1}: ${b.l || ''}`).join('\n'))}">${bs.boxes.map(box).join('')}</div>`;
  return `<div class="evboxes"><b>Boxes (${bs.ticked.length} of ${bs.boxes.length})</b>${body}${
    bs.complete && bs.rule ? `<div class="evrule">All boxes are ticked. ${esc(bs.rule)}</div>` : ''}</div>`;
}
function noteHtml(r, kind, id) {
  if (!NOTES) return '';
  return `<label class="evnote-field">Note <input type="text" maxlength="500" data-evnote="${esc(kind)}:${esc(id)}" value="${esc(noteOf(r, kind, id))}" placeholder="e.g. option 2 marked"></label>`;
}

// --- the open event ------------------------------------------------------------------------------------------

function openEventHtml(r) {
  const p = r.events.pend, front = frontOf(p.kind, p.id), editing = api.editing();
  if (!front) return `<div class="evdraw">Event ${esc(KIND_NAME[p.kind])} ${esc(p.id)} has no text.</div>`;
  const keys = optionKeys(front), seats = seatList(r), t = tally(p, keys, seats);
  const voters = k => seats.filter(s => p.votes[s] === k).map(s => seatName(r, s));
  const me = evState.seat;
  // While the vote is open, clicking an option votes for it as the selected seat (click again to withdraw).
  const options = front.o.map((o, i) => {
    const k = keys[i], win = t.state === 'decided' && t.opt === k, mine = p.votes[me] === k;
    const click = t.state === 'open'
      ? ` role="button" tabindex="0" data-ev="vote" data-seat="${me}" data-key="${esc(k)}" aria-pressed="${mine}" title="Vote ${esc(k)} as ${esc(seatName(r, me))}"` : '';
    return `<div class="evopt${win ? ' win' : ''}${mine ? ' mine' : ''}${click ? ' clickable' : ''}"${click}><span class="evlabel">${esc(k)}</span>
      <div class="evtext">${esc(o.t)}<div class="evvoters">${t.counts[k]} vote${t.counts[k] === 1 ? '' : 's'}${voters(k).length ? ': ' + esc(voters(k).join(', ')) : ''}${mine ? ' (your vote)' : ''}</div></div></div>`;
  }).join('');

  let status = '';                                   // while the vote is open the card itself shows the votes
  if (t.state === 'tie') status = `<div class="evstatus">Tie between ${esc(t.tied.join(' and '))}. <button type="button" class="primary" data-ev="roll">Draw at random</button></div>`;
  else if (t.state === 'decided') status = `<div class="evstatus">Decided: <b>${esc(t.opt)}</b>${t.random ? ' (random draw)' : t.voted ? ` (${t.counts[t.opt]} of ${t.voted} votes)` : ''}.</div>`;

  const adminBtns = editing ? `<div class="evadmin">${t.state === 'open' ? '<button type="button" data-ev="close">Close vote</button>' : ''}<button type="button" data-ev="cancel">Put back on top</button></div>` : '';

  let back = '';
  if (t.state === 'decided') {
    ensureBack();
    const outs = backData?.[p.kind]?.[p.id]?.[keys.indexOf(t.opt)];
    const bs = boxState(r, p.kind, p.id);
    const shown = outs ? applicableOutcomes(outs, r) : [];
    const def = bs.boxes.length ? (bs.complete ? 'out' : 'bottom') : defaultPlace(front, t.opt, shown);
    back = `<div class="evcard evback"><h3>${esc(t.opt)}</h3>${
      !outs ? '<p class="hint">Loading the outcome...</p>' : shown.map(({ o, state, who }) => `<div class="evoutcome">${reqLabel(o, state, who)}${paras(o.n)}${
        effectsHtml(o, bs.boxes.length > 0)}${o.x ? '<p class="evnote">Remove this card from the game.</p>' : o.r ? '<p class="evnote">This card returns to the bottom of the deck.</p>' : ''}</div>`).join('')}</div>
      <div class="evplace">Place the card:
        ${['out', 'bottom'].map(w => `<button type="button" class="${w === def ? 'primary' : ''}" data-ev="finish" data-place="${w}">${w === 'out' ? 'Discard' : 'Bottom'}</button>`).join('')}</div>`;
  }
  // Right column: vote result, boxes, the outcome of the winning option and where the card goes. It takes the width the card leaves.
  const side = `${status}${adminBtns}${boxesHtml(r, p.kind, p.id)}${noteHtml(r, p.kind, p.id)}${back}`;
  return `<h2>Open event: ${esc(KIND_NAME[p.kind])} ${esc(p.id)}</h2>
    <div class="evrow"><div class="evcard"><div class="evhead">${esc(KIND_NAME[p.kind])} event ${esc(p.id)}</div>${paras(front.n)}<div class="evopts">${options}</div></div>
    ${side ? `<div class="evside">${side}</div>` : ''}</div>`;
}

// --- draw panel, piles and log -------------------------------------------------------------------------------

function drawHtml(r, kind) {
  if (api.editing()) return '';                      // the edit view only reorders the deck; cards are drawn in the play view
  const st = r.events[kind], pool = eventPool(r, kind).length;
  const left = st.top.length + pool + st.bottom.length;
  const open = r.events.pend;                      // an event of the other deck is still open: finish it first
  const wait = open ? `<span class="hint">${esc(KIND_NAME[open.kind])} event ${esc(open.id)} is still open.</span><button type="button" data-ev="kind" data-v="${esc(open.kind)}">Go to it</button>` : '';
  return `<div class="evdraw"><button type="button" class="primary" data-ev="draw" ${left && !open ? '' : 'disabled'}>Draw next ${esc(KIND_NAME[kind].toLowerCase())} event</button>${wait}</div>`;
}

// The edit view: one table in draw order with a section per location. Cards are dragged between the sections and inside
// Top and Bottom; the position in the table is the position in the deck. Only discarded cards show their text.
const SECTIONS = [
  ['top', 'Top'], ['', 'Deck'], ['bottom', 'Bottom'], ['out', 'Discarded'], ['locked', 'Locked'],
];
const COLS = 3;

// A discarded card, opened by its number: the card as it was, the decision (from the log) and the outcome text. Read only.
// Requirements of the outcome are checked against the party as it is now.
function viewedHtml(r, kind) {
  const v = evState.view;
  if (!v || v.kind !== kind || !r.events[kind].out.includes(v.id)) return '';
  const front = frontOf(kind, v.id);
  if (!front) return '';
  const entry = [...(r.evlog || [])].reverse().find(x => x.kind === kind && x.id === v.id);
  const keys = optionKeys(front), seats = seatList(r);
  const votes = entry?.votes || {};
  const options = front.o.map((o, i) => {
    const k = keys[i], names = seats.filter(s => votes[s] === k).map(s => seatName(r, s));
    const n = Object.values(votes).filter(x => x === k).length;
    return `<div class="evopt${entry?.opt === k ? ' win' : ''}"><span class="evlabel">${esc(k)}</span>
      <div class="evtext">${esc(o.t)}${entry ? `<div class="evvoters">${n} vote${n === 1 ? '' : 's'}${names.length ? ': ' + esc(names.join(', ')) : ''}</div>` : ''}</div></div>`;
  }).join('');
  let side = '';
  if (entry) {
    ensureBack();
    const outs = backData?.[kind]?.[v.id]?.[keys.indexOf(entry.opt)];
    const bs = boxState(r, kind, v.id);
    side = `<div class="evstatus">Decided: <b>${esc(entry.opt)}</b>${entry.rnd ? ' (random draw)' : ''}${entry.closed ? ' (vote closed)' : ''}.</div>${boxesHtml(r, kind, v.id)}
      <div class="evcard evback"><h3>${esc(entry.opt)}</h3>${!outs ? '<p class="hint">Loading the outcome...</p>' : applicableOutcomes(outs, r).map(({ o, state, who }) =>
        `<div class="evoutcome">${reqLabel(o, state, who)}${paras(o.n)}${effectsHtml(o, bs.boxes.length > 0)}${o.x ? '<p class="evnote">Remove this card from the game.</p>' : ''}</div>`).join('')}</div>`;
  } else {
    side = `<div class="evstatus">No decision recorded.</div>${boxesHtml(r, kind, v.id)}`;
  }
  return `<div class="evviewed"><div class="evviewhead"><h2>${esc(KIND_NAME[kind])} event ${esc(v.id)}</h2><button type="button" class="evmv" data-ev="view" data-id="${v.id}">Close</button></div>
    <div class="evrow"><div class="evcard"><div class="evhead">${esc(KIND_NAME[kind])} event ${esc(v.id)}</div>${paras(front.n)}<div class="evopts">${options}</div></div>
    <div class="evside">${side}</div></div></div>`;
}

// What players see below the open event: the numbers of the discarded cards (click one to see it). Where the other
// cards are is not shown. Boxes are ticked on the open event or on the opened discarded card.
function playHtml(r, kind) {
  const out = r.events[kind].out;
  return `<h2>Discarded cards (${out.length})</h2><div class="evchips">${out.map(id => `<button type="button" class="evchip evchipbtn" data-ev="view" data-id="${id}" aria-pressed="${evState.view?.kind === kind && evState.view.id === id}" title="Show card ${id} and its decision">${id}</button>`).join('') || '<span class="hint">none</span>'}</div>${viewedHtml(r, kind)}`;
}

// A card looked at from the edit view: its front and its boxes (they can be ticked); nothing is drawn.
function peekRow(r, kind, id) {
  const front = frontOf(kind, id);
  if (!front) return '';
  const keys = optionKeys(front);
  return `<tr class="evpeek"><td colspan="${COLS}"><div class="evcard"><div class="evhead">${esc(KIND_NAME[kind])} event ${esc(id)}</div>${paras(front.n)}<div class="evopts">${
    front.o.map((o, i) => `<div class="evopt"><span class="evlabel">${esc(keys[i])}</span><div class="evtext">${esc(o.t)}</div></div>`).join('')}</div></div>${boxesHtml(r, kind, id)}</td></tr>`;
}

function pilesHtml(r, kind) {
  if (!api.editing()) return playHtml(r, kind);
  const filter = evState.filter, st = r.events[kind];
  const deckIds = eventPool(r, kind);
  const lists = { top: st.top, '': deckIds, bottom: st.bottom, out: st.out, locked: st.locked };
  // The filter picks which sections the table shows: the deck (top, deck, bottom), the discarded or the locked cards, or all.
  const SHOW = { deck: ['top', '', 'bottom'], out: ['out'], locked: ['locked'], all: ['top', '', 'bottom', 'out', 'locked'] };
  const total = EVENT_TABLE[kind].length, inDeck = st.top.length + deckIds.length + st.bottom.length;
  const filterSel = `<label class="evfilter">Show <select id="evFilter">${[['deck', `Deck (${inDeck})`], ['out', `Discard (${st.out.length})`], ['locked', `Locked (${st.locked.length})`], ['all', `All (${total})`]].map(([k, l]) =>
    `<option value="${k}" ${filter === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  const rowHtml = (where, id, i) => {
    const n = lists[where].length;
    // Draw position in the whole deck: top cards first, then the deck (random), then the bottom cards.
    const pos = where === 'top' ? i + 1 : where === 'bottom' ? st.top.length + deckIds.length + i + 1 : '';
    const arrows = where === 'top' || where === 'bottom'
      ? `<button type="button" class="evmv" data-ev="move" data-id="${id}" data-v="-1" title="Earlier" ${i === 0 ? 'disabled' : ''}>&#9650;</button><button type="button" class="evmv" data-ev="move" data-id="${id}" data-v="1" title="Later" ${i === n - 1 ? 'disabled' : ''}>&#9660;</button>` : '';
    // On touch screens, where dragging is awkward, a list moves the card to another section.
    const touch = `<select class="evtouch" data-evrowplace="${id}" aria-label="Move card ${id} to">${SECTIONS.map(([w, l]) => `<option value="${w}" ${w === where ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    // Every card can be dragged to every section (a drop inside Top or Bottom sets its position; discarded cards keep their order).
    const peeked = evState.peek === id;
    return `<tr class="evrow-${where || 'deck'}" draggable="true" data-evdrag="${id}" data-evzone="${where}" data-evidx="${i}">
      <td><span class="evgrip" title="Drag to move">&#10303;</span><button type="button" class="evnum" data-ev="peek" data-id="${id}" aria-pressed="${peeked}" title="Look at card ${id} (it is not drawn)">${id}</button></td>
      <td class="evpos">${pos}${arrows}</td><td>${touch}</td></tr>${peeked ? peekRow(r, kind, id) : ''}`;
  };
  const body = SECTIONS.map(([w, label]) => {
    if (!SHOW[filter].includes(w)) return '';
    const ids = lists[w];
    return `<tr class="evsec" data-evzone="${w}" data-evhead><td colspan="${COLS}"><b>${label} (${ids.length})</b></td></tr>`
      + (ids.map((id, i) => rowHtml(w, id, i)).join('') || `<tr class="evempty" data-evzone="${w}"><td colspan="${COLS}"></td></tr>`);
  }).join('');
  const addForm = `<form id="evAddForm" class="evaddform" autocomplete="off"><input type="text" id="evAddInput" inputmode="numeric" placeholder="Card numbers, comma separated" aria-label="Card numbers to add to the deck"><button type="submit" class="evicon" aria-label="Add the locked cards to the deck" title="Add to deck">+</button><button type="button" class="evicon" data-ev="shuffle" aria-label="Shuffle: put the top and bottom cards back into the deck" title="Shuffle: top and bottom cards go back into the deck">${SHUFFLE}</button></form>${evState.addMsg ? `<span class="evaddmsg">${esc(evState.addMsg)}</span>` : ''}`;
  return `<h2>Cards</h2><div class="filters">${filterSel}${addForm}</div>
    <div class="evtablewrap"><table class="evtable"><tr><th>#</th><th>Pos.</th><th></th></tr>${body}</table></div>`;
}

// --- drag and drop (edit view) -------------------------------------------------------------------------------
let drag = null;
const clearMarks = () => document.querySelectorAll('.evdrop-before, .evdrop-after, .evdrop-in, .evdragging').forEach(el => el.classList.remove('evdrop-before', 'evdrop-after', 'evdrop-in', 'evdragging'));

// Where a drop at the pointer would put the card: { zone, index } or null.
function dropTarget(e) {
  const row = e.target.closest?.('[data-evzone]');
  if (!row) return null;
  const zone = row.dataset.evzone;
  if (row.dataset.evhead !== undefined || row.classList.contains('evempty')) return { row, zone, index: 0, mode: 'in' };
  const rect = row.getBoundingClientRect(), after = e.clientY > rect.top + rect.height / 2;
  return { row, zone, index: Number(row.dataset.evidx) + (after ? 1 : 0), mode: after ? 'after' : 'before' };
}
export function evDragStart(e) {
  const row = e.target.closest?.('[data-evdrag]');
  if (!row || !api.editing()) return false;
  drag = { id: Number(row.dataset.evdrag) };
  e.dataTransfer.setData('text/plain', `event:${drag.id}`);
  e.dataTransfer.effectAllowed = 'move';
  row.classList.add('evdragging');
  return true;
}
export function evDragOver(e) {
  if (!drag) return false;
  const t = dropTarget(e);
  if (!t) return false;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.evdrop-before, .evdrop-after, .evdrop-in').forEach(el => el.classList.remove('evdrop-before', 'evdrop-after', 'evdrop-in'));
  // Only Top and Bottom have positions; for the other sections the whole section header lights up.
  const ordered = t.zone === 'top' || t.zone === 'bottom';
  const el = ordered || t.mode === 'in' ? t.row : document.querySelector(`.evsec[data-evzone="${t.zone}"]`);
  el?.classList.add(`evdrop-${ordered ? t.mode : 'in'}`);
  return true;
}
export function evDrop(e) {
  if (!drag) return false;
  const t = dropTarget(e), id = drag.id, r = api.record();
  drag = null;
  clearMarks();
  if (!t || !r) return false;
  e.preventDefault();
  const kind = evState.kind;
  api.commit(ed.moveEventTo(r, kind, id, t.zone, t.index));
  return true;
}
export function evDragEnd() { drag = null; clearMarks(); }

export function eventsHtml(r) {
  // The tabs always switch. A newly opened event brings its own tab to the front; the other tab shows a note and waits
  // (one event is open at a time).
  const p = r.events.pend, pendKey = p ? `${p.kind}:${p.id}` : '';
  if (pendKey !== lastPend) { lastPend = pendKey; if (p) evState.kind = p.kind; }
  const kind = evState.kind;
  if (!api.editing()) { evState.peek = null; evState.addMsg = ''; }           // looking at a card and the add message are temporary
  const seats = seatList(r), me = evState.seat;
  const pills = `<div class="seatpills" role="group" aria-label="I am">${seats.map(s =>
    `<button type="button" class="seatpill" data-ev="seat" data-seat="${s}" aria-pressed="${s === me}" title="Vote as ${esc(seatName(r, s))}">${esc(seatName(r, s))}</button>`).join('')}</div>`;
  const edit = `<button type="button" class="editbtn editicon" data-pageedit aria-pressed="${api.editing()}" aria-label="${api.editing() ? 'Stop editing events' : 'Edit events'}" title="${api.editing() ? 'Stop editing events' : 'Edit events'}">${PENCIL}</button>`;
  const tabs = `<div class="subbar"><div class="subtabs" role="tablist">${EVENT_KINDS.map(k =>
    `<button type="button" role="tab" aria-selected="${k === kind}" data-ev="kind" data-v="${k}"${p?.kind === k ? ' class="has-open" title="An event is open"' : ''}>${KIND_NAME[k]} (${EVENT_TABLE[k].length - r.events[k].out.length - r.events[k].locked.length} in the deck)${p?.kind === k ? ' &#9679;' : ''}</button>`).join('')}</div><div class="evtools">${pills}${edit}</div></div>`;
  return tabs + (p && p.kind === kind ? openEventHtml(r) : drawHtml(r, kind)) + pilesHtml(r, kind);
}

// --- clicks and changes --------------------------------------------------------------------------------------

// Returns true when the click belonged to the events tab.
export function evClick(e) {
  const el = e.target.closest('[data-ev]');
  if (!el || el.disabled) return false;
  const r = api.record(), kind = evState.kind, a = el.dataset.ev, editing = api.editing();
  if (!r) return true;
  switch (a) {
    case 'view': {
      const id = Number(el.dataset.id), same = evState.view?.kind === kind && evState.view.id === id;
      evState.view = same ? null : { kind, id };
      api.render();
      break;
    }
    case 'shuffle': {
      if (!editing) break;
      const n = r.events[kind].top.length + r.events[kind].bottom.length;
      evState.addMsg = n ? `Shuffled: ${n} card${n === 1 ? '' : 's'} back into the deck.` : 'No cards on top or on the bottom.';
      if (n) api.commit(ed.shuffleDeck(r, kind)); else api.render();
      break;
    }
    case 'peek': {
      const id = Number(el.dataset.id);
      evState.peek = evState.peek === id ? null : id;
      api.render();
      break;
    }
    case 'seat': evState.seat = Number(el.dataset.seat); saveState(); api.render(); break;
    case 'kind': evState.kind = el.dataset.v; evState.peek = null; evState.addMsg = ''; saveState(); api.render(); break;
    case 'draw': api.commit(ed.drawEvent(r, evState.kind)); break;
    case 'vote': {
      const seat = Number(el.dataset.seat), key = el.dataset.key;
      api.commit(ed.setVote(r, seat, r.events.pend?.votes?.[seat] === key ? null : key));
      break;
    }
    case 'roll': api.commit(ed.rollTie(r)); break;
    case 'mark': api.commit(ed.toggleMark(r, el.dataset.kind, Number(el.dataset.id), Number(el.dataset.i))); break;
    case 'finish': api.commit(ed.finishEvent(r, el.dataset.place)); break;
    case 'close': if (editing) api.commit(ed.closeVote(r)); break;
    case 'cancel': if (editing) api.commit(ed.cancelEvent(r)); break;
    case 'move': if (editing) api.commit(ed.moveEvent(r, kind, Number(el.dataset.id), Number(el.dataset.v))); break;
    case 'open': if (editing) api.commit(ed.openEvent(r, kind, Number(el.dataset.id))); break;
    default: return false;
  }
  return true;
}

// A click anywhere outside the card that is being looked at closes it. The path is read at the start of the click, because
// the click may already have redrawn the page (a ticked box) and removed the clicked element.
export function evOutside(e) {
  if (evState.peek === null) return false;
  const inside = e.composedPath().some(el => el.classList && (el.classList.contains('evpeek') || el.classList.contains('evnum')));
  if (inside) return false;
  evState.peek = null;
  api.render();
  return true;
}

// "Add to deck": a list of card numbers such as "41, 43 67" moves those locked cards into the deck.
export function evSubmit(e) {
  if (e.target.id !== 'evAddForm') return false;
  e.preventDefault();
  const r = api.record(), kind = evState.kind;
  if (!r || !api.editing()) return true;
  const nums = [...new Set((e.target.querySelector('#evAddInput').value.match(/\d+/g) || []).map(Number))];
  const table = new Set(EVENT_TABLE[kind].map(x => x.id));
  const unknown = nums.filter(n => !table.has(n)), known = nums.filter(n => table.has(n));
  const added = known.filter(n => eventPlace(r, kind, n) === 'locked');       // only locked cards can be added
  const notLocked = known.filter(n => !added.includes(n));
  evState.addMsg = nums.length ? [
    added.length ? `Added: ${added.join(', ')}.` : '',
    notLocked.length ? `Not locked: ${notLocked.join(', ')}.` : '',
    unknown.length ? `No such card: ${unknown.join(', ')}.` : '',
  ].filter(Boolean).join(' ') : '';
  if (added.length) api.commit(ed.addEventsToDeck(r, kind, added)); else api.render();
  return true;
}

export function evChange(e) {
  const note = e.target.dataset?.evnote;
  if (note) {
    const [kind, id] = note.split(':');
    api.commit(ed.setNote(api.record(), kind, Number(id), e.target.value));
    return true;
  }
  if (e.target.dataset?.evrowplace) {
    const r = api.record(), kind = evState.kind;
    if (r && api.editing()) api.commit(ed.setEventPlace(r, kind, Number(e.target.dataset.evrowplace), e.target.value));
    return true;
  }
  if (e.target.id === 'evFilter') {
    evState.filter = e.target.value;
    saveState();
    api.render();
    return true;
  }
  return false;
}
