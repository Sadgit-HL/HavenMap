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

Tabs (`PAGE_TABS` in `campaign/app.js`, in this order): Overview, Mercenaries, Items, Events, Scenarios, Resources, Cards, History.

- Overview: party, prosperity (checks, Great Oak sanctuary, imbuement), reputation, scenario counts, stickers, unlocked classes, players, retired characters. Popups from pencils.
- Scenarios: table and flowchart (`scripts/campaign/flow.js`, `flowPage`), state, result, unlock links both ways. Flowchart (2026-11-18): pan with right-drag, left-drag on the background or Space plus drag; Ctrl+wheel steps the sizes S to XXL around the pointer; the scroll position survives re-renders; a search field (number or name, with suggestions) centers and marks a scenario, locked boxes are not found. Tested in Playwright (Edge, 1440x900). Added 2026-11-18: lane labels stay at the left edge while panning; the chart opens on the saved position (`view.flowPos`), else on the scenario unlocked by the last completed one; an overview map in the lower right corner (click or drag moves the view); lane order chosen for the shortest arrows (`LANES` in `flow.js`). Storylines checked against the Secretariat and the owner's GH2 Flow sheet; 13 Icecrag Ascent moved to Voice and Drake, the Other lane is empty.
- Mercenaries: the playmat (`campaign/playmat.js`), up to four characters, see `playmat.md`. Includes hand, play slots, active area, piles, modifier deck view, journal, perks and masteries, enhancements, BGG codes, history, markers, edit character, phone view below 700 px (`campaign/phone.js`).
- Monsters (2026-11-17, `campaign/monstersView.js`, `monsters.css`, `scripts/campaign/monsters.js`): the look of the playmat. Bar with monster level (default: the party's scenario level), round, New scenario, End of round. The monster and the ally modifier deck in the playmat's Modifiers view (draw, Top, Bottom, Active, discard, bless and curse, edit, monster imbuement 0 to 2). Up to 8 monster types picked from a list (GH2, bosses included), each with its stat card at the level, the drawn ability card and the eight cards of its deck (types sharing a deck share it); GeekRoller code and shuffle per deck. State in the record (`mon`), shared and synced. Phone layout. Tested in Playwright at 1440x900, 390x844 and 844x390; not with players yet.
- Items: table and cards, unlock and shop copies, give and return to characters, equip with slot limits.
- Events: city and road decks, piles (top, deck, bottom, out, locked), per-seat voting, outcome checks against traits and reputation, redirects, placement rules (`scripts/campaign/events.js`, `outcomes.js`, `campaign/eventsView.js`).
- Cards: browser for character abilities, attack modifiers, battle goals (pictures from worldhaven since 2026-11-16), mats, events (fronts), items, monster abilities and stat cards, personal quests. Ability cards include the Frosthaven and Jaws of the Lion classes since 2026-11-16 (689 cards, pictures hotlinked from any2cards/worldhaven, initiative from worldhaven with gaps filled from the Secretariat). Character mats for the same classes (front and back, from the asset repository) since 2026-11-16. Attack modifiers are still GH2 only, and the playmat and campaign records do not use the new cards.
- Resources: links from the workbook (`scripts/games/resources.js`).
- History: entries from `record.log`, folded small counter changes, undo entries.
- Storage: browser localStorage (`scripts/campaign/store.js`), or the shared campaign on the server since 2026-11-17 (`scripts/campaign/sync.js`, `server/README.md`): invite links per player, saving 3 seconds after the last edit, a version check every minute, a three-way merge of simultaneous edits, the save state in the header (Saved, Saving, Offline). Settings, Campaign tab: Leave, upload to the server and invite links (admin key, kept in memory only). JSON Export and Import by hand. Undo 50 steps, Ctrl+Z, own edits only. Tested with two browsers against the Worker code and an in-memory store (Playwright); not yet with the live server and real players.
- Settings modal (cogwheel, 880 px wide): shortcuts list in two columns; four tabs, Display, Campaign, Profile and Shortcuts (`docs/ai/playmat.md`). Object keys on the pointer (D, L, A on cards and items, D on modifier cards) tested in the browser by the owner on 2026-11-16.
- Imported test data: `import/campaign-import.json` (made by `tools/import-campaign-state.py`). The owner decided not to import the live campaign automatically; state is synced by hand.

Work on branch `merc-tab-rework` (2026-11-17, not merged): the Modifiers view layout for short screens (sizes in container units, the view covers the Active/Play row below 820 px window height); the fan zoom without flicker; one card preview for every tab (`campaign/preview.js`), click zoom and zoom zones removed. See `playmat.md` and `decisions.md`.

Recent work (2026-11-16, committed and pushed in `0c8c81f` and `c67d314`, plus the follow-ups below): Frosthaven and Jaws character abilities, mats and battle goal pictures on the Cards tab; journal battle goals with pictures; tab order; settings modal split into tabs, two-column shortcut list; item roll button in the merc tab's roll button style; portrait crops looked up by class slug; marker tokens and stickers resolved through the new image functions (a removed constant had broken markers, fixed); the image rewrite described below. Follow-ups: Items grid tiles and the Cards tab's attack-modifier cards got Ctrl+hover previews; preview sizes follow the playmat zoom setting; trails behind the previews removed (transform positioning); unique attack-modifier cards get the class badge; settings tabs reordered (Mercenary tab, Campaign file, Profile, Shortcuts).

Earlier work (last commits, 2026-11-13 and 2026-11-14): tile modals for stickers and classes, Cards sticker toggle, playmat card unit `--cu`, top bar on one line below 1400 px, context menu for the playmat, perks and enhancements and codes popups, overview rework.

## Mercenaries playmat and phone

- Built: everything listed under Mercenaries above. Stages a to f of the redesign are done (`docs/archive/merc-tab-handover.md` section 6 has the history).
- Not browser-tested: the 2026-11-14 layout changes (`ui-guidelines.md` section 8). Long press, touch drag and the phone view were not tested on a real device.
- Touch layout (2026-11-17): phones upright and sideways, `campaign/touch.css` and the phone view; see `playmat.md` and `ui-guidelines.md` 6.4. Checked with Playwright touch emulation at 390x844 and 844x390, tablet playmat at 768x1024. Not checked on a real device.
- Modifier deck odds strip (2026-11-18, `cd916db`): `drawOdds` in `amdDeck.js`, strip left of Top and Bottom; see `playmat.md`. Math checked in Node (standard deck, rolling chain, unique values); layout not checked in a browser.

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

- Images (2026-11-16): `images/` is now the converted set; the app loads images through `scripts/images.js` from `scripts/images-index.js`. The old remote image hosts are not loaded anymore, except the BGG banner codes. Browser check pending (roadmap 44).
- Working tree: `docs/` was reorganised on 2026-11-16 (see `README.md`). Nothing is committed yet.
- Before that, the working tree had an uncommitted edit to the old `docs/HANDOVER.md` that broke the numbering of section 7 ("2. 3. ..."). It is now in `docs/archive/HANDOVER-log.md`.
- Several docs were CRLF in the working copy and LF in git (`.gitattributes` has `* text=auto`). Git prints warnings; no content change.
