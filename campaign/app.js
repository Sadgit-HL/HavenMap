// Campaign view with a simple edit mode. Edits go through scripts/campaign/edit.js (pure functions returning a new
// record); every change is saved to the browser at once and can be undone. Session start/commit, voting and the
// server come later (docs/campaign-schema.md section 10).
import { CARDS } from '../scripts/games/gh2_cards.js';
import { ITEMS } from '../scripts/games/gh2_items.js';
import { SCENARIOS, STICKERS } from '../scripts/games/gh2_scenarios.js';
import { CITY_EVENTS, ROAD_EVENTS } from '../scripts/games/gh2_events.js';
import { BATTLE_GOALS } from '../scripts/games/battle_goals.js';
import { escapeHtml as esc } from '../scripts/escape.js';
import { localStore } from '../scripts/campaign/store.js';
import {
  validate, scenarioLevel, prosperityLevel, handOf, shopCopies, unlockedBy, classByName, SCN_STATE_NAME,
} from '../scripts/campaign/record.js';
import * as ed from '../scripts/campaign/edit.js';

const TABS = ['Overview', 'Scenarios', 'Characters', 'Items', 'Events'];
const main = document.getElementById('main');
const tabsEl = document.getElementById('tabs');
const editBtn = document.getElementById('edit');
const undoBtn = document.getElementById('undo');
let record = null;
let tab = TABS[0];
let editing = false;
const history = [];                                   // earlier records for undo, newest last
const view = { scnStatus: '', scnSearch: '', itemSlot: '', itemShow: 'all' };

const cardById = new Map(CARDS.map(c => [c.id, c]));
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

function renderTabs() {
  tabsEl.innerHTML = TABS.map(t => `<button type="button" role="tab" aria-selected="${t === tab}" data-tab="${t}">${t}</button>`).join('');
  document.getElementById('title').textContent = record?.name ? `Campaign: ${record.name}` : 'Campaign';
  editBtn.textContent = editing ? 'Done editing' : 'Edit';
  editBtn.setAttribute('aria-pressed', String(editing));
  editBtn.disabled = !record;
  undoBtn.disabled = !history.length;
}
tabsEl.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]')?.dataset.tab;
  if (!t) return;
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

function scenarios(r) {
  const q = view.scnSearch.toLowerCase();
  const rows = SCENARIOS.filter(s => {
    const st = r.scn[String(s.n)]?.s ?? 0;
    if (view.scnStatus !== '' && String(st) !== view.scnStatus) return false;
    return !q || `${s.n} ${s.name} ${s.area || ''}`.toLowerCase().includes(q);
  });
  const stateClass = n => { const s = r.scn[String(n)]?.s ?? 0; return s === 2 ? 'ok' : s === 1 ? 'info' : 'dim'; };
  const filters = `<div class="filters">
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

function characters(r) {
  if (!r.chars.length) return '<div class="empty">No characters in this campaign file.</div>';
  return r.chars.map(c => {
    const cls = classByName(c.cls);
    const cardChip = id => {
      const state = c.lost.includes(id) ? 'lost' : c.act.includes(id) ? 'active' : c.disc.includes(id) ? 'discard' : 'hand';
      const css = { lost: 'bad', active: 'info', discard: 'warn', hand: 'ok' }[state];
      return `<span class="chip ${css}" title="${state}">${esc(pretty(cardById.get(id)?.slug ?? id))}</span>`;
    };
    const faces = c.am?.faces || [];
    const inDeck = faces.filter(f => !f.out).length;
    const stat = (label, key, max) => kv(label, val(true, c[key] ?? '', num('char', key, c[key], { min: key === 'lv' ? 1 : 0, max, id: c.id, width: 64 })));
    return `<div class="card" style="margin-bottom:12px">
      <h3>${esc(c.name)} <span style="color:var(--muted)">${esc(c.cls)} (${cls ? esc(cls.src.toUpperCase()) : '?'})</span></h3>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">${stat('Level', 'lv', 9)}${stat('XP', 'xp', 9999)}${stat('Gold', 'gold', 9999)}${stat('Inherited', 'inh', 9999)}${kv('Hand size', esc(c.hand ?? ''))}</div>
      <div class="pile"><b>Traits</b>${(c.traits || []).map(t => chip(t)).join('')}${(c.extra || []).map(t => chip(t, 'dim')).join('')}</div>
      <div class="pile"><b>Deck (${c.deck.length})</b> hand ${handOf(c).length}, discard ${c.disc.length}, active ${c.act.length}, lost ${c.lost.length}</div>
      <div class="chips">${c.deck.map(cardChip).join('')}</div>
      <div class="pile"><b>Other owned cards (${c.bench.length})</b></div>
      <div class="chips">${c.bench.map(id => chip(pretty(cardById.get(id)?.slug ?? id), 'dim')).join('')}</div>
      <div class="pile"><b>Items (${c.items.length})</b></div>
      <div class="chips">${c.items.map(it => `<span class="chip ${(it.st || []).some(Boolean) ? 'warn' : ''}" title="tick states ${esc((it.st || []).join('/'))}">${esc(pretty(itemById.get(it.id)?.slug ?? it.id))}</span>`).join('')}</div>
      <div class="pile"><b>Modifier deck</b> ${inDeck} of ${faces.length} cards in the deck${c.am?.n != null ? ` (sheet count ${esc(c.am.n)})` : ''}</div>
      <div class="chips">${faces.map(f => `<span class="chip ${f.out ? 'dim' : ''}">${esc(f.f)}</span>`).join('')}</div>
    </div>`;
  }).join('') + (editing ? '<p class="hint">Cards, items and the modifier deck are not editable here yet.</p>' : '');
}

function items(r) {
  const slots = [...new Set(ITEMS.map(i => i.slot).filter(Boolean))].sort();
  const rows = ITEMS.filter(i => {
    if (view.itemSlot && i.slot !== view.itemSlot) return false;
    if (view.itemShow === 'unlocked' && !r.items.unl.includes(i.id)) return false;
    if (view.itemShow === 'shop' && shopCopies(r, i) === 0) return false;
    return true;
  });
  const filters = `<div class="filters"><select id="itemSlot"><option value="">All slots</option>${slots.map(s => `<option ${view.itemSlot === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
    <select id="itemShow">${[['all', 'All items'], ['unlocked', 'Unlocked'], ['shop', 'In the shop']].map(([v, l]) => `<option value="${v}" ${view.itemShow === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`;
  const holders = id => r.chars.filter(c => c.items.some(i => i.id === id)).map(c => c.name).join(', ');
  return filters + table(['#', 'Item', 'Slot', 'Kind', 'Unlocked', 'Copies', 'In use', 'In shop', 'With'], rows.map(i => {
    const unl = r.items.unl.includes(i.id);
    const unlCell = editing ? `<input type="checkbox" data-act="itemUnl" data-id="${esc(i.id)}" ${unl ? 'checked' : ''}>` : (unl ? 'yes' : '');
    const used = r.items.taken[String(i.id)] || 0;
    const usedCell = unl ? val(true, used, num('itemTaken', 'taken', used, { min: 0, max: i.n, id: i.id, width: 44 })) : '';
    return `<tr class="${unl ? '' : 's0'}"><td>${esc(i.id)}</td><td>${esc(pretty(i.slug))}</td><td>${esc(i.slot ?? '')}</td><td>${esc(i.kind)}</td>
      <td>${unlCell}</td><td>${esc(i.n)}</td><td>${usedCell}</td><td>${unl ? esc(shopCopies(r, i)) : ''}</td><td>${esc(holders(i.id))}</td></tr>`;
  }));
}

function events(r) {
  const deck = (label, kind, all, st) => {
    const out = new Set(st.out), bottom = new Set(st.bottom), top = new Set(st.top);
    const where = id => out.has(id) ? 'out' : bottom.has(id) ? 'bottom' : top.has(id) ? 'top' : 'in deck';
    const cls = id => ({ out: 'out', bottom: 'bottom', top: 'top' }[where(id)] || '');
    return `<h2>${label} events (${all.length - out.size} in the deck, ${out.size} out, ${bottom.size} bottom, ${top.size} top)</h2>
      <div class="numgrid">${all.map(e => editing
        ? `<button type="button" class="${cls(e.id)}" data-act="event" data-key="${kind}" data-id="${e.id}" title="${where(e.id)}">${e.id}</button>`
        : `<span class="${cls(e.id)}" title="${where(e.id)}">${e.id}</span>`).join('')}</div>`;
  };
  return (editing ? '<p class="hint">Click an event number to move it: in the deck, out, bottom, top.</p>' : '') +
    deck('City', 'city', CITY_EVENTS, r.events.city) + deck('Road', 'road', ROAD_EVENTS, r.events.road) +
    (r.events.pend ? `<h2>Open event</h2><div class="card">${esc(JSON.stringify(r.events.pend))}</div>` : '');
}

// --- render and events ------------------------------------------------------------------------------------

function render() {
  renderTabs();
  if (!record) {
    main.innerHTML = '<div class="empty">No campaign loaded.<br>Use <b>Load file</b> to open a campaign JSON file. It is kept in this browser only.</div>';
    return;
  }
  const issues = validate(record);
  const body = { Overview: overview, Scenarios: scenarios, Characters: characters, Items: items, Events: events }[tab](record);
  main.innerHTML = (issues.length ? `<div class="issues">${issues.length} issue(s): ${esc(issues.slice(0, 5).join('; '))}</div>` : '') + body;
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
    case 'itemUnl': return commit(ed.setItemUnlocked(record, Number(id), v));
    case 'itemTaken': return commit(ed.setItemTaken(record, Number(id), v));
    case 'treasures': return commit(ed.setDeckList(record, 'tre', v));
    case 'deck': return commit(ed.toggleDeckEntry(record, key, Number(id)));
    case 'event': return commit(ed.setEventPlace(record, key, Number(id), ed.nextEventPlace(record, key, Number(id))));
    default: return undefined;
  }
}
main.addEventListener('change', e => {
  const k = { scnStatus: 'scnStatus', itemSlot: 'itemSlot', itemShow: 'itemShow' }[e.target.id];
  if (k) { view[k] = e.target.value; render(); return; }
  if (editing && e.target.dataset.act && e.target.tagName !== 'BUTTON') apply(e.target);
});
main.addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (editing && b) apply(b);
});
main.addEventListener('input', e => {
  if (e.target.id !== 'scnSearch') return;
  view.scnSearch = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const box = main.querySelector('#scnSearch');
  box?.focus();
  box?.setSelectionRange(pos, pos);
});

editBtn.addEventListener('click', () => { editing = !editing; render(); });
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
  editing = false;
  render();
});

(async () => {
  try { const t = localStorage.getItem('havenmap.campaign.tab'); if (TABS.includes(t)) tab = t; } catch { /* ignore */ }
  record = await localStore.load();
  render();
})();
