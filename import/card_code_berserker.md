# Berserker (Gloomhaven 2nd edition), card code read from the card pictures with tools/card-extraction and checked card by card by the owner: all 28 cards are right (2026-11-24).
# Inner Fire is level 4 and Into the Fight level 2 on the pictures (the Card DB had them the other way round; fixed with LEVEL_FIX in tools/extract-campaign-tables.py).
name: Blood Pact
initiative: 76
level: 1
top:
  actions:
    - mandatory:
        - custom: "Suffer %damage% equal to half your current hit point value (rounded down)."
    - divider
    - attack: 6
      enhancement: [diamond]
  xp: 1
bottom:
  actions:
    - custom: "Add +1 %attack% to all your attacks."
    - divider
    - mandatory:
        - custom: "At the start of each of your turns, if your current hit point value is greater than 1, suffer %damage%1."
  xp: 2
  duration: persistent
  lost: t

name: Cauterize
initiative: 40
level: 1
top:
  actions:
  - attack: 1
    sub:
    - range: 3
    - wound
  - custom: "Add +1 %target% and gain %xp1% if your current hit point value is half your maximum or less."
  - mandatory:
    - fire
bottom:
  actions:
  - custom: "You may suffer %damage%2 to perform:"
  - multi:
    - wound: ''
    - custom: ','
    - immobilize: ''
      sub:
      - range: 1
  - divider
  - move: 3
    enhancement: [square]

name: Dazing Wound
initiative: 29
level: 1
top:
  actions:
  - attack: 3
    enhancement: [square]
  - custom: "You may suffer %damage%2 to add %stun% and gain %xp1%."
bottom:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - range: 2
      enhancement: [square]

name: Defiance of Death
initiative: 31
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "You may suffer %damage%2 to add +2 %attack% and gain %xp1%."
bottom:
  actions:
  - custom: "On the next source of %damage% you would suffer that would reduce your current hit point value to less than 1, negate the %damage%."
  - tokens: [1]
  duration: persistent

name: Numb the Pain
initiative: 9
level: 1
top:
  actions:
  - retaliate: 2
    enhancement: [square]
  - divider
  - custom: "Whenever you suffer %damage% this round, if your current hit point value is half your maximum or less, suffer 1 less %damage%."
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - self

name: Resolute Stand
initiative: 10
level: 1
top:
  actions:
  - optional:
    - consume: [fire]
    - heal: 2
      sub:
      - self
    noLine: true
  - divider
  - retaliate: 2
    enhancement: [square]
  - custom: "Gain %xp1% the next time you retaliate this round."
  duration: round
bottom:
  actions:
  - move: 4

name: Shiny Distraction
initiative: 11
level: 1
top:
  actions:
  - loot: 1
  - divider
  - shield: 1
    enhancement: [square]
  duration: round
bottom:
  actions:
  - custom: "Gain advantage on all your attacks this round."
  - divider
  - custom: "All attacks targeting you this round gain disadvantage."
  - mandatory:
    - fire
  duration: round

name: Strength in Agony
initiative: 37
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if your current hit point value is half your maximum or less."
bottom:
  actions:
  - custom: "You may suffer up to %damage%3."
  - move: 4+X
  - custom: "where X is the amount of %damage% you chose to suffer."

name: Unbridled Power
initiative: 14
level: 1
top:
  actions:
  - attack: 3
    enhancement:
    - square
    sub:
    - push: 2
      enhancement:
      - square
  - optional:
    - consume:
      - fire
    - custom: "%target% 1 enemy up to two hexes away instead, +1 %attack%"
bottom:
  actions:
  - move: 3
    enhancement:
    - square
  - divider
  - retaliate: 1
  - custom: "Gain %xp1% the next time you retaliate this round."
  duration: round

name: From the Brink
initiative: 24
level: X
top:
  actions:
  - custom: "Remove all negative conditions you have. If your current hit point value is 1, you may %recover% one card from your lost pile."
  - divider
  - custom: "Set your current hit point value to half of your maximum (rounded up) and gain %strengthen%."
  - mandatory:
    - fire
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement:
    - square
  - divider
  - pull: 1
    enhancement:
    - square
    sub:
    - range: 2
      enhancement:
      - square

name: Glass Hammer
initiative: 43
level: X
top:
  actions:
    - attack: X
    - custom: "where X is your current hit point value. Gain %xp1% for every 5 %damage% an enemy suffers from this attack."
    - divider
    - mandatory:
        - custom: "Set your current hit point value to 1."
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
      sub:
        - jump

name: Growing Rage
initiative: 85
level: X
top:
  actions:
  - custom: "Whenever you retaliate, perform:"
  - heal: 1
    sub:
    - self
  - custom: "If, after the heal, your current hit point value is half your maximum or less, repeat this ability once."
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 3
    enhancement:
    - square
  - divider
  - custom: "If your current hit point value is half your maximum or less, gain %xp1% and perform:"
  - attack: 2
    enhancement:
    - square

name: Inner Fire
initiative: 38
# the card shows level 4 (the card list, scripts/games/gh2_cards.js, has level 2); confirmed by the owner
level: 4
top:
  actions:
  - heal: 4
    enhancement:
    - diamondPlus
    sub:
    - self
  - custom: "Add +2 %heal% and gain %xp1% if your current hit point value is half your maximum or less."
  - mandatory:
    - fire
bottom:
  actions:
  - attack: 1
    enhancement:
    - square
  - divider
  - move: 1
    enhancement:
    - circle
  - divider
  - attack: 2
    enhancement:
    - diamond

name: Reckless Offensive
initiative: 21
level: 2
top:
  actions:
  - attack: 4
    enhancement:
    - square
  - custom: "You may suffer %damage%2 to add +1 %target% and gain %xp1%."
bottom:
  actions:
  - move: 3
    enhancement:
    - square
  - optional:
    - consume:
      - fire
    - custom: "+2 %move%"
  - custom: "Add +2 %move% and gain %xp1% if your current hit point value is half your maximum or less."

name: Final Fight
initiative: 89
level: 3
top:
  actions:
  - custom: "When this card is moved from your active area to your lost pile, you become exhausted. At the end of this and your next three turns, perform:"
  - attack: 5
    sub:
    - custom: advantage
  - tokens: [0, 1, 1, 1]
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 4
    enhancement:
    - circle
  - divider
  - optional:
    - consume:
      - fire
    - custom: "Add +1 %attack% to all your attacks this round. %round%"
    noLine: true

name: Tireless Retribution
initiative: 7
level: 3
top:
  actions:
  - retaliate: 3
    enhancement:
    - square
  - custom: "Gain %xp1% the next time you retaliate this round."
  - divider
  - custom: "All attacks targeting you this round gain disadvantage."
  duration: round
bottom:
  actions:
  - custom: "If you short rest at the end of this round, gain all the benefits of a long rest."
  - mandatory:
    - fire
  duration: round

name: Into the Fight
initiative: 78
# the card shows level 2 (the card list has level 4)
level: 2
top:
  actions:
  - attack: 2
    sub:
    - target: 2
    - range: 3
    - push: 2
  - custom: "Add %muddle% and gain %xp1% if your current hit point value is half your maximum or less."
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - custom: "You may suffer %damage%2 to %fire% and perform:"
  - stun: ''
    sub:
    - range: 1

name: Unstoppable Destruction
initiative: 26
level: 4
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - optional:
    - consume: [fire]
    - custom: "All enemies adjacent to the target but not adjacent to you suffer %damage%2."
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - divider
  - heal: 2
    enhancement: [square]
    sub:
    - self

name: Seeing Red
initiative: 57
level: 5
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "You may suffer %damage%2 to add +2 %attack%."
  - divider
  - custom: "If your current hit point value is half your maximum or less, gain %xp1% and perform:"
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
  - optional:
    - consume: [fire]
    - custom: "%target% 2 enemies up to two hexes away instead"

name: Vengeful Barrage
initiative: 16
level: 5
top:
  actions:
  - custom: "On the next six sources of %damage% you suffer while an enemy is adjacent to you, after the ability that caused you to suffer the %damage%, perform %attack% 4."
  - tokens: [0, 1, 0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - retaliate: 2
  - optional:
    - consume: [fire]
    - custom: "+1 %retaliate%"
  duration: round

name: Devil Horns
initiative: 32
level: 6
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - wound
    - hex: et_st_et
  - mandatory:
    - fire
bottom:
  actions:
  - attack: 4
    enhancement: [diamond]

name: Flurry of Axes
initiative: 17
level: 6
top:
  actions:
    - custom: "You may suffer up to %damage%4."
    - attack: X
      sub:
        - target: all enemies within 3 hexes
    - custom: "where X is the amount of %damage% you chose to suffer."
  xp: 2
  remove: t
  lost: t
bottom:
  actions:
    - move: 5
      enhancement: [circle]

name: Careless Charge
initiative: 15
level: 7
top:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 4
    enhancement: [diamond]
  - optional:
    - custom: "If you moved in a straight line in one direction with the move ability and you do not have %wound%, gain %wound% to add +X %attack%, where X is the number of hexes you moved with the move ability."
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - custom: "Whenever you are attacked this round, gain %retaliate%X for the attack, where X is the number of enemies adjacent to you when the attack is performed."
  duration: round

name: Fueled by Pain
initiative: 22
level: 7
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - divider
  - optional:
    - consume: [fire]
    - heal: X
      sub:
      - self
    - custom: "where X is the amount of %damage% enemies suffered from the attack ability."
    noLine: true
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - custom: "You may suffer %damage%2 to add +2 %move% and gain %xp1%."
  - divider
  - attack: 3
    sub:
    - custom: "%target% all enemies moved through with the move ability that have %wound%"

name: Bone Breaker
initiative: 41
level: 8
top:
  actions:
  - attack: 5
    enhancement:
    - diamond
    sub:
    - wound
    - immobilize
  - custom: "Add %push%2 and gain %xp1% if your current hit point value is half your maximum or less."
  - mandatory:
    - fire
bottom:
  actions:
  - attack: 3
    enhancement:
    - diamond
    sub:
    - range: 4
  - custom: "Place your character token on the target. The target loses %flying%."
  duration: persistent

name: Spiked Armor
initiative: 8
level: 8
top:
  actions:
  - retaliate: 2
    enhancement:
    - square
  - custom: "You may suffer %damage%2 to add +1 %retaliate% and gain %xp1%."
  - divider
  - custom: "Whenever an enemy suffers %damage% from your %retaliate% this round, they gain %wound%."
  - divider
  - custom: "Negate the next %damage% you suffer this round."
  duration: round
bottom:
  actions:
  - heal: 5
    enhancement:
    - plus
    sub:
    - self
  - custom: "Add %strengthen% and gain %xp1% if your current hit point value is half your maximum or less."

name: Bathe in Blood
initiative: 83
level: 9
top:
  actions:
  - custom: "Whenever you suffer %damage%, all enemies that have %wound% suffer %damage%1."
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 5
    enhancement:
    - circle
    sub:
    - jump
  - divider
  - pull: 1
    enhancement:
    - square
    sub:
    - custom: "%target% all, %range% 2"
      enhancement:
      - square
  - divider
  - muddle: ''
    sub:
    - custom: "%target% all, %range% 1"

name: Burning Hatred
initiative: 50
level: 9
top:
  actions:
  - attack: 2
    sub:
    - target: all adjacent enemies
  - optional:
    - consume:
      - fire
    - custom: "%target% all enemies up to two hexes away instead"
  - custom: "You may suffer %damage%2 to add +1 %attack% and gain %xp1%."
bottom:
  actions:
  - custom: "You may perform this action any number of times in succession, increasing the %damage% suffered by 1 each time."
  - mandatory:
    - custom: "Suffer %damage%1. This %damage% cannot be negated."
  - divider
  - move: 1
  - divider
  - attack: 2
  xp: 2
  remove: t
  lost: t
