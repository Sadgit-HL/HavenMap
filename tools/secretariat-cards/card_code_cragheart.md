# Cragheart (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Opposing Strike
initiative: 46
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: xtstx
  - optional:
    - consume: [earth]
    - muddle: ''
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - custom: "At the end of this an your next four turns, perform:"
  - heal: 2
    sub:
    - range: 3
  - tokens: [1, 0, 1, 0, 1]
  lost: t
  duration: persistent

name: Crushing Grasp
initiative: 35
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - immobilize
  - mandatory:
    - earth
  xp: 1
bottom:
  actions:
  - custom: "Create a 1-hex obstacle tile in an adjacent empty hex. All allies an enemies adjacent to the created tile suffer %damage%1."
  - loot: 1
  - mandatory:
    - earth

name: Avalanche
initiative: 75
level: 1
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
    - hex: etx_st
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  xp: 1
  lost: t
bottom:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %range%"

name: Rumbling Advance
initiative: 38
level: 1
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 2
      enhancement: [square]
  - mandatory:
    - earth
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - mandatory:
    - custom: "All adjacent allies and enemies suffer %damage%1."
  - mandatory:
    - earth

name: Massive Boulder
initiative: 87
level: 1
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 2
        enhancement: [square]
    - mandatory:
      - custom: "All allies and enemies adjacent to the target suffer %damage%1."
  - mandatory:
    - earth
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Backup Ammunition
initiative: 77
level: 1
top:
  actions:
  - custom: "On your next four single-target ranged attack abilities, add +1 %target%."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]

name: Earthen Bulwark
initiative: 41
level: 1
top:
  actions:
  - custom: "Create two 1-hex obstacle tiles in empty hexes within %range%3 ."
  - optional:
    - consume: [earth]
    - custom: "All allies adjacent to at least one created tile suffer %damage%1 and gain %ward%, %xp1%."
    noLine: true
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - range: 2
      enhancement: [square]

name: Unstable Upheaval
initiative: 13
level: 1
top:
  actions:
  - attack: 3
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [earth]
    - target: "all enemies up to two hexes away instead"
    - custom: "%xp1%"
  - mandatory:
    - custom: "All adjacent allies suffer %damage%2."
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3

name: Crater
initiative: 61
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [earth]
    - push: 2
    - custom: "%xp1%"
bottom:
  actions:
  - mandatory:
    - custom: "All adjacent allies and enemies suffer %damage%1."
  - move: 4
    enhancement: [square]
    sub:
    - jump
  - multi:
    - mandatory:
      - custom: "All adjacent allies and enemies suffer %damage%1."
    - optional:
      - consume: [earth]
      - damage: 1
      - custom: "%xp1%"
      noLine: true
  xp: 1
  lost: t

name: Dirt Tornado
initiative: 82
level: 1
top:
  actions:
  - group:
    - attack: 1
      sub:
      - range: 2
      - muddle
    - hex: ett_ttt_ett
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  - mandatory:
    - muddle: ''
      sub:
      - target: "all allies in the red hexes of the attack ability."
bottom:
  actions:
  - move: 3
    enhancement: [circle]

name: Earthen Clod
initiative: 29
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 5
  - optional:
    - consume: [earth]
    - immobilize: ''
    - custom: "%xp1%"
bottom:
  actions:
  - multi:
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 5
    - custom: "Add +1 %attack% for each obstacle or objective adjacent to the target."
  xp: 2
  lost: t

name: Heaving Swing
initiative: 57
level: X
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [diamond]
      sub:
      - push: 1
        enhancement: [square]
    - custom: "You may push the target into hexes containing obstacles. In each case, destroy the obstacle, the target suffers %damage%2, and you gain %xp1%."
bottom:
  actions:
  - custom: "Destroy an adjacent obstacle or suffer %damage%1 to add +3 %attack% to your next melee attack this round."
  duration: round

name: Petrify
initiative: 53
level: X
top:
  actions:
  - multi:
    - group:
      - attack: 4
        enhancement: [diamond]
        sub:
        - range: 3
      - hex: etx_tt
    - custom: "For each target killed, gain %xp1% and create one 1-hex obstacle tile in the featureless hex they occupied."
  - mandatory:
    - earth
  xp: 1
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 2
      enhancement: [square]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %range%"

name: Burrow
initiative: 94
level: X
top:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - target: 2
    - range: 3
  - mandatory:
    - earth
bottom:
  actions:
  - move: 7
    enhancement: [square]
    sub:
    - jump
  - optional:
    - consume: [earth]
    - immobilize: ''
      sub:
      - target: "all enemies moved through"
    - custom: "%xp1%"
    noLine: true
  xp: 1
  lost: t

name: Mud Eruption
initiative: 25
level: 2
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [diamond]
      sub:
      - target: "4 enemies within 4 hexes"
      - push: 1
    - custom: "Create one 1-hex obstacle tile in the featureless hex each target previously occupied."
  - mandatory:
    - earth
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Sentient Growth
initiative: 78
level: 2
top:
  actions:
  - group:
    - attack: 2
      enhancement: [square]
      sub:
      - range: 3
    - hex: etx_tt
  - divider
  - heal: 2
    sub:
    - target: "all allies in the red hexes of the attack ability"
  - mandatory:
    - earth
bottom:
  actions:
  - move: 2
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - target: "all"
    - range: 1
  - divider
  - attack: 1
    enhancement: [square]
    sub:
    - target: "all adjacent enemies"

name: Clear the Way
initiative: 30
level: 3
top:
  actions:
  - custom: "Relocate one adjacent 1-hex obstacle tile to an empty hex within %range%4 to perform:"
  - attack: 2
    enhancement: [square]
    sub:
    - target: "all enemies adjacent to the relocated tile"
    - pierce: 1
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - multi:
    - move: 3
      enhancement: [circle]
      sub:
      - jump
    - custom: "Destroy all obstacles, hazardous terrain, difficult terrain, and traps in hexes you enter."

name: Blunt Force
initiative: 21
level: 3
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+5 %attack%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - heal: 2
    enhancement: [square]
    sub:
    - self
  - optional:
    - consume: [earth]
    - ward: ''
    - custom: "%xp1%"

name: Rock Slide
initiative: 81
level: 4
top:
  actions:
  - multi:
    - custom: "Create three 1-hex obstacle tiles in empty hexes within %range%3 ."
    - custom: "All allies and enemies adjacent to at least one created tile suffer %damage%1 and gain %muddle%."
  - mandatory:
    - earth
bottom:
  actions:
  - multi:
    - custom: "Designate one enemy within %range%4. Destroy all obstacles within %range%2 of the designated enemy to perform:"
    - attack: X
      sub:
      - target: "the designated enemy"
      - immobilize
    - custom: "where X is twice the number of destroyed obstacles."
  xp: 2
  lost: t

name: Kinetic Assault
initiative: 19
level: 4
top:
  actions:
  - move: 1
    enhancement: [circle]
  - multi:
    - attack: 4
      enhancement: [diamond]
    - mandatory:
      - custom: "All allies and enemies adjacent to the target suffer %damage%1."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - divider
  - retaliate: 3
    enhancement: [square]
    sub:
    - range: 3
  xp: 2
  lost: t
  duration: round

name: Solidify
initiative: 17
level: 5
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - custom: "Grant one ally within %range%3:"
  - mandatory:
    - custom: "Suffer %damage%1."
  - shield: 2
  duration: round

name: Stone Pummel
initiative: 32
level: 5
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
    - hex: eetx_tst_xt
  - mandatory:
    - earth
  xp: 1
bottom:
  actions:
  - custom: "Whenever you attack an adjacent enemy, you may destroy one 1-hex obstacle adjacent to both you and that enemy to add +2 %attack% to the attack."
  xp: 2
  lost: t
  duration: persistent

name: Dig Pit
initiative: 88
level: 6
top:
  actions:
  - push: 2
    enhancement: [square]
    sub:
    - range: 1
  - custom: "Create one %damage%2, %stun% trap in an adjacent empty hex."
  - custom: "Create one 1-hex obstacle tile in an empty hex adjacent to the created trap."
bottom:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+1 %target%"

name: Cataclysm
initiative: 26
level: 6
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
      sub:
      - immobilize
    - optional:
      - consume: [earth]
      - custom: "%xp1%"
      - custom: "+2 %attack%"
    - hex: ettx_stt_ettx
  - mandatory:
    - immobilize: ''
      sub:
      - target: "all allies in the red hexes of the attack ability."
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+3 %move%"
  - mandatory:
    - earth

name: Meteor
initiative: 85
level: 7
top:
  actions:
  - optional:
    - consume: [earth]
    - custom: "Whenever you perform a ranged attack this round, all allies and enemies adjacent to the target suffer %damage%1, %xp1%."
    noLine: true
  - custom: "Destroy any number of adjacent obstacles. For each obstacle destroyed, perform:"
  - attack: 2
    sub:
    - range: 3
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - mandatory:
    - custom: "All adjacent allies and enemies suffer %damage%1."

name: Brutal Momentum
initiative: 37
level: 7
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [square]
  - custom: "Add +1 %attack%, +1 %push% for each hex containing an obstacle or wall adjacent to you."
bottom:
  actions:
  - custom: "At the start of your next four turns, perform:"
  - move: 3
  - custom: "Add +3 %attack% to your next melee attack this turn."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent

name: Rocky End
initiative: 31
level: 8
top:
  actions:
  - group:
    - attack: 5
      enhancement: [diamond]
      sub:
      - muddle
    - hex: et_tt_stt
  - divider
  - heal: 5
    sub:
    - target: "all allies in the red hexes of the attack ability"
  - optional:
    - consume: [earth]
    - custom: "Create 1-hex obstacle tiles in each empty red hex of the attack ability, %xp1%."
    noLine: true
  xp: 1
  lost: t
bottom:
  actions:
  - push: 2
    enhancement: [square]
    sub:
    - range: 3
    - immobilize
  - custom: "Create 1-hex obstacle tiles in each featureless hex the target exists with the push."
  - mandatory:
    - earth

name: Entomb
initiative: 23
level: 8
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - optional:
    - consume: [earth]
    - custom: "Create two 1-hex obstacle tiles in empty hexes adjacent to the target but not adjacent to you. All allies and enemies adjacent to at least one created tile suffer %damage%1, %xp1%."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Create 1-hex obstacle tiles in an adjacent empty hex."
  - custom: "Destroy any number of obstacles within %range%3. For each obstacle destroyed, give %ward% to one ally adjacent to the hex that obstacle occupied."

name: Wave of Destruction
initiative: 74
level: 9
top:
  actions:
  - group:
    - attack: 1
    - hex: st_ttt_eettt_eeettx_eeeeex
    - custom: "For each target, add +X%attack%, where X is the %range% to the target."
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - custom: "You may enter hexes containing obstacles with this movement. When you do, destroy the obstacle."
  - custom: "Add +X%attack% to your next attack this turn, where X is twice the number of obstacles destroyed with the move ability."

name: Earth's Embrace
initiative: 52
level: 9
top:
  actions:
  - attack: 3
    sub:
    - target: "all adjacent enemies"
    - push: 2
  - custom: "You may push the targets into hexes containing obstacles. In each case, destroy the obstacle, the target suffers %damage%2, and you gain %xp1%."
bottom:
  actions:
  - custom: "At the end of each of your turns, perform:"
  - heal: X
    sub:
    - self
  - custom: "where X is the number of adjacent obstacles."
  xp: 2
  lost: t
  duration: persistent
