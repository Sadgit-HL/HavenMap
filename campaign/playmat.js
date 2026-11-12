// The playmat of the Mercenaries tab (design: campaign/mockups/merc-6-playmat-v2.html, styles: campaign/playmat.css, generated).
// playmatHtml() turns one character of the record into the playmat markup; the page (app.js) wires the clicks and drags to the
// pure edit functions in scripts/campaign/edit.js, so everything done here is saved, undoable and logged in the history.
import { handList, zoneOf } from '../scripts/campaign/record.js';

// XP needed for level 1 to 9 (the rulebook table as the mockup uses it; to be checked against the rulebook, handover section 6).
export const XP_STEPS = [0, 45, 95, 150, 210, 275, 350, 440, 540];
export const levelOfXp = xp => XP_STEPS.reduce((l, t, i) => (xp >= t ? i + 1 : l), 1);

const UP = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const DN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

// X = helpers of the page: { esc, pretty, cardById, itemById, cardImageUrl, itemImageUrl, cardBackUrl, portraitStyle, traitChips, playerName }
export function playmatHtml(c, X) {
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
  </div></div>`;
}
