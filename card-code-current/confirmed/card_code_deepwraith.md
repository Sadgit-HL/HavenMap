# Deepwraith (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Skull Collection
initiative: 22
level: 1
top:
  actions:
  - custom: "During your turn, you may perform any number of the following abilities:"
  - group:
    - custom: "-1 %fh-trophy%:"
    - poison: ''
      sub:
      - range: 1
  - divider
  - group:
    - custom: "-1 %fh-trophy%:"
    - muddle: ''
      sub:
      - range: 1
  - divider
  - group:
    - custom: "-1 %fh-trophy%:"
    - dark
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Hollow Aura
initiative: 88
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 2
  - mandatory:
    - dark
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - optional:
    - consume: [wild]
    - custom: "Gain 1 %fh-trophy%."
    noLine: true

name: Skewer the Flesh
initiative: 86
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - immobilize
  - divider
  - attack: 1
    enhancement: [square]
    sub:
    - immobilize
bottom:
  actions:
  - teleport: 3
    enhancement: [square]
  - divider
  - group:
    - custom: "-1 %fh-trophy% %dark%:"
    - multi:
      - invisible: ''
        sub:
        - self
      - custom: ","
      - custom: "%xp1%"

name: Succumb to Fear
initiative: 20
level: 1
top:
  actions:
  - group:
    - custom: "-1 %fh-trophy%:"
    - bane: ''
      sub:
      - target: "1 adjacent normal or elite enemy that has three or more negative conditions"
  xp: 1
bottom:
  actions:
  - teleport: 3
    enhancement: [square]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 1

name: Ink Cloud
initiative: 28
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: "all adjacent enemies"
  - mandatory:
    - dark
bottom:
  actions:
  - invisible: ''
    sub:
    - target: "all"
    - range: 1
  - mandatory:
    - dark
  xp: 1
  lost: t

name: Lacerating Stabs
initiative: 14
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - wound
  - divider
  - attack: 2
    enhancement: [diamond]
    sub:
    - wound
  - custom: "Add +1 %attack% if the target is different from the target of the previous attack ability."
  - attack: 2
    enhancement: [diamond]
    sub:
    - wound
  - custom: "Add +2 %attack% if the target is different from the targets of both previous attack abilities."
  xp: 2
  lost: t
bottom:
  actions:
  - teleport: 3
    enhancement: [square]
  - divider
  - wound: ''
    sub:
    - range: 1

name: Staring into the Abyss
initiative: 63
level: 1
top:
  actions:
  - stun: ''
    sub:
    - range: 1
    - group:
      - custom: "-1 %fh-trophy% %dark%: +1 %target%, %xp1%"
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - group:
    - custom: "-1 %fh-trophy%:"
    - disarm: ''
      sub:
      - range: 1

name: Mantle of Dread
initiative: 96
level: 1
top:
  actions:
  - poison: ''
    enhancement: [circle]
    sub:
    - target: "all"
    - range: 1
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+1 %range%"
bottom:
  actions:
  - custom: "After one of your move or teleport abilities each turn, give %wound% or %muddle% to one adjacent enemy."
  - mandatory:
    - dark
  xp: 2
  lost: t
  duration: persistent

name: Black Scythe
initiative: 45
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - curse: ''
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - loot: 1
  - custom: "Gain 1 %fh-trophy%."

name: Tumultuous Panic
initiative: 66
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
  - divider
  - move: 2
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - teleport: 4
    enhancement: [circle]
  - divider
  - immobilize: ''
    sub:
    - target: "all"
    - range: 1
  - divider
  - teleport: 2
    enhancement: [square]
  - divider
  - disarm: ''
    sub:
    - range: 1
  xp: 1
  lost: t

name: Soul Hunger
initiative: 91
level: X
top:
  actions:
  - bane: ''
    sub:
    - target: "1 adjacent normal or elite enemy that has two or more negative conditions"
  - divider
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - self
  - mandatory:
    - dark
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "If you have %invisible%, gain 1 %fh-trophy%."
  - teleport: 3
  - mandatory:
    - dark

name: Morbid Camouflage
initiative: 31
level: X
top:
  actions:
  - attack: 2
    enhancement: [square]
  - custom: "If this attack kills an enemy, gain %invisible% and %xp1%."
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "If this movement ends in a hex with a loot token, gain %invisible%."

name: Haunting Brutality
initiative: 23
level: X
top:
  actions:
  - attack: 3
    enhancement: [square]
  - optional:
    - consume: [dark]
    - wound: ''
    - poison: ''
    - custom: "%xp1%"
bottom:
  actions:
  - teleport: 6
    enhancement: [circle]
  - custom: "All adjacent enemies suffer %damage%2."
  - mandatory:
    - dark
  xp: 1
  lost: t

name: Slipping into Death
initiative: 89
level: 2
top:
  actions:
  - attack: 1
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - custom: "+1 %attack%"
  - custom: "If you killed an enemy with the attack ability, perform:"
  - bane: ''
    sub:
    - target: "1 normal enemy adjacent to the hex the killed enemy occupied"
    - custom: "%xp1%"
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - bane: ''
    sub:
    - target: "1 adjacent damaged enemy that has 4 or fewer hit points"

name: Lie in Wait
initiative: 98
level: 2
top:
  actions:
  - curse: ''
    sub:
    - target: 3
    - range: 1
    - group:
      - custom: "-1 %fh-trophy%: +1 %target%"
  - custom: "Add +1 %range% if you have %invisible%."
bottom:
  actions:
  - teleport: 3
    enhancement: [square]
  - divider
  - group:
    - custom: "-1 %fh-trophy%:"
    - heal: 3
      sub:
      - self

name: Crippling Terror
initiative: 15
level: 3
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: 2
    - group:
      - custom: "-1 %fh-trophy%:"
      - multi:
        - push: 2
        - custom: ","
        - immobilize: ''
  - mandatory:
    - dark
  xp: 2
  lost: t
bottom:
  actions:
  - teleport: 3
    enhancement: [circle]
  - custom: "You and all allies add %pierce%3 to all your attacks this round targeting enemies within %range%2 (of yourself) that have any negative conditions."
  duration: round

name: Pinning Spines
initiative: 25
level: 3
top:
  actions:
  - attack: 1
    enhancement: [circle]
    sub:
    - disarm
  - divider
  - attack: 1
    enhancement: [circle]
    sub:
    - immobilize
bottom:
  actions:
  - immobilize: ''
    sub:
    - target: "all"
    - range: 5
  - custom: "All enemies that have %immobilize% suffer %damage%2."
  xp: 1
  lost: t

name: Crushing Darkness
initiative: 40
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - group:
      - custom: "-1 %fh-trophy%:"
      - multi:
        - attack: 1
        - custom: ","
        - curse: ''
        - custom: ","
        - custom: "%xp1%"
bottom:
  actions:
  - muddle: ''
    sub:
    - target: "all"
    - range: 2
  - optional:
    - consume: [dark]
    - custom: "+3 %range%"

name: Grim Trophies
initiative: 18
level: 4
top:
  actions:
  - loot: 1
  - custom: "Gain 1 %fh-trophy% for each loot token looted."
bottom:
  actions:
  - custom: "Spend any number of %fh-trophy%. For each %fh-trophy% spent, perform:"
  - move: 1
  - divider
  - attack: 1

name: Extra Decoration
initiative: 92
level: 5
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if you have %invisible%."
  - custom: "If you killed an enemy with the attack ability, gain 1 (additional) %fh-trophy%."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "All adjacent enemies suffer %damage%1."
  - mandatory:
    - dark

name: Death Spiral
initiative: 48
level: 5
top:
  actions:
  - custom: "Add %stun%, %curse%, and %curse% to your next bane ability."
  - tokens: [1]
  - mandatory:
    - dark
  duration: persistent
bottom:
  actions:
  - custom: "Gain advantage on and add %pierce%2 to all your attacks this round."
  - custom: "If you have %invisible%, perform:"
  - teleport: 3
    enhancement: [circle]
  duration: round

name: Claw of Doom
initiative: 30
level: 6
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - stun
  - mandatory:
    - dark
  xp: 1
bottom:
  actions:
  - teleport: 5
    enhancement: [circle]

name: The Remorseless Deep
initiative: 22
level: 6
top:
  actions:
  - brittle: ''
    sub:
    - target: "1 adjacent enemy that has %bane%"
  - custom: "Gain 1 %fh-trophy%."
  - mandatory:
    - dark
  xp: 1
bottom:
  actions:
  - teleport: 3
    enhancement: [square]
  - divider
  - wound: ''
    sub:
    - target: "all"
    - range: 1

name: Hasten the End
initiative: 65
level: 7
top:
  actions:
  - bane: ''
    sub:
    - target: "1 adjacent damaged normal or elite enemy that has %wound%"
  xp: 1
bottom:
  actions:
  - teleport: 4
    enhancement: [circle]
  - mandatory:
    - damage: 10
      sub:
      - self
  - bane: ''
    sub:
    - target: "all"
    - range: 1
  xp: 2
  lost: t

name: Dire frenzy
initiative: 26
level: 7
top:
  actions:
  - attack: 2
  - divider
  - move: 2
  - divider
  - attack: 2
    enhancement: [square]
  - divider
  - move: 2
  - divider
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "If you have %invisible%, perform:"
  - poison: ''
    sub:
    - target: "all"
    - range: 1

name: Unseen Horror
initiative: 19
level: 8
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - custom: "Add +1 %attack%, %brittle%, and gain %xp1% if the target has none of its allies in line-of-sight."
  - optional:
    - consume: [dark]
    - custom: "Ignore the line-of-sight restriction."
    noLine: true
bottom:
  actions:
  - custom: "While you have %invisible%, once during your turn, you may spend 1 %fh-trophy% to add +1 %attack% and %wound% to all your attacks for the turn."
  - mandatory:
    - dark
  xp: 2
  lost: t
  duration: persistent

name: Rip from the Bone
initiative: 11
level: 8
top:
  actions:
  - attack: 2
    enhancement: [circle]
    sub:
    - target: "all adjacent enemies"
    - wound
  - custom: "Gain 1 %fh-trophy% for each enemy targeted with the attack ability."
bottom:
  actions:
  - teleport: 3
    enhancement: [square]
  - divider
  - disarm: ''
    sub:
    - range: 1

name: Black Night of the Deep
initiative: 26
level: 9
top:
  actions:
  - group:
    - custom: "-1 %fh-trophy% %dark%:"
    - multi:
      - invisible: ''
        sub:
        - self
      - custom: ","
      - custom: "%xp1%"
  - divider
  - attack: 3
    enhancement: [circle]
    sub:
    - target: 3
    - range: 2
    - curse
bottom:
  actions:
  - teleport: 4
    enhancement: [circle]
  - divider
  - immobilize: ''
    sub:
    - target: "all"
    - range: 1
  - mandatory:
    - dark

name: Consume the Helpless
initiative: 12
level: 9
top:
  actions:
  - bane: ''
    enhancement: [diamond]
    sub:
    - target: "1 adjacent enemy that has %immobilize% or %stun%"
  xp: 1
bottom:
  actions:
  - custom: "At the end of each round, if you gained at least 1 %fh-trophy% this round, perform:"
  - heal: 3
    sub:
    - self
  xp: 2
  lost: t
  duration: persistent
