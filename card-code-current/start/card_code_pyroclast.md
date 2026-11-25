# Pyroclast (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Cooling
initiative: 75
level: 1
top:
  actions:
  - custom: "Replace one 1-hex hazardous terrain tile in an unoccupied hex within %range%4 with one 1-hex obstacle tile. All enemies adjacent to that tile suffer %damage%2."
  - mandatory:
    - earth
  xp: 1
bottom:
  actions:
  - heal: 5
    enhancement: [circle]
    sub:
    - self
  - mandatory:
    - custom: "On your next three move abilities, add -1 %move%."
  - tokens: [0, 0, 0]
  duration: persistent

name: Quenched Rage
initiative: 30
level: 1
top:
  actions:
  - push: 3
    enhancement: [square]
  - optional:
    - consume: [earth]
    - custom: "Double the %damage% inflicted by any hazardous terrain the target moved through, then, regardless of your line-of-sight, replace those hazardous terrain tiles with obstacle tiles of the same size, %xp1%."
bottom:
  actions:
  - custom: "On your next three attacks, add -1 %attack%, then double the value of your following attack."
  - tokens: [0, 0, 0, 1]
  - mandatory:
    - earth
  duration: persistent

name: Flowing Fire
initiative: 20
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
    - hex: eet_et_et_s
  - optional:
    - consume: [fire]
    - custom: "Create hazardous terrain in each empty red hex of the attack ability, %xp1%."
    noLine: true
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - mandatory:
    - custom: "Now and at the start of your next two turns, suffer %damage%1."
  - tokens: [0, 0]
  duration: persistent

name: Eruption
initiative: 47
level: 1
top:
  actions:
  - custom: "Create one 1-hex obstacle tile in an empty hex within %range%5."
  - custom: "Create 1-hex hazardous terrain tiles in all occupied featureless hexes adjacent to the obstacle. The figures in those hexes suffer %damage%4."
  - mandatory:
    - consume: [fire/earth]
  xp: 2
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [square]
  - mandatory:
    - fire

name: Lava Bomb
initiative: 53
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - custom: "Create one 1-hex hazardous terrain tile in the featureless hex occupied by the target."
  - mandatory:
    - fire
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Igneous Path
initiative: 18
level: 1
top:
  actions:
  - custom: "Designate a featureless hex within %range%4. Create 1-hex hazardous terrain tiles in that hex and all featureless hexes on a direct path to it. Figures occupying hexes with the created tiles suffer %damage%3. Gain %xp1% for each figure damaged."
  - mandatory:
    - fire
  lost: t
bottom:
  actions:
  - move: 1
  - optional:
    - consume: [fire]
    - custom: "%xp1%"
    - custom: "+1 %move%"
  - custom: "Create one 1-hex hazardous terrain tile in each featureless hex you leave during the movement."

name: Under Pressure
initiative: 85
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to at least 2 hexes with obstacles, objectives, or walls."
bottom:
  actions:
  - custom: "All adjacent enemies suffer %damage%1."
  - loot: 1
  - mandatory:
    - earth

name: Melted Armor
initiative: 62
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +1 %attack%, %pierce%3, and gain %xp1% if the target is occupying hazardous terrain."
  - mandatory:
    - fire
bottom:
  actions:
  - mandatory:
    - custom: "All attacks targeting you add +1 %attack%."
  - custom: "On your next 3 attacks, add +1 %attack%."
  - tokens: [0, 0, 1]
  duration: persistent

name: Liquid Stone
initiative: 28
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [square]
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - push: 1
    sub:
    - range: 1
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %push%"

name: Cloud of Ash
initiative: 23
level: 1
top:
  actions:
  - custom: "Designate a hex containing an obstacle tile within %range%4. Destroy the tile to perform:"
  - attack: 1
    sub:
    - target: "all adjacent enemies"
    - push: 1
    - muddle
  - custom: "Perform the attacks as if you were occupying the designated hex."
  - mandatory:
    - earth
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Replace one or two adjacent 1-hex hazardous terrain tiles in unoccupied hexes with 1-hex obstacle tiles. If you do, %earth% and %xp1%."

name: Wildfire
initiative: 72
level: X
top:
  actions:
  - custom: "Destroy one adjacent hazardous terrain tile. If you do, on your next three attacks, add %wound%, %poison%, and %fire%."
  - tokens: [0, 1, 0]
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - mandatory:
    - wound: ''
      sub:
      - self
  - wound: ''
    sub:
    - target: 2
    - range: 1

name: Force of the Earth
initiative: 15
level: X
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
    - pull: 2
    - muddle
bottom:
  actions:
  - custom: "Destroy one adjacent obstacle tile. If you do, on the next two heals targeting you, add +3 %heal%."
  - tokens: [0, 1]
  duration: persistent

name: Metamorphic Rock
initiative: 68
level: X
top:
  actions:
  - shield: 1
  - divider
  - retaliate: 1
  - mandatory:
    - earth
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Move the character token on one of your persistent abilities forward one space."
  - move: 3
    enhancement: [circle]

name: Searing Smoke
initiative: 45
level: 2
top:
  actions:
  - attack: 2
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [fire]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  - optional:
    - consume: [earth]
    - custom: "%?grey diamond with question mark%"
    - custom: "%xp1%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - custom: "All enemies moved through gain %muddle%."

name: Deep Fury
initiative: 38
level: 2
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +1 %attack%, %push%2, and gain %xp1% if you are occupying hazardous terrain."
  - custom: "If you are occupying hazardous terrain, perform:"
  - heal: 2
    sub:
    - self
bottom:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "On your next attack targeting an enemy occupying hazardous terrain, double the value of the attack."
  - tokens: [2]
  lost: t
  duration: persistent

name: Living Magma
initiative: 22
level: 3
top:
  actions:
  - custom: "Now and at the start of your next two turns, perform:"
  - attack: 1
    sub:
    - target: "1 enemy adjacent to hazardous terrain"
    - pierce: 2
    - wound
    - mandatory:
      - fire
  - tokens: [0, 1]
  duration: persistent
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - custom: "Move one adjacent 1-hex hazardous terrain tile up to two hexes. If it enters any hex occupied by a figure, that figure suffers hazardous terrain damage."

name: Hardened Spike
initiative: 80
level: 3
top:
  actions:
  - attack: 5
  - custom: "Add +1 %attack% and gain %xp1% if the target is occupying hazardous terrain."
  - custom: "Now and at the start of your next two turns, suffer %damage%1."
  - multi:
    - mandatory:
      - earth
    - tokens: [0]
    - tokens: [0]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Add +1 %attack% to your next attack this round targeting an enemy adjacent to an obstacle."
  - optional:
    - consume: [earth]
    - custom: "+3 %attack% instead, %xp1%."
    noLine: true
  duration: round

name: Hand of Flame
initiative: 29
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - muddle
  - custom: "Create one 1-hex hazardous terrain tile in the featureless hex occupied by the target."
  - mandatory:
    - fire
  xp: 1
bottom:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - wound

name: Heat Wave
initiative: 8
level: 4
top:
  actions:
  - custom: "All adjacent enemies suffer %damage%2."
  - push: 2
    sub:
    - target: "all"
    - range: 3
  - optional:
    - consume: [fire]
    - custom: "%xp1%"
    - custom: "+1 %range%"
  - mandatory:
    - custom: "At the start of your next turn, suffer %damage%2."
  - tokens: [0]
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - optional:
    - consume: [fire]
    - custom: "Create one 1-hex obstacle in an adjacent empty hex."
    - mandatory:
      - earth
    noLine: true

name: Rain of Fire
initiative: 21
level: 5
top:
  actions:
  - custom: "Create two 1-hex hazardous terrain tiles in featureless hexes within %range%3."
  - custom: "All allies and enemies occupying or adjacent to any of those hexes suffer %damage%1."
  xp: 1
bottom:
  actions:
  - move: 5
    enhancement: [circle]
    sub:
    - jump

name: Magma Orbs
initiative: 82
level: 5
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - target: 2
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [fire/earth]
    - custom: "%xp1%"
    - custom: "+1 %target%"
bottom:
  actions:
  - custom: "Create one 1-hex hazardous terrain tile in an adjacent empty hex."
  - pull: 1
    sub:
    - range: 2

name: Return to the Source
initiative: 14
level: 6
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
    - pull: 3
  - mandatory:
    - custom: "When the next enemy would suffer %damage% from entering a hazardous terrain hex, negate the %damage%."
  - tokens: [0]
  - mandatory:
    - fire
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Ignore hazardous terrain during this movement."
  - heal: X
    sub:
    - self
  - custom: "where X is the number of different hazardous terrain hexes you entered during the move ability."

name: Obsidian Shield
initiative: 19
level: 6
top:
  actions:
  - custom: "On the next four sources of %damage% you suffer from attacks targeting you, gain %shield%1."
  - tokens: [0, 0, 0, 1]
  - custom: "When your token moves off the last use slot, the attacking enemy suffers %damage%5, and you create one 1-hex obstacle in an adjacent empty hex."
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - custom: "Suffer %damage%2 or destroy an adjacent obstacle."
  - custom: "Negate the next %damage% you suffer this round."
  - mandatory:
    - earth
  duration: round

name: Erupting Rage
initiative: 70
level: 7
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [square]
  - custom: "You may push the target into hexes with 1-hex obstacle tiles. In each case, regardless of your line-of-sight, replace the obstacle tile with one 1-hex hazardous terrain tile, and the target suffers hazardous terrain damage."
bottom:
  actions:
  - custom: "Create one 1-hex hazardous terrain tile in an adjacent empty hex."
  - move: 3
    enhancement: [square]
  - custom: "Create one 1-hex hazardous terrain tile in an adjacent empty hex."

name: Swelter
initiative: 32
level: 7
top:
  actions:
  - custom: "Designate a hex containing a hazardous terrain tile within %range%4. Destroy the tile to perform:"
  - attack: 3
    sub:
    - target: "all enemies occupying or adjacent to the designated hex"
    - range: 5
    - pierce: 2
  - mandatory:
    - fire
  xp: 1
bottom:
  actions:
  - custom: "All enemies in the same room as you suffer %damage% equal to the number of hazardous tiles in the room, up to a maximum of %damage%5 per enemy."
  xp: 2
  lost: t

name: Feed the Beast
initiative: 27
level: 8
top:
  actions:
  - custom: "Designate a hex containing a hazardous terrain tile within %range%3. Destroy one adjacent (to you) obstacle tile to create two 1-hex hazardous terrain tiles in featureless hexes adjacent to the designated hex. Each enemy occupying the designated hex or the hexes with the created tiles suffers %damage%5."
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Destroy one adjacent hazardous terrain tile to cause the target of your next attack this round to suffer hazardous terrain damage after the attack."
  duration: round

name: Cinder Lance
initiative: 90
level: 8
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - optional:
    - consume: [fire]
    - mandatory:
      - damage: 2
        sub:
        - self
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - optional:
    - consume: [earth]
    - mandatory:
      - damage: 1
        sub:
        - self
    - custom: "%xp1%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - move: 2
  - divider
  - group:
    - attack: 3
      enhancement: [square]
    - hex: et_t_s

name: Stone Armor
initiative: 9
level: 9
top:
  actions:
  - custom: "Whenever you would suffer %damage%, you may destroy an adjacent obstacle to negate the %damage%."
  - mandatory:
    - earth
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - divider
  - shield: X
  - custom: "where X is the number of adjacent hexes with obstacles or objectives."
  duration: round

name: Calamity
initiative: 35
level: 9
top:
  actions:
  - custom: "Create three 1-hex hazardous terrain tiles in featureless hexes and three 1-hex obstacle tiles in empty hexes in the same room as you. All enemies in this room suffer %damage%4."
  - optional:
    - consume: [fire]
    - custom: "+2 hazardous terrain tiles."
    noLine: true
  - optional:
    - consume: [earth]
    - custom: "+2 obstacle tiles"
    noLine: true
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "Control all enemies in the same room as you:"
  - move: 1
  - custom: "with you controlling the abilities."
