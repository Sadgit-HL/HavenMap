import assert from 'node:assert/strict';
import { fixture, answerOf, expectedOf, same } from './gloomRunner.mjs';

// The test scenarios of https://github.com/AluminumAngel/gloom (MIT), converted by tools/convert-gloom-scenarios.py. The Gloomhaven rule set is the
// one scripts/monsterMove.js follows; the scenarios with icy hexes are not run yet (`supported`).
const ours = fixture.scenarios.filter(r => r.rules === 'gloomhaven');

export const tests = {
  'gloom scenarios: the fixture holds 182 scenarios, 163 of them supported for Gloomhaven'() {
    assert.equal(ours.length, 182);
    assert.equal(ours.filter(r => r.supported).length, 163);
    assert.equal(ours.filter(r => r.supported && r.aoe.length).length, 26, 'with an area attack');
    assert.equal(ours.filter(r => r.supported && r.thin.length).length, 31, 'with thin walls');
    assert.equal(ours.filter(r => r.supported && r.target > 1).length, 33, 'with several targets');
    assert.ok(ours.every(r => r.answer && r.answer.length), 'every scenario has an answer');
  },
  'gloom scenarios: the solver gives the answer of gloom for every supported Gloomhaven scenario'() {
    const failed = [];
    for (const rec of ours.filter(r => r.supported)) {
      let got; try { got = answerOf(rec); } catch (e) { got = e.message; }
      if (!same(got, expectedOf(rec))) failed.push(`#${rec.n}: expected ${JSON.stringify(expectedOf(rec))}, got ${JSON.stringify(got)}`);
    }
    assert.deepEqual(failed, []);
  },
};
