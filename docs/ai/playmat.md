# Mercenaries tab (playmat) and phone view

The Mercenaries tab of the campaign page is the most used screen during a scenario. It is built as a playmat: a card table with the character's hand, play area, active area, piles, item shelf and a dock of modal buttons. Phone widths get a separate layout with the same data and functions.

Code: `campaign/playmat.js` (markup, modals, dock, settings), `campaign/playmat.css` (hand-maintained), `campaign/app.js` (wiring, state in `pm`), `campaign/ctxmenu.js`, `campaign/morph.js`, `campaign/phone.js` and `phone.css`. Data: `campaign-record.md`. Visual rules: `ui-guidelines.md`. Mockups for the design history: `campaign/mockups/` (`merc-6-playmat-v2.html` is the desktop reference, `merc-7-phone-v2.html` the phone reference).

## Requirements (from the owner's original brief, since deleted from the workspace)

1. Cards: drag to discard and Lost piles; hand area; active area; enhancements shown on cards.
2. Attack modifier deck of the character (modal, now in the hand area).
3. Item area.
4. Perks and masteries (modal).
5. Personal quest and notes (journal modal).
6. Battle goal (journal modal).
7. Header: class, name, player, level, XP with thresholds, gold, inherited perks, traits.
8. Character mat, front and back (modal).
9. Class portrait.
10. Easy copy of BGG codes.
11. Notes.
12. Custom class counters (resolution, time tokens). Partly done as class special tokens.
13. Enhancement table (editable).

## Layout (desktop, `.pm`)

- Top bar: portrait, name, class, traits, level badge, XP row with the bar, gold and inherited perks spin boxes, class tokens, BGG code buttons (AMD, Turn, Cards), settings. One line at 1400 px and wider. Below 1400 px the BGG buttons show icons only.
- Left: item shelf.
- Board: top row has the Active area (left) and two play slots (right, slot 1 sets initiative). Hand below, with header (`n of hand size`, Spread or Fan, Sort by initiative, Hand or Modifiers switch).
- Right: Discard and Lost piles (top card shown, click opens the pile modal).
- Far right: dock, six modal buttons: Perks and masteries, Journal, Character mat, BGG codes, Enhancements, History. (Attack modifiers are in the hand bar.)
- Card size: `--cu` set by `sizePlaymat()` in `app.js`, 14% of stage height or 12% of width, 60 to 160 px.

## Zone rules (owner decisions)

- Every deck card is in exactly one zone: hand, active area, play slot, discard, lost.
- A card in the active area is not in the hand.
- Play slots take hand cards only. The two slots can swap. A card entering an occupied slot sends the old card back to the hand.
- Slot 1 sets initiative. Cards in the play area lie face down until flipped (click flips).
- The hand holds up to 14 cards, sorted by initiative (automatic) or in manual order (`hord`). Dragging a card in the hand sets manual order. Ini returns to automatic.
- Drag between zones works without the Edit toggle: moving cards is play, not setup.
- End of round: drag each play card to discard. No dedicated control (owner decision).
- Rest and lose-a-card: done by hand, by dragging cards. No flow.
- Inherited perks are a number only.

## Modifier deck (Modifiers view in the hand bar)

- Deck stacks, Top and Bottom strips, roll code panel, discard pile (top card, modal), active area. Space toggles Hand and Modifiers when nothing is focused.
- Draws, returns, shuffle, bless and curse are session state (`pm.amd[charId]`), not saved in the record. Known gap (`roadmap.md` item 8).
- Deck follows the taken perks (`c.pk`) via `scripts/campaign/amdDeck.js`. Roll codes: `1custom<n>{faces}` for the pool; `Top: X` and `Bottom: X` when a known card is placed.
- Every move writes a History line.

## Modals and buttons

| Modal | What it does |
|---|---|
| Perks and masteries | perk rows from the class perk list, taken perks change the deck at once; multi-box perks count when all boxes are ticked; masteries from `scripts/games/masteries.js` (Jaws of the Lion has none) |
| Journal | three tabs: Battle goals (3 drawn, keep 1; roll code `3custom<n>{ids}`; pictures from worldhaven, laid out like the quest tab), Personal quest (2 drawn, keep 1; quests shared by the party: `bgs`, `pq` in the record), Notes (markdown, toolbar, preview) |
| Character mat | front and back, click to flip |
| BGG codes | icon codes in blocks (General, Conditions, Elements, Loot, Terrain, Class specific), class banner codes (`[inlineimg]url[/inlineimg]`), user's own codes (localStorage `havenmap.campaign.codes`) |
| Enhancements | the class's enhancement log (`r.enh`), add with card and top, bottom or gold, price per row, remove |
| History | this character's entries from `record.log`, kind filter |
| Edit character | name, player, event traits, class change (restarts the character), portrait |
| Hand editor (deck modal) | class cards by level with states Locked, Unlocked, Hand; Confirm hand applies it. Level stepper moves XP to the level threshold |
| Items | state buttons (available, spent, consumed), equip dialog with slot limits (head 1, body 1, legs 1, hands 2, small items half the level rounded up) |
| Pile modal | recover top or all cards; docked preview |
| Markers | tokens and stickers on cards and items |

BGG posts: Turn (banner, top action in slot 1, bottom action in slot 2, `XXX` for empty) and Cards for the next round (initiative of slot 1, cards of slots 1 and 2). Template text is fixed in `playmat.js` (`turnPost`, `cardsPost`).

## Settings and context menu

- Playmat display settings live in the settings modal (Mercenary tab, `displaySettingsHtml` in `campaign/playmat.js`): Hand (layout Spread or Fan, auto-sort by initiative), Card zoom (mode hover or click, size, hover delay), Zoom per zone, Preview (docked side), Cards and motion (initiative badge, reduce motion). Kept per browser (`havenmap.campaign.pmset`), not in the record.
- The settings modal has four tabs: Profile (your name), Campaign file (load, export, clear), Mercenary tab, and Shortcuts (generated from the `SHORTCUTS` list in `campaign/app.js`; update it when a shortcut changes).
- Keys on the object under the mouse pointer (not focus), read at key press from the last mouse position: ability card D (discard), L (Lost), A (active area); item D (toggle spent and available), L (consumed); attack modifier D (on a placed card: discard; on a deck stack: draw one to the discard, as a click does). Ignored in edit mode for attack modifiers. The item context menu has a State section with the same three states.
- Context menu (`ctxmenu.js`): right click, Menu key, Shift+F10, long press on touch and pen. Cards: enlarge, marker, move to hand, active area, play slots (hand cards only), discard, lost, start and end of hand. Piles: recover top, move whole pile. Counters: +5, -5, reset. Every entry calls the same function as the normal UI.

## Phone view

- Used at 700 px wide or less (`phone.js`, `phone.css`). Tabs Cards, Items, Info. Burger menu opens the same modals as the dock.
- Tap a card for a bottom sheet with zones to move it to; tap a played card to flip; Ini and Lvl sort the hand.
- XP, gold and inherited perks: display only on the phone.
- Not on the phone yet: Modifiers view, Edit character, class change (see `roadmap.md`).

## History logging

Every edit goes through `commit` and is logged (`changelog.js`). Small counter changes within 4 seconds are folded into one line ("gold 42 to 47 (+5)"). Modifier deck actions are written directly by `addLog` in `app.js`, since the deck state is not in the record.

## Known gaps

- Touch drag of modifier cards uses pointer events; not tried on touch hardware.
- Hand fan and active area size from their containers, not `--cu`.
- Long press and phone view not tested on a real device. The 2026-11-14 layout changes are not browser-tested (see `status.md`).
- Item and enhancement price shortcuts from the old mockup are not built.
- Card active marking has no UI.
