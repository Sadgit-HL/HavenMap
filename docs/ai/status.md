# Status

Verified 2026-11-16 against `main` at `c8e4b42` (synced with origin). "Verified" means the file or function exists and was read or grepped. Behaviour in a browser is only claimed where the log says so.

## Map app (standalone HavenMap)

Done:
- Map editing, state in the URL hash (`#lz:`), `mapVersion` 5.0.0 with migrations in `scripts/state.js`.
- Monster and ally attack modifier decks, with Bless and Curse, draw, return, shuffle and GeekRoller code (`scripts/attackMods.js`, `scripts/decks.js`).
- Per-hero attack modifier decks from class perks (43 classes, 711 perk entries in `scripts/games/perks.js`). Tabs per hero, perk list with repeated and multi-box perks. Verified.
- Layered card rendering (`scripts/amd/`), perks viewer (`perks/`).
- Hero deck state stored as `mercenaries[i].am`; copies drop `am` and `cmp` (`withoutAm`).

Known limits:
- GeekRoller rolls are capped at 255 characters. As measured on 2026-11-08, Trapper, Crashing Tide, Soothsinger, Snowdancer, Sawbones, Satha and Shattersong were over the limit with all perks active. No fallback exists. Re-measure before acting.

## Campaign page (`campaign/`)

Tabs (`PAGE_TABS` in `campaign/app.js`): Overview, Scenarios, Mercenaries, Items, Events, Cards, Resources, History.

- Overview: party, prosperity (checks, Great Oak sanctuary, imbuement), reputation, scenario counts, stickers, unlocked classes, players, retired characters. Popups from pencils.
- Scenarios: table and flowchart (`scripts/campaign/flow.js`, `flowPage`), state, result, unlock links both ways.
- Mercenaries: the playmat (`campaign/playmat.js`), up to four characters, see `playmat.md`. Includes hand, play slots, active area, piles, modifier deck view, journal, perks and masteries, enhancements, BGG codes, history, markers, edit character, phone view below 700 px (`campaign/phone.js`).
- Items: table and cards, unlock and shop copies, give and return to characters, equip with slot limits.
- Events: city and road decks, piles (top, deck, bottom, out, locked), per-seat voting, outcome checks against traits and reputation, redirects, placement rules (`scripts/campaign/events.js`, `outcomes.js`, `campaign/eventsView.js`).
- Cards: browser for ability cards, attack modifiers, battle goals, mats, events (fronts), items, monster abilities and stat cards, personal quests.
- Resources: links from the workbook (`scripts/games/resources.js`).
- History: entries from `record.log`, folded small counter changes, undo entries.
- Storage: browser localStorage only (`scripts/campaign/store.js`, one implementation). JSON Export and Import by hand. Undo 50 steps, Ctrl+Z.
- Settings modal (cogwheel): four tabs, Profile, Campaign file, Mercenary tab and Shortcuts (`docs/ai/playmat.md`). Object keys on the pointer (D, L, A on cards and items, D on modifier cards) tested in the browser by the owner on 2026-11-16.
- Imported test data: `import/campaign-import.json` (made by `tools/import-campaign-state.py`). The owner decided not to import the live campaign automatically; state is synced by hand.

Recent work (last commits, 2026-11-13 and 2026-11-14): tile modals for stickers and classes, Cards sticker toggle, playmat card unit `--cu`, top bar on one line below 1400 px, context menu for the playmat, perks and enhancements and codes popups, overview rework.

## Mercenaries playmat and phone

- Built: everything listed under Mercenaries above. Stages a to f of the redesign are done (`docs/archive/merc-tab-handover.md` section 6 has the history).
- Not browser-tested: the 2026-11-14 layout changes (`ui-guidelines.md` section 8). Long press, touch drag and the phone view were not tested on a real device.
- Phone: no Modifiers view (the old AMD modal is still used), no class change, no Edit character.

## Not built

- Campaign server, token auth (roles admin, player, read-only), storage behind the `store.js` interface.
- Session start from the campaign page and session commit back into the record. Design in `design/server-and-commit.md`.
- BBCode composer in the map app. The playmat already builds Turn and Cards posts (`turnPost`, `cardsPost` in `campaign/playmat.js`) and an icon and banner code list. Where the composer should live is open (see `roadmap.md`).
- Automated tests. Nothing is committed under `tools/` or elsewhere for the campaign code.

## Data and generated files

- Generated tables are current for GH2, Mercenary Pack, Frosthaven and Jaws of the Lion. Full list and regeneration rules: `data-pipeline.md`.
- Initiative: all 649 GH2 ability cards have a value, read from card images into `tools/card-initiative.json` (445 entries) on 2026-11-13. Potent Potables corrected to 46 on 2026-11-16 (`tools/card-initiative.json` override, regenerated, uncommitted). Disorienting Flash (73) is correct. Initiative confirmed against the Secretariat for 208 cards in 7 classes; the other cards were read from images only (see the 2026-11-16 check).
- Card art and item art are loaded from `Sadgit-HL/Wordhaven_Assets` by URL (`scripts/campaign/cardImages.js`). Eight ability cards have no picture in that repo.
- Licence for the Secretariat data (AGPL-3.0), the FrosthavenAssistant data (AGPLv3) and the card text is unresolved (`roadmap.md`).

## Corrections to older docs

- The handover log says the Mercenaries tab redesign is "in progress". It is built as the playmat, with its open items listed in `playmat.md`.
- The campaign element inventory (`reference/campaign-elements.md`) has statuses from 2026-11-08. Many are out of date; its gap list is folded into `roadmap.md`.
- The face catalog (`reference/hero-modifier-faces.md`) says the hero face model is "not implemented" in the campaign tracker. The map app implements the deck from perks; the face catalog is still a reference only.
- Old notes say `campaign/playmat.css` is generated by `tools/build-playmat-css.py`. Since 2026-11-14 it is hand-maintained: the tool refuses to run without `--force`, and running it would break the settings panel.
- `campaign/mockups/merc-6-playmat-v2.html` came from `tools/merc-mockups/gen-merc-mockups.mjs`, but later changes (embed mode, icons) were made by hand. Check before regenerating: a regeneration would drop them.

## Repo state to be aware of

- Working tree: `docs/` was reorganised on 2026-11-16 (see `README.md`). Nothing is committed yet.
- Before that, the working tree had an uncommitted edit to the old `docs/HANDOVER.md` that broke the numbering of section 7 ("2. 3. ..."). It is now in `docs/archive/HANDOVER-log.md`.
- Several docs were CRLF in the working copy and LF in git (`.gitattributes` has `* text=auto`). Git prints warnings; no content change.
