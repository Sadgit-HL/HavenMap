import { imageFile } from '../images.js';
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
  { key: 'bless', label: 'Bless', face: 'B', max: 10, img: imageFile('images/common/attack_mods/hero/bless', '../') },
  { key: 'curse', label: 'Curse', face: 'C', max: 10, img: imageFile('images/common/attack_mods/hero/curse', '../') },
];

// The monster deck and the ally deck (Monsters tab, scripts/campaign/monsters.js): whole-card pictures, no class and no perks. The
// monster deck can be imbued (level 2 includes level 1), as in the map app (scripts/attackMods.js). An owner object
// { group: 'm' | 'a', imb } stands in for the character in deckOf, drawState and amdAct.
const amPic = k => imageFile(`images/common/attack_mods/${k}`, '../');
const STD_PIC = { p0: 'plus0', p1: 'plus1', m1: 'minus1', p2: 'plus2', m2: 'minus2', x2: 'x2', miss: 'miss' };
const IMBUE_CARDS = [
  { key: 'i2m', face: '+2 Muddle', value: '+2', pic: 'plus2muddle' }, { key: 'i0p', face: '+0 Poison', value: '+0', pic: 'plus0poison' },
  { key: 'i3', face: '+3', value: '+3', pic: 'plus3' }, { key: 'i1h', face: '+1 Heal1', value: '+1', pic: 'plus1heal1' },
  { key: 'i1c', face: '+1 Curse', value: '+1', pic: 'plus1curse' }, { key: 'i0w', face: '+0 Wound', value: '+0', pic: 'plus0wound' },
];
export const IMBUE = { 1: { m1: -3, p1: 3, i2m: 1, i0p: 1 }, 2: { m2: -1, p0: -2, i3: 1, i1h: 2, i1c: 1, i0w: 1 } };
const groupCatalog = g => [
  ...AM_STANDARD.map(t => ({ ...t, img: amPic(`${g === 'a' ? 'ally' : 'monster'}/${STD_PIC[t.key]}`) })),
  ...(g === 'm' ? IMBUE_CARDS.map(t => ({ key: t.key, face: t.face, value: t.value, count: 0, shuffle: false, extra: true, img: amPic(`imbuement/${t.pic}`) })) : []),
];
const groupSpecial = g => AM_SPECIAL.map(s => (g === 'm' ? { ...s, img: amPic(`monster/${s.key}`) } : s));
export const amOwner = (g, st = {}) => ({ group: g === 'a' ? 'a' : 'm', imb: g === 'a' ? 0 : Math.max(0, Math.min(2, st.imb || 0)) });
const catalogOf = c => (c.group ? groupCatalog(c.group) : heroCatalog(c.cls, AM_STANDARD));
const specialOf = c => (c.group ? groupSpecial(c.group) : AM_SPECIAL);

export const perkList = cls => (heroPerkClass(cls)?.perks || []).map((p, index) => ({ ...p, index, boxes: perkBoxes(p), label: perkLabel(p) }));

// Cards of the class, each with the count in the full deck: [{ key, face, card, rolling, extra, base }] (base 0 = not in the deck).
export function deckOf(c, adj = {}) {
  const catalog = catalogOf(c), perks = c.group ? [] : perkList(c.cls);
  const counts = Object.fromEntries(catalog.map(t => [t.key, t.extra ? 0 : t.count]));
  for (const i of c.pk?.perks || []) if (perks[i]) for (const [k, n] of Object.entries(perkDelta(perks[i]))) counts[k] = (counts[k] || 0) + n;
  for (let l = 1; l <= (c.imb || 0); l++) for (const [k, n] of Object.entries(IMBUE[l])) counts[k] = (counts[k] || 0) + n;
  return catalog.map(t => ({ ...t, base: Math.max(0, (counts[t.key] || 0) + (adj?.[t.key] || 0)) })).filter(t => t.base > 0);
}

// The places a card can be put besides the pool and the discard (ordered lists in the session state).
export const PLACES = ['top', 'bot', 'act'];

// Session draw state { disc: { key: n }, adj: { key: +-n }, bless, curse } -> what is left: { tiles: [{...t, n, d}], specials: [{...s, n}], missing: [standard types not in the deck], faces, total, disc }.
// adj is the hand-edited change of the card counts (kept like the draws while the page is open).
export function drawState(c, st = {}) {
  const tiles = [], faces = [];
  let total = 0, disc = 0;
  const placed = {};                                                       // cards put on top, on the bottom or in the active area: not part of the random pool
  for (const z of PLACES) for (const k of st[z] || []) placed[k] = (placed[k] || 0) + 1;
  for (const t of deckOf(c, st.adj)) {
    const d = Math.min(st.disc?.[t.key] || 0, t.base), n = Math.max(0, t.base - d - (placed[t.key] || 0));
    for (let i = 0; i < n; i++) faces.push(t.face);
    total += n; disc += d;
    tiles.push({ ...t, n, d });
  }
  const specials = specialOf(c).map(s => ({ ...s, c: Math.max(0, Math.min(s.max, st[s.key] || 0)) })).map(s => ({ ...s, n: Math.max(0, s.c - (placed[s.key] || 0)) }));
  for (const s of specials) { for (let i = 0; i < s.n; i++) faces.push(s.face); total += s.n; }
  // the discard, most recent first: pile = [tile...] one entry per card, top = the tile of the last discarded card
  const left = Object.fromEntries(tiles.map(t => [t.key, t.d])), byK = new Map(tiles.map(t => [t.key, t])), pile = [];
  for (const k of [...(st.order || [])].reverse()) if (left[k] > 0) { left[k]--; pile.push(byK.get(k)); }
  for (const t of tiles) for (let i = 0; i < left[t.key]; i++) pile.push(t);
  // the ordered lists as tiles: [{...tile, i}] (i = position in the list); top[0] is drawn next, bot[0] is drawn first of the bottom cards
  const byKey = new Map([...tiles, ...specials].map(t => [t.key, t]));
  const lists = {};
  for (const z of PLACES) lists[z] = (st[z] || []).map((k, i) => (byKey.has(k) ? { ...byKey.get(k), i } : null)).filter(Boolean);
  const pool = total;
  total += lists.top.length + lists.bot.length;
  const have = new Set(tiles.map(t => t.key)), std = new Set(AM_STANDARD.map(t => t.key));
  const missing = catalogOf(c).filter(t => (c.group || std.has(t.key)) && !have.has(t.key));   // edit mode lists them (monsters: the imbuement cards too)
  return { tiles, specials, missing, pile, top: pile[0] || null, topList: lists.top, botList: lists.bot, actList: lists.act, pool, faces, total, disc };
}

// GeekRoller code that draws one card of what is left in the deck ('' when empty).
export const amdRollCode = faces => (faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '');

// Change of the session state; returns a new state. kind: draw | ret | add | rem | shuffle | plus | minus (the last two edit the card count of a type).
export function amdAct(c, st = {}, kind, key, opts = {}) {
  const s = { ...st, disc: { ...(st.disc || {}) } }, sp = AM_SPECIAL.find(x => x.key === key);
  if (kind === 'shuffle') { s.disc = {}; s.order = []; s.top = []; s.bot = []; return s; }                // the active cards stay where they are
  if (kind === 'move') return moveCard(c, s, key, opts);
  if (kind === 'plus' || kind === 'minus') {
    const left = deckOf(c, s.adj).find(t => t.key === key)?.base || 0, d = kind === 'plus' ? 1 : -1;
    if (kind === 'minus' && left < 1) return s;
    s.adj = { ...(s.adj || {}), [key]: ((s.adj || {})[key] || 0) + d };
    return s;
  }
  if (kind === 'draw') { if (sp) s[key] = Math.max(0, (s[key] || 0) - 1); else { s.disc[key] = (s.disc[key] || 0) + 1; s.order = [...(s.order || []), key]; } }
  else if (kind === 'ret') { s.disc[key] = Math.max(0, (s.disc[key] || 0) - 1); const o = [...(s.order || [])], i = o.lastIndexOf(key); if (i >= 0) o.splice(i, 1); s.order = o; }
  else if (sp && (kind === 'add' || kind === 'rem')) s[key] = Math.max(0, Math.min(sp.max, (s[key] || 0) + (kind === 'add' ? 1 : -1)));
  return s;
}

// Move one card of a kind between pool (the random part of the deck), disc, top, bot and act. opts: { from, to, idx (position in the list it
// leaves), at (position in the list it enters; default: front of top, end of bot and act) }. A special card (bless, curse) that reaches the
// discard leaves the game.
function moveCard(c, s, key, { from, to, idx, at }) {
  const sp = AM_SPECIAL.find(x => x.key === key), ZONES = ['pool', 'disc', ...PLACES];
  if (!ZONES.includes(from) || !ZONES.includes(to) || (from === to && !PLACES.includes(from))) return s;
  let fromIdx = -1;
  if (from === 'pool') {
    const d = drawState(c, s), left = sp ? d.specials.find(x => x.key === key)?.n : d.tiles.find(t => t.key === key)?.n;
    if (!(left > 0)) return s;
  } else if (from === 'disc') {
    if (sp || !(s.disc[key] > 0)) return s;
    s.disc[key]--;
    const o = [...(s.order || [])], i = o.lastIndexOf(key); if (i >= 0) o.splice(i, 1); s.order = o;
  } else {
    const list = [...(s[from] || [])];
    fromIdx = list[idx] === key ? idx : list.indexOf(key);
    if (fromIdx < 0) return s;
    list.splice(fromIdx, 1); s[from] = list;
  }
  if (to === 'disc') {
    if (sp) s[key] = Math.max(0, (s[key] || 0) - 1);
    else { s.disc[key] = (s.disc[key] || 0) + 1; s.order = [...(s.order || []), key]; }
  } else if (to !== 'pool') {
    const list = [...(s[to] || [])];
    let pos = at == null ? (to === 'top' ? 0 : list.length) : at;
    if (from === to && fromIdx < pos) pos--;
    list.splice(Math.max(0, Math.min(list.length, pos)), 0, key); s[to] = list;
  }
  return s;
}
