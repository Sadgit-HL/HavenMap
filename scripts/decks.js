// Monster ability decks: draw/discard state, reshuffle rules, GeekRoller code, and the floating panel.
//
// State (state.decks[slug]):  { deck: [n...], discard: [n...] }
// A missing entry means a full deck with nothing discarded. Cards are identified by their
// number n (1-8) within the deck; the iid (used in the roller code) comes from DECKS.

import { state, patch } from './state.js';
import { DECKS, deckSlugFor, assetPath } from './data.js';
import { uiState, subscribeUI } from './uiState.js';
import {
  AM_TYPES, AM_SPECIAL, amState, amNeedsReshuffle, amDeckTotal, amDraw, amReturn, amAdjust,
  amShuffleNow, amEndRound, amRollerCode,
} from './attackMods.js';

let view = null; // panel content: null (closed), 'abilities' or 'am'

// ─── State helpers ───────────────────────────────────────────────────────────

function cardsOf(slug)  { return DECKS[slug] || []; }
function fullDeck(slug) { return cardsOf(slug).map(c => c.n); }
function cardOf(slug, n) { return cardsOf(slug).find(c => c.n === n); }

export function deckState(slug) {
  const s = state.decks?.[slug];
  return {
    deck:    s?.deck    ?? fullDeck(slug),
    discard: s?.discard ?? [],
  };
}

// Drop entries that equal the default so the share link stays short.
function normalize(slug, ds) {
  const isDefault = ds.deck.length === cardsOf(slug).length && ds.discard.length === 0;
  return isDefault ? null : ds;
}

function withDeck(slug, ds) {
  const next = { ...(state.decks || {}) };
  const n = normalize(slug, ds);
  if (n) next[slug] = n; else delete next[slug];
  return next;
}

// Deck slugs for the monster types currently on the map (in map order).
export function presentSlugs() {
  const slugs = [];
  for (const m of state.monsters || []) {
    const slug = deckSlugFor(m.id);
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }
  return slugs;
}

// Decks to show: those on the map, then off-map decks that hold state (drawn cards), so state is
// never hidden while a monster type is absent. Decks in their default state are omitted when absent.
export function visibleSlugs() {
  const on = presentSlugs();
  const off = Object.keys(state.decks || {}).filter(s => DECKS[s] && !on.includes(s));
  return [...on, ...off];
}

// ─── Actions ─────────────────────────────────────────────────────────────────

// Deck -> discard (any number of cards).
export function discardCard(slug, n) {
  const ds = deckState(slug);
  if (!ds.deck.includes(n)) return;
  patch({ decks: withDeck(slug, {
    deck:    ds.deck.filter(x => x !== n),
    discard: [...ds.discard, n],
  }) });
}

// Discard -> deck (to correct a misclick).
export function returnCard(slug, n) {
  const ds = deckState(slug);
  if (!ds.discard.includes(n)) return;
  patch({ decks: withDeck(slug, {
    deck:    [...ds.deck, n].sort((a, b) => a - b),
    discard: ds.discard.filter(x => x !== n),
  }) });
}

export function shuffleDeck(slug) {
  patch({ decks: withDeck(slug, { deck: fullDeck(slug), discard: [] }) });
}

// A deck reshuffles at end of round if its discard holds a shuffle card or the deck is empty.
function needsReshuffle(slug, ds) {
  return ds.deck.length === 0 || ds.discard.some(n => cardOf(slug, n)?.s);
}

// Called at end of round. Returns the new decks object.
export function endRoundDecks() {
  const next = { ...(state.decks || {}) };
  for (const slug of Object.keys(next)) {
    if (!DECKS[slug]) continue;
    if (needsReshuffle(slug, deckState(slug))) delete next[slug];
  }
  return next;
}

// End-of-round changes to every deck, for one patch() call (one undo step).
export function endRoundPatch() {
  return { decks: endRoundDecks(), am: amEndRound() };
}

// GeekRoller code for the cards still in the deck, e.g. 1custom3{iid:9903036;iid:9903037;iid:9903038}
export function rollerCode(slug) {
  const { deck } = deckState(slug);
  const iids = deck.map(n => `iid:${cardOf(slug, n).iid}`);
  return `1custom${iids.length}{${iids.join(';')}}`;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function deckLabel(slug) {
  return slug.replace(/-/g, ' ');
}

const ICON_DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const ICON_SHUFFLE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

function slotHtml(slug, c, inDeck) {
  const title = `Initiative ${c.init}${c.s ? ', shuffle' : ''}`;
  return `<button class="dk-slot${inDeck ? '' : ' dk-slot--out'}" type="button"
      data-dk-toggle="${slug}" data-dk-n="${c.n}" title="${title}">
    <img src="${assetPath.abilityCard(slug, c.n)}" data-dk-full="${assetPath.abilityCard(slug, c.n)}" alt="card ${c.n}" loading="lazy">
    ${c.s ? '<span class="dk-mark">&#8635;</span>' : ''}
    <span class="dk-init${c.s ? ' dk-init--s' : ''}">${c.init}</span>
  </button>`;
}

function deckHtml(slug) {
  const ds = deckState(slug);
  // Lowest initiative first (the order monsters act); ties keep card order.
  const sorted = [...cardsOf(slug)].sort((a, b) => a.init - b.init || a.n - b.n);
  const slots = sorted.map(c => slotHtml(slug, c, ds.deck.includes(c.n))).join('');
  const offMap = !presentSlugs().includes(slug);

  return `<div class="dk-deck${offMap ? ' dk-deck--off' : ''}" data-dk-slug="${slug}">
    <div class="dk-slots">${slots}</div>
  </div>`;
}

let selectedSlug = null; // which tab is shown; view state only, not saved in the map link

function tabStripHtml(slugs, active) {
  const on = presentSlugs();
  return `<div class="dk-tabs" role="tablist">` + slugs.map(slug => {
    const ds = deckState(slug);
    const off = !on.includes(slug);
    return `<button class="dk-tab${slug === active ? ' is-active' : ''}${off ? ' dk-tab--off' : ''}" type="button"
        role="tab" aria-selected="${slug === active}" data-dk-tab="${slug}">
      <span class="dk-tab-name">${esc(deckLabel(slug))}</span>
      <span class="dk-tab-count">${ds.deck.length}/${cardsOf(slug).length}</span>
      ${needsReshuffle(slug, ds) ? '<i class="dk-dot" title="Shuffles at end of round"></i>' : ''}
    </button>`;
  }).join('') + `</div>`;
}

// One row: tabs on the left, shuffle note and the copy / shuffle buttons on the right.
function tabsHtml(slugs, active) {
  const ds = deckState(active);
  const pending = needsReshuffle(active, ds);
  const offMap = !presentSlugs().includes(active);
  return `<div class="dk-bar">${tabStripHtml(slugs, active)}
    <div class="dk-bar-actions">
      ${offMap ? '<span class="dk-note">not on map</span>' : ''}
      ${pending ? '<span class="dk-note dk-note--pend">shuffles at end of round</span>' : ''}
      <button class="dk-act" type="button" data-dk-copy="${active}" ${ds.deck.length ? '' : 'disabled'}
        title="Copy GeekRoller code" aria-label="Copy GeekRoller code">${ICON_DICE}</button>
      <button class="dk-act" type="button" data-dk-shuffle="${active}"
        title="Shuffle deck now" aria-label="Shuffle deck now">${ICON_SHUFFLE}</button>
    </div>
  </div>`;
}

function amTileHtml(c, s, special) {
  const n = s.deck[c.key] || 0, disc = s.discard[c.key] || 0;
  const label = special ? c.label : c.face;
  const foot = special
    ? `<div class="am-adj"><button type="button" data-am-adj="${c.key}" data-d="-1" title="Remove one ${label} card">&minus;</button>
         <button type="button" data-am-adj="${c.key}" data-d="1" title="Add one ${label} card" ${n >= c.max ? 'disabled' : ''}>+</button></div>`
    : `<button class="am-ret" type="button" data-am-ret="${c.key}" ${disc ? '' : 'disabled'}
         title="Return one ${label} from the discard to the deck">&#8630; ${disc}</button>`;
  return `<div class="am-tile">
    <button class="am-card${n ? '' : ' is-empty'}" type="button" data-am-draw="${c.key}" ${n ? '' : 'disabled'}
        title="${special ? 'Draw (removes the card from the game)' : 'Draw one ' + label}">
      <img src="${assetPath.attackMod(c.img)}" alt="${label}" draggable="false">
      <span class="am-n">${n}${special ? '' : '/' + c.count}</span>
      ${c.shuffle ? '<span class="dk-mark">&#8635;</span>' : ''}
    </button>${foot}</div>`;
}

function amHtml() {
  const s = amState();
  const pending = amNeedsReshuffle(s);
  const tiles = [...AM_TYPES.map(c => amTileHtml(c, s, false)), ...AM_SPECIAL.map(c => amTileHtml(c, s, true))].join('');
  // Same bar as the ability decks: title chip on the left, note and buttons pinned right.
  return `<div class="dk-bar">
    <div class="dk-tabs">
      <span class="dk-tab is-active dk-tab--static">
        <img class="dk-tab-img" src="${assetPath.amBack()}" alt="" draggable="false">
        <span class="dk-tab-name">Attack modifiers</span>
        <span class="dk-tab-count">${amDeckTotal()}</span>
        ${pending ? '<i class="dk-dot" title="Shuffles at end of round"></i>' : ''}
      </span>
    </div>
    <div class="dk-bar-actions">
      ${pending ? '<span class="dk-note dk-note--pend">shuffles at end of round</span>' : ''}
      <button class="dk-act" type="button" data-dk-copy="am" ${amDeckTotal() ? '' : 'disabled'}
        title="Copy GeekRoller code" aria-label="Copy GeekRoller code">${ICON_DICE}</button>
      <button class="dk-act" type="button" data-dk-shuffle="am"
        title="Shuffle deck now" aria-label="Shuffle deck now">${ICON_SHUFFLE}</button>
    </div>
  </div>
  <div class="dk-deck" data-dk-slug="am">
    <div class="am-grid">${tiles}</div>
  </div>`;
}

export function openDeckPanel(v = 'abilities') { view = v; renderDecks(); }
export function closeDeckPanel() { if (view) { view = null; renderDecks(); } }
export function toggleDeckView(v) { view = view === v ? null : v; renderDecks(); }
export function isDeckPanelOpen() { return view !== null; }
export function deckPanelView() { return view; }

export function renderDecks() {
  document.getElementById('deck-toggle')?.classList.toggle('is-active', view === 'abilities');
  document.getElementById('am-toggle')?.classList.toggle('is-active', view === 'am');
  const panel = document.getElementById('deck-panel');
  if (!panel) return;
  panel.classList.toggle('open', view !== null);
  if (!view) return;

  if (view === 'am') { panel.innerHTML = amHtml(); return; }

  const slugs = visibleSlugs();
  if (!slugs.length) {
    panel.innerHTML = '<div class="dk-empty">No monsters with ability decks on the map.</div>';
    return;
  }
  if (!slugs.includes(selectedSlug)) selectedSlug = slugs[0];
  panel.innerHTML = tabsHtml(slugs, selectedSlug) + deckHtml(selectedSlug);
}

async function copyCode(btn, slug) {
  const orig = btn.innerHTML;
  try {
    await navigator.clipboard.writeText(slug === 'am' ? amRollerCode() : rollerCode(slug));
    btn.innerHTML = ICON_CHECK;
    btn.classList.add('dk-act--ok');
  } catch {
    btn.title = 'Copy failed';
  }
  setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('dk-act--ok'); }, 1500);
}

export function initDecks() {
  if (Object.keys(DECKS).length === 0) {
    document.querySelector('[data-mobile-panel="decks"]')?.remove(); // game without ability decks
    return;
  }
  // Bottom bar: elements | attack modifiers, monster abilities | end round
  const playGroup = document.querySelector('.el-group--play');
  const endBtn = document.getElementById('el-end-round');
  if (playGroup && endBtn) {
    const makeBtn = (id, title, src, v) => {
      const btn = document.createElement('button');
      btn.id = id;
      btn.className = 'deck-toggle-btn';
      btn.type = 'button';
      btn.title = title;
      btn.setAttribute('aria-label', title);
      btn.innerHTML = `<img src="${src}" alt="" draggable="false">`;
      btn.addEventListener('click', () => toggleDeckView(v));
      return btn;
    };
    const divider = document.createElement('div');
    divider.className = 'el-divider';
    playGroup.insertBefore(makeBtn('am-toggle', 'Attack modifier deck', assetPath.amBack(), 'am'), endBtn);
    playGroup.insertBefore(makeBtn('deck-toggle', 'Monster ability decks', assetPath.maBack(), 'abilities'), endBtn);
    playGroup.insertBefore(divider, endBtn);
  }

  // Selecting a monster on the board focuses its ability deck (the panel itself is not opened or closed).
  let lastSelKey = null;
  subscribeUI(() => {
    const sel = uiState.selected;
    const key = sel?.kind === 'monster' ? `monster:${sel.idx}` : null;
    if (key === lastSelKey) return;
    lastSelKey = key;
    if (!key) return;
    const slug = deckSlugFor(state.monsters[sel.idx]?.id);
    if (!slug) return;
    selectedSlug = slug;
    if (view === 'abilities') renderDecks();
  });

  const panel = document.createElement('div');
  panel.id = 'deck-panel';
  document.body.appendChild(panel);

  const preview = document.createElement('img');
  preview.id = 'deck-preview';
  document.body.appendChild(preview);
  panel.addEventListener('mouseover', e => {
    const img = e.target.closest('[data-dk-full]');
    if (!img) return;
    const r = panel.getBoundingClientRect();
    preview.src = img.dataset.dkFull;
    preview.style.left = r.left + 'px';
    preview.style.bottom = (window.innerHeight - r.top + 8) + 'px';
    preview.classList.add('show');
  });
  panel.addEventListener('mouseout', e => {
    if (e.target.closest('[data-dk-full]')) preview.classList.remove('show');
  });

  panel.addEventListener('click', e => {
    const tab = e.target.closest('[data-dk-tab]');
    if (tab) { selectedSlug = tab.dataset.dkTab; renderDecks(); return; }
    const amDrawBtn = e.target.closest('[data-am-draw]');
    if (amDrawBtn) { amDraw(amDrawBtn.dataset.amDraw); return; }
    const amRet = e.target.closest('[data-am-ret]');
    if (amRet) { amReturn(amRet.dataset.amRet); return; }
    const amAdj = e.target.closest('[data-am-adj]');
    if (amAdj) { amAdjust(amAdj.dataset.amAdj, Number(amAdj.dataset.d)); return; }
    const tog = e.target.closest('[data-dk-toggle]');
    if (tog) {
      const slug = tog.dataset.dkToggle, n = Number(tog.dataset.dkN);
      if (deckState(slug).deck.includes(n)) discardCard(slug, n); else returnCard(slug, n);
      return;
    }
    const copy = e.target.closest('[data-dk-copy]');
    if (copy) { copyCode(copy, copy.dataset.dkCopy); return; }
    const shuf = e.target.closest('[data-dk-shuffle]');
    if (shuf) { if (shuf.dataset.dkShuffle === 'am') amShuffleNow(); else shuffleDeck(shuf.dataset.dkShuffle); }
  });
}
