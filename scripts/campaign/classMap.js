// Mapping between the campaign's classes (scripts/games/gh2_classes.js) and the map app's mercenaries
// (scripts/games/common.js MERCENARY_ROWS), matched by normalised name. Needed so a campaign hero can be placed on
// the map (session start) and a map hero can be tied back to its campaign character (commit).
import { CLASSES } from '../games/gh2_classes.js';
import { MERCENARY_ROWS, MERCENARY_STATS } from '../games/common.js';
import { heroPerkClass } from '../amd/heroDeck.js';

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const rowByName = new Map(MERCENARY_ROWS.map(r => [norm(r.title), r]));
const rowById = new Map(MERCENARY_ROWS.map(r => [r.id, r]));

// Map mercenary row ({ id, title, source }) for a campaign class name or class record, or undefined.
export function mercenaryForClass(nameOrClass) {
  return rowByName.get(norm(typeof nameOrClass === 'string' ? nameOrClass : nameOrClass?.name));
}

// Campaign class record for a map mercenary id, or undefined.
export function classForMercenary(mercenaryId) {
  const row = rowById.get(Number(mercenaryId));
  return row ? CLASSES.find(c => norm(c.name) === norm(row.title)) : undefined;
}

// Max hit points of a campaign class at a level (1..9), from the map's stat table; undefined when unknown.
export function maxHpFor(nameOrClass, level) {
  const row = mercenaryForClass(nameOrClass);
  return row ? MERCENARY_STATS[row.id]?.[level]?.maxHp : undefined;
}

// Problems with the mapping: classes with no map entry, no hit points for some level, or no perk table (the personal
// modifier deck is built from it). Empty when every class can be put on the map.
export function checkClassMap() {
  const issues = [];
  for (const c of CLASSES) {
    const row = mercenaryForClass(c);
    if (!row) { issues.push(`${c.name}: no map mercenary`); continue; }
    const missingHp = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(l => maxHpFor(c, l) === undefined);
    if (missingHp.length) issues.push(`${c.name}: no max HP for level ${missingHp.join(', ')}`);
    if (!heroPerkClass(row.title)) issues.push(`${c.name}: no perk table for "${row.title}"`);
  }
  return issues;
}
