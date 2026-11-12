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
