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
dialog.cdlg button:focus-visible{outline:2px solid #c7a44a;outline-offset:2px}`;
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
