# Data pipeline: generated files, generators, sources, licences

Rule: never hand-edit a file marked GENERATED. Fix the generator (or its input table) and regenerate. If a generator is missing from the repo, say so and get the owner's decision before editing the output.

## Generated files and their generators

| Output | Generator | Input (outside repo unless noted) |
|---|---|---|
| `scripts/games/gh2_classes.js`, `gh2_cards.js`, `gh2_items.js`, `gh2_scenarios.js` (incl. stickers), `gh2_events.js`, `gh2_quests.js`, `battle_goals.js` | `tools/extract-campaign-tables.py` | the Card DB and GH2 Flow sheets of `WHTracker.xlsx`. Also reads `tools/card-initiative.json` |
| `scripts/games/gh2_event_front.js`, `gh2_event_back.js` (lazy), `gh2_event_boxes.js`, `gh2_class_traits.js`; copies art to `images/events/` | `tools/extract-event-text.py` | Secretariat `data/gh2e/events.json`, class folders, `src/assets/artwork/events` |
| `scripts/games/gh2_prosperity.js` | `tools/extract-prosperity.py` | Secretariat gh2e data |
| `tools/card-extraction/` (2026-11-24, not used by the app) | `prepare.py` builds briefs, readers (Claude agents) write card code from the pictures, `check.py` validates and compares; see its README | the ability card pictures in `images/character-abilities/` (rule in `pictures.py`; `--assets` for an older Wordhaven_Assets clone), for the classes without Secretariat data: Satha, Berserker, Anaphi, Bladeswarm, Plagueherald, Infuser, Metal Mosaic. `compare.py` compares two readings by game meaning; `check.py` also checks the words, icons and hex letters |
| `tools/secretariat-cards/` (2026-11-24, not used by the app) | `tools/convert-secretariat-cards.py <clone> --edition gh2e, fh or jotl` (no dependencies) | the Secretariat decks (`data/<edition>/character/deck/*.json`) and labels: card code `.md` and action JSON for 35 decks. Infuser and Metal Mosaic are placeholders upstream (skipped), Bladeswarm and Plagueherald have no deck. The app's initiative wins where it differs; `NAME_FIX` renames two Tinkerer cards; Blinkblade's identity actions stay `raw`; the Secretariat's `loss` is `remove` |
| `card-code-current/` (2026-11-25, not used by the app) | copied from `import/`, `tools/` and `tools/secretariat-cards/`, then edited in place | the most current card code and JSON of all 43 classes, in `confirmed/`, `wip/` and `start/`; `MANIFEST.md` lists the source and status of each |
| `scripts/games/turn_templates.js` (2026-11-25, used by the Turn button of the Mercenaries tab; Hail, Cragheart, Mindthief, Tinkerer so far) | `node tools/build-turn-templates.mjs <class codes>` (default `hl`; no dependencies; the classes so far: `hl ch2 mt2 ti2`) | the action JSON in `card-code-current/<folder>/<class>-ability-cards.code.json`, matched to the card ids of `gh2_cards.js` by initiative and level. Run it again after the card code of a class changes, or to add a class. `scripts/turnTemplate.js` turns the parts into forum code at run time; lines with enhancement dots are `{ p, e }` |
| `tools/hail-ability-cards.json` (trial, not used by the app) | `tools/normalise-icons.mjs` with `tools/hail-icon-dictionary.json` | `tools/hail-ability-cards.raw.json`: a transcription of the 28 Hail (Mercenary Pack) ability card images by reading them (2026-11-24). The dictionary maps icon descriptions to types and `%tokens%`; 3 icons and 1 text icon are unresolved, teleport is a guess. The Secretariat has no data for Hail |
| `scripts/games/gh2_reputation.js` | `tools/extract-reputation.py` | Secretariat gh2e data |
| `scripts/games/masteries.js` | `tools/extract-masteries.py` | Secretariat data |
| `scripts/games/gh2_pq_text.js` | `tools/extract-pq-text.py` | Secretariat gh2e data |
| `scripts/games/perks.js` | `tools/extract-perks.mjs` (+ `perks-decode.mjs`) | FrosthavenAssistant clone at `asset-backups/amd/FrosthavenAssistant` |
| (removed 2026-11-18) `scripts/games/wh_cards.js`: every class is now in `gh2_classes.js` and `gh2_cards.js`; `tools/extract-worldhaven-cards.py` only provides `load_cards()` | `tools/extract-worldhaven-cards.py` | `data/character-ability-cards.js` of the worldhaven clone (`D:\github\worldhaven`, any2cards/worldhaven). Initiative gaps filled from the Secretariat fh and jotl decks (numbers only) |
| `scripts/games/solo_items.js` (solo items of the Frosthaven and Mercenary Pack classes, merged with `gh2_items.js` in `scripts/campaign/itemList.js`; `back` marks flip items); writes `images/items/fh|mp/<id>.webp` and `<id>b.webp` (backs) and their manifest records | `tools/prep-mp-solo-items.py` (Mercenary Pack pictures: straighten, crop, improve), then `tools/extract-solo-items.py`, then `tools/generate-image-index.py` | Secretariat `data/solo/items.json` and `data/fh/label/spoiler/en.json`; worldhaven `images/items/frosthaven/248-264`; the owner's Worldhaven folder `characters/mp/character_solo_items` (Hail scans, photographs of the other cards) |
| `images/items/gh2/<id>b.webp`: backs of the eight GH2E flip items (54, 72, 74, 80, 100, 116, 128, 162), and their manifest records. The app shows a back wherever one exists (`itemBackUrl` in `scripts/campaign/cardImages.js`) | `tools/convert-item-backs.py`, then `tools/generate-image-index.py` | `Wordhaven_Assets/wh_items/gh2/<id>b.png` (74 and 80 as `74b.png`, `80b.png`). The flip list was checked by template matching the flip icon on all fronts |
| `scripts/campaign/bggIcons.js` | `tools/extract-bgg-icons.py` | the BGG codes list in `campaign/mockups/merc-6-playmat-v2.html` |
| `campaign/mockups/*.html`, `mock.css` | `tools/merc-mockups/gen-merc-mockups.mjs` | run with `MERC_MOCKUP_OUT="<repo>/campaign/mockups/" node ...`. Later hand edits in `merc-6` exist (see `status.md`): check the diff before regenerating |
| `asset-backups/campaign-import.json`, copy in `import/` | `tools/import-campaign-state.py` | `WHTracker.xlsx`. Test data only; the owner syncs state by hand |

Generated, but no generator in the repo (do not regenerate without a plan):

- `scripts/games/gh2_treasures.js`: header says it comes from Secretariat `data/gh2e/treasures.json`. Generator not found in `tools/`.
- `scripts/games/gh_decks.js`: generated from `gh2_monster_abilities.xlsx`. Generator not found in `tools/`. Corrected by hand on the owner's order (2026-11-21): living corpse card 3 initiative 66, lurker soldier cards 6 (23, shuffle) and 7 (28); the spreadsheet still has the old values, so regenerating from it would bring the errors back. `gh.js` standee counts corrected the same way (lurker soldier 6, night demon 6, vermling scout 10).

Hand-maintained inputs and outputs:

- `scripts/games/resources.js`: from the workbook's Resources sheet, edited by hand.
- `scripts/games/portrait-focus.json`: made with `campaign/mockups/portrait-tool.html`.
- `tools/card-initiative.json` (445 entries): initiative read from card images. Input for `extract-campaign-tables.py`.
- `scripts/campaign/classTokens.js`, `classList.js`, `cardImages.js`, `bggBanners.js`: hand-written.
- `campaign/playmat.css`: hand-maintained since 2026-11-14. `tools/build-playmat-css.py` refuses to run without `--force`, and running it would break the settings panel. Do not run it.

## Treasure placement

`tools/extract-monster-data.py` (2026-11-21, exploration branch) writes `scripts/games/gh2_monsters.js` (GENERATED) from a clone of the Secretariat (`data/gh2e/monster`, `monster/deck`, `label/en.json`): Gloomhaven 2e monster stat cards and ability decks. See `monster-automation.md`.

`tools/convert-gloom-scenarios.py` (2026-11-21, exploration branch) turns the test scenarios of the gloom monster mover into `tools/tests/fixtures/gloom-scenarios.json` (needs a clone of https://github.com/AluminumAngel/gloom, MIT). See `monster-automation.md`.

`tools/make-tile-masks.py` (2026-11-21, exploration branch `explore/monster-automation`) writes `scripts/games/gh2_tile_masks.js`: the floor hexes of each Gloomhaven 2e map tile as `[q, r]` offsets from the tile anchor (angle 0), derived from the alpha channel of `images/tiles/gh2`. See `monster-automation.md`.

`gh2_scenarios.js` carries `tre`, the treasure tiles of each scenario (`load_ghs_treasures` and `TREASURE_FIX` in `extract-campaign-tables.py`; 79 treasures in 64 scenarios, each once). The Gloomhaven Secretariat's GH2E data says which treasure lies in which scenario: `data/gh2e/scenarios/*.json` (`rooms[].treasures`, the scenario map) and `data/gh2e/sections/*.json` (rooms revealed later; `parent` is the scenario). Together: 79 placements in 63 scenarios. Checked by the owner against the scenario book on 2026-11-18:
- Treasure 7 in scenario 6 (sections 38.1 and 40.1) is correct: the same treasure in two alternative rooms.
- Section 112.1 (scenario 82) holds treasure 41, not 40 (the Secretariat data is wrong; 40 is in scenario 37). `TREASURE_FIX` corrects it.
- Treasure 14 is missing from the data; it is in scenario 80 Lost Temple (owner, 2026-11-18). `TREASURE_FIX` adds it.

## Regeneration rules

- Run Python generators with `python -I` (isolated mode).
- The workbook exists in two versions: `asset-backups/WHTracker.xlsx` (default) and `import/WH Tracker.xlsx`. They differ. Pass the path explicitly and say which one you used. On 2026-11-18 the default path was missing; `../campaign_assets/WHTracker.xlsx` (2026-11-06) was used (again on 2026-11-20, the default path is still missing: `python -I tools/extract-campaign-tables.py ../campaign_assets/WHTracker.xlsx`) and gave the same scenario rows as the live sheet.
- `extract-campaign-tables.py` also appends the Jaws of the Lion classes (fixed indexes 41 to 44, `JOTL_CLASSES`) and their ability cards to `gh2_classes.js` and `gh2_cards.js`. It reads them from the worldhaven clone through `load_cards()` of `extract-worldhaven-cards.py`: levels 1, X and 2 to 9 (one level 5 card per class, as in the Secretariat data), not the tutorial levels a and b; each card carries its picture address (`img`): the updated GH2E-style card in the asset repository (`wh_character_ability_cards/jotl/jl-<code>-<card>.png`).
- `gh2_classes.js` carries `hand`, the class's hand size, from the Secretariat character files (`add_hand_sizes` in `extract-campaign-tables.py`). Three classes have more than their level 1 cards (Bladeswarm 11, Doomstalker 11, Elementalist 12); the hand can use the X cards too.
- `tools/convert-jotl-ability-cards.py` (2026-11-18): converts those cards and the four new backs (sources 400x600: the 5:7 card squeezed by about 7%, so they are resized to 429x600, the Frosthaven size; otherwise the hand clips them and marker positions are off) to `images/character-abilities/jotl/<code>-<card>.webp` and `images/card-backs/jotl/<code>-card-back.webp`, deletes the older worldhaven Jaws card scans and backs, and updates `tools/images-manifest.json`; run `tools/generate-image-index.py` afterwards. Levels and initiatives of the new cards were read off the pictures and match. `wh_cards.js` now holds the Frosthaven classes only.
- Jaws of the Lion perks, traits and masteries come from Cephalofair's updated crossover sheets (owner's copies in `P:/Guido/boardgames/Worldhaven/characters/jotl/character-perks/x-over/`), transcribed 2026-11-18: perks in `tools/jotl-xover-perks.json` (`tools/build-xover-perks.mjs` writes `scripts/games/perks_xover.js`), traits in `JOTL_TRAITS` of `extract-event-text.py`, masteries in `JOTL_MASTERIES` of `extract-masteries.py`.
- `extract-campaign-tables.py` `EXTRA_CLASSES`: the Jaws (41 to 44) and Frosthaven (51 to 67) classes, codes as the worldhaven folders. Hand sizes from the Secretariat (`add_hand_sizes`; Geminate's '7|7' is summed to 14).
- `tools/make-fh-character-tokens.py`: stand-in character tokens for the Frosthaven classes, built on the ring of the owner's token template (`P:/Guido/boardgames/Worldhaven/templates/Character Token/ring.png`, not in the repo): class colour from the Secretariat as the face, the ring and its gloss over it, the class icon of the modifier cards in black on top, recorded in the manifest with `generated`; also cuts the scanned H.I.V.E. mode and Geminate form tokens to their disc (once, marked `cut`).
- `tools/check-perk-icons.mjs` still looks for the icon files at the paths from before the 2026-11-16 image move and reports all of them missing; its token check is valid.
- `tools/convert-jotl-unique-amd.py`: the Jaws unique attack modifier card (Demolitionist `de1`, card 140) from the worldhaven scan to `images/attack-modifiers/common/unique/de1.webp` (600x391), recorded in `tools/images-manifest.json`. The other Jaws modifier cards are drawn from layers.
- Running `extract-campaign-tables.py` rewrites several generated files, some with unrelated changes (cards, scenarios, events, quests). Before running, commit or stash the intended changes. After running, restore everything except the intended file. Check `git diff` first: a restore discards hand patches in those files (see the card and battle goal fixes below).
- Corrections go into the generator's fix tables, not the output: `CLASS_NAME_FIX` (Plagueherald), `ITEM_SLOT_FIX` (items 169 and 170), `SCENARIO_AREA_FIX` (storylines from the owner's flow image, two-storyline scenarios as "Guards/Hail"; 14 scenarios), `FORCED_FIX` (forced links 23 to 25 and 25 to 27, which the Secretariat keys by section), `BOSS_SCENARIOS` (the 15 skulls of the flow image), `CARD_FIX` (seven level 9 cards filed under the next class), and the initiative JSON.
- `extract-event-text.py` (2026-11-18): class names for `gh2_class_traits.js` come from the Secretariat's name labels (`label/spoiler/en.json`); the hand-made icon table had 7 classes wrong before (the Berserker came out as an Orchid, the Doomstalker as a Harrower, and so on). The script still copies 6 event pictures into the old `images/events/` folder; delete them after a run (the app uses `images/events/gh2/`, roadmap 46).
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
