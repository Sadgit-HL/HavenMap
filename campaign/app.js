// Campaign view with a simple edit mode. Edits go through scripts/campaign/edit.js (pure functions returning a new
// record); every change is saved to the browser at once and can be undone. Session start/commit, voting and the
// server come later (docs/campaign-schema.md section 10).
import { CARDS } from '../scripts/games/gh2_cards.js';
import { ITEMS } from '../scripts/games/gh2_items.js';
import { SCENARIOS, STICKERS } from '../scripts/games/gh2_scenarios.js';
import { BATTLE_GOALS } from '../scripts/games/battle_goals.js';
import { escapeHtml as esc } from '../scripts/escape.js';
import { localStore } from '../scripts/campaign/store.js';
import { cardImageUrl, itemImageUrl, eventImageUrl, matImageUrl, pqImageUrl } from '../scripts/campaign/cardImages.js';
import {
  validate, scenarioLevel, prosperityLevel, handOf, shopCopies, itemsInUse, unlockedBy, classByName, SCN_STATE_NAME,
} from '../scripts/campaign/record.js';
import * as ed from '../scripts/campaign/edit.js';
import { CLASSES } from '../scripts/games/gh2_classes.js';
import { frontOf as eventFront, EVENT_TABLE } from '../scripts/campaign/events.js';
import { buildCard } from '../scripts/amd/card.js';
import { heroCatalog, heroPerkClass } from '../scripts/amd/heroDeck.js';
import { PERSONAL_QUESTS } from '../scripts/games/gh2_quests.js';
import ghConfig from '../scripts/games/gh.js';
import { GH_DECKS } from '../scripts/games/gh_decks.js';
import { buildFlow, LANES, laneOf } from '../scripts/campaign/flow.js';
import { RESOURCES, RESOURCE_GAMES } from '../scripts/games/resources.js';
import { characterTraits } from '../scripts/campaign/outcomes.js';
import { SPECIAL_TRAITS, specialName } from '../scripts/campaign/traits.js';
import { eventsHtml, evInit, evClick, evChange, evSubmit, evOutside, evDragStart, evDragOver, evDrop, evDragEnd } from './eventsView.js?v=38';

const PAGE_TABS = ['Overview', 'Scenarios', 'Mercenaries', 'Items', 'Events', 'Cards', 'Resources'];
const main = document.getElementById('main');
const tabsEl = document.getElementById('tabs');
const undoBtn = document.getElementById('undo');
let record = null;
let tab = 'Overview';              // top-level tab
let sub = '';                      // sub-tab under Mercenaries: a character id or 'add'
const editPages = new Set();        // pages (top-level tabs) currently in edit mode; each page has its own Edit button
let editing = false;               // derived in render(): is the visible page being edited
let imgMode = 'hover';                 // card images: 'hover' (preview under the pointer) or 'always' (shown in the lists)
const history = [];                                   // earlier records for undo, newest last
const view = { scnView: 'table', flowShow: 'progress', flowLane: '', flowZoom: 'm', scnSel: null, scnStatus: '', scnSearch: '', itemSlot: '', itemSearch: '', itemShow: 'unlocked', itemView: 'list', itemSize: 'm', itemSort: { col: '', dir: 1 }, cardType: 'abilities', cardSlot: '', cardChk: '', cardKind: 'city', cardSide: 'front', cardDeck: '', cardMon: '', cardMLv: '', cardShow: 'unlocked', cardCls: '', cardLv: '', cardSearch: '', cardSize: 's' };   // itemView: 'list' | 'grid'

// Level order of ability cards: 1, X (the level 1.1 cards), 2 ... 9, then M (mastery).
const lvRank = lv => (lv === 'X' ? 1.5 : lv === 'M' ? 99 : Number(lv));
const lvLabel = lv => (lv === 'M' ? 'Pack' : String(lv));      // the Sawbones medical pack cards
const cardById = new Map(CARDS.map(c => [c.id, c]));
const PENCIL = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0l0 0a2 2 0 0 1 0 3L8 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="currentColor" stroke-width="2"/></svg>';
const ITEM_SIZES = { s: 150, m: 188, l: 250 };      // minimum tile width in px for the item grid
// Filter and view settings are kept in this browser (not the search texts: a stale search would hide rows after a reload).
const VIEW_KEY = 'havenmap.campaign.view';
const VIEW_SAVED = ['scnView', 'flowShow', 'flowLane', 'flowZoom', 'scnStatus', 'itemSlot', 'itemShow', 'itemView', 'itemSize', 'itemSort', 'cardType', 'cardSlot', 'cardKind', 'cardSide', 'cardDeck', 'cardMon', 'cardMLv', 'cardShow', 'cardCls', 'cardLv', 'cardSize'];
function saveView() {
  try { localStorage.setItem(VIEW_KEY, JSON.stringify(Object.fromEntries(VIEW_SAVED.map(k => [k, view[k]])))); } catch { /* ignore */ }
}
function loadView() {
  try {
    const v = JSON.parse(localStorage.getItem(VIEW_KEY) || 'null');
    if (!v || typeof v !== 'object') return;
    if (v.scnView === 'table' || v.scnView === 'flow') view.scnView = v.scnView;
    if (v.flowShow === 'progress' || v.flowShow === 'all') view.flowShow = v.flowShow;
    if (typeof v.flowLane === 'string') view.flowLane = v.flowLane;
    if (['s', 'm', 'l'].includes(v.flowZoom)) view.flowZoom = v.flowZoom;
    if (typeof v.scnStatus === 'string') view.scnStatus = v.scnStatus;
    if (typeof v.itemSlot === 'string') view.itemSlot = v.itemSlot;
    if (['all', 'unlocked', 'shop'].includes(v.itemShow)) view.itemShow = v.itemShow;
    if (v.itemView === 'list' || v.itemView === 'grid') view.itemView = v.itemView;
    if (v.itemSize in ITEM_SIZES) view.itemSize = v.itemSize;
    if (['abilities', 'items', 'goals', 'events', 'am', 'mats', 'monsters', 'stats', 'pq'].includes(v.cardType)) view.cardType = v.cardType;
    if (typeof v.cardMon === 'string') view.cardMon = v.cardMon;
    if (typeof v.cardMLv === 'string') view.cardMLv = v.cardMLv;
    if (typeof v.cardDeck === 'string') view.cardDeck = v.cardDeck;
    if (v.cardSide === 'front' || v.cardSide === 'back') view.cardSide = v.cardSide;
    if (v.cardKind === 'city' || v.cardKind === 'road') view.cardKind = v.cardKind;
    if (typeof v.cardSlot === 'string') view.cardSlot = v.cardSlot;
    if (v.cardShow === 'all' || v.cardShow === 'unlocked') view.cardShow = v.cardShow;
    if (typeof v.cardCls === 'string') view.cardCls = v.cardCls;
    if (typeof v.cardLv === 'string') view.cardLv = v.cardLv;
    if (v.cardSize in ITEM_SIZES) view.cardSize = v.cardSize;
    if (v.itemSort && typeof v.itemSort.col === 'string' && (v.itemSort.dir === 1 || v.itemSort.dir === -1)) view.itemSort = { col: v.itemSort.col, dir: v.itemSort.dir };
  } catch { /* ignore */ }
}
const itemById = new Map(ITEMS.map(i => [i.id, i]));
const pretty = slug => String(slug ?? '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const chip = (text, cls = '') => `<span class="chip ${cls}">${esc(text)}</span>`;
const kv = (k, v) => `<div class="kv"><span>${esc(k)}</span><span>${v}</span></div>`;
const none = '<div class="empty">none</div>';

// Number input that reports through data attributes: <input data-act="party" data-key="avg">.
const num = (act, key, value, { min, max, id = '', width = 56 } = {}) =>
  `<input type="number" class="num" style="width:${width}px" data-act="${act}" data-key="${esc(key)}" data-id="${esc(id)}" value="${esc(value ?? '')}"${min !== undefined ? ` min="${min}"` : ''}${max !== undefined ? ` max="${max}"` : ''}>`;
const val = (editable, shown, input) => (editing && editable ? input : esc(shown));

// --- shell: history, save, tabs --------------------------------------------------------------------------

function commit(next) {
  if (next === record) return;
  history.push(record);
  if (history.length > 50) history.shift();
  record = next;
  localStore.save(record);
  render();
}
function undo() {
  if (!history.length) return;
  record = history.pop();
  localStore.save(record);
  render();
}

// Sub-tabs under Mercenaries: one per character, then '+' while there is room for another.
function subTabList() {
  const chars = record?.chars || [];
  const list = chars.map(c => ({ id: c.id, label: c.name }));
  if (chars.length < ed.MAX_CHARACTERS) list.push({ id: 'add', label: '+', title: 'Add a character' });
  return list;
}
// The selected sub-tab, falling back to the first character, or '+' when there are none.
function currentSub() {
  const list = subTabList();
  return list.some(t => t.id === sub) ? sub : (list[0]?.id ?? 'add');
}

function renderTabs() {
  if (!PAGE_TABS.includes(tab)) tab = 'Overview';
  tabsEl.innerHTML = PAGE_TABS.map(t =>
    `<button type="button" role="tab" aria-selected="${t === tab}" data-tab="${esc(t)}">${esc(t)}</button>`).join('');
  document.getElementById('title').textContent = record?.name ? `Campaign: ${record.name}` : 'Campaign';
  undoBtn.disabled = !history.length;
}
tabsEl.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]')?.dataset.tab;
  if (!t || !PAGE_TABS.includes(t)) return;
  tab = t;
  render();
  try { localStorage.setItem('havenmap.campaign.tab', t); } catch { /* ignore */ }
});

// --- views ----------------------------------------------------------------------------------------------

function table(head, rows) {
  return `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>`;
}

function overview(r) {
  const counts = [0, 0, 0, 0];
  for (const s of Object.values(r.scn)) counts[s.s] = (counts[s.s] || 0) + 1;
  const repBar = v => `<div class="bar"><i style="left:${((20 - Math.max(-10, Math.min(20, v))) / 30) * 97}%"></i></div>`;
  const rep = (label, key) => kv(label, val(true, r.rep[key], num('rep', key, r.rep[key], { min: -10, max: 20 }))) + repBar(r.rep[key]);
  const known = new Set(STICKERS.map(s => s.name.toLowerCase()));
  const goalBtn = g => `<button type="button" class="chip ${r.decks.bg.includes(g.id) ? 'ok' : 'dim'}" data-act="deck" data-key="bg" data-id="${g.id}">${esc(pretty(g.slug))}</button>`;
  const bgBody = editing ? BATTLE_GOALS.map(goalBtn).join('')
    : r.decks.bg.map(id => chip(pretty(BATTLE_GOALS.find(g => g.id === id)?.slug ?? id))).join('');
  const medBtn = n => `<button type="button" class="chip ${r.decks.mp.includes(n) ? 'ok' : 'dim'}" data-act="deck" data-key="mp" data-id="${n}">${n}</button>`;
  const medBody = editing ? [1, 2, 3, 4, 5, 6].map(medBtn).join('') : r.decks.mp.map(n => chip(n)).join('');
  const treBody = editing
    ? `<input type="text" class="txt" data-act="treasures" value="${esc(r.decks.tre.join(', '))}" placeholder="numbers, comma separated" style="width:100%">`
    : r.decks.tre.map(n => chip(n)).join('');
  return `
  <div class="grid">
    <div class="card"><h3>Party</h3>${kv('Average level', val(true, r.party.avg, num('party', 'avg', r.party.avg, { min: 1, max: 9 })))}
      ${kv('Difficulty', `${esc(r.party.diffName || '')} ` + val(true, r.party.diff, num('party', 'diff', r.party.diff, { min: -3, max: 5 })))}
      ${kv('Scenario level', esc(scenarioLevel(r.party)))}${kv('Inspiration', val(true, r.party.insp, num('party', 'insp', r.party.insp, { min: 0, max: 99 })))}</div>
    <div class="card"><h3>Prosperity</h3>${kv('Checkmarks', val(true, r.pros, num('pros', 'pros', r.pros, { min: 0, max: 90 })))}${kv('Level', esc(prosperityLevel(r.pros)))}</div>
    <div class="card"><h3>Reputation</h3>${rep('Demons', 'demons')}${rep('Merchants', 'merchants')}${rep('City Guard', 'guard')}</div>
    <div class="card"><h3>Scenarios</h3>${SCN_STATE_NAME.map((n, i) => kv(n, esc(counts[i] || 0))).join('')}${kv('Total', esc(SCENARIOS.length))}</div>
  </div>
  <h2>Stickers</h2>${r.stk.length ? `<div class="chips">${r.stk.map(s => chip(s, known.has(String(s).toLowerCase()) ? 'ok' : 'warn')).join('')}</div>` : none}
  <h2>Unlocked classes (${r.cls.length})</h2><div class="chips">${r.cls.map(c => chip(c, classByName(c) ? '' : 'warn')).join('')}</div>
  <h2>Players</h2>${r.players.length ? `<div class="chips">${r.players.map(p => chip(p.name)).join('')}</div>` : none}
  <h2>Retired</h2>${r.retired.length ? table(['Class', 'Player', 'Name', 'Lv', 'Perks', 'Masteries'],
    r.retired.map(x => `<tr><td>${esc(x.cls)}</td><td>${esc(x.player ?? '')}</td><td>${esc(x.name ?? '')}</td><td>${esc(x.lv ?? '')}</td><td>${esc(x.perks ?? '')}</td><td>${esc(x.masteries ?? '')}</td></tr>`)) : none}
  <h2>Enhancements (${r.enh.length})</h2>${r.enh.length ? table(['Class', 'Card', 'Top', 'Bottom'],
    r.enh.map(x => `<tr><td>${esc(x.cls)}</td><td>${esc(x.card)}</td><td>${esc(x.top ?? '')}</td><td>${esc(x.bottom ?? '')}</td></tr>`)) : none}
  <h2>Decks</h2><div class="grid">
    <div class="card"><h3>Battle goals drawn (${r.decks.bg.length}/${BATTLE_GOALS.length})</h3><div class="chips">${bgBody}</div></div>
    <div class="card"><h3>Treasures claimed (${r.decks.tre.length})</h3><div class="chips">${treBody}</div></div>
    <div class="card"><h3>Medical packs (${r.decks.mp.length})</h3><div class="chips">${medBody}</div></div></div>
  ${editing ? '<p class="hint">Stickers, classes, players, retirements and enhancements are not editable yet.</p>' : ''}`;
}

// --- the scenario flowchart -------------------------------------------------------------------------------------------------
// Layout in scripts/campaign/flow.js. Spoilers: "Progress" draws the scenarios that are unlocked, completed or locked out, plus the
// locked ones they lead to; locked scenarios are drawn as "?" (name and number only in edit mode), as locked items are.
const FLOW_ZOOM = { s: 0.6, m: 0.85, l: 1.2 };
const scnViewToggle = () => `<div class="imgmode viewmode" role="group" aria-label="Scenario view">${[['table', 'Table'], ['flow', 'Flowchart']].map(([v, l]) => `<button type="button" data-scnview="${v}" aria-pressed="${view.scnView === v}">${l}</button>`).join('')}</div>`;

function flowPage(r) {
  const st = n => r.scn[String(n)]?.s ?? 0;
  const byN = new Map(SCENARIOS.map(s => [s.n, s]));
  let vis;
  if (view.flowShow === 'all') vis = new Set(SCENARIOS.map(s => s.n));
  else {
    vis = new Set(SCENARIOS.filter(s => st(s.n) > 0).map(s => s.n));
    for (const s of SCENARIOS) if (st(s.n) === 1 || st(s.n) === 2) for (const t of s.unl || []) vis.add(t);
  }
  if (view.flowLane) vis = new Set([...vis].filter(n => laneOf(byN.get(n)) === view.flowLane));
  const g = buildFlow(SCENARIOS, vis);
  const z = FLOW_ZOOM[view.flowZoom];
  const masked = n => st(n) === 0 && !editing;
  const filters = `<div class="filters">${scnViewToggle()}
    <select id="flowShow">${[['progress', 'Progress and next steps'], ['all', 'All scenarios']].map(([v, l]) => `<option value="${v}" ${view.flowShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select id="flowLane"><option value="">All storylines</option>${LANES.map(l => `<option ${view.flowLane === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
    <div class="imgmode viewmode" role="group" aria-label="Chart size">${[['s', 'S'], ['m', 'M'], ['l', 'L']].map(([k, l]) => `<button type="button" data-flowzoom="${k}" aria-pressed="${view.flowZoom === k}" title="Chart size ${l}">${l}</button>`).join('')}</div></div>`;
  if (!g.nodes.length) return filters + '<div class="empty">No scenarios to show yet.</div>';
  const legend = `<div class="flowlegend">${SCN_STATE_NAME.map((n, i) => `<span><i class="fk s${i}"></i>${esc(n)}</span>`).join('')}<span class="hint">Click a scenario for details. Locked scenarios are shown as ?.</span></div>`;
  const lanes = g.lanes.map((l, i) => `<rect class="flane${i % 2 ? ' alt' : ''}" x="0" y="${l.y}" width="${g.width}" height="${l.h}"/><text class="flabel" x="8" y="${l.y + 18}">${esc(l.name)}</text>`).join('');
  const edges = g.edges.map(e => `<path class="fedge${st(e.from) === 2 ? ' on' : ''}" d="${e.d}" marker-end="url(#farrow)"/>`).join('');
  const nodes = g.nodes.map(n => {
    const s = byN.get(n.n), hide = masked(n.n), name = String(s.name || '');
    const label = hide ? '?' : name.length > 21 ? name.slice(0, 20) + '…' : name;
    return `<g class="fnode s${st(n.n)}${hide ? ' mask' : ''}${view.scnSel === n.n ? ' sel' : ''}" data-flow="${n.n}" tabindex="0" role="button" transform="translate(${n.x},${n.y})"><title>${hide ? 'Locked' : esc(`${s.n} ${name}`)}</title>
      <rect width="${n.w}" height="${n.h}" rx="8"/>${hide ? `<text class="fq" x="${n.w / 2}" y="${n.h / 2 + 6}" text-anchor="middle">?</text>`
        : `<text class="fnum" x="8" y="14">${esc(s.n)}</text><text class="fname" x="8" y="31">${esc(label)}</text>`}</g>`;
  }).join('');
  const svg = `<svg class="flowsvg" width="${Math.round(g.width * z)}" height="${Math.round(g.height * z)}" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="Scenario flowchart">
    <defs><marker id="farrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="farrowhead"/></marker></defs>${lanes}${edges}${nodes}</svg>`;
  return filters + legend + `<div class="flowwrap">${svg}</div>` + flowDetail(r);
}

// Details of the selected scenario under the chart.
function flowDetail(r) {
  const n = view.scnSel, s = SCENARIOS.find(x => x.n === n);
  if (!s) return '';
  const x = r.scn[String(n)] || { s: 0 };
  if (x.s === 0 && !editing) return '<div class="card flowdetail"><h3>Locked scenario</h3><p class="hint">This scenario is not unlocked yet.</p></div>';
  const cls = k => { const v = r.scn[String(k)]?.s ?? 0; return v === 2 ? 'ok' : v === 1 ? 'info' : 'dim'; };
  const nm = k => (r.scn[String(k)]?.s || editing ? `${k} ${SCENARIOS.find(y => y.n === k)?.name ?? ''}` : '?');
  return `<div class="card flowdetail"><h3>${esc(s.n)} ${esc(s.name)}</h3>
    ${kv('Storyline', esc(laneOf(s)))}${kv('State', `<span class="s${x.s}">${esc(SCN_STATE_NAME[x.s])}</span>`)}
    ${x.s === 2 ? kv('Level / party', esc(`${x.l ?? '?'} / ${x.p ?? '?'}`)) + kv('Date', esc(x.d ?? '')) : ''}
    ${kv('Unlocks', (s.unl || []).map(k => chip(nm(k), cls(k))).join('') || '<span class="hint">no scenario</span>')}
    ${kv('Unlocked by', unlockedBy(s.n).map(k => chip(nm(k), cls(k))).join('') || '<span class="hint">no scenario (event, reputation or quest)</span>')}</div>`;
}

function scenarios(r) {
  if (view.scnView === 'flow') return flowPage(r);
  const q = view.scnSearch.toLowerCase();
  const rows = SCENARIOS.filter(s => {
    const st = r.scn[String(s.n)]?.s ?? 0;
    if (view.scnStatus !== '' && String(st) !== view.scnStatus) return false;
    return !q || `${s.n} ${s.name} ${s.area || ''}`.toLowerCase().includes(q);
  });
  const stateClass = n => { const s = r.scn[String(n)]?.s ?? 0; return s === 2 ? 'ok' : s === 1 ? 'info' : 'dim'; };
  const filters = `<div class="filters">${scnViewToggle()}
    <select id="scnStatus"><option value="">All states</option>${SCN_STATE_NAME.map((n, i) => `<option value="${i}" ${view.scnStatus === String(i) ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <input id="scnSearch" type="search" placeholder="Search number, name, area" value="${esc(view.scnSearch)}"></div>`;
  return filters + table(['#', 'Name', 'Area', 'State', 'Lv', 'Party', 'Chests', 'Date', 'Unlocks', 'Unlocked by'], rows.map(s => {
    const x = r.scn[String(s.n)] || { s: 0 };
    const done = x.s === 2;
    const stateCell = editing
      ? `<select data-act="scnState" data-id="${esc(s.n)}">${SCN_STATE_NAME.map((n, i) => `<option value="${i}" ${x.s === i ? 'selected' : ''}>${n}</option>`).join('')}</select>`
      : SCN_STATE_NAME[x.s];
    const field = (key, shown, input) => (editing && done ? input : esc(shown ?? ''));
    return `<tr><td>${esc(s.n)}</td><td>${esc(s.name)}</td><td>${esc(s.area ?? '')}</td><td class="s${x.s}">${stateCell}</td>
      <td>${field('l', x.l, num('scnRes', 'l', x.l, { min: 0, max: 7, id: s.n, width: 44 }))}</td>
      <td>${field('p', x.p, num('scnRes', 'p', x.p, { min: 1, max: 4, id: s.n, width: 44 }))}</td>
      <td>${field('ch', (x.ch || []).join(', '), `<input type="text" class="txt" style="width:80px" data-act="scnRes" data-key="ch" data-id="${esc(s.n)}" value="${esc((x.ch || []).join(', '))}">`)}</td>
      <td>${field('d', x.d, `<input type="date" class="txt" data-act="scnRes" data-key="d" data-id="${esc(s.n)}" value="${esc(x.d ?? '')}">`)}</td>
      <td>${(s.unl || []).map(n => chip(n, stateClass(n))).join('')}</td><td>${unlockedBy(s.n).map(n => chip(n, stateClass(n))).join('')}</td></tr>`;
  })) + (editing ? '<p class="hint">Completing a scenario also unlocks the scenarios it links to. Setting a scenario back to Locked clears its result.</p>' : '');
}

function benchList(c) {
  const bench = [...c.bench].sort(byInitiative);
  if (imgMode === 'always') {
    return `<div class="benchgrid">${bench.map(id => {
      const card = cardById.get(id);
      return `<figure class="benchcard">${cardPicture(card, id)}<figcaption>${iniTag(card)}${esc(pretty(card?.slug ?? id))}</figcaption></figure>`;
    }).join('')}</div>`;
  }
  return `<div class="chips">${bench.map(id => {
    const card = cardById.get(id), url = cardImageUrl(card);
    return `<span class="chip dim"${url ? ` data-img="${esc(url)}"` : ''}>${iniTag(card)}${esc(pretty(card?.slug ?? id))}</span>`;
  }).join('')}</div>`;
}

// --- ability card areas: hand, discard, lost (cards move by drag and drop or the row buttons) ---------------------

const AREA_TITLE = { hand: 'Hand', discard: 'Discard', lost: 'Lost' };

// Initiative number shown in front of a card name; a dash when the number is not known for that class yet.
const iniTag = card => `<span class="ini${card?.ini == null ? ' none' : ''}" title="Initiative">${card?.ini ?? '&ndash;'}</span>`;

// Lowest initiative first; cards with no known initiative go last, keeping their deck order (Array.sort is stable).
const iniOf = id => cardById.get(id)?.ini ?? Infinity;
const byInitiative = (a, b) => (iniOf(a) === iniOf(b) ? 0 : iniOf(a) < iniOf(b) ? -1 : 1);

// An <img> that falls back to the card name when the picture is missing (see the 'error' listener below).
function cardPicture(card, id) {
  const url = cardImageUrl(card);
  const name = pretty(card?.slug ?? id);
  return url ? `<img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`;
}

function cardRow(c, id, area) {
  const card = cardById.get(id);
  const url = cardImageUrl(card);
  const active = area === 'hand' && c.act.includes(id);
  const label = `${iniTag(card)}<span class="cname">${esc(pretty(card?.slug ?? id))}</span>${active ? '<span class="badge">active</span>' : ''}`;
  if (imgMode === 'always') {
    return `<li class="cardrow tile${active ? ' is-active' : ''}" data-card="${id}" data-char="${esc(c.id)}" draggable="true">
      ${cardPicture(card, id)}<div class="tilebar">${label}</div></li>`;
  }
  return `<li class="cardrow${active ? ' is-active' : ''}" data-card="${id}" data-char="${esc(c.id)}"${url ? ` data-img="${esc(url)}"` : ''} draggable="true">${label}</li>`;
}

function deckZones(c) {
  if (!c.deck.length) return '<div class="hint">no cards yet</div>';
  const out = { discard: new Set(c.disc), lost: new Set(c.lost) };
  const lists = {
    hand: c.deck.filter(id => !out.discard.has(id) && !out.lost.has(id)).sort(byInitiative),
    discard: c.deck.filter(id => out.discard.has(id)).sort(byInitiative),
    lost: c.deck.filter(id => out.lost.has(id)).sort(byInitiative),
  };
  return `<div class="zones">${['hand', 'discard', 'lost'].map(area => `
    <div class="zone" data-zone="${area}" data-char="${esc(c.id)}">
      <h4>${AREA_TITLE[area]} <span>${lists[area].length}</span></h4>
      <ul class="${imgMode === 'always' ? 'tiles' : ''}">${lists[area].map(id => cardRow(c, id, area)).join('') || '<li class="empty-row">empty</li>'}</ul>
    </div>`).join('')}</div><p class="hint">Drag cards between the areas. No need to switch on Edit.</p>`;
}

// Traits the class brings that are not on the sheet's list yet, the species (Vermling, Quatryl, ...) among them. Events check
// them like traits.
function classTraits(c) {
  const own = new Set((c.traits || []).map(t => String(t).toLowerCase()));
  const special = new Set((c.special || []).map(t => String(t).toLowerCase()));
  return [...characterTraits(c)].filter(t => !own.has(t) && !special.has(t)).map(pretty);
}

function characterCard(c) {
  const cls = classByName(c.cls);
  const faces = c.am?.faces || [];
  const inDeck = faces.filter(f => !f.out).length;
  const stat = (label, key, max, min = 0) => kv(label, val(true, c[key] ?? '', num('char', key, c[key], { min, max, id: c.id, width: 64 })));
  const nameCell = editing
    ? `<input type="text" class="txt" data-act="charName" data-id="${esc(c.id)}" value="${esc(c.name)}" maxlength="30" style="width:160px">`
    : esc(c.name);
  return `<div class="card">
    <h3>${nameCell} <span style="color:var(--muted)">${esc(c.cls)} (${cls ? esc(cls.src.toUpperCase()) : '?'})</span></h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">${stat('Level', 'lv', 9, 1)}${stat('XP', 'xp', 9999)}${stat('Gold', 'gold', 9999)}${stat('Inherited', 'inh', 9999)}${stat('Hand size', 'hand', 20, 1)}</div>
    <div class="pile"><b>Traits</b>${(c.traits || []).map(t => chip(t)).join('') || '<span class="hint">none</span>'}${classTraits(c).map(t => chip(t)).join('')}${(c.special || []).map(t => chip(specialName(t), 'info')).join('')}${(c.extra || []).map(t => chip(t, 'dim')).join('')}
      <button type="button" class="editbtn editicon traitedit" data-trait-edit="${esc(c.id)}" aria-label="Special traits of ${esc(c.name)}" title="Special traits (Hero, Indebted, ...)">${PENCIL}</button></div>
    <div class="pile"><b>Deck (${c.deck.length} cards)</b>${c.hand ? `hand size ${esc(c.hand)}` : ''}</div>
    ${deckZones(c)}
    <div class="pile"><b>Other owned cards (${c.bench.length})</b></div>
    ${benchList(c)}
    <div class="pile"><b>Items (${c.items.length})</b></div>
    <div class="chips">${c.items.map(it => `<span class="chip ${(it.st || []).some(Boolean) ? 'warn' : ''}" title="tick states ${esc((it.st || []).join('/'))}">${esc(pretty(itemById.get(it.id)?.slug ?? it.id))}</span>`).join('')}</div>
    <div class="pile"><b>Modifier deck</b> ${inDeck} of ${faces.length} cards in the deck${c.am?.n != null ? ` (sheet count ${esc(c.am.n)})` : ''}</div>
    <div class="chips">${faces.map(f => `<span class="chip ${f.out ? 'dim' : ''}">${esc(f.f)}</span>`).join('')}</div>
  </div>${editing ? '<p class="hint">Cards, items and the modifier deck are not editable here yet.</p>' : ''}`;
}

// The Mercenaries tab: a sub-tab bar (one per character and '+') above the selected character or the add form.
function mercenaries(r) {
  const cur = currentSub();
  const bar = `<nav class="subtabs" role="tablist">${subTabList().map(t =>
    `<button type="button" role="tab" aria-selected="${t.id === cur}" data-sub="${esc(t.id)}"${t.title ? ` title="${esc(t.title)}"` : ''}>${esc(t.label)}</button>`).join('')}</nav>`;
  const toggle = `<div class="imgmode" role="group" aria-label="Card images"><span>Card images</span>${
    [['hover', 'Hover'], ['always', 'Always']].map(([m, l]) => `<button type="button" data-imgmode="${m}" aria-pressed="${imgMode === m}">${l}</button>`).join('')}${imgMode === 'hover' ? '<span class="ctrlhint">Hold Ctrl over a card</span>' : ''}</div>`;
  return `<div class="subbar">${bar}${toggle}</div>` + (cur === 'add' ? addTab(r) : characterTab(r, cur));
}

function characterTab(r, cid) {
  const c = r.chars.find(x => x.id === cid);
  return c ? characterCard(c) : '<div class="empty">Character not found.</div>';
}

// The "+" tab: add a character (up to ed.MAX_CHARACTERS) from the classes not yet in play.
function addTab(r) {
  const unlocked = new Set(r.cls.map(n => n.toLowerCase()));
  const isOpen = c => unlocked.has(c.name.toLowerCase());
  const opts = [...ed.availableClasses(r)]
    .sort((a, b) => (isOpen(b) - isOpen(a)) || a.name.localeCompare(b.name))
    .map(c => `<option value="${esc(c.name)}">${esc(c.name)}${isOpen(c) ? '' : ' (locked)'}</option>`).join('');
  return `<div class="card" style="max-width:420px">
    <h3>Add a character (${r.chars.length} of ${ed.MAX_CHARACTERS})</h3>
    <form id="addChar">
      <label class="field">Class <select name="cls" required>${opts}</select></label>
      <label class="field">Name <input name="name" type="text" maxlength="30" required autocomplete="off"></label>
      <button type="submit" class="primary">Add character</button>
    </form>
    <p class="hint">A new character starts at level 1 with no cards or items. Classes already in play are not listed; locked classes are listed last.</p>
  </div>`;
}

function items(r) {
  const slots = [...new Set(ITEMS.map(i => i.slot).filter(Boolean))].sort();
  const rows = ITEMS.filter(i => {
    if (view.itemSlot && i.slot !== view.itemSlot) return false;
    if (view.itemShow === 'unlocked' && !r.items.unl.includes(i.id)) return false;
    if (view.itemShow === 'shop' && shopCopies(r, i) === 0) return false;
    // Search the item name. Locked items are never matched by name, so a search cannot reveal them.
    const q = view.itemSearch.trim().toLowerCase();
    if (q && !(r.items.unl.includes(i.id) && pretty(i.slug).toLowerCase().includes(q) || String(i.id).toLowerCase() === q)) return false;
    return true;
  });
  const filters = `<div class="filters"><select id="itemSlot"><option value="">All slots</option>${slots.map(s => `<option ${view.itemSlot === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
    <select id="itemShow">${[['all', 'All items'], ['unlocked', 'Unlocked'], ['shop', 'In the shop']].map(([v, l]) => `<option value="${v}" ${view.itemShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <input id="itemSearch" type="search" placeholder="Search item name" value="${esc(view.itemSearch)}">
    <button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing items' : 'Edit items'}" title="${editing ? 'Stop editing items' : 'Edit items'}">${PENCIL}</button></div>`;
  const viewToggle = `<div class="imgmode viewmode" role="group" aria-label="Items view">${
    [['list', 'Table'], ['grid', 'Cards']].map(([m, l]) => `<button type="button" data-itemview="${m}" aria-pressed="${view.itemView === m}">${l}</button>`).join('')}${view.itemView === 'grid' ? `<span class="sizesel">${[['s', 'S'], ['m', 'M'], ['l', 'L']].map(([k, l]) => `<button type="button" data-itemsize="${k}" aria-pressed="${view.itemSize === k}" title="Tile size ${l}">${l}</button>`).join('')}</span>` : ''}<span class="ctrlhint">${rows.length} items${view.itemView === 'list' ? ' · hold Ctrl over a row for the card' : ''}</span></div>`;
  const holders = id => r.chars.filter(c => c.items.some(i => i.id === id)).map(c => c.name).join(', ');
  if (view.itemView === 'grid') {
    // Pictures of the filtered items. Locked items have no picture (a placeholder, with the number in edit mode) and are dimmed; the badge shows copies in the shop / total.
    return filters + viewToggle + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.itemSize]}px">${rows.map(i => {
      const unl = r.items.unl.includes(i.id);
      const secret = !unl && !editing;              // players must not see locked items: no picture, no name
      const name = unl ? pretty(i.slug) : 'Locked item', url = unl ? itemImageUrl(i) : null;   // no picture and no name for a locked item, in edit mode too
      const pic = url ? `<img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg secretpic">${unl ? esc(name) : editing ? `#${esc(i.id)}` : '?'}</div>`;
      const w = holders(i.id);
      const tog = editing ? `<button type="button" class="chip" data-act="itemToggle" data-id="${esc(i.id)}" title="${unl ? 'Lock this item' : 'Unlock this item'}">${unl ? 'Lock' : 'Unlock'}</button>` : '';
      return `<figure class="itemtile${unl ? '' : ' locked'}" title="${unl ? esc(`${i.id} ${name}`) : esc(String(i.id))}">${pic}
        <figcaption><span class="cname">${esc(name)}</span>${tog || `<span class="badge">${unl ? `${esc(shopCopies(r, i))}/${esc(i.n)}` : 'locked'}</span>`}</figcaption>${w && !secret ? `<div class="itemwith">${esc(w)}</div>` : ''}</figure>`;
    }).join('')}</div>` : none);
  }
  // Sortable columns: click a header to sort ascending, again for descending, a third time for the default order.
  // A locked item sorts by what the viewer sees ("Locked item"), so sorting cannot reveal its identity.
  const shownName = i => r.items.unl.includes(i.id) ? pretty(i.slug) : 'Locked item';
  const SORT = {
    id: i => (typeof i.id === 'number' ? [0, i.id] : [1, String(i.id)]),
    name: i => shownName(i).toLowerCase(),
    slot: i => i.slot ?? '',
    kind: i => i.kind ?? '',
    unl: i => (r.items.unl.includes(i.id) ? 1 : 0),
    n: i => i.n || 0,
    used: i => (r.items.unl.includes(i.id) ? itemsInUse(r, i) : -1),
    shop: i => (r.items.unl.includes(i.id) ? shopCopies(r, i) : -1),
    with: i => holders(i.id).toLowerCase(),
  };
  const cmp = (a, b) => (Array.isArray(a) ? (a[0] - b[0] || (typeof a[1] === 'number' ? a[1] - b[1] : String(a[1]).localeCompare(String(b[1])))) : typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
  const { col, dir } = view.itemSort;
  if (SORT[col]) rows.sort((x, y) => dir * cmp(SORT[col](x), SORT[col](y)) || cmp(SORT.id(x), SORT.id(y)));
  const head = [['id', '#'], ['name', 'Item'], ['slot', 'Slot'], ['kind', 'Type'], ['unl', 'Unlocked'], ['n', 'Copies'], ['used', 'In use'], ['shop', 'In shop'], ['with', 'With']]
    .map(([k, l]) => `<button type="button" class="sortbtn" data-itemsort="${k}" title="Sort by ${esc(l.toLowerCase())}">${l}${col === k ? (dir > 0 ? ' &#9650;' : ' &#9660;') : ''}</button>`);
  return filters + viewToggle + table(head, rows.map(i => {
    const unl = r.items.unl.includes(i.id);
    const unlCell = editing ? `<input type="checkbox" data-act="itemUnl" data-id="${esc(i.id)}" ${unl ? 'checked' : ''}>` : `<input type="checkbox" disabled ${unl ? 'checked' : ''} aria-label="${unl ? 'unlocked' : 'locked'}">`;
    const usedCell = unl ? esc(itemsInUse(r, i)) : '';   // calculated from the character tabs, not editable
    const pic = (unl || editing) && itemImageUrl(i);   // locked items stay hidden for players
    return `<tr class="${unl ? '' : 's0'}"${pic ? ` data-img="${esc(pic)}"` : ''}><td>${esc(i.id)}</td><td>${unl ? esc(pretty(i.slug)) : 'Locked item'}</td><td>${esc(i.slot ?? '')}</td><td>${esc(i.kind === 'qm' ? 'QM' : i.kind)}</td>
      <td>${unlCell}</td><td>${esc(i.n)}</td><td>${usedCell}</td><td>${unl ? esc(shopCopies(r, i)) : ''}</td><td>${esc(holders(i.id))}</td></tr>`;
  }));
}

function events(r) { return eventsHtml(r); }

// Attack modifier faces are drawn by scripts/amd/card.js as DOM elements: the page leaves a slot per card (data-am) and
// hydrateAm() fills the slots after the page HTML is set.
let amSlots = [];
const AM_KEY = { '+0': 'p0', '+1': 'p1', '-1': 'm1', '+2': 'p2', '-2': 'm2', x2: 'x2', null: 'miss' };   // keys of scripts/amd/heroDeck.js
const AM_STANDARD = [['+0', 6], ['+1', 5], ['-1', 5], ['+2', 1], ['-2', 1], ['x2', 1], ['null', 1]];
function hydrateAm() {
  main.querySelectorAll('[data-am]').forEach(el => {
    const s = amSlots[Number(el.dataset.am)];
    if (s) el.replaceChildren(buildCard(s.card, s.className, s.isAdded));
  });
}

// The card browser: ability cards of the classes the campaign has unlocked; the Show filter switches to all classes.
// With "unlocked" the other classes are never listed or matched by a search, so the page cannot reveal them. Filters: class, level, name. Ctrl+hover (tap on touch) enlarges a card.
function cardsPage(r) {
  const typeSel = `<select id="cardType" aria-label="Card type">${[['abilities', 'Ability cards'], ['am', 'Attack modifiers'], ['goals', 'Battle goals'], ['mats', 'Character mats'], ['events', 'Events'], ['items', 'Items'], ['monsters', 'Monster abilities'], ['stats', 'Monster stat cards'], ['pq', 'Personal quests']].map(([v, l]) => `<option value="${v}" ${view.cardType === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const showSel = `<select id="cardShow">${[['unlocked', { items: 'Unlocked items', goals: 'Drawn goals', events: 'Discarded events', am: 'Unlocked classes', mats: 'Unlocked classes' }[view.cardType] || 'Unlocked classes'], ['all', { items: 'All items', goals: 'All goals', events: 'All events' }[view.cardType] || 'All classes']].map(([v, l]) => `<option value="${v}" ${view.cardShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const sizeBar = n => `<div class="imgmode viewmode" role="group" aria-label="Tile size">${[['s', 'S'], ['m', 'M'], ['l', 'L']].map(([k, l]) => `<button type="button" data-cardsize="${k}" aria-pressed="${view.cardSize === k}" title="Tile size ${l}">${l}</button>`).join('')}<span class="ctrlhint">${n} cards &middot; hold Ctrl over a card to enlarge it</span></div>`;
  if (view.cardType === 'stats') {
    // Monster stat cards of the 50 Gloomhaven 2nd Edition monsters, one picture per monster level 0 to 7 (300x162, so the tiles are wider
    // than for other cards). No unlocked state for monsters: no Show filter. A search matches the monster name.
    const monsters = ghConfig.monsters.filter(m => m.game === 'gh2').sort((a, b) => a.title.localeCompare(b.title));
    if (view.cardMon && !monsters.some(m => m.title === view.cardMon)) view.cardMon = '';
    const q = view.cardSearch.trim().toLowerCase();
    const levels = view.cardMLv === '' ? [0, 1, 2, 3, 4, 5, 6, 7] : [Number(view.cardMLv)];
    const rows = monsters.filter(m => (!view.cardMon || m.title === view.cardMon) && (!q || m.title.includes(q)))
      .flatMap(m => levels.map(l => ({ m, l })));
    const filters = `<div class="filters">${typeSel}<select id="cardMon"><option value="">All monsters</option>${monsters.map(m => `<option value="${esc(m.title)}" ${view.cardMon === m.title ? 'selected' : ''}>${esc(pretty(m.title.replace(/ /g, '-')))}${m.boss ? ' (boss)' : ''}</option>`).join('')}</select>
      <select id="cardMLv"><option value="">All levels</option>${[0, 1, 2, 3, 4, 5, 6, 7].map(l => `<option value="${l}" ${view.cardMLv === String(l) ? 'selected' : ''}>Level ${l}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Monster name" value="${esc(view.cardSearch)}"></div>`;
    // Fixed card widths (a stretching grid made S and M look the same): S 200, M 300 (the picture's own width), L 420 px.
    const w = { s: 200, m: 300, l: 420 }[view.cardSize];
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="grid-template-columns:repeat(auto-fill,minmax(min(${w}px,100%),${w}px))">${rows.map(({ m, l }) => {
      const url = new URL(`../images/gh2/monsters/stats/${m.title.replace(/ /g, '_').toLowerCase()}_${l}.png`, import.meta.url).href;
      const name = `${pretty(m.title.replace(/ /g, '-'))} level ${l}`;
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="450" title="${esc(name)}: Ctrl+hover to enlarge"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span>${m.boss ? '<span class="badge">boss</span>' : ''}</figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  if (view.cardType === 'pq') {
    // Personal quest cards (440x600 pictures). The record holds no quest assignments and a quest is secret to its player, so
    // there is no Show filter: all 22 cards are listed.
    const q = view.cardSearch.trim().toLowerCase();
    const rows = PERSONAL_QUESTS.filter(p => !q || String(p.id) === q || p.slug.toLowerCase() === q);
    const filters = `<div class="filters">${typeSel}<input id="cardSearch" type="search" placeholder="Quest number" value="${esc(view.cardSearch)}"></div>`;
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize]}px">${rows.map(p => {
      const url = pqImageUrl(p), name = `Personal quest ${p.id}`;
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="440" title="${esc(name)}: Ctrl+hover to enlarge"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  if (view.cardType === 'monsters') {
    // Monster ability cards (the 31 decks of the app, 600x400 pictures in images/gh2/monsters/monster-abilities/). There is no
    // unlocked state for monsters, so the Show filter is left out.
    const decks = Object.keys(GH_DECKS).sort((a, b) => a.localeCompare(b));
    if (view.cardDeck && !GH_DECKS[view.cardDeck]) view.cardDeck = '';
    const q = view.cardSearch.trim().toLowerCase();
    const rows = decks.filter(d => (!view.cardDeck || d === view.cardDeck) && (!q || pretty(d).toLowerCase().includes(q)))
      .flatMap(d => GH_DECKS[d].map(c => ({ deck: d, ...c })));
    const filters = `<div class="filters">${typeSel}<select id="cardDeck"><option value="">All monster decks</option>${decks.map(d => `<option value="${esc(d)}" ${view.cardDeck === d ? 'selected' : ''}>${esc(pretty(d))}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Monster name" value="${esc(view.cardSearch)}"></div>`;
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize] + 90}px">${rows.map(c => {
      const url = new URL(`../images/gh2/monsters/monster-abilities/gh2-ma-${c.deck}-${c.n}.webp`, import.meta.url).href, name = `${pretty(c.deck)} ${c.n}`;
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="600" title="${esc(name)}: Ctrl+hover to enlarge"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span><span class="badge" title="Initiative ${c.init}${c.s ? ', shuffle' : ''}">${esc(c.init)}${c.s ? ' &#8635;' : ''}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  if (view.cardType === 'mats') {
    // Character mats of the campaign's classes, front or back (the back shows the hit points and the like).
    const mine = new Set(r.cls.map(n => n.toLowerCase()));
    const classes = CLASSES.filter(c => view.cardShow === 'all' || mine.has(c.name.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
    const q = view.cardSearch.trim().toLowerCase();
    const rows = classes.filter(c => (!view.cardCls || c.name === view.cardCls) && (!q || c.name.toLowerCase().includes(q)));
    if (view.cardCls && !classes.some(c => c.name === view.cardCls)) view.cardCls = '';
    const filters = `<div class="filters">${typeSel}${showSel}<select id="cardCls"><option value="">All classes</option>${classes.map(c => `<option value="${esc(c.name)}" ${view.cardCls === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
      <select id="cardSide">${[['front', 'Front'], ['back', 'Back']].map(([v, l]) => `<option value="${v}" ${view.cardSide === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Class name" value="${esc(view.cardSearch)}"></div>`;
    // Fixed card widths (a stretching grid made M and L look the same): S 300, M 450, L 600 px (the picture's own width).
    const w = { s: 300, m: 450, l: 600 }[view.cardSize];
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="grid-template-columns:repeat(auto-fill,minmax(min(${w}px,100%),${w}px))">${rows.map(c => {
      const url = matImageUrl(c.name, view.cardSide);
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="600" title="${esc(c.name)}: click to open the full image, Ctrl+hover to enlarge"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><img class="cardpic" src="${esc(url)}" alt="${esc(c.name)}" loading="lazy" draggable="false"></a><figcaption><span class="cname">${esc(c.name)}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  if (view.cardType === 'am') {
    // Attack modifiers: the standard deck, and per class the faces its perks add or remove (the plain cards are the same for all).
    const mine = new Set(r.cls.map(n => n.toLowerCase()));
    const classes = CLASSES.filter(c => (view.cardShow === 'all' || mine.has(c.name.toLowerCase())) && heroPerkClass(c.name)).sort((a, b) => a.name.localeCompare(b.name));
    if (view.cardCls && view.cardCls !== '*' && !classes.some(c => c.name === view.cardCls)) view.cardCls = '';
    const q = view.cardSearch.trim().toLowerCase();
    amSlots = [];
    const tiles = [];
    const add = (card, className, isAdded, label, sub) => {
      if (q && !`${label} ${sub}`.toLowerCase().includes(q)) return;
      amSlots.push({ card, className, isAdded });
      tiles.push(`<figure class="itemtile amtile" title="${esc(`${sub}: ${label}`)}"><div data-am="${amSlots.length - 1}"></div><figcaption><span class="cname">${esc(label)}</span><span class="badge">${esc(sub)}</span></figcaption></figure>`);
    };
    if (!view.cardCls || view.cardCls === '*') for (const [v, n] of AM_STANDARD) add({ kind: 'base', value: v }, null, false, v === 'null' ? 'Miss' : v, `Standard ×${n}`);
    if (view.cardCls !== '*') for (const c of classes) {
      if (view.cardCls && view.cardCls !== c.name) continue;
      const seen = new Set();
      for (const e of heroCatalog(c.name, AM_STANDARD.map(([v, n]) => ({ key: AM_KEY[v], value: v, count: n }))).filter(x => x.extra)) {
        if (seen.has(e.key)) continue;
        seen.add(e.key);
        add(e.card, c.name, true, e.card.kind === 'base' ? e.card.value : e.face, c.name);
      }
    }
    const filters = `<div class="filters">${typeSel}${showSel}<select id="cardCls"><option value="">All classes and standard</option><option value="*" ${view.cardCls === '*' ? 'selected' : ''}>Standard deck only</option>${classes.map(c => `<option value="${esc(c.name)}" ${view.cardCls === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Face or class" value="${esc(view.cardSearch)}"></div>`;
    return filters + sizeBar(tiles.length) + (tiles.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize] + 50}px">${tiles.join('')}</div>` : none);
  }
  if (view.cardType === 'events') {
    // Event card fronts (the outcome faces are not shown). "Unlocked" means the discarded cards: the others are still in the deck.
    const kind = view.cardKind, out = new Set(r.events[kind].out);
    const q = view.cardSearch.trim().toLowerCase();
    const rows = EVENT_TABLE[kind].map(e => e.id).filter(id => (view.cardShow === 'all' || out.has(id))
      && (!q || String(id) === q || String(eventFront(kind, id)?.n || '').toLowerCase().includes(q)));
    const filters = `<div class="filters">${typeSel}${showSel}<select id="cardKind">${[['city', 'City events'], ['road', 'Road events']].map(([v, l]) => `<option value="${v}" ${kind === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Card number or text" value="${esc(view.cardSearch)}"></div>`;
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize] + 40}px">${rows.map(id => {
      const url = eventImageUrl(kind, id), name = `${kind === 'city' ? 'City' : 'Road'} ${id}`;
      const pic = `<img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">`;
      return `<figure class="itemtile" data-img="${esc(url)}" title="${esc(name)}">${pic}<figcaption><span class="cname">${esc(name)}</span></figcaption></figure>`;
    }).join('')}</div>` : (view.cardShow === 'all' ? none : '<div class="empty">No events discarded yet. Choose "All events" to see every card.</div>'));
  }
  if (view.cardType === 'goals') {
    // Battle goals have no pictures: a text card each. "Unlocked" means the goals drawn so far (r.decks.bg).
    const q = view.cardSearch.trim().toLowerCase();
    const rows = BATTLE_GOALS.filter(g => (view.cardShow === 'all' || r.decks.bg.includes(g.id))
      && (!view.cardChk || String(g.chk) === view.cardChk)
      && (!q || pretty(g.slug).toLowerCase().includes(q) || String(g.t || '').toLowerCase().includes(q)));
    const filters = `<div class="filters">${typeSel}${showSel}<select id="cardChk"><option value="">Any checkmarks</option>${[1, 2].map(n => `<option value="${n}" ${view.cardChk === String(n) ? 'selected' : ''}>${n} checkmark${n > 1 ? 's' : ''}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Goal name or text" value="${esc(view.cardSearch)}"></div>`;
    return filters + `<div class="imgmode viewmode"><span class="ctrlhint">${rows.length} goals</span></div>` + (rows.length ? `<div class="itemgrid" style="--tile-min:${{ s: 190, m: 230, l: 280 }[view.cardSize]}px">${rows.map(g =>
      `<figure class="itemtile bgtile" title="${esc(pretty(g.slug))}"><h4>${esc(pretty(g.slug))}</h4><p>${esc(g.t || '')}</p><span class="badge">${'&#10003;'.repeat(g.chk)}</span></figure>`).join('')}</div>` : none);
  }
  if (view.cardType === 'items') {
    const slots = [...new Set(ITEMS.map(i => i.slot).filter(Boolean))].sort();
    const q = view.cardSearch.trim().toLowerCase();
    const rows = ITEMS.filter(i => (view.cardShow === 'all' || r.items.unl.includes(i.id))
      && (!view.cardSlot || i.slot === view.cardSlot)
      && (!q || pretty(i.slug).toLowerCase().includes(q) || String(i.id).toLowerCase() === q));
    const filters = `<div class="filters">${typeSel}${showSel}<select id="cardSlot"><option value="">All slots</option>${slots.map(sl => `<option ${view.cardSlot === sl ? 'selected' : ''}>${esc(sl)}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Item name or number" value="${esc(view.cardSearch)}"></div>`;
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize]}px">${rows.map(i => {
      const url = itemImageUrl(i), name = pretty(i.slug);
      const pic = url ? `<img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`;
      return `<figure class="itemtile"${url ? ` data-img="${esc(url)}"` : ''} title="${esc(`${i.id} ${name}`)}">${pic}
        <figcaption><span class="cname">${esc(name)}</span><span class="badge">${esc(i.id)}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  const open = new Set(r.cls.map(n => n.toLowerCase()));
  const all = view.cardShow === 'all';
  const classes = CLASSES.filter(c => all || open.has(c.name.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const byIdx = new Map(classes.map(c => [c.i, c]));
  if (view.cardCls && !classes.some(c => c.name === view.cardCls)) view.cardCls = '';
  const scope = CARDS.filter(c => byIdx.has(c.cls) && (!view.cardCls || byIdx.get(c.cls).name === view.cardCls));
  if (view.cardLv && !scope.some(c => String(c.lv) === view.cardLv)) view.cardLv = '';
  // The search box takes a name and/or a level range such as "1-3" (levels 1, X, 2, 3; X is 1.5, Pack or M is last).
  let q = view.cardSearch.trim().toLowerCase(), range = null;
  const rm = q.match(/(?:^|\s)(\d|x|m|pack)\s*-\s*(\d|x|m|pack)(?=\s|$)/);
  if (rm) {
    const rank = t => lvRank(t === 'pack' ? 'M' : t === 'x' ? 'X' : t === 'm' ? 'M' : t);
    range = [Math.min(rank(rm[1]), rank(rm[2])), Math.max(rank(rm[1]), rank(rm[2]))];
    q = (q.slice(0, rm.index) + ' ' + q.slice(rm.index + rm[0].length)).trim();
  }
  const rows = CARDS.filter(c => byIdx.has(c.cls)
    && (!view.cardCls || byIdx.get(c.cls).name === view.cardCls)
    && (!view.cardLv || String(c.lv) === view.cardLv)
    && (!range || (lvRank(c.lv) >= range[0] && lvRank(c.lv) <= range[1]))
    && (!q || pretty(c.slug).toLowerCase().includes(q))).sort((a, b) => byIdx.get(a.cls).name.localeCompare(byIdx.get(b.cls).name) || lvRank(a.lv) - lvRank(b.lv) || (a.ini ?? 1e9) - (b.ini ?? 1e9) || a.slug.localeCompare(b.slug));
  // Levels offered: those of the classes in scope, so Pack (the Sawbones medical pack) appears only for All classes or Sawbones.
  const levels = [...new Set(CARDS.filter(c => byIdx.has(c.cls) && (!view.cardCls || byIdx.get(c.cls).name === view.cardCls)).map(c => String(c.lv)))].sort((a, b) => lvRank(a) - lvRank(b));
  const filters = `<div class="filters">${typeSel}${showSel}
    <select id="cardCls"><option value="">All classes</option>${classes.map(c => `<option value="${esc(c.name)}" ${view.cardCls === c.name ? 'selected' : ''}>${esc(c.name)}${open.has(c.name.toLowerCase()) ? '' : ' (locked)'}</option>`).join('')}</select>
    <select id="cardLv"><option value="">All levels</option>${levels.map(l => `<option value="${esc(l)}" ${view.cardLv === l ? 'selected' : ''}>${l === 'M' ? 'Pack' : `Level ${esc(l)}`}</option>`).join('')}</select>
    <input id="cardSearch" type="search" placeholder="Name or levels, e.g. 1-3" title="Search by name; a range like 1-3 lists levels 1, X, 2 and 3" value="${esc(view.cardSearch)}"></div>`;
  const bar = sizeBar(rows.length);
  if (!classes.length) return filters + '<div class="empty">No classes unlocked yet.</div>';
  return filters + bar + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize]}px">${rows.map(c => {
    const url = cardImageUrl(c), name = pretty(c.slug);
    return `<figure class="itemtile"${url ? ` data-img="${esc(url)}"` : ''} title="${esc(`${byIdx.get(c.cls).name}: ${name}`)}">${cardPicture(c, c.id)}
      <figcaption><span class="cname">${esc(name)}</span><span class="badge" title="${c.ini != null ? 'Initiative ' + c.ini : ''}">${esc(lvLabel(c.lv))}${c.ini != null ? ` &middot; ${c.ini}` : ''}</span></figcaption></figure>`;
  }).join('')}</div>` : none);
}

// Links of the group's workbook "Resources" sheet (scripts/games/resources.js): one row per document, one column per game.
function resources() {
  const link = u => u ? `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener noreferrer">Open</a>` : '';
  return `<h2>Resources</h2>` + table(['', ...RESOURCE_GAMES.map(([, l]) => esc(l))], RESOURCES.map(x =>
    `<tr><td>${esc(x.title)}${x.note ? ` <span class="hint" title="${esc(x.note)}">(note)</span>` : ''}</td>${RESOURCE_GAMES.map(([k]) => `<td>${link(x[k])}</td>`).join('')}</tr>`));
}

// --- render and events ------------------------------------------------------------------------------------

// --- special traits modal ----------------------------------------------------------------------------------
let traitModal = null;                                   // id of the character whose special traits are being edited
const modalRoot = document.createElement('div');
document.body.appendChild(modalRoot);
let modalFocus = '';

function renderModal() {
  const c = traitModal && record?.chars.find(x => x.id === traitModal);
  if (!c) { traitModal = null; modalRoot.innerHTML = ''; return; }
  const on = new Set(c.special || []);
  modalRoot.innerHTML = `<div class="modal" id="traitModal" role="dialog" aria-modal="true" aria-labelledby="tmTitle"><div class="modalbox">
    <h3 id="tmTitle">Special traits: ${esc(c.name)}</h3>
    <div class="modalrows">${SPECIAL_TRAITS.map(t => `<label class="modalrow"><input type="checkbox" data-sp="${esc(t.key)}" ${on.has(t.key) ? 'checked' : ''}> ${esc(t.name)}</label>`).join('')}</div>
    <div class="modalfoot"><button type="button" class="primary" data-tm-close>Close</button></div></div></div>`;
  const f = modalFocus && [...modalRoot.querySelectorAll('[data-sp]')].find(x => x.dataset.sp === modalFocus);
  (f || modalRoot.querySelector('[data-sp]'))?.focus();
}
function closeModal() { traitModal = null; modalFocus = ''; renderModal(); }
modalRoot.addEventListener('click', e => { if (e.target.id === 'traitModal' || e.target.closest('[data-tm-close]')) closeModal(); });
modalRoot.addEventListener('change', e => {
  const key = e.target.dataset?.sp;
  if (!key || !traitModal) return;
  modalFocus = key;
  commit(ed.setSpecialTrait(record, traitModal, key, e.target.checked));
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && traitModal) closeModal(); });
main.addEventListener('click', e => {
  const id = e.target.closest('[data-trait-edit]')?.dataset.traitEdit;
  if (!id) return;
  traitModal = id;
  modalFocus = '';
  renderModal();
});

function render() {
  renderTabs();
  if (!record) {
    main.innerHTML = '<div class="empty">No campaign loaded.<br>Use <b>Load file</b> to open a campaign JSON file. It is kept in this browser only.</div>';
    return;
  }
  editing = editPages.has(tab);
  saveView();
  const issues = validate(record);
  // The Items and Events pages carry their own pencil button (in the filter row / tab row); every other page gets a bar above its content.
  const pagebar = tab === 'Items' || tab === 'Events' || tab === 'Cards' || tab === 'Resources' ? '' : `<div class="pagebar"><button type="button" class="editbtn" data-pageedit aria-pressed="${editing}" title="${editing ? 'Stop editing this page' : 'Edit this page'}">${editing ? 'Done editing' : `Edit ${esc(tab.toLowerCase())}`}</button></div>`;
  const body = { Overview: overview, Scenarios: scenarios, Mercenaries: mercenaries, Items: items, Events: events, Cards: cardsPage, Resources: resources }[tab](record);
  renderModal();
  main.innerHTML = pagebar + (issues.length ? `<div class="issues">${issues.length} issue(s): ${esc(issues.slice(0, 5).join('; '))}</div>` : '') + body;
  if (tab === 'Cards' && view.cardType === 'am') hydrateAm();
}

// Edits: inputs and selects report on `change`, buttons on `click`; each maps to one pure function in edit.js.
function apply(el) {
  const { act, key, id } = el.dataset;
  const v = el.type === 'checkbox' ? el.checked : el.value;
  switch (act) {
    case 'party': return commit(ed.setParty(record, key, v));
    case 'rep': return commit(ed.setReputation(record, key, v));
    case 'pros': return commit(ed.setProsperity(record, v));
    case 'scnState': return commit(ed.setScenarioState(record, id, Number(v)));
    case 'scnRes': return commit(ed.setScenarioResult(record, id, { [key]: v }));
    case 'char': return commit(ed.setCharacter(record, id, key, v));
    case 'charName': return commit(ed.renameCharacter(record, id, v));
    case 'itemUnl': return commit(ed.setItemUnlocked(record, id, v));
    case 'itemToggle': return commit(ed.setItemUnlocked(record, id, !record.items.unl.some(u => String(u) === id)));
    case 'treasures': return commit(ed.setDeckList(record, 'tre', v));
    case 'deck': return commit(ed.toggleDeckEntry(record, key, Number(id)));
    default: return undefined;
  }
}
main.addEventListener('click', e => {
  const m = e.target.closest('[data-imgmode]')?.dataset.imgmode;
  if (m) {
    imgMode = m;
    hidePreview();
    render();
    try { localStorage.setItem('havenmap.campaign.cardImages', m); } catch { /* ignore */ }
    return;
  }
  const isz = e.target.closest('[data-itemsize]')?.dataset.itemsize;
  if (isz in ITEM_SIZES) {
    view.itemSize = isz;
    render();
    return;
  }
  const sv = e.target.closest('[data-scnview]')?.dataset.scnview;
  if (sv) { view.scnView = sv; render(); return; }
  const fz = e.target.closest('[data-flowzoom]')?.dataset.flowzoom;
  if (fz) { view.flowZoom = fz; render(); return; }
  const fn = e.target.closest('[data-flow]')?.dataset.flow;
  if (fn) { view.scnSel = Number(fn); render(); return; }
  const csz = e.target.closest('[data-cardsize]')?.dataset.cardsize;
  if (csz in ITEM_SIZES) {
    view.cardSize = csz;
    render();
    return;
  }
  const srt = e.target.closest('[data-itemsort]')?.dataset.itemsort;
  if (srt) {
    const s = view.itemSort;
    view.itemSort = s.col !== srt ? { col: srt, dir: 1 } : s.dir > 0 ? { col: srt, dir: -1 } : { col: '', dir: 1 };
    render();
    return;
  }
  const iv = e.target.closest('[data-itemview]')?.dataset.itemview;
  if (iv) {
    view.itemView = iv;
    render();
    return;
  }
  const t = e.target.closest('[data-sub]')?.dataset.sub;
  if (!t) return;
  sub = t;
  render();
  try { localStorage.setItem('havenmap.campaign.sub', t); } catch { /* ignore */ }
});
// --- card image preview (hover mode) ----------------------------------------------------------------------------
const preview = document.createElement('img');
preview.id = 'cardPreview';
preview.alt = '';
document.body.appendChild(preview);
const hoverOn = () => imgMode === 'hover' || tab === 'Items' || tab === 'Cards';   // the item list always previews on Ctrl+hover
const coarse = matchMedia('(pointer: coarse)');                 // touch: no hover, so a tap shows the picture instead
let previewUrl = '';

function hidePreview() { preview.classList.remove('show'); previewUrl = ''; }
function showPreview(url, x, y, width = 300) {
  if (url !== previewUrl) { preview.src = url; previewUrl = url; }
  const w = Math.min(width, innerWidth - 16);       // data-imgw: a card with small print is shown larger (character mats: 600, their full size)
  preview.style.width = `${w}px`;
  preview.classList.add('show');
  const h = preview.naturalHeight ? (preview.naturalHeight / preview.naturalWidth) * w : 420;
  const left = x + 18 + w > innerWidth ? Math.max(8, x - 18 - w) : x + 18;
  const top = Math.max(8, Math.min(y - 20, innerHeight - h - 8));
  preview.style.left = `${left}px`;
  preview.style.top = `${top}px`;
}
// Hover mode: the picture shows under the pointer only while Ctrl is held (so it does not pop up while moving cards).
let pointer = { x: 0, y: 0 };
const showUnderPointer = () => {
  const el = document.elementFromPoint(pointer.x, pointer.y)?.closest('[data-img]');
  if (el && main.contains(el)) showPreview(el.dataset.img, pointer.x, pointer.y, Number(el.dataset.imgw) || 300); else hidePreview();
};
main.addEventListener('mousemove', e => {
  pointer = { x: e.clientX, y: e.clientY };
  if (!hoverOn() || coarse.matches) return;
  if (e.buttons || !e.ctrlKey) { hidePreview(); return; }
  const el = e.target.closest?.('[data-img]');
  if (el) showPreview(el.dataset.img, e.clientX, e.clientY, Number(el.dataset.imgw) || 300); else hidePreview();
});
document.addEventListener('keydown', e => { if (e.key === 'Control' && hoverOn() && !coarse.matches) showUnderPointer(); });
document.addEventListener('keyup', e => { if (e.key === 'Control') hidePreview(); });
window.addEventListener('blur', hidePreview);
main.addEventListener('mouseleave', hidePreview);
main.addEventListener('dragstart', hidePreview);
main.addEventListener('click', e => {
  if (!hoverOn() || !coarse.matches || e.target.closest('button')) return;
  const el = e.target.closest('[data-img]');
  if (el) {
    const w = Math.min(Number(el.dataset.imgw) || 300, innerWidth - 16);
    showPreview(el.dataset.img, innerWidth / 2 - w / 2 - 18, 40, w);     // showPreview adds 18px to x
    e.preventDefault();                                                 // a tap shows the picture; the link to the full image is for the mouse
    e.stopPropagation();
  } else hidePreview();
});
preview.addEventListener('click', hidePreview);
// A picture that fails to load (the asset repository lacks a few cards) becomes the card name.
main.addEventListener('error', e => {
  const img = e.target;
  if (img?.tagName !== 'IMG' || !img.classList.contains('cardpic')) return;
  const d = document.createElement('div');
  d.className = 'noimg';
  d.textContent = img.alt;
  img.replaceWith(d);
}, true);

// Drag and drop of ability cards between the hand, discard and lost areas (works without edit mode: it is play, not setup).
const dragPayload = e => { try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return null; } };
main.addEventListener('dragstart', e => {
  if (evDragStart(e)) return;                    // a card row of the Events tab
  const row = e.target.closest?.('.cardrow');
  if (!row) { e.preventDefault(); return; }
  e.dataTransfer.setData('text/plain', JSON.stringify({ char: row.dataset.char, card: Number(row.dataset.card) }));
  e.dataTransfer.effectAllowed = 'move';
  row.classList.add('dragging');
});
main.addEventListener('dragend', () => {
  evDragEnd();
  main.querySelectorAll('.dragging, .over').forEach(el => el.classList.remove('dragging', 'over'));
});
main.addEventListener('dragover', e => {
  if (evDragOver(e)) return;
  const zone = e.target.closest?.('.zone');
  if (!zone) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  main.querySelectorAll('.zone.over').forEach(z => { if (z !== zone) z.classList.remove('over'); });
  zone.classList.add('over');
});
main.addEventListener('drop', e => {
  if (evDrop(e)) return;
  const zone = e.target.closest?.('.zone');
  if (!zone) return;
  e.preventDefault();
  const d = dragPayload(e);
  zone.classList.remove('over');
  if (!d || d.char !== zone.dataset.char) return;
  commit(ed.moveCard(record, d.char, d.card, zone.dataset.zone));
});
main.addEventListener('submit', e => {
  if (evSubmit(e)) return;
  if (e.target.id !== 'addChar') return;
  e.preventDefault();
  const f = new FormData(e.target);
  const next = ed.addCharacter(record, { cls: f.get('cls'), name: f.get('name') });
  if (next === record) { alert('That character could not be added.'); return; }
  sub = next.chars.at(-1).id;
  commit(next);
});
main.addEventListener('change', e => {
  if (evChange(e)) return;
  const k = { flowShow: 'flowShow', flowLane: 'flowLane', scnStatus: 'scnStatus', itemSlot: 'itemSlot', itemShow: 'itemShow', cardType: 'cardType', cardKind: 'cardKind', cardSide: 'cardSide', cardDeck: 'cardDeck', cardMon: 'cardMon', cardMLv: 'cardMLv', cardSlot: 'cardSlot', cardChk: 'cardChk', cardShow: 'cardShow', cardCls: 'cardCls', cardLv: 'cardLv' }[e.target.id];
  if (k) { view[k] = e.target.value; render(); return; }
  if (editing && e.target.dataset.act && e.target.tagName !== 'BUTTON') apply(e.target);
});
main.addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (editing && b) apply(b);
});
main.addEventListener('input', e => {
  const sk = { scnSearch: 'scnSearch', itemSearch: 'itemSearch', cardSearch: 'cardSearch' }[e.target.id];
  if (!sk) return;
  view[sk] = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const box = main.querySelector('#' + sk);
  box?.focus();
  box?.setSelectionRange(pos, pos);
});

main.addEventListener('click', evClick);
document.addEventListener('click', evOutside);                 // a click outside the peeked card closes it
main.addEventListener('keydown', e => {                      // an option of the open event is a button for the keyboard
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.evopt[data-ev]')) { e.preventDefault(); e.target.click(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.fnode[data-flow]')) { e.preventDefault(); view.scnSel = Number(e.target.dataset.flow); render(); }
});
main.addEventListener('click', e => {
  if (!e.target.closest('[data-pageedit]')) return;
  if (editPages.has(tab)) editPages.delete(tab); else editPages.add(tab);
  render();
});
undoBtn.addEventListener('click', undo);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) { e.preventDefault(); undo(); }
});

document.getElementById('file').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const next = await localStore.importFile(f);
    history.length = 0;
    record = next;
    await localStore.save(record);
  } catch (err) { alert('Could not read the file: ' + err.message); }
  e.target.value = '';
  render();
});
document.getElementById('export').addEventListener('click', () => {
  if (!record) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(localStore.exportBlob(record));
  a.download = 'campaign.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('clear').addEventListener('click', async () => {
  if (!record || !confirm('Remove the campaign from this browser? Export it first if you need it.')) return;
  await localStore.clear();
  record = null;
  history.length = 0;
  editPages.clear();
  render();
});

(async () => {
  evInit({ render, record: () => record, commit, editing: () => editing });
  record = await localStore.load();
  try {
    const t = localStorage.getItem('havenmap.campaign.tab');
    if (PAGE_TABS.includes(t)) tab = t;
    sub = localStorage.getItem('havenmap.campaign.sub') || '';
    const m = localStorage.getItem('havenmap.campaign.cardImages');
    if (m === 'hover' || m === 'always') imgMode = m;
    loadView();
  } catch { /* ignore */ }
  render();
})();
