# GPT Working Guide for HavenMap

This file is the handoff context for future GPT/Codex sessions in this workspace.

## Workspace

- Session root: `C:\Users\hansen\Claude\HavenMap_CGPT`
- Actual app folder: `HavenMap\`
- Launch script: `start.bat` at the session root
- There is no Git repository metadata in this workspace as currently checked. Treat it as a plain working tree unless `.git` is added later.
- GitHub repository working copy for publishing: `D:\github\HavenMap`
- GitHub Pages site: `https://sadgit-hl.github.io/HavenMap/`

## What This App Is

HavenMap is a browser-based SVG map editor/scenario helper for Frosthaven, Gloomhaven, Gloomhaven 2nd Edition data, Jaws of the Lion, Forgotten Circles, Crimson Scales, and shared mercenary/summon assets.

The app uses vanilla HTML/CSS/JavaScript ES modules. There is no package manager, build step, bundler, or framework. Runtime data is stored in the URL hash as Base64-encoded JSON.

## How To Run

From `C:\Users\hansen\Claude\HavenMap_CGPT`:

```bat
start.bat
```

That serves the workspace and opens:

```text
http://localhost:8080/HavenMap/
```

If Python is not available, `start.bat` falls back to a built-in PowerShell `HttpListener` server on the same port. If that is unavailable too, it tries `npx serve .` and opens:

```text
http://localhost:3000/HavenMap/
```

Chrome and Edge need a local server because ES modules are blocked from `file://`. Firefox can open `HavenMap\index.html` directly.

## Quick Verification

There is no formal test suite. For JS syntax checks, run from `HavenMap\`:

```powershell
Get-ChildItem scripts -Recurse -Filter *.js | ForEach-Object { node -c $_.FullName }
```

Manual smoke test after behavior changes:

- Load `http://localhost:8080/HavenMap/`.
- Select a hex, add a tile, overlay, monster, mercenary, and summon.
- Drag an object; Alt-drag to copy.
- Select an unlocked object, hover the main board, and press `r`; it should rotate clockwise by 60 degrees.
- Hover the main board, hold `Space`, and drag; the board should pan without browser scrollbars.
- Use the mouse wheel over the board; it should zoom without requiring `Ctrl`.
- Select stacked objects and cycle/reorder from the sidebar.
- Change scenario level from Settings -> Difficulty; monster max HP and stat cards should update.
- Toggle monster normal/elite and door open/closed.
- Add/remove conditions.
- Switch games from settings only after confirming map clearing.
- Use Share; localhost URLs fall back to copying the full URL in BGG BBCode.
- Confirm sidebar add-panel search typing appends normally. A previous bug made typed characters appear reversed when the input was re-rendered without restoring the caret.

Hard refresh after JS edits in Chrome/Edge because ES modules can be cached aggressively.

## File Map

- `HavenMap\index.html`: page shell; SVG board, sidebar, bottom element/share bar, ES module entry.
- `HavenMap\styles\main.css`: all styling.
- `HavenMap\scripts\main.js`: entry point; initializes render, controls, drag, sidebar, elements, level, share; subscribes to state updates.
- `HavenMap\scripts\state.js`: global serialized app state, URL hash load/save, migrations from older map formats, `patch()` and `subscribe()`.
- `HavenMap\scripts\uiState.js`: transient selection/add-panel/condition-picker state. Not serialized.
- `HavenMap\scripts\data.js`: selects game config by `?game=`, resolves expansions over base games, builds indices, asset path helpers, monster/mercenary stat lookups, standee numbering.
- `HavenMap\scripts\render.js`: SVG renderer; draws grid, tiles, overlays, monsters, mercenaries, summons, rings, labels, stat badges, conditions, stacked overlay masks.
- `HavenMap\scripts\drag.js`: click selection, multi-object stack detection, drag movement, Alt-drag copy.
- `HavenMap\scripts\sidebar.js`: context-sensitive inspect/add panel, settings panel, object editing, stat controls, condition picker, stack reorder.
- `HavenMap\scripts\controls.js`: board transform, scale, zoom, optional 60-degree rotation hooks.
- `HavenMap\scripts\elements.js`: bottom element bar, element cycling, end-of-round decay.
- `HavenMap\scripts\level.js`: scenario level display/control in Settings -> Difficulty and 0-7 clamp.
- `HavenMap\scripts\share.js`: shortens current URL with is.gd, copies BGG BBCode, falls back to full URL.
- `HavenMap\scripts\hex.js`: flat-top even-q hex math, coordinate labels, footprints, pixel-to-hex snapping.
- `HavenMap\scripts\games\*.js`: game-specific tile, overlay, monster, monster stat, and mercenary stat tables.
- `HavenMap\scripts\games\common.js`: shared mercenaries, summons, class overlays, conditions, elements.
- `HavenMap\images\`: local PNG assets by game/category.
- `HavenMap\CLAUDE.md`: previous project guide with recent bug-fix history.
- `progress.md`: broader progress overview and short-term goals.

## Data And State Shape

Default serialized state from `state.js`:

```js
{
  mapVersion: '4.0.0',
  mapGame: 'FrostHaven',
  CurrentLevel: 0,
  tiles: [],
  mercenaries: [],
  summons: [],
  monsters: [],
  overlays: [],
  questObjectives: {},
  elements: [0, 0, 0, 0, 0, 0],
  showGridLabels: false
}
```

Important details:

- State updates must go through `patch(partial)` from `state.js`.
- `patch()` mutates the exported `state`, saves to the URL hash, then notifies subscribers.
- Undo/redo uses URL-hash snapshots as the stored history format.
- Do not mutate `state` arrays in place. Create new arrays/objects and pass them to `patch()`.
- `uiState` is separate and ephemeral. Selection/add-panel state should not be added to the URL hash.
- URL hash migration supports older map formats up to current `mapVersion: '4.0.0'`.
- Game selection currently comes from `?game=` via `data.js`; default is `gh`.

Main object arrays:

- `tiles`: `{ id, x, y, angle, locked, side }`
- `overlays`: `{ id, x, y, angle, locked, role, opened?, hp?, maxhp? }`
- `monsters`: `{ id, x, y, angle, locked, role, standeeNum?, hp?, maxhp?, conditions?, _maxhpLevel?, _maxhpRole? }`
- `mercenaries`: `{ id, x, y, angle, locked, level?, hp?, maxhp?, xp?, gold?, conditions?, _maxhpLevel? }`
- `summons`: `{ id, x, y, angle, locked, hp?, maxhp?, xp?, gold?, conditions? }`

## Coordinate System

Defined in `scripts\hex.js`:

- Flat-top even-q offset grid.
- Columns are 1-based and display as `A` through `AN`.
- Rows are 0-based.
- `COLS = 40`, `ROWS = 50`, rendering rows `0..50`.
- Even columns shift down by half a hex height.
- `hexCenter(col, row)` is the canonical anchor for object placement.
- `pixelToHex(px, py)` finds the nearest hex center for drag/drop.
- Multi-hex objects use `footprintHexes(col, row, hexes, angle)` with direction tokens `N`, `NE`, `SE`, `S`, `SW`, `NW`.
- The visible grid has a faint extended background beyond valid coordinates (`-4..COLS+6`, `-4..ROWS+6`), but valid selection/placement still clamps to `COLS`/`ROWS`.

## Rendering Model

`index.html` defines SVG layers inside `#board-group`:

```text
layer-grid -> layer-tiles -> layer-overlays -> layer-selection -> layer-figures -> layer-drag
```

`renderAll(state)` clears and redraws:

```text
tiles -> overlays -> monsters -> mercenaries -> summons
```

Important render behavior:

- Tiles render on `layer-tiles` with an anchor marker.
- `drawGrid()` renders a faint extended grid first, then the normal coordinate grid and labels on top.
- Floor-level overlay roles render on `layer-overlays`: `corridor`, `wall`, `ice`, `difficult`, `hazardous`, `door`.
- Other overlays render on `layer-figures`.
- Monsters, mercenaries, and summons render on `layer-figures`.
- Overlay stacks on the same hex are offset and masked so higher objects visibly sit above lower objects.
- `layer-selection` draws the subtle selected-hex/object glow under `layer-figures`, so labels and badges stay readable.
- Monster roles control ring color: normal white, elite yellow, boss black.
- Overlay roles control ring/icon treatment.
- Stat badges render next to figures/HP-trackable overlays.
- Condition icons render along the right side of monsters, mercenaries, and summons.

## Data Tables And Asset Paths

`data.js` selects the active game:

```js
const gameParam = new URLSearchParams(location.search).get('game') || 'gh';
```

Game ids:

- `gh`: Gloomhaven
- `fh`: Frosthaven
- `jotl`: Jaws of the Lion
- `fc`: Forgotten Circles, base `gh`
- `cs`: Crimson Scales, base `gh`

Expansion configs inherit their base game's `gridSize`, tiles, overlays, monsters, monster stats, and mercenary stats, then append/override.

Data indices:

- `TILES`
- `OVERLAY_OBJECTS`
- `MONSTERS`
- `MERCENARIES`
- `SUMMONS`

Each index has `byId` and `byTitle` maps.

Asset path rules:

- Tiles: `images/{game}/tiles/{tile_name}.png`. Most games use lowercase URLized names, but GH2/Gloomhaven tile files are case-sensitive on GitHub Pages and must preserve names like `01-A.png`.
- Overlays: `images/{game}/overlays/{img}.png`, with open/close handling for GH2 doors and common class overlays.
- Monster hex art: `images/{game}/monsters/hex/{title_with_underscores_lowercase}.png`
- Monster stat cards: `images/{game}/monsters/stats/{title_with_underscores_lowercase}_{level}.png`
- Mercenaries: `images/common/mercenaries/{title_with_underscores_lowercase}.png`
- Mercenary mats: `images/common/mercenary_mats/{title_with_underscores_lowercase}.png`
- Summons: `images/common/summons/{title_with_underscores_lowercase}.png`
- Conditions: `images/common/conditions/{condition_with_underscores_lowercase}.png`
- Elements: `images/common/elements/{key}.png`

## Key Interaction Flow

Selection:

- Click empty hex: `drag.js` calls `selectHex(col, row)`.
- Click one object: `selectObject(kind, idx, col, row)`.
- Click stacked objects: `showStackWithSelection(...)`; repeated clicks cycle by priority.
- Auto-selection priority is mercenary/monster, then overlay, then tile.

Adding objects:

- The add button is intentionally disabled until a hex/object/stack is selected. Do not reintroduce the "open add before selecting a hex" workflow without a fresh plan and browser test.
- Sidebar plus opens add panel.
- Add-panel search is simple substring matching. A previous search-first experiment added fuzzy search, recents, and no-hex add mode; it regressed selection/add behavior and was rolled back.
- `placeSomething(kind, id)` creates a base object at `uiState.selectedHex`.
- Monsters get `role: 'boss'` when data entry has `boss`, otherwise `normal`.
- Monsters get a generated unused standee number when count data exists.
- Doors get `{ opened: false }`.

Dragging:

- Drag threshold is 4 pixels.
- Locked objects cannot drag.
- Alt-drag copies the object instead of moving it.
- Alt-copying a monster regenerates its standee number.

Keyboard shortcuts:

- `Ctrl+Z`: undo.
- `Ctrl+Y` / `Ctrl+Shift+Z`: redo.
- `r`: rotate the currently selected unlocked object clockwise by 60 degrees, but only while the mouse is over the main SVG board and focus is not in a text field.
- `Space + left drag`: pan the board. Panning lives in `controls.js` as part of the `#board-group` SVG transform so click/drag coordinates still work through `getScreenCTM().inverse()`.
- Mouse wheel over the board: zoom in/out. `Ctrl` is no longer required.

Deleting:

- `Delete` or `Backspace` removes selected unlocked object unless focus is in an input/textarea.

## Level And Stats

Scenario level:

- Global `state.CurrentLevel`, range `0..7`.
- Changed from Settings -> Difficulty in `level.js`.
- Monster stat cards and monster max HP use the global scenario level.

Mercenary level:

- Stored per mercenary as `level`, wraps `1..9` in the sidebar.
- Mercenary max HP comes from `getMercenaryStats(id, level)`.

Manual max HP persistence:

- Mercenaries use `_maxhpLevel` to remember which level a manual `maxhp` belongs to.
- Monsters use `_maxhpLevel` and `_maxhpRole` to remember which scenario level and role a manual `maxhp` belongs to.
- If level/role changes, display resets to default stat table value.
- If level/role matches the stored manual context, display uses manual `maxhp`.

Monster data requirements:

- `monsterStats` keys must match `MONSTER_ROWS` titles exactly.
- `getMonsterStats()` looks up by `monster.title`.
- Titles are generally lowercase in data and title-cased only for display.

## Common Pitfalls

- Always import `state` anywhere `state.CurrentLevel` or other state fields are read.
- Always import stat helpers from `data.js` where rendering or sidebar logic needs them.
- Missing ES module imports cause browser `ReferenceError` and can break the whole app.
- Do not edit generated URL hash manually unless testing migration/load behavior.
- Do not introduce a bundler or dependency unless the user explicitly asks.
- Keep asset file names aligned with `assetPath` helpers.
- Chrome/Edge can keep stale module versions; hard refresh after JS changes.
- GitHub Pages is case-sensitive. If images work locally on Windows but not on Pages, check filename case first.
- After publishing to GitHub Pages, wait 1-3 minutes and hard refresh with `Ctrl+F5`.
- Share shortening uses network access; localhost falls back to full URL by design.
- `controls.js` has rotate-button hooks for `btn-rotate-cw` and `btn-rotate-ccw`, but current `index.html` does not define those buttons.
- Do not change `drag.js` selection mechanics casually. A pointer-event/document-level fallback experiment caused confusing selection/add-panel behavior and was rolled back.
- If the sidebar search input is re-rendered on `input`, preserve `selectionStart` and restore it with `setSelectionRange(...)`; otherwise typed letters can appear at the left of the word.
- Page scrollbars are hidden in CSS; board navigation is intended to happen through mouse-wheel zoom and `Space + drag` panning.

## Current Known Project Notes

Confirmed current behavior as of the latest session:

- Default game is now Gloomhaven (`gh`) when no `?game=` parameter is present.
- GitHub Pages publishing is active from `D:\github\HavenMap`, with root `index.html`.
- GH2/Gloomhaven map tile loading on GitHub Pages was fixed by preserving uppercase tile names in `assetPath.tile()`.
- Sidebar and bottom bar UI were modernized: compact brand header, settings rows, shortcut overlay, add-panel polish, selected-object Object controls, monster inspector, stat tiles, and larger element tray.
- Keyboard shortcut overlay exists. `A` toggles the add panel, `/` focuses add search, `Alt+drag` copies dragged objects, and `?` opens shortcuts.
- Add panel has reordered tabs, `Add to {coord}` title, section counts, conservative recent placements, and search focus only via `/`.
- Bottom bar groups undo/redo, zoom, elements/end-round, and BGG Code. `BGG Code` copies BGG BBCode for forum posting.
- Add/search rollback is complete. Hex selection, object placement, live rendering after add, and selection glow were confirmed working by the user.
- The add-panel search caret bug is fixed by restoring caret position after the sidebar re-renders.
- GH2 tile images `HavenMap\images\gh2\tiles\11-B.png` and `11-D.png` were overwritten with small affine-corrected versions. Metadata in `scripts\games\gh.js` remains at the original `left: 86, top: 45`.
- Temporary pre-correction copies of `11-B.png` and `11-D.png` were saved in `C:\tmp\havenmap_tile_correction_backups\`.
- Board-hover `r` rotation shortcut is implemented and confirmed working.
- Previous roadmap items for GH2 asset/data polish and two missing GH2 conditions are resolved.
- A separate HavenMap folder has correct lower-quality GH2 tile reference scans at `C:\Users\guido\ClaudeCode\HavenMap\HavenMap\images\gh2\tiles\correct`; the user later resolved the tile-letter mix-up.

Remaining known project notes from earlier planning:

- Mobile/responsive usability needs dedicated work in the same repo, not a separate app or repository. Prefer CSS-first adaptation with media queries, then add JS only for behavior changes that CSS cannot handle.
- Mobile layout direction: convert the right sidebar into a bottom sheet, keep the board full width, make the element bar compact, and ensure add/inspect/settings panels scroll correctly.
- Use CSS breakpoints such as `@media (max-width: 768px)`, plus touch capability queries like `@media (pointer: coarse)` and `@media (hover: none)` for larger touch targets and no-hover behavior.
- JS detection should be limited to interactions that require it, using `matchMedia('(pointer: coarse)').matches` or `matchMedia('(max-width: 768px)').matches`; likely candidates are pinch zoom, touch panning, tap-to-preview stat cards, and bottom-sheet expand/collapse state.
- Continue GUI roadmap later: autosave/dirty indicator, inline feedback, responsive/mobile behavior, inspector polish for other object types, and possible broader workflow shortcuts.

Future project: line-of-sight tracker.

- Rule target: a hex is in LOS from another hex if a line can be drawn from any part of the source hex to any part of the target hex without touching a wall line.
- Preferred implementation: add a pure geometry module, likely `scripts\los.js`, that uses existing hex math from `hex.js` and works independently of DOM rendering.
- Represent each hex as a polygon and each blocking edge as a line segment. Start blockers with overlay `role === 'wall'` and closed doors; leave obstacles, figures, traps, loot, difficult/hazardous terrain non-blocking unless later rules require a per-object override.
- For pragmatic robustness, test sampled inset points rather than only center-to-center or exact vertices. Suggested samples per hex: center, six near-vertices inset toward center, and six near edge-midpoints inset toward center. LOS exists if any source sample to target sample segment does not intersect or touch a blocking wall segment.
- Build blocker segments from wall/closed-door overlay footprints. For multi-hex blockers, remove shared internal edges and keep only exterior edges. Treat touching or collinear overlap with a wall segment as blocked, using a small epsilon for floating-point comparisons.
- UI direction: add a `layer-los` SVG layer for highlights, plus a sidebar or toolbar toggle such as `Show LOS`. Compute visible hexes from the selected hex/object on demand and cache blocker segments after state changes.

From `HavenMap\CLAUDE.md` recent history:

- Monster level-dependent HP integration was added.
- Level display/render subscription issues were fixed.
- Monster stat key casing mismatches were fixed.
- A previous render break from missing imports in `render.js` was fixed.

## Editing Guidance

- Prefer small, local changes that match existing vanilla JS patterns.
- Use `patch()` for state changes.
- Keep `state.js` serialization backward-compatible when changing state shape.
- Add migrations if persisted state shape changes.
- When adding new game data, update the appropriate `scripts\games\*.js` config and ensure asset paths exist.
- When adding conditions/elements/class overlays, update `scripts\games\common.js` and provide matching image assets.
- When changing UI, check `styles\main.css` because all visual layout lives there.
- Avoid unrelated refactors; this app has many data/assets and no automated regression suite.

## Fast Start For A New Session

1. Read this file.
2. Read `progress.md` and `HavenMap\CLAUDE.md` if the task touches known project history.
3. Work inside `HavenMap\` unless changing the launch script or root docs.
4. Inspect the relevant module before editing; most behavior is split cleanly by file.
5. Run the JS syntax check after JS edits.
6. For UI/runtime behavior, serve with `start.bat` and smoke-test in the browser.
