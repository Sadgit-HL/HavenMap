// The hex state of the map: what is on each hex, built from the placed objects (state.tiles, overlays, monsters, mercenaries, summons). Pure logic,
// no DOM. The data tables (scripts/data.js) only load in a browser, so the caller passes two lookups:
//   lookup.tileTitle(id)  title of a map tile ('01-A') or null
//   lookup.overlay(id)    { hexes, defaultRole } of an overlay object or null
//
// Result: { floor, floorKnown, cells, figures, tilesWithoutMask, ignored }
//   floor      Set of 'col,row': hexes of the tiles (scripts/games/gh2_tile_masks.js), of corridor overlays and of door hexes
//   floorKnown false when a placed tile has no mask (Frosthaven tiles): the floor is then incomplete and must not be used to rule a hex out
//   cells      Map 'col,row' -> { blocked, blocksLos, trap, hazardous, difficult, ice, door, loot, plate } (only the flags that are set)
//   figures    [{ kind, side, id, col, row, role }]; side is 'monsters' or 'characters' (mercenaries and their summons), one hex each
//   walls      Set of edge keys (scripts/hexGrid.js edgeKey) of the borders between tiles: two floor hexes of different tiles are not connected unless a
//              corridor or a door joins them (their hexes count as joining). The Frosthaven tiles have no mask and no walls.
//   tilesWithoutMask, ignored  the tiles without a mask, and the overlay roles that carry no terrain, with their count
//
// Terrain rules (by the role of the overlay object, `role` of the placed object first, then the default role of the object):
//   obstacle        blocks movement, not line of sight
//   wall            blocks movement and line of sight
//   door            closed: blocks movement and line of sight; open: plain floor
//   trap, hazardous, difficult, ice   their flag, nothing else
//   corridor        floor only
//   loot, pressure-plate   their flag only (nothing blocks)
// Other roles (scenario stickers, class overlays) are not terrain.
import { footprintHexes } from './hex.js';
import { neighbors, edgeKey } from './hexGrid.js';
import { placeMask } from './tileMask.js';
import { GH2_TILE_MASKS } from './games/gh2_tile_masks.js';

export const hexKey = (col, row) => `${col},${row}`;

const FLAGS = {
  obstacle: { blocked: true },
  wall: { blocked: true, blocksLos: true },
  trap: { trap: true },
  hazardous: { hazardous: true },
  difficult: { difficult: true },
  ice: { ice: true },
  loot: { loot: true },
  'pressure-plate': { plate: true },
};
const FLOOR_ONLY = new Set(['corridor']);

export function buildHexState(state, lookup) {
  const floor = new Set(), cells = new Map(), figures = [], tilesWithoutMask = [], ignored = {};
  const owners = new Map(), bridge = new Set();                             // hex -> tiles it belongs to; hexes of corridors and doors
  const cell = (col, row) => { const k = hexKey(col, row); if (!cells.has(k)) cells.set(k, {}); return cells.get(k); };

  for (const [ti, t] of (state?.tiles ?? []).entries()) {
    const title = lookup.tileTitle(Number(t.id)), mask = title ? GH2_TILE_MASKS[title] : null;
    if (!mask) { tilesWithoutMask.push({ id: Number(t.id), title: title ?? null }); continue; }
    for (const h of placeMask(mask, Number(t.x), Number(t.y), Number(t.angle) || 0)) {
      const k = hexKey(h.col, h.row);
      floor.add(k);
      if (!owners.has(k)) owners.set(k, new Set());
      owners.get(k).add(ti);
    }
  }

  for (const o of state?.overlays ?? []) {
    const data = lookup.overlay(Number(o.id));
    if (!data) continue;
    const role = o.role ?? data.defaultRole, hexes = footprintHexes(Number(o.x), Number(o.y), data.hexes, Number(o.angle) || 0);
    if (role === 'door') {
      for (const h of hexes) {
        floor.add(hexKey(h.col, h.row));
        bridge.add(hexKey(h.col, h.row));
        const c = cell(h.col, h.row);
        c.door = o.opened ? 'open' : 'closed';
        if (!o.opened) { c.blocked = true; c.blocksLos = true; }
      }
    } else if (FLOOR_ONLY.has(role)) {
      for (const h of hexes) { floor.add(hexKey(h.col, h.row)); bridge.add(hexKey(h.col, h.row)); }
    } else if (FLAGS[role]) {
      for (const h of hexes) Object.assign(cell(h.col, h.row), FLAGS[role]);
    } else {
      ignored[role ?? 'none'] = (ignored[role ?? 'none'] ?? 0) + 1;
    }
  }

  const figure = (kind, side, list) => { for (const f of list ?? []) figures.push({ kind, side, id: Number(f.id), col: Number(f.x), row: Number(f.y), role: f.role ?? null, name: f.name ? String(f.name) : null }); };
  figure('monster', 'monsters', state?.monsters);
  figure('mercenary', 'characters', state?.mercenaries);
  figure('summon', 'characters', state?.summons);

  // the borders of tiles: neighbouring floor hexes that belong to different tiles only (no shared tile) and are not joined by a corridor or a door
  const walls = new Set();
  for (const [k, ownA] of owners) {
    if (bridge.has(k)) continue;
    const [c, r] = k.split(',').map(Number);
    for (const n of neighbors(c, r)) {
      const nk = hexKey(n.col, n.row), ownB = owners.get(nk);
      if (!ownB || bridge.has(nk) || [...ownA].some(t => ownB.has(t))) continue;
      walls.add(edgeKey(k, nk));
    }
  }

  return { floor, floorKnown: tilesWithoutMask.length === 0, cells, figures, walls, tilesWithoutMask, ignored };
}

// The terrain flags of a hex ({} when nothing is on it).
export const cellAt = (hs, col, row) => hs.cells.get(hexKey(col, row)) ?? {};
