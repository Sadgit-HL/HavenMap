// Enlarged card preview shown above a panel while the pointer rests on a card thumbnail.
// Shared by the ability decks and the attack modifier decks (decks.js).
//
//   const preview = createHoverPreview({ panel, selector: '[data-dk-full], [data-am-slot]', build });
//   build(target) returns the node to show (an <img>, or a composed card) or null for nothing.
//   preview.hide() should be called when the panel re-renders (the hovered element disappears
//   without a mouseout).
//
// The box (#deck-preview) is styled in styles/main.css: fixed 360x240, hidden on mobile.

export function createHoverPreview({ panel, selector, build }) {
  const box = document.createElement('div');
  box.id = 'deck-preview';
  document.body.appendChild(box);
  let current = null;

  function hide() {
    box.classList.remove('show');
    box.replaceChildren();
    current = null;
  }

  panel.addEventListener('mouseover', e => {
    const target = e.target.closest(selector);
    if (!target || target === current) return;
    const node = build(target);
    if (!node) return;
    const r = panel.getBoundingClientRect();
    box.replaceChildren(node);
    box.style.left = r.left + 'px';
    box.style.bottom = (window.innerHeight - r.top + 8) + 'px';
    box.classList.add('show');
    current = target;
  });

  panel.addEventListener('mouseout', e => {
    const target = e.target.closest(selector);
    if (!target || target.contains(e.relatedTarget)) return;   // still inside the same card
    hide();
  });

  return { hide };
}

// A plain image node for the preview.
export function previewImage(src) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  return img;
}
