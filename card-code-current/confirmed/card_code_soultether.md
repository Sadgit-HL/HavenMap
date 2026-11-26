# Soultether (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Ethereal Gust
initiative: 14
level: 1
top:
  actions:
  - custom: "Grant two of your summons:"
  - move: 0
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - mandatory:
    - air

name: Forged Ferocity
initiative: 37
level: 1
top:
  actions:
  - summon:
      name: Iron Beast
      stats: [7, 2, 1, -]
      special:
      - shield: 1
      enhancement: [square, square, square, 0]
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: "1 of your summons"
  - mandatory:
    - fire

name: Living Night
initiative: 96
level: 1
top:
  actions:
  - summon:
      name: Shadow Wolf
      stats: [2, 3, 2, -]
      special:
      - pierce: 1
      enhancement: [square, square, square, 0]
  - custom: "Whenever a Shadow Wolf dies, %dark% and all Shadow Wolves gain %invisible%."
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "On the next two attacks targeting one of your summons, the attacker gains disadvantage for the attack and suffers %damage%1 after the attack."
  - tokens: [0, 0]
  - mandatory:
    - dark
  duration: persistent

name: Wild Animation
initiative: 92
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 4
bottom:
  actions:
  - summon:
      name: Thorn Shooter
      stats: [3, 2, "%poison%", 4]
      enhancement: [square, square, 0, square]
  xp: 1
  lost: t
  duration: persistent

name: Planar Protection
initiative: 94
level: 1
top:
  actions:
  - disarm: ''
    sub:
    - range: 4
bottom:
  actions:
  - summon:
      name: Rift Spirit
      stats: [2, 2, "%muddle%", 3]
      special:
      - custom: "At end of turn, grant one ally within %range%3:"
      - shield: 1
      enhancement: [square, 0, 0, 0]
  xp: 1
  lost: t
  duration: persistent

name: Mighty Bond
initiative: 51
level: 1
top:
  actions:
  - custom: "Grant one of your summons:"
  - move: 0
  - attack: 0
  xp: 1
bottom:
  actions:
  - teleport: 2
    enhancement: [circle]
  - optional:
    - consume: [dark]
    - multi:
      - teleport: 2
      - custom: ","
      - custom: "%xp1%"

name: Bonded Might
initiative: 61
level: 1
top:
  actions:
  - custom: "Grant one of your summons:"
  - move: 0
  - attack: 0
  xp: 1
bottom:
  actions:
  - optional:
    - consume: [air]
    - multi:
      - move: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - loot: 1

name: Burning Passion
initiative: 12
level: 1
top:
  actions:
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: 2
    - range: 4
  - mandatory:
    - fire
bottom:
  actions:
  - custom: "Negate the next %damage% one of your summons would suffer this round."
  duration: round

name: Unending Dominance
initiative: 22
level: 1
top:
  actions:
  - custom: "%recover% one card from your lost pile."
  - invisible: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "On the next summon action you perform, any summons summoned by that action gain %invisible%."
  - tokens: [0]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Grant one of your summons:"
  - move: 2
    enhancement: [square]

name: Shadow Dart
initiative: 28
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - curse
  - mandatory:
    - dark
bottom:
  actions:
  - custom: "All your summons' attacks are unaffected by %retaliate%."
  xp: 1
  lost: t
  duration: persistent

name: Burning Tether
initiative: 43
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 4
    - wound
  - optional:
    - consume: [fire]
    - custom: "+1 %target%, %xp1%"
bottom:
  actions:
  - teleport: 3
    enhancement: [square]

name: Primal Assault
initiative: 20
level: 1
top:
  actions:
  - custom: "Grant two of your summons:"
  - attack: 1
  - optional:
    - consume: [fire]
    - multi:
      - wound: ''
    noLine: true
  - optional:
    - consume: [air]
    - multi:
      - pierce: 2
    noLine: true
  - optional:
    - consume: [dark]
    - multi:
      - curse: ''
    noLine: true
  xp: 2
  lost: t
bottom:
  actions:
  - heal: 2
    enhancement: [circle]
    sub:
    - range: 3
      enhancement: [square]

name: Drifting Stingers
initiative: 90
level: X
top:
  actions:
  - summon:
      name: Floating Jellyfish
      stats: [5, 1, 3, -]
      special:
      - fly: ''
      enhancement: [square, 0, 0, 0]
  - mandatory:
    - air
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 3
    enhancement: [square]

name: Biting Wind
initiative: 82
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - push: 1
      enhancement: [square]
  - optional:
    - consume: [air]
    - custom: "+1 %attack%, +1 %range%, +1 %push%, %xp1%"
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - move: 0
  - push: 2
    sub:
    - target: "all"
    - range: 1
  - custom: "Each target suffers %damage%2 after the push."
  - mandatory:
    - air
  xp: 2
  lost: t

name: Unwavering Hand
initiative: 31
level: X
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 1
  xp: 1
bottom:
  actions:
  - custom: "Control one enemy within %range%4:"
  - move: 1
    enhancement: [square]
  - mandatory:
    - air

name: Intervening Apparitions
initiative: 34
level: 2
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 0
  - optional:
    - consume: [fire]
    - hex: ett_st
    noLine: true
  xp: 1
bottom:
  actions:
  - custom: "On the next three sources of %damage% that would kill one of your summons, negate the %damage% and that summon gains %invisible%, %stun%."
  - tokens: [1, 0, 1]
  - mandatory:
    - dark
  lost: t
  duration: persistent

name: Void Imbuement
initiative: 23
level: 2
top:
  actions:
  - custom: "On the next three attacks performed by your summons, add +1 %attack%, %pierce%1 to the attack."
  - tokens: [0, 0, 1]
  duration: persistent
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - move: 1
    sub:
    - jump
  - optional:
    - consume: [air]
    - multi:
      - custom: "Grant two of your summons the move ability instead, %xp1%."
    noLine: true

name: Shaping the Void
initiative: 41
level: 3
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - divider
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - range: 4
  - mandatory:
    - air
bottom:
  actions:
  - teleport: 3
    enhancement: [circle]
  - divider
  - heal: 1
    sub:
    - target: "all your summons"
    - range: 1

name: Deadly Mischief
initiative: 81
level: 3
top:
  actions:
  - summon:
      name: Covetous Imp
      stats: [5, 3, 3, -]
      enhancement: [square, square, square, 0]
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - mandatory:
    - fire

name: Strength in Numbers
initiative: 45
level: 4
top:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - target: 2
      enhancement: [square]
    - range: 4
  - custom: "Add +1 %heal% on each target adjacent to two or more allies."
bottom:
  actions:
  - attack: X
    sub:
    - range: "X+1"
  - custom: "where X is the number of your summons."

name: Volatile Flame
initiative: 97
level: 4
top:
  actions:
  - curse: ''
    enhancement: [diamond]
    sub:
    - range: 4
  - optional:
    - consume: [dark]
    - multi:
      - stun: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - summon:
      name: Ember Sprite
      stats: [3, 3, 1, 3]
      special:
      - custom: "All allies within %range%3 gain %retaliate%1 %range%3 while %fire% is strong or waning."
      enhancement: [square, 0, 0, 0]
  - mandatory:
    - fire
  xp: 1
  lost: t
  duration: persistent

name: Living Mountain
initiative: 19
level: 5
top:
  actions:
  - summon:
      name: Rock Colossus
      stats: [12, 2, 1, -]
      special:
      - muddle: ''
      enhancement: [square, square, square, 0]
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 3
    enhancement: [circle]
  - custom: "Grant one of your summons:"
  - teleport: 3
    enhancement: [square]

name: Primal Infusion
initiative: 88
level: 5
top:
  actions:
  - custom: "Grant one of your summons:"
  - move: 1
  - divider
  - attack: 1
  xp: 1
bottom:
  actions:
  - custom: "Your summons gain +1 %attack% while %fire% is strong or waning, +1 %move% and %jump% while %air% is strong or waning, and %shield%1 while %dark% is strong or waning."
  xp: 1
  lost: t
  duration: persistent

name: Tear the Fabric
initiative: 11
level: 6
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - curse
  - divider
  - invisible: ''
    enhancement: [diamondPlus]
    sub:
    - target: "1 of your summons"
    - range: 4
  - mandatory:
    - dark
bottom:
  actions:
  - custom: "Grant all your summons:"
  - shield: 1
    enhancement: [square]
  - retaliate: 1
    enhancement: [square]
  duration: round

name: Oozing Manifestation
initiative: 86
level: 6
top:
  actions:
  - summon:
      name: Slime Spirit
      stats: [5, 2, 2, -]
      special:
      - poison: ''
      enhancement: [square, square, square, 0]
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 4
    enhancement: [circle]
  - divider
  - poison: ''
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [square]

name: Divided Mind
initiative: 30
level: 7
top:
  actions:
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - range: 4
  - custom: "Grant the target of the heal ability:"
  - optional:
    - consume: [air]
    - multi:
      - push: 1
        sub:
        - range: 1
        - immobilize
    noLine: true
  xp: 1
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 0
  - optional:
    - consume: [fire]
    - multi:
      - custom: "Grant two of your summons the attack ability instead, %xp1%."
    noLine: true

name: Negative Energy
initiative: 95
level: 7
top:
  actions:
  - summon:
      name: Void Eater
      stats: [6, 3, 4, -]
      enhancement: [square, square, square, 0]
  - mandatory:
    - dark
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 4
    enhancement: [circle]
  - divider
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3

name: Otherworldly Rage
initiative: 35
level: 8
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 2
    sub:
    - wound
    - poison
  xp: 1
bottom:
  actions:
  - custom: "%recover% one card from your lost pile that has a summon action and immediately play that card to perform the summon action. Any summons summoned by that action gain %ward%, %invisible%, and %strengthen%."
  - invisible: ''
    enhancement: [diamondPlus]
    sub:
    - self
  lost: t

name: Interplanar Mastery
initiative: 27
level: 8
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - wound: ''
  - optional:
    - consume: [air]
    - custom: ","
    - custom: "%xp1%"
    - custom: "+1 %attack%"
    - custom: "+2 %pierce%"
  - optional:
    - consume: [dark]
    - stun: ''
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  xp: 1
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - teleport: 3
    enhancement: [square]
  - shield: 1
    enhancement: [square]
  - optional:
    - consume: [dark]
    - multi:
      - custom: "All adjacent enemies suffer %damage%1 and gain %muddle%."
    noLine: true
  duration: round

name: Imposed Will
initiative: 98
level: 9
top:
  actions:
  - summon:
      name: Fey Subjugator
      stats: [4, 2, 1, 4]
      special:
      - fly: ''
      enhancement: [square, square, square, square]
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Whenever one of your summons is attacked, if that summon does not have %ward%, it gains %ward% after the attack and the attacker suffers %damage%1."
  xp: 1
  lost: t
  duration: persistent

name: Horned Nightmare
initiative: 80
level: 9
top:
  actions:
  - summon:
      name: Prismatic Unicorn
      stats: [8, 4, 3, -]
      special:
      - pierce: 2
      enhancement: [square, square, square, 0]
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 6
    enhancement: [circle]
