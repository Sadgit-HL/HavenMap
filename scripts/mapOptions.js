// Map page options kept in this browser (not in the map link): which deck features are shown. Both are shown by default.
//   abilities  the monster ability decks (deck panel tab, bottom bar button). Hidden: the Active ability section of a monster in the sidebar
//              becomes a picker (a click opens a drawer with the monster's ability cards, a card sets it for all monsters of that type).
//   am         the attack modifier decks (deck panel tab, bottom bar button).
const KEY = 'havenmap.map.options';
const DEFAULT = { abilities: true, am: true };
const subs = [];

function load() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    return { ...DEFAULT, ...Object.fromEntries(Object.keys(DEFAULT).filter(k => typeof o?.[k] === 'boolean').map(k => [k, o[k]])) };
  } catch { return { ...DEFAULT }; }
}
let opts = load();

export const mapOption = name => opts[name] !== false;
export function setMapOption(name, on) {
  if (!(name in DEFAULT)) return;
  opts = { ...opts, [name]: !!on };
  try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch { /* blocked */ }
  subs.forEach(fn => fn());
}
export const subscribeMapOptions = fn => { subs.push(fn); };
