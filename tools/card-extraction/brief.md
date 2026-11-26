# Reading character ability cards into card code

You read pictures of character ability cards (Gloomhaven 2nd edition style, 433 x 600 or larger) and write each card as card code, the structured text the owner writes cards with. Accuracy and honesty about doubt matter more than speed. Open every picture with the Read tool and look at it carefully. Each card comes as one enlarged picture (the file in the task table). Open all the pictures of your batch in a single message (several Read calls at once), not one after the other: that saves turns. Read the structure first (how many actions, where the pills, banners and flags are), then the details (icons, numbers, enhancement markers), and check every number and icon.

## Output

One YAML document per card, a blank line between cards, in the order you were given, in the one output file named in your task. Do not write anywhere else. Start every card with `name:`.

```
name: Card Name
initiative: 13
level: 1
top:
  actions:
    - <one action per list item, from top to bottom>
  xp: 2              # half flags, only when printed (see Flags)
  lost: t
bottom:
  actions:
    - ...
```

The top half is above the big initiative number in the middle, the bottom half below it. Level is the number or X at the top left. The small tabs at both sides of the initiative band (wand 2, boot 2) are the same on every card: ignore them. Do not write layout keys (margin, padding, lineHeight, fontSize, transform, position, left, top, width, height, noLine, flexDirection): the owner's tool has defaults.

## Actions

Each action is one list item. Order and grouping follow the card.

- Value actions: `attack: 3`, `move: 2`, `heal: 2`, `teleport: 3`, `loot: 1`, `push: 1`, `pull: 1`, `shield: 1`, `retaliate: 2`, `jump`, `fly`. Put `enhancement: [circle]` next to the value for the enhancement marker printed after it: `circle` (round dot), `square`, `diamond`, `plus` (a plus sign, for heal and shield), `diamondPlus`. Several markers: `[square, square]`.
- Pills: the rounded boxes with a solid outline right of the value hold the extras of the action: `sub:` with `- range: 3`, `- target: 2` (also `1 enemy`, `all enemies`, `1 ally or enemy`), `- self`, `- pierce: 2`, `- push: 1`, a bare condition or element (`- wound`, `- muddle`, `- dark`), `- custom: '%scry% 3'`.
- A condition on its own row is an action: `- stun: ''` with `sub:` for its range; a condition applied to targets: `- wound:` with `sub:` holding the range. Several icons that share one row: `multi:` with the items in order (`- stun: ''`, `- custom: ','`, `- curse: ''`). `range:` and `target:` are only ever written inside a `sub:` list, never as an action or as an item of `multi:` (the card creator reports an error). A range pill at the end of such a row goes into the `sub:` of the last icon: `- immobilize: ''` with `sub:` and `- range: 1` under it.
- Text: `- custom: "Text as printed, with %tokens% for icons"` (always in double quotes: a colon or a quote inside unquoted text breaks the file). Write the text exactly as printed, including typos and doubled words, and mark where the card breaks a line with `%lf%` only when it helps; do not retype layout.
- `- divider` is the thin line between two actions of one half: write it where the card has one.
- `mandatory:` is a dark banner row that starts with an exclamation mark `!` (it sets who or what an ability above applies to, or creates one element): `- mandatory:` then `- light` (a banner with one element icon creates that element: always `mandatory`, never `infuse`), or `- wound:` with `sub:` holding `- custom: "%target% all allies adjacent to the target of the attack"`.
- `optional:` is a box with a DASHED outline. Its content belongs to the ability above it and is carried out only if that ability is performed. It begins with a cost (the cost is always the FIRST item, then what it adds; never write the action before its cost): `- consume: [light]` (an element with a red cross), `- consume: [light/dark]` (the half-light half-dark icon: either), or `- custom: "-1 %resol% :"` (a resource cost; the number is printed before the icon). Then what it adds: `- custom: "+2 %teleport%, %xp1%"` or a full action (`- heal: 3` with `sub:`). One dashed box can hold several lines, each with its own cost: write each line as its own `group:` item. Solid-outline pills are not optional. Look at what is above the dashed box. A small T-shaped line that hangs it from the ability above means it belongs to that ability (the default). A plain divider line, or nothing at all (the box is the first thing in the half), means it is an ability of its own with its own cost: write a `- divider` before it where the card has the line and `noLine: true` on the `optional` block (a key of the block, at the same indent as `optional:`). About a third of the dashed boxes of the Berserker cards are standalone. The owner's own examples sometimes cut a cost into several `group:` items (`-1`, `%resol%`, `:`, then the text) because of how the tool lays them out: you write it as one `custom` line, `"-1 %resol% : text"`.
- `hex: ett_ttt_ett` draws an area. The hexes on the cards stand with a point up, in horizontal rows. Write the rows from top to bottom, separated by `_`, and in each row the hexes from left to right. Every second row (the 2nd, 4th ...) sits half a hex to the right of the rows above and below it; `e` is an empty slot that only pushes the next hex one place to the right. Method: put the hexes of the widest row on slots 1, 2, 3 ...; a hex of a row above or below that stands between two hexes of the neighbouring row takes the slot between them, so write `e` for the slots before it. Letters (those of the card creator): `t` target (a red hex with an X), `s` self (grey), `a` ally, `b` a blank hex, `e` empty slot, `x` a hex-sized enhancement dot; `d`, `h`, `f`, `c` are coloured hexes. A small hexagon next to or under the shape is an enhancement spot: write it as `x` in its own row and slot (a dot below the shape of `et_st` is `et_st_ex`). Count the hexes and the dots on the card, and check the pattern by drawing it in your head. Verified shapes: the flower of 7 red hexes is `ett_ttt_ett`; three red hexes around a grey self hex on its left (one above, one to the right, one below) is `et_st_et` (the creator's own example `et_st_eh` is the same shape with an orange hex below); `ett_st` is two red hexes in a row with a grey hex and a red hex one row below, shifted half a hex to the left; `etx_xtt_etx` four red hexes with two dots; `ete_tt_tst_tt_ete` eight red hexes around a grey self hex. Do not read hex areas by eye: the task table gives the area of every card, measured from the picture by colour and shape ("hex areas, measured": the half and the exact `hex:` pattern, or `none`). It is right, including the enhancement dots: write it as given and only decide which action it belongs to (usually in a `group:` next to the attack or heal it is the area of). If the table says `none`, the card has no area.
- `summon:` for a summon stat block: `stats: [health, move, attack, range]` (a dash for none), `name:`, `enhancement: [square, square, square, 0]` (one entry per stat, 0 for none), and `special:` with the icons under the stats, each written as a custom item with its token, like the owner's Ghost Falcon: `- custom: '%flying%'`, `- custom: '%pierce% 1'` (a bare `- fly` is not understood by the creator). All properties of the summon are indented 4 spaces from the `- summon:` dash. Always write the `image:` block as the creator's documentation shows it, with `url:`, `size: 100%` and `position: '0px 0px'`; the art itself is the owner's, so give the url as `https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/<summon name in snake_case>.jpg` and put `# check: the summon art is not in the assets yet` above it.
- `tokens: [0, 1, 0, 1]` creates token slots (the circles on a card where a token is placed); a 1 is a slot that gives experience, a 0 one that does not. The dashed circle with an arrow to a solid circle with small marks is a row of such slots, for example `tokens: [0, 0]`. `lines: 1` forces one line.
- `group:` / `flexDirection` only when two things stand side by side (a text next to a hex area).

## Flags of a half

Written at the level of `actions:` inside `top:` or `bottom:`, only when printed (they sit in a dark box with `!` at the right edge of the half, or as the lower right icons):

- `xp: 2` the experience burst with a number.
- `lost: t` the white card with a red X; `remove: t` the stack of cards with a red X (removed from the game). A half can show both icons: write both.
- `duration: persistent` the loop icon on a card (an S-shaped loop with a red arrow); `duration: round` the round bonus.
- `infuse: [earth/wild]` (a key of the half next to `xp:` and `lost:`, never a list item among the actions; the creator's syntax: `/` means either) only for the banner with the half-light half-dark icon (either element); a banner with a single element icon is `mandatory:` (see above).
- A ribbon with a name (for example IRRITATION, with a white head with a burst) above a persistent text is written `- custom: ...` lines under a group that holds `- custom: '%irri%'` and the ribbon word.

## Icons

Compare every icon with the reference sheet (icons.png, next to this brief). Condition and element icons are diamonds or circles; the names are on the sheet.

- Action icons in text, written `%name%`: attack (a wand with sparkles), move (a boot with speed lines), heal (a drop with a cross), range (an arrow in a circle, or in a hexagon on the Gloomhaven 2e cards), target (a bullseye), push (a tower in a grey diamond), pull (a grey diamond with an arrow pointing down), pierce (arrows in an orange diamond), damage (a spiky gear-like star), teleport (stacked discs with ripples), loot (an arrow up from a flat base), shield, retaliate (a white fist), jump (a curved arrow landing on a base, usually a pill next to a move: `- jump` in `sub:`), flying (a wing), xp (a black burst with a number: `%xp1%`), recover (a card with a check mark), lost (a card with a red X), persistent (the S-loop with a red arrow), round (the card with a red bar and a circular arrow, the round bonus; inside a dashed box at its right end `%round%`, as a flag of the half `duration: round`).
- The card creator knows these conditions (write them as `%name%` in text, `- name` in a `sub:` list, `- name:` or `- name: value` as an action): bane, blind, bless, brittle, chill, curse, disarm, dodge, empower, enfeeble, immobilize, impair, infect, invisible, muddle, pierce, plague, poison, pull, push, regenerate, rupture, safeguard, strengthen, stun, swing, taunt, ward, wound; elements earth, fire, air (or wind), ice, light, dark, wild, with `/` for "or" (`light/dark`) and an inline consume icon written by adding `c` (`%firec%`). Icon modifiers: `%move-s%` no shadow, `%bane-i%` inverted. Other action keys: `classToken: 0` (the first class token as an action), `mode:` (a fast/slow style block with an `icon:`), `corner:` (the bottom-left corner icon), `namedAbility:` with `name: Augment` (the small keyword ribbon at the top left of a half, like AUGMENT or IRRITATION; it is a key of the half next to `actions:`, never an item of it).
- Conditions and elements: wound (orange drip), poison (grey skull), muddle (brown ?), stun (blue starburst), immobilize (red boot), disarm, curse (purple lightning), bless (gold circle and triangle), strengthen (blue arm), ward (pink shield), regenerate (pink lines), safeguard (green heart), invisible (black dotted figure), bane, brittle, impair, infect, chill, plague (yellow pentagon with a hand; a condition, write it `%plague%`, never a class token); light, dark, fire, ice, air, earth, wild.
- Attack modifier cards in text: `%amd-double%` (x2), `%amd-null%` (miss), `%amd-minus-1%`, and for the rolling icon (two arrows in a circle) `%amd-rolling%`.
- Class icons: a resource that is spent or gained, a token placed on the map, or a mechanic word. The card creator has no name for them: the icons of the loaded class are `%classToken0%`, `%classToken1%` ... in the order they are linked in the class properties (the owner links them), so write the first class icon as `%classToken0%` and the second as `%classToken1%`; do not invent names such as `%rift%`. Say in your reply which icon you gave which index (for Cassandra the rift token on the map is `%classToken0%`). Hail's `%resol%` (Resolve, the white head with a star) and `%irri%` (the Irritation ribbon icon) are names the owner defined, use them for Hail only; `%scry%` is Cassandra's scry. A "self" pill is not an icon of a text: it is `sub:` `- self` under an action, so a sentence that has such a pill inside is written as several items (the first part of the text, the action with `sub:` `- self`, the rest of the text).
- An icon you cannot name: write `%?short description%` (for example `%?green hex with a dot%`) and never guess a name. The owner resolves these.

## What cards usually look like

From 205 Gloomhaven 2e cards (details in gh2e-patterns.md). A result far from this is a reason to look at the picture again:

- A half has one or two actions in nine cases of ten, three is rare. If you have more, you probably wrote the pills of one action as separate actions.
- Enhancement markers, 0 to 4 per card: move and teleport circle (sometimes square), attack value diamond or square, range square, heal value square or diamondPlus, condition diamond or diamondPlus, an area has dots in hexes.
- A dark `!` banner with one element icon, usually right after an attack, creates that element (`mandatory:`). An element with a red cross is a consume and goes with the pill it belongs to.
- Experience is 1 to 3. About a quarter of the halves are lost. Persistent is mostly on a top half, the round bonus on a bottom half.
- Values: attack and move 1 to 8, heal 1 to 10, shield 1 to 2, range 1 to 5 (3 most often), target count mostly 2.
- Texts use formulaic phrases ("Gain X ...", "Grant one adjacent ally:", "Create one obstacle in an empty hex", "Control one enemy ..."). Anything that reads oddly is probably a misread word.

## Quality rules

- Level and initiative are given in your task as hints and can be wrong (the card list had two swapped levels once). Read both from the picture: the level is the number or X at the top left, the initiative the big number in the middle. Write what is printed, and when it differs from the task put `# check: the task said level 2` above it and say so in your reply.
- Check every number twice, in particular enhancement markers, ranges, targets (`all`, `all allies`, `self`, `2 enemies`) and costs. Read every pill of every action: a missing range or target is the most common mistake.
- Do not move text into a different action than the one it stands under.
- Put each doubt in a YAML comment on the line above the item: `# check: the second icon may be ward`.
- Reply in at most 120 words: the output file, the cards done, the `%?...%` icons and any new class tokens.
- Augment cards: the band text under the AUGMENT ribbon is the standing effect (active while the card is in play). Always write a `- divider` after the band, then the actions done once when the card is played. The converter turns the part before the first divider of a half with `namedAbility` into `augment`.
