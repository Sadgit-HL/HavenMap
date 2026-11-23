// What a monster turn shows, decided in one place from what the card lets the monster do (exploration, branch explore/monster-automation). Pure logic, no DOM.
// The board marks, the line under the buttons, the details and the forum text all follow this, so that a card without an attack never talks about a range and
// a card without a move never shows where it moves towards.
//
// turnView(res, { moves, attacks }) -> { kind, showFocus, showDest, showEnd }
//   res      the result of solveMove (scripts/monsterMove.js)
//   moves    the monster can move (move points above 0, not immobilized)       attacks  the card has an attack and it is not disarmed
//   stunned  the monster does nothing this turn
//   kind     stunned   it does nothing: nothing to show but that
//            idle      neither a move nor an attack: nothing to show
//            nofocus   no character to attack or to move towards
//            attack    the focus can be attacked this turn (from its own hex when it cannot move)
//            out       an attack, no move, the focus is out of range
//            approach  cannot reach the focus this turn: moves towards it (an attack that is out of range, or a move alone that does not get next to it)
//            move      a move without an attack that ends next to the focus
//   showFocus  mark the focus     showDest  mark the hexes it moves towards     showEnd  mark the end hexes (the hex it already stands on only for an attack)
export function turnView(res, { moves, attacks, stunned = false }) {
  const kind = stunned ? 'stunned'
    : !moves && !attacks ? 'idle'
    : !res.focuses.length ? 'nofocus'
    : attacks && res.canAttackFocus ? 'attack'
    : !moves ? 'out'
    : !attacks && res.canAttackFocus ? 'move'
    : 'approach';
  return { kind, showFocus: !['stunned', 'idle', 'nofocus'].includes(kind), showDest: kind === 'approach', showEnd: kind === 'attack' || kind === 'approach' || kind === 'move' };
}

// The line under the buttons for a view. `targets` the names it attacks, `hex` the end hex label, `stays` the end hex is where it stands, `options` the
// number of end hexes to choose from, `sight` (res.sightBlocked) the reason for no attack is sight, not the distance: No LOS instead of Out of range.
export function viewStatus(kind, { attacks, targets = '', hex = '', stays = false, options = 1, sight = false } = {}) {
  if (kind === 'stunned') return 'Stunned: no action';
  if (kind === 'idle') return '';
  if (kind === 'nofocus') return attacks ? (sight ? 'No LOS' : 'No target in reach') : 'No target to move towards';
  if (options > 1) return `${options} options: pick a hex`;
  if (kind === 'attack') return `Attack ${targets} from ${hex}`;
  const none = sight ? 'No LOS' : 'Out of range';
  if (kind === 'out') return none;
  if (kind === 'approach') return attacks ? (stays ? none : `${none}, to ${hex}`) : (stays ? 'Cannot get closer' : `Moves to ${hex}`);
  return stays ? `Stays at ${hex}` : `Moves to ${hex}`;
}

// A disarmed monster still moves as if it would attack (the focus and the end hex are the same) but does not attack: the result without the attack, targets and
// area, so that the end hexes are only moves.
export function withoutAttack(res) {
  return { ...res, actions: res.actions.map(a => ({ ...a, attack: false, targets: [], area: [] })) };
}
