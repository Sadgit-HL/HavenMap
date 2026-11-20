# Decisions

Dated, newest first within each group. "Owner" marks decisions the owner made. Check here before proposing a design that may already be settled. A decision is changed only by a new entry, not by editing an old one.

## Architecture and data

- 2026-11-20: Storylines come from the owner's GH2 Flow image (`campaign_assets/scenario_flow.jpeg`), colours of the box borders; 13 areas corrected in `SCENARIO_AREA_FIX` (`extract-campaign-tables.py`). A two-colour box is in two storylines (`area` "Guards/Hail", first colour first; `lanesOf` in `flow.js`). The flowchart draws it in the lane of the storyline holding most of its linked scenarios (tie: first colour), shows both colours as a split stripe and two tags, and the storyline filter matches either. Owner chose this over first colour only, drawn in both lanes and a Shared lane.
- 2026-11-20: Boss scenarios (`boss` in `gh2_scenarios.js`, `BOSS_SCENARIOS` in `extract-campaign-tables.py`): the 15 boxes with a skull in the owner's flow image (8, 16, 20, 23, 24, 25, 26, 27, 29, 43, 50, 51, 52, 67, 80). A skull icon (`SKULL` in app.js) shows in the Table next to the name, on the flowchart box under the state dot (not on locked boxes, to keep them a spoiler-free "?"), and as a Boss tag on the scenario page. The attached image was the chain icon, so the skulls were read from `scenario_flow.jpeg`. Owner.
- 2026-11-20: Forced links (red arrows of the GH2 Flow sheet: no city phase, the next scenario must be played) get a chain icon on the middle of the arrow in the flowchart (`forced` in `gh2_scenarios.js`, `FLOW_LINK` in app.js). 13 forced links; the Secretariat keys 23 to 25 and 25 to 27 by section, so `FORCED_FIX` in `extract-campaign-tables.py` adds them. `gh2_scenarios.js` regenerated from `campaign_assets/WHTracker.xlsx` (path as argument). Plain "linked" (optional return) has no data yet. Owner.
- 2026-11-19: No presence heartbeat: the KV free plan allows 1,000 writes a day, shared with the saves. The header shows who saved last and when (`by`, `t` of the record). Durable Objects or a throttled last-seen key stay possible later. Owner.
- 2026-11-19: Left as they are: no UI to mark a card active (`setCardActive`), no storyline colours or stickers in the scenario Table view and the flowchart overview map. Phone touch layout and touch drag checked on a real phone, ok. Owner.
- 2026-11-19: Items have prices in the campaign: Buy for ... on the Items tab (pays the cost, refused with too little gold) and Sell in the Inventory modal (half the cost rounded down, with a confirmation). Costs are generated (`gh2_item_costs.js`). Supersedes the 2026-11-18 "no item price shortcuts" for items. Owner.
- 2026-11-18: One scenario level for the campaign: the normal difficulty (half the average character level, rounded up) plus the difficulty `party.diff` (-2 to +4), clamped 0 to 7. The Overview's Party window and the Monsters tab show the same control (level stepper and difficulty pill) and change the same value; the Monsters tab's own level (`mon.lvl`) is gone (converted on load). The difficulty stays when the party levels up. Owner.
- 2026-11-18: The 17 Frosthaven classes are playable in the campaign, the same way as Jaws of the Lion: fixed class indexes 51 to 67, cards and initiative from the worldhaven data, perks from FrosthavenAssistant, traits, species, hand size and masteries from the Secretariat data. Geminate gets one hand limit of 14 (players handle the two forms). H.I.V.E. mode tokens and the Geminate form tokens are marker tokens next to the character token; traps, shadows and other map tokens are not represented. Perk and mastery texts that mention Frosthaven-only rules are shown as printed (the FAQ covers them; players decide). Roll codes over 255 characters stay as they are. Owner.
- 2026-11-18: The Jaws of the Lion classes use Cephalofair's updated crossover sheets: their perks (replacing the FrosthavenAssistant lists), traits and masteries. Owner.
- 2026-11-18: The four Jaws of the Lion classes are playable in the campaign. Their classes and cards are generated into `gh2_classes.js` and `gh2_cards.js` with fixed class indexes 41 to 44 (card ids stay valid when the Card DB grows); ability cards in the updated GH2E-style design from the asset repository (`wh_character_ability_cards/jotl`) with their backs; the older Jaws-style pictures were removed (owner, 2026-11-18). Modifier decks: base and decorated cards drawn from layers, unique cards from the worldhaven scans. Owner.
- 2026-11-18: The hero attack modifier deck state (draws, Top, Bottom, Active, count edits) is saved in the campaign record, like the monster decks (`mon.am`). Supersedes the 2026-11-12 "draw state stays session only". Owner.
- 2026-11-18: Kept as they are: no perk limit, no item or enhancement price shortcuts, no fallback for hero roll codes over 255 characters. Owner.
- 2026-11-18: BGG banner codes already use a public address (linked in the banner modal). Owner.
- 2026-11-18: The GH2 scenario book and section book share one pCloud link on purpose (Resources). Owner.
- 2026-11-18: Scenario storylines (flowchart lanes) come from the Card DB area, corrected in `SCENARIO_AREA_FIX` of the generator. 13 Icecrag Ascent is Voice and Drake (it unlocks only Voice and Drake scenarios). 1 Bandit Camp, 2 Ruinous Crypt and 3 Frozen Hollow are Guards. 7 Black Barrow stays Demons (Secretariat agrees; the owner's sheet says Merchants). Scenario numbers follow the book: 23 to 26 are four boxes; the Secretariat's ally variants 23A/23B and 25A/25B are not split. Owner.
- 2026-11-17: Monsters tab: state in the campaign record (`mon`, shared with the players), a grid of up to 8 monster panels above the modifier deck band (swapped 2026-11-17), monster types picked from a list (the scenario data has no monster lists), stat cards at the monster level, End of round, an ally deck, a phone layout. The mechanics follow the map app; the map's own decks stay separate (URL state). Owner.
- 2026-11-17: Shared campaign: simultaneous edits of two players are merged (three-way merge, a value both changed keeps the version saved first, the other player gets a notice). Undo reverts only the user's own edits. Owner.
- 2026-11-17: Backend: a Cloudflare Worker with KV (`server/worker.js`), reached at `https://api.penultimate.de/` through a Netlify relay (proxy rewrite) and a CNAME at goneo. Reasons: web filters of the players block new `*.workers.dev` addresses; the domain's DNS and mail stay at goneo (Cloudflare custom domains need Cloudflare DNS). Rejected: moving the nameservers (goneo offers no setting), Deno Deploy (sunset April 2027), pCloud (storage only, no per-player access), webspace (cost). Access: one token per player, given as an invite link; no logins. Owner. Setup: `server/README.md`.
- 2026-11-17: The app is named HavenTracker (map and campaign tracking). Visible names change: the campaign page title now, the map page title and heading when the map is not in use. Kept as they are: the GitHub repository name and its Pages address (a rename would break the map links in the forum), the localStorage keys `havenmap.*` (a rename would lose saved data), folder names and local addresses. Owner.
- 2026-11-16: `images/` in the repo is the only source of truth for images. It holds the converted set (WebP, organised as `<type>/<edition>/<file>`). The app reaches every image through `scripts/images.js` (`imageFile`), which uses the generated table `scripts/images-index.js`. The remote image hosts are no longer loaded, except the BGG banner codes, which must be a public address. Owner.
- 2026-11-16: The map sidebar's mercenary mats come from `character-mats/<edition>` (the asset repository art), since the old repo mats were removed. Owner.
- 2026-11-14: `campaign/playmat.css` is hand-maintained. The generator stays as a reference and refuses to run without `--force`, because the mockup and the live page disagree.
- 2026-11-13: Playmat card markers are stored per card and item in `chars[].mk`, keyed `c:<card id>` or `i:<item id>`.
- 2026-11-17: Touch layout for phones upright and sideways (700 px wide or less, or 500 px high or less): the phone view of the Mercenaries tab, a page menu sheet instead of the tab row, modals as bottom sheets, list rows instead of tables on Items and Scenarios. Tablets keep the playmat. Owner.
- 2026-11-17: Phone Mercenaries: the name switches character (sheet), the Modifiers view is on the phone, long press shows the card preview and tap keeps the move sheet, hold and move places a modifier card. Owner.
- 2026-11-12: Phone is a separate layout (`phone.js`) with the same data and edit functions. Touch and pen use pointer events for drag.
- 2026-11-12: Attack modifier deck on the campaign page follows the perks taken (`chars[].pk`). Draw state stays session only.
- 2026-11-11: The mockup page 6 renders the real deck and perk data from `scripts/amd/` (ES modules, served over HTTP only).
- 2026-11-09: Asset hosting stays as it is. Card art remains in the separate `Wordhaven_Assets` repo, loaded by URL. Reasons: repo size, copyright, takedown risk. Weak point: `raw.githubusercontent.com` as an image host. Fallback if needed: serve the asset repo through GitHub Pages or jsDelivr.
- 2026-11-09: Edit is per page or per section (pencil buttons), not a global Edit toggle. Owner.
- 2026-11-08: The owner's campaign state is not imported automatically. It is synced by hand once the mechanics exist. Owner. `tools/import-campaign-state.py` is test data only.
- 2026-11-08: Scenario unlock links come from the group's own Flow chart, which is the source of truth, not the Secretariat. Owner.
- 2026-11-08: Battle goals use the Frosthaven set for all editions. Owner.
- 2026-11-08: Ability card piles stay on the campaign side. The map session carries only a link (`cmp`) per hero. Chests and loot are not recorded in the session yet. Owner.
- 2026-11-08: Session schema is `mapVersion` 5.0.0 with `campaign` (null for standalone) and per-hero `cmp`. Copies lose `am` and `cmp`.
- 2026-11-06: The session stays in the URL hash. The URL posted per turn is an immutable snapshot; the forum thread is the history.
- 2026-11-06: Campaign data lives on a token-protected server (not yet built). Tokens are never posted in the public thread.
- 2026-11-06: The per-hero modifier deck is a standalone feature, stored on the mercenary entry as `am`. Built before the campaign work.
- 2026-11-06: Retirements are entered manually.
- 2026-11-06: Votes on event cards are visible to everyone.

## Interaction and UI

- 2026-11-20: Short rest has a flow (supersedes 2026-11-10 for the short rest; long rest and lose-a-card stay by hand). One random card of the discard pile is lost, the rest of the pile returns to the hand; once per rest the player may take 1 damage to redo it, the first card goes back to the hand and is not part of the new pick. Needs two cards in the discard pile. The pick is made in the browser (crypto random) and saved in the record (`chars[].rest`), so all players see the same card; the GeekRoller code stays available elsewhere for rolls the group wants on the forum. Owner.
- 2026-11-20: Items search: in edit mode the search box also matches the names of locked items, so the owner can find and unlock an item by name. Players (no edit mode) still find locked items by number only; the tiles still read "Locked item". Owner.
- 2026-11-18: Treasures: each scenario shows its treasure tiles; players mark a treasure as collected with a click (play, no Edit). Taken and still available treasures look different, so a replayed scenario shows what is left; the flowchart marks unlocked scenarios that still hold treasure. Treasure placement from the Secretariat data with the owner's corrections. Owner.
- 2026-11-18: The tab keeps the name "Mercenaries". The Scenarios and Items roll buttons share one style (the merc tab's roll button: dice icon and "BGG code for roll"). Owner.
- 2026-11-18: Playmat drag uses one pointer-event implementation with a custom ghost card (opaque, lifted, fixed size, placeholder left behind, fly back on cancel) for mouse and touch, replacing the browser's native drag image (faint, sized like the source). Owner.
- 2026-11-18: Scenario tab look: flowchart boxes are sticker cards (sticker art on top, number and name band below; mockup variant 1C), the scenario modal is a page with a sticker banner (variant 3A), and each storyline has a colour (the owner's sheet hues, darkened) used on lanes, lane labels, boxes, tags and link chips. Owner.
- 2026-11-18: Scenario flowchart: lane labels stay visible at the left edge; the chart opens where it was left, else on the next scenario after the last completed one; an overview map in the corner; lane order for the shortest total arrow length. Owner.
- 2026-11-18: Scenario flowchart: panning by right-drag (as on the map), left-drag on the background and Space plus drag; the chart has no browser menu. Ctrl+wheel over the chart changes the chart size, not the page zoom. A search field finds scenarios by number or name; only boxes drawn with their name are found (spoiler rule), the found box is centered and marked gold. Owner.
- 2026-11-18: Modifier deck odds: the per-card list is replaced by cumulative odds of the next random draw (Miss, <=-2, <=-1, 0, >=+1, >=+2, Crit; misses inside the negative thresholds, crits inside the positive ones). Bless, Curse, x2 and Miss included; rolling cards chained exactly; card effects ignored; unique cards without a printed value and variable cards count as +0. No average. Shown as a framed strip left of Top and Bottom (mockup `amd-stats.html` variant 5), no label. Owner.
- 2026-11-16: Object keys (D, L, A on ability cards; D, L on items; D on attack modifier cards) act on the object under the mouse pointer, not on focus. The objects are not Tab stops. Owner.
- 2026-11-16: Item D toggles between available and spent (consumed counts as not spent); L sets consumed. Owner.
- 2026-11-16: The card images option (Hover or Always) was removed: it had no visible effect, and its bench view was dead code. Owner.
- 2026-11-16: The settings modal is split into tabs (Profile, Campaign file, Mercenary tab, Shortcuts). Owner.
- 2026-11-16: Tab order: Overview, Mercenaries, Items, Events, Scenarios, Resources, Cards, History. Owner.
- 2026-11-16: The Items tab roll button uses the merc tab's roll button style (`btn6 rollbtn`, "BGG code for roll"). The gold roll code tile of the Modifiers view was tried and reverted. Owner.
- 2026-11-16: The settings modal is 880 px wide and the shortcut list runs in two columns. Owner.
- 2026-11-17: The settings tab "Mercenary tab" is renamed "Display" (its card preview settings apply to every tab). Owner.
- 2026-11-17: One card preview for every tab (`campaign/preview.js`): hover with a delay (default Short), Ctrl at once, Z to pin, long press on touch; beside the card or docked; size a share of the window height. Click zoom and the zoom settings per zone are removed; a click always acts. The Fan keeps its in-place zoom animation; the Spread hand uses the preview. The tile sizes S, M, L of the Cards and Items tabs stay as a view setting. Owner approved the plan. Supersedes the 2026-11-16 decision below.
- 2026-11-16 (superseded 2026-11-17): Card tabs keep Ctrl+hover zoom (not the playmat's hover-and-delay zoom). The preview size follows the playmat zoom size setting. Owner. The "Show on: Ctrl+hover" setting restores this behaviour.
- 2026-11-16: Unique attack-modifier cards show the class badge over their baked lower-left badge when a perk adds them. Owner.
- 2026-11-16: Settings tabs order: Mercenary tab, Campaign file, Profile, Shortcuts. Owner.
- 2026-11-14: Shared GUI rules for all campaign tabs (`ui-guidelines.md`). No help text, no tips. Pencils open popups. Owner.
- 2026-11-12: Moving cards does not need the Edit toggle. Moving cards is play. Owner.
- 2026-11-12: Phone text and menus use the playmat's modal list (`PHONE_MODALS`). A new feature must say whether it is on the phone.
- 2026-11-10: Journal merges battle goal, personal quest and notes into one modal with tabs. Owner.
- 2026-11-10: BGG codes is a full modal, not a popover. Owner.
- 2026-11-10: End of round is done by dragging each play card to discard. No "End round" control. Owner.
- 2026-11-10: Inherited perks are a number only (no per-perk carryover UI). Owner.
- 2026-11-10: Desktop and tablet use the playmat; phones get a separate layout (confirmed 2026-11-12). Owner.
- 2026-11-10: Rest and lose-a-card are done by hand (dragging). No dedicated flow. Owner.
- 2026-11-10: Play slots are identical except that slot 1 sets initiative. Owner.
- 2026-11-07: Card art may be used because the app is non-profit. Owner.
- 2026-11-07: Card art is built as layers from the PSD template, with Frosthaven Assistant images as the alternative source.

## Content and rules (as implemented; check against the books when in doubt)

- 2026-11-16: Frosthaven and Jaws character mats come from the group's asset repository (`wh_character_mats`), same URL rule as the GH2 mats (H.I.V.E. is `hive.png`). Owner.
- 2026-11-16: Frosthaven and Jaws of the Lion ability cards come from any2cards/worldhaven, pictures hotlinked, for the Cards tab only. Owner, for now. Initiative: worldhaven first, Secretariat numbers for the 29 gaps; the worldhaven values were checked against the card art where the two differ. Card titles come from the picture file: the source name is sometimes the summon the card creates.
- 2026-11-13: All 649 GH2 ability cards have an initiative value (from card images).
- 2026-11-12: Four Frosthaven classes named only by icon in the Secretariat data are matched as drill = Metal Mosaic, kelp = Deepwraith, prism = H.I.V.E. Owner confirmed.
- 2026-11-12: Metal Mosaic pressure runs 0 to 3. Owner confirmed.
- 2026-11-10: Hollowpact removed from the mercenary list. Shattersong added (id 44). "Snow Dancer" is `Snowdancer`. Plague Herald is `Plagueherald`.
- 2026-11-09: Item 116 is excluded from prosperity level 1. Owner.
- 2026-11-08: Items 169 and 170 slots were swapped in the workbook and are corrected in the generator.
- 2026-11-08: Prosperity level thresholds come from the sheet (`PROSPERITY_START`). Imbuement +1P box pattern (every 5th box) is unverified against the Secretariat.
- 2026-11-08: Scenario level uses the Gloomhaven rule (half average level rounded up plus difficulty). Matches the Secretariat base formula (2026-11-16); rulebook not checked.
- 2026-11-08: Silent Knife uses the Gloomhaven 1st edition Scoundrel card back as a stand-in (no GH2e back exists in any repo).

## Process

- Commit and push only when asked. Work on `main` (the owner asked for direct commits to `main` for campaign work).
- Co-author line on commits: unresolved. Earlier repo rule (2026-11-07) added a `Co-Authored-By` line; the global `~/.claude/CLAUDE.md` says never add the assistant as co-author. Until the owner decides, follow the global CLAUDE.md (no line). Commits from 2026-11-10 (`01a5263` onward) have no line.
- Destructive or high blast-radius actions need confirmation (global CLAUDE.md). Reorganising docs was done by moving files into `docs/archive/`, not by deleting them.
- Never hand-edit generated files or changelogs. Fix the generator.
