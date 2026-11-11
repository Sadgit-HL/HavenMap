// Generates the five mercenary-tab mockups (static HTML) into HavenMap/campaign/mockups/.
import fs from 'fs';
const OUT = process.env.MERC_MOCKUP_OUT || 'C:/Users/hansen/ai/games/HavenMap/HavenMap/campaign/mockups/';
fs.mkdirSync(OUT, { recursive: true });

const CDN = 'https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/';
const card = (slug, lv, enh) => ({ slug, lv, enh, name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), img: `${CDN}wh_character_ability_cards/gh2/TI2/${slug}.jpeg` });
const D = {
  name: 'Simon', cls: 'Tinkerer', player: 'Guido', lv: 5, xp: 264, xpFrom: 210, xpTo: 275, gold: 42, inherited: 0,
  traits: ['Educated', 'Nimble', 'Resourceful'], special: ['Friend of Hero'],
  mat: `${CDN}wh_character_mats/front/tinkerer.png`, matBack: `${CDN}wh_character_mats/back/tinkerer.png`,
  hand: [card('flamethrower', 1), card('ink-bomb', 1), card('net-shooter', 1, { where: 'top', text: 'Attack +1' }), card('reinvigorating-elixir', 1), card('crank-bow', 2), card('stun-shot', 1)],
  active: [card('teleportation-pad', 3), card('dangerous-contraption', 4)],
  discard: [card('jet-propulsion', 1), card('restorative-mist', 1), card('volatile-concoction', 'X')],
  lost: [card('disintegration-beam', 5)],
  counters: [{ n: 'Time tokens', v: 2 }, { n: 'Resolve', v: 1 }],
  perks: 3, masteries: 0, enhCount: 1,
  // state: 0 available, 1 spent (back at long rest), 2 consumed (gone for the scenario). st is the old, unused 3-pip guess.
  items: [[1, 'Weathered Boots', 'legs', [0, 0, 0], 0], [9, 'Focusing Rod', '1H', [1, 0, 0], 1], [149, 'Aesther Spyglass', 'head', [0, 1, 0], 2], [12, 'Stamina Potion', 'small', [0, 1, 0], 0],
    [21, 'Power Potion', 'small', [0, 1, 0], 0], [14, 'Studded Leather', 'body', [0, 0, 0], 0], [8, 'Heater Shield', '1H', [0, 0, 0], 0], [5, 'Scouting Lens', 'head', [0, 0, 0], 0]]
    .map(([id, name, slot, st, state]) => ({ id, name, slot, st, state, img: `${CDN}wh_items/gh2/${String(id).padStart(3, '0')}.png` })),
};
const XP_PCT = Math.round(((D.xp - D.xpFrom) / (D.xpTo - D.xpFrom)) * 100);

// ---- icons (inline SVG, 18px, stroke) ----
const ic = p => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  amd: ic('<rect x="3" y="6" width="12" height="15" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v13"/>'),
  perks: ic('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
  journal: ic('<path d="M6 3h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 17a2 2 0 0 0 2 2M10 8h6M10 12h6"/>'),
  mat: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v14"/>'),
  codes: ic('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/>'),
  enh: ic('<path d="M4 18h16M6 18v-3h12v3M8 15c0-3 1-5 4-6V6h5v3H12"/>'),
  more: ic('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
  drag: ic('<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"/>'),
};
const MODALS = [
  ['amd', 'Attack modifiers', 'Attack modifier deck'], ['perks', 'Perks & masteries', 'Perk selection and masteries'],
  ['journal', 'Journal', 'Personal quest, battle goal and notes (tabs in one modal)'],
  ['mat', 'Character mat', 'Character mat, front and back'], ['codes', 'BGG codes', 'Copy a forum post code'],
  ['enh', 'Enhancements', 'Enhancement table (editable)'],
];
// A button that opens a modal: the small corner mark says so.
const mbtn = (k, { label = true, cls = '' } = {}) => {
  const m = MODALS.find(x => x[0] === k) || ['more', 'Menu', 'Modal menu'];
  return `<button type="button" class="mbtn ${cls}" data-modal="${k}" title="Opens modal: ${m[2]}">${ICON[k]}${label ? `<span>${m[1]}</span>` : ''}<i class="mmark" aria-hidden="true"></i></button>`;
};
const portrait = (cls = '') => `<div class="portrait ${cls}" style="background-image:url(${D.mat})" role="img" aria-label="Class portrait (cropped from the character mat)"></div>`;
const cardEl = (c, extra = '') => `<div class="ac ${extra}" title="${c.name} (level ${c.lv})"><img src="${c.img}" alt="${c.name}" loading="lazy">${c.enh ? `<span class="enh ${c.enh.where}" title="Enhancement: ${c.enh.text} (${c.enh.where})">${c.enh.text.replace('Attack ', '')}</span>` : ''}</div>`;
const pips = st => `<span class="pips">${st.map(s => `<i class="${s ? 'on' : ''}"></i>`).join('')}</span>`;
const itemEl = i => `<div class="it" title="${i.name} (${i.slot})"><img src="${i.img}" alt="${i.name}" loading="lazy">${pips(i.st)}</div>`;
const chips = (arr, cls = '') => arr.map(t => `<span class="chip ${cls}">${t}</span>`).join('');
const xpBar = (compact = false) => `<div class="xp ${compact ? 'compact' : ''}" title="Level ${D.lv}: ${D.xpFrom} XP. Next level (${D.lv + 1}) at ${D.xpTo} XP."><div class="xpbar"><b style="width:${XP_PCT}%"></b></div><div class="xpnum"><span>${D.xp} XP</span><em>${D.xpFrom}</em><em>${D.xpTo}</em></div></div>`;
const counters = () => `<div class="counters">${D.counters.map(c => `<span class="ctr"><label>${c.n}</label><button type="button" aria-label="Decrease ${c.n}">&minus;</button><b>${c.v}</b><button type="button" aria-label="Increase ${c.n}">+</button></span>`).join('')}<button type="button" class="ctr add" title="Name and track a custom counter">+ counter</button></div>`;
const drop = (label, n, cls = '') => `<div class="drop ${cls}"><h4>${label} <span>${n}</span></h4>`;

const NAV = cur => `<nav class="mocknav"><b>Mercenary tab mockups</b><a href="index.html">Overview</a>${[['merc-1-playmat', '1 Playmat'], ['merc-2-sheet', '2 Sheet'], ['merc-3-tray', '3 Hand tray'], ['merc-4-mat', '4 Mat board'], ['merc-5-phone', '5 Phone first'], ['merc-6-playmat-v2', '6 Playmat v2']].map(([f, l]) => `<a href="${f}.html"${f === cur ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;
const page = (cur, title, css, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mercenary tab mockup: ${title}</title><link rel="stylesheet" href="mock.css"><style>${css}</style></head>
<body class="m-${cur.split('-')[2]}">${NAV(cur)}${body}</body></html>`;
const notes = (idea, pros, cons) => `<p>${idea}</p><div class="pc"><div><b>Pros</b><ul>${pros.map(p => `<li>${p}</li>`).join('')}</ul></div><div><b>Cons</b><ul>${cons.map(p => `<li>${p}</li>`).join('')}</ul></div></div>`;

// ---------------------------------------------------------------- 1 Playmat
const p1css = `
.stage{display:grid;grid-template-columns:150px minmax(0,1fr) 150px 64px;grid-template-rows:auto minmax(0,1fr);gap:12px;padding:12px;height:calc(100vh - 34px);min-height:640px;background:radial-gradient(ellipse at 50% 40%,#2b3a2c 0%,#1a2519 70%,#121a12 100%);}
.hud{grid-column:1/-1;display:flex;gap:16px;align-items:center;background:rgba(18,15,11,.78);border:1px solid var(--line);border-radius:12px;padding:8px 14px}
.hud .portrait{width:74px;height:74px;border-radius:50%;border:2px solid var(--accent)}
.hud h1{margin:0;font-size:20px}.hud .sub{color:var(--muted);font-size:13px}
.lvl{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent);color:#1b150c;font-weight:800;font-size:22px}
.hud .xp{width:260px}.hud .stat{display:flex;flex-direction:column;align-items:center;font-size:12px;color:var(--muted)}.hud .stat b{font-size:18px;color:var(--text)}
.shelf{display:flex;flex-direction:column;gap:8px;overflow:hidden;min-height:0;padding-right:2px}.shelf .it{width:100%}
.board{display:grid;grid-template-rows:minmax(0,42%) minmax(0,1fr);gap:12px;min-width:0;min-height:0}
.activezone{border:2px dashed rgba(236,223,200,.25);border-radius:14px;padding:8px 14px;display:flex;gap:14px;align-items:center;justify-content:center;position:relative;background:rgba(0,0,0,.18)}
.activezone .ac{height:100%;max-height:300px;width:auto;aspect-ratio:5/7}.zlabel{position:absolute;left:14px;top:6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.handzone{position:relative;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;min-height:0}
.fan{display:flex;justify-content:center;align-items:flex-end;width:100%}
.fan .ac{height:36vh;width:auto;margin:0 -1.2vw;transform-origin:50% 140%;transform:rotate(calc((var(--i) - 2.5) * 4deg)) translateY(22%);transition:.18s;box-shadow:0 8px 20px rgba(0,0,0,.6)}
.fan .ac:hover{transform:translateY(-4%) scale(1.08);z-index:5}.fan .ac.drag{transform:translateY(-14%) rotate(-6deg) scale(1.04);z-index:6;outline:2px solid var(--accent);box-shadow:0 22px 40px rgba(0,0,0,.7)}
.piles{display:grid;grid-template-rows:1fr 1fr;gap:12px;min-height:0}.pilebox{min-height:0;overflow:hidden;border:2px dashed rgba(236,223,200,.25);border-radius:14px;background:rgba(0,0,0,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;position:relative}
.pilebox.target{border-color:var(--accent);background:rgba(199,164,74,.14)}
.pilebox .ac{width:auto;height:58%;max-width:76%;box-shadow:5px 5px 0 -1px #2b2318,10px 10px 0 -2px #241c13}.pilebox h4{margin:0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.pilebox h4 b{color:var(--text)}
.pilebox.lost .ac{filter:grayscale(.8) brightness(.7)}
.dock{display:flex;flex-direction:column;gap:8px;align-items:stretch}.dock .mbtn{flex-direction:column;height:56px;font-size:10px;gap:2px;padding:4px 2px}.dock .mbtn svg{width:20px;height:20px}
.hud .counters{margin-left:auto}
`;
const p1 = page('merc-1-playmat', '1 Playmat', p1css, `
<div class="stage">
  <header class="hud">${portrait()}
    <div><h1>${D.name}</h1><div class="sub">${D.cls} &middot; played by ${D.player}</div><div class="chips">${chips(D.traits)}${chips(D.special, 'info')}</div></div>
    <div class="lvl" title="Level">${D.lv}</div>${xpBar()}
    <div class="stat"><b>${D.gold}</b>gold</div><div class="stat"><b>${D.inherited}</b>inherited</div>
    ${counters()}
  </header>
  <section class="shelf" aria-label="Items">${D.items.slice(0, 4).map(itemEl).join('')}<button type="button" class="chip more" title="Item area: all ${D.items.length} items">+ ${D.items.length - 4} more items</button></section>
  <section class="board">
    <div class="activezone"><span class="zlabel">Active</span>${D.active.map(c => cardEl(c)).join('')}<span class="hint">drop a card here</span></div>
    <div class="handzone"><span class="zlabel">Hand &middot; ${D.hand.length}</span><div class="fan">${D.hand.map((c, i) => cardEl(c, i === 3 ? 'drag' : '').replace('class="ac', `style="--i:${i}" class="ac`)).join('')}</div></div>
  </section>
  <section class="piles"><div class="pilebox target"><h4>Discard <b>${D.discard.length}</b></h4>${cardEl(D.discard[2])}<span class="hint">drop here</span></div><div class="pilebox lost"><h4>Lost <b>${D.lost.length}</b></h4>${cardEl(D.lost[0])}</div></section>
  <aside class="dock" aria-label="Modals">${MODALS.map(m => mbtn(m[0])).join('')}</aside>
</div>`, notes(
  'A card table. Stats sit in one strip on top, items on a left shelf, the table in the middle (active cards above, the hand fanned below) and the discard and lost piles on the right as drop targets. Six modal buttons in a dock on the far right.',
  ['Closest to a real card game; the hand is the star', 'Piles are big, obvious drop targets', 'Everything is visible without scrolling on a desktop'],
  ['Items are squeezed into a narrow shelf', 'Needs a wide window; the fan hides the lower half of cards']));

// ---------------------------------------------------------------- 2 Sheet
const p2css = `
.sheet{display:grid;grid-template-columns:300px minmax(0,1fr) 250px;gap:14px;padding:14px;align-items:start}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px}
.side .portrait{width:100%;aspect-ratio:4/3;border-radius:10px;border:1px solid var(--line);margin-bottom:10px}
.side h1{margin:0;font-size:22px}.side .sub{color:var(--muted);font-size:13px;margin-bottom:8px}
.statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.statgrid div{background:#1c1711;border:1px solid var(--line);border-radius:8px;text-align:center;padding:6px 2px;font-size:11px;color:var(--muted)}.statgrid b{display:block;font-size:20px;color:var(--text)}
.group{margin-top:12px}.group h5{margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.group .row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.main h2{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}.main h2 span{color:var(--muted);font-weight:400}
.cardgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px;margin-bottom:16px}
.cardgrid.small{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
.zonewrap{border:2px dashed transparent;border-radius:12px;padding:6px;margin-bottom:10px}.zonewrap.target{border-color:var(--accent);background:rgba(199,164,74,.08)}
.piles2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ac.sm{opacity:.9}.lostzone .ac{filter:grayscale(.8) brightness(.75)}
.right .itgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.right h2{margin:0 0 8px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.enhsum{margin-top:12px;font-size:13px;color:var(--muted)}.enhsum b{color:var(--text)}
`;
const grp = (t, ks) => `<div class="group"><h5>${t}</h5><div class="row">${ks.map(k => mbtn(k)).join('')}</div></div>`;
const p2 = page('merc-2-sheet', '2 Sheet', p2css, `
<div class="sheet">
  <aside class="panel side">${portrait()}<h1>${D.name}</h1><div class="sub">${D.cls} &middot; played by ${D.player}</div>
    <div class="chips">${chips(D.traits)}${chips(D.special, 'info')}</div>
    <div class="statgrid"><div><b>${D.lv}</b>level</div><div><b>${D.gold}</b>gold</div><div><b>${D.inherited}</b>inherited</div></div>${xpBar()}
    <div class="group"><h5>Counters</h5>${counters()}</div>
    ${grp('Deck', ['amd', 'perks'])}${grp('Story', ['journal'])}${grp('Reference', ['mat', 'codes', 'enh'])}
  </aside>
  <main class="main">
    <h2>Active <span>${D.active.length}</span></h2><div class="zonewrap"><div class="cardgrid">${D.active.map(c => cardEl(c)).join('')}</div></div>
    <h2>Hand <span>${D.hand.length} of 12</span></h2><div class="zonewrap"><div class="cardgrid">${D.hand.map((c, i) => cardEl(c, i === 1 ? 'drag-src' : '')).join('')}</div></div>
    <div class="piles2"><div><h2>Discard <span>${D.discard.length}</span></h2><div class="zonewrap target"><div class="cardgrid small">${D.discard.map(c => cardEl(c, 'sm')).join('')}</div><span class="hint">drop here</span></div></div>
      <div class="lostzone"><h2>Lost <span>${D.lost.length}</span></h2><div class="zonewrap"><div class="cardgrid small">${D.lost.map(c => cardEl(c, 'sm')).join('')}</div></div></div></div>
  </main>
  <aside class="panel right"><h2>Items <span class="hint">${D.items.length}</span></h2><div class="itgrid">${D.items.map(itemEl).join('')}</div>
    <div class="enhsum"><b>${D.enhCount}</b> enhancement on ${D.cls} cards (marked on the card).</div></aside>
</div>`, notes(
  'A character sheet. Left column holds identity and every modal button, grouped by purpose (Deck, Story, Reference). The middle is the card area as plain grids; the right column is the item area.',
  ['Familiar, tidy and easy to build and to make responsive', 'Modal buttons are grouped and always in the same place', 'Items and cards visible together'],
  ['Least "game feel"; cards are small thumbnails in grids', 'Drag distance between hand and piles is long']));

// ---------------------------------------------------------------- 3 Tray
const p3css = `
body.m-tray{overflow:hidden}
.full{height:calc(100vh - 34px);display:grid;grid-template-rows:auto 1fr auto;background:radial-gradient(ellipse at 50% 30%,#2a2118 0%,#17120d 75%);}
.hud3{display:flex;align-items:center;gap:12px;padding:8px 16px;background:rgba(18,15,11,.85);border-bottom:1px solid var(--line)}
.hud3 .portrait{width:44px;height:44px;border-radius:50%;border:2px solid var(--accent)}.hud3 b{font-size:16px}.hud3 .sub{color:var(--muted);font-size:12px}
.hud3 .xp.compact{width:200px}.hud3 .grow{flex:1}.hud3 .pill{background:#1c1711;border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:13px}
.hud3 .pill b{font-size:14px}.hud3 .more{cursor:pointer}
.table3{display:grid;grid-template-columns:130px 1fr 130px;gap:16px;padding:16px 20px;min-height:0}
.table3 .center{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:2px dashed rgba(236,223,200,.2);border-radius:18px;position:relative}
.table3 .center .row{display:flex;gap:16px}.table3 .center .ac{height:min(34vh,320px);width:auto;aspect-ratio:5/7}
.stack{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:2px dashed rgba(236,223,200,.2);border-radius:14px}
.stack.target{border-color:var(--accent);background:rgba(199,164,74,.12)}.stack .ac{width:88%;box-shadow:5px 5px 0 -1px #2b2318,10px 10px 0 -2px #241c13}.stack h4{margin:0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.stack.lost .ac{filter:grayscale(.8) brightness(.7)}
.tray{position:relative;display:flex;align-items:flex-end;justify-content:center;height:30vh;min-height:190px;background:linear-gradient(0deg,rgba(0,0,0,.65),transparent);padding-bottom:4px}
.tray .ac{width:clamp(120px,11vw,190px);margin:0 -2.2vw;transform:translateY(24%);transition:.18s;box-shadow:0 -6px 18px rgba(0,0,0,.5)}
.tray .ac:hover{transform:translateY(-8%) scale(1.15);z-index:5}.tray .ac.drag{transform:translateY(-120%) rotate(-5deg) scale(1.1);z-index:6;outline:2px solid var(--accent)}
.tray .left{position:absolute;left:16px;bottom:12px;display:flex;gap:8px;align-items:flex-end}
.tray .right{position:absolute;right:16px;bottom:12px;display:flex;flex-direction:column;gap:6px}
.itemsbtn{display:flex;align-items:center;gap:8px;background:#2d2519;border:1px solid var(--line);border-radius:10px;color:var(--text);padding:6px 10px;font:inherit;cursor:pointer}
.itemsbtn .mini{display:flex}.itemsbtn .mini img{width:26px;height:38px;object-fit:cover;border-radius:3px;margin-left:-8px;border:1px solid #000}
.itemsbtn .mini img:first-child{margin-left:0}
.drawer{position:absolute;left:16px;bottom:96px;width:420px;background:var(--panel);border:1px solid var(--accent);border-radius:12px;padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;box-shadow:0 12px 40px rgba(0,0,0,.7)}
.drawer .cap{grid-column:1/-1;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.tray .right .mbtn{width:158px;justify-content:flex-start}
`;
const p3 = page('merc-3-tray', '3 Hand tray', p3css, `
<div class="full">
  <header class="hud3">${portrait()}<div><b>${D.name}</b><div class="sub">${D.cls} &middot; ${D.player}</div></div>
    <span class="pill">Lv <b>${D.lv}</b></span>${xpBar(true)}<span class="pill"><b>${D.gold}</b> gold</span><span class="pill">${D.inherited} inherited</span>${chips(D.traits)}
    <span class="grow"></span>${counters()}<button type="button" class="chip more" title="Opens the full stats as a drawer">stats &#9662;</button></header>
  <div class="table3">
    <div class="stack target"><h4>Discard ${D.discard.length}</h4>${cardEl(D.discard[2])}<span class="hint">drop here</span></div>
    <div class="center"><span class="zlabel">Active</span><div class="row">${D.active.map(c => cardEl(c)).join('')}</div></div>
    <div class="stack lost"><h4>Lost ${D.lost.length}</h4>${cardEl(D.lost[0])}</div>
  </div>
  <div class="tray">
    <div class="left"><button type="button" class="itemsbtn" title="Item area: opens as a drawer (shown open above)"><span class="mini">${D.items.slice(0, 4).map(i => `<img src="${i.img}" alt="">`).join('')}</span><span>Items <b>${D.items.length}</b></span></button></div>
    ${D.hand.map((c, i) => cardEl(c, i === 2 ? 'drag' : '')).join('')}
    <div class="right">${MODALS.slice(0, 4).map(m => mbtn(m[0])).join('')}${mbtn('more', { cls: 'moremenu' }).replace('<span>Menu</span>', `<span>More (${MODALS.length - 4})</span>`)}</div>
  </div>
</div>`, notes(
  'Immersive and full-viewport. The hand lies in a tray along the bottom edge (cards peek out and rise on hover or while dragged), discard and lost flank the active cards. Stats shrink to a slim bar on top. Items live in a drawer behind the button bottom-left, the four most used modals sit bottom-right and the rest hide in a "more" menu.',
  ['Most game-like; the hand is always at your thumb', 'Maximum space for cards', 'Piles on both sides make the drag targets obvious'],
  ['Items and stats are one click away, not always visible', 'Only four modal buttons visible; the rest need a menu', 'No page scroll, so it must be tuned per screen size']));

// ---------------------------------------------------------------- 4 Mat board
const p4css = `
.board4{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;padding:14px;align-items:start}
.matwrap{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line);box-shadow:0 10px 30px rgba(0,0,0,.6)}.matwrap>img{display:block;width:100%}
.hot{position:absolute}.hot .mbtn{background:rgba(18,15,11,.82);backdrop-filter:blur(2px)}
.flip{position:absolute;left:10px;bottom:10px}
.stat4{position:absolute;left:8%;bottom:6%;display:flex;gap:8px;align-items:center;background:rgba(18,15,11,.82);border:1px solid var(--line);border-radius:10px;padding:6px 10px}
.stat4 b{font-size:20px}.stat4 .sub{color:var(--muted);font-size:12px}.stat4 .lvl{width:34px;height:34px;border-radius:50%;background:var(--accent);color:#1b150c;font-weight:800;display:flex;align-items:center;justify-content:center}
.slot{position:absolute;border:2px dashed rgba(236,223,200,.45);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:rgba(236,223,200,.8);background:rgba(18,15,11,.35)}
.slot.target{border-color:var(--accent);background:rgba(199,164,74,.2)}.slot.vstrip{border-radius:0}.slot.vstrip span{writing-mode:vertical-rl;transform:rotate(180deg)}
.tray4{margin-top:12px;display:flex;justify-content:center;padding:6px 0 0}.tray4 .ac{width:clamp(110px,11vw,170px);margin:0 -1vw;transition:.18s;box-shadow:0 8px 18px rgba(0,0,0,.6)}.tray4 .ac:hover{transform:translateY(-22px) scale(1.1);z-index:5}
.side4 .panel{margin-bottom:12px}.side4 h2{margin:0 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px}.side4 .itgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.side4 .row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
`;
const p4 = page('merc-4-mat', '4 Mat board', p4css, `
<div class="board4">
  <section>
    <div class="matwrap"><img src="${D.mat}" alt="${D.cls} character mat, front">
      <div class="stat4">${'<span class="lvl">' + D.lv + '</span>'}<div><b>${D.name}</b><div class="sub">${D.cls} &middot; ${D.player} &middot; ${D.gold} gold</div></div></div>
      <div class="slot vstrip" style="left:0;top:4%;width:6.5%;height:92%"><span>Discard</span></div>
      <div class="slot vstrip target" style="right:0;top:4%;width:6.5%;height:92%"><span>Lost</span></div>
      <div class="slot" style="left:36%;top:11%;width:46%;height:34%">Active &middot; drop cards here</div>
      <div class="hot" style="right:2.5%;top:87%">${mbtn('amd')}</div>
      <div class="hot" style="right:9%;top:2%">${mbtn('mat', { cls: 'flipbtn' }).replace('<span>Character mat</span>', '<span>Flip to back</span>').replace('Opens modal: Character mat, front and back', 'Opens modal: Character mat (front and back), or flips the board')}</div>
    </div>
    <div class="tray4">${D.hand.map(c => cardEl(c)).join('')}</div>
  </section>
  <aside class="side4">
    <div class="panel"><h2>Progress</h2>${xpBar()}<div class="chips" style="margin-top:8px">${chips(D.traits)}${chips(D.special, 'info')}</div><div style="margin-top:8px">${counters()}</div></div>
    <div class="panel"><h2>Items <span class="hint">${D.items.length}</span></h2><div class="itgrid">${D.items.map(itemEl).join('')}</div></div>
    <div class="panel"><h2>Modals</h2><div class="row">${['perks', 'journal', 'codes', 'enh'].map(k => mbtn(k)).join('')}</div></div>
  </aside>
</div>`, notes(
  'The character mat itself is the board: the real mat art, with the class portrait coming from the mat, the stats pinned on it, and drop slots (active, discard, lost) drawn on top. The slots follow the zones printed on the mat (discard strip on the left, lost strip on the right, active area on top). The attack modifier button sits on the gear at the bottom right; flipping to the back is in place from the top right. The hand lies below; items and the other modals in a side column.',
  ['The strongest "physical card game" metaphor', 'No separate portrait or mat modal needed', 'Slots on the mat teach where cards go'],
  ['Slot positions have to be placed per mat image (one set per class)', 'Mat art is busy, so overlays need care', 'Wasted space on mobile']));

// ---------------------------------------------------------------- 5 Phone
const p5css = `
.phones{display:flex;gap:28px;justify-content:center;flex-wrap:wrap;padding:20px 10px 40px}
.phone{width:390px;height:800px;border:10px solid #0b0907;border-radius:38px;background:var(--bg);display:flex;flex-direction:column;overflow:hidden;position:relative;box-shadow:0 20px 50px rgba(0,0,0,.6)}
.phone .cap{position:absolute;top:-30px;left:0;right:0;text-align:center;color:var(--muted);font-size:12px}
.ph-top{display:flex;gap:10px;align-items:center;padding:10px 12px;background:var(--panel);border-bottom:1px solid var(--line)}
.ph-top .portrait{width:44px;height:44px;border-radius:50%;border:2px solid var(--accent)}.ph-top b{font-size:16px}.ph-top .sub{font-size:11px;color:var(--muted)}
.ph-top .lvl{margin-left:auto;width:34px;height:34px;border-radius:50%;background:var(--accent);color:#1b150c;font-weight:800;display:flex;align-items:center;justify-content:center}
.ph-top .gold{font-size:13px;color:var(--text)}.ph-xp{padding:0 12px 6px;background:var(--panel)}
.ph-body{flex:1;overflow:hidden;padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.ph-body h4{margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
.strip{display:flex;gap:8px;overflow:hidden}.strip .ac{width:96px;flex:none}.strip.big .ac{width:150px}
.hand5{display:flex;gap:8px;overflow:hidden;padding:4px 0}.hand5 .ac{width:150px;flex:none}.hand5 .ac.focus{outline:2px solid var(--accent)}
.pilerow{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pilebox5{border:2px dashed rgba(236,223,200,.3);border-radius:10px;height:92px;display:flex;align-items:center;gap:8px;padding:6px 10px}
.pilebox5.target{border-color:var(--accent);background:rgba(199,164,74,.14)}.pilebox5 b{font-size:20px}.pilebox5 span{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;display:block}
.ph-nav{display:grid;grid-template-columns:repeat(3,1fr) 56px;border-top:1px solid var(--line);background:var(--panel);align-items:stretch}
.ph-nav button{background:none;border:0;color:var(--muted);padding:10px 0;font:inherit;font-size:12px}.ph-nav button[aria-current]{color:var(--accent);border-top:2px solid var(--accent)}
.ph-nav .mbtn{border:0;border-radius:0;border-left:1px solid var(--line)}
.sheetmenu{position:absolute;left:0;right:0;bottom:0;background:var(--panel);border-top:2px solid var(--accent);border-radius:16px 16px 0 0;padding:12px;box-shadow:0 -10px 30px rgba(0,0,0,.6)}
.sheetmenu h4{margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.sheetmenu .row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.itl{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.info5 .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px}.info5 .row{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.ph-body.scroll{overflow:auto}
`;
const top5 = `<div class="ph-top">${portrait()}<div><b>${D.name}</b><div class="sub">${D.cls} &middot; ${D.player}</div></div><span class="gold"><b>${D.gold}</b> gold</span><span class="lvl">${D.lv}</span></div><div class="ph-xp">${xpBar(true)}</div>`;
const nav5 = cur => `<div class="ph-nav">${['Cards', 'Items', 'Info'].map(t => `<button type="button"${t === cur ? ' aria-current="page"' : ''}>${t}</button>`).join('')}${mbtn('more', { label: false, cls: 'menu' }).replace('Opens modal: undefined', 'Opens the modal menu')}</div>`;
const p5 = page('merc-5-phone', '5 Phone first', p5css, `
<div class="phones">
  <div class="phone"><span class="cap">Cards tab</span>${top5}
    <div class="ph-body"><h4>Active <span>${D.active.length}</span></h4><div class="strip big">${D.active.map(c => cardEl(c)).join('')}</div>
      <h4>Hand <span>${D.hand.length} &middot; swipe</span></h4><div class="hand5">${D.hand.map((c, i) => cardEl(c, i === 0 ? 'focus' : '')).join('')}</div>
      <div class="pilerow"><div class="pilebox5 target"><div><span>Discard</span><b>${D.discard.length}</b></div><span class="hint">drop</span></div><div class="pilebox5"><div><span>Lost</span><b>${D.lost.length}</b></div></div></div></div>
    ${nav5('Cards')}</div>
  <div class="phone"><span class="cap">Items tab</span>${top5}
    <div class="ph-body scroll"><h4>Items <span>${D.items.length}</span></h4><div class="itl">${D.items.map(itemEl).join('')}</div></div>${nav5('Items')}</div>
  <div class="phone"><span class="cap">Info tab</span>${top5}
    <div class="ph-body info5 scroll"><div class="panel"><h4>Traits</h4><div class="chips">${chips(D.traits)}${chips(D.special, 'info')}</div></div>
      <div class="panel"><h4>Counters</h4>${counters()}</div><div class="panel"><h4>Perks ${D.perks} &middot; masteries ${D.masteries}</h4><div class="row">${mbtn('perks')}${mbtn('enh')}</div></div>
      <div class="panel"><h4>Story</h4><div class="row">${mbtn('journal')}</div></div></div>${nav5('Info')}</div>
  <div class="phone"><span class="cap">Modal menu (opened from the button bottom-right)</span>${top5}
    <div class="ph-body"><h4>Active <span>${D.active.length}</span></h4><div class="strip">${D.active.map(c => cardEl(c)).join('')}</div></div>
    <div class="sheetmenu"><h4>Open</h4><div class="row">${MODALS.map(m => mbtn(m[0])).join('')}</div></div></div>
</div>`, notes(
  'Phone first, since players use this at the table during a scenario. A sticky header keeps the essentials (portrait, name, level, XP, gold). Three tabs: Cards (active strip, swipeable hand, discard and lost drop targets), Items and Info. All modals open from one menu button at the bottom-right, which slides up a sheet with the six entries.',
  ['Built for the device used at the table; thumb reachable', 'Scales up to a tablet or desktop column', 'One consistent place for every modal'],
  ['Dragging between zones on a small screen is harder (needs auto-scroll and big targets)', 'Cards are small; each tap-and-hold may need an enlarge preview']));

// ---------------------------------------------------------------- index + css
const idx = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mercenary tab mockups</title><link rel="stylesheet" href="mock.css"></head><body class="m-index">${NAV('')}
<main class="idx"><h1>Mercenary tab: five layout mockups</h1>
<p>Static pages with real card art (Simon, Tinkerer, level 5). Hover cards to lift them. Buttons marked <i class="mmark inline"></i> open a modal, only their position is shown. Numbers (perks, counters, quest) are placeholders.</p>
<div class="cards">${[['merc-1-playmat', '1 Playmat', 'Card table: hand fanned at the bottom, piles as drop targets, modal dock on the right.'], ['merc-2-sheet', '2 Sheet', 'Three-column character sheet; modal buttons grouped by purpose.'], ['merc-3-tray', '3 Hand tray', 'Immersive full screen; hand in a tray along the bottom edge.'], ['merc-4-mat', '4 Mat board', 'The character mat is the board, with slots drawn on it.'], ['merc-5-phone', '5 Phone first', 'Three phone tabs plus a bottom-sheet modal menu.'], ['merc-6-playmat-v2', '6 Playmat v2', 'Playmat revised: play area (face down, click to flip) next to the active area, 14-card hand, small discard and lost.']].map(([f, t, d]) => `<a class="idxcard" href="${f}.html"><b>${t}</b><span>${d}</span></a>`).join('')}</div></main></body></html>`;
fs.writeFileSync(OUT + 'index.html', idx);
fs.writeFileSync(OUT + 'merc-1-playmat.html', p1);
fs.writeFileSync(OUT + 'merc-2-sheet.html', p2);
fs.writeFileSync(OUT + 'merc-3-tray.html', p3);
fs.writeFileSync(OUT + 'merc-4-mat.html', p4);
fs.writeFileSync(OUT + 'merc-5-phone.html', p5);

// ---------------------------------------------------------------- 6 Playmat v2
const { CARDS: ALLCARDS } = await import('../../scripts/games/gh2_cards.js');
const INI_FIX = { 'disorienting-flash': 73, 'potent-potables': 46 };   // read from the card images (gh2_cards.js has no value for the first and 73 for the second)
const th = slug => ({ ini: INI_FIX[slug] ?? ALLCARDS.find(c => c.cls === 21 && c.slug === slug)?.ini, slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), img: `img/cards/${slug}.jpg`, thumb: true });
const H6 = ['disorienting-flash', 'enhancement-field', 'flamethrower', 'harmless-contraption', 'ink-bomb', 'net-shooter', 'potent-potables', 'reinvigorating-elixir', 'stun-shot', 'toxic-bolt', 'crank-bow', 'hook-gun', 'gas-canister', 'repulsor-gun']
  .map(s => ({ ...th(s), enh: s === 'net-shooter' ? { where: 'top', text: 'Attack +1' } : undefined }));
const A6 = ['teleportation-pad', 'dangerous-contraption'].map(th), DI6 = ['volatile-concoction', 'stamina-booster', 'proximity-mine'].map(th), LO6 = ['disintegration-beam'].map(th);
const PL6 = ['jet-propulsion', 'restorative-mist'].map(th);
const gear = `<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 2.6h3.4l.5 2.4 1.7.7 2.1-1.3 2.4 2.4-1.3 2.1.7 1.7 2.4.5v3.4l-2.4.5-.7 1.7 1.3 2.1-2.4 2.4-2.1-1.3-1.7.7-.5 2.4h-3.4l-.5-2.4-1.7-.7-2.1 1.3-2.4-2.4 1.3-2.1-.7-1.7-2.4-.5v-3.4l2.4-.5.7-1.7-1.3-2.1 2.4-2.4 2.1 1.3 1.7-.7z"/><circle cx="12" cy="12" r="3.4"/></svg>`;
const flipEl = (c, front) => `<div class="flipcard${front ? ' is-front' : ''}" draggable="true" data-name="${c.name}" data-img="${c.img}" data-ini="${c.ini}" role="button" tabindex="0" title="Click to flip: ${c.name}"><div class="flipinner"><div class="face back"><div class="cardback">${gear}<b>${D.cls}</b></div></div><div class="face front"><img src="${c.img}" alt="${c.name}"></div></div></div>`;
// Item state (page 6 only): 0 available, 1 spent (comes back at long rest), 2 consumed (gone for the scenario).
// No pips -- the tile itself is dimmed/greyed and carries a small corner badge, click cycles the state.
const ITEM_STATE_NAME = ['Available', 'Spent', 'Consumed'];
const ITEM_STATE_ICON = [null, ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'), ic('<path d="M6 6l12 12M18 6L6 18"/>')];
const item6El = i => `<div class="it${i.state === 1 ? ' spent' : i.state === 2 ? ' consumed' : ''}" data-itemstate data-id="${i.id}" title="${i.name} (${i.slot}) — ${ITEM_STATE_NAME[i.state]}, click to change"><img src="${i.img}" alt="${i.name}" loading="lazy">${ITEM_STATE_ICON[i.state] ? `<span class="itbadge">${ITEM_STATE_ICON[i.state]}</span>` : ''}</div>`;
const hand6 = H6.map((c, i) => cardEl(c).replace('<div class="ac "', `<div style="--i:${i}" draggable="true" data-ini="${c.ini}" class="ac"`).replace('</div>', `<span class="inib" title="Initiative ${c.ini}">${c.ini}</span></div>`)).join('');

// ---- Modal content: first design pass, static mockups (no real state, no API wiring) ----
// AMD and Perks modal content is rendered client-side from the real HavenMap data (scripts/amd/heroDeck.js,
// scripts/amd/card.js, scripts/games/perks.js) by the module script below -- see #amdreal / #perksreal.
const MASTERIES6 = ['Kill an enemy with Fire damage 10 times', 'Fully heal an ally 5 times', 'Long rest 15 times'].map(t => ({ t, on: false }));
const perkRow = p => `<label class="perkrow${p.on ? ' on' : ''}"><input type="checkbox" ${p.on ? 'checked' : ''}><span>${p.t}</span></label>`;
const BGG_CODES6 = [
  ['Attack modifier deck', '1custom20{+0;+0;+0;+0;+0;+0;+1;+1;+1;+1;+1;-1;-1;-1;-1;-1;+2;-2;x2;Miss}'],
  ['Random side scenario', '1custom5{1;9;10;13;17}'],
  ['Random item design', '1custom9{81;83;87;88;91;92;94;95;96}'],
  ['Battle goal draw', '2custom2{1;2}'],
];
const codeRow = ([label, code]) => `<div class="coderow"><div><b>${label}</b><code>${code}</code></div><button type="button" class="btn6">${ICON.codes} Copy</button></div>`;
const MODAL = (key, title, body, cls = '') => `<div class="mmodal" id="modal-${key}" hidden role="dialog" aria-modal="true" aria-label="${title}">
  <div class="mmodalbox ${cls}"><button type="button" class="mmodalx" data-modalclose aria-label="Close">&times;</button><h2 id="modaltitle-${key}">${title}</h2>${body}</div></div>`;
const modalsHTML = [
  MODAL('amd', 'Attack modifier deck', `<div class="amdgrid" id="amdreal"><p class="mrow">Loading the real ${D.cls} deck&hellip;</p></div>
    <p class="mrow">Composition reflects taken perks below &middot; faces and card art are the real HavenMap attack-modifier assets</p>
    <div class="coderow" id="amdcoderow"><div><b>GeekRoller code</b><code id="amdcode">1custom20{+0;+0;+0;+0;+0;+0;+1;+1;+1;+1;+1;-1;-1;-1;-1;-1;+2;-2;x2;Miss}</code></div><button type="button" class="btn6" data-copy="amdcode">${ICON.codes} Copy</button></div>`),
  MODAL('perks', 'Perks &amp; masteries', `<h3>Perks <span id="perkcount">&nbsp;</span></h3><div class="perklist am-perklist" id="perksreal"><p class="mrow">Loading the real ${D.cls} perk list&hellip;</p></div>
    <h3>Masteries <span>${D.masteries} of ${MASTERIES6.length}</span></h3><div class="perklist">${MASTERIES6.map(perkRow).join('')}</div>`, 'big'),
  MODAL('journal', 'Journal', `<div class="seg jtabs" role="tablist" aria-label="Journal section">
      <button type="button" data-jtab="quest" aria-pressed="true">Personal quest</button>
      <button type="button" data-jtab="goal" aria-pressed="false">Battle goal</button>
      <button type="button" data-jtab="notes" aria-pressed="false">Notes</button></div>
    <div class="jtab" data-jpane="quest"><h4>PQ14 &middot; The Oathbreaker</h4><p class="mrow">Kill 100 enemies with melee attacks. Progress: 62 of 100.</p><button type="button" class="btn6">Mark progress</button></div>
    <div class="jtab" data-jpane="goal" hidden><h4>Battle goal</h4><p class="mrow">No goal drawn for this scenario yet.</p><button type="button" class="btn6">Draw a goal</button></div>
    <div class="jtab" data-jpane="notes" hidden><textarea class="notesarea" placeholder="Notes for this character"></textarea></div>`),
  MODAL('mat', 'Character mat', `<div class="matflip"><img src="${D.mat}" alt="${D.cls} mat, front" id="matimg" data-front="${D.mat}" data-back="${D.matBack}" role="button" tabindex="0" title="Click to flip"></div>`, 'big'),
  MODAL('codes', 'BGG forum codes', `<div class="codelist">${BGG_CODES6.map(codeRow).join('')}</div>`),
  MODAL('enh', 'Enhancements', `<table class="enhtable"><tr><th>Card</th><th>Top</th><th>Bottom</th><th>Price</th></tr>
      <tr><td>Net Shooter</td><td>Attack +1</td><td>&ndash;</td><td>150g</td></tr></table>
    <button type="button" class="btn6">+ Add enhancement</button>`),
  // The zoom preview is a sibling of .mmodalbox (not inside it): .mmodalbox auto-sizes to its content and clips via
  // overflow:auto, so with few cards in a pile the box can be shorter than the preview and would clip it. Siblings
  // of the box, positioned fixed to the viewport, can never be clipped by the box's own size.
  `<div class="mmodal" id="modal-pilecards" hidden role="dialog" aria-modal="true" aria-label="Pile">
    <div class="mmodalbox narrow"><button type="button" class="mmodalx" data-modalclose aria-label="Close">&times;</button><h2 id="modaltitle-pilecards">Pile</h2><div class="pilelist" id="pilemodallist"></div></div>
    <img class="pilezoom" id="pilezoomimg" alt="" hidden>
  </div>`,
].join('');
const p6css = `
/* The real attack-modifier card art (.pc / .pc-frame / .pc-full / .pc-unique, scripts/amd/card.js) needs
   its structural CSS -- brought in here rather than via a <link> in page() (shared by every mockup page). */
@import url('../../scripts/amd/amd.css');
.stage6{display:grid;grid-template-columns:150px minmax(0,1fr) 112px 64px;grid-template-rows:auto minmax(0,1fr);gap:12px;padding:12px;height:calc(100vh - 34px);min-height:700px;background:radial-gradient(ellipse at 50% 40%,#2b3a2c 0%,#1a2519 70%,#121a12 100%)}
.hud{grid-column:1/-1;display:flex;gap:16px;align-items:center;background:rgba(18,15,11,.78);border:1px solid var(--line);border-radius:12px;padding:8px 14px}
.hud .portrait{width:64px;height:64px;border-radius:50%;border:2px solid var(--accent)}.hud h1{margin:0;font-size:19px}.hud .sub{color:var(--muted);font-size:13px}
.lvl{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent);color:#1b150c;font-weight:800;font-size:20px}
.hud .xp{width:240px}.hud .stat{display:flex;flex-direction:column;align-items:center;font-size:12px;color:var(--muted)}.hud .stat b{font-size:18px;color:var(--text)}.hud .counters{margin-left:auto}
.shelf6{display:grid;grid-template-columns:1fr 1fr;gap:6px;align-content:start;min-height:0}.shelf6 h4{grid-column:1/-1;margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
.shelf6 .it{transition:.15s;cursor:pointer}.shelf6 .it:hover{transform:scale(2.2);z-index:9;transform-origin:0 50%;box-shadow:0 10px 30px rgba(0,0,0,.7)}.shelf6 .it:nth-of-type(even):hover{transform-origin:100% 50%}
.shelf6 .it.spent img{filter:grayscale(.5) brightness(.75)}.shelf6 .it.consumed img{filter:grayscale(1) brightness(.55)}
.itbadge{position:absolute;right:2px;top:2px;width:17px;height:17px;border-radius:50%;background:rgba(18,15,11,.92);border:1.5px solid var(--accent);display:flex;align-items:center;justify-content:center;color:var(--accent)}
.itbadge svg{width:10px;height:10px}.it.consumed .itbadge{border-color:#c98a8a;color:#c98a8a}
.board6{display:grid;grid-template-rows:minmax(0,32%) minmax(0,1fr);gap:12px;min-width:0;min-height:0;container-type:size}
.toprow{--ch:calc(32cqh - 36px);display:grid;grid-template-columns:minmax(0,1fr) calc(var(--ch) * 10 / 7 + 46px);gap:12px;min-height:0}
.zone{position:relative;border:2px dashed rgba(236,223,200,.28);border-radius:14px;background:rgba(0,0,0,.2);padding:26px 12px 10px;display:flex;gap:14px;justify-content:center;align-items:stretch;min-height:0}
.activelist{display:flex;gap:14px;justify-content:center;align-items:stretch;flex:1;min-width:0}
.activelist .ac{cursor:grab;transition:transform .14s,box-shadow .14s}.activelist .ac:active{cursor:grabbing}.activelist .ac.over{outline:2px solid var(--accent)}.activelist .ac.dragging{opacity:.35;pointer-events:none}
.activelist .ac:hover{transform:scale(var(--hz,1.35));z-index:20;box-shadow:0 14px 34px rgba(0,0,0,.75)}
.zone .zlabel{position:absolute;left:14px;top:6px}.zone .zlabel b{color:var(--text)}
.zone.play{border-color:rgba(199,164,74,.55);background:rgba(199,164,74,.07)}
.slot6{position:relative;display:flex;flex-direction:column;align-items:center;min-height:0;height:100%;border-radius:8px;transition:box-shadow .12s}.slot6 .num{position:absolute;left:-4px;top:-4px;z-index:3;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#1b150c;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
.slot6.over{box-shadow:0 0 0 2px var(--accent) inset}
.slotcard{height:100%;display:flex;min-height:0}
.slotempty{height:100%;aspect-ratio:5/7;width:auto;border:2px dashed rgba(236,223,200,.25);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.1em}
.flipcard.dragging{opacity:.35;pointer-events:none}
.zone .ac,.flipcard{height:100%;aspect-ratio:5/7;width:auto}
.flipcard{perspective:900px;cursor:pointer;position:relative;transition:transform .14s,box-shadow .14s}.flipinner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .5s}.flipcard.is-front .flipinner{transform:rotateY(180deg)}
.flipcard.is-front:hover{transform:scale(var(--hz,1.3));z-index:20;box-shadow:0 14px 34px rgba(0,0,0,.75)}
.face{position:absolute;inset:0;backface-visibility:hidden;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.6)}.face.front{transform:rotateY(180deg)}.face img{width:100%;height:100%;object-fit:cover;display:block}
.cardback{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--accent);background:radial-gradient(circle at 50% 40%,#4a3a22 0%,#2a2014 70%);border:3px solid #1b150c;outline:2px solid var(--accent);outline-offset:-9px;border-radius:8px;text-transform:uppercase;letter-spacing:.18em;font-size:12px}
.cardback::before{content:'';position:absolute;inset:14px;border:1px solid rgba(199,164,74,.5);border-radius:5px}
.fliphint{display:none}
.hand6{position:relative;z-index:10;border-radius:14px;overflow:visible;min-height:0;background:linear-gradient(0deg,rgba(0,0,0,.35),transparent)}
.hbar{position:absolute;left:0;right:0;top:0;z-index:30;display:flex;align-items:center;gap:12px;padding:5px 14px;height:30px}
.hbar .zlabel b{color:var(--text)}.hctl{margin-left:auto;display:flex;align-items:center;gap:10px}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:7px;overflow:hidden}.seg button{background:#2d2519;color:var(--muted);border:0;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer}.seg button[aria-pressed=true]{background:var(--accent);color:#1b150c}
.btn6{background:#2d2519;color:var(--text);border:1px solid var(--line);border-radius:7px;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.btn6:hover{border-color:var(--accent);color:var(--accent)}
.fan6{position:absolute;left:12px;right:12px;top:32px;bottom:8px;display:grid;grid-template-columns:repeat(7,max-content);grid-auto-rows:calc(34cqh - 28px);gap:4px;justify-content:center}
.fan6 .ac{height:100%;width:auto;aspect-ratio:5/7;cursor:grab;transition:transform .14s,box-shadow .14s}.fan6 .ac:active{cursor:grabbing}
.fan6 .ac{transform-origin:50% 100%}.fan6 .ac:hover{transform:scale(var(--hz,1.85));z-index:35;box-shadow:0 16px 40px rgba(0,0,0,.8)}
.fan6 .ac.over{outline:2px solid var(--accent);transform:translateX(10px)}.fan6 .ac.dragging{opacity:.35;pointer-events:none}
.inib{position:absolute;left:5px;top:5px;z-index:2;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:rgba(18,15,11,.88);border:1.5px solid var(--accent);color:var(--accent);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
.hand6[data-layout=spread] .inib{display:none}
.hand6[data-layout=fan] .fan6{display:flex;justify-content:center;align-items:flex-end;left:0;right:0;top:30px;bottom:0;padding:0 10px}
.hand6[data-layout=fan] .fan6 .ac{height:auto;width:min(180px,12.4vw);margin:0 calc(min(180px,12.4vw) * -.35);transform-origin:50% 160%;transform:rotate(calc((var(--i) - 6.5) * 1.5deg)) translateY(8%)}
.hand6[data-layout=fan] .fan6 .ac:hover{transform:translateY(-30%) scale(var(--hz,1.45));z-index:35}
.inivalue{gap:4px;position:absolute;right:-4px;top:-4px;z-index:3;min-width:26px;height:22px;padding:0 6px;border-radius:11px;background:#1b150c;border:1.5px solid var(--accent);color:var(--accent);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;white-space:nowrap}
.slot6.first .inivalue::after{content:'?'}.slot6.first:has(.is-front) .inivalue::after{content:attr(data-ini)}
.piles6{display:grid;grid-template-rows:1fr 1fr;gap:12px;min-height:0}
.pile6{border:2px dashed rgba(236,223,200,.28);border-radius:12px;background:rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:0;overflow:hidden;padding:6px}
.pile6.target{border-color:var(--accent);background:rgba(199,164,74,.14)}.pile6 h4{margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.pile6 h4 b{color:var(--text);font-size:13px}
.pile6.over{box-shadow:0 0 0 2px var(--accent) inset}
.pile6{cursor:pointer}.pile6 .ac{cursor:grab}.pile6 .ac:active{cursor:grabbing}.pile6 .ac.dragging{opacity:.35;pointer-events:none}
.pilelist{display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow:auto}
.pilerow6{display:flex;align-items:center;gap:10px;background:#2d2519;border:1px solid var(--line);border-radius:8px;padding:6px 10px}
.pilerow6 img{width:34px;height:48px;object-fit:cover;border-radius:4px;cursor:pointer}.pilerow6 span{flex:1;font-size:13px}
.pilezoom{position:fixed;left:max(18px,calc(50vw - 370px));top:50%;transform:translateY(-50%);height:280px;width:auto;aspect-ratio:5/7;object-fit:cover;border-radius:10px;box-shadow:0 20px 50px rgba(0,0,0,.8);pointer-events:none;z-index:210}
.pilezoom[hidden]{display:none}
.pile6 .ac{height:56%;width:auto;box-shadow:4px 4px 0 -1px #2b2318,8px 8px 0 -2px #241c13}.pile6.lost .ac{filter:grayscale(.8) brightness(.7)}
.dock{display:flex;flex-direction:column;gap:8px;align-items:stretch}.dock .mbtn{flex-direction:column;height:56px;font-size:10px;gap:2px;padding:4px 2px}.dock .mbtn svg{width:20px;height:20px}
.mmodal{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.65)}
.mmodal[hidden]{display:none}
.mmodalbox{position:relative;width:min(560px,100%);max-height:86vh;overflow:auto;background:var(--panel);border:1px solid var(--accent);border-radius:12px;padding:18px 22px;box-shadow:0 20px 60px rgba(0,0,0,.7)}
.mmodalbox.narrow{width:min(300px,100%)}
.mmodalbox.big{width:min(900px,96vw)}
.mmodalbox h2{margin:0 28px 14px 0;color:var(--accent);font-size:17px}
.mmodalbox h3{margin:16px 0 6px;font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
.mmodalbox h3:first-of-type{margin-top:0}.mmodalbox h3 span{color:var(--text);text-transform:none;letter-spacing:0;font-size:12px}
.mmodalx{position:absolute;top:10px;right:10px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-radius:7px;color:var(--muted);font-size:20px;line-height:1;cursor:pointer}
.mmodalx:hover{background:rgba(199,164,74,.15);color:var(--accent)}
.amdgrid{display:flex;flex-wrap:wrap;gap:10px}
.amdtile.real{display:flex;flex-direction:column;align-items:center;gap:4px}
.amdtile.real .pc{--pc-width:72px;border:1px solid var(--line)}
.amdtile.real b{font-size:13px;color:var(--text);background:#2d2519;border:1px solid var(--line);border-radius:999px;min-width:20px;padding:0 5px;text-align:center}
.mrow{color:var(--muted);font-size:12px;margin:8px 0}
.perklist{display:flex;flex-direction:column;gap:1px}
.perkrow{display:flex;align-items:center;gap:10px;padding:5px 4px;border-radius:6px;cursor:pointer;font-size:13px}
.perkrow:hover{background:rgba(199,164,74,.1)}.perkrow input{width:16px;height:16px;accent-color:var(--accent)}.perkrow.on span{color:var(--text)}.perkrow span{color:var(--muted)}
/* Real perk rows (am-perk*): same data/shape as scripts/decks.js's amPerkRowHtml, rendered client-side. */
.am-perklist{gap:4px}
.am-perk{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;background:#2d2519;border:1px solid var(--line);cursor:pointer}
.am-perk.is-on{border-color:var(--accent);background:rgba(199,164,74,.12)}.am-perk.is-partial{border-style:dashed}
.am-perk-boxes{display:flex;gap:3px;flex-shrink:0}
.am-perk-check{width:20px;height:20px;border-radius:5px;border:1px solid var(--line);background:#120f0b;color:var(--accent);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center}
.am-perk-check.is-checked{background:var(--accent);color:#1b150c;border-color:var(--accent)}
.am-perk-cards{display:flex;align-items:center;gap:4px;flex-shrink:0}
.am-perk-cards .pc{--pc-width:46px;border:1px solid var(--line)}
#amdreal .pc,.am-perk-cards .pc{cursor:zoom-in}
.pcbig[hidden]{display:none}
.pcbig{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);cursor:zoom-out}
.pcbig .pc{--pc-width:min(86vw,560px);border:1px solid var(--line);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.8)}
.am-perk-arrow{color:var(--muted);display:flex}.am-perk-gone{color:var(--muted);font-size:11px;font-style:italic}
.am-perk-text{font-size:12px;color:var(--muted);flex:1}
.am-perk-tag{margin-left:auto;font-size:11px;color:var(--accent);flex-shrink:0}
.jtabs{margin-bottom:12px}.jtab h4{margin:0 0 4px;color:var(--text)}
.notesarea{width:100%;min-height:140px;background:#120f0b;color:var(--text);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;resize:vertical}
.matflip{display:flex;justify-content:center}.matflip img{width:100%;border-radius:8px;border:1px solid var(--line);cursor:pointer}
.codelist{display:flex;flex-direction:column;gap:8px}
.coderow{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#2d2519;border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.coderow b{display:block;font-size:12px;color:var(--muted);margin-bottom:3px}.coderow code{font-size:11px;word-break:break-all;color:var(--text)}
.enhtable{width:100%;border-collapse:collapse;margin-bottom:12px}.enhtable th,.enhtable td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);font-size:13px}
.enhtable th{color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
`;
const p6 = page('merc-6-playmat-v2', '6 Playmat v2', p6css, `
<div class="stage6">
  <header class="hud">${portrait()}<div><h1>${D.name}</h1><div class="sub">${D.cls} &middot; played by ${D.player}</div><div class="chips">${chips(D.traits)}${chips(D.special, 'info')}</div></div>
    <div class="lvl" title="Level">${D.lv}</div>${xpBar()}<div class="stat"><b>${D.gold}</b>gold</div><div class="stat"><b>${D.inherited}</b>inherited</div>${counters()}</header>
  <section class="shelf6" aria-label="Items"><h4>Items <span>${D.items.length}</span></h4>${D.items.map(item6El).join('')}</section>
  <section class="board6">
    <div class="toprow">
      <div class="zone"><span class="zlabel">Active &middot; <b id="activecount">${A6.length}</b></span><div class="activelist">${A6.map(c => cardEl(c).replace('<div class="ac ', `<div draggable="true" data-ini="${c.ini}" class="ac `)).join('')}</div></div>
      <div class="zone play"><span class="zlabel">Play area &middot; <b>2</b> cards</span>
        <div class="slot6 first" data-slot="1"><span class="num">1</span><span class="inivalue" data-ini="${PL6[0].ini}" title="The first card sets your initiative">ini </span><div class="slotcard">${flipEl(PL6[0], false)}</div></div>
        <div class="slot6" data-slot="2"><span class="num">2</span><div class="slotcard">${flipEl(PL6[1], true)}</div></div></div>
    </div>
    <div class="hand6" data-layout="spread"><div class="hbar"><span class="zlabel">Hand &middot; <b id="handcount">${H6.length}</b> of 14</span><span class="hctl"><span class="seg" role="group" aria-label="Hand layout"><button type="button" data-layout="spread" aria-pressed="true">Spread</button><button type="button" data-layout="fan" aria-pressed="false">Fan</button></span><button type="button" class="btn6" id="sortbtn" title="Sort the hand by initiative">${ICON.drag} Sort by initiative</button></span></div><div class="fan6">${hand6}</div></div>
  </section>
  <section class="piles6"><div class="pile6 target" data-pile="discard"><h4>Discard <b id="discardcount">${DI6.length}</b></h4><div class="pilecard">${cardEl(DI6[2]).replace('<div class="ac ', '<div draggable="true" class="ac ')}</div><span class="hint">drop</span></div><div class="pile6 lost target" data-pile="lost"><h4>Lost <b id="lostcount">${LO6.length}</b></h4><div class="pilecard">${cardEl(LO6[0]).replace('<div class="ac ', '<div draggable="true" class="ac ')}</div></div></section>
  <aside class="dock" aria-label="Modals">${MODALS.map(m => mbtn(m[0])).join('')}</aside>
</div>
${modalsHTML}
<script>
// Flip is delegated (not bound per-element) because a slot's card is replaced when a new one is dragged in.
document.querySelector('.board6').addEventListener('click',e=>{const f=e.target.closest('.flipcard');if(f)f.classList.toggle('is-front')});
document.querySelector('.board6').addEventListener('keydown',e=>{const f=e.target.closest('.flipcard');if(f&&(e.key==='Enter'||e.key===' ')){e.preventDefault();f.classList.toggle('is-front')}});
const hand=document.querySelector('.fan6'), wrap=document.querySelector('.hand6'), handCount=document.getElementById('handcount');
const active=document.querySelector('.activelist'), activeCount=document.getElementById('activecount');
const sortHand=()=>{[...hand.children].sort((a,b)=>a.dataset.ini-b.dataset.ini).forEach(c=>hand.appendChild(c));[...hand.children].forEach((c,i)=>c.style.setProperty('--i',i))};
document.getElementById('sortbtn').addEventListener('click',sortHand);sortHand();
document.querySelectorAll('.hctl .seg button').forEach(b=>b.addEventListener('click',()=>{wrap.dataset.layout=b.dataset.layout;document.querySelectorAll('.hctl .seg button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
const reindexHand=()=>{[...hand.children].forEach((c,i)=>c.style.setProperty('--i',i));handCount.textContent=hand.children.length};
// ---- unified drag/drop: hand, active area and play slots can all give and take cards, one shared dragData ----
const gearSVG='${gear}';
function flipHTML(data,front){return '<div class="flipcard'+(front?' is-front':'')+'" draggable="true" data-name="'+data.name+'" data-img="'+data.img+'" data-ini="'+data.ini+'" role="button" tabindex="0" title="Click to flip: '+data.name+'"><div class="flipinner"><div class="face back"><div class="cardback">'+gearSVG+'<b>${D.cls}</b></div></div><div class="face front"><img src="'+data.img+'" alt="'+data.name+'"></div></div></div>'}
function toCardEl(data){const el=document.createElement('div');el.className='ac';el.title=data.name;el.draggable=true;if(data.ini)el.dataset.ini=data.ini;el.innerHTML='<img src="'+data.img+'" alt="'+data.name+'" loading="lazy">'+(data.ini?'<span class="inib" title="Initiative '+data.ini+'">'+data.ini+'</span>':'');return el}
function placeInSlot(slot,data){slot.querySelector('.slotcard').innerHTML=flipHTML(data,false);if(slot.classList.contains('first'))slot.querySelector('.inivalue').dataset.ini=data.ini}
function takeFromSlot(slot){const f=slot.querySelector('.flipcard');const data=f?{name:f.dataset.name,img:f.dataset.img,ini:f.dataset.ini}:null;slot.querySelector('.slotcard').innerHTML='<div class="slotempty">Empty</div>';if(slot.classList.contains('first')){const iv=slot.querySelector('.inivalue');if(iv)iv.dataset.ini=''}return data}
let dragData=null;
// Removes whatever is being dragged from wherever it came from (hand/active list, a play slot, or a pile).
function sourceRemove(d){
  if(d.kind==='list'){d.el.remove();if(d.container===hand)reindexHand();else activeCount.textContent=active.children.length}
  else if(d.kind==='slot'){takeFromSlot(d.slot)}
  else if(d.kind==='pile'){removeFromPile(d.pile)}
}
function wireList(container,onDrop){
  container.addEventListener('dragstart',e=>{
    const el=e.target.closest('.ac');if(!el)return;
    dragData={kind:'list',container,el,name:el.querySelector('img').alt,img:el.querySelector('img').src,ini:el.dataset.ini||''};
    el.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','card');
  });
  container.addEventListener('dragend',e=>{
    const el=e.target.closest('.ac');if(el)el.classList.remove('dragging');
    container.querySelectorAll('.over').forEach(c=>c.classList.remove('over'));
    dragData=null;
  });
  container.addEventListener('dragover',e=>{
    if(!dragData)return;e.preventDefault();
    container.querySelectorAll('.over').forEach(c=>c.classList.remove('over'));
    const t=e.target.closest('.ac');if(t&&t!==dragData.el)t.classList.add('over');
  });
  container.addEventListener('drop',e=>{
    e.preventDefault();
    if(!dragData)return;
    const t=e.target.closest('.ac');
    if(dragData.kind==='list'){
      if(t&&t!==dragData.el)container.insertBefore(dragData.el,t);else if(dragData.el.parentElement!==container)container.appendChild(dragData.el);
    }else{
      const el=toCardEl(dragData);
      if(t)container.insertBefore(el,t);else container.appendChild(el);
      sourceRemove(dragData);
    }
    onDrop();
    dragData=null;
  });
}
// ---- hover zoom to the same size everywhere: hand, active and play cards all start at different rest sizes, so a
// fixed scale factor would zoom them to different absolute sizes. Measure the real rest height on hover and set a
// per-element --hz scale that lands every one of them at the same HOVER_H target, whatever its own resting size is.
const HOVER_H=320;
document.addEventListener('mouseover',e=>{
  const el=e.target.closest('.fan6 .ac, .activelist .ac, .flipcard');
  if(!el)return;
  if(el.classList.contains('flipcard')&&!el.classList.contains('is-front'))return;
  const h=el.getBoundingClientRect().height;
  if(h>0)el.style.setProperty('--hz',HOVER_H/h);
});
// ---- item state: click cycles Available -> Spent -> Consumed -> Available; no pips, the tile shows it ----
const ITEM_ICONS=[null,'${ITEM_STATE_ICON[1]}','${ITEM_STATE_ICON[2]}'];
const ITEM_NAMES=${JSON.stringify(ITEM_STATE_NAME)};
document.querySelectorAll('[data-itemstate]').forEach(tile=>{
  let state=tile.classList.contains('spent')?1:tile.classList.contains('consumed')?2:0;
  const base=tile.title.split(' — ')[0];
  tile.addEventListener('click',()=>{
    state=(state+1)%3;
    tile.classList.remove('spent','consumed');
    if(state===1)tile.classList.add('spent');else if(state===2)tile.classList.add('consumed');
    const old=tile.querySelector('.itbadge');if(old)old.remove();
    if(ITEM_ICONS[state])tile.insertAdjacentHTML('beforeend','<span class="itbadge">'+ITEM_ICONS[state]+'</span>');
    tile.title=base+' — '+ITEM_NAMES[state]+', click to change';
  });
});
wireList(hand,reindexHand);
wireList(active,()=>{activeCount.textContent=active.children.length});
document.querySelector('.board6').addEventListener('dragstart',e=>{
  const f=e.target.closest('.flipcard');if(!f)return;
  dragData={kind:'slot',slot:f.closest('.slot6'),name:f.dataset.name,img:f.dataset.img,ini:f.dataset.ini};
  f.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','card');
});
document.querySelector('.board6').addEventListener('dragend',e=>{const f=e.target.closest('.flipcard');if(f)f.classList.remove('dragging');document.querySelectorAll('.slot6.over').forEach(s=>s.classList.remove('over'));dragData=null});
document.querySelectorAll('.slot6').forEach(slot=>{
  slot.addEventListener('dragover',e=>{if(!dragData)return;e.preventDefault();slot.classList.add('over')});
  slot.addEventListener('dragleave',()=>slot.classList.remove('over'));
  slot.addEventListener('drop',e=>{
    e.preventDefault();slot.classList.remove('over');
    if(!dragData)return;
    if(dragData.kind==='slot'&&dragData.slot===slot){dragData=null;return}
    const incoming={name:dragData.name,img:dragData.img,ini:dragData.ini};
    const prev=takeFromSlot(slot);
    placeInSlot(slot,incoming);
    if(dragData.kind==='list'){
      dragData.el.remove();
      if(prev)hand.appendChild(toCardEl(prev));
      reindexHand();
    }else if(dragData.kind==='slot'){
      if(prev)placeInSlot(dragData.slot,prev);else takeFromSlot(dragData.slot);
    }else{
      removeFromPile(dragData.pile);
      if(prev){hand.appendChild(toCardEl(prev));reindexHand()}
    }
    dragData=null;
  });
});
// ---- discard and lost: real data (not just a lookalike top card), so a specific one can be recovered ----
const discardCards=${JSON.stringify(DI6.map(c => ({ name: c.name, img: c.img })))};
const lostCards=${JSON.stringify(LO6.map(c => ({ name: c.name, img: c.img })))};
const PILES={discard:discardCards,lost:lostCards};
function pileEls(key){const el=document.querySelector('[data-pile="'+key+'"]');return{el,cardWrap:el.querySelector('.pilecard'),countEl:document.getElementById(key+'count')}}
function renderPileTop(key){
  const{cardWrap,countEl}=pileEls(key),arr=PILES[key],top=arr[arr.length-1];
  countEl.textContent=arr.length;
  cardWrap.innerHTML=top?'<div class="ac" draggable="true" title="'+top.name+'"><img src="'+top.img+'" alt="'+top.name+'" loading="lazy"></div>':'<div class="slotempty">Empty</div>';
}
function addToPile(key,data){PILES[key].push(data);renderPileTop(key)}
function removeFromPile(key){PILES[key].pop();renderPileTop(key)}
const pileModal=document.getElementById('modal-pilecards'),pileModalTitle=document.getElementById('modaltitle-pilecards'),pileModalList=document.getElementById('pilemodallist');
const pileZoomImg=document.getElementById('pilezoomimg');
let pileModalKey=null;
// The row list scrolls (overflow:auto), so an in-place CSS zoom would just get clipped -- show the full-size image
// in a separate overlay instead, positioned over the modal rather than inside the scrolling list.
pileModalList.addEventListener('mouseover',e=>{
  const img=e.target.closest('.pilerow6')?.querySelector('img');
  if(!img)return;
  pileZoomImg.src=img.src;pileZoomImg.alt=img.alt;pileZoomImg.hidden=false;
});
pileModalList.addEventListener('mouseout',e=>{
  if(!e.relatedTarget||!pileModalList.contains(e.relatedTarget))pileZoomImg.hidden=true;
});
function renderPileModalList(){
  const arr=PILES[pileModalKey];
  pileModalList.innerHTML=arr.length?arr.map((c,i)=>'<div class="pilerow6"><img src="'+c.img+'" alt="'+c.name+'"><span>'+c.name+'</span><button type="button" class="btn6" data-recover="'+i+'">Recover</button></div>').reverse().join(''):'<p class="mrow">Nothing here yet</p>';
}
function openPileModal(key){pileModalKey=key;pileModalTitle.textContent=key==='discard'?'Discard':'Lost';renderPileModalList();pileZoomImg.hidden=true;pileModal.hidden=false}
pileModalList.addEventListener('click',e=>{
  const b=e.target.closest('[data-recover]');if(!b||!pileModalKey)return;
  const idx=Number(b.dataset.recover),arr=PILES[pileModalKey];
  const[card]=arr.splice(idx,1);
  renderPileTop(pileModalKey);
  hand.appendChild(toCardEl(card));reindexHand();
  renderPileModalList();
});
document.querySelectorAll('.pile6').forEach(pile=>{
  const key=pile.dataset.pile;
  pile.addEventListener('dragstart',e=>{
    const el=e.target.closest('.ac');if(!el)return;
    dragData={kind:'pile',pile:key,name:el.querySelector('img').alt,img:el.querySelector('img').src};
    el.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','card');
  });
  pile.addEventListener('dragend',e=>{const el=e.target.closest('.ac');if(el)el.classList.remove('dragging');pile.classList.remove('over');dragData=null});
  pile.addEventListener('dragover',e=>{if(!dragData)return;e.preventDefault();pile.classList.add('over')});
  pile.addEventListener('dragleave',()=>pile.classList.remove('over'));
  pile.addEventListener('drop',e=>{
    e.preventDefault();pile.classList.remove('over');
    if(!dragData)return;
    if(dragData.kind==='pile'&&dragData.pile===key){dragData=null;return}
    addToPile(key,{name:dragData.name,img:dragData.img});
    sourceRemove(dragData);
    dragData=null;
  });
  pile.addEventListener('click',()=>openPileModal(key));
});
// ---- modals: open/close, journal tabs, mat flip ----
document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>{const m=document.getElementById('modal-'+b.dataset.modal);if(m)m.hidden=false}));
function closeModals(){document.querySelectorAll('.mmodal').forEach(m=>{m.hidden=true})}
document.querySelectorAll('.mmodal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals()}));
document.querySelectorAll('[data-modalclose]').forEach(b=>b.addEventListener('click',closeModals));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});
document.querySelectorAll('.jtabs button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.jtabs button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  document.querySelectorAll('.jtab').forEach(p=>{p.hidden=p.dataset.jpane!==b.dataset.jtab});
}));
const matImg=document.getElementById('matimg');
const flipMat=()=>{
  const showingBack=matImg.src===matImg.dataset.back;
  matImg.src=showingBack?matImg.dataset.front:matImg.dataset.back;
  matImg.alt='${D.cls} mat, '+(showingBack?'front':'back');
};
if(matImg){
  matImg.addEventListener('click',flipMat);
  matImg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flipMat()}});
}
</script>
<script type="module">
// Attack modifier deck and perks: rendered here from the real HavenMap data/card model, not faked.
// heroDeck.js and card.js are pure (no map-tool state coupling) so they import unmodified; the perk
// grouping/toggle LOGIC of scripts/attackMods.js (classPerkLayout/perkGroup/applyPerk/amToggleBox) is
// re-expressed below against a plain local {perks:[],boxes:{}} object instead of that module's
// URL-keyed deck state, since this mockup has no map-tool "g" slot to key off of.
import { heroCatalog, heroPerkClass, groupPerks, perkBoxes, perkLabel, perkDelta } from '../../scripts/amd/heroDeck.js';
import { buildCard } from '../../scripts/amd/card.js';

const CLASS_NAME = ${JSON.stringify(D.cls)};
// The standard 20-card deck (scripts/attackMods.js's AM_TYPES, trimmed to the 7 non-imbuement faces --
// heroCatalog only keeps the standard entries to seed the catalog; imbuement faces are irrelevant here).
const AM_STANDARD = [
  { key: 'p0', face: '+0', value: '+0', count: 6, shuffle: false },
  { key: 'p1', face: '+1', value: '+1', count: 5, shuffle: false },
  { key: 'm1', face: '-1', value: '-1', count: 5, shuffle: false },
  { key: 'p2', face: '+2', value: '+2', count: 1, shuffle: false },
  { key: 'm2', face: '-2', value: '-2', count: 1, shuffle: false },
  { key: 'x2', face: 'x2', value: 'x2', count: 1, shuffle: true },
  { key: 'miss', face: 'Miss', value: 'null', count: 1, shuffle: true },
];
const catalog = heroCatalog(CLASS_NAME, AM_STANDARD);
const heroClass = heroPerkClass(CLASS_NAME);
const perks = (heroClass?.perks || []).map((p, index) => ({ ...p, index, boxes: perkBoxes(p), label: perkLabel(p) }));
const groups = groupPerks(perks).map(g => g.members.map(m => m.index));

// Local perk/box state: the same shape state.mercenaries[i].am.{perks,boxes} has in HavenMap.
const perkState = { perks: [], boxes: {} };

function composition() {
  const counts = Object.fromEntries(catalog.map(c => [c.key, c.extra ? 0 : c.count]));
  for (const i of perkState.perks) for (const [k, n] of Object.entries(perkDelta(perks[i]))) counts[k] = (counts[k] || 0) + n;
  return counts;
}

// Click-to-enlarge for any card in the deck / perk modals: clone the card layers into a lightbox.
const pcBig = document.createElement('div');
pcBig.className = 'pcbig';
pcBig.hidden = true;
document.body.appendChild(pcBig);
const closePcBig = () => { pcBig.hidden = true; pcBig.innerHTML = ''; };
pcBig.addEventListener('click', closePcBig);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pcBig.hidden) { e.stopPropagation(); closePcBig(); } }, true);
document.addEventListener('click', e => {
  const pc = e.target.closest && e.target.closest('#amdreal .pc, .am-perk-cards .pc');
  if (!pc) return;
  e.stopPropagation();
  pcBig.innerHTML = '';
  pcBig.appendChild(pc.cloneNode(true));
  pcBig.hidden = false;
}, true);

function renderAmd() {
  const counts = composition();
  const grid = document.getElementById('amdreal');
  grid.innerHTML = '';
  const faces = [];
  for (const c of catalog) {
    const n = counts[c.key] || 0;
    for (let i = 0; i < n; i++) faces.push(c.face);
    if (n <= 0) continue;
    const tile = document.createElement('div');
    tile.className = 'amdtile real';
    tile.title = c.face + (c.rolling ? ' (reshuffles the deck)' : '');
    tile.appendChild(buildCard(c.card, CLASS_NAME, !!c.extra));
    const badge = document.createElement('b');
    badge.textContent = n;
    tile.appendChild(badge);
    grid.appendChild(tile);
  }
  document.getElementById('amdcode').textContent = \`1custom\${faces.length}{\${faces.join(';')}}\`;
}

// Mirrors scripts/attackMods.js's perkGroup(): one row per group of identical perk entries.
function perkGroupRow(members) {
  const perk = members[0];
  const repeated = members.length > 1;
  const on = i => perkState.perks.includes(i);
  const mask = i => perkState.boxes[i] || 0;
  const boxes = repeated
    ? members.map(m => ({ box: 0, perk: m.index, ticked: on(m.index) }))
    : Array.from({ length: perk.boxes }, (_, i) => ({ box: i, perk: perk.index, ticked: on(perk.index) || !!(mask(perk.index) & (1 << i)) }));
  const done = repeated ? members.every(m => on(m.index)) : on(perk.index);
  const partial = !done && (repeated ? members.some(m => on(m.index)) : mask(perk.index) !== 0);
  return { perk, members, kind: repeated ? 'repeat' : perk.boxes > 1 ? 'linked' : 'single', boxes, done, partial };
}

// Mirrors scripts/attackMods.js's amToggleBox(): tick/untick one checkbox; the perk applies once
// every one of its boxes is ticked, and reverts as soon as one is unticked.
function toggleBox(index, box) {
  const perk = perks[index];
  const full = (1 << perk.boxes) - 1;
  const was = perkState.perks.includes(index) || (perkState.boxes[index] || 0) === full;
  const m = (perkState.perks.includes(index) ? full : (perkState.boxes[index] || 0)) ^ (1 << box);
  const now = m === full;
  if (was !== now) perkState.perks = now ? [...perkState.perks, index].sort((a, b) => a - b) : perkState.perks.filter(i => i !== index);
  if (m && !now) perkState.boxes[index] = m; else delete perkState.boxes[index];
  renderAll();
}

function perkRowEl(grp) {
  const p = grp.perk;
  const row = document.createElement('div');
  row.className = 'am-perk' + (grp.done ? ' is-on' : '') + (grp.partial ? ' is-partial' : '');
  const boxesEl = document.createElement('span');
  boxesEl.className = 'am-perk-boxes';
  for (const [k, b] of grp.boxes.entries()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'am-perk-check' + (b.ticked ? ' is-checked' : '');
    btn.textContent = b.ticked ? '\\u2713' : '';
    btn.title = grp.kind === 'repeat' ? \`Take this perk (\${k + 1} of \${grp.members.length})\` : p.boxes > 1 ? \`Box \${b.box + 1} of \${p.boxes}\` : 'Take this perk';
    btn.addEventListener('click', e => { e.stopPropagation(); toggleBox(b.perk, b.box); });
    boxesEl.appendChild(btn);
  }
  row.appendChild(boxesEl);
  const cardsEl = document.createElement('span');
  cardsEl.className = 'am-perk-cards';
  const addCards = (side, cards) => { for (const c of cards) cardsEl.appendChild(buildCard(c, CLASS_NAME, side === 'adds')); };
  if (p.removes.length) {
    addCards('removes', p.removes);
    const arrow = document.createElement('span');
    arrow.className = 'am-perk-arrow';
    arrow.textContent = '\\u2192';
    cardsEl.appendChild(arrow);
    if (p.adds.length) addCards('adds', p.adds);
    else { const g = document.createElement('span'); g.className = 'am-perk-gone'; g.textContent = 'removed'; cardsEl.appendChild(g); }
  } else addCards('adds', p.adds);
  row.appendChild(cardsEl);
  if (p.label && !p.removes.length && !p.adds.length) {
    const t = document.createElement('span');
    t.className = 'am-perk-text';
    t.textContent = p.label;
    row.appendChild(t);
  }
  if (grp.kind !== 'single') {
    const tag = document.createElement('span');
    tag.className = 'am-perk-tag';
    tag.textContent = grp.kind === 'repeat' ? \`\\u00d7\${grp.members.length}\` : \`all \${p.boxes}\`;
    row.appendChild(tag);
  }
  if (grp.boxes.length === 1) row.addEventListener('click', () => toggleBox(grp.boxes[0].perk, grp.boxes[0].box));
  return row;
}

function renderPerks() {
  const list = document.getElementById('perksreal');
  list.innerHTML = '';
  if (!heroClass) { list.innerHTML = '<p class="mrow">No perk data for ' + CLASS_NAME + '</p>'; document.getElementById('perkcount').textContent = ''; return; }
  for (const idxs of groups) list.appendChild(perkRowEl(perkGroupRow(idxs.map(i => perks[i]))));
  document.getElementById('perkcount').textContent = \`\${perkState.perks.length} of \${perks.length}\`;
}

function renderAll() { renderAmd(); renderPerks(); }
renderAll();

document.getElementById('amdcoderow')?.querySelector('[data-copy]')?.addEventListener('click', e => {
  const code = document.getElementById(e.currentTarget.dataset.copy)?.textContent;
  if (code) navigator.clipboard?.writeText(code).catch(() => {});
});
</script>`, notes(
  'The playmat, revised again. The play area, now next to the discard and lost piles because played cards go there most often, holds the two cards played this round, face down until you click one; the first card sets initiative (its value shows once it is flipped). The active area on its left keeps persistent effects face up. The hand holds 14 cards in two rows of seven with no overlap, so the details of every card can be read; "Fan" switches to a tight fan. A button sorts the hand by initiative; dragging a card onto another reorders by hand. Each card carries its initiative in a corner badge. Hover enlarges a card.',
  ['Every card in the hand is fully visible, no overlap', 'Sort by initiative with one click, or drag into your own order', 'Play slot 1 shows the initiative it sets'],
  ['Cards stay fairly small (about 140 px wide) until hovered', 'Two rows take more height than a fan; the top area has less room', 'Drag to reorder works on desktop; touch needs its own handling']));
fs.writeFileSync(OUT + 'merc-6-playmat-v2.html', p6);


fs.writeFileSync(OUT + 'mock.css', `/* Shared styles of the mercenary tab mockups (colours as the campaign app). */
:root{--bg:#16130f;--panel:#231d17;--line:#3a3026;--text:#ecdfc8;--muted:#a89a82;--accent:#c7a44a;--ok:#7fb069;--info:#6aa9d8;--warn:#d6a03c}
*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--text);font:14px/1.35 system-ui,Segoe UI,Roboto,sans-serif;padding-top:34px}
.mocknav{position:fixed;top:0;left:0;right:0;height:34px;z-index:100;display:flex;align-items:center;gap:6px;padding:0 12px;background:#0d0b08;border-bottom:1px solid var(--line);font-size:12px;overflow:auto;white-space:nowrap}
.mocknav b{margin-right:6px;color:var(--accent)}.mocknav a{color:var(--muted);text-decoration:none;padding:3px 9px;border-radius:6px;border:1px solid transparent}.mocknav a:hover{color:var(--text)}.mocknav a[aria-current]{color:#1b150c;background:var(--accent)}
.mocknav .legend{margin-left:auto;color:var(--muted)}
.mmark{position:absolute;right:3px;top:3px;width:7px;height:7px;border:1.5px solid var(--accent);border-radius:2px;box-shadow:2px -2px 0 -0.5px var(--accent)}.mmark.inline{position:static;display:inline-block;margin:0 2px;vertical-align:middle}
.mbtn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:#2d2519;color:var(--text);border:1px solid var(--line);border-radius:8px;padding:7px 10px;font:inherit;font-size:13px;cursor:pointer}
.mbtn:hover{border-color:var(--accent);color:var(--accent)}
.ac{position:relative;aspect-ratio:5/7;border-radius:8px;overflow:hidden;background:#120f0b;box-shadow:0 4px 10px rgba(0,0,0,.5);flex:none}.ac img{display:block;width:100%;height:100%;object-fit:cover}
.ac:hover{z-index:2}
.enh{position:absolute;right:5%;min-width:26px;height:26px;padding:0 4px;border-radius:13px;background:var(--accent);color:#1b150c;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid #1b150c;box-shadow:0 2px 6px rgba(0,0,0,.6)}.enh.top{top:19%}.enh.bottom{top:68%}
.it{position:relative;aspect-ratio:208/300;border-radius:6px;overflow:hidden;background:#120f0b;border:1px solid var(--line)}.it img{width:100%;height:100%;object-fit:contain;display:block}
.pips{position:absolute;left:4px;bottom:4px;display:flex;gap:3px}.pips i{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--accent);background:rgba(0,0,0,.5)}.pips i.on{background:var(--accent)}
.portrait{background-size:330% auto;background-position:10% 44%;background-repeat:no-repeat;background-color:#120f0b;flex:none}
.chips{display:flex;flex-wrap:wrap;gap:4px}.chip{background:#33291d;border:1px solid var(--line);border-radius:10px;padding:1px 8px;font-size:12px;color:var(--text)}.chip.info{border-color:var(--info)}button.chip{font:inherit;font-size:12px;cursor:pointer}
.hint{color:var(--muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.zlabel{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.xp{min-width:150px}.xpbar{height:8px;background:#120f0b;border:1px solid var(--line);border-radius:5px;overflow:hidden}.xpbar b{display:block;height:100%;background:linear-gradient(90deg,#8a6d27,var(--accent))}
.xpnum{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:2px}.xpnum span{color:var(--text);font-weight:600}.xpnum em{font-style:normal}.xpnum span{order:2}.xpnum em:first-of-type{order:1}.xpnum em:last-child{order:3}
.xp.compact .xpnum{display:none}
.counters{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ctr{display:inline-flex;align-items:center;gap:5px;background:#1c1711;border:1px solid var(--line);border-radius:8px;padding:2px 6px;font-size:12px}.ctr label{color:var(--muted)}.ctr b{min-width:1.2em;text-align:center}
.ctr button{background:#2d2519;color:var(--text);border:1px solid var(--line);border-radius:5px;width:20px;height:20px;line-height:1;cursor:pointer;padding:0}.ctr.add{width:auto;height:auto;padding:3px 8px;color:var(--muted);border-style:dashed;cursor:pointer;font:inherit;font-size:12px}
.drop h4{margin:0}
.notes{max-width:1100px;margin:18px auto 40px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:#1b160f}.notes h3{margin:0 0 6px;color:var(--accent)}.notes p{margin:0 0 8px}
.notes .pc{display:grid;grid-template-columns:1fr 1fr;gap:16px}.notes ul{margin:4px 0 0;padding-left:18px;color:var(--muted)}.notes b{color:var(--text)}
.idx{max-width:900px;margin:24px auto;padding:0 16px}.idx h1{color:var(--accent)}.idx .cards{display:grid;gap:10px}.idxcard{display:block;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);text-decoration:none}.idxcard:hover{border-color:var(--accent)}.idxcard b{display:block;color:var(--accent)}.idxcard span{color:var(--muted)}
`);
console.log('written', fs.readdirSync(OUT));
