import { imageFile } from '../images.js';
// Special tokens of the classes that have them (design: campaign/mockups/merc-6-playmat-v2.html, docs/class-tokens.md).
// Per class (key = class name in lower case without spaces): counted tokens ({ k, l, img, max?, step? }; max defaults to 99) or tokens with states ({ k, l, states, imgs }).
// A character keeps them in `tok` as { key: count } or { key: state index }. Images: images/common/mercenary_tokens/<img>
export const TOKEN_DEFS = {
  hail: [{ k: 'resolve', l: 'Resolve', img: 'hail_resolve', max: 5 }],
  quartermaster: [{ k: 'supply', l: 'Supply', img: 'quartermaster_supply', step: 10, max: 50 }],
  soothsinger: [{ k: 'high', l: 'High note', img: 'soothsinger_high_note', max: 2 }, { k: 'low', l: 'Low note', img: 'soothsinger_low_note', max: 2 }],
  geminate: [{ k: 'form', l: 'Form', states: ['Melee', 'Ranged'], imgs: ['images/common/conditions/geminate_melee', 'images/common/conditions/geminate_range'] }],   // the two condition pictures: no ranged token picture exists
  deepwraith: [{ k: 'trophy', l: 'Trophy', img: 'deepwraith_trophy', max: 5 }],
  shattersong: [{ k: 'resonance', l: 'Resonance', img: 'shattersong_resonance', max: 5 }],
  blinkblade: [{ k: 'time', l: 'Time', img: 'blinkblade_time', max: 5 },
    { k: 'speed', l: 'Speed', states: ['Fast', 'Slow'], imgs: ['blinkblade_speed_fast', 'blinkblade_speed_slow'] }],
  metalmosaic: [{ k: 'pressure', l: 'Pressure', states: ['Low', 'Regular', 'High', 'Over'],
    imgs: ['metal_mosaic_pressure_low', 'metal_mosaic_pressure_regular', 'metal_mosaic_pressure_high', 'metal_mosaic_pressure_over'] }],      // the pressure gauge (tools/make-metal-mosaic-pressure-tokens.py)
};
export const tokenDefs = cls => TOKEN_DEFS[String(cls || '').toLowerCase().replace(/ /g, '')] || [];
// The picture of a class token (a file under images/common/mercenary_tokens, flattened into the edition-free folder).
export const tokenImage = name => imageFile(name.includes('/') ? name : 'images/common/mercenary_tokens/' + name, '../');   // a name with a folder is a full image key

// Markers placed on ability cards and items (design: the marker editor of campaign/mockups/merc-6-playmat-v2.html).
// Tokens are class specific (images/common/mercenary_tokens/<name>), stickers are the enhancement stickers (images/common/enhancement_stickers/<name>).
export const MARKER_TOKENS = {
  tinkerer: ['tinkerer'], berserker: ['berserker'], bruiser: ['bruiser'], bladeswarm: ['bladeswarm'], wildfury: ['wildfury'], cragheart: ['cragheart'],
  demolitionist: ['demolitionist'], doomstalker: ['doomstalker'], elementalist: ['elementalist'], hatchet: ['hatchet'], mindthief: ['mindthief'],
  nightshroud: ['nightshroud'], plagueherald: ['plagueherald'], quartermaster: ['quartermaster'], redguard: ['red_guard'], sawbones: ['sawbones'],
  silentknife: ['silent_knife'], sunkeeper: ['sunkeeper'], soothsinger: ['soothsinger'], soultether: ['soultether'], spellweaver: ['spellweaver'],
  voidwarden: ['voidwarden'], anaphi: ['anaphi'],
  // Frosthaven: the character token (a stand-in drawn by tools/make-fh-character-tokens.py: no token art exists), plus the H.I.V.E. mode token,
  // the Geminate's two form tokens (real art) and the Boneshaper's numbered skeletons. Traps, shadows and other map tokens are not markers.
  bannerspear: ['banner_spear'], blinkblade: ['blinkblade'], boneshaper: ['boneshaper', ...[1, 2, 3, 4, 5, 6].map(n => `boneshaper_skeleton_${n}`)],
  crashingtide: ['crashing_tide'], deathwalker: ['deathwalker'], deepwraith: ['deepwraith'], drifter: ['drifter'], frozenfist: ['frozen_fist'],
  geminate: ['geminate_character', 'geminate_melee'], hive: ['hive', 'hive_mode'], infuser: ['infuser'], metalmosaic: ['metal_mosaic'],
  painconduit: ['pain_conduit'], pyroclast: ['pyroclast'], shattersong: ['shattersong'], snowdancer: ['snowdancer'], trapper: ['trapper'],
  cassandra: ['cassandra'], hail: ['hail'], satha: ['satha'],
};
export const markerTokens = cls => MARKER_TOKENS[String(cls || '').toLowerCase().replace(/[ _.]/g, '')] || [];   // H.I.V.E. -> hive
export const MARK_STICKERS = ['plus_one', 'hex_attack', 'air', 'earth', 'fire', 'ice', 'light', 'dark', 'wild', 'bless', 'curse', 'poison', 'wound', 'muddle',
  'immobilize', 'stun', 'disarm', 'safeguard', 'jump', 'strengthen', 'regenerate', 'ward'];
export const stickerImage = name => imageFile('images/common/enhancement_stickers/' + name, '../');
export const markLabel = k => (k === 'plus_one' ? '+1' : k === 'hex_attack' ? 'Hex attack' : k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()));
