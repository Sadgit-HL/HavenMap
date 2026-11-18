# Data pipeline: generated files, generators, sources, licences

Rule: never hand-edit a file marked GENERATED. Fix the generator (or its input table) and regenerate. If a generator is missing from the repo, say so and get the owner's decision before editing the output.

## Generated files and their generators

| Output | Generator | Input (outside repo unless noted) |
|---|---|---|
| `scripts/games/gh2_classes.js`, `gh2_cards.js`, `gh2_items.js`, `gh2_scenarios.js` (incl. stickers), `gh2_events.js`, `gh2_quests.js`, `battle_goals.js` | `tools/extract-campaign-tables.py` | the Card DB and GH2 Flow sheets of `WHTracker.xlsx`. Also reads `tools/card-initiative.json` |
| `scripts/games/gh2_event_front.js`, `gh2_event_back.js` (lazy), `gh2_event_boxes.js`, `gh2_class_traits.js`; copies art to `images/events/` | `tools/extract-event-text.py` | Secretariat `data/gh2e/events.json`, class folders, `src/assets/artwork/events` |
| `scripts/games/gh2_prosperity.js` | `tools/extract-prosperity.py` | Secretariat gh2e data |
| `scripts/games/gh2_reputation.js` | `tools/extract-reputation.py` | Secretariat gh2e data |
| `scripts/games/masteries.js` | `tools/extract-masteries.py` | Secretariat data |
| `scripts/games/gh2_pq_text.js` | `tools/extract-pq-text.py` | Secretariat gh2e data |
| `scripts/games/perks.js` | `tools/extract-perks.mjs` (+ `perks-decode.mjs`) | FrosthavenAssistant clone at `asset-backups/amd/FrosthavenAssistant` |
| `scripts/games/wh_cards.js` (Frosthaven and Jaws ability cards, Cards tab) | `tools/extract-worldhaven-cards.py` | `data/character-ability-cards.js` of the worldhaven clone (`D:\github\worldhaven`, any2cards/worldhaven). Initiative gaps filled from the Secretariat fh and jotl decks (numbers only) |
| `scripts/games/solo_items.js` (solo items of the Frosthaven and Mercenary Pack classes, merged with `gh2_items.js` in `scripts/campaign/itemList.js`; `back` marks flip items); writes `images/items/fh|mp/<id>.webp` and `<id>b.webp` (backs) and their manifest records | `tools/prep-mp-solo-items.py` (Mercenary Pack pictures: straighten, crop, improve), then `tools/extract-solo-items.py`, then `tools/generate-image-index.py` | Secretariat `data/solo/items.json` and `data/fh/label/spoiler/en.json`; worldhaven `images/items/frosthaven/248-264`; the owner's Worldhaven folder `characters/mp/character_solo_items` (Hail scans, photographs of the other cards) |
| `images/items/gh2/<id>b.webp`: backs of the eight GH2E flip items (54, 72, 74, 80, 100, 116, 128, 162), and their manifest records. The app shows a back wherever one exists (`itemBackUrl` in `scripts/campaign/cardImages.js`) | `tools/convert-item-backs.py`, then `tools/generate-image-index.py` | `Wordhaven_Assets/wh_items/gh2/<id>b.png` (74 and 80 as `74b.png`, `80b.png`). The flip list was checked by template matching the flip icon on all fronts |
| `scripts/campaign/bggIcons.js` | `tools/extract-bgg-icons.py` | the BGG codes list in `campaign/mockups/merc-6-playmat-v2.html` |
| `campaign/mockups/*.html`, `mock.css` | `tools/merc-mockups/gen-merc-mockups.mjs` | run with `MERC_MOCKUP_OUT="<repo>/campaign/mockups/" node ...`. Later hand edits in `merc-6` exist (see `status.md`): check the diff before regenerating |
| `asset-backups/campaign-import.json`, copy in `import/` | `tools/import-campaign-state.py` | `WHTracker.xlsx`. Test data only; the owner syncs state by hand |

Generated, but no generator in the repo (do not regenerate without a plan):

- `scripts/games/gh2_treasures.js`: header says it comes from Secretariat `data/gh2e/treasures.json`. Generator not found in `tools/`.
- `scripts/games/gh_decks.js`: generated from `gh2_monster_abilities.xlsx`. Generator not found in `tools/`.

Hand-maintained inputs and outputs:

- `scripts/games/resources.js`: from the workbook's Resources sheet, edited by hand.
- `scripts/games/portrait-focus.json`: made with `campaign/mockups/portrait-tool.html`.
- `tools/card-initiative.json` (445 entries): initiative read from card images. Input for `extract-campaign-tables.py`.
- `scripts/campaign/classTokens.js`, `classList.js`, `cardImages.js`, `bggBanners.js`: hand-written.
- `campaign/playmat.css`: hand-maintained since 2026-11-14. `tools/build-playmat-css.py` refuses to run without `--force`, and running it would break the settings panel. Do not run it.

## Regeneration rules

- Run Python generators with `python -I` (isolated mode).
- The workbook exists in two versions: `asset-backups/WHTracker.xlsx` (default) and `import/WH Tracker.xlsx`. They differ. Pass the path explicitly and say which one you used. On 2026-11-18 the default path was missing; `../campaign_assets/WHTracker.xlsx` (2026-11-06) was used and gave the same scenario rows as the live sheet.
- Running `extract-campaign-tables.py` rewrites several generated files, some with unrelated changes (cards, scenarios, events, quests). Before running, commit or stash the intended changes. After running, restore everything except the intended file. Check `git diff` first: a restore discards hand patches in those files (see the card and battle goal fixes below).
- Corrections go into the generator's fix tables, not the output: `CLASS_NAME_FIX` (Plagueherald), `ITEM_SLOT_FIX` (items 169 and 170), `SCENARIO_AREA_FIX` (storyline of scenarios 1, 2, 3, 5, 11, 13), `CARD_FIX` (seven level 9 cards filed under the next class), and the initiative JSON.
- Card ids are `classIndex * 100 + n`. They change when the Card DB rows change. Saved campaign records must be re-imported after such a change.
- `gh2_cards.js`, `battle_goals.js` and `gh2_items.js` have had hand patches as well (level X and battle goal text, 2026-11-09). Check that the generator carries them before regenerating.

## Asset sources

- Ability card pictures: `Sadgit-HL/Wordhaven_Assets` on GitHub, read by URL (`scripts/campaign/cardImages.js`, `raw.githubusercontent.com`). Local clone: `D:\github\Wordhaven_Assets`. Path rule reproduces all 649 URLs. Eight cards have no picture.
- Other paths in the same repo: `wh_items/gh2/<id>.png`, `wh_character_mats/<front|back>/<class>.png`, `wh_banners/<slug>.jpg`, `wh_events/gh2_events/ce|re/C-001.png`, `wh_pq/gh2/PQ01.png`, `wh_character_ability_cards/gh2/<code>/<slug>.jpeg`, `wh_stickers` (about 119, mapping unknown).
- Local images in this repo: `images/common/` (attack mods, tokens, icons, class backs, personal quests, perk icons, BGG icons), `images/gh2/` (monster art, stat cards), `images/events/` (six event artworks).
- Art pipeline for the attack modifier cards (`tools/convert-*.py`, `clean-pierce-icon.py`, `make-badge-m2.py`, `make-raised-icon.py`, `make-ward-range-icon.py`, `export-am-layers.jsx`). Photoshop: ungroup the document from its artboard first, never save the PSD. The PSD template and exports stay in `campaign_assets/`.

## Licences (open, owner decision)

| Source | Used for | Status |
|---|---|---|
| Gloomhaven Secretariat (AGPL-3.0) | unlock links, initiative numbers, event text, prosperity, reputation, masteries, PQ text, treasures, monster decks | open. Only facts are used, but the licence is unresolved |
| FrosthavenAssistant (AGPLv3) | perk data, layered art reference, unique card scans | open |
| Card DB text (WHTracker.xlsx, group's own) | static tables | open |
| worldhaven card images (any2cards/worldhaven, Cephalofair scans printed "used with permission") | Frosthaven and Jaws ability cards and battle goals on the Cards tab, hotlinked from `raw.githubusercontent.com/any2cards/worldhaven` | open: hotlinked for now, owner to decide hosting and licence |
| Frosthaven and Jaws character mats | Cards tab, from the group's asset repository (`wh_character_mats`) | same as the other asset repository pictures |
| Frosthaven and Worldhaven card images | card pictures, unique cards, class art | cleared for this non-profit app by the owner. Crediting the source is advisable |
| `any2cards/worldhaven` scans | layout reference only, not copied | Cephalofair-licensed, used to verify layout only |
| Mercenary Pack solo item pictures (owner's Worldhaven folder: Hail scans, photographs of the other cards) | `images/items/mp/` | same as the other asset repository pictures |
| Photoshop template (author unknown) | layer art | open. Outside the repo |

## Images under images/ (2026-11-16)

- Layout: `images/<type>/<edition>/<file>.webp` (types such as `character-abilities`, `character-mats`, `character_hexes`, `monster_hexes`, `overlays`; editions `gh2`, `mp`, `fh`, `jotl`, `cs`, `toa`, or `common`). Sub-folders of the source are flattened into the file name. SVG stays SVG.
- Source of the files: the repo's own images (converted), and the group's asset repository and the worldhaven clone (converted to the sizes in the table above). The conversion pipeline was a scratch script; its output and the manifest are in `tools/images-manifest.json` (source path, destination, status).
- `tools/generate-image-index.py` writes `scripts/images-index.js` from the manifest: address (repo path or former remote URL, without extension) to file under `images/`. Regenerate it after any change in `images/`.
- Code asks for images through `imageFile(address, prefix)` (`scripts/images.js`); `prefix` is `'../'` from `campaign/`. Attack-modifier layers use `amImg` and perk icons `perkIcon` (`scripts/amd/paths.js`).
- Missing and removed: the 43 repo mercenary mats (replaced by `character-mats`), 22 local personal quest copies (the asset-repo copies are kept), summons `longbowman` and `stitched atrocity` and element `wild` (no file in the original repo either).
- Not yet rewired: the mockups under `campaign/mockups/` (design snapshots, they still point at the old paths).
