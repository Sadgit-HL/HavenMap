# Campaign app: elements and mechanics inventory

Written 2026-11-08 from the group's WHTracker.xlsx (GH2 tabs only); statuses updated the same day after the first campaign page was built (`HANDOVER.md` section 14.7). Scope decision: no automatic import of the current campaign state; the owner syncs it by hand once the mechanics exist. This list is what the campaign app has to cover. For the data shape see `campaign-schema.md`, for the generated ID tables `HANDOVER.md` section 14.

Legend: **Static** = generated table exists (`scripts/games/`), **App** = already in the map app, **Page** = built on the campaign page (`campaign/`), **Schema** = in `campaign-schema.md`, **New** = found in the workbook, not yet in the schema.

## 1. Campaign level (tab "GH2 Campaign")

| Element | Mechanic | Status |
|---|---|---|
| Inspiration | A counter. | Schema (`party.insp`) |
| Difficulty | Average party level plus a difficulty modifier (Normal = 2) gives the scenario level. | Schema (`party.diff`); average level is derived, not stored |
| Reputation | Three factions (Demons, Merchants, City Guard), one marker on a track from +20 to -10. Thresholds trigger a section to read (for example 6 and 12 reputation) and rewards (add an event to the city deck). | Schema (`rep`); **New**: the threshold text and what each unlocks |
| Prosperity | Checkmarks on a track of nine levels (the sheet marks where each level starts); level is derived. Exact thresholds not read yet. | Schema (`pros`) |
| Imbuement | Two grids of 10 by 8 boxes with labelled rewards (`+1P`, `Great Oak Sanctuary`). | Schema (`imb`); **New**: the box labels and reward effects |
| Campaign stickers | A checklist of named stickers (city rule, candle, drake, voice, ...). | Static (`STICKERS`), Schema (`stk`) |
| Unlocked classes | Checklist of classes (GH2 and Mercenary Pack). | Static (`CLASSES`), Schema (`cls`) |
| Enhancements | Log per class: card, top or bottom action, enhancement, price. | Schema (per character `enh`); **New**: price and slot |
| Retirements | Class, player, name, level, perks, masteries, comment. | Schema (`retired`) |

## 2. Scenarios (tab "GH2 Flow")

| Element | Mechanic | Status |
|---|---|---|
| Scenario state | Locked, Unlocked, Completed, Locked Out. | Schema (`scn.s`) |
| Result record | Scenario level, party size, chests opened (treasure numbers), date. | Schema (`scn.l/p/ch/d`) |
| Unlock graph | Arrows on the group's flowchart; completing a scenario unlocks the next ones. Other unlocks come from events, reputation, personal quests and treasures. | Static (`SCENARIOS.unl`); the non-arrow unlocks need a manual way to set them |
| Area (faction) icon | Each box is tagged with a storyline (Sect, Shields, Merchant's Guild, Voice and the Drake, Random Side Quests, Personal Quests, Sewers, Puzzle Book, Gloom, Events, Hail). | Static (`area`); **New**: the legend and filtering by area |
| Totals | Completed, unlocked, locked, locked out, days played, days per scenario. | **New** (derived views) |
| Days played | A running total shown in the header, with days per scenario. How it is counted is not confirmed. | **New** |

## 3. Characters (tabs per hero)

| Element | Mechanic | Status |
|---|---|---|
| Header | Class, name, level, XP, gold, inherited perks. | Page (add up to four characters, edit values), Schema (`chars`) |
| Traits | Three per hero (class table), plus extra marks such as `Friend of Hero`. | Static (`TRAITS`), Page (shown, not editable); **New**: the extra marks |
| Personal modifier deck | Composition from perks, cards out of the deck are ticked, Bless and Curse, GeekRoller code. | **App** (hero attack modifier decks); Page shows the imported faces only |
| Ability cards | Hand size; a selected deck; other owned cards (bench); discard, active and lost piles; hand is derived. Cards are chosen at level-up. | Static (`CARDS` with initiative where known), Page (Hand, Discard, Lost areas with drag and drop, sorted by initiative, pictures on hover with Ctrl or always, bench shown, hand size editable); choosing cards at level-up is **New** |
| Card enhancements | A grid per card of enhancement slots (top and bottom actions, filled or empty) with prices. | **New** |
| Items | A list with three tick states per item; a shop with limited copies. | Static (`ITEMS`), Page (shown, not editable per character); the three states are not yet named |
| Personal quest | One per hero (number and progress). | Static (`PERSONAL_QUESTS`), Schema (`pq`) |
| Battle goal | Drawn per scenario, kept or not, result success or failed. | Static (`battle_goals.js`), Schema (`bg`, `bgr`) |
| Level up | Level, new ability card pick, perks, masteries. | Perks **App**; level-up flow **New** |
| BBCode posts | Per character templates: class banner, `End of Turn` with the map link, `Cards for the next round`, `Aftermath` (battle goal result, XP, gold, loot), top and bottom action lines with BGG image ids. | Schema section 11 |

## 4. Items and shop (tab "Items")

- A grid of all items with available copies (`x / y`), filters by slot (head, body, legs, one hand, two hands, small) and by source (craft, coin, solo).
- Unlocked and in-shop copies are campaign state: copies out = total minus shop count. Static (`ITEMS`), Schema (`items.unl`, `items.taken`).
- Quartermaster items (`QM1` and so on) and solo items are separate item kinds.
- A GeekRoller code for a random item draw. **New**.

## 5. Events (tab "GH2 Events")

- Two decks (city, road); each card is out, bottom or top. The remaining deck has a GeekRoller code. Schema (`events`).
- A draw opens an event card (front and decision images); the players vote per seat, the decision and result are written back. Schema 4a (`pend`, `evlog`); **New**: front and decision images, the option marked on the card.
- Static (`CITY_EVENTS`, `ROAD_EVENTS`).

## 6. Decks (tab "GH2 Decks")

| Deck | Mechanic | Status |
|---|---|---|
| Battle goals | 60 goals, drawn with a GeekRoller code; a goal is drawn once; checkmarks 1 or 2. | Static (`battle_goals.js`) |
| Random items | A GeekRoller draw of items. | **New** |
| Random scenario | A pool of side scenarios rolled when a card or treasure says "unlock a random side scenario". | **New** |
| Treasure index | A table of claimed treasures with effects (gain an item, gold, XP, a checkmark, suffer damage and a condition, unlock a random side scenario). | Schema (`decks.tre`); **New**: the effect text per treasure |
| Medical packs | Six numbered packs. | Schema (`decks.mp`) |
| Personal quests | Assigned per hero, with a link. | Static |

## 7. Enemies (tab "Enemy")

- Monster set (GH2) and difficulty choose the enemies; the monster ability deck has initiative, a drawn state and a GeekRoller code (`iid:` ids).
- Enemy and ally attack modifier decks (with Bless and Curse). **App** (monster and ally decks).
- Monster stats and hex art. **App**.

## 8. Support tabs

- **Card DB**: the source of all static tables (about 6,500 rows across editions). Done for GH2 and the Mercenary Pack.
- **Admin**: lookup lists (monsters, ability cards per class, item filters, crafting lists, class list, card scale). These drive the sheet's dropdowns; the app replaces them.
- **Resources**: links to the starting guide, rule book, scenario book, section book, puzzle book, solo scenarios, FAQ and the enhancement calculator. **New**: a links panel.
- **Queries**: the owner's issue list for the sheet (all marked done except the Cragheart race note).
- **scratch**: tile and overlay data for the map tool. **App**.
- Frosthaven tabs (events, campaign, decks, crafting and pets, outpost, construction, flow, puzzle book): out of scope, Frosthaven only.

## 9. Cross-cutting mechanics

- **GeekRoller codes** everywhere a deck is rolled (battle goals, events, items, enemy decks). The 255 character limit applies (see `HANDOVER.md` section 13.6a).
- **BGG images**: icons in posts are BGG image ids; a table from icon to id is needed.
- **Identity**: four seats, a vote per seat, admin and player tokens (schema section 6).
- **Immutable session URL** per turn; the campaign record only changes at start and commit.
- **Rules lookup**: section numbers ("Read 29.1") are text only; no section book data exists in the repo.

## 10. Gaps against the schema

Done on the campaign page (2026-11-08): the overview values, scenario state and results, items unlocked and in use, event piles, battle goal, treasure and medical pack lists, adding characters, ability card areas with drag and drop, card pictures, initiative and hand size.

Not yet modelled or built: choosing cards at level-up; per card enhancement slots and prices; the three item tick states; imbuement box labels and effects; reputation threshold text; random item and random scenario decks; treasure effect text; the extra trait marks; scenario days played; event front, decision and the marked option; the links panel; manual setting of non-arrow scenario unlocks; editing stickers, unlocked classes, players, retirements and enhancements; removing or retiring a character; marking a card active; touch support for moving cards; the server, tokens and voting; session start and commit; BBCode posts.
