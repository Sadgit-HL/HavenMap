# scripts/amd — attack modifier deck (AMD) card rendering

App-agnostic ES modules that draw hero attack-modifier cards (perk lists, deck views). Used by the
perks viewer today; meant to be reused by HavenMap and the campaign app.

| File | Role |
|---|---|
| `card.js` | **Public API.** `buildCard(card, className, isAdded)` -> DOM element (`.pc`). Handles the three card kinds in `scripts/games/perks.js`. |
| `compose.js` | Layered composition of decorated (`shared`) faces: frame + icons + overlays + corner badges. Also exports the pieces `perks/compose.html` uses. |
| `paths.js` | `ASSET_BASE`: URL of `images/common/attack_mods/`, resolved from the module's own location (no per-page path fiddling). |
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
- Class icons are tight-cropped with differing aspect ratios; `fitClassIcon` sizes by area so they look equal.

## Assets (runtime) — `images/common/attack_mods/`
`frames/ numbers/ spheres/ class_icons/ icons/{center,side,small}/ unique/` — exactly what the
perk lists load (traced in a browser across FH, GH2E, JotL, MP). Root `gh-am-*.webp` belong to the
live HavenMap deck (`scripts/attackMods.js`). Everything else was moved to
`../asset-backups/attack-modifier-cards/` (see its README) and can be copied back.

Generated data: `tools/extract-perks.mjs` -> `scripts/games/perks.js`. Asset converters: `tools/*.py`.
