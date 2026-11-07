// Hero attack-modifier deck model: which class a mercenary is, which card faces its perks can
// touch, and what each perk changes. Pure data logic (no DOM, no state) so HavenMap and the
// campaign app can share it. Perk data comes from scripts/games/perks.js.
//
// Card keys (one per distinct face of a class):
//   standard cards   p0 p1 p2 p3 p4 m1 m2 miss   (the keys the monster deck already uses)
//   decorated cards  the art slug, e.g. 'plus0pierce3flip'
//   unique cards     'u-' + code, e.g. 'u-df1'
import { PERKS } from '../games/perks.js';

// Mercenary title -> perk class name where the spelling differs.
const CLASS_ALIAS = { 'HIVE': 'H.I.V.E.', 'Snow Dancer': 'Snowdancer' };

const BASE_KEY = { '+0': 'p0', '+1': 'p1', '+2': 'p2', '+3': 'p3', '+4': 'p4', '-1': 'm1', '-2': 'm2', 'null': 'miss' };
const STANDARD_CARD = { '+0': '+0', '+1': '+1', '+2': '+2', '-1': '-1', '-2': '-2', 'x2': 'x2', 'Miss': 'null' };

// { edition, name, perks } for a mercenary title, or null when there is no perk data (e.g. Hollowpact).
export function heroPerkClass(title) {
  const name = CLASS_ALIAS[title] || title;
  for (const [edition, classes] of Object.entries(PERKS)) {
    if (classes[name]) return { edition, name, perks: classes[name] };
  }
  return null;
}

export function cardKey(card) {
  if (card.kind === 'base') return BASE_KEY[card.value];
  if (card.kind === 'unique') return 'u-' + card.code;
  return card.art.ref;
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Text for the GeekRoller code: "+0 Pierce 3 Rolling" for decorated faces, the quoted card text of
// the perk for unique ones (the data has no value for those), else "Unique <code>".
function faceText(card, perk) {
  if (card.kind === 'shared') {
    const parts = [card.value];
    for (const t of card.tokens || []) {
      if (t.key === 'rolling') parts.push('Rolling');
      else parts.push(cap(t.word || t.key || '') + (t.amount !== undefined ? ' ' + t.amount : ''));
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  const quoted = /"([^"]+)"/.exec(perk?.text || '')?.[1];
  if (!quoted) return 'Unique ' + card.code;
  const t = quoted.replace(/%flip%/g, '').replace(/%(\w+)%/g, '$1').replace(/\s+/g, ' ').trim();
  return t.length > 60 ? t.slice(0, 57) + '...' : t;
}

const catalogs = new Map();

// Card catalog of one class: the standard cards (counts as in `standard`) plus every other face its
// perks add or remove, with count 0 (shown when present, or in edit mode). Each entry carries
// `card`, the perks.js card, so the face can be drawn with scripts/amd/card.js.
export function heroCatalog(title, standard) {
  if (catalogs.has(title)) return catalogs.get(title);
  const out = standard.filter(t => !t.extra).map(t => ({ ...t, card: { kind: 'base', value: STANDARD_CARD[t.face] } }));
  const seen = new Set(out.map(t => t.key));
  const cls = heroPerkClass(title);
  for (const perk of cls?.perks || []) {
    for (const card of [...perk.adds, ...perk.removes]) {
      const key = cardKey(card);
      if (seen.has(key)) continue;
      seen.add(key);
      const rolling = card.kind === 'shared' && (card.tokens || []).some(t => t.key === 'rolling');
      out.push({ key, face: faceText(card, perk), count: 0, shuffle: false, extra: true, rolling, card });
    }
  }
  catalogs.set(title, out);
  return out;
}

// What one perk does to the composition: { key: +n | -n }.
export function perkDelta(perk) {
  const d = {};
  for (const c of perk.adds) d[cardKey(c)] = (d[cardKey(c)] || 0) + 1;
  for (const c of perk.removes) d[cardKey(c)] = (d[cardKey(c)] || 0) - 1;
  return d;
}
