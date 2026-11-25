Doomstalker (Gloomhaven 2e), card code read from the card pictures with tools/card-extraction. A first draft, not yet checked by the owner: look at the lines marked # check first.
name: A Moment's Peace
initiative: 88
level: 1
top:
  actions:
    - loot: 1
    - divider
    - custom: "Reveal the top card of one monster within %range% 5's ability card deck."
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - heal: 2
      sub:
        - custom: "%target% 1 of your summons or self, %range% 1"

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
  namedAbility:
    name: Doom
  actions:
    - custom: "When this enemy dies, all enemies adjacent to the hex it occupied suffer %damage% 2."
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
    - custom: "Add %immobilize% and gain %xp1% if the target has %classToken0%."
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
    - custom: "Whenever an enemy that has %classToken0% dies, instead of moving any %classToken0% on the target to your discard pile, you may discard this card to perform the %classToken0% actions of the cards, targeting an enemy within %range% 3 of the hex where the enemy died."
  duration: persistent
bottom:
  actions:
    - move: 4
      enhancement: [circle]

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
    - custom: "Add %wound% and gain %xp1% if the target has %classToken0%."
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
        stats: [5, 3, 2, '-']
        name: Green Snake
        enhancement: [square, square, square, 0]
        special:
          - custom: 'Unaffected by difficult terrain.'
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/green_snake.jpg
          size: 100%
          position: '0px 0px'
    - custom: "This summon is considered to be last in initiative order when determining monster focus."
  xp: 2
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: Doom
  actions:
    - custom: "Add +1 %attack% to all your attacks targeting this enemy."
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
    - custom: "If this attack kills an enemy, gain %xp1% and you may play one card from your hand or discard pile to perform a %classToken0% action of the card."
  xp: 1
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
      sub:
        - jump

name: Race to the Grave
initiative: 75
level: 1
top:
  actions:
    - summon:
        stats: [4, 3, 2, '-']
        name: Vicious Jackal
        enhancement: [square, square, square, 0]
        special:
          - custom: '%retaliate% 1'
          - custom: '%wound%'
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/vicious_jackal.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: Doom
  actions:
    - custom: "This enemy suffers %damage% 1 at the start of each of its turns."
  duration: persistent

name: Rain of Arrows
initiative: 9
level: 1
top:
  actions:
    - custom: "On the next four deaths of an enemy that has %classToken0% while there is another enemy within %range% 4 (of you), perform %attack%3 %range% 4"
    # check: first dashed circle may not be a slot; xp 1 marks sit between circles 1-2 and 3-4
    - tokens: [0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: Doom
  actions:
    - custom: "Add %pierce% 2 to all your attacks targeting this enemy."
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
  namedAbility:
    name: Doom
  actions:
    - custom: "Whenever you or one of your summons damages this enemy, you may perform:"
    - heal: 2
      sub:
        - target: "self or 1 ally adjacent to this enemy"
  duration: persistent

name: Feral Aid
initiative: 35
level: X
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 4
          enhancement: [square]
    - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to one of your summons."
bottom:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 4
    - divider
    - custom: "Grant one of your summons:"
    - move: 3
    - attack: 3
    - custom: "This attack must target the target of the Doomstalker's attack ability."
  xp: 2
  lost: t

name: Fierce Fighter
initiative: 78
level: X
top:
  actions:
    - custom: "Summon Battle Boar"
    - summon:
        stats: [7, 2, 2, "-"]
        name: Battle Boar
        enhancement: [square, square, square, 0]
        special:
          - custom: "When attacking, ignore %retaliate%."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/battle_boar.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - custom: "Gain advantage on all your attacks this round."
  duration: round

name: Give Chase
initiative: 80
level: X
top:
  namedAbility:
    name: Doom
  actions:
    - custom: "Your summons add +2 %move% and %jump% to all their move abilities. Your summons focus on this enemy."
  duration: persistent
bottom:
  actions:
    - move: 4
      enhancement: [circle]

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
  namedAbility:
    name: Doom
  actions:
    - custom: "Your summons add +1 %attack% to all their attacks targeting this enemy. Your summons focus on this enemy."
  duration: persistent

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
  namedAbility:
    name: Doom
  actions:
    - custom: "Gain advantage on all your attacks targeting this enemy. When this enemy dies, shuffle one %curse% card into the monster attack modifier deck."
  duration: persistent

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
    - divider
    - custom: "Grant one of your summons:"
    - custom: "%attack% +0"
    - custom: "This attack ability must target the target of the Doomstalker's attack ability."
  xp: 1
bottom:
  actions:
    - custom: "Grant one of your summons:"
    - custom: "%move% +0"
    - custom: "%attack% +0"
    - custom: "%move% +0"
    - custom: "%attack% +0"
  xp: 2
  lost: t

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
    - custom: "Add +2 %attack% and gain %xp1% if the target has %classToken0%."
bottom:
  actions:
    - move: 5
      enhancement: [circle]

name: Walking Bastion
initiative: 90
level: 3
top:
  actions:
    - custom: "Summon Staunch Garralev"
    - summon:
        stats: [8, 2, 2, "-"]
        name: "Staunch Garralev"
        enhancement: [square, square, square, 0]
        special:
          - custom: '%pierce% 3'
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/staunch_garralev.jpg
          size: 100%
          position: '0px 0px'
    - custom: "When you summon this summon, it gains %ward%. Whenever you long rest, this summon gains %ward%."
  xp: 2
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: "Doom"
  actions:
    - custom: "Your summons focus on this enemy. After one of your summons performs an attack targeting this enemy, triggering no more than once each round, grant that summon:"
    - attack: 1
      sub:
        - pierce: 2
    - custom: "This attack must target the enemy that has %classToken0%."
  duration: persistent

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
    - divider
    - custom: "If you are adjacent to a wall but not occupying a corridor tile, gain %invisible%. At the end of the round, lose %invisible%."
  duration: round
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - custom: "All attacks targeting any summons adjacent to you this round gain disadvantage."
  duration: round

name: Coated Arrows
initiative: 25
level: 4
top:
  actions:
    - custom: "On your next four ranged attacks, add %poison%, then %wound%, then %immobilize%, then %disarm% (one to each attack)."
    # check: first circle dashed, three solid; xp 1 printed on the last circle
    - tokens: [0, 0, 0, 1]
  duration: persistent
bottom:
  actions:
    - custom: "Add +2 %attack% to all your attacks targeting enemies that have %classToken0% this round."
  duration: round

name: Expose
initiative: 31
level: 5
top:
  actions:
    - custom: "Gain advantage on your first attack targeting an enemy that has %classToken0% each turn."
    - divider
    - custom: "All enemies lose %invisible% and may no longer gain %invisible%."
  xp: 2
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: "Doom"
  actions:
    - custom: "Your summons add %wound% to and gain advantage on all their attacks targeting this enemy."
  duration: persistent

name: Felling Swoop
initiative: 93
level: 5
top:
  actions:
    - custom: "Summon War Raptor"
    - summon:
        stats: [6, 5, 3, "-"]
        name: "War Raptor"
        enhancement: [square, square, square, 0]
        special:
          - custom: '%flying%'
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/war_raptor.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 5
      enhancement: [circle]
      sub:
        - jump

name: Impending End
initiative: 47
level: 6
top:
  actions:
    - attack: 4
      enhancement: [diamond]
      sub:
        - range: 5
    - custom: "If this attack kills the target, instead of moving any %classToken0% on the target to your discard pile, you may perform the %classToken0% actions of the cards, targeting an enemy within %range% 3 of the hex where the enemy died."
bottom:
  namedAbility:
    name: "Doom"
  actions:
    - custom: "Add %immobilize% to your first attack targeting this enemy and add +2 %attack% to your second and third attacks targeting this enemy."
    # check: first circle dashed, two solid; xp 1 printed on the last circle
    - tokens: [0, 0, 1]
  duration: persistent

name: Wild Command
initiative: 46
level: 6
top:
  actions:
    - custom: "Grant one of your summons:"
    - custom: "%move% +1"
    - custom: "%attack% +1"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - attack: 2
      sub:
        - custom: "%target% 1 enemy that has %classToken0% at any %range%"

name: Charging Beast
initiative: 82
level: 7
top:
  actions:
    - summon:
        stats: [7, 3, 2, '-']
        name: Horned Hristek
        enhancement: [square, 0, square, 0]
        special:
          - custom: "After moving for the first time each round, add +2 %attack% to all attacks for the round."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/horned_hristek.jpg
          size: 100%
          position: '0px 0px'
    - custom: "Whenever this summon kills an enemy, grant it:"
    - custom: "%move% +0"
  xp: 2
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: Doom
  actions:
    # check: the doom icon is written as %classToken0%
    - custom: "Your summons focus on this enemy. When this enemy dies, you and all allies may perform:"
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
        - target: all
        - range: 4
    - custom: "Gain %xp1% for each two enemies targeted."
  # check: the stack icon with a red X (dashed lower card) is read as remove
  remove: t
  lost: t
bottom:
  namedAbility:
    name: Doom
  actions:
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
    - divider
    - custom: "Grant one of your summons:"
    - custom: "%move% +0"
    - custom: "This movement must end in a hex adjacent to an enemy that has %classToken0%."
    - custom: "%attack% +0"
    - custom: "This attack must target an enemy that has %classToken0%."
  xp: 1
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - heal: 4
      sub:
        - target: 1 of your summons or self
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
    - custom: "Add +3 %attack% and gain %xp1% if the target has %classToken0%."
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

name: Heart of Doom
initiative: 40
level: 9
top:
  actions:
    - custom: "You may immediately play a card from your hand to perform a %classToken0% action of the card."
    - divider
    - attack: 3
      sub:
        - custom: "%target% 1 enemy that has %classToken0% at any %range%"
    - divider
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 5
bottom:
  actions:
    - custom: "You may have any number of %classToken0% active on the same target. If you discard this card, you must discard all but one active %classToken0%."
    - divider
    - custom: "You may play one card from your hand or discard pile to perform a %classToken0% action of the card."
  duration: persistent

name: Predator and Prey
initiative: 86
level: 9
top:
  actions:
    - summon:
        stats: [8, 4, 3, '-']
        name: Great Archinotl
        enhancement: [square, square, square, 0]
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/great_archinotl.jpg
          size: 100%
          position: '0px 0px'
    - custom: "At initiative 100 each round, this summon performs an additional turn."
  xp: 2
  duration: persistent
  lost: t
bottom:
  namedAbility:
    name: Doom
  actions:
    - custom: "Add +X %attack% to all your attacks targeting this enemy, where X is the difference between the %range% of the attack and the number of hexes to the enemy."
  duration: persistent
