// Layout of the scenario flowchart: pure functions (no DOM, no storage), so the layout can be checked in Node.
//
// Nodes are scenarios, edges are the unlock links (`unl` of a scenario). Columns follow the unlock order (longest path from the
// scenarios nobody unlocks), rows are grouped in lanes, one lane per storyline (the first part of the scenario's `area`). Scenarios
// with no link in the shown set are put in a grid under the linked ones of their lane.

// Lane order (2026-11-18): the order with the shortest total arrow length on the full chart (local search over the orders,
// measured with the end points of the arrows): 13170 against 18328 for the earlier order; 12875 once 13 Icecrag Ascent
// moved to Voice and Drake, 12621 with 1, 2 and 3 in Guards (still the best order); 18237 with the sticker boxes (bigger
// boxes, same best order). The lanes without links between lanes (PQ, Random, Puzzle, Events) are
// last. "Other" is empty since then and stays as the fallback for a scenario with an unknown area.
export const LANES = ['Merchants', 'Demons', 'Hail', 'Guards', 'Voice and Drake', 'Other', 'Sewers', 'The Gloom', 'PQ', 'Random', 'Puzzle', 'Events'];

// Storyline of a scenario: the first part of its area; "Intro/Voice and Drake" and the typo "Into/Hail" take the second part.
export function laneOf(s) {
  const parts = String(s.area || '').split('/').map(x => x.trim()).filter(Boolean);
  const p = /^(intro|into)$/i.test(parts[0] || '') ? parts[1] : parts[0];
  return LANES.includes(p) ? p : 'Other';
}

// Storyline colours (2026-11-18): the hues of the owner's GH2 Flow sheet, darkened for the dark page.
export const LANE_COLOR = { Merchants: '#5fae8a', Demons: '#d0483c', Hail: '#3f80c8', Guards: '#d8b545', 'Voice and Drake': '#b8679a',
  Other: '#8a8a8a', Sewers: '#6aa84f', 'The Gloom': '#8f7fb0', PQ: '#b85050', Random: '#a3843a', Puzzle: '#e0952a', Events: '#c98e8e' };

// Boxes are sticker cards (sticker art on top, number and name in a band below).
export const BOX = { w: 150, h: 128, colGap: 46, rowGap: 12, laneGap: 12, labelW: 100, pad: 8, gridCols: 6 };

/*
buildFlow(scenarios, visible)
  scenarios  [{ n, name, area, unl: [n] }]
  visible    Set of scenario numbers to draw (links to scenarios outside the set are dropped)
Returns { nodes: [{ n, x, y, w, h, lane, layer }], edges: [{ from, to, d }], lanes: [{ name, y, h }], width, height }.
*/
export function buildFlow(scenarios, visible, order = LANES) {
  const { w, h, colGap, rowGap, laneGap, labelW, pad, gridCols } = BOX;
  const nodes = scenarios.filter(s => visible.has(s.n));
  const ids = new Set(nodes.map(s => s.n));
  const edges = [];
  for (const s of nodes) for (const t of s.unl || []) if (ids.has(t) && t !== s.n) edges.push([s.n, t]);

  // Column = longest path from a scenario nobody unlocks. A cycle would never settle, so the passes are limited.
  const layer = new Map(nodes.map(s => [s.n, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const [a, b] of edges) if (layer.get(b) < layer.get(a) + 1) { layer.set(b, layer.get(a) + 1); changed = true; }
    if (!changed) break;
  }
  const linked = new Set(edges.flat());
  const preds = new Map(nodes.map(s => [s.n, []]));
  for (const [a, b] of edges) preds.get(b).push(a);

  const placed = new Map();                                   // n -> { n, x, y, w, h, lane, layer }
  const lanes = [];
  let top = pad;
  for (const name of order) {
    const inLane = nodes.filter(s => laneOf(s) === name);
    if (!inLane.length) continue;
    const conn = inLane.filter(s => linked.has(s.n)), free = inLane.filter(s => !linked.has(s.n));
    // Rows of the linked nodes: per column, ordered by the mean row of the predecessors already placed (fewer crossings).
    const cols = new Map();
    for (const s of conn) { const l = layer.get(s.n); (cols.get(l) || cols.set(l, []).get(l)).push(s); }
    const rowOf = new Map();
    let rows = 0;
    for (const l of [...cols.keys()].sort((a, b) => a - b)) {
      const list = cols.get(l);
      const key = s => { const r = preds.get(s.n).filter(p => rowOf.has(p)).map(p => rowOf.get(p)); return r.length ? r.reduce((x, y) => x + y, 0) / r.length : 1e6 + s.n; };
      list.sort((a, b) => key(a) - key(b) || a.n - b.n);
      list.forEach((s, i) => { rowOf.set(s.n, i); rows = Math.max(rows, i + 1); });
    }
    for (const s of conn) placed.set(s.n, { n: s.n, x: labelW + layer.get(s.n) * (w + colGap), y: top + rowOf.get(s.n) * (h + rowGap), w, h, lane: name, layer: layer.get(s.n) });
    let y = top + rows * (h + rowGap);
    free.sort((a, b) => a.n - b.n).forEach((s, i) => {
      placed.set(s.n, { n: s.n, x: labelW + (i % gridCols) * (w + rowGap), y: y + Math.floor(i / gridCols) * (h + rowGap), w, h, lane: name, layer: -1 });
    });
    const gridRows = Math.ceil(free.length / gridCols);
    const height = Math.max(h, (rows + gridRows) * (h + rowGap) - rowGap);
    lanes.push({ name, y: top - 4, h: height + 8 });
    top += height + laneGap + 8;
  }
  const out = [...placed.values()];
  const edgeOut = edges.map(([a, b]) => {
    const p = placed.get(a), q = placed.get(b);
    const x1 = p.x + w, y1 = p.y + h / 2, x2 = q.x, y2 = q.y + h / 2;
    const dx = Math.max(24, Math.abs(x2 - x1) / 2);
    return { from: a, to: b, d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}` };
  });
  const width = Math.max(labelW + w + pad, ...out.map(n => n.x + w + pad));
  return { nodes: out, edges: edgeOut, lanes, width, height: Math.max(top, h + 2 * pad) };
}
