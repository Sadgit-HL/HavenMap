# Class tokens and special class tokens

Handover for the Mercenaries tab mockup `campaign/mockups/merc-6-playmat-v2.html` (see also `docs/merc-tab-handover.md`). Written 2026-11-12.

## 1. Two separate systems

| System | What it is | Code | Images |
|---|---|---|---|
| Class tokens | Physical tokens a player places on an item card as a marker (item marker picker). One or more per class. | `CLASS_TOKENS`, `MY_TOKENS`, `TOK_DIR`, `MK` (state `hm-item-markers`) | `images/common/mercenary_tokens/<key>.png` |
| Special class tokens | Resource tokens of a class that the player tracks in the header (HUD), for example Resolve or Supply. | `TOKEN_DEFS`, `renderTokens()`, `CH.tok` (saved in `hm-character`) | `TOKEN_DEFS` entries carry `img` (count tokens) or `imgs` (one per state, cycle tokens), file names without `.png`; shown by `tkImg()` at 52px |

The two overlap for a few classes (Hail Resolve, Deepwraith Trophy, Shattersong Resonance appear in both). They are independent in code.

## 2. Special class tokens (HUD)

Two behaviours, set per token in `TOKEN_DEFS`:

- `count`: label with minus and plus buttons, never below 0, saved in `CH.tok[key]`.
- `cycle` (has `states`): one token is shown and a click steps through its states, no number, no counting. Saved as the state index in `CH.tok[key]`.

`renderTokens()` runs from `renderHud()` and reads the current class from `CH.cls` (lower case, spaces removed). The HUD container is `<span id="tokens">` inside `.counters`. The `+ counter` custom counter button that used to sit next to it was removed.

The mockup class list (`CHAR_CLASSES`) now has all 43 classes (GH2e, Mercenary Pack, Jaws of the Lion and Frosthaven, added 2026-11-12), so the four token classes below can be selected and show their tokens.

| Class | Token | Behaviour | Wired | Image |
|---|---|---|---|---|
| Hail | Resolve | count | yes | `images/common/mercenary_tokens/hail_resolve.png` (also `images/common/icons/resolve.png`) |
| Quartermaster | Supply | count | yes | `images/common/mercenary_tokens/quartermaster_supply.png` |
| Soothsinger | High note | count | yes | `images/common/mercenary_tokens/soothsinger_high_note.png` |
| Soothsinger | Low note | count | yes | `images/common/mercenary_tokens/soothsinger_low_note.png` |
| Deepwraith | Trophy | count | yes (selectable since all 43 classes were added) | `images/common/mercenary_tokens/deepwraith_trophy.png` |
| Shattersong | Resonance | count | yes (selectable since all 43 classes were added) | `images/common/mercenary_tokens/shattersong_resonance.png` |
| Blinkblade | Time | count | yes (selectable since all 43 classes were added) | `images/common/mercenary_tokens/blinkblade_time.png` (184x184, renamed from `fh-blinkblade-time-token-orig.png`, not listed in `CLASS_TOKENS`) |
| Blinkblade | Speed (Fast, Slow) | cycle, 2 states | yes (selectable since all 43 classes were added) | `images/common/mercenary_tokens/blinkblade_speed_fast.png` (Fast), `images/common/mercenary_tokens/blinkblade_speed_slow.png` (Slow) |
| Metal Mosaic | Pressure (0 to 3) | cycle, 4 states, one token shown | yes (selectable since all 43 classes were added) | `images/common/mercenary_tokens/metal_mosaic_pressure_0.png` to `_3.png` (state n uses `metal_mosaic_pressure_n.png`, renamed from `mm_steam_n.png`) |

Owner's wording: Blinkblade has two token types, Time (counted) and Speed (states fast or slow). Hail has Resolve. Metal Mosaic has pressure tokens of which one is displayed and clicking cycles them (4 states). The Blinkblade Speed states follow that wording and have not been checked against the printed class. Metal Mosaic Pressure 0 to 3 is confirmed by the owner.

Every other class has no special token. Tinkerer used to show hardcoded "Time tokens" and "Resolve" counters in the mockup; those were removed and Tinkerer now shows none.

## 3. Class tokens (item markers)

`CLASS_TOKENS` maps a class key to the list of token image names in `images/common/mercenary_tokens/`. The picker shows `CLASS_TOKENS[CUR_CLASS]` (`CUR_CLASS` is hardcoded to `tinkerer` in the mockup). Each key has a file `<name>.png`.

| Class | Token image(s) | State |
|---|---|---|
| Anaphi, Berserker, Bruiser, Bladeswarm, Cassandra, Cragheart, Demolitionist, Doomstalker, Elementalist, Hatchet, Mindthief, Nightshroud, Plagueherald, Quartermaster, Red Guard, Satha, Sawbones, Silent Knife, Sunkeeper, Soothsinger, Soultether, Spellweaver, Tinkerer, Voidwarden, Wildfury | `<class key>.png` | file exists |
| Hail | `hail.png`, `hail_resolve.png` | files exist |
| Boneshaper | `boneshaper_skeleton_1.png` to `_6.png` | files exist |
| Deepwraith | `deepwraith_trophy.png` | file exists |
| Geminate | `geminate_character.png`, `geminate_melee.png` | files exist |
| Hive | `hive_mode.png` | file exists |
| Shattersong | `shattersong_resonance.png` | file exists |
| Blinkblade | none in `CLASS_TOKENS`. `blinkblade_time.png`, `blinkblade_speed_fast.png`, `blinkblade_speed_slow.png` exist unlisted. | class token list missing |
| Metal Mosaic | none in `CLASS_TOKENS`. `metal_mosaic_pressure_0` to `_3` exist unlisted. | class token list missing |

Class key is the lower case class name with spaces replaced by underscores here (`red_guard`, `silent_knife`), but the card back map `BACK_FILES` and `TOKEN_DEFS` strip spaces instead (`silentknife`). Do not mix the two.

## 4. Open work

1. Special token images exist for every token (added 2026-11-12) and are wired into the HUD: `renderTokens()` shows the image (52px, set in `tkImg()`) instead of a text label; count tokens keep the minus/plus buttons and the number, cycle tokens are one clickable image. Verified visually only for Soothsinger; Hail, Quartermaster and the cycle tokens were not rendered, and Deepwraith, Shattersong, Blinkblade and Metal Mosaic cannot be selected until they are in `CHAR_CLASSES`. Metal Mosaic Pressure runs 0 to 3 (confirmed by the owner), state n uses `metal_mosaic_pressure_n.png`.
2. (Done 2026-11-12: Deepwraith, Blinkblade, Shattersong and Metal Mosaic are in `CHAR_CLASSES`, which activates their `TOKEN_DEFS` entries.) They also need card backs (see `BACK_FILES`; Silent Knife and these four currently use `images/common/card_backs/ability-back-placeholder.png`).
3. Register `blinkblade_time`, `blinkblade_speed_fast`, `blinkblade_speed_slow` under `blinkblade` and `metal_mosaic_pressure_*` under `metal_mosaic` in `CLASS_TOKENS` if they should also work as item markers.
5. Mockup only: `CH.tok` is stored in `localStorage` key `hm-character`. The real campaign page (`campaign/app.js`) has no class token support yet.
6. The mockup must be served over http (`start.bat`, `http://localhost:8080/HavenMap/campaign/mockups/merc-6-playmat-v2.html`). Opened from `file://` the module scripts are blocked and the page falls back to static markup.

## 5. File naming convention (`images/common/mercenary_tokens/`)

- Class token (the class's own marker): `<class_key>.png`, for example `red_guard.png`.
- Special token: `<class_key>_<token>.png`, for example `hail_resolve.png`, `quartermaster_supply.png`, `soothsinger_high_note.png`.
- Token with states: `<class_key>_<token>_<state>.png`, for example `blinkblade_speed_fast.png`, `metal_mosaic_pressure_0.png`.
- `<class_key>` is the lower case class name with spaces as underscores (`metal_mosaic`, `silent_knife`); all lower case, underscores only, no edition prefix such as `fh-`.
- Renamed 2026-11-12: `ss_high_note`, `ss_low_note`, `bb_fast`, `bb_slow`, `mm_steam_0` to `_3`, `fh-blinkblade-time-token-orig`. The old names are gone; the only references were in the mockup `TOKEN_DEFS` and this doc.
- The `TOKEN_DEFS` keys in the mockup still use the space-free form (`metalmosaic`); only the file names use underscores.
