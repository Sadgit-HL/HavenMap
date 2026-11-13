// The playmat of the Mercenaries tab (design: campaign/mockups/merc-6-playmat-v2.html, styles: campaign/playmat.css, generated).
// playmatHtml() turns one character of the record into the playmat markup; the page (app.js) wires the clicks and drags to the
// pure edit functions in scripts/campaign/edit.js, so everything done here is saved, undoable and logged in the history.
import { handList, zoneOf } from '../scripts/campaign/record.js';
import { tokenDefs, TOKEN_IMAGE_DIR } from '../scripts/campaign/classTokens.js';
import { BGG_ICON_GROUPS } from '../scripts/campaign/bggIcons.js';
import { BANNERS, BANNER_ICON_DIR } from '../scripts/campaign/bggBanners.js';
import { holdStatus } from '../scripts/campaign/edit.js';
import { amdRollCode, perkList } from '../scripts/campaign/amdDeck.js';
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
// X = helpers of the page: { esc, pretty, cardById, itemById, cardImageUrl, itemImageUrl, cardBackUrl, portraitStyle, traitChips, playerName }
export function playmatHtml(c, X, S = {}) {
  const { esc } = X;
  const cid = esc(c.id);
  const nameOf = id => X.pretty(X.cardById.get(id)?.slug ?? id);
  const iniOf = id => X.cardById.get(id)?.ini;

  // a card as it lies in the hand, the active area or on a pile
  const ac = (id, i) => {
    const card = X.cardById.get(id), url = X.cardImageUrl(card), name = nameOf(id), ini = iniOf(id);
    const inner = url ? `<img src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`;
    return `<div class="ac" draggable="true" data-card="${id}" data-char="${cid}"${ini != null ? ` data-ini="${ini}"` : ''}${i != null ? ` style="--i:${i}"` : ''} title="${esc(name)}">${inner}${ini != null ? `<span class="inib" title="Initiative ${ini}">${ini}</span>` : ''}</div>`;
  };

  // a face-down or face-up card in a play slot
  const back = `<img class="realback" src="${esc(X.cardBackUrl(c.cls))}" alt="${esc(c.cls)} card back" draggable="false">`;
  const slotHtml = (i) => {
    const p = c.play[i];
    const inner = !p ? `<div class="slotempty">${i + 1}</div>` : (() => {
      const card = X.cardById.get(p.id), url = X.cardImageUrl(card), name = nameOf(p.id), ini = iniOf(p.id);
      return `<div class="flipcard${p.up ? ' is-front settled' : ''}" draggable="true" data-card="${p.id}" data-char="${cid}" data-slot="${i}"${ini != null ? ` data-ini="${ini}"` : ''} role="button" tabindex="0" title="Click to flip: ${esc(name)}"><div class="flipinner"><div class="face back">${back}</div><div class="face front">${url ? `<img src="${esc(url)}" alt="${esc(name)}" draggable="false">` : `<div class="noimg">${esc(name)}</div>`}</div></div></div>`;
    })();
    return `<div class="slot6${i === 0 ? ' first' : ''}" data-slot="${i + 1}" data-zone="play${i + 1}" data-char="${cid}"><div class="slotcard">${inner}</div></div>`;
  };
  const p1 = c.play[0], playIni = p1 && p1.up ? (iniOf(p1.id) ?? '?') : '?';

  // zones
  const lists = { active: [], discard: [], lost: [] };
  for (const id of c.deck) { const z = zoneOf(c, id); if (lists[z]) lists[z].push(id); }
  const active = c.act.filter(id => lists.active.includes(id));
  const hand = handList(c);
  const top = z => { const a = z === 'discard' ? c.disc : c.lost; const id = a.filter(x => c.deck.includes(x)).at(-1); return id == null ? '<div class="slotempty">Empty</div>' : ac(id); };
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
  const items = c.items.map(it => {
    const item = X.itemById.get(it.id), url = X.itemImageUrl(item), name = X.pretty(item?.slug ?? it.id), spent = (it.st || []).some(Boolean);
    return `<div class="it${spent ? ' spent' : ''}" data-itemstate data-id="${esc(it.id)}" title="${esc(name)}${item?.slot ? ` (${esc(item.slot)})` : ''}">${url ? `<img src="${esc(url)}" alt="${esc(name)}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(name)}</div>`}</div>`;
  }).join('');

  return `<div class="pm" data-zactive="hover" data-zplay="hover" data-zhand="hover" data-zpiles="hover" data-zitems="hover" data-inib="on" data-motion="full">
  <div class="stage6">
    <header class="hud"><div class="portrait" style="${esc(X.portraitStyle(c, 72))}" role="img" aria-label="Class portrait (cropped from the character mat)"></div>
      <div class="who"><div class="namerow"><h1>${esc(c.name)}</h1></div><div class="sub">${esc(c.cls)}${X.playerName(c) ? ` &middot; played by ${esc(X.playerName(c))}` : ''}</div><div class="chips">${X.traitChips(c)}</div></div>
      <div class="sep"></div>
      <div class="lvl" title="Level">${lv}</div>
      <div class="xp" title="Level ${lv}: ${lo} XP.${hi ? ` Next level (${lv + 1}) at ${hi} XP.` : ' Maximum level.'}"><div class="xprow"><span class="xplab">XP</span>${sp('xp', 'XP', 'span', c.xp ?? 0)}<span class="xpto">/ <em>${hi ?? 'max'}</em></span></div><div class="xpbar"><b style="width:${pct}%"></b></div></div>
      <div class="stat"><small>Gold</small>${sp('gold', 'gold', 'b', c.gold ?? 0)}</div>
      <div class="stat"><small>Inherited perks</small>${sp('inh', 'inherited perks', 'b', c.inh ?? 0)}</div>
      <div class="counters">${tokens}</div>
      <div class="grp"><small>BGG code</small><span class="bggseg"><button type="button" class="bggb" data-bgg="amd" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: AMD">${DICE}<span>AMD</span></button><button type="button" class="bggb" data-bgg="turn" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: Turn">${DOC}<span>Turn</span></button><button type="button" class="bggb" data-bgg="cards" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: Cards">${CARDS_ICON}<span>Cards</span></button></span></div>
    </header>
    <section class="shelf6" aria-label="Items"><h4>Items <span class="itbar"><span>${c.items.length}</span></span></h4>${items}</section>
    <section class="board6">
      <div class="toprow">
        <div class="zone"><span class="zlabel">Active &middot; <b>${active.length}</b></span><div class="activelist" data-zone="active" data-char="${cid}">${active.map(id => ac(id)).join('')}</div></div>
        <div class="zone play"><span class="zlabel">Play area &middot; Initiative <b>${playIni}</b></span>${slotHtml(0)}${slotHtml(1)}</div>
      </div>
      <div class="hand6" data-layout="spread"><div class="hbar"><span class="zlabel">Hand &middot; <b class="${limit && hand.length > limit ? 'over-limit' : ''}">${hand.length}</b>${limit ? ` of <span>${esc(limit)}</span>` : ''}</span><span class="hctl"><span class="sortgrp"><button type="button" class="btn6" data-handsort="ini" data-char="${cid}" title="Sort by initiative and keep the hand sorted">Ini</button><button type="button" class="btn6" data-handsort="lvl" data-char="${cid}" title="Sort by level once">Lvl</button></span></span></div><div class="fan6" data-zone="hand" data-char="${cid}">${hand.map((id, i) => ac(id, i)).join('')}</div></div>
    </section>
    <section class="piles6">${pile('discard', 'Discard', ' target')}${pile('lost', 'Lost', ' lost target')}</section>
    ${dockHtml()}
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

// ---- the dock (buttons that open the modals) and the modals ----
const ICON = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const DOCK = [
  ['journal', 'Journal', 'Battle goals, personal quest and notes (tabs in one modal)', ICON('<path d="M6 3h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 17a2 2 0 0 0 2 2M10 8h6M10 12h6"/>')],
  ['mat', 'Character mat', 'Character mat, front and back', ICON('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v14"/>')],
  ['perks', 'Perks & masteries', 'Perk selection and masteries', ICON('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>')],
  ['amd', 'Attack modifiers', 'Attack modifier deck: draw, return, bless and curse, roll code', ICON('<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h10a3 3 0 0 1 3 3v11"/><path d="M9.5 13.5h4M11.5 11.5v4"/>')],
  ['enh', 'Enhancements', 'Enhancement table (editable)', ICON('<path d="M4 18h16M6 18v-3h12v3M8 15c0-3 1-5 4-6V6h5v3H12"/>')],
  ['codes', 'BGG codes', 'Copy a forum post code', ICON('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/>')],
  ['history', 'History', 'History of changes of this character', ICON('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')],
];
const dockHtml = () => `<aside class="dock" aria-label="Modals">${DOCK.map(([id, label, tip, svg]) => `<button type="button" class="mbtn" data-modal="${id}" title="Opens modal: ${tip}">${svg}<span>${label}</span></button>`).join('')}</aside>`;

function modalHtml(c, X, S) {
  if (!S.modal) return '';
  const { esc } = X;
  let title = '', big = '', body = '';
  if (S.modal === 'mat') {
    title = 'Character mat'; big = ' big';
    const side = S.matSide === 'back' ? 'back' : 'front';
    body = `<div class="matflip"><img src="${esc(X.matUrl(c.cls, side))}" alt="${esc(c.cls)} mat, ${side}" data-matflip role="button" tabindex="0" title="Click to flip"></div>`;
  } else if (S.modal === 'codes') {
    title = 'BGG forum codes';
    const icons = BGG_ICON_GROUPS.map(g => `<div class="bgg-block"><h4>${esc(g.h)}</h4><div class="bgg-row">${g.icons.map(i => `<button type="button" class="bgg-ic" data-code="${esc(i.c)}" title="${esc(i.n)}: copy ${esc(i.c)}" aria-label="Copy ${esc(i.n)} icon code"><img src="${esc(i.img)}" alt="${esc(i.n)}"${i.inv ? ' class="inv"' : ''}></button>`).join('')}</div></div>`).join('');
    const banners = BANNERS.map(b => `<button type="button" class="bnrtile" data-bnr="${b.slug}" title="Copy the ${esc(b.name)} banner code">${b.icon ? `<img src="${BANNER_ICON_DIR}${encodeURIComponent(b.icon)}.webp" alt="">` : '<span class="bnrnoimg">?</span>'}<span>${esc(b.name)}</span></button>`).join('');
    const custom = (S.customCodes || []).map((k, i) => `<div class="coderow"><div><b style="margin:0">${esc(k.label)}</b></div><span><button type="button" class="btn6" data-code="${esc(k.text)}">Copy</button> <button type="button" class="delx" data-codedel="${i}" aria-label="Remove ${esc(k.label)}">&times;</button></span></div>`).join('');
    body = `<div class="codelist"><h3 style="margin-top:0">Icons <span>click to copy</span></h3><div class="bgg-icons">${icons}</div></div>
      <div class="bnrsec"><h3>Class banners</h3><p class="bnrnote" data-bnrnote>Click a class to copy its <b>banner image</b> code.</p><div class="bnrgrid">${banners}</div></div>
      <div class="codelist">${custom}</div>
      <div class="addrow"><input data-code-label placeholder="Label" aria-label="Label"><input data-code-text placeholder="Code to copy" aria-label="Code" style="flex:2"><button type="button" class="btn6" data-codeadd>Add</button></div>`;
  } else if (S.modal === 'journal') {
    title = 'Journal'; big = ' jbox';
    body = journalBody(c, X, S);
  } else if (S.modal === 'perks') {
    title = 'Perks & masteries'; big = ' big';
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
    const ms = MASTERIES[c.cls] || [];
    body = `<h3>Perks <span>${c.pk.perks.length} of ${perks.length}</span></h3><div class="perklist am-perklist">${rows || `<p class="mrow">No perk data for ${esc(c.cls)}.</p>`}</div>
      <h3>Masteries <span>${c.pk.ms.filter(i => i < ms.length).length} of ${ms.length}</span></h3><div class="perklist">${ms.map((t, i) => `<label class="perkrow${c.pk.ms.includes(i) ? ' on' : ''}"><input type="checkbox" data-mastery="${i}" data-char="${esc(c.id)}"${c.pk.ms.includes(i) ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('') || '<p class="mrow">No masteries for this class.</p>'}</div>`;
  } else if (S.modal === 'amd') {
    title = 'Attack modifier deck'; big = ' amdbox';
    const A = S.amd || { tiles: [], specials: [], faces: [], total: 0, disc: 0 };
    const DOWN = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    const tiles = A.tiles.map(t => `<div class="amdtile real${t.n ? '' : ' none'}" title="${esc(t.face)}${t.rolling ? ' (reshuffles the deck)' : ''}"><div class="amcard" data-amzoom="${esc(t.key)}"><div class="amslot" data-keep data-amslot="${esc(t.key)}"></div><b>${t.n}/${t.base}</b></div>
      <div class="amfoot"><button type="button" data-amact="draw" data-key="${esc(t.key)}"${t.n ? '' : ' disabled'} title="Draw one ${esc(t.face)}">${DOWN}</button><button type="button" data-amact="ret" data-key="${esc(t.key)}"${t.d ? '' : ' disabled'} title="Return one ${esc(t.face)} from the discard to the deck">&#8630; ${t.d}</button></div></div>`).join('');
    const specials = A.specials.map(sp => `<div class="amdtile real${sp.n ? '' : ' none'}"><div class="amcard"><img src="${esc(sp.img)}" alt="${esc(sp.label)}" draggable="false"><b>${sp.n}</b></div>
      <div class="amfoot"><button type="button" data-amact="draw" data-key="${sp.key}"${sp.n ? '' : ' disabled'} title="Draw (removes the card from the game)">${DOWN}</button><button type="button" data-amact="rem" data-key="${sp.key}"${sp.n ? '' : ' disabled'} title="Remove one ${sp.label} card">&minus;</button><button type="button" data-amact="add" data-key="${sp.key}"${sp.n >= sp.max ? ' disabled' : ''} title="Add one ${sp.label} card">+</button></div></div>`).join('');
    const code = amdRollCode(A.faces);
    body = `<div class="amdbar"><span class="mrow" style="margin:0">${A.total} in deck &middot; ${A.disc} in discard</span><span class="amdbtns"><button type="button" class="btn6" data-code="${esc(code)}" title="Copy GeekRoller code" aria-label="Copy GeekRoller code"${code ? '' : ' disabled'}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg></button><button type="button" class="btn6" data-amact="shuffle" title="Shuffle deck now (the discard goes back)" aria-label="Shuffle deck now"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button></span></div>
      <div class="amdgrid">${tiles}${specials}</div>${S.amZoom ? `<div class="pcbig" style="--zw:340px"><div class="amslot" data-keep data-amslot="${esc(S.amZoom)}" data-big></div></div>` : ''}`;
  } else if (S.modal === 'enh') {
    title = 'Enhancements';
    const rows = (S.enh || []).map(({ e, i }) => `<tr><td>${esc(e.card)}</td><td>${esc(e.top ?? '\u2013')}</td><td>${esc(e.bottom ?? '\u2013')}</td><td><input class="enhprice" type="number" min="0" max="9999" inputmode="numeric" value="${e.price ?? ''}" placeholder="gold" data-enhprice="${i}" aria-label="Price of ${esc(e.card)}"> <button type="button" class="delx" data-enhdel="${i}" aria-label="Remove ${esc(e.card)}">&times;</button></td></tr>`).join('');
    body = `<table class="enhtable"><thead><tr><th>Card</th><th>Top</th><th>Bottom</th><th>Price</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="enhempty">No enhancements logged for this class.</td></tr>'}</tbody></table>
      <div class="addrow"><input data-enh-card list="enh-cards" placeholder="Card" aria-label="Card"><datalist id="enh-cards">${(S.enhCards || []).map(n => `<option value="${esc(n)}">`).join('')}</datalist><input data-enh-top placeholder="Top" aria-label="Top"><input data-enh-bottom placeholder="Bottom" aria-label="Bottom"><input data-enh-price placeholder="Gold" aria-label="Price" style="width:70px" inputmode="numeric"><button type="button" class="btn6" data-enhadd data-char="${esc(c.id)}">Add</button></div>`;
  } else if (S.modal === 'history') {
    title = 'History'; big = ' big';
    const log = S.log || [], kinds = [...new Set(log.map(e => e.kind))].sort(), f = S.histKind || 'all';
    const rows = log.filter(e => f === 'all' || e.kind === f);
    body = `<div class="histbar"><label for="histfilter">Show</label><select id="histfilter" data-histkind><option value="all">All</option>${kinds.map(k => `<option${k === f ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select><span class="hn">${rows.length} entries</span></div>
      <div class="hlist">${rows.length ? rows.slice(0, 300).map(e => { const d = new Date(e.t); return `<div class="hrow"><time>${d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><span class="hc">${esc(e.kind)}</span><span>${esc(e.d)}${e.u ? `<small>${esc(e.u)}</small>` : ''}</span></div>`; }).join('') : '<div class="hempty">No changes recorded for this character yet.</div>'}</div>`;
  } else return '';
  return `<div class="mmodal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mmodalbox${big}"><button type="button" class="mmodalx" data-modalclose aria-label="Close">&times;</button><h2>${esc(title)}</h2>${body}</div></div>`;
}

// ---- the journal: battle goals, personal quest, notes ----
const DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const STATUS = { deck: 'In deck', mine: 'Mine', other: 'Other player', done: 'Completed' };
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
  const statusSel = (attr, slug, st) => `<select ${attr} data-slug="${slug}" aria-label="Status">${Object.keys(STATUS).map(k => `<option value="${k}"${k === st ? ' selected' : ''}>${STATUS[k]}</option>`).join('')}</select>`;

  if (tab === 'goal') {
    const st = sl => holdStatus(S.bgs, c.id, sl), deck = BATTLE_GOALS.filter(g => st(g.slug) === 'deck').map(g => g.slug);
    const goal = sl => BATTLE_GOALS.find(g => g.slug === sl);
    const card = (g, tag, cls = '') => `<${tag} class="bgcard${cls}"${tag === 'button' ? ` type="button" data-bgkeep="${g.slug}"` : ''}><b>${esc(cap(g.slug))}</b>${esc(g.t)}<br><small>${g.chk} checkmark${g.chk > 1 ? 's' : ''}</small></${tag}>`;
    const mine = BATTLE_GOALS.find(g => ['mine', 'done'].includes(st(g.slug)))?.slug;
    const cur = c.bgo ? null : (goal(S.bgv) ? S.bgv : mine || null);
    const strip = `<div class="pqdeck" title="Click a goal to show it"><span class="pqdl">${deck.length} of ${BATTLE_GOALS.length} in deck</span>${BATTLE_GOALS.map((g, i) => `<button type="button" class="pqchip st-${st(g.slug)}${g.slug === cur ? ' cur' : ''}" data-bggo="${g.slug}" title="${esc(cap(g.slug))}: ${STATUS[st(g.slug)]}">${i + 1}</button>`).join('')}</div>`;
    let main;
    if (c.bgo) main = `<p class="mrow">Pick one to keep:</p><div class="bgcards">${c.bgo.map(sl => card(goal(sl), 'button')).join('')}</div><div class="pqrow"><button type="button" class="btn6" data-bgdraw data-char="${cid}"${deck.length < 3 ? ' disabled' : ''}>Draw again</button><button type="button" class="btn6" data-bgcancel data-char="${cid}">Cancel</button></div>`;
    else if (cur) main = `<div class="bgcards">${card(goal(cur), 'div', ` kept${st(cur) === 'done' ? ' done' : ''}`)}</div><div class="pqrow"><label for="bgst">Status</label>${statusSel('id="bgst" data-bgst', cur, st(cur))}<button type="button" class="btn6" data-bgdrop data-slug="${cur}" data-char="${cid}">Return to deck</button></div>`;
    else main = '<p class="mrow">No goal drawn for this scenario yet.</p>';
    return `${head}<div class="jtab" data-jpane="goal">${strip}${main}<div class="pqrow"><button type="button" class="btn6" data-bgdraw data-char="${cid}"${deck.length < 3 || c.bgo ? ' disabled' : ''}>Draw three goals</button>${roll('bg', goalRollCode(deck))}<button type="button" class="btn6" data-bgreset title="New scenario: all goals back in the deck">Return all to deck</button></div></div>`;
  }

  if (tab === 'quest') {
    const st = sl => holdStatus(S.pq, c.id, sl), deck = PERSONAL_QUESTS.filter(q => st(q.slug) === 'deck').map(q => q.slug);
    const nameOf = sl => GH2_PQ[sl]?.name || sl;
    const img = sl => `<img src="${esc(X.pqImg(sl))}" alt="Personal quest ${esc(sl)}">`;
    if (c.pqo) return `${head}<div class="jtab" data-jpane="quest"><p class="mrow">Pick one to keep:</p><div class="pqoffer">${c.pqo.map(sl => `<button type="button" class="pqpick" data-pqkeep="${sl}" title="Keep ${esc(sl)} ${esc(nameOf(sl))}">${img(sl)}<span>${questNo(sl)} ${esc(nameOf(sl))}</span></button>`).join('')}</div><div class="pqrow"><button type="button" class="btn6" data-pqdraw data-char="${cid}"${deck.length < 2 ? ' disabled' : ''}>Draw again</button><button type="button" class="btn6" data-pqcancel data-char="${cid}">Cancel</button></div></div>`;
    const heldMine = PERSONAL_QUESTS.find(q => ['mine', 'done'].includes(st(q.slug)))?.slug;
    const cur = PERSONAL_QUESTS.some(q => q.slug === S.pqv) ? S.pqv : (heldMine || PERSONAL_QUESTS[0].slug);
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
    const strip = `<div class="pqdeck" title="Click a quest to show it"><span class="pqdl">${deck.length} of ${PERSONAL_QUESTS.length} in deck</span>${PERSONAL_QUESTS.map(x => `<button type="button" class="pqchip st-${st(x.slug)}${x.slug === cur ? ' cur' : ''}" data-pqgo="${x.slug}" title="${esc(x.slug)} ${esc(nameOf(x.slug))}: ${STATUS[st(x.slug)]}">${questNo(x.slug)}</button>`).join('')}</div>`;
    return `${head}<div class="jtab" data-jpane="quest"><div class="pqdock"><div class="pqcard">${img(cur)}</div><div class="pqside">${strip}
      <div class="pqrow"><label for="pqsel">Quest</label><select id="pqsel" data-pqsel>${PERSONAL_QUESTS.map(x => `<option value="${x.slug}"${x.slug === cur ? ' selected' : ''}>${x.slug} ${esc(nameOf(x.slug))}</option>`).join('')}</select></div>
      <h4>${esc(q.name)}${all ? ' <span class="chip info">Complete</span>' : ''}</h4>
      <div class="pqrow"><label for="pqst">Status</label>${statusSel('id="pqst" data-pqst', cur, st(cur))}</div>
      ${held ? '' : '<p class="mrow">Set the status to Mine to count the requirements.</p>'}${reqs}
      <div class="pqrow"><button type="button" class="btn6" data-pqdraw data-char="${cid}"${deck.length < 2 ? ' disabled' : ''}>Draw two Personal Quests</button>${roll('pq', questRollCode(deck))}</div></div></div></div>`;
  }

  return `${head}<div class="jtab notespane" data-jpane="notes"><div class="mdbar"><button type="button" class="btn6" data-md="b" title="Bold (Ctrl+B)"${S.notesPreview ? ' disabled' : ''}><b>B</b></button><button type="button" class="btn6" data-md="i" title="Italic (Ctrl+I)"${S.notesPreview ? ' disabled' : ''}><i>I</i></button><button type="button" class="btn6" data-md="h" title="Heading"${S.notesPreview ? ' disabled' : ''}>H</button><button type="button" class="btn6" data-md="ul" title="Bullet list"${S.notesPreview ? ' disabled' : ''}>&bull; List</button><button type="button" class="btn6" data-md="todo" title="Checkbox"${S.notesPreview ? ' disabled' : ''}>&#9744; Todo</button><button type="button" class="btn6 mdview" data-mdview aria-pressed="${!!S.notesPreview}">${S.notesPreview ? 'Edit' : 'Preview'}</button></div>
    <textarea class="notesarea" data-notes data-char="${cid}" placeholder="Notes for this character (markdown: **bold**, *italic*, # heading, - list, - [ ] todo)"${S.notesPreview ? ' hidden' : ''}>${esc(c.notes || '')}</textarea>
    <div class="mdprev"${S.notesPreview ? '' : ' hidden'} data-mdprev data-char="${cid}">${mdRender(c.notes || '', esc) || '<p class="mrow">Nothing yet.</p>'}</div></div>`;
}
