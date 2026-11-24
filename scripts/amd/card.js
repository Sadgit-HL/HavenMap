// Composites one attack-modifier card from the layered assets in images/common/attack_mods/.
//
// Plain (base) cards are built from our own frame+number layers. Decorated (shared) cards are
// composed by compose.js; unique cards use their baked image, class badge included.

import { composedShared, badges, PLAIN_FRAME, PLAIN_NUMBER } from './compose.js?v=5';
import { amImg } from './paths.js?v=3';
import { img, layer } from './dom.js';

// Value -> frame / number file: the plain values of compose.js plus the two shuffle cards.
const FRAME_BY_VALUE = { ...PLAIN_FRAME, 'null': 'null', 'x2': 'x2' };
const NUMBER_FILE = { ...PLAIN_NUMBER, 'x2': 'x2' };

// Card images are lazy-loaded: perk lists hold hundreds of cards.
const lazyImg = (src, cls) => img(src, cls, true);

function buildShared(card, className) {
  // Decorated cards are composed from the layered assets (frame + icons + overlays + corner
  // badges) by compose.js, the same code compose.html uses to compare against the scans.
  const root = layer('pc');
  root.appendChild(composedShared(card, className));
  return root;
}

function buildBase(card, className, isAdded) {
  const root = layer('pc');
  root.appendChild(lazyImg(`${amImg(`frames/${FRAME_BY_VALUE[card.value] || 'p0'}`)}`, 'pc-frame'));
  // Removed base cards come from the standard deck (no class icon); base cards a perk adds are class cards.
  // Same class badge (circle + sized icon) as the composed shared cards.
  if (card.badge) root.appendChild(badges(null, null, card.badge));   // monster and ally decks: a letter in the badge circle
  else if (isAdded && className) root.appendChild(badges(null, className));
  if (card.value !== 'null') root.appendChild(lazyImg(`${amImg(`numbers/c-${NUMBER_FILE[card.value]}`)}`, 'pc-full'));
  // x2 and null cards reshuffle the deck: shuffle mark in the bottom-right corner.
  if (card.value === 'x2' || card.value === 'null') root.appendChild(lazyImg(`${amImg(`spheres/shuffle`)}`, 'pc-full'));
  return root;
}

function buildUnique(card, className, isAdded) {
  // A baked card image. Its lower-left badge is not the class of the card (Mercenary Pack cards show a potion, Anaphi's
  // class icon is a ribbon), so the class badge is drawn over it, as on the other cards a perk adds.
  const root = layer('pc');
  root.appendChild(lazyImg(`${amImg(`unique/${card.code}`)}`, 'pc-unique'));
  if (isAdded && className) root.appendChild(badges(null, className));
  return root;
}

export function buildCard(card, className, isAdded = false) {
  if (card.kind === 'base') return buildBase(card, className, isAdded);
  if (card.kind === 'unique') return buildUnique(card, className, isAdded);
  return buildShared(card, className);
}
