// Compare page: each shared perk face composed from the layered assets, next to its baked scan.
// Layers all share the 600x391 canvas, so they stack at 0,0. Corner value badges (not exported yet)
// and the class badge are not drawn here.
import { PERKS } from '../scripts/games/perks.js?v=10';
import { BASE, compose, stack, addOverlays, withOverlays, withBadges } from '../scripts/amd/compose.js?v=1';

// Distinct shared faces, with the classes that use each.
const faces = new Map();
for (const [ed, classes] of Object.entries(PERKS)) {
  for (const [cls, perks] of Object.entries(classes)) {
    for (const p of perks) {
      for (const k of [...p.removes, ...p.adds]) {
        if (k.kind !== 'shared') continue;
        if (!faces.has(k.art.ref)) faces.set(k.art.ref, { card: k, used: new Set() });
        faces.get(k.art.ref).used.add(`${ed} ${cls}`);
      }
    }
  }
}

function pic(cap, node) {
  const d = document.createElement('div');
  d.className = 'pic';
  const c = document.createElement('div');
  c.className = 'cap';
  c.textContent = cap;
  d.append(c, node);
  return d;
}

const main = document.getElementById('main');
const countEl = document.getElementById('count');
const entries = [...faces.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const built = entries.map(([ref, { card, used }]) => {
  const c = compose(card);
  const scan = `${BASE}/shared/${ref}.webp`;
  const urls = c.layers.map(l => l[0]);

  const el = document.createElement('div');
  el.className = 'face';
  const pics = document.createElement('div');
  pics.className = 'face-pics';
  pics.append(
    pic('scan', stack('', [scan])),
    pic('composed', withBadges(withOverlays(stack('', urls), c.overlays), c.plain ? null : card.value, [...used][0])),
    pic('composed over scan', stack('over', [scan, ...urls])),
  );
  // Difference mode needs the whole composed stack blended as one: wrap its layers in a group.
  const over = pics.lastChild.querySelector('.stack');
  const imgs = [...over.querySelectorAll('img')];
  const grp = document.createElement('div');
  grp.style.cssText = 'position:absolute;inset:0';
  grp.className = 'top';
  imgs.slice(1).forEach(i => { i.className = ''; grp.appendChild(i); });
  addOverlays(grp, c.overlays);
  over.appendChild(grp);

  const info = document.createElement('div');
  info.className = 'face-info';
  const h = document.createElement('h3');
  h.textContent = `${card.value} ${ref}`;
  const tags = document.createElement('div');
  tags.className = 'tags';
  for (const [cls, txt] of c.flags) {
    const s = document.createElement('span');
    s.className = 'tag ' + cls;
    s.textContent = txt;
    tags.appendChild(s);
  }
  const lay = document.createElement('div');
  lay.className = 'layers';
  lay.textContent = c.layers.map(l => l[1]).join(' + ');
  const u = document.createElement('div');
  u.className = 'used';
  u.textContent = `${used.size} classes: ${[...used].join(', ')}`;
  info.append(h, tags, lay, u);
  el.append(pics, info);
  return { ref, el, frameOk: c.frameOk };
});

function render() {
  const f = document.getElementById('filter').value;
  const q = document.getElementById('search').value.trim().toLowerCase();
  document.body.classList.toggle('diff', document.getElementById('diff').checked);
  main.replaceChildren();
  let n = 0;
  for (const b of built) {
    if (f === 'frame' && !b.frameOk) continue;
    if (f === 'noframe' && b.frameOk) continue;
    if (q && !b.ref.toLowerCase().includes(q)) continue;
    main.appendChild(b.el);
    n++;
  }
  countEl.textContent = `${n} of ${built.length} faces`;
}
for (const id of ['filter', 'search', 'diff']) document.getElementById(id).addEventListener('input', render);
// #q=push pre-fills the search box (handy for sharing a filtered view).
if (location.hash.startsWith('#q=')) document.getElementById('search').value = decodeURIComponent(location.hash.slice(3));
render();
