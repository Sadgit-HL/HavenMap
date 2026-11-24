# Doomstalker (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Rain of Arrows
initiative: 9
level: 1
top:
  actions:
  - custom: "On the next four deaths of an enemy that has %doom% while there os another enemy within %range%4 (of you) perform %attack%3 %range%4."
  - tokens: [1, 0, 1, 0]
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Add %pierce%2 to all your attacks targeting this enemy."
  duration: persistent

name: Race to the Grave
initiative: 75
level: 1
top:
  actions:
  - summon:
      name: Vicious Jackal
      stats: [4, 3, 2, -]
      special:
      - retaliate: 1
      - wound: ''
      enhancement: [heal, attack, move]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "This enemy suffers %damage%1 at the start of each of its turns."
  duration: persistent

name: Gut Shot
initiative: 21
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Add %wound% and gain %xp1% if the target has %doom%."
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Detonation
initiative: 8
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: 2
      enhancement: [square]
    - range: 4
      enhancement: [square]
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "When this enemy dies, all enemies adjacent to the hex it occupied suffer %damage%2."
  duration: persistent

name: Murderous Stalker
initiative: 13
level: 1
top:
  actions:
  - attack: 6
    enhancement: [diamond]
    sub:
    - range: 5
  - custom: "If this attack kills an enemy, gain %xp1% and you may play any one card from your hand or discard pile to perform a %doom% action of the card."
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump

name: A Moment's Peace
initiative: 88
level: 1
top:
  actions:
  - loot: 1
  - custom: "Reveal the top card of one monster within %range%5's ability card deck."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - heal: 2
    sub:
    - target: "1 of your summons of self"
    - range: 1

name: The Hunt Begins
initiative: 20
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Add +2 %attack% and gain %xp1% if the target is undamaged."
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Your summons add +1 %attack% to all their attacks targeting this enemy. Your summons focus on this enemy."
  duration: persistent

name: Solid Bow
initiative: 54
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 5
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Whenever you or one of your summons damaged this enemy, you may perform:"
  - heal: 2
    sub:
    - target: "self or 1 ally adjacent to this enemy"
  duration: persistent

name: Foot Snare
initiative: 14
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Add %immobilize% and gain %xp1% if the target has %doom%."
bottom:
  actions:
  - immobilize: ''
    sub:
    - range: 1
  - divider
  - move: 3
    enhancement: [circle]

name: Forward Momentum
initiative: 11
level: 1
top:
  actions:
  - custom: "Whenever an enemy that has %doom% dies, instead of moving any %doom% on the target to your discard pile, you may discard this card to perform the %doom% actions of the cards, targeting an enemy within %range%3 of the hex where the enemy died."
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Hidden Danger
initiative: 72
level: 1
top:
  actions:
  - summon:
      name: Green Snake
      stats: [5, 3, 2, -]
      special:
      - custom: "Unaffected by difficult terrain."
      enhancement: [heal, move, attack]
  - custom: "This summon is considered to be last in initiative order when determining monster focus."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Add +1 %attack% to all your attacks targeting this enemy."
  duration: persistent

name: Give Chase
initiative: 80
level: X
top:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Your summons add +2 %move% and %jump% to all their move abilities. Your summons focus on this enemy."
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Feral Aid
initiative: 35
level: X
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to one of your summons."
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - custom: "Grant one of your summons:"
  - attack: 3
  - divider
  - attack: 3
  - custom: "This attack must target the target of the Doomstalker's attack ability."
  xp: 2
  lost: t

name: Fierce Fighter
initiative: 78
level: X
top:
  actions:
  - summon:
      name: Battle Boar
      stats: [7, 2, 2, -]
      special:
      - custom: "When attacking ignore %retaliate%."
      enhancement: [heal, move, attack]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Gain advantage on all your attacks this round."
  duration: round

name: Relentless Offensive
initiative: 63
level: 2
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Grant one of your summons:"
  - attack: 0
  - custom: "This attack ability must target the target of the Doomstalker's attack ability."
  xp: 1
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - move: 0
  - divider
  - attack: 0
  - divider
  - move: 0
  - divider
  - attack: 0
  xp: 2
  lost: t

name: Dual Shot
initiative: 52
level: 2
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
      enhancement: [square]
    - range: 5
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Gain advantage on all your attacks targeting this enemy. When this enemy dies, shuffle one %curse% card into the monster attack modifier deck."
  duration: persistent

name: Walking Bastion
initiative: 90
level: 3
top:
  actions:
  - summon:
      name: Staunch Garralev
      stats: [8, 2, 2, -]
      special:
      - pierce: 3
      enhancement: [heal, attack, move]
  - custom: "When you summon this summon, it gains %ward%. Whenever you long rest, this summon gains %ward%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Your summons focus on this enemy. After one of your summons perform an attack targeting this enemy, triggering no more than once each round, grant that summon:"
  - attack: 1
    sub:
    - pierce: 2
  - custom: "This attack must target the enemy that has %doom%."
  duration: persistent

name: Swift Trickery
initiative: 10
level: 3
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Add +2 %attack% and gain %xp1% if the target has %doom%."
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Camouflage
initiative: 6
level: 4
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "If you are adjacent to a wall but not occupying a corridor tile, gain %invisible%. At the end of the round, lose %invisible%."
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "All attacks targeting any summons adjacent to you this round gain disadvantage."
  duration: round

name: Coated Arrows
initiative: 25
level: 4
top:
  actions:
  - custom: "On your next four ranged attacks, add %poison%, then %wound%, then %immobilize%, then %disarm% (one to each attack)."
  - tokens: [0, 0, 0, 1]
  duration: persistent
bottom:
  actions:
  - custom: "Add +2 %attack% to all your attacks targeting enemies that have %doom% this round."
  duration: round

name: Falling Swoop
initiative: 93
level: 5
top:
  actions:
  - summon:
      name: War Raptor
      stats: [6, 5, 3, -]
      special:
      - fly: ''
      enhancement: [heal, attack, move]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [circle]
    sub:
    - jump

name: Expose
initiative: 31
level: 5
top:
  actions:
  - custom: "Gain advantage on your first attack targeting an enemy that has %doom% each turn."
  - custom: "All enemies lose %invisible% and may no longer gain %invisible%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Your summons add %wound% to and gain advantage on all their attacks targeting this enemy."
  duration: persistent

name: Wild Command
initiative: 46
level: 6
top:
  actions:
  - custom: "Grant one of your summons:"
  - move: 1
  - divider
  - attack: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 2
    sub:
    - target: "1 enemy that has %doom% at any %range%"

name: Impending End
initiative: 47
level: 6
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 5
  - custom: "If this attack kills the target, instead of moving any %doom% on the target to your discard pile, you may perform the %doom% actions of the cards, targeting an enemy within %range%3 of the hex where the enemy died."
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Add %immobilize% to your first attack targeting this enemy and add +2 %attack% to your second and third attacks targeting this enemy."
  - tokens: [0, 0, 1]
  duration: persistent

name: Charging Beast
initiative: 82
level: 7
top:
  actions:
  - summon:
      name: Horned Hristek
      stats: [7, 3, 2, -]
      special:
      - custom: "After moving for the first time each round, add +2 %attack% to all attacks for the round."
      enhancement: [heal, attack]
  - custom: "Whenever this summon kills an enemy, grant it:"
  - move: 0
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Your summons focus on this enemy. When this enemy dies, you an all allies may perform:"
  - heal: 3
    sub:
    - self
  duration: persistent

name: Darkened Skies
initiative: 36
level: 7
top:
  actions:
  - attack: 3
    sub:
    - target: "all"
    - range: 4
  - custom: "Gain %xp1% for each two enemies targeted."
  lost: t
  remove: t
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "When this enemy dies, you may perform:"
  - attack: 2
    sub:
    - target: 3
    - range: 3
  duration: persistent

name: Feral Instincts
initiative: 17
level: 8
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 5
  - custom: "Grant one of your summons:"
  - move: 0
  - custom: "This movement must end in a hex adjacent to an enemy that has %doom%."
  - attack: 0
  - custom: "This attack must target an enemy that has %doom%."
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - heal: 4
    sub:
    - target: "1 of your summons of self"
    - range: 1

name: Press the Attack
initiative: 22
level: 8
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "Add +3 %attack% and gain %xp1% if the target has %doom%."
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
    - poison
  - divider
  - move: 4
    sub:
    - jump
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
    - immobilize
  - divider
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - divider
  - attack: 3
    sub:
    - range: 4
    - wound
  xp: 2
  lost: t

name: Predator and Prey
initiative: 86
level: 9
top:
  actions:
  - summon:
      name: Great Archinotl
      stats: [8, 4, 3, -]
      enhancement: [heal, attack, move]
  - custom: "At initiative 100 each round, this summon performs an additional turn."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "%doom% DOOM"
  - custom: "Add +X %attack% to all your attacks targeting this enemy, where X is the difference between the %range% of the attack and the number of hexes to the enemy."
  duration: persistent

name: Heart of Doom
initiative: 40
level: 9
top:
  actions:
  - custom: "You may immediately play a card from your hand to perform a %doom% action of the card."
  - attack: 3
    sub:
    - target: "1 enemy that has %doom% at any %range%"
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 5
bottom:
  actions:
  - custom: "You may have any number of %doom% active on the same target. If you discard this card, you must discard all but one active %doom%."
  - custom: "You may play one card from your hand or discard pile to perform a %doom% action of the card."
  duration: persistent
