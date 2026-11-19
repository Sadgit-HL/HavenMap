# Roadmap

Open work in priority order. Items marked (owner) need a decision or data from the owner before code. Items marked (verify) may already be done; check the code first.

## 1. Stabilise what exists

1. Done 2026-11-19 (see `ui-guidelines.md` section 8; open: modifier cards are tiny at 911x512). Browser-test the 2026-11-14 layout changes at the sizes in `ui-guidelines.md` section 9. Scope: top bar on one line, modifier and modal card sizes, tile modals close (Escape, overlay, footer), Stickers toggle.
2. Done 2026-11-19: `tools/tests/` holds 120 Node checks (edit functions, record, history, events, outcomes, modifier decks, monsters, flow, sync merge and invite links); run `node tools/tests/run.mjs`. The merge tests found that two players adding a character at the same time got the same id; fixed (new ids are `c` plus six random characters, `nextCharId` in `edit.js`; old records keep `c1`, `c2`). No checks for the DOM code.

- Rename to HavenTracker, map side (when the map is free): `index.html` title and heading. Repository rename only together with the move away from URL links (`design/map-integration.md`). See `decisions.md` 2026-11-17.

## 2. Playmat and phone gaps

4. Done 2026-11-19 (owner, on a real phone, ok). Phone: check the touch layout (2026-11-17) on a real phone, upright and sideways: page sheet, bottom sheets, long press preview, hold and move of modifier cards. Tested only with Playwright touch emulation.
4a. Done 2026-11-19 (owner, on a phone, ok). Touch drag with the new ghost card (2026-11-18, `374f2f8`): hold and move of ability and modifier cards on a tablet and a phone. Mouse drag was tested in Playwright; touch was not re-tested after the change.
5. Touch: check the long-press context menu of the playmat on a real touch device (tablet).
6. Hand fan and active zone: size from `--cu` instead of their own containers.
7. Settings: explain or relabel "Reduce motion" (owner note in the old `updates merc site.md`, now archived).
8. Done 2026-11-18: the attack modifier state is in the record (`chars[].amd`, owner decision).
9. Closed 2026-11-18: no perk limit (owner).
10. Items: Buy and Sell exist since 2026-11-19 (owner). Enhancement price shortcuts stay closed (owner, 2026-11-18).
11. Closed 2026-11-19: left as is (owner). Mark a card as active (`setCardActive` exists; no UI). Decide if it is needed.
12. Monsters tab, collapsed modifier ribbon: it shows the faces left and the discard only. Proposed: the odds strip and a count of the cards in Top, Bottom and Active (cards placed there in the full view are invisible once it is collapsed).

## 3. Campaign tab gaps

13. Campaign stickers: the scenario stickers are matched by number (used by the flowchart since 2026-11-18). The 19 named campaign stickers (city rule, the Voice, the Drake and others) have files in `images/stickers/gh2` by slug; check that the Overview sticker list and the stickers modal use them. (verify)
14. Perk sheets (`wh_perks`, one per class) and masteries/banners in the Cards tab: not built.
15. Scenario flowchart: diagonal arrows in the Flow chart are interpreted by position, unverified against the book. (Storylines were checked against the Secretariat and the owner's sheet on 2026-11-18; the unlock links were not.)
15a. Closed 2026-11-19: left as is (owner). Scenarios: the Table view and the flowchart's overview map do not use the storyline colours or the stickers yet (the chart, the modal and the phone list do).
16. Resources: pCloud links may expire. The scenario book and section book share one link on purpose (owner, 2026-11-18).

## 4. Campaign server and session flow (blocked on hosting decision)

22. Backend decided and deployed 2026-11-17 (`decisions.md`, `server/README.md`): Cloudflare Worker with KV at `https://api.penultimate.de/`. The page uses it since 2026-11-17 (shared mode, invite links, merge). Next: upload the live campaign and send the invite links (owner); watch the KV write count in the first sessions.
23. Done (2026-11-17, `server/worker.js`): campaign GET and PUT with `ver` check, token auth (128-bit tokens, SHA-256 hashes stored, roles admin, player, read-only). Not yet run with the live server and real players. Tokens never in the public thread.
24. Session start from the campaign page: scenario level, one hero per character, fresh `sid`, open the map with the `campaign` block. Design: `design/server-and-commit.md`.
25. Map side: a panel for result, battle goals, items found; write the session result into the URL state.
26. Session commit from the campaign page: validate `cid`, unused `sid`, `base` version. Merge XP, gold, items, scenario result and unlocks. Preview before applying. Idempotent. Level-ups, enhancements and card choice stay separate campaign edits.
27. Event voting is local per deck today. Decide whether votes move to the server with per-seat tokens. (owner)
27a. Map in the campaign app, map state per turn on the server, posts without URLs: proposed in `design/map-integration.md` (phases 1 to 7, open questions for the owner).

## 5. BBCode posts

28. Aftermath post (battle goal result, XP, gold, loot) needs the commit result. Depends on item 26.
29. Icon to BGG image id table: exists for the playmat's code list (`bggIcons.js`). Check the aftermath template against the owner's sheet.

## 6. Hero decks and art

32. Shield and retaliate frames still use placeholders (`p0`). (verify, from 2026-11-07 notes)
33. Closed 2026-11-18: roll codes over 255 characters stay as they are (owner).
34. The 68 unique faces are real card scans (not rebuilt), so the earlier "unique faces not rebuilt" item is closed. The 26 multi-icon faces: check against the scans.
35. Unprocessed PSD exports (14 files, 2026-11-07) are not converted. Low priority.

## 7. Licence and policy (owner)

36. Licence of the Secretariat data (AGPL-3.0), FrosthavenAssistant data (AGPLv3), the Card DB text and the Frosthaven images. Images are cleared for non-profit use by the owner. The rest is unchecked.
37. Co-author line on commits. The old handover recorded a conflict between an earlier repo rule and the global CLAUDE.md. Current behaviour: follow the global CLAUDE.md (no line). Get a decision.
38. Whether `campaign/mockups/` should stay in the repo or be trimmed. It holds about 650 KB of card thumbnails from the group's card scans.

## 8. Cards tab: Frosthaven and Jaws follow-ups (2026-11-16)

39. Licence and hosting of the worldhaven card and battle goal pictures (hotlinked from raw.githubusercontent.com for now). Decide: keep hotlinking, copy to a Pages site, or drop. (owner)
40. Done 2026-11-16 for character mats (front and back, from the asset repository). Attack modifiers for Frosthaven and Jaws are still open (worldhaven has them). Scope decision for attack modifiers. (owner)
41. Done 2026-11-16: card titles come from the picture file (the name field is sometimes the summon, e.g. "Banner of Hope" for Driving Inspiration). Minor: apostrophes are lost in titles ("The Knifes Edge").
42. Done 2026-11-16: counts are 27 to 37 per class after the title fix (648 cards).
43. Done 2026-11-18: Jaws of the Lion and Frosthaven classes are playable in the campaign (owner). Geminate: one hand limit of 14 (two forms of 7; players handle the split). Class mechanics beyond tokens (traps, shadows and other map tokens) are not represented on the Mercenaries tab (owner). Frosthaven character tokens are generated stand-ins (`tools/make-fh-character-tokens.py`) until real art exists.

## 9. Images in the repo (2026-11-16)

44. Browser check of the image switch: the map, the campaign tabs, the attack modifier deck and the perk icons. Only Node checks were run (every key resolves to a file, 2,045 campaign keys, 916 attack-modifier layers, the map's tiles, overlays, monsters and mercenaries).
45. Closed 2026-11-18: the banner codes already use a public address, linked in the banner modal (owner).
46. The six event images sit in `events/gh2/event_images/` (four levels). Move them up to `events/gh2/`, and update `tools/images-manifest.json` and regenerate the index.
47. Mockups under `campaign/mockups/` still point at the old image paths. Decide: rewire or retire them.
48. Browser check of the 2026-11-16 changes, not done yet: tab order, the settings modal width and two-column shortcuts, the items roll button, the marker fix, the portrait crops. Node and headless checks only.
49. Closed 2026-11-18: the tab stays "Mercenaries" (owner).
50. Done 2026-11-18: the Scenarios and Items roll buttons share the merc tab roll button style (owner).
51. Touch for the card preview (tap and long press pin it) is not tried on touch hardware.
52. Card preview (2026-11-17): checked in Playwright at 1366x650 on the Cards and Items tabs and every playmat zone. Not checked: other window sizes by hand, the old attack modifier modal of the phone view (it keeps its own docked zoom, `pm.amZoom`).
