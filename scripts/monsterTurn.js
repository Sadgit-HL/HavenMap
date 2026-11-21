// Monster turn panel and highlights on the map page (exploration, branch explore/monster-automation).
// The panel sits in the inspect panel of a selected monster: move, range, movement type and the initiative of each character; Show runs the solver
// (scripts/monsterMove.js, Gloomhaven 2e rules) on the hex state (scripts/hexState.js) and marks the focus and the end hexes on the board.
// The result is worked out again on every render, so it follows the pieces when they are moved.
import { uiState, setTurn } from './uiState.js';
import { state } from './state.js';
import { TILES, OVERLAY_OBJECTS, MONSTERS, MERCENARIES, SUMMONS } from './data.js';
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
    active: { col: Number(obj.x), row: Number(obj.y) }, move: T.move, range: T.range, attack: !T.noAttack, targets: T.all ? 6 : T.targets, area: areaOffsets(T.area, !(T.range > 0)),
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
  const obj = uiState.turn.on ? selectedMonster() : null;
  last = obj ? run(obj) : null;
  draw(last);
}

const chip = (key, text, on) => `<button type="button" class="sp-turn-chip${on ? ' on' : ''}" data-turn="${key}" aria-pressed="${on}">${text}</button>`;
// The area pattern: a 7 by 7 drawing like gloom's (cell index = column * 7 + row, odd columns shifted down). A melee area is drawn around the monster in the
// centre (M); a ranged area is a shape, any cell can be its first.
function areaEditor(T) {
  const R = 11, w = 2 * R + 1.5 * R * 6 + 2, h = Math.sqrt(3) * R * 7.5 + 2, melee = !(T.range > 0), cells = [];
  for (let c = 0; c < 7; c++) for (let r = 0; r < 7; r++) {
    const x = R + 1 + 1.5 * R * c, y = Math.sqrt(3) * R * (r + 0.5 * (c % 2) + 0.5) + 1, i = c * 7 + r, on = T.area.includes(i), mid = i === 24;
    const pts = [[R, 0], [R / 2, 0.866 * R], [-R / 2, 0.866 * R], [-R, 0], [-R / 2, -0.866 * R], [R / 2, -0.866 * R]].map(([dx, dy]) => `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(' ');
    cells.push(`<polygon points="${pts}" data-turn-aoe="${i}" class="sp-aoe-cell${on ? ' on' : ''}${mid ? ' mid' : ''}"></polygon>`);
    if (mid && melee) cells.push(`<text x="${x}" y="${y + 4}" text-anchor="middle" class="sp-aoe-m">M</text>`);
  }
  return `<div class="sp-turn-row"><span class="sp-turn-lbl">Area</span>${T.area.length ? '<button type="button" class="sp-turn-chip" data-turn="clearArea">Clear</button>' : ''}</div>` +
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
export function turnPanelHtml(kind) {
  if (kind !== 'monster') return '';
  const T = uiState.turn;
  const figs = last ? last.figs : buildHexState(state, lookup).figures.filter(f => f.side === 'characters');
  const inits = figs.length ? `<div class="sp-turn-inits">${figs.map(f => {
    const k = figKey(f);
    return `<label class="sp-turn-init"><span>${esc(figName(f))} ${label(f)}</span><input type="number" class="sp-turn-num" data-turn-field="init" data-key="${k}" min="1" max="99" value="${T.init[k] ?? ''}" placeholder="99"></label>`;
  }).join('')}</div>` : '';
  return `
    <div class="sp-action-section sp-turn">
      <div class="sp-subhead">Monster turn</div>
      <div class="sp-turn-row"><label>Move ${num('move', T.move)}</label><label>Range ${num('range', T.range)}</label><label>Targets ${num('targets', T.targets)}</label>${chip('all', 'All', T.all)}</div>
      <div class="sp-turn-row">${chip('fly', 'Fly', T.fly)}${chip('jump', 'Jump', T.jump)}${chip('tele', 'Teleport', T.tele)}${chip('muddled', 'Muddled', T.muddled)}${chip('noAttack', 'No attack', T.noAttack)}</div>
      ${areaEditor(T)}
      ${inits}
      <div class="sp-turn-row"><button type="button" class="sp-turn-btn" data-turn="${T.on ? 'off' : 'on'}">${T.on ? 'Clear' : 'Show'}</button></div>
      ${T.on ? resultHtml() : ''}
    </div>`;
}

export function initTurnPanel(panel) {
  panel.addEventListener('click', e => {
    const cellEl = e.target.closest('[data-turn-aoe]');
    if (cellEl) {
      const i = Number(cellEl.dataset.turnAoe), a = uiState.turn.area;
      setTurn({ area: a.includes(i) ? a.filter(x => x !== i) : [...a, i].sort((p, q) => p - q) });
      return;
    }
    const b = e.target.closest('[data-turn]');
    if (!b) return;
    const T = uiState.turn, k = b.dataset.turn;
    if (k === 'on' || k === 'off') setTurn({ on: k === 'on' });
    else if (k === 'fly') setTurn({ fly: !T.fly, jump: T.fly ? T.jump : false });
    else if (k === 'clearArea') setTurn({ area: [] });
    else if (k === 'jump') setTurn({ jump: !T.jump, fly: T.jump ? T.fly : false });
    else if (k in T) setTurn({ [k]: !T[k] });
  });
  panel.addEventListener('change', e => {
    const f = e.target.dataset?.turnField;
    if (!f) return;
    const n = Math.round(Number(e.target.value));
    if (f === 'move' || f === 'range') setTurn({ [f]: Number.isFinite(n) ? Math.max(0, Math.min(20, n)) : 0 });
    else if (f === 'targets') setTurn({ targets: Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : 1 });
    else if (f === 'init') {
      const init = { ...uiState.turn.init };
      if (e.target.value === '' || !Number.isFinite(n)) delete init[e.target.dataset.key]; else init[e.target.dataset.key] = Math.max(1, Math.min(99, n));
      setTurn({ init });
    }
  });
}
