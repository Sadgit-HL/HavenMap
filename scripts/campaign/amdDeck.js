import { imageFile } from '../images.js';
// Attack modifier deck of one character: the standard deck plus what the perks taken change (c.pk = { perks: [index], boxes: { index: mask } }).
// Pure data logic (no DOM), shared by the playmat modal and the checks. The draw state is saved in the record: chars[].amd for a
// character (since 2026-11-18), mon.am for the monster and ally decks.
import { heroCatalog, heroPerkClass, perkBoxes, perkLabel, perkDelta } from '../amd/heroDeck.js';
import { cryptoRandom } from './events.js';

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

// The monster deck and the ally deck (Monsters tab, scripts/campaign/monsters.js): standard cards built from layers with an M or A badge, imbuement cards and bless and curse as pictures, no class and no perks. The
// monster deck can be imbued (level 2 includes level 1), as in the map app (scripts/attackMods.js). An owner object
// { group: 'm' | 'a', imb, hail } stands in for the character in deckOf, drawState and amdAct.
const amPic = k => imageFile(`images/common/attack_mods/${k}`, '../');
const IMBUE_CARDS = [
  { key: 'i2m', face: '+2 Muddle', value: '+2', pic: 'plus2muddle' }, { key: 'i0p', face: '+0 Poison', value: '+0', pic: 'plus0poison' },
  { key: 'i3', face: '+3', value: '+3', pic: 'plus3' }, { key: 'i1h', face: '+1 Heal1', value: '+1', pic: 'plus1heal1' },
  { key: 'i1c', face: '+1 Curse', value: '+1', pic: 'plus1curse' }, { key: 'i0w', face: '+0 Wound', value: '+0', pic: 'plus0wound' },
];
export const IMBUE = { 1: { m1: -3, p1: 3, i2m: 1, i0p: 1 }, 2: { m2: -1, p0: -2, i3: 1, i1h: 2, i1c: 1, i0w: 1 } };
// Hail's last perk (Mercenary Pack, perk 17) adds one "+1, Hail gains 1 resolve" card to the monster deck. The card is in the monster deck while a
// Hail of the record has taken that perk (hailCards counts them; the owner object carries the count as `hail`).
const HAIL_PERK = 17;
export const hailCards = r => (r?.chars || []).filter(c => c.cls === 'Hail' && (c.pk?.perks || []).includes(HAIL_PERK)).length;
const groupCatalog = (g, hail = 0) => [
  ...AM_STANDARD.map(t => ({ ...t, card: { kind: 'base', value: t.value, badge: g === 'a' ? 'A' : 'M' } })),   // plain cards with an M or A badge (scripts/amd/card.js)
  ...(g === 'm' ? IMBUE_CARDS.map(t => ({ key: t.key, face: t.face, value: t.value, count: 0, shuffle: false, extra: true, img: amPic(`imbuement/${t.pic}`) })) : []),
  ...(g === 'm' && hail ? [{ key: 'hr', face: '+1 Resolve', value: '+1', count: 0, shuffle: false, extra: true, img: amPic('monster/hail-resolve') }] : []),
];
const groupSpecial = g => AM_SPECIAL.map(s => (g === 'm' ? { ...s, img: amPic(`monster/${s.key}`) } : s));
export const amOwner = (g, st = {}, r) => ({ group: g === 'a' ? 'a' : 'm', imb: g === 'a' ? 0 : Math.max(0, Math.min(2, st.imb || 0)), hail: g === 'a' ? 0 : hailCards(r) });
const catalogOf = c => (c.group ? groupCatalog(c.group, c.hail) : heroCatalog(c.cls, AM_STANDARD));
const specialOf = c => (c.group ? groupSpecial(c.group) : AM_SPECIAL);

export const perkList = cls => (heroPerkClass(cls)?.perks || []).map((p, index) => ({ ...p, index, boxes: perkBoxes(p), label: perkLabel(p) }));

// Cards of the class, each with the count in the full deck: [{ key, face, card, rolling, extra, base }] (base 0 = not in the deck).
export function deckOf(c, adj = {}) {
  const catalog = catalogOf(c), perks = c.group ? [] : perkList(c.cls);
  const counts = Object.fromEntries(catalog.map(t => [t.key, t.extra ? 0 : t.count]));
  for (const i of c.pk?.perks || []) if (perks[i]) for (const [k, n] of Object.entries(perkDelta(perks[i]))) counts[k] = (counts[k] || 0) + n;
  for (let l = 1; l <= (c.imb || 0); l++) for (const [k, n] of Object.entries(IMBUE[l])) counts[k] = (counts[k] || 0) + n;
  if (c.group === 'm' && c.hail) counts.hr = c.hail;
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

// The modifier of a card for the odds, effects ignored: { v: number | 'x2' | 'miss', roll }. Unique class cards take the value printed before
// the colon of their face text ("+2: ...", "2x: ..."), else +0; ">" in the face marks rolling.
// A rolling card: its modifier is added to the next card drawn (a unique class card marks it with ">" in its face text).
export function isRolling(t) {
  const uniq = t.card?.kind === 'unique';
  return uniq ? String(t.face ?? '').includes('>') : !!t.rolling;
}
function oddsValue(t) {
  if (t.key === 'bless') return { v: 'x2', roll: false };
  if (t.key === 'curse') return { v: 'miss', roll: false };
  const uniq = t.card?.kind === 'unique', f = String(t.face ?? '');
  const raw = uniq ? (/^([+-]\d+):/.exec(f)?.[1] ?? (/^2x:/i.test(f) ? 'x2' : '+0')) : String(t.card?.value ?? t.value ?? '+0');
  const v = raw === 'x2' ? 'x2' : raw === 'null' ? 'miss' : (parseInt(raw, 10) || 0);
  return { v, roll: isRolling(t) };
}

// Odds of one random draw from the pool, rolling cards chained (drawn without replacement): { miss, le2, le1, z, ge1, ge2, crit } as fractions,
// cumulative (le2 and le1 include the misses, ge1 and ge2 include the crits). null when the pool is empty.
// mode 'adv' or 'dis': the odds of the card that counts. The draw goes on until a card that is not rolling (N, with the rolling cards drawn before it, R), then
// one more card C comes from what is left (its rolling icon is ignored); advantage counts the better of N and C plus R, disadvantage the worse of the two and
// no R (the rules of amdCompare.js, by number only: a x2 card is above every number, a Miss below every number). A hero chooses with advantage, so this is the
// best of the two for a hero. With no card left after N, N counts alone.
export function drawOdds(A, mode = 'std') {
  const kinds = [];
  for (const t of [...A.tiles, ...A.specials]) if (t.n > 0) { const o = oddsValue(t), k = kinds.find(x => x.v === o.v && x.roll === o.roll); if (k) k.n += t.n; else kinds.push({ ...o, n: t.n }); }
  const N = kinds.reduce((s, k) => s + k.n, 0);
  if (!N) return null;
  const out = { miss: 0, le2: 0, le1: 0, z: 0, ge1: 0, ge2: 0, crit: 0 };
  const end = (p, r) => {                                               // r = the result: a number, 'x2' or 'miss'
    if (r === 'miss') { out.miss += p; out.le2 += p; out.le1 += p; return; }
    if (r === 'x2') { out.crit += p; out.ge1 += p; out.ge2 += p; return; }
    if (r <= -2) out.le2 += p;
    if (r <= -1) out.le1 += p;
    if (r === 0) out.z += p;
    if (r >= 1) out.ge1 += p;
    if (r >= 2) out.ge2 += p;
  };
  const left = kinds.map(k => k.n);
  const rank = v => (v === 'miss' ? -Infinity : v === 'x2' ? Infinity : v);
  const counted = (n, c, sum) => {                                      // the card that counts out of N and C (null: none left)
    const v = c === null ? n : mode === 'adv' ? (rank(c) > rank(n) ? c : n) : (rank(c) < rank(n) ? c : n);
    return typeof v === 'number' ? (mode === 'adv' ? v + sum : v) : v;
  };
  const walk = (p, sum, rem) => {                                       // sum = the rolling modifiers drawn so far, rem = cards left
    if (!rem) { end(p, sum); return; }                                  // only rolling cards were left: their sum is the result
    kinds.forEach((k, i) => {
      if (!left[i]) return;
      const q = p * left[i] / rem;
      if (!k.roll) {
        if (mode !== 'adv' && mode !== 'dis') { end(q, typeof k.v === 'number' ? sum + k.v : k.v); return; }
        left[i]--;
        const rest = rem - 1;
        if (!rest) end(q, counted(k.v, null, sum)); else kinds.forEach((c, j) => { if (left[j]) end(q * left[j] / rest, counted(k.v, c.v, sum)); });
        left[i]++;
        return;
      }
      left[i]--; walk(q, typeof k.v === 'number' ? sum + k.v : sum, rem - 1); left[i]++;
    });
  };
  walk(1, 0, N);
  return out;
}

// A deck state as saved in the record (chars[].amd): only known fields with sane values; null when nothing is drawn, placed or edited.
export function cleanAmd(st) {
  if (!st || typeof st !== 'object' || Array.isArray(st)) return null;
  const ok = k => typeof k === 'string' && /^[\w-]{1,40}$/.test(k), int = v => Math.trunc(Number(v)) || 0;
  const map = (o, lo, hi) => Object.entries(o && typeof o === 'object' && !Array.isArray(o) ? o : {}).filter(([k, v]) => ok(k) && int(v)).map(([k, v]) => [k, Math.max(lo, Math.min(hi, int(v)))]).filter(([, v]) => v);
  const out = {}, disc = map(st.disc, 0, 99), adj = map(st.adj, -20, 20);
  if (disc.length) { out.disc = Object.fromEntries(disc); const order = (Array.isArray(st.order) ? st.order : []).filter(ok).slice(-200); if (order.length) out.order = order; }
  if (adj.length) out.adj = Object.fromEntries(adj);
  for (const s of AM_SPECIAL) { const n = Math.max(0, Math.min(s.max, int(st[s.key]))); if (n) out[s.key] = n; }
  for (const z of PLACES) { const l = (Array.isArray(st[z]) ? st[z] : []).filter(ok).slice(0, 60); if (l.length) out[z] = l; }
  return Object.keys(out).length ? out : null;
}

// A reshuffle is due (the rule of the deck: a x2 or a Miss was drawn, or nothing is left to draw, with a discard pile to shuffle back and no
// card placed on top or bottom): A is a drawState. The shuffle buttons show a mark then; the monster and ally decks also shuffle by themselves
// at the end of a round (monEndRound).
export const shuffleDue = A => A.tiles.some(t => t.shuffle && t.d > 0) || (A.pool === 0 && A.disc > 0 && !A.topList.length && !A.botList.length);

// GeekRoller code that draws one card of what is left in the deck ('' when empty).
export const amdRollCode = faces => (faces.length ? `1custom${faces.length}{${faces.join(';')}}` : '');

// A draw in progress, an attack being resolved. The cards drawn wait in the active area ("in play") until the attack is resolved, then go to the
// discard (bless and curse leave the game). An empty deck is shuffled at once: the discard goes back into the deck, the cards in play stay out of
// that shuffle (a rolling card was drawn and another card is still needed), and the cards of a resolved attack are in the discard, so they go back
// too. take() draws one card: the first card placed on top of the deck, else a random card of the deck, else the first card placed on the bottom;
// null when there is no card at all. finish() ends the attack and returns the state. shuffles lists the shuffles made, each as the number of cards
// that stayed out of it.
function drawSession(c, st, rand) {
  let s = st;
  const held = [], shuffles = [];
  const shuffleIfEmpty = left => {
    const d = drawState(c, s);
    if (d.pool > 0 || d.topList.length || d.botList.length || d.disc === 0) return;
    s = amdAct(c, s, 'shuffle');
    shuffles.push(left);
  };
  return {
    shuffles,
    take() {
      shuffleIfEmpty(held.length);
      const d = drawState(c, s);
      let t = d.topList[0], from = 'top';
      if (!t) {
        const cards = [...d.tiles, ...d.specials].flatMap(x => Array(x.n).fill(x));        // one entry per card left in the random part
        if (cards.length) { t = cards[Math.floor(rand() * cards.length)]; from = 'pool'; }
        else if (d.botList[0]) { t = d.botList[0]; from = 'bot'; }
      }
      if (!t) return null;
      s = amdAct(c, s, 'move', t.key, from === 'pool' ? { from, to: 'act' } : { from, to: 'act', idx: 0 });
      held.push(t.key);
      return t;
    },
    finish() {
      for (const k of held) s = amdAct(c, s, 'move', k, { from: 'act', to: 'disc' });
      if (held.length) shuffleIfEmpty(0);
      return s;
    },
  };
}

// Random draw of a modifier deck, the way an attack draws: a rolling card is followed by the next draw, until a card that is not rolling; all go
// to the discard when the attack is resolved. The random source is `rand` (the browser's crypto source by default).
// Returns { st, drawn: [key], shuffles }; drawn is empty when there is no card at all (st is the state as it was).
export function drawRandom(c, st = {}, rand = cryptoRandom) {
  const d = drawSession(c, st, rand), drawn = [];
  for (let i = 0; i < 80; i++) {                                           // a deck is far smaller than that: the loop always ends
    const t = d.take();
    if (!t) break;
    drawn.push(t.key);
    if (!isRolling(t)) break;
  }
  const s = d.finish();
  return { st: drawn.length ? s : st, drawn, shuffles: d.shuffles };
}

// The draw of an attack with advantage or disadvantage: cards until one that is not rolling (n), then one more card (second; its rolling icon is
// ignored, so there is no further draw). Returns { st, drawn: [key] in the order drawn, rolling: [key] the rolling cards before n, n, second, shuffles }:
// n is null when no card that is not rolling could be drawn, second is null when no card was left after n. Which card counts: amdCompare.js.
export function drawTwo(c, st = {}, rand = cryptoRandom) {
  const d = drawSession(c, st, rand), drawn = [], rolling = [];
  let n = null, second = null;
  for (let i = 0; i < 80; i++) {
    const t = d.take();
    if (!t) break;
    drawn.push(t.key);
    if (isRolling(t)) rolling.push(t.key); else { n = t.key; break; }
  }
  if (n !== null) { const t = d.take(); if (t) { drawn.push(t.key); second = t.key; } }
  const s = d.finish();
  return { st: drawn.length ? s : st, drawn, rolling, n, second, shuffles: d.shuffles };
}

// A card can be drawn: there is one in the deck, or the discard can be shuffled back in (the draw does it by itself).
export const canDraw = A => A.total > 0 || A.disc > 0;

// Change of the session state; returns a new state. kind: draw | ret | add | rem | shuffle | plus | minus (the last two edit the card count of
// a type) | rdraw (a random draw, see drawRandom; opts.rand is the random source, opts.drawn an array that receives the keys drawn, opts.shuffled one entry per automatic shuffle) | rdraw2 (the
// draw of advantage or disadvantage, see drawTwo; opts.pair receives the result).
export function amdAct(c, st = {}, kind, key, opts = {}) {
  if (kind === 'rdraw') {
    const r = drawRandom(c, st, opts.rand);
    if (Array.isArray(opts.drawn)) opts.drawn.push(...r.drawn);
    if (Array.isArray(opts.shuffled)) opts.shuffled.push(...r.shuffles);
    return r.st;
  }
  if (kind === 'rdraw2') {                                                                 // advantage or disadvantage: opts.pair receives { rolling, n, second }
    const r = drawTwo(c, st, opts.rand);
    if (Array.isArray(opts.drawn)) opts.drawn.push(...r.drawn);
    if (opts.pair) Object.assign(opts.pair, { rolling: r.rolling, n: r.n, second: r.second });
    if (Array.isArray(opts.shuffled)) opts.shuffled.push(...r.shuffles);
    return r.st;
  }
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
