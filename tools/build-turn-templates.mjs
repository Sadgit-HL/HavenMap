// Builds scripts/games/turn_templates.js: the forum turn template of every ability card of the classes named on the command line (default: hail).
// Source: card-code-current/<folder>/<class>-ability-cards.code.json (made by tools/convert-card-code.py). Cards are matched to the app's card ids
// (scripts/games/gh2_cards.js) by initiative and level.
//
// Usage: node tools/build-turn-templates.mjs [class code ...]        e.g. node tools/build-turn-templates.mjs hl
//
// A template is { t: lines, b: lines } (top half, bottom half). A line is a list of parts, or { p: parts, e: n } when it has n enhancement dots:
//   "text"                 plain text; %token% marks an icon or a word, written by scripts/turnTemplate.js
//   { i: 'attack', v: 6 }  an icon with its printed value (a sticker adds +N to the value there)
//   { i: 'wound' }         an icon alone
// A template may also have tf / bf: the flags of the half (xp2, persistent, round, lost, removed), written as a last line of the action.
// Rules (owner, 2026-11-25): one line per action; range, jump, conditions and the like stay on the action's line; a dashed pill is written in
// parentheses directly after the action it belongs to (a pill that stands alone has its own line); the target of an attack, heal, push or pull is
// the placeholder "on X", the destination of a move or teleport "to X"; card text is copied as printed; no hex areas, no empty dots, no class
// token ribbons, no experience flags of the half.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, eachCard } from './lib/cardcode.mjs';

const OUT = join(ROOT, 'scripts', 'games', 'turn_templates.js');

const ON_X = new Set(['attack', 'heal', 'push', 'pull', 'condition', 'pierce']);
const TO_X = new Set(['move', 'teleport']);

// card text as parts: "%range% 3" and the like (an icon token followed by a plain number) become icon parts with a value, so that a sticker can add to them
const VALUE_TOKENS = 'range|move|attack|heal|push|pull|shield|loot|teleport|retaliate|pierce';
function words(text) {
  const out = [];
  let rest = String(text ?? '').replace(/%range(\d+)%/g, '%range% $1');       // %range3% is the range icon with its number
  const re = new RegExp('%(' + VALUE_TOKENS + ')%\\s*(\\d+)(?![\\d+])');
  for (let m; (m = rest.match(re));) {
    const before = rest.slice(0, m.index).trim();
    if (before) out.push(before);
    out.push({ i: m[1], v: Number(m[2]) });
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest.trim()) out.push(rest.trim());
  return out;
}

const AUGMENT = /^%augment%\s*augment$/i;                                  // the ribbon of an augment card, as the Secretariat conversion writes it
const val = a => (a.value === undefined || a.value === null || a.value === '' ? null : a.value);
const rel = v => (typeof v === 'number' ? `+${v}` : String(v));

// the parts of one action; `suffix` false inside a dashed pill
function action(a, suffix = true) {
  if (!a || typeof a !== 'object') return null;
  const t = a.type;
  const subs = Array.isArray(a.subActions) ? a.subActions : [];
  if (t === 'custom') return a.text && !AUGMENT.test(a.text.trim()) ? words(a.text) : null;       // the AUGMENT ribbon is not an action
  if (t === 'summon') return [`Summon ${a.name}`];
  if (t === 'irritation' || t === 'tokens' || t === 'area') return null;
  if (t === 'element') return [{ i: a.value }];
  if (t === 'group' || t === 'inline') return flat(a.actions || [], suffix);
  if (t === 'mandatory') return flat(a.actions || [], suffix);
  if (t === 'optional') return null;                                   // handled by the caller
  const rv = a.relative && typeof val(a) === 'number' ? `+${val(a)}` : val(a);                 // a granted modifier ("attack +0") is written with its plus
  const head = t === 'condition' ? { i: a.value } : (rv !== null ? { i: t, v: rv } : { i: t });
  const parts = [head];
  let self = false, targeted = false;
  for (const s of subs) {
    if (!s || typeof s !== 'object') continue;
    if (s.type === 'range') parts.push({ i: 'range', v: s.value });
    else if (s.type === 'target') { targeted = true; parts.push(typeof s.value === 'number' ? { i: 'target', v: s.value } : `%target% ${s.value}`); }
    else if (s.type === 'condition') parts.push({ i: s.value });
    else if (s.type === 'element') parts.push({ i: s.value });
    else if (s.type === 'jump') parts.push({ i: 'jump' });
    else if (s.type === 'custom') { if (/self/i.test(s.text || '') && !/%target%/.test(s.text || '')) self = true; else targeted = targeted || /%target%/.test(s.text || ''); parts.push(...words(s.text)); }
    else if (s.type === 'self') self = true;
    else if (s.type) parts.push(val(s) !== null ? { i: s.type, v: val(s) } : { i: s.type });
  }
  if (suffix && !self && !targeted && !a.relative) {
    if (TO_X.has(t)) parts.push('to X');
    else if (ON_X.has(t)) parts.push('on X');
  }
  if (self) parts.push('self');
  return parts;
}

// the parts of a list of actions, joined into one run (used inside a dashed pill and for groups)
function flat(list, suffix) {
  const out = [];
  for (const a of list) {
    const p = a && a.type === 'optional' ? optional(a) : action(a, suffix);
    if (p) out.push(...p);
  }
  return out;
}

function effect(e) {
  if (!e || typeof e !== 'object') return [];
  const v = val(e);
  if (e.type === 'condition' || e.type === 'element') return [{ i: e.value }];
  if (e.type === 'custom') return e.text ? [e.text] : [];
  if (v === null) return [{ i: e.type }];
  return e.relative ? [{ i: e.type }, rel(v)] : [{ i: e.type, v }];
}

function cost(c) {
  if (!c) return [];
  if (c.resolve !== undefined) return [`-${c.resolve}`, { i: 'resolve' }, ':'];
  if (c.consume) return [...(c.consume.elements || []).map(e => ({ i: `${e}_x` })), ':'];
  return [];
}

function one(o) {
  const body = [...flat(o.actions || [], false)];
  const eff = (o.effects || []).map(effect).filter(p => p.length);
  eff.forEach((p, k) => { if (body.length || k > 0) body.push(','); body.push(...p); });
  return ['(', ...cost(o.cost), ...body, ')'];
}

function optional(a) {
  if (Array.isArray(a.options) && a.options.length) return a.options.flatMap(o => one(o));
  return one(a);
}

// A Blinkblade mode box (the card code writes it "%blinkblade-1% +1 %attack%, %wound%, %xp1%": fast is %blinkblade-1%, slow %blinkblade-0%) is a line with
// a mode: { p: parts as printed, m: 'fast' | 'slow' }. When its items are all short, the modifiers ("+2 %move%") are split off and linked to the action
// line they change, so that scripts/turnTemplate.js can write them into that line once the mode is known:
//   mods: [{ i: 'move', d: 2, to: index of the action line }]   rest: parts of the other items (they go to the line of the first modifier, or stand alone)
const BOX = /^%blinkblade-([01])%\s+([\s\S]+)$/;
const SHORT = /^(%[\w-]+%(\s+(\d+|X))?|[+-]\d+ %\w+%|self|all|advantage)$/;
const MOD = /^([+-])(\d+) %(attack|move|range|target|heal)%$/;
function boxLine(m) {
  const body = m[2].trim();
  const line = words(body);
  line.box = { m: m[1] === '1' ? 'fast' : 'slow' };
  const items = body.split(/,\s*/);
  if (items.every(s => SHORT.test(s))) {
    const mods = items.map(s => s.match(MOD)).filter(Boolean).map(x => ({ i: x[3], d: (x[1] === '-' ? -1 : 1) * Number(x[2]) }));
    if (mods.length) { line.box.mods = mods; line.box.items = items; }
  }
  return line;
}
// link the modifiers of the box lines to the nearest action line (not a box) with a printed value of that icon; what is not linked is written as text
function linkBoxes(lines) {
  lines.forEach((l, k) => {
    const b = l.box;
    if (!b || !b.mods) return;
    const linked = [], restItems = [];
    for (const item of b.items) {
      const mm = item.match(MOD);
      const mod = mm && b.mods.find(x => !x.used && x.i === mm[3] && x.d === (mm[1] === '-' ? -1 : 1) * Number(mm[2]));
      let to = -1, best = Infinity;
      if (mod) {
        mod.used = true;
        lines.forEach((c, j) => {
          if (c.box || !c.some(x => x && typeof x === 'object' && x.i === mod.i && typeof x.v === 'number')) return;
          const dist = Math.abs(j - k) + (j > k ? 0.5 : 0);                         // a tie goes to the line before the box
          if (dist < best) { best = dist; to = j; }
        });
      }
      if (mod && to >= 0) linked.push({ i: mod.i, d: mod.d, to }); else restItems.push(item);
    }
    const rest = [];
    restItems.forEach((item, n) => { if (n) rest.push(','); rest.push(...words(item)); });
    if (linked.length) { b.mods = linked; if (rest.length) b.rest = rest; } else { delete b.mods; }
    delete b.items;
  });
}

// the enhancement dots printed on an action (and its parts): where a sticker of the card can sit
function dots(a) {
  if (!a || typeof a !== 'object') return 0;
  let n = Array.isArray(a.enhancement) ? a.enhancement.filter(e => e && e !== 0 && e !== 'none').length : 0;
  for (const k of ['subActions', 'actions', 'options', 'effects']) if (Array.isArray(a[k])) n += a[k].reduce((t, x) => t + dots(x), 0);
  return n;
}

// the lines of one half: an optional pill joins the last action line (not a mandatory banner), unless it stands alone (noLine) or comes first.
// A line with enhancement dots is written { p: parts, e: number of dots }: a sticker on the card goes to such a line.
function half(h) {
  const lines = [];
  let main = null, alone = null;
  // an augment half: the ribbon, then the text of the band (the standing effect) before the first action; the band is labelled
  let band = ((h && h.actions) || []).some(a => a && a.type === 'custom' && AUGMENT.test((a.text || '').trim())), labelled = false, takeNext = null;
  const visit = list => {
    for (const a of list || []) {
      if (band && a && a.type === 'custom' && !AUGMENT.test((a.text || '').trim())) {
        const p = action(a, true);
        if (p && p.length) { if (!labelled) { p.unshift('[b]Augment:[/b]'); labelled = true; } p.e = 0; lines.push(p); takeNext = /:\s*$/.test(a.text || '') ? p : null; }
        continue;
      }
      if (band && a && a.type !== 'custom') {
        band = false;
        if (takeNext) {                                                                   // "... perform:" / "... grant one of your summons:": the action that follows is part of the band
          const q = action(a, false);
          if (q && q.length) { takeNext.push(...q); takeNext = null; continue; }
          takeNext = null;
        }
      }
      const bm = a && a.type === 'custom' && BOX.exec(a.text || '');
      if (bm) { lines.push(boxLine(bm)); continue; }                                      // a Blinkblade mode box: a line of its own, with its mode
      if (a && (a.type === 'group' || a.type === 'inline') && Array.isArray(a.actions)) { visit(a.actions); continue; }     // a layout group: its actions are lines of their own
      if (a && a.type === 'optional') {
        const p = optional(a);
        if (!a.noLine && main) { main.push(...p); main.e = (main.e || 0) + dots(a); }
        else { lines.push(p); p.e = dots(a); }
        continue;
      }
      const p = action(a, true);
      if (!p || !p.length) continue;
      p.e = a.type === 'mandatory' ? 0 : dots(a);
      if (alone) { p.splice(1, 0, ...alone); alone = null; }                              // a range printed apart from its action (Trial and Success): it belongs to the next line
      else if (p.length === 1 && p[0] && p[0].i === 'range' && p[0].v !== undefined) { alone = p; continue; }
      lines.push(p);
      if (a.type !== 'mandatory') main = p;
    }
  };
  visit(h && h.actions);
  linkBoxes(lines);
  return lines.map(l => (l.box ? { p: [...l], ...l.box } : l.e ? { p: [...l], e: l.e } : [...l]));
}

// what happens to the card after this half: experience, persistent or round bonus, lost, removed (words; scripts/turnTemplate.js writes an icon where there is one)
function flags(h) {
  const f = [];
  if (h && h.xp) f.push(`xp${h.xp}`);
  if (h && h.duration === 'persistent') f.push('persistent');
  if (h && h.duration === 'round') f.push('round');
  if (h && h.lost) f.push('lost');
  if (h && h.remove) f.push('removed');
  return f;
}

function main() {
  const classes = process.argv.slice(2);
  if (!classes.length) classes.push('hl');
  const out = {};
  const { missing, failed } = eachCard(classes, ({ id, json: j }) => {
    out[id] = { t: half(j.top), b: half(j.bottom) };
    const tf = flags(j.top), bf = flags(j.bottom);
    if (tf.length) out[id].tf = tf;
    if (bf.length) out[id].bf = bf;
  });
  if (failed) process.exitCode = 1;
  const body = Object.entries(out).map(([id, v]) => `  ${id}: ${JSON.stringify(v)}`).join(',\n');
  const head = '// GENERATED by tools/build-turn-templates.mjs from card-code-current. Do not edit by hand.\n// The forum turn template of each ability card, by card id: t = top half, b = bottom half, each a list of lines (see the generator for the parts).\n\n';
  writeFileSync(OUT, `${head}export const TURN = {\n${body}\n};\n`);
  console.log(`${Object.keys(out).length} templates written${missing ? `, ${missing} cards without card code` : ''}`);
}

main();
