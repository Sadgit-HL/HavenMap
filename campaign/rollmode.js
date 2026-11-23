// The roll mode (display setting `roll`, kept in this browser): how cards and results are drawn on the campaign page.
//   'geek'  GeekRoller: the code buttons and the "click the card the roll gave" flows are shown, the app's own Draw buttons are hidden.
//   'app'   This app: the Draw buttons are shown (random draws saved in the record), the code buttons are hidden.
// Marking a card by hand (a click on a card, a chip or a stack) works in both modes. The journal's battle goal and personal quest codes and the
// BGG codes modal have no draw of their own and stay in both modes.
let mode = 'geek';
export const setRollMode = v => { mode = v === 'app' ? 'app' : 'geek'; };
export const appRoll = () => mode === 'app';
// Attribute strings for elements that belong to one mode only (`[hidden]` hides, see style.css).
export const onlyApp = () => (mode === 'app' ? '' : ' hidden');
export const onlyGeek = () => (mode === 'geek' ? '' : ' hidden');
