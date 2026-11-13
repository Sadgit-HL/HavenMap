// One shared context menu for the campaign page (design: HM_CTX in campaign/mockups/merc-6-playmat-v2.html).
// Desktop: right click, the Menu key or Shift+F10. Touch and pen: long press. The browser menu is suppressed except in text fields
// (Shift+right click always gets it). Every action of the menu also exists in the normal UI; the menu is a shortcut.
// Element types are registered by CSS selector; the first registered entry whose selector matches the target wins:
//   registerMenu({ sel: '.css-selector', title: el => 'header', actions: el => [ { label, run, disabled, danger } | { header } | { sep: true } ] })
const REG = [];
export const registerMenu = r => REG.push(r);

const css = document.createElement('style');
css.textContent = `#ctxmenu{position:fixed;z-index:9999;min-width:210px;max-width:280px;background:#17120b;border:1px solid #3a3026;border-radius:10px;padding:5px;box-shadow:0 14px 36px rgba(0,0,0,.65);font:13px system-ui,Segoe UI,Roboto,sans-serif;color:#ecdfc8}
#ctxmenu[hidden]{display:none}#ctxmenu .cm-h{padding:6px 10px 3px;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#a89a82}
#ctxmenu .cm-sep{height:1px;background:#3a3026;margin:4px 2px}
#ctxmenu button{display:flex;align-items:center;gap:8px;width:100%;border:0;background:transparent;color:#ecdfc8;border-radius:7px;padding:7px 10px;font:inherit;text-align:left;cursor:pointer}
#ctxmenu button:hover,#ctxmenu button:focus-visible{background:#3a2f1e;color:#c7a44a;outline:none}
#ctxmenu button:disabled{opacity:.4;cursor:not-allowed;background:transparent;color:#ecdfc8}
#ctxmenu button.cm-danger{color:#e08a7a}#ctxmenu button.cm-danger:hover{background:#3a1f1a;color:#f0a090}`;
document.head.appendChild(css);

const menu = document.createElement('div');
menu.id = 'ctxmenu'; menu.setAttribute('role', 'menu'); menu.hidden = true;
document.body.appendChild(menu);
let lastFocus = null, openedAt = 0;

const items = () => [...menu.querySelectorAll('button:not(:disabled)')];
export function closeMenu(refocus) {
  if (menu.hidden) return;
  menu.hidden = true; menu.innerHTML = '';
  if (refocus && lastFocus?.focus) try { lastFocus.focus(); } catch { /* ignore */ }
}
function build(list) {
  menu.innerHTML = '';
  for (const a of list) {
    if (a.sep) { const d = document.createElement('div'); d.className = 'cm-sep'; d.setAttribute('role', 'separator'); menu.appendChild(d); continue; }
    if (a.header) { const d = document.createElement('div'); d.className = 'cm-h'; d.textContent = a.header; menu.appendChild(d); continue; }
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'menuitem'); b.textContent = a.label;
    if (a.disabled) b.disabled = true;
    if (a.danger) b.className = 'cm-danger';
    b.addEventListener('click', e => { e.stopPropagation(); closeMenu(false); if (!a.disabled) a.run(); });
    menu.appendChild(b);
  }
}
function openAt(x, y, list) {
  build(list); menu.hidden = false; openedAt = Date.now();
  const r = menu.getBoundingClientRect();
  menu.style.left = Math.max(6, Math.min(x, innerWidth - r.width - 6)) + 'px';
  menu.style.top = Math.max(6, Math.min(y, innerHeight - r.height - 6)) + 'px';
  items()[0]?.focus({ preventScroll: true });
}
export function openMenuFor(target, x, y) {
  let hit = null;
  for (const r of REG) { const el = target.closest?.(r.sel); if (el) { hit = { r, el }; break; } }
  if (!hit) return false;
  const list = hit.r.actions(hit.el);
  if (!list || !list.length) return false;
  if (hit.r.title) list.unshift({ header: hit.r.title(hit.el) });
  lastFocus = document.activeElement;
  openAt(x, y, list);
  return true;
}

// Only inside the playmat (.pm): the rest of the page keeps the browser menu.
const inScope = t => !!t.closest?.('.pm');
document.addEventListener('contextmenu', e => {
  if (e.shiftKey || !inScope(e.target)) return;
  if (e.target.closest?.('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=range]),textarea,[contenteditable=true]')) return;
  let x = e.clientX, y = e.clientY;
  if (!x && !y) { const r = e.target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  e.preventDefault();
  if (!openMenuFor(e.target, x, y)) closeMenu(false);
});
document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && Date.now() - openedAt > 250) closeMenu(false); }, true);
window.addEventListener('scroll', () => closeMenu(false), true);
document.addEventListener('keydown', e => {
  if (menu.hidden) return;
  const it = items(), i = it.indexOf(document.activeElement);
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeMenu(true); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); (it[(i + 1) % it.length] || it[0]).focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); (it[(i - 1 + it.length) % it.length] || it[0]).focus(); }
  else if (e.key === 'Home') { e.preventDefault(); it[0]?.focus(); }
  else if (e.key === 'End') { e.preventDefault(); it[it.length - 1]?.focus(); }
  else if (e.key === 'Tab') closeMenu(false);
}, true);

// Long press for touch and pen (iOS has no contextmenu event; Android fires one itself, opening twice is harmless).
let lp = null, swallow = 0;
document.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' || !inScope(e.target) || (!menu.hidden && menu.contains(e.target))) return;
  if (e.target.closest?.('input,textarea,select,a,.sp .spc button')) return;                             // spin buttons use hold to repeat
  const x = e.clientX, y = e.clientY, t = e.target;
  clearTimeout(lp);
  lp = setTimeout(() => { if (openMenuFor(t, x, y)) swallow = Date.now(); }, 550);
  const cancel = ev => {
    if (ev && ev.type === 'pointermove' && Math.hypot(ev.clientX - x, ev.clientY - y) < 10) return;
    clearTimeout(lp); ['pointermove', 'pointerup', 'pointercancel'].forEach(n => document.removeEventListener(n, cancel));
  };
  ['pointermove', 'pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, cancel));
});
document.addEventListener('click', e => { if (swallow && Date.now() - swallow < 900) { swallow = 0; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
