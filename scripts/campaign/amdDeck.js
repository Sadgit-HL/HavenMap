// Attack modifier deck of one character: the standard deck plus what the perks taken change (c.pk = { perks: [index], boxes: { index: mask } }).
// Pure data logic (no DOM), shared by the playmat modal and the checks. Draws, bless and curse are not saved: the page keeps them while it is open.
import { heroCatalog, heroPerkClass, perkBoxes, perkLabel, perkDelta } from '../amd/heroDeck.js';

// The standard 20 cards (keys of scripts/amd/heroDeck.js); x2 and Miss reshuffle the deck.
export const AM_STANDARD = [
  { key: 'p0', face: '+0', value: '+0', count: 6, shuffle: false },
  { key: 'p1', face: '+1', value: '+1', count: 5, shuffle: false },
  { key: 'm1', face: '-1', value: '-1', count: 5, shuffle: false },
  { key: 'p2', face: '+2', value: '+2', count: 1, shuffle: false },
  { key: 'm2', face: '-2', value: '-2', count: 1, shuffle: false },
  { key: 'x2', face: 'x2', value: 'x2', count: 1, shuffle: true },
  { key: 'miss', face: 'Miss', value: 'null', count: 1, shuffle: true },
];
// Bless and curse cards are added by hand (max 10 each) and leave the game when drawn.
export const AM_SPECIAL = [
  { key: 'bless', label: 'Bless', face: 'B', max: 10, img: '../images/common/attack_mods/hero/bless.webp' },
  { key: 'curse', label: 'Curse', face: 'C', max: 10, img: '../images/common/attack_mods/hero/curse.webp' },
];

export const perkList = cls => (heroPerkClass(cls)?.perks || []).map((p, index) => ({ ...p, index, boxes: perkBoxes(p), label: perkLabel(p) }));

// Cards of the class, each with the count in the full deck: [{ key, face, card, rolling, extra, base }] (base 0 = not in the deck).
export function deckOf(c) {
  const catalog = heroCatalog(c.cls, AM_STANDARD), perks = perkList(c.cls);
  const counts = Object.fromEntries(catalog.map(t => [t.key, t.extra ? 0 : t.count]));
  for (const i of c.pk?.perks || []) if (perks[i]) for (const [k, n] of Object.entries(perkDelta(perks[i]))) counts[k] = (counts[k] || 0) + n;
  return catalog.map(t => ({ ...t, base: Math.max(0, counts[t.key] || 0) })).filter(t => t.base > 0);
}

// Session draw state { disc: { key: n }, bless, curse } -> what is left: { tiles: [{...t, n, d}], specials: [{...s, n}], faces, total, disc }.
export function drawState(c, st = {}) {
  const tiles = [], faces = [];
  let total = 0, disc = 0;
  for (const t of deckOf(c)) {
    const d = Math.min(st.disc?.[t.key] || 0, t.base), n = t.base - d;
    for (let i = 0; i < n; i++) faces.push(t.face);
    total += n; disc += d;
    tiles.push({ ...t, n, d });
  }
  const specials = AM_SPECIAL.map(s => ({ ...s, n: Math.max(0, Math.min(s.max, st[s.key] || 0)) }));
  for (const s of specials) { for (let i = 0; i < s.n; i++) faces.push(s.face); total += s.n; }
  return { tiles, specials, faces, total, disc };
}

// GeekRoller code that draws one card of what is left in the deck ('' when empty).
export const amdRollCode = faces => (faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '');

// Change of the session state; returns a new state. kind: draw | ret | add | rem | shuffle.
export function amdAct(c, st = {}, kind, key) {
  const s = { ...st, disc: { ...(st.disc || {}) } }, sp = AM_SPECIAL.find(x => x.key === key);
  if (kind === 'shuffle') { s.disc = {}; return s; }
  if (kind === 'draw') { if (sp) s[key] = Math.max(0, (s[key] || 0) - 1); else s.disc[key] = (s.disc[key] || 0) + 1; }
  else if (kind === 'ret') s.disc[key] = Math.max(0, (s.disc[key] || 0) - 1);
  else if (sp && (kind === 'add' || kind === 'rem')) s[key] = Math.max(0, Math.min(sp.max, (s[key] || 0) + (kind === 'add' ? 1 : -1)));
  return s;
}
