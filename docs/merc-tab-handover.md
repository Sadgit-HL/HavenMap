# Mercenary tab redesign: handover

Written 2026-11-10, cleaned up the same day. Purpose: let a fresh session continue the design of the Mercenaries tab of the campaign
page (`campaign/`) without asking the user to repeat anything. Read this first, then `merc_tab.md`, then the mockups. The project log is
`docs/HANDOVER.md` (section 18 describes the rest of the campaign page).

## 1. Where things are

| What | Path |
|---|---|
| Requirements written by the user | `C:\Users\hansen\ai\games\HavenMap\merc_tab.md` (outside the git repo, parent folder) |
| Mockups (static HTML) | `HavenMap\campaign\mockups\` (`index.html`, `merc-1` .. `merc-6-playmat-v2.html`, `mock.css`, `img/cards/*.jpg`) |
| Generator for all mockups | `HavenMap\tools\merc-mockups\gen-merc-mockups.mjs` (run with `node`; writes the HTML and `mock.css`) |
| Screenshot and check scripts | `tools\merc-mockups\shots.mjs` (all pages), `shot-v2.mjs` (page 6 with interaction checks), `hover-check.mjs` |
| The live Mercenaries tab | `campaign/app.js`: `mercenaries()`, `characterTab()`, `characterCard()`, `deckZones()`, `cardRow()`, `benchList()` |
| Edit functions | `scripts/campaign/edit.js` (`moveCard`, `setCardActive`, `setCharacter`, `setCharacterPlayer`, `addCharacter`, `renameCharacter`, `setSpecialTrait`) |
| Record shape | `scripts/campaign/record.js` header comment, `docs/campaign-schema.md` |
| Project log | `docs/HANDOVER.md` |

Git: all of this is committed and pushed to `main` (mockups in `9703c39`, including the 22 card thumbnails, about 650 KB of copies of the
group's card scans).

The generator hard-codes absolute paths (`C:/Users/hansen/ai/games/HavenMap/HavenMap/...`) and imports `scripts/games/gh2_cards.js` for
initiative values. Thumbnails were made with:
`curl` the card from `https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/wh_character_ability_cards/gh2/TI2/<slug>.jpeg`
then `magick in.jpeg -resize 300x -strip -quality 82 img/cards/<slug>.jpg` (originals are 750x1050).

## 2. The user and how to work with them

- PD Dr. Guido Hansen (guido.hansen@uni-luebeck.de), biochemist, plays a Gloomhaven 2e play-by-forum campaign with 3 other players.
- Rules: `~/.claude/CLAUDE.md` and `docs/HANDOVER.md` section 9 (terse, no emoji, no em dash, confirm destructive actions, never hand-edit
  generated files, no co-author line in commits unless the owner says otherwise; section 9 lists that open conflict).
- Working style seen in this session: implement in small steps, show a screenshot or test result, accept quick renames and layout tweaks
  without discussion, no help text in modals or pages ("remove help text" came up three times), uses `+`/pencil buttons that open modals.
  The user often gives short imperatives ("commit and push"). Commit only when asked.
- The user is open to discussing modifications of the ideas in `merc_tab.md`.

## 3. Requirements (`merc_tab.md`, verbatim content, grouped)

Goals: the Mercenaries tab is the most important tab (used constantly during a scenario); very clean interface that conveys the haptic and
visual feel of a card game; polished GUI.

1. Card interface: drag and drop cards to discard and Lost piles; display area for cards in hand; display area for active cards; cards show
   the enhancements applied to them.
2. Modal: attack modifier deck (duplicates the function currently in HavenMap, the map app's hero deck code in `scripts/amd/`).
3. Item area.
4. Modal: perk selection area, masteries.
5. Modal: draw and display personal quest, notes area.
6. Modal: draw and display battle goal.
7. Top area stats: class, character name, player name, level, XP (with level thresholds), gold, inherited perks (see open question), traits.
8. Modal: character mat, front and back.
9. Class portrait image.
10. Modal?: easy copy of about 50 BGG forum post codes (the GeekRoller codes of `docs/unique-geekroller-codes.md`; the app already has
    roller-code buttons in `campaign/app.js`: `scenarioRollerCode`, `itemRollerCode`, `copyRollerCode`).
11. Modal: notes area.
12. A way to name and track custom class-specific counters (resolution, time tokens, ...).
13. Modal: enhancement table, editable, to add new enhancements.

## 4. Mockups

All use the app's colours (`--bg #16130f`, `--panel #231d17`, `--line #3a3026`, `--text #ecdfc8`, `--muted #a89a82`, `--accent #c7a44a`)
and real data: Simon, Tinkerer, level 5, played by Guido (from the imported campaign, `import/campaign-import.json`).
Each page has a top nav, a legend ("small corner mark = opens a modal"), and a notes box with pros and cons. Modal buttons only show their
position (class `mbtn` with a corner mark `mmark`); modal contents are not designed yet.

Five concepts were shown first:
1. **Playmat**: card table, fanned hand at the bottom, piles as drop targets, vertical modal dock on the right.
2. **Sheet**: three-column sheet, modal buttons grouped (Deck, Story, Reference).
3. **Hand tray**: full screen, hand in a tray along the bottom, four modal buttons plus a "More" button.
4. **Mat board**: the real character mat image as the board with drop slots drawn on the printed zones.
5. **Phone first**: three phone screens (Cards, Items, Info) plus a bottom-sheet modal menu.

**The user picked 1 (Playmat)** ("the game mat mockup", then "create another mockup of the playmat variant"; this was read as page 1,
named Playmat, not page 4 Mat board; the user did not object) and asked for changes, implemented as **`merc-6-playmat-v2.html`**.

### 4.1 Decisions for the playmat (confirmed by the user)

- The old active area is split into a **play area** and an **active area**. The play area holds the **2 cards played each round**.
- Cards placed in the play area lie **back up**; a **click flips** the card to its front.
- **The first (left) play slot sets initiative.** The active area is not face down.
- Discard and Lost piles are **smaller**.
- The hand must hold **up to 14 cards**.
- The hand can be **sorted by initiative with a button** and also **sorted manually** (drag to reorder).
- Spread the hand cards so their details can be seen, using the full available space.
- Hover zoom of a hand card must **layer above the play and active areas**.
- The play area is sized for **exactly 2 cards**.
- Play area and active area are **flipped in position**: the play area is on the right, next to the Discard and Lost piles, because played
  cards are dragged to the discard pile most often.
- "Resize images if needed": done with local 300 px thumbnails for the 22 cards of page 6.

### 4.2 Current spec of `merc-6-playmat-v2.html` (1440x900 reference, desktop)

Page grid (`.stage6`, height `100vh - 34px`, min 700): columns `150px | 1fr | 112px | 64px`, rows `auto | 1fr`.
- **HUD (row 1, full width)**: round portrait (cropped from the mat art), name, class and player, trait chips (special trait "Friend of Hero"
  in blue), level badge, XP bar with the current-level range (210 to 275, 264 XP), gold, inherited, class token counters at the right (the "+ counter" button was removed on request).
- **Items shelf (column 1)**: all 8 items as small tiles in 2 columns with state pips, hover enlarges 2.2x.
- **Board (column 2)**: `container-type: size`, rows 40% / rest.
  - Top row (`.toprow`): columns `1fr | calc(var(--ch) * 10/7 + 46px)` with `--ch: calc(40cqh - 36px)` = card height, so the play zone is
    exactly 2 cards wide whatever the window height. Left: **Active** zone (2 cards shown, "room for more"). Right: **Play area** zone
    with slots numbered 1 and 2. Slot 1 carries an "ini ?" badge that shows the card's initiative (34) once flipped (CSS `:has(.is-front)`).
    Flip uses a CSS 3D flip (`.flipcard`, `.is-front`); the card back is a CSS placeholder (gear and class name, there is no back image in
    the assets).
  - Hand (`.hand6`, z-index 10, overflow visible): header bar with "Hand 14 of 14", `Spread | Fan` switch, "Sort by initiative" button and a
    status text ("Sorted by initiative" / "Manual order"). Spread layout = grid of 7 columns, 2 rows, cards fully visible (about 140 px wide);
    Fan layout = overlapping fan. Each card has an initiative badge top-left and an enhancement badge (Net Shooter "+1", top half). Hover:
    `transform: scale(1.85)` with `transform-origin: 50% 100%` so the card grows upward over the play and active areas. Drag onto another
    card to reorder (HTML5 drag and drop, inserts before the target).
- **Piles (column 3)**: Discard (drop target, highlighted, top card shown with a stacked-shadow effect) and Lost (greyed), counts in the headers.
- **Dock (column 4)**: 6 modal buttons (see 4.3): Attack modifiers, Perks and masteries, Journal, Character mat, BGG codes, Enhancements.

Verified in a headless browser: sort, drag reorder, flip, layer order (zoomed card is the top element over the play area), no console errors.

Data in the mockup that is a placeholder: counters (Time tokens 2, Resolve 1), perk count, the Net Shooter enhancement badge, XP level
thresholds (210 and 275: **from memory of the rulebook, unverified**, the app has no XP table yet), the portrait (a crop of the mat art:
`background-size: 330% auto; background-position: 10% 44%`; no real portrait asset exists).

### 4.3 Open questions (answered 2026-11-10)

- **"Inherited perks" vs inherited gold (`c.inh`)**: the user meant **inherited perks** literally -- a genuinely different thing from gold,
  not yet in the record. Stays a single number (no new field, no carryover UI). The mockups now label the HUD counter and History entries "Inherited perks" (the field is still `inh`). Decided 2026-11-12: it is only a number, no per-perk carryover UI.
- **Journal modal**: **yes**, merge quest, battle goal and notes into one "Journal" modal with tabs. Dock is now 6 buttons (done in the
  generator and all six mockups: `['amd', 'perks', 'journal', 'mat', 'codes', 'enh']` in `MODALS`, `tools/merc-mockups/gen-merc-mockups.mjs`).
- **BGG codes**: **full modal** (not a copy popover), same pattern as the rest of the dock.
- **End of round**: drag each play-area card to discard **individually** for now (no new "End round" control; reuses the existing
  drag-to-discard interaction).
- **Play slots (answered 2026-11-12)**: the two slots are identical apart from slot 1 setting initiative.
- **Rest and lose-a-card (answered 2026-11-12)**: done manually by the user for now (drag cards between hand, discard and lost); no dedicated flow or button.
- **Devices (answered 2026-11-12)**: the playmat (`merc-6-playmat-v2.html`) targets desktop and tablet. Phones get a separate GUI, templated on `merc-5-phone.html` ("Phone first"), with all the playmat functions and modifications carried over (face-down play area with flip, slot 1 sets initiative, discard and lost piles, sort by initiative and manual order, class card backs, class tokens in the header, AMD, perks, journal, mat and codes modals). `merc-5-phone.html` is left as the older static concept; the new interactive version is `campaign/mockups/merc-7-phone-v2.html` (started 2026-11-12, hand written, not generated): Cards / Items / Info tabs and a menu sheet, play area with flip and slot 1 initiative, active strip, hand with Ini/Lvl sort (no manual order yet), discard and lost piles, class backs and header tokens, and every card move is tap card, then pick a zone (no drag). Hand order: Ini/Lvl sort buttons reorder the hand, and the card sheet of a hand card has move left/right and to start/end. Modals and the Items tab are the real playmat v2 views embedded in an iframe (`merc-6-playmat-v2.html?embed=<id>`; ids amd, perks, journal, mat, codes, enh, deck, char, or `items` for the item shelf; the embed mode is a small block at the end of the playmat file, closing posts `hm-close` to the parent). Both pages share the character record in `localStorage` key `hm-character` (class, XP, gold, traits, tokens), so a change in one shows in the other; item markers, card pool and equipped items also share their own keys. The play/hand/pile zones of the phone are in memory only. The Info tab has a class selector for testing. Under 520 px wide it fills the screen, above that it is shown in a phone frame.
- Still open: touch drag and drop on tablets (HTML5 drag events do not fire on touch, so moving cards between hand, play area, discard and lost needs a touch alternative).

Generator note: `OUT` now reads `process.env.MERC_MOCKUP_OUT` (falls back to the `hansen` path) and the `gh2_cards.js` import is a relative
path instead of a hardcoded absolute one, so the script runs unmodified on either machine
(`MERC_MOCKUP_OUT="<repo>/campaign/mockups/" node tools/merc-mockups/gen-merc-mockups.mjs`).

### 4.4 AMD and Perks modals: wired to real data (2026-11-11)

Both modals' content used to be hand-faked arrays (`AMD_FACES`/`amdTile`, `PERKS6`/`perkRow`) in the generator. They now render from the
real HavenMap data/card model, client-side, in a `<script type="module">` block appended after page 6's main inline script:

- Imports `heroCatalog`, `heroPerkClass`, `groupPerks`, `perkBoxes`, `perkLabel`, `perkDelta` from `scripts/amd/heroDeck.js` and `buildCard`
  from `scripts/amd/card.js` (both pure, no map-tool state coupling, so they import unmodified into a static page).
- AMD modal (`#amdreal`): builds Tinkerer's deck with `heroCatalog(className, AM_STANDARD)` (`AM_STANDARD` is a local 7-entry copy of the
  standard deck -- `scripts/attackMods.js`'s `AM_TYPES` isn't imported directly because that module pulls in `state.js`/`data.js`, the map
  tool's own URL-state machinery). Renders one real composited card (`buildCard`) per face with a count badge, and computes a live
  GeekRoller code from the current composition.
- Perks modal (`#perksreal`): renders one row per perk group with real card art for adds/removes and checkbox(es), using a condensed,
  **local** re-implementation of `scripts/attackMods.js`'s `classPerkLayout`/`perkGroup`/`applyPerk`/`amToggleBox` against a plain
  `{perks: [], boxes: {}}` object (the real versions are keyed by the map tool's deck-slot id `g` and can't be called with just a class
  name). Logic mirrors the original closely enough to port back directly once a character record field exists for perk/box state.
- `scripts/amd/amd.css` (the `.pc`/`.pc-frame`/`.pc-full`/`.pc-unique` card-layer CSS) is pulled in via `@import url(...)` at the top of
  page 6's `<style>` block, not a `<link>` in the shared `page()` header (that function is shared by all six mockup pages).
- **Gotcha**: this only works when the page is served over HTTP, not opened as a `file://` URL -- browsers refuse to load ES modules from
  disk (no MIME type / CORS), which silently aborts the whole script and leaves both modals showing their "Loading..." placeholder forever.
  Always view page 6 through the project's usual static server (section 8), never by double-clicking the HTML file.
- Verified so far: the real logic (`heroCatalog`/`heroPerkClass`/`buildCard`) runs clean against Tinkerer's full catalog and perk list in a
  headless Node + stub-DOM check (every catalog entry and every perk's add/remove cards build without throwing). Not yet verified in an
  actual browser (no browser testing was done this session, per instruction) -- if the loading placeholders persist after serving the page
  over HTTP, check the devtools console for the real error first.

## 5. How the live Mercenaries tab works today (so changes fit)

- `mercenaries(r)`: sub-tabs, one per character (max 4, `ed.MAX_CHARACTERS`) plus `+`; a toggle for card images (hover or always).
- `characterCard(c, r)` shows class, name, player (select in edit mode, `setCharacterPlayer`), level, XP, gold, inherited, hand size, traits and
  special traits (modal `traitModal`), `deckZones()` (hand, discard, lost as three `.zone` lists with `.cardrow` items), bench list
  (owned cards not in the deck), items with tick states, the modifier deck (`c.am.faces`), enhancements of the class (`r.enh` filtered by class).
- Drag and drop: `main` listeners for `dragstart` (rows `.cardrow`, payload `{char, card}`), `dragover`/`drop` on `.zone` with
  `data-zone` = hand | discard | lost, `commit(ed.moveCard(...))`. Cards are sorted by initiative (`byInitiative`, `iniOf`).
- Card images: `cardImageUrl(card)` in `scripts/campaign/cardImages.js`
  (`.../wh_character_ability_cards/gh2/<CLASS CODE>/<slug>.jpeg`, Mercenary Pack as `mp/<code>/mp-<slug>.png`), mat images
  `matImageUrl(className, 'front'|'back')` (600x390), items `wh_items/gh2/<id>.png` (208x300). Hover preview uses `data-img` attributes.
- Character record (`chars[]`): `id, cls, name, seat?, lv, xp, gold, inh, traits, special, extra, am, hand (hand size), deck, disc, act, lost,
  bench, items [{id, st[]}]`. Card ids are `classIndex*100 + n` (`scripts/games/gh2_cards.js`: `{id, cls, slug, lv, ini}`).
  `moveCard` already moves between hand, discard and lost; `act` marks a hand card as active (`setCardActive`).
- Cards tab (`cardsPage`) has attack modifier, mat and ability card views; the hero modifier deck logic is in `scripts/amd/heroDeck.js`
  (`heroPerkClass`, faces from perks), perks data `scripts/games/perks.js`.

## 6. What the redesign still needs in the data model

Stage (a) is implemented (2026-11-12): `c.play` and `c.hord` exist (`scripts/campaign/record.js`: `normalizeChar`, `zoneOf`, `CARD_ZONES`, `handOf`), `moveCard(r, cid, cardId, dest)` in `edit.js` moves between hand, active, play1, play2, discard and lost with the rules below, `changelog.js` logs card moves and flips ("Sam: Flamethrower (level 1, initiative 16): hand to play slot 1") and a changed `hord`, and the Mercenaries tab shows the playmat layout (`deckZones` in `campaign/app.js`, `.board` in `style.css`); the old three column view is gone. Rules decided by the owner: a card in the active area is not in the hand; play slots take hand cards only (the two slots can swap); a card entering an occupied slot sends the old card back to the hand. The context menu mockup still offers every zone for every card and should follow the play slot rule. Items below that are not struck out are still open.

Playmat in the campaign page (2026-11-12, after the owner pointed out that the stage (a) and (b) screen was a plain list): the Mercenaries tab now renders the designed playmat from the real record. `campaign/playmat.js` (`playmatHtml`) builds the markup of `merc-6-playmat-v2.html` (top bar variant A with the cropped portrait, XP, gold and inherited perks spin boxes; item shelf; active area; two play slots with the class card back, face down or up; discard and lost piles with their top card; the hand with sort buttons), `campaign/playmat.css` is generated from the mockup by `tools/build-playmat-css.py` (all selectors scoped under `.pm`, do not edit by hand, rerun the tool when the mockup CSS changes), the clicks and drags are wired in `campaign/app.js` to the edit functions (`moveCard`, `flipPlayCard`, `sortHand`, `setCharacter`), hover zoom and hold to repeat are ported. The old sheet (traits, other cards, items, modifier deck, enhancements) sits below in a collapsed `details` until its parts are ported; the old three column list is gone. Card backs: `cardBackUrl` in `cardImages.js`. Portrait: `portrait-focus.json`. Added after that: class special tokens in the top bar (`c.tok`, `scripts/campaign/classTokens.js`, `setToken` in `edit.js`, logged as "Class token"), the Turn and Cards BGG code buttons (`turnPost` and `cardsPost` in `playmat.js`, from the cards in the play slots; the AMD button waits for the attack modifier deck modal), and the in-place redraw of the playmat (`campaign/morph.js`: cards keep their element, so a flip or a drop does not flicker). The page pencil and the card image toggle are gone from the Mercenaries tab. The dock (`dockHtml` in `playmat.js`, right of the board) opens modals drawn inside the playmat (`modalHtml`; the open modal, mat side and history filter are remembered by `app.js` in `pm`, not in the record, and the playmat redraw adds or removes the modal element): Journal (three tabs: Battle goals, Personal quest, Notes; record fields: campaign level `bgs` and `pq` = `{ slug: { st: 'mine'|'done', c: charId|null } }` for goals and quests that are out of the deck, a slug that is not listed is in the deck, so a quest or goal held by one character shows as "Other player" for the others and `c: null` marks a player who is not in the app; per character `bgo` (3 goals just drawn) and `pqo` (2 quests just drawn), `pqc` = `{ quest: [count per requirement] }` and `notes`; pure functions in `edit.js`: `offerBattleGoals`, `keepBattleGoal`, `setBattleGoalStatus`, `returnAllBattleGoals` (new scenario), `offerQuests`, `keepQuest`, `setQuestStatus`, `setQuestCount` (locks and auto completion as in the mockup, only for the quest this character holds), `clearOffer`, `setNotes`; the random draw is made in `app.js` and passed in as slugs; BGG roll codes `3custom<n>{ids}` and `1custom<n>{ids}` over the cards still in the deck; notes are saved when the field is left, with the markdown toolbar, preview and clickable to do boxes of the mockup; the history says e.g. "Accountant: in the deck to held by Sam" and "Sam: quest 13 Merchant Class, Head items: 0 to 3 of 3"), Character mat (front and back, click to flip), Enhancements (the enhancement log of this character's class from `r.enh`; add with a card picked from the class's cards, top, bottom and gold; remove; the price is edited in the row: `addEnhancement`, `removeEnhancement` and `setEnhancementPrice` in `edit.js`, entries are now `{ cls, card, top, bottom, price? }` and the history says e.g. "Added Tinkerer, Net Shooter (top Attack +1), 75 gold"), BGG codes (the sorted icon groups from `scripts/campaign/bggIcons.js`, generated from the mockup by `tools/extract-bgg-icons.py`; the class banners from `bggBanners.js`; the user's own saved codes in this browser under `havenmap.campaign.codes`) and History (the entries of this character from `record.log`, with a kind filter). Attack modifiers (the deck of this character: `deckOf` in `scripts/campaign/amdDeck.js` takes the standard 20 cards and applies the perks in the new record field `c.pk = { perks: [index into the class perk list], boxes: { index: mask } }`, so the deck follows the perks ticked in the Perks modal (a character with no perks has the standard 20 cards); draw, return from discard, shuffle, bless and curse (max 10, leave the game when drawn) are session state in `pm.amd[charId]` of `app.js`, not saved, as in the mockup; `drawState`, `amdAct` and `amdRollCode` are pure; the cards are drawn by `scripts/amd/card.js` into slots marked `data-keep data-amslot` that the redraw leaves alone (`morph.js`), click a card to enlarge it beside the modal, click again or anywhere to close; the AMD button of the top bar copies the roll code `1custom<n>{faces}` of what is left in the deck, and so does the dice button in the modal; no history lines yet). Perks and masteries (the perk rows of the mockup from the real class perk list: `togglePerkBox(r, cid, index, box)` in `edit.js` ticks one box, a multi-box perk counts once all its boxes are ticked, a repeated perk has one box per entry, the taken perks change the modifier deck at once; masteries come from `scripts/games/masteries.js`, generated by `tools/extract-masteries.py` from the Secretariat data (AGPL-3.0), 39 classes of GH2E, Mercenary Pack and Frosthaven, none for Jaws of the Lion, the texts have their icons written as words; `setMastery` stores the indexes in `c.pk.ms`; the history says "Sam: took perk ...", "gave up perk ...", "perk ..., boxes 1 to 2 of 3" (partial) and "mastery achieved: ..."; the perk cards are drawn into `data-perkcard` slots by `hydratePerkCards` in `app.js`; no limit on the number of perks is enforced, the header shows taken of total). Deck (two tabs; the dock button opens Hand, the level badge opens Card pool; the pool of a character is `deck` plus `bench`: `ownedCards` and `pendingPicks` in `record.js` (one pick of level 2 and up per level above 1), `addPoolCard`, `removePoolCard` (Undo last pick) and `applyHand` in `edit.js`; the level stepper sets the level and moves the XP to that level's threshold and gives back picks above the new level; the hand tab selects up to the hand size (`c.hand`) and Confirm makes those cards the deck, the other owned cards the bench, and resets discard, lost, active and play slots, with a second click to confirm when scenario cards are in play; the selection is session state `pm.hsel`; the dock button shows the pending picks; history: "Card pool: +a -b" and "Hand selection"; no tokens or stickers on the pool cards and no hover enlarge yet). Items (every item of a character has a state `s`: 0 available, 1 spent, 2 consumed, shown as the spent or consumed icon and a dark card; records from the spreadsheet import have the old `st` ticks, any tick counts as spent when `s` is missing; click an item to open it and set the state with `setItemState`; the pencil opens the equip dialog: unlocked items with free copies, grouped by slot, with the slot limits head 1, body 1, legs 1, hands 2 and small items half the level rounded up (`slotLimits`, `itemFits` in `record.js`), `setEquippedItems` keeps the state of items that stay; the Slot button sorts the shelf with `sortItems`; history "item #14 available to spent"; markers on items are not ported). Display settings (the gear at the end of the top bar opens a popup; `cleanSettings` and `settingsHtml` in `playmat.js`, kept per browser in `localStorage` `havenmap.campaign.pmset`, not in the record: hand layout spread or fan, card zoom hover or click with an override per zone, zoom size S/M/L (`HOVER_H`), hover delay, side of the docked preview, deck card click enlarge or draw (right click enlarges in draw mode), initiative badge, auto-sort of the hand by initiative (applied in `commit`) and reduced motion; the settings become data attributes of the `.pm` root, the CSS of the mockup does the rest; click zoom works for hand, active area and play slots, a played card turns over on a double click in click mode; items and piles zoom on hover only). Context menu (`campaign/ctxmenu.js`: one shared menu, right click, Menu key, Shift+F10, long press on touch and pen, only inside the playmat, Shift+right click and text fields keep the browser menu; entries are registered by selector with `registerMenu`; the registrations are in `app.js` and call the same edit functions as the normal UI: cards (Enlarge, Move to hand, active area, play slot 1 or 2 (hand cards only), discard, lost, Move to start and end of the hand), piles (Recover top card, Move whole pile to hand with confirm), counters (+5, -5, Reset to 0, one history entry each) and deck tiles (Enlarge); markers are not ported). Still missing compared with the mockup: the phone view, the summed counter history lines.

Stage (b) is implemented (2026-11-12): the hand follows `handList(c)` in `record.js` (automatic = lowest initiative first, or the manual order `hord`, new cards after it). Dragging a card to a place in the hand (also from another zone) calls `moveCard(..., 'hand', { before })` and switches to a manual order; the Ini button (`sortHand(r, cid, 'ini')`) clears `hord` and returns to automatic mode (the owner's choice: a card returning to the hand then lands in its sorted place); Lvl is a one-time order by level (X first, then 1 to 9, then the rest) then initiative; the hand header shows `n of <hand size>` with a warning colour when over the limit. Keyboard and touch reordering (move left or right, to start or end) come with the context menu in stage (f).


- ~~Play area: `c.play = [{id, up}|null, {id, up}|null]`, slot order matters (slot 1 = initiative)~~ done in stage (a); flipping (`up`) is stage (c).
- ~~Manual hand order: `c.hord = [cardIds]` (absent or null = sorted by initiative)~~ field and display done in stage (a); editing the order is stage (b).
- Custom counters: `c.cnt = [{n: 'Time tokens', v: 2}]`.
- Notes: `c.notes` (string); personal quest and battle goal: `c.quest`, `c.goal` (the app has no quest or battle-goal draw per character yet;
  `r.decks.bg` is the drawn battle goals list; `scripts/games/gh2_quests.js` has personal quests).
- XP thresholds table and perk and mastery state (`perks`, `masteries`) need a data source; verify the XP table against the rulebook.
- Everything goes through `commit()` so the History tab (`scripts/campaign/changelog.js`, `describeChange`) logs it; add a case there
  for each new field, and to `HANDLED` in that file.

## 7. Conventions and patterns used in the campaign page this session

- Pencil buttons: `modalBtn(attr, label)` (opens a modal), `secBtn(key, label)` (toggles inline edit of an Overview section; `editSections`).
  Standard classes `editbtn editicon secedit`.
- Modal patterns in `campaign/app.js`: `checkModal({...})` factory (stickers and classes: checkbox lists, optional per-group header
  checkboxes), custom modals with their own root element: players (`plRoot`), prosperity/donations/imbuement (`prosRoot`, mode in `prosModal`),
  reputation (`repRoot`), retired characters (`retRoot`), traits (`modalRoot`), scenario detail (`scnModalRoot`). Each has `renderXModal()` called
  from `render()`, an Escape handler in the shared keydown chain, `.modal`, `.modalbox`, `.modalx` classes in `style.css`.
- State changes: pure functions in `scripts/campaign/edit.js` (record in, new record out, `ver` bumped), `commit(next)` stamps the log, saves to
  `localStorage` (`havenmap.campaign.v1`) and re-renders. Undo restores the previous record and logs "Undo: ...".
- History tab: user name from Settings (`havenmap.campaign.user`), entries `{t, u, tab, kind, d}` in `record.log`, last 1000 kept, 20 shown per tab.
- Spoiler rule: locked items and scenarios are not named to players (numbers only in modals and the log).
- Data modules that are generated (do not hand-edit): `scripts/games/gh2_*.js` (by `tools/extract-campaign-tables.py` from the Card DB sheet of
  `WHTracker.xlsx`), `gh2_prosperity.js` and `gh2_reputation.js` (by `tools/extract-prosperity.py` and `tools/extract-reputation.py` from
  Gloomhaven Secretariat data, AGPL-3.0, at `D:\github\gloomhavensecretariat\data\gh2e`). Corrections go into the tool (`ITEM_SLOT_FIX`,
  `CLASS_NAME_FIX`, `CARD_FIX`). Re-running `extract-campaign-tables.py` with the older workbook changes unrelated files (cards, scenarios,
  events, quests): after running it, `git checkout --` every generated file except the intended one.
- Cache busting: `campaign/index.html` loads `app.js?v=99` (bump when shipping).
- Known data problems found while building mockups: `gh2_cards.js` has initiative 73 for Potent Potables (card shows 46) and none for
  Disorienting Flash (card shows 73); the mockups use the card values (`INI_FIX` in the generator). Worth fixing in `tools/card-initiative.json`.
- Class names: GH2E `Plagueherald` (one word) after `CLASS_NAME_FIX`; 43 classes in `scripts/campaign/classList.js` (GH2E 18, Mercenary Pack 4,
  FH 17, JotL 4). Items 169 and 170 slots were swapped in the Card DB and are corrected in the generator.

## 8. Tooling and gotchas

- Run the app: `start.bat` in `C:\Users\hansen\ai\games\HavenMap` serves that folder on `http://localhost:8080/HavenMap/`. During the
  session a static server on port 8099 (`python -m http.server 8099` started in that folder) was used for tests; it may still be running
  (check before starting another). The campaign page is `/HavenMap/campaign/index.html`, mockups `/HavenMap/campaign/mockups/index.html`.
- Playwright is installed globally; scripts load it with
  `createRequire('C:/Users/hansen/AppData/Roaming/npm/node_modules/playwright/')`. Seed a record with
  `page.addInitScript(r => localStorage.setItem('havenmap.campaign.v1', JSON.stringify(r)), rec)` (`import/campaign-import.json` in the repo is the realistic test record; it holds raw imbuement lists that `normalize` converts on load).
- Edit large files by writing a small Python patch script with the Write tool and running it; very large bash heredocs failed to parse in this
  environment. Files have CRLF line endings: read with `newline=''`, normalise to LF, write back with the original line ending.
  `node --check file.js` for a quick syntax check of ES modules.
- Git: one working tree, `HavenMap\HavenMap`, branch `main`.
- The scratchpad folder of a session is temporary: anything worth keeping (generator, scripts) must be in the repo (done for the mockups).

## 9. Suggested next steps

1. ~~Get the answers to section 4.3~~ Done 2026-11-10; the dock is now 6 buttons (`journal` replaces `quest`/`goal`/`notes`) in all six
   mockups and `index.html`.
2. Optional: one more mockup iteration of page 6 if the user wants changes (edit `tools/merc-mockups/gen-merc-mockups.mjs`, section
   "6 Playmat v2", run `MERC_MOCKUP_OUT="<repo>/campaign/mockups/" node tools/merc-mockups/gen-merc-mockups.mjs`, then screenshot with
   Playwright for review).
3. Design the modals one by one, in the order of use at the table: Attack modifier deck, Perks and masteries, Journal, Enhancements,
   Character mat, BGG codes. Attack modifier deck and Perks now render from real data (4.4) -- confirm it actually works once served over
   HTTP and viewed in a browser, then style/iterate. Journal, Enhancements and BGG codes were finished on 2026-11-12 (all in `merc-6-playmat-v2.html`, new module script before the embed block): Journal has a personal quest tab (the card image from `images/common/personal_quests/PQ01.png` to `PQ22.png` (450x600, copied from `Worldhaven\personal_quests\gh2
iot`; they are photos, not clean scans) docked on the left, name and requirements on the right from `scripts/games/gh2_pq_text.js`, generated by `tools/extract-pq-text.py` from the Secretariat gh2e data (names and counters only, no flavor text); every requirement has a counter or a done checkbox and stays locked until the requirements it follows are complete, progress in `hm-journal` `counts`). Deck state (`hm-journal` `deck`, slug to `deck`/`mine`/`other`/`done`, default in deck): a strip of 22 chips colored by status (click to show a quest), a status select, auto-complete when all requirements are done (and back to Mine when one is unticked), "Draw two Personal Quests" offers two card images from the deck (`hm-journal` `pqOffer`), keep one (it becomes Mine, the other stays in the deck), Draw again or Cancel; the "BGG code for roll" button copies a GeekRoller code over the quests still in the deck only (`1custom<n>{ids}`, ids 1 to 22 by list order, BGG test positive 2026-11-12). This is per character in the mockup; in the real app the deck belongs in the campaign record because quests are shared by the party. a battle goal tab (real cards from `scripts/games/battle_goals.js`, text only, no per-goal images exist locally; same deck system in `hm-journal` `bgs`: a strip of 60 chips by status, status select, draw three from the deck and keep one (the other two return to the deck), "Return to deck", "Return all to deck" for a new scenario, and the roll button copies `3custom<n>{ids}` over the goals still in the deck, ids 1 to 60 by list order, BGG test positive 2026-11-12) and notes; state in `localStorage` `hm-journal`. Enhancements keeps the table derived from placed stickers and adds manual rows (card, top, bottom, gold, remove), key `hm-enh-manual`. BGG codes keeps the built-in code and icon lists and adds custom codes (label, code, copy, remove), key `hm-codes-custom`. Character mat was already a working front/back flip. The icons in the BGG codes modal are sorted into headed blocks (General, Conditions, Elements, Loot, Terrain, Class specific) from lists the owner pasted; `chill`, `infect` and `item` were removed on request, and `plague` (BGG image id 9920344) uses `images/common/icons/plague.png`, copied from `Worldhaven/tokens/gh2/conditions/plague.png`. Turn post (top bar button `#hudturn`, labelled "Turn", next to AMD): copies the PBF turn template filled with the class banner (`[inlineimg]url[/inlineimg]`, the tag the template uses; the class banner codes use it too) and the cards in play slot 1 (top action) and slot 2 (bottom action), `XXX` if a slot is empty; the rest stays literally as in the template (icon lines `[imageid=7410469  inline] X` and `[imageid=7410466  inline] X`, End of Turn and the dashes; the map link line was removed on request). Cards button (`#hudnext`, next to Turn): copies the cards for the next round template `[u][b]Cards for the next round[/b][/u]`, `[o][b]<initiative>[/b]`, `<card 1>, <card 2>[/o]`, `[i]<character name> will [/i]`; the initiative is the initiative of the card in play slot 1, the cards are the ones in play slots 1 and 2, the name is the character name (not the class), `X` where something is missing. Context menu (`HM_CTX`, a classic script block near the end of the playmat file): one shared menu for the whole app, opened by right-click, the Menu key or Shift+F10, and a 550 ms long press on touch and pen (the browser menu is suppressed on the whole page, also where no HavenMap menu exists; only text fields and text areas keep it for cut and paste, and Shift+right-click always gets it). Element types are registered by CSS selector with `HM_CTX.register({sel, title, actions})`, no markup changes needed, first match wins. Prototype entries: cards (hand, active, play slots: Enlarge, Add marker or sticker, Move to Hand / Active area / Play slot 1 / Play slot 2 / Discard pile / Lost pile, Move to start / end in the hand), piles (Recover top card to hand, Move whole pile to hand with confirm) and counters (+5, -5, Reset to 0; done by clicking the spin box's own buttons so every rule, save and history entry still applies; the level counter has no menu). The moves reuse the page's drag and drop helpers (`toCardEl`, `sourceRemove`, `takeFromSlot`, `placeInSlot`, `addToPile`), so History logs them. Also registered: "Add marker or sticker" on cards (opens the existing marker editor through the card's handle button), "Add marker" on shelf items, "Enlarge" on attack modifier tiles (replaces the old draw mode only right-click handler, now works in both modes) and "Copy entry text" and "Delete entry" (confirm) on History rows. The attack modifier tile menu has no "Copy BGG code" item (dropped on request). The long press is not tested on a real touch device. In the real app the actions should call the app's state functions (one `actionsFor(type)` shared with the phone sheet). Classes: `CHAR_CLASSES` in the playmat and the phone page lists all 43 classes (GH2e, Mercenary Pack, Jaws of the Lion, Frosthaven), sorted by name, with three traits each. Traits come from the Secretariat character data. Four Frosthaven classes are named in the Secretariat data only by an icon (drill, kelp, prism) and I matched them to class names by their art and the token types, not from a source: drill = Metal Mosaic, kelp = Deepwraith, prism = H.I.V.E. (confirmed by the owner 2026-11-12). Display names Astral and Coral use the image names infuser and crashing-tide through `classSlug()` (`SLUG_ALIAS`), so the character mat portrait and the banner resolve. Card backs: the 21 added classes use backs that were already in `images/common/card_backs` (17 Frosthaven `fh-xx-back.png`, matched to the class names printed on the cards: dt = Deepwraith, dw = Deathwalker, me = Metal Mosaic, hv = HIVE, if = Infuser shown as Astral, cr = Crashing Tide shown as Coral; and the Jaws of the Lion backs for Demolitionist, Red Guard and Voidwarden (the Frosthaven style `*-card-back.png` variants, for a uniform look) and Hatchet, which has only one). Silent Knife has no GH2e ability card back in any repo (Worldhaven, GH2e_assets, Secretariat, card browser), so it uses the Gloomhaven 1st edition Scoundrel back (`gh-scoundrel-back.png`, copied from `Worldhaven/characters/gh/character_ability/SC/sc-back.png`; the Scoundrel has the same traits and role), as a stand-in like the other GH1 fallbacks until GH2e art exists. Not done: item marker tokens (`CLASS_TOKENS`) for the added classes, and the attack modifier deck, which is still the Tinkerer's. Portraits: the HUD portrait is the character mat (`wh_character_mats/front/<slug>.png`) cropped to a focus region per class, stored in `scripts/games/portrait-focus.json` as `{slug: {u, t, w}}` (left, top and side of the square, all as fractions of the mat width; the crop for any size S is `background-size S/w px`, `background-position -u*S/w px -t*S/w px`). `setPortrait(el, cls)` in the playmat and phone pages applies it and falls back to a centred cover crop for classes without an entry. The entries are made with `campaign/mockups/portrait-tool.html` (open over http, click Connect save file once and pick `scripts/games/portrait-focus.json`, then drag and zoom the square per class and click OK; without a connected file the tool keeps the values in the browser and Copy JSON exports them). Your own art could later be preferred over the mat crop by adding a lookup before the mat. Top bar (variant A of `campaign/mockups/topbar-styles.html`, chosen by the owner): one slim row with the portrait, name, class and traits, a divider, the level badge, the XP row (label, spin box, `/ next level`) with the bar underneath, gold and inherited perks spin boxes with small captions above, the class tokens, a divider, the three BGG code buttons as one segmented control under a `BGG code` caption (AMD, Turn, Cards) and a square settings button. Wraps onto a second line on narrow windows. The element ids are unchanged (`chname`, `chxp`, `chgold`, `chinh`, `tokens`, `hudroll`, `hudturn`, `hudnext`); `#chxp` now holds only the number and `#xphi` the XP needed for the next level. The other four variants (two tier, banner card, ring and copy menu, icon toolbar) are kept in `topbar-styles.html` for reference. Counters use one control, the spin box (`.sp`: value with a stacked up/down chevron column, style 2 of `campaign/mockups/counter-styles.html`): HUD gold, inherited perks, XP (the in-place editor still works, `+N` and `-N` too) and class tokens, personal quest requirement counters, the level in the card pool bar, and the class tokens on the phone page. Holding a button repeats (a small global script for every `.sp` button, playmat only). Not converted: the bless and curse add or remove buttons under the attack modifier cards (the count sits on the card, not in a box). The `+ counter` custom counter button was removed. top of the BGG codes modal, `bnrsec`): 43 banners (Diviner left out, Cassandra is its update) from `Wordhaven_Assets/wh_banners/<slug>.jpg` (list taken from the GitHub directory on 2026-11-12; display names differ for Astral = infuser and Coral = crashing-tide). A grid of square class icons (`images/common/attack_mods/class_icons`) copies on click: the tile copies the banner code (not the icon); the note above the grid changes to `Copied the <class> banner code` and the tile turns green for a moment. The code is `[inlineimg]<raw url>[/inlineimg]` (`bannerCode()` in the module), the tag the PBF turn template uses. Owner's BGG test was positive on 2026-11-12. History modal (dock button below BGG codes, `modal-history`, `hm-history` capped at 500 entries, newest last): recorded automatically, no per-feature calls. Card zone changes (hand, play slot 1 and 2, discard, lost) come from a debounced MutationObserver snapshot diff; character (XP, gold, class, traits, tokens), journal (battle goal and quest status, drawn goals, quest requirement counts), equipped items, card pool, hand selection, enhancements and markers come from wrapping `Storage.prototype.setItem` and diffing old against new JSON; perk ticks from a change listener. The real app should log in its own state layer instead (handover section 9, stage a). Small counter changes are summed: XP, gold, inherited perks, class tokens, quest requirement counts, the card pool level and the bless and curse cards added or removed by hand (`Bless cards in deck: 0 -> 3 (+3)`; drawing a bless or curse stays its own entry) are logged through `logCount()`, which folds repeated changes of the same counter into one entry (`Gold: 42 -> 47 (+5)`) as long as the next change comes within 4 seconds of the previous one, and drops the entry if the counter ends where it started. Attack modifier deck (category AMD): draws, returns from discard, bless and curse adds and removes and roll code copies are logged from clicks on `#amdreal`, `#amdcopy` and `#hudroll`; perk box changes (category Perks, applied or removed from the deck) from a state diff of `window.HM_AMD` (exposed by the AMD module). Not logged: card flips, sort order, notes text, phone zone moves (the phone page keeps zones in memory and does not load the recorder). GeekRoller rollers (changed 2026-11-12): the BGG codes modal now only holds the icon codes and custom codes (the side scenario and item design rollers were removed because they exist on other HavenMap pages); the attack modifier deck roller is the "AMD" button in the top bar (`#hudroll`, copies the live `amdCode`); the personal quest and battle goal rollers are buttons in the Journal tabs (`ROLL` in the journal module; the battle goal code `2custom2{1;2}` is the old one, the personal quest code `1custom22{1;...;22}` was checked in a BGG test post, positive 2026-11-12).
4. Implement in stages in `campaign/app.js`: (a) new zone layout and data model (`play`, `hord`), with History logging; (b) hand with sort
   and manual order; (c) flip and play area; (d) stats strip and counters; (e) modals; (f) responsive and touch behaviour.
5. Add a test pass in a headless browser per stage (see section 8) and commit per stage when the user asks.
