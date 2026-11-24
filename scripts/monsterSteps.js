// A monster turn with several actions (attack, move, attack ...), on top of solveMove (scripts/monsterMove.js). Pure logic, no DOM.
// The focus is fixed once for the whole turn: it is worked out as for a card with the first move and the first attack, and every later stage keeps it (solveMove's
// `focus`). Each stage then starts where the earlier one ended, so the monster is moved on a copy of the hex state.
//
// solveTurn(hs, o) -> { focuses, canAttackFocus, floorKnown, sightBlocked, stages, end }
//   hs     a hex state (buildHexState)
//   o      the options of solveMove (active, flying, teleport, muddled, initiatives, canSee) plus
//            steps       the moves and attacks of the card in reading order (cardOptions().steps)
//            picks       the choice made at each stage, by index: { hex: 'col,row', targets?: 'key key' }; without one the first of the tied actions is taken
//            immobilized the moves count as 0      disarmed  the attacks are not made (the monster moves as if they were)      stunned  nothing is done
//   stages [{ steps, from, res, chosen, end }]
//            steps   the indexes into o.steps this stage does: a move and the attack that follows it are one stage (the attack is made from where the move ends),
//                    an attack with no move before it, or a move with no attack after it, a stage of its own
//            from    the hex the stage starts on         res  the result of solveMove for it (all tied actions)
//            chosen  the action taken, from the picks   end   the hex it ends on
//   end    where the monster stands at the end
import { solveMove } from './monsterMove.js';
import { hexKey } from './hexState.js';

const keyOf = f => hexKey(f.col, f.row);

// The hex state with the monster on another hex.
function moved(hs, from, to) {
  if (from.col === to.col && from.row === to.row) return hs;
  return { ...hs, figures: hs.figures.map(f => (f.side === 'monsters' && f.col === from.col && f.row === from.row ? { ...f, col: to.col, row: to.row } : f)) };
}

// The stages of a list of steps: a move takes the attack right after it, other attacks stand alone.
export function stagesOf(steps) {
  const out = [];
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].t === 'move' && steps[i + 1]?.t === 'attack') { out.push([i, i + 1]); i++; }
    else out.push([i]);
  }
  return out;
}

export function solveTurn(hs, o) {
  const { steps = [], picks = [], immobilized = false, disarmed = false, stunned = false, ...base } = o;
  const start = { col: base.active.col, row: base.active.row };
  if (stunned) return { focuses: [], canAttackFocus: false, floorKnown: hs.floorKnown, sightBlocked: false, stages: [], end: start };
  const firstMove = steps.find(s => s.t === 'move'), firstAttack = steps.find(s => s.t === 'attack');
  const mv = s => (s && !immobilized ? s.move : 0);
  const opts = (mvStep, atkStep, extra = {}) => ({
    ...base, active: base.active, move: mv(mvStep), jumping: mvStep ? !!mvStep.jumping : false,
    attack: !!atkStep, range: atkStep?.range ?? 0, targets: atkStep?.targets ?? 1, area: atkStep?.area ?? [], ...extra,
  });

  // The focus of the turn: as for the first move and the first attack, from where the monster starts.
  const plan = solveMove(hs, opts(firstMove, firstAttack));
  const result = { focuses: plan.focuses, canAttackFocus: plan.canAttackFocus, floorKnown: plan.floorKnown, sightBlocked: plan.sightBlocked, stages: [], end: start };
  if (!plan.focuses.length) return result;
  const focus = plan.focuses.map(keyOf);

  let at = start, board = hs;
  stagesOf(steps).forEach((idx, n) => {
    const mvStep = idx.map(i => steps[i]).find(s => s.t === 'move'), atkStep = idx.map(i => steps[i]).find(s => s.t === 'attack');
    let res = solveMove(board, opts(mvStep, atkStep, { active: at, focus }));
    if (disarmed) res = { ...res, actions: res.actions.map(a => ({ ...a, attack: false, targets: [], area: [] })) };
    const pick = picks[n], same = a => pick && hexKey(a.col, a.row) === pick.hex && (pick.targets == null || a.targets.join(' ') === pick.targets);
    const chosen = res.actions.find(same) ?? res.actions[0];
    const end = { col: chosen.col, row: chosen.row };
    result.stages.push({ steps: idx, from: at, res, chosen, end });
    board = moved(board, at, end);
    at = end;
  });
  result.end = at;
  return result;
}
