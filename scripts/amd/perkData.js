// The perk lists the app uses: scripts/games/perks.js (FrosthavenAssistant data), with the classes of
// scripts/games/perks_xover.js (Cephalofair's updated crossover sheets, since 2026-11-18: the Jaws of the Lion classes)
// replacing theirs. Both files are generated; this module only merges them.
import { PERKS as BASE } from '../games/perks.js';
import { PERKS_XOVER } from '../games/perks_xover.js';

export const PERKS = Object.fromEntries(Object.entries(BASE).map(([ed, classes]) => [ed, { ...classes, ...(PERKS_XOVER[ed] || {}) }]));
