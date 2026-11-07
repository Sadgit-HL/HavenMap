# scripts/amd — attack modifier deck (AMD) card rendering

App-agnostic ES modules that draw hero attack-modifier cards and model hero decks. Used by the perks
viewer (`perks/`) and by HavenMap's attack modifier panel (`scripts/decks.js`, `scripts/attackMods.js`);
meant to be reused by the campaign app.

| File | Role |
|---|---|
| `card.js` | **Public API.** `buildCard(card, className, isAdded)` -> DOM element (`.pc`). Handles the three card kinds in `scripts/games/perks.js`. |
| `compose.js` | Layered composition of decorated (`shared`) faces: frame + icons + overlays + corner badges. `compose(card, diag)` returns layers `{src, label, icon?, transform?, origin?}`; diagnostics only when `diag` (compare page). Also exports the pieces `perks/compose.html` uses. |
| `dom.js` | `layer(cls)` and `img(src, cls, lazy)` builders shared by `card.js` and `compose.js`. |
| `heroDeck.js` | **Hero deck model** (pure data, no DOM/state): mercenary title -> perk class (`heroPerkClass`), card keys (`p0..`, art slug, `u-<code>`), per-class card catalog (`heroCatalog`), `perkDelta`, and the perk-list rules: `perkBoxes` / `perkLabel` (`[double]`/`[triple]`), `groupPerks` (identical entries = one repeated perk). Results are cached per class. Used by `scripts/attackMods.js`. |
| `perkText.js` | `perkTextHtml(text)`: perk descriptions with `%token%` placeholders -> inline icons (`images/common/perk-icons/`). `node tools/check-perk-icons.mjs` checks every token has an icon. |
| `paths.js` | `ASSET_BASE` / `PERK_ICON_BASE`: URLs of the image folders, resolved from the module's own location (no per-page path fiddling). |
| `amd.css` | Card structure (`.pc`, layers, badges, stack). Size with `--pc-width` (default 90px). Hosts add their own hover/layout. |
| `fonts/` | Blackletter font used for amounts drawn on faces (referenced by `amd.css`). |

## Use it

```html
<link rel="stylesheet" href="…/scripts/amd/amd.css">
```
```js
import { PERKS } from '…/scripts/games/perks.js';
import { buildCard } from '…/scripts/amd/card.js';
el.append(buildCard({ kind: 'base', value: '+1' }, 'Boneshaper', /* isAdded */ true));
```

## Rules the model encodes
- `base` card (plain +0..+4, -1, -2, null): frame + number. **Class badge only when the perk adds it** (`isAdded`); cards a perk removes come from the standard deck and have none.
- `shared` card: composed live (`compose.js`); value badge + class badge.
- `unique` card: baked `unique/<code>.webp` shown as is (class badge already in the image).
- Class icons are tight-cropped with differing aspect ratios; `fitClassIcon` (in `compose.js`) sizes by area so they look equal, and remembers the fitted box per icon file.
- Perk list (`amHeroPerks` in `scripts/attackMods.js`): a perk **repeated** N times on the sheet is N identical entries -> one row with N boxes that each count on their own (`kind: 'repeat'`); a `[double]`/`[triple]` perk is one entry whose boxes must all be ticked (`kind: 'linked'`). State per hero: `perks` (taken entries) and `boxes` (bitmask of partly ticked multi-box perks).
- A hero's basic cards (+0, +1, ...) can be edited by hand; its perk faces only change through the perk list (`amCardLocked`).

## Assets (runtime) — `images/common/attack_mods/`
`frames/ numbers/ spheres/ class_icons/ icons/{center,side,small}/ unique/` — exactly what the
perk lists load (traced in a browser across FH, GH2E, JotL, MP). `monster/` and `imbuement/` belong to the
live HavenMap deck (`scripts/attackMods.js`). Everything else was moved to
`../asset-backups/attack-modifier-cards/` (see its README) and can be copied back.

Generated data: `tools/extract-perks.mjs` -> `scripts/games/perks.js`. Asset converters: `tools/*.py`.

## Live-deck card images (HavenMap `scripts/attackMods.js`)
Named after the face, same slugs as the perk art:
`monster/` — `plus0 plus1 plus2 minus1 minus2 x2 miss bless curse`;
`imbuement/` — `plus0poison plus0wound plus1curse plus1heal1 plus2muddle plus3`.
