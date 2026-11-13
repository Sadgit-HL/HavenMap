// Redraw a container from new HTML without replacing what did not change. Replacing everything (innerHTML) makes the browser rebuild
// every image and tooltip: the playmat flickered on each flip and drop. Here the cards and items are matched by key (a card is the same
// element before and after it moves from the hand to a pile), so they keep their loaded picture, their hover state and their
// transitions; everything else is updated in place.
const keyOf = n => {
  if (n.nodeType !== 1) return null;
  if (n.dataset.card) return `c${n.dataset.char || ''}:${n.dataset.card}`;
  if (n.hasAttribute('data-itemstate')) return `i${n.dataset.id}`;
  return null;
};

function syncAttributes(old, next) {
  const hz = old.style && old.style.getPropertyValue('--hz');                   // set by the hover zoom, not part of the markup
  for (const a of [...old.attributes]) {
    if (a.name === 'open' && old.tagName === 'DETAILS') continue;               // keep a section the user opened
    if (!next.hasAttribute(a.name)) old.removeAttribute(a.name);
  }
  for (const a of next.attributes) if (old.getAttribute(a.name) !== a.value) old.setAttribute(a.name, a.value);
  if (hz) old.style.setProperty('--hz', hz);
}

function morphChildren(parent, source, pool) {
  const oldKids = [...parent.childNodes].filter(n => !keyOf(n));                // keyed ones come from the pool
  const out = [];
  let next = 0;
  for (const nk of [...source.childNodes]) {
    const k = keyOf(nk);
    let ex = null;
    if (k && pool.has(k)) { ex = pool.get(k); pool.delete(k); }
    else if (!k) {
      while (next < oldKids.length && !(oldKids[next].nodeType === nk.nodeType && oldKids[next].nodeName === nk.nodeName)) next++;
      if (next < oldKids.length) ex = oldKids[next++];
    }
    if (ex && ex.nodeType === 1) { syncAttributes(ex, nk); if (!ex.hasAttribute('data-keep')) morphChildren(ex, nk, pool); out.push(ex); }
    else if (ex) { if (ex.nodeValue !== nk.nodeValue) ex.nodeValue = nk.nodeValue; out.push(ex); }
    else out.push(nk);
  }
  out.forEach((n, i) => { if (parent.childNodes[i] !== n) parent.insertBefore(n, parent.childNodes[i] || null); });
  while (parent.childNodes.length > out.length) parent.removeChild(parent.lastChild);
}

// target gets the content of html; elements with a key (cards, items) are reused wherever they were.
export function morphInto(target, html) {
  const source = document.createElement(target.tagName);
  source.innerHTML = html;
  const pool = new Map();
  target.querySelectorAll('[data-card], [data-itemstate]').forEach(n => { const k = keyOf(n); if (k && !pool.has(k)) pool.set(k, n); });
  morphChildren(target, source, pool);
}
