// Hero attack-modifier deck model: which class a mercenary is, which card faces its perks can
// touch, and what each perk changes. Pure data logic (no DOM, no state) so HavenMap and the
// campaign app can share it. Perk data comes from scripts/games/perks.js.
//
// Card keys (one per distinct face of a class):
//   standard cards   p0 p1 p2 p3 p4 m1 m2 miss   (the keys the monster deck already uses)
//   decorated cards  the art slug, e.g. 'plus0pierce3flip'
//   unique cards     'u-' + code, e.g. 'u-df1'
import { PERKS } from '../games/perks.js';
import { UNIQUE_FACE_TEXT } from './uniqueFaceText.js';

// Mercenary title -> perk class name where the spelling differs.
const CLASS_ALIAS = { 'HIVE': 'H.I.V.E.' };

const BASE_KEY = { '+0': 'p0', '+1': 'p1', '+2': 'p2', '+3': 'p3', '+4': 'p4', '-1': 'm1', '-2': 'm2', 'null': 'miss' };

// { edition, name, perks } for a mercenary title, or null when there is no perk data.
const perkClasses = new Map();
export function heroPerkClass(title) {
  if (!perkClasses.has(title)) {
    const name = CLASS_ALIAS[title] || title;
    const edition = Object.keys(PERKS).find(ed => PERKS[ed][name]);
    perkClasses.set(title, edition ? { edition, name, perks: PERKS[edition][name] } : null);
  }
  return perkClasses.get(title);
}

export function cardKey(card) {
  if (card.kind === 'base') return BASE_KEY[card.value];
  if (card.kind === 'unique') return 'u-' + card.code;
  return card.art.ref;
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Text for the GeekRoller code: "+0 Pierce 3 Rolling" for decorated faces, a hand-compacted
// abbreviation (see uniqueFaceText.js and docs/unique-geekroller-codes.md) for unique ones with
// one, else the quoted card text of the perk, else the perk's own (unquoted) description trimmed
// the same way, else "Unique <code>" as a last resort when a perk has no text at all. BGG's
// GeekRoller caps an entire roll at 241 characters total across every face, so these all stay
// short rather than fully describing the effect -- the player can look up the code's meaning.
function faceText(card, perk) {
  if (card.kind === 'shared') {
    const parts = [card.value];
    for (const t of card.tokens || []) {
      if (t.key === 'rolling') parts.push('>');
      else parts.push(cap(t.word || t.key || '') + (t.amount !== undefined ? ' ' + t.amount : ''));
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }
  if (UNIQUE_FACE_TEXT[card.code]) return UNIQUE_FACE_TEXT[card.code];
  const raw = /"([^"]+)"/.exec(perk?.text || '')?.[1] ?? perk?.text;
  if (!raw) return 'Unique ' + card.code;
  const t = raw.replace(/%flip%/g, '').replace(/%(\w+)%/g, '$1').replace(/\s+/g, ' ').trim();
  return t.length > 60 ? t.slice(0, 57) + '...' : t;
}

// Catalogs built so far: standard-card list -> title -> catalog (the result depends on both).
const catalogs = new WeakMap();

// Card catalog of one class: the standard cards (counts as in `standard`) plus every other face its
// perks add or remove, with count 0 (shown when present, or in edit mode). Each entry carries
// `card`, the perks.js card, so the face can be drawn with scripts/amd/card.js.
export function heroCatalog(title, standard) {
  const byTitle = catalogs.get(standard) || catalogs.set(standard, new Map()).get(standard);
  if (byTitle.has(title)) return byTitle.get(title);
  const out = standard.filter(t => !t.extra).map(t => ({ ...t, card: { kind: 'base', value: t.value } }));
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
  byTitle.set(title, out);
  return out;
}

// A perk marked "[double]" / "[triple]" in its text has 2 / 3 checkboxes on the class sheet and only
// counts once all of them are ticked.
const BOX_MARK = /^\s*\[(double|triple)\]\s*/i;
export function perkBoxes(perk) {
  const m = BOX_MARK.exec(perk.text || '');
  return !m ? 1 : m[1].toLowerCase() === 'double' ? 2 : 3;
}
// Perk text without the box marker.
export function perkLabel(perk) { return (perk.text || '').replace(BOX_MARK, ''); }

// Perk entries that are identical (same text and cards) are the repeated boxes of one perk on the class
// sheet: "take this perk up to N times". Groups them, keeping the order of first occurrence:
// [{ perk: first entry, members: [entry, ...] }]. Each member is one box and applies on its own, unlike
// a "[double]/[triple]" perk whose single entry needs all its boxes ticked.
export function groupPerks(perks) {
  const groups = new Map();
  for (const p of perks) {
    const key = JSON.stringify([p.text, p.removes, p.adds]);
    if (!groups.has(key)) groups.set(key, { perk: p, members: [] });
    groups.get(key).members.push(p);
  }
  return [...groups.values()];
}

// What one perk does to the composition: { key: +n | -n }.
export function perkDelta(perk) {
  const d = {};
  const tally = (cards, n) => { for (const c of cards) { const k = cardKey(c); d[k] = (d[k] || 0) + n; } };
  tally(perk.adds, 1);
  tally(perk.removes, -1);
  return d;
}
