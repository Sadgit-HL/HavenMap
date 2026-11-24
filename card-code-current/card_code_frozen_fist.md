# Frozen Fist (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: One with the Mountain
initiative: 83
level: 1
top:
  actions:
  - custom: "At the end of each round, either before or after discarding all active round bonuses, you may %recover% one card you played this round from your discard pile by suffering %damage%2+(X/2) (rounded down), where X is equal to the card's level."
  - custom: "Whenever you do not have %regenerate%, gain %regenerate%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - self
    - ward
  - mandatory:
    - consume: [ice/earth]

name: Cold Boulder
initiative: 70
level: 1
top:
  actions:
  - custom: "Create one 1-hex icy terrain tile in an adjacent featureless hex."
  - attack: 2
    sub:
    - target: "all enemies occupying or adjacent to the hex"
  - custom: "Whenever you suffer %damage% from an attack this round, after the attack perform:"
  - heal: 1
    sub:
    - self
  - mandatory:
    - earth
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %move%"

name: Frost Eruption
initiative: 61
level: 1
top:
  actions:
  - group:
    - attack: 2
      sub:
      - push: 2
    - hex: ett_st
  - custom: "Create one 1-hex icy terrain tile in one featureless red hex of the attack ability."
  - mandatory:
    - ice
bottom:
  actions:
  - heal: 2
    sub:
    - self
  - optional:
    - consume: [ice]
    - bless: ''

name: Fury of the Mountain
initiative: 23
level: 1
top:
  actions:
  - attack: 2
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - custom: "Whenever you suffer %damage% this round, suffer 1 less %damage%."
  duration: round
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - retaliate: 1
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+1 %retaliate%"
  duration: round

name: Encased Punch
initiative: 19
level: 1
top:
  actions:
  - attack: 3
  - custom: "Add +1 %attack% if the target is occupying icy terrain."
  - custom: "Whenever you suffer %damage% this round, one adjacent enemy suffers %damage%1."
  - mandatory:
    - ice
  duration: round
bottom:
  actions:
  - move: 4
    sub:
    - jump

name: Voice from Below
initiative: 22
level: 1
top:
  actions:
  - loot: 1
  - optional:
    - consume: [earth]
    - attack: 2
    noLine: true
  - custom: "Add +1 %heal% to all heals targeting you this round."
  - mandatory:
    - earth
  duration: round
bottom:
  actions:
  - heal: 2
    sub:
    - target: "all"
    - range: 1
  - mandatory:
    - earth

name: Piercing Pummel
initiative: 30
level: 1
top:
  actions:
  - attack: 3
    sub:
    - pierce: 2
  - optional:
    - consume: [ice]
    - hex: stt
    - custom: "%xp1%"
  - retaliate: 1
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - divider
  - attack: 5
    enhancement: [diamond]
  - optional:
    - custom: "%advantage%"
  - heal: X
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "where X is the amount of %damage% suffered by the targets of the attack ability."
  - mandatory:
    - earth
  xp: 2
  lost: t

name: Ice Blast
initiative: 32
level: 1
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
    - immobilize
  - mandatory:
    - consume: [ice/earth]
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - optional:
    - consume: [ice]
    - wound: ''
      sub:
      - range: 1
    noLine: true

name: Shard Launch
initiative: 52
level: X
top:
  actions:
  - attack: 2
    sub:
    - target: 2
    - range: 3
      enhancement: [square]
  - mandatory:
    - ice
bottom:
  actions:
  - move: 3
    sub:
    - jump
  - divider
  - immobilize: ''
    sub:
    - range: 1
  - custom: "The target suffers %damage%1."

name: Primal Bellow
initiative: 84
level: X
top:
  actions:
  - custom: "All adjacent enemies suffer %damage%1."
  - custom: "Create one 1-hex icy terrain tile in a featureless hex within %range%3."
  - push: 1
    sub:
    - target: "all"
    - range: 3
  - mandatory:
    - ice
bottom:
  actions:
  - heal: 3
    sub:
    - self
  - mandatory:
    - earth

name: Freezing Shell
initiative: 17
level: X
top:
  actions:
  - shield: 1
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+1 %shield%"
  - custom: "Remove any %disarm% and %muddle% you have."
  - custom: "Whenever you would gain %disarm% or %muddle% this round, prevent the condition."
  duration: round
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - pull: 1
    sub:
    - target: "all"
    - range: 2
  - custom: "One adjacent enemy suffers %damage%1."

name: Draw of the Bedrock
initiative: 10
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - optional:
    - consume: [earth]
    - brittle: ''
    - custom: "%xp1%"
  - shield: 1
  - optional:
    - consume: [ice]
    - custom: "+1 %shield%"
  duration: round
bottom:
  actions:
  - pull: 3
    enhancement: [square]
    sub:
    - range: 4
      enhancement: [square]
  - optional:
    - consume: [earth]
    - immobilize: ''
      sub:
      - range: 1
    - custom: "%xp1%"
    noLine: true
  - retaliate: 2
  duration: round

name: Crushing Crystals
initiative: 67
level: 2
top:
  actions:
  - group:
    - attack: 2
    - hex: et_st
  - optional:
    - consume: [ice]
    - disarm: ''
    - custom: "%xp1%"
bottom:
  actions:
  - optional:
    - consume: [ice]
    - custom: "Create one 1-hex icy terrain tile in an adjacent featureless hex, %xp1%."
    noLine: true
  - move: 2
    enhancement: [square]
  - divider
  - heal: 2
    sub:
    - self

name: Lacerating Eruption
initiative: 51
level: 3
top:
  actions:
  - group:
    - attack: 3
    - optional:
      - consume: [ice]
      - wound: ''
    - hex: et_st
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - mandatory:
    - ice

name: Frozen Over
initiative: 20
level: 3
top:
  actions:
  - custom: "Create two 1-hex icy terrain tiles in adjacent featureless hexes."
  - optional:
    - consume: [ice]
    - custom: "Enemies in those hexes gain %brittle%, %xp1%."
    noLine: true
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - shield: 1
  - optional:
    - consume: [earth]
    - move: 3
    noLine: true
  - mandatory:
    - earth
  duration: round

name: The Mountain s Fist
initiative: 16
level: 4
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - custom: "If the attack ability killed an enemy, perform:"
  - heal: 3
    sub:
    - self
  - mandatory:
    - earth
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - divider
  - immobilize: ''
    sub:
    - target: "all"
    - range: 1

name: Packed Solid
initiative: 55
level: 4
top:
  actions:
  - attack: 4
  - optional:
    - consume: [earth]
    - stun: ''
    - custom: "%xp1%"
bottom:
  actions:
  - shield: 1
    enhancement: [square]
  - divider
  - retaliate: 1
    enhancement: [square]
  - mandatory:
    - earth
  duration: round

name: Preserved Fury
initiative: 49
level: 5
top:
  actions:
  - custom: "You cannot use <i>One with the Mountain</i> to %recover% this card."
  - attack: 2
    enhancement: [diamond]
  - custom: "%recover% up to one of your discarded cards."
  - optional:
    - consume: [wild]
    - custom: "+1 %recover%"
    noLine: true
bottom:
  actions:
  - custom: "You cannot use <i>One with the Mountain</i> to %recover% this card."
  - custom: "%recover% up to one of your discarded cards."
  - optional:
    - consume: [wild]
    - custom: "+1 %recover%"
    noLine: true

name: Ice Uppercut
initiative: 15
level: 5
top:
  actions:
  - attack: 5
    enhancement: [circle]
  - custom: "Add +1 %attack% and %push%2 if the target is occupying icy terrain."
  - optional:
    - consume: [ice]
    - immobilize: ''
    - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - optional:
    - consume: [wild]
    - wild

name: Thick Frost
initiative: 21
level: 6
top:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - self
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+3 %heal%"
  - custom: "Whenever you suffer %damage% this round, suffer 1 less %damage%."
  duration: round
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - ward: ''
    sub:
    - self
  - optional:
    - consume: [ice]
    - bless: ''
    - custom: "%xp1%"
  - mandatory:
    - earth

name: Glacier Slam
initiative: 84
level: 6
top:
  actions:
  - group:
    - attack: 3
      sub:
      - muddle
    - hex: et_ttt_est_ett
  - custom: "Add %pierce%3 if the target is occupying icy terrain."
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - optional:
    - consume: [ice]
    - jump: ''
    - custom: "%xp1%"
  - custom: "All adjacent enemies suffer %damage%1."

name: Gift of the Mountain
initiative: 73
level: 7
top:
  actions:
  - optional:
    - consume: [wild]
    - strengthen: ''
      sub:
      - self
    - custom: "%xp1%"
    noLine: true
  - custom: "At the end of each of your move abilities this round, perform:"
  - attack: 2
    sub:
    - target: "all enemies adjacent to at least one hex you entered during the move ability"
  - custom: "Perform these attacks regardless of your line-of-sight."
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "At the end of each of your turns, perform:"
  - heal: 2
    sub:
    - self
  xp: 2
  lost: t
  duration: persistent

name: Seeing Stars
initiative: 29
level: 7
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - push: 1
    - muddle
  - mandatory:
    - wild
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - divider
  - attack: 3
    enhancement: [square]
    sub:
    - muddle

name: Shattering Blow
initiative: 18
level: 8
top:
  actions:
  - optional:
    - consume: [ice]
    - brittle: ''
      sub:
      - target: "all"
      - range: 1
    - custom: "%xp1%"
    noLine: true
  - attack: 6
    enhancement: [diamond]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [ice]
    - multi:
      - shield: 2
      - mandatory:
        - custom: "%round%"
    noLine: true
  - heal: 3
    enhancement: [square]
    sub:
    - self
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %heal%"

name: Draw Strength
initiative: 28
level: 8
top:
  actions:
  - group:
    - attack: 5
      enhancement: [diamond]
    - hex: et_st
  - custom: "If the attack ability targeted two enemies, perform:"
  - ward: ''
    sub:
    - self
bottom:
  actions:
  - custom: "All enemies within %range%3 suffer %damage%1."
  - custom: "For each enemy that suffered %damage% with this action, perform:"
  - strengthen: ''
    sub:
    - range: 3
  - mandatory:
    - earth

name: Bring Down the Mountain
initiative: 9
level: 9
top:
  actions:
  - custom: "Create three 1-hex obstacle tiles in empty hexes within %range%4."
  - attack: 2
    enhancement: [square]
    sub:
    - target: "all enemies adjacent to at least one created obstacle"
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  - mandatory:
    - earth
bottom:
  actions:
  - shield: 2
    enhancement: [square]
  - divider
  - retaliate: 2
    enhancement: [square]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %retaliate%"
  - mandatory:
    - earth
  duration: round

name: Frozen Spike
initiative: 33
level: 9
top:
  actions:
  - group:
    - attack: 3
      enhancement: [square]
      sub:
      - range: 3
      - push: 1
    - hex: ett_ttt_ett
  - optional:
    - consume: [ice]
    - custom: "Create three 1-hex icy terrain tiles in featureless red hexes of the attack ability, %xp1%."
    noLine: true
  - mandatory:
    - ice
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - optional:
    - consume: [ice]
    - custom: "One adjacent enemy suffers %damage%3, %xp1%."
    noLine: true
  - mandatory:
    - ice
