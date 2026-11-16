# Decisions

Dated, newest first within each group. "Owner" marks decisions the owner made. Check here before proposing a design that may already be settled. A decision is changed only by a new entry, not by editing an old one.

## Architecture and data

- 2026-11-14: `campaign/playmat.css` is hand-maintained. The generator stays as a reference and refuses to run without `--force`, because the mockup and the live page disagree.
- 2026-11-13: Playmat card markers are stored per card and item in `chars[].mk`, keyed `c:<card id>` or `i:<item id>`.
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

- 2026-11-13: All 649 GH2 ability cards have an initiative value (from card images).
- 2026-11-12: Four Frosthaven classes named only by icon in the Secretariat data are matched as drill = Metal Mosaic, kelp = Deepwraith, prism = H.I.V.E. Owner confirmed.
- 2026-11-12: Metal Mosaic pressure runs 0 to 3. Owner confirmed.
- 2026-11-10: Hollowpact removed from the mercenary list. Shattersong added (id 44). "Snow Dancer" is `Snowdancer`. Plague Herald is `Plagueherald`.
- 2026-11-09: Item 116 is excluded from prosperity level 1. Owner.
- 2026-11-08: Items 169 and 170 slots were swapped in the workbook and are corrected in the generator.
- 2026-11-08: Prosperity level thresholds come from the sheet (`PROSPERITY_START`). Imbuement +1P box pattern (every 5th box) is unverified against the Secretariat.
- 2026-11-08: Scenario level uses the Gloomhaven rule (half average level rounded up plus difficulty). Unverified for GH2.
- 2026-11-08: Silent Knife uses the Gloomhaven 1st edition Scoundrel card back as a stand-in (no GH2e back exists in any repo).

## Process

- Commit and push only when asked. Work on `main` (the owner asked for direct commits to `main` for campaign work).
- Co-author line on commits: unresolved. Earlier repo rule (2026-11-07) added a `Co-Authored-By` line; the global `~/.claude/CLAUDE.md` says never add the assistant as co-author. Until the owner decides, follow the global CLAUDE.md (no line). Commits from 2026-11-10 (`01a5263` onward) have no line.
- Destructive or high blast-radius actions need confirmation (global CLAUDE.md). Reorganising docs was done by moving files into `docs/archive/`, not by deleting them.
- Never hand-edit generated files or changelogs. Fix the generator.
