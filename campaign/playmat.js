// The playmat of the Mercenaries tab (design: campaign/mockups/merc-6-playmat-v2.html, styles: campaign/playmat.css, generated).
// playmatHtml() turns one character of the record into the playmat markup; the page (app.js) wires the clicks and drags to the
// pure edit functions in scripts/campaign/edit.js, so everything done here is saved, undoable and logged in the history.
import { handList, zoneOf } from '../scripts/campaign/record.js';
import { tokenDefs, TOKEN_IMAGE_DIR } from '../scripts/campaign/classTokens.js';
import { BGG_ICON_GROUPS } from '../scripts/campaign/bggIcons.js';
import { BANNERS, BANNER_ICON_DIR } from '../scripts/campaign/bggBanners.js';

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
      <div class="grp"><small>BGG code</small><span class="bggseg"><button type="button" class="bggb" data-bgg="turn" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: Turn">${DOC}<span>Turn</span></button><button type="button" class="bggb" data-bgg="cards" data-char="${cid}" title="Copy BGG code" aria-label="Copy BGG code: Cards">${CARDS_ICON}<span>Cards</span></button></span></div>
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
  ['mat', 'Character mat', 'Character mat, front and back', ICON('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v14"/>')],
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
