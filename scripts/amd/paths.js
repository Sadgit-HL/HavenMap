// Where the attack-modifier card art lives, resolved relative to this module so any page of any
// app (perks viewer, HavenMap, campaign) can import the card code without caring about its own URL.
export const ASSET_BASE = new URL('../../images/common/attack_mods', import.meta.url).href;
export const PERK_ICON_BASE = new URL('../../images/common/perk-icons', import.meta.url).href;
