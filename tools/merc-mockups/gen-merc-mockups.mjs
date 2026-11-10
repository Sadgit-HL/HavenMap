// Generates the five mercenary-tab mockups (static HTML) into HavenMap/campaign/mockups/.
import fs from 'fs';
const OUT = 'C:/Users/hansen/ai/games/HavenMap/HavenMap/campaign/mockups/';
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
  items: [[1, 'Weathered Boots', 'legs', [0, 0, 0]], [9, 'Focusing Rod', '1H', [1, 0, 0]], [149, 'Aesther Spyglass', 'head', [0, 1, 0]], [12, 'Stamina Potion', 'small', [0, 1, 0]],
    [21, 'Power Potion', 'small', [0, 1, 0]], [14, 'Studded Leather', 'body', [0, 0, 0]], [8, 'Heater Shield', '1H', [0, 0, 0]], [5, 'Scouting Lens', 'head', [0, 0, 0]]]
    .map(([id, name, slot, st]) => ({ id, name, slot, st, img: `${CDN}wh_items/gh2/${String(id).padStart(3, '0')}.png` })),
};
const XP_PCT = Math.round(((D.xp - D.xpFrom) / (D.xpTo - D.xpFrom)) * 100);

// ---- icons (inline SVG, 18px, stroke) ----
const ic = p => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  amd: ic('<rect x="3" y="6" width="12" height="15" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v13"/>'),
  perks: ic('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
  quest: ic('<path d="M6 3h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 17a2 2 0 0 0 2 2M10 8h6M10 12h6"/>'),
  goal: ic('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
  mat: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 5v14"/>'),
  codes: ic('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/>'),
  notes: ic('<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0 2 2 0 0 1 0 3L8 19z"/><path d="M14 7l3 3"/>'),
  enh: ic('<path d="M4 18h16M6 18v-3h12v3M8 15c0-3 1-5 4-6V6h5v3H12"/>'),
  more: ic('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
  drag: ic('<path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"/>'),
};
const MODALS = [
  ['amd', 'Attack modifiers', 'Attack modifier deck'], ['perks', 'Perks & masteries', 'Perk selection and masteries'], ['quest', 'Personal quest', 'Draw and show the personal quest'],
  ['goal', 'Battle goal', 'Draw and show a battle goal'], ['mat', 'Character mat', 'Character mat, front and back'], ['codes', 'BGG codes', 'Copy a forum post code'],
  ['notes', 'Notes', 'Notes'], ['enh', 'Enhancements', 'Enhancement table (editable)'],
];
// A button that opens a modal: the small corner mark says so.
const mbtn = (k, { label = true, cls = '' } = {}) => {
  const m = MODALS.find(x => x[0] === k) || ['more', 'Menu', 'Modal menu'];
  return `<button type="button" class="mbtn ${cls}" title="Opens modal: ${m[2]}">${ICON[k]}${label ? `<span>${m[1]}</span>` : ''}<i class="mmark" aria-hidden="true"></i></button>`;
};
const portrait = (cls = '') => `<div class="portrait ${cls}" style="background-image:url(${D.mat})" role="img" aria-label="Class portrait (cropped from the character mat)"></div>`;
const cardEl = (c, extra = '') => `<div class="ac ${extra}" title="${c.name} (level ${c.lv})"><img src="${c.img}" alt="${c.name}" loading="lazy">${c.enh ? `<span class="enh ${c.enh.where}" title="Enhancement: ${c.enh.text} (${c.enh.where})">${c.enh.text.replace('Attack ', '')}</span>` : ''}</div>`;
const pips = st => `<span class="pips">${st.map(s => `<i class="${s ? 'on' : ''}"></i>`).join('')}</span>`;
const itemEl = i => `<div class="it" title="${i.name} (${i.slot})"><img src="${i.img}" alt="${i.name}" loading="lazy">${pips(i.st)}</div>`;
const chips = (arr, cls = '') => arr.map(t => `<span class="chip ${cls}">${t}</span>`).join('');
const xpBar = (compact = false) => `<div class="xp ${compact ? 'compact' : ''}" title="Level ${D.lv}: ${D.xpFrom} XP. Next level (${D.lv + 1}) at ${D.xpTo} XP."><div class="xpbar"><b style="width:${XP_PCT}%"></b></div><div class="xpnum"><span>${D.xp} XP</span><em>${D.xpFrom}</em><em>${D.xpTo}</em></div></div>`;
const counters = () => `<div class="counters">${D.counters.map(c => `<span class="ctr"><label>${c.n}</label><button type="button" aria-label="Decrease ${c.n}">&minus;</button><b>${c.v}</b><button type="button" aria-label="Increase ${c.n}">+</button></span>`).join('')}<button type="button" class="ctr add" title="Name and track a custom counter">+ counter</button></div>`;
const drop = (label, n, cls = '') => `<div class="drop ${cls}"><h4>${label} <span>${n}</span></h4>`;

const NAV = cur => `<nav class="mocknav"><b>Mercenary tab mockups</b><a href="index.html">Overview</a>${[['merc-1-playmat', '1 Playmat'], ['merc-2-sheet', '2 Sheet'], ['merc-3-tray', '3 Hand tray'], ['merc-4-mat', '4 Mat board'], ['merc-5-phone', '5 Phone first'], ['merc-6-playmat-v2', '6 Playmat v2']].map(([f, l]) => `<a href="${f}.html"${f === cur ? ' aria-current="page"' : ''}>${l}</a>`).join('')}<span class="legend"><i class="mmark inline"></i> = opens a modal (position of its button)</span></nav>`;
const page = (cur, title, css, body, notes) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mercenary tab mockup: ${title}</title><link rel="stylesheet" href="mock.css"><style>${css}</style></head>
<body class="m-${cur.split('-')[2]}">${NAV(cur)}${body}
<aside class="notes"><h3>${title}</h3>${notes}</aside></body></html>`;
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
  'A card table. Stats sit in one strip on top, items on a left shelf, the table in the middle (active cards above, the hand fanned below) and the discard and lost piles on the right as drop targets. Eight modal buttons in a dock on the far right.',
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
    ${grp('Deck', ['amd', 'perks'])}${grp('Story', ['quest', 'goal', 'notes'])}${grp('Reference', ['mat', 'codes', 'enh'])}
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
    <div class="right">${MODALS.slice(0, 4).map(m => mbtn(m[0])).join('')}${mbtn('more', { cls: 'moremenu' }).replace('<span>Menu</span>', '<span>More (4)</span>')}</div>
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
    <div class="panel"><h2>Modals</h2><div class="row">${['perks', 'quest', 'goal', 'codes', 'notes', 'enh'].map(k => mbtn(k)).join('')}</div></div>
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
      <div class="panel"><h4>Story</h4><div class="row">${mbtn('quest')}${mbtn('goal')}${mbtn('notes')}</div></div></div>${nav5('Info')}</div>
  <div class="phone"><span class="cap">Modal menu (opened from the button bottom-right)</span>${top5}
    <div class="ph-body"><h4>Active <span>${D.active.length}</span></h4><div class="strip">${D.active.map(c => cardEl(c)).join('')}</div></div>
    <div class="sheetmenu"><h4>Open</h4><div class="row">${MODALS.map(m => mbtn(m[0])).join('')}</div></div></div>
</div>`, notes(
  'Phone first, since players use this at the table during a scenario. A sticky header keeps the essentials (portrait, name, level, XP, gold). Three tabs: Cards (active strip, swipeable hand, discard and lost drop targets), Items and Info. All modals open from one menu button at the bottom-right, which slides up a sheet with the eight entries.',
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
const { CARDS: ALLCARDS } = await import('file:///C:/Users/hansen/ai/games/HavenMap/HavenMap/scripts/games/gh2_cards.js');
const INI_FIX = { 'disorienting-flash': 73, 'potent-potables': 46 };   // read from the card images (gh2_cards.js has no value for the first and 73 for the second)
const th = slug => ({ ini: INI_FIX[slug] ?? ALLCARDS.find(c => c.cls === 21 && c.slug === slug)?.ini, slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), img: `img/cards/${slug}.jpg`, thumb: true });
const H6 = ['disorienting-flash', 'enhancement-field', 'flamethrower', 'harmless-contraption', 'ink-bomb', 'net-shooter', 'potent-potables', 'reinvigorating-elixir', 'stun-shot', 'toxic-bolt', 'crank-bow', 'hook-gun', 'gas-canister', 'repulsor-gun']
  .map(s => ({ ...th(s), enh: s === 'net-shooter' ? { where: 'top', text: 'Attack +1' } : undefined }));
const A6 = ['teleportation-pad', 'dangerous-contraption'].map(th), DI6 = ['volatile-concoction', 'stamina-booster', 'proximity-mine'].map(th), LO6 = ['disintegration-beam'].map(th);
const PL6 = ['jet-propulsion', 'restorative-mist'].map(th);
const gear = `<svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 2.6h3.4l.5 2.4 1.7.7 2.1-1.3 2.4 2.4-1.3 2.1.7 1.7 2.4.5v3.4l-2.4.5-.7 1.7 1.3 2.1-2.4 2.4-2.1-1.3-1.7.7-.5 2.4h-3.4l-.5-2.4-1.7-.7-2.1 1.3-2.4-2.4 1.3-2.1-.7-1.7-2.4-.5v-3.4l2.4-.5.7-1.7-1.3-2.1 2.4-2.4 2.1 1.3 1.7-.7z"/><circle cx="12" cy="12" r="3.4"/></svg>`;
const flipEl = (c, front) => `<div class="flipcard${front ? ' is-front' : ''}" role="button" tabindex="0" title="Click to flip: ${c.name}"><div class="flipinner"><div class="face back"><div class="cardback">${gear}<b>${D.cls}</b></div></div><div class="face front"><img src="${c.img}" alt="${c.name}"></div></div></div>`;
const hand6 = H6.map((c, i) => cardEl(c).replace('<div class="ac "', `<div style="--i:${i}" draggable="true" data-ini="${c.ini}" class="ac"`).replace('</div>', `<span class="inib" title="Initiative ${c.ini}">${c.ini}</span></div>`)).join('');
const p6css = `
.stage6{display:grid;grid-template-columns:150px minmax(0,1fr) 112px 64px;grid-template-rows:auto minmax(0,1fr);gap:12px;padding:12px;height:calc(100vh - 34px);min-height:700px;background:radial-gradient(ellipse at 50% 40%,#2b3a2c 0%,#1a2519 70%,#121a12 100%)}
.hud{grid-column:1/-1;display:flex;gap:16px;align-items:center;background:rgba(18,15,11,.78);border:1px solid var(--line);border-radius:12px;padding:8px 14px}
.hud .portrait{width:64px;height:64px;border-radius:50%;border:2px solid var(--accent)}.hud h1{margin:0;font-size:19px}.hud .sub{color:var(--muted);font-size:13px}
.lvl{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent);color:#1b150c;font-weight:800;font-size:20px}
.hud .xp{width:240px}.hud .stat{display:flex;flex-direction:column;align-items:center;font-size:12px;color:var(--muted)}.hud .stat b{font-size:18px;color:var(--text)}.hud .counters{margin-left:auto}
.shelf6{display:grid;grid-template-columns:1fr 1fr;gap:6px;align-content:start;min-height:0}.shelf6 h4{grid-column:1/-1;margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:space-between}
.shelf6 .it{transition:.15s}.shelf6 .it:hover{transform:scale(2.2);z-index:9;transform-origin:0 50%;box-shadow:0 10px 30px rgba(0,0,0,.7)}.shelf6 .it:nth-of-type(even):hover{transform-origin:100% 50%}
.shelf6 .pips{left:2px;bottom:2px}.shelf6 .pips i{width:6px;height:6px}
.board6{display:grid;grid-template-rows:minmax(0,40%) minmax(0,1fr);gap:12px;min-width:0;min-height:0;container-type:size}
.toprow{--ch:calc(40cqh - 36px);display:grid;grid-template-columns:minmax(0,1fr) calc(var(--ch) * 10 / 7 + 46px);gap:12px;min-height:0}
.zone{position:relative;border:2px dashed rgba(236,223,200,.28);border-radius:14px;background:rgba(0,0,0,.2);padding:26px 12px 10px;display:flex;gap:14px;justify-content:center;align-items:stretch;min-height:0}
.zone .zlabel{position:absolute;left:14px;top:6px}.zone .zlabel b{color:var(--text)}.zone .zhint{position:absolute;right:14px;top:6px;font-size:11px;color:var(--muted)}
.zone.play{border-color:rgba(199,164,74,.55);background:rgba(199,164,74,.07)}
.slot6{position:relative;display:flex;flex-direction:column;align-items:center;min-height:0;height:100%}.slot6 .num{position:absolute;left:-4px;top:-4px;z-index:3;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#1b150c;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
.zone .ac,.flipcard{height:100%;aspect-ratio:5/7;width:auto}
.flipcard{perspective:900px;cursor:pointer;position:relative}.flipinner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .5s}.flipcard.is-front .flipinner{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.6)}.face.front{transform:rotateY(180deg)}.face img{width:100%;height:100%;object-fit:cover;display:block}
.cardback{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--accent);background:radial-gradient(circle at 50% 40%,#4a3a22 0%,#2a2014 70%);border:3px solid #1b150c;outline:2px solid var(--accent);outline-offset:-9px;border-radius:8px;text-transform:uppercase;letter-spacing:.18em;font-size:12px}
.cardback::before{content:'';position:absolute;inset:14px;border:1px solid rgba(199,164,74,.5);border-radius:5px}
.fliphint{display:none}
.hand6{position:relative;z-index:10;border-radius:14px;overflow:visible;min-height:0;background:linear-gradient(0deg,rgba(0,0,0,.35),transparent)}
.hbar{position:absolute;left:0;right:0;top:0;z-index:30;display:flex;align-items:center;gap:12px;padding:5px 14px;height:30px}
.hbar .zlabel b{color:var(--text)}.hctl{margin-left:auto;display:flex;align-items:center;gap:10px}.hctl .mode{font-size:11px;color:var(--muted);letter-spacing:.06em}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:7px;overflow:hidden}.seg button{background:#2d2519;color:var(--muted);border:0;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer}.seg button[aria-pressed=true]{background:var(--accent);color:#1b150c}
.btn6{background:#2d2519;color:var(--text);border:1px solid var(--line);border-radius:7px;padding:3px 10px;font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.btn6:hover{border-color:var(--accent);color:var(--accent)}
.fan6{position:absolute;left:12px;right:12px;top:32px;bottom:8px;display:grid;grid-template-columns:repeat(7,1fr);grid-auto-rows:minmax(0,1fr);gap:8px;justify-items:center}
.fan6 .ac{height:100%;width:auto;aspect-ratio:5/7;cursor:grab;transition:transform .14s,box-shadow .14s}.fan6 .ac:active{cursor:grabbing}
.fan6 .ac{transform-origin:50% 100%}.fan6 .ac:hover{transform:scale(1.85);z-index:20;box-shadow:0 16px 40px rgba(0,0,0,.8)}
.fan6 .ac.over{outline:2px solid var(--accent);transform:translateX(10px)}.fan6 .ac.dragging{opacity:.35}
.inib{position:absolute;left:5px;top:5px;z-index:2;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:rgba(18,15,11,.88);border:1.5px solid var(--accent);color:var(--accent);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
.hand6[data-layout=fan] .fan6{display:flex;justify-content:center;align-items:flex-end;left:0;right:0;top:30px;bottom:0;padding:0 10px}
.hand6[data-layout=fan] .fan6 .ac{height:auto;width:min(180px,12.4vw);margin:0 calc(min(180px,12.4vw) * -.35);transform-origin:50% 160%;transform:rotate(calc((var(--i) - 6.5) * 1.5deg)) translateY(8%)}
.hand6[data-layout=fan] .fan6 .ac:hover{transform:translateY(-30%) scale(1.45);z-index:20}
.inivalue{gap:4px;position:absolute;right:-4px;top:-4px;z-index:3;min-width:26px;height:22px;padding:0 6px;border-radius:11px;background:#1b150c;border:1.5px solid var(--accent);color:var(--accent);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;white-space:nowrap}
.slot6.first .inivalue::after{content:'?'}.slot6.first:has(.is-front) .inivalue::after{content:attr(data-ini)}
.piles6{display:grid;grid-template-rows:1fr 1fr;gap:12px;min-height:0}
.pile6{border:2px dashed rgba(236,223,200,.28);border-radius:12px;background:rgba(0,0,0,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:0;overflow:hidden;padding:6px}
.pile6.target{border-color:var(--accent);background:rgba(199,164,74,.14)}.pile6 h4{margin:0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.pile6 h4 b{color:var(--text);font-size:13px}
.pile6 .ac{height:56%;width:auto;box-shadow:4px 4px 0 -1px #2b2318,8px 8px 0 -2px #241c13}.pile6.lost .ac{filter:grayscale(.8) brightness(.7)}
.dock{display:flex;flex-direction:column;gap:8px;align-items:stretch}.dock .mbtn{flex-direction:column;height:56px;font-size:10px;gap:2px;padding:4px 2px}.dock .mbtn svg{width:20px;height:20px}
`;
const p6 = page('merc-6-playmat-v2', '6 Playmat v2', p6css, `
<div class="stage6">
  <header class="hud">${portrait()}<div><h1>${D.name}</h1><div class="sub">${D.cls} &middot; played by ${D.player}</div><div class="chips">${chips(D.traits)}${chips(D.special, 'info')}</div></div>
    <div class="lvl" title="Level">${D.lv}</div>${xpBar()}<div class="stat"><b>${D.gold}</b>gold</div><div class="stat"><b>${D.inherited}</b>inherited</div>${counters()}</header>
  <section class="shelf6" aria-label="Items"><h4>Items <span>${D.items.length}</span></h4>${D.items.map(itemEl).join('')}</section>
  <section class="board6">
    <div class="toprow">
      <div class="zone"><span class="zlabel">Active &middot; <b>${A6.length}</b></span><span class="zhint">persistent effects (room for more)</span>${A6.map(c => cardEl(c)).join('')}</div>
      <div class="zone play"><span class="zlabel">Play area &middot; <b>2</b> cards</span><span class="zhint">1 sets initiative &middot; click to flip</span>
        <div class="slot6 first"><span class="num">1</span><span class="inivalue" data-ini="${PL6[0].ini}" title="The first card sets your initiative">ini </span>${flipEl(PL6[0], false)}</div>
        <div class="slot6"><span class="num">2</span>${flipEl(PL6[1], true)}</div></div>
    </div>
    <div class="hand6" data-layout="spread"><div class="hbar"><span class="zlabel">Hand &middot; <b>${H6.length}</b> of 14</span><span class="hctl"><span class="seg" role="group" aria-label="Hand layout"><button type="button" data-layout="spread" aria-pressed="true">Spread</button><button type="button" data-layout="fan" aria-pressed="false">Fan</button></span><button type="button" class="btn6" id="sortbtn" title="Sort the hand by initiative">${ICON.drag} Sort by initiative</button><span class="mode" id="handmode">Sorted by initiative &middot; drag to reorder</span></span></div><div class="fan6">${hand6}</div></div>
  </section>
  <section class="piles6"><div class="pile6 target"><h4>Discard <b>${DI6.length}</b></h4>${cardEl(DI6[2])}<span class="hint">drop</span></div><div class="pile6 lost"><h4>Lost <b>${LO6.length}</b></h4>${cardEl(LO6[0])}</div></section>
  <aside class="dock" aria-label="Modals">${MODALS.map(m => mbtn(m[0])).join('')}</aside>
</div>
<script>
document.querySelectorAll('.flipcard').forEach(f=>{const t=()=>f.classList.toggle('is-front');f.addEventListener('click',t);f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t()}})});
const hand=document.querySelector('.fan6'), wrap=document.querySelector('.hand6'), mode=document.getElementById('handmode');
const sortHand=()=>{[...hand.children].sort((a,b)=>a.dataset.ini-b.dataset.ini).forEach(c=>hand.appendChild(c));[...hand.children].forEach((c,i)=>c.style.setProperty('--i',i));mode.textContent='Sorted by initiative \u00b7 drag to reorder'};
document.getElementById('sortbtn').addEventListener('click',sortHand);sortHand();
let drag=null;
hand.addEventListener('dragstart',e=>{drag=e.target.closest('.ac');if(!drag)return;drag.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','card')});
hand.addEventListener('dragend',()=>{if(drag)drag.classList.remove('dragging');hand.querySelectorAll('.over').forEach(c=>c.classList.remove('over'));drag=null});
hand.addEventListener('dragover',e=>{e.preventDefault();hand.querySelectorAll('.over').forEach(c=>c.classList.remove('over'));const t=e.target.closest('.ac');if(t&&t!==drag)t.classList.add('over')});
hand.addEventListener('drop',e=>{e.preventDefault();const t=e.target.closest('.ac');if(drag&&t&&t!==drag){hand.insertBefore(drag,t);[...hand.children].forEach((c,i)=>c.style.setProperty('--i',i));mode.textContent='Manual order \u00b7 drag to reorder'}});
document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{wrap.dataset.layout=b.dataset.layout;document.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
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
