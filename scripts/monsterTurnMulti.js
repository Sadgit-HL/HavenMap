// The monster turn of a card with several actions, for the panel (scripts/monsterTurn.js). Pure logic, no DOM: it turns the panel's values and the card's steps
// into a solveTurn run (scripts/monsterSteps.js), and the stages of that run into the lines of the status, the details and the forum text.
// The player picks one end hex per turn, at the first stage that has a move (or the first stage when the card has no move); the other stages take the first of
// their tied actions, starting where the one before ended.
import { solveTurn } from './monsterSteps.js';
import { areaOffsets } from './monsterMove.js';
import { hexDistance, edgeKey } from './hexGrid.js';
import { hexKey } from './hexState.js';

// The end hexes of a result to choose from, one per hex, with the groups of targets that tie there and the hexes it moves towards.
export function choicesOf(res) {
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

// The steps of the card with the values of the panel: the first move and the first attack take what the player typed (move, range, targets, area, fly, jump), the
// others are the card's. With "No attack" on, the attacks are left out. Every step keeps the index it has on the card (`src`).
export function panelSteps(steps, T) {
  let move = false, attack = false;
  const out = [];
  steps.forEach((s, src) => {
    if (s.t === 'move') {
      out.push(move ? { ...s, src } : { ...s, src, move: T.move, jumping: !!T.jump && !T.fly });
      move = true;
    } else if (!T.noAttack) {
      out.push(attack ? { ...s, src } : { ...s, src, range: T.range, targets: T.all ? 6 : T.targets, area: T.cells ?? areaOffsets(T.area ?? [], !(T.range > 0)) });
      attack = true;
    }
  });
  return out;
}

// The index of the stage where the player picks: the first one with a move, else the first.
export const pickStageOf = (stages, steps) => Math.max(0, stages.findIndex(s => s.steps.some(i => steps[i].t === 'move')));

// A turn with several actions, worked out for the panel's values. `o` is what solveTurn takes, without `picks`; `choice` the hex the player picked ('col,row') or null.
// -> { stages, pickIdx, res, choices, choice }
//    stages   the stages with the choice taken (and later stages worked out from it)    res  the result at the picking stage, all tied actions
//    choices  the end hexes to choose from      choice  the hex taken: the pick when it is one of them, else the only choice, else the first
export function solveMulti(hs, o, choice = null) {
  const first = solveTurn(hs, o);
  if (!first.stages.length) return { stages: [], pickIdx: 0, res: { focuses: first.focuses, canAttackFocus: false, actions: [], floorKnown: first.floorKnown, sightBlocked: first.sightBlocked }, choices: [], choice: null, end: first.end };
  const pickIdx = pickStageOf(first.stages, o.steps), res = first.stages[pickIdx].res, choices = choicesOf(res);
  const taken = choices.find(c => c.key === choice)?.key ?? choices[0]?.key ?? null;
  const picks = [];
  if (taken) picks[pickIdx] = { hex: taken };
  const final = solveTurn(hs, { ...o, picks });
  return { stages: final.stages, pickIdx, res, choices, choice: taken, end: final.end };
}

// The stage of each step of the card (by the index on the card), the choice made at a stage: the tied groups of targets and the hexes towards.
function stageChoice(stage) {
  const key = stage.end.col + ',' + stage.end.row, c = choicesOf(stage.res).find(x => x.key === key);
  return c ?? { key, col: stage.end.col, row: stage.end.row, attack: false, groups: [], towards: [], focus: [] };
}

// The items for stepsPost (scripts/monsterPost.js): every move, attack and other action of the card in the order of the card.
//   plan       cardOptions().plan      steps  the panel's steps (panelSteps)     stages  the stages of the run
//   names      Map 'col,row' -> name of a character          label  hex -> 'E5'
//   attacks    the monster can attack (no disarm, no stun)   immobilized  the moves count as nothing    muddled  every attack has disadvantage
//   here       the hex the monster stands on (for a turn with no stages: no character, it stays)     walls  the walls of the hex state (for adjacency)
export function postItems({ plan, steps, stages, names, label, here = null, attacks = true, immobilized = false, muddled = false, walls = null }) {
  const stageOf = new Map();
  stages.forEach(st => st.steps.forEach(i => stageOf.set(steps[i].src, { st, step: steps[i] })));
  const lab = k => { const [c, r] = k.split(',').map(Number); return label({ col: c, row: r }); };
  const name = k => names.get(k) ?? k;
  const items = [];
  for (const p of plan) {
    if (typeof p === 'number') { items.push({ t: 'extra', i: p }); continue; }
    const at = stageOf.get(Number(p.slice(1)));
    if (!at) {
      const step = steps.find(s => s.src === Number(p.slice(1)));
      if (!step) continue;                                                            // a step the panel left out (No attack)
      if (!stages.length && here) items.push(step.t === 'move' ? { t: 'move', from: label(here), to: label(here), points: null } : { t: 'attack', attack: null, targets: [], noAttack: attacks ? 'no target in reach' : null });   // no focus: it stays
      continue;
    }
    const { st, step } = at, c = stageChoice(st);
    if (step.t === 'move') {
      items.push({ t: 'move', from: label(st.from), to: label(st.end), points: !immobilized && step.move > 0 ? step.move : null, towards: !c.attack && c.towards.length ? lab(c.towards[0]) : null });
      continue;
    }
    const attacking = c.attack && attacks;
    const adjacentTo = t => { const [tc, tr] = t.split(',').map(Number); return hexDistance(c.col, c.row, tc, tr) === 1 && !walls?.has(edgeKey(c.key, t)); };
    items.push({
      t: 'attack',
      attack: attacking ? { damage: step.damage ?? null, range: step.range, targets: step.targets, effects: step.effects ?? [] } : null,
      targets: attacking ? c.groups.map(g => g.map(name)) : [],
      focus: c.focus.map(name),
      disadvantage: !attacking ? [] : muddled ? true : step.range > 0 ? c.groups.flat().filter(adjacentTo).map(name) : [],
      noAttack: attacks && !c.attack ? (st.res.sightBlocked ? 'no LOS' : st.res.focuses.length ? 'out of range' : 'no target in reach') : null,
    });
  }
  return items;
}

// One entry per stage for stagesStatus (scripts/monsterView.js).
export function stageSummaries({ steps, stages, pickIdx, choices, names, label, attacks = true }) {
  return stages.map((st, n) => {
    const c = stageChoice(st), hasMove = st.steps.some(i => steps[i].t === 'move'), hasAttack = st.steps.some(i => steps[i].t === 'attack');
    return {
      moves: hasMove, attacks: hasAttack && attacks, did: c.attack && attacks, targets: c.groups.map(g => g.map(t => names.get(t) ?? t).join(', ')).join(' or '),
      hex: label(st.end), stays: hexKey(st.from.col, st.from.row) === c.key, options: n === pickIdx ? choices.length : 1,
    };
  });
}

