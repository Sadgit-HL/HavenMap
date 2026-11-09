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
const PILE_NAME = { top: 'Top of the deck', bottom: 'Bottom of the deck', out: 'Discarded', locked: 'Locked' };
const STORE = 'havenmap.campaign.events';

const evState = { kind: 'city', seat: 0, sel: null };      // sel: the card selected in edit mode
let api = { render() {}, record: () => null, commit() {}, editing: () => false };
let backData = null, backLoading = null;

export function evInit(hooks) {
  api = hooks;
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (s && EVENT_KINDS.includes(s.kind)) evState.kind = s.kind;
    if (s && Number.isInteger(s.seat)) evState.seat = s.seat;
  } catch { /* ignore */ }
}
function saveState() {
  try { localStorage.setItem(STORE, JSON.stringify({ kind: evState.kind, seat: evState.seat })); } catch { /* ignore */ }
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
const chipBtn = (cls, id, label, extra = '') => `<button type="button" class="${cls}" data-ev="sel" data-id="${id}" ${extra}>${label}</button>`;

// Heading of an outcome that depends on a requirement: met (who meets it), otherwise, or left to the players.
function reqLabel(o, state, who) {
  if (state === 'met') return `<div class="evcond met">Requirement met: ${esc(o.c || '')}${who.length ? ` (${esc(who.join(', '))})` : ''}</div>`;
  if (state === 'otherwise') return '<div class="evcond">Otherwise</div>';
  if (state === 'manual') return `<div class="evcond manual">${esc(o.c || 'Otherwise')}: the players decide</div>`;
  return '';
}

// Boxes of a card (ticked by anybody: it is play, not editing) and its free note.
function boxesHtml(r, kind, id) {
  const bs = boxState(r, kind, id);
  if (!bs.boxes.length) return '';
  const labelled = bs.boxes.some(b => b.l);
  const box = (b, i) => {
    const on = bs.ticked.includes(i);
    return `<button type="button" class="evbox" data-ev="mark" data-kind="${esc(kind)}" data-id="${esc(id)}" data-i="${i}" aria-pressed="${on}" title="Box ${i + 1}">${on ? '&#10003;' : ''}</button>`;
  };
  const body = labelled
    ? `<ul class="evboxlist">${bs.boxes.map((b, i) => `<li>${box(b, i)} <span>${esc(b.l || `Box ${i + 1}`)}</span>${bs.ticked.includes(i) && b.s ? ` <span class="evsec">Read ${esc(b.s)}</span>` : ''}</li>`).join('')}</ul>`
    : `<div class="evboxrow">${bs.boxes.map(box).join('')}</div>`;
  return `<div class="evboxes"><b>Boxes (${bs.ticked.length} of ${bs.boxes.length})</b>${body}${
    bs.complete && bs.rule ? `<div class="evrule">All boxes are ticked. ${esc(bs.rule)}</div>` : ''}</div>`;
}
function noteHtml(r, kind, id) {
  return `<label class="evnote-field">Note <input type="text" maxlength="500" data-evnote="${esc(kind)}:${esc(id)}" value="${esc(noteOf(r, kind, id))}" placeholder="e.g. option 2 marked"></label>`;
}

// --- the open event ------------------------------------------------------------------------------------------

function openEventHtml(r) {
  const p = r.events.pend, front = frontOf(p.kind, p.id), editing = api.editing();
  if (!front) return `<div class="evbox">Event ${esc(KIND_NAME[p.kind])} ${esc(p.id)} has no text.</div>`;
  const keys = optionKeys(front), seats = seatList(r), t = tally(p, keys, seats);
  const voters = k => seats.filter(s => p.votes[s] === k).map(s => seatName(r, s));
  const options = front.o.map((o, i) => {
    const k = keys[i], win = t.state === 'decided' && t.opt === k;
    return `<div class="evopt${win ? ' win' : ''}"><span class="evlabel">${esc(k)}</span>
      <div class="evtext">${esc(o.t)}<div class="evvoters">${t.counts[k]} vote${t.counts[k] === 1 ? '' : 's'}${voters(k).length ? ': ' + esc(voters(k).join(', ')) : ''}</div></div></div>`;
  }).join('');
  const me = evState.seat;
  const voteRows = keys.length < 2 ? '' : `<table class="evvotes"><tr><th>Seat</th>${keys.map(k => `<th>${esc(k)}</th>`).join('')}</tr>${
    seats.map(s => `<tr class="${s === me ? 'me' : ''}"><td>${esc(seatName(r, s))}</td>${keys.map(k => {
      const can = t.state === 'open' && (s === me || editing);
      return `<td><button type="button" class="evvote" data-ev="vote" data-seat="${s}" data-key="${esc(k)}" aria-pressed="${p.votes[s] === k}" ${can ? '' : 'disabled'}>${esc(k)}</button></td>`;
    }).join('')}</tr>`).join('')}</table>`;
  const seatSel = `<label class="evme">I am <select id="evSeat">${seats.map(s => `<option value="${s}" ${s === me ? 'selected' : ''}>${esc(seatName(r, s))}</option>`).join('')}</select></label>`;

  let status;
  if (t.state === 'open') status = `<div class="evstatus">${t.voted} of ${seats.length} voted. Waiting for votes.</div>`;
  else if (t.state === 'tie') status = `<div class="evstatus">Tie between ${esc(t.tied.join(' and '))}. <button type="button" class="primary" data-ev="roll">Draw at random</button></div>`;
  else status = `<div class="evstatus">Decided: <b>${esc(t.opt)}</b>${t.random ? ' (random draw)' : t.voted ? ` (${t.counts[t.opt]} of ${t.voted} votes)` : ''}.</div>`;

  const adminBtns = editing ? `<div class="evadmin">${t.state === 'open' ? '<button type="button" data-ev="close">Close vote</button>' : ''}<button type="button" data-ev="cancel">Put back on top</button></div>` : '';

  let back = '';
  if (t.state === 'decided') {
    ensureBack();
    const outs = backData?.[p.kind]?.[p.id]?.[keys.indexOf(t.opt)];
    const bs = boxState(r, p.kind, p.id);
    const def = bs.boxes.length ? (bs.complete ? 'out' : 'bottom') : defaultPlace(front, t.opt);
    back = `<div class="evcard evback"><h3>${esc(t.opt)}</h3>${
      !outs ? '<p class="hint">Loading the outcome...</p>' : applicableOutcomes(outs, r).map(({ o, state, who }) => `<div class="evoutcome">${reqLabel(o, state, who)}${paras(o.n)}${
        o.e?.length ? `<ul class="evfx">${o.e.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${o.x ? '<p class="evnote">Remove this card from the game.</p>' : ''}</div>`).join('')}</div>
      <div class="evplace">Place the card:
        ${['out', 'top', 'bottom'].map(w => `<button type="button" class="${w === def ? 'primary' : ''}" data-ev="finish" data-place="${w}">${w === 'out' ? 'Discard' : w === 'top' ? 'Top of the deck' : 'Bottom of the deck'}</button>`).join('')}</div>`;
  }
  return `<h2>Open event: ${esc(KIND_NAME[p.kind])} ${esc(p.id)}</h2>
    <div class="evrow"><div class="evcard"><div class="evhead">${esc(KIND_NAME[p.kind])} event ${esc(p.id)}</div>${paras(front.n)}<div class="evopts">${options}</div></div>
    <div class="evside">${seatSel}${voteRows}${status}${adminBtns}</div></div>${boxesHtml(r, p.kind, p.id)}${noteHtml(r, p.kind, p.id)}${back}`;
}

// --- draw panel, piles and log -------------------------------------------------------------------------------

function drawHtml(r, kind) {
  const st = r.events[kind], pool = eventPool(r, kind).length;
  const left = st.top.length + pool + st.bottom.length;
  return `<div class="evbox"><button type="button" class="primary" data-ev="draw" ${left ? '' : 'disabled'}>Draw next ${esc(KIND_NAME[kind].toLowerCase())} event</button>
    <span class="hint">${st.top.length} on top, ${pool} undefined, ${st.bottom.length} on the bottom. The top cards are drawn first, then a random undefined card, then the bottom cards.</span></div>`;
}

function pilesHtml(r, kind) {
  const st = r.events[kind], editing = api.editing(), sel = evState.sel;
  const extra = id => {
    const bs = boxState(r, kind, id), note = noteOf(r, kind, id);
    return `${bs.boxes.length ? `<em class="evprog${bs.complete ? ' done' : ''}">${bs.ticked.length}/${bs.boxes.length}</em>` : ''}${note ? `<span class="evnoteicon" title="${esc(note)}">&#9998;</span>` : ''}`;
  };
  const chip = (id, i, ordered) => {
    const label = `${ordered ? `<i>${i + 1}</i>` : ''}${id}${extra(id)}`;
    const cls = `evchip${sel === id ? ' sel' : ''}`;
    return editing ? chipBtn(cls, id, label) : `<span class="${cls}">${label}</span>`;
  };
  const pile = (p, ordered) => `<div class="evpile"><h4>${PILE_NAME[p]} (${st[p].length})</h4><div class="evchips">${st[p].map((id, i) => chip(id, i, ordered)).join('') || '<span class="hint">empty</span>'}</div></div>`;
  const undef = eventPool(r, kind);
  const toolbar = editing && sel !== null && EVENT_TABLE[kind].some(e => e.id === sel)
    ? `<div class="evtool">Card ${sel} (${eventPlace(r, kind, sel) ? esc(PILE_NAME[eventPlace(r, kind, sel)].toLowerCase()) : 'undefined'}):
        ${[['top', 'Top'], ['bottom', 'Bottom'], ['out', 'Discard'], ['', 'Undefined'], ['locked', 'Lock']].map(([v, l]) => `<button type="button" data-ev="place" data-v="${v}">${l}</button>`).join('')}
        <button type="button" data-ev="move" data-v="-1" title="Earlier in this pile">&#9650;</button><button type="button" data-ev="move" data-v="1" title="Later in this pile">&#9660;</button>
        <button type="button" data-ev="open">Open now</button>
        <div class="evtoolx">${boxesHtml(r, kind, sel)}${noteHtml(r, kind, sel)}</div></div>` : '';
  return `${editing ? '<p class="hint">Select a card to move it, reorder it inside a pile, lock it or open it. Top: first card is drawn first. A card moved to the top goes to the front, to the bottom to the end.</p>' : ''}${toolbar}
    <div class="evpiles">${pile('top', true)}<div class="evpile"><h4>Undefined (${undef.length})</h4><div class="evchips">${undef.map(id => editing ? chipBtn(`evchip${sel === id ? ' sel' : ''}`, id, id + extra(id)) : `<span class="evchip">${id}${extra(id)}</span>`).join('') || '<span class="hint">empty</span>'}</div></div>
    ${pile('bottom', true)}${pile('out', true)}${pile('locked', false)}</div>`;
}

function logHtml(r, kind) {
  const rows = (r.evlog || []).filter(e => e.kind === kind).slice(-10).reverse();
  if (!rows.length) return '';
  return `<h2>Recent ${esc(KIND_NAME[kind].toLowerCase())} events</h2><ul class="evlog">${rows.map(e => {
    const v = Object.entries(e.votes || {}).map(([s, k]) => `${esc(seatName(r, Number(s)))} ${esc(k)}`).join(', ');
    return `<li>${esc(e.id)}: option <b>${esc(e.opt)}</b>${e.rnd ? ' (random draw)' : ''}${e.closed ? ' (vote closed)' : ''}, ${esc(PILE_NAME[e.place]?.toLowerCase() || e.place)}${v ? `. Votes: ${v}` : ''}</li>`;
  }).join('')}</ul>`;
}

export function eventsHtml(r) {
  const kind = r.events.pend ? r.events.pend.kind : evState.kind;
  const tabs = `<div class="subbar"><div class="subtabs" role="tablist">${EVENT_KINDS.map(k =>
    `<button type="button" role="tab" aria-selected="${k === kind}" data-ev="kind" data-v="${k}" ${r.events.pend ? 'disabled' : ''}>${KIND_NAME[k]} (${EVENT_TABLE[k].length - r.events[k].out.length - r.events[k].locked.length} in the deck)</button>`).join('')}</div></div>`;
  return tabs + (r.events.pend ? openEventHtml(r) : drawHtml(r, kind)) + pilesHtml(r, kind) + logHtml(r, kind);
}

// --- clicks and changes --------------------------------------------------------------------------------------

// Returns true when the click belonged to the events tab.
export function evClick(e) {
  const el = e.target.closest('[data-ev]');
  if (!el || el.disabled) return false;
  const r = api.record(), kind = r?.events?.pend?.kind || evState.kind, a = el.dataset.ev, editing = api.editing();
  if (!r) return true;
  const sel = evState.sel;
  switch (a) {
    case 'kind': evState.kind = el.dataset.v; evState.sel = null; saveState(); api.render(); break;
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
    case 'sel': if (editing) { evState.sel = sel === Number(el.dataset.id) ? null : Number(el.dataset.id); api.render(); } break;
    case 'place': if (editing && sel !== null) api.commit(ed.setEventPlace(r, kind, sel, el.dataset.v)); break;
    case 'move': if (editing && sel !== null) api.commit(ed.moveEvent(r, kind, sel, Number(el.dataset.v))); break;
    case 'open': if (editing && sel !== null) { evState.sel = null; api.commit(ed.openEvent(r, kind, sel)); } break;
    default: return false;
  }
  return true;
}

export function evChange(e) {
  const note = e.target.dataset?.evnote;
  if (note) {
    const [kind, id] = note.split(':');
    api.commit(ed.setNote(api.record(), kind, Number(id), e.target.value));
    return true;
  }
  if (e.target.id !== 'evSeat') return false;
  evState.seat = Number(e.target.value);
  saveState();
  api.render();
  return true;
}
