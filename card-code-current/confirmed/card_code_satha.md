# Satha (Mercenary Pack), card code read from the card pictures with tools/card-extraction and checked card by card by the owner: all 29 cards are right (2026-11-24).
# Satha has 29 cards, numbered 01 to 29 on the pictures. The card list had a second Blade of the North at level 9 (the same picture as level 1); it is dropped (CARD_DROP in tools/extract-campaign-tables.py).
name: Blade of the North
initiative: 76
level: 1
top:
  actions:
  - attack: 3
    enhancement:
    - diamond
  - optional:
    - consume:
      - ice
    - custom: "+2 %attack%, %xp1%"
bottom:
  actions:
  - custom: "Grant one ally within %range% 3:"
  - attack: 6
    enhancement:
    - diamond
  xp: 2
  lost: t

name: Bring Them Down
initiative: 16
level: 1
top:
  actions:
  - attack: 2
    enhancement:
    - diamond
    sub:
    - range: 3
  - divider
  - strengthen: ''
    enhancement:
    - diamondPlus
    sub:
    - target: 1 ally
    - range: 3
  - mandatory:
    - ice
bottom:
  actions:
  - move: 2
    enhancement:
    - square
  - divider
  - custom: "Add +1 %attack% to the first attack performed by each ally targeting an enemy adjacent to you this round."
  duration: round

name: Combined Might
initiative: 22
level: 1
top:
  actions:
  - attack: 3
    enhancement:
    - diamond
    sub:
    - pierce: 2
  - divider
  - custom: "Add %pierce% 2 to the next attack performed %lf% by an ally this round."
  duration: round
bottom:
  actions:
  - move: 3
    enhancement:
    - square
  - divider
  - optional:
    - consume:
      - ice
    - ward: ''
      sub:
      - range: 2
    - custom: "%xp1%"
    noLine: true

name: Dazing Sweep
initiative: 86
level: 1
top:
  actions:
  - group:
    - group:
      - attack: 2
        enhancement:
        - square
        sub:
        - muddle
      - optional:
        - consume:
          - ice
        - custom: "+1 %attack%, %xp1%"
    - hex: et_st_ex
bottom:
  actions:
  - move: 3
    enhancement:
    - circle
    sub:
    - jump
  - divider
  - custom: "Add +1 %attack% to your next attack this turn if you are adjacent to two or more enemies."

name: Get Behind Me
initiative: 11
level: 1
top:
  actions:
  - shield: 1
  - divider
  - mandatory:
    - custom: "At the end of a round in which an ally was attacked, you must move this card to your discard pile."
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 4

name: Implacable Advance
initiative: 82
level: 1
top:
  actions:
  - group:
    - attack: 2
      sub:
      - stun
    - hex: et_st
  - divider
  - custom: "Grant self and all allies within %range% 3:"
  - move: 3
    enhancement:
    - circle
    sub:
    - jump
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4

name: Lead the Charge
initiative: 39
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +1 %attack%, %push% 2, and gain %xp1% if you were adjacent to no enemies at the start of your turn."
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - custom: "Grant one ally within %range% 3:"
  - move: 2
    enhancement: [square]

name: Shared Glory
initiative: 8
level: 1
top:
  actions:
  - shield: 1
  - divider
  - custom: "Grant one ally within %range% 3:"
  - move: 2
    enhancement: [square]
  - mandatory:
    - ice
  duration: round
bottom:
  actions:
  - custom: "The next time an ally gains any loot this round, you gain one loot token from the supply."
  - divider
  - loot: 1
  - divider
  - custom: "Grant one ally within %range% 3:"
  - loot: 1
  duration: round

name: Spur Their Spirits
initiative: 18
level: 1
top:
  actions:
  - heal: 1
    enhancement: [diamondPlus]
    sub:
    - self
    - ward
  - divider
  - custom: "One ally within %range% 3 may immediately play one card from their hand and perform the top or bottom action of the card. If they do, gain %xp1%."
bottom:
  actions:
  - custom: "Negate the next source of %damage% an ally would suffer this round."
  duration: round

name: Victory Rush
initiative: 63
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - custom: advantage
  - divider
  - custom: "If the attack ability killed an enemy, perform:"
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - custom: "%target% the ally closest to you or self"
bottom:
  actions:
  - attack: 2
    enhancement: [square]
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - range: 2

name: Emboldening Call
initiative: 31
level: X
top:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - range: 3
  - divider
  - custom: "If the target of the heal ability was an ally, grant them:"
  - move: 2
    enhancement: [square]
  - mandatory:
    - light
bottom:
  actions:
  - move: 4

name: Take Command
initiative: 55
level: X
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
    - hex: et_st_et
  - divider
  - heal: 4
    sub:
    - custom: "%target% all allies in the red hexes of the attack ability"
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "Allies add +1 %attack% to all their attacks they perform during your turn."
  - custom: "Allies add +1 %move% to all their move abilities they perform during your turn."
  xp: 1
  duration: persistent

name: Wolf Pack Tactics
initiative: 26
level: X
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    - divider
    - custom: "Grant one ally within %range% 3:"
    - attack: 2
      enhancement: [diamond]
    - mandatory:
        - ice
bottom:
  actions:
    - move: 3
      enhancement: [square]
    - divider
    - custom: "Grant all allies within %range% 3:"
    - move: 1
      enhancement: [square]
    - custom: "This movement must end closer to an enemy."

name: Outmaneuver
initiative: 41
level: 2
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - divider
    - custom: "Grant one ally within %range% 3:"
    - move: 3
      enhancement: [square]
    - mandatory:
        - ice
bottom:
  actions:
    - move: 3
    - divider
    - custom: "Gain advantage on all your attacks targeting enemies adjacent to one or more of your allies this round."
  duration: round

name: Stand Firm
initiative: 12
level: 2
top:
  actions:
    - heal: 3
      enhancement: [diamondPlus]
      sub:
        - self
        - ward
    - divider
    - custom: "Whenever you are attacked this round, gain %shield% 1 for the round (this bonus is cumulative)."
    - mandatory:
        - ice
  xp: 2
  duration: round
  lost: t
bottom:
  actions:
    - heal: 1
      enhancement: [square]
      sub:
        - self
    - custom: "Add +2 %heal% if you are adjacent to an enemy."
    - mandatory:
        - ice

name: A Little Help Here
initiative: 15
level: 3
top:
  actions:
    - shield: 1
      enhancement: [square]
    - divider
    - custom: "Grant one ally within %range% 3:"
    - attack: 2
      sub:
        - custom: "%target% 1 enemy adjacent to Satha, %range% 4"
  xp: 1
  duration: round
bottom:
  actions:
    - move: 5

name: Raze
initiative: 6
level: 3
top:
  actions:
    - custom: "When the next enemy dies this round, your ally closest to the hex the dying enemy occupied gains %strengthen%."
    - divider
    - attack: 3
      enhancement: [diamond]
      sub:
        - wound
    - mandatory:
        - fire
  duration: round
bottom:
  actions:
    - optional:
        - consume:
            - ice
        - custom: "At the end of each character's first move ability this round, one enemy adjacent to that character suffers %damage% 1, %xp1%. %round%"
      noLine: true
    - divider
    - move: 3
      enhancement: [square]
    - divider
    - custom: "Grant one ally within %range% 3:"
    - move: 3
      enhancement: [square]

name: Northern Valor
initiative: 84
level: 4
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - custom: "Add +1 %attack% for each adjacent enemy."
    - mandatory:
        - ice
bottom:
  actions:
    - heal: 8
      enhancement: [diamondPlus]
      sub:
        - self
        - strengthen
    - divider
    - custom: "If your current hit point value is equal to your maximum, gain %ward%. Otherwise, add +3 %attack% to your next attack this turn."
  xp: 2
  lost: t

name: Strike Now
initiative: 52
level: 4
top:
  actions:
  - attack: 3
    enhancement:
    - diamond
  - divider
  - custom: "One ally who has %strengthen% may immediately play one card from their hand and perform the top or bottom action of the card. If they do, gain %xp1%."
bottom:
  actions:
  - attack: 2
    enhancement:
    - diamond
    sub:
    - pierce: 2
  - mandatory:
    - ice

name: Armory
initiative: 14
level: 5
top:
  actions:
  - custom: "During your attacks, you may move your character token on this card forward any number of spaces to add +2 %attack% to the attack for each space moved."
  - tokens: [1, 0, 1, 0, 1, 0]
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
      - ice
    - custom: "%shield%1, %xp1% %round%"
    noLine: true
  - divider
  - attack: 1
    enhancement:
    - square
    sub:
    - muddle
  - custom: "Add +X %attack%, where X is equal to your shield value."

name: Unleash the Archers
initiative: 64
level: 5
top:
  actions:
  - custom: "Grant two allies within %range% 3:"
  - attack: 2
    sub:
    - range: 3
  - mandatory:
    - ice
bottom:
  actions:
  - attack: 1
    enhancement:
    - diamond
    sub:
    - range: 3
  - optional:
    - consume:
      - ice
    - custom: "+1 %attack%, %muddle%, %xp1%"
  - divider
  - custom: "Grant one ally who has %strengthen%:"
  - attack: 2
    enhancement:
    - square
    sub:
    - custom: "%target% the target of the attack ability, %range% 3"

name: Crashing Steel
initiative: 29
level: 6
top:
  actions:
  - attack: 3
    enhancement:
    - diamond
    sub:
    - push: 2
  - divider
  - move: 2
    enhancement:
    - circle
  - divider
  - optional:
    - consume:
      - ice
    - custom: "%attack% 3, %xp1%"
    noLine: true
bottom:
  actions:
  - move: 4
    enhancement:
    - circle
    sub:
    - jump
  - divider
  - attack: 2
    sub:
    - custom: "%target% all adjacent enemies, %brittle%"
  - mandatory:
    - ice
  xp: 2
  lost: t

name: Defiance
initiative: 47
level: 6
top:
  actions:
  - optional:
    - consume:
      - ice
    - heal: 2
      sub:
      - self
    - custom: "%xp1%"
    noLine: true
  - divider
  - attack: 2
    enhancement:
    - square
    sub:
    - stun
  - divider
  - custom: "Grant all allies within %range% 3:"
  - move: 1
    enhancement:
    - square
bottom:
  actions:
  - custom: "Remove one negative condition you have."
  - divider
  - optional:
    - consume:
      - ice
    - custom: "%immobilize% %range% 1, %xp1%"
    noLine: true
  - divider
  - move: 3

name: For Frosthaven
initiative: 79
level: 7
top:
  actions:
  - custom: "Grant one ally within %range% 3 two of the following three abilities in any order:"
  - move: 4
  - attack: 4
  - heal: 4
    sub:
    - self
  - mandatory:
    - ice
bottom:
  actions:
  - move: 4
  - divider
  - custom: "Add +2 %attack% to the next attack an ally performs during this turn."

name: Send Them Reeling
initiative: 20
level: 7
top:
  actions:
  - group:
    - group:
      - attack: 3
        enhancement: [square]
        sub:
        - push: 2
      - optional:
        - consume: [ice]
        - custom: "%immobilize%, %xp1%"
    - hex: et_st_et
bottom:
  actions:
  - custom: "On the next two attacks performed by an adjacent ally, add +X %attack% to the attack, where X is equal to your shield value (when the attack is performed)."
  - tokens: [0, 1]
  - mandatory:
    - ice
  duration: persistent

name: Bonded Through Battle
initiative: 72
level: 8
top:
  actions:
  - custom: "At the end of this and your next four turns, one ally within %range% 3 may immediately play one card from their hand and perform the top or bottom action of the card."
  - tokens: [1, 0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 3
  - divider
  - custom: "Perform one of the following two abilities:"
  - strengthen: ''
    sub:
    - self
  - loot: 1

name: Lead from the Front
initiative: 10
level: 8
top:
  actions:
  - shield: 1
  - optional:
    - consume: [ice]
    - custom: "+1 %shield%, %xp1%"
  - divider
  - custom: "After each attack ability targeting you this round, perform:"
  - heal: 1
    sub:
    - range: 2
  duration: round
bottom:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - target: 1 ally
    - range: 3
    - ward
    - strengthen
  - divider
  - optional:
    - consume: [ice]
    - custom: "%brittle% %range% 1, %xp1%"
    noLine: true

name: Fight as One
initiative: 37
level: 9
top:
  actions:
  - strengthen: ''
    sub:
    - target: 2
    - range: 1
  - divider
  - attack: 5
    enhancement: [diamond]
  - divider
  - custom: "Grant all allies who have %strengthen%:"
  - attack: 5
    enhancement: [diamond]
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "Grant all allies within %range% 3 and self:"
  - move: 3
    enhancement: [square]
  - attack: 2
    enhancement: [diamond]
  - mandatory:
    - ice

name: Stand Against Many
initiative: 13
level: 9
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: all adjacent enemies
  - optional:
    - consume: [ice]
    - custom: "+1 %attack%, %xp1%"
  - divider
  - shield: 1
  - custom: "Add +1 %shield% for each two enemies targeted by the attack ability."
  duration: round
bottom:
  actions:
  - custom: "Add +2 %attack% to all your attacks while there are more enemies than allies within %range% 2."
  xp: 2
  duration: persistent
  lost: t
