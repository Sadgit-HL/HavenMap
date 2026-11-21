// Advantage and disadvantage of a modifier deck: which of the last two cards counts. Pure functions, no DOM.
//
// The rules (Frosthaven rulebook and FAQ, as the owner plays them, 2026-11-21): with advantage or disadvantage the attacker draws until a card that is
// not rolling (N), then one more card (C); a rolling icon on C is ignored. The rolling cards drawn before N are all added to the selected card with
// advantage and all ignored with disadvantage; they take no part in the comparison. With advantage a character chooses N or C; a monster (the monster
// and the ally deck) always takes the better one. With disadvantage the worse one is taken. A card that is not clearly better or worse (ambiguous) or
// that is equal: N, the card drawn first.
//
// Comparing two cards: a number each, x2 counts as +attack value (needs the attack), Miss is worse than every card. A non-numeric effect (condition,
// element, shield, heal, text; also a harmful one) has a positive but unknown value:
//   - both cards plain, or the same effects on both: the numbers decide (equal: N);
//   - one card has an effect, the other is plain: the effect card is better if its number is equal or higher, else ambiguous;
//   - different effects on both cards: ambiguous, whatever the numbers.
// What the data cannot tell (the board state behind a conditional bonus, items such as the Iron Helm) is left to the player: the dialog can switch
// the automatic choice by hand.

const NUMBER = /^([+-]\d+):\s*(.*)$/;                                      // unique cards: "+1: gain 1 TT"
const rollingMark = text => text.replace(/\s*>\s*$/, '').trim();

// Terms of a card (a tile of drawState): { kind: 'num' | 'x2' | 'miss', num, effects: [text, sorted] }.
export function cardTerms(t) {
  if (t.key === 'bless') return { kind: 'x2', num: 0, effects: [] };           // a bless card is a x2 card, a curse card a Miss card
  if (t.key === 'curse') return { kind: 'miss', num: 0, effects: [] };
  let kind = 'num', num = 0, effects = [];
  const value = String(t.value ?? ''), face = String(t.face ?? '');
  const byValue = v => { if (v === 'x2') kind = 'x2'; else if (v === 'null') kind = 'miss'; else if (/^[+-]\d+$/.test(v)) num = parseInt(v, 10); };
  if (t.card?.kind === 'shared') {
    byValue(String(t.card.value ?? value));
    effects = (t.card.tokens || []).filter(k => k.key !== 'rolling' && k.word !== 'flip').map(k => `${k.cat}:${k.word}${k.amount != null ? `#${k.amount}` : ''}`);
  } else if (t.card?.kind === 'unique') {
    const m = NUMBER.exec(face), two = /^2x:\s*(.*)$/i.exec(face);
    if (m) { num = parseInt(m[1], 10); effects = [rollingMark(m[2]).toLowerCase()]; }
    else if (two) { kind = 'x2'; effects = [rollingMark(two[1]).toLowerCase()]; }
    else effects = [rollingMark(face).toLowerCase()];                          // no value before a colon: +0 and the whole text is the effect
  } else {                                                                      // standard cards and the imbuement cards of the monster deck
    byValue(value);
    if (kind === 'num') effects = [rollingMark(face.replace(/^[+-]\d+\s*/, '')).toLowerCase()];
  }
  return { kind, num, effects: [...new Set(effects.filter(Boolean))].sort() };
}

// Which of two cards is better: { order, needAttack? }. order 1 = a is better, -1 = b is better, 0 = equal, null = ambiguous. attack is the attack
// value (needed to compare a x2 card with another card, then needAttack is true) or null.
export function compareCards(a, b, attack = null) {
  if (a.kind === 'miss' || b.kind === 'miss') return { order: a.kind === b.kind ? 0 : a.kind === 'miss' ? -1 : 1 };
  const same = a.effects.length === b.effects.length && a.effects.every((e, i) => e === b.effects[i]);
  const hasA = a.effects.length > 0, hasB = b.effects.length > 0;
  if (hasA && hasB && !same) return { order: null };
  const known = attack !== null && attack !== undefined && attack !== '' && Number.isFinite(Number(attack));
  let va, vb;
  if (a.kind === 'x2' && b.kind === 'x2') va = vb = 0;                          // the same attack value on both
  else if (a.kind === 'x2' || b.kind === 'x2') {
    if (!known) return { order: null, needAttack: true };
    va = a.kind === 'x2' ? Number(attack) : a.num;
    vb = b.kind === 'x2' ? Number(attack) : b.num;
  } else { va = a.num; vb = b.num; }
  if ((!hasA && !hasB) || same) return { order: Math.sign(va - vb) || 0 };
  if (hasA) return { order: va >= vb ? 1 : null };
  return { order: vb >= va ? -1 : null };
}

// The card that counts. mode 'adv' or 'dis'; who 'hero' (a character) or 'monster' (monster and ally deck); n and c the terms of N and C (c null when no
// second card could be drawn); attack as in compareCards. Returns { selected: 'N' | 'C' | null, choose, ambiguous, equal, needAttack }:
// choose = the player picks (advantage of a character), selected is null then.
export function selectCard({ mode, who, n, c, attack = null }) {
  if (!n) return { selected: null, choose: false, ambiguous: false, equal: false, needAttack: false };
  if (!c) return { selected: 'N', choose: false, ambiguous: false, equal: false, needAttack: false };
  if (mode === 'adv' && who === 'hero') return { selected: null, choose: true, ambiguous: false, equal: false, needAttack: false };
  const r = compareCards(n, c, attack);
  let selected = 'N';
  if (!r.needAttack) {
    if (mode === 'adv' && r.order === -1) selected = 'C';                       // the better card is the second
    if (mode === 'dis' && r.order === 1) selected = 'C';                        // the worse card is the second
  }
  return { selected, choose: false, ambiguous: r.order === null && !r.needAttack, equal: r.order === 0, needAttack: !!r.needAttack };
}
