import assert from 'node:assert/strict';
import { buildFlow, laneOf, lanesOf, LANES } from '../../scripts/campaign/flow.js';
import { SCENARIOS } from '../../scripts/games/gh2_scenarios.js';

export const tests = {
  'every scenario has a lane in the lane list'() {
    for (const s of SCENARIOS) assert.ok(LANES.includes(laneOf(s)), `scenario ${s.n}: ${laneOf(s)}`);
  },
  'unlock links point to existing scenarios'() {
    const ns = new Set(SCENARIOS.map(s => s.n));
    for (const s of SCENARIOS) for (const u of s.unl || []) assert.ok(ns.has(u), `${s.n} -> ${u}`);
  },
  'the flow has one node per visible scenario and edges only between visible ones'() {
    const vis = new Set(SCENARIOS.slice(0, 30).map(s => s.n)), f = buildFlow(SCENARIOS, vis);
    assert.equal(f.nodes.length, 30);
    for (const e of f.edges) assert.ok(vis.has(e.from) && vis.has(e.to));
  },
  'storylines: one or two lanes, first colour first, "Into" ignored'() {
    assert.deepEqual(lanesOf({ area: 'Guards/Hail' }), ['Guards', 'Hail']);
    assert.deepEqual(lanesOf({ area: 'Into/Hail' }), ['Hail']);
    assert.deepEqual(lanesOf({ area: 'Nowhere' }), ['Other']);
    assert.deepEqual(lanesOf({}), ['Other']);
  },
  'a two-storyline scenario is drawn in one of its two lanes, the one with most of its linked scenarios'() {
    const mk = (n, area, unl) => ({ n, name: 'x' + n, area, unl });
    const S = [mk(1, 'Guards', [3]), mk(2, 'Hail', [3]), mk(4, 'Hail', [3]), mk(3, 'Guards/Hail', [])];
    const f = buildFlow(S, new Set([1, 2, 3, 4]));
    assert.equal(f.nodes.find(n => n.n === 3).lane, 'Hail');
    assert.deepEqual(f.nodes.find(n => n.n === 3).lanes, ['Guards', 'Hail']);
    const tie = buildFlow([mk(1, 'Guards', [3]), mk(2, 'Hail', [3]), mk(3, 'Guards/Hail', [])], new Set([1, 2, 3]));
    assert.equal(tie.nodes.find(n => n.n === 3).lane, 'Guards');
  },
  'every scenario with two storylines has a lane of its own storylines'() {
    const f = buildFlow(SCENARIOS, new Set(SCENARIOS.map(s => s.n)));
    for (const n of f.nodes) assert.ok(n.lanes.includes(n.lane), `${n.n}: ${n.lane} not in ${n.lanes}`);
  },
  'forced links are marked on the edges, 13 in the full chart'() {
    const f = buildFlow(SCENARIOS, new Set(SCENARIOS.map(s => s.n))), forced = f.edges.filter(e => e.forced).map(e => `${e.from}>${e.to}`).sort();
    assert.equal(forced.length, 13);
    for (const k of ['7>8', '23>25', '24>25', '25>27', '26>23', '33>34', '42>43', '46>51', '47>49', '48>50', '54>55', '55>56', '59>60']) assert.ok(forced.includes(k), k);
  },
};
