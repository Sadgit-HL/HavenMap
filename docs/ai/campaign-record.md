# Campaign record

The record is the one JSON document that holds a campaign. It is what the page shows, edits, exports and (later) what the server stores. The authoritative field list is the header comment of `scripts/campaign/record.js`. This file is a summary. If they disagree, the code wins and this file needs fixing.

## Where it lives

- Browser: localStorage key `havenmap.campaign.v1` via `scripts/campaign/store.js`.
- Import and export: JSON file, by hand (Export and Load file buttons in the page).
- Test record: `import/campaign-import.json`, produced by `tools/import-campaign-state.py` and then changed by the code's `normalize`.
- Server: not built. Design in `design/server-and-commit.md`.

## Top level

| Field | Meaning |
|---|---|
| `v`, `ver` | schema version and revision counter (`RECORD_VERSION` = 1) |
| `name`, `players` | campaign name; players `[{ seat, name }]` (four seats) |
| `party` | `insp` (inspiration), `avg` (average level, derived on display), `diff` (difficulty -2 to +4: the scenario level is the normal difficulty plus `diff`, clamped 0 to 7, `scenarioLevel` in `record.js`; set from the Overview's Party window and the Monsters tab), `diffName` |
| `rep` | reputation per faction: `demons`, `merchants`, `guard` (-10 to 20) |
| `pros`, `imb`, `don` | prosperity checkmarks; imbuement boxes (0 to 80); donation boxes (0 to 100) |
| `stk`, `cls` | sticker labels; unlocked class names |
| `avail` | class names available in this campaign (absent = all) |
| `scn` | scenario state keyed by number: `{ s, l?, p?, ch?, d? }`. States: 0 locked, 1 unlocked, 2 completed, 3 locked out |
| `chars` | up to four characters (below) |
| `items` | `{ unl: [itemId], taken: { itemId: copies in use } }` |
| `events` | `{ city, road: { top, bottom, out, locked }, marks, notes }`. Piles are ordered |
| `evlog` | finished events |
| `decks` | `{ bg, tre, mp }`: battle goals drawn, treasures claimed, medical packs |
| `bgs`, `pq` | battle goals and personal quests out of the deck: `{ slug: { st, c } }`. A slug not listed is in the deck |
| `enh` | enhancement log `[{ cls, card, top, bottom, price? }]`, campaign-wide |
| `retired` | retired characters |
| `resLinks` | overrides for the Resources tab links |
| `log` | edit history `[{ t, u, tab, kind, d }]`, last 1000 kept |
| `mon` | Monsters tab (`scripts/campaign/monsters.js`): `{ round, types, decks, am }` (no level of its own since 2026-11-18: the monster level is the scenario level; a saved `lvl` is turned into `party.diff` on load); `types` up to 8 monster ids (`scripts/games/gh.js`, GH2); `decks` ability deck state per deck slug `{ deck, active, discard }` (missing = full; types that share a deck share the entry); `am` the monster (`m`) and ally (`a`) modifier decks, in the state shape of `amdDeck.js` plus `imb` (monster imbuement 0 to 2) |

Events also carry `pend` (open events, one per deck, `{ city?, road? }`), `marks` (ticked boxes per card) and `notes`.

## Characters (`chars[]`)

| Field | Meaning |
|---|---|
| `id`, `cls`, `name`, `seat?` | id (`c1`..), class name, display name, seat |
| `lv`, `xp`, `gold`, `inh` | level, XP, gold, inherited perks (a number only) |
| `traits`, `special` | the three class traits; special traits from events (`scripts/campaign/traits.js`) |
| `hand` | hand size (1 to 20), optional: absent = the class's hand size (`hand` in `gh2_classes.js`, from the Secretariat data; `handLimit` in `record.js`) |
| `deck` | ability card ids in the selected deck |
| `disc`, `lost`, `act` | discard pile (last = top), lost pile, active area |
| `play` | `[slot 1, slot 2]`, each null or `{ id, up }`. Only hand cards enter a slot; slot 1 sets initiative |
| `hord` | manual hand order, or null (sorted by initiative) |
| `hgrid` | grid layout of the hand: `{ cardId: cell }` (6 columns), or null |
| `own`, `bench` | owned item ids; owned ability cards not in the deck |
| `items` | equipped items `[{ id, st, s }]`, `s` = 0 available, 1 spent, 2 consumed |
| `tok` | class special tokens `{ key: count or state index }` |
| `mk` | markers on cards and items: `{ 'c:<card id>' or 'i:<item id>': [{ k, s?, x, y }] }` |
| `mp` | enhancement sticker prices |
| `pk` | perks: `{ chk: 0 to 18, perks: [entry index], boxes: { index: mask }, ms: [mastery index] }` |
| `am` | legacy modifier deck state, if any (the playmat derives the deck from `pk`) |
| `amd` | attack modifier deck draw state (optional; absent = full deck): `{ disc: { key: n }, order: [key], adj: { key: +-n }, bless, curse, top: [key], bot: [key], act: [key] }`. Checked by `cleanAmd` (`amdDeck.js`), changed by `charAm` (`edit.js`), cleared on a class change. Since 2026-11-18 |
| `bgo`, `pqo`, `pqc`, `notes` | battle goals and quests just drawn (to keep or return), quest requirement counts, journal notes |
| `cnt` | custom counters (not in the UI yet) |

Card ids are generated: `classIndex * 100 + n` (`scripts/games/gh2_cards.js`). Changing the Card DB rows changes the ids. Regenerating the tables requires regenerating saved records.

Invariant: every card of `deck` sits in exactly one place: `lost`, `disc`, `play`, `act`, or the hand (everything else). The hand is derived (`handOf`, `handList` in `record.js`), not stored.

## Derived values (not stored)

`scenarioLevel` (`ceil(avg / 2) + difficulty`, matches the Secretariat base formula; rulebook not checked; currently unused), `partyAvg` and `normalDifficulty` (average of the mercenaries' levels, `ceil(avg / 2)` clamped 0..7; Overview, party modal and default level of the Monsters tab), `prosperityLevel` (`PROSPERITY_START`), average level, days played, scenario counts, hand list, zone of a card (`zoneOf`), owned cards and pending picks (`ownedCards`, `pendingPicks`), item slot use and fit (`slotLimits`, `slotUse`, `itemFits`), shop copies (`shopCopies`), unlocked-by links (`unlockedBy`).

## Functions

- `normalize(raw)`: fills defaults, converts older shapes (imbuement `row:col` lists, single pending event, duplicate cards). Call it on every load and import.
- `validate(r)`: checks ids and ranges.
- `emptyRecord()`: a new campaign.
- `availableSet(r)`: classes available in the campaign.

## Edit functions (`scripts/campaign/edit.js`)

Grouped by area. Each takes a record and returns a new record.

- Overview: `setParty`, `setReputation`, `setProsperity`, `setImbuement`, `setDonations`, `addSticker`, `removeSticker`, `addUnlockedClass`, `removeUnlockedClass`, `setClassAvailable`, `setEditionClasses`, `addPlayer`, `renamePlayer`, `removePlayer`, `addRetired`, `setRetired`, `removeRetired`.
- Scenarios and resources: `setScenarioState` (completing one unlocks follow-ons), `setScenarioResult`, `setResourceLink`.
- Items: `setItemUnlocked`, `setItemTaken`, `setItemState`, `setEquippedItems`, `giveItem`, `returnItem`, `sortItems`, `buyItem` (Items tab, Buy for ...: pays the cost from the character's gold, refused when short), `sellItem` (Inventory, Sell: item back to the shop, half the cost rounded down to the character). Helpers `itemCost` and `sellPrice` read `ITEM_COSTS` (`scripts/games/gh2_item_costs.js`, generated by `tools/extract-item-costs.py` from the Secretariat items).
- Events: `openEvent`, `cancelEvent`, `setVote`, `closeVote`, `rollTie`, `drawEvent`, `moveEvent`, `moveEventTo`, `setEventPlace`, `shuffleDeck`, `addEventsToDeck`, `toggleMark`, `setNote`, `finishEvent`, `toggleDeckEntry`, `setDeckList`.
- Characters: `addCharacter`, `renameCharacter`, `setCharacter`, `setCharacterPlayer`, `setSpecialTrait`, `changeCharacterClass` (restarts the character and clears the event traits, keeps inherited perks, class traits and notes), `setToken`.
- Cards: `moveCard`, `flipPlayCard`, `sortHand`, `setCardActive`, `addPoolCard`, `removePoolCard`, `applyHand` (hand selection, level-up picks).
- Journal: `keepBattleGoal`, `setQuestStatus`, `clearOffer`, `returnAllBattleGoals`, `setQuestCount`, `setNotes`, `holdStatus`.
- Perks and masteries: `togglePerkBox`, `setPerkChecks` (battle goal checkmarks, 0 to 18, every 3 earn a perk), `setMastery`.
- Enhancements: `addEnhancement`, `removeEnhancement`, `setEnhancementPrice`.
- Markers: `addMarker`, `moveMarker`, `removeMarker`, `clearMarkers`, `setMarkPrice`.

## Spoiler rule

Locked items, locked scenarios and undrawn content show numbers or placeholders only. Names of unlocked content are hidden in edit mode where a picture would give them away (items).
