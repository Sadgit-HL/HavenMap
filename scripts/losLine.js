const SVG_NS = 'http://www.w3.org/2000/svg';

let svgEl = null;
let boardGroup = null;
let losLayer = null;
let activeLine = null;

function toBoard(clientX, clientY) {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(boardGroup.getScreenCTM().inverse());
}

function setLineEnd(line, point) {
  line.setAttribute('x2', point.x);
  line.setAttribute('y2', point.y);
}

export function clearLosLines() {
  activeLine = null;
  losLayer?.replaceChildren();
}

function stopBoardEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function onMousedown(e) {
  if (!e.shiftKey || e.button !== 0) return;
  if (!losLayer) return;

  const start = toBoard(e.clientX, e.clientY);
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('class', 'los-line los-line-preview');
  line.setAttribute('x1', start.x);
  line.setAttribute('y1', start.y);
  line.setAttribute('x2', start.x);
  line.setAttribute('y2', start.y);
  losLayer.appendChild(line);
  activeLine = line;
  stopBoardEvent(e);
}

function onMousemove(e) {
  if (!activeLine) return;
  setLineEnd(activeLine, toBoard(e.clientX, e.clientY));
  stopBoardEvent(e);
}

function onMouseup(e) {
  if (!activeLine) return;
  setLineEnd(activeLine, toBoard(e.clientX, e.clientY));
  activeLine.classList.remove('los-line-preview');
  activeLine = null;
  stopBoardEvent(e);
}

function onKeydown(e) {
  const target = e.target;
  const isTypingField = target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (isTypingField || e.key !== 'Escape') return;
  if (!losLayer?.childElementCount) return;
  clearLosLines();
  e.preventDefault();
}

export function initLosLineTool(svg) {
  svgEl = svg;
  boardGroup = svg.querySelector('#board-group');
  losLayer = svg.querySelector('#layer-los');
  if (!boardGroup || !losLayer) return;

  svg.addEventListener('mousedown', onMousedown, true);
  window.addEventListener('mousemove', onMousemove, true);
  window.addEventListener('mouseup', onMouseup, true);
  window.addEventListener('keydown', onKeydown);
}
