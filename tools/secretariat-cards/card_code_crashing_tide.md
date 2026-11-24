# Crashing Tide (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Overwhelming Wave
initiative: 86
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: et_st_et
  xp: 1
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "You may play three cards instead of two each round, using one card as initiative. At least one top and one bottom action must still be performed."
  - mandatory:
    - dark
  duration: persistent

name: Soft Flesh
initiative: 75
level: 1
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "Whenever an adjacent enemy dies, perform:"
  - heal: 1
    sub:
    - self
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "If you are occupying water, perform:"
  - heal: 2
    sub:
    - self

name: Rancid Brine
initiative: 62
level: 1
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "Add %poison% to all your attacks."
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - custom: "Create one 1-hex water tile in an adjacent featureless hex."
  - poison: ''
    sub:
    - target: "2 enemies occupying water"
    - range: 1

name: Sharp Chitin
initiative: 25
level: 1
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - shield: 1
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - optional:
    - consume: [light]
    - custom: "All adjacent enemies suffer %damage%1, %xp1%."
    noLine: true

name: Down to the Depths
initiative: 74
level: 1
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "After each of your attacks, if the target has 3 or fewer hit points, the target gains %bane%."
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - move: 3
  - custom: "Ignore hazardous terrain during this movement."

name: Pool of Power
initiative: 41
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - optional:
    - consume: [light]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "When you rest, you may keep one %fh-tides% card in your active area."
  - mandatory:
    - dark
  duration: persistent

name: Skitter
initiative: 51
level: 1
top:
  actions:
  - attack: 1
  - optional:
    - consume: [light]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  - move: 1
    enhancement: [square]
  - divider
  - attack: 1
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "During all your move abilities, add +1 %move% and ignore difficult terrain."
  - mandatory:
    - dark
  duration: persistent

name: Cleansing Swell
initiative: 45
level: 1
top:
  actions:
  - group:
    - attack: 1
      enhancement: [diamond]
      sub:
      - push: 2
    - hex: et_st
  - optional:
    - consume: [light]
    - custom: "%xp1%"
    - custom: "+1 %push%"
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "At the start of your rest, you may perform:"
  - heal: X
    sub:
    - self
  - custom: "where X is the number of active %fh-tides%."
  - mandatory:
    - dark
  duration: persistent

name: Cresting Force
initiative: 87
level: 1
top:
  actions:
  - attack: X
  - custom: "where X is the number of active %fh-tides%."
  xp: 1
bottom:
  actions:
  - loot: 1

name: Crashing Surge
initiative: 34
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [circle]
    - hex: ett_stt_ett
  - custom: "You may create 1-hex water tiles in any number of featureless red hexes of the attack ability."
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Create one 1-hex water tile in an adjacent featureless hex."

name: Mighty Claws
initiative: 23
level: 1
top:
  actions:
  - attack: 2
    sub:
    - target: 2
  - optional:
    - consume: [dark]
    - pierce: 2
    - custom: "%xp1%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - shield: 1
    enhancement: [circle]
  - divider
  - retaliate: 1
    enhancement: [circle]
  - optional:
    - consume: [dark]
    - custom: "All attacks targeting you this round gain disadvantage, %xp1%."
    noLine: true
  xp: 1
  lost: t
  duration: round

name: Submerge
initiative: 68
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - pierce: 4
  - custom: "Add +2 %attack% and gain %xp1% if the target is occupying water."
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+1 %move%"
  - custom: "The first four hexes with water tiles you enter with this movement cost 0 movement points to enter."

name: Rising flood
initiative: 49
level: X
top:
  actions:
  - custom: "Create one 2-hex water tile such that at least one hex is adjacent to you and both hexes are featureless."
  - custom: "Enemies in those hexes suffer %damage%1 and gain %immobilize%."
bottom:
  actions:
  - custom: "Designate one adjacent 1-hex water tile and perform:"
  - move: 3
  - custom: "Regardless of your line-of-sight, relocate the designated water tile to an adjacent featureless hex."

name: Undertow
initiative: 15
level: X
top:
  actions:
  - bane: ''
    sub:
    - target: "1 adjacent normal or elite enemy occupying water"
  xp: 2
  lost: t
bottom:
  actions:
  - heal: 1
    enhancement: [circle]
    sub:
    - self
  - divider
  - shield: 1
  duration: round

name: Crush Armor
initiative: 42
level: X
top:
  actions:
  - custom: "One adjacent normal enemy suffers %damage% equal to its %shield% value."
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "All enemies gain %shield%-1 this round while adjacent to you."
  duration: round

name: Smashing Torrent
initiative: 79
level: 2
top:
  actions:
  - attack: 2
  - optional:
    - consume: [light]
    - stun: ''
    - custom: "%xp1%"
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "Immediately after one of your move abilities each turn, all adjacent enemies suffer %damage%1."
  - mandatory:
    - dark
  duration: persistent

name: Blood in the Water
initiative: 53
level: 2
top:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - pull: 2
    sub:
    - range: 3
  - divider
  - attack: 4
    enhancement: [diamond]
  - custom: "Add +2 %attack% and %wound% if the target is occupying water."
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Create one 2-hex water tile such that at least one hex is adjacent to you and both hexes are featureless."

name: Shuck
initiative: 55
level: 3
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "Add %pierce%2 and %wound% to all your attacks."
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - custom: "For each active %fh-tides%, perform:"
  - move: 1
  - divider
  - attack: 1
  - optional:
    - consume: [light]
    - custom: "%xp1%"
    - custom: "+1 %move%"
  xp: 1
  lost: t

name: Endless Cycle
initiative: 8
level: 3
top:
  actions:
  - custom: "%recover% up to X of your discarded cards, where X is the number of your active %fh-tides% at the start of this action."
  - optional:
    - consume: [dark]
    - custom: "+2 %recover%, %xp1%."
    noLine: true
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
  - custom: "If you are occupying water, perform:"
  - shield: 1
  duration: round

name: Chaotic Refraction
initiative: 26
level: 4
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - shield: 1
  - custom: "This %shield% only applies to melee attacks."
  - retaliate: 2
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - loot: 1

name: Clean Sweep
initiative: 65
level: 4
top:
  actions:
  - attack: 2
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [dark]
    - muddle: ''
    - custom: "%xp1%"
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - heal: 2
    sub:
    - self
  - optional:
    - consume: [light]
    - custom: "%xp1%"
    - custom: "+2 %heal%"

name: Tidal Blast
initiative: 71
level: 5
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: X
    - range: 4
      enhancement: [square]
  - optional:
    - custom: "where X is the number of active %fh-tides%."
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "Add +1 %attack% to one of your attacks and +1 %move% to one of your move abilities each turn."
  - mandatory:
    - dark
  duration: persistent

name: Sodden Soil
initiative: 17
level: 5
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - wound
    - immobilize
  xp: 1
bottom:
  actions:
  - custom: "%teleport% to an unoccupied hex with a water tile within 5 hexes."
  - optional:
    - consume: [dark]
    - custom: "%teleport% to any unoccupied and revealed hex with a water tile instead, %xp1%."
    noLine: true
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
  xp: 1
  lost: t

name: Powerful Pincer
initiative: 70
level: 6
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "During your melee attack abilities, you may %light% %dark% to add %disarm% to one attack and gain %xp1%."
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [light]
    - immobilize: ''
      sub:
      - target: "all"
      - range: 1
    - custom: "%xp1%"
    noLine: true

name: Twilight Grasp
initiative: 33
level: 6
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: et_s_et
  - optional:
    - consume: [light]
    - custom: "+1 %attack%"
  xp: 1
bottom:
  actions:
  - move: 2
  - divider
  - bane: ''
    sub:
    - target: "2 normal enemies occupying water"
    - range: 1
  xp: 2
  lost: t

name: Dug In
initiative: 76
level: 7
top:
  actions:
  - attack: 3
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [dark]
    - multi:
      - custom: "You are immune to forced movement this round, %xp1%."
      - mandatory:
        - custom: "%round%"
    noLine: true
bottom:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "At the end of each of your turns, if you did not move during your turn, perform:"
  - heal: 3
    sub:
    - self
  - mandatory:
    - dark
  duration: persistent

name: Drown beneath the Waves
initiative: 9
level: 7
top:
  actions:
  - optional:
    - consume: [light]
    - multi:
      - custom: "The effects of <i>Smashing Torrent</i> and <i>Tidal Blast's</i> %fh-tides% abilities can be used more than once each turn this round."
      - mandatory:
        - custom: "%round%"
    noLine: true
  - move: 3
  - divider
  - attack: 4
    enhancement: [diamond]
  - divider
  - move: 3
  xp: 2
  lost: t
bottom:
  actions:
  - pull: 2
    enhancement: [square]
    sub:
    - target: 3
    - range: 5
  - custom: "All enemies within %range%5 occupying water suffer %damage%2."

name: Death on All Sides
initiative: 73
level: 8
top:
  actions:
  - custom: "%fh-tides% TIDE"
  - custom: "Add +2 %attack% to all your attacks targeting enemies adjacent to at least one of your allies."
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - attack: 3
    enhancement: [square]
  xp: 1

name: Ebb and Flow
initiative: 24
level: 8
top:
  actions:
  - pull: 2
    sub:
    - target: "all"
    - range: 4
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
    - push: 2
    - immobilize
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - heal: 3
    sub:
    - range: 3
  - custom: "If the hex the target is occupying is featureless, you may create one 1-hex water tile in it."

name: High Tide
initiative: 90
level: 9
top:
  actions:
  - move: X
    enhancement: [circle]
  - custom: "where X is the number of active %fh-tides%."
  - attack: X
    enhancement: [diamond]
  - custom: "where X is the number of active %fh-tides%."
  xp: 1
bottom:
  actions:
  - custom: "You do not have to discard %fh-tides% cards when you rest."
  - mandatory:
    - custom: "You cannot long rest."
  xp: 2
  lost: t
  duration: persistent

name: Low Tide
initiative: 10
level: 9
top:
  actions:
  - custom: "Play two cards from your lost pile for their %fh-tides% actions and place character tokens on them. You may choose not to discard these cards when you rest. If they are removed from your active area, return them to your lost pile."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "If you have two or fewer active %fh-tides%, perform:"
  - shield: 2
  duration: round
