# Roadmap

Open work in priority order. Items marked (owner) need a decision or data from the owner before code. Items marked (verify) may already be done; check the code first.

## 1. Stabilise what exists

1. Browser-test the 2026-11-14 layout changes at the sizes in `ui-guidelines.md` section 9. Scope: top bar on one line, modifier and modal card sizes, tile modals close (Escape, overlay, footer), Stickers toggle.
2. Commit a test set. The Node checks for `edit.js`, `record.js`, `events.js`, `outcomes.js`, `amdDeck.js`, `flow.js` and `changelog.js` existed only in temporary folders. Put them under `tools/tests/` and say how to run them.
3. Data checks (verify): the XP table (`XP_STEPS` in `campaign/playmat.js`, now 0, 45, 95, 150, 210, 275, 345, 420, 500, matching the Secretariat; rulebook not checked); `scenarioLevel` for GH2 (unverified).
4. Review and commit the docs reorganisation (`docs/ai/`, `docs/archive/`, the five stubs). Nothing is committed yet.

## 2. Playmat and phone gaps

5. Phone: Modifiers view (it still opens the old AMD modal, `PHONE_MODALS`), Edit character, editable gold, XP and inherited perks (currently display only).
6. Touch: drag of modifier cards on touch screens (pointer events, hold then move) is untried on hardware. Check the long-press context menu on a real touch device.
7. Hand fan and active zone: size from `--cu` instead of their own containers.
8. Markers on pool cards (Deck modal) and on phone cards beyond the Markers button.
9. Settings: explain or relabel "Reduce motion" (owner note in the old `updates merc site.md`, now archived).
10. Attack modifier state is session only (draws, top, bottom, active, count edits). Decide whether it belongs in the record (needs a field and a schema note in `campaign-record.md`). (owner)
11. No perk limit is enforced. Decide whether the app should enforce one. (owner)
12. Item tick states: the three spreadsheet tick columns (6, 7, 9) are unnamed. Items imported with old `st` ticks count as spent. (owner)
13. Item and enhancement price shortcuts from the old mockup: unclear what they were. (owner)
14. Mark a card as active (`setCardActive` exists; no UI). Decide if it is needed.

## 3. Campaign tab gaps

15. Stickers: the `wh_stickers` images (about 119) need a mapping to the 19 named stickers. Unknown mapping. (owner)
16. Perk sheets (`wh_perks`, one per class) and masteries/banners in the Cards tab: not built.
17. Treasure cards: no images found. The treasure effect text is in `gh2_treasures.js`.
18. Events: "Gain trait" effects do not set special traits automatically. Payments, average level, item possession and earlier answers are not checked (left to players). Decide whether to auto-check the computable ones. (owner)
19. Events: card effect lines are generated English wording, unchecked against printed cards.
20. Events: notes are hidden (`NOTES = false` in the events code). Decide whether to show them.
21. Scenario flowchart: diagonal arrows in the Flow chart are interpreted by position, unverified against the book.
22. Random item and random scenario decks (roll codes exist elsewhere; no page yet).
23. Resources: pCloud links may expire; the GH2 scenario book and section book share one link (probably one is wrong). Check with the owner.

## 4. Campaign server and session flow (blocked on hosting decision)

24. Decide the backend (owner). Proposed: Cloudflare Worker with KV, behind the `store.js` interface, with an admin JSON export. See `decisions.md`.
25. Server: campaign GET and PUT with `ver` check, token auth (128-bit tokens, hashes stored, roles admin, player, read-only). Tokens never in the public thread.
26. Session start from the campaign page: scenario level, one hero per character, fresh `sid`, open the map with the `campaign` block. Design: `design/server-and-commit.md`.
27. Map side: a panel for result, battle goals, items found; write the session result into the URL state.
28. Session commit from the campaign page: validate `cid`, unused `sid`, `base` version. Merge XP, gold, items, scenario result and unlocks. Preview before applying. Idempotent. Level-ups, enhancements and card choice stay separate campaign edits.
29. Event voting is local per deck today. Decide whether votes move to the server with per-seat tokens. (owner)

## 5. BBCode posts

30. Decide where the composer lives: the playmat already has Turn and Cards posts. The design (`design/server-and-commit.md`) put it in the map app. (owner)
31. Aftermath post (battle goal result, XP, gold, loot) needs the commit result. Depends on item 28.
32. Icon to BGG image id table: exists for the playmat's code list (`bggIcons.js`). Check the aftermath template against the owner's sheet.
33. Owner test on BGG was positive for turn, banner and roll codes (2026-11-12). Re-test after changes that touch templates.

## 6. Hero decks and art

34. Shield and retaliate frames still use placeholders (`p0`). (verify, from 2026-11-07 notes)
35. Some hero roll codes exceed 255 characters. Decide on a fallback or a split. (owner)
36. The 68 unique faces are real card scans (not rebuilt), so the earlier "unique faces not rebuilt" item is closed. The 26 multi-icon faces: check against the scans.
37. Unprocessed PSD exports (14 files, 2026-11-07) are not converted. Low priority.

## 7. Licence and policy (owner)

38. Licence of the Secretariat data (AGPL-3.0), FrosthavenAssistant data (AGPLv3), the Card DB text and the Frosthaven images. Images are cleared for non-profit use by the owner. The rest is unchecked.
39. Co-author line on commits. The old handover recorded a conflict between an earlier repo rule and the global CLAUDE.md. Current behaviour: follow the global CLAUDE.md (no line). Get a decision.
40. Whether `campaign/mockups/` should stay in the repo or be trimmed. It holds about 650 KB of card thumbnails from the group's card scans.
