# Sunkeeper (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Hammer Blow
initiative: 55
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - muddle
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "advantage"
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - loot: 1
  - divider
  - bless: ''
    enhancement: [diamondPlus]
    sub:
    - self

name: Holy Strike
initiative: 65
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 1
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "advantage"
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 3
  - mandatory:
    - light
  xp: 2
  lost: t

name: Empowering Command
initiative: 32
level: 1
top:
  actions:
  - multi:
    - strengthen: ''
    - custom: ","
    - bless: ''
      enhancement: [diamondPlus]
      sub:
      - range: 3
  - mandatory:
    - light
bottom:
  actions:
  - custom: "Grant one adjacent ally:"
  - attack: 3
    enhancement: [square]

name: Dazzling Charge
initiative: 36
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 3
  - mandatory:
    - light
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - divider
  - stun: ''
    enhancement: [diamond]
    sub:
    - range: 1
  - mandatory:
    - light
  xp: 2
  lost: t

name: Lay On Hands
initiative: 90
level: 1
top:
  actions:
  - heal: X
    sub:
    - target: "1 ally"
    - range: 1
  - custom: "where X is the target's maximum hit point value."
  - mandatory:
    - light
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4

name: Tactical Order
initiative: 29
level: 1
top:
  actions:
  - custom: "Grant one ally within %range%3:"
  - move: 4
    enhancement: [square]
bottom:
  actions:
  - move: 3
  - optional:
    - consume: [light]
    - multi:
      - move: 2
      - custom: ","
      - custom: "%xp1%"

name: Brilliant Prayer
initiative: 27
level: 1
top:
  actions:
  - custom: "One adjacent ally may %recover% one card from their lost pile."
  xp: 2
  lost: t
  remove: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - bless: ''
    sub:
    - target: "1 ally"
    - range: 1

name: Soothing Light
initiative: 63
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 2
      enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - custom: "The target may %recover% one level 1 card from their discard pile, %xp1%."
bottom:
  actions:
  - move: 4

name: Purifying Aura
initiative: 21
level: 1
top:
  actions:
  - custom: "On the next five attacks targeting you performed by an adjacent enemy, gain %retaliate%3."
  - tokens: [1, 0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - strengthen: ''
    sub:
    - target: "all allies"
    - range: 1
      enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - range: 1
      - custom: ","
      - custom: "%xp1%"

name: Protective Blessing
initiative: 16
level: 1
top:
  actions:
  - shield: 1
    enhancement: [square]
  xp: 1
  duration: round
bottom:
  actions:
  - custom: "Whenever you or an adjacent ally would suffer %damage% this round, negate the %damage%."
  - mandatory:
    - light
  xp: 2
  lost: t
  duration: round

name: Defensive Stance
initiative: 85
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - stun
bottom:
  actions:
  - shield: 1
  - custom: "Reduce the %pierce% value of all attacks targeting you by 2."
  - mandatory:
    - custom: "Whenever you perform a move ability, add -1 %move%."
  xp: 2
  lost: t
  duration: persistent

name: Daybreak
initiative: 17
level: X
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - multi:
      - attack: 1
      - custom: ","
      - muddle: ''
      - custom: ","
      - light
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "All attacks targeting you this round gain disadvantage."
  duration: round

name: Sanctify
initiative: 39
level: X
top:
  actions:
  - custom: "On the next three attacks performed by allies within %range%2, add +1 %attack% to the attack. If they have %ward%, add +2 %attack% instead."
  - tokens: [0, 0, 1]
  - mandatory:
    - light
  duration: persistent
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
    - muddle

name: Beacon of Light
initiative: 80
level: X
top:
  actions:
  - custom: "On your next three single-target heal abilities from your ability cards, additionally target all allies within %range%2 of the primary target."
  - tokens: [1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - ward: ''
        sub:
        - target: "1 ally"
        - range: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true

name: Holy Defense
initiative: 12
level: 2
top:
  actions:
  - shield: 1
    enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - heal: 2
        sub:
        - self
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - heal: 1
        sub:
        - target: "all"
        - range: 1
      - custom: ","
      - custom: "%xp1%"
    noLine: true

name: Mobilizing Axiom
initiative: 23
level: 2
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - divider
  - bless: ''
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - custom: "Grant all allies within %range%5 and self:"
  - move: 4
    enhancement: [square]
  xp: 2
  lost: t

name: Engulfing Radiance
initiative: 15
level: 3
top:
  actions:
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - target: "all"
  - mandatory:
    - light
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "All attacks targeting you or any ally within %range%4 (of you) gain disadvantage this round."
  - mandatory:
    - light
  duration: round

name: Burning Flash
initiative: 51
level: 3
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "advantage"
      - custom: ","
      - custom: "%xp1%"
  - custom: "Gain %xp1% for each enemy targeted."
  lost: t
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Righteous Strength
initiative: 72
level: 4
top:
  actions:
  - bless: ''
    sub:
    - target: "all allies"
    - range: 1
  - mandatory:
    - light
bottom:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - range: 3
  - optional:
    - consume: [light]
    - multi:
      - target: 1
      - custom: ","
      - custom: "%xp1%"

name: Cautious Advance
initiative: 18
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - mandatory:
    - light
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - shield: 1
    enhancement: [square]
  duration: round

name: Arresting March
initiative: 22
level: 5
top:
  actions:
  - custom: "Grant one ally within %range%3:"
  - attack: 3
    enhancement: [square]
    sub:
    - stun
  - optional:
    - consume: [light]
    - multi:
      - heal: 3
        sub:
        - target: "the target of the grant ability"
      - custom: ","
      - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Grant one ally within %range%3:"
  - move: 3
    enhancement: [square]

name: Path of Glory
initiative: 48
level: 5
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - pierce: 1
    - muddle
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "advantage"
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - multi:
    - strengthen: ''
    - custom: ","
    - bless: ''
      sub:
      - target: "all allies moved through with the move ability"
  - mandatory:
    - light
  xp: 2
  lost: t

name: Divine Intervention
initiative: 9
level: 6
top:
  actions:
  - custom: "Whenever an ally would suffer %damage%, you may suffer that %damage% instead."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Grant all allies within %range%3 and self:"
  - shield: 1
  - optional:
    - consume: [light]
    - multi:
      - custom: "Treat all positive and %double% attack modifier cards drawn by enemies this round to be %plus0% instead, %xp1%."
    noLine: true
  duration: round

name: Scales of Justice
initiative: 30
level: 6
top:
  actions:
  - retaliate: 2
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Whenever you %light% during one of your attack abilities, add +1 %attack%, %pierce%1 to all the attacks and treat all %null% attack modifier cards drawn as %double% instead."
  xp: 1
  lost: t
  duration: persistent

name: Bright Aegis
initiative: 14
level: 7
top:
  actions:
  - shield: 2
    enhancement: [square]
  - divider
  - retaliate: 1
    enhancement: [square]
  - mandatory:
    - light
  duration: round
bottom:
  actions:
  - custom: "One adjacent ally may %recover% one card from their lost pile."
  - optional:
    - consume: [light]
    - multi:
      - custom: "That ally may immediately play up to two cards from their hand, performing at most one top and one bottom action of the cards, %xp1%."
    noLine: true
  xp: 2
  lost: t
  remove: t

name: Illuminate the Target
initiative: 91
level: 7
top:
  actions:
  - custom: "Designate an adjacent hex containing an enemy to perform:"
  - attack: 5
    sub:
    - target: "the enemy occupying the designated hex"
  - divider
  - strengthen: ''
    sub:
    - target: "all allies adjacent to you or the designated hex"
bottom:
  actions:
  - custom: "Grant one adjacent ally:"
  - attack: 5
    enhancement: [square]

name: Warding Blow
initiative: 25
level: 8
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - divider
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - optional:
    - consume: [light]
    - multi:
      - heal: 3
        sub:
        - self
      - custom: ","
      - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - mandatory:
    - light

name: Supportive Chant
initiative: 11
level: 8
top:
  actions:
  - custom: "Grant all allies within %range%3:"
  - multi:
    - ward: ''
    - custom: ","
    - strengthen: ''
    - custom: ","
    - bless: ''
      sub:
      - self
  - attack: 5
    enhancement: [diamond]
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "All allies add +1 %attack% to all their attacks this round."
  - optional:
    - consume: [light]
    - multi:
      - custom: "They also gain advantage on all their attacks this round, %xp1%."
    noLine: true
  duration: round

name: Divine Ascension
initiative: 87
level: 9
top:
  actions:
  - custom: "Gain %flying%. On your next five melee attack abilities, add +4 %attack% to and gain advantage on all attacks."
  - tokens: [1, 0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 6
    enhancement: [circle]
    sub:
    - jump

name: Solar Bastion
initiative: 10
level: 9
top:
  actions:
  - heal: 3
    sub:
    - target: "all"
    - range: 3
  - optional:
    - consume: [light]
    - multi:
      - custom: "One ally targeted with the heal ability may %recover% one card from their discard pile, %xp1%."
    noLine: true
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - shield: 2
  - optional:
    - consume: [light]
    - multi:
      - retaliate: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  duration: round
