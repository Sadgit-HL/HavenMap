# Monster automation (exploration)

Branch `explore/monster-automation`. Status 2026-11-21: notes only, no code. Goal: on the hex map page, indicate the monster focus and the hexes where a monster ends its turn, later maybe execute the turn.

## Reference: AluminumAngel/gloom

Repo https://github.com/AluminumAngel/gloom (MIT, Copyright 2022 Daniel Nelson). Python 2 server plus a React map editor. The logic is in `server/solver.py`, `Scenario.calculate_monster_move` (about lines 1205 to 1865). Read, not run.

Input (`unpack_scenario`): move, range, target count, flying or jumping, muddled, teleport, rule set (Frosthaven, Gloomhaven, JOTL), area pattern; map with walls, obstacles, traps, hazardous, difficult, icy, thin walls on hex edges; characters, monsters, initiatives; the active monster.

Output: the set of tied actions (end hex plus targets), destinations, focus map, sight lines. Ties are returned, not resolved; the players choose.

Steps:
1. Focus: for every character and every hex the monster can end on, with range and line of sight, minimize (traps on the path, path distance, proximity, initiative). JOTL ignores proximity.
2. Attack hex: among hexes that hit the focus, minimize (traps, can reach, most targets, fewest targets with disadvantage, path length, secondary target ranks). Gloomhaven and JOTL put focus disadvantage before target count.
3. Cannot reach the focus: move to the reachable hex that minimizes (traps, distance to the best attack hex, own travel distance).
4. Area attacks: melee tries 12 rotations, ranged tries every placement. Flying, jumping, teleport, icy and difficult terrain are handled.
5. Line of sight: occluder geometry (vertex based under Gloomhaven rules), about 500 lines.

Rule flags per rule set are in `set_rules_flags`. Check them against the rulebooks before use.

## HavenMap: what exists (verified by grep, 2026-11-21)

- Overlay objects carry `role` (`scripts/games/gh.js`, `fh.js`): obstacle, wall, trap, hazardous, difficult, ice, door, pressure-plate, corridor, loot. Maps almost one to one onto the solver terrain.
- Footprints: `footprintHexes` in `scripts/hex.js` (anchor, directions, rotation).
- Doors: `opened` flag per door overlay.
- Monsters and characters are placed objects (role normal, elite, boss). Initiative is in the campaign record play slots.
- Grid: 90 by 78 hexes, 40 columns, 50 rows (`scripts/hex.js`).

## Gaps

1. Floor: a map tile entry has only `id`, `title`, image offsets. No per-hex shape, so floor hexes are unknown. Needs a hex mask per tile (derive from the tile images, or from Worldhaven `map-tiles`; not checked).
2. Footprint check: 2-hex objects use `hexes: ['S']`; confirm each overlay covers the right hexes. Terrain is per object, not per hex.
3. Thin walls: not in the data. Probably not needed (walls are whole hex objects).
4. Monster actions: ability cards (`images/monster-abilities`) and stats (`images/monster-stats`) are images only. `scripts/campaign/monsters.js` tracks draw, discard and active cards only. Needs move, range, target, area pattern, flying, jump per card and per level. Candidate source: FrosthavenAssistant data (not opened). Fallback: manual input per turn.

## Plan (proposal)

1. Hex state builder: placed objects to a grid of floor, blocked, trap, hazardous, difficult, ice, plus a figure list.
2. Action data, or manual per-turn input.
3. Solver port in `scripts/` as pure logic with Node tests, in stages: focus only (breadth-first search with blockers and initiative), then attack hex with line of sight and the target and disadvantage tuple, then area attacks and exact Frosthaven line of sight.
4. UI on the hex page: highlight the focus and the candidate end hexes.

## Progress

- 2026-11-21: floor masks for the 56 Gloomhaven 2e tiles, derived from the tile alpha channel (`tools/make-tile-masks.py`, output `scripts/games/gh2_tile_masks.js`, tests in `tools/tests/tileMasks.test.mjs`). A hex is floor when at least 93% of its area is opaque; hexes cut by the image edge count as transparent. Checked by eye on 01-A, 07-A and 03-B; variants of one tile always give the same shape.
- The tile anchor in `gh.js` is not always a floor hex (03-B: it lies beside the tile). Do not assume it.
- 2026-11-21: `scripts/tileMask.js` (`placeMask`, `tileFloorHexes`) places a mask on the board with rotation; tested against `footprintHexes`.
- 2026-11-21: `scripts/hexState.js` (`buildHexState`, `cellAt`) builds the hex state from the placed objects: floor, per-hex terrain flags, figures by side. Data lookups are passed in (`data.js` only loads in a browser). Rules are in the file header: obstacle blocks movement, wall and closed door also block line of sight. Monsters, mercenaries and summons are one hex each (boss footprints not handled). Tests in `tools/tests/hexState.test.mjs`.
- 2026-11-21: `scripts/monsterMove.js` (`solveMove`), solver stage 1 with the Gloomhaven 2e rule set (decisions: Gloomhaven 2e first, initiatives typed on the map page): paths by (traps, distance), difficult terrain, flying, jumping, teleport, enemy figures block walking; focus by (traps, distance, proximity, initiative) with ties returned; end hexes for melee and ranged single target attacks (reachable first, avoid disadvantage, shortest way); when out of reach, the hexes closest to an attack hex. Input is plain parameters (move, range, flags, initiatives per figure hex). Tests in `tools/tests/monsterMove.test.mjs`. Written from reading gloom's solver, not compared against it run on the same maps.
- 2026-11-21: map page UI, `scripts/monsterTurn.js`: a Monster turn section in the inspect panel of a selected monster (move, range, Fly, Jump, Teleport, Muddled, No attack, one initiative field per character figure; Show and Clear). The result is worked out on every sidebar render and drawn in the new SVG layer `layer-solver` (gold ring: focus, green hex: attack from here, blue hex: moves there, dashed blue: the attack hex it moves towards), with a text summary under the buttons. Initiatives are typed per figure (kind and id, kept in `uiState.turn`, not saved with the map). Floor masks are used for Gloomhaven 2e tiles only (`game: 'gh2'`); on other maps the panel notes that the floor is unknown. Checked in headless Edge with one tile, one monster, one mercenary (melee and ranged results as expected); not tried on a phone layout, with doors, traps or stacked objects.
- 2026-11-21: line of sight, `scripts/los.js` (`makeSightLine`, `makeCanSee`), the Gloomhaven vertex rule: a hex pair sees each other when one of the 36 corner to corner lines touches no blocking hex (each blocking hex counts as its three long diagonals; touching blocks; adjacent hexes always see each other). Blocking: walls and closed doors (`blocksLos`), and the void when the floor is known; obstacles and figures do not block. Used by the solver through `canSee`; the map page draws the sight line from each attack hex to its focus. Tests in `tools/tests/los.test.mjs`. Checked in the browser with a wall object between a ranged monster and a character (it moves to the hex with sight).
- 2026-11-21: validation against gloom's own test scenarios. `tools/convert-gloom-scenarios.py <gloom/server/scenarios.py>` runs its `init_from_test_scenario` for all 182 scenarios and 3 rule sets and writes `tools/tests/fixtures/gloom-scenarios.json` (MIT notice inside). `tools/tests/gloomRunner.mjs` runs a scenario through `solveMove` and `makeSightLine`; `node tools/gloom-report.mjs [gloomhaven|frosthaven|jotl] [-v]` prints the mismatches. Result: all 83 supported Gloomhaven scenarios give gloom's answer (first run: 72, the rest was the runner missing line of sight). Not run yet: 99 scenarios with area attacks (26), several targets (35), thin walls (34) or icy hexes (19; some have more than one). Frosthaven rules: 78 of 83, Jaws of the Lion: 73 of 83, as the solver only follows the Gloomhaven rule set (focus and disadvantage differences).
- Not yet: several targets and area attacks, secondary targets, icy terrain, thin walls, boss footprints.
- Not done: Frosthaven tiles (46 of 76 have no alpha channel, and a "hex fits inside the image" rule only fits the rectangular ones; options: Worldhaven `map-tiles`, line detection, hand masks); monster action data; the solver.

## Open decisions

- Floor masks for Frosthaven: Worldhaven `map-tiles`, detect the printed hex lines, or paint by hand? (Gloomhaven 2e is done from the tile images.)
- Action data: import from FrosthavenAssistant, or manual input first?
