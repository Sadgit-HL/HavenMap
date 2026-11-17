// Card preview: one floating picture for every tab of the campaign page, shown beside the card under the pointer (or docked at a
// window side). It ignores the pointer, so it never takes the hover away from the card and is never clipped by a scrolling box.
//
// Triggers: hover after the delay setting; Ctrl shows at once (the only trigger when the setting is "Ctrl+hover"); Z pins the card
// under the pointer; a long press pins on touch. Esc, a click or tap elsewhere, or Z again closes a pinned preview.
// Size: the long edge is a share of the window height (setting S, M, L, XL), so every card kind looks alike on every screen.
//
// createPreview({ selector, resolve, settings, tapPins, longPress })
//   selector  the elements that have a preview
//   resolve   (el, pin) -> content or null. The same key keeps the shown content (no reload or repaint). Content is one of
//               { key, url, extra }   a picture; extra: () -> nodes laid over it (tokens, stickers), sized in % of the card
//               { key, make, ar }     a built node (attack modifier cards), sized by --pc-width; ar = width / height
//               { key, clone, wrap, back }  a copy of the element (an item with its badges), scaled up; wrap: classes of a wrapper so
//                                     the element's own styles still apply; back: a picture shown beside it (the back of a flip item)
//             plus scope (classes for the layer, e.g. 'pm', so the styles of that page part apply; the layer itself stays in the body,
//             outside the page's redraw) and scale (cards with small print)
//   settings  () -> { size, delay, trigger: 'hover' | 'ctrl', place: 'near' | 'left' | 'right' }
//   tapPins   el -> true when a plain tap on touch may show the preview (the element has no tap action of its own)
//   longPress el -> true when a long press may pin it (false where a long press opens a context menu)

export const SHARE = { s: 0.40, m: 0.52, l: 0.64, xl: 0.78 };
const DELAY = { off: 0, short: 150, long: 400 };
const MIN = 220, MARGIN = 12, GAP = 14, WARM_MS = 400, LONG_MS = 450;

export function createPreview({ selector, resolve, settings, tapPins = () => false, longPress = () => true }) {
  const layer = document.createElement('div');
  layer.id = 'cardPreview';
  layer.setAttribute('aria-hidden', 'true');
  layer.hidden = true;
  document.body.append(layer);
  let cur = null, content = null, key = '', pinned = false, timer = 0, lastShown = 0, ptr = { x: -1, y: -1 }, ctrl = false;

  const targetOf = n => n?.closest?.(selector) || null;
  const underPointer = () => (ptr.x < 0 ? null : targetOf(document.elementFromPoint(ptr.x, ptr.y)));
  const typing = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;

  function place() {
    if (!cur || !content) return;
    const S = settings(), ar = content.ar || 5 / 7;
    let long = Math.max(MIN, (SHARE[S.size] ?? SHARE.m) * innerHeight) * (content.scale || 1);
    let w = ar >= 1 ? long : long * ar, h = ar >= 1 ? long / ar : long;
    const k = Math.min(1, (innerWidth - 2 * MARGIN) / w, (innerHeight - 2 * MARGIN) / h);
    w *= k; h *= k;
    let x, y = (innerHeight - h) / 2;
    if (S.place === 'left') x = MARGIN;
    else if (S.place === 'right') x = innerWidth - w - MARGIN;
    else {
      const r = cur.getBoundingClientRect(), right = innerWidth - r.right - GAP - MARGIN, left = r.left - GAP - MARGIN;
      x = right >= w ? r.right + GAP : left >= w ? r.left - GAP - w : (innerWidth - w) / 2;
      y = Math.max(MARGIN, Math.min(r.top + r.height / 2 - h / 2, innerHeight - h - MARGIN));
    }
    layer.style.width = `${Math.round(w)}px`;
    layer.style.height = `${Math.round(h)}px`;
    layer.style.setProperty('--pc-width', `${Math.round(w)}px`);
    if (content.box) content.box.style.transform = `scale(${w / content.nw})`;
    layer.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;   // transform, not left/top: no trail behind it
  }

  function show(el, pin = false) {
    clearTimeout(timer);
    const c = el && el.isConnected ? resolve(el, pin) : null;
    if (!c) { hide(); return; }
    cur = el; pinned = pin;
    layer.classList.toggle('pinned', pin);
    layer.className = c.scope || '';                                                   // e.g. 'pm': the playmat's styles for tokens and items apply
    layer.classList.toggle('pinned', pin);
    if (c.key !== key || !content) {
      key = c.key;
      if (c.url) {
        const img = document.createElement('img');
        img.alt = ''; img.draggable = false;
        content = { ...c, ar: c.ar || 0 };
        img.addEventListener('load', () => { if (content?.key === c.key && !c.ar) { content.ar = img.naturalWidth / img.naturalHeight; place(); } }, { once: true });
        img.src = c.url;
        if (img.complete && img.naturalWidth && !c.ar) content.ar = img.naturalWidth / img.naturalHeight;
        const box = document.createElement('div');
        box.className = 'cpvcard';
        box.append(img, ...(c.extra ? c.extra() : []));
        layer.replaceChildren(box);
      } else if (c.clone) {
        const nw = c.clone.offsetWidth || 1, nh = c.clone.offsetHeight || 1, copy = c.clone.cloneNode(true);
        [copy, ...copy.querySelectorAll('*')].forEach(n => [...n.attributes].forEach(a => { if (a.name.startsWith('data-') || a.name === 'id' || a.name === 'draggable' || a.name === 'title') n.removeAttribute(a.name); }));
        copy.classList.remove('dragging', 'lift');
        Object.assign(copy.style, { width: `${nw}px`, height: `${nh}px`, margin: '0', transform: 'none' });
        const box = document.createElement('div');
        box.className = `cpvclone ${c.wrap || ''}`;
        Object.assign(box.style, { width: `${nw}px`, height: `${nh}px` });
        box.append(copy);
        let bw = nw;
        if (c.back) {                                                                    // the back of a flip item beside it, at the same size
          const img = Object.assign(document.createElement('img'), { src: c.back, alt: '', draggable: false });
          Object.assign(img.style, { width: `${nw}px`, height: `${nh}px`, flex: 'none', objectFit: 'contain', borderRadius: '6px' });
          bw = 2 * nw + 6;
          Object.assign(box.style, { width: `${bw}px`, display: 'flex', gap: '6px', alignItems: 'flex-start' });
          box.append(img);
        }
        content = { ...c, ar: bw / nh, box, nw: bw };
        layer.replaceChildren(box);
      } else {
        content = c;
        layer.replaceChildren(c.make());
      }
    } else content = { ...content, scale: c.scale };
    layer.hidden = false;
    place();
    lastShown = Date.now();
  }

  function hide() {
    clearTimeout(timer);
    if (!layer.hidden) lastShown = Date.now();
    layer.hidden = true;
    cur = null; pinned = false;
    layer.classList.remove('pinned');
  }

  // hover: the delay, unless Ctrl is held or a preview was just shown (moving along a row of cards shows each one at once)
  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch' || pinned) return;
    const el = targetOf(e.target);
    if (el === cur && el) { clearTimeout(timer); return; }
    clearTimeout(timer);
    if (!el || e.buttons) { if (cur) hide(); return; }
    const S = settings();
    if (S.trigger === 'ctrl' && !e.ctrlKey) { if (cur) hide(); return; }
    const warm = !layer.hidden || Date.now() - lastShown < WARM_MS;
    const delay = e.ctrlKey || warm ? 0 : (DELAY[S.delay] ?? 0);
    if (cur) hide();
    if (delay) timer = setTimeout(() => show(el), delay); else show(el);
  });
  document.addEventListener('pointermove', e => { ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { if (!pinned) hide(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Control' && !ctrl) { ctrl = true; if (!pinned) { const el = underPointer(); if (el && el !== cur) show(el); } return; }
    if (e.key === 'Escape' && pinned) { hide(); e.stopPropagation(); return; }
    if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.altKey && !e.metaKey && !e.repeat && !typing()) {
      const el = underPointer();
      if (pinned && (!el || el === cur)) { hide(); return; }
      if (el) { e.preventDefault(); show(el, true); }
    }
  }, true);
  document.addEventListener('keyup', e => { if (e.key === 'Control') { ctrl = false; if (!pinned && settings().trigger === 'ctrl') hide(); } });

  // touch: a long press pins; a tap pins only where the element has no tap action (tapPins); any tap elsewhere closes
  let press = 0, pressAt = null, pressed = 0;
  document.addEventListener('pointerdown', e => {
    clearTimeout(press);
    if (pinned && !layer.contains(e.target) && targetOf(e.target) !== cur) hide();
    if (e.pointerType === 'mouse') return;
    const el = targetOf(e.target);
    if (!el || !longPress(el) || e.target.closest('button, a, input, select, textarea')) return;
    pressAt = { x: e.clientX, y: e.clientY };
    press = setTimeout(() => { show(el, true); pressed = Date.now(); }, LONG_MS);
  }, true);
  document.addEventListener('pointermove', e => { if (pressAt && Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) > 10) clearTimeout(press); }, { passive: true });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, () => { clearTimeout(press); pressAt = null; }));
  document.addEventListener('click', e => {
    if (pressed && Date.now() - pressed < 900) { pressed = 0; e.preventDefault(); e.stopImmediatePropagation(); return; }   // the click that ends a long press
    if (e.pointerType !== 'touch' && !matchMedia('(pointer: coarse)').matches) return;
    const el = targetOf(e.target);
    if (el && tapPins(el) && !e.target.closest('button, input, select, textarea')) { e.preventDefault(); e.stopImmediatePropagation(); if (pinned && cur === el) hide(); else show(el, true); }
  }, true);
  layer.addEventListener('click', hide);

  window.addEventListener('blur', () => { ctrl = false; if (!pinned) hide(); });
  window.addEventListener('resize', () => { if (cur) place(); });
  document.addEventListener('scroll', () => { if (cur) hide(); }, true);
  document.addEventListener('dragstart', hide, true);

  return { show, hide, isPinned: () => pinned, current: () => cur };
}
