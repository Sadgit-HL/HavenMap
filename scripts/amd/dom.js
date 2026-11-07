// Small DOM builders shared by card.js and compose.js.

// <div class="cls">
export function layer(cls) {
  const el = document.createElement('div');
  el.className = cls;
  return el;
}

// <img src alt="" class="cls">, lazy-loaded when asked (cards in long lists).
export function img(src, cls, lazy = false) {
  const el = document.createElement('img');
  el.src = src;
  el.alt = '';
  if (lazy) el.loading = 'lazy';
  if (cls) el.className = cls;
  return el;
}
