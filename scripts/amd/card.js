// Composites one attack-modifier card from the layered assets in images/common/attack_mods/.
//
// Plain (base) cards are built from our own frame+number layers. Decorated (shared) cards are
// composed by compose.js; unique cards use their baked image, class badge included.

import { composedShared, badges, PLAIN_FRAME, PLAIN_NUMBER } from './compose.js?v=3';
import { ASSET_BASE as BASE } from './paths.js?v=2';
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
  root.appendChild(lazyImg(`${BASE}/frames/${FRAME_BY_VALUE[card.value] || 'p0'}.webp`, 'pc-frame'));
  // Removed base cards come from the standard deck (no class icon); base cards a perk adds are class cards.
  // Same class badge (circle + sized icon) as the composed shared cards.
  if (isAdded && className) root.appendChild(badges(null, className));
  if (card.value !== 'null') root.appendChild(lazyImg(`${BASE}/numbers/c-${NUMBER_FILE[card.value]}.webp`, 'pc-full'));
  // x2 and null cards reshuffle the deck: shuffle mark in the bottom-right corner.
  if (card.value === 'x2' || card.value === 'null') root.appendChild(lazyImg(`${BASE}/spheres/shuffle.webp`, 'pc-full'));
  return root;
}

function buildUnique(card) {
  // Already a full baked card image, class badge included.
  const root = layer('pc');
  root.appendChild(lazyImg(`${BASE}/unique/${card.code}.webp`, 'pc-unique'));
  return root;
}

export function buildCard(card, className, isAdded = false) {
  if (card.kind === 'base') return buildBase(card, className, isAdded);
  if (card.kind === 'unique') return buildUnique(card);
  return buildShared(card, className);
}
