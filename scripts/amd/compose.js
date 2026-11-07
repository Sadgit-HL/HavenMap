// Layered composition of a decorated (shared) attack-modifier card from images/common/attack_mods.
// Used by card.js (perk list, apps) and perks/compose.html (comparison page).

import { ASSET_BASE as BASE } from './paths.js?v=1';
export { BASE };
const ICON_CATS = ['element', 'condition', 'effect'];
const SELF_ALLY = new Set(['heal', 'shield']);   // retaliate: plain fist disc, amount drawn beside it
// First-icon -> frame file where the names differ.
const FRAME_ALIAS = { push: 'push-pull', pull: 'push-pull', safeguard: 'poison' }; // safeguard has no frame of its own: poison's
const PLAIN_FRAME = { '+0': 'p0', '+1': 'positive', '+2': 'positive', '+3': 'positive', '+4': 'positive', '-1': 'negative', '-2': 'negative' };
const PLAIN_NUMBER = { '+0': 'p0', '+1': 'p1', '+2': 'p2', '+3': 'p3', '+4': 'p4', '-1': 'm1', '-2': 'm2' };
// Two-tone dual-element faces whose scan has the pair the other way round: frame turned by 180 degrees.
const ROTATE_FRAME = new Set(['plus0earthfire', 'plus0airearth', 'plus0iceearth', 'plus1airearth',
  'plus1earthfire', 'plus1iceearth', 'plus2airlight']);
// Three-element faces (minus1airdarkearth): three small element discs in a triangle in the centre
// circle. Disc centres and size measured off the scan (disc diameter 110 of the 262 px icon).
const TRIPLE_POS = { wind: [244, 162.5], earth: [359, 162.5], dark: [301, 261] };
const TRIPLE_SCALE = 0.42;
// "curse 2": two smaller curse diamonds, one up-left and one down-right (centres and size measured off
// the minus2curse2 scan: diamonds ~131 px wide, icon box is 235).
const CURSE2_POS = [[258, 157], [340, 238]];
const CURSE2_SCALE = 0.557;
const NO_FRAME = new Set(['heal', 'shield', 'retaliate']); // no Modifier Type in the template
const MIXED = new Set([
  'earth-dark', 'earth-fire', 'earth-ice', 'earth-light', 'earth-wind', 'fire-dark', 'fire-ice',
  'fire-light', 'fire-wind', 'ice-dark', 'ice-wind', 'light-dark', 'light-ice', 'light-wind', 'wind-dark',
]);


// ---- corner badges --------------------------------------------------------------------------
// Value badge (upper circle, measured off a scan: x29 y149, 96 px) and class badge (lower circle,
// hand-measured: x37 y268, 87 px) on the 600x391 canvas. The value badge is a CSS placeholder
// (tinted disc + bronze ring) with the bevelled number cropped from numbers/c-*.webp, until the
// Photoshop badge export is complete.
const CANVAS = { w: 600, h: 391 };
const VALUE_BADGE = { x: 29, y: 149, d: 96 };
const CLASS_BADGE = { x: 37, y: 268, d: 87 };
// Alpha bbox of each centred number (x0,y0,x1,y1) so it can be cropped and fitted into the disc.
const NUM_BBOX = {
  '+0': [181, 93, 381, 299], '+1': [193, 93, 368, 298], '+2': [184, 92, 382, 299], '+3': [186, 93, 374, 301],
  '+4': [177, 95, 391, 300], '-1': [200, 93, 361, 297], '-2': [190, 92, 377, 299],
};
const NUM_FILE = { '+0': 'p0', '+1': 'p1', '+2': 'p2', '+3': 'p3', '+4': 'p4', '-1': 'm1', '-2': 'm2' };

function pct(v, of) { return (v / of * 100) + '%'; }
function box(el, b) {
  el.style.left = pct(b.x, CANVAS.w); el.style.top = pct(b.y, CANVAS.h);
  el.style.width = pct(b.d, CANVAS.w); el.style.height = pct(b.d, CANVAS.h);
}

// Exported badge discs (spheres/badge-<v>.webp, full 600x391 canvas). Values without one fall back
// to the CSS placeholder below (+4 is not exported yet).
const BADGE_IMG = { '+0': 'p0', '+1': 'p1', '+2': 'p2', '+3': 'p3', '-1': 'm1', '-2': 'm2' };

function valueBadge(value) {
  if (BADGE_IMG[value]) {
    const im = document.createElement('img');
    im.src = `${BASE}/spheres/badge-${BADGE_IMG[value]}.webp`;
    im.alt = '';
    im.className = 'cb-full';
    return im;
  }
  const bb = NUM_BBOX[value];
  if (!bb) return null;
  const wrap = document.createElement('div');
  wrap.className = 'cb-value ' + (value.startsWith('+') ? (value === '+0' ? 'zero' : 'pos') : 'neg');
  box(wrap, VALUE_BADGE);
  // Number cropped to its bbox, fitted into ~62% of the disc (centred).
  const w = bb[2] - bb[0], h = bb[3] - bb[1];
  const fit = 0.62 * VALUE_BADGE.d / Math.max(w, h);
  const nw = w * fit, nh = h * fit;
  const num = document.createElement('div');
  num.className = 'cb-num';
  num.style.left = pct((VALUE_BADGE.d - nw) / 2, VALUE_BADGE.d);
  num.style.top = pct((VALUE_BADGE.d - nh) / 2, VALUE_BADGE.d);
  num.style.width = pct(nw, VALUE_BADGE.d);
  num.style.height = pct(nh, VALUE_BADGE.d);
  num.style.backgroundImage = `url(${BASE}/numbers/c-${NUM_FILE[value]}.webp)`;
  num.style.backgroundSize = `${CANVAS.w / w * 100}% ${CANVAS.h / h * 100}%`;
  num.style.backgroundPosition = `${bb[0] / (CANVAS.w - w) * 100}% ${bb[1] / (CANVAS.h - h) * 100}%`;
  wrap.appendChild(num);
  return wrap;
}

// Class icons are cropped tight to their art, so aspect ratios differ a lot (73x220 .. 220x114).
// Fitting each into the same box makes tall/wide ones look small. Size by area instead: every icon
// gets the area of a `square`-sized (fraction of the badge circle) square, capped so the longest
// side is at most 1.25x that. Centred in the circle.
export function fitClassIcon(icon, square) {
  const apply = () => {
    const ar = icon.naturalWidth / icon.naturalHeight;
    if (!ar) return;
    let w = square * Math.sqrt(ar), h = square / Math.sqrt(ar);
    const cap = square * 1.25, m = Math.max(w, h);
    if (m > cap) { w *= cap / m; h *= cap / m; }
    Object.assign(icon.style, {
      left: ((1 - w) / 2 * 100) + '%', top: ((1 - h) / 2 * 100) + '%',
      width: (w * 100) + '%', height: (h * 100) + '%',
    });
  };
  if (icon.complete && icon.naturalWidth) apply(); else icon.addEventListener('load', apply, { once: true });
}

function classBadge(cls) {
  if (!cls) return null;
  const g = document.createElement('div');
  g.className = 'cb-classgroup';
  const circle = document.createElement('img');
  circle.src = `${BASE}/spheres/class-circle.webp`;
  circle.alt = '';
  circle.className = 'cb-full';
  const wrap = document.createElement('div');
  wrap.className = 'cb-class';
  box(wrap, CLASS_BADGE);
  const ic = document.createElement('img');
  ic.src = `${BASE}/class_icons/${cls}.webp`;
  ic.alt = '';
  ic.onerror = () => ic.remove();
  fitClassIcon(ic, 0.6);
  wrap.appendChild(ic);
  g.append(circle, wrap);
  return g;
}

export function badges(value, cls) {
  const g = document.createElement('div');
  g.className = 'cb';
  for (const b of [value ? valueBadge(value) : null, classBadge(cls)]) if (b) g.appendChild(b);
  return g;
}

// "Range N" line under a raised icon (ward): hexagon + arrow glyph and the amount, measured off the
// plus0wardrange1flip scan. Drawn as SVG on the 600x391 canvas so it scales with the card.
function rangeLineSvg(n) {
  return `<svg viewBox="0 0 600 391" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">
    <polygon points="276.5,235.5 290.8,243.75 290.8,260.25 276.5,268.5 262.2,260.25 262.2,243.75" fill="none" stroke="#fff" stroke-width="4.2" stroke-linejoin="miter"/>
    <line x1="273.5" y1="252" x2="300" y2="252" stroke="#fff" stroke-width="5.5"/>
    <polygon points="298,243.5 312.5,252 298,260.5" fill="#fff"/>
    <text x="326.5" y="265" text-anchor="middle" font-size="41" font-weight="700" fill="#fff" font-family="'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif">${n}</text>
  </svg>`;
}

// "Ally" label under the icon of faces whose icon has no baked label (strengthen, safeguard). The
// scans use a rounded bold sans, about 46 px wide with the cap height at y 246-268.
function allyLabelSvg() {
  return `<svg viewBox="0 0 600 391" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">
    <text x="299.5" y="268" text-anchor="middle" font-size="31" fill="#fff" textLength="46" lengthAdjust="spacingAndGlyphs" font-family="'Arial Rounded MT Bold', 'Nunito', 'Segoe UI', sans-serif" font-weight="700">Ally</text>
  </svg>`;
}

export function compose(card) {
  const t = card.tokens;
  let icons = t.filter(x => ICON_CATS.includes(x.cat));
  let targetSmall = null;
  const has = key => t.some(x => x.key === key);
  const flags = [];
  // "target N" next to another effect (e.g. blesstarget2) is a small "ring + N" line under the main
  // icon on the real card, not a second big icon: draw only the main icon, flag the target.
  const targetTok = icons.find(x => x.icon === 'add-target');
  if (targetTok && icons.length > 1) {
    icons = icons.filter(x => x !== targetTok);
    targetSmall = targetTok;
    flags.push(['ok', `target ${targetTok.amount ?? ''}: small ring + number under a smaller, raised icon`]);
  }
  const layers = []; // [url, label]
  let frame;
  let frameOk = true;

  if (!icons.length) {
    // Plain value card (plus3, plus4, plus1flip ...): own frame + centred number.
    frame = PLAIN_FRAME[card.value] || 'p0';
    layers.push([`${BASE}/frames/${frame}.webp`, `frame ${frame}`]);
    if (NUMBER_FILE_OK(card.value)) layers.push([`${BASE}/numbers/c-${PLAIN_NUMBER[card.value]}.webp`, `number ${card.value}`]);
    flags.push(['ok', 'plain card']);
  } else {
    const elems = icons.filter(x => x.cat === 'element');
    const first = icons[0];
    let fname;
    if (elems.length > 1) {
      // Two-tone per-pair frame when the pair exists (either order), else the generic one.
      const [a, b] = elems.map(x => x.icon);
      const pair = MIXED.has(`${a}-${b}`) ? `${a}-${b}` : MIXED.has(`${b}-${a}`) ? `${b}-${a}` : null;
      fname = elems.length === 2 && pair ? `mixed-elements-${pair}` : elems.length === 3 ? 'mixed-elements-earth-wind' : 'mixed-elements';
    } else {
      fname = FRAME_ALIAS[first.icon] || first.icon;
    }
    if (NO_FRAME.has(first.icon) && elems.length < 2) {
      frameOk = false;
      frame = 'p0';
      flags.push(['warn', `no frame for ${first.icon}`]);
    } else {
      frame = fname;
    }
    const rot = ROTATE_FRAME.has(card.art.ref) || (elems.length === 3 && icons.length === 3);   // triple: grey (wind) left, green (earth) right
    layers.push([`${BASE}/frames/${frame}.webp${rot ? '#r180' : ''}`, `frame ${frame}${rot ? ' (rotated 180)' : ''}`]);

    if (elems.length === 2 && icons.length === 2) {
      const [a, b] = elems.map(x => x.icon);
      const m = MIXED.has(`${a}-${b}`) ? `${a}-${b}` : MIXED.has(`${b}-${a}`) ? `${b}-${a}` : null;
      if (m) layers.push([`${BASE}/icons/center/mixed-elements-${m}.webp`, `icon mixed-elements-${m}`]);
      else flags.push(['warn', `no mixed icon ${a}+${b}`]);
    } else {
      for (const ic of icons) {
        let file;
        if (ic.cat === 'element') file = `elements-${ic.icon}`;
        else if (ic.cat === 'condition') file = `conditions-${ic.icon}${ic.icon === 'ward' && t.some(x => x.cat === 'range') ? '-range' : ''}${ic.icon === 'safeguard' && has('ally') ? '-ally' : ''}`;
        else if (SELF_ALLY.has(ic.icon)) file = `effects-${ic.icon}-${has('ally') ? 'ally' : 'self'}`;
        else file = `effects-${ic.icon}`;
        if (ic.icon === 'curse' && ic.amount === 2) {
          for (const [px, py] of CURSE2_POS) {
            const dx = (px - 303.5) / 600 * 100, dy = (py - 198.5) / 391 * 100;
            layers.push([`${BASE}/icons/center/${file}.webp#xf:` + encodeURIComponent(`translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%) scale(${CURSE2_SCALE})`), `icon ${file} x2`]);
          }
          flags.push(['ok', 'curse 2: two icons']);
          continue;
        }
        let url = `${BASE}/icons/center/${file}.webp`;
        const tri = elems.length === 3 && icons.length === 3 && TRIPLE_POS[ic.icon];
        if (tri) {
          const dx = (tri[0] - 303) / 600 * 100, dy = (tri[1] - 198.5) / 391 * 100;
          url += '#xf:' + encodeURIComponent(`translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%) scale(${TRIPLE_SCALE})`);
        }
        layers.push([url, `icon ${file}`]);
      }
    }
    if (elems.length === 3 && icons.length === 3) flags.push(['ok', '3 elements in a triangle']);
    else if (icons.length > 1) flags.push(['warn', `${icons.length} icons stacked (layout unknown)`]);
  }
  if (has('rolling')) layers.push([`${BASE}/icons/side/rolling.webp`, 'side rolling']);
  if (t.some(x => x.amount !== undefined)) flags.push(['warn', 'amount: ' + t.filter(x => x.amount !== undefined).map(x => `${x.word}${x.amount}`).join(' ')]);
  if (t.some(x => x.cat === 'range') && !icons.some(i => i.icon === 'ward')) flags.push(['warn', 'range token']);
  if (has('convert-to-any')) flags.push(['warn', 'convert to any']);
  if (has('ally')) flags.push(['', 'ally']);
  if (has('rolling')) flags.push(['', 'rolling']);
  if (frameOk && icons.length) flags.unshift(['ok', 'frame ok']);
  // Small dark numbers on the push arrow (centre of the arrow shaft, measured off the push scans).
  const overlays = [];
  if (has('ally') && icons.length && !icons.some(i => SELF_ALLY.has(i.icon) || i.icon === 'retaliate')) overlays.push({ svg: allyLabelSvg() });
  if (targetSmall) {
    // Measured off the minus2blesstarget2 scan: main diamond 172 px wide (icon box is 235) and its
    // centre 29.5 px higher; ring glyph 40 px at (281,289), amount at (322,294).
    for (const l of layers) {
      if (l[1].startsWith('icon ')) l[0] += '#xf:' + encodeURIComponent('translateY(-7.54%) scale(0.73)');
    }
    overlays.push({ img: `${BASE}/icons/small/target-ring.webp`, x: 281, y: 289, w: 40 });
    if (targetSmall.amount !== undefined) overlays.push({ text: String(targetSmall.amount), x: 323, y: 294, cls: 'cb-digit-white' });
  }
  for (const x of t) {
    // Ward + range: the glyph is shrunk and raised in conditions-ward-range, the range line goes under it.
    if (x.cat === 'range' && x.amount !== undefined && icons.some(i => i.icon === 'ward')) overlays.push({ svg: rangeLineSvg(x.amount) });
    // Lone target icon (plus0target1): "+N" on the left tip of the diamond, measured off the scan.
    if (x.icon === 'add-target' && x.amount !== undefined && !targetSmall) overlays.push({ text: '+' + x.amount, x: 217, y: 197, cls: 'cb-digit-plus' });
    // Retaliate: the amount is a white number just right of the fist disc (measured off the scan).
    if (x.icon === 'retaliate' && x.amount !== undefined) overlays.push({ text: String(x.amount), x: 373, y: 193, cls: 'cb-digit-big' });
    // Pierce: big white amount left of the arrow shaft, after the minus bar (the X is removed from the icon).
    if (x.icon === 'pierce' && x.amount !== undefined) overlays.push({ text: String(x.amount), x: 248, y: 195, cls: 'cb-digit-pierce' });
    if (x.icon === 'push' && x.amount !== undefined) overlays.push({ text: String(x.amount), x: 300, y: 145 });
    // Pull: number in the shaft of the down arrow. No scan in the data to measure from, so this is
    // placed by eye on the icon (centre of the shaft) and flagged as an estimate.
    if (x.icon === 'pull' && x.amount !== undefined) {
      overlays.push({ text: String(x.amount), x: 303, y: 168 });
      flags.push(['warn', 'pull number position estimated (no scan)']);
    }
  }
  return { layers, flags, frameOk, overlays, plain: !icons.length };
}

function NUMBER_FILE_OK(v) { return v in PLAIN_NUMBER; }

export function stack(extra, srcs) {
  const d = document.createElement('div');
  d.className = 'stack ' + extra;
  for (const [i, src] of srcs.entries()) {
    let s = src;
    const im = document.createElement('img');
    if (s.endsWith('#r180')) { s = s.slice(0, -5); im.style.transform = 'rotate(180deg)'; }
    const xf = s.indexOf('#xf:');
    if (xf >= 0) { im.style.transform = decodeURIComponent(s.slice(xf + 4)); im.style.transformOrigin = '50.58% 50.77%'; s = s.slice(0, xf); }
    im.src = s;
    im.alt = '';
    im.loading = 'lazy';
    im.onerror = () => im.classList.add('missing');
    if (extra === 'over' && i === srcs.length - 1) im.className = 'top';
    d.appendChild(im);
  }
  return d;
}

// Number drawn over the composed art, positioned in 600x391 canvas px and sized from the stack width.
export function addOverlays(el, overlays) {
  for (const o of overlays) {
    let d;
    if (o.svg) {
      d = document.createElement('div');
      d.className = 'cb-svg';
      d.innerHTML = o.svg;
      el.appendChild(d);
      continue;
    }
    if (o.img) {
      d = document.createElement('img');
      d.src = o.img;
      d.alt = '';
      d.className = 'cb-glyph';
      d.style.width = pct(o.w, CANVAS.w);
    } else {
      d = document.createElement('div');
      d.className = 'cb-digit ' + (o.cls || '');
      d.textContent = o.text;
    }
    d.style.left = pct(o.x, CANVAS.w);
    d.style.top = pct(o.y, CANVAS.h);
    el.appendChild(d);
  }
}

export function withOverlays(el, overlays) { addOverlays(el, overlays); return el; }

export function withBadges(stackEl, value, usedBy) {
  // usedBy looks like "FH Drifter" or "GH2E Boneshaper": the class is everything after the edition.
  const cls = usedBy ? usedBy.slice(usedBy.indexOf(' ') + 1) : null;
  stackEl.appendChild(badges(value, cls));
  return stackEl;
}

// A composed decorated card (layers + overlays + corner badges) as one element, for the perk list.
// Class is the owning class name (class badge); the value badge is drawn for non-plain faces.
export function composedShared(card, className) {
  const c = compose(card);
  const el = withOverlays(stack('', c.layers.map(l => l[0])), c.overlays);
  const cls = className || null;
  el.appendChild(badges(c.plain ? null : card.value, cls));
  return el;
}

