// Monsters tab: the monster types of the running scenario, their ability decks and the two attack modifier decks (monsters, allies).
// Pure data logic, no DOM. The mechanics follow the map app (scripts/decks.js, scripts/attackMods.js); the state lives in the campaign
// record, so every invited player sees the same decks.
//
// record.mon = {
//   lvl:   monster level 0..7, or null = the scenario level of the party (record.js scenarioLevel)
//   round: round number, counted up by End of round
//   types: [monster id] up to MON_MAX, in the order added (ids of scripts/games/gh.js, Gloomhaven 2nd edition)
//   decks: { slug: { deck: [n], active: [n], discard: [n] } }   ability decks; a missing entry is a full deck. Types that share a deck
//          (bosses, archers, scouts, ...) share one entry.
//   am:    { m: st, a: st }   the monster and the ally modifier deck, st as in amdDeck.js (disc, order, adj, bless, curse, top, bot, act)
//          plus imb (monster imbuement 0, 1 or 2)
// }
import ghConfig from '../games/gh.js';
import { GH_DECKS } from '../games/gh_decks.js';

export const MON_MAX = 8;
export const MONSTERS = ghConfig.monsters.filter(m => m.game === 'gh2').sort((a, b) => (a.boss - b.boss) || a.title.localeCompare(b.title));
const byId = new Map(MONSTERS.map(m => [m.id, m]));
export const monsterById = id => byId.get(Number(id)) || null;

// The ability deck of a monster type: bosses share the boss deck; types whose name holds one of these words share that deck.
const SHARED = ['archer', 'scout', 'imp', 'guard', 'priest'];
export function deckSlug(id) {
  const m = monsterById(id);
  if (!m) return null;
  if (m.boss) return GH_DECKS.boss ? 'boss' : null;
  const words = m.title.split(' ');
  const slug = SHARED.find(w => words.includes(w)) || m.title.replace(/ /g, '-');
  return GH_DECKS[slug] ? slug : null;
}
export const deckCards = slug => GH_DECKS[slug] || [];                 // [{ n, iid, init, s }]; s = shuffle icon
export const deckCard = (slug, n) => deckCards(slug).find(c => c.n === n) || null;

export function monOf(r) {
  const m = r?.mon || {};
  return { lvl: m.lvl ?? null, round: m.round || 1, types: Array.isArray(m.types) ? m.types : [], decks: m.decks || {}, am: m.am || {} };
}
export function deckState(mon, slug) {
  const s = mon.decks?.[slug];
  return { deck: s?.deck ?? deckCards(slug).map(c => c.n), active: s?.active ?? [], discard: s?.discard ?? [] };
}
// End of round reshuffles a deck whose drawn cards hold a shuffle icon, or whose draw pile is empty.
export function deckNeedsShuffle(slug, ds) {
  return ds.deck.length === 0 || [...ds.discard, ...ds.active].some(n => deckCard(slug, n)?.s);
}
// GeekRoller code that draws one of the cards left, e.g. 1custom3{iid:9903036;iid:9903037;iid:9903038}
export function deckRollCode(slug, ds) {
  const iids = ds.deck.map(n => `iid:${deckCard(slug, n)?.iid}`);
  return iids.length ? `1custom${iids.length}{${iids.join(';')}}` : '';
}
// The deck slugs of the chosen types, each once, in the order of the types.
export const monSlugs = mon => [...new Set(mon.types.map(deckSlug).filter(Boolean))];
