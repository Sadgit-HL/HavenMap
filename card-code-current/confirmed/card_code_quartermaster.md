# Quartermaster (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Booster Pack
initiative: 73
level: 1
top:
  actions:
  - custom: "Shuffle the %supply-item% item supply face-down and randomly draw five cards. Give the drawn items to any number of adjacent allies and self, giving no more than three of the items to yourself."
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "%recover% one of your spent items."
  - move: 2
    enhancement: [circle]

name: Readied Blade
initiative: 98
level: 1
top:
  actions:
  - group:
    - custom: "%supplies-consume% :"
    - multi:
      - custom: "%recover% your items"
      - custom: ","
      - custom: "%xp1%"
  - divider
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - move: 4

name: Crushing Hammer
initiative: 33
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
      sub:
      - stun
    - hex: ex_tt_stx
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Give one adjacent ally or self the <i>Iron Plate</i> item to gain %xp1%."

name: Hastened Step
initiative: 26
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - divider
  - move: 1
    enhancement: [circle]
  - custom: "Give one adjacent ally the <i>Sharpened Dirk</i> item to gain %xp1%."
bottom:
  actions:
  - move: 4

name: Bladed Boomerang
initiative: 44
level: 1
top:
  actions:
  - group:
    - attack: 2
    - hex: ett_tet_est
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Gain 10 %supplies%."

name: Impaling Spear
initiative: 62
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [square]
    - hex: stt
  xp: 1
bottom:
  actions:
  - attack: 1
    sub:
    - target: "1 enemy within 2 hexes"
    - wound

name: Light Javelin
initiative: 81
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
bottom:
  actions:
  - loot: 2

name: Cleave and Thrust
initiative: 39
level: 1
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
    - hex: et_st_ex
  - custom: "Give one ally within %range%2 the <i>Sturdy Spear</i> item to gain %xp1%."
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Gain 10 %supplies%."

name: Iron Bulwark
initiative: 17
level: 1
top:
  actions:
  - group:
    - custom: "%supplies-consume% :"
    - multi:
      - custom: "%recover% your items"
      - custom: ","
      - custom: "%xp1%"
  - divider
  - shield: 1
    enhancement: [square]
  duration: round
bottom:
  actions:
  - custom: "Grant all adjacent allies and self:"
  - shield: 1
  duration: round

name: Proficiency
initiative: 52
level: 1
top:
  actions:
  - custom: "During each of your turns, the first time you use an item with a %lost% icon, add +1 %attack% to all your melee attacks for the turn."
  - custom: "Whenever you %supplies-consume% to %recover% an item with a gold cost of 30 or greater, you may gain one random item from the %supply-item% item supply."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Add +1 %retaliate% to all <i>Barbed Strip</i> items and +1 %shield% to all <i>Iron Plate</i> items."
  - custom: "Whenever you rest, gain the <i>Barbed Strip</i> or <i>Iron Plate</i> item."
  xp: 2
  lost: t
  duration: persistent

name: Provisions
initiative: 48
level: 1
top:
  actions:
  - custom: "Gain 10 %supplies%."
  - custom: "Gain the <i>Scroll of Relocation</i> item."
bottom:
  actions:
  - move: 4

name: Caustic Bolt
initiative: 88
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
    - pierce: 2
  - custom: "Give one adjacent ally the <i>Corrosive Coating</i> item."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "One adjecent ally may %recover% one of their spent items."

name: Scroll of Recall
initiative: 19
level: X
top:
  actions:
  - pull: 2
    enhancement: [square]
    sub:
    - target: "1 ally"
    - range: 3
      enhancement: [square]
  - divider
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 1
      enhancement: [square]
  - mandatory:
    - earth
bottom:
  actions:
  - custom: "Gain the <i>Barbed Strip</i> item."
  - pull: 2
    sub:
    - target: 2
    - range: 3
    - muddle

name: Sharpening Kit
initiative: 23
level: X
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 1
  - divider
  - group:
    - custom: "%supplies-consume% :"
    - multi:
      - custom: "%recover% the target's items."
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "You and all adjacent allies add +1 %attack% to all attacks this round."
  duration: round

name: Scroll Case
initiative: 95
level: 2
top:
  actions:
  - custom: "Gain 10 %supplies%."
  - custom: "Give one adjacent ally the <i>Scroll of Embers</i> item."
  - custom: "Give one adjacent ally the <i>Scroll of Foresight</i> item to gain %xp1%."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Give one adjacent ally the <i>Scroll of Relocation</i> item."

name: Lethal Arsenal
initiative: 18
level: 2
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Gain the <i>Sharpened Dirk</i> and <i>Sturdy Spear</i> items."
  xp: 2
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [square]
  - divider
  - move: 1
    enhancement: [circle]

name: Quiver of Arrows
initiative: 61
level: 3
top:
  actions:
  - group:
    - custom: "%supplies-consume% :"
    - multi:
      - custom: "%recover% your items"
      - custom: ","
      - custom: "%xp1%"
  - divider
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
      enhancement: [square]
    - range: 4
bottom:
  actions:
  - custom: "On the next four ranged attack abilities performed by adjacent allies, add +1 %target%."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent

name: Concussive Snare
initiative: 89
level: 3
top:
  actions:
  - custom: "Give one adjacent ally the <i>Weighted Bolas</i> item to gain %xp1%."
  - move: 1
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [square]
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Gain 10 %supplies%."

name: Hammer and Anvil
initiative: 21
level: 4
top:
  actions:
  - custom: "Give one ally within %range%2 the <i>Sturdy Spear</i> item."
  - custom: "Gain the <i>Barbed Strip</i> or <i>Iron Plate</i> item."
  - shield: 1
    enhancement: [square]
  duration: round
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Giant Club
initiative: 40
level: 4
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - muddle
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - custom: "You may give up to four items of your choice from the %supply-item% item supply to any allies occupying hexes adjacent to any hexes you entered during the move ability. Gain 10 %supplies% for each ally you gave an item."
  xp: 2
  lost: t

name: Scroll of Judgment
initiative: 12
level: 5
top:
  actions:
  - mandatory:
    - custom: "Suffer %damage%2."
  - custom: "All enemies within %range%4 suffer %damage%2."
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - shield: 1
    enhancement: [square]
  - custom: "After the next attack targeting you this round, %recover% one of your spent items and gain %xp1%."
  duration: round

name: Set Up Shop
initiative: 41
level: 5
top:
  actions:
  - custom: "At the end of each of your turns, gain 10 %supplies%."
  - custom: "Whenever an ally ends their move or teleport ability in a hex adjacent to you, you may %supplies-consume% to %recover% that ally's items."
  - mandatory:
    - custom: "You cannot perform move abilities."
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Give one adjacent ally the <i>Scroll of Foresight</i> item."
  - custom: "At the end of the round, perform:"
  - heal: 2
    sub:
    - target: "all allies"
    - range: 1
  duration: round

name: Scroll of Lightning
initiative: 77
level: 6
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - mandatory:
    - custom: "All allies and enemies adjacent to the target suffer %damage%1."
  - mandatory:
    - air
bottom:
  actions:
  - custom: "Gain the <i>Corrosive Coating</i> item."
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - pierce: 1
    - muddle

name: Continual Supply
initiative: 86
level: 6
top:
  actions:
  - custom: "Gain 20 %supplies%."
  - group:
    - custom: "%supplies-consume% :"
    - multi:
      - custom: "%recover% your and adjacent allies' items, %xp1%."
bottom:
  actions:
  - custom: "On your next three turns that you end with 0 %supplies%, gain 30 %supplies%."
  - tokens: [1, 0, 1]
  lost: t
  duration: persistent

name: Twin Lances
initiative: 32
level: 7
top:
  actions:
  - group:
    - attack: 3
    - hex: et_t_sttx
  xp: 1
bottom:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
    - hex: sttx
  - custom: "Give one adjacent ally the <i>Sturdy Spear</i> item."
  xp: 1

name: Tools of War
initiative: 84
level: 7
top:
  actions:
  - custom: "One adjacent ally may %recover% one of their spent items."
  - move: 1
    enhancement: [circle]
  - custom: "Give one adjacent ally the <i>Scroll of embers</i> and <i>Weighted Bolas</i> items to gain %xp1%."
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - loot: 1
  - custom: "If you loot at least one money token, gain 10 %supplies%."

name: Scroll of Blizzards
initiative: 46
level: 8
top:
  actions:
  - group:
    - attack: 1
      sub:
      - range: 2
    - hex: eexx_ett_ett_tt
  - mandatory:
    - ice
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - group:
    - custom: "%supplies-consume% :"
    - multi:
      - custom: "%recover% your and adjacent allies' items, %xp1%."
  - divider
  - move: 2
    enhancement: [circle]

name: Armed to the Teeth
initiative: 10
level: 8
top:
  actions:
  - custom: "Give one adjacent ally the <i>Barbed Strip</i> and <i>Sharpened Dirk</i> items to gain %xp1%."
  - custom: "Grant one adjacent ally or self:"
  - shield: 2
    enhancement: [square]
  duration: round
bottom:
  actions:
  - custom: "%recover% one of your spent items."
  - move: 3
    enhancement: [circle]
  - custom: "Gain the <i>Scroll of Foresight</i> item."

name: Reinforced Steel
initiative: 56
level: 9
top:
  actions:
  - custom: "At the end of each of your turns, you may shuffle the %supply-item% item supply face-down and draw one random card to give that item to an ally within %range%2."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "At the end of each round, %recover% one of your spent items."
  xp: 2
  lost: t
  duration: persistent

name: Bag of Holding
initiative: 91
level: 9
top:
  actions:
  - loot: 3
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Gain 20 %supplies%."
