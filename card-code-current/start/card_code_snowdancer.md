# Snowdancer (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Blizzard
initiative: 71
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
      sub:
      - range: 3
      - muddle
    - hex: ett_ttt_ett
  - mandatory:
    - ice
    - air
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - push: 2
    sub:
    - range: 1

name: Enticing Breeze
initiative: 76
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
    - pull: 2
    - custom: "Pull toward one of your allies."
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - group:
    - pull: 1
      enhancement: [square]
      sub:
      - range: 2
    - hex: ettt_tttt_ettt

name: Chilling Impact
initiative: 31
level: 1
top:
  actions:
  - custom: "At the start of each of your turns, you may %ice%. If you do, at the end of each of your forced movement abilities performed this turn, all enemies moved with the ability suffer %damage%1."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - push: 2
    sub:
    - target: "all:1"
    - range: 1

name: Gathering Force
initiative: 89
level: 1
top:
  actions:
  - custom: "At the end of each of your turns, you may %ice%/%air%. Reduce all of your %push%, %pull%, and other forced movement effects by one."
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - loot: 1
  - custom: "Gain advantage on your next attack this round."
  duration: round

name: Nature's Breath
initiative: 90
level: 1
top:
  actions:
  - summon:
      name: Snow Fox
      stats: [5, 3, 2, -]
      enhancement: [heal, move, attack]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [square]
    sub:
    - jump
  - mandatory:
    - air

name: Lifting Gust
initiative: 27
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
    - push: 4
  - mandatory:
    - air
  xp: 1
bottom:
  actions:
  - move: 8
    enhancement: [circle]
    sub:
    - jump
  - mandatory:
    - ice
  xp: 1
  lost: t

name: Snowball
initiative: 23
level: 1
top:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - range: 3
    - regenerate
  - mandatory:
    - ice
bottom:
  actions:
  - custom: "On your next five attacks, add +X%attack%, where X is the number of use slots the character token has passed (0, 1, 2, 3, 4)."
  - tokens: [0, 1, 0, 0, 1]
  lost: t
  duration: persistent

name: Whiteout
initiative: 21
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: 3
      enhancement: [square]
    - range: 4
  - custom: "Control all targets of the attack ability:"
  - move: 1
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
  - divider
  - heal: 2
    sub:
    - range: 1
      enhancement: [square]

name: Cross Winds
initiative: 32
level: 1
top:
  actions:
  - custom: "Grant one ally:"
  - move: 2
    enhancement: [square]
  - divider
  - attack: 3
    enhancement: [square]
bottom:
  actions:
  - pull: 3
    sub:
    - range: 4
  - optional:
    - custom: "%target% 1 ally or enemy."
  - move: 3
    enhancement: [square]

name: Frigid Growth
initiative: 70
level: 1
top:
  actions:
  - custom: "Create one 1-hex hazardous terrain tile in a featureless hex within %range%3."
  - strengthen: ''
  - optional:
    - custom: "%target% one ally adjacent to the hex."
  - mandatory:
    - ice
bottom:
  actions:
  - move: 2
    enhancement: [square]
    sub:
    - jump
  - mandatory:
    - ice

name: Cold Therapy
initiative: 20
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
    - muddle
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - custom: "Once at the start of each of your turns, you may %ice% or %air% to perform:"
  - heal: 2
    sub:
    - range: 2
  xp: 2
  lost: t
  duration: persistent

name: White Winds
initiative: 11
level: X
top:
  actions:
  - group:
    - attack: 3
    - hex: ett_tx_et_xt_st
  - optional:
    - consume: [air]
    - push: 1
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  xp: 1
  lost: t
bottom:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - range: 2
      enhancement: [square]
  - custom: "If an ally was the target of the heal ability, grant that ally:"
  - move: 2

name: Blinding Vortex
initiative: 31
level: X
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
    - hex: s_tt_ttt_tx
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump

name: The Spirit's Call
initiative: 45
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [air]
    - curse: ''
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - push: 4
    enhancement: [square]
    sub:
    - target: "allies:3"
    - range: 3
    - bless
  - mandatory:
    - light
  xp: 1
  lost: t

name: Birds in a Tempest
initiative: 18
level: 2
top:
  actions:
  - summon:
      name: 2 White Owls
      stats: [3, 3, 2, -]
      special:
      - fly: ''
      enhancement: [heal, move, attack]
  - mandatory:
    - air
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "All allies add +2 %move% and %jump% to their move abilities this round."
  duration: round

name: Tornado
initiative: 59
level: 2
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 3
      - custom: "Control all targets of the attack ability:"
      - move: 1
    - hex: ett_ttt_ett
  - mandatory:
    - air
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [square]
    sub:
    - jump
  - divider
  - push: 1
    sub:
    - range: 2
  - optional:
    - custom: "%target% 1 ally or enemy."

name: Cold Snap
initiative: 86
level: 3
top:
  actions:
  - custom: "Create two 1-hex hazardous terrain tiles in adjacent featureless hexes."
  - custom: "Up to three enemies occupying hazardous terrain suffer %damage%2."
  - mandatory:
    - ice
bottom:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - target: "ally:1"
    - range: 3
    - strengthen

name: Polar Vortex
initiative: 61
level: 3
top:
  actions:
  - custom: "Designate a hex within %range%3."
  - pull: 2
    enhancement: [circle]
  - optional:
    - custom: "%target% all enemies within %range%3 of the designated hex."
  - custom: "Pull toward the designated hex."
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: 2
    - range: 3
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  lost: t

name: Zephyr Barrier
initiative: 40
level: 4
top:
  actions:
  - heal: 1
    enhancement: [square]
    sub:
    - target: 2
    - range: 3
    - ward
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+1 %heal%"
    - custom: "+1 %range%"
bottom:
  actions:
  - custom: "Place this card in one adjacent character's active area and treat it as if they own the card. If removed from that character's active area, place it in the Snowdancer's lost pile."
  - shield: 1
  xp: 2
  lost: t
  duration: persistent

name: Biting Frost
initiative: 16
level: 4
top:
  actions:
  - custom: "Grant one ally:"
  - move: 3
    enhancement: [square]
  - divider
  - attack: 6
    enhancement: [diamond]
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "All enemies occupying hazardous terrain gain %immobilize%."

name: Whipping Gale
initiative: 79
level: 5
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - target: 3
    - range: 4
    - pull: 2
      enhancement: [square]
  - mandatory:
    - air
  xp: 1
bottom:
  actions:
  - custom: "At the start of each of your turns, you may %air% to perform either:"
  - push: 2
    sub:
    - range: 3
  - optional:
    - custom: "%target% 1 ally or enemy."
  - custom: "or"
  - pull: 2
    sub:
    - range: 3
  - optional:
    - custom: "%target% 1 ally or enemy."
  xp: 2
  lost: t
  duration: persistent

name: Shifting Snow
initiative: 17
level: 5
top:
  actions:
  - custom: "Move up to two hazardous terrain tiles within %range%4 into featureless hexes adjacent to them. If any enter the same hex as a figure, that figure suffers hazardous terrain %damage% and gains %muddle%."
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "Create one 1-hex hazardous terrain tile in an adjacent featureless hex."
  - mandatory:
    - ice

name: Refreshing Flurry
initiative: 95
level: 6
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 4
    - bless
  - custom: "Grant the target of the heal ability:"
  - optional:
    - consume: [air]
    - move: 3
    noLine: true
  xp: 1
bottom:
  actions:
  - summon:
      name: Polar Cat
      stats: [6, 3, 2, -]
      special:
      - pierce: 3
      enhancement: [heal, move, attack]
  xp: 2
  lost: t
  duration: persistent

name: Frozen Brand
initiative: 33
level: 6
top:
  actions:
  - custom: "Grant one ally within %range%3:"
  - hex: eet_tttt_etst_tttt_eet
  - attack: 4
    sub:
    - push: 2
  - optional:
    - consume: [ice]
    - immobilize: ''
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [square]
    sub:
    - jump
  - mandatory:
    - ice

name: Freezing Storm
initiative: 81
level: 7
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: "all:1"
    - range: 2
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+1 %range%"
  - mandatory:
    - air
  xp: 1
  lost: t
bottom:
  actions:
  - move: 2
  - optional:
    - consume: [ice]
    - custom: "Create one 1-hex hazardous terrain tile in an adjacent featureless hex."
    - custom: "%xp1%"
    noLine: true
  - pull: 2
    sub:
    - range: 3

name: Storm Wall
initiative: 30
level: 7
top:
  actions:
  - group:
    - attack: 2
      sub:
      - range: 2
      - pierce: 2
      - push: 2
    - hex: t_t_et_et_eet
  - optional:
    - consume: [air]
    - custom: "All enemies adjacent to the red hexes of the attack ability suffer %damage%1."
    - custom: "%xp1%"
bottom:
  actions:
  - custom: "Place this card in one adjacent character's active area and treat it as if they own the card. If removed from that character's active area, place it in the Snowdancer's lost pile."
  - custom: "At the start of each of your turns, peform:"
  - ward: ''
    sub:
    - target: "self:1"
  xp: 2
  lost: t
  duration: persistent

name: Surging Blow
initiative: 73
level: 8
top:
  actions:
  - attack: 3
    sub:
    - range: 2
      enhancement: [square]
    - push: 2
      enhancement: [square]
  - divider
  - attack: 3
    sub:
    - range: 4
      enhancement: [square]
    - push: 2
      enhancement: [square]
  - mandatory:
    - air
bottom:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "ally:1"
    - range: 3
    - push: 3
    - strengthen

name: The Endless White
initiative: 5
level: 8
top:
  actions:
  - custom: "All ranged abilities this round gain -1 %range%, to a minimum of %range%1."
  - optional:
    - consume: [ice/air]
    - custom: "-2 %range% instead, %xp1%."
    noLine: true
  xp: 1
  duration: round
bottom:
  actions:
  - move: 6
    enhancement: [square]
  - mandatory:
    - air

name: Winds of Change
initiative: 15
level: 9
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: 4
      enhancement: [square]
    - range: 4
  - custom: "Control all targets of the attack ability:"
  - move: 2
  - mandatory:
    - air
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 4
    sub:
    - range: 3
  - custom: "The target of the heal ability may lose one card from their hand or discard to %recover% one card from their lost pils of level equal to or lower than the lost card."

name: Snowblind
initiative: 83
level: 9
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 5
    - disarm
  - optional:
    - custom: "%target%2 enemies occupying or adjacent to the same hazardous terrain tile."
  - mandatory:
    - ice
  xp: 1
bottom:
  actions:
  - custom: "Whenever you or an ally perform a rest, the resting character may gain %bless%."
  xp: 2
  lost: t
  duration: persistent
