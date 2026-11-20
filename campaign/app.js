import { imageFile } from '../scripts/images.js';
// Campaign view with a simple edit mode. Edits go through scripts/campaign/edit.js (pure functions returning a new
// record); every change is saved to the browser at once and can be undone. Session start/commit, voting and the
// server come later (docs/campaign-schema.md section 10).
import { CARDS } from '../scripts/games/gh2_cards.js';
import { ITEMS } from '../scripts/campaign/itemList.js';
import { ITEM_COSTS } from '../scripts/games/gh2_item_costs.js';
import { TREASURES } from '../scripts/games/gh2_treasures.js';
import { SCENARIOS, STICKERS } from '../scripts/games/gh2_scenarios.js';
import { BATTLE_GOALS } from '../scripts/games/battle_goals.js';
import { escapeHtml as esc } from '../scripts/escape.js';
import { localStore } from '../scripts/campaign/store.js';
import { api, loadConn, saveConn, clearConn, loadCache, saveCache, parseInvite, inviteUrl, merge3, same } from '../scripts/campaign/sync.js';
import { cardImageUrl, itemImageUrl, itemBackUrl, eventImageUrl, matImageUrl, pqImageUrl, cardBackUrl, battleGoalImageUrl, matSlugOf } from '../scripts/campaign/cardImages.js';
import { playmatHtml, markersHtml, XP_STEPS, turnPost, cardsPost, goalRollCode, questRollCode, cleanSettings, displaySettingsHtml } from './playmat.js';
import { tokenDefs, markerTokens, MARK_STICKERS } from '../scripts/campaign/classTokens.js';
import { bannerUrl, bannerCode } from '../scripts/campaign/bggBanners.js';
import { GH2_PQ } from '../scripts/games/gh2_pq_text.js';
import { morphInto } from './morph.js';
import { registerMenu, openMenuFor } from './ctxmenu.js';
import { ask, notify } from './dialog.js';
import { phoneHtml } from './phone.js';
import { monstersHtml } from './monstersView.js';
import { monOf, deckState as monDeckState } from '../scripts/campaign/monsters.js';
import {
  normalize, validate, prosperityLevel, partyAvg, normalDifficulty, scenarioLevel, scenarioLevelRange, handOf, handList, zoneOf, CARD_ZONES, shopCopies, itemsInUse, ownsItem, unlockedBy, classByName, SCN_STATE_NAME, SCN_STATE, ownedCards, cardLevel, pendingPicks, handLimit,
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
import { createPreview, SHARE } from './preview.js';
import { deckOf, drawState, perkList } from '../scripts/campaign/amdDeck.js';
import { heroCatalog, heroPerkClass } from '../scripts/amd/heroDeck.js';
import { PERSONAL_QUESTS } from '../scripts/games/gh2_quests.js';
import ghConfig from '../scripts/games/gh.js';
import { GH_DECKS } from '../scripts/games/gh_decks.js';
import { buildFlow, LANES, laneOf, lanesOf, LANE_COLOR } from '../scripts/campaign/flow.js?v=7';
import { RESOURCES, RESOURCE_GAMES } from '../scripts/games/resources.js';
import { characterTraits } from '../scripts/campaign/outcomes.js';
import { SPECIAL_TRAITS, specialName } from '../scripts/campaign/traits.js';
import { eventsHtml, evInit, evClick, evChange, evSubmit, evOutside, evDragStart, evDragOver, evDrop, evDragEnd } from './eventsView.js?v=39';

const PAGE_TABS = ['Overview', 'Mercenaries', 'Monsters', 'Items', 'Events', 'Scenarios', 'Resources', 'Cards', 'History'];
const main = document.getElementById('main');
const tabsEl = document.getElementById('tabs');
const undoBtn = document.getElementById('undo');
const pageBtn = document.getElementById('pageBtn'), pageSheetEl = document.getElementById('pageSheet');
let pageSheet = false;   // the page menu of the phone header is open
let record = null;
let tab = 'Overview';              // top-level tab
let sub = '';                      // sub-tab under Mercenaries: a character id or 'add'
const editPages = new Set();        // pages (top-level tabs) currently in edit mode; each page has its own Edit button
let editing = false;               // derived in render(): is the visible page being edited
const history = [];                                   // own edits for undo, newest last: { before, after } (records)
const view = { flowFull: false, flowPos: null, scnView: 'table', logKind: 'all', logUser: 'all', flowShow: 'progress', flowLane: '', flowZoom: 'm', scnSel: null, scnStatus: '', scnSearch: '', scnSort: { col: '', dir: 1 }, itemSlot: '', itemSearch: '', itemGold: '', itemShow: 'unlocked', itemView: 'list', itemSel: null, itemSize: 'm', itemSort: { col: '', dir: 1 }, cardType: 'abilities', cardSlot: '', cardChk: '', cardKind: 'city', cardSide: 'front', cardDeck: '', cardMon: '', cardMLv: '', cardShow: 'unlocked', cardCls: '', cardLv: '', cardSearch: '', cardSize: 's', cardStk: true };   // itemView: 'list' | 'grid'

// Level order of ability cards: 1, X (the level 1.1 cards), 2 ... 9, then M (mastery).
const lvRank = lv => ({ X: 1.5, M: 99, a: 1.1, b: 1.2 }[lv] ?? Number(lv));   // a and b: the Jaws of the Lion level A and B cards
const lvLabel = lv => ({ M: 'Pack', a: 'A', b: 'B' }[lv] ?? String(lv));      // the Sawbones medical pack cards
const cardById = new Map(CARDS.map(c => [c.id, c]));
// Ability cards on the Cards tab: the GH2 tables above plus the Frosthaven and Jaws of the Lion classes (worldhaven data,
// scripts/games/wh_cards.js, classes from index 101 on, card ids from 100000 on). Other tabs keep the GH2 tables only.
// Cards tab: every playable class (gh2_classes.js: GH2E, Mercenary Pack, Jaws of the Lion, Frosthaven) and its cards.
const ABILITY_CLASSES = CLASSES;
const ABILITY_CARDS = CARDS;
const FULLSCREEN_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0l0 0a2 2 0 0 1 0 3L8 19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 7l3 3" stroke="currentColor" stroke-width="2"/></svg>';
const ICON_DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
const ITEM_SIZES = { s: 150, m: 188, l: 250 };      // minimum tile width in px for the item grid
// Filter and view settings are kept in this browser (not the search texts: a stale search would hide rows after a reload).
const VIEW_KEY = 'havenmap.campaign.view';
const VIEW_SAVED = ['scnView', 'logKind', 'logUser', 'flowShow', 'flowLane', 'flowZoom', 'flowPos', 'scnStatus', 'scnSort', 'itemSlot', 'itemShow', 'itemView', 'itemSize', 'itemSort', 'cardType', 'cardSlot', 'cardKind', 'cardSide', 'cardDeck', 'cardMon', 'cardMLv', 'cardShow', 'cardCls', 'cardLv', 'cardSize', 'cardStk'];
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
    if (v.flowPos && Number.isFinite(v.flowPos.px) && Number.isFinite(v.flowPos.py)) view.flowPos = { px: v.flowPos.px, py: v.flowPos.py };
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
    if (typeof v.cardStk === 'boolean') view.cardStk = v.cardStk;
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
const modalBtn = (attr, label) => `<button type="button" class="editbtn editicon secedit" ${attr} aria-label="Edit ${esc(label)}" title="Edit ${esc(label)}">${PENCIL}</button>`;

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
  const before = record;
  record = withLog(record, next);
  history.push({ before, after: record });
  if (history.length > 50) history.shift();
  persist();
  render();
}
// Undo reverts my last edit but keeps the log, adding what was undone as new entries. Changes of other players that arrived since
// then stay (a three-way merge: the edit's result as base, the record before it as mine, the current record as theirs).
function undo() {
  if (!history.length) return;
  const h = history.pop();
  const target = same(record, h.after) ? h.before : merge3(h.after, h.before, record);
  record = withLog(record, target, 'Undo: ');
  persist();
  render();
}

// --- shared campaign (scripts/campaign/sync.js, server/README.md) --------------------------------------------------------------
// Without a connection the record lives in this browser (localStore), as before. With one (an invite link was opened), the record
// is loaded from the API, every edit is saved a few seconds after the last change, and the page asks for a newer version every
// minute while it is visible. Edits of two players are merged; a value both changed keeps the other player's value.
const SYNC_MS = 3000, POLL_MS = 60000, RETRY_MS = 30000;
let srv = null;                                       // { cid, token, ver, base, timer, busy, again }: base = the record as the server has it
const syncEl = document.getElementById('syncState'), whoEl = document.getElementById('syncWho');
// Who saved last: the server keeps the label of the token that saved (`by`) and the time (`t`) with the record. No extra requests or writes.
const ago = t => { const m = Math.max(0, Math.floor((Date.now() - t) / 60000)); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`; };
function showWho() {
  const on = srv && srv.t && srv.by !== undefined;
  whoEl.hidden = !on;
  if (!on) return;
  const who = srv.by === null ? 'you' : srv.by || 'someone';
  whoEl.textContent = `Last edit: ${who}, ${ago(srv.t)}`;
  whoEl.title = `Shared campaign: last saved by ${who}, ${new Date(srv.t).toLocaleString()}
Campaign id: ${srv.cid}`;
}
setInterval(showWho, 30000);
function setSync(state) {
  syncEl.hidden = !srv;
  if (!srv) { showWho(); return; }
  showWho();
  const [text, tip] = { ok: ['Saved', 'Shared campaign: saved'], pending: ['Saving', 'Shared campaign: saving'], offline: ['Offline', 'Shared campaign: the server cannot be reached; edits are kept in this browser and sent later'] }[state];
  syncEl.textContent = text; syncEl.title = `${tip}
Campaign id: ${srv.cid}`; syncEl.dataset.state = state;
}
const cacheSrv = () => { if (srv && record) saveCache({ cid: srv.cid, ver: srv.ver, base: srv.base, record }); };
function persist() {
  if (!srv) { localStore.save(record); return; }
  cacheSrv();
  clearTimeout(srv.timer);
  srv.timer = setTimeout(pushNow, SYNC_MS);
  setSync('pending');
}
async function pushNow() {
  if (!srv) return;
  if (srv.busy) { srv.again = true; return; }
  clearTimeout(srv.timer);
  if (!record || same(record, srv.base)) { setSync('ok'); return; }
  srv.busy = true;
  const sent = record;
  try {
    const r = await api('PUT', `/c/${srv.cid}`, srv.token, { base: srv.ver, record: sent });
    if (r.status === 200) { srv.ver = r.data.ver; srv.base = sent; srv.by = null; srv.t = Date.now(); }
    else if (r.status === 409) { await pullAndMerge(); srv.again = true; }
    else throw new Error(r.data?.error || `HTTP ${r.status}`);
    setSync(same(record, srv.base) ? 'ok' : 'pending');
  } catch {
    setSync('offline');
    srv.timer = setTimeout(pushNow, RETRY_MS);
  } finally {
    if (srv) { srv.busy = false; cacheSrv(); if (srv.again) { srv.again = false; pushNow(); } }
  }
}
// Load the server's record and merge it with the local edits that are not saved yet.
async function pullAndMerge() {
  const r = await api('GET', `/c/${srv.cid}`, srv.token);
  if (r.status !== 200) throw new Error(r.data?.error || `HTTP ${r.status}`);
  const remote = normalize(r.data.record), conflicts = [];
  const merged = !record || !srv.base || same(record, srv.base) ? remote : merge3(srv.base, record, remote, conflicts);
  srv.base = remote; srv.ver = r.data.ver; srv.by = r.data.by; srv.t = r.data.t;
  if (!same(merged, record)) { record = merged; render(); }
  cacheSrv();
  if (conflicts.length) notify('Changed by another player', `${conflicts.length === 1 ? 'One value was' : `${conflicts.length} values were`} changed by you and another player at the same time. Their version was kept.`);
}
async function poll() {
  if (!srv || srv.busy || document.hidden) return;
  try {
    const r = await api('GET', `/c/${srv.cid}/ver`, srv.token);
    if (r.status !== 200) throw new Error();
    if (r.data.ver !== srv.ver) { await pullAndMerge(); if (!same(record, srv.base)) persist(); }
    setSync(same(record, srv.base) ? 'ok' : 'pending');
  } catch { setSync('offline'); }
}
setInterval(poll, POLL_MS);
document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
// closing the tab: send what is not saved yet (the next start sends it otherwise, from the copy in this browser)
window.addEventListener('pagehide', () => {
  if (!srv || !record || srv.busy || same(record, srv.base)) return;
  const body = { base: srv.ver, record };
  api('PUT', `/c/${srv.cid}`, srv.token, body, { keepalive: JSON.stringify(body).length < 60000 }).catch(() => {});
});
// Start with a connection: the server's record, merged with edits left in this browser's copy. Unreachable: the copy, saved later.
async function startShared(conn) {
  srv = { cid: conn.cid, token: conn.token, ver: 0, base: null, timer: 0, busy: false, again: false };
  const cache = loadCache(conn.cid);
  try {
    const r = await api('GET', `/c/${conn.cid}`, conn.token);
    if (r.status === 401 || r.status === 403 || r.status === 404) {
      srv = null; clearConn();
      await notify('Shared campaign', r.status === 404 ? 'The shared campaign was not found. This browser works on its own copy.' : 'The invite of this browser is no longer valid. Ask for a new invite link.');
      if (cache?.record) { const own = normalize(cache.record); localStore.save(own); return own; }
      return localStore.load();
    }
    if (r.status !== 200) throw new Error();
    const remote = normalize(r.data.record);
    srv.ver = r.data.ver; srv.base = remote; srv.by = r.data.by; srv.t = r.data.t;
    if (cache?.base && cache.record && !same(cache.record, cache.base)) { const merged = merge3(normalize(cache.base), normalize(cache.record), remote); setTimeout(persist); return merged; }
    setSync('ok');
    return remote;
  } catch {
    setSync('offline');
    srv.timer = setTimeout(poll, RETRY_MS);
    if (!cache) return null;
    srv.ver = cache.ver; srv.base = cache.base ? normalize(cache.base) : null;
    return normalize(cache.record);
  }
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
  // phone header: the page name opens a sheet with every page (touch.css)
  pageBtn.innerHTML = `<span class="pbcamp">${esc(record?.name || 'Campaign')}</span><span class="pbtab">${esc(tab)}<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>`;
  pageBtn.setAttribute('aria-expanded', String(pageSheet));
  pageSheetEl.hidden = !pageSheet;
  pageSheetEl.innerHTML = pageSheet ? `<div class="bsheet" role="dialog" aria-modal="true" aria-label="Pages"><div class="bsgrab" aria-hidden="true"></div><div class="pagelist">${PAGE_TABS.map(t => `<button type="button" data-tab="${esc(t)}"${t === tab ? ' aria-current="page"' : ''}>${esc(t)}</button>`).join('')}</div></div>` : '';
}
function selectTab(t) {
  if (!PAGE_TABS.includes(t)) return;
  tab = t; pageSheet = false;
  render();
  try { localStorage.setItem('havenmap.campaign.tab', t); } catch { /* ignore */ }
}
tabsEl.addEventListener('click', e => selectTab(e.target.closest('[data-tab]')?.dataset.tab));
pageBtn.addEventListener('click', () => { pageSheet = !pageSheet; renderTabs(); });
pageSheetEl.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]')?.dataset.tab;
  if (t) selectTab(t); else if (e.target === pageSheetEl) { pageSheet = false; renderTabs(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && pageSheet) { pageSheet = false; renderTabs(); e.stopImmediatePropagation(); } }, true);
// the header height, for layouts that fill the rest of the window (the phone view of the Mercenaries tab)
new ResizeObserver(() => document.documentElement.style.setProperty('--hdrh', `${document.querySelector('body > header').offsetHeight}px`)).observe(document.querySelector('body > header'));

// --- views ----------------------------------------------------------------------------------------------

function table(head, rows) {
  return `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>`;
}
// Data tables of the list pages (Items, Scenarios): the shared table look of style.css (.dtable), columns by the class.
const dataTable = (cls, head, rows) => table(head, rows).replace('<table>', `<table class="dtable ${cls}">`);
// Overview tables: the box scrolls sideways on a phone instead of widening the page; the header is a small muted label.
const ovTable = (head, rows) => `<div class="tablewrap">${table(head, rows).replace('<table>', '<table class="ovtable">')}</div>`;
// Empty state of an Overview list: one muted line.
const noneText = t => `<p class="emptyline">${esc(t)}</p>`;


// A class chip for the Overview. A class a character plays is highlighted and shows its player ("Tinkerer: Guido"), or the
// character's name in brackets when no player is set ("Cragheart (Shale)").
function classChip(r, name) {
  const lower = String(name).toLowerCase();
  const played = r.chars.filter(c => String(c.cls).toLowerCase() === lower);
  if (!played.length) return classKnown(name) ? chip(name) : chip(`${name} (unknown)`, 'warn');
  const who = played.map(c => r.players.find(p => p.seat === c.seat)?.name).filter(Boolean);
  const label = who.length ? `${name}: ${who.join(', ')}` : `${name} (${played.map(c => c.name).join(', ')})`;
  return `<span class="chip ok" title="${esc(`Active: ${played.map(c => c.name).join(', ')}`)}">${esc(label)}</span>`;
}

// Average level of the party: derived from the mercenaries' own levels, else the stored value.
const avgText = avg => (Number.isInteger(avg) ? avg : avg.toFixed(2));

// A scenario count with its share of all scenarios: label, bar, count and percentage in one row.
const scnRow = (label, n, total, cls) => {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return `<div class="kv scnrow ${cls}" title="${esc(n)} of ${esc(total)} scenarios ${esc(label.toLowerCase())}"><span>${esc(label)}</span><span class="scnbar" role="progressbar" aria-label="${esc(label)} scenarios" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></span><span class="scnn">${esc(n)}</span><span class="scnpct">${pct}%</span></div>`;
};
function overview(r) {
  const { counts, days, avgDays } = scenarioCounts(r);
  // The marker shows its value next to it; near the right end the label goes to the left of the marker.
  const repBar = v => {
    const pct = ((20 - Math.max(-10, Math.min(20, v))) / 30) * 97, flip = pct > 80;
    return `<div class="bar" role="img" title="${esc(v)}" aria-label="Value ${esc(v)}"><i style="left:${pct}%"><b class="${flip ? 'flip' : ''}">${esc(v)}</b></i></div>`;
  };
  const rep = (label, key) => kv(label, esc(r.rep[key])) + repBar(r.rep[key]);
  // Average level is derived from the mercenaries' own levels (not entered by hand); Normal difficulty is that
  // average level halved and rounded up (record.js normalDifficulty).
  const avg = partyAvg(r);
  return `
  <div class="overview">
  <div class="grid">
    <div class="card"><h3>Party${modalBtn('data-party-open', 'party')}</h3>${kv('Ø Character level', esc(avgText(avg)))}
      ${kv('Normal difficulty', esc(normalDifficulty(r)))}
      ${kv('Scenario level', `${esc(scenarioLevel(r))}${r.party.diff ? ` <span class="lvdiff">(${esc(signed(r.party.diff))})</span>` : ''}`)}
      ${kv('Inspiration', esc(r.party.insp))}
      ${kv('Enhancements', esc(r.enh.length))}</div>
    <div class="card"><h3>Prosperity${modalBtn('data-pros-open', 'prosperity')}</h3>${kv('Prosperity level', esc(prosperityLevel(r.pros)))}${kv('Prosperity checks', esc(r.pros))}${kv('Great Oak sanctuary', esc(r.don))}${kv('Imbuement', esc(r.imb))}</div>
    <div class="card"><h3>Reputation${modalBtn('data-rep-open', 'reputation')}</h3>${rep('Demons', 'demons')}${rep('Merchants', 'merchants')}${rep('City Guard', 'guard')}</div>
    <div class="card"><h3>Scenarios</h3>${[[SCN_STATE.COMPLETED, 'done'], [SCN_STATE.UNLOCKED, 'open'], [SCN_STATE.LOCKED, 'shut']].map(([i, cls]) => scnRow(SCN_STATE_NAME[i], counts[i] || 0, SCENARIOS.length, cls)).join('')}${kv(SCN_STATE_NAME[SCN_STATE.LOCKED_OUT], esc(counts[SCN_STATE.LOCKED_OUT] || 0))}${kv('Total', esc(SCENARIOS.length))}
      ${kv('Days played', esc(days))}${kv('Ø Days/scenario', esc(avgDays))}</div>
  </div>
  <div class="ovgrid">
    <section class="card ovwide"><h3>Unlocked classes <span class="ovcount">${r.cls.length} of ${availableSet(r).size}</span>${modalBtn('data-cls-open', 'unlocked classes')}</h3><div class="chips">${r.cls.map(c => classChip(r, c)).join('')}</div></section>
    <section class="card"><h3>Players${modalBtn('data-pl-open', 'players')}</h3>${r.players.length ? `<div class="chips">${r.players.map(p => chip(p.name)).join('')}</div>` : noneText('No players yet.')}</section>
    <section class="card ovwide"><h3>Retired characters${modalBtn('data-ret-open', 'retired characters')}</h3>${r.retired.length ? ovTable(['Class', 'Player', 'Name', '<span class="num">Lv</span>', '<span class="num">Perks</span>', '<span class="num">Masteries</span>'],
      r.retired.map(x => `<tr><td>${esc(x.cls)}</td><td>${esc(x.player ?? '')}</td><td>${esc(x.name ?? '')}</td><td class="num">${esc(x.lv ?? '')}</td><td class="num">${esc(x.perks ?? '')}</td><td class="num">${esc(x.masteries ?? '')}</td></tr>`)) : noneText('No retired characters yet.')}</section>
    <section class="card"><h3>Campaign stickers${modalBtn('data-stk-open', 'campaign stickers')}</h3>${r.stk.length ? `<div class="stickers">${r.stk.map(s => {
      const st = STICKERS.find(x => x.name.toLowerCase() === String(s).toLowerCase());
      return st ? `<figure class="sticker"><img src="${esc(st.img)}" alt="" loading="lazy"><figcaption>${esc(st.name)}</figcaption></figure>` : chip(s, 'warn');
    }).join('')}</div>` : noneText('No stickers yet.')}</section>
  </div>
  </div>`;
}

// --- History tab: the recorded edits, grouped by the page they were made on, newest first ----------------------------------
const HISTORY_SHOWN = 20;                           // entries listed per page
const when = t => new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
function historyPage(r) {
  const log = r.log || [];
  if (!log.length) return '<div class="empty">No edits recorded yet. Edits made from now on are listed here, by page.</div>';
  const kinds = [...new Set(log.map(e => e.kind))].sort(), f = kinds.includes(view.logKind) ? view.logKind : 'all';
  const users = [...new Set(log.map(e => e.u).filter(Boolean))].sort((a, b) => a.localeCompare(b)), fu = users.includes(view.logUser) ? view.logUser : 'all';
  const shown = log.filter(e => (f === 'all' || e.kind === f) && (fu === 'all' || e.u === fu));
  const bar = `<div class="histbar filters"><label for="logfilter">Show</label><select id="logfilter" data-logkind><option value="all">All</option>${kinds.map(k => `<option${k === f ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select>${users.length ? `<label for="loguser">Player</label><select id="loguser" data-loguser><option value="all">All</option>${users.map(u => `<option value="${esc(u)}"${u === fu ? ' selected' : ''}>${esc(u)}</option>`).join('')}</select>` : ''}<span class="hn">${shown.length} entries</span></div>`;
  if (!shown.length) return `${bar}<div class="empty">No changes match.</div>`;
  const groups = LOG_TABS.map(tabName => {
    const list = shown.filter(e => e.tab === tabName).reverse();
    if (!list.length) return '';
    const rows = list.slice(0, HISTORY_SHOWN).map(e => `<tr><td class="nowrap">${esc(when(e.t))}</td><td>${esc(e.u)}</td><td>${esc(e.kind)}</td><td>${esc(e.d)}</td></tr>`);
    return `<section class="card histcard"><h3>${esc(tabName)} <span class="ovcount">${list.length}</span></h3>${dataTable('histtable', ['Time', 'User', 'Type', 'Change'], rows)}</section>`;
  }).join('');
  return bar + `<div class="histpage">${groups}</div>`;
}

// --- the scenario flowchart -------------------------------------------------------------------------------------------------
// Layout in scripts/campaign/flow.js. Spoilers: "Progress" draws the scenarios that are unlocked, completed or locked out, plus the
// locked ones they lead to; locked scenarios are drawn as "?" (name and number only in edit mode), as locked items are.
// Chart sizes: fixed scales, and 'fit' = as wide as the box (computed in flowchart()). Fullscreen (view.flowFull) shows the chart over the whole window.
const FLOW_ZOOM = { s: 0.45, m: 0.65, l: 0.85, xl: 1.1, xxl: 1.4, fit: 0 };
const FLOW_ZOOM_LABEL = { s: 'S', m: 'M', l: 'L', xl: 'XL', xxl: 'XXL', fit: 'Fit' };
// The row below the toolbar (as on the Cards tab): the view switch and, for the table, the number of scenarios listed.
const scnViewToggle = n => `<div class="imgmode viewmode" role="group" aria-label="Scenario view">${[['table', isPhone() ? 'List' : 'Table'], ['flow', 'Flowchart']].map(([v, l]) => `<button type="button" data-scnview="${v}" aria-pressed="${view.scnView === v}">${l}</button>`).join('')}${n == null ? '' : `<span class="ctrlhint">${n} scenarios</span>`}</div>`;
// GeekRoller code builder/button/copy, shared by every "random X" roller (scenario, item, ...): one face per
// candidate, e.g. 1custom5{1;9;10;13;17}. The roll itself happens on BGG, same as the attack-modifier decks'
// "Copy GeekRoller code" button (scripts/decks.js) -- this just builds and copies the code, it never picks itself.
function rollerCodeOf(faces) {
  return faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '';
}
// Roll buttons of the Scenarios and Items tabs: the merc tab's roll button style (dice icon and label; copies the code, shows Copied).
function rollerBtn(attr, noun, code, emptyTitle) {
  const title = code ? `Copy the GeekRoller code for a random ${noun}` : emptyTitle;
  return `<button type="button" class="btn6 rollbtn" ${attr} ${code ? '' : 'disabled'} title="${esc(title)}">${ICON_DICE}<span>BGG code for roll</span></button>`;
}
async function copyRollerCode(btn, code) {
  const orig = btn.innerHTML, origTitle = btn.title;
  try {
    await navigator.clipboard.writeText(code);
    btn.innerHTML = btn.classList.contains('rollbtn') ? '✓ <span>Copied</span>' : ICON_CHECK;
    btn.title = 'Copied the GeekRoller code';
  } catch {
    btn.title = 'Copy failed';
  }
  setTimeout(() => { btn.innerHTML = orig; btn.title = origTitle; }, 1500);
}

function scenarioRollerCode(r) {
  return rollerCodeOf(SCENARIOS.filter(s => (r.scn[String(s.n)]?.s ?? 0) === 1).map(s => s.n));
}
const scenarioRollerBtn = r => rollerBtn('data-scnroll', 'side scenario', scenarioRollerCode(r), 'No unlocked scenarios');

// The 16 GH2E items flagged "random" in the Gloomhaven Secretariat data (never sold in the shop, only gained
// from a "random item design"/"random item" reward): ids 81-96. "Gain a random item design" draws one of these
// that isn't already unlocked -- it is not a draw from the full item catalog.
const RANDOM_ITEM_IDS = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96];
function itemRollerCode(r) {
  return rollerCodeOf(ITEMS.filter(i => RANDOM_ITEM_IDS.includes(i.id) && !r.items.unl.includes(i.id)).map(i => i.id));
}
const itemRollerBtn = r => rollerBtn('data-itemroll', 'item design', itemRollerCode(r), 'No item designs left to gain');

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
  if (view.flowLane) vis = new Set([...vis].filter(n => lanesOf(byN.get(n)).includes(view.flowLane)));
  const g = buildFlow(SCENARIOS, vis);
  const full = view.flowFull;
  const z = view.flowZoom === 'fit' ? Math.min(3, Math.max(0.3, ((full ? window.innerWidth : main.clientWidth - 32) - 4) / g.width)) : FLOW_ZOOM[view.flowZoom];
  const masked = n => st(n) === 0;
  const zoomBtns = `<div class="imgmode viewmode" role="group" aria-label="Chart size">${Object.entries(FLOW_ZOOM_LABEL).map(([k, l]) => `<button type="button" data-flowzoom="${k}" aria-pressed="${view.flowZoom === k}" title="Chart size ${l}${k === 'fit' ? ' (as wide as the window)' : ''}">${l}</button>`).join('')}</div>`;
  const findable = g.nodes.filter(n => !masked(n.n)).map(n => byN.get(n.n)).sort((a, b) => a.n - b.n);   // locked boxes ("?") are not found, not even by number
  const find = `<input type="search" class="flowfind" data-flowfind list="flowFindList" value="${esc(flowFindQ)}" placeholder="Find scenario" aria-label="Find a scenario by number or name" autocomplete="off"><datalist id="flowFindList">${findable.map(s => `<option value="${esc(`${s.n} ${s.name || ''}`.trim())}"></option>`).join('')}</datalist>`;
  const fsBtn = `<button type="button" class="editbtn editicon" data-flowfull aria-pressed="${!!full}" title="${full ? 'Exit fullscreen' : 'Fullscreen'}" aria-label="${full ? 'Exit fullscreen' : 'Fullscreen'}">${FULLSCREEN_ICON}</button>`;
  const filters = `<div class="filters">
    <select id="flowShow">${[['progress', 'Progress and next steps'], ['all', 'All scenarios']].map(([v, l]) => `<option value="${v}" ${view.flowShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select id="flowLane"><option value="">All scenario chains</option>${LANES.map(l => `<option ${view.flowLane === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
    ${find}${zoomBtns}${fsBtn}
    ${scenarioRollerBtn(r)}</div>`;
  if (!g.nodes.length) return filters + scnViewToggle() + '<div class="empty">No scenarios to show yet.</div>';
  const legend = `<span class="flegend">${[1, 2, 0, 3].map(i => `<span class="spill s${i}">${SCN_STATE_NAME[i]}</span>`).join('')}</span>`;
  // lanes: a faint tint and a stripe in the storyline colour
  const lanes = g.lanes.map((l, i) => `<rect class="flane${i % 2 ? ' alt' : ''}" x="0" y="${l.y}" width="${g.width}" height="${l.h}"/><rect x="0" y="${l.y}" width="${g.width}" height="${l.h}" fill="${laneColor(l.name)}" opacity=".07"/><rect x="0" y="${l.y}" width="4" height="${l.h}" fill="${laneColor(l.name)}"/>`).join('');
  // lane names in a top layer; flowSync() keeps each at the left edge of the view and inside its lane while the chart scrolls
  const labels = `<g class="flabels" aria-hidden="true">${g.lanes.map(l => `<g class="flabelg" data-y="${l.y}" data-h="${l.h}" transform="translate(2,${l.y + 2})"><rect class="flabbg" width="10" height="24" rx="12" fill="${laneColor(l.name)}"/><text class="flabel" x="8" y="17">${esc(l.name.toUpperCase())}</text></g>`).join('')}</g>`;
  // where the chart opens without a remembered position: the available scenario unlocked most recently (by the completion date
  // of the scenario that unlocks it), else the last completed one
  const done = n => (st(n) === 2 ? r.scn[String(n)]?.d || '' : '');
  const unlockDate = n => SCENARIOS.reduce((m, s) => ((s.unl || []).includes(n) && done(s.n) > m ? done(s.n) : m), '');
  const pick = (list, key) => list.reduce((best, n) => (best == null || key(n) > key(best) || (key(n) === key(best) && n > best) ? n : best), null);
  flowHome = pick(g.nodes.filter(n => st(n.n) === 1).map(n => n.n), unlockDate) ?? pick(g.nodes.filter(n => st(n.n) === 2).map(n => n.n), done);
  // the overview map: boxes in their state colour (no names), the frame of the visible part; flowSync() places the frame
  const mk = Math.min(200 / g.width, 150 / g.height), mini = `<svg class="flowmini" width="${Math.round(g.width * mk)}" height="${Math.round(g.height * mk)}" viewBox="0 0 ${g.width} ${g.height}" preserveAspectRatio="none" role="img" aria-label="Overview of the flowchart" hidden>
    ${g.lanes.map((l, i) => `<rect class="flane${i % 2 ? ' alt' : ''}" x="0" y="${l.y}" width="${g.width}" height="${l.h}"/>`).join('')}${g.nodes.map(n => `<rect class="fmnode s${st(n.n)}${masked(n.n) ? ' mask' : ''}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10"/>`).join('')}<rect class="fmview" x="0" y="0" width="0" height="0"/></svg>`;
  const edges = g.edges.map(e => `<path class="fedge${st(e.from) === 2 ? ' on' : ''}" data-from="${e.from}" data-to="${e.to}" d="${e.d}" marker-end="url(#farrow)"/>`).join('');
  // boxes: the sticker art on top, a band with number and name below (a stripe in the storyline colour), the state icon in a
  // corner dot; locked boxes show a "?" and no art
  const BAND = 30;
  // a chest in the upper left corner while an unlocked scenario still has treasure that nobody took (with the number left when more than one)
  const treLeft = (k, hide) => { const t = byN.get(k)?.tre || [], left = hide ? 0 : t.filter(x => !r.decks.tre.includes(x)).length;
    return left ? `<g class="ftre" transform="translate(13,13)"><title>${left} treasure${left > 1 ? 's' : ''} left</title><circle r="9"/><g class="fchest">${FLOW_CHEST}</g>${left > 1 ? `<text x="9" y="9" class="ftren">${left}</text>` : ''}</g>` : ''; };
  // a chain on the middle of each forced link (no city phase after the scenario, the next one must be played)
  const forcedMarks = g.edges.filter(e => e.forced).map(e => `<g class="flink" transform="translate(${e.mx},${e.my})"><title>Forced link: no city phase, ${e.to} must be played next</title><circle r="13"/><g transform="scale(.74) translate(-12,-12)" class="flinkicon">${FLOW_LINK}</g></g>`).join('');
  const nodes = g.nodes.map(n => {
    const s = byN.get(n.n), hide = masked(n.n), name = String(s.name || ''), src = hide ? '' : scnImg(s);
    const art = hide ? `<text class="fq" x="${n.w / 2}" y="${(n.h - BAND) / 2 + 12}" text-anchor="middle">?</text>`
      : src ? `<image href="${esc(src)}" x="6" y="5" width="${n.w - 12}" height="${n.h - BAND - 8}" preserveAspectRatio="xMidYMid meet"/>` : '';
    const label = hide ? '' : `<text class="fname" x="9" y="${n.h - 10}"><tspan class="fnum">${esc(s.n)}</tspan> ${esc(cutText(name, n.n >= 10 ? 17 : 18))}</text>`;
    return `<g class="fnode s${st(n.n)}${hide ? ' mask' : ''}${view.scnSel === n.n ? ' sel' : ''}${flowFound === n.n && !hide ? ' found' : ''}" data-flow="${n.n}" tabindex="0" role="button" transform="translate(${n.x},${n.y})"><title>${hide ? 'Locked' : esc(`${s.n} ${name} (${SCN_STATE_NAME[st(n.n)]})`)}</title>
      <rect class="fbox" width="${n.w}" height="${n.h}" rx="10"/>${art}
      <path class="fband" d="M1,${n.h - BAND} H${n.w - 1} V${n.h - 10} a9,9 0 0 1 -9,9 H10 a9,9 0 0 1 -9,-9 Z"/>${hide ? '' : laneStripe(lanesOf(s), 1, n.h - BAND, n.w - 2)}${label}
      ${s.boss && !hide ? `<g class="fboss" transform="translate(${n.w - 13},35)"><title>Boss scenario</title><circle r="9"/><g transform="translate(-6.5,-6.5) scale(.54)">${SKULL}</g></g>` : ''}<circle class="fdot" cx="${n.w - 13}" cy="13" r="9"/><g class="ficon" transform="translate(${n.w - 19},7)">${FLOW_ICON[hide ? 0 : st(n.n)]}</g>${treLeft(n.n, hide)}</g>`;
  }).join('');
  const svg = `<svg class="flowsvg" width="${Math.round(g.width * z)}" height="${Math.round(g.height * z)}" viewBox="0 0 ${g.width} ${g.height}" role="img" aria-label="Scenario flowchart">
    <defs><marker id="farrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="farrowhead"/></marker><marker id="farrowp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="farrowhead pth"/></marker></defs>${lanes}${edges}${nodes}${forcedMarks}${labels}</svg>`;
  if (full) return `<div class="flowstage full"><div class="flowwrap full"><div class="flowfsbar">${find}${zoomBtns}${fsBtn}${scenarioRollerBtn(r)}${legend}</div>${svg}</div>${mini}</div>`;
  return filters.replace(/<\/div>$/, `${legend}</div>`) + scnViewToggle() + `<div class="flowstage"><div class="flowwrap">${svg}</div>${mini}</div>`;
}
const cutText = (t, max) => (t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t);
// The 3 px storyline stripe of a box: one colour, or the two storylines side by side (first colour left).
const laneStripe = (ls, x, y, w) => ls.map((l, i) => `<rect x="${x + i * w / ls.length}" y="${y}" width="${w / ls.length}" height="3" fill="${laneColor(l)}"/>`).join('');
const laneColor = name => LANE_COLOR[name] || LANE_COLOR.Other;
// Sticker art of a scenario: the local copy under images/, else the remote address.
const scnImg = s => (s?.img ? imageFile(s.img, '../') || s.img : '');
// The treasures of a completed scenario for the table (its tiles and any number entered with the result); none before completion.
const scnTreasures = (r, s) => ((r.scn[String(s.n)]?.s ?? 0) === 2 ? [...new Set([...(s.tre || []), ...(r.scn[String(s.n)]?.ch || [])])].sort((a, b) => a - b) : []);
// Treasure chips of the scenario page and the chest mark of the flowchart boxes.
const TRE_CHEST = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M3 10.5V18a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 18v-7.5z" fill="currentColor" opacity=".9"/><path d="M3 10.5V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1.5z" fill="currentColor"/><rect x="10.3" y="9.3" width="3.4" height="4.2" rx=".8" fill="#1b150c"/><path d="M3 10.5h18" stroke="#1b150c" stroke-width="1.2"/></svg>';
const TRE_TAKEN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
// Skull (24 x 24, filled; the eyes, nose and teeth are cut out in the page colour): marks a boss scenario.
const SKULL = '<path d="M12 2.6c-4.5 0-7.6 3-7.6 7.3 0 2.4 1 4 2.6 5.1V18c0 .9.7 1.5 1.5 1.5h7c.8 0 1.5-.6 1.5-1.5v-3c1.6-1.1 2.6-2.7 2.6-5.1 0-4.3-3.1-7.3-7.6-7.3z"/><g class="skcut"><circle cx="8.9" cy="10.6" r="2.1"/><circle cx="15.1" cy="10.6" r="2.1"/><path d="M12 12.8l-1.2 2.4h2.4z"/><path d="M10.2 16.6v2.6M12 16.6v2.6M13.8 16.6v2.6" fill="none" stroke-width="1"/></g>';
const skullIcon = (cls = 'skull') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${SKULL}</svg>`;
// Chain (24 x 24, stroke icon): two interlocked links.
const FLOW_LINK = '<path d="M10 13.5a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 10.5a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
const FLOW_CHEST = '<path d="M-6,-1 V4 a1,1 0 0 0 1,1 H5 a1,1 0 0 0 1,-1 V-1 Z" fill="currentColor"/><path d="M-6,-1 V-2 a3,3 0 0 1 3,-3 H3 a3,3 0 0 1 3,3 V-1 Z" fill="currentColor" opacity=".8"/><rect x="-1.1" y="-2" width="2.2" height="3" rx=".5" fill="#1b150c"/>';
// State icons in the corner dot of a box (12x12, currentColor = the state colour): locked, unlocked (available), completed, locked out.
const FLOW_ICON = [
  '<rect x="2" y="5.5" width="8" height="6" rx="1.2" fill="currentColor"/><path d="M3.8 5.5V4a2.2 2.2 0 0 1 4.4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  '<circle cx="6" cy="6" r="4.5" fill="currentColor"/>',
  '<path d="M1.5 6.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  '<path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
];
// Path highlight: the chain of scenarios that unlocked scenario n (all the way back) and the scenarios it unlocks; the rest fades.
// Shown while a box is hovered or focused, else for the selected scenario (the open modal); n null clears it.
function flowHighlight(n) {
  const svg = main.querySelector('.flowsvg');
  if (!svg) return;
  svg.querySelectorAll('.fnode.pth, .fedge.pth').forEach(el => el.classList.remove('pth'));
  svg.classList.toggle('hl', n != null);
  if (n == null) return;
  const k = String(n), edges = [...svg.querySelectorAll('.fedge')], on = new Set([k]), todo = [k];
  while (todo.length) { const t = todo.pop(); for (const e of edges) if (e.dataset.to === t && !on.has(e.dataset.from)) { on.add(e.dataset.from); todo.push(e.dataset.from); } }
  const back = new Set(on);
  for (const e of edges) {
    if (back.has(e.dataset.to) && back.has(e.dataset.from)) e.classList.add('pth');
    else if (e.dataset.from === k) { e.classList.add('pth'); on.add(e.dataset.to); }
  }
  svg.querySelectorAll('.fnode').forEach(g => g.classList.toggle('pth', on.has(g.dataset.flow)));
}
let flowFindQ = '', flowFound = null;                                  // the scenario last found with the search field: marked and highlighted until the next search
const flowRest = () => flowHighlight(view.scnSel ?? flowFound);
// The search field: a number or a name (part of it) that matches one drawn scenario centers the chart on it; Enter takes the first match.
function flowMatches(q) {
  const opts = [...(document.getElementById('flowFindList')?.options || [])].map(o => o.value);
  q = q.trim().toLowerCase();
  if (!q) return [];
  const num = o => o.split(' ')[0];
  if (/^\d+$/.test(q)) return opts.filter(o => num(o) === q);
  const exact = opts.filter(o => o.toLowerCase() === q);
  return exact.length ? exact : opts.filter(o => o.toLowerCase().slice(num(o).length + 1).includes(q));
}
function flowFocus(n) {
  const fw = flowBox(), g = fw?.querySelector(`.fnode[data-flow="${n}"]`);
  if (!g) return;
  flowFound = Number(n);
  fw.querySelectorAll('.fnode.found').forEach(el => el.classList.remove('found'));
  g.classList.add('found');
  const b = fw.getBoundingClientRect(), r = g.getBoundingClientRect();
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches && !pmset.reduce;
  fw.scrollTo({ left: fw.scrollLeft + r.left - b.left + r.width / 2 - fw.clientWidth / 2, top: fw.scrollTop + r.top - b.top + r.height / 2 - fw.clientHeight / 2, behavior: smooth ? 'smooth' : 'auto' });
  if (view.scnSel == null) flowHighlight(n);
}
main.addEventListener('input', e => {
  if (!e.target.matches?.('[data-flowfind]')) return;
  flowFindQ = e.target.value;
  if (!flowFindQ.trim()) { flowClearFound(); return; }   // emptied (also the field's clear button)
  const m = flowMatches(flowFindQ);
  if (m.length === 1) flowFocus(m[0].split(' ')[0]);
});
function flowClearFound() {
  flowFound = null;
  flowBox()?.querySelectorAll('.fnode.found').forEach(el => el.classList.remove('found'));
  flowRest();
}
main.addEventListener('keydown', e => {
  if (!e.target.matches?.('[data-flowfind]')) return;
  if (e.key === 'Enter') { const m = flowMatches(e.target.value); if (m.length) flowFocus(m[0].split(' ')[0]); e.preventDefault(); }
  else if (e.key === 'Escape' && e.target.value) { e.target.value = ''; flowFindQ = ''; flowClearFound(); e.preventDefault(); e.stopPropagation(); }
});
// Panning and zoom of the chart. The chart box (.flowwrap) scrolls, so panning sets its scroll position: right button held,
// left button on the background (not on a box), or Space held with the left button anywhere on the chart. Ctrl+wheel steps
// through the sizes S to XXL around the pointer; the size buttons keep the middle of the box. A render keeps the scroll position.
const FLOW_STEPS = ['s', 'm', 'l', 'xl', 'xxl'];
let flowPan = null, flowSpace = false, flowOver = false, flowAnchor = null, flowWheelT = 0, flowSwallow = false;
const flowBox = () => main.querySelector('.flowwrap');
// Remember which chart point lies at (cx, cy) on the screen, then render at the new size with that point at the same place.
function flowZoomTo(key, cx, cy) {
  const fw = flowBox(), svg = fw?.querySelector('.flowsvg');
  if (svg) {
    const b = fw.getBoundingClientRect(), s = svg.getBoundingClientRect();
    if (cx == null) { cx = b.left + fw.clientWidth / 2; cy = b.top + fw.clientHeight / 2; }
    flowAnchor = { px: (cx - s.left) / s.width, py: (cy - s.top) / s.height, ox: cx - b.left, oy: cy - b.top };
  }
  view.flowZoom = key;
  render();
}
// The chart point (fractions of its width and height) at the middle of the box, and the reverse: scroll so a point is in the middle.
function flowCenterFrac() {
  const fw = flowBox(), svg = fw?.querySelector('.flowsvg');
  if (!svg) return null;
  const b = fw.getBoundingClientRect(), s = svg.getBoundingClientRect();
  return { px: (b.left + fw.clientWidth / 2 - s.left) / s.width, py: (b.top + fw.clientHeight / 2 - s.top) / s.height };
}
function flowCenterAt(px, py, ox, oy) {                // ox, oy: where in the box the point goes (default the middle)
  const fw = flowBox(), svg = fw?.querySelector('.flowsvg');
  if (!svg) return;
  const b = fw.getBoundingClientRect(), s = svg.getBoundingClientRect();
  const sx = s.left - b.left + fw.scrollLeft, sy = s.top - b.top + fw.scrollTop;   // where the chart starts in the scrolled content
  fw.scrollLeft = sx + px * s.width - (ox ?? fw.clientWidth / 2);
  fw.scrollTop = sy + py * s.height - (oy ?? fw.clientHeight / 2);
}
// After a render: the zoom anchor, else the view kept from the chart before, else the remembered position (tab switch, reload),
// else the newest available scenario (flowHome). A filter change starts again from flowHome.
let flowHome = null, flowRecenter = false;
function flowRestoreScroll(keep) {
  const fw = flowBox(), svg = fw?.querySelector('.flowsvg');
  if (!fw || !svg) { flowAnchor = null; return; }
  const pos = flowRecenter ? null : keep || view.flowPos;
  if (flowAnchor) flowCenterAt(flowAnchor.px, flowAnchor.py, flowAnchor.ox, flowAnchor.oy);
  else if (pos) flowCenterAt(pos.px, pos.py);
  else if (flowHome != null) {
    const g = svg.querySelector(`.fnode[data-flow="${flowHome}"]`), s = svg.getBoundingClientRect(), r = g?.getBoundingClientRect();
    if (r) flowCenterAt((r.left + r.width / 2 - s.left) / s.width, (r.top + r.height / 2 - s.top) / s.height);
  }
  flowAnchor = null; flowRecenter = false;
  flowSync(true);
}
// Lane names at the left edge and inside their lane, the overview frame, and (save) the remembered position.
let flowSaveT = 0;
function flowSync(save) {
  const fw = flowBox(), svg = fw?.querySelector('.flowsvg');
  if (!svg) return;
  const z = svg.width.baseVal.value / svg.viewBox.baseVal.width, b = fw.getBoundingClientRect(), s = svg.getBoundingClientRect();
  const bar = fw.querySelector('.flowfsbar')?.offsetHeight || 0;                       // fullscreen: the sticky bar covers the top
  const left = (b.left - s.left) / z, top = (b.top + bar - s.top) / z, w = fw.clientWidth / z, h = (fw.clientHeight - bar) / z;
  svg.querySelectorAll('.flabelg').forEach(g => {
    const bg = g.querySelector('.flabbg');
    if (!bg.dataset.w) { bg.dataset.w = 1; bg.setAttribute('width', Math.ceil(g.querySelector('.flabel').getComputedTextLength() + 16)); }
    const y0 = Number(g.dataset.y), lh = Number(g.dataset.h), k = Math.min(1 / z, (lh - 4) / 26), y1 = y0 + lh - 26 * k;   // the same size on screen, but never taller than the lane
    g.setAttribute('transform', `translate(${Math.max(2, left + 4 * k)},${Math.max(y0 + 2, Math.min(y1, top + 4 * k))}) scale(${k})`);
  });
  const mini = fw.parentElement.querySelector('.flowmini');
  if (mini) {
    mini.toggleAttribute('hidden', fw.scrollWidth <= fw.clientWidth + 2 && fw.scrollHeight <= fw.clientHeight + 2);   // the whole chart is in view
    const v = mini.querySelector('.fmview');
    v.setAttribute('x', Math.max(0, left)); v.setAttribute('y', Math.max(0, top)); v.setAttribute('width', w); v.setAttribute('height', h);
  }
  if (save) { clearTimeout(flowSaveT); flowSaveT = setTimeout(() => { const p = flowCenterFrac(); if (p) { view.flowPos = p; saveView(); } }, 250); }
}
main.addEventListener('scroll', e => { if (e.target.classList?.contains('flowwrap')) flowSync(true); }, true);
window.addEventListener('resize', () => flowSync(false));
// The overview map: press or drag moves the view there (pointer events, so touch works too).
let flowMiniDrag = false;
const flowMiniGo = (e, mini) => { const m = mini.getBoundingClientRect(); flowCenterAt(Math.max(0, Math.min(1, (e.clientX - m.left) / m.width)), Math.max(0, Math.min(1, (e.clientY - m.top) / m.height))); };
main.addEventListener('pointerdown', e => {
  const mini = e.target.closest?.('.flowmini');
  if (!mini || e.button !== 0) return;
  flowMiniDrag = true; mini.setPointerCapture(e.pointerId); flowMiniGo(e, mini); e.preventDefault();
});
main.addEventListener('pointermove', e => { if (flowMiniDrag) { const mini = e.target.closest?.('.flowmini') || main.querySelector('.flowmini'); if (mini) flowMiniGo(e, mini); } });
main.addEventListener('pointerup', () => { flowMiniDrag = false; });
main.addEventListener('pointercancel', () => { flowMiniDrag = false; });
const flowCursor = () => { const fw = flowBox(); fw?.classList.toggle('panready', flowSpace && flowOver); document.body.classList.toggle('flowpanning', !!flowPan); };
main.addEventListener('mouseover', e => { const o = !!e.target.closest?.('.flowsvg'); if (o !== flowOver) { flowOver = o; flowCursor(); } });
main.addEventListener('mouseleave', () => { flowOver = false; flowCursor(); });
main.addEventListener('mousedown', e => {
  flowSwallow = false;                                 // a new press: the click after it is a click, unless it pans
  const fw = e.target.closest?.('.flowwrap');
  if (!fw || !e.target.closest('.flowsvg')) return;
  const right = e.button === 2, left = e.button === 0 && (flowSpace || !e.target.closest('.fnode'));
  if (!right && !left) return;
  flowPan = { fw, x: e.clientX, y: e.clientY, l: fw.scrollLeft, t: fw.scrollTop, moved: false };
  flowCursor();
  e.preventDefault();
});
window.addEventListener('mousemove', e => {
  if (!flowPan) return;
  const dx = e.clientX - flowPan.x, dy = e.clientY - flowPan.y;
  if (!flowPan.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
  flowPan.moved = true;
  flowPan.fw.scrollLeft = flowPan.l - dx;
  flowPan.fw.scrollTop = flowPan.t - dy;
});
window.addEventListener('mouseup', () => { if (!flowPan) return; flowSwallow = flowPan.moved; flowPan = null; flowCursor(); });
// a drag that ends on a box does not open it; the right button pans, so the chart has no browser menu (as on the map)
main.addEventListener('click', e => { if (flowSwallow && e.target.closest?.('.flowsvg')) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
main.addEventListener('contextmenu', e => { if (e.target.closest?.('.flowsvg')) e.preventDefault(); });
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || !flowOver || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  e.preventDefault(); e.stopImmediatePropagation();   // over the chart, Space pans (it does not open the focused box or scroll the page)
  if (!flowSpace) { flowSpace = true; flowCursor(); }
}, true);
document.addEventListener('keyup', e => { if (e.code === 'Space' && flowSpace) { flowSpace = false; flowCursor(); } });
window.addEventListener('blur', () => { flowSpace = false; flowPan = null; flowCursor(); });
main.addEventListener('wheel', e => {
  if (!(e.ctrlKey || e.metaKey) || !e.target.closest?.('.flowsvg')) return;
  e.preventDefault();                                 // Ctrl+wheel over the chart zooms the chart, not the page
  const now = performance.now();
  if (now - flowWheelT < 120 || !e.deltaY) return;     // one step per notch; trackpads send many small events
  flowWheelT = now;
  const svg = e.target.closest('.flowsvg'), z = svg.width.baseVal.value / svg.viewBox.baseVal.width;
  const up = e.deltaY < 0, i = FLOW_STEPS.indexOf(view.flowZoom);
  const next = i >= 0 ? FLOW_STEPS[i + (up ? 1 : -1)]
    : up ? FLOW_STEPS.find(k => FLOW_ZOOM[k] > z + 0.01) : [...FLOW_STEPS].reverse().find(k => FLOW_ZOOM[k] < z - 0.01);   // from Fit: the next size bigger or smaller
  if (next) flowZoomTo(next, e.clientX, e.clientY);
}, { passive: false });
main.addEventListener('mouseover', e => { const g = e.target.closest?.('.flowsvg .fnode'); if (g) flowHighlight(g.dataset.flow); });
main.addEventListener('mouseout', e => { if (e.target.closest?.('.flowsvg .fnode') && !e.relatedTarget?.closest?.('.flowsvg .fnode')) flowRest(); });
main.addEventListener('focusin', e => { const g = e.target.closest?.('.flowsvg .fnode'); if (g) flowHighlight(g.dataset.flow); });
main.addEventListener('focusout', e => { if (e.target.closest?.('.flowsvg .fnode')) flowRest(); });

// Details of the selected scenario, shown in a modal (scnModalRoot below) so it's reachable regardless of scroll
// position or chart height.
function flowDetail(r) {
  const n = view.scnSel, s = SCENARIOS.find(x => x.n === n);
  if (!s) return '';
  const x = r.scn[String(n)] || { s: 0 };
  if (x.s === 0) {   // locked: no name for players; in edit mode the number and the state, so it can be unlocked by hand
    return editing
      ? `<div class="scnlocked"><h3 id="scnModalTitle">Locked scenario ${esc(s.n)}</h3>${kv('State', `<select data-act="scnState" data-id="${esc(s.n)}">${SCN_STATE_NAME.map((name, i) => `<option value="${i}" ${i === 0 ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>`)}</div>`
      : '<div class="scnlocked"><h3 id="scnModalTitle">Locked scenario</h3></div>';
  }
  // linked scenarios as sticker chips; a known one opens its own page, a locked one is a "?"
  const link = k => {
    const v = r.scn[String(k)]?.s ?? 0, t = SCENARIOS.find(y => y.n === k);
    if (!v || !t) return `<span class="schip lock"><span class="schq">?</span><span><b>?</b><small>${SCN_STATE_NAME[0]}</small></span></span>`;
    const src = scnImg(t);
    return `<button type="button" class="schip" data-scn-go="${k}" style="--lc:${laneColor(laneOf(t))}">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : '<span class="schq"></span>'}<span><b>${esc(`${k} ${t.name}`)}</b><small>${esc(SCN_STATE_NAME[v])}</small></span></button>`;
  };
  const links = list => (list.length ? `<div class="schips">${list.map(link).join('')}</div>` : '');
  const stateRow = editing
    ? kv('State', `<select data-act="scnState" data-id="${esc(s.n)}">${SCN_STATE_NAME.map((name, i) => `<option value="${i}" ${x.s === i ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>`)
    : '';
  const resultRows = x.s !== 2 ? '' : editing
    ? kv('Level', num('scnRes', 'l', x.l, { min: -2, max: 3, id: s.n, width: 56 }))
      + kv('# Mercenaries', num('scnRes', 'p', x.p, { min: 1, max: 4, id: s.n, width: 56 }))
      + kv('Chests', `<input type="text" class="txt" style="width:120px" data-act="scnRes" data-key="ch" data-id="${esc(s.n)}" value="${esc((x.ch || []).join(', '))}">`)
      + kv('Date (completed)', `<input type="date" class="txt" data-act="scnRes" data-key="d" data-id="${esc(s.n)}" value="${esc(x.d ?? '')}">`)
    : kv('Level', esc(signed(x.l) ?? '?')) + kv('# Mercenaries', esc(x.p ?? '?')) + kv('Date (completed)', esc(x.d ?? ''));
  // the treasure tiles of the scenario (gh2_scenarios.js tre, plus any chest number entered with the result): taken or still there;
  // a click marks a treasure as collected or not (play, not setup: no Edit needed)
  const treNums = [...new Set([...(s.tre || []), ...(x.ch || [])])].sort((a, b) => a - b);
  const treRow = !treNums.length ? '' : kv('Treasure', `<span class="trechips">${treNums.map(tn => { const got = r.decks.tre.includes(tn);
    return `<button type="button" class="trechip${got ? ' got' : ''}" data-scntre="${tn}" aria-pressed="${got}" title="Treasure ${tn}: ${got ? 'taken. Click to mark it as not taken' : 'still in the scenario. Click when collected'}">${got ? TRE_TAKEN : TRE_CHEST}<b>${tn}</b><small>${got ? 'Taken' : 'Available'}</small></button>`; }).join('')}</span>`);
  const lane = laneOf(s), src = scnImg(s);
  const facts = stateRow + resultRows + treRow;
  return `<div class="scnhero" style="--lc:${laneColor(lane)}">${src ? `<div class="scnblur" style="background-image:url('${esc(src)}')"></div><img class="scnart" src="${esc(src)}" alt="">` : ''}
      <div class="scntt"><div class="scnno">${esc(s.n)}</div><h3 id="scnModalTitle">${esc(s.name)}</h3>
      <div class="scntags">${lanesOf(s).map(l => `<span class="ltag" style="--lc:${laneColor(l)}">${esc(l)}</span>`).join('')}${s.boss ? `<span class="ltag bosstag">${skullIcon()}Boss</span>` : ''}<span class="spill s${x.s}">${esc(SCN_STATE_NAME[x.s])}</span></div></div></div>
    <div class="scnbody">${facts ? `<div class="scnfacts">${facts}</div>` : ''}<div class="scnlinks">
      <h4>Unlocks</h4>${links(s.unl || []) || '<span class="hint">no scenario</span>'}
      <h4>Unlocked by</h4>${links(unlockedBy(s.n)) || '<span class="hint">no scenario (event, reputation or quest)</span>'}</div></div>`;
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
    ch: s => { const t = scnTreasures(r, s); return t.length ? 100 + t.filter(n => !r.decks.tre.includes(n)).length : 0; },   // treasures left first
    d: s => r.scn[String(s.n)]?.d || '',
  };
  const cmp = (a, b) => (typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
  const { col, dir } = view.scnSort;
  if (SORT[col]) rows = [...rows].sort((x, y) => dir * cmp(SORT[col](x), SORT[col](y)) || SORT.n(x) - SORT.n(y));
  const sortTh = (k, l) => `<button type="button" class="sortbtn" data-scnsort="${k}" title="Sort by ${esc(l.toLowerCase())}">${esc(l)}${col === k ? (dir > 0 ? ' &#9650;' : ' &#9660;') : ''}</button>`;
  const head = [sortTh('n', '#'), sortTh('name', 'Name'), sortTh('area', 'Scenario chain'), sortTh('state', 'State'), sortTh('l', 'Lv'),
    sortTh('p', '# Mercenaries'), sortTh('ch', 'Treasures'), sortTh('d', 'Date (completed)'), 'Unlocks', 'Unlocked by'];
  const filters = `<div class="filters">
    <select id="scnStatus"><option value="">All states</option>${SCN_STATE_NAME.map((n, i) => `<option value="${i}" ${view.scnStatus === String(i) ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <input id="scnSearch" type="search" placeholder="Search number, name, scenario chain" value="${esc(view.scnSearch)}">
    <span class="tbend">${scenarioRollerBtn(r)}</span></div>`;
  if (isPhone()) return filters + scnViewToggle(rows.length) + (rows.length ? `<div class="mlist">${rows.map(s => {
    // phone row: sticker thumbnail (a "?" while locked), number and name, storyline in its colour and the date, state
    const x = r.scn[String(s.n)] || { s: 0 }, lane = laneOf(s), src = x.s ? scnImg(s) : '';
    const sub = `${lanesOf(s).map(l => `<span class="mlane" style="--lc:${laneColor(l)}">${esc(l)}</span>`).join(' ')}${x.d ? ` &middot; ${esc(x.d)}` : ''}`;
    return `<button type="button" class="mrow scnmrow s${x.s}" data-flow="${s.n}" style="--lc:${laneColor(lane)}">${src ? `<img class="mstk" src="${esc(src)}" alt="" loading="lazy">` : '<span class="mstk schq">?</span>'}<span class="mmain"><b><span class="mnum2">${esc(s.n)}</span> ${esc(s.name)}</b><small>${sub}</small></span><span class="spill s${x.s}">${SCN_STATE_NAME[x.s]}</span></button>`;
  }).join('')}</div>` : none);
  return filters + scnViewToggle(rows.length) + dataTable('scntable', head, rows.map(s => {
    const x = r.scn[String(s.n)] || { s: 0 };
    return `<tr class="rowlink" data-flow="${s.n}" tabindex="0"><td>${esc(s.n)}</td><td>${esc(s.name)}${s.boss ? ` ${skullIcon('skull tskull')}` : ''}</td><td>${esc(s.area ?? '')}</td><td><span class="spill s${x.s}">${SCN_STATE_NAME[x.s]}</span></td>
      <td>${esc(signed(x.l) ?? '')}</td>
      <td>${esc(x.p ?? '')}</td>
      <td>${scnTreasures(r, s).map(n => `<span class="trtag${r.decks.tre.includes(n) ? ' got' : ''}" title="Treasure ${n}: ${r.decks.tre.includes(n) ? 'taken' : 'still in the scenario'}">${n}</span>`).join('')}</td>
      <td>${esc(x.d ?? '')}</td>
      <td>${(s.unl || []).map(n => chip(n, stateClass(n))).join('')}</td><td>${unlockedBy(s.n).map(n => chip(n, stateClass(n))).join('')}</td></tr>`;
  }));
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
// Enhancement stickers on a card (key 'c:<id>' or 'i:<id>') from every character's markers, drawn over the card when the Cards tab shows them.
function stkMarks(key) {
  if (!view.cardStk) return '';
  return markersHtml(record.chars.flatMap(c => (c.mk?.[key] || []).filter(m => m.s)));
}
function stkToggle() {
  return `<label class="ctoggle"><input type="checkbox" id="cardStk" ${view.cardStk ? 'checked' : ''}><span class="ctbox" aria-hidden="true">${ICON_CHECK}</span><span>Stickers</span></label>`;
}

// Traits the class brings that are not on the sheet's list yet, the species (Vermling, Quatryl, ...) among them. Events check
// them like traits.
function classTraits(c) {
  const own = new Set((c.traits || []).map(t => String(t).toLowerCase()));
  const special = new Set((c.special || []).map(t => String(t).toLowerCase()));
  return [...characterTraits(c)].filter(t => !own.has(t) && !special.has(t)).map(pretty);
}

// The Mercenaries tab: a sub-tab bar (one per character and '+') above the selected character or the add form.
function mercenaries(r) {
  const cur = currentSub();
  const bar = `<nav class="subtabs" role="tablist">${subTabList().map(t =>
    `<button type="button" role="tab" aria-selected="${t.id === cur}" data-sub="${esc(t.id)}"${t.title ? ` title="${esc(t.title)}"` : ''}>${esc(t.label)}</button>`).join('')}</nav>`;
  if (cur !== 'add') return characterTab(r, cur);                                  // the character is switched from the name in the top bar (playmat and phone)
  return `<div class="subbar">${bar}</div>` + (cur === 'add' ? addTab(r) : characterTab(r, cur));
}

// Portrait: the character mat cropped to the focus region saved with campaign/mockups/portrait-tool.html (fractions of the mat width).
const PORTRAIT_FOCUS = {};
fetch('../scripts/games/portrait-focus.json').then(r => (r.ok ? r.json() : {})).then(j => { Object.assign(PORTRAIT_FOCUS, j); if (record && tab === 'Mercenaries') render(); }).catch(() => {});
function portraitStyle(c, size) {
  const url = matImageUrl(c.cls, 'front');
  const f = PORTRAIT_FOCUS[matSlugOf(c.cls)];
  if (!f) return `background-image:url(${url});background-size:cover;background-position:center`;
  const bw = size / f.w;
  return `background-image:url(${url});background-size:${bw}px auto;background-position:${-f.u * bw}px ${-f.t * bw}px`;
}
// What the playmat remembers while the page is open: the open modal, the mat side, the history filter. Saved BGG codes of the user are kept
// in this browser (not in the campaign record).
const pm = { modal: null, matSide: 'front', histKind: 'all', jtab: 'goal', bgv: null, pqv: null, notesPreview: false, amZoom: null, dtab: 'hand', hsel: {}, hsArmed: false, itemId: null, isel: {}, ptab: 'cards', sheet: null, mkKey: null, mkSel: null, pileZ: null, cf: null, mkIdx: -1, chMenu: false, hview: 'hand', amEdit: false };
const CODES_KEY = 'havenmap.campaign.codes';
// Display settings of the playmat (gear in the top bar), kept in this browser.
// Phones (700 px wide or less, or 500 px high or less: a phone held sideways) get the touch layout: the phone view of the Mercenaries
// tab (campaign/phone.js) instead of the playmat, the page menu in the header, modals as bottom sheets (campaign/touch.css, html.phone).
const phoneMQ = window.matchMedia('(max-width: 700px), (max-height: 500px)');
const isPhone = () => phoneMQ.matches;
const markPhone = () => document.documentElement.classList.toggle('phone', isPhone());
markPhone();
phoneMQ.addEventListener?.('change', () => { markPhone(); pageSheet = false; pm.sheet = null; if (record) render(); });
const SET_KEY = 'havenmap.campaign.pmset';
let pmset = (() => { try { return cleanSettings(JSON.parse(localStorage.getItem(SET_KEY) || 'null')); } catch { return cleanSettings(null); } })();
const saveSet = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(pmset)); } catch { /* ignore */ } };
const loadCodes = () => { try { const a = JSON.parse(localStorage.getItem(CODES_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
const saveCodes = a => { try { localStorage.setItem(CODES_KEY, JSON.stringify(a)); } catch { /* ignore */ } };
const matSlug = c => matSlugOf(c.cls);   // the class slug, as the portrait focus table and the banner files name it
const pmState = c => ({
  modal: pm.modal, matSide: pm.matSide, histKind: pm.histKind, jtab: pm.jtab, bgv: pm.bgv, pqv: pm.pqv, notesPreview: pm.notesPreview,
  bgs: record.bgs, pq: record.pq,
  itemId: pm.itemId, mkKey: pm.mkKey, mkIdx: pm.mkIdx, chars: subTabList(), chMenu: pm.chMenu, pileZ: pm.pileZ, cf: pm.cf, players: record.players, classChips: classTraits({ ...c, cls: pm.cf?.cls || c.cls }).map(t => chip(t)).join(''), classOpts: pm.modal === 'char' ? charClassOptions(c) : [], mkSel: mkSelOf(c), set: pmset, ptab: pm.ptab, sheet: pm.sheet,
  items: pm.modal === 'items' ? { pool: ITEMS.filter(i => record.items.unl.includes(i.id) && ownsItem(c, i.id)), isel: c.items.map(it => String(it.id)), sell: !!pm.sellMode } : null,
  deck: pm.modal === 'deck' ? { cards: CARDS.filter(k => k.cls === classByName(c.cls)?.i).sort((a, b) => cardLevel(a.id) - cardLevel(b.id) || (a.ini ?? 1e9) - (b.ini ?? 1e9)), hsel: pm.hsel[c.id] || [], armed: pm.hsArmed } : null,
  amd: pm.modal === 'amd' || pm.modal === 'amdpile' ? drawState(c, c.amd) : null, hview: pm.hview, amEdit: pm.amEdit, amv: pm.hview === 'amd' || pm.ptab === 'amd' ? drawState(c, c.amd) : null, amZoom: pm.modal === 'amd' ? pm.amZoom : null,
  customCodes: pm.modal === 'codes' ? loadCodes() : [],
  enh: pm.modal === 'enh' ? record.enh.map((e, i) => ({ e, i })).filter(x => x.e.cls === c.cls) : [],
  enhCards: pm.modal === 'enh' ? CARDS.filter(k => k.cls === classByName(c.cls)?.i).map(k => pretty(k.slug)) : [],
  log: pm.modal === 'history' ? [...(record.log || [])].reverse().filter(e => String(e.d).startsWith(`${c.name}:`)) : [],
});
const playmatCtx = {
  matUrl: (cls, side) => matImageUrl(cls, side),
  pqImg: slug => pqImageUrl({ slug }) ?? '',
  bgImg: battleGoalImageUrl,
  esc, pretty, cardById, itemById, cardImageUrl, itemImageUrl, itemBackUrl, cardBackUrl, portraitStyle,
  playerName: c => (record.players.find(p => p.seat === c.seat)?.name ?? ''),
  traitChips: c => `${(c.traits || []).map(t => chip(t)).join('')}${classTraits(c).map(t => chip(t)).join('')}${(c.special || []).map(t => chip(specialName(t), 'info')).join('')}`,
};

// The character tab: the playmat (or the phone view).
function characterTab(r, cid) {
  const c = r.chars.find(x => x.id === cid);
  if (!c) return '<div class="empty">Character not found.</div>';
  if (isPhone()) return phoneHtml(c, playmatCtx, pmState(c));
  return playmatHtml(c, playmatCtx, pmState(c));
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

// A flip item: the preview shows its back beside the front (data-imgb, read by the card preview below).
const backAttr = i => { const b = itemBackUrl(i); return b ? ` data-imgb="${esc(b)}"` : ''; };
// Item search: comma separated terms, each a number (3), a range (10-20) or part of a name. An item matches when any term does.
function itemQueryMatch(i, q) {
  if (!q) return true;
  const name = pretty(i.slug).toLowerCase(), id = String(i.id).toLowerCase();
  return q.split(',').map(t => t.trim()).filter(Boolean).some(t => {
    const m = /^(\d+)\s*[-–]\s*(\d+)$/.exec(t);
    if (m) return typeof i.id === 'number' && i.id >= Math.min(+m[1], +m[2]) && i.id <= Math.max(+m[1], +m[2]);
    return name.includes(t) || id === t;
  });
}
function items(r) {
  const gold = view.itemGold.trim() === '' || !Number.isFinite(Number(view.itemGold)) ? null : Number(view.itemGold);
  const slots = [...new Set(ITEMS.map(i => i.slot).filter(Boolean))].sort();
  const rows = ITEMS.filter(i => {
    if (view.itemSlot && i.slot !== view.itemSlot) return false;
    if (view.itemShow === 'unlocked' && !r.items.unl.includes(i.id)) return false;
    if (view.itemShow === 'shop' && shopCopies(r, i) === 0) return false;
    // Affordable: only items with a known price at or below the gold entered. Locked items are not filtered by price, so the filter cannot reveal them.
    if (gold != null && (!r.items.unl.includes(i.id) || !(ITEM_COSTS[i.id] <= gold))) return false;
    // Search the item name. Locked items are never matched by name, so a search cannot reveal them.
    const q = view.itemSearch.trim().toLowerCase();
    if (q && !(r.items.unl.includes(i.id) && pretty(i.slug).toLowerCase().includes(q) || String(i.id).toLowerCase() === q)) return false;
    return true;
  });
  const viewToggle = `<div class="imgmode viewmode" role="group" aria-label="Items view">${
    [['list', isPhone() ? 'List' : 'Table'], ['grid', 'Cards']].map(([m, l]) => `<button type="button" data-itemview="${m}" aria-pressed="${view.itemView === m}">${l}</button>`).join('')}${view.itemView === 'grid' ? `<span class="sizesel">${[['s', 'S'], ['m', 'M'], ['l', 'L']].map(([k, l]) => `<button type="button" data-itemsize="${k}" aria-pressed="${view.itemSize === k}" title="Tile size ${l}">${l}</button>`).join('')}</span>` : ''}<span class="ctrlhint">${rows.length} items</span></div>`;
  const filters = `<div class="filters"><select id="itemSlot"><option value="">All slots</option>${slots.map(s => `<option ${view.itemSlot === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
    <select id="itemShow">${[['all', 'All items'], ['unlocked', 'Unlocked'], ['shop', 'In the shop']].map(([v, l]) => `<option value="${v}" ${view.itemShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <input id="itemSearch" type="search" placeholder="Search item name" value="${esc(view.itemSearch)}">
    <input id="itemGold" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Gold" aria-label="Gold: show only items this affordable" title="Show only items that cost this much or less" value="${esc(view.itemGold)}" style="width:5.5em">
    <span class="tbend">${itemRollerBtn(r)}
    <button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing items' : 'Edit items'}" title="${editing ? 'Stop editing items' : 'Edit items'}">${PENCIL}</button></span></div>`;
  const holders = id => r.chars.filter(c => ownsItem(c, id)).map(c => c.name).join(', ');
  // who owns an item (a chip per owner; x takes the copy back to the shop) and the menu that gives a copy to a character
  const ownerChips = i => r.chars.filter(c => ownsItem(c, i.id)).map(c => `<span class="chip">${esc(c.name)}<button type="button" class="chx" data-returnitem="${esc(c.id)}|${esc(i.id)}" aria-label="Take ${esc(pretty(i.slug))} back from ${esc(c.name)}" title="Back to the shop">&times;</button></span>`).join('');
  const giveMenu = i => (r.items.unl.includes(i.id) && shopCopies(r, i) > 0 && r.chars.some(c => !ownsItem(c, i.id))
    ? (cost => `<select class="givesel" data-giveitem="${esc(i.id)}" aria-label="${cost === null ? 'Give' : 'Buy'} ${esc(pretty(i.slug))} ${cost === null ? 'to' : 'for'} a character"><option value="">${cost === null ? 'Give to...' : 'Buy for...'}</option>${r.chars.filter(c => !ownsItem(c, i.id)).map(c => `<option value="${esc(c.id)}"${cost !== null && (c.gold || 0) < cost ? ' disabled' : ''}>${esc(c.name)}${cost === null ? '' : ` (${c.gold || 0} gold)`}</option>`).join('')}</select>`)(ed.itemCost(i.id)) : '');
  if (view.itemView === 'grid') {
    // Pictures of the filtered items. Locked items have no picture (a placeholder, with the number in edit mode) and are dimmed; the badge shows copies in the shop / total.
    return filters + viewToggle + (rows.length ? `<div class="itemgrid itemcards" style="--tile-min:${ITEM_SIZES[view.itemSize]}px">${rows.map(i => {
      const unl = r.items.unl.includes(i.id);
      const secret = !unl && !editing;              // players must not see locked items: no picture, no name
      const name = unl ? pretty(i.slug) : 'Locked item', url = unl ? itemImageUrl(i) : null;   // no picture and no name for a locked item, in edit mode too
      const pic = url ? `<img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg secretpic">${unl ? esc(name) : editing ? `#${esc(i.id)}` : '?'}</div>`;
      const w = holders(i.id);
      const tog = editing ? `<button type="button" class="chip" data-act="itemToggle" data-id="${esc(i.id)}" title="${unl ? 'Lock this item' : 'Unlock this item'}">${unl ? 'Lock' : 'Unlock'}</button>` : '';
      return `<figure class="itemtile${unl ? '' : ' locked'}"${url ? ` data-img="${esc(url)}" data-imgw="300"${backAttr(i)}` : ''} title="${unl ? esc(`${i.id} ${name}`) : esc(String(i.id))}">${pic}
        <figcaption><span class="cname">${esc(name)}</span>${tog || `<span class="badge">${unl ? `${esc(shopCopies(r, i))}/${esc(i.n)}` : 'locked'}</span>`}</figcaption>${!secret && unl ? `<div class="itemwith">${ownerChips(i)}${giveMenu(i)}</div>` : ''}</figure>`;
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
    cost: i => (r.items.unl.includes(i.id) ? ITEM_COSTS[i.id] ?? -1 : -1),
    used: i => (r.items.unl.includes(i.id) ? itemsInUse(r, i) : -1),
    shop: i => (r.items.unl.includes(i.id) ? shopCopies(r, i) : -1),
    with: i => holders(i.id).toLowerCase(),
  };
  const cmp = (a, b) => (Array.isArray(a) ? (a[0] - b[0] || (typeof a[1] === 'number' ? a[1] - b[1] : String(a[1]).localeCompare(String(b[1])))) : typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
  const { col, dir } = view.itemSort;
  if (SORT[col]) rows.sort((x, y) => dir * cmp(SORT[col](x), SORT[col](y)) || cmp(SORT.id(x), SORT.id(y)));
  const head = [['id', '#'], ['name', 'Item'], ['slot', 'Slot'], ['kind', 'Type'], ['cost', 'Cost'], ['unl', 'Unlocked'], ['n', 'Copies'], ['used', 'In use'], ['shop', 'In shop'], ['with', 'With']]
    .map(([k, l]) => `<button type="button" class="sortbtn" data-itemsort="${k}" title="Sort by ${esc(l.toLowerCase())}">${l}${col === k ? (dir > 0 ? ' &#9650;' : ' &#9660;') : ''}</button>`);
  if (isPhone()) return filters + viewToggle + itemRows(r, rows) + itemSheet(r, ownerChips);
  return filters + viewToggle + dataTable('itemtable', head, rows.map(i => {
    const unl = r.items.unl.includes(i.id);
    const unlCell = editing ? `<input type="checkbox" data-act="itemUnl" data-id="${esc(i.id)}" ${unl ? 'checked' : ''}>` : unl ? '<span class="tick" aria-label="unlocked">&#10003;</span>' : '<span class="tick no" aria-label="locked">&ndash;</span>';
    const usedCell = unl ? esc(itemsInUse(r, i)) : '';   // calculated from the character tabs, not editable
    const pic = (unl || editing) && itemImageUrl(i);   // locked items stay hidden for players
    return `<tr class="${unl ? '' : 's0'}"${pic ? ` data-img="${esc(pic)}"${backAttr(i)}` : ''}><td>${esc(i.id)}</td><td>${unl ? esc(pretty(i.slug)) : 'Locked item'}</td><td>${esc(i.slot ?? '')}</td><td>${esc(i.kind === 'qm' ? 'QM' : i.cls ? `${i.kind}, ${i.cls}` : i.kind)}</td><td>${unl ? esc(ITEM_COSTS[i.id] ?? '') : ''}</td>
      <td>${unlCell}</td><td>${esc(i.n)}</td><td>${usedCell}</td><td>${unl ? esc(shopCopies(r, i)) : ''}</td><td>${unl ? `<span class="itemwith">${ownerChips(i)}${giveMenu(i)}</span>` : ''}</td></tr>`;
  }));
}

// Phone: the items as rows (number, name, slot and copies in the shop, who has it); a tap opens the item sheet. A locked item has no
// name and opens only in edit mode (to unlock it).
function itemRows(r, rows) {
  if (!rows.length) return none;
  return `<div class="mlist">${rows.map(i => {
    const unl = r.items.unl.includes(i.id), open = unl || editing, who = r.chars.filter(c => ownsItem(c, i.id)).map(c => c.name).join(', ');
    const sub = unl ? `${esc(i.slot ?? '')}${ITEM_COSTS[i.id] != null ? ` &middot; ${esc(ITEM_COSTS[i.id])} gold` : ''} &middot; ${esc(shopCopies(r, i))} of ${esc(i.n)} in the shop` : 'Locked';
    return `<${open ? 'button type="button"' : 'div'} class="mrow${unl ? '' : ' s0'}"${open ? ` data-itemsel="${esc(i.id)}"` : ''}><span class="mnum">${esc(i.id)}</span><span class="mmain"><b>${unl ? esc(pretty(i.slug)) : 'Locked item'}</b><small>${sub}</small></span>${who ? `<span class="mend">${esc(who)}</span>` : ''}</${open ? 'button' : 'div'}>`;
  }).join('')}</div>`;
}
// Phone: the sheet of one item: picture, numbers, owners (x takes a copy back), a button per character to give a copy, Lock or Unlock
// in edit mode.
function itemSheet(r, ownerChips) {
  const i = view.itemSel == null ? null : ITEMS.find(x => String(x.id) === String(view.itemSel));
  if (!i) return '';
  const unl = r.items.unl.includes(i.id);
  if (!unl && !editing) return '';
  const url = itemImageUrl(i), back = itemBackUrl(i), name = unl ? pretty(i.slug) : 'Locked item';
  const takers = unl && shopCopies(r, i) > 0 ? r.chars.filter(c => !ownsItem(c, i.id)) : [];
  return `<div class="modal" id="itemSheet" role="dialog" aria-modal="true" aria-labelledby="itemSheetTitle"><div class="modalbox itemsheet">
    <button type="button" class="modalx" data-itemclose aria-label="Close">&times;</button><h3 id="itemSheetTitle">${esc(name)}</h3>
    <div class="isbody">${url && back ? `<div class="ispair"><img src="${esc(url)}" alt="" draggable="false"><img src="${esc(back)}" alt="" draggable="false"></div>` : url ? `<img src="${esc(url)}" alt="" draggable="false">` : ''}<div class="isfacts">${kv('Number', esc(i.id))}${kv('Slot', esc(i.slot ?? ''))}${kv('Type', esc(i.kind === 'qm' ? 'QM' : i.cls ? `${i.kind}, ${i.cls}` : i.kind ?? ''))}${kv('Copies', esc(i.n))}${unl ? kv('In use', esc(itemsInUse(r, i))) + kv('In the shop', esc(shopCopies(r, i))) : ''}</div></div>
    ${unl ? `<h4>With</h4><div class="itemwith">${ownerChips(i) || '<span class="hint">Nobody</span>'}</div>` : ''}
    ${takers.length ? (cost => `<h4>${cost === null ? 'Give to' : 'Buy for'}</h4><div class="isgive">${takers.map(c => `<button type="button" data-giveto="${esc(c.id)}|${esc(i.id)}"${cost !== null && (c.gold || 0) < cost ? ' disabled' : ''}>${esc(c.name)}${cost === null ? '' : ` (${c.gold || 0} gold)`}</button>`).join('')}</div>`)(ed.itemCost(i.id)) : ''}
    ${editing ? `<div class="isedit"><button type="button" class="btn" data-act="itemToggle" data-id="${esc(i.id)}">${unl ? 'Lock this item' : 'Unlock this item'}</button></div>` : ''}
  </div></div>`;
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
// With "unlocked" the other classes are never listed or matched by a search, so the page cannot reveal them. Filters: class, level, name. Cards get the shared card preview (campaign/preview.js).
function cardsPage(r) {
  const typeSel = `<select id="cardType" aria-label="Card type">${[['abilities', 'Character abilities'], ['am', 'Attack modifiers'], ['goals', 'Battle goals'], ['mats', 'Character mats'], ['events', 'Events'], ['items', 'Items'], ['monsters', 'Monster abilities'], ['stats', 'Monster stat cards'], ['pq', 'Personal quests']].sort((a, b) => a[1].localeCompare(b[1])).map(([v, l]) => `<option value="${v}" ${view.cardType === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const showSel = `<select id="cardShow">${[['unlocked', { items: 'Unlocked items', events: 'Discarded events', am: 'Unlocked classes', mats: 'Unlocked classes' }[view.cardType] || 'Unlocked classes'], ['all', { items: 'All items', events: 'All events' }[view.cardType] || 'All classes']].map(([v, l]) => `<option value="${v}" ${view.cardShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const sizeBar = n => `<div class="imgmode viewmode" role="group" aria-label="Tile size">${[['s', 'S'], ['m', 'M'], ['l', 'L']].map(([k, l]) => `<button type="button" data-cardsize="${k}" aria-pressed="${view.cardSize === k}" title="Tile size ${l}">${l}</button>`).join('')}<span class="ctrlhint">${n} cards</span></div>`;
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
      const url = imageFile(`images/gh2/monsters/stats/${m.title.replace(/ /g, '_').toLowerCase()}_${l}`, '../');
      const name = `${pretty(m.title.replace(/ /g, '-'))} level ${l}`;
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="450" title="${esc(name)}"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span>${m.boss ? '<span class="badge">boss</span>' : ''}</figcaption></figure>`;
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
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="440" title="${esc(name)}"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span></figcaption></figure>`;
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
      const url = imageFile(`images/gh2/monsters/monster-abilities/gh2-ma-${c.deck}-${c.n}`, '../'), name = `${pretty(c.deck)} ${c.n}`;
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="600" title="${esc(name)}"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span><span class="badge" title="Initiative ${c.init}${c.s ? ', shuffle' : ''}">${esc(c.init)}${c.s ? ' &#8635;' : ''}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  if (view.cardType === 'mats') {
    // Character mats of the campaign's classes, front or back (the back shows the hit points and the like).
    const mine = new Set(r.cls.map(n => n.toLowerCase()));
    const classes = ABILITY_CLASSES.filter(c => view.cardShow === 'all' || mine.has(c.name.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
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
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="600" title="${esc(c.name)}"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><img class="cardpic" src="${esc(url)}" alt="${esc(c.name)}" loading="lazy" draggable="false"></a><figcaption><span class="cname">${esc(c.name)}</span></figcaption></figure>`;
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
      tiles.push(`<figure class="itemtile amtile" data-amzoom="${amSlots.length - 1}" title="${esc(`${sub}: ${label}`)}"><div data-am="${amSlots.length - 1}"></div><figcaption><span class="cname">${esc(label)}</span><span class="badge">${esc(sub)}</span></figcaption></figure>`);
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
    // Battle goal pictures from worldhaven (Frosthaven set, used for every edition).
    const q = view.cardSearch.trim().toLowerCase();
    const rows = BATTLE_GOALS.filter(g => (!view.cardChk || String(g.chk) === view.cardChk)
      && (!q || pretty(g.slug).toLowerCase().includes(q) || String(g.t || '').toLowerCase().includes(q)));
    const filters = `<div class="filters">${typeSel}<select id="cardChk"><option value="">Any checkmarks</option>${[1, 2].map(n => `<option value="${n}" ${view.cardChk === String(n) ? 'selected' : ''}>${n} checkmark${n > 1 ? 's' : ''}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Goal name or text" value="${esc(view.cardSearch)}"></div>`;
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize]}px">${rows.map(g => {
      const url = battleGoalImageUrl(g.slug), name = pretty(g.slug);
      return `<figure class="itemtile" data-img="${esc(url)}" data-imgw="450" title="${esc(name)}"><img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false"><figcaption><span class="cname">${esc(name)}</span><span class="badge" title="Checkmarks">${'&#10003;'.repeat(g.chk)}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  if (view.cardType === 'items') {
    const slots = [...new Set(ITEMS.map(i => i.slot).filter(Boolean))].sort();
    const q = view.cardSearch.trim().toLowerCase();
    const rows = ITEMS.filter(i => (view.cardShow === 'all' || r.items.unl.includes(i.id))
      && (!view.cardSlot || i.slot === view.cardSlot)
      && itemQueryMatch(i, q));
    const filters = `<div class="filters">${typeSel}${showSel}<select id="cardSlot"><option value="">All slots</option>${slots.map(sl => `<option ${view.cardSlot === sl ? 'selected' : ''}>${esc(sl)}</option>`).join('')}</select>
      <input id="cardSearch" type="search" placeholder="Item name, number or range (10-20)" value="${esc(view.cardSearch)}">${stkToggle()}</div>`;
    return filters + sizeBar(rows.length) + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize]}px">${rows.map(i => {
      const url = itemImageUrl(i), name = pretty(i.slug);
      const pic = url ? `<img class="cardpic" src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`;
      return `<figure class="itemtile"${url ? ` data-img="${esc(url)}"${backAttr(i)}` : ''} title="${esc(`${i.id} ${name}`)}"><div class="stkwrap">${pic}${stkMarks(`i:${i.id}`)}</div>
        <figcaption><span class="cname">${esc(name)}</span><span class="badge">${esc(i.id)}</span></figcaption></figure>`;
    }).join('')}</div>` : none);
  }
  const open = new Set(r.cls.map(n => n.toLowerCase()));
  const all = view.cardShow === 'all';
  const classes = ABILITY_CLASSES.filter(c => all || open.has(c.name.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const byIdx = new Map(classes.map(c => [c.i, c]));
  if (view.cardCls && !classes.some(c => c.name === view.cardCls)) view.cardCls = '';
  const scope = ABILITY_CARDS.filter(c => byIdx.has(c.cls) && (!view.cardCls || byIdx.get(c.cls).name === view.cardCls));
  if (view.cardLv && !scope.some(c => String(c.lv) === view.cardLv)) view.cardLv = '';
  // The search box takes a name and/or a level range such as "1-3" (levels 1, X, 2, 3; X is 1.5, Pack or M is last).
  let q = view.cardSearch.trim().toLowerCase(), range = null;
  const rm = q.match(/(?:^|\s)(\d|x|m|pack)\s*-\s*(\d|x|m|pack)(?=\s|$)/);
  if (rm) {
    const rank = t => lvRank(t === 'pack' ? 'M' : t === 'x' ? 'X' : t === 'm' ? 'M' : t);
    range = [Math.min(rank(rm[1]), rank(rm[2])), Math.max(rank(rm[1]), rank(rm[2]))];
    q = (q.slice(0, rm.index) + ' ' + q.slice(rm.index + rm[0].length)).trim();
  }
  const rows = ABILITY_CARDS.filter(c => byIdx.has(c.cls)
    && (!view.cardCls || byIdx.get(c.cls).name === view.cardCls)
    && (!view.cardLv || String(c.lv) === view.cardLv)
    && (!range || (lvRank(c.lv) >= range[0] && lvRank(c.lv) <= range[1]))
    && (!q || pretty(c.slug).toLowerCase().includes(q))).sort((a, b) => byIdx.get(a.cls).name.localeCompare(byIdx.get(b.cls).name) || lvRank(a.lv) - lvRank(b.lv) || (a.ini ?? 1e9) - (b.ini ?? 1e9) || a.slug.localeCompare(b.slug));
  // Levels offered: those of the classes in scope, so Pack (the Sawbones medical pack) appears only for All classes or Sawbones.
  const levels = [...new Set(ABILITY_CARDS.filter(c => byIdx.has(c.cls) && (!view.cardCls || byIdx.get(c.cls).name === view.cardCls)).map(c => String(c.lv)))].sort((a, b) => lvRank(a) - lvRank(b));
  const filters = `<div class="filters">${typeSel}${showSel}
    <select id="cardCls"><option value="">All classes</option>${classes.map(c => `<option value="${esc(c.name)}" ${view.cardCls === c.name ? 'selected' : ''}>${esc(c.name)}${open.has(c.name.toLowerCase()) ? '' : ' (locked)'}</option>`).join('')}</select>
    <select id="cardLv"><option value="">All levels</option>${levels.map(l => `<option value="${esc(l)}" ${view.cardLv === l ? 'selected' : ''}>${l === 'M' ? 'Pack' : `Level ${esc(lvLabel(l))}`}</option>`).join('')}</select>
    <input id="cardSearch" type="search" placeholder="Name or levels, e.g. 1-3" title="Search by name; a range like 1-3 lists levels 1, X, 2 and 3" value="${esc(view.cardSearch)}">${stkToggle()}</div>`;
  const bar = sizeBar(rows.length);
  if (!classes.length) return filters + '<div class="empty">No classes unlocked yet.</div>';
  return filters + bar + (rows.length ? `<div class="itemgrid" style="--tile-min:${ITEM_SIZES[view.cardSize]}px">${rows.map(c => {
    const url = cardImageUrl(c), name = pretty(c.slug);
    return `<figure class="itemtile"${url ? ` data-img="${esc(url)}"` : ''} title="${esc(`${byIdx.get(c.cls).name}: ${name}`)}"><div class="stkwrap">${cardPicture(c, c.id)}${stkMarks(`c:${c.id}`)}</div>
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
// Treasure index: the claimed treasures with their effect (a click on the tick undoes the claim), then the unclaimed numbers as a
// grid of small buttons (a click claims). Unclaimed effects stay hidden.
function treasureList(r) {
  const claimed = n => r.decks.tre.includes(n);
  const got = TREASURES.filter(t => claimed(t.n)), open = TREASURES.filter(t => !claimed(t.n));
  // where a claimed treasure lies (gh2_scenarios.js tre): a link to the scenario page; unclaimed treasures keep their place hidden
  const from = n => { const s = SCENARIOS.find(x => (x.tre || []).includes(n)); return s ? `<button type="button" class="trfrom" data-flow="${s.n}" title="Open scenario ${s.n}">Scenario ${esc(s.n)} ${esc(s.name)}</button>` : ''; };
  const rows = got.map(t => `<div class="trrow"><b>${esc(t.n)}</b><span class="treffect">${esc(treasureEffectText(t.effect))}</span>${from(t.n)}<button type="button" class="pill ok" data-trclaim="${t.n}" title="Claimed: click to undo" aria-label="Treasure ${esc(t.n)} claimed, undo">&#10003;</button></div>`).join('');
  const nums = open.map(t => `<button type="button" class="trnum" data-trclaim="${t.n}" title="Mark treasure ${esc(t.n)} claimed">${esc(t.n)}</button>`).join('');
  return `<section class="card trcard"><h3>Treasure index <span class="ovcount">${got.length} of ${TREASURES.length} claimed</span></h3>${rows ? `<div class="trrows">${rows}</div>` : ''}${nums ? `<h4 class="trsub">Not claimed</h4><div class="trnums">${nums}</div>` : ''}</section>`;
}

// Links of the group's workbook "Resources" sheet (scripts/games/resources.js): one row per document, one column per game.
function resources(r) {
  const url = (x, game) => r.resLinks[`${x.title}|${game}`] ?? x[game];
  const cell = (x, game) => {
    const u = url(x, game);
    if (editing) return `<input type="text" class="txt" style="width:100%" placeholder="(none)" data-act="resLink" data-key="${esc(game)}" data-id="${esc(x.title)}" value="${esc(u ?? '')}">`;
    return u ? `<a class="chip" href="${esc(u)}" target="_blank" rel="noopener noreferrer">Open</a>` : '';
  };
  const heading = `<h3>Documents<button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing resource links' : 'Edit resource links'}" title="${editing ? 'Stop editing resource links' : 'Edit resource links'}">${PENCIL}</button></h3>`;
  if (isPhone() && !editing) return `<div class="respage">${treasureList(r)}<section class="card">${heading}<div class="mlist">${RESOURCES.map(x => {   // phone: a row per document, a link per game
    const links = RESOURCE_GAMES.filter(([k]) => url(x, k)).map(([k, l]) => `<a class="chip" href="${esc(url(x, k))}" target="_blank" rel="noopener noreferrer">${esc(l)}</a>`).join('');
    return `<div class="mrow resrow"><span class="mmain"><b>${esc(x.title)}</b>${links ? `<span class="reslinks">${links}</span>` : ''}</span></div>`;
  }).join('')}</div></section></div>`;
  return `<div class="respage">${treasureList(r)}<section class="card">${heading}` + dataTable('restable', ['Document', ...RESOURCE_GAMES.map(([, l]) => esc(l))], RESOURCES.map(x =>
    `<tr><td>${esc(x.title)}${x.note ? ` <span class="hint" title="${esc(x.note)}">(note)</span>` : ''}</td>${RESOURCE_GAMES.map(([k]) => `<td>${cell(x, k)}</td>`).join('')}</tr>`)) + '</section></div>';
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
  // Tile: gold when any of its boxes is on. One column: the whole tile is the toggle. Several columns: one small toggle per column.
  const tile = t => {
    const on = cols.some(c => t.on[c.key]);
    const pic = t.img ? `<img src="${esc(t.img)}" alt="" loading="lazy">` : '';
    if (!multi) return `<label class="ntile${on ? ' on' : ''}">${pic}<span class="ntname">${esc(t.name)}</span>${box(t, cols[0])}</label>`;
    return `<div class="ntile${on ? ' on' : ''}">${pic}<span class="ntname">${esc(t.name)}</span>${cols.map(c => `<label class="ntchk">${box(t, c)}<small>${esc(c.label)}</small></label>`).join('')}</div>`;
  };
  // Section header: group name and count; with setGroup, a labelled checkbox per column that switches the whole group.
  const head = (g, mine) => `<div class="modalhead"><h4>${esc(g)} (${mine.length})</h4>${setGroup ? cols.map(c => `<label class="modalhc"><small>${esc(c.label)}</small><input type="checkbox" data-gk="${esc(g)}" data-col="${esc(c.key)}" data-all="${mine.every(t => t.on[c.key]) ? 1 : 0}" data-some="${mine.some(t => t.on[c.key]) ? 1 : 0}" aria-label="${esc(`${g}: all ${c.label}`)}"></label>`).join('') : ''}</div>`;
  m.render = () => {
    if (!m.open || !record) { m.open = false; root.innerHTML = ''; return; }
    const list = items();
    const groups = [...new Set(list.map(t => t.group ?? title))];
    const secs = groups.map(g => {
      const mine = list.filter(t => (t.group ?? title) === g);
      return `<section class="cesec">${head(g, mine)}<div class="ntiles">${mine.map(tile).join('')}</div></section>`;
    }).join('');
    root.innerHTML = `<div class="modal" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}Title"><div class="modalbox modalwide" style="--nc:${cols.length}">
      <button type="button" class="modalx" data-ck-close aria-label="Close">&times;</button>
      <h3 id="${id}Title">${esc(title)}</h3><div class="chedit">${secs}<div class="chfoot"><button type="button" class="btn" data-ck-close>Close</button></div></div></div></div>`;
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
    return [...STICKERS.map(t => t.name), ...extra].map(name => ({ name, img: STICKERS.find(t => t.name === name)?.img, on: { on: have.has(String(name).toLowerCase()) } }));
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
  plRoot.innerHTML = `<div class="modal" id="plModal" role="dialog" aria-modal="true" aria-labelledby="plTitle"><div class="modalbox plbox">
    <button type="button" class="modalx" data-pl-close aria-label="Close">&times;</button>
    <h3 id="plTitle">Players</h3>
    <div class="chedit">
      <section class="cesec"><h4>Players</h4>
        <div class="modalrows">${record.players.map(p => `<div class="plrow"><input type="text" class="txt" maxlength="40" data-pl-seat="${esc(p.seat)}" value="${esc(p.name)}" aria-label="Player name, seat ${esc(p.seat + 1)}"><button type="button" class="chip" data-pl-del="${esc(p.seat)}" title="Remove this player">Remove</button></div>`).join('') || noneText('No players yet.')}</div></section>
      <section class="cesec"><h4>Add player</h4>
        <div class="plrow"><input type="text" class="txt" maxlength="40" placeholder="New player" data-pl-new value="${esc(draft)}" aria-label="New player name"><button type="button" class="chip" data-pl-add>Add</button></div></section>
      <div class="chfoot"><button type="button" class="btn" data-pl-close>Close</button></div></div></div></div>`;
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
  return `<section class="cesec"><h4>${esc(title)}<span>${count} of ${size} &middot; <span class="ptplustag">+1P</span> &times; ${plus}</span></h4>
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
  // one window, three tabs: the prosperity track, the Great Oak sanctuary, the imbuements
  const tabs = `<nav class="subtabs prostabs" role="tablist" aria-label="Prosperity tracks">${[['pros', 'Prosperity'], ['don', 'Great Oak sanctuary'], ['imb', 'Imbuement']].map(([k, l]) => `<button type="button" role="tab" data-prostab="${k}" aria-selected="${mode === k}">${l}</button>`).join('')}</nav>`;
  const body = tabs + (mode === 'don' ? don : mode === 'imb' ? imb : `<section class="cesec"><h4>Prosperity track<span>level <b>${lvNow}</b> &middot; <b>${pros}</b> of ${last} checkmarks</span></h4>${levels}</section>`);
  prosRoot.innerHTML = `<div class="modal" id="prosModal" role="dialog" aria-modal="true" aria-labelledby="prosTitle"><div class="modalbox modalwide ptmodal">
    <button type="button" class="modalx" data-pros-close aria-label="Close">&times;</button>
    <h3 id="prosTitle">Prosperity</h3>
    <div class="chedit">${body}
      <div class="chfoot"><button type="button" class="btn" data-pros-close>Close</button></div></div></div></div>`;
  prosRoot.querySelector('.modalbox').scrollTop = keep;
}
function closeProsModal() { prosModal = false; renderProsModal(); }
prosRoot.addEventListener('click', e => {
  if (e.target.id === 'prosModal' || e.target.closest('[data-pros-close]')) { closeProsModal(); return; }
  const tab = e.target.closest('[data-prostab]')?.dataset.prostab;
  if (tab) { prosModal = tab; renderProsModal(); prosRoot.querySelector('.modalbox').scrollTop = 0; return; }
  const n = Number(e.target.closest('[data-pbox]')?.dataset.pbox);
  if (n) commit(ed.setProsperity(record, n === record.pros ? n - 1 : n));
  const don = Number(e.target.closest('[data-donbox]')?.dataset.donbox);
  if (don) commit(ed.setDonations(record, don === record.don ? don - 1 : don));
  const imb = Number(e.target.closest('[data-imbox]')?.dataset.imbox);
  if (imb) commit(ed.setImbuement(record, imb === record.imb ? imb - 1 : imb));
});
main.addEventListener('click', e => {
  const open = e.target.closest('[data-pros-open]');
  if (!open) return;
  prosModal = 'pros';
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
    return `<section class="cesec"><h4>${name}<span>reputation <b>${rep}</b></span></h4>
      <div class="ptgrid"><div class="ptrow">${boxes.join('')}</div><div class="ptnotes">${pills}</div></div></section>`;
  }).join('');
  const top = Math.max(...REP_FACTIONS.map(([k]) => record.rep[k]));
  const any = REPUTATION_SECTIONS.filter(e => e.faction === 'any').map(e => `<span class="ptpill rep-${top >= e.value ? 'ready' : 'off'}">City event C-${esc(String(e.section).split(':')[1])} added to the city deck <small>at ${e.value} with one faction</small>${top >= e.value ? ' &check;' : ''}</span>`).join('');
  repRoot.innerHTML = `<div class="modal" id="repModal" role="dialog" aria-modal="true" aria-labelledby="repTitle"><div class="modalbox modalwide ptmodal repmodal">
    <button type="button" class="modalx" data-rep-close aria-label="Close">&times;</button>
    <h3 id="repTitle">Reputation</h3>
    <div class="chedit">${secs}${any ? `<div class="ptnotes repany">${any}</div>` : ''}
      <div class="chfoot"><button type="button" class="btn" data-rep-close>Close</button></div></div></div></div>`;
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

// --- party modal: the Party card numbers. Difficulty and inspiration are edited here; the level figures are derived -----------
let partyModal = false;
const partyRoot = document.createElement('div');
document.body.appendChild(partyRoot);
// A counter of a window (the playmat's counter look: the value, up and down arrows; on phones and touch screens [-] value [+]). The value
// can be typed: a number, or +N / -N to add or subtract. sign: the value is shown with its sign (+2, 0, -1) and a typed +N or -N is the value.
const SP_UP = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const SP_DN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const counter = (label, key, v, min, max, sign = false, after = '') => `<div class="cefield"><span>${esc(label)}</span><span class="wlv"><span class="wsp"><input type="text" inputmode="numeric" class="wspv" data-party-type="${key}" value="${esc(sign ? signed(v) : v)}" aria-label="${esc(label)}" title="${sign ? 'Type the value, for example +2 or -1' : 'Type a number, or +N / -N'}"><span class="spc"><button type="button" data-party-step="${key}:1" aria-label="${esc(label)} up"${v >= max ? ' disabled' : ''}>${SP_UP}</button><button type="button" data-party-step="${key}:-1" aria-label="${esc(label)} down"${v <= min ? ' disabled' : ''}>${SP_DN}</button></span></span>${after}</span></div>`;
// The scenario level as on the Monsters tab: the level with up and down arrows, then the difficulty pill (0, +1, -1 ...; not 0: a
// click goes back to 0). The level is stored as the difficulty (ed.monSetLevel); both places show the same value.
function levelControl(r) {
  const lvl = scenarioLevel(r), [lo, hi] = scenarioLevelRange(r), d = r.party.diff || 0, nd = normalDifficulty(r);
  const pill = d ? `<button type="button" class="wdiff on" data-party-lvauto title="Normal difficulty is level ${nd}: back to normal" aria-label="Difficulty ${esc(signed(d))}, back to normal">${esc(signed(d))}</button>`
    : `<span class="wdiff" title="Normal difficulty (level ${nd})" aria-label="Normal difficulty">0</span>`;
  return counter('Scenario level', 'lvl', lvl, lo, hi, false, pill);
}
function renderPartyModal() {
  if (!partyModal || !record) { partyModal = false; partyRoot.innerHTML = ''; return; }
  const keep = partyRoot.querySelector('.modalbox')?.scrollTop || 0;
  const avg = partyAvg(record);
  partyRoot.innerHTML = `<div class="modal" id="partyModal" role="dialog" aria-modal="true" aria-labelledby="partyTitle"><div class="modalbox partybox">
    <button type="button" class="modalx" data-party-close aria-label="Close">&times;</button>
    <h3 id="partyTitle">Party</h3>
    <div class="chedit">
      <section class="cesec"><h4>Party</h4>${kv('Ø Character level', esc(avgText(avg)))}${kv('Normal difficulty', esc(normalDifficulty(record)))}${kv('Enhancements', esc(record.enh.length))}</section>
      <section class="cesec"><h4>Scenario level and inspiration</h4><div class="cegrid">
        ${levelControl(record)}${counter('Inspiration', 'insp', record.party.insp ?? 0, 0, 99)}</div></section>
      <div class="chfoot"><button type="button" class="btn" data-party-close>Close</button></div></div></div></div>`;
  partyRoot.querySelector('.modalbox').scrollTop = keep;
}
function closePartyModal() { partyModal = false; renderPartyModal(); }
partyRoot.addEventListener('click', e => {
  if (e.target.id === 'partyModal' || e.target.closest('[data-party-close]')) closePartyModal();
});
partyRoot.addEventListener('click', e => {
  const b = e.target.closest('[data-party-step]');
  if (!b || b.disabled) return;
  const [key, d] = b.dataset.partyStep.split(':');
  if (key === 'lvl') { commit(ed.monSetLevel(record, scenarioLevel(record) + Number(d))); return; }
  commit(ed.setParty(record, key, (record.party[key] ?? 0) + Number(d)));
});
partyRoot.addEventListener('click', e => { if (e.target.closest('[data-party-lvauto]')) commit(ed.monSetLevel(record, null)); });
partyRoot.addEventListener('change', e => {
  const key = e.target.dataset.partyType;
  if (!key) return;
  if (key === 'lvl') { const n = Number(String(e.target.value).trim()); if (Number.isInteger(n)) commit(ed.monSetLevel(record, n)); else renderPartyModal(); return; }
  const t = String(e.target.value).trim(), cur = record.party[key] ?? 0;
  // +N adds and -N subtracts, except for the difficulty, which is shown with its sign: there +N and -N are the value
  const relative = key !== 'diff' && /^[+-]\d+$/.test(t);
  const v = relative ? cur + Number(t) : Number(t);
  if (Number.isFinite(v) && t !== '') commit(ed.setParty(record, key, v)); else renderPartyModal();
});
partyRoot.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.partyType) e.target.blur(); });
main.addEventListener('click', e => {
  if (!e.target.closest('[data-party-open]')) return;
  partyModal = true;
  renderPartyModal();
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
    <div class="chedit">
      <section class="cesec"><h4>Retired characters</h4>
        ${record.retired.length ? '<div class="retrow rethead"><span>Class</span><span>Player</span><span>Name</span><span>Lv</span><span>Perks</span><span>Masteries</span><span></span></div>' : ''}
        <div class="modalrows">${rows || noneText('No retired characters yet.')}</div>
        <div><button type="button" class="chip" data-ret-add>+ Add retired character</button></div></section>
      <div class="chfoot"><button type="button" class="btn" data-ret-close>Close</button></div></div></div></div>`;
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
  scnModalRoot.innerHTML = `<div class="modal" id="scnModal" role="dialog" aria-modal="true" aria-labelledby="scnModalTitle"><div class="modalbox scnbox">
    <button type="button" class="modalx" data-scn-close aria-label="Close">&times;</button>
    <button type="button" class="editbtn editicon modaledit" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing scenarios' : 'Edit scenarios'}" title="${editing ? 'Stop editing scenarios' : 'Edit scenarios'}">${PENCIL}</button>
    ${flowDetail(record)}</div></div>`;
}
function closeScnModal() { view.scnSel = null; render(); }
scnModalRoot.addEventListener('click', e => {
  if (e.target.id === 'scnModal' || e.target.closest('[data-scn-close]')) { closeScnModal(); return; }
  const tb = e.target.closest('[data-scntre]');
  if (tb) { commit(ed.toggleDeckEntry(record, 'tre', Number(tb.dataset.scntre))); return; }
  const go = e.target.closest('[data-scn-go]');
  if (go) { view.scnSel = Number(go.dataset.scnGo); render(); return; }
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
  else if (partyModal) closePartyModal();
  else if (repModal) closeRepModal();
  else if (retModal) closeRetModal();
  else if (view.scnSel != null) closeScnModal();
  else if (view.itemSel != null && tab === 'Items') { view.itemSel = null; render(); }
  else if (view.flowFull) { view.flowFull = false; render(); }
});

// The playmat's card unit (--cu on .pm), measured from the stage: 14% of its height or 12% of its width, whichever is smaller,
// between 60 and 160 px. Every card size on the playmat (Modifiers view, modifier modal) is derived from it.
function sizePlaymat() {
  const pm = main.querySelector('.pm'), st = pm?.querySelector('.stage6');
  if (!st) return;
  const { width, height } = st.getBoundingClientRect();
  pm.style.setProperty('--cu', `${Math.round(Math.min(160, Math.max(60, Math.min(height * 0.14, width * 0.12))))}px`);
}
window.addEventListener('resize', sizePlaymat);

function render() {
  renderTabs();
  if (!record) {
    main.innerHTML = '<div class="empty">No campaign loaded.<br>Use <b>Load file</b> to open a campaign JSON file. It is kept in this browser only.</div>';
    return;
  }
  const flowPage = tab === 'Scenarios' && view.scnView === 'flow';
  if (!flowPage) view.flowFull = false;
  main.classList.toggle('wide', flowPage || tab === 'Monsters' || (tab === 'Mercenaries' && currentSub() !== 'add'));                // the flowchart may use the whole window width
  document.body.classList.toggle('noscroll', !!view.flowFull);
  editing = tab === 'Overview' || tab === 'Mercenaries' ? false : editPages.has(tab);
  saveView();
  const issues = validate(record);
  // The Items and Events pages carry their own pencil button (in the filter row / tab row). Scenarios has no page-wide
  // edit mode at all: every row (table or flowchart) opens the scenario modal, which carries its own pencil button.
  const noPagebar = tab === 'Monsters' || tab === 'Overview' || tab === 'Items' || tab === 'Events' || tab === 'Cards' || tab === 'Scenarios' || tab === 'Resources' || tab === 'History' || tab === 'Mercenaries';   // the Mercenaries tab is the playmat: no page pencil
  const pagebar = noPagebar ? '' : `<div class="pagebar"><button type="button" class="editbtn editicon" data-pageedit aria-pressed="${editing}" aria-label="${editing ? 'Stop editing this page' : `Edit ${esc(tab.toLowerCase())}`}" title="${editing ? 'Stop editing this page' : `Edit ${esc(tab.toLowerCase())}`}">${PENCIL}</button></div>`;
  const body = { Overview: overview, Scenarios: scenarios, Mercenaries: mercenaries, Monsters: r => monstersHtml(r, monView, esc), Items: items, Events: events, Cards: cardsPage, Resources: resources, History: historyPage }[tab](record);
  renderModal();
  checkModals.forEach(m => m.render());
  renderPlModal();
  renderProsModal();
  renderRepModal();
  renderPartyModal();
  renderRetModal();
  renderScnModal();
  const html = pagebar + (issues.length ? `<div class="issues">${issues.length} issue(s): ${esc(issues.slice(0, 5).join('; '))}</div>` : '') + body;
  // The playmat is redrawn in place (campaign/morph.js): cards keep their picture and hover state, so a drop or a flip does not flicker.
  const flowKeep = flowPage ? flowCenterFrac() : null;      // the chart before this render (none when coming from another view)
  if (tab === 'Mercenaries' && !editing && main.querySelector('.pm')) morphInto(main, html); else main.innerHTML = html;
  if (flowPage) flowRestoreScroll(flowKeep);
  sizePlaymat();
  if (tab === 'Cards' && view.cardType === 'am') hydrateAm();
  if (pm.modal === 'amd' || pm.modal === 'amdpile' || pm.hview === 'amd' || pm.ptab === 'amd') hydrateAmdModal();
  if (pm.modal === 'perks') hydratePerkCards();
  if (flowPage && (view.scnSel ?? flowFound) != null) flowRest();
}

// Phone view: tabs, the menu, bottom sheets, tap a card to move it, tap a played card to flip it.
function phoneClick(e) {
  const t = e.target, q = sel => t.closest?.(sel);
  if (!q('.pp')) return false;
  const c = pmChar();
  if (q('[data-ptab]')) { pm.ptab = q('[data-ptab]').dataset.ptab; pm.sheet = null; render(); return true; }
  if (q('[data-pmenu]')) { pm.sheet = { kind: 'menu' }; render(); return true; }
  if (q('[data-pchars]')) { pm.sheet = { kind: 'chars' }; render(); return true; }
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

// Display settings: the gear, the segmented choices and Reset.

// Items: click an item to open it (state), the pencil opens the equip dialog, Slot sorts the shelf.
function itemClick(e, c) {
  const q = sel => e.target.closest?.(sel);
  const st = q('[data-itstate]');
  if (st) { commit(ed.setItemState(record, c.id, st.dataset.id, Number(st.dataset.itstate))); return true; }
  const fl = q('[data-itflip]');
  if (fl) { flipItem(c.id, fl.dataset.id, fl.dataset.itflip === '1'); return true; }
  const sort = q('[data-itemssort]');
  if (sort) { commit(ed.sortItems(record, c.id)); return true; }
  if (q('[data-itemsedit]')) {
    pm.sellMode = false; pm.modal = 'items'; render(); return true;
  }
  const tile = q('.pm .it[data-itemstate]');
  if (tile && !pm.modal) { pm.itemId = tile.dataset.id; pm.modal = 'item'; render(); return true; }
  const sel = q('[data-isel]');
  if (sel) {
    if (sel.dataset.off) return true;
    const id = sel.dataset.isel, cur = c.items.map(it => String(it.id));         // saved at once: no confirm step
    commit(ed.setEquippedItems(record, c.id, cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])); return true;
  }
  const sell = q('[data-sellitem]');
  const mode = q('[data-itemmode]');
  if (mode) { pm.sellMode = mode.dataset.itemmode === 'sell'; render(); return true; }
  if (sell) {
    const id = sell.dataset.sellitem, item = ITEMS.find(x => String(x.id) === id), price = ed.sellPrice(id);
    if (!item || price === null) return true;
    ask({ title: 'Sell item', text: `Sell ${pretty(item.slug)} for ${price} gold?
The card goes back to the shop and ${price} gold is added to ${c.name}.`, ok: 'Sell', cancel: 'Cancel', danger: true }).then(yes => {
      if (!yes) return;
      commit(ed.sellItem(record, c.id, id));
    });
    return true;
  }
  return false;
}

// Deck modal: tabs, card pool picks and undo, the level stepper, the hand selection and its confirmation.
function deckClick(e, c) {
  const t = e.target, q = sel => t.closest?.(sel);
  const cs = q('[data-cstate]') || q('.mmodal .pcard[data-s]')?.querySelector('[data-cstate]');   // the state badge of a card (Locked, Unlocked, Hand), or the card itself
  if (cs) {
    const id = Number(cs.dataset.cstate), lv = cardLevel(id), owned = ownedCards(c).includes(id), hs = [...new Set(pm.hsel[c.id] || [])].filter(x => ownedCards(c).includes(x)), limit = handLimit(c), picked = lv >= 2 && lv < 99;
    if (!owned) { if (picked && lv <= (c.lv || 1) && pendingPicks(c) > 0) commit(ed.addPoolCard(record, c.id, id)); return true; }       // Locked -> Unlocked: a level-up pick
    if (!hs.includes(id)) { if (!limit || hs.length < limit) { pm.hsel[c.id] = [...hs, id]; pm.hsArmed = false; render(); } return true; }   // Unlocked -> Hand
    pm.hsel[c.id] = hs.filter(x => x !== id); pm.hsArmed = false;                                                                      // Hand -> Unlocked (a picked card goes back to Locked)
    if (picked) commit(ed.removePoolCard(record, c.id, id)); else render();
    return true;
  }
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
  const byKey = new Map([...deckOf(c, c.amd?.adj), ...drawState(c, c.amd).missing].map(t => [t.key, t]));
  main.querySelectorAll('[data-amslot]').forEach(el => {
    const t = byKey.get(el.dataset.amslot);
    if (!t || el.dataset.shown === el.dataset.amslot) return;
    el.dataset.shown = el.dataset.amslot;
    el.replaceChildren(buildCard(t.card, c.cls, !!t.extra));
  });
  const slot = main.querySelector('[data-amslot][data-big]'), big = slot?.closest('.pcbig');       // the enlarged card: size and side follow the display settings
  if (slot?.firstChild && big) { const w = dockPreview(big, previewW()); slot.firstChild.style.setProperty('--pc-width', `${w}px`); big.style.setProperty('--zw', `${w}px`); }
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
  if (fz) { flowZoomTo(fz); return; }
  const fn = e.target.closest('[data-flow]')?.dataset.flow;
  if (fn) { view.scnSel = Number(fn); render(); return; }
  const isel = e.target.closest('[data-itemsel]')?.dataset.itemsel;
  if (isel != null) { view.itemSel = isel; render(); return; }
  if (e.target.closest('[data-itemclose]') || e.target.id === 'itemSheet') { view.itemSel = null; render(); return; }
  const gt = e.target.closest('[data-giveto]')?.dataset.giveto;
  if (gt) { const [cid, id] = gt.split('|'); commit(ed.itemCost(id) === null ? ed.giveItem(record, cid, id) : ed.buyItem(record, cid, id)); return; }
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
  sub = t; pm.chMenu = false; pm.sheet = null;
  render();
  try { localStorage.setItem('havenmap.campaign.sub', t); } catch { /* ignore */ }
});
// --- card preview: one floating picture for every tab (campaign/preview.js) ---
const coarse = matchMedia('(pointer: coarse)');
// Playmat cards with a preview, and the cards whose long press opens the context menu (which has Zoom) instead of pinning.
const PM_PREVIEW = '.mon .mab:not(.back), .mon .mstat, .pp .ac[data-card], .pm .fan6 .ac, .pm .activelist .ac, .pm .flipcard.is-front, .pm .shelf6 .it, .pm .amv .stk, .pm .amv .mini, .pm .pilelist .pcell, .pm .mmodal .pcard, .pm .am-perk-cards .pc';
const MENU_CARDS = '.pm .fan6 .ac, .pm .activelist .ac, .pm .flipcard, .pm .it, .pm .pilelist .pcell[data-pcard]';
const cardPreview = createPreview({
  selector: `[data-img], [data-amzoom], ${PM_PREVIEW}`,
  settings: () => pmset,
  longPress: el => !el.matches(MENU_CARDS),
  resolve: (el, pin) => {
    const host = el.closest('.pm');
    if (host) return pmPreview(el, host, pin);
    if (el.matches('[data-amzoom]')) {                                                                   // a composed attack modifier card: built, no single picture
      const s = amSlots[Number(el.dataset.amzoom)];
      return s ? { key: `am:${el.dataset.amzoom}`, make: () => buildCard(s.card, s.className, s.isAdded), ar: 600 / 391 } : null;
    }
    if (el.dataset.imgb) {                                                                              // a flip item: front and back side by side, each as tall as a single card
      const pair = [el.dataset.img, el.dataset.imgb], ar = (2 * 196 + 6) / 300;
      return { key: pair.join('|'), ar, scale: ar, make: () => { const d = document.createElement('div'); d.className = 'cpvpair'; d.append(...pair.map(u => Object.assign(document.createElement('img'), { src: u, alt: '', draggable: false }))); return d; } };
    }
    return { key: el.dataset.img, url: el.dataset.img, scale: Number(el.dataset.imgw) >= 600 ? 1.3 : 1 };   // character mats: small print, larger
  },
  tapPins: el => !el.closest('.pm'),
});
const hidePreview = () => cardPreview.hide();
// Ctrl held: the fan zooms in place at once; with "Show on: Ctrl+hover" it zooms only then (playmat.css, .ctrlheld).
const ctrlHeld = on => document.documentElement.classList.toggle('ctrlheld', on);
document.addEventListener('keydown', e => { if (e.key === 'Control') ctrlHeld(true); });
document.addEventListener('keyup', e => { if (e.key === 'Control') ctrlHeld(false); });
window.addEventListener('blur', () => ctrlHeld(false));
// Playmat content: ability cards are their picture with the tokens and stickers laid over it; items a copy with their state badge;
// attack modifier cards their picture or a copy of the built card. The fan zooms in place (playmat.css); a pin shows the preview.
function pmPreview(el, host, pin) {
  if (el.matches('.hand6[data-layout=fan] .ac') && !pin) return null;
  if (el.matches('.it')) {                                                                            // a flip item: its other side beside the copy, the copy as tall as alone
    const item = ITEMS.find(x => String(x.id) === el.dataset.id), front = itemImageUrl(item), b = itemBackUrl(item);
    const back = b && (el.classList.contains('flipped') ? front : b);
    return { key: `it:${el.outerHTML}`, clone: el, wrap: 'shelf6', scope: 'pm', back, scale: back ? (2 * el.offsetWidth + 6) / el.offsetHeight : undefined };
  }
  if (el.matches('.stk, .mini, .amcell, .am-perk-cards .pc')) {
    const face = el.querySelector('.stkface') || el, first = face.firstElementChild;                    // a single picture, or a built card of layered pictures
    if (first?.tagName === 'IMG' && !el.matches('.pc')) return { key: `am:${first.src}`, url: first.src, scope: 'pm' };
    const slot = el.matches('.pc') ? el : face.querySelector('.amslot, .pc');
    if (!slot?.firstElementChild) return null;
    return { key: `am:${slot.innerHTML}`, ar: 600 / 391, scope: 'pm', make: () => { const n = slot.cloneNode(true); n.removeAttribute('data-amslot'); n.removeAttribute('data-keep'); n.style.removeProperty('--pc-width'); return n; } };
  }
  const img = el.querySelector('.face.front img') || el.querySelector(':scope > img, :scope > .acf > img');
  if (!img) return null;
  const tks = [...el.querySelectorAll('.tk')];
  return { key: `c:${img.src}|${tks.map(t => t.outerHTML).join('')}`, url: img.src, scope: 'pm', extra: () => tks.map(t => t.cloneNode(true)) };
}
// A picture that fails to load (the asset repository lacks a few cards) becomes the card name.
main.addEventListener('error', e => {
  const img = e.target;
  if (img?.tagName !== 'IMG' || !img.classList.contains('cardpic')) return;
  const d = document.createElement('div');
  d.className = 'noimg';
  d.textContent = img.alt;
  img.replaceWith(d);
}, true);

// Native drag and drop is left to the Events tab rows; playmat cards are dragged with pointer events (below).
main.addEventListener('dragstart', e => { evDragStart(e); });
main.addEventListener('dragend', () => { evDragEnd(); });

// Drag ghost of the playmat (ability cards and modifier cards, mouse, touch and pen): an opaque copy of the card that follows the
// pointer, lifted (shadow, slight tilt), always the same size wherever the drag starts (hand, fan zoom, play slot, pile). The card
// stays in its place as a dimmed placeholder. A drop fades the ghost out; a cancel (Esc, or a drop outside a zone) flies it back.
const GHOST_W = { card: 1.5, mod: 1.1 };                     // ghost width in playmat card units (--cu, the card size setting)
function ghostUnit() { return parseFloat(getComputedStyle(main.querySelector('.pm') || document.body).getPropertyValue('--cu')) || 100; }
function ghostStart(body, kind, ar, src, x, y) {             // body: the ghost content; ar: height / width; src: the card on the page
  const w = Math.round(ghostUnit() * GHOST_W[kind]), h = Math.round(w * ar), r = src.getBoundingClientRect();
  const fx = r.width ? Math.min(1, Math.max(0, (x - r.left) / r.width)) : 0.5, fy = r.height ? Math.min(1, Math.max(0, (y - r.top) / r.height)) : 0.5;
  const g = document.createElement('div');
  g.className = 'dragghost';
  g.style.width = `${w}px`; g.style.height = `${h}px`;
  const inner = document.createElement('div');
  inner.className = 'dgi';
  inner.append(body);
  g.append(inner);
  document.body.append(g);
  document.body.classList.add('pmdragging');
  window.getSelection?.()?.removeAllRanges();
  hidePreview();
  const G = { g, w, h, fx, fy, src };
  ghostMove(G, x, y);
  return G;
}
function ghostMove(G, x, y) { G.x = x - G.fx * G.w; G.y = y - G.fy * G.h; G.g.style.transform = `translate(${G.x}px,${G.y}px)`; }
function ghostEnd(G, dropped) {
  document.body.classList.remove('pmdragging');
  const g = G.g, done = () => g.remove();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !g.animate) { done(); return; }
  if (dropped) { g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-out' }).onfinish = done; return; }
  const r = G.src.isConnected ? G.src.getBoundingClientRect() : null;   // fly back to the card's place
  if (!r || !r.width) { done(); return; }
  const tx = r.left + r.width / 2 - G.w / 2, ty = r.top + r.height / 2 - G.h / 2;
  g.animate([{ transform: `translate(${G.x}px,${G.y}px)` }, { transform: `translate(${tx}px,${ty}px)`, opacity: 0.6 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = done;
}
// Ghost content of an ability card: its picture (the visible side of a played card) with the tokens on it.
function cardGhostBody(el) {
  const flip = el.classList.contains('flipcard');
  const img = flip ? el.querySelector(el.classList.contains('is-front') ? '.face.front img' : '.face.back img') : el.querySelector(':scope > img, :scope > .acf > img');
  const d = document.createElement('div');
  d.className = 'dgcard';
  if (img) d.append(Object.assign(document.createElement('img'), { src: img.src, alt: '', draggable: false }));
  else d.append(Object.assign(document.createElement('div'), { className: 'noimg', textContent: el.title || '' }));
  if (!flip || el.classList.contains('is-front')) el.querySelectorAll(':scope .tk').forEach(t => d.append(t.cloneNode(true)));
  const ar = img?.naturalWidth ? img.naturalHeight / img.naturalWidth : 7 / 5;
  return { body: d, ar };
}
// Ghost content of a modifier card: the card painted onto a canvas from the layer pictures already on screen (a modifier card is a
// stack of layers; painting keeps the ghost free of the playmat's layout rules).
function modGhostBody(st) {
  const face = st.querySelector('.stkface'), fr = face?.getBoundingClientRect();
  if (!fr?.width) return null;
  const cv = document.createElement('canvas'), k = (window.devicePixelRatio || 1) * 2;
  cv.width = Math.round(fr.width * k); cv.height = Math.round(fr.height * k);
  const ctx = cv.getContext('2d');
  ctx.scale(k, k);
  ctx.fillStyle = '#1a1510'; ctx.fillRect(0, 0, fr.width, fr.height);
  face.querySelectorAll('img').forEach(im => {
    if (!im.complete || !im.naturalWidth) return;
    const r = im.getBoundingClientRect();
    try { ctx.drawImage(im, r.left - fr.left, r.top - fr.top, r.width, r.height); } catch (_) { /* skip the layer */ }
  });
  return { body: cv, ar: fr.height / fr.width };
}
// After a drag the click that ends it must not act (flip a card, send a modifier card to the discard).
function swallowNextClick() {
  const s = ev => { ev.stopImmediatePropagation(); ev.preventDefault(); };
  document.addEventListener('click', s, true); setTimeout(() => document.removeEventListener('click', s, true), 50);
}
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
const clearMarks = () => main.querySelectorAll('.ins-before, .ins-after, .dropcell').forEach(el => el.classList.remove('ins-before', 'ins-after', 'dropcell'));
main.addEventListener('dragover', e => { evDragOver(e); });
function markDropZone(e, zone) {
  main.querySelectorAll('[data-zone].over').forEach(z => { if (z !== zone) z.classList.remove('over'); });
  zone.classList.add('over');
  clearMarks();
  if (zone.dataset.zone === 'hand' && zone.classList.contains('hgrid')) e.target.closest?.('.hcell')?.classList.add('dropcell');
  else if (zone.dataset.zone === 'hand') { const p = handDropPlace(e, zone); if (p.row) p.row.classList.add(p.side === 'before' ? 'ins-before' : 'ins-after'); }
}
function applyDrop(e, zone, d) {                                  // e: the drop event, or { target, clientX, clientY } from a touch drag
  zone.classList.remove('over');
  clearMarks();
  if (!d || d.char !== zone.dataset.char) return;
  if (zone.dataset.zone !== 'hand') { commit(ed.moveCard(record, d.char, d.card, zone.dataset.zone)); return; }
  if (zone.classList.contains('hgrid')) {                         // grid layout: the cell under the pointer
    const cell = e.target.closest?.('.hcell');
    if (cell && zone.contains(cell)) commit(ed.placeInHand(record, d.char, d.card, Number(cell.dataset.cell)));
    else if (!zone.querySelector(`.ac[data-card="${d.card}"]`)) commit(ed.moveCard(record, d.char, d.card, 'hand'));
    return;
  }
  const place = handDropPlace(e, zone).before;
  const fromHand = !!zone.querySelector(`.ac[data-card="${d.card}"]`);
  // inside the hand, dropping on empty space puts the card at the end; from another zone it just enters the hand
  commit(ed.moveCard(record, d.char, d.card, 'hand', place === undefined && !fromHand ? {} : { before: place === undefined ? null : place }));
}
main.addEventListener('drop', e => { evDrop(e); });
// Drag of ability cards between the hand, play slots, active area and piles (play, not setup: no Edit needed). The mouse picks a card
// up once it moves 5 px; touch and pen hold briefly first, so a quick swipe still scrolls the page.
(() => {
  let t = null;
  const zoneAt = (x, y) => document.elementFromPoint(x, y)?.closest?.('.pm [data-zone]');
  const unmark = () => { main.querySelectorAll('[data-zone].over').forEach(x => x.classList.remove('over')); clearMarks(); };
  main.addEventListener('pointerdown', e => {
    if (e.button || pm.modal || t) return;
    const el = e.target.closest?.('.pm:not(.pp) .ac[data-card], .pm:not(.pp) .flipcard[data-card]');
    if (!el || e.target.closest('button')) return;
    const mouse = e.pointerType === 'mouse';
    t = { el, mouse, x: e.clientX, y: e.clientY, id: e.pointerId, G: null, armed: mouse };
    if (!mouse) t.timer = setTimeout(() => { if (t && t.el === el) { t.armed = true; el.classList.add('armed'); navigator.vibrate?.(8); } }, 220);
  });
  main.addEventListener('touchmove', e => { if (t && t.armed) e.preventDefault(); }, { passive: false });
  window.addEventListener('pointermove', e => {
    if (!t || e.pointerId !== t.id) return;
    if (!t.G) {
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) < (t.mouse ? 5 : 10)) return;
      if (!t.armed) { clearTimeout(t.timer); t = null; return; }                        // moved before the hold: let the page scroll
      const { body, ar } = cardGhostBody(t.el);
      t.G = ghostStart(body, 'card', ar, t.el, t.x, t.y);
      t.el.classList.add('dragging');
    }
    e.preventDefault();
    ghostMove(t.G, e.clientX, e.clientY);
    const z = zoneAt(e.clientX, e.clientY);
    if (z) markDropZone({ target: document.elementFromPoint(e.clientX, e.clientY), clientX: e.clientX, clientY: e.clientY }, z);
    else unmark();
  });
  const end = (e, cancel) => {
    if (!t || (e && e.pointerId !== t.id)) return;
    const d = t; t = null; clearTimeout(d.timer); d.el.classList.remove('armed');
    if (!d.G) return;
    const z = !cancel && e?.type === 'pointerup' ? zoneAt(e.clientX, e.clientY) : null;
    const at = z ? { target: document.elementFromPoint(e.clientX, e.clientY), clientX: e.clientX, clientY: e.clientY } : null;
    unmark(); swallowNextClick();
    ghostEnd(d.G, !!z);
    d.el.classList.remove('dragging');
    if (z) applyDrop(at, z, { char: d.el.dataset.char, card: Number(d.el.dataset.card) });
  };
  window.addEventListener('pointerup', e => end(e)); window.addEventListener('pointercancel', e => end(e, true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && t?.G) { e.preventDefault(); e.stopImmediatePropagation(); end(null, true); } }, true);
})();
// Flip a played card with the mockup's animation: turn the card in place first (the page is redrawn from the record, which would cut
// the animation short), save when it has finished. A card turned face up goes flat afterwards ("settled"), as in the mockup.
// Flip an item of a character to its back (back true) or front, turned like a played card: the picture (on the shelf, in the phone list
// and in the item dialog) turns to its edge, shows the other side and turns back; the change is saved when the turn ends. The item's
// markup stays (badges, markers), only its picture turns (Web Animations, so a redraw in between does not cut it). Reduce motion: at once.
function flipItem(cid, id, back) {
  const save = () => commit(ed.setItemFlipped(record, cid, id, back));
  const item = ITEMS.find(x => String(x.id) === String(id)), to = item && (back ? itemBackUrl(item) : itemImageUrl(item));
  const sel = `[data-char="${CSS.escape(cid)}"][data-id="${CSS.escape(String(id))}"]`;
  const tile = main.querySelector(`.it[data-itemstate]${sel}`);
  const imgs = [tile?.querySelector(':scope > img'), document.querySelector(`.itmodal .itcard[data-mkcard="i:${CSS.escape(String(id))}"] > img`)].filter(Boolean);
  if (!to || !imgs.length || tile?.dataset.turning || pmset.reduce) { save(); return; }          // the playmat's own Reduce motion setting, as for played cards
  if (tile) tile.dataset.turning = '1';
  new Image().src = to;                                                                       // load the other side while the first half runs
  const turn = (img, a, b, easing) => img.animate([{ transform: `perspective(700px) rotateY(${a}deg)` }, { transform: `perspective(700px) rotateY(${b}deg)` }], { duration: 230, easing }).finished;
  Promise.all(imgs.map(img => turn(img, 0, 90, 'ease-in').then(() => { img.src = to; return turn(img, -90, 0, 'ease-out'); })))
    .catch(() => {}).finally(() => { if (tile) delete tile.dataset.turning; save(); });
}
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
const ZONE_LABEL = { hand: 'Hand', active: 'Active area', play1: 'Play slot 1', play2: 'Play slot 2', discard: 'Discard', lost: 'Lost' };
registerMenu({
  sel: '.pm .fan6 .ac, .pm .activelist .ac, .pm .flipcard',
  title: el => el.title || 'Card',
  actions: el => {
    const c = record?.chars.find(x => x.id === el.dataset.char), id = Number(el.dataset.card);
    if (!c || !c.deck.includes(id)) return [];
    const from = zoneOf(c, id), hand = from === 'hand', flip = el.classList.contains('flipcard');
    const down = flip && !el.classList.contains('is-front');
    const zoom = { label: 'Zoom', disabled: down, run: () => cardPreview.show(el, true) };
    const marker = { label: 'Edit marker or sticker', run: () => openMarkers(`c:${id}`) };   // not for cards in the play area
    const moves = CARD_ZONES.filter(z => z !== from).map(z => ({
      label: ZONE_LABEL[z],
      disabled: z.startsWith('play') && from !== 'hand' && !from.startsWith('play'),                       // only hand cards enter a play slot
      run: () => commit(ed.moveCard(record, c.id, id, z)),
    }));
    if (hand) {
      const hand0 = handList(c);
      return [{ header: 'Move to' }, ...moves, { sep: true },
        { label: 'Move to start', run: () => commit(ed.moveCard(record, c.id, id, 'hand', { before: hand0[0] })) },
        { label: 'Move to end', run: () => commit(ed.moveCard(record, c.id, id, 'hand', { before: null })) },
        { sep: true }, zoom, marker];
    }
    if (flip) return [zoom, { sep: true }, { header: 'Move to' }, ...moves];
    return [zoom, marker, { sep: true }, { header: 'Move to' }, ...moves];
  },
});
registerMenu({
  sel: '.pm .it[data-itemstate]',
  title: el => (el.title || 'Item').split(' — ')[0],
  actions: el => {
    const c = record?.chars.find(x => x.id === el.dataset.char), mine = c?.items.find(x => String(x.id) === el.dataset.id), cur = mine?.s || 0;
    const states = c ? [[0, 'Available'], [1, 'Spent'], [2, 'Consumed']].map(([v, label]) => ({ label, disabled: cur === v, run: () => commit(ed.setItemState(record, c.id, el.dataset.id, v)) })) : [];
    const canFlip = c && itemBackUrl(ITEMS.find(x => String(x.id) === el.dataset.id));
    const flip = canFlip ? [{ label: mine?.f ? 'Flip to the front' : 'Flip to the back', run: () => flipItem(c.id, el.dataset.id, !mine?.f) }] : [];
    return [...(states.length ? [{ header: 'State' }, ...states, { sep: true }] : []), ...flip, { label: 'Zoom', run: () => cardPreview.show(el, true) }, { label: 'Add marker', run: () => openMarkers(`i:${el.dataset.id}`) }];
  },
});
registerMenu({
  sel: '.pm .pile6',
  title: el => (el.dataset.pile === 'lost' ? 'Lost' : 'Discard'),
  actions: el => {
    const c = record?.chars.find(x => x.id === el.dataset.char);
    if (!c) return [];
    const key = el.dataset.pile, ids = (key === 'lost' ? c.lost : c.disc).filter(id => c.deck.includes(id));
    return [
      { label: 'Recover top card to hand', disabled: !ids.length, run: () => commit(ed.moveCard(record, c.id, ids.at(-1), 'hand')) },
      { label: `Move whole pile to hand (${ids.length})`, disabled: !ids.length, danger: true, run: async () => {
        const where = key === 'lost' ? 'lost' : 'discard';
        if (!await ask({ title: 'Move cards to hand', text: `Move all ${ids.length} cards from the ${where} pile to the hand?`, ok: 'Move all', danger: true })) return;
        let r = record; for (const id of [...ids].reverse()) r = ed.moveCard(r, c.id, id, 'hand'); commit(r);
      } },
    ];
  },
});
// Modifier discard: the same menu as the ability discard pile (recover the top card, move the whole pile), back into the deck.
function amdPileMenu() {
  const c = pmChar();
  if (!c) return [];
  const pile = drawState(c, c.amd).pile;
  const n = pile.length;
  return [
    { label: 'Recover top card to deck', disabled: !n, run: () => amdDo(c, 'ret', pile[0].key) },
    { label: `Move whole pile to deck (${n})`, disabled: !n, danger: true, run: async () => {
      if (!await ask({ title: 'Move cards to deck', text: `Move all ${n} cards from the discard to the deck?`, ok: 'Move all', danger: true })) return;
      amdDo(c, 'retall');
    } },
  ];
}
registerMenu({
  sel: '.pm .amv .discarea',
  title: () => 'Modifier discard',
  actions: amdPileMenu,
});
// Ability discard / lost modal: each card can be moved to the hand or to the other pile (the pile it is in is greyed out).
registerMenu({
  sel: '.pm .pilelist .pcell[data-pcard]',
  title: el => el.title || 'Card',
  actions: el => {
    const c = pmChar(), id = Number(el.dataset.pcard);
    if (!c || !c.deck.includes(id)) return [];
    const from = pm.pileZ === 'lost' ? 'lost' : 'discard';
    return [
      { header: 'Move to' },
      { label: 'Hand', run: () => commit(ed.moveCard(record, c.id, id, 'hand')) },
      { label: 'Lost', disabled: from === 'lost', run: () => commit(ed.moveCard(record, c.id, id, 'lost')) },
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
    return [{ label: '+10', run: () => set(cur + 10) }, { label: '+5', run: () => set(cur + 5) }, { label: '+1', run: () => set(cur + 1) }, { label: '\u22121', disabled: cur < 1, run: () => set(Math.max(0, cur - 1)) }, { label: '\u22125', disabled: cur < 1, run: () => set(Math.max(0, cur - 5)) }, { label: '\u221210', disabled: cur < 1, run: () => set(Math.max(0, cur - 10)) }, { sep: true },
      { label: 'Reset to 0', danger: true, disabled: !cur, run: async () => { if (hud && !await ask({ title: 'Reset value', text: 'Reset this value to 0?', ok: 'Reset', danger: true })) return; set(0); } }];
  },
});
registerMenu({
  sel: '.pm .amdtile',
  title: el => el.title || 'Attack modifier card',
  actions: el => { const z = el.querySelector('[data-amzoom]'); return [{ label: 'Zoom', disabled: !z, run: () => { pm.amZoom = z.dataset.amzoom; render(); } }]; },
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && pm.modal) { pm.modal = null; render(); } });
main.addEventListener('change', e => {
  if (e.target.matches?.('[data-histkind]')) { pm.histKind = e.target.value; render(); }
  else if (e.target.matches?.('[data-logkind]')) { view.logKind = e.target.value; render(); }
  else if (e.target.matches?.('[data-loguser]')) { view.logUser = e.target.value; render(); }
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
// Keys on the object under the mouse pointer: D, L, A move an ability card; D, L set an item to spent or consumed, F flips a flip item
// (only one with a back picture); D discards a placed attack modifier card. The pointer is read at key press (not on move), so a card that was re-rendered still counts.
let lastPointer = null;
document.addEventListener('mousemove', e => { lastPointer = { x: e.clientX, y: e.clientY }; });
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (!['d', 'l', 'a', 'f'].includes(key) || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.repeat || pm.modal || !lastPointer) return;
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  const under = document.elementFromPoint(lastPointer.x, lastPointer.y);
  if (!under || !main.contains(under)) return;
  const card = key === 'f' ? null : under.closest?.('.pm .ac[data-card], .pm .flipcard[data-card]');
  if (card) {
    const c = record?.chars.find(x => x.id === card.dataset.char), id = Number(card.dataset.card), dest = { d: 'discard', l: 'lost', a: 'active' }[key];
    if (!c || !c.deck.includes(id) || zoneOf(c, id) === dest) return;
    e.preventDefault(); commit(ed.moveCard(record, c.id, id, dest)); return;
  }
  const item = under.closest?.('.pm .it[data-itemstate]');
  if (item && key === 'f') {
    const c = record?.chars.find(x => x.id === item.dataset.char), mine = c?.items.find(x => String(x.id) === item.dataset.id);
    if (!mine || !itemBackUrl(ITEMS.find(x => String(x.id) === item.dataset.id))) return;
    e.preventDefault(); flipItem(c.id, item.dataset.id, !mine.f); return;
  }
  if (item && key !== 'a') {
    const c = record?.chars.find(x => x.id === item.dataset.char);
    const cur = c?.items.find(x => String(x.id) === item.dataset.id)?.s || 0;
    const target = key === 'd' ? (cur === 1 ? 0 : 1) : 2;      // D toggles available and spent; L sets consumed
    if (!c || cur === target) return;
    e.preventDefault(); commit(ed.setItemState(record, c.id, item.dataset.id, target)); return;
  }
  // Attack modifiers: D on a deck stack draws one card to the discard (as a click does); D on a placed card discards it
  const amd = under.closest?.('.pm .amv .mini[data-k], .pm .amv .stk[data-k][data-z="deck"]'), c = pmChar();
  if (amd && key === 'd' && c && !pm.amEdit) {
    e.preventDefault();
    if (amd.classList.contains('stk')) amdDo(c, 'draw', amd.dataset.k);
    else amdDo(c, 'move', amd.dataset.k, { from: amd.dataset.z, to: 'disc', idx: Number(amd.dataset.i) });
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
  if (q('[data-bgreset]')) { ask({ title: 'New scenario', text: 'Put every battle goal back into the deck?', ok: 'Put back' }).then(yes => { if (yes && record) commit(ed.returnAllBattleGoals(record)); }); return true; }
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
  pm.sheet = null; pm.mkIdx = -1;
  if (key.startsWith('i:')) { pm.itemId = key.slice(2); pm.modal = 'item'; } else { pm.mkKey = key; pm.modal = 'cardmk'; }
  render();
}
const mkPct = (card, e, clamp = true) => { const r = card.getBoundingClientRect(), f = v => (clamp ? Math.min(100, Math.max(0, v)) : v); return { x: f(((e.clientX - r.left) / r.width) * 100), y: f(((e.clientY - r.top) / r.height) * 100) }; };
const mkOver = (card, e) => { const r = card.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
let mkBlock = false;
main.addEventListener('click', e => {
  const q = sel => e.target.closest?.(sel), c = pmChar();
  if (!c) return;
  const more = q('[data-cardmore]');
  if (more) { e.stopImmediatePropagation(); e.preventDefault(); const card = more.closest('.ac') || more.parentElement, r = more.getBoundingClientRect(); openMenuFor(card, r.right, r.bottom); return; }
  const h = q('.pm .tkh, .pm .opts [data-mkopen]');
  if (h) { e.stopImmediatePropagation(); e.preventDefault(); openMarkers(h.dataset.mkopen); return; }
  const hc = q('.pm .fan6 .ac, .pm .activelist .ac');                                                    // a click opens the card modal
  if (hc && !pm.modal && !q('.tk, .inib')) { e.stopImmediatePropagation(); openMarkers(`c:${hc.dataset.card}`); return; }
  if (!q('.pm .mmodal')) return;
  const pick = q('[data-mkpick]');
  if (pick) { e.stopImmediatePropagation(); if (!mkBlock) { pm.mkSel = { k: pick.dataset.mkpick, s: Number(pick.dataset.s) }; render(); } return; }
  const clr = q('[data-mkclear]');
  if (clr) { e.stopImmediatePropagation(); pm.mkIdx = -1; commit(ed.clearMarkers(record, c.id, clr.dataset.mkclear)); return; }
  const key = mkKeyNow(), nudge = q('[data-mknudge]'), rm = q('[data-mkremove]');
  if ((nudge || rm) && key && pm.mkIdx >= 0) {
    e.stopImmediatePropagation();
    const m = c.mk?.[key]?.[pm.mkIdx];
    if (!m) return;
    if (rm) { const i = pm.mkIdx; pm.mkIdx = -1; commit(ed.removeMarker(record, c.id, key, i)); render(); return; }
    const [dx, dy] = nudge.dataset.mknudge.split(',').map(Number);
    commit(ed.moveMarker(record, c.id, key, pm.mkIdx, Math.min(100, Math.max(0, m.x + dx)), Math.min(100, Math.max(0, m.y + dy)))); return;
  }
  const placed = q('.pm .itcard .tk');
  if (placed) { e.stopImmediatePropagation(); pm.mkIdx = pm.mkIdx === Number(placed.dataset.i) ? -1 : Number(placed.dataset.i); render(); return; }   // tap a marker to select it
  const card = q('.pm .itcard[data-mkcard]');
  if (card && !q('.tk')) {
    e.stopImmediatePropagation();
    const sel = mkSelOf(c);
    if (sel.s && card.dataset.mkcard.startsWith('i:')) return;                      // items take tokens only
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
      const s = drag.tk.style;                                                        // fixed while dragging: it may leave the card (and the clipped modal box)
      if (s.position !== 'fixed') { s.width = `${drag.tk.getBoundingClientRect().width}px`; s.position = 'fixed'; s.zIndex = '999'; }
      s.left = `${e.clientX}px`; s.top = `${e.clientY}px`;
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

// Character switcher in the top bar: the name opens a list of the characters; a click elsewhere or Escape closes it.
main.addEventListener('click', e => {
  const q = sel => e.target.closest?.(sel);
  if (q('.chlist') || q('[data-charedit]')) return;                                   // list entries and the pencil do their own thing
  if (q('.pm .hud .who')) { e.stopImmediatePropagation(); pm.chMenu = !pm.chMenu; render(); return; }       // the whole name box opens the list
  if (q('.pm .hud .portrait')) {                                                       // the portrait switches to the next character
    const ids = (record?.chars || []).map(c => c.id), i = ids.indexOf(currentSub());
    e.stopImmediatePropagation();
    if (ids.length > 1) { sub = ids[(i + 1) % ids.length]; pm.chMenu = false; render(); try { localStorage.setItem('havenmap.campaign.sub', sub); } catch { /* ignore */ } }
    return;
  }
  if (pm.chMenu) { pm.chMenu = false; render(); }
}, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && pm.chMenu) { pm.chMenu = false; render(); e.stopImmediatePropagation(); } }, true);

// The classes a character can switch to: its own, and the classes nobody plays that are available in this campaign and unlocked.
function charClassOptions(c) {
  const open = new Set(record.cls.map(n => n.toLowerCase())), avail = availableSet(record);
  const own = classByName(c.cls);
  return [...(own ? [own] : []), ...ed.availableClasses(record).filter(k => open.has(k.name.toLowerCase()) && avail.has(k.name.toLowerCase()))]
    .map(k => ({ name: k.name, locked: false }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
// Edit character modal: name, player, class and event traits are drafted in pm.cf and saved together. Another class resets what belongs to the class (ed.changeCharacterClass).
main.addEventListener('click', e => {
  const q = sel => e.target.closest?.(sel), c = pmChar();
  if (!c) return;
  if (q('[data-charedit]') && !pm.modal) { e.stopImmediatePropagation(); pm.cf = { name: c.name, seat: c.seat ?? '', cls: c.cls, special: [...(c.special || [])], orig: { name: c.name, seat: c.seat ?? '', special: [...(c.special || [])] } }; pm.modal = 'char'; render(); return; }
  if (pm.modal !== 'char' || !pm.cf) return;
  const x = q('[data-cfx]');
  if (x) { e.stopImmediatePropagation(); pm.cf.special = pm.cf.special.filter(k => k !== x.dataset.cfx); render(); return; }
  if (q('[data-cfsave]')) {
    e.stopImmediatePropagation();
    const f = pm.cf; let r = record;
    if (f.cls && f.cls !== c.cls) { r = ed.changeCharacterClass(r, c.id, f.cls); delete pm.hsel[c.id]; }       // the name and player in the form are the reset ones unless edited after
    r = ed.renameCharacter(r, c.id, f.name); r = ed.setCharacterPlayer(r, c.id, f.seat);
    for (const t of SPECIAL_TRAITS) r = ed.setSpecialTrait(r, c.id, t.key, f.special.includes(t.key));
    pm.modal = null; pm.cf = null; commit(r); render();
  }
}, true);
main.addEventListener('input', e => { const f = e.target.closest?.('[data-cf]'); if (f && pm.cf) pm.cf[f.dataset.cf] = f.value; });
main.addEventListener('change', e => {
  const a = e.target.closest?.('[data-cfadd]');
  if (a && pm.cf && a.value) { pm.cf.special.push(a.value); render(); }
  if (e.target.matches?.('[data-cf="cls"]') && pm.cf) {                                              // another class: the name, the player and the event traits start over (the old ones come back with the old class)
    const c = pmChar(), back = c && e.target.value === c.cls;
    pm.cf.cls = e.target.value; pm.cf.name = back ? pm.cf.orig.name : e.target.value; pm.cf.seat = back ? pm.cf.orig.seat : ''; pm.cf.special = back ? [...pm.cf.orig.special] : []; render();
  }
});

// Large previews docked beside the open modal, on the side set in the display settings (the other side when there is no room). Returns the width used.
const previewW = () => Math.min(({ s: 270, m: 340, l: 420, xl: 500 })[pmset.size] || 340, (innerHeight - 40) * 5 / 7);
function dockPreview(el, w) {
  const box = main.querySelector('.pm .mmodalbox'), rect = box ? box.getBoundingClientRect() : { left: 0, right: 0 };
  const roomL = rect.left - 36, roomR = innerWidth - rect.right - 36;
  let right = pmset.place === 'right';
  if ((right ? roomR : roomL) < 140 && (right ? roomL : roomR) > (right ? roomR : roomL)) right = !right;
  const room = right ? roomR : roomL, ww = Math.max(120, Math.min(w, room));
  const left = room < 120 ? Math.max(18, rect.left + 18) : right ? Math.min(innerWidth - ww - 18, rect.right + 18) : Math.max(18, rect.left - ww - 18);
  el.style.left = `${left}px`; el.style.right = 'auto';
  return ww;
}

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
  const hc = q('.pm .pcell');                                                                         // a click recovers the card
  if (hc && !q('.rec, .tk') && hc.dataset.pcard) { e.stopImmediatePropagation(); hidePreview(); commit(ed.moveCard(record, c.id, Number(hc.dataset.pcard), 'hand')); return; }
}, true);

// A button with a roll code (data-code): copy it; the icon (and the label of the big roll button) turns into a checkmark for a moment.
function copyCodeButton(cp) {
  (navigator.clipboard ? navigator.clipboard.writeText(cp.dataset.code) : Promise.reject()).catch(() => {});
  if (cp.classList.contains('amcode')) {
    const lb = cp.querySelector('.lbl'), ic = cp.querySelector('svg'), old = lb.textContent, oldIc = ic.outerHTML;
    ic.outerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';   // the same checkmark as the other roll buttons
    cp.classList.add('copied'); lb.textContent = 'Copied';
    setTimeout(() => { cp.classList.remove('copied'); lb.textContent = old; cp.querySelector('svg').outerHTML = oldIc; }, 1500);
    return;
  }
  const old = cp.innerHTML;
  cp.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
  setTimeout(() => { cp.innerHTML = old; }, 900);
}

// Monsters tab (campaign/monstersView.js): every click inside it is handled here and goes no further, so the playmat's handlers (which act
// on the selected character) never see it. Which modifier deck is shown and its edit mode are kept while the page is open.
const monView = { amg: 'm', amEdit: false, amOpen: false };   // amOpen: the modifier dock shows the full deck view
main.addEventListener('click', async e => {
  const q = s => e.target.closest?.(s);
  if (!q('.mon') || !record) return;
  e.stopImmediatePropagation();
  const g = monView.amg === 'a' ? 'a' : 'm', d = sel => q(sel)?.dataset;
  if (q('[data-monlv]')) { commit(ed.monSetLevel(record, scenarioLevel(record) + Number(d('[data-monlv]').monlv))); return; }   // the scenario level, stored as the difficulty
  if (q('[data-monlvauto]')) { commit(ed.monSetLevel(record, null)); return; }
  if (q('[data-monend]')) { commit(ed.monEndRound(record)); return; }
  if (q('[data-monnew]')) { if (await ask({ title: 'New scenario', text: 'Shuffle every ability deck and both modifier decks and start at round 1?', ok: 'Start' })) commit(ed.monNewScenario(record)); return; }
  if (q('[data-monamg]')) { monView.amg = d('[data-monamg]').monamg === 'a' ? 'a' : 'm'; monView.amEdit = false; render(); return; }
  if (q('[data-monimb]')) { commit(ed.monImbue(record, Number(d('[data-monimb]').monimb))); return; }
  if (q('[data-mremove]')) { commit(ed.monRemoveType(record, Number(d('[data-mremove]').mremove))); return; }
  if (q('[data-mshuffle]')) { commit(ed.monDeck(record, d('[data-mshuffle]').mshuffle, 'shuffle')); return; }
  if (q('[data-code]')) { copyCodeButton(q('[data-code]')); return; }
  if (q('[data-mcode]')) { const b = q('[data-mcode]'); if (!b.disabled) copyRollerCode(b, b.dataset.mcode); return; }
  if (q('[data-mdisc]')) { const x = d('[data-mdisc]'); commit(ed.monDeck(record, x.mslug, 'discard', Number(x.mdisc))); return; }
  const card = q('.mab[data-mcard]');
  if (card) { const n = Number(card.dataset.mcard), slug = card.dataset.mslug; commit(ed.monDeck(record, slug, monDeckState(monOf(record), slug).deck.includes(n) ? 'draw' : 'back', n)); return; }
  if (q('[data-monamopen]')) { const open = monView.amOpen || monView.amEdit; monView.amOpen = !open; if (open) monView.amEdit = false; render(); return; }
  if (q('[data-mamdraw]')) { commit(ed.monAm(record, g, 'draw', d('[data-mamdraw]').mamdraw)); return; }
  if (q('.monamhd [data-amact="shuffle"]')) { commit(ed.monAm(record, g, 'shuffle')); return; }
  if (q('.amv [data-amedit]')) { monView.amEdit = !monView.amEdit; render(); return; }
  const amb = q('.amv button[data-amact]');
  if (amb) { if (!amb.disabled) commit(ed.monAm(record, g, amb.dataset.amact, amb.dataset.key, amOpts(amb.dataset))); return; }
  if (monView.amEdit) return;
  const stk = q('.amv .stk[data-k][data-z="deck"]');
  if (stk && !q('.stkctl')) { commit(ed.monAm(record, g, 'draw', stk.dataset.k)); return; }
  const mini = q('.amv .mini[data-k]');
  if (mini) { commit(ed.monAm(record, g, 'move', mini.dataset.k, { from: mini.dataset.z, to: 'disc', idx: Number(mini.dataset.i) })); return; }
}, true);
main.addEventListener('change', e => {
  const sel = e.target.closest?.('.mon [data-monadd]');
  if (!sel || !sel.value) return;
  e.stopImmediatePropagation();
  commit(ed.monAddType(record, Number(sel.value)));
}, true);

// Attack modifier deck action of a character: an edit of the record (chars[].amd), so it is saved, shared, undone and logged like any
// other edit (the history lines come from changelog.js).
const amOpts = d => ({ from: d.from, to: d.to, idx: d.idx === undefined ? undefined : Number(d.idx), at: d.at === undefined ? undefined : Number(d.at) });
function amdDo(c, kind, key, opts) { commit(ed.charAm(record, c.id, kind, key, opts)); }

// Playmat clicks: flip a played card, the + and - of XP, gold and inherited perks, click on a number to type a value.
const HUD_KEY = { xp: 'xp', gold: 'gold', inh: 'inh' };
main.addEventListener('click', e => {
  const dock = e.target.closest?.('button[data-modal]');
  if (phoneClick(e)) return;
  if (dock) { pm.sheet = null; pm.modal = dock.dataset.modal; render(); return; }
  const dc = pmChar();                                                                                     // the hand editor (Edit button of the hand, the level badge)
  if ((e.target.closest?.('[data-handedit]') || e.target.closest?.('[data-opendeck]')) && dc && !pm.modal) {
    pm.sheet = null; pm.modal = 'deck'; pm.hsel[dc.id] = [...new Set(dc.deck)]; pm.hsArmed = false;
    render(); return;
  }
  if (e.target.closest?.('[data-modalclose]') || e.target.matches?.('.pm .mmodal')) { pm.modal = null; pm.amZoom = null; render(); return; }
  const dch = pmChar();
  if (dch && (deckClick(e, dch) || itemClick(e, dch))) return;
  const pc = e.target.closest?.('[data-perkchk]');
  if (pc && pmChar()) { commit(ed.setPerkChecks(record, pmChar().id, pc.dataset.perkchk)); return; }
  const pb = e.target.closest?.('[data-perkbox]') || e.target.closest?.('[data-perkrow]');
  if (pb && pmChar()) { const [i, b] = (pb.dataset.perkbox || pb.dataset.perkrow).split('.').map(Number); commit(ed.togglePerkBox(record, pmChar().id, i, b)); return; }
  const hv = e.target.closest?.('[data-hview]');
  if (hv) { pm.hview = hv.dataset.hview === 'amd' ? 'amd' : 'hand'; if (pm.hview === 'hand') pm.amEdit = false; render(); return; }
  if (e.target.closest?.('[data-amedit]')) { pm.amEdit = !pm.amEdit; render(); return; }
  const stk = e.target.closest?.('.pm .amv .stk[data-k]'), stc = pmChar();
  if (stc && !pm.modal && e.target.closest?.('.pm .amv .discarea')) { pm.modal = 'amdpile'; render(); return; }
  if (stk && stc && !pm.amEdit && !e.target.closest('.stkctl')) { amdDo(stc, 'draw', stk.dataset.k); return; }
  const mini = e.target.closest?.('.pm .amv .mini[data-k]');
  if (mini && stc && !pm.amEdit) { amdDo(stc, 'move', mini.dataset.k, { from: mini.dataset.z, to: 'disc', idx: Number(mini.dataset.i) }); return; }
  const amcl = e.target.closest?.('.pm .amcell');
  if (amcl && stc && !e.target.closest('.rec')) { amdDo(stc, 'ret', amcl.dataset.amcell); return; }
  const amb = e.target.closest?.('button[data-amact]'), amc = pmChar();
  if (amb && amc) { if (!amb.disabled) amdDo(amc, amb.dataset.amact, amb.dataset.key, amOpts(amb.dataset)); return; }
  const amz = e.target.closest?.('[data-amzoom]');
  if (amz) { pm.amZoom = pm.amZoom === amz.dataset.amzoom ? null : amz.dataset.amzoom; render(); return; }
  if (pm.amZoom) { pm.amZoom = null; render(); }
  const mf = e.target.closest?.('[data-matflip]');
  if (mf) { pm.matSide = pm.matSide === 'back' ? 'front' : 'back'; render(); return; }
  const jt = e.target.closest?.('[data-jtab]');
  if (jt) { pm.jtab = jt.dataset.jtab; render(); return; }
  const jc = pmChar();
  if (jc && journalClick(e, jc)) return;
  const cp = e.target.closest?.('[data-code]');
  if (cp) { copyCodeButton(cp); return; }
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
    const text = bgg.dataset.bgg === 'turn' ? turnPost(c, ctx) : cardsPost(c, ctx);
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
// In-place zoom of the fan (the other cards use the card preview, campaign/preview.js). A fan card is zoomed to the height of the
// preview (SHARE of the window height for the size S, M, L, XL). A card that is already that big still grows a little
// (ZOOM_MIN) and never gets smaller; a zoomed card stays inside the window.
const ZOOM_MIN = 1.15, ZOOM_MARGIN = 24;
const zoomShare = () => SHARE[pmset.size] || SHARE.m;                                 // the same size as the card preview
function zoomScale(el) {
  const am = el.matches?.('.stk, .mini'), face = am ? el.querySelector('.stkface') : el;
  const w = face.offsetWidth, h = face.offsetHeight;                                                          // layout size: a transform does not change it
  if (!w || !h) return 1;
  const target = zoomShare() * innerHeight;                                                                   // zoomed height of an ability card
  const want = Math.max(ZOOM_MIN, am ? (target * 5 / 7) / w : target / h);                                    // modifier cards are landscape: same width as an ability card
  const fit = Math.min((innerHeight - 2 * ZOOM_MARGIN) / h, (innerWidth - 2 * ZOOM_MARGIN) / w);
  return Math.max(1, Math.min(want, fit));
}
main.addEventListener('mouseover', e => {
  const el = e.target.closest?.('.pm .hand6[data-layout=fan] .fan6 .ac');                                // the fan zooms in place: its size
  if (!el) return;
  if (e.relatedTarget && el.contains(e.relatedTarget)) return;
  el.style.setProperty('--hz', zoomScale(el));
});
// Hold a + or - of the playmat to repeat it (the repeat clicks the button under the pointer, which survives the re-render).
(() => {
  let t, iv, held = false, x = 0, y = 0;
  const stop = () => { clearTimeout(t); clearInterval(iv); };
  main.addEventListener('pointerdown', e => {
    const b = e.target.closest?.('.pm .sp .spc button');
    if (!b || b.disabled || coarse.matches) return;                                    // touch: hold is for the menu, taps for steps
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
  if (next === record) { notify('Cannot add character', 'That character could not be added.'); return; }
  sub = next.chars.at(-1).id;
  commit(next);
});
main.addEventListener('change', e => {
  if (evChange(e)) return;
  if (e.target.id === 'cardStk') { view.cardStk = e.target.checked; render(); return; }
  const k = { flowShow: 'flowShow', flowLane: 'flowLane', scnStatus: 'scnStatus', itemSlot: 'itemSlot', itemShow: 'itemShow', cardType: 'cardType', cardKind: 'cardKind', cardSide: 'cardSide', cardDeck: 'cardDeck', cardMon: 'cardMon', cardMLv: 'cardMLv', cardSlot: 'cardSlot', cardChk: 'cardChk', cardShow: 'cardShow', cardCls: 'cardCls', cardLv: 'cardLv' }[e.target.id];
  if (k === 'flowShow' || k === 'flowLane') { view.flowPos = null; flowRecenter = true; }   // another chart: open at the newest available scenario
  if (k) { view[k] = e.target.value; render(); return; }
  if (editing && e.target.dataset.act && e.target.tagName !== 'BUTTON') apply(e.target);
});
main.addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (editing && b) apply(b);
});
main.addEventListener('input', e => {
  const sk = { scnSearch: 'scnSearch', itemSearch: 'itemSearch', itemGold: 'itemGold', cardSearch: 'cardSearch' }[e.target.id];
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
const displayBox = document.getElementById('displaySettings');
// The Settings popup: profile, campaign file and the playmat's display settings (one place; the display settings are kept in this browser).
const renderDisplay = () => {
  displayBox.innerHTML = displaySettingsHtml(pmset);
};
// Settings tabs: Display, Campaign file, Profile, Shortcuts. The choice is kept while the page is open.
let settingsTab = 'profile';
const showSettingsTab = key => {
  settingsTab = key;
  settingsModal.querySelectorAll('[data-stab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.stab === key)));
  settingsModal.querySelectorAll('[data-spanel]').forEach(s => { s.hidden = s.dataset.spanel !== key; });
};
settingsModal.addEventListener('click', e => { const t = e.target.closest?.('[data-stab]'); if (t) showSettingsTab(t.dataset.stab); });
// Keyboard shortcuts, listed in the Shortcuts tab of the settings. Keep in step with the handlers in app.js and ctxmenu.js.
// A row is [chords, what]: a chord is a list of keys pressed together, alternatives are separate chords. A pointer row is
// { obj, keys: [[key, what], ...] }: the keys that act on the object under the mouse pointer.
const SHORTCUTS = [
  ['General', [
    [[['Ctrl', 'Z']], 'Undo, up to 50 steps (not in a text field)'],
    [[['Esc']], 'Close the popup, modal, menu or preview, one step at a time'],
    [[['Ctrl']], 'Card preview at once, without the hover delay'],
    [[['Z']], 'Pin the card preview; Z or Esc closes it (touch: long press)'],
  ]],
  ['Mercenaries', [
    [[['Space']], 'Switch between Hand and Modifiers (nothing focused)'],
    [[['Right-click'], ['Menu'], ['Shift', 'F10']], 'Context menu of a card, pile, counter or history row'],
    [[['Up'], ['Down'], ['Home'], ['End']], 'Move in the context menu; Tab closes it'],
    [[['Enter'], ['Space']], 'Flip the focused played card'],
  ]],
  ['Under the pointer', [
    { obj: 'Ability card', keys: [['D', 'Discard'], ['L', 'Lost'], ['A', 'Active area']] },
    { obj: 'Item', keys: [['D', 'Spent or available'], ['L', 'Consumed'], ['F', 'Flip (items with a back)']] },
    { obj: 'Modifier card', keys: [['D', 'Discard (deck: draw one)']] },
  ]],
  ['Notes and fields', [
    [[['Ctrl', 'B']], 'Bold in the notes'],
    [[['Ctrl', 'I']], 'Italic in the notes'],
    [[['Enter']], 'Continue a list in the notes; an empty item ends it'],
    [[['Enter']], 'Save an inline edit'],
    [[['Esc']], 'Cancel an inline edit'],
  ]],
  ['Events and flowchart', [
    [[['Enter'], ['Space']], 'Choose an event option, or open a scenario'],
    [[['Right-drag'], ['Drag background'], ['Space', 'Drag']], 'Pan the flowchart'],
    [[['Ctrl', 'Wheel']], 'Flowchart size, around the pointer'],
  ]],
];
const renderShortcuts = () => {
  // one panel per group; the panels flow into one or two columns (CSS columns), a panel never splits
  const kbd = k => `<kbd>${esc(k)}</kbd>`;
  const row = r => r.obj
    ? `<div class="krow setline kobj"><span class="kname">${esc(r.obj)}</span><span class="kacts">${r.keys.map(([k, w]) => `<span class="kact">${kbd(k)} ${esc(w)}</span>`).join('')}</span></div>`
    : `<div class="krow setline"><span class="kkeys">${r[0].map(ch => `<span class="kchord">${ch.map(kbd).join('<span class="kplus">+</span>')}</span>`).join('<span class="keyor">or</span>')}</span><span class="kwhat">${esc(r[1])}</span></div>`;
  document.getElementById('keyList').innerHTML = SHORTCUTS.map(([group, rows]) => `<section class="keygroup setcard"><h4>${esc(group)}</h4>${rows.map(row).join('')}</section>`).join('');
};
renderShortcuts();
const openSettings = () => { renderDisplay(); renderShare(); showSettingsTab(isPhone() && settingsTab === 'keys' ? 'display' : settingsTab); settingsModal.hidden = false; };   // the phone has no Shortcuts tab
settingsModal.addEventListener('click', e => {
  const sg = e.target.closest?.('.setpanel .seg button');
  if (sg) pmset[sg.parentElement.dataset.set] = sg.dataset.v;
  else if (e.target.closest?.('[data-setreset]')) pmset = cleanSettings(null);
  else return;
  saveSet(); renderDisplay(); render();
});
settingsModal.addEventListener('change', e => {
  if (e.target.matches?.('.setpanel [data-flag]')) pmset[e.target.dataset.flag] = e.target.checked;
  else return;
  saveSet(); renderDisplay(); render();
});
const closeSettings = () => { settingsModal.hidden = true; adminKey = ''; adminLink = ''; };
document.getElementById('settingsOpen').addEventListener('click', openSettings);
document.getElementById('settingsClose').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !settingsModal.hidden) closeSettings(); });

// Settings, Campaign tab: the shared campaign (status, Leave) and the admin tools (upload, invite links, revoke). The admin key is
// kept in memory while the settings are open, never stored.
let adminKey = '', adminLink = '', adminTokens = null;
const shareBox = document.getElementById('shareBox'), adminBox = document.getElementById('adminBox');
function renderShare() {
  document.getElementById('clear').hidden = !!srv;
  shareBox.innerHTML = srv
    ? `<div class="setline"><span class="setlab">Campaign</span><span class="setctl"><b>${esc(srv.cid)}</b><span class="hint">${esc(syncEl.textContent || '')}</span><button type="button" class="btn" data-leave>Leave</button></span></div>`
    : '<div class="setline"><span class="setlab">Campaign</span><span class="setctl"><span class="hint">This browser only</span></span></div>';
  if (!adminKey) {
    adminBox.innerHTML = `<form class="setline" data-adminunlock><span class="setlab">Admin key</span><span class="setctl"><input type="password" class="txt" id="adminKeyIn" autocomplete="off"><button type="submit" class="btn">Unlock</button></span></form>`;
    return;
  }
  const lock = '<button type="button" class="btn" data-adminlock>Lock</button>';
  if (!srv) {
    adminBox.innerHTML = `<form class="setline" data-upload><span class="setlab">Upload this campaign</span><span class="setctl"><input type="text" class="txt" id="uploadCid" placeholder="campaign id, e.g. gh2e" pattern="[a-z0-9\-]{3,40}" required><button type="submit" class="btn"${record ? '' : ' disabled'}>Upload</button>${lock}</span></form>`;
    return;
  }
  const rows = (adminTokens || []).map(t => `<div class="setline"><span class="setlab">${esc(t.label || '(no name)')}</span><span class="setctl"><span class="hint">${esc(t.role)}</span><button type="button" class="btn" data-revoke="${esc(t.id)}">Revoke</button></span></div>`).join('');
  adminBox.innerHTML = `${adminTokens ? rows || '<div class="setline"><span class="hint">No invite links yet.</span></div>' : '<div class="setline"><span class="hint">Loading...</span></div>'}
    <form class="setline" data-invite><span class="setlab">New invite link</span><span class="setctl"><input type="text" class="txt" id="inviteName" placeholder="Player name" maxlength="40" required><button type="submit" class="btn">Create</button>${lock}</span></form>
    ${adminLink ? `<div class="setline"><span class="setlab">Link</span><span class="setctl"><input type="text" class="txt" id="inviteLink" readonly value="${esc(adminLink)}"><button type="button" class="btn" data-copylink>Copy</button></span></div>` : ''}`;
  if (!adminTokens) loadTokens();
}
async function loadTokens() {
  try {
    const r = await api('GET', `/c/${srv.cid}/tokens`, adminKey);
    if (r.status !== 200) { adminKey = ''; renderShare(); await notify('Admin key', 'The key was not accepted.'); return; }
    adminTokens = r.data; renderShare();
  } catch { await notify('Shared campaign', 'The server cannot be reached.'); }
}
settingsModal.addEventListener('submit', async e => {
  const f = e.target;
  if (f.matches('[data-adminunlock]')) { e.preventDefault(); adminKey = document.getElementById('adminKeyIn').value.trim(); adminTokens = null; adminLink = ''; renderShare(); return; }
  if (f.matches('[data-upload]')) {
    e.preventDefault();
    const cid = document.getElementById('uploadCid').value.trim();
    try {
      const r = await api('POST', '/c', adminKey, { cid, record });
      if (r.status !== 201) { await notify('Upload', r.data?.error || `HTTP ${r.status}`); return; }
      const t = await api('POST', `/c/${cid}/tokens`, adminKey, { role: 'player', label: userName() });   // this browser joins with its own player token
      if (t.status !== 201) { await notify('Upload', t.data?.error || `HTTP ${t.status}`); return; }
      saveConn({ cid, token: t.data.token });
      srv = { cid, token: t.data.token, ver: r.data.ver, base: record, timer: 0, busy: false, again: false, by: null, t: Date.now() };
      cacheSrv(); setSync('ok'); adminTokens = null; renderShare();
    } catch { await notify('Upload', 'The server cannot be reached.'); }
    return;
  }
  if (f.matches('[data-invite]')) {
    e.preventDefault();
    const name = document.getElementById('inviteName').value.trim();
    try {
      const r = await api('POST', `/c/${srv.cid}/tokens`, adminKey, { role: 'player', label: name });
      if (r.status !== 201) { await notify('Invite link', r.data?.error || `HTTP ${r.status}`); return; }
      adminLink = inviteUrl(location.href, srv.cid, r.data.token, name); adminTokens = null; renderShare();
    } catch { await notify('Invite link', 'The server cannot be reached.'); }
  }
});
settingsModal.addEventListener('click', async e => {
  if (e.target.closest('[data-adminlock]')) { adminKey = ''; adminLink = ''; adminTokens = null; renderShare(); return; }
  if (e.target.closest('[data-copylink]')) { const i = document.getElementById('inviteLink'); i.select(); try { await navigator.clipboard.writeText(i.value); e.target.textContent = 'Copied'; } catch { /* selected for Ctrl+C */ } return; }
  const rv = e.target.closest('[data-revoke]')?.dataset.revoke;
  if (rv) {
    if (!await ask({ title: 'Revoke invite link', text: 'The player of this link loses access to the shared campaign.', ok: 'Revoke', danger: true })) return;
    try { await api('DELETE', `/c/${srv.cid}/tokens/${rv}`, adminKey); } catch { /* shown by the reload */ }
    adminTokens = null; renderShare(); return;
  }
  if (e.target.closest('[data-leave]')) {
    if (!await ask({ title: 'Leave shared campaign', text: 'This browser keeps a copy of the campaign and stops sharing. You need an invite link to join again.', ok: 'Leave' })) return;
    await pushNow();
    clearConn(); clearTimeout(srv?.timer); srv = null; setSync('ok');
    if (record) localStore.save(record);
    renderShare();
  }
});

document.getElementById('file').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const next = await localStore.importFile(f);
    if (srv && !await ask({ title: 'Load file', text: 'Replace the shared campaign for all players with this file?', ok: 'Replace', danger: true })) { e.target.value = ''; return; }
    history.length = 0;
    record = next;
    persist();
  } catch (err) { await notify('Could not read the file', err.message); }
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
  if (!record) return;
  if (!await ask({ title: 'Clear campaign', text: 'Remove the campaign from this browser? Export it first if you need it.', ok: 'Remove', danger: true })) return;
  await localStore.clear();
  record = null;
  history.length = 0;
  editPages.clear();
  render();
  closeSettings();
});

(async () => {
  evInit({ render, record: () => record, commit, editing: () => editing });
  const inv = parseInvite(location.hash);                                              // an invite link: join, then clean the address bar
  if (inv) {
    saveConn(inv);
    try { if (inv.name && !(localStorage.getItem(USER_KEY) || '').trim()) { localStorage.setItem(USER_KEY, inv.name); userInput.value = inv.name; } } catch { /* ignore */ }
    window.history.replaceState(null, '', location.pathname + location.search);
  }
  const conn = loadConn();
  record = conn ? await startShared(conn) : await localStore.load();
  try {
    const t = localStorage.getItem('havenmap.campaign.tab');
    if (PAGE_TABS.includes(t)) tab = t;
    sub = localStorage.getItem('havenmap.campaign.sub') || '';
    loadView();
  } catch { /* ignore */ }
  render();
})();

// Modifiers view (replaces the hand): drag a stack or a placed card between deck, top, bottom, active and discard; a click sends one card to the discard.
(() => {
  let drag = null;
  const LISTS = ['top', 'bot', 'act'], ZONE = { deck: 'pool', disc: 'disc', top: 'top', bot: 'bot', act: 'act' };
  const clear = () => main.querySelectorAll('.amv .drop').forEach(x => x.classList.remove('drop'));
  const dragOf = st => { const mini = st.classList.contains('mini'); return { k: st.dataset.k, from: mini ? st.dataset.z : ZONE[st.dataset.z], idx: mini ? Number(st.dataset.i) : undefined }; };
  const ok = a => drag && a && (ZONE[a.dataset.amdrop] !== drag.from || LISTS.includes(drag.from));
  // the drop: the zone, the place among the stack when dropped on a card of the same list
  const doDrop = (a, x, target) => {
    const c = pmChar(), g = a?.closest?.('[data-amg]')?.dataset.amg;     // g: the monster or ally deck of the Monsters tab
    clear();
    if ((!c && !g) || !ok(a)) { drag = null; return; }
    const to = ZONE[a.dataset.amdrop], m = target?.closest?.('.amv .mini');
    let at;
    if (m && m.dataset.z === to) { const r = m.getBoundingClientRect(); at = Number(m.dataset.i) + (x > r.left + r.width / 2 ? 1 : 0); }
    const d = drag; drag = null;
    if (g) commit(ed.monAm(record, g, 'move', d.k, { from: d.from, to, idx: d.idx, at }));
    else amdDo(c, 'move', d.k, { from: d.from, to, idx: d.idx, at });
  };
  // Drag with pointer events (mouse, touch, pen; the phone too): the mouse picks a stack or a placed card up once it moves 5 px,
  // touch and pen hold briefly first (holding still shows the preview).
  let t = null;
  const zoneAt = (x, y) => document.elementFromPoint(x, y)?.closest?.('.amv [data-amdrop]');
  main.addEventListener('pointerdown', e => {
    if (e.button || pm.modal || t || e.target.closest('button, .amv.editing')) return;
    const st = e.target.closest?.('.amv .stk[data-k], .amv .mini[data-k]');
    if (!st) return;
    const mouse = e.pointerType === 'mouse';
    t = { st, mouse, x: e.clientX, y: e.clientY, id: e.pointerId, G: null, armed: mouse };
    if (!mouse) t.timer = setTimeout(() => { if (t && t.st === st) { t.armed = true; st.classList.add('armed'); navigator.vibrate?.(8); } }, 220);
  });
  main.addEventListener('touchmove', e => { if (t && t.armed) e.preventDefault(); }, { passive: false });
  window.addEventListener('pointermove', e => {
    if (!t || e.pointerId !== t.id) return;
    if (!t.G) {
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) < (t.mouse ? 5 : 10)) return;
      if (!t.armed) { clearTimeout(t.timer); t = null; return; }                        // moved before the hold: let the page scroll
      const gb = modGhostBody(t.st);
      if (!gb) { t = null; return; }
      t.G = ghostStart(gb.body, 'mod', gb.ar, t.st.querySelector('.stkface') || t.st, t.x, t.y);
      t.st.classList.add('dragging'); drag = dragOf(t.st);
    }
    e.preventDefault();
    ghostMove(t.G, e.clientX, e.clientY);
    clear();
    const z = zoneAt(e.clientX, e.clientY);
    if (ok(z)) z.classList.add('drop');
  });
  const end = (e, cancel) => {
    if (!t || (e && e.pointerId !== t.id)) return;
    const d = t; t = null; clearTimeout(d.timer); d.st.classList.remove('armed');
    if (!d.G) return;
    swallowNextClick();
    const z = !cancel && e?.type === 'pointerup' ? zoneAt(e.clientX, e.clientY) : null;
    ghostEnd(d.G, ok(z));
    d.st.classList.remove('dragging');
    if (z) doDrop(z, e.clientX, document.elementFromPoint(e.clientX, e.clientY));
    else { clear(); drag = null; }
  };
  window.addEventListener('pointerup', e => end(e)); window.addEventListener('pointercancel', e => end(e, true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && t?.G) { e.preventDefault(); e.stopImmediatePropagation(); end(null, true); } }, true);
})();

// Space switches the hand and the modifier deck (not while typing, on a button or link, or with a modal open).
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.repeat || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || pm.modal || !main.querySelector('.pm .hand6')) return;
  if (e.target.closest?.('input, textarea, select, button, a, [contenteditable], [role="button"], .flipcard')) return;
  e.preventDefault();
  pm.hview = pm.hview === 'amd' ? 'hand' : 'amd';
  if (pm.hview === 'hand') pm.amEdit = false;
  render();
});

// A button clicked with the mouse gives up its focus, so Space keeps switching the hand and the modifiers instead of pressing that button again.
main.addEventListener('click', e => { if (e.detail > 0) e.target.closest?.('.pm button')?.blur(); }, true);

// Items tab: give a copy of an item to a character (it joins the owned items), or take it back to the shop.
main.addEventListener('change', e => {
  const g = e.target.closest?.('[data-giveitem]');
  if (g && g.value) commit(ed.itemCost(g.dataset.giveitem) === null ? ed.giveItem(record, g.value, g.dataset.giveitem) : ed.buyItem(record, g.value, g.dataset.giveitem));
});
main.addEventListener('click', e => {
  const b = e.target.closest?.('[data-returnitem]');
  if (!b) return;
  const [cid, id] = b.dataset.returnitem.split('|');
  e.stopImmediatePropagation();
  commit(ed.returnItem(record, cid, id));
}, true);

// Inventory dialog: Enter or Space on a focused card equips it, as a click does.
main.addEventListener('keydown', e => { const k = e.target.closest?.('.pcard.eqable[data-isel]'); if (k && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); k.click(); } });
