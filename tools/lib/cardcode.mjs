// Shared by the card generators (build-turn-templates.mjs, build-card-actions.mjs): the card code of the classes named by class code, matched to the
// app's card ids (scripts/games/gh2_cards.js).
// Source: card-code-current/<folder>/<class>-ability-cards.code.json. A card is matched by name, else by initiative and level, else by initiative alone
// when that is unique in the class (the app has level X cards that the card code spells differently).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const levelKey = l => String(l).toUpperCase();
const norm = s => String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Calls onCard({ id, name, cls, card, json }) for every card of the classes; returns { missing, failed } (cards without card code, classes that failed).
export function eachCard(classCodes, onCard) {
  const cardsSrc = readFileSync(join(ROOT, 'scripts', 'games', 'gh2_cards.js'), 'utf8');
  const clsSrc = readFileSync(join(ROOT, 'scripts', 'games', 'gh2_classes.js'), 'utf8');
  const cards = [...cardsSrc.matchAll(/\{"id":(\d+),"cls":(\d+),"slug":"([^"]+)","lv":("?[0-9X]+"?),"ini":(\d+)/g)].map(m => ({ id: +m[1], cls: +m[2], slug: m[3], lv: levelKey(m[4].replace(/"/g, '')), ini: +m[5] }));
  let missing = 0, failed = 0;
  for (const code of classCodes) {
    const cm = clsSrc.match(new RegExp(String.raw`\{"i":(\d+),"code":"${code}","name":"([^"]+)"`));
    if (!cm) { console.error(`unknown class code ${code}`); failed++; continue; }
    const idx = +cm[1], name = cm[2];
    const file = ['confirmed', 'wip', 'start'].map(f => join(ROOT, 'card-code-current', f, `${norm(name)}-ability-cards.code.json`)).find(existsSync);
    if (!file) { console.error(`no card code JSON for ${name}`); failed++; continue; }
    const list = JSON.parse(readFileSync(file, 'utf8'));
    const mine = cards.filter(c => c.cls === idx);
    for (const c of mine) {
      let j = list.find(x => norm(x.name) === c.slug) || list.find(x => x.initiative === c.ini && levelKey(x.level) === c.lv);
      if (!j) {
        const same = list.filter(x => x.initiative === c.ini);
        if (same.length === 1) { j = same[0]; console.log(`${name}: ${c.slug} matched by initiative ${c.ini} alone (level ${c.lv} here, ${same[0].level} in the card code)`); }
      }
      if (!j) { missing++; console.error(`${name}: no card code for ${c.slug} (level ${c.lv}, initiative ${c.ini})`); continue; }
      onCard({ id: c.id, name, cls: idx, card: c, json: j });
    }
    console.log(`${name}: ${mine.length} cards from ${file.slice(ROOT.length + 1)}`);
  }
  return { missing, failed };
}
