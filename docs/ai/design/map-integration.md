# Design: the map in the campaign app, shared state, short forum posts

Status: proposed 2026-11-17, not built. Depends on the hosting decision (`roadmap.md` item 22). Builds on `server-and-commit.md`: once built, the session layer moves from the URL hash to the server, and the rest of that design (tokens, commit rules) stays.

## Goal

- The map is used inside the campaign app (a Map tab), and still works on its own.
- The map state of a scenario is stored with the campaign, one version per turn. No forum URL carries the state.
- A forum post holds only the turn: what the character or the monsters did, the GeekRoller rolls, and "map updated, turn N".

## Today

- Map: the whole state is one JSON object, compressed into the URL hash (`#lz:`, `scripts/state.js`). Every change rewrites the hash. A player posts the URL; the next player opens it. The forum thread is the shared store and the history.
- Campaign: the record is in the browser of each user (localStorage, `store.js`). There is no shared copy.
- Without the URL, the four players have no common place for the map. A shared store is the first requirement.

## Target flow of a turn

1. A player opens the Map tab. The app loads the latest turn of the running session.
2. The player moves, attacks, draws modifiers. Undo works locally, as today.
3. "Publish turn" saves the new state as turn N+1 on the server.
4. The player rolls on BGG (GeekRoller codes from the app) and posts: the turn summary, the rolls, "map updated, turn N+1".
5. The next player sees turn N+1 when opening the tab (or after a refresh).

## Shared storage: options

| Option | For | Against |
|---|---|---|
| A. Own small server: Cloudflare Worker with KV or D1 (recommended) | Already designed (`server-and-commit.md`). No SDK in the page, plain `fetch`. Free tier is enough for four players (limits to check before deciding). Full control of history and tokens. | Code to write and run: API, tokens, backups. |
| B. Hosted database (Supabase, Firebase) | Less server code, live updates built in. | Outside account, an SDK in the page (against the no-dependencies rule), data model follows the vendor. |
| C. GitHub repository as storage (one JSON file per turn, written by the API) | History and backups for free. | Slow (seconds per write), personal access tokens per player, rate limits, fragile for concurrent writes. |

Recommendation: A. The rest of this document assumes it.

## Data on the server

```
campaign  /c/:cid                      the campaign record (campaign-record.md), with ver
session   /c/:cid/s/:sid               { sid, scn, lvl, started, base, turn, status: 'running' | 'finished' | 'committed' }
turn      /c/:cid/s/:sid/t/:n          { n, t, seat, state, note }   state = the map JSON (mapVersion 5), as in the URL today
```

- Turns are append-only. A correction is a new turn, never an edit of an old one. This replaces the forum as the record that nobody can change.
- One key per turn. A map state is a few KB; a scenario has some hundred turns at most.
- `note`: one optional line ("Simon: Crank Bow, attack 3 on Bandit 2"), shown in the turn list.

## Server API (additions to `server-and-commit.md`)

```
POST /c/:cid/session                  start a scenario; returns { sid, turn: 0, state }
GET  /c/:cid/s/:sid                   session header with the latest turn number
GET  /c/:cid/s/:sid/t/:n              one turn (n = 'latest' allowed)
GET  /c/:cid/s/:sid/t?from=&to=       turn list without state (number, time, seat, note)
POST /c/:cid/s/:sid/t                 body { base: n, state, note }; 409 when n is not the latest turn
POST /c/:cid/commit                   unchanged: end of the scenario, merge into the campaign
```

- Concurrency: optimistic. A publish names the turn it started from (`base`). If someone published in between, the server answers 409; the app loads the newer turn, shows what changed, and the player redoes the move. Turn order makes this rare.
- Updates: no live connection. The tab checks the latest turn number when it gets focus and every 30 to 60 seconds while open (a small `GET`, cached with ETag).

## The map inside the app

Stage 1: iframe (no merge of code).

- The Map tab shows `../index.html?embed=1` in an iframe. The map keeps its own CSS, scripts, shortcuts and state.
- `scripts/state.js` gets a persistence hook. Standalone (default): the URL hash, unchanged. Embedded: no hash; the state goes to the parent page.
- Messages (`postMessage`, same origin checked on both sides):

| From | Message | Meaning |
|---|---|---|
| map | `{ type: 'hm:ready' }` | loaded, waiting for a state |
| app | `{ type: 'hm:load', state, turn, readOnly }` | show this turn (readOnly for older turns) |
| map | `{ type: 'hm:changed', state }` | the state changed (after each `patch`) |
| app | `{ type: 'hm:published', turn }` | the turn was saved; the map clears its undo stack |

- The tab around the iframe: session and turn number, Publish turn (with the note line), a turn list to view older turns read-only, Copy turn post. On a phone the iframe takes the whole screen below the header.
- The map's changes for this are small and can wait until the map is free: the hook in `state.js`, the message listener, hiding the share-URL controls in embed mode.

Stage 2 (optional, later): merge the map's modules into the campaign page as a real tab. Only if the iframe gets in the way (sizes, shared shortcuts, one undo for both). Needs scoped CSS and one keyboard handler.

## Forum posts

- Turn post (character): class banner, the two cards played, the actions in text, the GeekRoller rolls, "Map: turn N". Built by the app from the session state and the playmat (extends `turnPost`).
- Monster post: the monster ability card, the actions, the rolls, "Map: turn N".
- No state and no token in a post. Old posts with `#lz:` links stay readable by the standalone map.

## Compatibility

- The standalone map stays as it is: same address, URL hash, all old links open.
- The Map tab can import a `#lz:` link as turn 0 of a new session (to move a running scenario over).
- Admin export: one JSON file with the campaign record and all sessions and turns (backup and leaving the host).

## Security

- Tokens and roles as in `server-and-commit.md` (admin, player per seat, read-only). Tokens never appear in posts.
- Publishing a turn needs a player or admin token. Who publishes monster turns is an owner decision (see below).
- The server checks the map JSON on publish: it parses, `mapVersion` is known, size limit.

## Phases (each one usable on its own)

1. Hosting decision (owner).
2. Server with the shared campaign record (roadmap items 22, 23). The campaign page reads and writes it through `store.js`; the file import and export stay.
3. Sessions and turns API; persistence hook and messages in the map (needs the map free of play).
4. Map tab: iframe, publish, turn list, read-only view of old turns.
5. Short posts: turn and monster post composer.
6. Commit at the end of a scenario from the session (roadmap item 26).
7. Optional: merge the map's code into the campaign page.

## Open questions (owner)

1. Hosting: Cloudflare (recommended), another host, or one of options B and C.
2. May anyone view the map turns without a token (a read-only link for readers of the thread)?
3. Who publishes monster turns: any player, the admin, or a fixed seat?
4. Keep a `#lz:` link in the posts as a fallback for the first scenario after the switch?
5. Polling interval while the tab is open (30 or 60 seconds).
