# Handover: HavenMap campaign tracking and hero modifier decks

Written 2026-11-06, updated 2026-11-08. Read this first, then `campaign-schema.md` and `hero-modifier-faces.md` in this folder.

**Status:** the hero attack modifier decks are done and live on `main` (section 13, merged 2026-11-07, branch `feature/hero-amd` deleted). Campaign tracking (sections 1 to 8) is designed; its static tables are generated (section 14), the server and views are not started. Sections 11 and 12 are the working log of the card-art groundwork and are partly superseded by section 13.

Items marked (unverified) were inferred and not confirmed.

## 1. Goal

Extend HavenMap (browser map helper for the group's play-by-forum Gloomhaven 2e campaign, 4 players) to track the full campaign: characters and modifier decks, ability card piles, items, scenarios, events with voting, and BGG post generation. The per-hero modifier deck (section 13) is the first part and is done; the rest is not started.

## 2. Decisions made

- **Session stays in the URL hash** (`#lz:`), as today. The URL posted per turn is an immutable snapshot and the forum thread is the history.
- **Campaign data lives on a token-protected server** (small backend, e.g. a Cloudflare Worker with KV): 128-bit tokens in the URL fragment, hashes stored, roles admin, 4 players, read-only. Tokens must never be posted in the public thread.
- **Commit step:** a finished session URL is committed to the campaign with a token, idempotent via a session ID, with a version check. Level-ups, enhancements and card selection are separate campaign edits.
- **Per-hero modifier deck is a standalone feature** stored on the mercenary entry as `am`, built before any campaign work. **Done** (section 13): the deck is derived from the class perks (perk table from FrosthavenAssistant) plus manual edits of the basic cards.
- **Votes** on event cards are in scope, visible to everyone, cast in the campaign view with a player token.
- **BBCode post generation** is in scope and belongs in the map app (client side, from the session). The Outpost Phase template is Frosthaven material and out of scope.
- **Card art:** layered build from the PSD template (frame, sphere, number, icons), with Frosthaven Assistant images as an alternative source. Images may be used for this non-profit app (per the owner).
- Retirements are entered manually.

Full detail: `campaign-schema.md` (session schema, campaign record, API sketch, commit rules, phasing) and `hero-modifier-faces.md` (face record, catalog, deck compositions).

## 3. Repo and environment state

- Repo: `C:\Users\guido\ai\games\HavenMap\HavenMap` (earlier sessions ran as `hansen`), branch `main`, remote `origin` = `Sadgit-HL/HavenMap`, GitHub Pages site `https://sadgit-hl.github.io/HavenMap/` (presumably deploys from `main`, unverified). `main` contains the hero deck work (merge commit `4f11ab3`, 2026-11-07). The separate worktree `HavenMap-campaign` is no longer used.
- `start.bat` (one level above the repo, not in git) serves the folder on port 8080: `http://localhost:8080/HavenMap/`.
- The Photoshop template and the group workbook live in `C:\Users\hansen\ai\games\HavenMap\campaign_assets\` and must not be committed: `GH Attack Modifier Template.psd` (233 MB), `WHTracker.xlsx` (11 MB), and `psd-export\` (raw 874x591 PNG exports).
- The app is vanilla ES modules, no build step. State is JSON in the URL hash, versioned by `mapVersion` (currently 4.0.0) with a migration chain in `scripts/state.js`.

## 4. Assets produced (in this branch)

All under `images/common/attack_mods/`, WebP, 600x391 (the 815x531 card area of the PSD scaled), all overlays share the same canvas so they stack at 0,0.

| Folder | Content |
|---|---|
| `frames/` | 11 opaque card frames: `p0`, `positive`, `negative`, `bless`, `curse`, `x2`, `null`, `empower-condition`, `empower-card`, `enfeeble-condition`, `enfeeble-card` |
| `numbers/` | 16 transparent numbers with bevel: `c-m3..c-p4`, `c-x2` (centered), `o-m3..o-p3` (offset) |
| `spheres/` | 3 corner sphere variants: `empty`, `shuffle`, `numbered` |
| `icons/center/` and `icons/side/` | about 111 transparent icons: conditions, effects, elements, mixed elements, rolling, Empower/Enfeeble variants |
| `icons/imbuement/` | `imbue-1.webp`, `imbue-2.webp`: demon head discs (60x60) rebuilt from an earlier session |

The existing `monster/` and `imbuement/` card files are untouched. Skipped on purpose: four empty first-pass exports (Empower/Enfeeble icons, redone in the second pass) and one pixel-identical duplicate (`brittle-2`).

Layer composition notes: the PSD's text layers use `PirataOne-Regular` (open font), size about 298 px, tracking -110, the zero is the letter `O`. psd-tools does not render the PSD's layer effects (bevel), so numbers must come from Photoshop exports.

## 5. Tools (`tools/`)

- `export-am-layers.jsx`: Photoshop ExtendScript. Passes: 1 frames, numbers, icons, spheres (done); 2 Empower/Enfeeble (done); 3 remaining 30 frame types, Self/Ally labels on Heal/Shield/Retaliate icons, corner badge numbers +0..+3, -1..-3 (**written, not yet run**). Each pass writes its own manifest into `psd-export\`.
- `convert-psd-export.py`: crops `psd-export` PNGs to the card box (30,30,845,561), resizes to 600x391, writes WebP into the folders above, with renaming and skip rules. Run with Python and Pillow. Paths are hard-coded at the top.
- Photoshop gotchas: the document must be **ungrouped from its artboard** (the artboard has an opaque white background that ruins transparency). Never save the PSD. The script's second and third pass are untested in Photoshop beyond what the user ran.
- A throwaway venv with `psd-tools[composite]` was used for inspecting the PSD. It lives in a temp scratchpad and is not part of the repo; recreate it with `pip install "psd-tools[composite]"` if needed.

## 6. Findings worth keeping

- The group's workbook holds per hero: class, level, XP, gold, a modifier deck row with a checkbox per card and a GeekRoller code, the full class ability card list with three columns for discard, active and lost (columns H, J, L), items, enhancements (card, slot, price), plus campaign sheets (reputation, prosperity, imbuement, stickers, unlocked classes, retirements, scenario flow, city and road event decks with out, bottom and top states, voting, battle goals, personal quests, treasure index).
- Measured map URL (late game): 2030 chars, 4111 raw JSON chars, overlays are 58% of the raw size. Omitting default keys (`locked:false`, `angle:0` and so on) is a cheap saving (code dependency unverified).
- Sources of art: Worldhaven (`any2cards/worldhaven`) has Gloomhaven 1e, JotL, Frosthaven, Crimson Scales and others but no GH2 folder and no blank frames. The Frosthaven Assistant repo `Tarmslitaren/FrosthavenAssistant`, folder `frosthaven_assistant/assets/images/attack/perks`, has about 199 effect-named perk faces (400x267, baked-in numbers and corners). `flip` in those file names means rolling (checked visually). Gloomhaven Secretariat (`D:\github\gloomhavensecretariat`) has `imbue.svg` and `advancedImbue.svg`, the likely sources of the imbuement demon head.
- The imbuement face art in `images/common/attack_mods/imbuement/*.webp` (formerly `gh-am-i-*`) was made in an earlier session (Nov 4). Its scratchpad (scripts, demon discs) may still exist at `C:\Users\hansen\AppData\Local\Temp\claude\56dd7208bf07e1b8\17407d27-507e-4d66-98ec-46f032128a11\scratchpad\imbue\`, but it is temporary storage.
- The per-hero deck refactor planned here (descriptor instead of the `'m'`/`'a'` group string, tabs built per hero) was done; see section 13. The `am` field on a mercenary entry survives drag, removal, undo and load (verified).

## 7. Next steps, in order

1. Run pass 3 of the Photoshop script, then verify the files (alpha, no FAILED lines in `manifest-pass3.txt`), run `tools/convert-psd-export.py`, and rebuild the comparison page.
2. Resolve the open face questions (section 8) and finalise the face data (`hero-modifier-faces.md`) as a data file in `scripts/games/`. Static ID tables for classes, cards, items, scenarios, events and quests are done, see section 14.
3. ~~Implement the per-hero modifier deck~~ done, see section 13.
4. ~~Build the static ID tables~~ first cut done (section 14); next the campaign server and token auth, then session start and commit, then events, items and flow views.
5. Extend the BGG button into the post composer (turn post and aftermath post).

## 8. Open questions

- Colored frames: which Modifier Type gives the red Heal card (the template has no Heal type)? Strengthen with an Ally label is not in the PSD.
- How the "wound or immobilize" face (`+0,w/i)`) looks on the real card, and the missing control icon for `+0 control move1`.
- Value of `Invis ->` (assumed +0) and whether `plus1any` is the "wild" face.
- Scabs' class (not read from the sheet).
- Licence: text data of the Card DB, the Frosthaven Assistant images, the GHS imbue SVGs, and the PSD template (author unknown). Images are cleared for this non-profit use by the owner, the rest has not been checked.
- Backend choice and hosting for the campaign server.

## 9. Working rules from the owner

- Terse, direct answers, no emoji, no em dashes.
- Confirm before destructive or high blast-radius actions.
- Commits made with an AI assistant carry a `Co-Authored-By` line (owner's decision, 2026-11-07; this replaces the earlier rule against it). Never hand-edit generated files or changelogs.
- Develop on a feature branch and merge to `main` when ready (`feature/hero-amd` was merged on 2026-11-07 and deleted).

## 10. Not committed (local only)

- `docs/face-compare/` (side-by-side HTML, contains copies of Frosthaven Assistant images with an unchecked licence).
- The workbook, the PSD and the raw exports (in `campaign_assets`).

## 11. Update 2026-11-07: perks listing page (separate from sections 1-10 above)

> Superseded in part by section 13: the baked scans described below are no longer used. Cards are composed from layers (`scripts/amd/`), `perks/card.js` moved to `scripts/amd/card.js`, the `shared/` scans were moved to `asset-backups/attack-modifier-cards/`, and the class badge is now the composed one (the open badge issue at the end of this section is gone).

A second, independent task was done on this branch, on a different machine (`C:\Users\user\...`, not `C:\Users\hansen\...`): a standalone page listing every attack-modifier perk for every class across FH, GH2E, JotL and MP, with the perk's card art composited/shown. This is unrelated to the campaign-tracking goal in sections 1-9 above (which is still open and un-started) but lives on the same branch since it's the same card-art groundwork.

**What's there:**
- `tools/perks-decode.mjs` + `tools/extract-perks.mjs` → generate `scripts/games/perks.js`: all 43 classes (17 FH, 18 GH2E, 4 JotL, 4 MP), 711 perk entries, from `Tarmslitaren/FrosthavenAssistant`'s edition JSON (local clone, not committed: `asset-backups/amd/FrosthavenAssistant`, sibling to this repo one level up). Re-run `node tools/extract-perks.mjs` after updating that clone.
- `perks/` (`index.html`, `app.js`, `card.js`, `style.css`): the page itself. Open `/HavenMap/perks/index.html` via `start.bat` (see note below) or any static server rooted one level above this repo.
- `images/common/attack_mods/shared/` (101 files) and `unique/` (68 files): **not** composed from the layered frame/icon assets in section 4 above. They turned out to be real Cephalofair card scans baked into FrosthavenAssistant's own `assets/images/attack/perks/*.png` (confirmed pixel-for-pixel against `any2cards/worldhaven`'s photos), so the page uses them directly — correct color tint, icon, number, rolling diamond, all already right. Converted from the FHA PNGs (format only, no edits).
- `images/common/attack_mods/class_icons/` (43 files): one white-silhouette-on-transparent webp per class, converted from `P:\Guido\boardgames\Worldhaven\icons\all\<Class>.png` (a local asset the owner provided directly, trimmed to content + recolored to white). Overlaid on every card to show which class a perk belongs to, replacing whichever class's own weapon icon the baked scan happened to carry (the same slug image is reused across many classes).
- `docs/hero-modifier-faces.md` section 3a/7 documents the layout rule and this pipeline in more detail.

**Open issue, not resolved**: the class-icon badge overlay's position/size (`.pc-class-badge` in `perks/style.css`) still doesn't perfectly cover the baked-in badge on every card — confirmed still wrong on Frozen Fist's cards as of the last check. Several rounds of re-measuring (via worldhaven's 600x391 photos, then FHA's own 400x267 source grid, then automated pixel-color sampling) each fixed some cards but left others showing a sliver of the original badge ring. The automated color-sampling approach turned out unreliable (false-positive matches against each card's own center icon color). **Next step**: get a precise pixel bounding box of the badge ring by having a person look directly at `images/common/attack_mods/shared/plus0disarm.webp` (586x391) in an image viewer/editor that shows pixel coordinates, rather than more automated guessing — the ring position should be identical across all shared-image cards (confirmed on 3 clean samples: curse/poison/strengthenally all gave the exact same bbox before Frozen Fist's cards showed otherwise, so something is still off). The CSS box is percentage-based off the 600x391 canvas with a cover-crop correction for the images' actual 586x391 (≈400x267 native) aspect ratio; the math is in a comment above `.pc-class-badge`.

**Not carried by git**: the `start.bat` fix (replacing `timeout` with `ping`-based delays, since `timeout` fails outright without an attached console) lives in `C:\Users\user\ai\games\HavenMap\start.bat`, **one level above this repo** — it is not part of this git repository and will not transfer via clone/pull. Redo it manually on a new machine if `start.bat` errors with "input redirection is not supported".

**Cache busting**: `perks/index.html` and `perks/app.js` use `?v=N` query strings on their own asset imports to defeat browser caching during iteration (currently `v=9`). Bump the number on both files when editing `perks/*.css`/`*.js` so a plain refresh picks up changes.

## 12. Update 2026-11-07 (evening): layered rebuild of the shared faces and the compare page

> Still accurate for the layer assets, tools and layout rules. Since then the composition code moved to `scripts/amd/compose.js` (layers are objects now, not URLs with `#xf:`/`#r180` suffixes), and the compare page's scan column is empty because the scans were moved to `asset-backups/attack-modifier-cards/reference-scans/`.

Commits `718ea29` (assets) and `c0077cc` (code), pushed to `origin/feature/hero-amd`. Supersedes step 1 of section 7 and the asset counts in section 4. Machine: `C:\Users\guido\...` (not `hansen`).

### 12.1 Direction

The perks page with baked scans was a test. The cards are meant for the campaign and map apps, so the target is the layered build (frame + icons + badges + amounts), not the scans. `perks/compose.html` (served at `http://localhost:8080/HavenMap/perks/compose.html`, filter with `#q=<slug part>`) shows each of the 101 distinct shared faces three ways: scan, composed from our layers, and composed over scan (tick "Show difference" for a difference blend). It is the working surface for matching the scans.

### 12.2 Icon source: use the FH template

The first export came from the GH template and its glyphs do not match the Frosthaven scans (push, pull, wound, bless and the dual elements all differ). The FH template (`FH Attack Modifier Template.psd`) has the right art. `tools/export-am-layers.jsx` now writes to `psd-export-fh` when the document name starts with `FH`. The `DO` flags in the script currently have only `plain: true` on (petal-less Curse and Bless frames); set the others back to `true` for a full FH run. A full FH export has not been done. What exists was assembled from hand-exported files (below).

Source files live outside the repo:
- `C:\Users\guido\ai\games\HavenMap\asset-backups\amd\assets`: dual-element frames `E_D.png` ... `W_D.png` (15), `bless.png`, `Bless_icon.png`, `curse.png`, `class_circle.png`, `side_-1/0/+1/+2/+3.png`, `retaliate.png`.
- `P:\tmp\HavenMap\asset-backups\psd-export`: pass 3 exports (30 frames, 12 Self/Ally icons), `push.png`, `pull.png`, `Wound.png`, the 15 `FH Dual Elements` pill PNGs (`fire or ice.png` ...), and 14 files from 02:05 (`Earth_Dark.png`, `Fire_Ice.png`, `Light_Wind.png` ...) that have **not** been looked at or converted.

### 12.3 Assets now in `images/common/attack_mods/`

- `frames/`: 30 modifier frames (pass 3), 15 `mixed-elements-<a>-<b>` two-tone frames, plain `curse` and `bless` without petals (the real cards have none).
- `icons/center/`: replaced from FH art: push, pull, wound, bless, retaliate (fist disc, no label), pierce (baked X removed), and the 15 dual-element pills. New: Self/Ally heal, shield and retaliate icons, `conditions-ward-range`, `conditions-safeguard-ally` (glyph shrunk and raised).
- `icons/small/target-ring.webp`: white ring glyph for "target N" lines (114x114, not full canvas).
- `spheres/`: `badge-p0..p3`, `badge-m1`, `badge-m2` (built, see tools), `class-circle`.
- Not replaced yet: everything in `icons/side/` (still the old GH-style art, except the new Self/Ally ones) and `numbers/`. The other centre icons (poison, stun, curse, strengthen, safeguard, ward, elements ...) have not been compared against the scans one by one.

### 12.4 Tools added (`tools/`)

| Script | What it does |
|---|---|
| `convert-psd-export.py` | Paths now overridable (argv or `PSD_EXPORT_SRC` / `AM_DST`). Also replaces centre icons for push, pull, Wound and the dual-element pills: it scales them into the box the old icon filled. |
| `convert-dual-frames.py` | `?_?.png` dual frames, plus the Bless and Curse frames and the Bless icon. |
| `convert-badges.py` | `side_*.png` and `class_circle.png` to `spheres/`; clears the faint texture alpha outside the disc. |
| `convert-retaliate.py` | `retaliate.png` to `icons/center/effects-retaliate.webp`. |
| `make-badge-m2.py` | Builds `badge-m2` from `badge-m1` (inpaints the "1", pastes the bevelled "-2" from `numbers/c-m2`). Replace it by a real export if one appears. |
| `clean-pierce-icon.py` | Removes the X from the pierce icon and closes the shaft gap. Run it on the original icon, not twice. |
| `make-raised-icon.py` | Generic: shrink and raise an icon's glyph inside the diamond. Args: icon, output name, scale, new glyph top. Safeguard was built with `conditions-safeguard conditions-safeguard-ally 0.9 134`. |
| `make-ward-range-icon.py` | Same idea for ward (scale 0.77, box 252,103 to 340,231). |

### 12.5 Photoshop script state (`export-am-layers.jsx`)

- The corner badge export still fails. Cause: `Numbered Deck > Number/Symbol` is locked and its parent groups are `allLocked`. The script now unlocks the whole chain and relocks afterwards, which clears the group locks, but the text layer's own `allLocked` still raises "The command Set is not currently available". Workaround used: the owner exported `side_*.png` by hand. If this is revisited, try unlocking the text layer by hand in the Layers panel before running, or drop badge export.
- Never save the PSD. The document must be ungrouped from its artboard first.
- A failed run leaves group locks changed in the open document; harmless if not saved.

### 12.6 Layout rules found by comparing with the scans

All coordinates are on the 600x391 canvas. Implemented in `perks/compose.js`.
- Every icon face: tinted frame named after the first icon (push and pull share `push-pull`, safeguard uses `poison`, heal uses `p0` and matches the scan). Two elements: per-pair two-tone frame, rotated 180 degrees for the seven slugs in `ROTATE_FRAME`. Three elements (`minus1airdarkearth`): `earth-wind` frame rotated, plus three element discs (scale 0.42) at wind (244,162), earth (359,162), dark (301,261).
- Value badge disc at x29 y149 (96 px), class badge circle at x37 y268 (87 px, owner's measurement). Plain cards (no icon) keep the big centre number and have no value badge.
- Amounts and labels: push number dark at (300,145); retaliate number white beside the fist at (373,193); pierce number white at (248,195); lone target "+N" at (217,197); target next to another icon: main icon scaled 0.73 and raised 29.5 px, white ring glyph at (281,289) and amount at (323,294) in Palatino bold; ward range line (hexagon + arrow SVG + amount) under the raised glyph; "Ally" label for strengthen and safeguard in rounded sans at (299.5,268); `curse 2` draws two curse diamonds at (258,157) and (340,238) at scale 0.557. Numbers use Pirata One (bundled in `perks/fonts/`) unless noted.
- The pull number position (303,168) is estimated; no pull face exists in the data.

### 12.7 Gotchas

- The scans are 586x391 and the page shows them with `object-fit: cover` onto 600x391, so a plain resize in a script gives slightly different coordinates than the page. Measure against the page. A headless Chrome screenshot works: `chrome --headless=new --screenshot=... "http://localhost:8080/HavenMap/perks/compose.html#q=..."`.
- Cache busting: `compose.js?v=22` and `compose.css?v=15` in `compose.html`; bump them on every edit. `perks/index.html` and `app.js` are at `?v=10`.
- Overlay transforms use a `#xf:` or `#r180` suffix on the layer URL in `compose.js` (`stack()` strips it). Hacky but contained.

### 12.8 Open items

- Frames still missing: shield (3 faces) and retaliate (1) use the placeholder `p0`. The retaliate scan has a steel grey-blue frame.
- The 68 `unique` faces and 26 multi-icon faces have not been rebuilt; only the handful above were matched. Rolling and the other side icons are still the old GH-style art.
- The 14 unprocessed `psd-export` files from 02:05, and the `+4` badge (CSS placeholder on the page; no shared face uses it).
- The class badge overlay on the old perks page (`.pc-class-badge`) was set to the owner's measurement (v=10) and never confirmed visually.
- Backups of every replaced asset were kept only in `%TEMP%\bak`, which is not durable. The old versions of the 28 replaced files are in git history (`810c653`).
- Campaign work (sections 1 to 8): only the static tables exist so far (section 14).

## 13. Hero attack modifier decks (done, merged to `main` 2026-11-07)

Scope: the official classes of Frosthaven, Gloomhaven 2nd Edition, Jaws of the Lion and the Mercenary Packs only. Hollowpact (a Crimson Scales class) was removed from the mercenary list, Shattersong was added (id 44, HP table from the FrosthavenAssistant data), and "Snow Dancer" is now `Snowdancer` everywhere (title, token image, perk class).

### 13.1 What the app does

- The attack modifier panel (card-back button next to end turn) has tabs: Monsters, Allies, then one per hero on the map, named by class (two heroes of one class get `#1` / `#2`). Selecting a hero on the map focuses its tab, selecting a monster focuses the Monsters tab. The panel is not opened or closed by selection.
- A hero deck starts as the standard 20 cards. Draw, return, shuffle, end-of-round reshuffle (x2 or Miss drawn, or deck empty) and the GeekRoller code work as for monsters. Bless and Curse have their own +/- buttons and use the hero card art (no monster "M" badge).
- **Perks** button (`Perks n/total`, only for classes with perk data): a list of the class perks with the cards each one swaps. Ticking a perk changes the base composition. The list shows:
  - repeated perks (the same perk taken up to N times, N identical entries in the data) as one row with N separate blue boxes and an `xN` tag; each box counts on its own;
  - `[double]` / `[triple]` perks (text perks with 2 or 3 checks) as one row with joined lavender boxes and an `all N` tag; the perk counts only when every box is ticked;
  - the description only for perks without cards (the cards already show the effect), with `%token%` placeholders turned into icons (42 icons in `images/common/perk-icons/`).
- **Edit** (pencil): basic cards (+0, +1, -1, ...) can be added and removed by hand (scenario effects). A hero's perk faces can only change through the perk list. The imbuement bar is monsters only.
- Hovering a card (ability decks, attack modifier tiles, perk list) shows an enlarged preview above the panel.

### 13.2 Code map

| Where | What |
|---|---|
| `scripts/amd/` | App-agnostic card rendering and hero deck model. See `scripts/amd/README.md` for the file table. `card.js` is the entry point (`buildCard`), `heroDeck.js` the model, `perkText.js` the icon text. |
| `scripts/attackMods.js` | Deck state and logic. A deck is addressed by key: `'m'` (monsters, `state.am`), `'a'` (allies, `state.amA`) or `'h<i>'` (the hero at `state.mercenaries[i]`, stored as `am`). `deckOf()` resolves storage and card catalog. Hero API: `amDecks`, `amHeroPerks`, `amToggleBox`, `amCardLocked`, `amClassName`. |
| `scripts/decks.js` | The panel (tabs, tiles, perk rows). View state is in `amView`. Hero cards are mounted after render (`mountAmCards`, `amCardOf`). |
| `scripts/hoverPreview.js` | Shared enlarged preview (`#deck-preview`). |
| `scripts/state.js` | `withoutAm()` (copies of a hero start with a fresh deck, used by alt-drag copy and paste); heroes whose class no longer exists are dropped when a map loads. |
| `perks/` | Standalone pages: `index.html` (all perks of all classes), `compose.html` (layered composition against the scans, dev tool). |
| `tools/` | `extract-perks.mjs` + `perks-decode.mjs` (generate `scripts/games/perks.js` from the local FrosthavenAssistant clone in `asset-backups/amd/`), `check-perk-icons.mjs` (every perk text token has an icon), `convert-*.py` / `export-am-layers.jsx` (art pipeline, section 12). |

### 13.3 State

`mercenaries[i].am` holds only what differs from the standard deck (`null` or missing = standard):

```
{ discard:{key:n}, deck?:{key:n}, base?:{key:n}, lvl?, perks?:[entryIndex], boxes?:{entryIndex:bitmask} }
```

Card keys: `p0 p1 p2 m1 m2 x2 miss` (standard), the art slug for decorated faces, `u-<code>` for unique faces. `perks` are the taken perk entries (index into `PERKS[edition][class]`), `boxes` are the ticked boxes of multi-box perks that are not complete yet. Ticking a perk applies its card swap to `base` (and the draw state), unticking reverts it; manual edits of basic cards stay on top.

### 13.4 Data and mapping

- Perk data: `scripts/games/perks.js`, generated from FrosthavenAssistant (43 classes, 711 entries). The data repeats an entry once per box, which is why repeated perks are grouped in the UI. As a cross-check, gloomhavensecretariat's `data/<edition>/character/<class>.json` has an explicit `count` per perk; the sums equal the FrosthavenAssistant entry count plus the extra `[double]`/`[triple]` boxes for the 20 classes that could be matched by name (the others use codenames there, not mapped).
- Mercenary title to perk class: by title, with one alias (`HIVE` -> `H.I.V.E.`). A class without perk data gets the plain deck and no Perks button.

### 13.5 Assets

- Runtime, under `images/common/attack_mods/`: `frames/ numbers/ spheres/ class_icons/ icons/{center,side,small}/ unique/` (what the perk lists load), `monster/` and `imbuement/` (live deck cards, named by face: `plus0 minus1 x2 miss bless curse`, `plus2muddle ...`), `hero/` (hero Bless and Curse). Icons in perk descriptions: `images/common/perk-icons/`.
- Parked in `asset-backups/attack-modifier-cards/` (outside the repo, README there): the 101 reference scans and the layers no current face uses. The x2 frame, `c-x2` number and shuffle sphere were copied back because the hero x2 / Miss cards need them.

### 13.6 Working notes

- No test suite. Checks used: syntax check of every script, `node tools/check-perk-icons.mjs`, and browser runs (Playwright with Chrome against `python -m http.server`) of the panel flows. For rendering changes, compare the output of the compare page (all 101 faces) and the perk rows of a few heroes before and after.
- Cache busting is by hand: `?v=` / `decks-N` strings in `index.html` (main.js, main.css, `amd.css`), in the imports of `scripts/amd/*` and `scripts/decks.js`, and in the `perks/*.html` pages. Bump them when editing the file they point at.
- AI-assisted commits carry a `Co-Authored-By` line (owner's decision, 2026-11-07, see section 9).

### 13.6a GeekRoller codes (2026-11-08)

- BGG's GeekRoller rejects a roll longer than 255 characters ("The roll has a max size of 255 characters"), counted over the whole `1customN{...}` string. Bless/Curse faces are `B`/`C` (2 characters each with the `;`).
- Face text lives in `scripts/amd/uniqueFaceText.js` (the 68 unique cards, hand-written) and `faceText()` in `scripts/amd/heroDeck.js` (shared cards, generated). The table in `docs/unique-geekroller-codes.md` mirrors the unique labels; keep both in step when editing.
- Conventions set by the owner: no leading `+0:` on any face with an effect (unique and shared); `tr` for trap, `inf` for infusion, `Res` for Resonance; `AA:` prefix and `=` for cards placed in the active area (`bb1`, `br1`, `ca3`); `R` = Range, `Ret` = Retaliate; Quartermaster item gains are `BS/IP` and `SoR/SD >`.
- Length check: sum the faces of a class's catalog with every perk applied (`heroCatalog` + `perkDelta`, count = standard count + summed deltas). Last measured with all perk entries active: Trapper about 393, Cassandra about 248, Crashing Tide 287, Soothsinger 282, Snowdancer 277, Sawbones 267, Satha 260, Shattersong 257 (the last measurement of each, before later edits to Cassandra, Nightshroud and Infuser); Infuser is 255 and Nightshroud about 193. Still over the limit: Trapper, Crashing Tide, Soothsinger, Snowdancer, Sawbones, Satha, Shattersong. There is no automatic fallback; a roll over 255 is rejected by BGG (a compact fallback was tried and reverted on request).

### 13.7 Open

- Campaign tracking (sections 1 to 8): static tables done (section 14), server and views not started.
- Unique cards that stay in the active area when drawn are tracked like any card (no active-area state).
- A perk-added `+1` merges into the standard `+1` count, so its tile has no class badge (only the perk list shows it).
- Not refactored on purpose: alt-drag copy next to `cloneForPlacement`, the compare page's scan/transform scheme, further CSS consolidation, hand-bumped cache strings (no build step).

## 14. Campaign static tables (2026-11-08)

Phase 2 of `campaign-schema.md` section 10, first cut. Generated by `tools/extract-campaign-tables.py` from the "Card DB" and "GH2 Flow" sheets of `WHTracker.xlsx` plus Gloomhaven Secretariat data. Run `python -I tools/extract-campaign-tables.py [xlsx] [gh2e scenarios dir]` (needs `openpyxl`). The workbook is at `asset-backups/WHTracker.xlsx` (not in git); the Secretariat folder defaults to `D:\github\gloomhavensecretariat\data\gh2e\scenarios`. Never hand-edit the generated files; regenerate and diff.

| File | Contents |
|---|---|
| `scripts/games/gh2_classes.js` | 22 classes (18 GH2 and the 4 Mercenary Pack classes), index, code, name, source |
| `scripts/games/gh2_cards.js` | 649 ability cards, id = class index * 100 + n (stable only while the Card DB rows are unchanged) |
| `scripts/games/gh2_items.js` | 179 items: id (number or `QM5`), slug, slot, kind (coin/solo/qm), copies |
| `scripts/games/gh2_scenarios.js` | 101 scenarios and 19 campaign stickers |
| `scripts/games/gh2_events.js` | 100 city and 77 road events (number, image count) |
| `scripts/games/gh2_quests.js` | 22 personal quests, 3 traits per class |
| `scripts/games/battle_goals.js` | 60 battle goals (Frosthaven set, all editions), id, slug, checkmarks |

- Card DB layout: no header row, columns read by position (documented at the top of the extractor).
- Scenario `unl` (65 links on 49 scenarios) is read from the arrows of the group's own "GH2 Flow" chart, which is the source of truth by the owner's decision. The chart is a cell grid (boxes 9 columns by 13 rows, arrows as single characters); diagonal arrows are interpreted by position and are unverified against the book. `init` (scenarios 0 and 1) and `forced` come from the Secretariat data. Scenario names follow the Secretariat where the sheet had abbreviations or typos (21, 24, 26, 58, 65).
- Secretariat is AGPL-3.0; only facts (links, initial flags, names) are used, but the licence is still an open question (section 8). Its solo scenarios reuse the indexes 85 to 100 and are skipped. Its split scenarios 23A/B, 25A/B and S are not in the table because the chart uses plain 23 and 25.
- Comparison with the Flow chart found 6 differences (the split scenario links, `37 > 41`, `41 > 54` from the Secretariat, and `45 > 38` reversed) and 15 links only in the chart; all follow the chart now.
- Battle goals: `scripts/games/battle_goals.js`, the 60 Frosthaven goals used for all editions (owner's decision; the Card DB has none for GH2). Id and checkmarks (1 or 2) come from the Secretariat's `fh/battle-goals.json`; the sheet's `pincusion` typo is fixed.
- Not done: importing campaign state from the workbook. Item columns, as explained by the owner (2026-11-08): Card DB column 8 is `True` when the item is unlocked in the current campaign, column 40 is how many copies are still available in the shop (the rest are with players; column 39 is the total), column 41 is only a display marker for the sheet's slot filter and is ignored. Columns 8 and 40 are campaign state, not static data, so they belong to the state import (`items.unl`, and `items.taken` = column 39 minus column 40), not to `gh2_items.js`. Also to import: per-scenario state (status, level, party size, chests, date) from the Flow tab into the campaign record.
- Backend decision (discussed, not made): Pages cannot host the server. Best fit is a Cloudflare Worker with KV behind a thin storage interface, with an admin export of the campaign JSON.

### 14.1 Workbook state import (stage 1, 2026-11-08)

`tools/import-campaign-state.py [xlsx] [out.json]` reads the campaign-level state into a campaign record (`campaign-schema.md` section 4) and writes `asset-backups/campaign-import.json`. That file is the group's real campaign (player names, progress) and stays OUTSIDE the repo: do not commit it. Imported: difficulty, inspiration, average level, reputation per faction, prosperity checkmarks, imbuement ticks (raw `row:col`), campaign stickers (labels), unlocked classes, enhancements, retirements, scenario state from the Flow tab (status, level, party size, chests, date), items (`unl`, `taken`), city and road event piles, battle goals drawn, treasures claimed, med packs.

Checked against the sheet on 2026-11-08: 9 completed, 12 unlocked, 80 locked scenarios (matches the Flow header), prosperity 10, reputation Demons 2 / Merchants 0 / City Guard 8, 11 classes unlocked, 8 city and 6 road events out.

Stage 2 (characters, same day): the four character sheets (found by `Class:` in R2C17) go into `chars` with class, name, level, XP, gold, inherited, the three traits, the personal modifier deck as raw face labels, ability cards (selected deck rows 12 to 31, other owned cards rows 32 to 41, each mapped to the static card ids; discard/active/lost from the ticks in columns 7/9/11) and items (mapped to static item ids, tick states raw as `st`). Verified: every card and item matched a static id; the unticked modifier faces equal the sheet's card count for all four characters (a tick means the card is out of the deck).

Not done: the event vote in progress (`events.pend`), imbuement and sticker mapping to static ids, event bottom/top piles (no ticks in the sheet yet), which seat each character belongs to, what the three item tick columns mean (6/7/9), mapping the free-text modifier faces (`+2 strengthen ally'`, `+0,w/i)`, some with stray quotes) to the app's card keys, each character's personal quest and battle goal (cells at column 65 of the sheets), and the per-character enhancement log.
