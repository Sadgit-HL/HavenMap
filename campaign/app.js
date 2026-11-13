// Campaign view with a simple edit mode. Edits go through scripts/campaign/edit.js (pure functions returning a new
// record); every change is saved to the browser at once and can be undone. Session start/commit, voting and the
// server come later (docs/campaign-schema.md section 10).
import { CARDS } from '../scripts/games/gh2_cards.js';
import { ITEMS } from '../scripts/games/gh2_items.js';
import { TREASURES } from '../scripts/games/gh2_treasures.js';
import { SCENARIOS, STICKERS } from '../scripts/games/gh2_scenarios.js';
import { BATTLE_GOALS } from '../scripts/games/battle_goals.js';
import { escapeHtml as esc } from '../scripts/escape.js';
import { localStore } from '../scripts/campaign/store.js';
import { cardImageUrl, itemImageUrl, eventImageUrl, matImageUrl, pqImageUrl, cardBackUrl } from '../scripts/campaign/cardImages.js';
import { playmatHtml, XP_STEPS, turnPost, cardsPost, goalRollCode, questRollCode, cleanSettings } from './playmat.js';
import { tokenDefs, markerTokens, MARK_STICKERS } from '../scripts/campaign/classTokens.js';
import { bannerUrl, bannerCode } from '../scripts/campaign/bggBanners.js';
import { GH2_PQ } from '../scripts/games/gh2_pq_text.js';
import { morphInto } from './morph.js';
import { registerMenu } from './ctxmenu.js';
import { phoneHtml } from './phone.js';
import {
  validate, prosperityLevel, handOf, handList, zoneOf, CARD_ZONES, shopCopies, itemsInUse, unlockedBy, classByName, SCN_STATE_NAME, SCN_STATE, ownedCards, cardLevel,
} from '../scripts/campaign/record.js';
import * as ed from '../scripts/campaign/edit.js';
import { describeChange, foldLog, LOG_TABS, LOG_MAX } from '../scripts/campaign/changelog.js';
import { CLASSES } from '../scripts/games/gh2_classes.js';
import { ALL_CLASSES, classKnown } from '../scripts/campaign/classList.js';
import { availableSet, PROSPERITY_START } from '../scripts/campaign/record.js';
import { REPUTATION_SECTIONS } from '../scripts/games/gh2_reputation.js';
import { PROSPERITY_SECTIONS, PROSPERITY_ITEMS, IMBUEMENT_SECTIONS } from '../scripts/games/gh2_prosperity.js';
import { frontOf as eventFront, EVENT_TABLE } from '../scripts/campaign/events.js';
import { buildCard } from '../scripts/amd/card.js';
import { deckOf, drawState, amdAct, amdRollCode, perkList } from '../scripts/campaign/amdDeck.js';
import { heroCatalog, heroPerkClass } from '../scripts/amd/heroDeck.js';
import { PERSONAL_QUESTS } from '../scripts/games/gh2_quests.js';
import ghConfig from '../scripts/games/gh.js';
import { GH_DECKS } from '../scripts/games/gh_decks.js';
import { buildFlow, LANES, laneOf } from '../scripts/campaign/flow.js?v=2';
import { RESOURCES, RESOURCE_GAMES } from '../scripts/games/resources.js';
import { characterTraits } from '../scripts/campaign/outcomes.js';
import { SPECIAL_TRAITS, specialName } from '../scripts/campaign/traits.js';
import { eventsHtml, evInit, evClick, evChange, evSubmit, evOutside, evDragStart, evDragOver, evDrop, evDragEnd } from './eventsView.js?v=38';

const PAGE_TABS = ['Overview', 'Scenarios', 'Mercenaries', 'Items', 'Events', 'Cards', 'Resources', 'History'];
const main = document.getElementById('main');
const tabsEl = document.getElementById('tabs');
const undoBtn = document.getElementById('undo');
let record = null;
let tab = 'Overview';              // top-level tab
let sub = '';                      // sub-tab under Mercenaries: a character id or 'add'
const editPages = new Set();        // pages (top-level tabs) currently in edit mode; each page has its own Edit button
const editSections = new Set();     // Overview sections in edit mode (party); Overview has no page-wide edit. Stickers and classes open a modal instead
let editing = false;               // derived in render(): is the visible page being edited
let imgMode = 'hover';                 // card images: 'hover' (preview under the pointer) or 'always' (shown in the lists)
const history = [];                                   // earlier records for undo, newest last
const view = { flowFull: false, scnView: 'table', flowShow: 'progress', flowLane: '', flowZoom: 'm', scnSel: null, scnStatus: '', scnSearch: '', scnSort: { col: '', dir: 1 }, itemSlot: '', itemSearch: '', itemShow: 'unlocked', itemView: 'list', itemSize: 'm', itemSort: { col: '', dir: 1 }, cardType: 'abilities', cardSlot: '', cardChk: '', cardKind: 'city', cardSide: 'front', cardDeck: '', cardMon: '', cardMLv: '', cardShow: 'unlocked', cardCls: '', cardLv: '', cardSearch: '', cardSize: 's' };   // itemView: 'list' | 'grid'

// Level order of ability cards: 1, X (the level 1.1 cards), 2 ... 9, then M (mastery).
const lvRank = lv => (lv === 'X' ? 1.5 : lv === 'M' ? 99 : Number(lv));
const lvLabel = lv => (lv === 'M' ? 'Pack' : String(lv));      // the Sawbones medical pack cards
const cardById = new Map(CARDS.map(c => [c.id, c]));
const FULLSCREEN_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0l0 0a2 2 0 0 1 0 3L8 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="currentColor" stroke-width="2"/></svg>';
const ICON_DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
const ITEM_SIZES = { s: 150, m: 188, l: 250 };      // minimum tile width in px for the item grid
// Filter and view settings are kept in this browser (not the search texts: a stale search would hide rows after a reload).
const VIEW_KEY = 'havenmap.campaign.view';
const VIEW_SAVED = ['scnView', 'flowShow', 'flowLane', 'flowZoom', 'scnStatus', 'scnSort', 'itemSlot', 'itemShow', 'itemView', 'itemSize', 'itemSort', 'cardType', 'cardSlot', 'cardKind', 'cardSide', 'cardDeck', 'cardMon', 'cardMLv', 'cardShow', 'cardCls', 'cardLv', 'cardSize'];
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
    if (['s', 'm', 'l', 'xl', 'xxl', 'fit'].includes(v.flowZoom)) view.flowZoom = v.flowZoom;
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
    if (v.scnSort && typeof v.scnSort.col === 'string' && (v.scnSort.dir === 1 || v.scnSort.dir === -1)) view.scnSort = { col: v.scnSort.col, dir: v.scnSort.dir };
  } catch { /* ignore */ }
}
const itemById = new Map(ITEMS.map(i => [i.id, i]));
const pretty = slug => String(slug ?? '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const chip = (text, cls = '') => `<span class="chip ${cls}">${esc(text)}</span>`;
const kv = (k, v) => `<div class="kv"><span>${esc(k)}</span><span>${v}</span></div>`;
const none = '<div class="empty">none</div>';
// Scenario level is a signed adjustment (-2..+3 on top of the suggested level): always show its sign.
const signed = n => (n == null ? null : n >= 0 ? `+${n}` : String(n));

// Number input that reports through data attributes: <input data-act="party" data-key="avg">.
const num = (act, key, value, { min, max, id = '', width = 56 } = {}) =>
  `<input type="number" class="num" style="width:${width}px" data-act="${act}" data-key="${esc(key)}" data-id="${esc(id)}" value="${esc(value ?? '')}"${min !== undefined ? ` min="${min}"` : ''}${max !== undefined ? ` max="${max}"` : ''}>`;
const val = (editable, shown, input) => (editing && editable ? input : esc(shown));
// Overview: each section has its own pencil; sval shows the input only while that section is being edited.
const secBtn = (key, label) => `<button type="button" class="editbtn editicon secedit" data-secedit="${key}" aria-pressed="${editSections.has(key)}" aria-label="${editSections.has(key) ? 'Stop editing' : 'Edit'} ${esc(label)}" title="${editSections.has(key) ? 'Stop editing' : 'Edit'} ${esc(label)}">${PENCIL}</button>`;
const modalBtn = (attr, label) => `<button type="button" class="editbtn editicon secedit" ${attr} aria-label="Edit ${esc(label)}" title="Edit ${esc(label)}">${PENCIL}</button>`;
const sval = (key, shown, input) => (editSections.has(key) ? input : esc(shown));

// --- shell: history, save, tabs --------------------------------------------------------------------------

// The edit history (record.log) is stamped here, so every edit is logged whichever page or modal made it. The user is the
// name set in the settings (this browser only: the campaign has no accounts yet).
const USER_KEY = 'havenmap.campaign.user';
function userName() {
  try { return (localStorage.getItem(USER_KEY) || '').trim() || 'Unknown'; } catch { return 'Unknown'; }
}
function withLog(from, to, kindPrefix = '') {
  const t = Date.now(), u = userName();
  const entries = describeChange(from, to).map(e => ({ t, u, tab: e.tab, kind: kindPrefix + e.kind, d: e.d }));
  return entries.length ? { ...to, log: foldLog(from.log || [], entries).slice(-LOG_MAX) } : { ...to, log: from.log || [] };
}
function commit(next) {
  if (next === record) return;
  if (pmset.autosort) for (const c of next.chars) if (c.hord) next = ed.sortHand(next, c.id, 'ini');   // setting: the hand always follows the initiative
  history.push(record);
  if (history.length > 50) history.shift();
  record = withLog(record, next);
  localStore.save(record);
  render();
}
// Undo restores the earlier record but keeps the log, adding what was undone as new entries.
function undo() {
  if (!history.length) return;
  const prev = history.pop();
  record = withLog(record, prev, 'Undo: ');
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

// A card value with a round pencil button to its right that opens the modal for it.
const editPill = (attr, label, v) => `<span class="stepper"><b>${esc(v)}</b><button type="button" class="editbtn editicon secedit" ${attr} title="Edit ${esc(label.toLowerCase())}" aria-label="Edit ${esc(label.toLowerCase())}">${PENCIL}</button></span>`;

// A class chip for the Overview. A class a character plays is highlighted and shows its player ("Tinkerer: Guido"), or the
// character's name in brackets when no player is set ("Cragheart (Shale)").
function classChip(r, name) {
  const lower = String(name).toLowerCase();
  const played = r.chars.filter(c => String(c.cls).toLowerCase() === lower);
  if (!played.length) return chip(name, classKnown(name) ? '' : 'warn');
  const who = played.map(c => r.players.find(p => p.seat === c.seat)?.name).filter(Boolean);
  const label = who.length ? `${name}: ${who.join(', ')}` : `${name} (${played.map(c => c.name).join(', ')})`;
  return `<span class="chip ok" title="${esc(`Active: ${played.map(c => c.name).join(', ')}`)}">${esc(label)}</span>`;
}

function overview(r) {
  const { counts, days, avgDays } = scenarioCounts(r);
  const repBar = v => `<div class="bar"><i style="left:${((20 - Math.max(-10, Math.min(20, v))) / 30) * 97}%"></i></div>`;
  const rep = (label, key) => kv(label, esc(r.rep[key])) + repBar(r.rep[key]);
  // Average level is derived from the mercenaries' own levels (not entered by hand); Normal difficulty is that
  // average level halved and rounded up (scenarioLevel adds the diff modifier on top, clamped 0..7).
  const avg = r.chars.length ? r.chars.reduce((s, c) => s + (c.lv || 0), 0) / r.chars.length : r.party.avg;
  return `
  <div class="overview">
  <div class="grid">
    <div class="card"><h3>Party${secBtn('party', 'party')}</h3>${kv('Ø Character level', esc(Number.isInteger(avg) ? avg : avg.toFixed(2)))}
      ${kv('Normal difficulty', esc(Math.ceil(avg / 2)))}
      ${kv('Difficulty', sval('party', r.party.diff > 0 ? `+${r.party.diff}` : String(r.party.diff), num('party', 'diff', r.party.diff, { min: -2, max: 4 })))}
      ${kv('Inspiration', sval('party', r.party.insp, num('party', 'insp', r.party.insp, { min: 0, max: 99 })))}
      ${kv('Enhancements', esc(r.enh.length))}</div>
    <div class="card"><h3>Prosperity</h3>${kv('Prosperity level', esc(prosperityLevel(r.pros)))}${kv('Prosperity checks', editPill('data-pros-open', 'Prosperity checks', r.pros))}${kv('Great Oak sanctuary', editPill('data-don-open', 'Great Oak sanctuary', r.don))}${kv('Imbuement', editPill('data-imb-open', 'Imbuement', r.imb))}</div>
    <div class="card"><h3>Reputation${modalBtn('data-rep-open', 'reputation')}</h3>${rep('Demons', 'demons')}${rep('Merchants', 'merchants')}${rep('City Guard', 'guard')}</div>
    <div class="card"><h3>Scenarios</h3>${[2, 1, 0, 3].map(i => kv(SCN_STATE_NAME[i], esc(counts[i] || 0))).join('')}${kv('Total', esc(SCENARIOS.length))}
      ${kv('Days played', esc(days))}${kv('Ø Days/scenario', esc(avgDays))}</div>
  </div>
  <h2>Campaign Stickers${modalBtn('data-stk-open', 'campaign stickers')}</h2>${r.stk.length ? `<div class="stickers">${r.stk.map(s => {
    const st = STICKERS.find(x => x.name.toLowerCase() === String(s).toLowerCase());
    return st ? `<figure class="sticker"><img src="${esc(st.img)}" alt="" loading="lazy"><figcaption>${esc(st.name)}</figcaption></figure>` : chip(s, 'warn');
  }).join('')}</div>` : none}
  <h2>Unlocked Classes (${r.cls.length}/${availableSet(r).size})${modalBtn('data-cls-open', 'unlocked classes')}</h2><div class="chips">${r.cls.map(c => classChip(r, c)).join('')}</div>
  <h2>Retired Characters${modalBtn('data-ret-open', 'retired characters')}</h2>${r.retired.length ? table(['Class', 'Player', 'Name', 'Lv', 'Perks', 'Masteries'],
    r.retired.map(x => `<tr><td>${esc(x.cls)}</td><td>${esc(x.player ?? '')}</td><td>${esc(x.name ?? '')}</td><td>${esc(x.lv ?? '')}</td><td>${esc(x.perks ?? '')}</td><td>${esc(x.masteries ?? '')}</td></tr>`)) : none}
  <h2>Players${modalBtn('data-pl-open', 'players')}</h2>${r.players.length ? `<div class="chips">${r.players.map(p => chip(p.name)).join('')}</div>` : none}
  </div>`;
}

// --- History tab: the recorded edits, grouped by the page they were made on, newest first ----------------------------------
const HISTORY_SHOWN = 20;                           // entries listed per page
const when = t => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
function historyPage(r) {
  const log = r.log || [];
  if (!log.length) return '<h2>History</h2><div class="empty">No edits recorded yet. Edits made from now on are listed here, by page.</div>';
  const groups = LOG_TABS.map(tabName => {
    const list = log.filter(e => e.tab === tabName).reverse();
    if (!list.length) return '';
    const rows = list.slice(0, HISTORY_SHOWN).map(e => `<tr><td class="nowrap">${esc(when(e.t))}</td><td>${esc(e.u)}</td><td>${esc(e.kind)}</td><td>${esc(e.d)}</td></tr>`);
    return `<h2>${esc(tabName)} <span class="hint">(${list.length})</span></h2>${table(['Time', 'User', 'Type', 'Change'], rows)}${list.length > HISTORY_SHOWN ? `<p class="hint">The latest ${HISTORY_SHOWN} of ${list.length} edits are shown.</p>` : ''}`;
  }).join('');
  return groups;
}

// --- the scenario flowchart -------------------------------------------------------------------------------------------------
// Layout in scripts/campaign/flow.js. Spoilers: "Progress" draws the scenarios that are unlocked, completed or locked out, plus the
// locked ones they lead to; locked scenarios are drawn as "?" (name and number only in edit mode), as locked items are.
// Chart sizes: fixed scales, and 'fit' = as wide as the box (computed in flowchart()). Fullscreen (view.flowFull) shows the chart over the whole window.
const FLOW_ZOOM = { s: 0.6, m: 0.85, l: 1.2, xl: 1.6, xxl: 2, fit: 0 };
const FLOW_ZOOM_LABEL = { s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: 'XXL', fit: 'Fit' };
const scnViewToggle = () => `<div class="imgmode viewmode" role="group" aria-label="Scenario view">${[['table', 'Table'], ['flow', 'Flowchart']].map(([v, l]) => `<button type="button" data-scnview="${v}" aria-pressed="${view.scnView === v}">${l}</button>`).join('')}</div>`;
// GeekRoller code builder/button/copy, shared by every "random X" roller (scenario, item, ...): one face per
// candidate, e.g. 1custom5{1;9;10;13;17}. The roll itself happens on BGG, same as the attack-modifier decks'
// "Copy GeekRoller code" button (scripts/decks.js) -- this just builds and copies the code, it never picks itself.
function rollerCodeOf(faces) {
  return faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '';
}
function rollerBtn(attr, noun, code, emptyTitle) {
  const title = code ? `Roll a random ${noun}` : emptyTitle;
  return `<button type="button" class="editbtn editicon" ${attr} ${code ? '' : 'disabled'} title="${esc(title)}" aria-label="${esc(title)}">${ICON_DICE}</button>`;
}
async function copyRollerCode(btn, code) {
  const orig = btn.innerHTML, origTitle = btn.title;
  try {
    await navigator.clipboard.writeText(code);
    btn.innerHTML = ICON_CHECK;
    btn.title = 'Copied the GeekRoller code';
  } catch {
    btn.title = 'Copy failed';
  }
  setTimeout(() => { btn.innerHTML = orig; btn.title = origTitle; }, 1500);
}

function scenarioRollerCode(r) {
  return rollerCodeOf(SCENARIOS.filter(s => (r.scn[String(s.n)]?.s ?? 0) === 1).map(s => s.n));
}
const scenarioRollerBtn = r => rollerBtn('data-scnroll', 'Side Scenario', scenarioRollerCode(r), 'No unlocked scenarios');

// The 16 GH2E items flagged "random" in the Gloomhaven Secretariat data (never sold in the shop, only gained
// from a "random item design"/"random item" reward): ids 81-96. "Gain a random item design" draws one of these
// that isn't already unlocked -- it is not a draw from the full item catalog.
const RANDOM_ITEM_IDS = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96];
function itemRollerCode(r) {
  return rollerCodeOf(ITEMS.filter(i => RANDOM_ITEM_IDS.includes(i.id) && !r.items.unl.includes(i.id)).map(i => i.id));
}
const itemRollerBtn = r => rollerBtn('data-itemroll', 'Item Design', itemRollerCode(r), 'No item designs left to gain');

// Scenario state counts and pacing, shown on Overview. A scenario missing from r.scn is Locked (setScenarioState
// deletes the key when a scenario is set back to Locked), so the Locked count is the total minus the other three, not
// a tally of explicit entries. Days played = calendar days from the campaign start to today; average is that span per
// completed scenario.
const CAMPAIGN_START = '2026-05-21';
function scenarioCounts(r) {
  const counts = [0, 0, 0, 0];
  for (const s of SCENARIOS) counts[r.scn[String(s.n)]?.s ?? 0]++;
  const days = Math.round((new Date() - new Date(CAMPAIGN_START)) / 86400000);
  const avgDays = counts[2] ? (days / counts[2]).toFixed(1) : 'n/a';
  return { counts, days, avgDays };
}

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
  const full = view.flowFull;
  const z = view.flowZoom === 'fit' ? Math.min(3, Math.max(0.3, ((full ? window.innerWidth : main.clientWidth - 32) - 4) / g.width)) : FLOW_ZOOM[view.flowZoom];
  const masked = n => st(n) === 0;
  const zoomBtns = `<div class="imgmode viewmode" role="group" aria-label="Chart size">${Object.entries(FLOW_ZOOM_LABEL).map(([k, l]) => `<button type="button" data-flowzoom="${k}" aria-pressed="${view.flowZoom === k}" title="Chart size ${l}${k === 'fit' ? ' (as wide as the window)' : ''}">${l}</button>`).join('')}</div>`;
  const fsBtn = `<button type="button" class="editbtn editicon" data-flowfull aria-pressed="${!!full}" title="${full ? 'Exit fullscreen' : 'Fullscreen'}" aria-label="${full ? 'Exit fullscreen' : 'Fullscreen'}">${FULLSCREEN_ICON}</button>`;
  const filters = `<div class="filters">${scnViewToggle()}
    <select id="flowShow">${[['progress', 'Progress and next steps'], ['all', 'All scenarios']].map(([v, l]) => `<option value="${v}" ${view.flowShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select id="flowLane"><option value="">All storylines</option>${LANES.map(l => `<option ${view.flowLane === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
    ${zoomBtns}${fsBtn}
    ${scenarioRollerBtn(r)}</div>`;
  if (!g.nodes.length) return filters + '<div class="empty">No scenarios to show yet.</div>';
  const lanes = g.lanes.map((l, i) => `<rect class="flane${i % 2 ? ' alt' : ''}" x="0" y="${l.y}" width="${g.width}" height="${l.h}"/><text class="flabel" x="8" y="${l.y + 18}">${esc(l.name)}</text>`).join('');
  const edges = g.edges.map(e => `<path class="fedge${st(e.from) === 2 ? ' on' : ''}" d="${e.d}" marker-end="url(#farrow)"/>`).join('');
  const nodes = g.nodes.map(n => {
    const s = byN.get(n.n), hide = masked(n.n), name = String(s.name || '');
    const label = hide ? '?' : name.length > 17 ? name.slice(0, 16) + '…' : name;
    const midY = n.h / 2 + 4;
    return `<g class="fnode s${st(n.n)}${hide ? ' mask' : ''}${view.scnSel === n.n ? ' sel' : ''}" data-flow="${n.n}" tabindex="0" role="button" transform="translate(${n.x},${n.y})"><title>${hide ? 'Locked' : esc(`${s.n} ${name}`)}</title>
      <rect width="${n.w}" height="${n.h}" rx="6"/>${hide ? `<text class="fq" x="${n.w / 2}" y="${n.h / 2 + 6}" text-anchor="middle">?</text>`
        : `<text class="fname" x="6" y="${midY}"><tspan class="fnum">${esc(s.n)}</tspan> ${esc(label)}</text>`}</g>`;
  }).join('');
  const svg = `<svg class="flowsvg" width="${Math.round(g.width * z)}" height="${Math.round(g.height * z)}" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="Scenario flowchart">
    <defs><marker id="farrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="farrowhead"/></marker></defs>${lanes}${edges}${nodes}</svg>`;
  if (full) return `<div class="flowwrap full"><div class="flowfsbar">${zoomBtns}${fsBtn}${scenarioRollerBtn(r)}</div>${svg}</div>`;
  return filters + `<div class="flowwrap">${svg}</div>`;
}

// Details of the selected scenario, shown in a modal (scnModalRoot below) so it's reachable regardless of scroll
// position or chart height.
function flowDetail(r) {
  const n = view.scnSel, s = SCENARIOS.find(x => x.n === n);
  if (!s) return '';
  const x = r.scn[String(n)] || { s: 0 };
  if (x.s === 0) return '<h3 id="scnModalTitle">Locked scenario</h3>';
  const cls = k => { const v = r.scn[String(k)]?.s ?? 0; return v === 2 ? 'ok' : v === 1 ? 'info' : 'dim'; };
  const nm = k => (r.scn[String(k)]?.s ? `${k} ${SCENARIOS.find(y => y.n === k)?.name ?? ''}` : '?');
  const stateRow = editing
    ? kv('State', `<select data-act="scnState" data-id="${esc(s.n)}">${SCN_STATE_NAME.map((name, i) => `<option value="${i}" ${x.s === i ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>`)
    : kv('State', `<span class="s${x.s}">${esc(SCN_STATE_NAME[x.s])}</span>`);
  const resultRows = x.s !== 2 ? '' : editing
    ? kv('Level', num('scnRes', 'l', x.l, { min: -2, max: 3, id: s.n, width: 56 }))
      + kv('# Mercenaries', num('scnRes', 'p', x.p, { min: 1, max: 4, id: s.n, width: 56 }))
      + kv('Chests', `<input type="text" class="txt" style="width:120px" data-act="scnRes" data-key="ch" data-id="${esc(s.n)}" value="${esc((x.ch || []).join(', '))}">`)
      + kv('Date (completed)', `<input type="date" class="txt" data-act="scnRes" data-key="d" data-id="${esc(s.n)}" value="${esc(x.d ?? '')}">`)
    : kv('Level', esc(signed(x.l) ?? '?')) + kv('# Mercenaries', esc(x.p ?? '?')) + kv('Date (completed)', esc(x.d ?? ''));
  const treNums = x.ch || [];
  const treRow = !treNums.length ? '' : kv('Treasure', `<span class="chips">${treNums.map(tn => editing
    ? `<button type="button" class="chip ${r.decks.tre.includes(tn) ? 'ok' : 'dim'}" data-act="deck" data-key="tre" data-id="${tn}">${tn}</button>`
    : chip(tn, r.decks.tre.includes(tn) ? 'ok' : 'dim')).join('')}</span>`);
  return `<h3 id="scnModalTitle">${esc(s.n)} ${esc(s.name)}</h3>
    ${s.img ? `<img class="flowsticker" src="${esc(s.img)}" alt="">` : ''}
    ${kv('Storyline', esc(laneOf(s)))}${stateRow}
    ${resultRows}
    ${treRow}
    ${kv('Unlocks', (s.unl || []).length ? `<span class="chips">${s.unl.map(k => chip(nm(k), cls(k))).join('')}</span>` : '<span class="hint">no scenario</span>')}
    ${kv('Unlocked by', unlockedBy(s.n).length ? `<span class="chips">${unlockedBy(s.n).map(k => chip(nm(k), cls(k))).join('')}</span>` : '<span class="hint">no scenario (event, reputation or quest)</span>')}`;
}

function scenarios(r) {
  if (view.scnView === 'flow') return flowPage(r);
  const q = view.scnSearch.toLowerCase();
  let rows = SCENARIOS.filter(s => {
    const st = r.scn[String(s.n)]?.s ?? 0;
    if (view.scnStatus !== '' && String(st) !== view.scnStatus) return false;
    return !q || `${s.n} ${s.name} ${s.area || ''}`.toLowerCase().includes(q);
  });
  const stateClass = n => { const s = r.scn[String(n)]?.s ?? 0; return s === 2 ? 'ok' : s === 1 ? 'info' : 'dim'; };
  const SORT = {
    n: s => s.n,
    name: s => s.name.toLowerCase(),
    area: s => (s.area || '').toLowerCase(),
    state: s => r.scn[String(s.n)]?.s ?? 0,
    l: s => r.scn[String(s.n)]?.l ?? -99,
    p: s => r.scn[String(s.n)]?.p ?? -1,
    ch: s => (r.scn[String(s.n)]?.ch || []).length,
    d: s => r.scn[String(s.n)]?.d || '',
  };
  const cmp = (a, b) => (typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
  const { col, dir } = view.scnSort;
  if (SORT[col]) rows = [...rows].sort((x, y) => dir * cmp(SORT[col](x), SORT[col](y)) || SORT.n(x) - SORT.n(y));
  const sortTh = (k, l) => `<button type="button" class="sortbtn" data-scnsort="${k}" title="Sort by ${esc(l.toLowerCase())}">${esc(l)}${col === k ? (dir > 0 ? ' &#9650;' : ' &#9660;') : ''}</button>`;
  const head = [sortTh('n', '#'), sortTh('name', 'Name'), sortTh('area', 'Area'), sortTh('state', 'State'), sortTh('l', 'Lv'),
    sortTh('p', '# Mercenaries'), sortTh('ch', 'Chests'), sortTh('d', 'Date (completed)'), 'Unlocks', 'Unlocked by'];
  const filters = `<div class="filters">${scnViewToggle()}
    <select id="scnStatus"><option value="">All states</option>${SCN_STATE_NAME.map((n, i) => `<option value="${i}" ${view.scnStatus === String(i) ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <input id="scnSearch" type="search" placeholder="Search number, name, area" value="${esc(view.scnSearch)}">
    ${scenarioRollerBtn(r)}</div>`;
  return filters + table(head, rows.map(s => {
    const x = r.scn[String(s.n)] || { s: 0 };
    return `<tr class="rowlink" data-flow="${s.n}" tabindex="0"><td>${esc(s.n)}</td><td>${esc(s.name)}</td><td>${esc(s.area ?? '')}</td><td class="s${x.s}">${SCN_STATE_NAME[x.s]}</td>
      <td>${esc(signed(x.l) ?? '')}</td>
      <td>${esc(x.p ?? '')}</td>
      <td>${esc((x.ch || []).join(', '))}</td>
      <td>${esc(x.d ?? '')}</td>
      <td>${(s.unl || []).map(n => chip(n, stateClass(n))).join('')}</td><td>${unlockedBy(s.n).map(n => chip(n, stateClass(n))).join('')}</td></tr>`;
  }));
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

// --- ability cards: the playmat (campaign/playmat.js) shows the zones; helpers for the rest of the page ---------------

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

// Traits the class brings that are not on the sheet's list yet, the species (Vermling, Quatryl, ...) among them. Events check
// them like traits.
function classTraits(c) {
  const own = new Set((c.traits || []).map(t => String(t).toLowerCase()));
  const special = new Set((c.special || []).map(t => String(t).toLowerCase()));
  return [...characterTraits(c)].filter(t => !own.has(t) && !special.has(t)).map(pretty);
}

function characterCard(c, r) {
  const cls = classByName(c.cls);
  const enh = r.enh.filter(x => x.cls === c.cls);
  const faces = c.am?.faces || [];
  const inDeck = faces.filter(f => !f.out).length;
  const stat = (label, key, max, min = 0) => kv(label, val(true, c[key] ?? '', num('char', key, c[key], { min, max, id: c.id, width: 64 })));
  const playerName = r.players.find(p => p.seat === c.seat)?.name ?? '';
  const playerSel = `<select data-act="charPlayer" data-id="${esc(c.id)}" aria-label="Player"><option value="">(nobody)</option>${r.players.map(p => `<option value="${esc(p.seat)}"${p.seat === c.seat ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`;
  const nameCell = editing
    ? `<input type="text" class="txt" data-act="charName" data-id="${esc(c.id)}" value="${esc(c.name)}" maxlength="30" style="width:160px">`
    : esc(c.name);
  return `<div class="card">
    <h3>${nameCell} <span style="color:var(--muted)">${esc(c.cls)} (${cls ? esc(cls.src.toUpperCase()) : '?'})</span></h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">${kv('Player', val(true, playerName || '-', playerSel))}${stat('Level', 'lv', 9, 1)}${stat('XP', 'xp', 9999)}${stat('Gold', 'gold', 9999)}${stat('Inherited perks', 'inh', 9999)}${stat('Hand size', 'hand', 20, 1)}</div>
    <div class="pile"><b>Traits</b>${(c.traits || []).map(t => chip(t)).join('') || '<span class="hint">none</span>'}${classTraits(c).map(t => chip(t)).join('')}${(c.special || []).map(t => chip(specialName(t), 'info')).join('')}${(c.extra || []).map(t => chip(t, 'dim')).join('')}
      <button type="button" class="editbtn editicon traitedit" data-trait-edit="${esc(c.id)}" aria-label="Special traits of ${esc(c.name)}" title="Special traits (Hero, Indebted, ...)">${PENCIL}</button></div>
    <div class="pile"><b>Deck (${c.deck.length} cards)</b>${c.hand ? `hand size ${esc(c.hand)}` : ''}</div>
    <div class="pile"><b>Other owned cards (${c.bench.length})</b></div>
    ${benchList(c)}
    <div class="pile"><b>Items (${c.items.length})</b></div>
    <div class="chips">${c.items.map(it => `<span class="chip ${(it.st || []).some(Boolean) ? 'warn' : ''}" title="tick states ${esc((it.st || []).join('/'))}">${esc(pretty(itemById.get(it.id)?.slug ?? it.id))}</span>`).join('')}</div>
    <div class="pile"><b>Modifier deck</b> ${inDeck} of ${faces.length} cards in the deck${c.am?.n != null ? ` (sheet count ${esc(c.am.n)})` : ''}</div>
    <div class="chips">${faces.map(f => `<span class="chip ${f.out ? 'dim' : ''}">${esc(f.f)}</span>`).join('')}</div>
    <div class="pile"><b>Enhancements (${enh.length})</b></div>
    ${enh.length ? table(['Card', 'Top', 'Bottom'], enh.map(x => `<tr><td>${esc(x.card)}</td><td>${esc(x.top ?? '')}</td><td>${esc(x.bottom ?? '')}</td></tr>`)) : none}
  </div>${editing ? '<p class="hint">Cards, items and the modifier deck are not editable here yet.</p>' : ''}`;
}

// The Mercenaries tab: a sub-tab bar (one per character and '+') above the selected character or the add form.
function mercenaries(r) {
  const cur = currentSub();
  const bar = `<nav class="subtabs" role="tablist">${subTabList().map(t =>
    `<button type="button" role="tab" aria-selected="${t.id === cur}" data-sub="${esc(t.id)}"${t.title ? ` title="${esc(t.title)}"` : ''}>${esc(t.label)}</button>`).join('')}</nav>`;
  return `<div class="subbar">${bar}</div>` + (cur === 'add' ? addTab(r) : characterTab(r, cur));
}

// Portrait: the character mat cropped to the focus region saved with campaign/mockups/portrait-tool.html (fractions of the mat width).
const PORTRAIT_FOCUS = {};
fetch('../scripts/games/portrait-focus.json').then(r => (r.ok ? r.json() : {})).then(j => { Object.assign(PORTRAIT_FOCUS, j); if (record && tab === 'Mercenaries') render(); }).catch(() => {});
function portraitStyle(c, size) {
  const url = matImageUrl(c.cls, 'front');
  const f = PORTRAIT_FOCUS[String(url).split('/').pop().replace(/\.[a-z]+$/i, '')];
  if (!f) return `background-image:url(${url});background-size:cover;background-position:center`;
  const bw = size / f.w;
  return `background-image:url(${url});background-size:${bw}px auto;background-position:${-f.u * bw}px ${-f.t * bw}px`;
}
// What the playmat remembers while the page is open: the open modal, the mat side, the history filter. Saved BGG codes of the user are kept
// in this browser (not in the campaign record).
const pm = { modal: null, matSide: 'front', histKind: 'all', jtab: 'goal', bgv: null, pqv: null, notesPreview: false, amd: {}, amZoom: null, setOpen: false, dtab: 'hand', hsel: {}, hsArmed: false, itemId: null, isel: {}, ptab: 'cards', sheet: null, mkKey: null, mkSel: null, pileZ: null, cf: null };   // amd = draw state per character (not saved)
const CODES_KEY = 'havenmap.campaign.codes';
// Display settings of the playmat (gear in the top bar), kept in this browser.
// Narrow screens get the phone view (campaign/phone.js) instead of the playmat.
const phoneMQ = window.matchMedia('(max-width: 700px)');
const isPhone = () => phoneMQ.matches;
phoneMQ.addEventListener?.('change', () => { if (record && tab === 'Mercenaries') render(); });
const SET_KEY = 'havenmap.campaign.pmset';
let pmset = (() => { try { return cleanSettings(JSON.parse(localStorage.getItem(SET_KEY) || 'null')); } catch { return cleanSettings(null); } })();
const saveSet = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(pmset)); } catch { /* ignore */ } };
const loadCodes = () => { try { const a = JSON.parse(localStorage.getItem(CODES_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
const saveCodes = a => { try { localStorage.setItem(CODES_KEY, JSON.stringify(a)); } catch { /* ignore */ } };
const matSlug = c => String(matImageUrl(c.cls, 'front')).split('/').pop().replace(/\.[a-z]+$/i, '');
const pmState = c => ({
  modal: pm.modal, matSide: pm.matSide, histKind: pm.histKind, jtab: pm.jtab, bgv: pm.bgv, pqv: pm.pqv, notesPreview: pm.notesPreview,
  bgs: record.bgs, pq: record.pq,
  itemId: pm.itemId, mkKey: pm.mkKey, pileZ: pm.pileZ, cf: pm.cf, players: record.players, classChips: classTraits(c).map(t => chip(t)).join(''), mkSel: mkSelOf(c), set: pmset, setOpen: pm.setOpen, ptab: pm.ptab, sheet: pm.sheet,
  items: pm.modal === 'items' ? { pool: ITEMS.filter(i => record.items.unl.includes(i.id) && (c.items.some(x => String(x.id) === String(i.id)) || shopCopies(record, i) > 0)), isel: pm.isel[c.id] || [] } : null,
  deck: pm.modal === 'deck' ? { tab: pm.dtab, cards: CARDS.filter(k => k.cls === classByName(c.cls)?.i).sort((a, b) => cardLevel(a.id) - cardLevel(b.id) || (a.ini ?? 1e9) - (b.ini ?? 1e9)), hsel: pm.hsel[c.id] || [], armed: pm.hsArmed } : null,
  amd: pm.modal === 'amd' ? drawState(c, pm.amd[c.id]) : null, amZoom: pm.modal === 'amd' ? pm.amZoom : null,
  customCodes: pm.modal === 'codes' ? loadCodes() : [],
  enh: pm.modal === 'enh' ? record.enh.map((e, i) => ({ e, i })).filter(x => x.e.cls === c.cls) : [],
  enhCards: pm.modal === 'enh' ? CARDS.filter(k => k.cls === classByName(c.cls)?.i).map(k => pretty(k.slug)) : [],
  log: pm.modal === 'history' ? [...(record.log || [])].reverse().filter(e => String(e.d).startsWith(`${c.name}:`)) : [],
});
const playmatCtx = {
  matUrl: (cls, side) => matImageUrl(cls, side),
  pqImg: slug => `../images/common/personal_quests/${slug}.png`,
  esc, pretty, cardById, itemById, cardImageUrl, itemImageUrl, cardBackUrl, portraitStyle,
  playerName: c => (record.players.find(p => p.seat === c.seat)?.name ?? ''),
  traitChips: c => `${(c.traits || []).map(t => chip(t)).join('')}${classTraits(c).map(t => chip(t)).join('')}${(c.special || []).map(t => chip(specialName(t), 'info')).join('')}`,
};

// The playmat first; what the playmat does not show yet (traits, other cards, items, modifier deck, enhancements) stays below in the old sheet.
function characterTab(r, cid) {
  const c = r.chars.find(x => x.id === cid);
  if (!c) return '<div class="empty">Character not found.</div>';
  if (isPhone()) return phoneHtml(c, playmatCtx, pmState(c));
  return playmatHtml(c, playmatCtx, pmState(c)) + `<details class="oldsheet"><summary>Character sheet (what the playmat does not show yet)</summary>${characterCard(c, r)}</details>`;
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
    ${itemRollerBtn(r)}
    <button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing items' : 'Edit items'}" title="${editing ? 'Stop editing items' : 'Edit items'}">${PENCIL}</button></div>`;
  const viewToggle = `<div class="imgmode viewmode" role="group" aria-label="Items view">${
    [['list', 'Table'], ['grid', 'Cards']].map(([m, l]) => `<button type="button" data-itemview="${m}" aria-pressed="${view.itemView === m}">${l}</button>`).join('')}${view.itemView === 'grid' ? `<span class="sizesel">${[['s', 'S'], ['m', 'M'], ['l', 'L']].map(([k, l]) => `<button type="button" data-itemsize="${k}" aria-pressed="${view.itemSize === k}" title="Tile size ${l}">${l}</button>`).join('')}</span>` : ''}<span class="ctrlhint">${rows.length} items${view.itemView === 'list' ? ' · hold Ctrl over a row for the card' : ''}</span></div>`;
  const holders = id => r.chars.filter(c => c.items.some(i => i.id === id)).map(c => c.name).join(', ');
  if (view.itemView === 'grid') {
    // Pictures of the filtered items. Locked items have no picture (a placeholder, with the number in edit mode) and are dimmed; the badge shows copies in the shop / total.
    return filters + viewToggle + (rows.length ? `<div class="itemgrid itemcards" style="--tile-min:${ITEM_SIZES[view.itemSize]}px">${rows.map(i => {
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

// Treasure Index effect codes (scripts/games/gh2_treasures.js) to plain text; item:N resolves against gh2_items.js.
function treasureEffectText(effect) {
  const segs = effect.split('|').map(seg => {
    const i = seg.indexOf(':');
    const key = i === -1 ? seg : seg.slice(0, i), val = i === -1 ? '' : seg.slice(i + 1);
    switch (key) {
      case 'item': { const it = itemById.get(Number(val)); return it ? `Gain ${pretty(it.slug)}` : `Gain item ${val}`; }
      case 'damage': return `Suffer ${val} damage`;
      case 'condition': return `gain ${val.split('+').join(' and ')}`;
      case 'experience': return `Gain ${val} XP`;
      case 'gold': return `Gain ${val} gold`;
      case 'battleGoal': return `Gain ${val} battle goal checkmark${val === '1' ? '' : 's'}`;
      case 'recover': return `recover ${val}`;
      case 'randomScenario': return 'Unlock a random side scenario';
      case 'randomItemDesign': return 'Gain a random item design';
      default: return seg;
    }
  });
  return segs.reduce((text, seg, i) => {
    if (i === 0) return seg.charAt(0).toUpperCase() + seg.slice(1);
    const bothGain = /^Gain /.test(segs[i - 1]) && /^Gain /.test(seg);
    return text + (bothGain ? ` and ${seg.slice(5)}` : `, then ${seg}`);
  }, '');
}

// Treasure Index: all 79 treasures with their effect (revealed once claimed) and a claim pill shared with
// Overview's "Treasures claimed" card (same r.decks.tre list). Always clickable -- claiming is a live play action,
// not a structural edit, so it does not need the page's edit mode. A dense grid, not a table: one row per
// treasure would be 79 lines tall for very little content per row.
function treasureList(r) {
  const claimed = n => r.decks.tre.includes(n);
  const cells = TREASURES.map(t => {
    const got = claimed(t.n);
    const pill = `<button type="button" class="pill ${got ? 'ok' : 'dim'}" data-trclaim="${t.n}" title="${got ? 'Claimed -- click to undo' : 'Mark claimed'}">${got ? '✓ Claimed' : 'Claim'}</button>`;
    const effect = got ? esc(treasureEffectText(t.effect)) : '<span class="hint">?</span>';
    return `<div class="trcell"><b>${esc(t.n)}</b><span class="treffect">${effect}</span>${pill}</div>`;
  }).join('');
  return `<h2>Treasure Index (${r.decks.tre.length}/${TREASURES.length} claimed)</h2><div class="treasuregrid">${cells}</div>`;
}

// Links of the group's workbook "Resources" sheet (scripts/games/resources.js): one row per document, one column per game.
function resources(r) {
  const url = (x, game) => r.resLinks[`${x.title}|${game}`] ?? x[game];
  const cell = (x, game) => {
    const u = url(x, game);
    if (editing) return `<input type="text" class="txt" style="width:100%" placeholder="(none)" data-act="resLink" data-key="${esc(game)}" data-id="${esc(x.title)}" value="${esc(u ?? '')}">`;
    return u ? `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener noreferrer">Open</a>` : '';
  };
  const heading = `<div class="pagebar" style="justify-content:space-between;align-items:center"><h2 style="margin:0">Resources</h2><button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing resource links' : 'Edit resource links'}" title="${editing ? 'Stop editing resource links' : 'Edit resource links'}">${PENCIL}</button></div>`;
  return treasureList(r) + heading + table(['', ...RESOURCE_GAMES.map(([, l]) => esc(l))], RESOURCES.map(x =>
    `<tr><td>${esc(x.title)}${x.note ? ` <span class="hint" title="${esc(x.note)}">(note)</span>` : ''}</td>${RESOURCE_GAMES.map(([k]) => `<td>${cell(x, k)}</td>`).join('')}</tr>`));
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
main.addEventListener('click', e => {
  const id = e.target.closest('[data-trait-edit]')?.dataset.traitEdit;
  if (!id) return;
  traitModal = id;
  modalFocus = '';
  renderModal();
});

// --- checkbox-list modals (campaign stickers, unlocked classes) -------------------------------------------------
// items() lists { name, group, on: { <col key>: bool } }. cols = [{ key, label }]: one checkbox per column.
// set(record, name, key, checked) returns the new record. With setGroup(record, group, key, checked) the items are shown
// as one column per group, each with its own header checkboxes that switch the whole group (indeterminate when mixed).
const checkModals = [];
function checkModal({ id, title, openAttr, cols, items, set, setGroup }) {
  const root = document.createElement('div');
  document.body.appendChild(root);
  const m = { open: false, focus: '' };
  const multi = cols.length > 1;
  const box = (t, c) => `<input type="checkbox" data-ck="${esc(t.name)}" data-col="${esc(c.key)}" aria-label="${esc(multi ? `${t.name}: ${c.label}` : t.name)}" ${t.on[c.key] ? 'checked' : ''}>`;
  const row = t => `<label class="modalrow"><span>${esc(t.name)}</span>${cols.map(c => box(t, c)).join('')}</label>`;
  // Section header: group name and count; with setGroup, a labelled checkbox per column that switches the whole group.
  const head = (g, mine) => `<div class="modalhead"><h4>${esc(g)} (${mine.length})</h4>${setGroup ? cols.map(c => `<label class="modalhc"><small>${esc(c.label)}</small><input type="checkbox" data-gk="${esc(g)}" data-col="${esc(c.key)}" data-all="${mine.every(t => t.on[c.key]) ? 1 : 0}" data-some="${mine.some(t => t.on[c.key]) ? 1 : 0}" aria-label="${esc(`${g}: all ${c.label}`)}"></label>`).join('') : ''}</div>`;
  m.render = () => {
    if (!m.open || !record) { m.open = false; root.innerHTML = ''; return; }
    const list = items();
    const groups = [...new Set(list.map(t => t.group ?? title))];
    const secs = groups.map(g => {
      const mine = list.filter(t => (t.group ?? title) === g);
      return `<section class="modalsec">${head(g, mine)}<div class="modalrows">${mine.map(row).join('')}</div></section>`;
    }).join('');
    root.innerHTML = `<div class="modal" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}Title"><div class="modalbox${groups.length > 1 ? ' modalwide' : ''}" style="--nc:${cols.length}">
      <button type="button" class="modalx" data-ck-close aria-label="Close">&times;</button>
      <h3 id="${id}Title">${esc(title)}</h3><div class="modalgrid">${secs}</div></div></div>`;
    for (const h of root.querySelectorAll('[data-gk]')) {
      h.checked = h.dataset.all === '1';
      h.indeterminate = h.dataset.all !== '1' && h.dataset.some === '1';
    }
    const f = m.focus && [...root.querySelectorAll('[data-ck],[data-gk]')].find(x => `${x.dataset.ck ?? x.dataset.gk}|${x.dataset.col}` === m.focus);
    (f || root.querySelector('[data-ck]'))?.focus();
  };
  m.close = () => { m.open = false; m.focus = ''; m.render(); };
  root.addEventListener('click', e => { if (e.target.id === id || e.target.closest('[data-ck-close]')) m.close(); });
  root.addEventListener('change', e => {
    const { ck, gk, col } = e.target.dataset || {};
    if (!m.open || !(ck || gk)) return;
    m.focus = `${ck ?? gk}|${col}`;
    commit(gk ? setGroup(record, gk, col, e.target.checked) : set(record, ck, col, e.target.checked));
  });
  main.addEventListener('click', e => {
    if (!e.target.closest(`[${openAttr}]`)) return;
    m.open = true;
    m.focus = '';
    m.render();
  });
  checkModals.push(m);
  return m;
}
const lower = list => new Set(list.map(v => String(v).toLowerCase()));
checkModal({
  id: 'stkModal', title: 'Campaign Stickers', openAttr: 'data-stk-open', cols: [{ key: 'on', label: '' }],
  items: () => {
    const have = lower(record.stk), known = new Set(STICKERS.map(t => t.name.toLowerCase()));
    const extra = record.stk.filter(n => !known.has(String(n).toLowerCase()));
    return [...STICKERS.map(t => t.name), ...extra].map(name => ({ name, on: { on: have.has(String(name).toLowerCase()) } }));
  },
  set: (r, n, _k, on) => (on ? ed.addSticker(r, n) : ed.removeSticker(r, n)),
});
checkModal({
  id: 'clsModal', title: 'Classes', openAttr: 'data-cls-open', cols: [{ key: 'avail', label: 'Available' }, { key: 'unl', label: 'Unlocked' }],
  items: () => {
    const have = lower(record.cls), avail = availableSet(record);
    return ALL_CLASSES.map(c => ({ name: c.name, group: c.edition, on: { avail: avail.has(c.name.toLowerCase()), unl: have.has(c.name.toLowerCase()) } }));
  },
  set: (r, n, key, on) => (key === 'avail' ? ed.setClassAvailable(r, n, on) : on ? ed.addUnlockedClass(r, n) : ed.removeUnlockedClass(r, n)),
  setGroup: (r, g, key, on) => ed.setEditionClasses(r, g, key, on),
});

// --- players modal: rename, remove and add players ---------------------------------------------------------------
let plModal = false;
const plRoot = document.createElement('div');
document.body.appendChild(plRoot);
function renderPlModal() {
  if (!plModal || !record) { plModal = false; plRoot.innerHTML = ''; return; }
  const keep = plRoot.querySelector('[data-pl-new]');
  const draft = keep ? keep.value : '';
  const hadFocus = keep && document.activeElement === keep;
  plRoot.innerHTML = `<div class="modal" id="plModal" role="dialog" aria-modal="true" aria-labelledby="plTitle"><div class="modalbox">
    <button type="button" class="modalx" data-pl-close aria-label="Close">&times;</button>
    <h3 id="plTitle">Players</h3>
    <div class="modalrows">${record.players.map(p => `<div class="plrow"><input type="text" class="txt" maxlength="40" data-pl-seat="${esc(p.seat)}" value="${esc(p.name)}" aria-label="Player name, seat ${esc(p.seat + 1)}"><button type="button" class="chip" data-pl-del="${esc(p.seat)}" title="Remove this player">Remove</button></div>`).join('') || '<div class="empty">no players yet</div>'}</div>
    <div class="plrow pladd"><input type="text" class="txt" maxlength="40" placeholder="New player" data-pl-new value="${esc(draft)}" aria-label="New player name"><button type="button" class="chip" data-pl-add>Add</button></div></div></div>`;
  if (hadFocus || !keep) plRoot.querySelector('[data-pl-new]').focus();
}
function closePlModal() { plModal = false; renderPlModal(); }
function addPlayerFromModal() {
  const inp = plRoot.querySelector('[data-pl-new]');
  const next = ed.addPlayer(record, inp.value);
  inp.value = '';
  commit(next);
  plRoot.querySelector('[data-pl-new]')?.focus();
}
plRoot.addEventListener('click', e => {
  if (e.target.id === 'plModal' || e.target.closest('[data-pl-close]')) { closePlModal(); return; }
  if (e.target.closest('[data-pl-add]')) { addPlayerFromModal(); return; }
  const del = e.target.closest('[data-pl-del]');
  if (del) commit(ed.removePlayer(record, Number(del.dataset.plDel)));
});
plRoot.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-pl-new]')) { e.preventDefault(); addPlayerFromModal(); }
});
plRoot.addEventListener('change', e => {
  const seat = e.target.dataset?.plSeat;
  if (seat === undefined) return;
  const next = ed.renamePlayer(record, Number(seat), e.target.value);
  if (next === record) e.target.value = record.players.find(p => p.seat === Number(seat))?.name ?? '';   // empty or duplicate: restore
  else commit(next);
});
main.addEventListener('click', e => {
  if (!e.target.closest('[data-pl-open]')) return;
  plModal = true;
  renderPlModal();
});

// --- prosperity track modal: the 90 checkmarks by level, with the sections to read and the items each level unlocks -----
// Items are shown by number only, as ranges. Clicking a box sets the checkmark count.
// Consecutive item numbers grouped into runs: [1,2,3,5] -> [[1,2,3],[5]].
const itemRanges = ids => ids.reduce((runs, id) => {
  const last = runs[runs.length - 1];
  if (last && id === last[last.length - 1] + 1) last.push(id); else runs.push([id]);
  return runs;
}, []);
// Imbuement (80 boxes) and Great Oak sanctuary donations (100 boxes): rows of 10, +1P above every 5th box (the sheet's labels)
// = the box that also fills a prosperity checkbox; imbuement boxes 10, 20 .. 80 carry a section to read.
function trackSection({ title, count, size, attr, sections, unit }) {
  const plus = Math.floor(count / 5), rows = [];
  for (let from = 1; from <= size; from += 10) {
    const boxes = [];
    for (let n = from; n < from + 10; n++) {
      const on = n <= count, p = n % 5 === 0, sec = sections?.[n];
      const tip = `${unit} ${n}${p ? ': +1 prosperity checkmark' : ''}${sec ? `, read section ${sec}` : ''}`;
      boxes.push(`<button type="button" class="ptbox${on ? ' on' : ''}${p ? ' ptplus' : ''}${sec ? ' ptmark' : ''}" ${attr}="${n}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="${on}">${n}</button>`);
    }
    // the section pill goes to the right of the row that holds its box (imbuement boxes 10, 20 .. 80 end a row)
    const pill = sections ? Object.entries(sections).filter(([n]) => Number(n) >= from && Number(n) < from + 10).map(([n, sec]) => `<span class="ptpill ${count >= Number(n) ? 'done' : ''}" title="Read when box ${esc(n)} is ticked">Section ${esc(sec)}${count >= Number(n) ? ' &check;' : ''}</span>`).join('') : '';
    rows.push(`<div class="ptrow${sections ? ' ptrows' : ''}">${boxes.join('')}${sections ? `<span class="ptside">${pill}</span>` : ''}</div>`);
  }
  return `<section class="ptlevel ${count ? 'reached' : ''}"><div class="pthead"><b>${esc(title)}</b><span class="hint">${count} of ${size} &middot; <span class="ptplustag">+1P</span> &times; ${plus}</span></div>
    <div class="ptgrid">${rows.join('')}</div></section>`;
}
let prosModal = false;                             // 'pros' | 'don' | 'imb': which track the modal shows
const prosRoot = document.createElement('div');
document.body.appendChild(prosRoot);
function renderProsModal() {
  if (!prosModal || !record) { prosModal = false; prosRoot.innerHTML = ''; return; }
  const keep = prosRoot.querySelector('.modalbox')?.scrollTop || 0;
  const pros = record.pros, lvNow = prosperityLevel(pros);
  const unl = new Set(record.items.unl);
  const starts = PROSPERITY_START, last = 90;
  const levels = starts.map((s, k) => {
    const lv = k + 1, from = s + 1, to = k + 1 < starts.length ? starts[k + 1] : last;
    const reached = lvNow >= lv;
    const boxes = [];
    for (let n = from; n <= to; n++) {
      const sec = n === from ? PROSPERITY_SECTIONS[lv] : '', on = n <= pros, mark = sec ? ' ptmark' : '';
      const tip = `Checkmark ${n}${sec ? `, read section ${sec}` : ''}`;
      boxes.push(`<button type="button" class="ptbox${on ? ' on' : ''}${mark}" data-pbox="${n}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="${on}">${n}</button>`);
    }
    const secs = PROSPERITY_SECTIONS[lv] ? `<span class="ptpill ${pros >= from ? 'done' : ''}" title="Read when checkmark ${from} (the first box of level ${lv}) is ticked${pros >= from ? ' (read)' : ''}">Section ${esc(PROSPERITY_SECTIONS[lv])}${pros >= from ? ' &check;' : ''}</span>` : '';
    const ids = PROSPERITY_ITEMS[lv] || [];
    const items = itemRanges(ids).map(g => {
      const got = g.filter(id => unl.has(id)).length, label = g.length > 1 ? `Items #${g[0]}–${g[g.length - 1]}` : `Item #${g[0]}`;
      return `<span class="chip ${got === g.length ? 'ok' : 'dim'}" title="${got} of ${g.length} unlocked in the Items tab">${got === g.length ? '&check; ' : ''}${label}</span>`;
    }).join('');
    const state = lvNow === lv ? ' current' : reached ? ' reached' : '';
    return `<section class="ptlevel${state}"><div class="pthead"><b>Level ${lv}</b>${lvNow === lv ? '<span class="badge">current</span>' : ''}<span class="chips ptitems">${items}</span></div>
      <div class="ptboxes">${boxes.join('')}${secs}</div></section>`;
  }).join('');
  const don = trackSection({ title: 'Great Oak sanctuary', count: record.don, size: 100, attr: 'data-donbox', unit: 'Gold' });
  const imb = trackSection({ title: 'Imbuements', count: record.imb, size: 80, attr: 'data-imbox', sections: IMBUEMENT_SECTIONS, unit: 'Imbuement' });
  const mode = prosModal;
  const title = { pros: 'Prosperity track', don: 'Great Oak sanctuary', imb: 'Imbuements' }[mode];
  const body = mode === 'don' ? don : mode === 'imb' ? imb : `<p class="ptsum">Level <b>${lvNow}</b> &middot; <b>${pros}</b> of ${last} checkmarks</p>${levels}`;
  prosRoot.innerHTML = `<div class="modal" id="prosModal" role="dialog" aria-modal="true" aria-labelledby="prosTitle"><div class="modalbox modalwide ptmodal">
    <button type="button" class="modalx" data-pros-close aria-label="Close">&times;</button>
    <h3 id="prosTitle">${esc(title)}</h3>
    ${body}</div></div>`;
  prosRoot.querySelector('.modalbox').scrollTop = keep;
}
function closeProsModal() { prosModal = false; renderProsModal(); }
prosRoot.addEventListener('click', e => {
  if (e.target.id === 'prosModal' || e.target.closest('[data-pros-close]')) { closeProsModal(); return; }
  const n = Number(e.target.closest('[data-pbox]')?.dataset.pbox);
  if (n) commit(ed.setProsperity(record, n === record.pros ? n - 1 : n));
  const don = Number(e.target.closest('[data-donbox]')?.dataset.donbox);
  if (don) commit(ed.setDonations(record, don === record.don ? don - 1 : don));
  const imb = Number(e.target.closest('[data-imbox]')?.dataset.imbox);
  if (imb) commit(ed.setImbuement(record, imb === record.imb ? imb - 1 : imb));
});
main.addEventListener('click', e => {
  const open = e.target.closest('[data-pros-open],[data-don-open],[data-imb-open]');
  if (!open) return;
  prosModal = open.hasAttribute('data-don-open') ? 'don' : open.hasAttribute('data-imb-open') ? 'imb' : 'pros';
  renderProsModal();
});

// --- reputation modal: the three reputation tracks (20 .. -10, as on the sheet) and the sections each value unlocks ---------
// A section is ready once the faction's reputation is at least its value and the scenarios it requires are completed.
// Whether it was already read is not recorded.
const REP_FACTIONS = [['demons', 'Demons'], ['merchants', 'Merchants'], ['guard', 'City Guard']];
let repModal = false;
const repRoot = document.createElement('div');
document.body.appendChild(repRoot);
function renderRepModal() {
  if (!repModal || !record) { repModal = false; repRoot.innerHTML = ''; return; }
  const keep = repRoot.querySelector('.modalbox')?.scrollTop || 0;
  const done = n => record.scn[String(n)]?.s === SCN_STATE.COMPLETED;
  const need = e => (e.requires || []).map(n => `Scenario ${n}${done(n) ? ' &check;' : ''}`).join(' &amp; ');
  const status = (rep, e) => (rep < e.value ? '' : (e.requires || []).every(done) ? 'ready' : 'wait');
  const secs = REP_FACTIONS.map(([key, name]) => {
    const rep = record.rep[key], mine = REPUTATION_SECTIONS.filter(e => e.faction === key);
    const at = new Map(mine.map(e => [e.value, e]));
    const boxes = [];
    for (let v = 20; v >= -10; v--) {
      const e = at.get(v), st = e ? status(rep, e) : '';
      const tip = `${name} reputation ${v}${e ? `, section ${e.section}${e.requires ? `, needs scenario ${e.requires.join(' & ')}` : ''}` : ''}`;
      boxes.push(`<button type="button" class="ptbox repbox${v === rep ? ' on' : ''}${e ? ' ptmark' : ''}${st ? ` rep-${st}` : ''}" data-repbox="${key}:${v}" title="${esc(tip)}" aria-label="${esc(tip)}" aria-pressed="${v === rep}">${v}</button>`);
    }
    const pills = mine.map(e => {
      const st = status(rep, e);
      return `<span class="ptpill rep-${st || 'off'}" title="${st === 'ready' ? 'Ready to read' : st === 'wait' ? 'Reputation reached, scenarios still to complete' : 'Reputation not reached yet'}">Section ${esc(e.section)} <small>at ${e.value}${e.requires ? ` &middot; ${need(e)}` : ''}</small>${st === 'ready' ? ' &check;' : ''}</span>`;
    }).join('');
    return `<section class="ptlevel reached"><div class="pthead"><b>${name}</b><span class="hint">reputation <b>${rep}</b></span></div>
      <div class="ptgrid"><div class="ptrow">${boxes.join('')}</div><div class="ptnotes">${pills}</div></div></section>`;
  }).join('');
  const top = Math.max(...REP_FACTIONS.map(([k]) => record.rep[k]));
  const any = REPUTATION_SECTIONS.filter(e => e.faction === 'any').map(e => `<span class="ptpill rep-${top >= e.value ? 'ready' : 'off'}">City event C-${esc(String(e.section).split(':')[1])} added to the city deck <small>at ${e.value} with one faction</small>${top >= e.value ? ' &check;' : ''}</span>`).join('');
  repRoot.innerHTML = `<div class="modal" id="repModal" role="dialog" aria-modal="true" aria-labelledby="repTitle"><div class="modalbox modalwide ptmodal repmodal">
    <button type="button" class="modalx" data-rep-close aria-label="Close">&times;</button>
    <h3 id="repTitle">Reputation</h3>
    ${secs}${any ? `<div class="ptnotes repany">${any}</div>` : ''}</div></div>`;
  repRoot.querySelector('.modalbox').scrollTop = keep;
}
function closeRepModal() { repModal = false; renderRepModal(); }
repRoot.addEventListener('click', e => {
  if (e.target.id === 'repModal' || e.target.closest('[data-rep-close]')) { closeRepModal(); return; }
  const box = e.target.closest('[data-repbox]')?.dataset.repbox;
  if (!box) return;
  const [key, v] = box.split(':');
  commit(ed.setReputation(record, key, Number(v)));
});
main.addEventListener('click', e => {
  if (!e.target.closest('[data-rep-open]')) return;
  repModal = true;
  renderRepModal();
});

// --- retired characters modal: add, edit and remove the retirements -------------------------------------------------------
let retModal = false;
const retRoot = document.createElement('div');
document.body.appendChild(retRoot);
function renderRetModal() {
  if (!retModal || !record) { retModal = false; retRoot.innerHTML = ''; return; }
  const keep = retRoot.querySelector('.modalbox')?.scrollTop || 0;
  const num = (i, k, min, max, v) => `<input type="number" class="num" min="${min}" max="${max}" data-ret-i="${i}" data-ret-k="${k}" value="${esc(v ?? '')}" aria-label="${esc(k)}">`;
  const rows = record.retired.map((x, i) => `<div class="retrow">
    <select data-ret-i="${i}" data-ret-k="cls" aria-label="Class"><option value="">Class...</option>${ALL_CLASSES.map(c => `<option${c.name.toLowerCase() === String(x.cls).toLowerCase() ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
    <input type="text" class="txt" list="retPlayers" maxlength="40" placeholder="Player" data-ret-i="${i}" data-ret-k="player" value="${esc(x.player ?? '')}" aria-label="Player">
    <input type="text" class="txt" maxlength="40" placeholder="Name" data-ret-i="${i}" data-ret-k="name" value="${esc(x.name ?? '')}" aria-label="Name">
    ${num(i, 'lv', 1, 9, x.lv)}${num(i, 'perks', 0, 99, x.perks)}${num(i, 'masteries', 0, 99, x.masteries)}
    <button type="button" class="chip" data-ret-del="${i}" title="Remove this retirement">Remove</button></div>`).join('');
  retRoot.innerHTML = `<div class="modal" id="retModal" role="dialog" aria-modal="true" aria-labelledby="retTitle"><div class="modalbox modalwide retmodal">
    <button type="button" class="modalx" data-ret-close aria-label="Close">&times;</button>
    <h3 id="retTitle">Retired Characters</h3>
    <datalist id="retPlayers">${record.players.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist>
    ${record.retired.length ? '<div class="retrow rethead"><span>Class</span><span>Player</span><span>Name</span><span>Lv</span><span>Perks</span><span>Masteries</span><span></span></div>' : ''}
    <div class="modalrows">${rows || '<div class="empty">no retired characters yet</div>'}</div>
    <div class="modalfoot" style="justify-content:flex-start"><button type="button" class="chip" data-ret-add>+ Add retired character</button></div></div></div>`;
  retRoot.querySelector('.modalbox').scrollTop = keep;
}
function closeRetModal() { retModal = false; renderRetModal(); }
retRoot.addEventListener('click', e => {
  if (e.target.id === 'retModal' || e.target.closest('[data-ret-close]')) { closeRetModal(); return; }
  if (e.target.closest('[data-ret-add]')) { commit(ed.addRetired(record)); return; }
  const del = e.target.closest('[data-ret-del]');
  if (del) commit(ed.removeRetired(record, Number(del.dataset.retDel)));
});
retRoot.addEventListener('change', e => {
  const { retI, retK } = e.target.dataset || {};
  if (retI === undefined) return;
  const next = ed.setRetired(record, Number(retI), retK, e.target.value);
  if (next === record) renderRetModal();                 // ignored (empty number, ...): show the stored value again
  else commit(next);
});
main.addEventListener('click', e => {
  if (!e.target.closest('[data-ret-open]')) return;
  retModal = true;
  renderRetModal();
});

// --- scenario detail modal (flowchart): shown on top regardless of scroll position or chart height ---------
const scnModalRoot = document.createElement('div');
document.body.appendChild(scnModalRoot);

function renderScnModal() {
  if (!record || view.scnSel == null || !SCENARIOS.some(s => s.n === view.scnSel)) { scnModalRoot.innerHTML = ''; return; }
  scnModalRoot.innerHTML = `<div class="modal" id="scnModal" role="dialog" aria-modal="true" aria-labelledby="scnModalTitle"><div class="modalbox wide">
    <button type="button" class="modalx" data-scn-close aria-label="Close">&times;</button>
    <button type="button" class="editbtn editicon modaledit" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing scenarios' : 'Edit scenarios'}" title="${editing ? 'Stop editing scenarios' : 'Edit scenarios'}">${PENCIL}</button>
    ${flowDetail(record)}</div></div>`;
}
function closeScnModal() { view.scnSel = null; render(); }
scnModalRoot.addEventListener('click', e => {
  if (e.target.id === 'scnModal' || e.target.closest('[data-scn-close]')) { closeScnModal(); return; }
  if (e.target.closest('[data-pageedit]')) {
    if (editPages.has(tab)) editPages.delete(tab); else editPages.add(tab);
    render();
    return;
  }
  const b = e.target.closest('button[data-act]');
  if (editing && b) apply(b);
});
scnModalRoot.addEventListener('change', e => { if (editing && e.target.dataset.act && e.target.tagName !== 'BUTTON') apply(e.target); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (traitModal) closeModal();
  else if (checkModals.some(m => m.open)) checkModals.find(m => m.open).close();
  else if (plModal) closePlModal();
  else if (prosModal) closeProsModal();
  else if (repModal) closeRepModal();
  else if (retModal) closeRetModal();
  else if (view.scnSel != null) closeScnModal();
  else if (view.flowFull) { view.flowFull = false; render(); }
});

function render() {
  renderTabs();
  if (!record) {
    main.innerHTML = '<div class="empty">No campaign loaded.<br>Use <b>Load file</b> to open a campaign JSON file. It is kept in this browser only.</div>';
    return;
  }
  const flowPage = tab === 'Scenarios' && view.scnView === 'flow';
  if (!flowPage) view.flowFull = false;
  main.classList.toggle('wide', flowPage || (tab === 'Mercenaries' && currentSub() !== 'add'));                // the flowchart may use the whole window width
  document.body.classList.toggle('noscroll', !!view.flowFull);
  editing = tab === 'Overview' ? editSections.size > 0 : tab === 'Mercenaries' ? false : editPages.has(tab);
  saveView();
  const issues = validate(record);
  // The Items and Events pages carry their own pencil button (in the filter row / tab row). Scenarios has no page-wide
  // edit mode at all: every row (table or flowchart) opens the scenario modal, which carries its own pencil button.
  const noPagebar = tab === 'Overview' || tab === 'Items' || tab === 'Events' || tab === 'Cards' || tab === 'Scenarios' || tab === 'Resources' || tab === 'History' || tab === 'Mercenaries';   // the Mercenaries tab is the playmat: no page pencil
  const pagebar = noPagebar ? '' : `<div class="pagebar"><button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing this page' : `Edit ${esc(tab.toLowerCase())}`}" title="${editing ? 'Stop editing this page' : `Edit ${esc(tab.toLowerCase())}`}">${PENCIL}</button></div>`;
  const body = { Overview: overview, Scenarios: scenarios, Mercenaries: mercenaries, Items: items, Events: events, Cards: cardsPage, Resources: resources, History: historyPage }[tab](record);
  renderModal();
  checkModals.forEach(m => m.render());
  renderPlModal();
  renderProsModal();
  renderRepModal();
  renderRetModal();
  renderScnModal();
  const html = pagebar + (issues.length ? `<div class="issues">${issues.length} issue(s): ${esc(issues.slice(0, 5).join('; '))}</div>` : '') + body;
  // The playmat is redrawn in place (campaign/morph.js): cards keep their picture and hover state, so a drop or a flip does not flicker.
  if (tab === 'Mercenaries' && !editing && main.querySelector('.pm')) morphInto(main, html); else main.innerHTML = html;
  if (tab === 'Cards' && view.cardType === 'am') hydrateAm();
  if (pm.modal === 'amd') hydrateAmdModal();
  if (pm.modal === 'perks') hydratePerkCards();
}

// Phone view: tabs, the menu, bottom sheets, tap a card to move it, tap a played card to flip it.
function phoneClick(e) {
  const t = e.target, q = sel => t.closest?.(sel);
  if (!q('.pp')) return false;
  const c = pmChar();
  if (q('[data-ptab]')) { pm.ptab = q('[data-ptab]').dataset.ptab; pm.sheet = null; render(); return true; }
  if (q('[data-pmenu]')) { pm.sheet = { kind: 'menu' }; render(); return true; }
  if (q('[data-sheetclose]') || t.matches?.('.pp .sheetwrap')) { pm.sheet = null; render(); return true; }
  if (!c) return false;
  const to = q('[data-pto]');
  if (to) { pm.sheet = null; commit(ed.moveCard(record, c.id, Number(to.dataset.card), to.dataset.pto)); if (record.chars.find(x => x.id === c.id) === c) render(); return true; }
  const ord = q('[data-pord]');
  if (ord) { pm.sheet = null; commit(ed.moveCard(record, c.id, Number(ord.dataset.card), 'hand', { before: ord.dataset.pord === 'start' ? handList(c)[0] : null })); return true; }
  const so = q('[data-psort]');
  if (so) { commit(ed.sortHand(record, c.id, so.dataset.psort)); return true; }
  const pile = q('[data-ppile]');
  if (pile) { pm.sheet = { kind: 'pile', z: pile.dataset.ppile }; render(); return true; }
  if (q('.pp .sheet .prev')) return true;
  const ac = q('.pp .ac[data-card]');
  if (ac) {
    if (ac.dataset.pslot !== undefined && !q('[data-more]')) { commit(ed.flipPlayCard(record, c.id, Number(ac.dataset.pslot))); return true; }
    pm.sheet = { kind: 'card', id: Number(ac.dataset.card) }; render(); return true;
  }
  return false;
}

// Display settings: the gear, the segmented choices, Reset, and click zoom (zones set to Click).
function setClick(e) {
  const q = sel => e.target.closest?.(sel);
  if (q('[data-setbtn]')) { pm.setOpen = !pm.setOpen; render(); return true; }
  const sg = q('.setpop .seg button');
  if (sg) { pmset[sg.parentElement.dataset.set] = sg.dataset.v; saveSet(); render(); return true; }
  if (q('[data-setreset]')) { pmset = cleanSettings(null); saveSet(); render(); return true; }
  if (pm.setOpen && !q('.setwrap')) { pm.setOpen = false; render(); }
  const zoomed = main.querySelectorAll('.pm .zoomed');
  const el = q('.pm .fan6 .ac, .pm .activelist .ac, .pm .flipcard.is-front');
  if (!el) { zoomed.forEach(x => x.classList.remove('zoomed')); return false; }
  const z = el.classList.contains('flipcard') ? 'play' : el.closest('.activelist') ? 'active' : 'hand';
  if ((pmset.zones[z] || pmset.zoom) !== 'click') return false;
  const was = el.classList.contains('zoomed');
  zoomed.forEach(x => x.classList.remove('zoomed'));
  if (!was) { const h = el.getBoundingClientRect().height; if (h > 0) el.style.setProperty('--hz', HOVER_H() / h); el.classList.add('zoomed'); }
  return true;                                                                                           // a click zooms; a played card flips on a double click
}

// Items: click an item to open it (state), the pencil opens the equip dialog, Slot sorts the shelf.
function itemClick(e, c) {
  const q = sel => e.target.closest?.(sel);
  const st = q('[data-itstate]');
  if (st) { commit(ed.setItemState(record, c.id, st.dataset.id, Number(st.dataset.itstate))); return true; }
  const sort = q('[data-itemssort]');
  if (sort) { commit(ed.sortItems(record, c.id)); return true; }
  if (q('[data-itemsedit]')) {
    pm.isel[c.id] = c.items.map(it => String(it.id)); pm.modal = 'items'; render(); return true;
  }
  const tile = q('.pm .it[data-itemstate]');
  if (tile && !pm.modal) { pm.itemId = tile.dataset.id; pm.modal = 'item'; render(); return true; }
  const sel = q('[data-isel]');
  if (sel) {
    if (sel.disabled) return true;
    const id = sel.dataset.isel, cur = pm.isel[c.id] || [];
    pm.isel[c.id] = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]; render(); return true;
  }
  if (q('[data-itemclear]')) { pm.isel[c.id] = []; render(); return true; }
  if (q('[data-itemok]')) { pm.modal = null; commit(ed.setEquippedItems(record, c.id, pm.isel[c.id] || [])); return true; }
  return false;
}

// Deck modal: tabs, card pool picks and undo, the level stepper, the hand selection and its confirmation.
function deckClick(e, c) {
  const t = e.target, q = sel => t.closest?.(sel);
  if (q('[data-dtab]')) { pm.dtab = q('[data-dtab]').dataset.dtab; pm.hsArmed = false; render(); return true; }
  const pick = q('.pcard.avail.can');
  if (pick) { commit(ed.addPoolCard(record, c.id, Number(pick.dataset.s))); return true; }
  const undo = q('[data-poolundo]');
  if (undo) { if (undo.dataset.poolundo !== '') commit(ed.removePoolCard(record, c.id, Number(undo.dataset.poolundo))); return true; }
  const step = q('[data-lvstep]');
  if (step) {
    const lv = Math.max(1, Math.min(9, (c.lv || 1) + Number(step.dataset.lvstep)));
    let r = ed.setCharacter(ed.setCharacter(record, c.id, 'lv', lv), c.id, 'xp', XP_STEPS[lv - 1] ?? 0);   // the level moves the XP to the threshold of the level
    for (;;) {                                                                                           // picks beyond the new level go back
      const ch = r.chars.find(x => x.id === c.id), over = ownedCards(ch).filter(id => cardLevel(id) >= 2 && cardLevel(id) < 99);
      if (over.length <= lv - 1) break;
      r = ed.removePoolCard(r, c.id, over.at(-1));
    }
    commit(r); return true;
  }
  const hs = q('[data-hsel]');
  if (hs) {
    if (hs.disabled) return true;
    const id = Number(hs.dataset.hsel), cur = pm.hsel[c.id] || [];
    pm.hsel[c.id] = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]; pm.hsArmed = false; render(); return true;
  }
  if (q('[data-handclear]')) { pm.hsel[c.id] = []; pm.hsArmed = false; render(); return true; }
  const ok = q('[data-handok]');
  if (ok) {
    if (ok.disabled) return true;
    const inPlay = c.disc.length || c.lost.length || c.act.length || c.play.some(Boolean);
    if (inPlay && !pm.hsArmed) { pm.hsArmed = true; render(); setTimeout(() => { if (pm.hsArmed) { pm.hsArmed = false; render(); } }, 4000); return true; }
    pm.hsArmed = false; pm.modal = null;
    commit(ed.applyHand(record, c.id, pm.hsel[c.id] || []));
    return true;
  }
  return false;
}

// The cards of the perk rows are drawn the same way (data-perkcard = perk index . r (removed) or a (added) . position).
function hydratePerkCards() {
  const c = record?.chars.find(x => x.id === currentSub());
  if (!c) return;
  const perks = perkList(c.cls);
  main.querySelectorAll('[data-perkcard]').forEach(el => {
    if (el.firstChild) return;
    const [i, side, j] = el.dataset.perkcard.split('.');
    const card = perks[Number(i)]?.[side === 'r' ? 'removes' : 'adds']?.[Number(j)];
    if (card) el.append(buildCard(card, c.cls, side === 'a'));
  });
}

// The cards of the modifier deck modal are drawn by scripts/amd/card.js into empty slots (data-amslot, kept by the redraw).
function hydrateAmdModal() {
  const c = record?.chars.find(x => x.id === currentSub());
  if (!c) return;
  const byKey = new Map(deckOf(c).map(t => [t.key, t]));
  main.querySelectorAll('[data-amslot]').forEach(el => {
    const t = byKey.get(el.dataset.amslot);
    if (!t || el.dataset.shown === el.dataset.amslot) return;
    el.dataset.shown = el.dataset.amslot;
    el.replaceChildren(buildCard(t.card, c.cls, !!t.extra));
    if (el.hasAttribute('data-big')) el.firstChild.style.setProperty('--pc-width', '340px');
  });
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
    case 'charPlayer': return commit(ed.setCharacterPlayer(record, id, v));
    case 'charName': return commit(ed.renameCharacter(record, id, v));
    case 'itemUnl': return commit(ed.setItemUnlocked(record, id, v));
    case 'itemToggle': return commit(ed.setItemUnlocked(record, id, !record.items.unl.some(u => String(u) === id)));
    case 'treasures': return commit(ed.setDeckList(record, 'tre', v));
    case 'deck': return commit(ed.toggleDeckEntry(record, key, Number(id)));
    case 'resLink': return commit(ed.setResourceLink(record, id, key, v));
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
  if (e.target.closest('[data-flowfull]')) { view.flowFull = !view.flowFull; render(); return; }
  const fz = e.target.closest('[data-flowzoom]')?.dataset.flowzoom;
  if (fz) { view.flowZoom = fz; render(); return; }
  const fn = e.target.closest('[data-flow]')?.dataset.flow;
  if (fn) { view.scnSel = Number(fn); render(); return; }
  const scnRollBtn = e.target.closest('[data-scnroll]');
  if (scnRollBtn) { copyRollerCode(scnRollBtn, scenarioRollerCode(record)); return; }
  const itemRollBtn = e.target.closest('[data-itemroll]');
  if (itemRollBtn) { copyRollerCode(itemRollBtn, itemRollerCode(record)); return; }
  const trClaim = e.target.closest('[data-trclaim]')?.dataset.trclaim;
  if (trClaim) { commit(ed.toggleDeckEntry(record, 'tre', Number(trClaim))); return; }
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
  const scnSrt = e.target.closest('[data-scnsort]')?.dataset.scnsort;
  if (scnSrt) {
    const s = view.scnSort;
    view.scnSort = s.col !== scnSrt ? { col: scnSrt, dir: 1 } : s.dir > 0 ? { col: scnSrt, dir: -1 } : { col: '', dir: 1 };
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
  const row = e.target.closest?.('.ac[data-card], .flipcard[data-card]');
  if (!row) { e.preventDefault(); return; }
  e.dataTransfer.setData('text/plain', JSON.stringify({ char: row.dataset.char, card: Number(row.dataset.card) }));
  e.dataTransfer.effectAllowed = 'move';
  row.classList.add('dragging');
});
main.addEventListener('dragend', () => {
  evDragEnd();
  main.querySelectorAll('.dragging, .over, .ins-before, .ins-after').forEach(el => el.classList.remove('dragging', 'over', 'ins-before', 'ins-after'));
});
// Where in the hand a dropped card goes: in front of the row under the pointer (left half, or upper half in the list view), after it
// otherwise. Returns { before } for moveCard: a card id, or null for the end of the hand; undefined = not over a card.
function handDropPlace(e, zone) {
  const row = e.target.closest?.('.ac');
  if (!row || !zone.contains(row)) return { before: undefined };
  const r = row.getBoundingClientRect();
  const first = e.clientX < r.left + r.width / 2;
  if (first) return { before: Number(row.dataset.card), row, side: 'before' };
  const next = row.nextElementSibling?.closest('.ac');
  return { before: next ? Number(next.dataset.card) : null, row, side: 'after' };
}
const clearMarks = () => main.querySelectorAll('.ins-before, .ins-after').forEach(el => el.classList.remove('ins-before', 'ins-after'));
main.addEventListener('dragover', e => {
  if (evDragOver(e)) return;
  const zone = e.target.closest?.('[data-zone]');
  if (!zone) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  markDropZone(e, zone);
});
function markDropZone(e, zone) {
  main.querySelectorAll('[data-zone].over').forEach(z => { if (z !== zone) z.classList.remove('over'); });
  zone.classList.add('over');
  clearMarks();
  if (zone.dataset.zone === 'hand') { const p = handDropPlace(e, zone); if (p.row) p.row.classList.add(p.side === 'before' ? 'ins-before' : 'ins-after'); }
}
function applyDrop(e, zone, d) {                                  // e: the drop event, or { target, clientX, clientY } from a touch drag
  zone.classList.remove('over');
  clearMarks();
  if (!d || d.char !== zone.dataset.char) return;
  if (zone.dataset.zone !== 'hand') { commit(ed.moveCard(record, d.char, d.card, zone.dataset.zone)); return; }
  const place = handDropPlace(e, zone).before;
  const fromHand = !!zone.querySelector(`.ac[data-card="${d.card}"]`);
  // inside the hand, dropping on empty space puts the card at the end; from another zone it just enters the hand
  commit(ed.moveCard(record, d.char, d.card, 'hand', place === undefined && !fromHand ? {} : { before: place === undefined ? null : place }));
}
main.addEventListener('drop', e => {
  if (evDrop(e)) return;
  const zone = e.target.closest?.('[data-zone]');
  if (!zone) return;
  e.preventDefault();
  applyDrop(e, zone, dragPayload(e));
});
// Touch and pen: HTML5 drag events do not fire, so dragging a card by finger is built from pointer events (same drop rules as the mouse).
(() => {
  let t = null;
  const zoneAt = (x, y) => document.elementFromPoint(x, y)?.closest?.('.pm [data-zone]');
  main.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || e.button || pm.modal) return;
    const el = e.target.closest?.('.pm:not(.pp) .ac[data-card], .pm:not(.pp) .flipcard[data-card]');
    if (!el || e.target.closest('button')) return;
    t = { el, x: e.clientX, y: e.clientY, id: e.pointerId, ghost: null };
  });
  main.addEventListener('pointermove', e => {
    if (!t || e.pointerId !== t.id) return;
    if (!t.ghost) {
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) < 10) return;
      const r = t.el.getBoundingClientRect(), g = t.el.cloneNode(true);
      g.classList.add('touchghost'); g.classList.remove('zoomed', 'dragging');
      g.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:600;pointer-events:none;transform:none;opacity:.92;box-shadow:0 12px 30px rgba(0,0,0,.7)`;
      t.dx = t.x - r.left; t.dy = t.y - r.top;
      (main.querySelector('.pm') || document.body).appendChild(g);
      t.ghost = g; t.el.classList.add('dragging'); hidePreview();
    }
    e.preventDefault();
    t.ghost.style.left = `${e.clientX - t.dx}px`; t.ghost.style.top = `${e.clientY - t.dy}px`;
    const z = zoneAt(e.clientX, e.clientY);
    if (z) markDropZone({ target: document.elementFromPoint(e.clientX, e.clientY), clientX: e.clientX, clientY: e.clientY }, z);
    else { main.querySelectorAll('[data-zone].over').forEach(x => x.classList.remove('over')); clearMarks(); }
  });
  const end = e => {
    if (!t || e.pointerId !== t.id) return;
    const d = t; t = null;
    if (!d.ghost) return;
    d.ghost.remove(); d.el.classList.remove('dragging');
    const z = e.type === 'pointerup' ? zoneAt(e.clientX, e.clientY) : null;
    main.querySelectorAll('[data-zone].over').forEach(x => x.classList.remove('over')); clearMarks();
    const swallowClick = ev => { ev.stopImmediatePropagation(); ev.preventDefault(); };
    document.addEventListener('click', swallowClick, true); setTimeout(() => document.removeEventListener('click', swallowClick, true), 50);
    if (z) applyDrop({ target: document.elementFromPoint(e.clientX, e.clientY), clientX: e.clientX, clientY: e.clientY }, z, { char: d.el.dataset.char, card: Number(d.el.dataset.card) });
  };
  main.addEventListener('pointerup', end); main.addEventListener('pointercancel', end);
})();
// Flip a played card with the mockup's animation: turn the card in place first (the page is redrawn from the record, which would cut
// the animation short), save when it has finished. A card turned face up goes flat afterwards ("settled"), as in the mockup.
function flipPlayed(f) {
  if (f.dataset.flipping) return;
  f.dataset.flipping = '1';
  if (f.classList.contains('is-front')) {
    if (f.classList.contains('settled')) { f.classList.remove('settled'); f.classList.add('rev'); void f.offsetWidth; f.classList.remove('rev'); }   // back into the 3D pose without a visible jump
    void f.offsetWidth;
    f.classList.remove('is-front');
  } else f.classList.add('is-front');
  const { char, slot } = f.dataset;
  setTimeout(() => commit(ed.flipPlayCard(record, char, Number(slot))), 560);
}
// Context menu of the playmat (right click, long press): cards, piles, counters, deck cards. Each action calls the same edit functions as the normal UI.
const ZONE_LABEL = { hand: 'Hand', active: 'Active area', play1: 'Play slot 1', play2: 'Play slot 2', discard: 'Discard pile', lost: 'Lost pile' };
registerMenu({
  sel: '.pm .fan6 .ac, .pm .activelist .ac, .pm .flipcard',
  title: el => el.title || 'Card',
  actions: el => {
    const c = record?.chars.find(x => x.id === el.dataset.char), id = Number(el.dataset.card);
    if (!c || !c.deck.includes(id)) return [];
    const from = zoneOf(c, id), down = el.classList.contains('flipcard') && !el.classList.contains('is-front');
    const list = [{ label: 'Enlarge', disabled: down, run: () => { const h = el.getBoundingClientRect().height; if (h > 0) el.style.setProperty('--hz', HOVER_H() / h); main.querySelectorAll('.pm .zoomed').forEach(x => x.classList.remove('zoomed')); el.classList.add('zoomed'); } },
      { sep: true }, { header: 'Move to' }];
    for (const z of CARD_ZONES.filter(z => z !== from)) {
      const slotRule = z.startsWith('play') && from !== 'hand' && !from.startsWith('play');                // only hand cards enter a play slot
      list.push({ label: ZONE_LABEL[z], disabled: slotRule, run: () => commit(ed.moveCard(record, c.id, id, z)) });
    }
    if (from === 'hand') {
      const hand = handList(c);
      list.push({ sep: true }, { label: 'Move to start', run: () => commit(ed.moveCard(record, c.id, id, 'hand', { before: hand[0] })) }, { label: 'Move to end', run: () => commit(ed.moveCard(record, c.id, id, 'hand', { before: null })) });
    }
    list.splice(1, 0, { label: 'Add marker or sticker', run: () => openMarkers(`c:${id}`) });
    return list;
  },
});
registerMenu({
  sel: '.pm .it[data-itemstate]',
  title: el => (el.title || 'Item').split(' — ')[0],
  actions: el => [{ label: 'Add marker', run: () => openMarkers(`i:${el.dataset.id}`) }],
});
registerMenu({
  sel: '.pm .pile6',
  title: el => (el.dataset.pile === 'lost' ? 'Lost pile' : 'Discard pile'),
  actions: el => {
    const c = record?.chars.find(x => x.id === el.dataset.char);
    if (!c) return [];
    const key = el.dataset.pile, ids = (key === 'lost' ? c.lost : c.disc).filter(id => c.deck.includes(id));
    return [
      { label: 'Recover top card to hand', disabled: !ids.length, run: () => commit(ed.moveCard(record, c.id, ids.at(-1), 'hand')) },
      { label: `Move whole pile to hand (${ids.length})`, disabled: !ids.length, danger: true, run: () => {
        if (!confirm(`Move all ${ids.length} cards from the ${key === 'lost' ? 'lost' : 'discard'} pile to the hand?`)) return;
        let r = record; for (const id of [...ids].reverse()) r = ed.moveCard(r, c.id, id, 'hand'); commit(r);
      } },
    ];
  },
});
registerMenu({
  sel: '.pm .sp',
  title: el => { const b = el.querySelector('.spc button'); return b ? (b.getAttribute('aria-label') || 'Counter').replace(/^(Increase|Decrease)\s*/i, '') || 'Counter' : 'Counter'; },
  actions: el => {
    const b = el.querySelector('.spc button[data-hud], .spc button[data-tk]'), c = b && record?.chars.find(x => x.id === b.dataset.char);
    if (!c) return [];                                                                                     // the level and the other counters have no menu
    const hud = b.dataset.hud, key = HUD_KEY[hud] || b.dataset.tk;
    const cur = hud ? c[key] || 0 : c.tok?.[key] || 0, set = v => commit(hud ? ed.setCharacter(record, c.id, key, v) : ed.setToken(record, c.id, key, v));
    return [{ label: '+5', run: () => set(cur + 5) }, { label: '\u22125', run: () => set(Math.max(0, cur - 5)) }, { sep: true },
      { label: 'Reset to 0', danger: true, disabled: !cur, run: () => { if (hud && !confirm('Reset this value to 0?')) return; set(0); } }];
  },
});
registerMenu({
  sel: '.pm .amdtile',
  title: el => el.title || 'Attack modifier card',
  actions: el => { const z = el.querySelector('[data-amzoom]'); return [{ label: 'Enlarge', disabled: !z, run: () => { pm.amZoom = z.dataset.amzoom; render(); } }]; },
});
main.addEventListener('dblclick', e => {
  const f = e.target.closest?.('.pm .flipcard.is-front[data-slot]');
  if (f && (pmset.zones.play || pmset.zoom) === 'click') { f.classList.remove('zoomed'); flipPlayed(f); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && pm.modal) { pm.modal = null; render(); } });
main.addEventListener('change', e => {
  if (e.target.matches?.('[data-histkind]')) { pm.histKind = e.target.value; render(); }
  else if (e.target.matches?.('[data-flag]')) { pmset[e.target.dataset.flag] = e.target.checked; saveSet(); render(); }
  else if (e.target.matches?.('select[data-zone]')) { pmset.zones[e.target.dataset.zone] = e.target.value; saveSet(); render(); }
  else if (e.target.matches?.('[data-mastery]')) commit(ed.setMastery(record, e.target.dataset.char, Number(e.target.dataset.mastery), e.target.checked));
  else if (e.target.matches?.('[data-mkprice]')) commit(ed.setMarkPrice(record, e.target.dataset.char, e.target.dataset.mkprice, e.target.value));
  else if (e.target.matches?.('[data-enhprice]')) commit(ed.setEnhancementPrice(record, Number(e.target.dataset.enhprice), e.target.value));
  else if (e.target.matches?.('[data-bgst]')) { const c = pmChar(); if (c) { pm.bgv = e.target.dataset.slug; commit(ed.setBattleGoalStatus(record, c.id, e.target.dataset.slug, e.target.value)); } }
  else if (e.target.matches?.('[data-pqst]')) { const c = pmChar(); if (c) { pm.pqv = e.target.dataset.slug; commit(ed.setQuestStatus(record, c.id, e.target.dataset.slug, e.target.value)); } }
  else if (e.target.matches?.('[data-pqsel]')) { pm.pqv = e.target.value; render(); }
  else if (e.target.matches?.('[data-pqchk]')) {
    const c = pmChar(), q = GH2_PQ[e.target.dataset.slug];
    if (c && q) commit(ed.setQuestCount(record, c.id, e.target.dataset.slug, Number(e.target.dataset.pqchk), e.target.checked ? q.reqs[Number(e.target.dataset.pqchk)].n : 0));
  }
  else if (e.target.matches?.('[data-notes]')) { const c = pmChar(); if (c) commit(ed.setNotes(record, c.id, e.target.value)); }
  else if (e.target.matches?.('[data-mdline]')) {
    const c = pmChar();
    if (c) { const L = (c.notes || '').split('\n'), i = Number(e.target.dataset.mdline); L[i] = L[i].replace(/\[[ xX]\]/, e.target.checked ? '[x]' : '[ ]'); commit(ed.setNotes(record, c.id, L.join('\n'))); }
  }
});
main.addEventListener('keydown', e => {
  const f = e.target.closest?.('.pm .flipcard[data-slot]');
  if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flipPlayed(f); }
});
// The character of the open playmat, and the random picks of the journal (the pure edit functions get the chosen slugs).
const pmChar = () => record?.chars.find(x => x.id === currentSub());
const pick = (list, n) => { const a = [...list], out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return out; };
// Journal clicks: battle goals, personal quests, roll codes, the notes toolbar. Returns true when the click was one of them.
function journalClick(e, c) {
  const t = e.target, q = sel => t.closest?.(sel);
  let b;
  if ((b = q('[data-bggo]'))) { pm.bgv = b.dataset.bggo; render(); return true; }
  if (q('[data-bgdraw]')) { commit(ed.offerBattleGoals(record, c.id, pick(ed.goalDeck(record), 3))); return true; }
  if ((b = q('[data-bgkeep]'))) { pm.bgv = b.dataset.bgkeep; commit(ed.keepBattleGoal(record, c.id, b.dataset.bgkeep)); return true; }
  if (q('[data-bgcancel]')) { commit(ed.clearOffer(record, c.id, 'bgo')); return true; }
  if ((b = q('[data-bgdrop]'))) { commit(ed.setBattleGoalStatus(record, c.id, b.dataset.slug, 'deck')); pm.bgv = null; return true; }
  if (q('[data-bgreset]')) { if (confirm('A new scenario: put every battle goal back into the deck?')) commit(ed.returnAllBattleGoals(record)); return true; }
  if ((b = q('[data-pqgo]'))) { pm.pqv = b.dataset.pqgo; render(); return true; }
  if (q('[data-pqdraw]')) { commit(ed.offerQuests(record, c.id, pick(ed.questDeck(record), 2))); return true; }
  if ((b = q('[data-pqkeep]'))) { pm.pqv = b.dataset.pqkeep; commit(ed.keepQuest(record, c.id, b.dataset.pqkeep)); return true; }
  if (q('[data-pqcancel]')) { commit(ed.clearOffer(record, c.id, 'pqo')); return true; }
  if ((b = q('[data-pqreq]'))) {
    const cur = (c.pqc?.[b.dataset.slug] || [])[Number(b.dataset.pqreq)] || 0;
    commit(ed.setQuestCount(record, c.id, b.dataset.slug, Number(b.dataset.pqreq), cur + Number(b.dataset.d)));
    return true;
  }
  if ((b = q('[data-roll]'))) {
    const code = b.dataset.roll === 'bg' ? goalRollCode(ed.goalDeck(record)) : questRollCode(ed.questDeck(record));
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).catch(() => {});
    const old = b.innerHTML;
    b.innerHTML = '\u2713 <span>Copied</span>';
    setTimeout(() => { b.innerHTML = old; }, 900);
    return true;
  }
  if (q('[data-mdview]')) { pm.notesPreview = !pm.notesPreview; render(); return true; }
  if ((b = q('[data-md]'))) { mdToolbar(b.dataset.md); return true; }
  return false;
}
// Notes toolbar: inserts the markdown syntax around the selection or in front of the line; the text is saved when the field is left.
function mdToolbar(kind) {
  const ta = main.querySelector('[data-notes]');
  if (!ta) return;
  const wrap = (a, z) => { const s0 = ta.selectionStart, e0 = ta.selectionEnd; ta.setRangeText(a + ta.value.slice(s0, e0) + z, s0, e0, 'end'); if (s0 === e0) ta.setSelectionRange(s0 + a.length, s0 + a.length); ta.focus(); };
  const line = prefix => { const s0 = ta.selectionStart, e0 = ta.selectionEnd, v = ta.value, a = v.lastIndexOf('\n', s0 - 1) + 1; let z = v.indexOf('\n', e0); if (z < 0) z = v.length; ta.setRangeText(v.slice(a, z).split('\n').map(l => prefix + l).join('\n'), a, z, 'end'); ta.focus(); };
  if (kind === 'b') wrap('**', '**'); else if (kind === 'i') wrap('*', '*'); else if (kind === 'h') line('# '); else if (kind === 'ul') line('- '); else if (kind === 'todo') line('- [ ] ');
}
document.addEventListener('keydown', e => {
  const ta = e.target.closest?.('[data-notes]');
  if (!ta) return;
  if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i')) { e.preventDefault(); const m = e.key === 'b' ? '**' : '*', s0 = ta.selectionStart, e0 = ta.selectionEnd; ta.setRangeText(m + ta.value.slice(s0, e0) + m, s0, e0, 'end'); if (s0 === e0) ta.setSelectionRange(s0 + m.length, s0 + m.length); }
  else if (e.key === 'Enter' && !e.shiftKey) {                     // continue a list; an empty item ends it
    const v = ta.value, a = v.lastIndexOf('\n', ta.selectionStart - 1) + 1, m = v.slice(a, ta.selectionStart).match(/^(\s*[-*]\s+(\[[ xX]\]\s+)?)(.*)/);
    if (m) { e.preventDefault(); if (!m[3]) ta.setRangeText('', a, ta.selectionStart, 'end'); else ta.setRangeText(`\n${m[1].replace(/\[[xX]\]/, '[ ]')}`, ta.selectionStart, ta.selectionEnd, 'end'); }
  }
});


// Markers (tokens and stickers) on ability cards and items. The corner handle (or the context menu) opens the editor modal: pick a token or sticker
// and click the card, or drag it from the picker onto the card; drag a placed marker to move it, drop it outside the card to remove it.
function mkSelOf(c) {
  const s = pm.mkSel, toks = c ? markerTokens(c.cls) : [];
  if (s && (s.s ? MARK_STICKERS.includes(s.k) : toks.includes(s.k))) return s;
  return toks.length ? { k: toks[0], s: 0 } : { k: MARK_STICKERS[0], s: 1 };
}
const mkKeyNow = () => (pm.modal === 'item' ? `i:${pm.itemId}` : pm.modal === 'cardmk' ? pm.mkKey : null);
function openMarkers(key) {
  pm.sheet = null;
  if (key.startsWith('i:')) { pm.itemId = key.slice(2); pm.modal = 'item'; } else { pm.mkKey = key; pm.modal = 'cardmk'; }
  render();
}
const mkPct = (card, e) => { const r = card.getBoundingClientRect(); return { x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) }; };
const mkOver = (card, e) => { const r = card.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
let mkBlock = false;
main.addEventListener('click', e => {
  const q = sel => e.target.closest?.(sel), c = pmChar();
  if (!c) return;
  const h = q('.pm .tkh, .pm .opts [data-mkopen]');
  if (h) { e.stopImmediatePropagation(); e.preventDefault(); openMarkers(h.dataset.mkopen); return; }
  if (!q('.pm .mmodal')) return;
  const pick = q('[data-mkpick]');
  if (pick) { e.stopImmediatePropagation(); if (!mkBlock) { pm.mkSel = { k: pick.dataset.mkpick, s: Number(pick.dataset.s) }; render(); } return; }
  const clr = q('[data-mkclear]');
  if (clr) { e.stopImmediatePropagation(); commit(ed.clearMarkers(record, c.id, clr.dataset.mkclear)); return; }
  const card = q('.pm .itcard[data-mkcard]');
  if (card && !q('.tk')) {
    e.stopImmediatePropagation();
    const sel = mkSelOf(c);
    commit(ed.addMarker(record, c.id, card.dataset.mkcard, { k: sel.k, ...(sel.s ? { s: 1 } : {}), ...mkPct(card, e) }));
  }
}, true);
(() => {
  let drag = null;
  main.addEventListener('pointerdown', e => {
    const c = pmChar(), pick = e.target.closest?.('.pm [data-mkpick]'), tk = e.target.closest?.('.pm .itcard .tk'), card = e.target.closest?.('.pm .itcard[data-mkcard]');
    if (!c || e.button) return;
    if (pick) { drag = { kind: 'pick', pick, x: e.clientX, y: e.clientY, ghost: null }; pick.setPointerCapture(e.pointerId); }
    else if (tk && card) { drag = { kind: 'move', tk, card, moved: false }; tk.setPointerCapture(e.pointerId); e.preventDefault(); document.body.style.cursor = 'grabbing'; }
  });
  main.addEventListener('pointermove', e => {
    if (!drag) return;
    if (drag.kind === 'pick') {
      if (!drag.ghost) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
        const g = document.createElement('img'), sticker = drag.pick.dataset.s === '1';
        g.src = drag.pick.querySelector('img').src;
        g.style.cssText = `position:fixed;z-index:999;width:${sticker ? (drag.pick.dataset.mkpick === 'hex_attack' ? 36 : 27) : 44}px;pointer-events:none;transform:translate(-50%,-50%);filter:drop-shadow(0 4px 8px #000)`;
        document.body.appendChild(g); drag.ghost = g; document.body.style.cursor = 'grabbing';
      }
      drag.ghost.style.left = `${e.clientX}px`; drag.ghost.style.top = `${e.clientY}px`;
    } else {
      drag.moved = true;
      const q = mkPct(drag.card, e);
      drag.tk.style.left = `${q.x}%`; drag.tk.style.top = `${q.y}%`;
      drag.tk.style.opacity = mkOver(drag.card, e) ? '' : '.3';                      // faded outside the card: releasing there removes it
    }
  });
  const end = e => {
    if (!drag) return;
    const d = drag; drag = null; document.body.style.cursor = '';
    const c = pmChar(), key = mkKeyNow();
    if (d.kind === 'pick') {
      if (!d.ghost) return;
      d.ghost.remove(); mkBlock = true; setTimeout(() => { mkBlock = false; }, 0);
      const card = main.querySelector('.pm .itcard[data-mkcard]');
      if (e.type === 'pointerup' && c && key && card && mkOver(card, e)) {
        pm.mkSel = { k: d.pick.dataset.mkpick, s: Number(d.pick.dataset.s) };
        commit(ed.addMarker(record, c.id, key, { k: pm.mkSel.k, ...(pm.mkSel.s ? { s: 1 } : {}), ...mkPct(card, e) }));
        render();
      }
    } else if (d.moved && c && key) {
      const i = Number(d.tk.dataset.i);
      if (e.type === 'pointerup' && mkOver(d.card, e)) { const q = mkPct(d.card, e); commit(ed.moveMarker(record, c.id, key, i, q.x, q.y)); }
      else commit(ed.removeMarker(record, c.id, key, i));
      render();
    }
  };
  main.addEventListener('pointerup', end); main.addEventListener('pointercancel', end);
})();

// Edit character modal: name, player and event traits are drafted in pm.cf and saved together (the class cannot be changed here).
main.addEventListener('click', e => {
  const q = sel => e.target.closest?.(sel), c = pmChar();
  if (!c) return;
  if (q('[data-charedit]') && !pm.modal) { e.stopImmediatePropagation(); pm.cf = { name: c.name, seat: c.seat ?? '', special: [...(c.special || [])] }; pm.modal = 'char'; render(); return; }
  if (pm.modal !== 'char' || !pm.cf) return;
  const x = q('[data-cfx]');
  if (x) { e.stopImmediatePropagation(); pm.cf.special = pm.cf.special.filter(k => k !== x.dataset.cfx); render(); return; }
  if (q('[data-cfsave]')) {
    e.stopImmediatePropagation();
    const f = pm.cf; let r = record;
    r = ed.renameCharacter(r, c.id, f.name); r = ed.setCharacterPlayer(r, c.id, f.seat);
    for (const t of SPECIAL_TRAITS) r = ed.setSpecialTrait(r, c.id, t.key, f.special.includes(t.key));
    pm.modal = null; pm.cf = null; commit(r); render();
  }
}, true);
main.addEventListener('input', e => { const f = e.target.closest?.('[data-cf]'); if (f && pm.cf) pm.cf[f.dataset.cf] = f.value; });
main.addEventListener('change', e => {
  const a = e.target.closest?.('[data-cfadd]');
  if (a && pm.cf && a.value) { pm.cf.special.push(a.value); render(); }
});

// Deck modal: hovering a card of the pool or the hand selection shows it large, docked beside the modal, with its tokens and stickers.
document.addEventListener('mouseover', e => {
  const big = main.querySelector('[data-poolbig]');
  if (!big) return;
  const card = e.target.closest?.('.pm .pcard');
  if (!card || !card.querySelector(':scope > img')) { big.hidden = true; return; }
  if ((pmset.zones.piles || pmset.zoom) !== 'hover' && pmset.zoom !== 'hover') return;
  const w = Math.min(({ s: 270, m: 340, l: 420 })[pmset.size] || 340, (innerHeight - 40) * 5 / 7);
  big.style.setProperty('--zw', `${w}px`);
  const img = card.querySelector(':scope > img').cloneNode();
  img.className = 'port';
  const wrap = document.createElement('div');
  wrap.style.position = 'relative'; wrap.appendChild(img);
  card.querySelectorAll(':scope > .tk').forEach(t => wrap.appendChild(t.cloneNode(true)));
  big.replaceChildren(wrap); big.hidden = false;
});

// Pile modal: click a pile to list its cards; Recover brings one card (or all) back to the hand; the card under the pointer is shown large.
main.addEventListener('click', e => {
  const q = sel => e.target.closest?.(sel), c = pmChar();
  if (!c) return;
  const rec = q('[data-pilerec]');
  if (rec) { e.stopImmediatePropagation(); commit(ed.moveCard(record, c.id, Number(rec.dataset.pilerec), 'hand')); return; }
  const all = q('[data-pilerecall]');
  if (all) {
    e.stopImmediatePropagation();
    const ids = (all.dataset.pilerecall === 'lost' ? c.lost : c.disc).filter(id => c.deck.includes(id));
    let r = record; for (const id of [...ids].reverse()) r = ed.moveCard(r, c.id, id, 'hand');
    pm.modal = null; commit(r); render(); return;
  }
  const pile = q('.pm .pile6');
  if (pile && !pm.modal && !q('.tkh')) { e.stopImmediatePropagation(); pm.pileZ = pile.dataset.pile === 'lost' ? 'lost' : 'disc'; pm.modal = 'pile'; render(); return; }
  const cell = q('.pm .pcell > img');
  if (cell && (pmset.zones.piles || pmset.zoom) === 'click') { e.stopImmediatePropagation(); const z = main.querySelector('[data-pilezoom]'); if (z) { const hide = !z.hidden && z.src === cell.src; showPileZoom(hide ? null : cell); } }
}, true);
function showPileZoom(cell) {                                                                          // cell = the .pcell > img to show, or null to hide
  const z = main.querySelector('[data-pilezoom]'), tk = main.querySelector('[data-pilezoomtk]');
  if (!z) return;
  if (!cell) { z.hidden = true; if (tk) tk.hidden = true; return; }
  z.src = cell.src; z.style.setProperty('--pzh', `${HOVER_H()}px`); z.hidden = false;
  if (!tk) return;
  const rc = z.getBoundingClientRect();
  Object.assign(tk.style, { left: `${rc.left}px`, top: `${rc.top}px`, width: `${rc.width}px`, height: `${rc.height}px` });
  tk.replaceChildren(...[...cell.parentElement.querySelectorAll(':scope > .tk')].map(t => t.cloneNode(true)));
  tk.hidden = false;
}
document.addEventListener('mouseover', e => {
  const img = e.target.closest?.('.pm .pcell > img'), z = main.querySelector('[data-pilezoom]');
  if (!z) return;
  if (!img) { if (z.src && (pmset.zones.piles || pmset.zoom) === 'hover') showPileZoom(null); return; }
  if ((pmset.zones.piles || pmset.zoom) !== 'hover') return;
  showPileZoom(img);
});

// Attack modifier deck action: changes the session state and writes a history line (the deck state is not part of the record, so the line is added directly).
function addLog(tabName, kind, d) {
  const e = { t: Date.now(), u: userName(), tab: tabName, kind, d };
  record = { ...record, log: foldLog(record.log || [], [e]).slice(-LOG_MAX) };
  localStore.save(record);
}
function amdDo(c, kind, key) {
  const before = drawState(c, pm.amd[c.id]);
  pm.amd[c.id] = amdAct(c, pm.amd[c.id], kind, key);
  const tile = before.tiles.find(t => t.key === key), sp = before.specials.find(s => s.key === key), face = tile?.face ?? sp?.label ?? key;
  const after = drawState(c, pm.amd[c.id]), sp2 = after.specials.find(s => s.key === key);
  if (kind === 'shuffle') addLog('Cards', 'Modifier deck', `${c.name}: discarded modifier cards shuffled back into the deck`);
  else if (kind === 'draw' && sp) addLog('Cards', 'Modifier deck', `${c.name}: drew ${sp.label} (removed from the game)`);
  else if (kind === 'draw') addLog('Cards', 'Modifier deck', `${c.name}: drew ${face} (${after.total} left in the deck)`);
  else if (kind === 'ret') addLog('Cards', 'Modifier deck', `${c.name}: returned ${face} from the discard to the deck`);
  else if (sp && sp2 && sp.n !== sp2.n) addLog('Cards', 'Modifier deck', `${c.name}: ${sp.label.toLowerCase()} cards in deck ${sp.n} to ${sp2.n}`);
  render();
}

// Playmat clicks: flip a played card, the + and - of XP, gold and inherited perks, click on a number to type a value.
const HUD_KEY = { xp: 'xp', gold: 'gold', inh: 'inh' };
main.addEventListener('click', e => {
  const dock = e.target.closest?.('button[data-modal]');
  if (phoneClick(e)) return;
  if (dock || e.target.closest?.('[data-opendeck]')) {
    pm.sheet = null;
    pm.modal = dock ? dock.dataset.modal : 'deck';
    const dc = pmChar();
    if (pm.modal === 'deck' && dc) { pm.dtab = dock ? 'hand' : 'pool'; pm.hsel[dc.id] = [...dc.deck]; pm.hsArmed = false; }
    render(); return;
  }
  if (e.target.closest?.('[data-modalclose]') || e.target.matches?.('.pm .mmodal')) { pm.modal = null; pm.amZoom = null; render(); return; }
  if (setClick(e)) return;
  const dch = pmChar();
  if (dch && (deckClick(e, dch) || itemClick(e, dch))) return;
  const pb = e.target.closest?.('[data-perkbox]') || e.target.closest?.('[data-perkrow]');
  if (pb && pmChar()) { const [i, b] = (pb.dataset.perkbox || pb.dataset.perkrow).split('.').map(Number); commit(ed.togglePerkBox(record, pmChar().id, i, b)); return; }
  const amb = e.target.closest?.('button[data-amact]'), amc = pmChar();
  if (amb && amc) { if (!amb.disabled) amdDo(amc, amb.dataset.amact, amb.dataset.key); return; }
  const amz = e.target.closest?.('[data-amzoom]');
  if (amz && pmset.amd === 'draw' && amc) { const left = drawState(amc, pm.amd[amc.id]).tiles.find(t => t.key === amz.dataset.amzoom)?.n; if (left) amdDo(amc, 'draw', amz.dataset.amzoom); return; }
  if (amz) { pm.amZoom = pm.amZoom === amz.dataset.amzoom ? null : amz.dataset.amzoom; render(); return; }
  if (pm.amZoom) { pm.amZoom = null; render(); }
  const mf = e.target.closest?.('[data-matflip]');
  if (mf) { pm.matSide = pm.matSide === 'back' ? 'front' : 'back'; render(); return; }
  const jt = e.target.closest?.('[data-jtab]');
  if (jt) { pm.jtab = jt.dataset.jtab; render(); return; }
  const jc = pmChar();
  if (jc && journalClick(e, jc)) return;
  const cp = e.target.closest?.('[data-code]');
  if (cp) {
    (navigator.clipboard ? navigator.clipboard.writeText(cp.dataset.code) : Promise.reject()).catch(() => {});
    const old = cp.innerHTML;
    cp.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    setTimeout(() => { cp.innerHTML = old; }, 900);
    return;
  }
  const bt = e.target.closest?.('[data-bnr]');
  if (bt) {
    (navigator.clipboard ? navigator.clipboard.writeText(bannerCode(bt.dataset.bnr)) : Promise.reject()).catch(() => {});
    const note = main.querySelector('[data-bnrnote]'), old = note.innerHTML;
    main.querySelectorAll('.bnrtile.copied').forEach(x => x.classList.remove('copied'));
    bt.classList.add('copied');
    note.innerHTML = `\u2713 Copied the <b>${esc(bt.title.replace(/^Copy the | banner code$/g, ''))} banner</b> code`;
    setTimeout(() => { note.innerHTML = old; bt.classList.remove('copied'); }, 1800);
    return;
  }
  if (e.target.closest?.('[data-codeadd]')) {
    const label = main.querySelector('[data-code-label]').value.trim(), text = main.querySelector('[data-code-text]').value.trim();
    if (label && text) { saveCodes([...loadCodes(), { label, text }]); render(); }
    return;
  }
  if (e.target.closest?.('[data-enhadd]')) {
    const c = record.chars.find(x => x.id === e.target.closest('[data-enhadd]').dataset.char), q = k => main.querySelector(`[data-enh-${k}]`).value;
    if (c) commit(ed.addEnhancement(record, { cls: c.cls, card: q('card'), top: q('top'), bottom: q('bottom'), price: q('price') }));
    return;
  }
  const ed1 = e.target.closest?.('[data-enhdel]');
  if (ed1) { commit(ed.removeEnhancement(record, Number(ed1.dataset.enhdel))); return; }
  const cd = e.target.closest?.('[data-codedel]');
  if (cd) { const a = loadCodes(); a.splice(Number(cd.dataset.codedel), 1); saveCodes(a); render(); return; }
  const f = e.target.closest?.('.flipcard[data-slot]');
  if (f) { flipPlayed(f); return; }
  const tk = e.target.closest?.('button[data-tk]');
  if (tk) {
    const c = record.chars.find(x => x.id === tk.dataset.char), d = c && tokenDefs(c.cls).find(t => t.k === tk.dataset.tk);
    if (d) commit(ed.setToken(record, c.id, d.k, d.states ? ((c.tok?.[d.k] || 0) + 1) % d.states.length : (c.tok?.[d.k] || 0) + Number(tk.dataset.d)));
    return;
  }
  const bgg = e.target.closest?.('button[data-bgg]');
  if (bgg) {
    const c = record.chars.find(x => x.id === bgg.dataset.char);
    if (!c) return;
    const ctx = { bannerUrl: bannerUrl(matSlug(c)), pretty, cardById };
    const text = bgg.dataset.bgg === 'turn' ? turnPost(c, ctx) : bgg.dataset.bgg === 'amd' ? amdRollCode(drawState(c, pm.amd[c.id]).faces) : cardsPost(c, ctx);
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).catch(() => {});
    const old = bgg.innerHTML;
    bgg.innerHTML = '\u2713 <span>Copied</span>';
    setTimeout(() => { bgg.innerHTML = old; }, 1100);
    return;
  }
  const b = e.target.closest?.('button[data-hud]');
  if (b) {
    const c = record.chars.find(x => x.id === b.dataset.char), k = HUD_KEY[b.dataset.hud];
    if (c && k) commit(ed.setCharacter(record, c.id, k, (c[k] || 0) + Number(b.dataset.d)));
    return;
  }
  const v = e.target.closest?.('.edv[data-hud]');
  if (v && !v.querySelector('input')) {
    const c = record.chars.find(x => x.id === v.dataset.char), k = HUD_KEY[v.dataset.hud];
    if (!c || !k) return;
    const inp = document.createElement('input');
    inp.className = 'edin'; inp.inputMode = 'numeric'; inp.value = c[k] ?? 0;
    v.textContent = ''; v.appendChild(inp); inp.focus(); inp.select();
    let done = false;
    const finish = ok => {
      if (done) return; done = true;
      const t = inp.value.trim();
      if (ok && /^[+-]\d+$/.test(t)) commit(ed.setCharacter(record, c.id, k, (c[k] || 0) + parseInt(t, 10)));
      else if (ok && /^\d+$/.test(t)) commit(ed.setCharacter(record, c.id, k, parseInt(t, 10)));
      else render();
    };
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.stopPropagation(); finish(true); } else if (ev.key === 'Escape') { ev.stopPropagation(); finish(false); } });
    inp.addEventListener('blur', () => finish(true));
    return;
  }
  const sb = e.target.closest?.('[data-handsort]');
  if (sb) { commit(ed.sortHand(record, sb.dataset.char, sb.dataset.handsort)); return; }
});
// Hover zoom: every card zooms to the same absolute height whatever its resting size (the CSS scales by --hz).
const HOVER_H = () => ({ s: 260, m: 320, l: 400 })[pmset.size] || 320;
main.addEventListener('mouseover', e => {
  const el = e.target.closest?.('.pm .fan6 .ac, .pm .activelist .ac, .pm .flipcard, .pm .shelf6 .it');
  if (!el || (el.classList.contains('flipcard') && !el.classList.contains('is-front'))) return;
  if (e.relatedTarget && el.contains(e.relatedTarget)) return;
  const h = el.getBoundingClientRect().height;
  if (h > 0) el.style.setProperty('--hz', HOVER_H() / h);
});
// Hold a + or - of the playmat to repeat it (the repeat clicks the button under the pointer, which survives the re-render).
(() => {
  let t, iv, held = false, x = 0, y = 0;
  const stop = () => { clearTimeout(t); clearInterval(iv); };
  main.addEventListener('pointerdown', e => {
    const b = e.target.closest?.('.pm .sp .spc button');
    if (!b || b.disabled) return;
    held = false; x = e.clientX; y = e.clientY; stop();
    t = setTimeout(() => { held = true; iv = setInterval(() => { const el = document.elementFromPoint(x, y)?.closest('.pm .sp .spc button'); if (el && !el.disabled) el.click(); else stop(); }, 90); }, 420);
  });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, stop));
  main.addEventListener('click', e => { if (held && e.isTrusted && e.target.closest?.('.pm .sp .spc button')) { held = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
})();
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
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('[data-flow]')) { e.preventDefault(); view.scnSel = Number(e.target.dataset.flow); render(); }
});
main.addEventListener('click', e => {
  const sec = e.target.closest('[data-secedit]')?.dataset.secedit;
  if (sec) {
    if (editSections.has(sec)) editSections.delete(sec); else editSections.add(sec);
    render();
    return;
  }
  if (!e.target.closest('[data-pageedit]')) return;
  if (editPages.has(tab)) editPages.delete(tab); else editPages.add(tab);
  render();
});
let fitTimer = 0;
window.addEventListener('resize', () => {
  if (view.flowZoom !== 'fit' || tab !== 'Scenarios' || view.scnView !== 'flow' || !record) return;
  clearTimeout(fitTimer);
  fitTimer = setTimeout(render, 150);
});
undoBtn.addEventListener('click', undo);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) { e.preventDefault(); undo(); }
});

// --- campaign file modal (import/export/clear) -------------------------------------------------------------
const userInput = document.getElementById('userName');
try { userInput.value = localStorage.getItem(USER_KEY) || ''; } catch { /* ignore */ }
userInput.addEventListener('change', () => { try { localStorage.setItem(USER_KEY, userInput.value.trim()); } catch { /* ignore */ } });
const settingsModal = document.getElementById('settingsModal');
const openSettings = () => { settingsModal.hidden = false; };
const closeSettings = () => { settingsModal.hidden = true; };
document.getElementById('settingsOpen').addEventListener('click', openSettings);
document.getElementById('settingsClose').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !settingsModal.hidden) closeSettings(); });

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
  closeSettings();
});
document.getElementById('export').addEventListener('click', () => {
  if (!record) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(localStore.exportBlob(record));
  a.download = 'campaign.json';
  a.click();
  URL.revokeObjectURL(a.href);
  closeSettings();
});
document.getElementById('clear').addEventListener('click', async () => {
  if (!record || !confirm('Remove the campaign from this browser? Export it first if you need it.')) return;
  await localStore.clear();
  record = null;
  history.length = 0;
  editPages.clear();
  editSections.clear();
  render();
  closeSettings();
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
