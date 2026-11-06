# Handover: HavenMap campaign tracking (branch `feature/hero-amd`)

Written 2026-11-06. Read this first, then `campaign-schema.md` and `hero-modifier-faces.md` in this folder.

Items marked (unverified) were inferred and not confirmed.

## 1. Goal

Extend HavenMap (browser map helper for the group's play-by-forum Gloomhaven 2e campaign, 4 players) to track the full campaign: characters and modifier decks, ability card piles, items, scenarios, events with voting, and BGG post generation. Nothing in the running app has been changed.

## 2. Decisions made

- **Session stays in the URL hash** (`#lz:`), as today. The URL posted per turn is an immutable snapshot and the forum thread is the history.
- **Campaign data lives on a token-protected server** (small backend, e.g. a Cloudflare Worker with KV): 128-bit tokens in the URL fragment, hashes stored, roles admin, 4 players, read-only. Tokens must never be posted in the public thread.
- **Commit step:** a finished session URL is committed to the campaign with a token, idempotent via a session ID, with a version check. Level-ups, enhancements and card selection are separate campaign edits.
- **Per-hero modifier deck is a standalone feature** stored on the mercenary entry as `am`, built before any campaign work. Phase 1 is manual composition editing. There is no perk table (the group's sheet has none).
- **Votes** on event cards are in scope, visible to everyone, cast in the campaign view with a player token.
- **BBCode post generation** is in scope and belongs in the map app (client side, from the session). The Outpost Phase template is Frosthaven material and out of scope.
- **Card art:** layered build from the PSD template (frame, sphere, number, icons), with Frosthaven Assistant images as an alternative source. Images may be used for this non-profit app (per the owner).
- Retirements are entered manually.

Full detail: `campaign-schema.md` (session schema, campaign record, API sketch, commit rules, phasing) and `hero-modifier-faces.md` (face record, catalog, deck compositions).

## 3. Repo and environment state

- Repo: `C:\Users\hansen\ai\games\HavenMap\HavenMap` on `main`, remote `origin` = `Sadgit-HL/HavenMap`, GitHub Pages site `https://sadgit-hl.github.io/HavenMap/` (presumably deploys from `main`, unverified). Untouched.
- Work happens in a separate git worktree: `C:\Users\hansen\ai\games\HavenMap\HavenMap-campaign`, branch `feature/hero-amd`.
- `start.bat` (in `...\HavenMap`) serves the main folder on port 8080. To test this branch, run `py -m http.server 8081` inside the worktree.
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

The existing `gh-am-*.webp` files are untouched. Skipped on purpose: four empty first-pass exports (Empower/Enfeeble icons, redone in the second pass) and one pixel-identical duplicate (`brittle-2`).

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
- The imbuement face art in `images/common/attack_mods/gh-am-i-*.webp` was made in an earlier session (Nov 4). Its scratchpad (scripts, demon discs) may still exist at `C:\Users\hansen\AppData\Local\Temp\claude\56dd7208bf07e1b8\17407d27-507e-4d66-98ec-46f032128a11\scratchpad\imbue\`, but it is temporary storage.
- The per-hero deck refactor target: `scripts/attackMods.js` keys everything by a group string `g` (`'m'` or `'a'`) mapped by `field(g)` to `state.am` or `state.amA`; the AM panel in `scripts/decks.js` repeats `data-am-g` on every control; `decks.js:123` hardcodes the end-of-round patch for the two groups. The plan: replace the string with a deck descriptor `{key, read(), write(), catalog, defaultBase}` and build the tabs dynamically (Monsters, Allies, one per hero). The mercenary entry survival of an `am` field across drag, removal and load is unverified and is the first thing to check.

## 7. Next steps, in order

1. Run pass 3 of the Photoshop script, then verify the files (alpha, no FAILED lines in `manifest-pass3.txt`), run `tools/convert-psd-export.py`, and rebuild the comparison page.
2. Resolve the open face questions (section 8) and finalise the face data (`hero-modifier-faces.md`) as a data file in `scripts/games/`.
3. Implement the per-hero modifier deck (descriptor refactor of `attackMods.js` and `decks.js`) in this worktree, with the standalone manual editing first.
4. Build the static ID tables, then the campaign server and token auth, then session start and commit, then events, items and flow views.
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
- Never add an AI co-author to git commits. Never hand-edit generated files or changelogs.
- Keep the running app untouched until the branch is ready: develop on `feature/hero-amd` only.

## 10. Not committed (local only)

- `docs/face-compare/` (side-by-side HTML, contains copies of Frosthaven Assistant images with an unchecked licence).
- The workbook, the PSD and the raw exports (in `campaign_assets`).

## 11. Update 2026-11-07: perks listing page (separate from sections 1-10 above)

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
