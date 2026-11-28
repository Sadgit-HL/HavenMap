// The popover of an empty enhancement dot on an ability card: first the stickers the dot takes with their price in gold, then a confirm step with the price breakdown,
// an editable price and the gold before and after (the price is taken from the character's gold).
// openDotPopover({ x, y, title, subtitle, options, gold, onConfirm })
//   x, y        client position of the dot (the popover sits next to it)
//   options     [{ k, label, img, cost (gold or null when the rules give no price), steps: [{ label, value (signed change; the base first) }] }]
//   gold        the character's gold
//   onConfirm   (sticker key, price) => void, called once after Confirm
// Closes on Escape, on a click outside and on Cancel. Returns a function that closes it.
const css = document.createElement('style');
css.textContent = `.dotpop{position:fixed;z-index:10000;box-sizing:border-box;width:min(326px,92vw);max-height:calc(100vh - 16px);overflow:auto;background:#231d17;color:#ecdfc8;border:1px solid #3a3026;border-radius:12px;padding:12px;box-shadow:0 14px 40px rgba(0,0,0,.7);font:14px/1.35 system-ui,"Segoe UI",Roboto,sans-serif}
.dotpop h3{margin:0;font-size:15px;color:#c7a44a}
.dotpop .dpsub{margin:2px 0 8px;color:#a89a82;font-size:12px}
.dotpop .dplist{display:flex;flex-direction:column;gap:4px}
.dotpop button{font:inherit;color:#ecdfc8;background:#2d2519;border:1px solid #3a3026;border-radius:8px;padding:6px 10px;cursor:pointer}
.dotpop button:hover:not(:disabled){border-color:#6b5a3c}
.dotpop button:focus-visible,.dotpop input:focus-visible{outline:2px solid rgba(199,164,74,.25);border-color:#c7a44a}
.dotpop button:disabled{opacity:.45;cursor:not-allowed}
.dotpop .dpopt{display:flex;align-items:center;gap:10px;text-align:left}
.dotpop .dpopt img{width:26px;height:26px;object-fit:contain;flex:none}
.dotpop .dpopt .dpn{flex:1}
.dotpop .dpopt .dpc{color:#c7a44a;font-weight:600}
.dotpop .dpopt .dpc.none{color:#a89a82;font-weight:400}
.dotpop .dpsteps{margin:8px 0;border:1px solid #3a3026;border-radius:8px;padding:6px 8px;background:rgba(0,0,0,.18)}
.dotpop .dpsteps div{display:flex;justify-content:space-between;gap:10px;font-size:13px}
.dotpop .dpsteps div span:last-child{color:#c7a44a}
.dotpop .dpsteps .dptotal{margin-top:4px;padding-top:4px;border-top:1px solid #3a3026;font-weight:700}
.dotpop .dpprice{display:flex;align-items:center;gap:8px;margin:8px 0 4px}
.dotpop .dpprice input{width:90px;font:inherit;color:#ecdfc8;background:#120f0b;border:1px solid #3a3026;border-radius:8px;padding:5px 8px}
.dotpop .dpgold{color:#a89a82;font-size:13px;margin-bottom:8px}
.dotpop .dpgold.bad{color:#c9604f}
.dotpop .dpbtns{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.dotpop .dpbtns .dpok{background:#c7a44a;border-color:#c7a44a;color:#16130f;font-weight:600}
.dotpop .dpempty{color:#a89a82;margin:4px 0 8px}`;
document.head.appendChild(css);

let open = null;                                                              // the open popover: { el, close }

export function openDotPopover({ x, y, title = '', subtitle = '', options = [], gold = 0, onConfirm }) {
  open?.close();
  const el = document.createElement('div');
  el.className = 'dotpop';
  el.setAttribute('role', 'dialog');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const head = `<h3>${esc(title)}</h3>${subtitle ? `<div class="dpsub">${esc(subtitle)}</div>` : ''}`;
  let closed = false, chosen = null;
  const close = () => { if (closed) return; closed = true; document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', place); el.remove(); if (open?.el === el) open = null; };
  const outside = e => { if (!el.contains(e.target)) close(); };
  const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  // The popover stays next to its dot but never leaves the window. It is placed again after every render, because the confirm step is taller than the sticker list,
  // and when the window changes size; what does not fit scrolls inside it (max-height in the style).
  const place = () => {
    if (!el.isConnected) return;
    el.style.maxHeight = `${Math.max(120, window.innerHeight - 16)}px`;           // from the visible height, not vh (vh can be taller than the window on some screens)
    const r = el.getBoundingClientRect();
    el.style.left = `${Math.max(8, Math.min(window.innerWidth - r.width - 8, x + 18))}px`;
    el.style.top = `${Math.max(8, Math.min(window.innerHeight - r.height - 8, y - 20))}px`;
  };

  const list = () => {
    el.innerHTML = `${head}${options.length
      ? `<div class="dplist">${options.map((o, i) => `<button type="button" class="dpopt" data-i="${i}"><img src="${esc(o.img ?? '')}" alt=""><span class="dpn">${esc(o.label)}</span><span class="dpc${o.cost === null ? ' none' : ''}">${o.cost === null ? 'no price' : o.cost + ' gold'}</span></button>`).join('')}</div>`
      : '<div class="dpempty">No sticker fits this dot</div>'}
      <div class="dpbtns" style="margin-top:8px"><button type="button" data-cancel>Cancel</button></div>`;
    place();
  };
  const confirm = o => {
    chosen = o;
    el.innerHTML = `${head}
      <div class="dpopt" style="margin:6px 0"><img src="${esc(o.img ?? '')}" alt="" style="width:30px;height:30px"><span class="dpn"><b>${esc(o.label)}</b></span></div>
      ${o.steps?.length ? `<div class="dpsteps">${o.steps.map((s, i) => `<div><span>${esc(s.label)}</span><span>${i === 0 || s.value < 0 ? s.value : '+' + s.value}</span></div>`).join('')}<div class="dptotal"><span>Total</span><span>${o.cost}</span></div></div>` : ''}
      <div class="dpprice"><label for="dpprice">Price</label><input id="dpprice" type="number" min="0" max="9999" inputmode="numeric" value="${o.cost ?? ''}"><span>gold</span></div>
      <div class="dpgold" id="dpgold"></div>
      <div class="dpbtns"><button type="button" data-back>Back</button><button type="button" data-cancel>Cancel</button><button type="button" class="dpok" data-ok>Confirm</button></div>`;
    const input = el.querySelector('#dpprice'), line = el.querySelector('#dpgold'), ok = el.querySelector('[data-ok]');
    const update = () => {
      const raw = input.value.trim(), p = raw === '' ? NaN : Math.trunc(Number(raw)), valid = Number.isFinite(p) && p >= 0 && p <= 9999, enough = valid && p <= gold;
      line.className = 'dpgold' + (valid && !enough ? ' bad' : '');
      line.textContent = !valid ? `Gold ${gold}` : enough ? `Gold ${gold}, ${gold - p} after` : `Gold ${gold}, not enough`;
      ok.disabled = !enough;
    };
    input.addEventListener('input', update);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !ok.disabled) ok.click(); });
    update();
    place();
    input.focus(); input.select();
  };
  el.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.i !== undefined) confirm(options[Number(b.dataset.i)]);
    else if (b.hasAttribute('data-back')) list();
    else if (b.hasAttribute('data-cancel')) close();
    else if (b.hasAttribute('data-ok')) {
      const o = chosen, p = Math.trunc(Number(el.querySelector('#dpprice').value));
      close();
      if (o) onConfirm?.(o.k, p);
    }
  });
  list();
  document.body.appendChild(el);
  place();
  window.addEventListener('resize', place);
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('keydown', onKey, true);
  open = { el, close };
  return close;
}
