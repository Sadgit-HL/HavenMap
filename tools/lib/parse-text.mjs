// Parses the free-text lines of the card code ("custom" actions) into typed actions, for tools/build-card-actions.mjs.
// A line is parsed only when the whole line is understood; anything else stays free text (returns null). A line can give several actions.
//
// Typed actions (field `type`):
//   { type: 'xp', value }                                          experience
//   { type: 'pressure', change: 1 | -1 }                           Metal Mosaic: gain or lose pressure
//   { type: 'recoverItems', who, count: 'all' | n, spent? }        recover items (who: 'self' | 'selfAndAdjacentAllies')
//   { type: 'recoverCards', who, from: 'discard' | 'lost', count: n | { max: n }, optional? }
//   { type: 'create', kind: 'terrain' | 'obstacle' | 'trap' | 'token', ... , count, hexes?, where }
// where = { rel: 'adjacent' | 'range' | 'target' | 'any', range?, require?: ['empty' | 'occupied' | 'featureless'] }

const NUM = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
const num = s => (/^\d+$/.test(s) ? Number(s) : NUM[String(s).toLowerCase()] ?? null);
const clean = t => String(t).replace(/\s+/g, ' ').replace(/\s+([.,])/g, '$1').trim();

// the place of a created tile or token: "an adjacent empty hex", "a hex within %range% 3", "the hex occupied by the target", ...
export function parseWhere(s) {
  let t = clean(s).replace(/\.$/, '').toLowerCase();
  if (/^(the )?(featureless )?hex (the target is occupying|occupied by the target)$/.test(t)) return { rel: 'target', require: /featureless/.test(t) ? ['featureless'] : [] };
  if (/^the featureless hex occupied by the target$/.test(t)) return { rel: 'target', require: ['featureless'] };
  const m = t.match(/^(?:an?|one) ((?:(?:adjacent|empty|unoccupied|occupied|featureless) )*)hex(?: within %range% ?(\d+))?$/);
  if (!m) return null;
  const words = m[1].trim().split(/\s+/).filter(Boolean);
  const where = { rel: m[2] ? 'range' : words.includes('adjacent') ? 'adjacent' : 'any' };
  if (m[2]) where.range = Number(m[2]);
  const require = [];
  if (words.includes('empty') || words.includes('unoccupied')) require.push('empty');
  if (words.includes('occupied')) require.push('occupied');
  if (words.includes('featureless')) require.push('featureless');
  if (require.length) where.require = require;
  return where;
}

const TERRAIN = { 'hazardous terrain': 'hazardous', 'difficult terrain': 'difficult', water: 'water', 'icy terrain': 'icy', obstacle: 'obstacle' };

function parseOne(text) {
  const t = clean(text);
  let m;
  // experience
  if ((m = t.match(/^%xp% ?(\d+)\.?$/))) return [{ type: 'xp', value: Number(m[1]) }];
  if ((m = t.match(/^%xp% ?(\d+), %(gain|lose)_pressure%\.?$/))) return [{ type: 'xp', value: Number(m[1]) }, { type: 'pressure', change: m[2] === 'gain' ? 1 : -1 }];
  // recover items
  if (/^%recover% your items\.?$/i.test(t)) return [{ type: 'recoverItems', who: 'self', count: 'all' }];
  if (/^%recover% all your spent items\.?$/i.test(t)) return [{ type: 'recoverItems', who: 'self', count: 'all', spent: true }];
  if (/^%recover% one of your spent items\.?$/i.test(t)) return [{ type: 'recoverItems', who: 'self', count: 1, spent: true }];
  if ((m = t.match(/^%recover% your and adjacent allies' items(?:, %xp% ?(\d+))?\.?$/i))) return [{ type: 'recoverItems', who: 'selfAndAdjacentAllies', count: 'all' }, ...(m[1] ? [{ type: 'xp', value: Number(m[1]) }] : [])];
  // recover cards
  if ((m = t.match(/^%recover% up to (\w+) of your discarded cards\.?$/i)) && num(m[1])) return [{ type: 'recoverCards', who: 'self', from: 'discard', count: { max: num(m[1]) } }];
  if ((m = t.match(/^%recover% (\w+) cards? from your lost pile and up to (\w+) cards? from you(?:r)? discard pile\.?$/i)) && num(m[1]) && num(m[2])) {
    return [{ type: 'recoverCards', who: 'self', from: 'lost', count: num(m[1]) }, { type: 'recoverCards', who: 'self', from: 'discard', count: { max: num(m[2]) } }];
  }
  if ((m = t.match(/^One adjacent ally may %recover% (\w+) cards? from their lost pile\.?$/i)) && num(m[1])) return [{ type: 'recoverCards', who: 'adjacentAlly', from: 'lost', count: num(m[1]), optional: true }];
  if (/^One adjac?ent ally may %recover% one of their spent items\.?$/i.test(t)) return [{ type: 'recoverItems', who: 'adjacentAlly', count: 1, spent: true, optional: true }];
  // "%recover% one card from your lost pile", "%recover% up to two of your lost cards", "%recover% all cards in your lost pile"
  if ((m = t.match(/^%recover% (all|one|two|three|up to \w+) (?:cards? (?:from|in) your (lost|discard) pile|of your (lost|discarded) cards)\.?$/i))) {
    const from = (m[2] || m[3]).toLowerCase().startsWith('lost') ? 'lost' : 'discard';
    const w = m[1].toLowerCase();
    const count = w === 'all' ? 'all' : w.startsWith('up to ') ? (num(w.slice(6)) ? { max: num(w.slice(6)) } : null) : num(w);
    if (count) return [{ type: 'recoverCards', who: 'self', from, count }];
  }
  // create terrain, obstacles, traps and tokens
  if ((m = t.match(/^Create (\w+) (\d)-hex (hazardous terrain|difficult terrain|icy terrain|water|obstacle) tiles? (?:in|on) (.+)$/i)) && num(m[1])) {
    const where = parseWhere(m[4].replace(/^((?:(?:adjacent|empty|unoccupied|occupied|featureless) )*)hexes\b/i, 'a $1hex'));      // "in empty hexes within %range%3": one tile in each
    if (where) return [{ type: 'create', kind: m[3].toLowerCase() === 'obstacle' ? 'obstacle' : 'terrain', terrain: TERRAIN[m[3].toLowerCase()], count: num(m[1]), hexes: Number(m[2]), where }];
  }
  if ((m = t.match(/^Create (\w+) %(\w+)% trap in (.+)$/i)) && num(m[1])) {
    const where = parseWhere(m[3]);
    if (where) return [{ type: 'create', kind: 'trap', trap: m[2], count: num(m[1]), where }];
  }
  if ((m = t.match(/^Place (\w+) %(rift|tear|fh-shadow)% in (.+)$/i)) && num(m[1])) {
    const where = parseWhere(m[3]);
    if (where) return [{ type: 'create', kind: 'token', token: m[2], count: num(m[1]), where }];
  }
  return null;
}

// A line, with a trailing ", %xp% N" taken off first when what is left parses ("Place one %rift% in a hex within %range% 2, %xp% 1.").
export function parseLine(text) {
  const direct = parseOne(text);
  if (direct) return direct;
  const m = clean(text).match(/^(.*?),\s*%xp%\s*(\d+)\.?$/);
  if (m) {
    const rest = parseOne(m[1]);
    if (rest) return [...rest, { type: 'xp', value: Number(m[2]) }];
  }
  return null;
}
