# Monster automation (map page)

In `main` since 2026-11-22 (owner decision; branch `explore/monster-automation`). The Node checks pass (303). The panel was last driven in headless Edge on 2026-11-21; the changes since (details layout, settings popover in the sidebar header, consume icons, stat card effects) were checked by the Node tests only; the Frosthaven page loads in headless Edge (2026-11-22). The monster turn works for the Gloomhaven game only.

The map page can work out a monster's turn: who it goes for (the focus), where it ends its move, whom it attacks. The players check it, move the monster with one click and copy a forum text. The attack roll stays in GeekRoller (forum play: everyone can verify those rolls). Nothing runs until the player asks (the Monster turn section of a selected monster).

## Decisions (owner, 2026-11-21)

- The Gloomhaven 2e rules are the only source of truth for the hex map. One rule set only: the Gloomhaven rules of gloom for focus, disadvantage and target ranking, for every edition (no Frosthaven or Jaws of the Lion rule sets), with line of sight from any point of a hex to any point of the other (the book's rule, not gloom's corner rule).
- Optional: closed by default, nothing loads or runs while it is off. The player confirms every move. Move only for now: no attack roll, no damage.
- Floor masks for the tiles come from the tile images (Gloomhaven 2e tiles done; Frosthaven tiles have none yet).
- Secretariat data is right where it differs from HavenMap's tables (standee counts, a card initiative). The Secretariat licence (AGPL-3.0) is still an open item (`roadmap.md` 36).
- Forum text: one line per monster, a line per target when there are several, no restating of the ability card, BGG forum codes with icons.

## What the player sees (map page, a selected monster)

The bar `Show | BGG text | Move`, a small arrow for the next monster, one for the details, and a status line, above the Active ability card of the inspect panel.

- Show: runs the solver and marks the board by what the card lets the monster do (`scripts/monsterView.js`, below): gold ring the focus, green hex where it attacks from, blue where it only moves, dashed blue the hex it moves towards, orange the area, a thin sight line to each target. Hide clears it. Without a card drawn (or without a match in the data) nothing is run and the status line says so.
- Move: puts the monster on the chosen hex (an ordinary map change, Ctrl+Z undoes it). With a tie the hex is picked on the board or in the details; one way is preselected. Label: `Move F4`.
- BGG text: copies the forum text of the chosen hex, or after a move the text of that move; for a monster that neither moves nor attacks the text is the other actions of the card, or `stays at C3` when there are none. Example: `Name (elite) #3: move 3 E5 to F4, attack 3 range 4 wound pierce 2 on Anaphi (disadvantage), shield 2`. Several targets: the first line has the move and the other actions, each target its own line with `(focus)` and `(disadvantage)` (every target when the monster is muddled); tied groups separated by `or`. An attack with no target: `no attack: out of range` or `no target in reach`; a card without an attack never says that. The permanent effects of the stat card (conditions such as muddle, pierce, the base target count, advantage and disadvantage) are part of the attack, and so is an advantage written on the card; shield and retaliate stay separate. They are applied to the first attack only (the app models one attack), and the panel note says so when the card has several. Advantage and disadvantage are words, there is no BGG icon. A monster that stays has no `towards` and no move value; one that moves has the move value of the card after the move icon. Icons from the BGG codes of the campaign page (`scripts/campaign/bggIcons.js`), with a space before the value (`[icon] 3`), words where there is none. A consumed element is the consume icon (`air_x` ... `wild_x`, the element with the small red cross), as words `consume dark`; a created one is the plain icon. The top bar button `BGG MAP` is a different thing (it copies the map link). A character with a name (set by a click on the mercenary banner in the sidebar) is written `Name (Class)`, one without as the class. The parts of the line follow the card from top to bottom (`order` of `cardOptions`, `readingOrder` in `scripts/monsterCard.js`): an action above the move comes before it, one below the attack after it. With several targets what comes before the attack is on the first line, the target lines follow, what comes after the attack is one line at the end. "stays at X" takes the place of the move on the card; a card without a move does not say it (only when there is nothing else to write).
- All (a button of its own row under the bar, "BGG text for all N", shown when two or more standees of the type act): copies the texts of every standee of the selected monster type in one go, in the order they act (`typeStandees`, `batchPost` in `scripts/monsterTurn.js`). Each is solved with the values of its own card (elite and normal differ, a stun or immobilize of the standee counts, the typed initiatives are shared) on a copy of the map where the standees before it have moved to their end hex, so they do not share a hex and do not block or open ways for each other. Where several end hexes tie, the hex the player picked for that standee in the panel or on the board is used (`pickChoice`, `uiState.turn.picks`: remembered per standee for its position, card and level, session only) when it is still one of the tied hexes after the moves before it, otherwise the first one; the status line names the standees that took the first one (no pick, or the pick is no longer available); a standee with no way and nothing to do stays. The texts are joined by a line break, by a blank line when one of them has several lines. Text only: nothing is moved on the map. Standees of the same deck but another type are not included.
- Next: selects the monster that acts after this one (initiative of the drawn card, elites before normal monsters, then the standee number; decks with no card drawn are skipped) and centres the board on it.
- Details (arrow): the notes of the card (consumes that apply or not, texts the solver cannot act on), the initiatives per character (always shown), a Values button that opens move, range, targets, All, Fly, Jump, Teleport, No attack and the area (the area, a 7 by 7 hex drawing, only for a monster without card data: other games or a monster that is not in the data; with card data the shape comes from the card and there is no grid), the result and the rows to pick a hex. The panel fills the values from the card when the monster, card, level, party size or the outcome of an element consume change; manual changes stay until then. Muddled is not a value: it comes from the Muddle condition of the monster. Which card it is comes from `scripts/games/gh2_card_ids.js` where two cards share an initiative.
- What is shown, by card (`turnView` and `viewStatus` in `scripts/monsterView.js`, one decision for the marks, the status line, the details and the forum text):
  - Move and attack: attack from a green hex, or `Out of range, to H` with a blue end hex and dashed hexes towards the focus.
  - Move, no attack: `Moves to H` (blue), dashed hexes towards only when it cannot get next to the focus; never `out of range`.
  - No move, attack: green own hex when in range, `Out of range` otherwise with no end hex and no towards hexes.
  - Neither: no marks, no status, no focus ring.
  - No character: `No target in reach`, or `No target to move towards` for a card without an attack.
  The hex a monster already stands on is marked only for an attack.
- No LOS (2026-11-23, `sightBlocked` of `solveMove`): when no attack is possible this turn and the reason is sight, not distance (from an end hex the monster can reach, a character is in range but out of its sight, and none is in range and in sight), the status line says `No LOS` instead of `Out of range` (also `No LOS, to H` and, with no focus, instead of `No target in reach`) and the BGG text says `no attack: no LOS`. A card without an attack never says it.
- Conditions of the monster on the map are read like Muddle and override the values of the panel while they are on:
  - Stun: the monster does nothing. No marks and no focus, the status line says `Stunned: no action`, the BGG text is only `Name: remove <stun icon>`.
  - Immobilize: the move counts as 0 (no towards hexes, a stay in the text).
  - Disarm: the attack is off, but the monster moves as if it would attack (same focus and end hex, shown as a move, no attack line, no `out of range`).
  - The BGG text ends with `remove <icons>` for the conditions that end with this turn (stun, immobilize, disarm); nothing else is written about them.
- Show and the details are per session (`uiState.turn`), not in the map link and not across reloads. Initiatives are typed per figure and not saved.

## Modules (pure logic with Node checks, except `monsterTurn.js`)

| File | What |
|---|---|
| `scripts/hexGrid.js` | `neighbors`, `neighborAt`, `hexDistance`, `edgeKey` |
| `scripts/tileMask.js` | `placeMask`, `tileFloorHexes`: a tile mask placed with rotation (axial offsets from the anchor, 60 degree steps) |
| `scripts/games/gh2_tile_masks.js` | GENERATED by `tools/make-tile-masks.py`: floor hexes of the 56 Gloomhaven 2e tiles, from the alpha channel of `images/tiles/gh2` (a hex is floor when 93% of its area is opaque). The anchor of a tile is not always a floor hex (03-B) |
| `scripts/hexState.js` | `buildHexState(state, lookup)`: floor, per hex terrain flags, figures by side, `walls` (borders of tiles) |
| `scripts/los.js` | `makeSightLine`, `makeCanSee`: line of sight |
| `scripts/monsterMove.js` | `solveMove`: movement, focus, end hexes, targets, areas |
| `scripts/monsterCard.js` | `cardOptions`: ability card plus stat card to solver options; `candidatesFor`, `areaIndexes` |
| `scripts/monsterPost.js` | `turnPost`, `extraText`: the forum text |
| `scripts/monsterView.js` | `turnView`, `viewStatus`: what a turn shows for a card (idle, no focus, attack, out, approach, move) |
| `scripts/games/gh2_card_ids.js` | map card number to Secretariat card id, for cards that share an initiative (hand-maintained, read from the ids printed on the card images, a test keeps it complete) |
| `scripts/games/gh2_monsters.js` | GENERATED by `tools/extract-monster-data.py` (a clone of Lurkers/gloomhavensecretariat): 95 monsters (stats per kind and level) and 62 ability decks, 339 cards, about 200 KB, loaded when needed |
| `scripts/monsterSteps.js` | `solveTurn`: a turn with several actions as stages on top of `solveMove`, with the focus fixed for the turn (`focus` option of `solveMove`) |
| `scripts/monsterTurnMulti.js` | the panel's glue for those turns: `panelSteps`, `solveMulti`, `postItems`, `stageSummaries`, `choicesOf` |
| `scripts/monsterTurn.js` | the panel and the board marks (DOM) |
| `scripts/uiState.js` `turn` | panel state |

Tests: `tools/tests/` `tileMasks`, `tileMask`, `hexState`, `los`, `monsterMove`, `monsterCard`, `monsterPost`, `monsterView`, `monsterData`, `gloomScenarios`. Gloom's scenarios: `tools/convert-gloom-scenarios.py <gloom/server/scenarios.py>` writes `tools/tests/fixtures/gloom-scenarios.json` (MIT notice inside); `node tools/gloom-report.mjs [gloomhaven|frosthaven|jotl] [-v]` prints mismatches.

## Cards with several actions (2026-11-24)

30 of the 678 card and kind combinations of the data have more than one attack or move (attack, attack; move, attack, attack; attack, move, attack; three attacks; never two moves). `cardOptions` gives them as `steps` (every move and attack in reading order, each with its own values) and `plan` (the card top to bottom with the extras); the flat fields stay the first move and the first attack. Owner decision: the focus is fixed once for the whole turn.

- `solveTurn` (`monsterSteps.js`): the focus is worked out as for the first move and the first attack. A move takes the attack right after it as one stage; any other attack, or a move with no attack after it, is a stage of its own. Each stage is a `solveMove` from where the one before ended (the monster is moved on a copy of the hex state) with only the focus allowed as focus; the targets of every attack follow the usual ranking. Stun, immobilize and disarm are inputs.
- The player picks one end hex per turn, at the first stage that has a move (the first stage when the card has no move); later stages take the first of their tied actions. The panel keeps its single `choice`, the Move button goes to where the last stage ends.
- Panel (`runMulti` in `monsterTurn.js`): the first move and the first attack take the values of the Values editor, the others are the card's; the status line and the Actions list in the details say what each stage does (`stagesStatus`); the board marks the picking stage as before and draws area, attack hex and sight lines of the other stages.
- Forum text (`stepsPost`): the same lines as `turnPost`, one part per action in card order (`no attack: out of range, move 1 C5 to D5, attack 1 pierce 2 on Anaphi`); an attack with several targets has a line per target. A card with one move and one attack still uses `turnPost` and the single `solveMove`.
- Stat card effects apply to every attack of the card.
- Checked in headless Chromium on 2026-11-24 with hound Sharp Fangs (attack, move, attack): status, Actions list, marks, BGG text, Move. Not driven: ties at the picking stage, the All button with such a card, cards with an area on a later attack.

## Farthest focus (2026-11-24)

Long Shot (Ancient Artillery, the only card of the data) says "Focus on the enemy farthest away within range 7". `cardOptions().focusFarthest` reads the text; `solveMove` takes `farthest`, which turns the closest enemy of the focus step into the farthest one (the proximity term of the focus tuple, negated). Owner decision: ties are resolved as usual (initiative), the change is in the first focus step only (the ranking of the other targets is unchanged), and only enemies that can be attacked (range and sight) count. The panel sets it from the card and shows a `Farthest` chip in the Values. Checked in headless Chromium with Long Shot: the focus is the far character, the chip off gives the close one.

## Hex state

- Floor: tile masks plus corridor overlays and door hexes. `floorKnown` is false when a placed tile has no mask (all Frosthaven tiles): hexes are then not ruled out by floor.
- Terrain by overlay role: obstacle blocks movement only; wall blocks movement and sight; closed door blocks both, an open door is floor; trap, hazardous, difficult, ice are flags; loot and pressure plate block nothing; stickers and class overlays are not terrain. The `role` of the placed object wins over the default role of its type.
- Tile borders: neighbouring floor hexes of different tiles are walled off unless one is a corridor or door hex (an open door or a corridor joins tiles; overlapping tiles get no wall there). Walls on edges stop moving, range measuring, adjacency and sight.
- The Gloomhaven game has ice objects (`gh.js` ids 70 and 71, art from the Frosthaven overlays) because Frosthaven classes (Frozen Fist, Snowdancer) can lay icy terrain.
- Figures are one hex each (boss footprints are not handled).

## Solver (`solveMove`, follows gloom's Gloomhaven rules)

- Paths by (traps, distance). Difficult terrain +1 (not for flying, jumping, teleport, nor on a slide). Walking is blocked by obstacles, walls, closed doors, enemies and the void; flying and jumping pass obstacles and figures, not walls; teleport passes walls. Jumping pays traps and difficult terrain on the last hex only. Ice: a walking monster slides on in the same direction until a hex that is not icy (or something stops it) for one point.
- Focus by (traps, distance, proximity, initiative), ties returned. End hex per focus: reachable first, then no disadvantage against the focus, then the most targets, the shortest way; secondary targets ranked by proximity and initiative. Several targets (6 = all), area attacks (melee around the monster, ranged pinned on every character, 12 turns and mirrors), out of reach: the reachable hex closest to an attack hex.
- Not done: boss footprints, the Frosthaven and Jaws of the Lion rule sets (not wanted).

## Line of sight (`los.js`, rule `full`)

Any point of one hex to any point of the other; walls and closed doors block, obstacles and figures do not, the void blocks when the floor is known; a blocking hex counts as its three long diagonals, an edge wall as that edge; a line that only touches a wall does not pass. Method: the lines between the two diameters most across the way, mapped onto a unit square, exact (gloom's full hex method in a simpler form; it relies on walls lying on the hex grid). Neighbours see each other unless the shared edge and the corners next to it are walled. Rule `vertex` (corner to corner) is kept only for the regression test against gloom's Gloomhaven answers.

## Validation

- Gloom's own scenarios (182, rule set Gloomhaven, corner line of sight): all pass, which checks the rest of the solver. With the any point rule: the 154 scenarios on which gloom's Gloomhaven and Frosthaven answers agree all match; of the 28 that differ it matches the Frosthaven answer in 4, the Gloomhaven answer in 23, and #131 picks one of the 15 tied groups of the Frosthaven answer by the Gloomhaven ranking.
- Line of sight against a brute force over points of both hexes on 676 random layouts: no disagreement; it sees everything the corner rule sees and 59 pairs more.
- Hit points of 36 monsters (576 values) agree between `gh.js` and the Secretariat; all 35 area patterns of the decks convert to connected shapes.
- Speed: 7 to 22 ms per solve on a 53 hex tile with 4 characters.

## Data corrections found by the comparison (owner confirmed the Secretariat)

- Standee counts in `gh.js`: lurker soldier 6, night demon 6, vermling scout 10.
- `gh_decks.js`: living corpse card 3 initiative 68 to 66; lurker soldier cards 6 and 7 had their initiatives swapped (now 23 with shuffle and 28; the images agree). The source `gh2_monster_abilities.xlsx` is not in the repo and still has the old values. The check compares sets of initiative and shuffle marks per deck: a swap inside a deck is invisible to it; only the lurker soldier was checked against its card images.

## Limits and open items

- The map's card numbers (image suffixes) are not the Secretariat card ids: 33 of 248 cards share an initiative with a different card (a select asks). Matching by id would need the card images read.
- The 5 hex line of Deep Terror's Beam of Annihilation does not fit the 7 by 7 editor (the solver uses the card's cells).
- Frosthaven floor masks: 46 of 76 Frosthaven tiles have no alpha channel; options: Worldhaven `map-tiles`, line detection, hand masks. Until then Frosthaven maps get no tile borders and `floorKnown` is false.
- Not done: the attack roll and damage, marking monsters as done for the round, allies and summons as actors.
- Reference: https://github.com/AluminumAngel/gloom (MIT, Copyright 2022 Daniel Nelson), `server/solver.py`, `calculate_monster_move`. The solver here is a port of the ideas, checked against its scenarios, not a copy of its code.
