// Monster turn panel and highlights on the map page (exploration, branch explore/monster-automation).
// The panel sits in the inspect panel of a selected monster, closed until the header is clicked (nothing runs while it is closed): move, range, movement type,
// the area pattern when the card has one, and the initiative of each character; open, it runs the solver
// (scripts/monsterMove.js, Gloomhaven 2e rules) on the hex state (scripts/hexState.js) and marks the focus and the end hexes on the board.
// The result is worked out again on every render, so it follows the pieces when they are moved.
import { uiState, setTurn } from './uiState.js';
import { state } from './state.js';
import { TILES, OVERLAY_OBJECTS, MONSTERS, MERCENARIES, SUMMONS, GAME_ID } from './data.js';
import { activeCardsFor } from './decks.js';
import { cardOptions, candidatesFor, distinctCards, areaIndexes } from './monsterCard.js';
import { colLabel, hexCenter, HEX_W, HEX_H } from './hex.js';
import { buildHexState, hexKey } from './hexState.js';
import { solveMove, areaOffsets } from './monsterMove.js';
import { makeSightLine } from './los.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// The floor masks are for the Gloomhaven 2e tiles only (game 'gh2'); tiles of other games have none and the floor is then unknown.
const lookup = {
  tileTitle: id => { const t = TILES.byId.get(id); return t?.game === 'gh2' ? t.title : null; },
  overlay: id => OVERLAY_OBJECTS.byId.get(id) ?? null,
};
const TABLES = { monster: MONSTERS, mercenary: MERCENARIES, summon: SUMMONS };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const figName = f => TABLES[f.kind]?.byId.get(f.id)?.title ?? f.kind;
const label = h => `${colLabel(h.col)}${h.row}`;
const figKey = f => `${f.kind}:${f.id}`;

// The monster data (about 200 KB) loads when a monster is first selected.
let data = null, loading = false;
function ensureData() {
  if (data || loading) return;
  loading = true;
  import('./games/gh2_monsters.js').then(m => { data = m; setTurn({}); }).catch(() => { loading = false; });
}

// The ability card of a monster on the map: the card drawn this round, matched to the Secretariat card by initiative and shuffle mark (the map's card
// numbers are not the Secretariat's ids, equal initiatives can be ambiguous: then the player picks the card by its name). null without data for it.
function cardInfo(obj) {
  if (GAME_ID !== 'gh') return null;
  ensureData();
  if (!data) return null;
  const mon = MONSTERS.byId.get(Number(obj.id)), rec = mon ? data.GH2_MONSTERS[mon.title.replace(/ /g, '-')] : null;
  if (!rec) return null;
  const kind = obj.role === 'elite' ? 'elite' : obj.role === 'boss' ? 'boss' : 'normal', level = Math.max(0, Math.min(7, Number(state.CurrentLevel) || 0));
  const chars = Math.max(1, (state.mercenaries ?? []).length || 4);
  const act = activeCardsFor(obj.id);
  if (!act) return { rec, kind, level, chars, none: true };
  const deck = data.GH2_MONSTER_DECKS[act.slug] ?? [];
  const options = [];
  for (const c of act.cards) for (const g of distinctCards(candidatesFor(deck, c.init, c.s))) options.push({ n: c.n, init: c.init, card: g, pickKey: `${act.slug}:${c.n}` });
  if (!options.length) return { rec, kind, level, chars, none: false, unmatched: act.cards.map(c => c.init) };
  const byCard = new Map();
  for (const o of options) byCard.set(o.pickKey, [...(byCard.get(o.pickKey) ?? []), o]);
  const chosen = [...byCard.entries()].map(([k, list]) => list.find(o => String(o.card.id) === String(uiState.turn.pick[k])) ?? list[0]);
  const sel = chosen[0];
  return { rec, kind, level, chars, options, chosen: sel, ambiguous: byCard.get(sel.pickKey).length > 1, alts: byCard.get(sel.pickKey), more: act.cards.length > 1,
    opts: cardOptions({ monster: rec, kind, level, card: sel.card, chars }) };
}

// Puts the values of the card into the panel when the monster, its card, the level or the party size change; manual changes stay until then.
function autoApply(obj) {
  const info = cardInfo(obj), T = uiState.turn;
  if (!info?.opts) return;
  const key = [obj.id, info.chosen.pickKey, info.chosen.card.id ?? info.chosen.card.name, info.kind, info.level, info.chars].join('|');
  if (T.appliedKey === key) return;
  const o = info.opts, ai = o.area.length ? areaIndexes(o.area, o.areaMelee) : { indexes: [] };
  Object.assign(T, {
    appliedKey: key, areaOpen: false, move: Math.min(20, o.move), range: Math.min(20, o.range), targets: o.targets >= 6 ? 1 : o.targets, all: o.targets >= 6,
    fly: o.flying, jump: o.jumping && !o.flying, tele: false, noAttack: !o.attack, cells: o.area.length ? o.area : null, area: ai.indexes,
  });
}

let last = null;                                                          // { hs, res, figs } of the latest run, for the panel

function selectedMonster() {
  const sel = uiState.selected;
  return sel?.kind === 'monster' ? state.monsters?.[sel.idx] ?? null : null;
}

function run(obj) {
  const T = uiState.turn, hs = buildHexState(state, lookup), figs = hs.figures.filter(f => f.side === 'characters');
  const sight = makeSightLine(hs);
  const initiatives = {};                                                   // typed per figure (kind and id), the solver wants them by hex
  for (const f of figs) if (T.init[figKey(f)] != null) initiatives[hexKey(f.col, f.row)] = T.init[figKey(f)];
  const res = solveMove(hs, {
    active: { col: Number(obj.x), row: Number(obj.y) }, move: T.move, range: T.range, attack: !T.noAttack, targets: T.all ? 6 : T.targets, area: T.cells ?? areaOffsets(T.area, !(T.range > 0)),
    flying: T.fly, jumping: T.jump, teleport: T.tele, muddled: T.muddled, initiatives, canSee: (a, b) => sight(a, b) !== null,
  });
  return { hs, res, figs, sight };
}

function hexPoints(col, row) {
  const { x, y } = hexCenter(col, row), r = HEX_W / 2, h = HEX_H / 2;
  return `${x + r},${y} ${x + r / 2},${y + h} ${x - r / 2},${y + h} ${x - r},${y} ${x - r / 2},${y - h} ${x + r / 2},${y - h}`;
}

function hexShape(col, row, attrs) {
  const p = document.createElementNS(SVG_NS, 'polygon');
  p.setAttribute('points', hexPoints(col, row));
  for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
  return p;
}

function draw(run_) {
  const layer = document.getElementById('layer-solver');
  if (!layer) return;
  while (layer.firstChild) layer.removeChild(layer.firstChild);
  if (!run_) return;
  const { res } = run_, seen = new Set();
  layer.setAttribute('pointer-events', 'none');
  for (const a of res.actions) {
    if (!a.focus.length) continue;                                                // standing still: nothing to mark
    for (const d of a.destinations) {
      const [c, r] = d.split(',').map(Number);
      layer.appendChild(hexShape(c, r, { fill: 'none', stroke: '#6aa7ff', 'stroke-width': 3, 'stroke-dasharray': '8 6' }));
    }
  }
  const inArea = new Set();
  for (const a of res.actions) for (const k of a.area ?? []) {
    if (inArea.has(k)) continue;
    inArea.add(k);
    const [c, r] = k.split(',').map(Number);
    layer.appendChild(hexShape(c, r, { fill: 'rgba(255,159,67,0.28)', stroke: '#ff9f43', 'stroke-width': 2 }));
  }
  for (const a of res.actions) {
    if (!a.focus.length || seen.has(a.col + ',' + a.row)) continue;
    seen.add(a.col + ',' + a.row);
    layer.appendChild(hexShape(a.col, a.row, a.attack
      ? { fill: 'rgba(80,200,120,0.38)', stroke: '#50c878', 'stroke-width': 3 }
      : { fill: 'rgba(106,167,255,0.32)', stroke: '#6aa7ff', 'stroke-width': 3 }));
  }
  for (const f of res.focuses) layer.appendChild(hexShape(f.col, f.row, { fill: 'none', stroke: '#ffd23f', 'stroke-width': 5 }));
  // the sight line from each attack hex to its focus (the line comes in the exact grid of scripts/los.js, the board is 45 and 78 pixels further)
  for (const a of res.actions) {
    if (!a.attack) continue;
    for (const t of a.targets) {
      const [tc, tr] = t.split(',').map(Number), l = run_.sight(a, { col: tc, row: tr });
      if (!l || (l.x1 === l.x2 && l.y1 === l.y2)) continue;
      const e = document.createElementNS(SVG_NS, 'line');
      for (const [k, v] of Object.entries({ x1: l.x1 + 45, y1: l.y1 + 78, x2: l.x2 + 45, y2: l.y2 + 78, stroke: '#ffd23f', 'stroke-width': 2, opacity: 0.85 })) e.setAttribute(k, v);
      layer.appendChild(e);
    }
  }
}

// Called by the sidebar on every render: works out and draws the result for the selected monster, or clears the board.
export function refreshSolver() {
  const sel = uiState.turn.on ? selectedMonster() : null;                        // closed: no data, no solver, no marks
  if (sel) autoApply(sel);
  last = sel ? run(sel) : null;
  draw(last);
}

const chip = (key, text, on) => `<button type="button" class="sp-turn-chip${on ? ' on' : ''}" data-turn="${key}" aria-pressed="${on}">${text}</button>`;
// The area pattern: a 7 by 7 drawing like gloom's (cell index = column * 7 + row, odd columns shifted down). A melee area is drawn around the monster in the
// centre (M); a ranged area is a shape, any cell can be its first.
function areaEditor(T) {
  const shown = T.cells ? areaIndexes(T.cells, !(T.range > 0)).indexes : T.area;
  if (!shown.length && !T.areaOpen) return `<div class="sp-turn-row">${chip('areaOpen', 'Area', false)}</div>`;      // the grid comes with a card that has an area, or by hand
  const R = 11, w = 2 * R + 1.5 * R * 6 + 2, h = Math.sqrt(3) * R * 7.5 + 2, melee = !(T.range > 0), cells = [];
  for (let c = 0; c < 7; c++) for (let r = 0; r < 7; r++) {
    const x = R + 1 + 1.5 * R * c, y = Math.sqrt(3) * R * (r + 0.5 * (c % 2) + 0.5) + 1, i = c * 7 + r, on = shown.includes(i), mid = i === 24;
    const pts = [[R, 0], [R / 2, 0.866 * R], [-R / 2, 0.866 * R], [-R, 0], [-R / 2, -0.866 * R], [R / 2, -0.866 * R]].map(([dx, dy]) => `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(' ');
    cells.push(`<polygon points="${pts}" data-turn-aoe="${i}" class="sp-aoe-cell${on ? ' on' : ''}${mid ? ' mid' : ''}"></polygon>`);
    if (mid && melee) cells.push(`<text x="${x}" y="${y + 4}" text-anchor="middle" class="sp-aoe-m">M</text>`);
  }
  return `<div class="sp-turn-row"><span class="sp-turn-lbl">Area</span>${shown.length ? '<button type="button" class="sp-turn-chip" data-turn="clearArea">Clear</button>' : '<button type="button" class="sp-turn-chip" data-turn="areaOpen">Hide</button>'}</div>` +
    `<svg class="sp-aoe" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${cells.join('')}</svg>`;
}
const num = (field, value) => `<input type="number" class="sp-turn-num" data-turn-field="${field}" min="0" max="20" value="${value}">`;

function resultHtml() {
  if (!last) return '';
  const { res, hs } = last, lines = [];
  if (!res.focuses.length) lines.push('No focus: nothing can be reached or attacked');
  else {
    lines.push(`Focus: ${res.focuses.map(f => `${esc(figName(f))} ${label(f)}`).join(' or ')}`);
    const names = new Map(last.hs.figures.map(f => [hexKey(f.col, f.row), figName(f)]));
    const hexes = [...new Set(res.actions.map(label))].join(', ');
    if (res.canAttackFocus && res.actions.some(x => x.targets.length > 1)) {
      lines.push('Attacks from:');
      for (const x of res.actions) lines.push(`${label(x)}: ${x.targets.map(t => esc(names.get(t) ?? t)).join(', ')}`);
    } else lines.push(res.canAttackFocus ? `Attacks from: ${hexes}` : `Moves to: ${hexes}`);
    if (!res.canAttackFocus) {
      const dest = [...new Set(res.actions.flatMap(a => a.destinations))].map(k => { const [c, r] = k.split(',').map(Number); return label({ col: c, row: r }); });
      if (dest.length) lines.push(`Towards: ${dest.join(', ')}`);
    }
  }
  if (!hs.floorKnown) lines.push('Floor unknown on this map: hexes outside the tiles are not excluded');
  return `<div class="sp-turn-res">${lines.map(l => `<div>${l}</div>`).join('')}</div>`;
}

// The panel for the selected monster (empty for other objects).
function cardHtml(info) {
  if (!info) return '';
  if (info.none) return '<div class="sp-turn-card sp-turn-dim">No ability card drawn</div>';
  if (info.unmatched) return `<div class="sp-turn-card sp-turn-dim">No matching card in the data for initiative ${info.unmatched.join(', ')}</div>`;
  const c = info.chosen.card, o = info.opts;
  const pick = info.ambiguous
    ? `<select class="sp-turn-pick" data-turn-field="pick" data-key="${esc(info.chosen.pickKey)}">${info.alts.map(a => `<option value="${esc(a.card.id ?? '')}"${a.card === c ? ' selected' : ''}>${esc(a.card.name ?? a.card.id)}</option>`).join('')}</select>`
    : `<b>${esc(c.name ?? c.id)}</b>`;
  const parts = [`Move ${o.move}`, o.attack ? `Attack ${o.damage ?? '?'}` : 'No attack', o.attack && o.range ? `Range ${o.range}` : '', o.targets > 1 ? (o.targets >= 6 ? 'All targets' : `${o.targets} targets`) : '', o.area.length ? (o.areaMelee ? 'Area around it' : 'Area') : '', o.jumping ? 'Jump' : '', o.flying ? 'Flying' : ''].filter(Boolean);
  return `<div class="sp-turn-card"><div class="sp-turn-cardhd">${pick}<span class="sp-turn-dim">init ${info.chosen.init}</span><button type="button" class="sp-turn-chip" data-turn="useCard" title="Take the values of the card again">Use card</button></div>` +
    `<div class="sp-turn-dim">${parts.join(', ')}${info.more ? '; more than one card is drawn, the first is used' : ''}</div>` +
    (o.notes.length ? `<ul class="sp-turn-notes">${o.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '') + '</div>';
}

export function turnPanelHtml(kind) {
  if (kind !== 'monster') return '';
  const T = uiState.turn;
  const head = `<button type="button" class="sp-turn-head" data-turn="toggle" aria-expanded="${T.on}"><span class="sp-subhead">Monster turn</span><span class="sp-turn-arrow">${T.on ? '&#9662;' : '&#9656;'}</span></button>`;
  if (!T.on) return `<div class="sp-action-section sp-turn sp-turn--closed">${head}</div>`;
  const sel = selectedMonster(), card = sel ? cardHtml(cardInfo(sel)) : '';
  const figs = last ? last.figs : buildHexState(state, lookup).figures.filter(f => f.side === 'characters');
  const filled = figs.filter(f => T.init[figKey(f)] != null).length;
  const inits = figs.length ? `<div class="sp-turn-row">${chip('initOpen', `Initiatives${filled ? ` (${filled})` : ''}`, T.initOpen)}</div>` + (T.initOpen ? `<div class="sp-turn-inits">${figs.map(f => {
    const k = figKey(f);
    return `<label class="sp-turn-init"><span>${esc(figName(f))} ${label(f)}</span><input type="number" class="sp-turn-num" data-turn-field="init" data-key="${k}" min="1" max="99" value="${T.init[k] ?? ''}" placeholder="99"></label>`;
  }).join('')}</div>` : '') : '';
  return `
    <div class="sp-action-section sp-turn">
      ${head}
      ${card}
      <div class="sp-turn-row"><label>Move ${num('move', T.move)}</label><label>Range ${num('range', T.range)}</label><label>Targets ${num('targets', T.targets)}</label>${chip('all', 'All', T.all)}</div>
      <div class="sp-turn-row">${chip('fly', 'Fly', T.fly)}${chip('jump', 'Jump', T.jump)}${chip('tele', 'Teleport', T.tele)}${chip('muddled', 'Muddled', T.muddled)}${chip('noAttack', 'No attack', T.noAttack)}</div>
      ${areaEditor(T)}
      ${inits}
      ${resultHtml()}
    </div>`;
}

export function initTurnPanel(panel) {
  panel.addEventListener('click', e => {
    const cellEl = e.target.closest('[data-turn-aoe]');
    if (cellEl) {
      const T0 = uiState.turn, i = Number(cellEl.dataset.turnAoe), a = T0.cells ? areaIndexes(T0.cells, !(T0.range > 0)).indexes : T0.area;
      setTurn({ cells: null, area: a.includes(i) ? a.filter(x => x !== i) : [...a, i].sort((p, q) => p - q) });
      return;
    }
    const b = e.target.closest('[data-turn]');
    if (!b) return;
    const T = uiState.turn, k = b.dataset.turn;
    if (k === 'toggle') setTurn({ on: !T.on });
    else if (k === 'fly') setTurn({ fly: !T.fly, jump: T.fly ? T.jump : false });
    else if (k === 'clearArea') setTurn({ area: [], cells: null });
    else if (k === 'useCard') setTurn({ appliedKey: null });
    else if (k === 'jump') setTurn({ jump: !T.jump, fly: T.jump ? T.fly : false });
    else if (k in T) setTurn({ [k]: !T[k] });
  });
  panel.addEventListener('change', e => {
    const f = e.target.dataset?.turnField;
    if (!f) return;
    const n = Math.round(Number(e.target.value));
    if (f === 'move' || f === 'range') setTurn({ [f]: Number.isFinite(n) ? Math.max(0, Math.min(20, n)) : 0 });
    else if (f === 'targets') setTurn({ targets: Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : 1 });
    else if (f === 'pick') setTurn({ pick: { ...uiState.turn.pick, [e.target.dataset.key]: e.target.value } });
    else if (f === 'init') {
      const init = { ...uiState.turn.init };
      if (e.target.value === '' || !Number.isFinite(n)) delete init[e.target.dataset.key]; else init[e.target.dataset.key] = Math.max(1, Math.min(99, n));
      setTurn({ init });
    }
  });
}
