# Mindthief (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Submissive Affliction
initiative: 48
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - optional:
    - custom: "Add +1 %attack% for each negative condition the target has."
bottom:
  actions:
  - custom: "Control one enemy within %range%4:"
  - move: 1
    enhancement: [square]
  - optional:
    - consume: [ice]
    - custom: "The controlled enemy suffers %damage%2."
    - custom: "%xp1%"
    noLine: true

name: Hidden in the Shadows
initiative: 14
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - custom: "advantage"
  - custom: "If the attack ability killed an enemy, perform:"
  - invisible: ''
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - custom: "If you have not moved this round, perform:"
  - invisible: ''
    sub:
    - self
  - mandatory:
    - custom: "You cannot perform move abilities this round. At the end of the round, lose %invisible%."
  duration: persistent

name: Scurry
initiative: 20
level: 1
top:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - loot: 2
  xp: 1
  lost: t

name: Withering Claw
initiative: 18
level: 1
top:
  actions:
  - custom: "%augment% Augment"
  - custom: "Add %poison%, %muddle% to all your melee attacks."
  - attack: 2
    enhancement: [diamond]
    sub:
    - immobilize
  xp: 1
  duration: persistent
bottom:
  actions:
  - custom: "Control one enemy within %range%4:"
  - attack: 2
    enhancement: [diamond]

name: Frigid Apparition
initiative: 10
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - mandatory:
    - ice
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - attack: 2
    enhancement: [diamond]
    sub:
    - stun
  - mandatory:
    - ice
  xp: 2
  lost: t

name: The Mind's Weakness
initiative: 75
level: 1
top:
  actions:
  - custom: "%augment% Augment"
  - custom: "Add +1 %attack% to all your melee attacks."
  - attack: 2
    enhancement: [diamond]
  - custom: "Control the target of the attack ability:"
  - attack: 2
    enhancement: [diamond]
  xp: 1
  duration: persistent
bottom:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - wound

name: Pilfer
initiative: 79
level: 1
top:
  actions:
  - multi:
    - attack: 2
      enhancement: [diamond]
    - custom: "If this attack does not kill the target, gain a money token."
  - loot: 1
bottom:
  actions:
  - move: 4

name: Perverse Edge
initiative: 8
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - custom: "Add +2 %attack% and gain %xp1% for each negative condition the target has."
  - mandatory:
    - dark
  lost: t
bottom:
  actions:
  - optional:
    - consume: [ice]
    - stun: ''
      sub:
      - range: 1
      - custom: "%xp1%"
    noLine: true
  - move: 3
    enhancement: [square]

name: Empathetic Assault
initiative: 12
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 5
    - disarm
  - mandatory:
    - ice
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - heal: 2
    enhancement: [square]
    sub:
    - self

name: Psychic Blade
initiative: 77
level: 1
top:
  actions:
  - custom: "%augment% Augment"
  - custom: "Your single-target melee attack abilities may target enemies within 2 hexes (of you)."
  - attack: 3
    enhancement: [diamond]
    sub:
    - curse
  - custom: "Control the target of the attack ability:"
  - move: 1
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "Add %curse% to all your melee attacks this round."
  duration: round

name: Feedback Loop
initiative: 51
level: X
top:
  actions:
  - custom: "%augment% Augment"
  - custom: "After each of your melee attack abilities, grant one of your summons:"
  - attack: 0
  - divider
  - attack: 2
    enhancement: [square]
  - custom: "Grant one of your summons:"
  - move: 0
  xp: 1
  duration: persistent
bottom:
  actions:
  - multi:
    - move: 4
      enhancement: [square]
      sub:
      - jump
    - custom: "If you end this movement in the same hex as you start, all enemies moved through gain %muddle%."

name: Possession
initiative: 71
level: X
top:
  actions:
  - custom: "Control one enemy within %range%4:"
  - attack: 3
    enhancement: [diamond]
    sub:
    - muddle
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "Grant one of your summons:"
  - move: 2
    enhancement: [square]

name: Gnawing Horde
initiative: 82
level: X
top:
  actions:
  - summon:
      name: Rat Swarm
      stats: [5, 2, 2, -]
      special:
      - poison: ''
      enhancement: [square, square, square, 0]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4

name: Fearsome Blade
initiative: 27
level: 2
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - push: 2
      enhancement: [square]
    - curse
  - optional:
    - consume: [ice]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - wound: ''
    sub:
    - range: 1
  - divider
  - move: 4

name: Hostile Takeover
initiative: 9
level: 2
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
    - immobilize
  - mandatory:
    - ice
bottom:
  actions:
  - custom: "Place a character token on a normal or elite enemy within %range%4. This round, during that enemy's turn, it treats its enemies as allies and its allies as enemies, with you controlling its abilities."
  - mandatory:
    - dark
  xp: 2
  lost: t
  duration: round

name: Brain Leech
initiative: 21
level: 3
top:
  actions:
  - custom: "Control one enemy within %range%4:"
  - move: 2
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
  - optional:
    - consume: [ice]
    - wound: ''
    - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - attack: 1
    enhancement: [square]
  - custom: "If you performed the attack ability, perform:"
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - self

name: Cranium Overload
initiative: 5
level: 3
top:
  actions:
  - custom: "Designate a hex containing an enemy within %range%4 to perform:"
  - attack: 6
    sub:
    - target: "the enemy in the designated hex, %pierce%5"
  - custom: "If the attack ability killed an enemy, perform:"
  - attack: 2
    sub:
    - target: "all enemies adjacent to the designated hex"
  xp: 2
  lost: t
bottom:
  actions:
  - move: 5
    enhancement: [circle]
    sub:
    - jump

name: Frozen Shiv
initiative: 16
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - pierce: 1
      enhancement: [square]
  - mandatory:
    - ice
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
  - divider
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
  - mandatory:
    - ice
  xp: 2
  lost: t

name: Silent Scream
initiative: 83
level: 4
top:
  actions:
  - custom: "%augment% Augment"
  - custom: "After each of your melee attack abilities, perform:"
  - heal: 2
    sub:
    - range: 2
  - divider
  - attack: 2
    enhancement: [diamond]
    sub:
    - disarm
  xp: 1
  duration: persistent
bottom:
  actions:
  - custom: "Control one enemy within %range%4:"
  - attack: -1
  - mandatory:
    - ice

name: Mass Hysteria
initiative: 11
level: 5
top:
  actions:
  - attack: 1
    sub:
    - target: 4
    - range: 4
    - pierce: 3
    - muddle
  - mandatory:
    - ice
bottom:
  actions:
  - multi:
    - move: 3
      enhancement: [square]
      sub:
      - jump
    - custom: "All enemies moved through gain %poison%."
  - mandatory:
    - dark

name: Gangling Abomination
initiative: 81
level: 5
top:
  actions:
  - summon:
      name: Rat Monstrosity
      stats: [8, 3, 3, -]
      special:
      - custom: "Add +1 %attack% if the target has a negative condition."
      enhancement: [square, square, square, 0]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 2
    enhancement: [square]

name: Telepathic Command
initiative: 17
level: 6
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 0
  - divider
  - invisible: ''
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Grant one of your summons:"
  - move: 4
    enhancement: [square]

name: Dark Frenzy
initiative: 39
level: 6
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [ice]
    - multi:
      - attack: 2
      - custom: ","
      - custom: "%xp1%"
  - optional:
    - consume: [dark]
    - multi:
      - attack: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Control two enemies within %range%4:"
  - move: 1
  - optional:
    - consume: [ice]
    - custom: "The controlled enemies suffer %damage%1, %xp1%."
    noLine: true

name: Domination
initiative: 13
level: 7
top:
  actions:
  - custom: "Control two enemies within %range%4 that are adjacent to each other:"
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - custom: "You may have two %augment% active at once. If you play a third %augment%, you must discard either of the other two. If you discard this card and you have two active %augment%, you must discard one."
  duration: persistent

name: Psychic Projection
initiative: 92
level: 7
top:
  actions:
  - custom: "%augment% Augment"
  - custom: "Add +1 %attack% to your melee attacks for each negative condition the target has."
  - pull: 2
    sub:
    - range: 3
  - divider
  - attack: 3
    enhancement: [diamond]
  xp: 1
  duration: persistent
bottom:
  actions:
  - custom: "Designate an unoccupied hex within %range%4."
  - multi:
    - attack: 3
      enhancement: [square]
    - custom: "Perform this attack as though you occupied the designated hex."
  - mandatory:
    - dark

name: Shared Nightmare
initiative: 7
level: 8
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
      enhancement: [square]
    - range: 4
    - poison
  - optional:
    - consume: [dark]
    - multi:
      - curse: ''
      - custom: ","
      - custom: "%xp1%"
  - mandatory:
    - ice
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [square]
  - optional:
    - consume: [ice]
    - multi:
      - stun: ''
      - custom: "%xp1%"

name: Corrupting Embrace
initiative: 15
level: 8
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - wound
  - divider
  - attack: 2
    enhancement: [square]
    sub:
    - muddle
bottom:
  actions:
  - move: 4
  - custom: "On your next four melee attacks, add %stun%, %curse% to the attack."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent

name: Many as One
initiative: 91
level: 9
top:
  actions:
  - summon:
      name: Rat King
      stats: [10, 3, X, -]
      special:
      - custom: "Where X is half the Rat King's current hit point value (rounded up)."
      enhancement: [square, square, 0, 0]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Each round, the first of your allies who performs a melee attack ability gains the effects of each of your active %augment% for that attack ability."
  xp: 2
  lost: t
  duration: persistent

name: Phantasmal Killer
initiative: 67
level: 9
top:
  actions:
  - custom: "%augment% Augment"
  - multi:
    - custom: "After each of your melee attack abilities, control one target of the attack ability:"
    - attack: 3
  - custom: "After each of your control abilities, you may perform:"
  - optional:
    - consume: [dark]
    - custom: "One controlled enemy suffers %damage%3."
    noLine: true
  - attack: 3
    sub:
    - wound
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - loot: 1
  - divider
  - invisible: ''
    sub:
    - self
  - mandatory:
    - dark
