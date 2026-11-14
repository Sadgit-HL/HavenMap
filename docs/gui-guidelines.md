# GUI and interaction guidelines (from the Mercenaries tab)

Purpose: give every other tab of the campaign page (`campaign/`) the same look and the same way of working as the Mercenaries tab.
Written 2026-11-14 from the code as it stands: `campaign/playmat.js`, `campaign/playmat.css`, `campaign/style.css`, `campaign/ctxmenu.js`,
`campaign/app.js`, `campaign/phone.js`, `campaign/phone.css`. Where a rule is a recommendation and not yet used everywhere, it says so.

Rules from the owner (`docs/HANDOVER.md` section 9) apply to all tabs: terse, no emoji, no em dashes, no help text in pages or modals unless
asked, confirm before destructive actions, never hand-edit generated files, commit only when asked.

## 1. Principles

1. **Tabletop feel.** The screen should look like a card table: dark wood and paper tones, cards as the main objects, gold for what is
   active or chosen. Cards are shown as their real images, not as text rows.
2. **The page is a shortcut, not a form.** Everything that changes the campaign is one click or one drag away on the main surface. Modals
   hold the detail, and the context menu repeats the common actions. The menu never offers something the normal UI cannot do.
3. **Changes apply at once.** No save button in a modal (except the Edit character popup, which drafts several fields). Every change is
   committed to the record, logged and undoable (section 6).
4. **Nothing is explained on screen.** No help paragraphs, no tutorial text, no "tip" lines. Labels, titles (tooltips) and empty states
   are the only text. A tooltip may say what a control does; it does not repeat the section heading.
5. **Spoilers stay hidden.** Locked or unseen campaign content is shown as a count or a placeholder, never by name (see
   `docs/HANDOVER.md` section 7).
6. **Dense but calm.** Many small controls, but one visual language: the same border, radius, gap and gold accent everywhere.

## 2. Design tokens

Use the variables on `.pm` (playmat) and `:root` (campaign page). Do not add new colours; add a token if a colour is needed twice.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#16130f` | page and playmat background |
| `--panel` | `#231d17` | panels, modal boxes, menus |
| `--line` | `#3a3026` | every border, dividers |
| `--text` | `#ecdfc8` | normal text |
| `--muted` | `#a89a82` | secondary text, labels, notes |
| `--accent` | `#c7a44a` | gold: active state, headings, primary buttons, focus |
| `--ok` / `--warn` / `--bad` / `--info` | `#6cae75` / `#d9a441` / `#c9604f` / `#6b9fd4` | status only (complete, caution, error, info) |
| inset fill | `#2d2519` (buttons, fields), `#1c1711` (cards inside a section), `#120f0b` (text areas, lists), `rgba(0,0,0,.18)` (section) | depth levels |

Hard-coded values that appear often and should be reused: `#b4533f` (warning border), `#6b5a3c` (hover border), `rgba(199,164,74,.1)`
(selected background), `rgba(199,164,74,.25)` (focus ring).

## 3. Typography and spacing

- Font: `system-ui, Segoe UI, Roboto, sans-serif`, base `14px/1.35`.
- Headings: modal title `h2` 17px accent. Section heading `h4` 11px, uppercase, letter-spacing `.1em`, accent. A count or hint may sit
  right of the heading in normal case, 12px, text colour.
- Body inside cards and rows 13px. Notes and labels 12px muted. Numbers that matter (XP, gold, counts) bold or in a pill.
- Radius: 6px small controls and icons, 8px fields and tiles, 10px sections, cards and modal boxes, 12px modal box and page panels,
  999px pills.
- Gaps: 4 to 6px inside a row, 8 to 12px between controls, 12px between sections. Padding of modal box 18px 22px (14px on phones).
- Icons: inline SVG, `stroke="currentColor"`, stroke width 1.8, 18px in the dock, 16px in buttons. Pencil icon for edit, `+` for add,
  `&times;` for remove or close.

## 4. Layout

- **Playmat** (Mercenaries tab): top bar (character stats, BGG buttons, settings), item shelf, zones (hand, active, discard, lost), a
  dock of modal buttons at the right, and the card area in the middle. Fixed height to the window (`calc(100vh - 150px)`, min 640px).
- **Dock**: a column of square-ish buttons (icon above label), one per modal. Order: the things used most in play first. The dock opens a
  modal; it does not change the page.
- **Overview and other tabs**: cards in a grid (`minmax(230px, 1fr)`) with a `h2` per group and a pencil button for each editable group.
- New tabs should use the same card, chip, table and button styles so that the page reads as one thing.

## 5. Components

### 5.1 Buttons

| Class | When |
|---|---|
| `.btn6` | normal action in a modal or the playmat (Cancel, Clear, Copy, Recover) |
| `.btn6.jprimary` or `.ce-save` | the one main action of a popup (gold background) |
| `.ce-danger` | a destructive main action (red), with the warning shown above it |
| `.chip` | small toggle or removable item (`.chip.info` for a trait, `.chx` for remove inside it) |
| `.editbtn.editicon` | round pencil button next to a heading: opens the modal for that group |
| `.delx` | small remove cross in a row |

- Disabled buttons: 45% opacity, no pointer. Do not hide them, unless the action never applies.
- Icon-only buttons need `aria-label` and `title`.
- Hover: border turns gold, text gold (or a slightly lighter brown fill for footer buttons).
- Press: 1px down and an inset shadow.

### 5.2 Fields

- Text and number inputs: 34px high in popups, 6px radius, `#2d2519` fill, gold focus ring. Labels above the field in 12px muted.
- Checkboxes: 15px, `accent-color: var(--accent)`, label clickable as a whole row.
- Selects: same as inputs. Use a select for lists longer than about five items.
- Number steppers in cards: `-` and `+` buttons with the value between; click the number to type.

### 5.3 Sections (the popup pattern)

Most modals are a stack of bordered sections under a footer:

```
.chedit                   wrapper: flex column, gap 12px
  section.cesec           bordered box, 10px radius, rgba(0,0,0,.18) fill
    h4                    uppercase accent heading, optional count on the right
    ...rows, grid, table
  .chfoot                 buttons right-aligned, Close or Cancel + primary
```

Use this for every new modal. The journal, the Edit character popup, Perks and masteries, Enhancements, BGG codes and History all use it.
Start the content straight with the first section: no portrait, no header block, no intro line (decision of 2026-11-14 in the perks modal).

### 5.4 Lists and rows

- Rows that can be toggled (perks, quests, goals): a card-like row, 1px line border, 10px radius, `#1c1711` fill, gold border when on,
  dashed border when partly on. Boxes or checks at the left, cards or the name in the middle, tag at the right.
- Checkbox lists (masteries, stickers, classes): grid of tiles (`minmax(190px, 1fr)`), tile highlights gold when on.
- Tables (enhancements): header 11px uppercase muted; rows 13px with a 1px bottom line; inputs inside cells 70px wide.
- Logs (history): grid of time, kind (gold) and text; list box `#120f0b` with a 1px border and its own scroll.
- Empty state: one muted sentence, for example "No changes recorded for this character yet." No illustration.

### 5.5 Cards and images

- Card art: `aspect-ratio 5/7` for player cards, 3/2 for previews of attack modifiers. Thumbnails 46 to 88px wide depending on use.
- Card border: 1px `--line`; markers (tokens and stickers) sit on the card and are clickable.
- A card that is not usable (locked, face down, discarded) is greyed (`opacity .3`, grayscale), not removed.
- Missing image: a `.noimg` box with the name, same size as the card.

### 5.6 Modals

- Overlay `rgba(0,0,0,.65)`, centred box, max height 86vh, scroll inside the box.
- Title `h2` at the top left, close `&times;` at the top right (`.mmodalx`).
- Width: 560px default; 760px for popups with tables or grids; 780px for the journal (tabs); full width only for images.
- Closing: the close button, a click on the overlay, Escape, or the footer Close button. All four must work.
- The modal opens from the dock or a pencil button. Only one playmat modal is open at a time (`pm.modal`).
- Keep the scroll position when the modal re-renders (`keep = box.scrollTop`).
- Previews of a card in a modal are docked beside the box, on the side set in the display settings (`dockPreview`).

### 5.7 Context menus

- One shared menu (`campaign/ctxmenu.js`), registered by CSS selector: `registerMenu({ sel, title, actions })`.
- Open with right click, the Menu key or Shift+F10; with long press on touch and pen. The browser menu stays in text fields.
- Entries: action (label, `run`, optional `disabled`, `danger`), `{ header }` for a small grey caption, `{ sep: true }` for a line.
- Order: the common action first (Enlarge, Edit marker or sticker), then a separator, then moves. Destructive actions last, red.
- Each action must exist in the normal UI as well. The menu is a shortcut.

### 5.8 Feedback

- State shown by colour and a word or a count, never colour alone: "Equipped", "Owned", a checkmark, "2 of 6".
- Copy actions briefly change the button (`.copied`, green border) to confirm.
- Warnings in a popup use `.cewarn` (red border, left bar) above the affected button.
- Errors that block an action are shown beside the field or the button, not in an alert.

## 6. Interaction

### 6.1 Editing and history

- Every change is a pure function in `scripts/campaign/edit.js` (record in, record out, `ver` bumped), then `commit(next)`: stamps
  the log, saves to `localStorage`, re-renders.
- The page has one Undo. It restores the previous record and logs "Undo: ...". New tabs must go through `commit` so Undo and History
  work without extra code.
- History entries: `{ t, u, tab, kind, d }`; the user name comes from Settings.

### 6.2 Clicking and pointer

- A click on a card does the main thing (flip, select, toggle). A second click on the same thing undoes it where that makes sense
  (equip, take a perk).
- Hover zoom or click zoom for cards, set in the display settings (`pmset.zoom`: `hover` or `click`). Hover waits `hoverDelayMs()`. Any
  new zoomable element uses the same two modes.
- Numbers on the playmat (XP, gold, inherited perks) are edited with `+` and `-` buttons, or by clicking the number and typing.
- Drag and drop moves cards between zones (hand, active, discard, lost). Touch and pen use pointer events.
- Hover-only controls (marker handle) are hidden in hover-zoom mode; the click path is the fallback.

### 6.3 Keyboard

- Escape closes the open modal or preview first. One Escape, one step back.
- Space switches between hand and modifier deck when nothing is focused and no modal is open.
- Every control reachable by Tab, with a visible gold focus ring (`box-shadow: 0 0 0 2px rgba(199,164,74,.25)`).
- Dialogs: `role="dialog" aria-modal="true" aria-label` on the box.

### 6.4 Touch and phone

- Touch uses long press for the context menu. Targets at least 36px high on touch (`.pm .btn6 { min-height: 36px }`).
- Phone view (`phone.js`, `phone.css`) is a separate layout that shows the same data with fewer panels; the modal list there is `PHONE_MODALS`.
  A new feature needs a decision for the phone: include it, or say it is desktop only.
- Modals on narrow screens take the full width with 16px gutter and no horizontal page scroll.

### 6.5 Motion

- Short transitions only (.12 to .18s on colour and border). The setting "Reduce motion" turns off the rest. No looping animation.

## 7. Checklist for a new tab

1. Lay it out in the tokens of section 2. Use the same card, chip, button and pencil classes.
2. Put each editable group under a heading with a pencil button that opens a popup. Use `.chedit` > `.cesec` > `.chfoot` for the popup.
3. Give every modal a close button, Escape, overlay click, and a footer Close.
4. Route every change through `commit`, so Undo and History work.
5. Show nothing that the player should not know yet. Count, do not name.
6. Empty states: one muted line, no help text.
7. Hover and click zoom for any card, same settings as the playmat.
8. Context menu entries only for actions that also exist in the normal UI, in the order of section 5.7.
9. Test at 1440x900 and at a phone width. Check that no horizontal scroll appears.
10. Bump the cache version of the changed CSS and JS (`index.html`, `?v=`) and tell the owner to hard refresh (Ctrl+F5) for module files.

## 8. Known gaps (2026-11-14)

- The phone view does not yet have the Modifiers view, the hand editor of the playmat or the class change.
- Some older modals of the campaign page (players, retired characters, prosperity, reputation) use `.modal`/`.modalbox` from `style.css` and
  not the playmat popup pattern of section 5.3. Move them when they are next edited.
- The generated `campaign/playmat.css` (`tools/build-playmat-css.py`) holds rules for the modal pieces too. The rules added by hand for the
  perks, enhancements, codes and history popups are in `campaign/style.css`, under the `.sbox` and `.sedit` classes.
- Touch drag of modifier cards uses HTML5 drag events, so it works with the mouse only.
