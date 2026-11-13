// Edit history: describes what changed between two campaign records, as log entries { tab, kind, d }. Pure functions,
// no DOM and no storage. The app stamps each entry with the time and the user (campaign/app.js commit) and keeps them in
// record.log. The record's fields map to the page (tab) where they are edited. Scenario and item names are left out:
// locked ones are hidden from the players, so the log uses numbers only.
import { SCN_STATE_NAME, availableSet, zoneOf } from './record.js';
import { CARDS } from '../games/gh2_cards.js';
import { tokenDefs } from './classTokens.js';
import { BATTLE_GOALS } from '../games/battle_goals.js';
import { GH2_PQ } from '../games/gh2_pq_text.js';
import { ALL_CLASSES } from './classList.js';

export const LOG_TABS = ['Overview', 'Scenarios', 'Mercenaries', 'Items', 'Events', 'Cards', 'Resources'];
export const LOG_MAX = 1000;                       // entries kept in the record

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fmt = v => (v === undefined || v === null || v === '' ? '-' : typeof v === 'object' ? JSON.stringify(v) : String(v));
const diffList = (a = [], b = []) => ({ add: b.filter(x => !a.some(y => same(x, y))), del: a.filter(x => !b.some(y => same(x, y))) });
const plusMinus = ({ add, del }) => [add.length ? `+${add.join(', +')}` : '', del.length ? `-${del.join(', -')}` : ''].filter(Boolean).join(' ');
const CARD = new Map(CARDS.map(c => [c.id, c]));
const ZONE_NAME = { hand: 'hand', active: 'active area', play1: 'play slot 1', play2: 'play slot 2', discard: 'discard pile', lost: 'lost pile' };
const cardLabel = id => {
  const k = CARD.get(id);
  if (!k) return `#${id}`;
  const name = k.slug.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  const more = [k.lv != null ? `level ${k.lv}` : '', k.ini != null ? `initiative ${k.ini}` : ''].filter(Boolean).join(', ');
  return more ? `${name} (${more})` : name;
};
// Card moves between zones and flips of a played card of one character; [] when nothing of that kind changed.
function describeCards(o, c) {
  const lines = [];
  const ids = [...new Set([...(o.deck || []), ...(c.deck || [])])];
  for (const id of ids) {
    if (!(o.deck || []).includes(id) || !(c.deck || []).includes(id)) continue;          // deck changes are the generic array diff
    const from = zoneOf(o, id), to = zoneOf(c, id);
    if (from !== to) lines.push(`${cardLabel(id)}: ${ZONE_NAME[from]} to ${ZONE_NAME[to]}`);
    else if (to === 'play1' || to === 'play2') {
      const i = to === 'play1' ? 0 : 1;
      if (!!o.play?.[i]?.up !== !!c.play?.[i]?.up) lines.push(`${cardLabel(id)}: turned face ${c.play[i].up ? 'up' : 'down'}`);
    }
  }
  return lines;
}
const keys = (a = {}, b = {}) => [...new Set([...Object.keys(a), ...Object.keys(b)])];

const PARTY = { diff: 'Difficulty', insp: 'Inspiration', avg: 'Average level', diffName: 'Difficulty name' };
const FACTION = { demons: 'Demons', merchants: 'Merchants', guard: 'City Guard' };
const SCN_FIELD = { l: 'level', p: 'party size', ch: 'chests', d: 'date' };
const CHAR_FIELD = { lv: 'level', xp: 'XP', cls: 'class', name: 'name' };
const HANDLED = new Set(['ver', 'log', 'v', 'evlog', 'name', 'players', 'party', 'rep', 'pros', 'imb', 'don', 'stk', 'cls', 'avail',
  'scn', 'chars', 'items', 'events', 'decks', 'enh', 'retired', 'resLinks', 'bgs', 'pq']);

export function describeChange(a, b) {
  const out = [];
  const add = (tab, kind, d) => out.push({ tab, kind, d });

  if (a.name !== b.name) add('Overview', 'Campaign name', `${fmt(a.name)} to ${fmt(b.name)}`);

  for (const k of keys(a.party, b.party)) {
    if (!same(a.party?.[k], b.party?.[k])) add('Overview', 'Party', `${PARTY[k] || k} ${fmt(a.party?.[k])} to ${fmt(b.party?.[k])}`);
  }
  for (const k of keys(a.rep, b.rep)) {
    if (a.rep?.[k] !== b.rep?.[k]) add('Overview', 'Reputation', `${FACTION[k] || k} ${fmt(a.rep?.[k])} to ${fmt(b.rep?.[k])}`);
  }
  if (a.pros !== b.pros) add('Overview', 'Prosperity', `Checkmarks ${fmt(a.pros)} to ${fmt(b.pros)}`);
  if (a.imb !== b.imb) add('Overview', 'Imbuement', `Boxes ${fmt(a.imb)} to ${fmt(b.imb)}`);
  if (a.don !== b.don) add('Overview', 'Great Oak sanctuary', `Gold donated ${fmt(a.don)} to ${fmt(b.don)}`);

  const stk = diffList(a.stk, b.stk);
  stk.add.forEach(n => add('Overview', 'Campaign sticker', `Added ${n}`));
  stk.del.forEach(n => add('Overview', 'Campaign sticker', `Removed ${n}`));

  const cls = diffList(a.cls, b.cls);
  cls.add.forEach(n => add('Overview', 'Class unlock', `Unlocked ${n}`));
  cls.del.forEach(n => add('Overview', 'Class unlock', `Locked ${n}`));
  if (!same(a.avail, b.avail)) {
    const was = availableSet(a), now = availableSet(b);
    const names = ALL_CLASSES.map(c => c.name);
    const on = names.filter(n => now.has(n.toLowerCase()) && !was.has(n.toLowerCase())), off = names.filter(n => was.has(n.toLowerCase()) && !now.has(n.toLowerCase()));
    const d = [on.length ? `Made available: ${on.join(', ')}` : '', off.length ? `Made unavailable: ${off.join(', ')}` : ''].filter(Boolean).join('; ');
    if (d) add('Overview', 'Class availability', d);
  }

  const pa = new Map((a.players || []).map(p => [p.seat, p.name])), pb = new Map((b.players || []).map(p => [p.seat, p.name]));
  for (const [seat, name] of pb) {
    if (!pa.has(seat)) add('Overview', 'Player', `Added ${name} (seat ${seat + 1})`);
    else if (pa.get(seat) !== name) add('Overview', 'Player', `Renamed ${pa.get(seat)} to ${name}`);
  }
  for (const [seat, name] of pa) if (!pb.has(seat)) add('Overview', 'Player', `Removed ${name} (seat ${seat + 1})`);

  const ra = a.retired || [], rb = b.retired || [], who = x => [x.cls, x.name].filter(Boolean).join(' ') || 'character';
  if (ra.length !== rb.length) {                  // an entry added or removed: compare as sets, so a removal in the middle is not a row of edits
    const d = diffList(ra, rb);
    d.add.forEach(x => add('Overview', 'Retired character', `Added ${who(x)}`));
    d.del.forEach(x => add('Overview', 'Retired character', `Removed ${who(x)}`));
  } else {
    ra.forEach((x, i) => {
      for (const k of keys(x, rb[i])) if (!same(x[k], rb[i][k])) add('Overview', 'Retired character', `${who(rb[i])}: ${k === 'cls' ? 'class' : k} ${fmt(x[k])} to ${fmt(rb[i][k])}`);
    });
  }
  if (!same(a.enh, b.enh)) {
    const ea = a.enh || [], eb = b.enh || [];
    const what = e => `${e.cls}, ${e.card}${e.top || e.bottom ? ` (${[e.top && `top ${e.top}`, e.bottom && `bottom ${e.bottom}`].filter(Boolean).join(', ')})` : ''}`;
    const nop = e => ({ ...e, price: undefined });
    if (ea.length === eb.length && ea.every((e, i) => same(nop(e), nop(eb[i])))) {                       // only prices changed
      ea.forEach((e, i) => { if (e.price !== eb[i].price) add('Mercenaries', 'Enhancement', `${what(e)}: price ${fmt(e.price)} to ${fmt(eb[i].price)}`); });
    } else {
      const d = diffList(ea.map(e => JSON.stringify(e)), eb.map(e => JSON.stringify(e)));
      d.add.forEach(j => { const e = JSON.parse(j); add('Mercenaries', 'Enhancement', `Added ${what(e)}${e.price != null ? `, ${e.price} gold` : ''}`); });
      d.del.forEach(j => { const e = JSON.parse(j); add('Mercenaries', 'Enhancement', `Removed ${what(e)}${e.price != null ? `, ${e.price} gold` : ''}`); });
    }
  }

  for (const n of keys(a.scn, b.scn).sort((x, y) => x - y)) {
    const x = a.scn?.[n] || {}, y = b.scn?.[n] || {};
    if ((x.s || 0) !== (y.s || 0)) add('Scenarios', 'Scenario state', `Scenario ${n}: ${SCN_STATE_NAME[x.s || 0]} to ${SCN_STATE_NAME[y.s || 0]}`);
    for (const f of keys(x, y)) {
      if (f !== 's' && !same(x[f], y[f])) add('Scenarios', 'Scenario result', `Scenario ${n}: ${SCN_FIELD[f] || f} ${fmt(x[f])} to ${fmt(y[f])}`);
    }
  }

  // battle goals and personal quests: who holds which
  const holder = (x, ch) => (!x ? 'in the deck' : x.c == null ? 'held by another player' : `${x.st === 'done' ? 'completed by' : 'held by'} ${(ch.find(k => k.id === x.c) || {}).name || x.c}`);
  const cap = t => String(t).replace(/-/g, ' ').replace(/^./, m => m.toUpperCase());
  for (const [key, label, title] of [['bgs', 'Battle goal', sl => cap(sl)], ['pq', 'Personal quest', sl => `${sl.slice(2)} ${GH2_PQ[sl]?.name || ''}`.trim()]]) {
    for (const sl of keys(a[key], b[key])) {
      const x = a[key]?.[sl], y = b[key]?.[sl];
      if (!same(x, y)) add('Mercenaries', label, `${title(sl)}: ${holder(x, a.chars || [])} to ${holder(y, b.chars || [])}`);
    }
  }
  const ca = new Map((a.chars || []).map(c => [c.id, c])), cb = new Map((b.chars || []).map(c => [c.id, c]));
  for (const [id, c] of cb) {
    const o = ca.get(id);
    if (!o) { add('Mercenaries', 'Character', `Added ${c.name} (${c.cls})`); continue; }
    const cardLines = describeCards(o, c);
    cardLines.forEach(d => add('Mercenaries', 'Card', `${c.name}: ${d}`));
    if (!cardLines.length && !same(o.hord, c.hord)) add('Mercenaries', 'Card', `${c.name}: ${c.hord === null ? 'hand sorted by initiative (automatic)' : 'hand order changed'}`);
    for (const k of keys(o, c)) {
      if (same(o[k], c[k])) continue;
      if (['disc', 'act', 'lost', 'play', 'hord'].includes(k)) continue;                  // described above
      if (k === 'notes') { add('Mercenaries', 'Notes', `${c.name}: notes ${c.notes ? 'edited' : 'cleared'}`); continue; }
      if (k === 'bgo' || k === 'pqo') {
        if (c[k]) add('Mercenaries', k === 'bgo' ? 'Battle goal' : 'Personal quest', `${c.name}: drew ${c[k].map(sl => (k === 'bgo' ? cap(sl) : `${sl.slice(2)} ${GH2_PQ[sl]?.name || ''}`.trim())).join(', ')}`);
        continue;
      }
      if (k === 'pqc') {
        for (const sl of keys(o.pqc, c.pqc)) {
          const q = GH2_PQ[sl], x = o.pqc?.[sl] || [], y = c.pqc?.[sl] || [];
          (q?.reqs || []).forEach((rq, i) => { if ((x[i] || 0) !== (y[i] || 0)) add('Mercenaries', 'Personal quest', `${c.name}: quest ${sl.slice(2)} ${q.name}, ${rq.t}: ${x[i] || 0} to ${y[i] || 0}${rq.n > 1 ? ` of ${rq.n}` : ''}`); });
        }
        continue;
      }
      if (k === 'tok') {
        for (const t of tokenDefs(c.cls)) {
          const a = o.tok?.[t.k] || 0, b = c.tok?.[t.k] || 0, show = v => (t.states ? t.states[v] ?? v : v);
          if (a !== b) add('Mercenaries', 'Class token', `${c.name}: ${t.l} ${show(a)} to ${show(b)}`);
        }
        continue;
      }
      if (k === 'seat') add('Mercenaries', 'Character player', `${c.name}: ${(b.players || []).find(p => p.seat === c.seat)?.name ?? 'nobody'} (was ${(a.players || []).find(p => p.seat === o.seat)?.name ?? 'nobody'})`);
      else if (k === 'am') add('Cards', 'Modifier deck', `${c.name}: modifier deck changed`);
      else if (k === 'items') {
        const ids = diffList((o.items || []).map(i => `#${i.id}`), (c.items || []).map(i => `#${i.id}`));
        add('Mercenaries', 'Character items', `${c.name}: ${plusMinus(ids) || 'item ticks changed'}`);
      } else if (Array.isArray(o[k]) || Array.isArray(c[k])) {
        add('Mercenaries', 'Character', `${c.name}: ${CHAR_FIELD[k] || k} ${plusMinus(diffList(o[k], c[k])) || 'reordered'}`);
      } else add('Mercenaries', 'Character', `${c.name}: ${CHAR_FIELD[k] || k} ${fmt(o[k])} to ${fmt(c[k])}`);
    }
  }
  for (const [id, c] of ca) if (!cb.has(id)) add('Mercenaries', 'Character', `Removed ${c.name} (${c.cls})`);

  const ua = a.items?.unl || [], ub = b.items?.unl || [];
  diffList(ua, ub).add.forEach(i => add('Items', 'Item unlock', `Unlocked item #${i}`));
  diffList(ua, ub).del.forEach(i => add('Items', 'Item unlock', `Locked item #${i}`));
  for (const i of keys(a.items?.taken, b.items?.taken)) {
    if ((a.items?.taken?.[i] || 0) !== (b.items?.taken?.[i] || 0)) add('Items', 'Item copies', `Item #${i}: copies in use ${a.items?.taken?.[i] || 0} to ${b.items?.taken?.[i] || 0}`);
  }

  describeEvents(a.events || {}, b.events || {}, b, add);

  const deckTab = { bg: ['Cards', 'Battle goal'], tre: ['Resources', 'Treasure'], mp: ['Cards', 'Medical pack'] };
  for (const k of Object.keys(deckTab)) {
    const d = diffList(a.decks?.[k], b.decks?.[k]);
    const [tab, kind] = deckTab[k];
    if (d.add.length || d.del.length) add(tab, kind, `${k === 'tre' ? 'Claimed' : 'Drawn'} ${plusMinus(d)}`);
  }
  for (const k of keys(a.resLinks, b.resLinks)) {
    if (a.resLinks?.[k] !== b.resLinks?.[k]) add('Resources', 'Link', `${k.replace('|', ' / ')} ${b.resLinks?.[k] ? 'set' : 'cleared'}`);
  }
  for (const k of keys(a, b)) if (!HANDLED.has(k) && !same(a[k], b[k])) add('Overview', 'Other', `${k} changed`);
  return out;
}

const KIND = { city: 'city', road: 'road' };
function describeEvents(a, b, rec, add) {
  const seatName = s => (rec.players || []).find(p => p.seat === Number(s))?.name || `seat ${Number(s) + 1}`;
  for (const kind of Object.keys(KIND)) {
    for (const pile of keys(a[kind], b[kind])) {
      const d = diffList(a[kind]?.[pile], b[kind]?.[pile]);
      if (d.add.length || d.del.length) add('Events', 'Event pile', `${kind} ${pile}: ${plusMinus(d)}`);
    }
    const pa = a.pend?.[kind], pb = b.pend?.[kind];
    if (!pa && pb) add('Events', 'Event', `Opened ${kind} event ${pb.id}`);
    else if (pa && !pb) add('Events', 'Event', `Closed ${kind} event ${pa.id}`);
    else if (pa && pb) {
      for (const s of keys(pa.votes, pb.votes)) {
        if (pa.votes?.[s] !== pb.votes?.[s]) add('Events', 'Vote', `${kind} event ${pb.id}: ${seatName(s)} ${pb.votes?.[s] ? `voted ${pb.votes[s]}` : 'cleared the vote'}`);
      }
      if (!pa.closed && pb.closed) add('Events', 'Vote', `${kind} event ${pb.id}: voting closed`);
      if (!same(pa.rnd, pb.rnd) && pb.rnd !== undefined) add('Events', 'Vote', `${kind} event ${pb.id}: tie rolled`);
    }
  }
  for (const k of keys(a.marks, b.marks)) if (!same(a.marks?.[k], b.marks?.[k])) add('Events', 'Event box', `${k}: ticked boxes ${fmt(a.marks?.[k] || [])} to ${fmt(b.marks?.[k] || [])}`);
  for (const k of keys(a.notes, b.notes)) if (a.notes?.[k] !== b.notes?.[k]) add('Events', 'Event note', `${k}: note ${b.notes?.[k] ? 'edited' : 'removed'}`);
}
