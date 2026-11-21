import assert from 'node:assert/strict';
import { fixture, answerOf, expectedOf, same } from './gloomRunner.mjs';

// The test scenarios of https://github.com/AluminumAngel/gloom (MIT), converted by tools/convert-gloom-scenarios.py. The Gloomhaven rule set is the
// one scripts/monsterMove.js follows; every scenario is run (`supported`: none is left out).
const ours = fixture.scenarios.filter(r => r.rules === 'gloomhaven');

export const tests = {
  'gloom scenarios: the fixture holds 182 scenarios, 182 of them supported for Gloomhaven'() {
    assert.equal(ours.length, 182);
    assert.equal(ours.filter(r => r.supported).length, 182);
    assert.equal(ours.filter(r => r.supported && r.aoe.length).length, 26, 'with an area attack');
    assert.equal(ours.filter(r => r.supported && Object.values(r.contents).includes('I')).length, 19, 'with icy hexes');
    assert.equal(ours.filter(r => r.supported && r.thin.length).length, 33, 'with thin walls');
    assert.equal(ours.filter(r => r.supported && r.target > 1).length, 35, 'with several targets');
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
  'gloom scenarios: with the any point line of sight (the rule of the app) the 154 scenarios on which the Gloomhaven and Frosthaven answers of gloom agree still match'() {
    const frost = new Map(fixture.scenarios.filter(r => r.rules === 'frosthaven').map(r => [r.n, r]));
    const failed = []; let agree = 0, differ = 0, matchFrost = 0, matchGloom = 0, inFrostSet = 0;
    for (const rec of ours) {
      const f = frost.get(rec.n), mine = answerOf(rec, { los: 'full' });
      if (same(expectedOf(rec), expectedOf(f))) { agree++; if (!same(mine, expectedOf(rec))) failed.push(`#${rec.n}`); continue; }
      differ++;
      if (same(mine, expectedOf(f))) matchFrost++;
      else if (same(mine, expectedOf(rec))) matchGloom++;
      else if (mine.every(a => expectedOf(f).some(b => same(a, b)))) inFrostSet++;                  // #131: one of the tied groups of the Frosthaven answer, the Gloomhaven ranking picks it
      else failed.push(`#${rec.n} differs`);
    }
    assert.deepEqual(failed, []);
    assert.deepEqual([agree, differ, matchFrost, matchGloom, inFrostSet], [154, 28, 4, 23, 1]);
  },
};
