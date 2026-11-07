// Composites one attack-modifier card from the layered assets in images/common/attack_mods/.
//
// Plain (base) cards are built from our own frame+number layers. Decorated (shared) cards are
// composed by compose.js; unique cards use their baked image, class badge included.

import { composedShared, badges } from './compose.js?v=1';
import { ASSET_BASE as BASE } from './paths.js?v=1';

const FRAME_BY_VALUE = {
  '+0': 'p0', '+1': 'positive', '+2': 'positive', '+3': 'positive', '+4': 'positive',
  '-1': 'negative', '-2': 'negative', 'null': 'null',
};

const NUMBER_FILE = {
  '+0': 'p0', '+1': 'p1', '+2': 'p2', '+3': 'p3', '+4': 'p4', '-1': 'm1', '-2': 'm2',
};

function img(src, cls) {
  const el = document.createElement('img');
  el.src = src;
  el.loading = 'lazy';
  el.alt = '';
  if (cls) el.className = cls;
  return el;
}

function layer(cls) {
  const el = document.createElement('div');
  el.className = cls;
  return el;
}

function buildShared(card, className) {
  // Decorated cards are composed from the layered assets (frame + icons + overlays + corner
  // badges) by compose.js, the same code compose.html uses to compare against the scans.
  const root = layer('pc');
  root.appendChild(composedShared(card, className));
  return root;
}

function buildBase(card, className, isAdded) {
  const root = layer('pc');
  root.appendChild(img(`${BASE}/frames/${FRAME_BY_VALUE[card.value] || 'p0'}.webp`, 'pc-frame'));
  // Removed base cards come from the standard deck (no class icon); base cards a perk adds are class cards.
  // Same class badge (circle + sized icon) as the composed shared cards.
  if (isAdded && className) root.appendChild(badges(null, className));
  if (card.value !== 'null') root.appendChild(img(`${BASE}/numbers/c-${NUMBER_FILE[card.value]}.webp`, 'pc-full'));
  return root;
}

function buildUnique(card) {
  // Already a full baked card image, class badge included.
  const root = layer('pc');
  root.appendChild(img(`${BASE}/unique/${card.code}.webp`, 'pc-unique'));
  return root;
}

export function buildCard(card, className, isAdded = false) {
  if (card.kind === 'base') return buildBase(card, className, isAdded);
  if (card.kind === 'unique') return buildUnique(card);
  return buildShared(card, className);
}
