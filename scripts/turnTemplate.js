// The forum turn template of a card half: lines of BGG forum code from the generated parts (scripts/games/turn_templates.js, made by
// tools/build-turn-templates.mjs), with the stickers laid on the card (the markers of the campaign record) added to the printed values. Pure logic, no DOM.
import { BGG_ICON_GROUPS } from './campaign/bggIcons.js';

const CODES = new Map(BGG_ICON_GROUPS.flatMap(g => g.icons).map(i => [i.n, i.c]));
export const iconCode = name => CODES.get(name) ?? null;

const ic = name => iconCode(name) ?? String(name);
const WORDS = { enhance1: '+1', 'amd-double': '2x', 'amd-null': 'null', 'amd-minus-1': '-1', 'amd-rolling': 'rolling', resol: 'resolve', irri: 'irritation' };

// "%range% 2" and the like in a card text: icons where there is one, the name as a word where not
export function textCode(s) {
  return String(s).replace(/%([A-Za-z0-9_-]+)%/g, (m, n) => {
    if (n === 'lf' || n === 'ls' || /^nbsp\d+$/.test(n)) return ' ';
    const xp = n.match(/^xp(\d+)$/);
    if (xp) return `${ic('xp')} ${xp[1]}`;
    const name = WORDS[n] && iconCode(WORDS[n]) ? WORDS[n] : n;
    return iconCode(name) ?? WORDS[n] ?? n;
  }).replace(/\s+/g, ' ').trim();
}

// The mode boxes of a Blinkblade card (a line with `m`: 'fast' or 'slow'). Without a mode (`null`) every box is a line of its own, led by its mode icon.
// With the character's mode only the boxes of that mode stay: their modifiers (`mods`, each linked by `to` to the line it changes) are added to the printed
// value there ("move 3+2"), the other items of the box (`rest`) follow on that line, and a box with no link stands alone, without its icon.
const MODE_ICON = { fast: 'blinkblade-1', slow: 'blinkblade-0' };
function modeRows(rows, mode) {
  if (!mode) {
    rows.forEach(r => { if (r.m) r.p.unshift({ i: MODE_ICON[r.m] }); });
    return rows;
  }
  const merged = new Set();
  for (const r of rows) {
    if (r.m !== mode || !r.mods || !r.mods.length) continue;
    let target = null;
    for (const md of r.mods) {
      const t = rows[md.to];
      const part = t && !t.m && t.p.find(x => typeof x === 'object' && x.i === md.i && typeof x.v === 'number');
      if (part) { part.add = (part.add || 0) + md.d; target = target || t; }
    }
    if (target) {
      if (r.rest && r.rest.length) target.p.push(',', ...r.rest);
      merged.add(r);
    }
  }
  return rows.filter(r => !r.m || (r.m === mode && !merged.has(r)));
}

// A card half as lines of text (`opts.mode`: 'fast' or 'slow' for a Blinkblade, see modeRows). `lines` is the generated list (a line is its parts, or { p: parts, e: dots }). `stickers` are the stickers laid on
// this half of the card: { k: name, ry: place in the half from top (0) to bottom (1) }. The card's picture is not known here, so a sticker goes to the
// line with enhancement dots that its place in the half points to (the dotted lines spread evenly over the half): a +1 adds to the first value of
// that line (not the range), any other sticker is written after the action as its icon (or its name).
export function halfLines(lines, stickers = [], opts = {}) {
  const copy = a => a.map(x => (typeof x === 'object' ? { ...x } : x));
  let rows = (lines || []).map(l => (Array.isArray(l) ? { p: copy(l), e: 0 } : { p: copy(l.p), e: l.e || 0, m: l.m, mods: l.mods, rest: l.rest && copy(l.rest) }));
  rows = modeRows(rows, opts.mode || null);
  const dotted = rows.map((r, i) => (r.e ? i : -1)).filter(i => i >= 0);
  for (const s of stickers) {
    if (!rows.length) { rows.push({ p: [], e: 0 }); }
    const firstValued = rows.findIndex(r => r.p.some(x => typeof x === 'object' && typeof x.v === 'number' && x.i !== 'range'));
    const pool = dotted.length ? dotted : [Math.max(0, firstValued)];                // no dots known: the first action with a value
    const row = rows[pool[Math.max(0, Math.min(pool.length - 1, Math.floor((Number(s.ry) || 0) * pool.length)))]];
    if (s.k === 'plus_one') {
      const valued = row.p.filter(x => typeof x === 'object' && typeof x.v === 'number');
      const hit = valued.find(x => x.i !== 'range') || valued[0];
      if (hit) { hit.add = (hit.add || 0) + 1; continue; }
    }
    const word = s.k === 'plus_one' ? '1' :s.k === 'hex_attack' ? 'hex' : String(s.k).replace(/_/g, ' ');
    const at = row.p.findIndex(x => x === '(');
    row.p.splice(at < 0 ? row.p.length : at, 0, iconCode(s.k) ? { i: s.k, plus: true } : `+${word}`);
  }
  return rows.map(r => join(r.p));
}

// the last line of an action: the experience and what happens to the card (an icon where the BGG codes have one, else a word): "[xp] 2, persistent, lost"
export function flagsLine(flags) {
  const parts = (flags || []).map(f => {
    const xp = String(f).match(/^xp(\d+)$/);
    if (xp) return `${ic('xp')} ${xp[1]}`;
    return iconCode(f) ?? String(f);
  });
  return parts.length && parts.every(p => p.startsWith('[')) ? parts.join(' ') : parts.join(', ');
}

function one(p) {
  if (typeof p === 'string') return /^(\(|\)|,|:)$/.test(p) ? p : textCode(p);
  const add = p.add ? (p.add > 0 ? `+${p.add}` : String(p.add)) : '';
  if (p.plus) return `+${ic(p.i)}`;
  return p.v === undefined ? ic(p.i) : `${ic(p.i)} ${p.v}${add}`;
}
// parts joined by spaces, without a space after "(" or before ")", "," and ":"
function join(l) {
  let out = '';
  for (const p of l) {
    const t = one(p);
    if (!t) continue;
    const tight = !out || /\($/.test(out) || t === ')' || t === ',' || t === ':';
    out += (tight ? '' : ' ') + t;
  }
  return out;
}
