# Red Guard (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Flaming Sickle
initiative: 63
level: A
top:
  actions:
  - attack: 3
    sub:
    - range: 2
bottom:
  actions:
  - attack: 2

name: Blinding Sickle
initiative: 87
level: A
top:
  actions:
  - attack: 2
    sub:
    - range: 2
    - immobilize
bottom:
  actions:
  - move: 4

name: Twirling Stabs
initiative: 38
level: A
top:
  actions:
  - attack: 2
    sub:
    - target: "all adjacent enemies"
bottom:
  actions:
  - attack: 2

name: Shocking Advance
initiative: 14
level: A
top:
  actions:
  - attack: 3
    sub:
    - immobilize
bottom:
  actions:
  - move: 3

name: Desert Night
initiative: 90
level: A
top:
  actions:
  - attack: 3
    sub:
    - muddle
bottom:
  actions:
  - move: 4

name: Shield Spikes
initiative: 41
level: A
top:
  actions:
  - custom: "Two adjacent enemies suffer 2 damage."
bottom:
  actions:
  - heal: 2
    sub:
    - range: 2

name: Desert Night
initiative: 90
level: B
top:
  actions:
  - attack: 2
    sub:
    - disarm
  - optional:
    - custom: "Target one enemy within 2 hexes."
bottom:
  actions:
  - move: 6
  lost: t

name: Flaming Sickle
initiative: 63
level: B
top:
  actions:
  - attack: 3
    sub:
    - range: 2
    - pull: 1
bottom:
  actions:
  - loot: 1

name: Swift Strength
initiative: 16
level: 1
top:
  actions:
  - attack: 2
    enhancement: [circle]
    sub:
    - range: 2
    - target: 2
    - pull: 1
bottom:
  actions:
  - move: 2
    sub:
    - jump
  - divider
  - shield: 1
    enhancement: [diamondPlus]
    sub:
    - custom: "%round%"

name: Healing Sands
initiative: 32
level: 1
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "All attacks targeting you gain Disadvantage this round."
  - custom: "%round%"

name: Shield Spikes
initiative: 41
level: 1
top:
  actions:
  - custom: "Each time after an adjacent enemy attacks you, that enemy suffers damage equal to your Shield value."
  - multi:
    - custom: "%xp2%"
    - custom: "%persistent%"
  lost: t
bottom:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - range: 2
  - fire

name: Flaming Sickle
initiative: 63
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
    - pull: 1
  - fire
bottom:
  actions:
  - custom: "All adjacent enemies suffer 1 damage."
  - loot: 1
  - fire

name: Blinding Sickle
initiative: 87
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
    - immobilize
  - light
bottom:
  actions:
  - custom: "All adjacent enemies suffer 1 damage."
  - loot: 1
  - light

name: Twirling Stabs
initiative: 38
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [light]
    - custom: "+1 %attack%"
  - custom: "%xp1%"
bottom:
  actions:
  - attack: 2
  - optional:
    - consume: [fire]
    - multi:
      - wound: ''
      - custom: ","
      - custom: "%xp1%"

name: Flame Shroud
initiative: 6
level: 1
top:
  actions:
  - custom: "The next five times an enemy enters a hex adjacent to you, the enemy suffers 2 damage."
  - fire
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - optional:
    - consume: [fire]
    - multi:
      - shield: 1
      - custom: ","
      - custom: "%xp1%"
    noLine: true

name: Shocking Advance
initiative: 14
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - immobilize
  - optional:
    - consume: [light]
    - multi:
      - shield: 1
      - custom: ","
      - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - move: 3
  - light

name: Shield of the Desert
initiative: 10
level: 1
top:
  actions:
  - attack: 3
  - optional:
    - consume: [fire]
    - hex: et_st
bottom:
  actions:
  - shield: 3
    enhancement: [diamondPlus]
  - consume: [fire/light]
  - multi:
    - custom: "%xp1%"
    - custom: "%round%"
  lost: t

name: Desert Night
initiative: 90
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - disarm
  - optional:
    - custom: "Target one enemy within 2 hexes."
  - consume: [ice/dark]
bottom:
  actions:
  - move: 6
    enhancement: [circle]
    sub:
    - jump
  - custom: "%xp1%"
  lost: t

name: Warrior of the Sun
initiative: 13
level: X
top:
  actions:
  - shield: 1
    enhancement: [diamondPlus]
  - divider
  - immobilize: ''
    sub:
    - target: "all adjacent enemies"
  - multi:
    - light
    - custom: "%round%"
bottom:
  actions:
  - attack: 2
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - muddle: ''
      - custom: ","
      - custom: "%xp1%"

name: Blade Dance
initiative: 29
level: X
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - pull: 2
      - custom: ","
      - custom: "%xp1%"
  - move: 2
  - divider
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - pull: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 4
    sub:
    - jump
  - custom: "All enemies moved through suffer 1 damage."
  - optional:
    - consume: [light]
    - multi:
      - custom: "2 damage instead"
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "%xp1%"
  lost: t

name: Precision Strike
initiative: 40
level: X
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - optional:
    - consume: [fire]
    - multi:
      - custom: "Advantage"
      - custom: ","
      - custom: "%xp1%"
  - custom: "%xp1%"
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - pull: 2
    sub:
    - range: 3

name: Harvest Sickle
initiative: 52
level: 2
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 2
  - consume: [earth/light]
bottom:
  actions:
  - move: 5
  - optional:
    - custom: "%loot% each hex you enter with this movement."
  - custom: "%xp1%"
  lost: t

name: Barbaric Instincts
initiative: 12
level: 2
top:
  actions:
  - shield: 1
    enhancement: [diamondPlus]
  - divider
  - pull: 1
    sub:
    - range: 2
  - custom: "All adjacent enemies suffer 1 damage."
  - multi:
    - fire
    - custom: "%round%"
bottom:
  actions:
  - optional:
    - consume: [light]
    - multi:
      - move: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - attack: 1
    sub:
    - wound

name: Warmth of the Sun
initiative: 23
level: 3
top:
  actions:
  - group:
    - attack: 3
      sub:
      - custom: "%xp1%"
    - hex: et_tt_stt
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - muddle: ''
      - custom: ","
      - custom: "%xp1%"
  lost: t
bottom:
  actions:
  - heal: 4
    sub:
    - range: 1
      enhancement: [circle]
  - light

name: Strangling Chain
initiative: 19
level: 3
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - immobilize
  - optional:
    - consume: [fire]
    - multi:
      - custom: "2 damage instead"
      - custom: ","
      - custom: "%xp1%"
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - immobilize: ''
    sub:
    - target: "all adjacent enemies"

name: Radiant Sickle
initiative: 79
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 2
  - optional:
    - custom: "All enemies adjacent to the target suffer 1 damage."
  - light
bottom:
  actions:
  - move: 2
  - divider
  - heal: 2
    sub:
    - range: 2
      enhancement: [circle]

name: Burn Away the Dark
initiative: 31
level: 4
top:
  actions:
  - attack: 1
  - optional:
    - consume: [fire]
    - multi:
      - wound: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - disarm: ''
    sub:
    - target: "1 adjacent enemy"
  - multi:
    - optional:
      - consume: [ice]
      - fire
      noLine: true
    - optional:
      - consume: [dark]
      - light
      noLine: true

name: Sand Devil
initiative: 55
level: 5
top:
  actions:
  - custom: "<small>Place the Sand Devil in an adjacent empty hex. It is considered a trap for the purposes of monster focusing and movement. At the start of each of your turns, you may move it up to 2 hexes, and you may force any figure on it to move with it. Any time a figure moves onto the devil or vice versa (not when moving together), the figure suffers 1 damage and gains %muddle%</small>"
  - custom: "%xp2%"
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 5

name: Fierce Brilliance
initiative: 22
level: 6
top:
  actions:
  - custom: "The next four times an enemy enters a hex adjacent to you, that enemy gains %disarm%."
  - light
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "All adjacent enemies suffer 2 damage."

name: Flying Sickle
initiative: 91
level: 6
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 4
    - pull: 3
  - air
bottom:
  actions:
  - attack: 2
  - optional:
    - consume: [light]
    - multi:
      - move: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - attack: 2

name: Vicious Ballet
initiative: 28
level: 7
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [fire]
    - custom: "One adjacent ally may perform an \"%attack%3\" action, %xp1%."
    noLine: true
  - optional:
    - consume: [light]
    - custom: "One different adjacent ally may perform an \"%attack%3\" action, %xp1%."
    noLine: true
bottom:
  actions:
  - custom: "One adjacent enemy suffers 1 damage."
  - move: 2
  - custom: "One adjacent enemy suffers 1 damage."
  - move: 2
  - custom: "One adjacent enemy suffers 1 damage."

name: Horns of the Beast
initiative: 8
level: 7
top:
  actions:
  - group:
    - attack: 4
      sub:
      - push: 1
      - multi:
        - fire
        - custom: "%xp1%"
    - hex: et_st
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - shield: 3
    enhancement: [diamondPlus]
  - optional:
    - consume: [light]
    - multi:
      - shield: 1
      - custom: ","
      - custom: "%xp1%"
  - multi:
    - custom: "%xp1%"
    - custom: "%round%"
  lost: t

name: Prismatic Sickle
initiative: 70
level: 8
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
  - consume: [wild/wild/wild]
bottom:
  actions:
  - loot: 2
  - wild

name: No Fear
initiative: 1
level: 8
top:
  actions:
  - custom: "Any time you are attacked this round, gain %shield%X for the attack, where X is the number of enemies adjacent to you at the time of the attack, up to a maximum of 3."
bottom:
  actions:
  - custom: "The next five times an enemy enters a hex adjacent to you, perform a \"%heal%3, self\" action."
  - light
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"

name: Soaring Shield
initiative: 3
level: 9
top:
  actions:
  - move: 3
    sub:
    - jump
  - divider
  - attack: 4
    sub:
    - target: "all adjacent enemies"
    - stun
  - multi:
    - fire
    - custom: "%xp1%"
  lost: t
bottom:
  actions:
  - move: 3
    sub:
    - jump
  - divider
  - shield: 2
    enhancement: [diamondPlus]
  - optional:
    - consume: [air]
    - multi:
      - shield: 1
      - custom: ","
      - custom: "%xp1%"

name: Honorable Fury
initiative: 89
level: 9
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 2
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - range: 2
      - custom: ","
      - custom: "all enemies adjacent to the target suffer 1 damage."
bottom:
  actions:
  - optional:
    - consume: [light]
    - multi:
      - move: 3
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "All adjacent enemies suffer 3 damage."
