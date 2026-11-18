// Image URLs of the ability card scans. They live in the group's asset repository (Sadgit-HL/Wordhaven_Assets) and are
// loaded from there, not copied into this repo (about 160 MB). The path rule reproduces every URL in the workbook's
// Card DB except 8 rows the extractor corrects (CARD_FIX in tools/extract-campaign-tables.py: the DB lists those level 9
// cards under the wrong class, so its own URLs give 404); every resulting file exists in the asset repository:
//   GH2 cards:  wh_character_ability_cards/gh2/<CLASS CODE>/<slug>.jpeg          e.g. gh2/TI2/net-shooter.jpeg
//   Mercenary Pack: wh_character_ability_cards/mp/<class code>/mp-<slug>.png     e.g. mp/an/mp-black-claws.png
import { CLASSES } from '../games/gh2_classes.js';
import { imageFile } from '../images.js';

// The file under images/ that shows an address from the repositories above (the campaign page is one folder down).
const local = url => (url ? imageFile(url, '../') : null);

export const CARD_IMAGE_BASE = 'https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/wh_character_ability_cards/';

const classByIndex = new Map(CLASSES.map(c => [c.i, c]));

// URL of a card record from scripts/games/gh2_cards.js ({ cls, slug }), or null when the class is unknown.
export function cardImageUrl(card) {
  if (card?.img) return local(card.img);                                     // Frosthaven and Jaws cards carry their own picture address (img in scripts/games/gh2_cards.js)
  const cls = card && classByIndex.get(card.cls);
  if (!cls) return null;
  const slug = encodeURIComponent(card.slug.replace(/[‐-―]/g, '-'));   // some slugs hold a typographic hyphen, the files do not
  return local(cls.src === 'mp'
    ? `${CARD_IMAGE_BASE}mp/${cls.code.toLowerCase()}/mp-${slug}.png`
    : `${CARD_IMAGE_BASE}gh2/${cls.code.toUpperCase()}/${slug}.jpeg`);
}

// Item card fronts: wh_items/gh2/<id>.png, the id zero-padded to three digits (001.png) and the quartermaster
// items as QM1.png. Checked against all 179 URLs in the workbook's Card DB.
export const ITEM_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_items/gh2/');
const itemAddress = (item, side = '') => {
  if (item.ed) return `images/items/${item.ed}/${item.id}${side}`;         // Frosthaven and Mercenary Pack solo items (scripts/games/solo_items.js)
  const id = typeof item.id === 'number' ? String(item.id).padStart(3, '0') : encodeURIComponent(String(item.id));
  return `${ITEM_IMAGE_BASE}${id}${side}.png`;
};
// The back of a flip item (<id>b), or null: only flip items have a back picture under images/ (the eight GH2E ones from
// tools/convert-item-backs.py, the solo items from tools/extract-solo-items.py), so its presence is the flag.
export const itemBackUrl = item => (item ? local(itemAddress(item, 'b')) : null);
export function itemImageUrl(item) {
  if (!item) return null;
  return local(itemAddress(item));
}

// Event card fronts: wh_events/gh2_events/<ce|re>/<C|R>-<number, 3 digits>.png (C-001.png). The outcome faces are C-001a.png,
// C-001b.png ... (not used here: they show the outcome). Checked: every one of the 177 cards has a front.
export const EVENT_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_events/gh2_events/');
export function eventImageUrl(kind, id) {
  if (kind !== 'city' && kind !== 'road') return null;
  const code = kind === 'city' ? 'C' : 'R';
  return local(`${EVENT_IMAGE_BASE}${kind === 'city' ? 'ce' : 're'}/${code}-${String(id).padStart(3, '0')}.png`);
}

// Character mats: wh_character_mats/<front|back>/<class>.png, the class name lower case with hyphens (silent-knife.png); the
// exceptions: Plague Herald (plagueherald.png) and H.I.V.E. (hive.png). Checked: both sides exist for the 22 GH2 classes and the
// 21 Frosthaven and Jaws classes (the asset repository has the Frosthaven and Jaws mats too).
export const MAT_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_character_mats/');
const MAT_SLUG = { 'plague herald': 'plagueherald', 'h.i.v.e.': 'hive' };
// The slug of a class as the mat and banner files name it (plagueherald, h.i.v.e. -> hive, spaces -> hyphens).
export const matSlugOf = className => { const n = String(className || '').toLowerCase(); return MAT_SLUG[n] || n.replace(/\s+/g, '-'); };
// The address of a mat (the asset repository); matImageUrl gives the file under images/.
export function matAddress(className, side = 'front') {
  const n = String(className || '').toLowerCase();
  if (!n || (side !== 'front' && side !== 'back')) return null;
  return `${MAT_IMAGE_BASE}${side}/${matSlugOf(n)}.png`;
}
export const matImageUrl = (className, side = 'front') => local(matAddress(className, side));

// Personal quest cards: wh_pq/gh2/PQ01.png ... PQ22.png (440x600). Checked: all 22 of gh2_quests.js exist.
export const PQ_IMAGE_BASE = CARD_IMAGE_BASE.replace('wh_character_ability_cards/', 'wh_pq/gh2/');
export const pqImageUrl = quest => (quest?.slug ? local(`${PQ_IMAGE_BASE}${encodeURIComponent(quest.slug)}.png`) : null);

// Card back of a class: the real back where one exists in images/common/card_backs (this repository, path relative to the campaign
// page), else the generic back. Keys: the class name in lower case without spaces; GH1 backs stand in for classes without GH2e art.
// The Jaws of the Lion classes use the backs of their updated cards in the asset repository (a full address).
const BACK_DIR = 'images/common/card_backs/';
const JL_BACK = code => `${CARD_IMAGE_BASE}jotl/jl-${code}-${{ de: 'demolitionist', ha: 'hatchet', rg: 'Red-Guard', vw: 'voidwarden' }[code]}${code === 'rg' ? '-Card-Back' : '-card-back'}.png`;
const CARD_BACKS = {demolitionist:JL_BACK('de'),hatchet:JL_BACK('ha'),redguard:JL_BACK('rg'),voidwarden:JL_BACK('vw'),berserker:'gh2-berserker-back.jpeg',bladeswarm:'gh2-bladeswarm-back.jpeg',doomstalker:'gh2-doomstalker-back.jpeg',elementalist:'gh2-elementalist-back.jpeg',plagueherald:'gh2-plagueherald-back.jpeg',quartermaster:'gh2-quartermaster-back.jpeg',sawbones:'gh2-sawbones-back.jpeg',soothsinger:'gh2-soothsinger-back.jpeg',soultether:'gh2-soultether-back.jpeg',sunkeeper:'gh2-sunkeeper-back.jpeg',wildfury:'gh2-wildfury-back.jpeg',anaphi:'mp-anaphi-back.jpeg',cassandra:'mp-cassandra-back.jpeg',hail:'mp-hail-back.jpeg',satha:'mp-satha-back.jpeg',bruiser:'gh-bruiser-back.png',cragheart:'gh-cragheart-back.png',mindthief:'gh-mindthief-back.png',nightshroud:'gh-nightshroud-back.png',spellweaver:'gh-spellweaver-back.png',tinkerer:'gh-tinkerer-back.jpg',bannerspear:'fh-bn-back.png',blinkblade:'fh-bb-back.png',boneshaper:'fh-bo-back.png',coral:'fh-cr-back.png',deathwalker:'fh-dw-back.png',deepwraith:'fh-dt-back.png',drifter:'fh-df-back.png',frozenfist:'fh-ff-back.png',geminate:'fh-ge-back.png','h.i.v.e.':'fh-hv-back.png',astral:'fh-if-back.png',metalmosaic:'fh-me-back.png',painconduit:'fh-pc-back.png',pyroclast:'fh-py-back.png',shattersong:'fh-sh-back.png',snowdancer:'fh-sd-back.png',trapper:'fh-ta-back.png',silentknife:'gh-scoundrel-back.png',infuser:'fh-if-back.png',crashingtide:'fh-cr-back.png',hive:'fh-hv-back.png'};
export const cardBackUrl = cls => { const f = CARD_BACKS[String(cls || '').toLowerCase().replace(/ /g, '')] || 'ability-back-placeholder.png'; return imageFile(f.startsWith('https:') ? f : BACK_DIR + f, '../'); };

// Battle goal pictures: the Frosthaven set in worldhaven's repository (any2cards/worldhaven, images/battle-goals/frosthaven/fh-<slug>.png).
// The file for "pincushion" is spelled "pincusion".
export const BG_IMAGE_BASE = 'https://raw.githubusercontent.com/any2cards/worldhaven/master/images/battle-goals/frosthaven/';
const BG_FILE = { pincushion: 'pincusion' };
export function battleGoalImageUrl(slug) {
  return slug ? local(`${BG_IMAGE_BASE}fh-${BG_FILE[slug] || slug}.png`) : null;
}
