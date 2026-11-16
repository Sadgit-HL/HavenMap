// Where the attack-modifier and perk-icon images are, resolved from this module (scripts/amd/ is two folders below the root).
import { imageHref } from '../images.js';
const ROOT = new URL('../../', import.meta.url).href;
// One layer of an attack-modifier card, e.g. amImg('frames/p0') or amImg('icons/center/poison').
export const amImg = rel => imageHref('images/common/attack_mods/' + rel, ROOT);
// A perk icon, e.g. perkIcon('wound').
export const perkIcon = token => imageHref('images/common/perk-icons/' + token, ROOT);
