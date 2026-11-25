# Bruiser (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Trample
initiative: 72
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 3
bottom:
  actions:
  - move: 4
    enhancement: [square]
    sub:
    - jump
  - divider
  - attack: 3
    sub:
    - target: "all enemies moved through"
  - custom: "Gain %xp1% for each enemy targeted."
  lost: t

name: Eye for an Eye
initiative: 13
level: 1
top:
  actions:
  - shield: 1
  - divider
  - retaliate: 1
  - custom: "Gain %xp1% the next time you retaliate this round."
  duration: round
bottom:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - self
  - mandatory:
    - earth

name: Skewer
initiative: 35
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [square]
    - optional:
      - consume: [air]
      - pierce: 1
      - custom: "%xp1%"
      - custom: "+1 %attack%"
    - hex: eet_et_es
bottom:
  actions:
  - move: 7
    enhancement: [square]
  xp: 2
  lost: t

name: Overwhelming Assault
initiative: 61
level: 1
top:
  actions:
  - attack: 7
    enhancement: [diamond]
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [square]
    sub:
    - jump
  - mandatory:
    - air

name: Balanced Measure
initiative: 20
level: 1
top:
  actions:
  - attack: X
  - custom: "where X is the number of hexes you have moved this turn."
  xp: 1
bottom:
  actions:
  - move: X
  - custom: "where X is the amount of %damage% you have dealt this turn."

name: Grab and Go
initiative: 87
level: 1
top:
  actions:
  - loot: 1
  - divider
  - heal: 2
    enhancement: [square]
    sub:
    - self
bottom:
  actions:
  - move: 4
    enhancement: [square]

name: Warding Strength
initiative: 32
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - disarm
bottom:
  actions:
  - custom: "On the next six sources of %damage% from attacks targeting you, gain %shield%1, %retaliate%1 for the attack."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Shield Bash
initiative: 15
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - stun
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - shield: 1
  duration: round

name: Leaping Cleave
initiative: 54
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [square]
    - hex: et_st
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [square]
    sub:
    - jump
  - divider
  - push: 2
    enhancement: [square]
    sub:
    - range: 1

name: Spare Dagger
initiative: 27
level: 1
top:
  actions:
  - attack: 3
    sub:
    - range: 3
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - pierce: 1
      enhancement: [square]

name: Sweeping Blow
initiative: 23
level: X
top:
  actions:
  - group:
    - attack: 2
      sub:
      - muddle
    - custom: "Add +1 %attack% on each undamaged target."
    - hex: xt_st_et
  xp: 1
bottom:
  actions:
  - move: 4

name: Fearsome Taunt
initiative: 10
level: X
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - push: 3
      enhancement: [square]
  xp: 1
bottom:
  actions:
  - shield: 1
  - custom: "Whenever an enemy would attack one of your adjacent allies this round, you may have that attack target you instead, regardless of the attack's range and line-of-sight limitations."
  duration: round

name: Wall of Doom
initiative: 18
level: X
top:
  actions:
  - pull: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
    - muddle
  - divider
  - retaliate: 2
  - custom: "Gain %xp1% the next time you retaliate this round."
  duration: round
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - pull: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]

name: Intimidating Growl
initiative: 51
level: 2
top:
  actions:
  - group:
    - attack: 2
      enhancement: [square]
      sub:
      - push: 2
    - hex: ett_stx
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "On your nex two move abilities, add +1 %move%."
  - tokens: [0, 1]
  duration: round

name: Juggernaut
initiative: 34
level: 2
top:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - custom: "On the next four sources of %damage% you would suffer, negate that %damage%."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent

name: Hook and Chain
initiative: 42
level: 3
top:
  actions:
  - attack: 3
    sub:
    - range: 4
    - pull: 3
bottom:
  actions:
  - move: 4
  - custom: "If you moved in a straight line in one direction with the move ability, perform:"
  - attack: X
  - custom: "where X is the number of hexes you moved."

name: Unstoppable Charge
initiative: 86
level: 3
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if you have moved this turn."
bottom:
  actions:
  - move: 4
  - divider
  - stun: ''
    enhancement: [diamond]
    sub:
    - target: "all"
    - range: 1
  xp: 2
  lost: t

name: Whirlwind
initiative: 28
level: 4
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
  - custom: "Gain %xp1% for each enemy targeted."
  - mandatory:
    - air
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - push: 3
    enhancement: [square]
    sub:
    - target: "all"
    - range: 1

name: Push Through
initiative: 57
level: 4
top:
  actions:
  - heal: 5
    enhancement: [diamond]
    sub:
    - self
bottom:
  actions:
  - custom: "During you next attack ability this round, add +1 %attack% to all attacks."
  - move: 3
    enhancement: [circle]
  duration: round

name: Skirmishing Maneuver
initiative: 29
level: 5
top:
  actions:
  - attack: 2
    enhancement: [square]
  - divider
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - move: 5
    enhancement: [square]
    sub:
    - jump
  - mandatory:
    - air

name: Defensive Tactics
initiative: 39
level: 5
top:
  actions:
  - custom: "The first time each round that you gain %shield% or %retaliate% from one of your ability or attack modifier cards, gain %shield%1 and %retaliate%1 for the round."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - pull: 2
    sub:
    - target: 2
      enhancement: [square]
    - range: 3

name: Run Through
initiative: 33
level: 6
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - pierce: 2
    - hex: eex_et_et_t_s
  - optional:
    - custom: "Add +1 %attack% on each undamaged target."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - push: 1
    enhancement: [square]
    sub:
    - range: 1
    - immobilize

name: Immovable Phalanx
initiative: 17
level: 6
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - divider
  - shield: 1
    enhancement: [square]
  duration: round
bottom:
  actions:
  - custom: "Once each turn, you may treat one move ability from your ability cards as an attack ability of equal value."
  xp: 2
  lost: t
  duration: persistent

name: Let Fly
initiative: 19
level: 7
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - push: 4
    - wound
    - stun
  - custom: "Each enemy occupying a hex the target enters suffers %damage%4 and gains %wound%."
  xp: 2
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - push: 3
  - divider
  - move: 2
    enhancement: [circle]

name: Selfish Retribution
initiative: 8
level: 7
top:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - loot: 2
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - retaliate: 2
    enhancement: [square]
  - custom: "Gain %xp1% the next time you retaliate this round."
  duration: round

name: Frenzied Onslaught
initiative: 41
level: 8
top:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [square]
  - divider
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - heal: X
    sub:
    - self
  - custom: "where X is the amount of %damage% you have dealt this turn."

name: Crippling Offensive
initiative: 16
level: 8
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - range: 3
    - immobilize
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 1
  - divider
  - shield: 1
    enhancement: [square]
  duration: round

name: Brute Force
initiative: 9
level: 9
top:
  actions:
  - shield: 2
    enhancement: [square]
  - custom: "After each attack targeting you this round, perform:"
  - move: 1
  - divider
  - push: 2
    sub:
    - target: "1 ally or enemy"
    - range: 1
  duration: round
bottom:
  actions:
  - custom: "Add +1 %attack% to each of your %push% and %pull%. Whenever you %push% or %pull% an enemy at least one hex, after the forced movement, that enemy and all enemies adjacent to it siffer %damage%1."
  xp: 2
  lost: t
  duration: persistent

name: Face Your End
initiative: 67
level: 9
top:
  actions:
  - attack: 2
    sub:
    - target: 2
    - range: 3
    - pull: 2
  - divider
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: et_st_et
bottom:
  actions:
  - attack: 4
    enhancement: [diamond]
  - custom: "Add +3 %attack% and gain %xp1% if the target's current hit point value is lower than yours."
