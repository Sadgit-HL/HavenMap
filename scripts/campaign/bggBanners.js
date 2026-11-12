// Class banners for the BGG codes modal: one wide banner image per class in the group's asset repository (wh_banners/<slug>.jpg),
// copied as an [inlineimg] code. The grid shows the square class icons from this repository.
export const BANNER_BASE = 'https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/wh_banners/';
export const bannerUrl = slug => `${BANNER_BASE}${slug}.jpg`;
export const bannerCode = slug => `[inlineimg]${bannerUrl(slug)}[/inlineimg]`;
export const BANNER_ICON_DIR = '../images/common/attack_mods/class_icons/';
// slug, display name (when it differs from the slug), icon file name (when it differs from the display name)
export const BANNERS = [
  ['anaphi'], ['banner-spear', 'Banner Spear'], ['berserker'], ['bladeswarm'], ['blinkblade'], ['boneshaper'], ['bruiser'], ['cassandra'], ['cragheart'],
  ['crashing-tide', 'Coral', 'Crashing Tide'], ['deathwalker'], ['deepwraith'], ['demolitionist'], ['doomstalker'], ['drifter'], ['elementalist'],
  ['frozen-fist', 'Frozen Fist'], ['geminate'], ['hail'], ['hatchet'], ['hive', 'H.I.V.E.'], ['infuser', 'Astral', 'Infuser'], ['metal-mosaic', 'Metal Mosaic'], ['mindthief'],
  ['nightshroud'], ['pain-conduit', 'Pain Conduit'], ['plagueherald'], ['pyroclast'], ['quartermaster'], ['red-guard', 'Red Guard'], ['satha'], ['sawbones'], ['shattersong'],
  ['silentknife', 'Silent Knife'], ['snowdancer'], ['soothsinger'], ['soultether'], ['spellweaver'], ['sunkeeper'], ['tinkerer'], ['trapper'], ['voidwarden'], ['wildfury']
].map(([slug, name, icon]) => { const n = name || slug.replace(/^./, c => c.toUpperCase()); return { slug, name: n, icon: icon === undefined ? n : icon }; });
