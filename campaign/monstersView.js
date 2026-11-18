// The Monsters tab: the monster types of the running scenario with their ability decks and stat cards, and the two attack modifier decks
// (monsters, allies) in a dock at the bottom, in the look of the Mercenaries playmat (class pm, styles in campaign/monsters.css). The state is record.mon
// (scripts/campaign/monsters.js); app.js wires the clicks to the edit functions of scripts/campaign/edit.js.
import { imageFile } from '../scripts/images.js';
import { MONSTERS, MON_MAX, monOf, monsterById, deckSlug, deckCards, deckState, deckNeedsShuffle, deckRollCode } from '../scripts/campaign/monsters.js';
import { drawState, amOwner, amdRollCode } from '../scripts/campaign/amdDeck.js';
import { normalDifficulty, scenarioLevel, scenarioLevelRange } from '../scripts/campaign/record.js';
import { amViewHtml } from './playmat.js';

const UP = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const DN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const DICE = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/></g></svg>';
const SHUFFLE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const EXPAND = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const COLLAPSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const TO_DISCARD = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';

const title = t => t.replace(/\b\w/g, ch => ch.toUpperCase());
const abilityUrl = (slug, n) => imageFile(`images/gh2/monsters/monster-abilities/gh2-ma-${slug}-${n}`, '../');
const statUrl = (m, lvl) => imageFile(`images/gh2/monsters/stats/${m.title.replace(/ /g, '_').toLowerCase()}_${lvl}`, '../');

// V = { amg: 'm' | 'a', amEdit, amOpen }
export function monstersHtml(r, V, esc) {
  const m = monOf(r), lvl = scenarioLevel(r), [lvMin, lvMax] = scenarioLevelRange(r), g = V.amg === 'a' ? 'a' : 'm', st = m.am[g] || {};
  const A = drawState(amOwner(g, st), st);

  const chosen = new Set(m.types);
  const add = m.types.length < MON_MAX ? `<label class="monfield monadd"><span class="lab">Add</span><select data-monadd aria-label="Add a monster type"><option value="">Monster...</option>${
    ['Monsters', 'Bosses'].map((grp, i) => `<optgroup label="${grp}">${MONSTERS.filter(x => !!x.boss === !!i && !chosen.has(x.id)).map(x => `<option value="${x.id}">${esc(title(x.title))}</option>`).join('')}</optgroup>`).join('')}</select></label>` : '';
  // The level is the campaign's scenario level (record.js scenarioLevel): the normal difficulty of the party plus the difficulty
  // (party.diff, also set in the Overview's Party window). The pill shows the difficulty (0, +1, -1 ...); not 0: a click goes back to 0.
  const nd = normalDifficulty(r), bump = lvl - nd, bumpTxt = bump > 0 ? `+${bump}` : String(bump);
  const diff = bump ? `<button type="button" class="mondiff on" data-monlvauto title="Normal difficulty is level ${nd}: back to normal" aria-label="Difficulty ${bumpTxt}, back to normal">${bumpTxt}</button>`
    : `<span class="mondiff" title="Normal difficulty (level ${nd})" aria-label="Normal difficulty">0</span>`;
  const bar = `<div class="monbar">
    <span class="monfield"><span class="lab">Scenario level</span><span class="sp"><b>${lvl}</b><span class="spc"><button type="button" data-monlv="1" aria-label="Raise the monster level"${lvl >= lvMax ? ' disabled' : ''}>${UP}</button><button type="button" data-monlv="-1" aria-label="Lower the monster level"${lvl <= lvMin ? ' disabled' : ''}>${DN}</button></span></span>${diff}</span>
    <span class="monfield"><span class="lab">Round</span><b class="monround">${m.round}</b></span>
    ${add}
    <span class="monacts"><button type="button" class="btn6" data-monnew title="Shuffle every deck and start at round 1">New scenario</button><button type="button" class="btn6 monend" data-monend title="Drawn ability cards to the discard, shuffle the decks that need it, next round">End of round</button></span>
  </div>`;

  const tog = `<span class="tog" role="group" aria-label="Modifier deck">${[['m', 'Monsters'], ['a', 'Allies']].map(([k, l]) => `<button type="button" data-monamg="${k}" aria-pressed="${g === k}">${l}</button>`).join('')}</span>`;
  const imb = g === 'm' && V.amEdit ? `<span class="monimb"><span class="lab">Imbuement</span><span class="tog" role="group" aria-label="Imbuement">${[0, 1, 2].map(n => `<button type="button" data-monimb="${n}" aria-pressed="${(st.imb || 0) === n}">${n ? `Level ${n}` : 'None'}</button>`).join('')}</span></span>` : '';
  // The modifier deck as a dock at the bottom: a strip (the faces left in the deck, a click draws that card; the discard) that opens the
  // playmat's full Modifiers view above it. On phones the full view is always shown (monsters.css).
  const open = !!V.amOpen || !!V.amEdit;
  const chip = (t, n) => `<button type="button" class="mamc" data-mamdraw="${esc(t.key)}" title="Draw ${esc(t.face ?? t.label)}${n > 1 ? ` (${n} left)` : ''}">${t.img ? `<img src="${esc(t.img)}" alt="${esc(t.face ?? t.label)}" draggable="false">` : `<span class="mamf">${esc(t.face ?? t.label)}</span>`}${n > 1 ? `<span class="nb">${n}</span>` : ''}</button>`;
  const chips = [...A.tiles.filter(t => t.n > 0).map(t => chip(t, t.n)), ...A.specials.filter(t => t.n > 0).map(t => chip(t, t.n))].join('');
  const strip = `<span class="mamdeck"><span class="lab">Deck &middot; <b>${A.pool}</b></span><button type="button" class="btn6" data-code="${esc(amdRollCode(A.faces))}" title="Copy GeekRoller code" aria-label="Copy GeekRoller code"${A.faces.length ? '' : ' disabled'}>${DICE}</button></span>
    <span class="mamchips" aria-label="Cards left in the deck: a click draws the card">${chips || '<span class="lab">Empty</span>'}</span>
    <span class="mamdisc" title="Last discarded card"><span class="lab">Discard &middot; <b>${A.disc}</b></span>${A.top?.img ? `<img src="${esc(A.top.img)}" alt="${esc(A.top.face ?? '')}" draggable="false">` : '<span class="mamempty"></span>'}</span>
    <button type="button" class="btn6" data-amact="shuffle" title="Shuffle the discard back into the deck" aria-label="Shuffle the discard back into the deck">${SHUFFLE}</button>`;
  const amd = `<section class="monam${open ? ' open' : ''}"><div class="monamhd">${tog}${open ? imb : strip}<button type="button" class="btn6 mamtog" data-monamopen aria-expanded="${open}" title="${open ? 'Close the full deck view' : 'Open the full deck view'}" aria-label="${open ? 'Close the full deck view' : 'Open the full deck view'}">${open ? COLLAPSE : EXPAND}</button></div><div class="monamv" data-amg="${g}">${amViewHtml(A, esc, !!V.amEdit)}</div></section>`;

  const panel = id => {
    const t = monsterById(id), slug = deckSlug(id);
    if (!t) return '';
    const cards = deckCards(slug), ds = deckState(m, slug), shared = m.types.filter(x => deckSlug(x) === slug).length > 1;
    const status = n => (ds.active.includes(n) ? 'active' : ds.deck.includes(n) ? 'deck' : 'discard');
    const active = ds.active.map(n => cards.find(c => c.n === n)).filter(Boolean).sort((a, b) => a.init - b.init);
    const big = active.length
      ? active.map(c => `<div class="mab big" data-mcard="${c.n}" data-mslug="${slug}"><img src="${esc(abilityUrl(slug, c.n))}" alt="${esc(`${title(slug.replace(/-/g, ' '))} ${c.n}`)}" draggable="false"><span class="mini6">${c.init}</span><button type="button" class="mdisc" data-mdisc="${c.n}" data-mslug="${slug}" title="Discard now" aria-label="Discard now">${TO_DISCARD}</button></div>`).join('')
      : `<div class="mab big back" aria-label="No card drawn"><span>${ds.deck.length}</span></div>`;
    const row = [...cards].sort((a, b) => a.init - b.init || a.n - b.n).map(c => {
      const s = status(c.n);
      return `<button type="button" class="mab sm ${s}" data-mcard="${c.n}" data-mslug="${slug}" title="Initiative ${c.init}${c.s ? ', shuffle' : ''}: ${s === 'deck' ? 'mark as drawn' : 'back to the deck'}"><img src="${esc(abilityUrl(slug, c.n))}" alt="" loading="lazy" draggable="false"><span class="mini6${c.s ? ' s' : ''}">${c.init}</span></button>`;
    }).join('');
    const code = deckRollCode(slug, ds);
    return `<article class="mpanel${t.boss ? ' boss' : ''}" data-mtype="${t.id}">
      <div class="mhd"><h3>${esc(title(t.title))}</h3>${shared ? '<span class="mshared" title="Shares the ability deck with another chosen type">shared deck</span>' : ''}<span class="mcount" title="Cards left in the deck">${ds.deck.length}/${cards.length}</span>${deckNeedsShuffle(slug, ds) ? '<i class="mdot" title="Shuffles at end of round"></i>' : ''}
        <span class="mtools"><button type="button" class="btn6" data-mcode="${esc(code)}"${code ? '' : ' disabled'} title="Copy GeekRoller code" aria-label="Copy GeekRoller code">${DICE}</button><button type="button" class="btn6" data-mshuffle="${slug}" title="Shuffle the deck now" aria-label="Shuffle the deck now">${SHUFFLE}</button><button type="button" class="btn6" data-mremove="${t.id}" title="Remove ${esc(title(t.title))}" aria-label="Remove ${esc(title(t.title))}">${CLOSE}</button></span></div>
      <div class="mbody"><div class="mstat" data-img="${esc(statUrl(t, lvl))}"><img src="${esc(statUrl(t, lvl))}" alt="${esc(`${title(t.title)} level ${lvl}`)}" loading="lazy" draggable="false"></div>
      <div class="mact">${big}</div></div>
      <div class="mrow">${row}</div>
    </article>`;
  };
  return `<div class="pm mon">${bar}<section class="mongrid">${m.types.map(panel).join('')}</section>${amd}</div>`;
}
