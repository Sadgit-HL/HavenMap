// The phone view of the Mercenaries tab (design: campaign/mockups/merc-7-phone-v2.html, styles: campaign/phone.css). It shows the same
// character record as the playmat in a compact layout with three tabs (Cards, Items, Info), a bottom menu that opens the modals of the playmat,
// and bottom sheets instead of dragging: tap a card, pick a zone. The page (app.js) wires the clicks to the edit functions of
// scripts/campaign/edit.js, like the playmat does.
import { handList, zoneOf, pendingPicks } from '../scripts/campaign/record.js';
import { tokenDefs, TOKEN_IMAGE_DIR } from '../scripts/campaign/classTokens.js';
import { modalHtml, XP_STEPS, levelOfXp, markersHtml } from './playmat.js';

const UP = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const DN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
export const PHONE_MODALS = [['amd', 'Attack modifiers'], ['perks', 'Perks &amp; masteries'], ['journal', 'Journal'], ['mat', 'Character mat'], ['codes', 'BGG codes'], ['enh', 'Enhancements'], ['history', 'History'], ['deck', 'Deck &amp; card pool']];
export const PHONE_ZONES = [['play1', 'Play slot 1'], ['play2', 'Play slot 2'], ['active', 'Active'], ['hand', 'Hand'], ['discard', 'Discard'], ['lost', 'Lost']];
const ZONE_NAME = { play1: 'play slot 1', play2: 'play slot 2' };

// S = { ptab: 'cards' | 'items' | 'info', sheet: null | { kind: 'card', id } | { kind: 'pile', z } | { kind: 'menu' }, ...the state of the modals (see playmat.js) }
export function phoneHtml(c, X, S = {}) {
  const { esc } = X, cid = esc(c.id), tab = S.ptab || 'cards';
  const nameOf = id => X.pretty(X.cardById.get(id)?.slug ?? id), cardOf = id => X.cardById.get(id);
  const lv = c.lv || levelOfXp(c.xp || 0), lo = XP_STEPS[lv - 1] ?? 0, hi = XP_STEPS[lv] ?? null;
  const pct = hi ? Math.max(0, Math.min(100, ((c.xp - lo) / (hi - lo)) * 100)) : 100;

  const card = id => {
    const k = cardOf(id), url = X.cardImageUrl(k), ini = k?.ini;
    return `<div class="ac" data-card="${id}" data-char="${cid}" title="${esc(nameOf(id))}">${url ? `<img src="${esc(url)}" alt="${esc(nameOf(id))}" loading="lazy" draggable="false">` : `<div class="noimg">${esc(nameOf(id))}</div>`}${ini != null ? `<span class="inib">${ini}</span>` : ''}${markersHtml(c.mk?.[`c:${id}`])}</div>`;
  };
  const lists = { active: [], discard: [], lost: [] };
  for (const id of c.deck) { const z = zoneOf(c, id); if (lists[z]) lists[z].push(id); }
  const active = c.act.filter(id => lists.active.includes(id)), hand = handList(c);
  const piled = z => (z === 'discard' ? c.disc : c.lost).filter(id => c.deck.includes(id));
  const back = `<img src="${esc(X.cardBackUrl(c.cls))}" alt="${esc(c.cls)} card back" draggable="false">`;
  const slot = i => {
    const p = c.play[i], k = p && cardOf(p.id), ini = i === 0 ? (p && p.up ? (k?.ini ?? '?') : '?') : null;
    const lab = `<div class="lab">Slot ${i + 1}${ini !== null ? ` &middot; initiative <span class="ini">${ini}</span>` : ''}</div>`;
    if (!p) return `<div class="slot">${lab}<div class="empty">empty</div></div>`;
    const url = X.cardImageUrl(k);
    return `<div class="slot">${lab}<div class="ac flip${p.up ? ' up' : ''}" data-card="${p.id}" data-char="${cid}" data-pslot="${i}" title="Tap to flip: ${esc(nameOf(p.id))}"><div class="inner"><div class="face back">${back}</div><div class="face front">${url ? `<img src="${esc(url)}" alt="${esc(nameOf(p.id))}" draggable="false">` : ''}</div></div>${markersHtml(c.mk?.[`c:${p.id}`])}<button type="button" class="more" data-more aria-label="Move ${esc(nameOf(p.id))}">&#8943;</button></div></div>`;
  };
  const strip = ids => (ids.length ? `<div class="strip">${ids.map(card).join('')}</div>` : '<div class="strip empty">empty</div>');
  const pileBtn = (z, label) => {
    const a = piled(z), top = a.at(-1);
    return `<button type="button" class="pile" data-ppile="${z}"><div><span>${label}</span><b>${a.length}</b></div>${top != null ? `<div class="top1"><img src="${esc(X.cardImageUrl(cardOf(top)) || '')}" alt="${esc(nameOf(top))}"></div>` : ''}</button>`;
  };
  const tokens = tokenDefs(c.cls).map(d => {
    const v = c.tok?.[d.k] || 0, img = (n, l) => `<img src="${TOKEN_IMAGE_DIR}${n}.png" alt="${esc(l)}" draggable="false">`;
    if (d.states) return `<span class="ctr" title="${esc(d.l)}: ${esc(d.states[v])}"><button type="button" data-tk="${d.k}" data-char="${cid}" style="width:auto;height:auto;padding:2px;background:none;border:0" aria-label="${esc(d.l)}: ${esc(d.states[v])}">${img(d.imgs[v], `${d.l} ${d.states[v]}`)}</button></span>`;
    return `<span class="ctr" title="${esc(d.l)}">${img(d.img, d.l)}<span class="sp"><b>${v}</b><span class="spc"><button type="button" data-tk="${d.k}" data-char="${cid}" data-d="1" aria-label="Increase ${esc(d.l)}">${UP}</button><button type="button" data-tk="${d.k}" data-char="${cid}" data-d="-1" aria-label="Decrease ${esc(d.l)}"${v ? '' : ' disabled'}>${DN}</button></span></span></span>`;
  }).join('');

  const sp = (key, label, aria, val, note = '') => `<div class="statrow"><span>${label}</span><span class="sp"><b class="edv" tabindex="0" data-hud="${key}" data-char="${cid}">${val}</b><span class="spc"><button type="button" data-hud="${key}" data-char="${cid}" data-d="1" aria-label="Increase ${aria}">${UP}</button><button type="button" data-hud="${key}" data-char="${cid}" data-d="-1" aria-label="Decrease ${aria}">${DN}</button></span></span>${note ? `<small>${note}</small>` : ''}</div>`;
  let view = '';
  if (tab === 'cards') {
    view = `<h4>Play area <span>tap to flip, button to move</span></h4><div class="row2">${slot(0)}${slot(1)}</div>
      <h4>Active <span>${active.length}</span></h4>${strip(active)}
      <h4>Hand <span class="hbtns"><span style="align-self:center">${hand.length}${c.hand ? ` of ${c.hand}` : ''}</span><button type="button" class="sm" data-psort="ini" title="Sort by initiative">Ini</button><button type="button" class="sm" data-psort="lvl" title="Sort by level">Lvl</button></span></h4>${strip(hand)}
      <div class="piles">${pileBtn('discard', 'Discard')}${pileBtn('lost', 'Lost')}</div>`;
  } else if (tab === 'items') {
    const tiles = c.items.map(it => {
      const item = X.itemById.get(it.id), nm = X.pretty(item?.slug ?? it.id), s = it.s || 0;
      return `<div class="it${s === 1 ? ' spent' : s === 2 ? ' consumed' : ''}" data-itemstate data-id="${esc(it.id)}" data-char="${cid}" role="button" tabindex="0">${esc(nm)}<small>${esc(item?.slot ?? '')} &middot; ${['available', 'spent', 'consumed'][s]}</small></div>`;
    }).join('');
    view = `<h4>Items <span class="hbtns"><span style="align-self:center">${c.items.length}</span><button type="button" class="sm" data-itemssort="${cid}">Slot</button><button type="button" class="sm" data-itemsedit="${cid}">Equip</button></span></h4><div class="itl">${tiles || '<div class="note">No items.</div>'}</div>`;
  } else {
    view = `<div class="panel"><h4>Traits</h4><div class="chips">${X.traitChips(c)}</div></div>
      <div class="panel"><h4>Character</h4><div class="stats">${sp('xp', 'XP', 'XP', c.xp ?? 0, hi ? `of ${hi}` : 'max')}${sp('gold', 'Gold', 'gold', c.gold ?? 0)}${sp('inh', 'Inherited perks', 'inherited perks', c.inh ?? 0)}</div></div>
      <div class="panel"><h4>Open</h4><div class="opts">${PHONE_MODALS.map(([id, l]) => `<button type="button" data-modal="${id}">${l}</button>`).join('')}</div></div>`;
  }

  // the bottom sheet
  let sheet = '';
  const sh = S.sheet;
  if (sh && sh.kind === 'card' && c.deck.includes(sh.id)) {
    const k = cardOf(sh.id), z = zoneOf(c, sh.id);
    const opts = PHONE_ZONES.filter(([zz]) => zz !== z && !(zz.startsWith('play') && z !== 'hand' && !z.startsWith('play'))).map(([zz, l]) => `<button type="button" data-pto="${zz}" data-card="${sh.id}" data-char="${cid}">${l}</button>`).join('');
    const ord = z === 'hand' ? [['start', 'Move to start'], ['end', 'Move to end']].map(([o, l]) => `<button type="button" data-pord="${o}" data-card="${sh.id}" data-char="${cid}">${l}</button>`).join('') : '';
    sheet = `<h3>${esc(nameOf(sh.id))}<button type="button" data-sheetclose aria-label="Close">&times;</button></h3><div class="prev">${card(sh.id)}<div class="meta">Level ${esc(k?.lv ?? '?')}<br>Initiative ${k?.ini ?? 'unknown'}<br>Now in: ${esc(ZONE_NAME[z] || z)}</div></div><div class="opts">${opts}${ord}<button type="button" data-mkopen="c:${sh.id}" data-char="${cid}">Markers</button></div>`;
  } else if (sh && sh.kind === 'pile') {
    const a = piled(sh.z);
    sheet = `<h3>${sh.z === 'lost' ? 'Lost' : 'Discard'} &middot; ${a.length}<button type="button" data-sheetclose aria-label="Close">&times;</button></h3>${a.length ? `<div class="grid">${a.map(card).join('')}</div>` : '<div class="note">empty</div>'}`;
  } else if (sh && sh.kind === 'menu') {
    sheet = `<h3>Open<button type="button" data-sheetclose aria-label="Close">&times;</button></h3><div class="opts">${PHONE_MODALS.map(([id, l]) => `<button type="button" data-modal="${id}">${l}</button>`).join('')}</div>`;
  }

  return `<div class="pm pp" data-zactive="click" data-zplay="click" data-zhand="click" data-zpiles="click" data-zitems="click" data-inib="on" data-motion="full">
    <header class="top"><div class="portrait" style="${esc(X.portraitStyle(c, 44))}" role="img" aria-label="Class portrait"></div><div class="who"><b>${esc(c.name)}</b><div class="sub">${esc(c.cls)}${X.playerName(c) ? ` &middot; played by ${esc(X.playerName(c))}` : ''}</div></div>
      <div class="gold"><b>${c.gold ?? 0}</b> gold<br><span class="sub">${c.inh ?? 0} inherited perks &middot; ${c.xp ?? 0} XP</span></div><div class="lvl" role="button" tabindex="0" data-opendeck="pool" title="Level ${lv} (tap for the card pool)">${lv}</div></header>
    <div class="xpbar"><b style="width:${pct}%"></b></div>
    ${tokens ? `<div class="toks">${tokens}</div>` : ''}
    <main class="body">${view}</main>
    <nav class="nav">${[['cards', 'Cards'], ['items', 'Items'], ['info', 'Info']].map(([t, l]) => `<button type="button" data-ptab="${t}"${tab === t ? ' aria-current="page"' : ''}>${l}</button>`).join('')}<button type="button" class="menu" data-pmenu aria-label="Open menu">&#9776;${pendingPicks(c) ? '<span class="pdot"></span>' : ''}</button></nav>
    ${sheet ? `<div class="sheetwrap" data-sheetclose-bg><div class="sheet">${sheet}</div></div>` : ''}
    ${modalHtml(c, X, S)}</div>`;
}
