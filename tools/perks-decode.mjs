// Decoder for FrosthavenAssistant shared perk-card slugs, e.g. "plus1heal1allyflip".
// Used by extract-perks.mjs. See docs/hero-modifier-faces.md for the face record schema
// and the effect -> icon mapping this feeds into.

const VALUE_RE = /^(plus[0-4]|minus[12])/;

// name -> {cat, icon, amountable}. icon is the icons/center|side file suffix
// ("conditions-<icon>", "effects-<icon>", "elements-<icon>").
const DICT = [
  // elements
  ['air',    { cat: 'element', icon: 'wind' }],
  ['dark',   { cat: 'element', icon: 'dark' }],
  ['earth',  { cat: 'element', icon: 'earth' }],
  ['fire',   { cat: 'element', icon: 'fire' }],
  ['ice',    { cat: 'element', icon: 'ice' }],
  ['light',  { cat: 'element', icon: 'light' }],
  ['any',    { cat: 'element', icon: 'any-element' }],
  // conditions
  ['brittle',    { cat: 'condition', icon: 'brittle' }],
  ['curse',      { cat: 'condition', icon: 'curse' }],
  ['disarm',     { cat: 'condition', icon: 'disarm' }],
  ['immobilize', { cat: 'condition', icon: 'immobilize' }],
  ['invisible',  { cat: 'condition', icon: 'invisible' }],
  ['muddle',     { cat: 'condition', icon: 'muddle' }],
  ['poison',     { cat: 'condition', icon: 'poison' }],
  ['stun',       { cat: 'condition', icon: 'stun' }],
  ['wound',      { cat: 'condition', icon: 'wound' }],
  ['bless',      { cat: 'condition', icon: 'bless' }],
  ['strengthen', { cat: 'condition', icon: 'strengthen', amountable: false }],
  ['pierce',     { cat: 'condition', icon: 'pierce', amountable: true }],
  ['push',       { cat: 'condition', icon: 'push', amountable: true }],
  ['pull',       { cat: 'condition', icon: 'pull', amountable: true }],
  ['ward',       { cat: 'condition', icon: 'ward', amountable: true }],
  ['regenerate', { cat: 'condition', icon: 'regenerate' }],
  ['safeguard',  { cat: 'condition', icon: 'safeguard' }],
  // effects (amount is usually baked into the icon's own number)
  ['heal',       { cat: 'effect', icon: 'heal', amountable: true }],
  ['shield',     { cat: 'effect', icon: 'shield', amountable: true }],
  ['retaliate',  { cat: 'effect', icon: 'retaliate', amountable: true }],
  // standalone "add target" effect; range has no icon of its own, always paired with another token
  ['target', { cat: 'condition', icon: 'add-target', amountable: true }],
  ['range',  { cat: 'range', amountable: true }],
  // modifiers
  ['toany', { cat: 'modifier', key: 'convert-to-any' }],
  ['flip',  { cat: 'modifier', key: 'rolling' }],
  ['ally',  { cat: 'modifier', key: 'ally' }],
].sort((a, b) => b[0].length - a[0].length); // longest-match first, so e.g. "toany" wins over "any" mid-string

export function decodeSlug(slug) {
  const name = slug.replace(/^perks\//, '');
  const m = VALUE_RE.exec(name);
  if (!m) return { error: 'no-value-prefix', name };
  const value = m[1];
  let rest = name.slice(m[0].length);
  const tokens = [];
  while (rest.length) {
    let matched = null;
    for (const [word, info] of DICT) {
      if (rest.startsWith(word)) { matched = { word, info }; break; }
    }
    if (!matched) return { error: 'unmatched', name, value, tokens, rest };
    rest = rest.slice(matched.word.length);
    let amount;
    const digitMatch = /^\d+/.exec(rest);
    if (digitMatch && matched.info.amountable !== false) {
      amount = Number(digitMatch[0]);
      rest = rest.slice(digitMatch[0].length);
    }
    tokens.push({ word: matched.word, ...matched.info, amount });
  }
  return { name, value, tokens };
}

export function normalizeValue(v) {
  if (v.startsWith('plus')) return '+' + v.slice(4);
  if (v.startsWith('minus')) return '-' + v.slice(5);
  return v;
}
