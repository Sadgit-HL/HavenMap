# Roadmap

Open work in priority order. Items marked (owner) need a decision or data from the owner before code. Items marked (verify) may already be done; check the code first.

## 1. Stabilise what exists

1. Browser-test the 2026-11-14 layout changes at the sizes in `ui-guidelines.md` section 9. Scope: top bar on one line, modifier and modal card sizes, tile modals close (Escape, overlay, footer), Stickers toggle.
2. Commit a test set. The Node checks for `edit.js`, `record.js`, `events.js`, `outcomes.js`, `amdDeck.js`, `flow.js` and `changelog.js` existed only in temporary folders. Put them under `tools/tests/` and say how to run them.

## 2. Playmat and phone gaps

4. Phone: check the touch layout (2026-11-17) on a real phone, upright and sideways: page sheet, bottom sheets, long press preview, hold and move of modifier cards. Tested only with Playwright touch emulation.
5. Touch: check the long-press context menu of the playmat on a real touch device (tablet).
6. Hand fan and active zone: size from `--cu` instead of their own containers.
7. Settings: explain or relabel "Reduce motion" (owner note in the old `updates merc site.md`, now archived).
8. Attack modifier state is session only (draws, top, bottom, active, count edits). Decide whether it belongs in the record (needs a field and a schema note in `campaign-record.md`). (owner)
9. No perk limit is enforced. Decide whether the app should enforce one. (owner)
10. Item and enhancement price shortcuts from the old mockup: unclear what they were. (owner)
11. Mark a card as active (`setCardActive` exists; no UI). Decide if it is needed.

## 3. Campaign tab gaps

13. Stickers: the `wh_stickers` images (about 119) need a mapping to the 19 named stickers. Unknown mapping. (owner)
14. Perk sheets (`wh_perks`, one per class) and masteries/banners in the Cards tab: not built.
15. Scenario flowchart: diagonal arrows in the Flow chart are interpreted by position, unverified against the book.
16. Resources: pCloud links may expire; the GH2 scenario book and section book share one link (probably one is wrong). Check with the owner.

## 4. Campaign server and session flow (blocked on hosting decision)

22. Decide the backend (owner). Proposed: Cloudflare Worker with KV, behind the `store.js` interface, with an admin JSON export. See `decisions.md`.
23. Server: campaign GET and PUT with `ver` check, token auth (128-bit tokens, hashes stored, roles admin, player, read-only). Tokens never in the public thread.
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
33. Some hero roll codes exceed 255 characters. Decide on a fallback or a split. (owner)
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
43. Frosthaven and Jaws cards are not in the playmat or the campaign records. Decide whether they should be (they would need card ids and the same zone rules). (owner)

## 9. Images in the repo (2026-11-16)

44. Browser check of the image switch: the map, the campaign tabs, the attack modifier deck and the perk icons. Only Node checks were run (every key resolves to a file, 2,045 campaign keys, 916 attack-modifier layers, the map's tiles, overlays, monsters and mercenaries).
45. BGG banner codes need a public address. They still use the Wordhaven_Assets URL. Decide: GitHub Pages copy of `images/character-banners`, or keep the old address.
46. The six event images sit in `events/gh2/event_images/` (four levels). Move them up to `events/gh2/`, and update `tools/images-manifest.json` and regenerate the index.
47. Mockups under `campaign/mockups/` still point at the old image paths. Decide: rewire or retire them.
48. Browser check of the 2026-11-16 changes, not done yet: tab order, the settings modal width and two-column shortcuts, the items roll button, the marker fix, the portrait crops. Node and headless checks only.
49. The Mercenaries tab label is still "Mercenaries" (requested as "Mercs"). Decide whether to shorten it.
50. Scenario roller is still the icon button, unlike the item roller. Decide whether both should use one style.
51. Touch for the card preview (tap and long press pin it) is not tried on touch hardware.
52. Card preview (2026-11-17): checked in Playwright at 1366x650 on the Cards and Items tabs and every playmat zone. Not checked: other window sizes by hand, the old attack modifier modal of the phone view (it keeps its own docked zoom, `pm.amZoom`).
