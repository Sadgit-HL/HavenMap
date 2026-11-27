# Red Guard (Jaws of the Lion, Gloomhaven 2nd edition update). The regular cards (level 1 to 9 and X) are read from the card pictures (blind reading,
# 2026-11-26, Claude readers;  comments mark the readers' doubts). The tutorial cards (level A and B) are the Secretariat conversion, not checked and not used.

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
    - mandatory:
        - light
bottom:
  actions:
    - custom: "All adjacent enemies suffer %damage%1."
    - divider
    - loot: 1
    - mandatory:
        - light

name: Desert Night
initiative: 90
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        # check: pill text is "1 enemy within two hexes," then the disarm icon
        - target: 1 enemy within two hexes
        - disarm
    - mandatory:
        - ice
        - dark
bottom:
  actions:
    - move: 6
      enhancement: [circle]
      sub:
        # check: the pill icon is a curved arrow landing on a base (jump)
        - jump
  xp: 1
  lost: t

name: Flame Shroud
initiative: 6
level: 1
top:
  actions:
    - custom: "The next five times an enemy enters a hex adjacent to you, that enemy suffers %damage%2."
    # check: five circles, the first one dashed; xp on the 2nd and 5th
    - tokens: [0, 1, 0, 0, 1]
    - mandatory:
        - fire
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - optional:
        - consume: [fire]
        - custom: "%shield% 1, %xp1%"
  duration: round

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
    - mandatory:
        - fire
bottom:
  actions:
    - custom: "All adjacent enemies suffer %damage%1."
    - divider
    - loot: 1
    - mandatory:
        - fire

name: Healing Sands
initiative: 32
level: 1
top:
  actions:
    - heal: 4
      enhancement: [diamondPlus]
      sub:
        - self
  xp: 1
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "All attacks targeting you this round gain disadvantage."
  duration: round

name: Shield of the Desert
initiative: 10
level: 1
top:
  actions:
    - attack: 3
    - optional:
        - group:
            - consume: [fire]
            - hex: et_st
        - group:
            - consume: [light]
            - custom: "+1 %attack%, %push% 1, %xp1%"
bottom:
  actions:
    - shield: 3
      enhancement: [diamondPlus]
    - mandatory:
        - fire
        - light
  xp: 1
  duration: round
  lost: t

name: Shield Spikes
initiative: 41
level: 1
top:
  actions:
    - retaliate: X
    - custom: "where X is your %shield% value whenever you are attacked."
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    # check: the marker after the heal value is a small diamond with a plus
    - heal: 2
      enhancement: [diamondPlus]
      sub:
        - range: 2
    - mandatory:
        - fire

name: Shocking Advance
initiative: 14
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - immobilize
    - divider
    # check: no T-line above the dashed box, only a plain divider, so standalone
    - optional:
        - consume: [light]
        - custom: "%shield% 1, %xp1%"
      noLine: true
  duration: round
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - mandatory:
        - light

name: Swift Strength
initiative: 16
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - target: 2
        - range: 2
        - pull: 1
bottom:
  actions:
    - move: 2
      sub:
        - jump
    - divider
    # check: the marker after shield 1 is a small diamond with a plus
    - shield: 1
      enhancement: [diamondPlus]
  duration: round

name: Twirling Stabs
initiative: 38
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - target: all adjacent enemies
    - optional:
        - consume: [light]
        - custom: "+1 %attack%"
  xp: 1
bottom:
  actions:
    - attack: 2
    - optional:
        - consume: [fire]
        - custom: "%wound%, %xp1%"

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
        - custom: "+1 %attack%, %pull% 2, %xp1%"
    - divider
    - move: 2
    - divider
    - attack: 1
      enhancement: [diamond]
      sub:
        - range: 3
    - optional:
        - consume: [light]
        - custom: "+1 %attack%, %pull% 2, %xp1%"
bottom:
  actions:
    - move: 4
      enhancement: [circle]
      sub:
        - jump
    - custom: "All enemies moved through with the move ability suffer %damage%1."
    - optional:
        - consume: [light]
        - custom: "+1 %damage%, %xp1%"
  xp: 1
  lost: t

name: Precision Strike
initiative: 40
level: X
top:
  actions:
    - attack: 4
      enhancement: [diamond]
    - custom: "Add +3 %attack% if the target has a negative condition."
    - optional:
        - consume: [fire]
        - custom: "advantage, %xp1%"
  xp: 1
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - pull: 2
      sub:
        - range: 3

name: Warrior of the Sun
initiative: 13
level: X
top:
  actions:
    # check: the shield marker looks like a diamond with a cross inside (diamondPlus)
    - shield: 1
      enhancement: [diamondPlus]
    - divider
    - immobilize: ''
      sub:
        - target: all
        - range: 1
    - mandatory:
        - light
  duration: round
bottom:
  actions:
    - attack: 2
    - optional:
        - consume: [light]
        - custom: "+1 %attack%, %muddle%, %xp1%"

name: Barbaric Instincts
initiative: 12
level: 2
top:
  actions:
    # check: the shield marker looks like a diamond with a cross inside (diamondPlus)
    - shield: 1
      enhancement: [diamondPlus]
    - divider
    - pull: 1
      sub:
        - range: 2
    - divider
    - custom: "All adjacent enemies suffer %damage%1."
    - mandatory:
        - fire
  duration: round
bottom:
  actions:
    - optional:
        - consume: [light]
        - custom: "%move% 2, %xp1%"
      noLine: true
    - divider
    - attack: 1
      sub:
        - wound

name: Harvest Sickle
initiative: 52
level: 2
top:
  actions:
    - attack: 4
      enhancement: [diamond]
      sub:
        - range: 2
    - mandatory:
        - earth
        - light
bottom:
  actions:
    - move: 5
    - custom: "%loot% each hex you enter with the move ability."
  xp: 1
  lost: t

name: Strangling Chain
initiative: 19
level: 3
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - immobilize
    - custom: "Place a character token on the target of the attack ability. Each time the target is attacked this round, it suffers %damage%1."
    - optional:
        - consume: [fire]
        - group:
            - custom: "It suffers %damage%2 instead. Track this by placing a character token here, %xp1%."
            - tokens: [1]
  duration: round
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - immobilize: ''
      sub:
        - target: all
        - range: 1

name: Warmth of the Sun
initiative: 23
level: 3
top:
  actions:
    - group:
        - group:
            - attack: 3
            - optional:
                - consume: [light]
                - custom: "+1 %attack%, %muddle%, %xp1%"
        - hex: et_tt_stt
  xp: 1
  lost: t
bottom:
  actions:
    - heal: 4
      sub:
        - range: 1
          enhancement: [square]
    - mandatory:
        - light

name: Burn Away the Dark
initiative: 31
level: 4
top:
  actions:
    - attack: 1
      sub:
        - custom: "%target% all enemies within 2 hexes"
    - optional:
        - consume: [fire]
        - custom: "%wound%, %xp1%"
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - disarm: ''
      sub:
        - range: 1
    - divider
    - optional:
        - group:
            - consume: [ice]
            - custom: "%fire%"
        - group:
            - consume: [dark]
            - custom: "%light%"
      noLine: true

name: Radiant Sickle
initiative: 79
level: 4
top:
  actions:
    - attack: 4
      enhancement: [diamond]
      sub:
        - range: 2
    - custom: "All enemies adjacent to the target suffer %damage%1."
    - mandatory:
        - light
bottom:
  actions:
    - move: 2
    - divider
    - heal: 2
      sub:
        - range: 2
          enhancement: [square]

name: Sand Devil
initiative: 55
level: 5
top:
  actions:
    - custom: "Place the Sand Devil Token in an adjacent empty hex."
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 5

name: Fierce Brilliance
initiative: 22
level: 6
top:
  actions:
    - custom: "The next four times an enemy enters a hex adjacent to you, that enemy gains %disarm%."
    - tokens: [0, 1, 0, 1]
    - mandatory:
        - light
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "All adjacent enemies suffer %damage%2."

name: Flying Sickle
initiative: 91
level: 6
top:
  actions:
    - attack: 5
      enhancement: [diamond]
      sub:
        - range: 4
        # check: the second pill icon is a dark diamond with a down arrow, read as pull
        - pull: 3
    - mandatory:
        - air
bottom:
  actions:
    - attack: 2
    - divider
    - optional:
        - consume: [light]
        - custom: "%move% 2, %xp1%"
      noLine: true
    - divider
    - attack: 2

name: Horns of the Beast
initiative: 8
level: 7
top:
  actions:
    - group:
        - attack: 4
          sub:
            - push: 1
        - hex: et_st
    - mandatory:
        - fire
  xp: 1
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - shield: 3
      # check: the marker after the shield value is a small diamond with a dot, read as plus
      enhancement: [diamondPlus]
    - optional:
        - consume: [light]
        - custom: "+1 %shield%, %xp1%"
  xp: 1
  duration: round
  lost: t

name: Vicious Ballet
initiative: 28
level: 7
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - divider
    - optional:
        - consume: [fire]
        - custom: "One adjacent ally may perform: %attack% 3, %xp1%"
      noLine: true
    - divider
    - optional:
        - consume: [light]
        - custom: "One different adjacent ally may perform: %attack% 3, %xp1%"
      noLine: true
bottom:
  actions:
    - custom: "One adjacent enemy suffers %damage%1."
    - divider
    - move: 2
    - divider
    - custom: "One adjacent enemy suffers %damage%1."
    - divider
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "One adjacent enemy suffers %damage%1."

name: No Fear
initiative: 1
level: 8
top:
  actions:
    - shield: X
    - custom: "Where X is the number of enemies adjacent to you whenever you are attacked, up to a maximum of 3."
  duration: round
bottom:
  actions:
    - custom: "The next five times an enemy enters a hex adjacent to you, perform"
    - heal: 3
      sub:
        - self
    # check: which circles give xp (burst at upper right of circle 2 and circle 5); first circle is dashed
    - tokens: [0, 1, 0, 0, 1]
    - mandatory:
        - light
  duration: persistent
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
    - mandatory:
        - wild
        - wild
        - wild
bottom:
  actions:
    - loot: 2
    - mandatory:
        - wild

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
        - group:
            - consume: [fire]
            - custom: "+1 %attack%, +2 %range%, all enemies adjacent to the target suffer %damage%1."
        - group:
            - consume: [light]
            - custom: "+1 %attack%, advantage, %muddle%"
bottom:
  actions:
    - optional:
        - consume: [light]
        - custom: "%move% 3, %xp1%"
      noLine: true
    - divider
    - custom: "All adjacent enemies suffer %damage%3."

name: Soaring Shield
initiative: 11
level: 9
top:
  actions:
    - move: 3
      sub:
        - jump
    - divider
    - attack: 4
      sub:
        - target: all adjacent enemies
        - stun
    - mandatory:
        - fire
  xp: 1
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
        - custom: "+1 %shield%, %xp1%"
  duration: round

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
