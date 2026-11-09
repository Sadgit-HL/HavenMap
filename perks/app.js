import { PERKS } from '../scripts/games/perks.js?v=10';
import { buildCard } from '../scripts/amd/card.js?v=4';
import { perkTextHtml, perkRuleNote } from '../scripts/amd/perkText.js';

const editionSelect = document.getElementById('edition');
const classSelect = document.getElementById('class');
const search = document.getElementById('search');
const main = document.getElementById('main');

const EDITION_NAMES = { FH: 'Frosthaven', GH2E: 'Gloomhaven 2nd Edition', JotL: 'Jaws of the Lion', MP: 'Mercenary Packs' };

for (const key of Object.keys(PERKS)) {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = EDITION_NAMES[key] || key;
  editionSelect.appendChild(opt);
}

function populateClasses() {
  const edition = editionSelect.value;
  classSelect.innerHTML = '<option value="">All classes</option>';
  for (const name of Object.keys(PERKS[edition]).sort()) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    classSelect.appendChild(opt);
  }
}

function cardsGroup(cards, className, isAdded) {
  const group = document.createElement('div');
  group.className = 'group';
  cards.forEach((c, i) => {
    if (i > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '+';
      group.appendChild(arrow);
    }
    group.appendChild(buildCard(c, className, isAdded));
  });
  return group;
}

function renderClass(edition, className) {
  const section = document.createElement('section');
  section.className = 'class-section';
  const perks = PERKS[edition][className];
  section.innerHTML = `<h2>${className}</h2><div class="meta">${EDITION_NAMES[edition]} &middot; ${perks.length} perk entries</div>`;

  for (const p of perks) {
    const row = document.createElement('div');
    row.className = 'perk-row';

    const cards = document.createElement('div');
    cards.className = 'perk-cards';
    if (p.removes.length) {
      cards.appendChild(cardsGroup(p.removes, className, false));
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '→';
      cards.appendChild(arrow);
    }
    if (p.adds.length) cards.appendChild(cardsGroup(p.adds, className, true));
    row.appendChild(cards);

    // The cards already show what a perk does; keep the text only for perks without cards, plus the
    // "Ignore ... effects" clause of perks with cards.
    const hasCards = p.removes.length || p.adds.length;
    const shown = hasCards ? perkRuleNote(p.text) : p.text;
    if (shown) {
      const text = document.createElement('div');
      text.className = 'perk-text';
      text.innerHTML = perkTextHtml(shown);
      row.appendChild(text);
    }

    section.appendChild(row);
  }
  return section;
}

function render() {
  const edition = editionSelect.value;
  const className = classSelect.value;
  const q = search.value.trim().toLowerCase();
  main.innerHTML = '';

  const names = className ? [className] : Object.keys(PERKS[edition]).sort();
  let shown = 0;
  for (const name of names) {
    if (q && !name.toLowerCase().includes(q) && !classMatchesQuery(edition, name, q)) continue;
    main.appendChild(renderClass(edition, name));
    shown++;
  }
  if (!shown) {
    main.innerHTML = '<div class="empty-state">No classes match.</div>';
  }
}

function classMatchesQuery(edition, name, q) {
  return PERKS[edition][name].some(p => (p.text || '').toLowerCase().includes(q));
}

editionSelect.addEventListener('change', () => { populateClasses(); render(); });
classSelect.addEventListener('change', render);
search.addEventListener('input', render);

populateClasses();
render();
