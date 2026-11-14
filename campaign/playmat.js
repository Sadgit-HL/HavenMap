// The playmat of the Mercenaries tab (design: campaign/mockups/merc-6-playmat-v2.html, styles: campaign/playmat.css, generated).
// playmatHtml() turns one character of the record into the playmat markup; the page (app.js) wires the clicks and drags to the
// pure edit functions in scripts/campaign/edit.js, so everything done here is saved, undoable and logged in the history.
import { handList, zoneOf, ownedCards, pendingPicks, cardLevel, SLOT_ORDER, SLOT_LABEL, slotLimits, slotUse, itemFits } from '../scripts/campaign/record.js';
import { tokenDefs, TOKEN_IMAGE_DIR, markerTokens, MARK_STICKERS, MARK_STICKER_DIR, markLabel } from '../scripts/campaign/classTokens.js';
import { BGG_ICON_GROUPS } from '../scripts/campaign/bggIcons.js';
import { BANNERS, BANNER_ICON_DIR } from '../scripts/campaign/bggBanners.js';
import { SPECIAL_TRAITS, specialName } from '../scripts/campaign/traits.js';
import { holdStatus } from '../scripts/campaign/edit.js';
import { amdRollCode, perkList, AM_STANDARD } from '../scripts/campaign/amdDeck.js';
import { groupPerks } from '../scripts/amd/heroDeck.js';
import { perkTextHtml, perkRuleNote } from '../scripts/amd/perkText.js';
import { MASTERIES } from '../scripts/games/masteries.js';
import { BATTLE_GOALS } from '../scripts/games/battle_goals.js';
import { PERSONAL_QUESTS } from '../scripts/games/gh2_quests.js';
import { GH2_PQ } from '../scripts/games/gh2_pq_text.js';

// XP needed for level 1 to 9 (the rulebook table as the mockup uses it; to be checked against the rulebook, handover section 6).
export const XP_STEPS = [0, 45, 95, 150, 210, 275, 350, 440, 540];
export const levelOfXp = xp => XP_STEPS.reduce((l, t, i) => (xp >= t ? i + 1 : l), 1);

const UP = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const DN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

// S = what the page remembers: { modal, matSide, customCodes, histKind, log } (open modal, mat side, saved codes, history filter and entries).
// Marker elements for a list [{ k, s?, x, y }]; x and y are percent of the card.
const REC_ICON = '<img src="../images/common/icons/recover.png" alt="" draggable="false">';
const STATE_BTN = [REC_ICON.replace('<img ', '<img width="24" height="24" '),
  '<img src="../images/common/icons/spent.png" alt="" width="24" height="24" draggable="false">', '<img src="../images/common/icons/consumed.png" alt="" width="24" height="24" draggable="false">'];
const PVX = '<button type="button" class="pvx" data-pvclose aria-label="Close preview">&times;</button>';
export function markersHtml(list, sel = -1) {
  return (list || []).map((m, i) => `<div class="tk${i === sel ? ' sel' : ''}" data-i="${i}" style="left:${m.x}%;top:${m.y}%${m.s ? `;--tkw:${m.k === 'hex_attack' ? 12 : 9}%` : ''}"><img src="${m.s ? MARK_STICKER_DIR : TOKEN_IMAGE_DIR}${m.k}.png" alt="${m.k}" draggable="false"></div>`).join('');
}
const pickSize = (k, sticker) => (sticker ? (k === 'hex_attack' ? 36 : 27) : 44);   // same size as placed on the 300 px card
function markPanel(c, S, esc, key, stickers = true) {
  const sel = S.mkSel || {}, btn = (k, s) => `<button type="button" style="--sz:${pickSize(k, s)}px" data-mkpick="${k}" data-s="${s ? 1 : 0}" aria-pressed="${sel.k === k && !!sel.s === s}" title="${esc(markLabel(k))}"><img src="${s ? MARK_STICKER_DIR : TOKEN_IMAGE_DIR}${k}.png" alt="${k}" draggable="false"></button>`;
  const toks = markerTokens(c.cls);
  const n = c.mk?.[key]?.length || 0, si = S.mkIdx ?? -1, nb = (d, l, t) => `<button type="button" class="btn6" data-mknudge="${d}" aria-label="${t}">${l}</button>`;
  const selRow = si >= 0 && si < n ? `<div class="row"><span>Selected marker</span><span class="nudge">${nb('-2,0', '&larr;', 'Move left')}${nb('0,-2', '&uarr;', 'Move up')}${nb('0,2', '&darr;', 'Move down')}${nb('2,0', '&rarr;', 'Move right')}<button type="button" class="btn6" data-mkremove>Remove</button></span></div>` : '';
  return `${selRow}${toks.length ? `<div class="row"><span>Tokens</span><span class="tkpick">${toks.map(k => btn(k, false)).join('')}</span></div>` : ''}${stickers ? `<div class="row"><span>Stickers</span><span class="tkpick" id="stkpick">${MARK_STICKERS.map(k => btn(k, true)).join('')}</span></div>` : ''}`;
}

// X = helpers of the page: { esc, pretty, cardById, itemById, cardImageUrl, itemImageUrl, cardBackUrl, portraitStyle, traitChips, playerName }
// The modifier deck in the place of the hand: deck stacks and a discard area (stack = cards of one kind), Edit adds steppers and a pinned palette.
function amViewHtml(A, esc, edit) {
  const stack = (t, n, zone, sp) => {
    const layers = Math.max(1, Math.min(n, 4)), edges = Array.from({ length: layers - 1 }, (_, i) => `<span class="edge" style="left:${(layers - 1 - i) * 3}px;top:${-(layers - 1 - i) * 3}px"></span>`).join('');
    const face = sp ? `<img src="${esc(t.img)}" alt="${esc(t.label)}" draggable="false">` : `<span class="amslot" data-keep data-amslot="${esc(t.key)}"></span>`;
    const ctl = edit && zone === 'deck' ? `<span class="stkctl"><button type="button" data-amact="${sp ? 'rem' : 'minus'}" data-key="${esc(t.key)}"${n < 1 ? ' disabled' : ''} aria-label="One less">-</button><output>${n}</output><button type="button" data-amact="${sp ? 'add' : 'plus'}" data-key="${esc(t.key)}"${sp && n >= t.max ? ' disabled' : ''} aria-label="One more">+</button></span>` : '';
    return `<div class="stk${n < 1 ? ' zero' : ''}" data-k="${esc(t.key)}" data-z="${zone}" draggable="${!edit}" title="${esc(t.face)}${n > 1 ? ` x${n}` : ''}">${edges}<span class="stkface">${face}</span>${n > 1 && !edit ? `<span class="nb">${n}</span>` : ''}${ctl}</div>`;
  };
  const mini = (t, z) => `<div class="mini" data-k="${esc(t.key)}" data-z="${z}" data-i="${t.i}" draggable="${!edit}" title="${esc(t.face ?? t.label)}"><span class="stkface">${t.img ? `<img src="${esc(t.img)}" alt="${esc(t.label)}" draggable="false">` : `<span class="amslot" data-keep data-amslot="${esc(t.key)}"></span>`}</span></div>`;
  const strip = (z, label, list, cls) => `<div class="${cls}" data-amdrop="${z}"><span class="lab">${label}</span><div class="minis">${list.map(t => mini(t, z)).join('')}</div></div>`;
  const ord = k => { const i = AM_STANDARD.findIndex(t => t.key === k); return i < 0 ? 99 : i; };
  const cards = (edit ? [...A.tiles.filter(t => t.n > 0), ...A.missing.map(t => ({ ...t, n: 0 }))].sort((a, b) => ord(a.key) - ord(b.key)) : A.tiles.filter(t => t.n > 0));   // edit: every standard card, also those not in the deck
  const deck = [...cards.map(t => stack(t, t.n, 'deck', false)), ...A.specials.filter(s => edit || s.n > 0).map(s => stack(s, s.n, 'deck', true))].join('');
  const disc = A.top ? stack(A.top, A.disc, 'disc', false) : '';
  const next = A.topList[0] ? { z: 'top', t: A.topList[0] } : !A.pool && A.botList[0] ? { z: 'bot', t: A.botList[0] } : null;   // a known card is drawn next: the button draws it instead of rolling
  return `<div class="amv"><div class="area deckarea" data-amdrop="deck"><h5>Deck &middot; <b>${A.pool}</b></h5><div class="stacks">${deck || '<span class="cnt">Empty</span>'}</div><div class="amrow">${strip('top', 'Top', A.topList, 'amstrip')}${strip('bot', 'Bottom', A.botList, 'amstrip')}</div></div><div class="amside"><div class="amctl">${next ? `<button type="button" class="amcode amdraw" data-amact="move" data-key="${esc(next.t.key)}" data-from="${next.z}" data-to="disc" data-idx="0" title="Draw the ${next.z === 'top' ? 'top' : 'bottom'} card of the deck" aria-label="Draw ${esc(next.t.face ?? next.t.label)} from the ${next.z === 'top' ? 'top' : 'bottom'} of the deck"><img src="../images/common/icons/draw.svg" width="34" height="32" alt="" draggable="false"><span class="lbl">${next.z === 'top' ? 'Top' : 'Bottom'}: ${esc(next.t.face ?? next.t.label)}</span></button>` : `<button type="button" class="amcode" data-code="${esc(amdRollCode(A.faces))}" title="Copy GeekRoller code" aria-label="Copy GeekRoller code"${A.faces.length ? '' : ' disabled'}><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg><span class="lbl">Roll code</span></button>`}<span class="amtools"><button type="button" data-amact="shuffle" title="Shuffle the discard back into the deck" aria-label="Shuffle the discard back into the deck"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button><button type="button" data-amedit aria-pressed="${edit}" title="Edit the deck" aria-label="Edit the deck"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4 11-11a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg></button></span></div><div class="area discarea" data-amdrop="disc" data-ampile title="Open the discard"><h5>Discard &middot; <b>${A.disc}</b></h5><div class="stacks">${disc || '<span class="cnt">Empty</span>'}</div></div>${strip('act', `Active &middot; <b>${A.actList.length}</b>`, A.actList, 'area amactive')}</div></div>`;
}

// The hand editor (one view): every card of the class by level. Each card has a state badge on its upper rim: Locked (not in the pool), Unlocked
// (in the pool) or Hand (chosen for the scenario hand, framed). A click on the badge steps to the next state.
function deckBodyHtml(c, X, S, esc) {
  const D = S.deck || { cards: [], hsel: [], armed: false }, owned = new Set(ownedCards(c)), pend = pendingPicks(c), level = c.lv || 1;
  const nm = k => X.pretty(k.slug), hsel = new Set(D.hsel.filter(id => owned.has(id))), limit = c.hand || 0;      // the hand: each owned card once
  const LOCK = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const tile = k => {
    const own = owned.has(k.id), inHand = own && hsel.has(k.id), lv = cardLevel(k.id), picked = lv >= 2 && lv < 99;
    const st = !own ? 'locked' : inHand ? 'hand' : 'unlocked';
    const can = !own ? (picked && lv <= level && pend > 0) : inHand ? true : !limit || hsel.size < limit;       // a click has an effect
    const label = st === 'locked' ? 'Locked' : st === 'hand' ? 'Hand' : 'Unlocked', url = X.cardImageUrl(X.cardById.get(k.id));
    const tip = st === 'locked' ? (can ? 'Locked: click to pick this card (level up)' : 'Locked') : st === 'unlocked' ? (can ? 'Unlocked: click to put it in the hand' : 'Unlocked (the hand is full)') : picked ? 'In the hand: click to take it out of the pool again' : 'In the hand: click to take it out of the hand';
    return `<div class="pcard ${st}" data-s="${k.id}" data-name="${esc(nm(k))}" title="${esc(nm(k))}">${url ? `<img src="${esc(url)}" alt="${esc(nm(k))}" loading="lazy" draggable="false">` : ''}${markersHtml(c.mk?.[`c:${k.id}`])}<button type="button" class="cbadge ${st}${can ? '' : ' off'}" data-cstate="${k.id}" title="${esc(tip)}" aria-label="${esc(nm(k))}: ${label}">${st === 'locked' ? LOCK : ''}${label}</button></div>`;
  };
  const g = {};
  D.cards.forEach(k => { const key = String(k.lv) === 'X' ? '1' : String(k.lv); (g[key] = g[key] || []).push(k); });
  const groups = Object.keys(g).sort((a, b) => a - b).map(k => [k, g[k]]);
  const join = a => (a[0] || '') + (a.length > 1 ? `<div class="lvrow">${a.slice(1).join('')}</div>` : '');
  const label = k => (k === '1' ? 'Level 1 &amp; X' : `Level ${k}`);
  const picked = ownedCards(c).filter(id => { const l = cardLevel(id); return l >= 2 && l < 99; });
  const grid = join(groups.map(([k, list]) => { const locked = k !== '1' && Number(k) > level;
    return `<div class="pgrp"><h3>${label(k)}<span>${locked ? `locked until level ${k}` : ''}</span></h3><div class="pgrid">${list.map(tile).join('')}</div></div>`; }));
  return `<div class="poolbar"><span>Level <span class="sp"><b>${level}</b><span class="spc"><button type="button" data-lvstep="1" aria-label="Level up">${UP}</button><button type="button" data-lvstep="-1" aria-label="Level down">${DN}</button></span></span></span><span>${owned.size} cards in pool</span><span>Hand <b>${hsel.size}${limit ? ` / ${limit}` : ''}</b></span><span class="grow"></span><button type="button" class="btn6" data-poolundo="${picked.at(-1) ?? ''}"${picked.length ? '' : ' disabled'}>Undo last pick</button><button type="button" class="btn6" data-handclear>Clear hand</button></div>
    ${pend ? `<div class="poolbanner">Level up: choose ${pend} new card${pend > 1 ? 's' : ''} of level ${level} or lower.</div>` : ''}${grid}
    <div class="poolfoot"><span>${hsel.size && limit && hsel.size < limit ? 'Fewer cards than the hand limit' : ''}</span><button type="button" class="btn6" data-handok${hsel.size ? '' : ' disabled'}>${D.armed ? 'Reset scenario cards and apply' : 'Confirm hand'}</button></div>`;
}

export function playmatHtml(c, X, S = {}) {
  const { esc } = X;
  const cid = esc(c.id);
  const nameOf = id => X.pretty(X.cardById.get(id)?.slug ?? id);
  const iniOf = id => X.cardById.get(id)?.ini;

  // markers (tokens and stickers) on a card or an item, and the corner handle that opens the marker editor
  const HANDLE = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8.5 15.5l.7-2.6 5.6-5.6a1 1 0 0 1 1.4 0l.5.5a1 1 0 0 1 0 1.4l-5.6 5.6z"/><path d="M13.6 8.6l1.8 1.8"/></svg>';
  const MORE = '<button type="button" class="cardmore" data-cardmore aria-label="Card menu" draggable="false">&#8943;</button>';   // shown on touch screens only (style.css)
  const marks = key => markersHtml(c.mk?.[key]);
  const handle = key => `<button type="button" class="tkh" data-mkopen="${key}" data-char="${cid}" title="Tokens" aria-label="Place tokens" draggable="false">${HANDLE}</button>`;

  // a card as it lies in the hand, the active area or on a pile
  const ac = (id, i, withHandle = true) => {
    const card = X.cardById.get(id), url = X.cardImageUrl(card), name = nameOf(id), ini = iniOf(id);
    const inner = url ? `<img src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`;
    return `<div class="ac" draggable="true" data-card="${id}" data-char="${cid}"${ini != null ? ` data-ini="${ini}"` : ''}${i != null ? ` style="--i:${i}"` : ''} title="${esc(name)}">${inner}${ini != null ? `<span class="inib" title="Initiative ${ini}">${ini}</span>` : ''}${marks(`c:${id}`)}${withHandle ? handle(`c:${id}`) + MORE : ''}</div>`;
  };

  // a face-down or face-up card in a play slot
  const back = `<img class="realback" src="${esc(X.cardBackUrl(c.cls))}" alt="${esc(c.cls)} card back" draggable="false">`;
  const slotHtml = (i) => {
    const p = c.play[i];
    const inner = !p ? `<div class="slotempty">${i + 1}</div>` : (() => {
      const card = X.cardById.get(p.id), url = X.cardImageUrl(card), name = nameOf(p.id), ini = iniOf(p.id);
      return `<div class="flipcard${p.up ? ' is-front settled' : ''}" draggable="true" data-card="${p.id}" data-char="${cid}" data-slot="${i}"${ini != null ? ` data-ini="${ini}"` : ''} role="button" tabindex="0" title="Click to flip: ${esc(name)}"><div class="flipinner"><div class="face back">${back}</div><div class="face front">${url ? `<img src="${esc(url)}" alt="${esc(name)}" draggable="false">` : `<div class="noimg">${esc(name)}</div>`}</div></div>${marks(`c:${p.id}`)}${MORE}</div>`;
    })();
    return `<div class="slot6${i === 0 ? ' first' : ''}" data-slot="${i + 1}" data-zone="play${i + 1}" data-char="${cid}"><div class="slotcard">${inner}</div></div>`;
  };
  const p1 = c.play[0], playIni = p1 && p1.up ? (iniOf(p1.id) ?? '?') : '?';

  // zones
  const lists = { active: [], discard: [], lost: [] };
  for (const id of c.deck) { const z = zoneOf(c, id); if (lists[z]) lists[z].push(id); }
  const active = c.act.filter(id => lists.active.includes(id));
  const hand = handList(c);
  const top = z => { const a = z === 'discard' ? c.disc : c.lost; const id = a.filter(x => c.deck.includes(x)).at(-1); return id == null ? '<div class="slotempty">Empty</div>' : ac(id, undefined, false); };
  const pile = (z, title, cls) => `<div class="pile6${cls}" data-pile="${z}" data-zone="${z}" data-char="${cid}"><h4>${title} <b>${lists[z].length}</b></h4><div class="pilecard">${top(z)}</div></div>`;

  // top bar
  const lv = c.lv || levelOfXp(c.xp || 0), lo = XP_STEPS[lv - 1] ?? 0, hi = XP_STEPS[lv] ?? null;
  const pct = hi ? Math.max(0, Math.min(100, ((c.xp - lo) / (hi - lo)) * 100)) : 100;
  const sp = (key, label, tag, val) => `<span class="sp"><${tag} class="edv" tabindex="0" data-hud="${key}" data-char="${cid}" title="Click to edit. Type a number, or +N / -N to add or subtract">${val}</${tag}><span class="spc"><button type="button" data-hud="${key}" data-char="${cid}" data-d="1" aria-label="Increase ${label}">${UP}</button><button type="button" data-hud="${key}" data-char="${cid}" data-d="-1" aria-label="Decrease ${label}">${DN}</button></span></span>`;
  const limit = c.hand;
  const tkImg = (n, l) => `<img src="${TOKEN_IMAGE_DIR}${n}.png" alt="${esc(l)}" draggable="false" style="width:52px;height:52px;object-fit:contain;display:block">`;
  const tokens = tokenDefs(c.cls).map(d => {
    const v = c.tok?.[d.k] || 0;
    if (d.states) return `<span class="ctr" title="${esc(d.l)}: ${esc(d.states[v])} (click to change)"><button type="button" data-tk="${d.k}" data-char="${cid}" style="width:auto;height:auto;padding:2px;background:none;border:0" aria-label="${esc(d.l)}: ${esc(d.states[v])}">${tkImg(d.imgs[v], `${d.l} ${d.states[v]}`)}</button></span>`;
    return `<span class="ctr" title="${esc(d.l)}">${tkImg(d.img, d.l)}<span class="sp"><b>${v}</b><span class="spc"><button type="button" data-tk="${d.k}" data-char="${cid}" data-d="1" aria-label="Increase ${esc(d.l)}">${UP}</button><button type="button" data-tk="${d.k}" data-char="${cid}" data-d="-1" aria-label="Decrease ${esc(d.l)}"${v ? '' : ' disabled'}>${DN}</button></span></span></span>`;
  }).join('');
  const DOC = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>';
  const DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
  const CARDS_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="12" height="16" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/></svg>';
  const ITEM_STATE = ['Available', 'Spent', 'Consumed'], STATE_ICON = [null, '../images/common/icons/spent.png', '../images/common/icons/consumed.png'];
  const items = c.items.map(it => {
    const item = X.itemById.get(it.id), url = X.itemImageUrl(item), name = X.pretty(item?.slug ?? it.id), s = it.s || 0;
    return `<div class="it${s === 1 ? ' spent' : s === 2 ? ' consumed' : ''}" data-itemstate data-id="${esc(it.id)}" data-char="${cid}" title="${esc(name)}${item?.slot ? ` (${esc(item.slot)})` : ''} \u2014 ${ITEM_STATE[s]}, click to open">${url ? `<img src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`}${STATE_ICON[s] ? `<span class="itbadge"><img src="${STATE_ICON[s]}" alt="" draggable="false"></span>` : ''}${marks(`i:${it.id}`)}${handle(`i:${it.id}`)}</div>`;
  }).join('');

  // hand or modifiers in the hand's place (same toggle in both views)
  const AMD = S.hview === 'amd' && S.amv, A5 = S.amv;
  const hviewTog = `<span class="tog" role="group" aria-label="Hand or modifier deck"><button type="button" data-hview="hand" aria-pressed="${!AMD}" title="Show the hand (Space switches between hand and modifiers)">Hand</button><button type="button" data-hview="amd" aria-pressed="${!!AMD}" title="Show the attack modifier deck (Space switches between hand and modifiers)">Modifiers</button></span>`;
  const amBar = AMD ? `<span class="cnt"><b>${A5.total}</b> in deck &middot; <b>${A5.disc}</b> discarded</span>` : '';
  const amView = AMD ? amViewHtml(A5, esc, !!S.amEdit) : '';
  const PEN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4 11-11a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg>';
  const heBtn = `<button type="button" class="btn6" data-handedit title="Edit the hand: choose the cards, card pool and level-up picks" aria-label="Edit the hand">${PEN}</button>`;

  const ST = S.set || {}, zm = z => (ST.zones && ST.zones[z]) || ST.zoom || 'hover';
  return `<div class="pm" data-zactive="${zm('active')}" data-zplay="${zm('play')}" data-zhand="${zm('hand')}" data-zpiles="${zm('piles')}" data-zitems="${zm('items')}" data-inib="${ST.inib === false ? 'off' : 'on'}" data-motion="${ST.reduce ? 'reduce' : 'full'}" data-dock="${ST.dock === 'right' ? 'right' : 'left'}" style="--hdelay:${({ short: 150, long: 400 })[ST.delay] || 0}ms">
  <div class="stage6">
    <header class="hud"><div class="portrait" style="${esc(X.portraitStyle(c, 72))}" role="img" aria-label="Class portrait (cropped from the character mat)"></div>
      <div class="who"><div class="namerow"><h1 class="chsw"><button type="button" class="chname" data-chmenu aria-haspopup="true" aria-expanded="${!!S.chMenu}" title="Switch character">${esc(c.name)} <span aria-hidden="true">&#9662;</span></button>${S.chMenu ? `<span class="chlist" role="menu">${(S.chars || []).map(t => `<button type="button" role="menuitem" data-sub="${esc(t.id)}"${t.id === c.id ? ' aria-current="true"' : ''}>${t.id === 'add' ? '+ Add character' : esc(t.label)}</button>`).join('')}</span>` : ''}</h1><button type="button" class="btn6" data-charedit title="Edit character" aria-label="Edit character"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4 11-11a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg></button></div><div class="sub">${esc(c.cls)}${X.playerName(c) ? ` &middot; played by ${esc(X.playerName(c))}` : ''}</div><div class="chips">${X.traitChips(c)}</div></div>
      <div class="sep"></div>
      <div class="lvl" title="Level ${lv} (click for the card pool)" data-opendeck="pool" role="button" tabindex="0">${lv}</div>
      <div class="xp" title="Level ${lv}: ${lo} XP.${hi ? ` Next level (${lv + 1}) at ${hi} XP.` : ' Maximum level.'}"><div class="xprow"><span class="xplab">XP</span>${sp('xp', 'XP', 'span', c.xp ?? 0)}<span class="xpto">/ <em>${hi ?? 'max'}</em></span></div><div class="xpbar"><b style="width:${pct}%"></b></div></div>
      <div class="stat"><small>Gold</small>${sp('gold', 'gold', 'b', c.gold ?? 0)}</div>
      <div class="stat"><small>Inherited perks</small>${sp('inh', 'inherited perks', 'b', c.inh ?? 0)}</div>
      <div class="counters">${tokens}</div>
      <div class="grp"><small>BGG code</small><span class="bggseg"><button type="button" class="bggb" data-bgg="turn" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: Turn">${DOC}<span>Turn</span></button><button type="button" class="bggb" data-bgg="cards" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: Cards">${CARDS_ICON}<span>Cards</span></button></span></div>
      <div class="sep"></div>
    </header>
    <section class="shelf6" aria-label="Items"><h4>Items <span class="itbar"><span>${c.items.length}</span><button type="button" class="btn6" data-itemssort="${cid}" title="Sort by slot" aria-label="Sort by slot">Slot</button><button type="button" class="btn6 equipbtn" data-itemsedit="${cid}" title="Equip items" aria-label="Equip items"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4 11-11a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/></svg></button></span></h4>${items}</section>
    <section class="board6">
      <div class="toprow">
        <div class="zone"><span class="zlabel">Active &middot; <b>${active.length}</b></span><div class="activelist" data-zone="active" data-char="${cid}">${active.map(id => ac(id)).join('')}</div></div>
        <div class="zone play"><span class="zlabel">Play area &middot; Initiative <b>${playIni}</b></span>${slotHtml(0)}${slotHtml(1)}</div>
      </div>
      <div class="hand6" data-hmode="${AMD ? 'amd' : 'hand'}" data-layout="${ST.layout === 'fan' ? 'fan' : 'spread'}"><div class="hbar">${hviewTog}${AMD ? amBar : `<span class="zlabel">Hand &middot; <b class="${limit && hand.length > limit ? 'over-limit' : ''}">${hand.length}</b>${limit ? ` of <span>${esc(limit)}</span>` : ''}</span>${heBtn}<span class="hctl"><span class="sortlab">Sort</span>${`<span class="sortgrp"><button type="button" class="btn6" data-handsort="ini" data-char="${cid}" title="Sort by initiative and keep the hand sorted">Ini</button><button type="button" class="btn6" data-handsort="lvl" data-char="${cid}" title="Sort by level once">Lvl</button></span>`}</span>`}</div>${AMD ? amView : `<div class="fan6" data-zone="hand" data-char="${cid}">${hand.map((id, i) => ac(id, i)).join('')}</div>`}</div>
    </section>
    <section class="piles6">${pile('discard', 'Discard', ' target')}${pile('lost', 'Lost', ' lost target')}</section>
    ${dockHtml(pendingPicks(c))}
  </div>${modalHtml(c, X, S)}</div>`;
}

// BGG forum posts of the play-by-forum template: the turn (class banner and the two cards in the play slots, slot 1 = top, slot 2 = bottom)
// and the cards for the next round (initiative of slot 1, both cards, the character's name). Everything else stays as in the template.
// bannerUrl = the class banner image, pretty = card name, cardById = card data.
export function turnPost(c, { bannerUrl, pretty, cardById }) {
  const name = i => (c.play[i] ? pretty(cardById.get(c.play[i].id)?.slug ?? c.play[i].id) : 'XXX');
  return `[inlineimg]${bannerUrl}[/inlineimg]\n` +
    `[u][b]${name(0)} - top action[/b][/u]\n[imageid=7410469  inline] X\n\n` +
    `[u][b]${name(1)} - bottom action[/b][/u]\n[imageid=7410466  inline] X\n\n` +
    '[b]End of Turn[/b]\n---------------------';
}
export function cardsPost(c, { pretty, cardById }) {
  const name = i => (c.play[i] ? pretty(cardById.get(c.play[i].id)?.slug ?? c.play[i].id) : 'X');
  const ini = c.play[0] ? (cardById.get(c.play[0].id)?.ini ?? 'X') : 'X';
  return `[u][b]Cards for the next round[/b][/u]\n[o][b]${ini}[/b]\n${name(0)}, ${name(1)}[/o]\n[i]${c.name} will [/i]`;
}

// ---- display settings (the gear of the top bar; kept in this browser by the page) ----
export const SET_DEFAULT = { layout: 'spread', zoom: 'hover', zones: { active: '', play: '', hand: '', piles: '', items: '' }, size: 'm', delay: 'off', dock: 'left', inib: true, autosort: false, reduce: false };
const SET_ENUM = { layout: ['spread', 'fan'], zoom: ['hover', 'click'], size: ['s', 'm', 'l', 'xl'], delay: ['off', 'short', 'long'], dock: ['left', 'right'] };
export function cleanSettings(o) {
  const s = JSON.parse(JSON.stringify(SET_DEFAULT));
  if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) s.zoom = 'click';          // touch: there is no hover
  if (!o || typeof o !== 'object') return s;
  for (const k in SET_ENUM) if (SET_ENUM[k].includes(o[k])) s[k] = o[k];
  for (const k in s.zones) if (o.zones && ['hover', 'click'].includes(o.zones[k])) s.zones[k] = o.zones[k];
  for (const k of ['inib', 'autosort', 'reduce']) if (typeof o[k] === 'boolean') s[k] = o[k];
  return s;
}
// Display settings: the body of the Settings popup in the top bar (one place for all settings). Kept in this browser by the page.
export function displaySettingsHtml(st) {
  const set = st && st.layout ? st : SET_DEFAULT;
  const seg = (name, opts) => `<span class="seg" data-set="${name}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${set[name] === v}">${l}</button>`).join('')}</span>`;
  const row = (label, inner) => `<div class="setrow"><label>${label}</label>${inner}</div>`;
  const zone = (z, label) => `<div class="setrow"><label for="setz-${z}">${label}</label><select id="setz-${z}" data-zone="${z}">${[['', 'Default'], ['hover', 'Hover'], ['click', 'Click']].map(([v, l]) => `<option value="${v}"${set.zones[z] === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>`;
  const chk = (flag, label) => `<label class="chk"><span>${label}</span><input type="checkbox" data-flag="${flag}"${set[flag] ? ' checked' : ''}></label>`;
  return `<div class="setgrp">Hand and cards</div>
    ${row('Hand layout', seg('layout', [['spread', 'Spread'], ['fan', 'Fan']]))}${row('Card zoom', seg('zoom', [['hover', 'Hover'], ['click', 'Click']]))}
    <details><summary>Zoom per zone</summary>${zone('active', 'Active')}${zone('play', 'Play area')}${zone('hand', 'Hand')}${zone('items', 'Items')}${zone('piles', 'Discard &amp; lost')}</details>
    ${row('Zoom size', seg('size', [['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']]))}
    <div class="setgrp">Preview and timing</div>
    ${row('Hover delay', seg('delay', [['off', 'Off'], ['short', 'Short'], ['long', 'Long']]))}${row('Docked preview', seg('dock', [['left', 'Left'], ['right', 'Right']]))}
    <div class="setgrp">Other</div>
    ${chk('inib', 'Initiative badge on cards')}${chk('autosort', 'Auto-sort hand by initiative')}${chk('reduce', 'Reduce motion')}
    <div class="setfoot"><button type="button" class="btn6" data-setreset>Reset display settings</button></div>`;
}

// ---- the dock (buttons that open the modals) and the modals ----
const ICON = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const DOCK = [
  ['journal', 'Journal', 'Battle goals, personal quest and notes (tabs in one modal)', ICON('<path d="M6 3h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 17a2 2 0 0 0 2 2M10 8h6M10 12h6"/>')],
  ['mat', 'Character mat', 'Character mat, front and back', ICON('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v14"/>')],
  ['perks', 'Perks & masteries', 'Perk selection and masteries', ICON('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>')],
  ['enh', 'Enhancements', 'Enhancement table (editable)', ICON('<path d="M4 18h16M6 18v-3h12v3M8 15c0-3 1-5 4-6V6h5v3H12"/>')],
  ['codes', 'BGG codes', 'Copy a forum post code', ICON('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/>')],
  ['history', 'History', 'History of changes of this character', ICON('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')],
];
const dockHtml = pend => `<aside class="dock" aria-label="Modals">${DOCK.map(([id, label, tip, svg]) => `<button type="button" class="mbtn" data-modal="${id}" title="Opens modal: ${tip}">${svg}<span>${label}</span>${id === 'deck' && pend ? `<span class="pooldot" title="${pend} card pick pending">${pend}</span>` : ''}</button>`).join('')}</aside>`;

export function modalHtml(c, X, S) {
  if (!S.modal) return '';
  const { esc } = X;
  let title = '', big = '', body = '', extra = '';
  if (S.modal === 'mat') {
    title = 'Character mat'; big = ' big';
    const side = S.matSide === 'back' ? 'back' : 'front';
    body = `<div class="matflip"><img src="${esc(X.matUrl(c.cls, side))}" alt="${esc(c.cls)} mat, ${side}" data-matflip role="button" tabindex="0" title="Click to flip"></div>`;
  } else if (S.modal === 'codes') {
    title = 'BGG forum codes'; big = ' sbox';
    const icons = BGG_ICON_GROUPS.map(g => `<div class="bgg-block"><h4>${esc(g.h)}</h4><div class="bgg-row">${g.icons.map(i => `<button type="button" class="bgg-ic" data-code="${esc(i.c)}" title="${esc(i.n)}: copy ${esc(i.c)}" aria-label="Copy ${esc(i.n)} icon code"><img src="${esc(i.img)}" alt="${esc(i.n)}"${i.inv ? ' class="inv"' : ''}></button>`).join('')}</div></div>`).join('');
    const banners = BANNERS.map(b => `<button type="button" class="bnrtile" data-bnr="${b.slug}" title="Copy the ${esc(b.name)} banner code">${b.icon ? `<img src="${BANNER_ICON_DIR}${encodeURIComponent(b.icon)}.webp" alt="">` : '<span class="bnrnoimg">?</span>'}<span>${esc(b.name)}</span></button>`).join('');
    const custom = (S.customCodes || []).map((k, i) => `<div class="coderow"><div><b style="margin:0">${esc(k.label)}</b></div><span><button type="button" class="btn6" data-code="${esc(k.text)}">Copy</button> <button type="button" class="delx" data-codedel="${i}" aria-label="Remove ${esc(k.label)}">&times;</button></span></div>`).join('');
    body = `<div class="chedit sedit">
      <section class="cesec"><h4>Icons <span>click to copy</span></h4><div class="bgg-icons">${icons}</div></section>
      <section class="cesec"><h4>Class banners</h4><p class="bnrnote" data-bnrnote>Click a class to copy its <b>banner image</b> code.</p><div class="bnrgrid">${banners}</div></section>
      <section class="cesec"><h4>Own codes</h4>${custom ? `<div class="codelist">${custom}</div>` : ''}
        <div class="addrow"><input data-code-label placeholder="Label" aria-label="Label"><input data-code-text placeholder="Code to copy" aria-label="Code" style="flex:2"><button type="button" class="btn6" data-codeadd>Add</button></div></section>
      <div class="chfoot"><button type="button" class="btn6" data-modalclose>Close</button></div></div>`;
  } else if (S.modal === 'journal') {
    title = 'Journal'; big = ' jbox';
    body = `<div class="chedit jedit">${journalBody(c, X, S)}</div>`;
  } else if (S.modal === 'item') {
    const it = c.items.find(x => String(x.id) === String(S.itemId)), item = it && X.itemById.get(it.id);
    if (!it) return '';
    title = X.pretty(item?.slug ?? it.id);
    const url = X.itemImageUrl(item), st = it.s || 0;
    body = `<div class="itmodal"><div class="itcard pick" data-mkcard="i:${esc(it.id)}">${url ? `<img src="${esc(url)}" alt="${esc(title)}" draggable="false">` : ''}${markersHtml(c.mk?.[`i:${it.id}`], S.mkIdx)}</div><div class="itpanel"><div class="row"><span>State</span><span class="seg">${['Available', 'Spent', 'Consumed'].map((n, k) => `<button type="button" class="btn6 stbtn" data-itstate="${k}" data-id="${esc(it.id)}" data-char="${esc(c.id)}" aria-pressed="${st === k}" title="${n}" aria-label="${n}">${STATE_BTN[k]}</button>`).join('')}</span></div>${markPanel(c, S, esc, `i:${it.id}`, false)}<div class="row"><button type="button" class="btn6" data-mkclear="i:${esc(it.id)}">Clear all</button></div></div></div>`;
  } else if (S.modal === 'cardmk') {
    const id = Number(String(S.mkKey || '').slice(2)), card = X.cardById.get(id);
    if (!card) return '';
    title = X.pretty(card.slug); const url = X.cardImageUrl(card);
    body = `<div class="itmodal"><div class="itcard pick" data-mkcard="c:${id}">${url ? `<img src="${esc(url)}" alt="${esc(title)}" draggable="false">` : ''}${markersHtml(c.mk?.[`c:${id}`], S.mkIdx)}</div><div class="itpanel">${markPanel(c, S, esc, `c:${id}`)}<div class="row"><button type="button" class="btn6" data-mkclear="c:${id}">Clear all</button></div></div></div>`;
  } else if (S.modal === 'items') {
    title = 'Equip items'; big = ' huge';
    const I = S.items || { pool: [], isel: [] }, sel = new Set(I.isel.map(String));
    const chosen = I.pool.filter(i => sel.has(String(i.id))), u = slotUse(chosen), l = slotLimits(c.lv);
    const SLOT_USE = { head: [u.head, l.head], body: [u.body, l.body], legs: [u.legs, l.legs], '1H': [u.hands, l.hands], '2H': [u.hands, l.hands], small: [u.small, l.small] };   // both hand slots share the two hands
    const groups = SLOT_ORDER.map(sl => {
      const list = I.pool.filter(i => i.slot === sl);
      if (!list.length) return '';
      return `<div class="pgrp"><h3>${SLOT_LABEL[sl]}${SLOT_USE[sl] ? ` <span class="${SLOT_USE[sl][0] >= SLOT_USE[sl][1] ? 'full' : ''}">(${SLOT_USE[sl][0]}/${SLOT_USE[sl][1]})</span>` : ''}</h3><div class="pgrid">${list.map(i => {
        const on = sel.has(String(i.id)), off = !on && !itemFits(chosen, i, c.lv), url = X.itemImageUrl(i), nm = X.pretty(i.slug);
        const tip = on ? 'Equipped: click to take it off' : off ? 'Owned (it does not fit the free slots)' : 'Owned: click to equip it';
        return `<div class="pcard ${on ? 'sel' : ''}" data-name="${esc(nm)}" title="${esc(nm)} (${esc(sl)})">${url ? `<img src="${esc(url)}" alt="${esc(nm)}" loading="lazy" draggable="false">` : ''}${markersHtml(c.mk?.[`i:${i.id}`])}<button type="button" class="cbadge ${on ? 'equipped' : 'owned'}${off ? ' off' : ''}" data-isel="${esc(i.id)}" aria-pressed="${on}" title="${esc(tip)}" aria-label="${esc(nm)}: ${on ? 'Equipped' : 'Owned'}"${off ? ' disabled' : ''}>${on ? 'Equipped' : 'Owned'}</button></div>`;
      }).join('')}</div></div>`;
    }).join('');
    body = `<div class="poolbar"><span class="grow"></span><button type="button" class="btn6" data-itemclear>Clear</button></div>${groups ? `<div class="itgroups">${groups}</div>` : '<p class="mrow">This character owns no items yet. Give items to the character in the Items tab.</p>'}<div class="poolfoot"><span></span><button type="button" class="btn6" data-itemok data-char="${esc(c.id)}">Confirm items</button></div>`;
    extra = '<div class="pcbig" data-poolbig hidden></div>' + PVX;
  } else if (S.modal === 'deck') {
    title = 'Hand'; big = ' huge';
    body = deckBodyHtml(c, X, S, esc);
    extra = '<div class="pcbig" data-poolbig hidden></div>' + PVX;
  } else if (S.modal === 'perks') {
    title = 'Perks & masteries'; big = ' sbox';
    const perks = perkList(c.cls), on = i => c.pk.perks.includes(i), mask = i => c.pk.boxes[i] || 0;
    const slot = (i, side, j) => `<span class="amslot" data-keep data-perkcard="${i}.${side}.${j}"></span>`;
    const rows = groupPerks(perks).map(g => {
      const p = g.perk, repeated = g.members.length > 1;
      const boxes = repeated ? g.members.map(m => ({ box: 0, perk: m.index, ticked: on(m.index) }))
        : Array.from({ length: p.boxes }, (_, b) => ({ box: b, perk: p.index, ticked: on(p.index) || !!(mask(p.index) & (1 << b)) }));
      const done = repeated ? g.members.every(m => on(m.index)) : on(p.index);
      const partial = !done && (repeated ? g.members.some(m => on(m.index)) : mask(p.index) !== 0);
      const tip = (k, b) => repeated ? `Take this perk (${k + 1} of ${g.members.length})` : p.boxes > 1 ? `Box ${b.box + 1} of ${p.boxes}` : 'Take this perk';
      const btns = boxes.map((b, k) => `<button type="button" class="am-perk-check${b.ticked ? ' is-checked' : ''}" data-perkbox="${b.perk}.${b.box}" title="${tip(k, b)}" aria-label="${tip(k, b)}">${b.ticked ? '✓' : ''}</button>`).join('');
      const cards = p.removes.length
        ? p.removes.map((_, j) => slot(p.index, 'r', j)).join('') + '<span class="am-perk-arrow">→</span>' + (p.adds.length ? p.adds.map((_, j) => slot(p.index, 'a', j)).join('') : '<span class="am-perk-gone">removed</span>')
        : p.adds.map((_, j) => slot(p.index, 'a', j)).join('');
      const nCards = p.removes.length + p.adds.length, txt = !nCards ? p.label : perkRuleNote(p.label);
      const tag = repeated ? `×${g.members.length}` : p.boxes > 1 ? `all ${p.boxes}` : '';
      return `<div class="am-perk${done ? ' is-on' : ''}${partial ? ' is-partial' : ''}"${boxes.length === 1 ? ` data-perkrow="${boxes[0].perk}.0"` : ''}><span class="am-perk-boxes">${btns}</span><span class="am-perk-cards">${cards}</span>${txt ? `<span class="am-perk-text${nCards ? ' am-perk-note' : ''}">${perkTextHtml(txt)}</span>` : ''}${tag ? `<span class="am-perk-tag">${tag}</span>` : ''}</div>`;
    }).join('');
    const ms = MASTERIES[c.cls] || [], msOn = c.pk.ms.filter(i => i < ms.length).length;
    // same layout as the Journal popup: no portrait or header, bordered sections, footer. Changes apply at once (no save button).
    body = `<div class="chedit sedit">
      <section class="cesec"><h4>Perks <span>${c.pk.perks.length} of ${perks.length}</span></h4>
        <div class="perklist am-perklist">${rows || `<p class="mrow">No perk data for ${esc(c.cls)}.</p>`}</div></section>
      <section class="cesec"><h4>Masteries <span>${msOn} of ${ms.length}</span></h4>
        <div class="pkmast">${ms.map((t, i) => `<label class="pkm${c.pk.ms.includes(i) ? ' on' : ''}"><input type="checkbox" data-mastery="${i}" data-char="${esc(c.id)}"${c.pk.ms.includes(i) ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('') || '<p class="mrow">No masteries for this class.</p>'}</div></section>
      <div class="chfoot"><button type="button" class="btn6" data-modalclose>Close</button></div></div>`;
    extra = '<div class="pcbig" data-perkbig hidden></div>' + PVX;
  } else if (S.modal === 'amd') {
    title = 'Attack modifier deck'; big = ' amdbox';
    const A = S.amd || { tiles: [], specials: [], faces: [], total: 0, disc: 0 };
    const DOWN = '<img class="amico" src="../images/common/icons/draw.svg" alt="" draggable="false">', UNDO = REC_ICON.replace('<img ', '<img class="amico" ');
    const tiles = A.tiles.map(t => `<div class="amdtile real${t.n ? '' : ' none'}" title="${esc(t.face)}${t.rolling ? ' (reshuffles the deck)' : ''}"><div class="amcard" data-amzoom="${esc(t.key)}"><div class="amslot" data-keep data-amslot="${esc(t.key)}"></div><b>${t.n}/${t.base}</b></div>
      <div class="amfoot"><button type="button" data-amact="draw" data-key="${esc(t.key)}"${t.n ? '' : ' disabled'} title="Draw one ${esc(t.face)}">${DOWN}</button><button type="button" data-amact="ret" data-key="${esc(t.key)}"${t.d ? '' : ' disabled'} title="Return one ${esc(t.face)} from the discard to the deck" aria-label="Return one ${esc(t.face)}">${UNDO} ${t.d}</button></div></div>`).join('');
    const specials = A.specials.map(sp => `<div class="amdtile real${sp.n ? '' : ' none'}"><div class="amcard"><img src="${esc(sp.img)}" alt="${esc(sp.label)}" draggable="false"><b>${sp.n}</b></div>
      <div class="amfoot"><button type="button" data-amact="draw" data-key="${sp.key}"${sp.n ? '' : ' disabled'} title="Draw (removes the card from the game)">${DOWN}</button><button type="button" data-amact="rem" data-key="${sp.key}"${sp.n ? '' : ' disabled'} title="Remove one ${sp.label} card">&minus;</button><button type="button" data-amact="add" data-key="${sp.key}"${sp.n >= sp.max ? ' disabled' : ''} title="Add one ${sp.label} card">+</button></div></div>`).join('');
    const code = amdRollCode(A.faces);
    body = `<div class="amdbar"><span class="mrow" style="margin:0">${A.total} in deck &middot; ${A.disc} in discard</span><span class="amdbtns"><button type="button" class="btn6" data-code="${esc(code)}" title="Copy GeekRoller code" aria-label="Copy GeekRoller code"${code ? '' : ' disabled'}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg></button><button type="button" class="btn6" data-amact="shuffle" title="Shuffle deck now (the discard goes back)" aria-label="Shuffle deck now"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button></span></div>
      <div class="amdgrid">${tiles}${specials}</div>${S.amZoom ? `<div class="pcbig" style="--zw:340px"><div class="amslot" data-keep data-amslot="${esc(S.amZoom)}" data-big></div></div>` : ''}`;
  } else if (S.modal === 'enh') {
    title = 'Enhancements'; big = ' sbox';
    const rows = (S.enh || []).map(({ e, i }) => `<tr><td>${esc(e.card)}</td><td>${esc(e.top ?? '\u2013')}</td><td>${esc(e.bottom ?? '\u2013')}</td><td><input class="enhprice" type="number" min="0" max="9999" inputmode="numeric" value="${e.price ?? ''}" placeholder="gold" data-enhprice="${i}" aria-label="Price of ${esc(e.card)}"> <button type="button" class="delx" data-enhdel="${i}" aria-label="Remove ${esc(e.card)}">&times;</button></td></tr>`).join('');
    // rows derived from the stickers placed on cards (top = upper half of the card, bottom = lower half)
    const derived = Object.entries(c.mk || {}).filter(([k, l]) => k.startsWith('c:') && l.some(m => m.s)).map(([k, l]) => {
      const st = l.filter(m => m.s), part = top => { const n = {}; st.filter(m => (m.y < 50) === top).forEach(m => { n[m.k] = (n[m.k] || 0) + 1; }); return Object.keys(n).map(q => markLabel(q) + (n[q] > 1 ? ` ×${n[q]}` : '')).join(', ') || '–'; };
      const card = X.cardById.get(Number(k.slice(2)));
      return { k, name: X.pretty(card?.slug ?? k.slice(2)), top: part(true), bottom: part(false) };
    }).sort((a, b) => a.name.localeCompare(b.name));
    const drows = derived.map(d => `<tr><td>${esc(d.name)}</td><td>${esc(d.top)}</td><td>${esc(d.bottom)}</td><td><input class="enhprice" type="number" min="0" max="9999" inputmode="numeric" value="${c.mp?.[d.k] ?? ''}" placeholder="gold" data-mkprice="${d.k}" data-char="${esc(c.id)}" aria-label="Price of ${esc(d.name)}"></td></tr>`).join('');
    body = `<div class="chedit sedit">
      <section class="cesec"><h4>Enhancements</h4><table class="enhtable"><thead><tr><th>Card</th><th>Top</th><th>Bottom</th><th>Price</th></tr></thead><tbody>${rows}${drows}${rows || drows ? '' : '<tr><td colspan="4" class="enhempty">No enhancements logged for this class.</td></tr>'}</tbody></table></section>
      <section class="cesec"><h4>Add enhancement</h4>
        <div class="addrow"><input data-enh-card list="enh-cards" placeholder="Card" aria-label="Card"><datalist id="enh-cards">${(S.enhCards || []).map(n => `<option value="${esc(n)}">`).join('')}</datalist><input data-enh-top placeholder="Top" aria-label="Top"><input data-enh-bottom placeholder="Bottom" aria-label="Bottom"><input data-enh-price placeholder="Gold" aria-label="Price" style="width:70px" inputmode="numeric"><button type="button" class="btn6" data-enhadd data-char="${esc(c.id)}">Add</button></div></section>
      <div class="chfoot"><button type="button" class="btn6" data-modalclose>Close</button></div></div>`;
  } else if (S.modal === 'history') {
    title = 'History'; big = ' sbox';
    const log = S.log || [], kinds = [...new Set(log.map(e => e.kind))].sort(), f = S.histKind || 'all';
    const rows = log.filter(e => f === 'all' || e.kind === f);
    body = `<div class="chedit sedit"><section class="cesec"><h4>Changes</h4><div class="histbar"><label for="histfilter">Show</label><select id="histfilter" data-histkind><option value="all">All</option>${kinds.map(k => `<option${k === f ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select><span class="hn">${rows.length} entries</span></div>
      <div class="hlist">${rows.length ? rows.slice(0, 300).map(e => { const d = new Date(e.t); return `<div class="hrow"><time>${d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><span class="hc">${esc(e.kind)}</span><span>${esc(e.d)}${e.u ? `<small>${esc(e.u)}</small>` : ''}</span></div>`; }).join('') : '<div class="hempty">No changes recorded for this character yet.</div>'}</div></section>
      <div class="chfoot"><button type="button" class="btn6" data-modalclose>Close</button></div></div>`;
  } else if (S.modal === 'char') {
    title = 'Edit character';
    const f = S.cf || { name: c.name, seat: c.seat ?? '', cls: c.cls, special: c.special || [] };
    const free = SPECIAL_TRAITS.filter(t => !f.special.includes(t.key)), cls = f.cls || c.cls, changed = cls !== c.cls;
    const opts = (S.classOpts || []).map(k => `<option value="${esc(k.name)}"${k.name === cls ? ' selected' : ''}>${esc(k.name)}${k.locked ? ' (locked)' : ''}</option>`).join('');
    body = `<div class="chedit">
      <div class="cehero"><div class="ceport" style="${esc(X.portraitStyle({ ...c, cls }, 76))}" role="img" aria-label="Class portrait"></div><div class="cehtxt"><b>${esc(f.name || c.name)}</b><span>${esc(cls)}${changed ? ` <em>(was ${esc(c.cls)})</em>` : ''}</span></div></div>
      <section class="cesec"><h4>Identity</h4><div class="cegrid">
        <label>Name<input data-cf="name" maxlength="30" autocomplete="off" value="${esc(f.name)}"></label>
        <label>Player<select data-cf="seat"><option value="">(nobody)</option>${(S.players || []).map(p => `<option value="${esc(p.seat)}"${String(p.seat) === String(f.seat) ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label></div></section>
      <section class="cesec"><h4>Class</h4>
        <label>Class<select data-cf="cls">${opts}</select></label>
        <div class="cerow"><span class="celab">Class traits</span><span class="chips">${S.classChips || '<span class="hint">none</span>'}</span></div>
        ${changed ? `<div class="cewarn" role="alert"><b>Switching to ${esc(cls)} starts the character over.</b> Name, player, level, XP, gold, ability cards, items, perks and masteries, markers, class tokens, battle goals, personal quests and the modifier deck are reset. Inherited perks, event traits and notes stay, and the level 1 and X ability cards of the new class are unlocked. Enhancements stay in the campaign. The Undo button of the page takes it back.</div>` : ''}</section>
      <section class="cesec"><h4>Event traits</h4>
        <div class="cerow"><span class="chips">${f.special.length ? f.special.map(k => `<span class="chip info">${esc(specialName(k))}<button type="button" class="chx" data-cfx="${esc(k)}" aria-label="Remove ${esc(specialName(k))}">&times;</button></span>`).join('') : '<span class="hint">none</span>'}</span></div>
        <select data-cfadd aria-label="Add an event trait"><option value="">Add a trait...</option>${free.map(t => `<option value="${esc(t.key)}">${esc(t.name)}</option>`).join('')}</select></section>
      <div class="chfoot"><button type="button" class="btn6" data-modalclose>Cancel</button><button type="button" class="btn6 ${changed ? 'ce-danger' : 'ce-save'}" data-cfsave>${changed ? 'Reset and switch class' : 'Save'}</button></div></div>`;
  } else if (S.modal === 'amdpile') {
    const A = S.amd || { pile: [], disc: 0 };
    title = 'Modifier discard'; big = ' big';
    const cell = t => `<div class="pcell amcell" data-amcell="${esc(t.key)}" title="${esc(t.face)}"><button type="button" class="rec" data-amact="ret" data-key="${esc(t.key)}" title="Recover ${esc(t.face)}" aria-label="Recover ${esc(t.face)}">${REC_ICON}</button><span class="amslot" data-keep data-amslot="${esc(t.key)}"></span></div>`;
    body = `<div class="poolbar"><span>${A.pile.length} ${A.pile.length === 1 ? 'card' : 'cards'}</span><span class="grow"></span><button type="button" class="btn6" data-amact="shuffle" title="Shuffle all back into the deck" aria-label="Shuffle all back into the deck"${A.pile.length ? '' : ' disabled'}>${REC_ICON}</button></div><div class="pilelist">${A.pile.length ? A.pile.map(cell).join('') : '<p class="mrow">Nothing here.</p>'}</div>`;
  } else if (S.modal === 'pile') {
    const z = S.pileZ === 'lost' ? 'lost' : 'disc';
    title = z === 'lost' ? 'Lost' : 'Discard'; big = ' big';
    const ids = (c[z] || []).filter(id => c.deck.includes(id));
    const cell = id => { const card = X.cardById.get(id), url = X.cardImageUrl(card), name = X.pretty(card?.slug ?? id); return `<div class="pcell" data-pcard="${id}" title="${esc(name)}"><button type="button" class="rec" data-pilerec="${id}" data-char="${esc(c.id)}" title="Recover ${esc(name)}" aria-label="Recover ${esc(name)}">${REC_ICON}</button>${url ? `<img src="${esc(url)}" alt="${esc(name)}" draggable="false">` : `<div class="noimg">${esc(name)}</div>`}${markersHtml(c.mk?.[`c:${id}`])}</div>`; };
    body = `<div class="poolbar"><span>${ids.length} ${ids.length === 1 ? 'card' : 'cards'}</span><span class="grow"></span><button type="button" class="btn6" data-pilerecall="${z}" data-char="${esc(c.id)}" title="Recover all" aria-label="Recover all"${ids.length ? '' : ' disabled'}>${REC_ICON}</button></div><div class="pilelist">${ids.length ? ids.map(cell).join('') : '<p class="mrow">Nothing here.</p>'}</div>`;
    extra = '<img class="pilezoom" data-pilezoom alt="" hidden><div class="pilezoomtk" data-pilezoomtk hidden></div>' + PVX;
  } else return '';
  return `<div class="mmodal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mmodalbox${big}"><button type="button" class="mmodalx" data-modalclose aria-label="Close">&times;</button><h2>${esc(title)}</h2>${body}</div>${extra}</div>`;
}

// ---- the journal: battle goals, personal quest, notes ----
const DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const STATUS = { deck: 'In deck', mine: 'Mine', other: 'Other player', done: 'Completed', disc: 'Discarded' };
const cap = t => String(t).replace(/-/g, ' ').replace(/^./, m => m.toUpperCase());
const questNo = slug => slug.slice(2);

// BGG roll codes over the cards still in the deck (ids = position in the list, 1 based): three goals, or one quest.
export const goalRollCode = deck => (deck.length ? `3custom${deck.length}{${deck.map(sl => BATTLE_GOALS.findIndex(g => g.slug === sl) + 1).join(';')}}` : '');
export const questRollCode = deck => (deck.length ? `1custom${deck.length}{${deck.map(sl => Number(questNo(sl))).join(';')}}` : '');

// Markdown of the notes (headings, bold, italic, code, lists, to do items with a clickable box); the text is escaped first.
const mdInline = (t, esc) => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>');
export function mdRender(src, esc) {
  let out = '', list = false, n = -1;
  const close = () => { if (list) { out += '</ul>'; list = false; } };
  String(src).split('\n').forEach(line => {
    n++;
    let m;
    if ((m = line.match(/^(#{1,3})\s+(.*)/))) { close(); const l = m[1].length + 2; out += `<h${l}>${mdInline(m[2], esc)}</h${l}>`; }
    else if ((m = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)/))) { if (!list) { out += '<ul>'; list = true; } out += `<li class="td"><label><input type="checkbox" data-mdline="${n}"${m[1] !== ' ' ? ' checked' : ''}> ${mdInline(m[2], esc)}</label></li>`; }
    else if ((m = line.match(/^\s*[-*]\s+(.*)/))) { if (!list) { out += '<ul>'; list = true; } out += `<li>${mdInline(m[1], esc)}</li>`; }
    else if (!line.trim()) close();
    else { close(); out += `<p>${mdInline(line, esc)}</p>`; }
  });
  close();
  return out;
}

function journalBody(c, X, S) {
  const { esc } = X, cid = esc(c.id);
  const tabs = [['goal', 'Battle goals'], ['quest', 'Personal quest'], ['notes', 'Notes']];
  const tab = tabs.some(t => t[0] === S.jtab) ? S.jtab : 'goal';
  const head = `<div class="seg jtabs" role="tablist" aria-label="Journal section">${tabs.map(([k, l]) => `<button type="button" data-jtab="${k}" aria-pressed="${k === tab}">${l}</button>`).join('')}</div>`;
  const roll = (k, code) => `<button type="button" class="btn6 rollbtn" data-roll="${k}" data-code-text="${esc(code)}"${code ? '' : ' disabled'} title="${code ? 'Copy the GeekRoller code over the cards still in the deck' : 'Nothing left in the deck'}">${DICE}<span>BGG code for roll</span></button>`;
  const label = k => (k === 'mine' ? esc(c.name) : STATUS[k]);                                     // held by this character: shown with the name
  const statusSel = (attr, slug, st) => `<select ${attr} data-slug="${slug}" aria-label="Status">${Object.keys(STATUS).map(k => `<option value="${k}"${k === st ? ' selected' : ''}>${label(k)}</option>`).join('')}</select>`;

  if (tab === 'goal') {
    const st = sl => holdStatus(S.bgs, c.id, sl), deck = BATTLE_GOALS.filter(g => st(g.slug) === 'deck').map(g => g.slug);
    // From this character's view only its own goals show as held; goals held by other players and discarded goals both look discarded, so nobody can see who holds which goal
    const seen = sl => (['mine', 'done', 'deck'].includes(st(sl)) ? st(sl) : 'disc');
    const goal = sl => BATTLE_GOALS.find(g => g.slug === sl);
    const card = (g, tag, cls = '') => `<${tag} class="bgcard${cls}"${tag === 'button' ? ` type="button" data-bgkeep="${g.slug}"` : ''}><b>${esc(cap(g.slug))}</b>${esc(g.t)}<br><small>${g.chk} checkmark${g.chk > 1 ? 's' : ''}</small></${tag}>`;
    const mine = BATTLE_GOALS.find(g => ['mine', 'done'].includes(st(g.slug)))?.slug;
    const cur = c.bgo ? null : (goal(S.bgv) ? S.bgv : mine || null);
    const strip = `<div class="pqdeck" title="Click a goal to show it"><span class="pqdl">${deck.length} of ${BATTLE_GOALS.length} in deck</span>${BATTLE_GOALS.map((g, i) => `<button type="button" class="pqchip st-${seen(g.slug)}${g.slug === cur ? ' cur' : ''}" data-bggo="${g.slug}" title="${esc(cap(g.slug))}: ${label(seen(g.slug))}">${i + 1}</button>`).join('')}</div>`;
    let main;
    if (c.bgo) main = `<p class="mrow">Pick one to keep:</p><div class="bgcards">${c.bgo.map(sl => card(goal(sl), 'button')).join('')}</div><div class="pqrow"><button type="button" class="btn6" data-bgdraw data-char="${cid}"${deck.length < 3 ? ' disabled' : ''}>Draw again</button><button type="button" class="btn6" data-bgcancel data-char="${cid}">Cancel</button></div>`;
    else if (cur && seen(cur) === 'disc') main = '<p class="mrow">Discarded.</p>';
    else if (cur) main = `<div class="bgcards">${card(goal(cur), 'div', ` kept${st(cur) === 'done' ? ' done' : ''}`)}</div><div class="pqrow"><label for="bgst">Status</label>${statusSel('id="bgst" data-bgst', cur, st(cur))}<button type="button" class="btn6" data-bgdrop data-slug="${cur}" data-char="${cid}">Return to deck</button></div>`;
    else main = '<p class="mrow">No goal drawn for this scenario yet.</p>';
    return `${head}<div class="jtab" data-jpane="goal"><section class="cesec"><h4>Deck</h4>${strip}</section><section class="cesec"><h4>This scenario</h4>${main}</section><div class="chfoot"><button type="button" class="btn6" data-bgreset title="New scenario: all goals back in the deck">Return all to deck</button>${roll('bg', goalRollCode(deck))}<button type="button" class="btn6 jprimary" data-bgdraw data-char="${cid}"${deck.length < 3 || c.bgo ? ' disabled' : ''}>Draw three goals</button></div></div>`;
  }

  if (tab === 'quest') {
    const st = sl => holdStatus(S.pq, c.id, sl), deck = PERSONAL_QUESTS.filter(q => st(q.slug) === 'deck').map(q => q.slug);
    const nameOf = sl => GH2_PQ[sl]?.name || sl;
    const img = sl => `<img src="${esc(X.pqImg(sl))}" alt="Personal quest ${esc(sl)}">`;
    // The same view rule as the battle goals: quests held by other players and discarded ones look discarded
    // a quest another character has active shows as Active (no name); other held and discarded quests show as discarded
    const otherActive = sl => { const e = S.pq?.[sl]; return !!e && e.st === 'mine' && e.c !== c.id; };
    const seen = sl => (otherActive(sl) ? 'other' : ['mine', 'done', 'deck', 'locked'].includes(st(sl)) ? st(sl) : 'disc');
    const LABEL = { deck: 'Unlocked', locked: 'Locked', mine: 'Active', other: 'Active', done: 'Completed', disc: 'Discarded' };
    const active = PERSONAL_QUESTS.find(q => st(q.slug) === 'mine')?.slug || null;
    if (c.pqo) return `${head}<div class="jtab" data-jpane="quest"><p class="mrow">Pick one to keep:</p><div class="pqoffer">${c.pqo.map(sl => `<button type="button" class="pqpick" data-pqkeep="${sl}" title="Keep ${esc(sl)} ${esc(nameOf(sl))}">${img(sl)}<span>${questNo(sl)} ${esc(nameOf(sl))}</span></button>`).join('')}</div><div class="pqrow"><button type="button" class="btn6 jprimary" data-pqdraw data-char="${cid}"${deck.length < 2 ? ' disabled' : ''}>Draw again</button><button type="button" class="btn6" data-pqcancel data-char="${cid}">Cancel</button></div></div>`;
    const cur = PERSONAL_QUESTS.some(q => q.slug === S.pqv) ? S.pqv : (active || PERSONAL_QUESTS[0].slug);
    const q = GH2_PQ[cur] || { name: cur, reqs: [] };
    const held = ['mine', 'done'].includes(st(cur));
    const cnt = (c.pqc && c.pqc[cur]) || [];
    const done = i => (cnt[i] || 0) >= q.reqs[i].n, open = i => q.reqs[i].after.every(done);
    const all = q.reqs.length && q.reqs.every((r, i) => done(i));
    const reqs = q.reqs.map((r, i) => {
      const off = !held || !open(i);
      const ctl = r.n > 1
        ? `<span class="pqc"><span class="sp"><b>${Math.min(cnt[i] || 0, r.n)} / ${r.n}</b><span class="spc"><button type="button" data-pqreq="${i}" data-slug="${cur}" data-char="${cid}" data-d="1" aria-label="Increase"${off || done(i) ? ' disabled' : ''}>${UP}</button><button type="button" data-pqreq="${i}" data-slug="${cur}" data-char="${cid}" data-d="-1" aria-label="Decrease"${off || !(cnt[i] || 0) ? ' disabled' : ''}>${DN}</button></span></span></span>`
        : `<span class="pqc"><label class="pqcheck"><input type="checkbox" data-pqchk="${i}" data-slug="${cur}" data-char="${cid}"${done(i) ? ' checked' : ''}${off ? ' disabled' : ''}> done</label></span>`;
      return `<div class="pqreq${open(i) ? '' : ' locked'}${done(i) ? ' done' : ''}"><span class="pqt">${esc(r.t)}</span>${ctl}</div>`;
    }).join('');
    const strip = `<div class="pqdeck" title="Click a quest to show it"><span class="pqdl">${deck.length} of ${PERSONAL_QUESTS.length} unlocked</span>${PERSONAL_QUESTS.map(x => `<button type="button" class="pqchip st-${seen(x.slug)}${x.slug === cur ? ' cur' : ''}" data-pqgo="${x.slug}" title="${esc(x.slug)}${seen(x.slug) === 'locked' ? ': Locked' : ` ${esc(nameOf(x.slug))}: ${esc(LABEL[seen(x.slug)])}`}">${questNo(x.slug)}</button>`).join('')}</div>`;
    const blocked = !!active && active !== cur && !held;                                   // one active quest per character
    const sel = `<select id="pqst" data-pqst data-slug="${cur}" aria-label="Status">${['deck', 'locked', ...(blocked ? [] : ['mine']), 'done'].map(k => `<option value="${k}"${k === st(cur) ? ' selected' : ''}>${esc(LABEL[k])}</option>`).join('')}</select>`;
    const hint = blocked ? `<p class="mrow">${esc(c.name)} already has ${esc(active)} active. Set it to Unlocked first.</p>` : held ? '' : `<p class="mrow">Set the status to ${esc(c.name)} to count the requirements.</p>`;
    // a locked quest shows nothing but its status (to unlock it): no picture, name or requirements
    const shown = seen(cur) === 'disc'
      ? '<p class="mrow">Discarded.</p>'
      : seen(cur) === 'other'
        ? '<div class="pqdock"><div class="pqside"><div class="pqrow"><label>Status</label><span class="pqstatic">Active</span></div></div></div>'
      : st(cur) === 'locked'
        ? `<div class="pqdock"><div class="pqcard"><div class="pqlocked">Locked</div></div><div class="pqside"><div class="pqrow"><label for="pqst">Status</label>${sel}</div></div></div>`
        : `<div class="pqdock"><div class="pqcard">${img(cur)}</div><div class="pqside"><h4>${esc(q.name)}${all ? ' <span class="chip info">Complete</span>' : ''}</h4><div class="pqrow"><label for="pqst">Status</label>${sel}</div>${hint}${reqs}</div></div>`;
    return `${head}<div class="jtab" data-jpane="quest"><section class="cesec"><h4>Quests</h4>${strip}</section><section class="cesec"><h4>This quest</h4>${shown}</section><div class="chfoot">${roll('pq', questRollCode(deck))}<button type="button" class="btn6 jprimary" data-pqdraw data-char="${cid}"${deck.length < 2 || active ? ' disabled' : ''}${active ? ` title="${esc(c.name)} already has an active quest"` : ''}>Draw two Personal Quests</button></div></div>`;
  }

  return `${head}<div class="jtab notespane" data-jpane="notes"><section class="cesec notesec"><h4>Notes</h4><div class="mdbar"><button type="button" class="btn6" data-md="b" title="Bold (Ctrl+B)"${S.notesPreview ? ' disabled' : ''}><b>B</b></button><button type="button" class="btn6" data-md="i" title="Italic (Ctrl+I)"${S.notesPreview ? ' disabled' : ''}><i>I</i></button><button type="button" class="btn6" data-md="h" title="Heading"${S.notesPreview ? ' disabled' : ''}>H</button><button type="button" class="btn6" data-md="ul" title="Bullet list"${S.notesPreview ? ' disabled' : ''}>&bull; List</button><button type="button" class="btn6" data-md="todo" title="Checkbox"${S.notesPreview ? ' disabled' : ''}>&#9744; Todo</button><button type="button" class="btn6 mdview" data-mdview aria-pressed="${!!S.notesPreview}">${S.notesPreview ? 'Edit' : 'Preview'}</button></div>
    <textarea class="notesarea" data-notes data-char="${cid}" placeholder="Notes for this character (markdown: **bold**, *italic*, # heading, - list, - [ ] todo)"${S.notesPreview ? ' hidden' : ''}>${esc(c.notes || '')}</textarea>
    <div class="mdprev"${S.notesPreview ? '' : ' hidden'} data-mdprev data-char="${cid}">${mdRender(c.notes || '', esc) || '<p class="mrow">Nothing yet.</p>'}</div></section></div>`;
}
