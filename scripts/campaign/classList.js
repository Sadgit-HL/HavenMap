// Every playable class across GH2E (plus its Mercenary Pack), Frosthaven and Jaws of the Lion, as { name, edition }.
// Every class is playable and comes from gh2_classes.js (GH2E and Mercenary Pack from the Card DB, Jaws of the Lion and Frosthaven from
// the worldhaven data); the perks data only fills in a class the table would lack.
import { CLASSES } from '../games/gh2_classes.js';
import { PERKS } from '../amd/perkData.js';

const EDITION = { gh2: 'GH2E', mp: 'Mercenary Pack', jotl: 'JotL', fh: 'FH' };
export const EDITIONS = ['GH2E', 'Mercenary Pack', 'FH', 'JotL'];   // display order
export const ALL_CLASSES = [
  ...CLASSES.map(c => ({ name: c.name, edition: EDITION[c.src] || c.src })),
  ...Object.keys(PERKS.FH).filter(name => !CLASSES.some(c => c.name === name)).map(name => ({ name, edition: 'FH' })),
  ...Object.keys(PERKS.JotL).filter(name => !CLASSES.some(c => c.name === name)).map(name => ({ name, edition: 'JotL' })),
].sort((a, b) => EDITIONS.indexOf(a.edition) - EDITIONS.indexOf(b.edition) || a.name.localeCompare(b.name));
export const classKnown = name => ALL_CLASSES.some(c => c.name.toLowerCase() === String(name ?? '').toLowerCase());
