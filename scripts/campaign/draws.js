// Random picks of the Scenarios and Items tabs: which cards or scenarios a draw can take, and the pick. Pure functions, no record changes
// (drawItemDesign in edit.js unlocks the item). The same lists feed the GeekRoller code buttons, so the code and the app's own draw
// always cover the same candidates.
import { SCENARIOS } from '../games/gh2_scenarios.js';
import { ITEMS } from './itemList.js';
import { SCN_STATE } from './record.js';
import { cryptoRandom } from './events.js';

// The 16 GH2E items flagged "random" in the Gloomhaven Secretariat data (never sold in the shop, only gained from a "random item
// design" reward): ids 81 to 96. "Gain a random item design" draws one of these that is not unlocked yet; it is not a draw from the
// full item catalog.
export const RANDOM_ITEM_IDS = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96];

// Scenario numbers a random side scenario can take: the scenarios in the Unlocked state (not completed, not locked out).
export const scenarioPool = r => SCENARIOS.filter(s => (r.scn?.[String(s.n)]?.s ?? 0) === SCN_STATE.UNLOCKED).map(s => s.n);

// Item ids a random item design can take: the random items that are not unlocked yet.
export const itemDesignPool = r => ITEMS.filter(i => RANDOM_ITEM_IDS.includes(i.id) && !(r.items?.unl || []).includes(i.id)).map(i => i.id);

// One entry of a list at random (`rand` is a number in [0, 1), the browser's crypto source by default), null for an empty list.
export const pickOne = (list, rand = cryptoRandom) => (list.length ? list[Math.floor(rand() * list.length)] : null);
