# Design: campaign server, session start and commit, BBCode

Status: designed, not built. Blocked on the hosting decision (`roadmap.md` items 22 to 29). The record shape that a server would store is `campaign-record.md`; the older draft record in `archive/campaign-schema-draft.md` is superseded.

## Layers

| Layer | Lives in | Secret | Changes |
|---|---|---|---|
| Session (scenario in progress) | URL hash `#lz:`, posted per turn | no | every turn |
| Campaign (persistent) | server record (today: browser localStorage) | yes, token | between scenarios, and at commit |
| Static tables | repo, generated | no | per release |

- The session URL workflow stays as it is. A standalone map (no `campaign` key) loads unchanged.
- The server is needed only to start and end a scenario, and for edits between scenarios. Play itself works from the URL.
- Cards, items and scenarios are referenced by numeric id. Slug names exist only in the static tables.

## Session block (URL state, implemented as `campaign` in `scripts/state.js`)

```
campaign: { cid, sid, scn, base, res?, ach?, unl? }
```

- `cid`: campaign id (public). `sid`: session id, makes commit idempotent. `scn`: scenario number. `base`: campaign version the session started from. `res`: result, only when finished. `ach`, `unl`: stickers and scenario unlocks gained, pending.
- Per hero: `mercenaries[i].cmp = { c: '<char id>' }`. Position, level, hp, xp, gold and conditions stay on the existing mercenary fields.
- Ability card piles, items and goals stay on the campaign side. The session does not carry them.
- The commit must reject a hero whose class does not match the campaign character.

## Tokens and roles

- Roles: admin, player (one per seat, four seats), read-only.
- Tokens: 128-bit random, hashes stored on the server. Carried in the URL fragment, moved to localStorage, sent as a header.
- Tokens are never posted in the public thread. Turn posts carry only the session URL (no token).

## Server API (sketch)

```
GET  /c/:cid                 returns the campaign record (token in header)
PUT  /c/:cid                 body { base: ver, patch }; 409 if ver is stale
POST /c/:cid/session         start a scenario; returns session state for the URL
POST /c/:cid/commit          body { session }; validates, merges, bumps ver
GET  /c/:cid/history         admin; snapshots
POST /c/:cid/tokens          admin; create, rotate, revoke
```

Storage: Cloudflare Worker with KV was the proposal (Pages cannot host a server). Keep it behind the same interface as `scripts/campaign/store.js` (`load`, `save`, `clear`, `importFile`, `exportBlob`), so the page code does not change.

## Commit rules

On commit of a finished session:

1. `cid` matches the token's campaign and `sid` has not been committed before (idempotent).
2. `base` is compared with `ver`. A stale base gives a warning, not a silent overwrite. Preview the merge before applying.
3. Merge: hero `xp` and `gold` added; new items added; `ach` to stickers; `unl` to scenario status; `res` to the scenario record (level, party size, date).
4. Piles reset. Permanent modifier deck changes carry over only when flagged.
5. Level-ups, enhancements and card choice are separate campaign edits. Never inferred from the session.
6. Ids are validated against the static tables.
7. A battle goal success adds its checkmarks to the character and the goal to `decks.bg`.

Undo: the page's undo applies to campaign edits. A commit should be undoable by a second, reverse commit or a history snapshot (decide).

## Voting (events)

Today: votes are local per deck (`pend`, `setVote`, `closeVote`, `rollTie`, `finishEvent`), with one open event per deck and seat pills. Visible to everyone.

Design for the server: `pend` holds `{ kind, id, votes: { seat: option }, res }`. A player token writes only its own seat. Resolve when all four have voted and the result is not tied; ties go to an admin choice or a stored random draw. A finished vote is appended to `evlog`.

Open: whether votes move to the server during a scenario (per-seat tokens) or stay in the page.

## BBCode posts

Today: the playmat builds Turn and Cards for the next round posts client-side (`turnPost`, `cardsPost` in `campaign/playmat.js`), plus icon and banner codes. The Outpost Phase template is Frosthaven material and out of scope.

Design: a post composer in the map app, client side, from the session state. Needs no token.
- Turn post: class banner, map link (current share URL), cards for the next round from the hero's piles, free text.
- Aftermath post (when `res` is set): battle goal result, XP and gold gained, loot and items found.
- Templates are static strings with placeholders, held in the repo.
- Icons need a table from icon to BGG `imageid` (exists for the playmat: `bggIcons.js`).

Open: keep the composer in the playmat (where the posts already are) or move it to the map app as designed. Owner decision.

## Phasing

1. Choose the backend and hosting (owner).
2. Server with the storage interface, token auth, read-only campaign view served from the server.
3. Session start from the campaign page (scenario level, one hero per character, fresh `sid`, open the map with the `campaign` block).
4. Map side: result panel (battle goals, items found, level, party size).
5. Commit from the campaign page with preview, idempotence and version check.
6. BBCode aftermath post after commit.
7. Tests for commit merging (Node) before wiring the UI.
