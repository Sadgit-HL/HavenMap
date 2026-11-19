# HavenMap: notes for AI sessions

Start here. Read in this order, then only the file for the area you touch.

1. `status.md`: what is built, what is partial, what is not started (verified against the code on 2026-11-16).
2. `roadmap.md`: open work in priority order, with blockers.
3. `decisions.md`: dated decisions. Check it before proposing a design that may already be settled.
4. Area files:

| File | Covers |
|---|---|
| `architecture.md` | repo layout, map app and campaign page structure, state and edit/commit flow, storage |
| `campaign-record.md` | the campaign record: fields, derived values, spoiler rules |
| `playmat.md` | the Mercenaries tab (playmat), phone view, requirements, open items |
| `hero-decks.md` | map app hero attack modifier decks, perks, GeekRoller codes |
| `ui-guidelines.md` | visual and interaction rules for every campaign tab. Follow it for any UI change |
| `data-pipeline.md` | generated files, their generators and sources, regeneration rules, licences |
| `design/server-and-commit.md` | designed, not built: server, tokens, session start and commit, BBCode |
| `design/map-integration.md` | proposed, not built: the map as a campaign tab, map state per turn on the server, short forum posts |
| `../../server/README.md` | the deployed API: Cloudflare Worker, KV, Netlify relay, `api.penultimate.de`, how to update |
| `reference/` | stable lookup tables: GeekRoller codes, class tokens, face catalog, workbook element inventory |
| `../archive/` | superseded docs kept for history (old handover log, first drafts, old mockup notes) |

## Project in brief

- HavenMap: browser helper for a Gloomhaven 2e / Frosthaven play-by-forum campaign with four players. Hex map with monsters, heroes and attack modifier decks, plus a campaign page (`campaign/`) that tracks the whole campaign.
- Vanilla ES modules, no build step, no npm dependencies. Campaign state lives in the browser (localStorage). A server is deployed (`server/README.md`, `https://api.penultimate.de/`) but the page does not use it yet.
- Repo: `C:\Users\hansen\ai\games\HavenMap\HavenMap` (branch `main`, remote `Sadgit-HL/HavenMap`). Work in the parent folder `C:\Users\hansen\ai\games\HavenMap` is outside git.

## Run and check

- Serve over HTTP, never `file://` (ES modules fail silently). Either `start.bat` one folder above the repo (serves `http://localhost:8080/HavenMap/`), or `python -m http.server 8099` in the parent folder.
- Map: `/HavenMap/`. Campaign page: `/HavenMap/campaign/`. Mockups: `/HavenMap/campaign/mockups/`.
- Syntax check: `node --check <file.js>`. Perk icon check: `node tools/check-perk-icons.mjs`.
- Node checks: `node tools/tests/run.mjs [filter]` (`tools/tests/*.test.mjs`, no dependencies; each file exports `tests`). Browser checks used Playwright (installed globally at `C:/Users/hansen/AppData/Roaming/npm/node_modules/playwright`, Edge or Chrome channel). Throwaway scripts were not kept.
- Cache busting is by hand: `?v=` strings in `index.html` files and in some imports. Bump them when a file changes. Tell the owner to hard refresh (Ctrl+F5).

## Files outside the repo (do not commit, do not delete)

- `C:\Users\hansen\ai\games\HavenMap\asset-backups\` (WHTracker.xlsx, the FrosthavenAssistant and Secretariat clones, PSD exports, backups).
- `C:\Users\hansen\ai\games\HavenMap\campaign_assets\` (Photoshop template, 233 MB).
- External: `Sadgit-HL/Wordhaven_Assets` (card art, read at runtime via raw.githubusercontent.com), local clone `D:\github\Wordhaven_Assets`. Secretariat clone `D:\github\gloomhavensecretariat`.

## Working rules (from the owner, details in `decisions.md`)

- Terse, direct, no emoji, no em dashes. No help text, tips or tutorial lines in pages or modals.
- Commit and push only when asked. Develop on `main` unless told otherwise.
- Confirm before deleting, overwriting, force-pushing or closing anything with a wide effect.
- Never hand-edit generated files (`scripts/games/*` marked GENERATED, `perks.js`, `bggIcons.js`). Fix the generator in `tools/` and regenerate. See `data-pipeline.md`.
- Do not add a co-author line to commits (global CLAUDE.md). The repo-level rule is still unconfirmed by the owner.
- Make small steps, show the result, and ask before any large or ambiguous change.
