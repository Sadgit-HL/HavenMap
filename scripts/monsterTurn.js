// Monster turn panel and highlights on the map page (exploration, branch explore/monster-automation).
// The panel sits in the inspect panel of a selected monster, closed until the header is clicked (nothing runs while it is closed): move, range, movement type,
// the area pattern when the card has one, and the initiative of each character; open, it runs the solver
// (scripts/monsterMove.js, Gloomhaven 2e rules) on the hex state (scripts/hexState.js) and marks the focus and the end hexes on the board.
// The result is worked out again on every render, so it follows the pieces when they are moved. Where several end hexes tie the player picks one (a row of
// the panel or the hex on the board); Move puts the monster there (an ordinary map change, Ctrl+Z undoes it), Forum text copies the turn for the forum with BGG
// codes, Next selects the monster that acts after this one.
import { uiState, setTurn, selectObject } from './uiState.js';
import { state, patch } from './state.js';
import { centerBoardPoint } from './controls.js';
import { TILES, OVERLAY_OBJECTS, MONSTERS, MERCENARIES, SUMMONS, GAME_ID } from './data.js';
import { activeCardsFor } from './decks.js';
import { cardOptions, cardCandidates, distinctCards, areaIndexes, infusedNames } from './monsterCard.js';
import { colLabel, hexCenter, HEX_W, HEX_H } from './hex.js';
import { buildHexState, hexKey } from './hexState.js';
import { solveMove, areaOffsets, isMuddled, turnConditions } from './monsterMove.js';
import { makeSightLine } from './los.js';
import { hexDistance, edgeKey } from './hexGrid.js';
import { turnPost } from './monsterPost.js';
import { turnView, viewStatus, withoutAttack } from './monsterView.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// The floor masks are for the Gloomhaven 2e tiles only (game 'gh2'); tiles of other games have none and the floor is then unknown.
const lookup = {
  tileTitle: id => { const t = TILES.byId.get(id); return t?.game === 'gh2' ? t.title : null; },
  overlay: id => OVERLAY_OBJECTS.byId.get(id) ?? null,
};
const TABLES = { monster: MONSTERS, mercenary: MERCENARIES, summon: SUMMONS };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const figName = f => { const cls = TABLES[f.kind]?.byId.get(f.id)?.title ?? f.kind; return f.name ? `${f.name} (${cls})` : cls; };   // a named character: name and class
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
// numbers are not the Secretariat's ids, equal initiatives can be ambiguous: then the player picks the card by its name). null without data for it, { loading } while
// the data loads, { none } without a card drawn, { unmatched } for a card that is not in the data.
function cardInfo(obj) {
  if (GAME_ID !== 'gh') return null;
  ensureData();
  if (!data) return { loading: true };
  const mon = MONSTERS.byId.get(Number(obj.id)), rec = mon ? data.GH2_MONSTERS[mon.title.replace(/ /g, '-')] : null;
  if (!rec) return null;
  const kind = obj.role === 'elite' ? 'elite' : obj.role === 'boss' ? 'boss' : 'normal', level = Math.max(0, Math.min(7, Number(state.CurrentLevel) || 0));
  const chars = Math.max(1, (state.mercenaries ?? []).length || 4);
  const act = activeCardsFor(obj.id);
  if (!act) return { rec, kind, level, chars, none: true };
  const deck = data.GH2_MONSTER_DECKS[act.slug] ?? [];
  const options = [];
  for (const c of act.cards) for (const g of distinctCards(cardCandidates(act.slug, deck, c))) options.push({ n: c.n, init: c.init, card: g, pickKey: `${act.slug}:${c.n}` });
  if (!options.length) return { rec, kind, level, chars, none: false, unmatched: act.cards.map(c => c.init) };
  const byCard = new Map();
  for (const o of options) byCard.set(o.pickKey, [...(byCard.get(o.pickKey) ?? []), o]);
  const chosen = [...byCard.entries()].map(([k, list]) => list.find(o => String(o.card.id) === String(uiState.turn.pick[k])) ?? list[0]);
  const sel = chosen[0];
  return { rec, kind, level, chars, options, chosen: sel, ambiguous: byCard.get(sel.pickKey).length > 1, alts: byCard.get(sel.pickKey), more: act.cards.length > 1,
    opts: cardOptions({ monster: rec, kind, level, card: sel.card, chars, infused: infusedNames(state.elements) }) };
}

// Puts the values of the card into the panel when the monster, its card, the level or the party size change; manual changes stay until then.
function autoApply(obj) {
  const info = cardInfo(obj), T = uiState.turn;
  if (!info?.opts) return;
  // The outcome of the card is part of the key: infusing or losing an element changes it only for a card with a consume, and only then are manual changes reset.
  const outcome = JSON.stringify([info.opts.move, info.opts.range, info.opts.targets, info.opts.attack, info.opts.damage, info.opts.jumping, info.opts.area.length]);
  const key = [obj.id, info.chosen.pickKey, info.chosen.card.id ?? info.chosen.card.name, info.kind, info.level, info.chars, outcome].join('|');
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
  const st = turnConditions(obj), eff = effective(obj);                     // stun, immobilize and disarm override the values of the panel
  let res = st.stunned ? { focuses: [], canAttackFocus: false, actions: [], floorKnown: hs.floorKnown } : solveMove(hs, {
    active: { col: Number(obj.x), row: Number(obj.y) }, move: eff.move, range: T.range, attack: !T.noAttack, targets: T.all ? 6 : T.targets, area: T.cells ?? areaOffsets(T.area, !(T.range > 0)),
    flying: T.fly, jumping: T.jump, teleport: T.tele, muddled: isMuddled(obj), initiatives, canSee: (a, b) => sight(a, b) !== null,
  });                                                                       // a disarmed monster still moves as if it would attack: attack is the card's
  if (st.disarmed) res = withoutAttack(res);
  return { hs, res, figs, sight, choices: choicesOf(res), here: { col: Number(obj.x), row: Number(obj.y) }, view: turnView(res, { moves: eff.move > 0, attacks: eff.attacks, stunned: st.stunned }) };
}

// What the monster can do this turn: the values of the panel, taken away by its conditions. Stun: nothing. Immobilize: no move. Disarm: no attack.
function effective(obj) {
  const T = uiState.turn, st = turnConditions(obj);
  return { move: st.stunned || st.immobilized ? 0 : T.move, attacks: !T.noAttack && !st.disarmed && !st.stunned };
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
    if (!a.focus.length || !run_.view.showDest) continue;                         // only a monster that moves and cannot get there marks where it moves towards
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
    if (!a.focus.length || !run_.view.showEnd || seen.has(a.col + ',' + a.row)) continue;
    if (!a.attack && a.col === run_.here.col && a.row === run_.here.row) continue;  // the hex it already stands on is marked only for an attack
    const hk = a.col + ',' + a.row, picked = hk === uiState.turn.choice && run_.choices.length > 1;
    seen.add(hk);
    const shape = hexShape(a.col, a.row, a.attack
      ? { fill: 'rgba(80,200,120,0.38)', stroke: picked ? '#ffffff' : '#50c878', 'stroke-width': picked ? 5 : 3 }
      : { fill: 'rgba(106,167,255,0.32)', stroke: picked ? '#ffffff' : '#6aa7ff', 'stroke-width': picked ? 5 : 3 });
    if (run_.choices.length > 1) {                                                // a choice: the hexes can be clicked
      shape.setAttribute('pointer-events', 'all');
      shape.style.cursor = 'pointer';
      for (const ev of ['mousedown', 'touchstart', 'pointerdown']) shape.addEventListener(ev, e => e.stopPropagation());
      shape.addEventListener('click', e => { e.stopPropagation(); setTurn({ choice: hk }); });
    }
    layer.appendChild(shape);
  }
  if (run_.view.showFocus) for (const f of res.focuses) layer.appendChild(hexShape(f.col, f.row, { fill: 'none', stroke: '#ffd23f', 'stroke-width': 5 }));
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
// The end hexes to choose from, one per hex, with the groups of targets that tie there and the hexes it moves towards.
function choicesOf(res) {
  const by = new Map();
  for (const a of res.actions) {
    if (!a.focus.length) continue;
    const k = a.col + ',' + a.row;
    if (!by.has(k)) by.set(k, { key: k, col: a.col, row: a.row, attack: false, groups: [], towards: [], focus: [] });
    const c = by.get(k);
    for (const f of a.focus) if (!c.focus.includes(f)) c.focus.push(f);
    if (a.attack) { c.attack = true; if (!c.groups.some(g => g.join() === a.targets.join())) c.groups.push(a.targets); }
    for (const d of a.destinations) if (!c.towards.includes(d)) c.towards.push(d);
  }
  return [...by.values()];
}

const titleCase = s => String(s).replace(/\b\w/g, c => c.toUpperCase());

// The monsters in the order they act: the initiative of the card drawn this round, elites before normal monsters, then the standee number. Monsters of a deck
// with no card drawn do not act.
function turnOrder() {
  return (state.monsters ?? []).map((m, idx) => ({ m, idx, act: activeCardsFor(m.id) })).filter(x => x.act)
    .map(x => ({ ...x, init: Math.min(...x.act.cards.map(c => c.init)), rank: x.m.role === 'normal' ? 1 : 0 }))
    .sort((a, b) => a.init - b.init || a.rank - b.rank || (a.m.standeeNum ?? 99) - (b.m.standeeNum ?? 99) || a.idx - b.idx);
}

// The monster after the selected one in that order (the first when the selected one is not in it), null when there is no other.
function nextInfo() {
  const sel = uiState.selected, list = turnOrder();
  if (!list.length) return null;
  const cur = sel?.kind === 'monster' ? list.findIndex(x => x.idx === sel.idx) : -1, n = list[(cur + 1) % list.length];
  if (sel?.kind === 'monster' && n.idx === sel.idx) return null;
  const title = MONSTERS.byId.get(Number(n.m.id))?.title ?? 'monster';
  return { idx: n.idx, m: n.m, name: `${titleCase(title)}${n.m.role === 'elite' ? ' (elite)' : n.m.role === 'boss' ? ' (boss)' : ''}${n.m.standeeNum != null ? ` #${n.m.standeeNum}` : ''}` };
}

function goNext() {
  const n = nextInfo();
  if (!n) return;
  selectObject('monster', n.idx, Number(n.m.x), Number(n.m.y));
  const c = hexCenter(Number(n.m.x), Number(n.m.y));
  centerBoardPoint(c.x, c.y);
}

// The only way for a monster that neither moves nor attacks: where it stands.
function idleChoice(obj) {
  const col = Number(obj.x), row = Number(obj.y);
  return { key: hexKey(col, row), col, row, attack: false, groups: [], towards: [], focus: [] };
}

// The forum text of the chosen end hex for this monster.
function buildPost(obj, c) {
  const T = uiState.turn, mon = MONSTERS.byId.get(Number(obj.id)), info = cardInfo(obj), o = info?.opts;
  const names = new Map(last.hs.figures.map(f => [hexKey(f.col, f.row), figName(f)]));
  const st = turnConditions(obj), eff = effective(obj), attacking = c.attack && eff.attacks;
  const adjacentTo = t => { const [tc, tr] = t.split(',').map(Number); return hexDistance(c.col, c.row, tc, tr) === 1 && !last.hs.walls?.has(edgeKey(c.key, t)); };
  // The targets it attacks with disadvantage: all of them when it is muddled, otherwise the adjacent ones of a ranged attack.
  const disadvantage = !attacking ? [] : isMuddled(obj) ? true : T.range > 0 ? c.groups.flat().filter(adjacentTo).map(t => names.get(t) ?? t) : [];
  const lab = k => { const [kc, kr] = k.split(',').map(Number); return label({ col: kc, row: kr }); };
  return turnPost({
    name: titleCase(mon?.title ?? 'monster'), role: obj.role, standee: obj.standeeNum ?? null, from: label({ col: Number(obj.x), row: Number(obj.y) }), to: label(c),
    stunned: st.stunned, remove: st.stunned ? ['stun'] : [st.immobilized && 'immobilize', st.disarmed && 'disarm'].filter(Boolean),
    points: eff.move > 0 ? eff.move : null,
    towards: !c.attack && c.towards.length ? lab(c.towards[0]) : null,
    noAttack: eff.attacks && !c.attack ? (last.res.focuses.length ? 'out of range' : 'no target in reach') : null,
    attack: attacking ? { damage: o?.damage ?? null, range: T.range, targets: T.all ? 6 : T.targets, effects: o?.effects ?? [] } : null,
    targets: attacking ? c.groups.map(g => g.map(t => names.get(t) ?? t)) : [], focus: c.focus.map(k => names.get(k) ?? k), disadvantage,
    extras: o?.extras ?? [], order: o?.order ?? null, statFx: o?.statFx ?? [], chars: info?.chars ?? 4,
  });
}

// Move: the monster goes to the chosen hex, the text of this turn is kept for the Forum text button.
function confirmMove() {
  const T = uiState.turn, sel = uiState.selected, obj = selectedMonster();
  if (!obj || !last) return;
  const c = last.choices.find(x => x.key === T.choice);
  if (!c) return;
  const post = buildPost(obj, c);
  patch({ monsters: state.monsters.map((m, i) => (i === sel.idx ? { ...m, x: c.col, y: c.row } : m)) });
  Object.assign(T, { lastPost: post, postFor: sel.idx, choice: null });
  selectObject('monster', sel.idx, c.col, c.row);
}

async function copyPost() {
  const T = uiState.turn, obj = selectedMonster(), idle = ['idle', 'stunned'].includes(last?.view.kind);
  const c = idle && obj ? idleChoice(obj) : last?.choices.find(x => x.key === T.choice);
  const cur = obj ? hexKey(Number(obj.x), Number(obj.y)) : null;
  // a hex to move to: its text; nothing to move to after a move: the text of that move; neither a move nor an attack: it stays, with the other actions of the card
  const text = obj && c && (idle || c.key !== cur || !T.lastPost) ? buildPost(obj, c) : T.lastPost;
  if (!text) return;
  try { await navigator.clipboard.writeText(text); } catch { return; }
  setTurn({ copied: true });
  setTimeout(() => setTurn({ copied: false }), 1500);
}

export function refreshSolver() {
  const T = uiState.turn, mon = selectedMonster();
  if (T.postFor !== uiState.selected?.idx) T.lastPost = '';                       // the text of the last move belongs to that monster
  if (mon && (T.on || T.detailsOpen)) autoApply(mon);                            // Show off and no details: no data, no solver, no marks
  const sel = T.on ? mon : null, info = sel ? cardInfo(sel) : null;
  last = sel && !(info?.none || info?.unmatched || info?.loading) ? run(sel) : null;   // no card to go by: nothing is run, the status line says why
  if (last) {
    const ch = last.choices;
    if (!ch.some(c => c.key === T.choice)) T.choice = ch.length === 1 ? ch[0].key : null;     // one way: it is the choice; several: the player picks
  }
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
  const mon = selectedMonster(), st = turnConditions(mon), eff = mon ? effective(mon) : { attacks: true };
  const conds = [st.stunned && 'Stunned: no action', !st.stunned && st.immobilized && 'Immobilized: cannot move', !st.stunned && st.disarmed && 'Disarmed: cannot attack'].filter(Boolean);
  if (last.view.kind === 'idle' && !conds.length) return '';
  const { res, hs, view, here } = last, T = uiState.turn, lines = [];
  if (view.kind === 'stunned' || view.kind === 'idle') { /* nothing to reach or attack: only the conditions below */ }
  else if (view.kind === 'nofocus') lines.push(!eff.attacks ? 'No focus: nothing to move towards' : 'No focus: nothing can be reached or attacked');
  else {
    lines.push(`Focus: ${res.focuses.map(f => `${esc(figName(f))} ${label(f)}`).join(' or ')}`);
    const names = new Map(last.hs.figures.map(f => [hexKey(f.col, f.row), figName(f)]));
    const ends = res.actions.filter(x => x.attack || x.col !== here.col || x.row !== here.row);           // the hex it stands on counts only for an attack
    const hexes = [...new Set(ends.map(label))].join(', ');
    if (view.kind === 'attack' && res.actions.some(x => x.targets.length > 1)) {
      lines.push('Attacks from:');
      for (const x of res.actions) lines.push(`${label(x)}: ${x.targets.map(t => esc(names.get(t) ?? t)).join(', ')}`);
    } else if (view.kind === 'attack') lines.push(`Attacks from: ${hexes}`);
    else if (view.showEnd && hexes) lines.push(`Moves to: ${hexes}`);
    if (view.showDest) {
      const dest = [...new Set(res.actions.flatMap(a => a.destinations))].map(k => { const [c, r] = k.split(',').map(Number); return label({ col: c, row: r }); });
      if (dest.length) lines.push(`Towards: ${dest.join(', ')}`);
    }
  }
  lines.push(...conds);
  if (mon && isMuddled(mon) && eff.attacks && T.range > 0) lines.push('Muddled: does not step away from adjacent targets');
  if (!hs.floorKnown) lines.push('Floor unknown on this map: hexes outside the tiles are not excluded');
  return `<div class="sp-turn-res">${lines.map(l => `<div>${l}</div>`).join('')}</div>`;
}

// What the card says about this turn: the notes (consumes that apply or not, texts the solver cannot act on). The card itself is shown in the sidebar (Active
// ability), and why there is nothing to show is in the status line.
function cardHtml(info) {
  const notes = info?.opts?.notes ?? [];
  return notes.length ? `<ul class="sp-turn-notes">${notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
}

// The choice between end hexes, one row for each (the hexes on the board can be clicked as well).
function choicesHtml() {
  if (!last || last.choices.length < 2) return '';
  const T = uiState.turn, names = new Map(last.hs.figures.map(f => [hexKey(f.col, f.row), figName(f)]));
  return `<div class="sp-turn-choices">${last.choices.map(c => `<button type="button" class="sp-turn-choice${c.key === T.choice ? ' on' : ''}" data-turn-hex="${c.key}">${label(c)}${c.groups.length ? ': ' + c.groups.map(g => g.map(t => esc(names.get(t) ?? t)).join(', ')).join(' / ') : ''}</button>`).join('')}</div>`;
}

// The line under the buttons: what Move will do, or why there is nothing to show (no card drawn, no card in the data).
function statusText() {
  if (!uiState.turn.on) return '';
  const sel = selectedMonster(), info = sel ? cardInfo(sel) : null;
  if (info?.none) return 'No ability card drawn';
  if (info?.unmatched) return `No matching card in the data for initiative ${info.unmatched.join(', ')}`;
  if (!last) return '';
  const { view, choices } = last, T = uiState.turn, attacks = effective(sel).attacks, cur = sel ? hexKey(Number(sel.x), Number(sel.y)) : null;
  const c = choices.find(x => x.key === T.choice) ?? choices[0];
  const names = new Map(last.hs.figures.map(f => [hexKey(f.col, f.row), figName(f)]));
  const targets = c ? c.groups.map(g => g.map(t => esc(names.get(t) ?? t)).join(', ')).join(' or ') : '';
  return viewStatus(view.kind, { attacks, targets, hex: c ? label(c) : '', stays: !!c && c.key === cur, options: choices.length });
}

// Show, BGG text and Move, with the arrow for the next monster and the one for the details.
function barHtml() {
  const T = uiState.turn, sel = selectedMonster(), cur = sel ? hexKey(Number(sel.x), Number(sel.y)) : null;
  const chosen = last?.choices.find(c => c.key === T.choice), next = nextInfo();
  const canMove = T.on && !!chosen && chosen.key !== cur, canPost = (T.on && (!!chosen || ['idle', 'stunned'].includes(last?.view.kind))) || !!T.lastPost;
  return `<div class="sp-turn-bar">` +
    `<button type="button" class="sp-turn-btn${T.on ? ' on' : ''}" data-turn="toggle" aria-pressed="${T.on}">${T.on ? 'Hide' : 'Show'}</button>` +
    `<button type="button" class="sp-turn-btn" data-turn="post"${canPost ? '' : ' disabled'}>${T.copied ? 'Copied' : 'BGG text'}</button>` +
    `<button type="button" class="sp-turn-btn" data-turn="confirm"${canMove ? '' : ' disabled'}>Move${canMove ? ' ' + label(chosen) : ''}</button>` +
    `<button type="button" class="sp-turn-icon" data-turn="next" title="${next ? 'Next: ' + esc(next.name) : 'No other monster to act'}" aria-label="Next monster"${next ? '' : ' disabled'}>&#9654;</button>` +
    `<button type="button" class="sp-turn-icon" data-turn="detailsOpen" aria-expanded="${T.detailsOpen}" aria-label="Details">${T.detailsOpen ? '&#9662;' : '&#9656;'}</button>` +
    `</div>`;
}

// The details: the notes of the card, the initiatives, the values with the area (behind a button), the result and the choice.
function detailsHtml() {
  const T = uiState.turn;
  if (!T.detailsOpen) return '';
  const sel = selectedMonster(), info = sel ? cardInfo(sel) : null, card = sel ? cardHtml(info) : '';
  const figs = last ? last.figs : buildHexState(state, lookup).figures.filter(f => f.side === 'characters');
  const inits = figs.length ? `<div class="sp-turn-inits"><div class="sp-subhead">Initiatives</div>${figs.map(f => {
    const k = figKey(f);
    return `<label class="sp-turn-init"><span>${esc(figName(f))} ${label(f)}</span><input type="number" class="sp-turn-num" data-turn-field="init" data-key="${k}" min="1" max="99" value="${T.init[k] ?? ''}" placeholder="99"></label>`;
  }).join('')}</div>` : '';
  const values = `<button type="button" class="sp-turn-fold" data-turn="valuesOpen" aria-expanded="${T.valuesOpen}">Values</button>` + (T.valuesOpen ? `<div class="sp-turn-values">
      <div class="sp-turn-row"><label>Move ${num('move', T.move)}</label><label>Range ${num('range', T.range)}</label><label>Targets ${num('targets', T.targets)}</label>${chip('all', 'All', T.all)}</div>
      <div class="sp-turn-row">${chip('fly', 'Fly', T.fly)}${chip('jump', 'Jump', T.jump)}${chip('tele', 'Teleport', T.tele)}${chip('noAttack', 'No attack', T.noAttack)}</div>
      ${info === null ? areaEditor(T) : ''}</div>` : '');          // the area comes from the card where there is card data: the grid is only for the rest
  return `<div class="sp-turn-details">
      ${card}
      ${inits}
      ${values}
      ${resultHtml()}
      ${choicesHtml()}
    </div>`;
}

export function turnPanelHtml(kind) {
  if (kind !== 'monster') return '';
  const status = statusText();
  return `<div class="sp-action-section sp-turn"><div class="sp-subhead">Monster turn</div>${barHtml()}${status ? `<div class="sp-turn-status">${status}</div>` : ''}${detailsHtml()}</div>`;
}

export function initTurnPanel(panel) {
  panel.addEventListener('click', e => {
    const hexEl = e.target.closest('[data-turn-hex]');
    if (hexEl) { setTurn({ choice: hexEl.dataset.turnHex }); return; }
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
    else if (k === 'confirm') confirmMove();
    else if (k === 'post') copyPost();
    else if (k === 'next') goNext();
    else if (k === 'fly') setTurn({ fly: !T.fly, jump: T.fly ? T.jump : false });
    else if (k === 'clearArea') setTurn({ area: [], cells: null });
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
