# What Gloomhaven 2e cards look like

From the Secretariat's structured data of the 7 Gloomhaven 2e classes it has (Bruiser, Cragheart, Elementalist, Mindthief, Soothsinger, Spellweaver, Tinkerer: 205 cards, 410 halves), checked against the owner's card code for Hail and Cassandra (57 cards). The numbers are priors for reading the pictures of the other classes: a result far from them is a reason to look at the picture again. `check.py` turns the main ones into `unusual:` notes.

## Cards of a class

- 27 to 31 cards. Level 1: 8 to 12 cards, level X: 2 to 3, levels 2 to 9: exactly two cards each. Initiatives are different within a class (5 to 98).
- Lost: 100 of 410 halves (about a quarter). Persistent: 41 top halves, 19 bottom halves. Round bonus: 5 top, 30 bottom. Experience: top 1 (35), 2 (15), 3 (8); bottom 1 (10), 2 (17), 3 (5): never more than 3.

## Halves

- Actions per half: 1 for 42%, 2 for 47%, 3 for 10%, 4 for 1.5%. More is almost always one action whose pills were read as separate actions.
- Most common halves: a lone attack (48 of 410), a lone text (37), a lone move (31), attack then a banner (26), a grid of side-by-side actions (24), move then a text (18), a lone heal (14).
- The dark banner with the "!" appears on 94 of 410 halves: 81 hold one element icon (element creation, most often ice, earth or fire), 4 hold an either-element icon, 7 a text, 2 a condition; mostly right after an attack. Card code: `mandatory:` with the element (`infuse: [a/b]` for the either-element icon).
- An element consume (red cross) is on about 70 pills: 38 on attacks, 10 on heals, 21 on their own. Either-element pairs (`ice/earth`, `light/dark`) are rare (13).
- Under an attack: a range pill (66 of 120 attacks), a consume (38), a condition (32), an area (19), a target count (12), pierce (9), push (5).

## Enhancement markers

0 to 5 per card, mostly 1 to 3 (0: 15 cards, 1: 48, 2: 60, 3: 52, 4: 23, 5: 7). Which shape sits where:

| Place | Shapes |
|---|---|
| move, teleport, jump | circle (78%), square |
| attack value | diamond (62%), square (38%) |
| range | square |
| heal value | square, diamondPlus, plus |
| condition | diamond, diamondPlus |
| area | a dot in a hex (`x`) |

The owner's Hail and Cassandra cards follow the same rule (attack diamond 19 of 24, teleport and move circle 23 of 30).

## Values

- attack 1 to 8 (average 2.7), move 1 to 8 (3.1), heal 1 to 10, shield 1 to 2, retaliate 3 (rare).
- range 1 to 5, 3 in 57%; target count 2 in 14 of 18 cases.
- Area: 3 to 12 hexes (4 in most cases), 25 different shapes in 38 uses. In the data they are coordinates with `active` (self), `target` and `enhance` (a dot): the owner's `s`, `t`, `x`.

## Texts

166 texts, 85 characters on average, in formulaic phrases: "Gain X ...", "Grant one adjacent ally:", "Create one obstacle in an empty hex", "Control one enemy ...", "At the end of each of your turns ...", "All adjacent enemies ...", "Add +1 [attack] ...". The icons inside texts, by frequency: experience 1 (24), attack (23), damage 1 (16), range 4 and 3 (27), damage 2 (10), the square marker (9), lost (7), recover (6), muddle, stun, ward, poison. A text that uses none of this vocabulary is worth a second look.

Seven classes use 227 different words, all editions together 885 (`vocab.txt`, built by `build-vocab.py`). A word of an extracted text that is not in the list but is one letter away from one that is ("withing", "numer") is flagged as `word:`: either misread, or a typo printed on the card (the owner's cards have two: keep them as printed).

## Structure in the Secretariat data, for a later converter

Their nodes: `attack`, `move`, `heal`, `shield`, `retaliate`, `loot`, `push`, `pull`, `pierce`, `jump`, `teleport`, `condition`, `element` (a created element, or `valueType: minus` for a consume with its effects as `subActions`), `forceBox` (the dark "!" banner), `box` and `boxFhSubActions`, `grid` (side by side), `concatenation` (inline), `summon`, `area`, `specialTarget` (self, all, enemiesAdjacent ...), `card` (experience, lost, recover, token slots), `hint`, `custom` (a label key). Markers are `enhancementTypes`, pills are `subActions` with `small: true`. A consume on an attack is a sub action of the attack there, an `optional:` block after it in card code.
