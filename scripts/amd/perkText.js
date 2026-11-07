// Perk descriptions come from FrosthavenAssistant with %token% placeholders for icons ("%use%%dark%
// to perform %muddle%, %range% 2"). perkTextHtml() turns a description into HTML with the icons
// inline. Icon files live in images/common/perk-icons/<token>.png (Frosthaven-style variants where
// FrosthavenAssistant has them). A token without an icon is shown as its plain word, so nothing
// disappears silently. Style: .pt-icon in scripts/amd/amd.css.
import { PERK_ICON_BASE as ICON_BASE } from './paths.js?v=2';
import { escapeHtml as esc } from '../escape.js';

// Tokens that have an icon file. Keep in sync with the folder; tools/check-perk-icons.mjs verifies it
// against every placeholder in perks.js.
export const PERK_ICON_TOKENS = new Set([
  'air', 'airearth', 'any', 'attack', 'bless', 'brittle', 'curse', 'damage', 'dark', 'disarm', 'earth',
  'fire', 'flip', 'heal', 'ice', 'iceair', 'icedark', 'iceearth', 'immobilize', 'impair', 'invisible',
  'light', 'lightdark', 'loot', 'move', 'muddle', 'pierce', 'poison', 'pull', 'push', 'range',
  'regenerate', 'retaliate', 'safeguard', 'shield', 'strengthen', 'stun', 'target', 'teleport', 'use',
  'ward', 'wound',
]);

// Words for the alt/title text and the fallback ("flip" is the rolling mark).
const WORD = { flip: 'rolling', iceair: 'ice/air', icedark: 'ice/dark', iceearth: 'ice/earth', airearth: 'air/earth', lightdark: 'light/dark' };

export function perkTextHtml(text) {
  return esc(text || '').replace(/%(\w+)%/g, (_, tok) => {
    const word = WORD[tok] || tok;
    return PERK_ICON_TOKENS.has(tok)
      ? `<img class="pt-icon" src="${ICON_BASE}/${tok}.png" alt="${word}" title="${word}">`
      : `<em class="pt-word">${esc(word)}</em>`;
  });
}
