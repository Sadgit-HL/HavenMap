// Random picks of the Scenarios and Items tabs: which scenarios or items a draw can take, and the pick. Pure functions, no record changes
// (drawSideScenario and drawItemDesign in edit.js unlock what was drawn). The same lists feed the GeekRoller code buttons, so the code and the app's own draw
// always cover the same candidates.
import { SCENARIOS } from '../games/gh2_scenarios.js';
import { ITEMS } from './itemList.js';
import { SCN_STATE } from './record.js';
import { cryptoRandom } from './events.js';

// The 16 GH2E items flagged "random" in the Gloomhaven Secretariat data (never sold in the shop, only gained from a "random item
// design" reward): ids 81 to 96. "Gain a random item design" draws one of these that is not unlocked yet; it is not a draw from the
// full item catalog.
export const RANDOM_ITEM_IDS = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96];

// Scenario numbers a random side scenario can take (owner, 2026-11-21): the random scenarios 67 to 74 that are still locked. A roll unlocks
// the scenario. (Scenario 83, Lost Island, is in the Random storyline too but follows 70: it is not rolled.)
export const RANDOM_SCENARIO_NUMBERS = [67, 68, 69, 70, 71, 72, 73, 74];
export const scenarioPool = r => SCENARIOS
  .filter(s => RANDOM_SCENARIO_NUMBERS.includes(s.n) && (r.scn?.[String(s.n)]?.s ?? 0) === SCN_STATE.LOCKED)
  .map(s => s.n);

// Item ids a random item design can take: the random items that are not unlocked yet.
export const itemDesignPool = r => ITEMS.filter(i => RANDOM_ITEM_IDS.includes(i.id) && !(r.items?.unl || []).includes(i.id)).map(i => i.id);

// One entry of a list at random (`rand` is a number in [0, 1), the browser's crypto source by default), null for an empty list.
export const pickOne = (list, rand = cryptoRandom) => (list.length ? list[Math.floor(rand() * list.length)] : null);
