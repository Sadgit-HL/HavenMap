# Drifter (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Crushing Weight
initiative: 71
level: 1
top:
  actions:
  - custom: "On your next six melee attacks, add +2 %attack%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - range: 2
  - custom: "Move the character token on one of your persistent abilities backwards one slot."

name: Sustained Momentum
initiative: 76
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - custom: "Move the character token on one of your persistent abilities backwards one slot."
bottom:
  actions:
  - custom: "On your next six move abilities, add +2 %move%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Precision Aim
initiative: 66
level: 1
top:
  actions:
  - custom: "All your ranged attacks have +1 %range%. On your next six ranged attacks, add +1 %attack%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Move the character token on one of your persistent abilities backwards one slot."

name: Continuous Health
initiative: 61
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 2
  - custom: "Move the character token on one of your persistent abilities backwards one slot."
bottom:
  actions:
  - custom: "On your next six heals, add +2 %heal%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Relentless
initiative: 89
level: 1
top:
  actions:
  - custom: "Move the character token on two of your persistent abilities backwards one slot."
bottom:
  actions:
  - custom: "On the next six attacks targeting you performed by enemies within %range%2, gain %retaliate%2 %range%2."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Unbreakable
initiative: 90
level: 1
top:
  actions:
  - custom: "Move the character token on two of your persistent abilities backwards one slot."
bottom:
  actions:
  - custom: "On the next six sources of %damage% from attacks targeting you, gain %shield%1."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Vile Assault
initiative: 27
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - poison
  - divider
  - attack: 2
    enhancement: [diamond]
    sub:
    - wound
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 2
    sub:
    - self

name: Draining Arrows
initiative: 23
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - target: 3
    - range: 2
    - muddle
bottom:
  actions:
  - move: 3
  - custom: "If you are adjacent to exactly one enemy, move the character token on one of your persistent abilities backwards one slot."

name: Prudent Preparation
initiative: 14
level: 1
top:
  actions:
  - shield: 1
    enhancement: [diamondPlus]
  - divider
  - retaliate: 1
    enhancement: [diamondPlus]
  duration: round
bottom:
  actions:
  - heal: 2
    enhancement: [circle]
    sub:
    - range: 3

name: Deadly Shot
initiative: 32
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 4
    - poison
bottom:
  actions:
  - move: 4

name: Bloodletting
initiative: 65
level: 1
top:
  actions:
  - attack: 3
    enhancement: [square]
  - custom: "If you killed an enemy with the attack ability, move the character token on one of your persistent abilities backwards one slot."
bottom:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - wound

name: Violent Inheritance
initiative: 70
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
  - divider
  - loot: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  lost: t

name: Fortitude
initiative: 31
level: X
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 2
    - group:
      - custom: "Before applying any other bonuses, move the character token on one of your persistent abilities forward one slot: +2 %range%."
bottom:
  actions:
  - custom: "Whenever you kill an enemy, move the character token on one of your persistent abilities backwards one slot."
  lost: t
  duration: persistent

name: No Remorse
initiative: 20
level: X
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 3
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - attack: 3
    enhancement: [diamond]
  - divider
  - move: 2
    enhancement: [square]
  lost: t

name: Destructive Fury
initiative: 19
level: X
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: et_tt_stt
  lost: t
bottom:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 2
    - hex: et_tt
  lost: t

name: Shockwave
initiative: 17
level: 2
top:
  actions:
  - custom: "On your next six melee attacks targeting an enemy adjacent to any other enemy, one enemy adjacent to the target suffers %damage%2."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
  - divider
  - shield: 1
    enhancement: [circle]
  duration: round

name: Ever Forward
initiative: 67
level: 2
top:
  actions:
  - attack: 2
    sub:
    - range: 3
  - divider
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - heal: 1
    enhancement: [circle]
    sub:
    - target: 3
    - range: 3

name: Fierce Barrage
initiative: 32
level: 3
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
    - hex: et_st
bottom:
  actions:
  - custom: "On your next six ranged attack abilities, add +1 %target%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Dual Bow
initiative: 26
level: 3
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - range: 3
bottom:
  actions:
  - custom: "Move the character token on two of your persistent abilities backwards one slot."
  lost: t

name: Chunk of Flesh
initiative: 62
level: 4
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - divider
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - range: 1
  - custom: "Move the character token on one of your persistent abilities backwards one slot."
bottom:
  actions:
  - custom: "On the next six sources of %damage% from attacks targeting you, gain %shield%2."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Gift of the Prey
initiative: 40
level: 4
top:
  actions:
  - attack: 3
    sub:
    - range: 3
      enhancement: [square]
  - custom: "If you killed an enemy with the attack ability, move the character token on one of your persistent abilities backwards one slot."
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "If you killed an enemy this round, move the character token on one of your persistent abilities backwards one slot."

name: Survivalist
initiative: 91
level: 5
top:
  actions:
  - custom: "On your next six heals targeting figures without %ward%, add %ward%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - loot: 1
  - divider
  - heal: X
    sub:
    - self
  - optional:
    - custom: "where X is twice the number of tokens and tiles looted."

name: Break Through
initiative: 34
level: 5
top:
  actions:
  - attack: 4
    sub:
    - pierce: 2
    - group:
      - custom: "Before applying any other bonuses, move the character token on one of your persistent abilities forward one slot: %wound%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "If you are adjacent to at least two enemies, move the character token on one of your persistent abilities backwards one slot."

name: Accurate Strikes
initiative: 56
level: 6
top:
  actions:
  - custom: "On your next six attacks targeting enemies with %shield%, add %pierce%3."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Gain advantage on all your attacks this round."
  duration: round

name: Consume Stamina
initiative: 21
level: 6
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
  - divider
  - heal: X
    sub:
    - range: 4
    - custom: "where X is the amount of %damage% suffered by targets of the attack ability."
bottom:
  actions:
  - move: 2
  - divider
  - retaliate: 2
    enhancement: [circle]
  - custom: "Whenever an adjacent enemy dies this round, move the character token on one of your persistent abilities backwards one slot."
  duration: round

name: Like the Wind
initiative: 77
level: 7
top:
  actions:
  - custom: "Immediately after your next six heal abilities, perform %move%3 %jump%."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
  - custom: "For each ally moved through during the move ability, move the character token on one of your persistent abilities backwards one slot."

name: Unending Fight
initiative: 25
level: 7
top:
  actions:
  - attack: 2
    enhancement: [square]
  - divider
  - move: 3
  - divider
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - custom: "Move the character token on three of your persistent abilities backwards one slot."
  lost: t

name: Against All Odds
initiative: 37
level: 8
top:
  actions:
  - attack: 1
  - optional:
    - custom: "%target% all enemies within 2 hexes."
  - custom: "For each enemy targeted with the attack ability, Move the character token on one of your persistent abilities backwards one slot."
bottom:
  actions:
  - custom: "On the next six instances of an enemy entering a hex adjacent to you, that enemy suffers %damage%3."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Inevitable Conclusion
initiative: 29
level: 8
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
      sub:
      - range: 2
      - group:
        - custom: "Before applying any other bonuses, move the character token on one of your persistent abilities forward one slot: %immobilize%"
    - hex: ttt_tt_et
  lost: t
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - poison

name: Everlasting
initiative: 96
level: 9
top:
  actions:
  - custom: "On your next four sources of 4 or less %damage% you suffer, negate the %damage%"
  - tokens: [1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 3
    - regenerate
    - strengthen
    - group:
      - custom: "Before applying any other bonuses, move the character token on one of your persistent abilities forward one slot: +1 %target%."

name: Use Every Part
initiative: 18
level: 9
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 4
  - divider
  - heal: 4
  - optional:
    - custom: "%target% all allies adjacent to at least one enemy targeted with the attack ability."
bottom:
  actions:
  - move: 3
  - divider
  - attack: X
  - optional:
    - custom: "where X is the number of hexes you moved during the move ability."
