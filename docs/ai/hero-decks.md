# Hero attack modifier decks

Status: done on `main` (map app, 2026-11-07). Campaign playmat uses the same perk data through `scripts/campaign/amdDeck.js`.

## What the map app does

- The attack modifier panel has tabs: Monsters, Allies, then one per hero on the map (named by class; two of one class get `#1`, `#2`). Selecting a hero focuses its tab.
- A hero deck starts as the standard 20 cards. Draw, return, shuffle, end-of-round reshuffle, and the GeekRoller code work as for monsters.
- Perks button (`Perks n/total`): the class perks, and the cards each perk swaps. Ticking a perk changes the base composition. Repeated perks show one row with N boxes. `[double]` and `[triple]` perks need all boxes ticked. Text-only perks show their description with `%token%` placeholders turned into icons.
- Edit (pencil): basic cards (+0, +1, -1 ...) can be added or removed by hand (scenario effects). Perk faces change only through the perk list.
- Hover shows an enlarged preview.

## State

`mercenaries[i].am` stores only the difference from the standard deck (`null` or missing = standard):

```
{ discard:{key:n}, deck?:{key:n}, base?:{key:n}, lvl?, perks?:[entryIndex], boxes?:{entryIndex:bitmask} }
```

- Card keys: standard `p0 p1 p2 m1 m2 x2 miss`, art slug for decorated faces (for example `plus2strengthenally`), `u-<code>` for unique faces.
- `perks`: taken perk entries (index into `PERKS[edition][class]`). `boxes`: ticked boxes of multi-box perks not yet complete.
- Ticking a perk applies its card swap to `base`; unticking reverts it. Manual basic-card edits stay on top.
- `withoutAm()` (`scripts/state.js`): copies of a hero start with a fresh deck and no campaign link.

Campaign side: the record's `chars[].pk` holds the same kind of data (`perks`, `boxes`, `ms`) and `scripts/campaign/amdDeck.js` derives the deck from it. The campaign deck state (draws, top, bottom) is session only.

## Code map

| Where | What |
|---|---|
| `scripts/games/perks.js` | GENERATED from FrosthavenAssistant edition data: 43 classes (17 FH, 18 GH2E, 4 JotL, 4 MP), 711 perk entries. Do not edit. |
| `tools/extract-perks.mjs`, `tools/perks-decode.mjs` | generator and slug decoder. Input: local clone at `asset-backups/amd/FrosthavenAssistant` |
| `tools/check-perk-icons.mjs` | every perk text token has an icon |
| `scripts/amd/heroDeck.js` | pure model: mercenary title to perk class (`heroPerkClass`), catalog (`heroCatalog`), `perkDelta`, `perkBoxes`, `perkLabel`, `groupPerks`. Cached per class |
| `scripts/amd/card.js` | `buildCard(card, className, isAdded)`: renders one card |
| `scripts/amd/compose.js` | layered build of decorated faces: frame, icons, amounts, value and class badges |
| `scripts/amd/uniqueFaceText.js` | hand-written GeekRoller text for the 68 unique cards |
| `scripts/amd/perkText.js` | perk description icons |
| `scripts/attackMods.js` | deck state and logic in the map (`deckOf`, `amHeroPerks`, `amToggleBox`, `amCardLocked`, `amClassName`) |
| `scripts/decks.js` | the panel: tabs, tiles, perk rows; `amView` holds view state |
| `scripts/amd/README.md` | file table and rendering rules for this folder |

Mercenary title to perk class: by title. One alias: `HIVE` maps to `H.I.V.E.`. A class without perk data gets the plain deck and no Perks button.

## Card rendering rules

- Plain card (no icon): frame and number. Class badge only when the perk adds the card (`isAdded`).
- Decorated card (`shared`): composed live, value badge and class badge. Any icon takes over the big centre circle in the icon's colour; the value shrinks into the bottom-left badge.
- Unique card (`unique`): the baked image `unique/<code>.webp` (real scan), drawn as is.
- Layout coordinates on the 600x391 canvas are in `docs/ai/reference/hero-modifier-faces.md` section 3a and `compose.js`.
- Cache busting: `?v=` strings in `index.html`, the imports of `scripts/amd/*`, `scripts/decks.js`, and the `perks/*.html` pages. Bump them when editing.

## GeekRoller codes

- BGG rejects a roll longer than 255 characters, counted over the whole `1customN{...}` string. Bless and Curse faces are `B` and `C`.
- Face text: `uniqueFaceText.js` (unique cards, hand-written) and `faceText()` in `heroDeck.js` (shared cards, generated). `docs/ai/reference/geekroller-codes.md` is the table for the unique cards; keep it in step.
- Conventions: no leading `+0:` on faces with an effect; `tr` trap, `inf` infusion, `Res` resonance; `AA:` for cards placed in the active area; `R` range, `Ret` retaliate.
- Measured on 2026-11-08 with all perks active: Trapper about 393, Crashing Tide 287, Soothsinger 282, Snowdancer 277, Sawbones 267, Satha 260, Shattersong 257 (all over 255). Infuser 255, Nightshroud about 193. No automatic fallback exists. A compact fallback was tried and reverted on request.

## Assets

- Runtime under `images/common/attack_mods/`: `frames/ numbers/ spheres/ class_icons/ icons/{center,side,small}/ unique/`, plus `monster/` and `imbuement/` for the live monster deck. Perk icons in `images/common/perk-icons/`.
- The 101 reference scans and unused layers are outside the repo in `asset-backups/attack-modifier-cards/` (see its README).
- Art pipeline (`tools/convert-*.py`, `export-am-layers.jsx`, `make-*.py`, `clean-pierce-icon.py`): see `data-pipeline.md`. Photoshop gotchas: ungroup the document from its artboard first; never save the PSD.
- Frosthaven Assistant and Secretariat images and data: licence open (`roadmap.md`).

## Open items

- A perk-added `+1` merges into the standard `+1` count, so its tile has no class badge (only the perk list shows it).
- Shield (3 faces) and retaliate (1) frames use the placeholder `p0` (verify, from 2026-11-07).
- Unique cards that stay in the active area are tracked like any card.
- Not refactored on purpose: alt-drag copy beside `cloneForPlacement`, the compare page's scheme, CSS consolidation.
- Face questions for the owner: Heal frame colour, the "wound or immobilize" face, the value of `Invis ->` (assumed +0), whether `plus1any` is the wild face.
