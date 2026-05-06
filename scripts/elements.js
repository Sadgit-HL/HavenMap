import { state, patch } from './state.js';
import { ELEMENTS } from './games/common.js';

// 0=inert 1=waning 2=strong — cycle forward on click
export function cycleElement(index) {
  const els = [...state.elements];
  els[index] = (els[index] + 1) % 3;
  patch({ elements: els });
}

export function endOfRound() {
  const els = state.elements.map(v => Math.max(0, v - 1));
  patch({ elements: els });
}

export function renderElements() {
  const els = state.elements;
  ELEMENTS.forEach(({ color }, i) => {
    const tile = document.getElementById(`el-tile-${i}`);
    if (!tile) return;
    const img = tile.querySelector('.el-img');
    const v = els[i];
    tile.dataset.state = v;
    const c = color;
    tile.style.color = c;
    if (v === 0) {
      tile.style.background  = 'rgba(255 255 255 / 0.04)';
      tile.style.borderColor = 'rgba(255 255 255 / 0.10)';
      tile.style.boxShadow   = 'none';
      if (img) { img.style.filter = 'grayscale(100%) brightness(0.35)'; img.style.maskImage = 'none'; }
    } else if (v === 1) {
      tile.style.background  = `color-mix(in srgb, ${c} 12%, transparent)`;
      tile.style.borderColor = `color-mix(in srgb, ${c} 35%, transparent)`;
      tile.style.boxShadow   = `0 0 6px color-mix(in srgb, ${c} 20%, transparent)`;
      if (img) { img.style.filter = 'none'; img.style.maskImage = 'linear-gradient(to right, black 50%, transparent 50%)'; }
    } else {
      tile.style.background  = `color-mix(in srgb, ${c} 22%, transparent)`;
      tile.style.borderColor = `color-mix(in srgb, ${c} 70%, transparent)`;
      tile.style.boxShadow   = `0 0 12px color-mix(in srgb, ${c} 45%, transparent), 0 0 4px color-mix(in srgb, ${c} 60%, transparent)`;
      if (img) { img.style.filter = 'brightness(1.1) saturate(1.2)'; img.style.maskImage = 'none'; }
    }
  });
}

export function initElements() {
  const bar = document.getElementById('element-bar');
  if (!bar) return;

  ELEMENTS.forEach(({ key, label }, i) => {
    const tile = document.getElementById(`el-tile-${i}`);
    if (!tile) return;
    const img = document.createElement('img');
    img.src = `images/common/elements/${key}.png`;
    img.alt = label;
    img.className = 'el-img';
    tile.appendChild(img);
    tile.title = label;
    tile.addEventListener('click', () => cycleElement(i));
  });

  document.getElementById('el-end-round')
    ?.addEventListener('click', endOfRound);
}
