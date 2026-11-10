// Every playable class across GH2E (plus its Mercenary Pack), Frosthaven and Jaws of the Lion, as { name, edition }.
// GH2E and Mercenary Pack names come from the Card DB table (gh2_classes.js); FH and JotL from the perks data.
import { CLASSES } from '../games/gh2_classes.js';
import { PERKS } from '../games/perks.js';

const EDITION = { gh2: 'GH2E', mp: 'Mercenary Pack' };
export const EDITIONS = ['GH2E', 'Mercenary Pack', 'FH', 'JotL'];   // display order
export const ALL_CLASSES = [
  ...CLASSES.map(c => ({ name: c.name, edition: EDITION[c.src] || c.src })),
  ...Object.keys(PERKS.FH).map(name => ({ name, edition: 'FH' })),
  ...Object.keys(PERKS.JotL).map(name => ({ name, edition: 'JotL' })),
].sort((a, b) => EDITIONS.indexOf(a.edition) - EDITIONS.indexOf(b.edition) || a.name.localeCompare(b.name));
export const classKnown = name => ALL_CLASSES.some(c => c.name.toLowerCase() === String(name ?? '').toLowerCase());
