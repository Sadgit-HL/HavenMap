// UI-only state — not serialized to URL.

export const uiState = {
  selectedHex:      null,
  selected:         null,
  stack:            [],
  expandedSections: new Set(),
  addPanelOpen:     false,
  addPanelTab:      'monsters',
  addPanelSearch:   '',
  recentAdds:       [],
  condPickerOpen:   false,
  mobilePanel:      'selection',
  mobileDetailsOpen:false,
  mobileMoveMode:   false,
  abilityDrawer:    null,   // index of the monster whose ability card drawer is open (the picker, when the map's ability decks are hidden)
  // Monster turn panel (scripts/monsterTurn.js): on = Show: the solver runs and the board is marked (off: nothing runs, nothing is drawn); detailsOpen = the details under the buttons are open (the data loads then too); action
  // values, movement type, initiatives by figure ('kind:id'), areaOpen / valuesOpen = the area grid and the manual values are opened by hand. Session only.
  turn: { on: false, move: 3, range: 0, fly: false, jump: false, tele: false, farthest: false, noAttack: false, targets: 1, all: false, area: [], cells: null, appliedKey: null, pick: {}, areaOpen: false, valuesOpen: false, detailsOpen: false, choice: null, lastPost: '', postFor: null, copied: false, init: {} },
};

const listeners = [];
export function subscribeUI(fn) { listeners.push(fn); }
function notify() { listeners.forEach(fn => fn()); }

export function selectHex(col, row) {
  uiState.selectedHex  = { col, row };
  uiState.selected     = null;
  uiState.stack        = [];
  uiState.addPanelOpen = false;
  uiState.mobilePanel  = 'selection';
  uiState.mobileDetailsOpen = false;
  uiState.mobileMoveMode = false;
  notify();
}

export function selectObject(kind, idx, col, row) {
  uiState.selectedHex  = { col, row };
  uiState.selected     = { kind, idx };
  uiState.abilityDrawer = null;
  uiState.stack        = [];
  uiState.addPanelOpen = false;
  uiState.mobilePanel  = 'selection';
  uiState.mobileDetailsOpen = false;
  uiState.mobileMoveMode = false;
  notify();
}

export function showStack(objects, col, row) {
  uiState.selectedHex  = { col, row };
  uiState.selected     = null;
  uiState.stack        = objects;
  uiState.addPanelOpen = false;
  uiState.mobilePanel  = 'selection';
  uiState.mobileDetailsOpen = false;
  uiState.mobileMoveMode = false;
  notify();
}

export function showStackWithSelection(objects, col, row, kind, idx) {
  uiState.selectedHex  = { col, row };
  uiState.selected     = { kind, idx };
  uiState.stack        = objects;
  uiState.addPanelOpen = false;
  uiState.mobilePanel  = 'selection';
  uiState.mobileDetailsOpen = false;
  uiState.mobileMoveMode = false;
  notify();
}

export function selectFromStack(kind, idx) {
  uiState.selected = { kind, idx };
  uiState.stack    = [];
  notify();
}

export function deselectObject() {
  uiState.selected = null;
  notify();
}

export function clearSelection() {
  uiState.selectedHex  = null;
  uiState.selected     = null;
  uiState.stack        = [];
  uiState.addPanelOpen = false;
  uiState.mobileDetailsOpen = false;
  uiState.mobileMoveMode = false;
  notify();
}

export function setTurn(patch) { Object.assign(uiState.turn, patch); notify(); }

export function toggleSection(key) {
  if (uiState.expandedSections.has(key)) uiState.expandedSections.delete(key);
  else                                    uiState.expandedSections.add(key);
  notify();
}

export function openAddPanel()  { uiState.addPanelOpen = true; uiState.mobileDetailsOpen = false; uiState.addPanelTab = 'monsters'; uiState.addPanelSearch = ''; notify(); }
export function closeAddPanel() { uiState.addPanelOpen = false; uiState.addPanelSearch = ''; notify(); }
export function setAddTab(tab)  { uiState.addPanelTab = tab; uiState.addPanelSearch = ''; notify(); }
export function rememberAdd(kind, id) {
  uiState.recentAdds = [
    { kind, id: Number(id) },
    ...uiState.recentAdds.filter(item => !(item.kind === kind && Number(item.id) === Number(id))),
  ].slice(0, 6);
  notify();
}
export function setAbilityDrawer(idx) { uiState.abilityDrawer = idx; notify(); }
export function toggleCondPicker() { uiState.condPickerOpen = !uiState.condPickerOpen; notify(); }
export function closeCondPicker()  { uiState.condPickerOpen = false; notify(); }
export function setMobilePanel(panel) {
  uiState.mobilePanel = panel;
  uiState.mobileDetailsOpen = false;
  uiState.addPanelOpen = false;
  uiState.addPanelSearch = '';
  notify();
}
export function openMobileDetails()  { uiState.mobileDetailsOpen = true; notify(); }
export function closeMobileDetails() { uiState.mobileDetailsOpen = false; notify(); }
export function setMobileMoveMode(active) { uiState.mobileMoveMode = Boolean(active); notify(); }
