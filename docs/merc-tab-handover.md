# Mercenary tab redesign: handover

Written 2026-11-10 at the end of a long session. Purpose: let a fresh session continue the design of the Mercenaries tab of the
campaign page (`campaign/`) without asking the user to repeat anything. Read this first, then `merc_tab.md`, then the mockups.

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
| Project handover (older) | `docs/HANDOVER.md` |

State of git at the time of writing: everything up to the Overview rework is committed and pushed (`main`, commit `10f07c6`).
**Not committed:** `campaign/mockups/` (including 22 card thumbnails, about 650 KB, copies of the group's card scans), `tools/merc-mockups/`
and this file. Ask before committing the thumbnails.

The generator hard-codes absolute paths (`C:/Users/hansen/ai/games/HavenMap/HavenMap/...`) and imports `scripts/games/gh2_cards.js` for
initiative values. Thumbnails were made with:
`curl` the card from `https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/wh_character_ability_cards/gh2/TI2/<slug>.jpeg`
then `magick in.jpeg -resize 300x -strip -quality 82 img/cards/<slug>.jpg` (originals are 750x1050).

## 2. The user and how to work with them

- PD Dr. Guido Hansen (guido.hansen@uni-luebeck.de), biochemist, plays a Gloomhaven 2e play-by-forum campaign with 3 other players.
- Global rules (`~/.claude/CLAUDE.md`): terse and direct, lead with the answer, under about 100 words by default, minimal markdown, no emoji,
  never the em dash, no filler, double-check facts and say when unverified, ask before destructive or high blast-radius actions, state a
  plan before large changes, **never add a co-author line to commits** (this overrides any attribution reminder), never hand-edit
  generated files or changelogs.
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
and real data: Simon, Tinkerer, level 5, played by Guido (from the imported campaign; the file the data came from, `campaign-import.local.json` of the deleted `HavenMap-campaign` worktree, is gone, `import/campaign-import.json` is the tracked equivalent).
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
  in blue), level badge, XP bar with the current-level range (210 to 275, 264 XP), gold, inherited, custom counters (Time tokens, Resolve,
  "+ counter") at the right.
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
- **Dock (column 4)**: 8 modal buttons: Attack modifiers, Perks and masteries, Personal quest, Battle goal, Character mat, BGG codes, Notes,
  Enhancements.

Verified in a headless browser: sort, drag reorder, flip, layer order (zoomed card is the top element over the play area), no console errors.

Data in the mockup that is a placeholder: counters (Time tokens 2, Resolve 1), perk count, the Net Shooter enhancement badge, XP level
thresholds (210 and 275: **from memory of the rulebook, unverified**, the app has no XP table yet), the portrait (a crop of the mat art:
`background-size: 330% auto; background-position: 10% 44%`; no real portrait asset exists).

### 4.3 Open questions for the user (not yet answered)

- "Inherited perks" in `merc_tab.md` versus the app's **inherited gold** field (`c.inh`): which is meant? The mockups show the gold.
- Should quest, battle goal and notes be one "Journal" modal with tabs (eight buttons would become six)? Should BGG codes be a copy popover
  instead of a modal?
- Is the first play slot the only difference between the two slots? What happens to the two cards at the end of the round (the user said
  played cards go to discard "more often": drag one by one, or an "end round" action that sends both)?
- Where does the "rest" or "lose a card" flow live? Not designed.
- Phone behaviour of the playmat (page 5 is a separate phone concept): decide whether the final page is responsive or desktop-first.
- Touch drag and drop (HTML5 drag events do not fire on touch).

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

## 6. What the redesign still needs in the data model (proposal, nothing implemented)

- Play area: `c.play = [cardId, cardId]` with face-up flags, e.g. `[{id, up: false}, ...]`, max 2, slot order matters (slot 1 = initiative).
  `moveCard` needs a `play` area and `act` handling to match the new active zone.
- Manual hand order: `c.hord = [cardIds]` (absent or null = sorted by initiative).
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
- Git: single working tree `HavenMap\HavenMap` (branch `main`). The second worktree `HavenMap-campaign` was deleted by the user on 2026-11-10 and
  pruned (`git worktree prune`); its untracked files (`docs/face-compare/`, the older `WHTracker.xlsx`, `campaign-import.local.json`) were not kept.
- The scratchpad folder of a session is temporary: anything worth keeping (generator, scripts) must be in the repo (done for the mockups).

## 9. Suggested next steps

1. Get the answers to section 4.3 (short list, offer defaults).
2. Optional: one more mockup iteration of page 6 if the user wants changes (edit `tools/merc-mockups/gen-merc-mockups.mjs`, section
   "6 Playmat v2", run `node tools/merc-mockups/gen-merc-mockups.mjs`, then `shot-v2.mjs` for screenshots).
3. Design the modals one by one, in the order of use at the table: Attack modifier deck, Perks and masteries, Enhancements, Character mat,
   Notes/Quest/Battle goal, BGG codes. Each as a static mockup first, same style.
4. Implement in stages in `campaign/app.js`: (a) new zone layout and data model (`play`, `hord`), with History logging; (b) hand with sort
   and manual order; (c) flip and play area; (d) stats strip and counters; (e) modals; (f) responsive and touch behaviour.
5. Add a test pass in a headless browser per stage (see section 8) and commit per stage when the user asks.
