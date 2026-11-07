// Checks that every %token% in the perk texts has an icon in images/common/perk-icons and that every
// listed token has a file. Run: node tools/check-perk-icons.mjs
import fs from 'fs';
import { PERKS } from '../scripts/games/perks.js';
import { PERK_ICON_TOKENS } from '../scripts/amd/perkText.js';

const used = new Set();
for (const cl of Object.values(PERKS)) for (const ps of Object.values(cl)) for (const p of ps) {
  for (const m of (p.text || '').matchAll(/%(\w+)%/g)) used.add(m[1]);
}
const dir = new URL('../images/common/perk-icons/', import.meta.url);
const missingMap = [...used].filter(t => !PERK_ICON_TOKENS.has(t));
const missingFile = [...PERK_ICON_TOKENS].filter(t => !fs.existsSync(new URL(`${t}.png`, dir)));
const unused = [...PERK_ICON_TOKENS].filter(t => !used.has(t));
console.log(`${used.size} tokens in perk texts; ${PERK_ICON_TOKENS.size} mapped`);
if (missingMap.length) console.log('NOT MAPPED:', missingMap.join(', '));
if (missingFile.length) console.log('FILE MISSING:', missingFile.join(', '));
if (unused.length) console.log('mapped but unused in perks.js:', unused.join(', '));
process.exit(missingMap.length || missingFile.length ? 1 : 0);
