// Monster ability decks: draw/discard state, reshuffle rules, GeekRoller code, and the floating panel.
//
// State (state.decks[slug]):  { deck: [n...], discard: [n...], active?: [n...] }
// deck = still to draw, active = drawn this round (moved to discard at end of round), discard = drawn earlier.
// A missing entry means a full deck with nothing drawn. Cards are identified by their
// number n (1-8) within the deck; the iid (used in the roller code) comes from DECKS.

import { state, patch } from './state.js';
import { DECKS, deckSlugFor, assetPath } from './data.js';
import { uiState, subscribeUI } from './uiState.js';
import { buildCard } from './amd/card.js?v=4';
import { createHoverPreview, previewImage } from './hoverPreview.js';
import { perkTextHtml } from './amd/perkText.js';
import { escapeHtml as esc } from './escape.js';
import {
  AM_SPECIAL, amDecks, amSupportsImbue, amIsHero, amCardLocked, amState, amClassName, amHeroPerks, amToggleBox, amDeckInfo, amDraw, amReturn, amAdjust,
  amShuffleNow, amEndRoundPatch, amRollerCode, amEditCard, amSetImbue, amResetComposition, AM_MAX_PER_TYPE,
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
    active:  s?.active  ?? [],
  };
}

// Drop entries that equal the default so the share link stays short.
function normalize(slug, ds) {
  const isDefault = ds.deck.length === cardsOf(slug).length && ds.discard.length === 0 && ds.active.length === 0;
  return isDefault ? null : ds;
}

function withDeck(slug, ds) {
  const next = { ...(state.decks || {}) };
  const n = normalize(slug, ds);
  if (n) next[slug] = { deck: n.deck, discard: n.discard, ...(n.active.length ? { active: n.active } : {}) };
  else delete next[slug];
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

const byNumber = (a, b) => a - b;

// Deck -> active: the card is drawn for this round (any number of cards).
export function activateCard(slug, n) {
  const ds = deckState(slug);
  if (!ds.deck.includes(n)) return;
  patch({ decks: withDeck(slug, { ...ds,
    deck:   ds.deck.filter(x => x !== n),
    active: [...ds.active, n],
  }) });
}

// Active -> deck (undo a draw) or discard -> deck (correct a misclick).
export function returnCard(slug, n) {
  const ds = deckState(slug);
  if (!ds.active.includes(n) && !ds.discard.includes(n)) return;
  patch({ decks: withDeck(slug, {
    deck:    [...ds.deck, n].sort(byNumber),
    discard: ds.discard.filter(x => x !== n),
    active:  ds.active.filter(x => x !== n),
  }) });
}

// Active -> discard by hand, without waiting for end of round.
export function discardActive(slug, n) {
  const ds = deckState(slug);
  if (!ds.active.includes(n)) return;
  patch({ decks: withDeck(slug, { ...ds,
    active:  ds.active.filter(x => x !== n),
    discard: [...ds.discard, n],
  }) });
}

export function shuffleDeck(slug) {
  patch({ decks: withDeck(slug, { deck: fullDeck(slug), discard: [], active: [] }) });
}

// A deck reshuffles at end of round if its discard holds a shuffle card or the deck is empty.
function needsReshuffle(slug, ds) {
  return ds.deck.length === 0 || [...ds.discard, ...ds.active].some(n => cardOf(slug, n)?.s);
}

// Called at end of round. Returns the new decks object.
export function endRoundDecks() {
  const next = { ...(state.decks || {}) };
  for (const slug of Object.keys(next)) {
    if (!DECKS[slug]) continue;
    const ds = deckState(slug);
    if (needsReshuffle(slug, ds)) { delete next[slug]; continue; }
    if (ds.active.length) next[slug] = { deck: ds.deck, discard: [...ds.discard, ...ds.active] }; // active -> discard
  }
  return next;
}

// End-of-round changes to every deck, for one patch() call (one undo step).
export function endRoundPatch() {
  return { decks: endRoundDecks(), ...amEndRoundPatch() };
}

// GeekRoller code for the cards still in the deck, e.g. 1custom3{iid:9903036;iid:9903037;iid:9903038}
export function rollerCode(slug) {
  const { deck } = deckState(slug);
  const iids = deck.map(n => `iid:${cardOf(slug, n).iid}`);
  return `1custom${iids.length}{${iids.join(';')}}`;
}

// ─── UI ──────────────────────────────────────────────────────────────────────


function deckLabel(slug) {
  return slug.replace(/-/g, ' ');
}

const ICON_DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const ICON_SHUFFLE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>';
const ICON_EDIT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
const ICON_TO_DISCARD = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

function slotHtml(slug, c, status) { // status: 'deck' | 'active' | 'discard'
  const title = `Initiative ${c.init}${c.s ? ', shuffle' : ''}${status === 'active' ? ' (active, click to return to deck)' : ''}`;
  return `<button class="dk-slot${status === 'discard' ? ' dk-slot--out' : ''}${status === 'active' ? ' dk-slot--active' : ''}" type="button"
      data-dk-toggle="${slug}" data-dk-n="${c.n}" title="${title}">
    <img src="${assetPath.abilityCard(slug, c.n)}" data-dk-full="${assetPath.abilityCard(slug, c.n)}" alt="card ${c.n}" loading="lazy">
    ${c.s ? '<span class="dk-mark">&#8635;</span>' : ''}
    <span class="dk-init${c.s ? ' dk-init--s' : ''}">${c.init}</span>
    ${status === 'active' ? `<span class="dk-discard" role="button" tabindex="0" data-dk-discard="${slug}" data-dk-n="${c.n}"
        title="Discard now" aria-label="Discard now">${ICON_TO_DISCARD}</span>` : ''}
  </button>`;
}

function deckHtml(slug) {
  const ds = deckState(slug);
  // Lowest initiative first (the order monsters act); ties keep card order.
  const sorted = [...cardsOf(slug)].sort((a, b) => a.init - b.init || a.n - b.n);
  const status = n => (ds.active.includes(n) ? 'active' : ds.deck.includes(n) ? 'deck' : 'discard');
  const slots = sorted.map(c => slotHtml(slug, c, status(c.n))).join('');
  const offMap = !presentSlugs().includes(slug);

  return `<div class="dk-deck${offMap ? ' dk-deck--off' : ''}" data-dk-slug="${slug}">
    <div class="dk-slots">${slots}</div>
  </div>`;
}

// Cards drawn this round for a monster's deck, lowest initiative first (for the sidebar). null when none.
export function activeCardsFor(monsterId) {
  const slug = deckSlugFor(monsterId);
  if (!slug) return null;
  const ds = deckState(slug);
  const cards = ds.active.map(n => cardOf(slug, n)).filter(Boolean)
    .sort((a, b) => a.init - b.init || a.n - b.n)
    .map(c => ({ n: c.n, init: c.init, s: Boolean(c.s), src: assetPath.abilityCard(slug, c.n) }));
  return cards.length ? { slug, label: deckLabel(slug), cards } : null;
}

let selectedSlug = null; // which tab is shown; view state only, not saved in the map link

// Initiatives of the cards drawn this round, lowest first, e.g. "34" or "12/34".
function activeInits(slug, ds) {
  return ds.active.map(n => cardOf(slug, n)?.init).filter(v => v != null).sort((a, b) => a - b).join('/');
}

function tabStripHtml(slugs, active) {
  const on = presentSlugs();
  return `<div class="dk-tabs" role="tablist">` + slugs.map(slug => {
    const ds = deckState(slug);
    const off = !on.includes(slug);
    return `<button class="dk-tab${slug === active ? ' is-active' : ''}${off ? ' dk-tab--off' : ''}" type="button"
        role="tab" aria-selected="${slug === active}" data-dk-tab="${slug}">
      <span class="dk-tab-name">${esc(deckLabel(slug))}</span>
      <span class="dk-tab-count">${ds.deck.length}/${cardsOf(slug).length}</span>
      ${ds.active.length ? `<span class="dk-tab-act" title="Active this round: initiative">${activeInits(slug, ds)}</span>` : ''}
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

function amTileHtml(c, s, special, g, editMode) {
  const edit = editMode && !amCardLocked(g, c);
  const n = s.deck[c.key] || 0, disc = s.discard[c.key] || 0;
  const label = special ? c.label : c.face;
  const base = s.base[c.key] || 0;
  let foot;
  if (special) {
    foot = `<div class="am-adj"><button type="button" data-am-adj="${c.key}" data-am-g="${g}" data-d="-1" title="Remove one ${label} card">&minus;</button>
         <button type="button" data-am-adj="${c.key}" data-am-g="${g}" data-d="1" title="Add one ${label} card" ${n >= c.max ? 'disabled' : ''}>+</button></div>`;
  } else if (edit) {
    foot = `<div class="am-adj am-adj--edit"><button type="button" data-am-edit="${c.key}" data-am-g="${g}" data-d="-1" title="Remove one ${label} card from the deck permanently" ${base ? '' : 'disabled'}>&minus;</button>
         <button type="button" data-am-edit="${c.key}" data-am-g="${g}" data-d="1" title="Add one ${label} card to the deck permanently" ${base >= AM_MAX_PER_TYPE ? 'disabled' : ''}>+</button></div>`;
  } else {
    foot = `<button class="am-ret" type="button" data-am-ret="${c.key}" data-am-g="${g}" ${disc ? '' : 'disabled'}
         title="Return one ${label} from the discard to the deck">&#8630; ${disc}</button>`;
  }
  const src = c.card ? null : assetPath.attackMod(special && c.heroImg && amIsHero(g) ? c.heroImg : c.img);
  return `<div class="am-tile${!special && !base && !n && !disc ? ' am-tile--none' : ''}">
    <button class="am-card${n ? '' : ' is-empty'}" type="button" data-am-draw="${c.key}" data-am-g="${g}" ${n ? '' : 'disabled'}
        title="${special ? 'Draw (removes the card from the game)' : 'Draw one ' + label}">
      ${c.card ? `<span class="am-slot" data-am-slot="${c.key}" data-am-g="${g}" title="${label}"></span>`
               : `<img src="${src}" data-dk-full="${src}" alt="${label}" draggable="false">`}
      <span class="am-n">${n}${special ? '' : '/' + base}</span>
      ${c.shuffle ? '<span class="dk-mark">&#8635;</span>' : ''}
    </button>${foot}</div>`;
}

// View state of the attack modifier panel (not saved in the map link): which tab is shown, composition
// edit mode, and whether a hero's perk list replaces its cards.
const amView = { group: 'm', edit: false, perks: false };
// Enlarged view of a card under the pointer: an image for ability cards and monster modifier
// cards, a bigger composed card for hero cards (tile slots and perk-list cards).
let hoverPreview = null;
function previewNodeFor(el) {
  if (el.dataset.dkFull) return previewImage(el.dataset.dkFull);
  const hit = amCardOf(el);
  if (!hit) return null;
  const big = buildCard(hit.card, hit.className, hit.isAdded);
  big.style.setProperty('--pc-width', '100%');
  return big;
}

// The card a hero card element stands for: a tile slot (data-am-slot) or a perk-list card
// (data-am-pcard), plus the class badge name and whether the perk adds the card. `cache` keeps the
// per-deck lookups across the elements of one render.
function amCardOf(el, cache = new Map()) {
  const g = el.dataset.amG;
  if (!cache.has(g)) cache.set(g, {});
  const c = cache.get(g);
  c.className ??= amClassName(g);
  if (el.dataset.amSlot) {
    c.catalog ??= amState(g).catalog;
    const card = c.catalog.find(e => e.key === el.dataset.amSlot)?.card;
    return card && { card, className: c.className, isAdded: false };
  }
  c.perks ??= amHeroPerks(g)?.perks;
  const side = el.dataset.amSide;
  const card = c.perks?.[Number(el.dataset.amPi)]?.[side][Number(el.dataset.amCi)];   // perks[i].index === i
  return card && { card, className: c.className, isAdded: side === 'adds' };
}


// One perk row. Which boxes it has and whether it is taken comes from the model (amHeroPerks); this
// only draws it. Cards are filled in by mountAmCards.
function amPerkRowHtml(grp, g) {
  const p = grp.perk, n = grp.members.length;
  const group = (side, cards) => cards.map((_, i) => `<span class="am-pcard" data-am-pcard data-am-g="${g}" data-am-pi="${p.index}" data-am-side="${side}" data-am-ci="${i}"></span>`).join('');
  // Replace perks read "old card(s) -> new card(s)"; a perk that only removes shows what is taken out.
  const arrow = '<span class="am-perk-arrow" title="replaced by"><svg viewBox="0 0 32 16" width="32" height="16" aria-hidden="true"><path d="M1 8h26M20 2l8 6-8 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  const nCards = p.removes.length + p.adds.length;
  const cards = p.removes.length
    ? group('removes', p.removes) + arrow + (p.adds.length ? group('adds', p.adds) : '<span class="am-perk-gone">removed</span>')
    : group('adds', p.adds);
  const title = (b, k) => grp.kind === 'repeat' ? `Take this perk (${k + 1} of ${n})` : p.boxes > 1 ? `Box ${b.box + 1} of ${p.boxes}` : 'Take this perk';
  const boxes = grp.boxes.map((b, k) => `<button type="button" class="am-perk-check${b.ticked ? ' is-checked' : ''}" data-am-box="${b.box}" data-am-perk="${b.perk}" data-am-g="${g}"
        aria-pressed="${b.ticked}" title="${title(b, k)}">${b.ticked ? '&#10003;' : ''}</button>`).join('');
  const tag = grp.kind === 'repeat'
    ? `<span class="am-perk-tag am-perk-tag--repeat" title="Can be taken up to ${n} times; every box counts on its own">&times;${n}</span>`
    : grp.kind === 'linked'
      ? `<span class="am-perk-tag am-perk-tag--linked" title="Tick all ${p.boxes} boxes to take this perk once">all ${p.boxes}</span>` : '';
  // Single-box perks toggle from anywhere on the row; multi-box perks only from their boxes.
  return `<div class="am-perk${grp.done ? ' is-on' : ''}${grp.partial ? ' is-partial' : ''}${grp.boxes.length > 1 ? ' am-perk--multi' : ''}${nCards ? '' : ' am-perk--text'}${nCards >= 4 ? ' am-perk--wide' : ''}"${grp.boxes.length === 1 ? ` data-am-single="${p.index}" data-am-g="${g}"` : ''}>
    <span class="am-perk-boxes am-perk-boxes--${grp.kind}">${boxes}</span>
    <span class="am-perk-cards">${cards}</span>
    ${p.label && !nCards ? `<span class="am-perk-text">${perkTextHtml(p.label)}</span>` : ''}
    ${tag}
  </div>`;
}

function amHtml() {
  const tabList = amDecks();
  const g = tabList.some(t => t.key === amView.group) ? amView.group : 'm'; // e.g. the selected hero was removed
  const s = amState(g);
  const active = amDeckInfo(g, s);           // { total, pending }
  const edit = amView.edit;                  // edit mode: basic cards (and bless/curse); hero perk faces only via the perk list
  // Cards that are not in the standard deck show up when present, or in edit mode so they can be added
  // (a hero's perk faces are only added through the perk list).
  const shown = s.catalog.filter(c => !c.extra || (edit && !amCardLocked(g, c)) || (s.base[c.key] || 0) > 0 || (s.deck[c.key] || 0) > 0 || (s.discard[c.key] || 0) > 0);
  const hp = amHeroPerks(g);                 // null for monsters/allies and heroes without perk data
  const showPerks = amView.perks && !!hp;
  const tiles = [...shown.map(c => amTileHtml(c, s, false, g, edit)), ...AM_SPECIAL.map(c => amTileHtml(c, s, true, g, edit))].join('');
  const editBar = edit ? `<div class="am-edit-bar">
      ${amSupportsImbue(g) ? `<span class="am-edit-lbl">Imbuement</span>
      <span class="am-seg" role="group" aria-label="Imbuement level">${[0, 1, 2].map(l =>
        `<button type="button" class="${s.lvl === l ? 'is-active' : ''}" data-am-imbue="${l}" data-am-g="${g}">${l === 0 ? 'Off' : l}</button>`).join('')}</span>` : ''}
      <span class="am-edit-hint">+ / &minus; change the deck permanently</span>
      <button type="button" class="am-edit-reset" data-am-reset data-am-g="${g}" title="Back to the standard 20 cards">Reset to standard</button>
    </div>` : '';
  // Same bar as the ability decks: tabs on the left, note and buttons pinned right.
  const tabs = tabList.map(t => {
    const info = t.key === g ? active : amDeckInfo(t.key);
    return `<button class="dk-tab${t.key === g ? ' is-active' : ''}" type="button"
        role="tab" aria-selected="${t.key === g}" data-am-tab="${t.key}">
      <img class="dk-tab-img" src="${assetPath.amBack()}" alt="" draggable="false">
      <span class="dk-tab-name">${t.label}</span>
      <span class="dk-tab-count">${info.total}</span>
      ${info.pending ? '<i class="dk-dot" title="Shuffles at end of round"></i>' : ''}
    </button>`;
  }).join('');
  return `<div class="dk-bar">
    <div class="dk-tabs" role="tablist">${tabs}</div>
    <div class="dk-bar-actions">
      ${active.pending ? '<span class="dk-note dk-note--pend">shuffles at end of round</span>' : ''}
      <button class="dk-act" type="button" data-dk-copy="am:${g}" ${active.total ? '' : 'disabled'}
        title="Copy GeekRoller code" aria-label="Copy GeekRoller code">${ICON_DICE}</button>
      <button class="dk-act" type="button" data-dk-shuffle="am:${g}"
        title="Shuffle deck now" aria-label="Shuffle deck now">${ICON_SHUFFLE}</button>
      ${hp ? `<button class="dk-act dk-act--minor am-perks-btn${showPerks ? ' is-on' : ''}" type="button" data-am-perks-toggle aria-pressed="${showPerks}"
        title="Choose perks">Perks ${hp.perks.filter(p => p.on).length}/${hp.perks.length}</button>` : ''}
      <button class="dk-act dk-act--minor${amView.edit ? ' is-on' : ''}" type="button" data-am-edit-toggle aria-pressed="${amView.edit}"
        title="Edit deck composition" aria-label="Edit deck composition">${ICON_EDIT}</button>
    </div>
  </div>
  ${showPerks ? '' : editBar}
  <div class="dk-deck" data-dk-slug="am">
    ${showPerks ? `<div class="am-perks">${hp.groups.map(grp => amPerkRowHtml(grp, g)).join('')}</div>` : `<div class="am-grid">${tiles}</div>`}
  </div>`;
}

export function openDeckPanel(v = 'abilities') { view = v; renderDecks(); }
export function closeDeckPanel() { if (view) { view = null; renderDecks(); } }
export function toggleDeckView(v) { view = view === v ? null : v; renderDecks(); }
export function isDeckPanelOpen() { return view !== null; }
export function deckPanelView() { return view; }

// Hero tiles are composed cards: fill each placeholder slot with its card (scripts/amd).
function mountAmCards(panel) {
  const cache = new Map();
  for (const el of panel.querySelectorAll('[data-am-slot], [data-am-pcard]')) {
    const hit = amCardOf(el, cache);
    if (hit) el.appendChild(buildCard(hit.card, hit.className, hit.isAdded));
  }
}

export function renderDecks() {
  hoverPreview?.hide(); // the hovered card is about to be replaced
  document.getElementById('deck-toggle')?.classList.toggle('is-active', view === 'abilities');
  document.getElementById('am-toggle')?.classList.toggle('is-active', view === 'am');
  const panel = document.getElementById('deck-panel');
  if (!panel) return;
  panel.classList.toggle('open', view !== null);
  if (!view) return;

  if (view === 'am') { panel.innerHTML = amHtml(); mountAmCards(panel); return; }

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
    await navigator.clipboard.writeText(slug.startsWith('am:') ? amRollerCode(slug.slice(3)) : rollerCode(slug));
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

  // Selecting a monster on the board focuses its ability deck and the Monsters attack modifier tab,
  // selecting a hero focuses its attack modifier tab (the panel itself is not opened or closed).
  let lastSelKey = null;
  subscribeUI(() => {
    const sel = uiState.selected;
    const key = sel?.kind === 'monster' || sel?.kind === 'mercenary' ? `${sel.kind}:${sel.idx}` : null;
    if (key === lastSelKey) return;
    lastSelKey = key;
    if (!key) return;
    if (sel.kind === 'mercenary') {
      amView.group = 'h' + sel.idx;
      if (view === 'am') renderDecks();
      return;
    }
    // Monster: ability deck tab, and the Monsters tab of the attack modifier decks.
    amView.group = 'm';
    const slug = deckSlugFor(state.monsters[sel.idx]?.id);
    if (slug) selectedSlug = slug;
    if (view === 'abilities' && slug) renderDecks();
    if (view === 'am') renderDecks();
  });

  const panel = document.createElement('div');
  panel.id = 'deck-panel';
  document.body.appendChild(panel);

  hoverPreview = createHoverPreview({
    panel,
    selector: '[data-dk-full], [data-am-slot], [data-am-pcard]',
    build: previewNodeFor,
  });

  panel.addEventListener('click', e => {
    const tab = e.target.closest('[data-dk-tab]');
    if (tab) { selectedSlug = tab.dataset.dkTab; renderDecks(); return; }
    const amTab = e.target.closest('[data-am-tab]');
    if (amTab) { amView.group = amTab.dataset.amTab; renderDecks(); return; }
    const amDrawBtn = e.target.closest('[data-am-draw]');
    if (amDrawBtn) { amDraw(amDrawBtn.dataset.amDraw, amDrawBtn.dataset.amG); return; }
    const amRet = e.target.closest('[data-am-ret]');
    if (amRet) { amReturn(amRet.dataset.amRet, amRet.dataset.amG); return; }
    const amEd = e.target.closest('[data-am-edit]');
    if (amEd) { amEditCard(amEd.dataset.amEdit, Number(amEd.dataset.d), amEd.dataset.amG); return; }
    const amBox = e.target.closest('[data-am-box]');
    if (amBox) { amToggleBox(Number(amBox.dataset.amPerk), Number(amBox.dataset.amBox), amBox.dataset.amG); return; }
    const amRow = e.target.closest('[data-am-single]');
    if (amRow) { amToggleBox(Number(amRow.dataset.amSingle), 0, amRow.dataset.amG); return; }
    const amPkTog = e.target.closest('[data-am-perks-toggle]');
    if (amPkTog) { amView.perks = !amView.perks; renderDecks(); return; }
    const amTog = e.target.closest('[data-am-edit-toggle]');
    if (amTog) { amView.edit = !amView.edit; renderDecks(); return; }
    const amImb = e.target.closest('[data-am-imbue]');
    if (amImb) { amSetImbue(Number(amImb.dataset.amImbue), amImb.dataset.amG); return; }
    const amRst = e.target.closest('[data-am-reset]');
    if (amRst) { if (confirm('Reset this deck to the standard 20 cards?')) amResetComposition(amRst.dataset.amG); return; }
    const amAdj = e.target.closest('[data-am-adj]');
    if (amAdj) { amAdjust(amAdj.dataset.amAdj, Number(amAdj.dataset.d), amAdj.dataset.amG); return; }
    const dis = e.target.closest('[data-dk-discard]');
    if (dis) { discardActive(dis.dataset.dkDiscard, Number(dis.dataset.dkN)); return; }
    const tog = e.target.closest('[data-dk-toggle]');
    if (tog) {
      const slug = tog.dataset.dkToggle, n = Number(tog.dataset.dkN);
      if (deckState(slug).deck.includes(n)) activateCard(slug, n); else returnCard(slug, n);
      return;
    }
    const copy = e.target.closest('[data-dk-copy]');
    if (copy) { copyCode(copy, copy.dataset.dkCopy); return; }
    const shuf = e.target.closest('[data-dk-shuffle]');
    if (shuf) { if (shuf.dataset.dkShuffle.startsWith('am:')) amShuffleNow(shuf.dataset.dkShuffle.slice(3)); else shuffleDeck(shuf.dataset.dkShuffle); }
  });
}
