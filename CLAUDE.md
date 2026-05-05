# HavenMap Project Guide

## Project Overview
HavenMap is a web-based map builder and scenario tool for Gloomhaven 2nd Edition and other games. It provides an interactive SVG canvas for placing tiles, overlays, monsters, mercenaries, and summons, with a sidebar for inspection and editing.

## Key Files & Architecture

### Core Modules
- **main.js** - Entry point; initializes all subsystems
- **state.js** - Global app state with subscription system
- **uiState.js** - UI selection and panel state
- **render.js** - SVG rendering engine; uses state to draw all layers
- **data.js** - Game data aggregator; loads and indexes game configs; level-dependent stat lookups
- **sidebar.js** - Sidebar UI and object inspection panel; handles placement and stat editing
- **drag.js** - Canvas drag/drop and copy logic (alt-drag for copy)
- **controls.js** - View zoom and rotation controls
- **level.js** - Bottom bar level display and +/- buttons

### Game Data
- **games/gh.js** - Gloomhaven config with MONSTER_ROWS, TILE_ROWS, OVERLAY_ROWS, MONSTER_STATS, MERCENARY_STATS
- **games/fh.js, jotl.js, cs.js, fc.js** - Other game configs
- **games/common.js** - Shared MERCENARY_ROWS, SUMMON_ROWS, CONDITIONS, ELEMENTS

## Recent Work (Session 1)

### Added Monster Level-Dependent Stats
- Integrated MaxHP values per level (0-7) from Gloomhaven 2nd Edition
- Each monster has normal and elite variants with different health
- Stats keyed by lowercase monster title (e.g., 'ancient artillery')
- Level set globally via state.CurrentLevel (bottom bar controls 0-7 range)

### Fixed Issues
1. **Monster maxHP not updating with level changes**
   - Root cause: Missing subscription in level.js
   - Fixed: Added `subscribe(renderLevel)` to re-render on state changes
2. **Level display not updating with +/- buttons**
   - Root cause: Level buttons called patch but no re-render
   - Fixed: Added subscription system to level.js
3. **Monster stat lookup title case mismatch**
   - Root cause: getMonsterStats converted titles but MONSTER_STATS was keyed differently
   - Fixed: Renamed MONSTER_STATS keys to lowercase to match MONSTER_ROWS
4. **Mercs and summons cannot be placed (CRITICAL BUG)**
   - Root cause: render.js was missing `import { state } from './state.js'` and `import { getMonsterStats } from './data.js'`
   - This caused ReferenceError when rendering, breaking the entire app
   - Fixed: Added missing imports to render.js

### Implementation Details

#### Monster Stats Architecture
```javascript
// In gh.js
const MONSTER_STATS = {
  'ancient artillery': {
    count: 6,  // number of this monster type available
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 6, elite: 9 },
      // ... up to 7
    }
  },
  // ... 36 non-boss monsters total
};

// In data.js
export function getMonsterStats(monsterId, level, elite = false) {
  const monster = MONSTERS.byId.get(Number(monsterId));
  if (!monster) return {};
  const levelStats = gameConfig.monsterStats?.[monster.title]?.levels?.[level];
  if (!levelStats) return {};
  return { maxHp: elite ? levelStats.elite : levelStats.normal };
}
```

#### Monster Role (Normal/Elite) Tracking
- Monsters have a `role` property: 'normal', 'elite', or 'boss'
- Displayed via hex border color: white (normal), yellow (elite), black (boss)
- Toggle via UI button in sidebar (normal ↔ elite)

#### Persistent Manual Stat Adjustments
- When user manually sets maxhp, store level/role it was set for
- `_maxhpLevel` and `_maxhpRole` track the context
- If level/role changes, reset to default; if unchanged, keep manual value
- Same pattern used for mercenaries (track level only) and monsters (track level + role)

## Data Flow

```
user clicks + button in sidebar
  ↓
placeSomething(kind, id) called
  ↓
patch({ [kind]s: [...state[kind]s, newObj] }) updates state
  ↓
state.notify() triggered
  ↓
All subscribers (sidebar.render, renderAll) called
  ↓
UI updates
```

## Important Patterns

### Imports
- Always import `state` in files that need to read `state.CurrentLevel` or other state properties
- Always import `getMonsterStats` and `getMercenaryStats` in files that render monsters/mercenaries
- Game data tables (MONSTERS, MERCENARIES, SUMMONS, TILES, OVERLAY_OBJECTS) are created once in data.js and exported

### Title Case Conversion
- MONSTER_STATS and MERCENARY_STATS keys must match MONSTER_ROWS titles exactly
- Use `titleCase(s)` function in sidebar.js: `s.replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1))`
- Monster titles are lowercase in JSON (e.g., 'ancient artillery'), displayed as title case in UI

### State Updates
- Use `patch({ key: value })` from state.js to update state
- Never mutate state directly
- All updates trigger notify() which calls all subscribers
- Sidebar and render functions are subscribers and re-render on state changes

### Rendering
- renderAll(state) is the top-level function; it clears layers and calls renderTiles, renderOverlays, renderMonsters, renderMercenaries, renderSummons
- Each render* function is responsible for one layer/object type
- render.js uses SVG with layers: grid, tiles, overlays, figures (monsters/mercs/summons)

## Common Issues & Solutions

### Missing Imports
- If code uses `state`, import it: `import { state } from './state.js'`
- If code uses `getMonsterStats`, import it: `import { getMonsterStats } from './data.js'`
- Forgetting imports causes ReferenceError that breaks the entire app

### Title Case Mismatches
- All stat lookups use `monster.title` which comes from MONSTER_ROWS
- MONSTER_STATS and MERCENARY_STATS must be keyed the same way
- If adding new stats, rename keys to match MONSTER_ROWS titles exactly

### Level-Based Stat Display
- Use `state.CurrentLevel` to get current global level (0-7)
- For monsters: check if role changed; if so, reset maxhp to level default
- For mercenaries: check if level changed; if so, reset maxhp to level default
- See `mercenaryStats()` in sidebar.js and `renderMonsters()` in render.js for examples

### Mercs/Summons Not Appearing
- Check render.js imports (needs `state` and `getMonsterStats`)
- Check if `getMercenaryStats` is used but not imported
- Check browser console for errors (ReferenceError, SyntaxError, etc.)

## Testing Checklist
When making changes:
- [ ] Syntax check: `node -c scripts/*.js`
- [ ] Test adding/removing each object type (tiles, monsters, mercs, summons, overlays)
- [ ] Test level up/down buttons with monsters selected
- [ ] Test alt-drag copy for all object types
- [ ] Test manual stat edits (hp, maxhp, level) and verify they persist
- [ ] Test switching between normal/elite for monsters
- [ ] Test switching games via settings panel

## Notes for Future Sessions
- The app is fully functional as of the last session
- Monster stats integration is complete with proper level-dependent HP
- All known bugs have been fixed
- Main areas for future work: performance optimization, additional game expansions, improved UI/UX
