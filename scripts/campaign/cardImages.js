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
