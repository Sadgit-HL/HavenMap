# Hero modifier faces: draft

Status: draft, not implemented. Branch `feature/hero-amd`. Companion to `campaign-schema.md` (section 3).

Source: the four hero sheets (Simon, Scabs, Hail, Shale) in WHTracker.xlsx, as a snapshot of the current decks, plus the user's notation answers. Items marked (unverified) are inferred.

## 1. Face record

A face is data. The same record gives the roller text and selects the artwork.

```
{
  key:     "p1-rolling",        // stable slug, becomes a numeric ID in the static table
  value:   "+1",                // "+0", "+1", "-1", "+2", "-2", "x2", "miss", or "null" for no number
  effects: ["rolling"],         // ordered list, icon keys (see 3)
  roll:    "+1 rolling",        // text used in the GeekRoller code
  shuffle: false,               // true for x2 and Miss
  art:     { kind, ... }        // see 2
}
```

Per-hero deck state stays counts per face key, as in `attackMods.js`.

## 2. Artwork sources

`art.kind` is one of:

| kind | meaning |
|---|---|
| `existing` | image already in `images/common/attack_mods/gh-am-*.webp` |
| `fa` | pre-rendered image from Frosthaven Assistant perks folder (400x267, baked-in number and corners) |
| `psd` | built from the exported PSD layers: `frame` + `sphere` + `number` + `icons` |
| `needs-art` | no source yet |

Style note: `fa` images and `psd` builds look different (sphere size, number shape, corner circle). Pick one style per deck, or per campaign, to avoid mixed looks.

## 3. Effect icons

`effects` keys and where the icon comes from:

| key | PSD export (center / side) | note |
|---|---|---|
| `heal1` | `icons/center/effects-heal` | amount 1 shown by the face, not the icon (unverified) |
| `strengthen` | `icons/center/conditions-strengthen` | "ally" handled as a flag (see `target:"ally"`) |
| `immobilize` | `icons/center/conditions-immobilize` | |
| `wound` | `icons/center/conditions-wound` | |
| `invisible` | `icons/center/conditions-invisible` | |
| `rolling` | `icons/side/rolling` | side icon only |
| `any-element` | `icons/center/elements-any-element` | "wild" |
| `control` | none | not covered yet, needs art |

A face may carry `target: "ally"` for faces like Strengthen on an ally.

## 4. Face catalog (heroes in the current campaign)

Standard faces (`existing` or `psd` numbers): `p0`, `p1`, `m1`, `p2`, `m2`, `x2` (shuffle), `miss` (shuffle).

Hero-specific faces:

| key | sheet text | value | effects | art |
|---|---|---|---|---|
| `p0-heal1` | `+0 heal1` (also typed `-0 heal1`, a typo) | +0 | heal1 | `fa`: plus0heal1 |
| `p2-strengthen-ally` | `+2 strengthen ally` | +2 | strengthen, ally | `fa`: plus2strengthenally |
| `p1-immobilize` | `+1 Immob` | +1 | immobilize | `fa`: plus1immobilize |
| `p1-rolling` | `+1 ->` | +1 | rolling | `fa`: plus1flip (`flip` = rolling: the image shows the same green U-turn icon as the PSD Rolling icon) |
| `p0-invisible-rolling` | `Invis ->` | +0 assumed (the sheet shows no number) | invisible, rolling | `fa`: plus0invisibleflip (carries the same rolling icon) |
| `p1-wild` | `+1 wild` | +1 | any-element | `fa`: plus1any (probable) |
| `p0-wound-or-immobilize` | `+0,w/i)` | +0 | wound OR immobilize | `needs-art`: icons exist in PSD, layout for "or" unknown |
| `p0-control-move1` | `+0 control move1` | +0 | control, move1 | `needs-art`: control icon not available |

Roller text for each face is the `roll` field. The sheet's current strings are not used as-is: they contain typos (`-0 heal1`, trailing apostrophes on `+0 heal1` and `+2 strengthen ally`).

## 5. Deck compositions (snapshot)

Base composition is read from the deck row of each sheet: every cell except the Bless and Curse placeholder slots. The row is the full deck including cards currently drawn (unverified for ticks meaning drawn, but the totals reconcile with the roller code: remaining cards plus active bless and curse).

| Hero | Cards | Composition |
|---|---|---|
| Simon (Tinkerer) | 24 | p0 7, p1 5, m1 3, p2 1, x2 1, miss 1, p0-heal1 3, p2-strengthen-ally 3 |
| Scabs (class not read) | 23 | p0 4, p1 5, m1 1, p2 3, m2 1, x2 1, miss 1, p0-control-move1 2, p1-rolling 1, p0-invisible-rolling 2, p1-immobilize 2 |
| Hail | 21 | p0 7, p1 5, m1 2, p2 1, x2 1, miss 1, p1-wild 2, p0-wound-or-immobilize 2 |
| Shale | 21 | p0 6, p1 5, m1 6, p2 1, m2 1, x2 1, miss 1 |

Bless and Curse live only in the deck while drawn: they are added and removed by hand, up to 10 each in the sheet, and leave the game when drawn. This matches the existing `AM_SPECIAL` behavior.

## 6. Gaps and questions

- Missing artwork: `p0-wound-or-immobilize` (how the "or" is shown on the card) and `p0-control-move1` (control icon).
- Confirm the value of `Invis ->` (assumed +0).
- `flip` in the Frosthaven Assistant file names means rolling (checked visually in `face-compare/index.html`). Still unconfirmed: that `plus1any` (the six-color wheel) is the "wild" face.
- A side by side of the Frosthaven Assistant images against PSD builds is in `docs/face-compare/index.html`. It shows two builds from exported layers only (+0 and +1 rolling) that match closely, and six builds with substituted frames, because the colored frames for Immobilize, Heal, Strengthen, Invisible, Any element and Wound were not exported.
- Scabs' class was not read from the sheet.
- Sample covers four heroes only. Full GH2 and Mercenary Pack coverage needs the class perk lists (the sheet has none).
- Licence of the Frosthaven Assistant images has not been checked.
