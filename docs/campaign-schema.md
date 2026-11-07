# HavenMap campaign tracking: schema draft

Status: draft, not implemented. Branch `feature/hero-amd`. Based on the current map state format (`mapVersion` 4.0.0), a measured late-game map URL, and the group's WHTracker.xlsx.

Items marked (unverified) are inferred and need confirming before they are built.

## 1. Architecture

Three layers:

| Layer | Lives in | Secret | Changes |
|---|---|---|---|
| Session (scenario in progress) | URL hash `#lz:`, posted per turn | no | every turn |
| Campaign (persistent) | server record, one per campaign | yes, token | between scenarios, plus commit |
| Static tables (cards, items, scenarios) | repo, generated | no | per release |

- The session URL workflow stays exactly as today. A standalone map (no `campaign` key) loads unchanged.
- The campaign server is only needed to start and end a scenario, and for between-scenario edits.
- Cards, items and scenarios are referenced by numeric ID. Slug names (as used in the spreadsheet) exist only in the static tables.

## 2. Session schema (URL, `mapVersion` 5.0.0)

Additive. Existing keys are unchanged: `tiles`, `overlays`, `monsters`, `summons`, `am`, `amA`, `decks`, `elements`, `questObjectives`, `CurrentLevel`.

### 2.1 Session level (optional)

```
campaign: {
  cid:  "k7Qx2m",     // campaign ID, public, not secret
  sid:  "s0412",      // session ID, makes commit idempotent
  scn:  17,           // scenario number
  base: 42,           // campaign version this session started from
  res:  "win"|"loss", // set only when finished
  ach:  [..],         // campaign stickers gained, pending
  unl:  [..]          // scenarios unlocked, pending
}
```

### 2.2 Per hero (on the existing `mercenaries[i]` entry)

Existing fields stay the single source for position, `level`, `hp`, `maxhp`, `xp`, `gold`, `conditions`. They are not duplicated.

```
mercenaries[i].am = { deck:{faceKey:n}, discard:{faceKey:n}, base:{faceKey:n} }
    // personal modifier deck, same shape as the monster `am`.
    // Works in standalone mode. Absent = standard 20 cards.

mercenaries[i].cmp = {
  c:    "c1",              // campaign character ID
  deck: [3,7,12,15,21],    // selected ability cards (card IDs), fixed at start
  disc: [1,4],             // discard pile
  lost: [9],               // lost pile
  act:  [],                // active cards, omit if empty
  it:   [449, 453],        // items as packed ints: itemId*4 + state
                           //   0 ready, 1 spent, 2 consumed, 3 lost
  new:  [112],             // items found this scenario, pending
  bg:   14,                // battle goal kept this scenario (goal ID), optional
  bgr:  1                  // battle goal result: 1 success, 0 failed, absent = open
}
```

At commit a successful `bgr` adds the goal's checkmark value to `chars[].chk` and the goal to `decks.bg`.

Rules:
1. Hand is derived: `deck` minus `disc`, `lost`, `act`. Not stored.
2. Omit defaults: empty piles, standard modifier deck, all-ready items.
3. `cmp.c` must match the hero class on commit, else the commit is rejected.
4. Per-hero modifier deck faces come from a per-deck catalog (standard cards plus class extras), not the global `AM_TYPES` constant.

## 3. Modifier deck face catalog

The spreadsheet stores free-text faces such as `+1 wild`, `+0 heal1`, `+2 strengthen ally`, plus Bless and Curse. In the app:

- Each face has a numeric key in a static table, generated from the Card DB attack-modifier rows (image, display text, roller text, `shuffle` flag).
- A hero deck state is counts per face key. The roller code is built from the face text, as the sheet does.
- Base composition is edited manually (existing edit mode). No perk table: the sheet has none and records the deck directly.

## 4. Campaign record (server)

One JSON document per campaign. Integer fields and ID lists. Bitsets as sorted ID arrays unless dense.

```
{
  v:       1,            // schema version, migrated like mapVersion
  ver:     42,           // revision counter, optimistic locking
  name:    "...",
  players: [ { seat:0, name:"Guido" }, ... ],   // 4 seats, token hashes stored separately

  party: { diff: 2, insp: 0 },                  // difficulty, inspiration
  rep:   { demons: n, merchants: n, guard: n }, // reputation per faction
  pros:  n,                                     // prosperity checkmarks (level derived)
  imb:   [ ... ],                               // imbuement boxes ticked
  stk:   [ ... ],                               // campaign sticker IDs
  cls:   [ ... ],                               // unlocked class IDs

  scn: {                                        // sparse, by scenario number
    "1":  { s:2, l:1, p:4, ch:[17,49], d:"2026-06-04" },
    "17": { s:1 }
  },
  // s: 0 locked, 1 unlocked, 2 completed, 3 locked out
  // l: scenario level, p: party size, ch: chest numbers opened, d: date

  chars: [ {
    id:"c1", seat:0, cls:"tinkerer", name:"Simon",
    lv:5, xp:264, gold:42, inh:0, chk:0,        // chk = battle goal checkmarks
    traits:[..3],                               // trait IDs
    cards:   [..],                              // owned ability card IDs
    deck:    [..],                              // currently selected deck
    am:      { base:{faceKey:n} },              // permanent modifier composition
    enh:     [ [cardId, slot, price], ... ],    // enhancements
    items:   [ itemId, ... ],                   // owned items
    pq:      { id:n, prog:n }                   // personal quest, optional
  } ],

  items: {                                      // supply
    unl:  [ ... ],                              // unlocked item IDs
    taken:{ "63":1 }                            // copies in use, sparse
  },

  events: {
    city: { out:[..], bottom:[..], top:[..] },  // top is ordered, top card first
    road: { out:[..], bottom:[..], top:[..] },
    pend: { kind:"city", id:12, votes:{ "0":1, "1":2 } }   // open event, see 4a
  },
  evlog: [ { kind:"city", id:12, opt:1, votes:[1,2,1,1], place:"out" } ],

  decks: {
    bg:  [ ... ],                               // battle goals drawn
    tre: [ ... ],                               // treasure index entries claimed
    mp:  [ ... ]                                // med packs drawn
  },

  retired: [ { cls, seat, name, lv, perks, masteries, note } ]   // entered manually on retirement
}
```

Notes:
- Event cards need three states (out, bottom, top), not just removed. Bottom and top keep order, since the sheet tracks where cards were put back.
- Enhancement log by class is a view over `chars[].enh` plus `retired`, not a separate store (to be confirmed against how the sheet's class log is used).
- Derived values are not stored: prosperity level, average level, days played, scenario counts.

## 5. Static tables

Generated from the Card DB (about 5,900 rows in the workbook), then committed as `scripts/games/gh2_*.js`:

- Ability cards: numeric ID, class, slug, image path.
- Attack modifier faces.
- Items: ID, slot, copies (the sheet shows availability as x/y), image.
- Scenarios and the flow graph (unlock links).
- Events, battle goals, personal quests, treasure index.

Images may be reused for this non-profit app (per project owner). Licence of the text data is still open (section 9).

## 6. Server API (sketch)

```
GET  /c/:cid               token in Authorization header; returns campaign
PUT  /c/:cid               body { base: ver, patch }; 409 if ver is stale
POST /c/:cid/session       start scenario; returns session state to encode as URL
POST /c/:cid/commit        body { session }; validates, merges, bumps ver
GET  /c/:cid/history       admin; snapshots
POST /c/:cid/tokens        admin; create, rotate, revoke
```

Tokens: 128-bit random, hashes stored, roles admin, player (4), read-only. Carried in the URL fragment, moved to localStorage, sent as a header. Never posted in the public thread.

## 7. Commit rules

On commit of a finished session:
1. `cid` matches the token's campaign and `sid` has not been committed before.
2. `base` is compared to `ver`. A stale base gives a warning, not a silent overwrite.
3. Merge: hero `xp` and `gold` added, `new` items added, `ach` to stickers, `unl` to scenario status, `res` to scenario record with level, party size and date.
4. Piles reset. `cmp.deck` and the modifier composition changes carry over only if flagged permanent.
5. Level-ups, enhancements and card selection are separate campaign edits, never inferred from the session.
6. IDs are validated against the static tables.

## 8. Size

Measured on one late-game map URL: 2030 chars total, 4111 chars raw JSON, of which overlays are 2380. Adding four `cmp` blocks is estimated at 0.3 to 0.5 KB raw (estimate, not measured). Cheap saving available: omit default overlay keys (`locked:false`, `angle:0`, `objective:false`), unverified whether the code relies on them.

## 9. Decisions and open questions

Resolved:
- Ability card checkbox columns H, J, L on the sheet are discard, active, lost. Hand is everything else in the selected deck. This matches `disc`, `act`, `lost` in section 2.2.
- Retirements are entered manually in the campaign view when a character retires. `retired` is a free-form list, no automation.
- Voting is in scope for event cards (section 4a).
- Card images may be used, as this is a non-profit app (per project owner). Crediting the source is advisable.

- Battle goal checkbox means drawn. Treasure checkbox means claimed. `decks.bg` = drawn goals, `decks.tre` = claimed treasures.
- Votes are visible to everyone immediately (as in the sheet).
- BBCode post generation is in scope, proposed as a map feature (section 11).

Open:
- Licence of the Card DB text data (images are settled above).
- Whether `chk` (battle goal checkmarks per character) matches how the group counts them (section 11).

## 4a. Event voting

Voting happens in the campaign view with a player token, since it needs identity per seat. It is not part of the session URL.

```
events.pend = {
  kind:  "city"|"road",
  id:    12,                     // event card number
  votes: { "0":1, "1":2, "2":1, "3":null },   // seat -> option number, null = not voted
  res:   null                    // set when resolved: { opt:1, place:"out"|"bottom"|"top" }
}
```

Flow:
1. Admin or any player opens an event (draws the top card, or enters the number).
2. Each seat sets only its own vote. A player token can write its own seat only.
3. Resolve (admin, or automatic once all four voted and not tied): sets `res`, moves the card to `out`, `bottom` or `top`, clears `pend`.
4. Ties are resolved by the admin choosing the option.
5. A finished vote is appended to a short `evlog` (card, option, votes) so the thread can reference it.

## 11. BBCode post generation (map app)

The sheet generates BGG posts from templates per character: a class banner image, "End of Turn" with the map link, "Cards for the next round", and an aftermath block (battle goal result, XP, gold). The sheet also has an Outpost Phase template, which is Frosthaven material and out of scope here.

Proposal: extend the map's existing "BGG Code" button into a post composer.

- It runs in the map app, client side, from the session state alone. No token needed, so it works in standalone and campaign mode.
- Turn post: banner for the hero's class, the map link (current share URL), and "Cards for the next round" from the hero's `cmp` piles (the cards the player will have available), with a free-text line for the player.
- Aftermath post (when `res` is set): battle goal and result, XP and gold gained, loot, items found, from `cmp` and the mercenary entry.
- Banner images: class banners already exist in the group's own asset repo (`wh_banners/<class>.jpg`). Icon images in the sheet use BGG `imageid` references, which are tied to BGG uploads and need a mapping table of icon to imageid.
- Templates are static strings with placeholders, held in the repo, not in state or URL.

Why the map and not the campaign view: the session already holds the cards, XP, gold and the URL, so the post can be built without the server, and the campaign view stays for persistent edits.

## 10. Phasing

1. Per-hero modifier deck: descriptor refactor of `attackMods.js` and the AM panel in `decks.js`, standalone, no campaign needed.
2. Static tables from the Card DB.
3. Campaign record and server, token auth, read-only campaign view.
4. Session start and commit.
5. Events, items, scenario flow views.
