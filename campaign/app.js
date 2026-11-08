// Read-only campaign view: loads a campaign record (JSON file or the browser's saved copy) and shows it.
// Editing, session start/commit and the server come later (docs/campaign-schema.md section 10).
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

const TABS = ['Overview', 'Scenarios', 'Characters', 'Items', 'Events'];
const main = document.getElementById('main');
const tabsEl = document.getElementById('tabs');
let record = null;
let tab = TABS[0];
const view = { scnStatus: '', scnSearch: '', itemSlot: '', itemShow: 'all' };

const cardById = new Map(CARDS.map(c => [c.id, c]));
const itemById = new Map(ITEMS.map(i => [i.id, i]));
const pretty = slug => String(slug ?? '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const chip = (text, cls = '') => `<span class="chip ${cls}">${esc(text)}</span>`;
const kv = (k, v) => `<div class="kv"><span>${esc(k)}</span><span>${esc(v)}</span></div>`;
const none = '<div class="empty">none</div>';

// --- tabs -----------------------------------------------------------------------------------------------

function renderTabs() {
  tabsEl.innerHTML = TABS.map(t => `<button type="button" role="tab" aria-selected="${t === tab}" data-tab="${t}">${t}</button>`).join('');
  document.getElementById('title').textContent = record?.name ? `Campaign: ${record.name}` : 'Campaign';
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
  const known = new Set(STICKERS.map(s => s.name.toLowerCase()));
  const goal = id => BATTLE_GOALS.find(g => g.id === id)?.slug ?? id;
  return `
  <div class="grid">
    <div class="card"><h3>Party</h3>${kv('Average level', r.party.avg)}${kv('Difficulty', `${r.party.diffName || ''} (${r.party.diff})`)}
      ${kv('Scenario level', scenarioLevel(r.party))}${kv('Inspiration', r.party.insp)}</div>
    <div class="card"><h3>Prosperity</h3>${kv('Checkmarks', r.pros)}${kv('Level', prosperityLevel(r.pros))}</div>
    <div class="card"><h3>Reputation</h3>
      ${kv('Demons', r.rep.demons)}${repBar(r.rep.demons)}${kv('Merchants', r.rep.merchants)}${repBar(r.rep.merchants)}
      ${kv('City Guard', r.rep.guard)}${repBar(r.rep.guard)}</div>
    <div class="card"><h3>Scenarios</h3>${SCN_STATE_NAME.map((n, i) => kv(n, counts[i] || 0)).join('')}${kv('Total', SCENARIOS.length)}</div>
  </div>
  <h2>Stickers</h2>${r.stk.length ? `<div class="chips">${r.stk.map(s => chip(s, known.has(String(s).toLowerCase()) ? 'ok' : 'warn')).join('')}</div>` : none}
  <h2>Unlocked classes (${r.cls.length})</h2><div class="chips">${r.cls.map(c => chip(c, classByName(c) ? '' : 'warn')).join('')}</div>
  <h2>Players</h2>${r.players.length ? `<div class="chips">${r.players.map(p => chip(p.name)).join('')}</div>` : none}
  <h2>Retired</h2>${r.retired.length ? table(['Class', 'Player', 'Name', 'Lv', 'Perks', 'Masteries'],
    r.retired.map(x => `<tr><td>${esc(x.cls)}</td><td>${esc(x.player ?? '')}</td><td>${esc(x.name ?? '')}</td><td>${esc(x.lv ?? '')}</td><td>${esc(x.perks ?? '')}</td><td>${esc(x.masteries ?? '')}</td></tr>`)) : none}
  <h2>Enhancements (${r.enh.length})</h2>${r.enh.length ? table(['Class', 'Card', 'Top', 'Bottom'],
    r.enh.map(x => `<tr><td>${esc(x.cls)}</td><td>${esc(x.card)}</td><td>${esc(x.top ?? '')}</td><td>${esc(x.bottom ?? '')}</td></tr>`)) : none}
  <h2>Decks</h2><div class="grid">
    <div class="card"><h3>Battle goals drawn (${r.decks.bg.length}/${BATTLE_GOALS.length})</h3><div class="chips">${r.decks.bg.map(id => chip(pretty(goal(id)))).join('')}</div></div>
    <div class="card"><h3>Treasures claimed (${r.decks.tre.length})</h3><div class="chips">${r.decks.tre.map(n => chip(n)).join('')}</div></div>
    <div class="card"><h3>Medical packs (${r.decks.mp.length})</h3><div class="chips">${r.decks.mp.map(n => chip(n)).join('')}</div></div></div>`;
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
    return `<tr><td>${esc(s.n)}</td><td>${esc(s.name)}</td><td>${esc(s.area ?? '')}</td><td class="s${x.s}">${SCN_STATE_NAME[x.s]}</td>
      <td>${esc(x.l ?? '')}</td><td>${esc(x.p ?? '')}</td><td>${esc((x.ch || []).join(', '))}</td><td>${esc(x.d ?? '')}</td>
      <td>${(s.unl || []).map(n => chip(n, stateClass(n))).join('')}</td><td>${unlockedBy(s.n).map(n => chip(n, stateClass(n))).join('')}</td></tr>`;
  }));
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
    return `<div class="card" style="margin-bottom:12px">
      <h3>${esc(c.name)} <span style="color:var(--muted)">${esc(c.cls)} (${cls ? esc(cls.src.toUpperCase()) : '?'}), level ${esc(c.lv)}</span></h3>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">${kv('XP', c.xp ?? '')}${kv('Gold', c.gold ?? '')}${kv('Inherited', c.inh ?? '')}${kv('Hand size', c.hand ?? '')}</div>
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
  }).join('');
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
  return filters + table(['#', 'Item', 'Slot', 'Kind', 'Unlocked', 'Copies', 'In shop', 'With'], rows.map(i => {
    const unl = r.items.unl.includes(i.id);
    return `<tr class="${unl ? '' : 's0'}"><td>${esc(i.id)}</td><td>${esc(pretty(i.slug))}</td><td>${esc(i.slot ?? '')}</td><td>${esc(i.kind)}</td>
      <td>${unl ? 'yes' : ''}</td><td>${esc(i.n)}</td><td>${unl ? shopCopies(r, i) : ''}</td><td>${esc(holders(i.id))}</td></tr>`;
  }));
}

function events(r) {
  const deck = (label, all, st) => {
    const out = new Set(st.out), bottom = new Set(st.bottom), top = new Set(st.top);
    const where = id => out.has(id) ? 'out' : bottom.has(id) ? 'bottom' : top.has(id) ? 'top' : 'in deck';
    return `<h2>${label} events (${all.length - out.size} in the deck, ${out.size} out)</h2>
      <div class="numgrid">${all.map(e => `<span class="${out.has(e.id) ? 'out' : ''}" title="${where(e.id)}">${e.id}</span>`).join('')}</div>`;
  };
  return deck('City', CITY_EVENTS, r.events.city) + deck('Road', ROAD_EVENTS, r.events.road) +
    (r.events.pend ? `<h2>Open event</h2><div class="card">${esc(JSON.stringify(r.events.pend))}</div>` : '');
}

// --- shell ----------------------------------------------------------------------------------------------

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

main.addEventListener('input', e => {
  if (e.target.id !== 'scnSearch') return;
  view.scnSearch = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const box = main.querySelector('#scnSearch');
  box?.focus();
  box?.setSelectionRange(pos, pos);
});
main.addEventListener('change', e => {
  const k = { scnStatus: 'scnStatus', itemSlot: 'itemSlot', itemShow: 'itemShow' }[e.target.id];
  if (!k) return;
  view[k] = e.target.value;
  render();
});

document.getElementById('file').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    record = await localStore.importFile(f);
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
  render();
});

(async () => {
  try { const t = localStorage.getItem('havenmap.campaign.tab'); if (TABS.includes(t)) tab = t; } catch { /* ignore */ }
  record = await localStore.load();
  render();
})();
