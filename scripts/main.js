import { init as initRender, renderAll, renderSelection, setGridLabelsVisible } from './render.js';
import { state, load, subscribe, undo, redo, canUndo, canRedo } from './state.js';
import { initControls, setZoom, getZoom, resetView, ZOOM_STEP } from './controls.js';
import { initDrag }                                    from './drag.js';
import { initSidebar }                                 from './sidebar.js';
import { initElements, renderElements }                from './elements.js';
import { initLevel, renderLevel }                      from './level.js';
import { initShare }                                   from './share.js';
import { HEX_W, HEX_H, COLS, ROWS }                   from './hex.js';
import { GAME_NAME }                                   from './data.js';
import { clearSelection }                              from './uiState.js';
import { subscribeUI }                                 from './uiState.js';

document.addEventListener('DOMContentLoaded', () => {
  document.title = `HavenMap — ${GAME_NAME}`;
  const gameNameLabel = document.getElementById('sidebar-game-name');
  if (gameNameLabel) gameNameLabel.textContent = GAME_NAME;
  const svgEl = document.getElementById('board-svg');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');

  initRender(svgEl);

  const SIDEBAR_W = 280;

  // Scale so ~20 columns fill the viewport width (excluding sidebar)
  const viewW = window.innerWidth - SIDEBAR_W;
  const scale = (viewW * 0.95) / (20 * HEX_W * 0.75);

  // Shift board left so row labels start at the SVG left edge.
  const col1CenterX      = Math.floor(HEX_W * 0.75) + HEX_W / 2;
  const rowLabelLeftEdge = col1CenterX - HEX_W / 2 - 28;
  const xOffset          = -(rowLabelLeftEdge * scale) + 2;

  // Base SVG dimensions to fit the full board at scale 1.
  const baseBoardW = (Math.floor(COLS * HEX_W * 0.75) + HEX_W) * scale + Math.abs(xOffset) + 20;
  const baseBoardH = (ROWS * HEX_H + HEX_H) * scale + 60;

  function applyZoom(z) {
    const zoom = setZoom(z);
    svgEl.style.width  = baseBoardW * zoom + 'px';
    svgEl.style.height = baseBoardH * zoom + 'px';
    const label = document.getElementById('zoom-label');
    if (label) label.textContent = Math.round(zoom * 100) + '%';
  }

  initControls(svgEl, scale, xOffset);
  applyZoom(1);
  initDrag(svgEl);
  initSidebar();
  initElements();
  initLevel();
  initShare();

  function updateHistoryButtons() {
    if (undoBtn) undoBtn.disabled = !canUndo();
    if (redoBtn) redoBtn.disabled = !canRedo();
  }

  // Zoom buttons
  document.getElementById('zoom-in') ?.addEventListener('click', () => applyZoom(getZoom() + ZOOM_STEP));
  document.getElementById('zoom-out')?.addEventListener('click', () => applyZoom(getZoom() - ZOOM_STEP));
  undoBtn?.addEventListener('click', () => {
    if (undo()) clearSelection();
  });
  redoBtn?.addEventListener('click', () => {
    if (redo()) clearSelection();
  });

  // Mouse wheel zooms the board directly; page scrollbars are intentionally hidden.
  svgEl.addEventListener('wheel', e => {
    e.preventDefault();
    applyZoom(getZoom() + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  window.addEventListener('keydown', e => {
    const target = e.target;
    const isTypingField = target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (isTypingField) return;
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) {
      if (undo()) {
        clearSelection();
        e.preventDefault();
      }
    } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
      if (redo()) {
        clearSelection();
        e.preventDefault();
      }
    }
  });

  window.addEventListener('keydown', e => {
    const target = e.target;
    const isTypingField = target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (isTypingField || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '0') {
      applyZoom(resetView());
      e.preventDefault();
    }
  });

  // Re-render whenever state changes
  subscribe(() => { renderAll(state); renderElements(); renderLevel(); setGridLabelsVisible(state.showGridLabels); updateHistoryButtons(); });
  subscribeUI(() => { renderSelection(); });

  // Load from URL hash (triggers the subscriber above)
  clearSelection();
  load();
  updateHistoryButtons();

  // Also reload if user manually edits the URL hash
  window.addEventListener('hashchange', () => {
    clearSelection();
    load();
  });
});
