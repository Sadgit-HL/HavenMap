# Reading character ability cards into card code

You read pictures of character ability cards (Gloomhaven 2nd edition style, 433 x 600 or larger) and write each card as card code, the structured text the owner writes cards with. Accuracy and honesty about doubt matter more than speed. Open every picture with the Read tool and look at it carefully. Each card comes as the whole picture and as two enlarged halves (top half, bottom half): read the whole picture first for the structure (how many actions, where the pills, banners and flags are), then read each enlarged half for the details (icons, numbers, enhancement markers, hexes), and check every number and icon there.

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
- `hex: ett_ttt_ett` draws an area: columns left to right separated by `_`, from top to bottom in each column; the letters are those of the card creator: `t` target (a red hex with an X), `s` self (grey), `a` ally, `b` a blank hex, `e` no hex (spacing, used to position the others), `x` a hex-sized enhancement dot; `d`, `h`, `f`, `c` are coloured hexes. Count the hexes and the dots on the card. Known shapes: the flower of 7 red hexes is `ett_ttt_ett`; `ett_st` is three red-and-grey hexes; `etx_xtt_etx` four red hexes with two dots; `ete_tt_tst_tt_ete` eight red hexes around a grey self hex. Use the same cell padding (`e`) as these: columns of the flower are three cells tall. Areas are the hardest part to read: when the shape is not one of these, write your best reading and put `# check: hex` above it.
- `summon:` for a summon stat block: `stats: [health, move, attack, range]` (a dash for none), `name:`, `enhancement: [square, square, square, 0]` (one entry per stat, 0 for none), and `special:` with the icons under the stats.
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

- Action icons in text, written `%name%`: attack (a wand with sparkles), move (a boot with speed lines), heal (a drop with a cross), range (an arrow in a circle), target (a bullseye), push (a tower in a grey diamond), pull, pierce (arrows in an orange diamond), damage (a spiky gear-like star), teleport (stacked discs with ripples), loot (an arrow up from a flat base), shield, retaliate (a white fist), jump (a curved arrow landing on a base, usually a pill next to a move: `- jump` in `sub:`), flying, xp (a black burst with a number: `%xp1%`), recover (a card with a check mark), lost (a card with a red X), persistent (the S-loop with a red arrow), round (the card with a red bar and a circular arrow, the round bonus; inside a dashed box at its right end `%round%`, as a flag of the half `duration: round`).
- The card creator knows these conditions (write them as `%name%` in text, `- name` in a `sub:` list, `- name:` or `- name: value` as an action): bane, blind, bless, brittle, chill, curse, disarm, dodge, empower, enfeeble, immobilize, impair, infect, invisible, muddle, pierce, poison, pull, push, regenerate, rupture, safeguard, strengthen, stun, swing, taunt, ward, wound; elements earth, fire, air (or wind), ice, light, dark, wild, with `/` for "or" (`light/dark`) and an inline consume icon written by adding `c` (`%firec%`). Icon modifiers: `%move-s%` no shadow, `%bane-i%` inverted. Other action keys: `classToken: 0` (the first class token as an action), `mode:` (a fast/slow style block with an `icon:`), `corner:` (the bottom-left corner icon), `namedAbility:` with `name:` (the small keyword banner at the top left of a half, like IRRITATION).
- Conditions and elements: wound (orange drip), poison (grey skull), muddle (brown ?), stun (blue starburst), immobilize (red boot), disarm, curse (purple lightning), bless (gold circle and triangle), strengthen (blue arm), ward (pink shield), regenerate (pink lines), safeguard (green heart), invisible (black dotted figure), bane, brittle, impair, infect, chill; light, dark, fire, ice, air, earth, wild.
- Attack modifier cards in text: `%amd-double%` (x2), `%amd-null%` (miss), `%amd-minus-1%`, and for the rolling icon (two arrows in a circle) `%amd-rolling%`.
- Class icons: a resource that is spent or gained, a token placed on the map, or a mechanic word. Name them after what they are called on the card or in the first card you see them on, in lower case, and use the same token every time (the +1 sticker printed in text is `%enhance1%`; Hail: `%resol%` the white head with a star, the resource Resolve; `%irri%` the head with a burst on the Irritation ribbon. Cassandra: `%rift%` the overlay token, `%classToken0%` where the first class token is meant, `%scry%`). The owner's tool knows the tokens listed in the examples; a new class gets new tokens, list them in your reply.
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

- Level and initiative are given in your task; check them against the card and say so if they differ.
- Check every number twice, in particular enhancement markers, ranges, targets (`all`, `all allies`, `self`, `2 enemies`) and costs. Read every pill of every action: a missing range or target is the most common mistake.
- Do not move text into a different action than the one it stands under.
- Put each doubt in a YAML comment on the line above the item: `# check: the second icon may be ward`.
- Reply in at most 120 words: the output file, the cards done, the `%?...%` icons and any new class tokens.
