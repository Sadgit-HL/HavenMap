// Compares the solver with the gloom test scenarios: node tools/gloom-report.mjs [rules: gloomhaven|frosthaven|jotl] [-v]
import { fixture, answerOf, expectedOf, same } from './tests/gloomRunner.mjs';
const rules = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'gloomhaven', verbose = process.argv.includes('-v');
let pass = 0; const fail = [];
for (const rec of fixture.scenarios.filter(r => r.rules === rules && r.supported)) {
  let got; try { got = answerOf(rec); } catch (e) { got = 'ERROR ' + e.message; }
  if (typeof got !== 'string' && same(got, expectedOf(rec))) pass++; else fail.push({ rec, got });
}
console.log(`${rules}: ${pass} pass, ${fail.length} fail, of ${pass + fail.length} supported scenarios`);
for (const { rec, got } of fail) {
  console.log(`  #${rec.n} expected ${JSON.stringify(expectedOf(rec))} got ${JSON.stringify(got)}`);
  if (verbose) console.log(`     ${rec.message}  [move ${rec.move} range ${rec.range} target ${rec.target}${rec.flying ? ' flying' : ''}${rec.jumping ? ' jumping' : ''}${rec.teleport ? ' teleport' : ''}${rec.muddled ? ' muddled' : ''}]`);
}
