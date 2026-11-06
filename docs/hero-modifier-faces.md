# Hero modifier faces: draft

Status: draft, not implemented. Branch `feature/hero-amd`. Companion to `campaign-schema.md` (section 3).

Source: the four hero sheets (Simon, Scabs, Hail, Shale) in WHTracker.xlsx, as a snapshot of the current decks, plus the user's notation answers. Items marked (unverified) are inferred.

Full-coverage class perk data (all FH, GH2E, JotL and MP classes, not just the four campaign heroes) is extracted separately into `scripts/games/perks.js` by `tools/extract-perks.mjs` + `tools/perks-decode.mjs`, from `Tarmslitaren/FrosthavenAssistant`'s edition JSON (local clone, not committed: `asset-backups/amd/FrosthavenAssistant`). See section 7.

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

## 3a. Card layout (confirmed from real card scans)

Verified against official FH and JotL card photos in `any2cards/worldhaven` (`images/attack-modifiers/`, Cephalofair-licensed scans; local clone, not committed: `asset-backups/amd/worldhaven`), comparing Drifter (`frosthaven/df`), Boneshaper (`frosthaven/bo`), Red Guard (`jaws-of-the-lion/rg`) and Hail (`jaws-of-the-lion/ha`).

**Universal rule, confirmed on Frosthaven cards**: any icon (one or several, with or without its own baked amount) always takes over the **big center circle**, in the icon's own color (e.g. poison = green, curse = purple, fire = orange) — never the generic value-based tint; the attack value then shrinks into the **corner badge, bottom-left**, stacked above the class symbol badge. A plain card with no icon at all keeps the attack value big and centered instead, in the normal green/tan/red value tint. There is no "medium badge at middle-left, number stays big" case in Frosthaven — a single plain condition (`fh-am-bo-01` "+0 curse", `fh-am-bo-03` "+0 poison") shows the condition icon big in the center, tinted to match, exactly like a multi-icon or amount-bearing one. (An earlier draft of this section, based only on Red Guard/Hail's older JotL-era cards, proposed a middle-left side badge with the number staying big for single plain icons; not applied, in favor of one consistent rule across all four editions.)

**Implementation note**: decorated cards are no longer composed from separate frame/icon/number layers. `tools/extract-perks.mjs`'s `art.ref` for a `shared`-kind card names a FrosthavenAssistant per-slug PNG (`assets/images/attack/perks/<ref>.png`) that turned out to be an actual Cephalofair card scan, pixel-for-pixel identical to the worldhaven photos (same frame tint, icon, number placement, rolling diamond, amount, all baked in) — confirmed by comparing `plus0poison.png`/`plus0curse.png` against the real Boneshaper cards. `perks/card.js` uses that image directly (copied into `images/common/attack_mods/shared/`, see section 7) and only overlays the class symbol badge on top, replacing whichever class's weapon icon that particular scan happened to carry (the same slug is reused across many classes). This sidesteps the per-icon tint/shape/amount approximations the layered approach needed. Plain (no-icon) cards still compose from our own frame+number layers, since the attack value is the only content and nothing there needs per-effect tinting.

- The class symbol badge (from `P:\Guido\boardgames\Worldhaven\icons\all\<Class>.png`, white silhouette on a dark circle, box measured off `fh-am-df-14.png`, ~100x100px on the 600x391 canvas) sits below the corner-value badge on every card, matching the real cards' weapon-icon badge (the second "game logo" badge seen on JotL/MP cards is not reproduced).
- Shuffle cards (x2, Miss) use a distinct lens/eye shape, not a circle or diamond — already covered by the existing `gh-am-m-19`/`gh-am-m-20` assets, no change needed.

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
| `p0-wound-or-immobilize` | `+0,w/i)` | +0 | wound OR immobilize | resolved: this is Hail's unique perk card (`perks/unique/ha1` in the FrosthavenAssistant data), not a composed face. `fa`: `unique/ha1`, no icon layout needed. |
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

- ~~Missing artwork: `p0-wound-or-immobilize`~~ resolved, see section 3a and the face catalog above.
- `p0-control-move1` (control icon) still needs art: not part of the shared 101-slug vocabulary decoded in `tools/perks-decode.mjs`, and not found as a condition in the worldhaven scans checked so far. May be class-unique (own `fa` image) rather than a shared icon; unconfirmed.
- Confirm the value of `Invis ->` (assumed +0).
- `flip` in the Frosthaven Assistant file names means rolling (checked visually in `face-compare/index.html`, and confirmed independently in section 3a: the real cards show the same green U-turn diamond). Confirmed: `plus1any` (the six-color wheel) is the "wild"/any-element face (`elements-any-element` icon).
- A side by side of the Frosthaven Assistant images against PSD builds is in `docs/face-compare/index.html`. It shows two builds from exported layers only (+0 and +1 rolling) that match closely, and six builds with substituted frames, because the colored frames for Immobilize, Heal, Strengthen, Invisible, Any element and Wound were not exported.
- Scabs' class was not read from the sheet.
- ~~Sample covers four heroes only. Full GH2 and Mercenary Pack coverage needs the class perk lists~~ resolved: `scripts/games/perks.js` now covers all 43 classes across FH, GH2E, JotL and MP (711 perk entries), see section 7.
- Licence of the Frosthaven Assistant images has not been checked. Separately, `any2cards/worldhaven`'s card scans are explicitly Cephalofair-licensed ("2022 CEPHALOFAIR GAMES, LLC. ... USED WITH PERMISSION", printed on the cards themselves) — used here only to verify layout, not copied into the repo.

## 7. Full perk data pipeline (all editions)

- `tools/perks-decode.mjs`: decodes a shared FrosthavenAssistant perk slug (e.g. `plus1heal1allyflip`) into `{ value, tokens: [{word, cat, icon, amount}, ...] }`. Validated against all 101 shared slugs found in the edition data with zero unmatched/leftover tokens.
- `tools/extract-perks.mjs`: reads `Frosthaven.json`, `Gloomhaven 2nd Edition.json`, `Jaws of the Lion.json` and `Mercenary Packs.json` from the local FrosthavenAssistant clone (`asset-backups/amd/FrosthavenAssistant/...`, hard-coded path, not committed) and writes `scripts/games/perks.js`. Re-run after updating that checkout.
- `scripts/games/perks.js` (generated, do not hand-edit): `PERKS[edition][className]` = array of perk entries `{ index, text, removes, adds }`. Each card in `removes`/`adds` is one of:
  - `{ kind: 'base', value }` — plain `+0`...`-2`, or `"null"` (a no-op attack card, e.g. Nightshroud's starting `nullAttack`)
  - `{ kind: 'shared', value, tokens, art }` — a decorated card; `tokens` decode the slug (kept for data/search purposes, e.g. filtering by effect) but are not used for rendering — `art.ref` names the real baked card image (`images/common/attack_mods/shared/<ref>.webp`, see section 3a)
  - `{ kind: 'unique', code, art }` — a one-off per-class card (68 total) with explicit `text`, rendered directly from the baked image at `art.ref` (`unique/<code>.webp`)
- Coverage: 43 classes (17 FH, 18 GH2E, 4 JotL, 4 MP), 711 perk entries, 0 decode failures.
- `images/common/attack_mods/shared/` (101 files) and `unique/` (68 files): converted from FrosthavenAssistant's `assets/images/attack/perks/*.png`, which turned out to be real Cephalofair card scans, not approximations — see section 3a.
- `images/common/attack_mods/class_icons/` (43 files): one white-silhouette webp per class, converted from `P:\Guido\boardgames\Worldhaven\icons\all\<Class>.png` (trimmed to content, recolored to white, alpha preserved).
- The icon decoder (`tools/perks-decode.mjs`) and the per-icon asset library (`icons/center`, `icons/side`) built earlier in this branch are no longer on the shared-card render path (superseded by the baked images above) but are kept: the decoded `tokens` are still useful data, and a new icon was added to the library along the way — `icons/{center,side}/conditions-safeguard.webp`, converted from `gloomhavensecretariat`'s `fh/condition/safeguard.svg` (local clone, not committed: `asset-backups/amd/gloomhavensecretariat`), recolored/shadowed to match the sibling condition icons.
