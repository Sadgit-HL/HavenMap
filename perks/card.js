// Composites one attack-modifier card from the layered assets in images/common/attack_mods/.
//
// Plain (base) cards are built from our own frame+number layers (the attack value is the only
// content, so there's nothing to get wrong). Decorated (shared/unique) cards instead use a real
// baked Cephalofair card image directly -- see buildShared()'s comment -- with only the class
// symbol badge overlaid on top, positioned from a box measured directly off a real card scan
// (any2cards/worldhaven, fh-am-df-14.png), see docs/hero-modifier-faces.md 3a.

const BASE = '../images/common/attack_mods';
const CANVAS = { w: 600, h: 391 };

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

// A div cropped to `box` (in canvas px) of `src`, scaled to fill its own rendered size.
function croppedIcon(src, box, cls) {
  const el = layer(cls);
  el.style.backgroundImage = `url(${src})`;
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundSize = `${(CANVAS.w / box.w) * 100}% ${(CANVAS.h / box.h) * 100}%`;
  el.style.backgroundPosition =
    `${(box.x / (CANVAS.w - box.w)) * 100}% ${(box.y / (CANVAS.h - box.h)) * 100}%`;
  return el;
}

const SPHERE_NUMBERED_BOX = { x: 26, y: 286, w: 84, h: 84 }; // spheres/numbered.webp's own content box

function classBadge(className) {
  if (!className) return null;
  const wrap = layer('pc-class-badge');
  wrap.appendChild(croppedIcon(`${BASE}/spheres/numbered.webp`, SPHERE_NUMBERED_BOX, 'pc-class-badge-bg'));
  const icon = img(`${BASE}/class_icons/${className}.webp`, 'pc-class-badge-icon');
  icon.onerror = () => icon.remove(); // class without a converted icon yet: skip silently
  wrap.appendChild(icon);
  return wrap;
}

function buildShared(card, className) {
  // FrosthavenAssistant's per-slug image IS a real Cephalofair card scan (frame tint, icon,
  // number placement, rolling diamond, amount -- all already correct and baked in; verified by
  // comparing plus0poison.png/plus0curse.png pixel-for-pixel against the real Boneshaper cards).
  // Using it directly instead of recomposing from separate icon/frame layers sidesteps every
  // approximation that approach needed (frame tint, per-amount art, multi-icon layout, labels).
  // Only the class symbol badge is ours: it replaces whichever class's weapon icon that scan
  // happened to carry, since the same slug is shared across many classes.
  const root = layer('pc');
  root.appendChild(img(`${BASE}/shared/${card.art.ref}.webp`, 'pc-unique'));
  const badge = classBadge(className);
  if (badge) root.appendChild(badge);
  return root;
}

function buildBase(card, className) {
  const root = layer('pc');
  root.appendChild(img(`${BASE}/frames/${FRAME_BY_VALUE[card.value] || 'p0'}.webp`, 'pc-frame'));
  const badge = classBadge(className);
  if (badge) root.appendChild(badge);
  if (card.value !== 'null') root.appendChild(img(`${BASE}/numbers/c-${NUMBER_FILE[card.value]}.webp`, 'pc-full'));
  return root;
}

function buildUnique(card) {
  // Already a full baked card image, class badge included.
  const root = layer('pc');
  root.appendChild(img(`${BASE}/unique/${card.code}.webp`, 'pc-unique'));
  return root;
}

export function buildCard(card, className) {
  if (card.kind === 'base') return buildBase(card, className);
  if (card.kind === 'unique') return buildUnique(card);
  return buildShared(card, className);
}
