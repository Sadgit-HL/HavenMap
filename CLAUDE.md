# HavenMap

Browser helper for a Gloomhaven 2e / Frosthaven play-by-forum campaign (four players): a hex map with monsters, heroes and attack modifier decks, plus a campaign page (`campaign/`) that tracks the whole campaign.

Before any change, read `docs/ai/README.md`, then `docs/ai/status.md` and `docs/ai/decisions.md`. Then the area file you need (`architecture.md`, `campaign-record.md`, `playmat.md`, `hero-decks.md`, `data-pipeline.md`). UI work follows `docs/ai/ui-guidelines.md`.

## Running and checking

- Serve over HTTP, never `file://`. Use `start.bat` in the parent folder (`http://localhost:8080/HavenMap/`) or `python -m http.server` in the parent folder.
- Syntax check: `node --check <file.js>`. Perk icons: `node tools/check-perk-icons.mjs`.
- Node checks: `node tools/tests/run.mjs [filter]` (165 checks for items, hand grid, record, history, events, flow, sync merge, outcomes, modifier decks, monsters; no dependencies). Browser checks used Playwright (global install).
- Cache busting is by hand (`?v=` strings). Bump them when a file changes, and tell the owner to hard refresh (Ctrl+F5).

## Rules

- Vanilla ES modules, no build step, no npm dependencies. Keep it that way.
- Never hand-edit generated files (marked GENERATED, for example `scripts/games/gh2_*.js`, `perks.js`, `bggIcons.js`). Fix the generator in `tools/` and regenerate. See `docs/ai/data-pipeline.md`.
- `campaign/playmat.css` is hand-maintained. Do not run `tools/build-playmat-css.py`.
- Campaign changes go through `scripts/campaign/edit.js` and `commit()`, so Undo and History work.
- Commit and push only when asked. Work on `main` unless told otherwise.
- Confirm before deleting, overwriting, force-pushing or any change with a wide effect.
- No co-author line on commits (global CLAUDE.md). The owner has not confirmed a repo-level rule.
- No emoji and no em dashes in code, docs or UI text. No help text, tips or tutorial lines in pages or modals.
- Be terse. Make small steps and show the result.

## Outside the repo (do not commit, do not delete)

- `../asset-backups/` (workbook, upstream clones, PSD exports), `../campaign_assets/` (Photoshop template).
- Card art is read at runtime from `Sadgit-HL/Wordhaven_Assets`, not stored here.
