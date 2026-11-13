// Special tokens of the classes that have them (design: campaign/mockups/merc-6-playmat-v2.html, docs/class-tokens.md).
// Per class (key = class name in lower case without spaces): counted tokens ({ k, l, img }) or tokens with states ({ k, l, states, imgs }).
// A character keeps them in `tok` as { key: count } or { key: state index }. Images: images/common/mercenary_tokens/<img>.png
export const TOKEN_DEFS = {
  hail: [{ k: 'resolve', l: 'Resolve', img: 'hail_resolve' }],
  quartermaster: [{ k: 'supply', l: 'Supply', img: 'quartermaster_supply' }],
  soothsinger: [{ k: 'high', l: 'High note', img: 'soothsinger_high_note' }, { k: 'low', l: 'Low note', img: 'soothsinger_low_note' }],
  deepwraith: [{ k: 'trophy', l: 'Trophy', img: 'deepwraith_trophy' }],
  shattersong: [{ k: 'resonance', l: 'Resonance', img: 'shattersong_resonance' }],
  blinkblade: [{ k: 'time', l: 'Time', img: 'blinkblade_time' },
    { k: 'speed', l: 'Speed', states: ['Fast', 'Slow'], imgs: ['blinkblade_speed_fast', 'blinkblade_speed_slow'] }],
  metalmosaic: [{ k: 'pressure', l: 'Pressure', states: ['0', '1', '2', '3'],
    imgs: ['metal_mosaic_pressure_0', 'metal_mosaic_pressure_1', 'metal_mosaic_pressure_2', 'metal_mosaic_pressure_3'] }],
};
export const tokenDefs = cls => TOKEN_DEFS[String(cls || '').toLowerCase().replace(/ /g, '')] || [];
export const TOKEN_IMAGE_DIR = '../images/common/mercenary_tokens/';

// Markers placed on ability cards and items (design: the marker editor of campaign/mockups/merc-6-playmat-v2.html).
// Tokens are class specific (images/common/mercenary_tokens/<name>.png), stickers are the enhancement stickers (images/common/enhancement_stickers/<name>.png).
export const MARKER_TOKENS = {
  tinkerer: ['tinkerer'], berserker: ['berserker'], bruiser: ['bruiser'], bladeswarm: ['bladeswarm'], wildfury: ['wildfury'], cragheart: ['cragheart'],
  demolitionist: ['demolitionist'], doomstalker: ['doomstalker'], elementalist: ['elementalist'], hatchet: ['hatchet'], mindthief: ['mindthief'],
  nightshroud: ['nightshroud'], plagueherald: ['plagueherald'], quartermaster: ['quartermaster'], redguard: ['red_guard'], sawbones: ['sawbones'],
  silentknife: ['silent_knife'], sunkeeper: ['sunkeeper'], soothsinger: ['soothsinger'], soultether: ['soultether'], spellweaver: ['spellweaver'],
  voidwarden: ['voidwarden'], boneshaper: [1, 2, 3, 4, 5, 6].map(n => `boneshaper_skeleton_${n}`), deepwraith: ['deepwraith_trophy'],
  geminate: ['geminate_character', 'geminate_melee'], hive: ['hive_mode'], shattersong: ['shattersong_resonance'], anaphi: ['anaphi'],
  cassandra: ['cassandra'], hail: ['hail', 'hail_resolve'], satha: ['satha'],
};
export const markerTokens = cls => MARKER_TOKENS[String(cls || '').toLowerCase().replace(/[ _]/g, '')] || [];
export const MARK_STICKERS = ['plus_one', 'hex_attack', 'air', 'earth', 'fire', 'ice', 'light', 'dark', 'wild', 'bless', 'curse', 'poison', 'wound', 'muddle',
  'immobilize', 'stun', 'disarm', 'safeguard', 'jump', 'strengthen', 'regenerate', 'ward'];
export const MARK_STICKER_DIR = '../images/common/enhancement_stickers/';
export const markLabel = k => (k === 'plus_one' ? '+1' : k === 'hex_attack' ? 'Hex attack' : k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()));
