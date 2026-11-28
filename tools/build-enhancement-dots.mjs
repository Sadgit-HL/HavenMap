// Builds scripts/games/card_enhancement_dots.js: for every enhancement dot of every ability card (the dots of scripts/games/card_enhancement_slots.js, confirmed by
// the owner) what it enhances, from the card code. The cost rules (scripts/campaign/enhancementRules.js) need this.
//
// Usage: node tools/build-enhancement-dots.mjs [class code ...]        (default: all classes)
//
// Output per card id: a list in the order of the dots of the slot file, { i, w, g, m, l, ... }
//   i  index of the dot in ENHANCE_SLOTS[id]
//   w  what it enhances: attack, move, heal, range, target, push, pull, pierce, shield, retaliate, teleport, a condition name (poison, wound ...),
//      summon_health, summon_move, summon_attack, summon_range, area_hex, custom (the card code has no name for it), null (no dot in the card code fits)
//   g  the ability (line) it belongs to (t0, t1 ... on the top half, b0 ... on the bottom half). An action is a half of the card: the stickers already on the half raise the price (+75 each),
//      counted by the half of the dot, not by g
//   m  1 when the ability targets multiple figures or tiles (doubles the price), 0 otherwise
//   l  1 when the action has a lost icon and is not a summon action (halves the price)
//   n  area_hex only: the number of hexes of the area (t and x cells of the pattern)
//   x  w is 'none': the marker is not an enhancement dot (a stray marker)
//   u  1 when something is a guess or missing: the multiple targets come from card text, an area has cells other than t, s, x, e, the dot is custom or without a card code match.
//      These cards are listed in tools/enhancement-dots-report.txt for the owner to confirm (import/enhancement-dot-overrides.json, see the generator's override step).
// Card code (card-code-current) and slots are matched in order within a half of the card: the k-th dot of a shape in the card code is the k-th dot of that shape in the picture.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, eachCard } from './lib/cardcode.mjs';
import { ENHANCE_SLOTS } from '../scripts/games/card_enhancement_slots.js';

const OUT = join(ROOT, 'scripts', 'games', 'card_enhancement_dots.js');
const REPORT = join(ROOT, 'tools', 'enhancement-dots-report.txt');
const REVIEW = join(ROOT, 'tools', 'review', 'dots-data.json');                 // what tools/review/dots.html shows: the cards with a dot to decide or check
const OVERRIDES = join(ROOT, 'import', 'enhancement-dot-overrides.json');       // { card id: { dot index: { w?, m?, l?, g?, n? } } } decided by the owner
const ABILITY = new Set(['attack', 'move', 'heal', 'shield', 'retaliate', 'teleport', 'summon', 'pull', 'push', 'pierce', 'condition', 'jump', 'loot', 'fly']);
const CONDITIONS = new Set(['poison', 'wound', 'muddle', 'immobilize', 'stun', 'disarm', 'curse', 'bane', 'brittle', 'plague', 'impair', 'bless', 'strengthen', 'regenerate', 'ward', 'safeguard', 'invisible']);
const RECHECK_CLASSES = new Set(['Deathwalker']);                                   // classes whose every dot is shown again on the review page, besides every condition dot
const SUMMON_STATS = ['health', 'move', 'attack', 'range'];
const ALL_TEXT_MULTI = /\b(all|each|every)\b[^.]*\b(allies|ally|enemies|enemy|figures|figure|adjacent|summons)\b|\bany number\b|\bup to\b/i;

const shapeOf = s => (s === 'plus' ? 'diamondPlus' : s);
const hexCount = pattern => ({ n: [...String(pattern)].filter(c => c === 't' || c === 'x').length, odd: /[ab]/.test(String(pattern)) });

// Multiple targets of an ability node: certain (a multiTarget key, a target value above 1, an area) or guessed from card text.
function multiOf(node, grantMulti) {
  let certain = !!grantMulti, text = false;
  (function walk(a) {
    if (Array.isArray(a)) return a.forEach(walk);
    if (!a || typeof a !== 'object') return;
    if (a.multiTarget) certain = true;
    if (a.type === 'target' && (typeof a.value === 'number' ? a.value > 1 : /all|\d/.test(String(a.value)) && a.value !== 'self')) certain = true;
    if (a.type === 'area') certain = true;
    if (typeof a.text === 'string' && ALL_TEXT_MULTI.test(a.text)) text = true;
    for (const [k, v] of Object.entries(a)) if (v && typeof v === 'object' && k !== 'enhancement') walk(v);
  })(node);
  return { m: certain || text ? 1 : 0, u: !certain && text };
}

// The dots of one card in card code order: { half, shape, w, g, m, l, n?, u }
function cardDots(j) {
  const dots = [];
  for (const half of ['top', 'bottom']) {
    const H = j[half];
    if (!H) continue;
    const hk = half[0], lost = !!H.lost;
    let gN = 0;
    const walk = (a, ctx) => {
      if (Array.isArray(a)) return a.forEach(x => walk(x, ctx));
      if (!a || typeof a !== 'object') return;
      let c = ctx;
      if (ABILITY.has(a.type) && !ctx.g) {
        const mo = a.type === 'summon' ? { m: 0, u: false } : multiOf(a, ctx.grantMulti);      // a summon's own text ("attacks all adjacent enemies") is not a multiple-target ability
        c = { ...ctx, g: `${hk}${gN++}`, top: a.type, m: mo.m, um: mo.u, summon: a.type === 'summon' };
      } else if (a.type === 'grant') c = { ...ctx, grant: true, grantMulti: ctx.grantMulti || !!a.multiTarget };
      else if (!ABILITY.has(a.type) && ctx.g && ['group', 'inline', 'mandatory', 'optional'].includes(a.type)) c = { ...ctx, g: null };      // a container starts new actions
      const base = () => ({ half: hk, g: (c.g || `${hk}${gN++}`), m: c.m || 0, l: lost && !c.summon ? 1 : 0, u: c.um ? 1 : 0 });
      const e = a.enhancement;
      if (a.type === 'summon' && Array.isArray(e)) e.forEach((s, i) => { if (s && s !== 0) dots.push({ ...base(), shape: shapeOf(s), w: `summon_${SUMMON_STATS[i]}` }); });
      else if (e) for (const s of Array.isArray(e) ? e : [e]) {
        if (!s || s === 0) continue;
        let w = a.type === 'condition' ? String(a.value) : a.type;
        if (c.grant && (a.type === 'move' || a.type === 'attack')) w = `summon_${a.type}`;
        const custom = !['attack', 'move', 'heal', 'range', 'target', 'push', 'pull', 'pierce', 'shield', 'retaliate', 'teleport', 'condition', 'jump'].includes(a.type);
        dots.push({ ...base(), shape: shapeOf(s), w: custom ? 'custom' : w, ...(custom ? { u: 1 } : {}) });
      }
      if (a.type === 'area' && /x/.test(String(a.pattern ?? ''))) {
        const { n, odd } = hexCount(a.pattern);
        for (const ch of String(a.pattern)) if (ch === 'x') dots.push({ ...base(), shape: 'hex', w: 'area_hex', m: 0, n, ...(odd ? { u: 1 } : {}) });
      }
      for (const m of String(a.text ?? '').matchAll(/%enh(?:ancement)?-(square|circle|diamondPlus|diamond|plus)%/g)) dots.push({ ...base(), shape: shapeOf(m[1]), w: 'custom', u: 1 });
      for (const [k, v] of Object.entries(a)) if (v && typeof v === 'object' && k !== 'enhancement' && k !== 'stats') walk(v, c);
    };
    walk(H.actions || [], { g: null });
  }
  return dots;
}

// Match card code dots to the picture's dots, half by half: the k-th dot of a shape to the k-th slot of that shape; area dots (hex) take the slots left over in reading order.
function match(dots, slots) {
  const out = slots.map((s, i) => ({ i, w: null, g: null, m: 0, l: 0, u: 1 })), used = new Set(), left = [];
  for (const hk of ['t', 'b']) {
    const D = dots.filter(d => d.half === hk), S = slots.map((s, i) => ({ s, i })).filter(x => (x.s.h || (x.s.y < 0.5 ? 't' : 'b')) === hk);
    const seen = {};
    for (const d of D.filter(d => d.w !== 'area_hex')) {
      const k = seen[d.shape] = (seen[d.shape] ?? -1) + 1, cand = S.filter(x => x.s.k === d.shape && !used.has(x.i))[0];
      if (!cand) { left.push(d); continue; }
      used.add(cand.i); Object.assign(out[cand.i], dotInfo(d));
    }
    const rest = S.filter(x => !used.has(x.i));
    for (const d of D.filter(d => d.w === 'area_hex')) {
      const cand = rest.shift();
      if (!cand) { left.push(d); continue; }
      used.add(cand.i); Object.assign(out[cand.i], dotInfo(d));
    }
    // dots whose shape in the picture (confirmed by the owner) differs from the card code: paired in order, listed for a check
    const lostD = left.filter(d => d.half === hk && !used.has(d)), free = S.filter(x => !used.has(x.i));
    lostD.forEach((d, k) => {
      if (!free[k]) return;
      used.add(free[k].i); Object.assign(out[free[k].i], dotInfo(d), { u: 1, shape: d.shape });
      left.splice(left.indexOf(d), 1);
    });
  }
  return { out, left };
}
const dotInfo = d => ({ w: d.w, g: d.g, m: d.m, l: d.l, ...(d.n ? { n: d.n } : {}), u: d.u ? 1 : 0 });

const args = process.argv.slice(2);
const classes = [...readFileSync(join(ROOT, 'scripts', 'games', 'gh2_classes.js'), 'utf8').matchAll(/"code":"([^"]+)"/g)].map(m => m[1]);
const codes = args.length ? args : classes;
const manual = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : {};
const classInfo = Object.fromEntries([...readFileSync(join(ROOT, 'scripts', 'games', 'gh2_classes.js'), 'utf8').matchAll(/"i":(\d+),"code":"([^"]+)","name":"([^"]+)","src":"([^"]+)"/g)].map(m => [m[1], { code: m[2], name: m[3], src: m[4] }]));
const review = {};
const result = {}, report = [], stats = { cards: 0, dots: 0, uncertain: 0, noMatch: 0 };
eachCard(codes, ({ id, name, card, json }) => {
  const slots = ENHANCE_SLOTS[id] || [];
  if (!slots.length) return;
  stats.cards++;
  const codeDots = cardDots(json);
  const { out, left } = match(codeDots, slots);
  const raw = out.filter(d => d.u);                                              // before the owner's decisions: the review page shows these
  const ci = classInfo[card.cls];
  const recheck = out.map((d, i) => i).filter(i => RECHECK_CLASSES.has(ci.name) || CONDITIONS.has(out[i].w) || CONDITIONS.has(manual[id]?.[i]?.w));      // the owner's saved decisions count too
  if (raw.length || recheck.length) {
    const slug = card.slug.replace(/[‐-―]/g, '-');
    review[id] = { id, class: ci.name, name: json.name, lv: card.lv, pic: `images/character-abilities/${ci.src}/${ci.code.toLowerCase()}-${ci.src === 'fh' ? 'fh-' : ''}${slug}.webp`,
      lost: { t: !!json.top?.lost, b: !!json.bottom?.lost }, slots: slots.map(({ x, y, k, h }) => ({ x, y, k, h })), dots: out.map(({ shape, ...d }) => d),
      code: codeDots.map(({ half, shape, w, g, m, l, n }) => ({ half, shape, w, g, m, l, ...(n ? { n } : {}) })), todo: raw.map(d => d.i), recheck };
  }
  for (const [di, patch] of Object.entries(manual[id] || {})) if (out[di]) { Object.assign(out[di], patch, { u: 0 }); if (patch.w === 'none') out[di].x = 1; }
  stats.dots += out.length;
  const bad = out.filter(d => d.u), unmatched = out.filter(d => d.w === null);
  if (left.length) report.push(`NO SLOT     ${name} / ${card.slug} (id ${id}): card code has ${left.length} dot(s) the picture does not (${left.map(d => d.shape + ' ' + d.w).join(', ')})`);
  if (unmatched.length) { stats.noMatch += unmatched.length; report.push(`NO CODE     ${name} / ${card.slug} (id ${id}): dot(s) ${unmatched.map(d => d.i).join(', ')} not in the card code`); }
  for (const d of bad.filter(d => d.w !== null)) { stats.uncertain++; report.push(`CHECK       ${name} / ${card.slug} (id ${id}) dot ${d.i} ${d.w}${d.shape ? `, the card code says ${d.shape}, the picture ${slots[d.i].k}` : ''}${d.m ? ', multiple targets (guessed from card text)' : ''}`); }
  result[id] = out.map(({ shape, ...d }) => d);
});
const existing = {};
if (args.length && existsSync(OUT)) {                                              // a run for some classes keeps the other classes
  const src = readFileSync(OUT, 'utf8');
  for (const m of src.matchAll(/^\s*(\d+):\s*(\[.*\]),?\s*$/gm)) existing[m[1]] = JSON.parse(m[2]);
}
const merged = { ...existing, ...result };
const lines = Object.keys(merged).map(Number).sort((a, b) => a - b).map(id => `  ${id}: ${JSON.stringify(merged[id])},`);
writeFileSync(OUT, [
  '// GENERATED by tools/build-enhancement-dots.mjs from card-code-current and card_enhancement_slots.js. Do not edit by hand.',
  '// What each enhancement dot of an ability card enhances, by card id, in the order of the dots in card_enhancement_slots.js: i = index of the dot, w = what it enhances,',
  '// g = action, m = multiple targets, l = lost action, n = hexes of the area, u = guessed or missing (tools/enhancement-dots-report.txt).',
  '', 'export const ENHANCE_DOTS = {', ...lines, '};', ''].join('\n'));
writeFileSync(REVIEW, JSON.stringify(review));
writeFileSync(REPORT, `classes ${codes.length}, cards with dots ${stats.cards}, dots ${stats.dots}, unmatched ${stats.noMatch}, to check ${stats.uncertain}\n${report.join('\n')}${report.length ? '\n' : ''}`);
console.log(readFileSync(REPORT, 'utf8').split('\n').slice(0, 1).join(''));
