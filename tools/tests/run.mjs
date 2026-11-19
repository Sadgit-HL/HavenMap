// Node checks for the campaign code. Run: node tools/tests/run.mjs [name-filter]
// No dependencies. Each file in this folder named *.test.mjs exports `tests`, an object { name: fn }.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url)), filter = process.argv[2] || '';
let pass = 0, fail = 0;
for (const f of readdirSync(dir).filter(n => n.endsWith('.test.mjs')).sort()) {
  const { tests } = await import(pathToFileURL(join(dir, f)).href);
  for (const [name, fn] of Object.entries(tests)) {
    const id = `${f.replace('.test.mjs', '')}: ${name}`;
    if (filter && !id.includes(filter)) continue;
    try { await fn(); pass++; }
    catch (e) { fail++; console.log(`FAIL ${id}\n  ${String(e.message).split('\n').join('\n  ')}`); }
  }
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
