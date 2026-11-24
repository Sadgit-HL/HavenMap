import fs from 'node:fs';
// Resolves the icons of a trial transcription of character ability cards with an icon dictionary (tools/hail-icon-dictionary.json).
// Usage: node tools/normalise-icons.mjs [dictionary.json] [raw cards.json] [output.json]
//   defaults: tools/hail-icon-dictionary.json, tools/hail-ability-cards.raw.json, tools/hail-ability-cards.json
// Rows of type 'unknown' take the type of the dictionary entry their icon description matches; [description] in a text becomes %token%; unmatched or
// unresolved icons stay as [description] or [?description] and are reported. The side tabs move from the halves to the card.
// Dashed pills (tools/hail-ability-cards.dashed.json, found by looking at the images) are not abilities of their own: each is attached to the ability above it
// as `optional: [{ cost: { resolve: n }, text, effects?, border }]` and is carried out only if that ability is performed.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), [dictFile = path.join(here, 'hail-icon-dictionary.json'), rawFile = path.join(here, 'hail-ability-cards.raw.json'), outFile = path.join(here, 'hail-ability-cards.json'), dashedFile = path.join(here, 'hail-ability-cards.dashed.json')] = process.argv.slice(2);
const dict = JSON.parse(fs.readFileSync(dictFile, 'utf8')).entries.map(e => ({ ...e, re: e.match.map(m => new RegExp(m, 'i')) }));
const unresolvedFirst = [dict.find(e => e.id === 'unresolved'), ...dict.filter(e => e.id !== 'unresolved')];
const look = d => { const s = String(d ?? '').trim(); return unresolvedFirst.find(e => e.re.some(r => r.test(s))) ?? null; };
const cards = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
const stats = { mapped: {}, unresolved: {}, unmatched: {} };
const count = (bucket, k) => { stats[bucket][k] = (stats[bucket][k] || 0) + 1; };
const tokenOf = (desc) => {                                         // a [description] in a text: %token%, or kept in square brackets
  const m = /^(?:xp|experience)\s*(\d+)$/i.exec(desc.trim());
  if (m) { count('mapped', 'xp'); return '%xp% ' + m[1]; }
  const e = look(desc);
  if (!e) { count('unmatched', desc); return '[' + desc + ']'; }
  if (e.type === 'unresolved') { count('unresolved', desc); return '[?' + desc + ']'; }
  count('mapped', e.id);
  return e.token ? '%' + e.token + '%' : '';
};
const fixRow = r => {
  const out = { ...r };
  if (r.type === 'unknown') {
    const e = look(r.icon);
    if (!e) count('unmatched', r.icon);
    else if (e.type === 'unresolved') { count('unresolved', r.icon); out.type = 'unresolved'; }
    else if (e.type === 'marker') { return null; }
    else {
      count('mapped', e.id);
      out.type = e.type; if (e.value) out.value = e.value; out.icon = undefined; out.fromIcon = r.icon;
      if (e.type === 'condition' && r.value === null) delete out.value2;
    }
  }
  if (r.text) out.text = r.text.replace(/\[([^\]]+)\]/g, (_, d) => tokenOf(d)).replace(/\s{2,}/g, ' ').trim();
  if (r.subActions) out.subActions = r.subActions.map(fixRow).filter(Boolean);
  return out;
};
const fixTab = t => { const e = look(t.iconDescription ?? t.icon); count('mapped', 'tab:' + (e?.id ?? '?')); return { side: t.side, icon: e && e.type !== 'unresolved' ? e.type : t.icon, value: t.value }; };
const outCards = cards.map(c => ({
  ...c,
  top: { ...c.top, sideTabs: (c.top.sideTabs ?? []).map(fixTab), actions: c.top.actions.map(fixRow).filter(Boolean) },
  bottom: { ...c.bottom, sideTabs: (c.bottom.sideTabs ?? []).map(fixTab), actions: c.bottom.actions.map(fixRow).filter(Boolean) },
}));
for (const c of outCards) {                                          // the side tabs belong to the initiative band, not to a half: one list for the card
  const tabs = [...c.top.sideTabs, ...c.bottom.sideTabs], seen = new Map();
  for (const t of tabs) if (!seen.has(t.side)) seen.set(t.side, t);
  c.sideTabs = [...seen.values()]; delete c.top.sideTabs; delete c.bottom.sideTabs;
}
// ---- dashed pills: optional effects of the ability above ----
const dashed = fs.existsSync(dashedFile) ? JSON.parse(fs.readFileSync(dashedFile, 'utf8')) : [];
const tokenInfo = new Map(dict.filter(e => e.token).map(e => [e.token, e]));
const COST = /^-(\d+|X)\s*%resolve%\s*:\s*([\s\S]*)$/;
const plain = t => String(t).toLowerCase().replace(/%[a-z]+%|\[[^\]]*\]/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
// "+3 %attack%, %xp% 1", "%heal% 2 %range% 3, %safeguard%": a list of short items; null when the text is a sentence this cannot read
function parseEffects(text) {
  const out = [];
  for (const raw of text.replace(/\.$/, '').split(/,\s+/)) {
    const re = /\s*([+-]\d+)?\s*%(\w+)%(?:\s+(\d+))?/y, parts = [];
    let i = 0;
    while (i < raw.length) { re.lastIndex = i; const m = re.exec(raw); if (!m) return null; parts.push(m); i = re.lastIndex; }
    if (!parts.length) return null;
    const make = m => {
      const e = tokenInfo.get(m[2]);
      if (!e) return null;
      const o = { type: e.type };
      if (e.value) o.value = e.value;
      if (m[3] != null) o.value = Number(m[3]); else if (m[1]) o.value = Number(m[1]);
      if (m[1]) o.relative = true;
      return o;
    };
    const made = parts.map(make);
    if (made.some(x => !x)) return null;
    const [main, ...rest] = made;
    if (rest.length) main.subActions = rest;
    out.push(main);
  }
  return out.length ? out : null;
}
const NOT_AN_ABILITY = new Set(['xp', 'lost', 'persistent', 'recover', 'marker', 'unresolved']);
const attach = { optional: 0, orphan: 0, dashedHalvesWithout: [], solidHalves: [] };
for (const c of outCards) for (const half of ['top', 'bottom']) {
  const entries = (dashed.find(x => x.id === c.id)?.dashed ?? []).filter(e => e.half === half);
  const isOptional = r => r.type === 'custom' && !r.banner && (COST.test(r.text ?? '') || entries.some(e => !/^-/.test(e.firstWords) && plain(r.text ?? '').startsWith(plain(e.firstWords))));
  // the ability a pill belongs to: the one above it (a banner row, "! poison self", only when nothing else is above), else the first one below it
  const rows = c[half].actions, isPill = rows.map(isOptional), kept = [];
  let here = 0;
  rows.forEach((r, i) => {
    if (!isPill[i]) { kept.push(r); return; }
    const m = COST.exec(r.text), opt = { cost: m ? { resolve: m[1] === 'X' ? 'X' : Number(m[1]) } : null, text: m ? m[2] : r.text, border: entries.length ? 'dashed' : 'solid' };
    const eff = m ? parseEffects(m[2]) : null;
    if (eff) opt.effects = eff;
    const usable = k => !NOT_AN_ABILITY.has(k.type);
    let target = [...kept].reverse().find(k => !k.banner && usable(k)) ?? [...kept].reverse().find(k => k.banner && usable(k));
    if (!target) { target = rows.slice(i + 1).find((k, j) => !isPill[i + 1 + j] && usable(k)); if (target) opt.position = 'before'; }   // a pill at the top of a half: it belongs to what follows
    if (!target) { kept.push(r); attach.orphan++; return; }
    (target.optional ??= []).push(opt);
    attach.optional++; here++;
  });
  c[half].actions = kept;
  if (entries.length && !here) attach.dashedHalvesWithout.push(c.id + ' ' + half);
  if (!entries.length && here) attach.solidHalves.push(c.id + ' ' + half);
}
console.log('optional pills attached', attach.optional, '| not attached (nothing above)', attach.orphan, '| halves with a dashed box but none found:', attach.dashedHalvesWithout.join(', ') || 'none', '| halves with a pill but no dashed box:', attach.solidHalves.join(', ') || 'none');
const oddTabs = outCards.filter(c => !(c.sideTabs.length === 2 && c.sideTabs.some(t => t.side === 'left' && t.icon === 'attack' && t.value === 2) && c.sideTabs.some(t => t.side === 'right' && t.icon === 'move' && t.value === 2)));
console.log('cards whose tabs are not left attack 2 and right move 2:', oddTabs.map(c => c.id + ' ' + JSON.stringify(c.sideTabs)).join('; ') || 'none');
fs.writeFileSync(outFile, JSON.stringify(outCards, (k, v) => (v === undefined ? undefined : v), 1));
console.log('mapped', JSON.stringify(stats.mapped));
console.log('unresolved', JSON.stringify(stats.unresolved));
console.log('unmatched', JSON.stringify(stats.unmatched));
let rows = 0, unk = 0, unres = 0, brackets = 0, qm = 0;
const walk = l => { for (const r of l ?? []) { rows++; if (r.type === 'unknown') unk++; if (r.type === 'unresolved') unres++; brackets += (r.text?.match(/\[[^?\]][^\]]*\]/g) ?? []).length; qm += (r.text?.match(/\[\?/g) ?? []).length; walk(r.subActions); } };
for (const c of outCards) { walk(c.top.actions); walk(c.bottom.actions); }
console.log('rows', rows, 'unknown rows left', unk, 'unresolved rows', unres, 'unmapped [..] in text', brackets, 'unresolved [?..] in text', qm);
