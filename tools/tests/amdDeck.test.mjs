import assert from 'node:assert/strict';
import { AM_STANDARD, IMBUE, amOwner, deckOf, drawState, drawOdds, cleanAmd, amdAct, amdRollCode } from '../../scripts/campaign/amdDeck.js';
import { emptyRecord } from '../../scripts/campaign/record.js';
import { charAm } from '../../scripts/campaign/edit.js';
import { withChars } from './helpers.mjs';

const M = amOwner('m'), A = amOwner('a');
const total = (o, st = {}) => drawState(o, st).total;
const sum = o => Object.values(o).reduce((s, n) => s + n, 0);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);

export const tests = {
  'monster and ally decks start with the 20 standard cards'() {
    assert.equal(AM_STANDARD.reduce((s, t) => s + t.count, 0), 20);
    assert.equal(total(M), 20); assert.equal(total(A), 20);
  },
  'imbuement changes the monster deck by its table, level 2 includes level 1'() {
    assert.equal(total(amOwner('m', { imb: 1 })), 20 + sum(IMBUE[1]));
    assert.equal(total(amOwner('m', { imb: 2 })), 20 + sum(IMBUE[1]) + sum(IMBUE[2]));
    assert.equal(amOwner('a', { imb: 2 }).imb, 0);
    assert.equal(amOwner('m', { imb: 9 }).imb, 2);
  },
  'draw moves a card to the discard, ret takes it back'() {
    let st = amdAct(M, {}, 'draw', 'p1');
    assert.equal(drawState(M, st).disc, 1); assert.equal(drawState(M, st).total, 19);
    assert.equal(drawState(M, st).top.key, 'p1');
    st = amdAct(M, st, 'ret', 'p1');
    assert.equal(drawState(M, st).disc, 0); assert.equal(drawState(M, st).total, 20);
  },
  'the discard shows the latest draw on top'() {
    const st = amdAct(M, amdAct(M, {}, 'draw', 'p0'), 'draw', 'm1');
    assert.equal(drawState(M, st).top.key, 'm1');
  },
  'shuffle empties the discard and keeps bless and curse'() {
    let st = amdAct(M, amdAct(M, {}, 'add', 'bless'), 'draw', 'p0');
    st = amdAct(M, st, 'shuffle');
    assert.equal(drawState(M, st).disc, 0); assert.equal(st.bless, 1);
  },
  'bless and curse: added by hand, at most 10, leave the game when drawn'() {
    let st = {};
    for (let i = 0; i < 12; i++) st = amdAct(M, st, 'add', 'bless');
    assert.equal(st.bless, 10);
    st = amdAct(M, st, 'draw', 'bless');
    assert.equal(st.bless, 9);
    assert.equal(amdAct(M, {}, 'rem', 'curse').curse, 0);
    assert.equal(total(M, { bless: 3 }), 23);
  },
  'plus and minus edit the count of a card type; minus below zero is refused'() {
    let st = amdAct(M, {}, 'plus', 'p0');
    assert.equal(total(M, st), 21);
    st = amdAct(M, st, 'minus', 'p0');
    assert.equal(total(M, st), 20);
    let s2 = {};
    for (let i = 0; i < 6; i++) s2 = amdAct(M, s2, 'minus', 'p0');
    assert.equal(total(M, s2), 14);
    assert.deepEqual(amdAct(M, s2, 'minus', 'p0'), s2);
  },
  'move: pool to top to discard, order lists'() {
    let st = amdAct(M, {}, 'move', 'p2', { from: 'pool', to: 'top' });
    assert.deepEqual(st.top, ['p2']);
    assert.equal(drawState(M, st).pool, 19); assert.equal(drawState(M, st).total, 20);
    st = amdAct(M, st, 'move', 'p1', { from: 'pool', to: 'top' });
    assert.deepEqual(st.top, ['p1', 'p2']);                                     // top: new card goes to the front
    st = amdAct(M, st, 'move', 'p0', { from: 'pool', to: 'bot' });
    st = amdAct(M, st, 'move', 'p3', { from: 'pool', to: 'bot' });
    assert.deepEqual(st.bot, ['p0']);                                           // p3 is not in the deck: refused
    st = amdAct(M, st, 'move', 'p1', { from: 'top', to: 'disc' });
    assert.equal(drawState(M, st).disc, 1); assert.deepEqual(st.top, ['p2']);
  },
  'move refuses unknown places and cards that are not there'() {
    const st = {};
    assert.deepEqual(amdAct(M, st, 'move', 'p0', { from: 'nowhere', to: 'top' }), { disc: {} });
    assert.equal(amdAct(M, st, 'move', 'p0', { from: 'disc', to: 'top' }).top, undefined);
  },
  'odds of the standard deck'() {
    const o = drawOdds(drawState(M, {}));
    near(o.miss, 1 / 20); near(o.crit, 1 / 20); near(o.z, 6 / 20);
    near(o.le2, 2 / 20); near(o.le1, 7 / 20); near(o.ge1, 7 / 20); near(o.ge2, 2 / 20);
  },
  'odds follow the cards left, and an empty pool gives null'() {
    let st = {};
    for (const t of AM_STANDARD) for (let i = 0; i < t.count; i++) st = amdAct(M, st, 'draw', t.key);
    assert.equal(drawOdds(drawState(M, st)), null);
    st = amdAct(M, {}, 'draw', 'miss');
    near(drawOdds(drawState(M, st)).miss, 0);
  },
  'odds count bless as x2 and curse as a miss'() {
    const o = drawOdds(drawState(M, { bless: 1 }));
    near(o.crit, 2 / 21);
    const c = drawOdds(drawState(M, { curse: 1 }));
    near(c.miss, 2 / 21);
  },
  'cleanAmd keeps known fields and drops the rest'() {
    assert.equal(cleanAmd(null), null); assert.equal(cleanAmd([]), null); assert.equal(cleanAmd({}), null);
    assert.equal(cleanAmd({ disc: { p0: 0 } }), null);
    const c = cleanAmd({ disc: { p0: 2, 'bad key!': 3 }, order: ['p0', 'p0', 7], adj: { p1: 99 }, bless: 50, junk: 1, top: ['p2'] });
    assert.deepEqual(c.disc, { p0: 2 });
    assert.equal(c.adj.p1, 20); assert.equal(c.bless, 10); assert.deepEqual(c.top, ['p2']);
    assert.equal(c.junk, undefined);
  },
  'roll code lists the faces left'() {
    assert.equal(amdRollCode(['+0', '+1']), '1custom2{+0;+1}');
    assert.equal(amdRollCode([]), '');
  },
  'a hero deck: draw and put back, retall, the state is cleaned'() {
    const r = withChars(1), cid = r.chars[0].id, key = deckOf(r.chars[0])[0].key;
    let n = charAm(r, cid, 'draw', key);
    assert.deepEqual(n.chars[0].amd.disc, { [key]: 1 });
    n = charAm(charAm(n, cid, 'draw', key), cid, 'retall');
    assert.equal(n.chars[0].amd, undefined);
    assert.equal(charAm(r, 'nope', 'draw', key), r);
    assert.equal(charAm(r, cid, 'shuffle'), r);
  },
  'edits do not change the state they are given'() {
    const st = { disc: { p0: 1 }, order: ['p0'] }, snap = JSON.stringify(st);
    amdAct(M, st, 'draw', 'p1'); amdAct(M, st, 'ret', 'p0'); amdAct(M, st, 'move', 'p0', { from: 'disc', to: 'top' });
    assert.equal(JSON.stringify(st), snap);
    assert.ok(emptyRecord());
  },
};
