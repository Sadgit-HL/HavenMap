// Custom dialogs for the campaign page: replace the browser's confirm() and alert() (same look as the rest of the page).
// ask({ title, text, ok, cancel, danger }) -> Promise<boolean>; notify(title, text) -> Promise (one OK button).
// Escape and Cancel answer false. danger: the OK button is red and Cancel has the focus.
const css = document.createElement('style');
css.textContent = `dialog.cdlg{background:#17120b;color:#ecdfc8;border:1px solid #3a3026;border-radius:12px;padding:18px 20px 16px;width:min(380px,92vw);box-shadow:0 14px 40px rgba(0,0,0,.7);font:14px/1.4 system-ui,Segoe UI,Roboto,sans-serif}
dialog.cdlg::backdrop{background:rgba(0,0,0,.55)}
dialog.cdlg h3{margin:0 0 8px;font-size:15px;color:#c7a44a;font-weight:700}
dialog.cdlg p{margin:0 0 16px;color:#cdbd98;white-space:pre-line;overflow-wrap:anywhere}
dialog.cdlg .cbtns{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
dialog.cdlg button{font:inherit;font-size:13px;padding:7px 14px;border-radius:8px;border:1px solid #4d4031;background:#2d2519;color:#ecdfc8;cursor:pointer}
dialog.cdlg button:hover{background:#3a2f1e;color:#c7a44a}
dialog.cdlg button.cok{background:#4a3f2e;border-color:#2b2318;color:#e5d3a8;font-weight:700}
dialog.cdlg button.cok:hover{background:#534735;color:#f0e0b8}
dialog.cdlg.danger button.cok{background:#3a1f1a;border-color:#7a3a30;color:#f0a090}
dialog.cdlg.danger button.cok:hover{background:#4a2620;color:#ffb8a8}
dialog.cdlg button:focus-visible{outline:2px solid #c7a44a;outline-offset:2px}
dialog.cdlg.wide{width:min(780px,94vw)}
dialog.cdlg .dcards{display:flex;flex-wrap:wrap;gap:14px 12px;justify-content:center;margin:0 0 12px}
dialog.cdlg .dcard{margin:0;width:210px;--pc-width:210px;display:flex;flex-direction:column;align-items:center;gap:6px}
dialog.cdlg .dcard img{display:block;width:100%;border-radius:8px}
dialog.cdlg .dcard figcaption{font-size:13px;text-align:center;color:#ecdfc8}
dialog.cdlg .dcard.rolling figcaption{color:#c7a44a}
dialog.cdlg p.dnote{margin:0 0 14px;text-align:center}
dialog.cdlg p.dmode{margin:0 0 10px;text-align:center;color:#c7a44a;font-weight:700}
dialog.cdlg .drolling .dcard{width:150px;--pc-width:150px}
dialog.cdlg .drolling:empty{display:none}
dialog.cdlg .drolling .dcard.out{opacity:.4}
dialog.cdlg .dpair .dcard.sel{outline:2px solid #c7a44a;outline-offset:3px;border-radius:8px}
dialog.cdlg .dpair .dcard.out{opacity:.45}
dialog.cdlg .dcard[role=button]{cursor:pointer}
dialog.cdlg .dcard[role=button]:hover figcaption{color:#c7a44a}
dialog.cdlg .dattack{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 10px;color:#cdbd98}
dialog.cdlg .dattack input{width:70px;padding:6px 8px;border-radius:8px;border:1px solid #4d4031;background:#2d2519;color:#ecdfc8;font:inherit}
dialog.cdlg .dattack[hidden]{display:none}
dialog.cdlg p.dnote:empty{display:none}
dialog.cdlg.reveal::backdrop{background:rgba(0,0,0,.97)}
dialog.cdlg .dcard.hid{cursor:pointer;outline:none}
dialog.cdlg .dcard.hid .dback{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:3/2;box-sizing:border-box;border:2px dashed #c7a44a;border-radius:10px;background:radial-gradient(circle at 50% 40%,#3a2f1e 0%,#1d1710 75%);color:#c7a44a;font-size:42px;font-weight:700}
dialog.cdlg .dcard.hid:hover .dback,dialog.cdlg .dcard.hid:focus-visible .dback{background:radial-gradient(circle at 50% 40%,#4d3f27 0%,#251d12 75%);border-style:solid}
dialog.cdlg .dcard.hid figcaption{color:#c7a44a}
@media (max-width:560px){dialog.cdlg .dcard{width:calc(50% - 8px);--pc-width:calc(46vw - 12px)}}`;
document.head.appendChild(css);

export function ask({ title = '', text = '', ok = 'OK', cancel = 'Cancel', danger = false } = {}) {
  return new Promise(resolve => {
    const dlg = document.createElement('dialog');
    dlg.className = 'cdlg' + (danger ? ' danger' : '');
    dlg.innerHTML = '<h3></h3><p></p><div class="cbtns"></div>';
    dlg.querySelector('h3').textContent = title;
    dlg.querySelector('p').textContent = text;
    const btns = dlg.querySelector('.cbtns');
    let noB = null;
    if (cancel) { noB = document.createElement('button'); noB.type = 'button'; noB.className = 'cno'; noB.textContent = cancel; btns.appendChild(noB); }
    const okB = document.createElement('button'); okB.type = 'button'; okB.className = 'cok'; okB.textContent = ok; btns.appendChild(okB);
    okB.addEventListener('click', () => dlg.close('ok'));
    noB?.addEventListener('click', () => dlg.close('cancel'));
    dlg.addEventListener('keydown', e => e.stopPropagation());                   // Escape closes this dialog only, not the modal behind it
    dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'ok'); dlg.remove(); });
    document.body.appendChild(dlg);
    dlg.showModal();
    (danger && noB ? noB : okB).focus();
  });
}
export const notify = (title, text) => ask({ title, text, ok: 'OK', cancel: null });

// Draw dialog (a draw of a modifier deck): the cards of one attack, revealed one at a time. The first card is drawn by the Draw button; every further
// card (after a rolling card, or the second card of advantage or disadvantage) is drawn by a click on the face-down card, for the suspense.
// model:
//   title, modeLabel   heading and the line under it ('' for a standard draw); mode 'std' | 'adv' | 'dis'
//   steps [{ node, label, kind: 'roll' | 'card' | 'N' | 'C', note? }]   the cards in the order drawn, shown = how many are revealed
//   rollingIgnored   the rolling cards are dimmed (disadvantage)
//   selected 'N' | 'C' | null, choose (the player picks by a click), canSwap (a button switches an automatic choice by hand)
//   needAttack, attack, attackShown   a field for the attack value (a x2 card is compared by it)
//   info, note   notices under the cards when the last card is revealed (an ambiguous pair, a missing card, an automatic shuffle); empty: no line
// hooks (each gets the current model and changes it): onDone(m) when the last card is revealed (also at the start of a one card draw, and when the
// dialog is closed early), onChoose(m, key), onAttack(m, value), onSwap(m). The dialog closes with Close or Escape, and with a click outside it once
// all cards are revealed (never in the middle of the reveal). Resolves when the dialog is closed.
export function showDraw(model, hooks = {}) {
  return new Promise(resolve => {
    let m = model;
    const dlg = document.createElement('dialog');
    dlg.className = 'cdlg wide reveal';
    dlg.innerHTML = '<h3></h3><p class="dmode"></p><div class="dcards drolling"></div><div class="dcards dpair"></div><div class="dattack"><label>Attack value <input type="number" min="0" max="99" inputmode="numeric"></label></div><p class="dnote"></p><div class="cbtns"></div>';
    const q = sel => dlg.querySelector(sel), roll = q('.drolling'), main = q('.dpair'), atk = q('.dattack'), input = atk.querySelector('input'), btns = q('.cbtns');
    const done = () => m.shown >= m.steps.length;
    const figure = (c, cls, cap) => {
      const f = document.createElement('figure'), fc = document.createElement('figcaption');
      f.className = 'dcard ' + cls;
      fc.textContent = cap;
      f.append(c.node, fc);
      return f;
    };
    const reveal = () => {
      if (done()) return;
      m.shown++;
      if (done()) hooks.onDone?.(m);
      render();
    };
    const placeholder = next => {
      const f = document.createElement('figure'), back = document.createElement('div'), fc = document.createElement('figcaption');
      f.className = 'dcard hid';
      f.setAttribute('role', 'button'); f.tabIndex = 0;
      back.className = 'dback'; back.textContent = '?';
      fc.textContent = next.kind === 'C' ? 'Click to draw the second card' : 'Click to draw the next card';
      f.append(back, fc);
      f.addEventListener('click', reveal);
      f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } });
      return f;
    };
    const render = () => {
      q('h3').textContent = m.title;
      q('.dmode').textContent = m.modeLabel || '';
      const std = m.mode === 'std', full = done(), next = m.steps[m.shown];
      roll.replaceChildren(); main.replaceChildren();
      m.steps.slice(0, m.shown).forEach(c => {
        if (std) { main.append(figure(c, c.kind === 'roll' ? 'rolling' : '', c.kind === 'roll' ? `${c.label} (rolling)` : c.label)); return; }
        if (c.kind === 'roll') { roll.append(figure(c, 'rolling' + (m.rollingIgnored ? ' out' : ''), `${c.label} (rolling, ${m.rollingIgnored ? 'ignored' : 'added'})`)); return; }
        const f = figure(c, full ? (m.selected === c.kind ? 'sel' : m.selected ? 'out' : '') : '', `${c.kind === 'N' ? 'First' : 'Second'}: ${c.label}${c.note ? ` (${c.note})` : ''}`);
        if (full && m.choose) {
          f.setAttribute('role', 'button'); f.tabIndex = 0;
          const pick = () => { hooks.onChoose?.(m, c.kind); render(); };
          f.addEventListener('click', pick);
          f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        }
        main.append(f);
      });
      let ph = null;
      if (next) { ph = placeholder(next); (std || next.kind !== 'roll' ? main : roll).append(ph); }
      atk.hidden = !full || (!m.needAttack && !m.attackShown);
      if (document.activeElement !== input) input.value = m.attack ?? '';
      q('.dnote').textContent = full ? [m.info, m.note].filter(Boolean).join(' ') : '';
      btns.replaceChildren();
      const add = (label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.addEventListener('click', fn); btns.appendChild(b); return b; };
      if (full && m.canSwap) add('Use the other card', '', () => { hooks.onSwap?.(m); render(); });
      const ok = add('Close', 'cok', () => dlg.close('ok'));
      ok.dataset.close = '1';
      (ph || ok).focus?.();
    };
    input.addEventListener('input', () => { m.attack = input.value; m.attackShown = true; hooks.onAttack?.(m, input.value); render(); });
    dlg.addEventListener('keydown', e => e.stopPropagation());
    dlg.addEventListener('click', e => { if (e.target === dlg && done()) dlg.close('ok'); });                    // a click on the backdrop: the target is the dialog itself
    dlg.addEventListener('close', () => { if (!done()) { m.shown = m.steps.length; hooks.onDone?.(m); } resolve(); dlg.remove(); });
    if (done()) hooks.onDone?.(m);
    render();
    document.body.appendChild(dlg);
    dlg.showModal();
    (dlg.querySelector('.dcard.hid') || dlg.querySelector('[data-close]')).focus();
  });
}
