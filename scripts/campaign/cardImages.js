// Image URLs of the ability card scans. They live in the group's asset repository (Sadgit-HL/Wordhaven_Assets) and are
// loaded from there, not copied into this repo (about 160 MB). The path rule reproduces every URL in the workbook's
// Card DB except 8 rows the extractor corrects (CARD_FIX in tools/extract-campaign-tables.py: the DB lists those level 9
// cards under the wrong class, so its own URLs give 404); every resulting file exists in the asset repository:
//   GH2 cards:  wh_character_ability_cards/gh2/<CLASS CODE>/<slug>.jpeg          e.g. gh2/TI2/net-shooter.jpeg
//   Mercenary Pack: wh_character_ability_cards/mp/<class code>/mp-<slug>.png     e.g. mp/an/mp-black-claws.png
import { CLASSES } from '../games/gh2_classes.js';

export const CARD_IMAGE_BASE = 'https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/wh_character_ability_cards/';

const classByIndex = new Map(CLASSES.map(c => [c.i, c]));

// URL of a card record from scripts/games/gh2_cards.js ({ cls, slug }), or null when the class is unknown.
export function cardImageUrl(card) {
  const cls = card && classByIndex.get(card.cls);
  if (!cls) return null;
  const slug = encodeURIComponent(card.slug.replace(/[‐-―]/g, '-'));   // some slugs hold a typographic hyphen, the files do not
  return cls.src === 'mp'
    ? `${CARD_IMAGE_BASE}mp/${cls.code.toLowerCase()}/mp-${slug}.png`
    : `${CARD_IMAGE_BASE}gh2/${cls.code.toUpperCase()}/${slug}.jpeg`;
}

// Item card fronts: wh_items/gh2/<id>.png, the id zero-padded to three digits (001.png) and the quartermaster
// items as QM1.png. The back is <id>b.png (not used). Checked against all 179 URLs in the workbook's Card DB.
export const ITEM_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_items/gh2/');
export function itemImageUrl(item) {
  if (!item) return null;
  const id = typeof item.id === 'number' ? String(item.id).padStart(3, '0') : encodeURIComponent(String(item.id));
  return `${ITEM_IMAGE_BASE}${id}.png`;
}

// Event card fronts: wh_events/gh2_events/<ce|re>/<C|R>-<number, 3 digits>.png (C-001.png). The outcome faces are C-001a.png,
// C-001b.png ... (not used here: they show the outcome). Checked: every one of the 177 cards has a front.
export const EVENT_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_events/gh2_events/');
export function eventImageUrl(kind, id) {
  if (kind !== 'city' && kind !== 'road') return null;
  const code = kind === 'city' ? 'C' : 'R';
  return `${EVENT_IMAGE_BASE}${kind === 'city' ? 'ce' : 're'}/${code}-${String(id).padStart(3, '0')}.png`;
}

// Character mats: wh_character_mats/<front|back>/<class>.png, the class name lower case with hyphens (silent-knife.png); the
// one exception is Plague Herald (plagueherald.png). Checked: both sides exist for all 22 classes of the campaign.
export const MAT_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_character_mats/');
const MAT_SLUG = { 'plague herald': 'plagueherald' };
export function matImageUrl(className, side = 'front') {
  const n = String(className || '').toLowerCase();
  if (!n || (side !== 'front' && side !== 'back')) return null;
  return `${MAT_IMAGE_BASE}${side}/${MAT_SLUG[n] || n.replace(/\s+/g, '-')}.png`;
}

// Personal quest cards: wh_pq/gh2/PQ01.png ... PQ22.png (440x600). Checked: all 22 of gh2_quests.js exist.
export const PQ_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_pq/gh2/');
export const pqImageUrl = quest => (quest?.slug ? `${PQ_IMAGE_BASE}${encodeURIComponent(quest.slug)}.png` : null);
