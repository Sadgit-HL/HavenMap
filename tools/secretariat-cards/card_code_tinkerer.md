# Tinkerer (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Potent Potable
initiative: 46
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
    - muddle
bottom:
  actions:
  - custom: "On your next four single-target heal abilities, add +1 %target%."
  - tokens: [1, 1, 1, 0]
  lost: t
  duration: persistent

name: Harmless Contraption
initiative: 74
level: 1
top:
  actions:
  - summon:
      name: Decoy
      stats: [10, 3, -, -]
      enhancement: [heal, move]
  xp: 3
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Flamethrower
initiative: 16
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - pierce: 2
      - wound
    - hex: ex_tt_stx
  - mandatory:
    - fire
  xp: 3
  lost: t
bottom:
  actions:
  - custom: "Grant all adjacent allies and self:"
  - shield: 1
  duration: round

name: Potent Potables
initiative: 73
level: 1
top:
  actions:
  - multi:
    - stun: ''
      enhancement: [diamond]
      sub:
      - target: 3
        enhancement: [square]
      - range: 3
    - custom: "Gain %xp1% for each enemy targeted."
  - mandatory:
    - light
  lost: t
bottom:
  actions:
  - heal: 2
    enhancement: [circle]
    sub:
    - range: 4

name: Ink Bomb
initiative: 80
level: 1
top:
  actions:
  - multi:
    - group:
      - attack: 4
        enhancement: [diamond]
        sub:
        - range: 3
        - muddle
      - hex: etx_tt
    - custom: "Gain %xp1% for each enemy targeted."
  - mandatory:
    - dark
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Net Shooter
initiative: 19
level: 1
top:
  actions:
  - multi:
    - group:
      - attack: 3
        enhancement: [diamond]
        sub:
        - range: 3
        - immobilize
      - hex: etx_tt
    - custom: "Gain %xp1% for each enemy targeted."
  lost: t
bottom:
  actions:
  - immobilize: ''
    enhancement: [diamond]
    sub:
    - range: 1
  - divider
  - move: 3
    enhancement: [circle]

name: Stun Shot
initiative: 20
level: 1
top:
  actions:
  - stun: ''
    sub:
    - range: 3
bottom:
  actions:
  - move: 1
  - divider
  - loot: 1

name: Reinvigorating Elixir
initiative: 37
level: 1
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 3
bottom:
  actions:
  - custom: "One ally within %range%3 may %recover% all their cards from their discard pile."
  xp: 3
  lost: t

name: Restorative Mist
initiative: 17
level: 1
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 3
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 1
    sub:
    - target: "all allies"
    - range: 1

name: Jet Propulsion
initiative: 34
level: 1
top:
  actions:
  - attack: 2
    sub:
    - target: 2
    - range: 3
bottom:
  actions:
  - move: 8
    enhancement: [circle]
    sub:
    - jump
  xp: 2
  lost: t

name: Enhancement Field
initiative: 61
level: 1
top:
  actions:
  - custom: "Place the \"Enhancement Field\" token in an empty hex within %range%3."
  - custom: "Add +1 %attack% to all attacks you and all allies perform while within %range%1 of the token."
  xp: 3
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "You and all adjacent allies add +1 %attack% to all attacks this round."
  duration: round

name: Toxic Bolt
initiative: 76
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
    - poison
  - mandatory:
    - earth
bottom:
  actions:
  - attack: 6
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [square]
  xp: 3
  lost: t

name: Gas Canister
initiative: 22
level: X
top:
  actions:
  - custom: "Create one %damage%4 ,%muddle% trap in an adjacent empty hey."
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Volatile Concoction
initiative: 18
level: X
top:
  actions:
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3
  - custom: "The target may %recover% one level 1 card from their discard pile."
bottom:
  actions:
  - custom: "Create one %damage%2 ,%poison% trap in an adjacent empty hey."

name: Hook Gun
initiative: 72
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
    - pull: 2
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - loot: 2
  xp: 1
  lost: t

name: Repulsor Gun
initiative: 35
level: 2
top:
  actions:
  - attack: 3
    sub:
    - range: 3
    - push: 1
      enhancement: [square]
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - push: 2
    enhancement: [square]
    sub:
    - range: 2

name: Crank Bow
initiative: 23
level: 2
top:
  actions:
  - attack: 8
    enhancement: [diamond]
    sub:
    - range: 5
  xp: 3
  lost: t
bottom:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - target: 2
    - range: 2

name: Teleportation Pad
initiative: 62
level: 3
top:
  actions:
  - custom: "Place two \"Teleportation Pad\" tokens in empty hexes within %range%5."
  - custom: "You and all allies may threat the two hexes containing the tokens as being adjacent to each other during move abilities."
  xp: 3
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 4
    enhancement: [circle]

name: Stamina Booster
initiative: 48
level: 3
top:
  actions:
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - range: 3
bottom:
  actions:
  - custom: "One ally within %range%3 may %recover% one card from their lost pile."
  xp: 3
  lost: t

name: Dangerous Contraption
initiative: 10
level: 4
top:
  actions:
  - summon:
      name: Battle Bot
      stats: [7, 3, 3, -]
      enhancement: [heal, move, attack]
  xp: 3
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Grant one adjacent ally:"
  - shield: 1
    enhancement: [diamondPlus]
  duration: round

name: Proximity Mine
initiative: 14
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "All enemies adjacent to the target gain %muddle%."
bottom:
  actions:
  - custom: "Create one %damage%2 ,%immobilize% trap in an empty hey within %range%2 ."

name: Noxious Vials
initiative: 75
level: 5
top:
  actions:
  - attack: 1
    sub:
    - range: 3
    - wound
    - disarm
bottom:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 3
      - poison
    - hex: etx_tt
  - custom: "Gain %xp1% for each enemy targeted."
  lost: t

name: Disintegration Beam
initiative: 36
level: 5
top:
  actions:
  - custom: "Kill all enemies in the targeted area whose current hit point value is less than or equal to 5. Gain %xp1% for each enemy killed."
  - hex: eet_et_et_t_s
  lost: t
bottom:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - range: 3

name: Invigorating Aerosol
initiative: 21
level: 6
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 2
  - divider
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 2
  - mandatory:
    - air
bottom:
  actions:
  - custom: "At the end of this and your next four turns, perform:"
  - heal: 2
    sub:
    - range: 5
    - safeguard
    - ward
    - strengthen
    - bless
  - tokens: [1, 0, 1, 0, 1]
  lost: t
  duration: persistent

name: Auto Turret
initiative: 32
level: 6
top:
  actions:
  - custom: "At the end of this and your next three turns, perform the following twice:"
  - attack: 2
    sub:
    - range: 5
    - pierce: 1
  - tokens: [1, 1, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - range: 3
  - divider
  - move: 2
    enhancement: [circle]
  - divider
  - poison: ''
    enhancement: [diamond]
    sub:
    - range: 3

name: Murderous Contraption
initiative: 84
level: 7
top:
  actions:
  - summon:
      name: Kill Bot
      stats: [8, 4, 3, -]
      special:
      - hex: et_t_s
      enhancement: [heal, move, attack]
  xp: 3
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - range: 3

name: Pernicious Fogger
initiative: 71
level: 7
top:
  actions:
  - custom: "Place the \"Pernicious Fogger\" token in an empty hex within %range%3."
  - mandatory:
    - custom: "At the end of each of their turns, all allies and enemies within %range%1 of the token suffer %damage%2."
  xp: 3
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - range: 3

name: Cryonic Snare
initiative: 15
level: 8
top:
  actions:
  - custom: "Create one %damage%4 ,%wound%, %stun% trap in an empty hey within %range%2 ."
  - mandatory:
    - ice
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Grant one adjacent ally:"
  - retaliate: 2
    enhancement: [diamondPlus]
  duration: round

name: Harsh Stimulants
initiative: 27
level: 8
top:
  actions:
  - custom: "Grant one ally within %range%3:"
  - mandatory:
    - custom: "Suffer %damage%2."
  - move: 2
    enhancement: [square]
  - divider
  - attack: 6
    enhancement: [square]
bottom:
  actions:
  - custom: "Control one enemy within %range%3 :"
  - attack: 2
    sub:
    - target: "all adjacent enemies"
  - custom: "then that enemy gains %stun%."
  xp: 3
  lost: t

name: Gravity Bomb
initiative: 85
level: 9
top:
  actions:
  - custom: "Place the \"Gravity Bomb\" token in an empty hex within %range%4. At the end of your next turn, perform:"
  - pull: 2
    sub:
    - target: "all enemies within %range%2 of the token"
  - custom: "Pull toward the token. Then any enemy occupying the hex containing the token suffers %damage%5, all enemies occupying hexes adjacent to the token suffer %damage%1, and you discard this card."
  duration: persistent
bottom:
  actions:
  - group:
    - attack: 2
      sub:
      - range: 3
      - immobilize
    - hex: et_tt

name: Chimeric Formula
initiative: 33
level: 9
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3
    - strengthen
    - bless
  - custom: "The target of the heal ability may immediately play up to two cards from their hand, performing at most one top and one bottom action of the cards."
bottom:
  actions:
  - custom: "One ally within %range%3 may %recover% one card from the lost pile of one ally adjacent to them."
  xp: 3
  lost: t
