// Every item the campaign knows: the GH2E items (scripts/games/gh2_items.js, incl. the GH2E solo items 153 to 170) and the solo
// items of the Frosthaven and Mercenary Pack classes (scripts/games/solo_items.js, with ed and cls). Ids do not overlap: GH2E uses
// 1 to 170 and QM1 to QM9, Frosthaven 248 to 264, the Mercenary Pack AN, SA, CSA, CSB, HL.
import { ITEMS as GH2_ITEMS } from '../games/gh2_items.js';
import { SOLO_ITEMS } from '../games/solo_items.js';

export const ITEMS = [...GH2_ITEMS, ...SOLO_ITEMS];
