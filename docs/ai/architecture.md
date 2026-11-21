# Architecture

## Repo layout

| Path | What |
|---|---|
| `index.html`, `scripts/`, `styles/main.css` | the map app (standalone HavenMap) |
| `scripts/state.js` | map state, `mapVersion` 5.0.0, migration chain, URL hash codec |
| `scripts/attackMods.js`, `scripts/decks.js` | attack modifier decks and the deck panel |
| `scripts/hexGrid.js`, `tileMask.js`, `hexState.js`, `los.js`, `monsterMove.js`, `monsterCard.js`, `monsterPost.js`, `monsterTurn.js` | the monster turn of the map page (branch `explore/monster-automation`, not merged; see `monster-automation.md`). Pure logic except `monsterTurn.js`, which holds the panel and the board marks (`layer-solver` in `index.html`) |
| `scripts/amd/` | app-agnostic card rendering and hero deck model (see `hero-decks.md`) |
| `scripts/campaign/` | campaign logic, no DOM: `record.js`, `edit.js`, `events.js`, `outcomes.js`, `flow.js`, `amdDeck.js`, `amdCompare.js` (advantage and disadvantage card comparison), `rest.js` (short rest), `draws.js` (random side scenario and item design pools), `itemList.js`, `changelog.js`, `store.js`, `classMap.js`, `classList.js`, `classTokens.js`, `traits.js`, `cardImages.js`, `bggIcons.js`, `bggBanners.js`, `monsters.js` (Monsters tab), `sync.js` (shared campaign) |
| `scripts/games/` | static tables. `gh2_*.js`, `battle_goals.js`, `masteries.js`, `perks.js` etc. are GENERATED (see `data-pipeline.md`) |
| `campaign/` | the campaign page: `index.html`, `app.js` (the page), `playmat.js` and `playmat.css` (Mercenaries tab), `phone.js` and `phone.css` (phone view), `touch.css` (touch layout of all pages), `preview.js` (card preview), `monstersView.js` and `monsters.css` (Monsters tab), `eventsView.js`, `ctxmenu.js`, `morph.js`, `dialog.js` (`ask`, `notify`, `showDraw`: the draw dialog, cards revealed one at a time), `mockups/` (static design files) |
| `perks/` | standalone perks viewer and the compose dev page |
| `images/` | art. `images/common/` is shared; `images/gh2/` monster art; `images/events/` event artwork |
| `tools/` | generators and art pipeline (Python, Node, one ExtendScript). `tools/merc-mockups/` generates mockups |
| `import/` | `campaign-import.json` (test record) and the owner's workbook copy |
| `docs/ai/` | these notes. `docs/archive/` superseded docs. Five one-line stubs remain at the old `docs/*.md` paths because code comments cite them |

## Map app

- State is one JSON object, LZ-compressed into the URL hash (`#lz:`, `scripts/lzString.js`). The URL is a snapshot per turn.
- Migrations are in `scripts/state.js` (`migrateV1Titles`, `migrateToV3`, `migrateToV4`, `migrateToV5`, run by `migrate`). New fields are added as additive migrations. A standalone map has `campaign: null`.
- Heroes are `mercenaries[i]`. Campaign link: `cmp: { c: '<char id>' }`. Personal modifier deck: `am` (only differences from the standard deck).

## Campaign page

Single page, single module: `campaign/app.js` (about 2600 lines). `PAGE_TABS` lists the tabs; `render()` dispatches to one function per tab. Module-level state holds `record`, `tab`, `sub` (character sub-tab), `view` (filters, saved to localStorage), `pm` (playmat session state, not saved), `pmset` (display settings, saved).

Data flow:

1. Loading: without a server connection, `store.js` loads the record from localStorage key `havenmap.campaign.v1`. With one (an invite link was opened, `havenmap.campaign.server`), the page loads it from the API (`scripts/campaign/sync.js`, `server/README.md`) and keeps a copy with the unsaved edits in `havenmap.campaign.server.cache`.
2. Every change is a pure function in `scripts/campaign/edit.js`: record in, new record out, `ver` bumped, input clamped.
3. The page calls `commit(next)` (`campaign/app.js` line 127). It stamps the log via `changelog.js` (`describeChange`), saves, and re-renders.
4. Saving: local mode writes to localStorage at once. Shared mode sends the record 3 seconds after the last edit (`PUT` with the server version), checks `/ver` every 60 seconds while the page is visible, and merges the edits of two players (`merge3` in `sync.js`: objects by key, characters by id, the logs combined, the edit counter `ver` as the larger value; a value both changed keeps the other player's value and the page says so).
5. Undo reverts the user's own last edit (50 steps, Ctrl+Z) and logs "Undo: ...". History entries are `{ before, after }`; changes of other players that arrived since are kept (`merge3(after, before, current)`).
6. Pure logic (`events.js`, `outcomes.js`, `amdDeck.js`, `amdCompare.js`, `rest.js`, `draws.js`, `flow.js`, `record.js` derived values) takes the record and returns values. Keep new logic in this form so it can be tested in Node.

Rules for new code:
- Route every change through `edit.js` and `commit`, so Undo and History work.
- Add a case in `changelog.js` (`describeChange`, `HANDLED`) for each new record field.
- Do not persist state anywhere except the record. Per-browser conveniences (views, settings, codes) use localStorage keys prefixed `havenmap.campaign.`.
- Spoilers: locked items and scenarios are shown as numbers only.

Mercenaries tab (the playmat):
- `campaign/playmat.js` builds the markup (`playmatHtml`, `dockHtml`, `modalHtml`, `amViewHtml`) from the record and `pm`. Click and drag are wired in `app.js` to `edit.js` functions.
- `campaign/morph.js` updates the existing DOM in place so flips and drops do not flicker. Elements marked `data-keep` are left alone.
- `campaign/ctxmenu.js`: one shared context menu. Element types register by CSS selector with `HM_CTX.register`-style calls (`registerMenu` in `app.js`).
- `campaign/playmat.css` is hand-maintained since 2026-11-14 (see `status.md`).

Phone view: `campaign/phone.js` with `phone.css`, used when the window is 700 px wide or less, or 500 px high or less (`matchMedia` in `app.js`, which also sets `html.phone` for `campaign/touch.css`, the touch layout of the other pages). Same record, same edit functions.

Cache busting: `campaign/index.html` loads `app.js?v=N` and `style.css?v=N`. Module imports under `scripts/` carry no version, so a hard refresh is needed after changes there.

## Map app and campaign share code

- `scripts/amd/` is used by the map's deck panel, the perks viewer and the campaign playmat (deck cards, perk cards). It has no state dependencies, so it imports cleanly into a static page.
- `scripts/games/perks.js` feeds both the map's hero decks and the campaign's modifier deck (`amdDeck.js`).
- Attack modifier state in the map (`scripts/attackMods.js`) is keyed by slot (`'m'`, `'a'`, `'h<i>'`). The campaign's deck logic is separate (`amdDeck.js`) and does not reuse that module, because `attackMods.js` pulls in map state.

## Known structural debts

- `campaign/app.js` is large. Splitting it by tab is possible but not started. Keep changes local.
- The playmat CSS is hand-maintained and partly duplicated from the mockup. Do not regenerate it.
- Two code paths for the attack modifier deck (map and campaign). Merging them needs a shared model without map state.
- `perks/compose.html` and the compare page are dev tools. They are not part of the user-facing app.
