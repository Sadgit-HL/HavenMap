import assert from 'node:assert/strict';
import { buildFlow, laneOf, LANES } from '../../scripts/campaign/flow.js';
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
};
