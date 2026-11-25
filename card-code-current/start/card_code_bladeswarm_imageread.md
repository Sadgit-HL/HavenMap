Bladeswarm (Gloomhaven 2e), card code read from the card pictures with tools/card-extraction. A first draft, not yet checked by the owner: look at the lines marked # check first.
name: Corrupting Parasites
initiative: 97
level: 1
top:
  actions:
  - custom: "Summon Soul Leeches"
  - summon:
      stats: [4, 3, X, '-']
      name: Soul Leeches
      enhancement: [square, square, 0, 0]
      special:
      - custom: "X is the number of adjacent figures."
      # check: the summon art is not in the assets yet
      image:
        url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/soul_leeches.jpg
        size: 100%
        position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
  - wound: ''
    enhancement: [diamond]
    sub:
    # check: the square marker sits on the range pill
    - range: 1
      enhancement: [square]
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - self

name: Death March
initiative: 84
level: 1
top:
  actions:
  - custom: "Summon Creeping Beetles"
  - summon:
      stats: [5, 2, 2, '-']
      name: Creeping Beetles
      enhancement: [square, square, square, 0]
      special:
      - custom: "At end of turn, grant all adjacent allies: %move% 1"
      # check: the summon art is not in the assets yet
      image:
        url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/creeping_beetles.jpg
        size: 100%
        position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 4
  - custom: "This movement ignores the effects of difficult and hazardous terrain."

name: Deflecting Blades
initiative: 11
level: 1
top:
  actions:
  - attack: 1
    sub:
    # check: the last icon looks like muddle
    - custom: '%target% 3 enemies within 2 hexes, %muddle%'
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  # check: +0 icon unnamed
  - custom: "When you are attacked this round, treat all positive and %amd-double% attack modifier cards drawn by enemies as %?+0 attack modifier card% instead."
  duration: round

name: Engulfing Stingers
initiative: 88
level: 1
top:
  actions:
  - custom: "Summon Angry Wasps %flying%"
  - summon:
      stats: [3, 4, '-', '-']
      name: Angry Wasps
      enhancement: [square, 0, 0, 0]
      special:
      - custom: '%flying%'
      - custom: "At end of turn, all adjacent allies and enemies suffer %damage%2."
      # check: the summon art is not in the assets yet
      image:
        url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/angry_wasps.jpg
        size: 100%
        position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  # check: the star icon may not be damage
  - mandatory:
    - custom: "All adjacent allies and enemies suffer %damage%1."

name: Focused Scourge
initiative: 50
level: 1
top:
  actions:
  - custom: "When you perform an attack ability that specifies \"%target%X\", you may target the same enemy multiple times with that ability, counting one target for each attack."
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
  # check: the consume icon is a multicolour wheel with a red cross (any element)
  - custom: "Whenever you perform an attack ability, you may %?element wheel with red cross% to add +1 %attack% to all your attacks."
  - mandatory:
    - earth
  xp: 2
  duration: persistent
  lost: t

name: Hive Mind
initiative: 5
level: 1
top:
  actions:
  - custom: "You control how your summons perform their abilities."
  xp: 1
  duration: persistent
  lost: t
bottom:
  actions:
  - shield: 1
  - divider
  - custom: "Your summons gain %shield%1."
  xp: 2
  duration: persistent
  lost: t

name: Omniscient Assault
initiative: 22
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - pierce: 1
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  # check: the +0 attack modifier icon has no known token
  - custom: "When you attack this round, treat all negative and %amd-null% attack modifier cards you draw as %?+0 attack modifier card% instead."
  duration: round

name: Swarming Minions
initiative: 61
level: 1
top:
  actions:
    - custom: "Grant one of your summons, %lf% in either order:"
    - custom: "%move% +0"
    - custom: "%attack% +0"
  xp: 1
bottom:
  actions:
    - custom: "Grant all your summons, %lf% in either order:"
    - custom: "%move% +0"
    - custom: "%attack% +0"
  xp: 2
  lost: t

name: Scattered Defense
initiative: 13
level: 1
top:
  actions:
  - shield: 1
  - divider
  - retaliate: 1
    enhancement: [square]
  xp: 1
  duration: round
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - custom: "Grant one of your summons:"
  - move: 2
    enhancement: [square]

name: The Storm's Edge
initiative: 37
level: 1
top:
  actions:
    - wound: ''
      sub:
        - target: all
        - range: 1
bottom:
  actions:
    - attack: 2
      sub:
        - custom: "%target% 3 enemies within 2 hexes"
    - divider
    - heal: X
      sub:
        - self
    - custom: "where X is double the number of enemies targeted with the attack ability."
    - mandatory:
        - air
  xp: 2
  lost: t

name: Grasping Advance
initiative: 18
level: X
top:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - attack: 2
      enhancement: [diamond]
      sub:
        - immobilize
bottom:
  actions:
    - loot: 1
    - custom: "You may perform this loot ability as if you were occupying the same hex as one of your summons."

name: Tomb of the Immortal
initiative: 78
level: X
top:
  actions:
    - custom: "%recover% one card from your lost pile and immediately play that card, performing either the top or bottom action of the card."
    - mandatory:
        - light
  # check: the flag shows a stack of cards with a red X and dashed lower edge, plus the lost card; read as remove and lost
  remove: t
  lost: t
bottom:
  actions:
    - move: 5

name: Unstoppable Army
initiative: 94
level: X
top:
  actions:
    - heal: 3
      enhancement: [plus]
      sub:
        - target: 1 of your summons or self
    - mandatory:
        - light
bottom:
  actions:
    - summon:
        stats: [4, 2, 1, '-']
        name: Steel Scarabs
        enhancement: [square, square, square, 0]
        special:
          - custom: "%shield% 1"
          - custom: "All adjacent allies gain %shield% 1."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/steel_scarabs.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t

name: Infest
initiative: 43
level: 2
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - poison
    - mandatory:
        - earth
bottom:
  actions:
    - custom: "Attach this to a summon ability card in your active area. All summons from that ability card add %poison% to all their attacks."
  duration: persistent

name: Pressing Pursuit
initiative: 12
level: 2
top:
  actions:
    - custom: "Grant all your summons:"
    - custom: "%move% +0"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "This round, whenever an enemy performs a move ability that exits a hex adjacent to you and ends in a hex not adjacent to you, after the move ability, you may %?stacked spring arrow on a base, probably jump% to an empty hex adjacent to that enemy."
    - mandatory:
        - air
  duration: round

name: Overwhelming Offensive
initiative: 16
level: 3
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    - custom: "Add %disarm% and gain %xp1% if the target is adjacent to any of your summons."
bottom:
  actions:
    - move: 3
      enhancement: [square]
    - divider
    - shield: 1
      enhancement: [square]
  duration: round

name: Putrid Grubs
initiative: 78
level: 3
top:
  actions:
    - custom: "Summon 3 Bloat Maggots"
    - summon:
        stats: [3, 3, 1, '-']
        name: Bloat Maggots
        enhancement: [0, 0, 0, 0]
        special:
          - custom: "All adjacent enemies add -1 %attack% to all their attacks."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/bloat_maggots.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - custom: "At the end of each of your attack abilities, you may perform:"
    - optional:
        - consume: [wild]
        - heal: 2
          sub:
            - self
  xp: 2
  duration: persistent
  lost: t

name: Incubation
initiative: 9
level: 4
top:
  actions:
    - heal: 2
      enhancement: [diamondPlus]
      sub:
        - self
    - divider
    - shield: 1
      enhancement: [square]
    - divider
    - retaliate: 1
      enhancement: [square]
    - mandatory:
        - earth
  xp: 1
  duration: round
bottom:
  actions:
    - custom: "Attach this to a summon ability card in your active area. All summons from that ability card gain %shield%1 and at the start of each of their turns perform:"
    - heal: 1
      sub:
        - self
  duration: persistent

name: Vampiric Tempest
initiative: 64
level: 4
top:
  actions:
    - attack: 1
      sub:
        - target: all adjacent enemies
        - wound
    - divider
    - heal: X
      sub:
        - self
    - custom: "where X is the number of enemies targeted with the attack ability."
    - mandatory:
        - dark
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    # check: the fist icon in the text is probably retaliate
    - custom: "All your attacks are unaffected by %retaliate% this round."
  duration: round

name: Bioluminescence
initiative: 80
level: 5
top:
  actions:
    - custom: "Grant all your summons:"
    - custom: "%attack% +0"
bottom:
  actions:
    - custom: "Summon 2 Lightning Moths %flying%"
    - summon:
        stats: [3, 3, '-', '-']
        name: Lightning Moths
        enhancement: [square, square, 0, 0]
        special:
          - custom: "All adjacent summons add +1 %attack% to all their attacks."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/lightning_moths.jpg
          size: 100%
          position: '0px 0px'
    - mandatory:
        - light
  xp: 2
  duration: persistent
  lost: t

name: Cyclone of Blades
initiative: 27
level: 5
top:
  actions:
    - attack: 2
      sub:
        # check: bullseye 3 pill, read as target 3
        - target: 3
    - mandatory:
        - air
bottom:
  actions:
    - move: 4
      enhancement: [circle]
      sub:
        - jump
    - divider
    - mandatory:
        - custom: "All allies and enemies moved through with the move ability suffer %damage%1."

name: Blood Drain
initiative: 10
level: 6
top:
  actions:
    - custom: "%attack% X+1"
    - custom: "where X is the number of your summons, up to a maximum of 4."
    - divider
    - custom: "%heal% X+1"
      sub:
        - self
    - custom: "where X is the number of your summons, up to a maximum of 4."
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "Grant all your summons:"
    - custom: "%move% +0"

name: Sunstroke
initiative: 32
level: 6
top:
  actions:
    - attack: 1
      enhancement: [diamond]
      sub:
        - wound
        - custom: ','
        - stun
    - mandatory:
        - light
bottom:
  actions:
    - custom: "Attach this to a summon ability card in your active area. All attacks targeting summons from that ability card gain disadvantage. At the end of each of their turns, the summons perform:"
    - wound: ''
      sub:
        - range: 1
  duration: persistent

name: Fury of the Horde
initiative: 86
level: 7
top:
  actions:
    - custom: "Summon Rage Hornets %flying%"
    - summon:
        stats: [5, 3, 3, '-']
        name: Rage Hornets
        enhancement: [square, square, 0, 0]
        special:
          - custom: "Add +2 %attack% if the target is adjacent to any of your allies."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/rage_hornets.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - mandatory:
        - custom: "All adjacent allies and enemies suffer %damage%2."
    - mandatory:
        - air

name: Repulsive Host
initiative: 19
level: 7
top:
  actions:
    - poison: ''
      sub:
        - target: all
        - range: 1
    - divider
    - shield: 2
    - mandatory:
        - earth
  duration: round
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - strengthen: ''
      sub:
        - self

name: Bone Daggers
initiative: 68
level: 8
top:
  actions:
    - attack: 2
      sub:
        - target: 4 enemies within 2 hexes
    - divider
    - mandatory:
        - custom: "Suffer %damage%1 for each attack performed with the attack ability."
bottom:
  actions:
    - retaliate: 1
      enhancement: [square]
    - divider
    - attack: 2
      enhancement: [diamond]
      sub:
        - target: 2
          enhancement: [square]
        - wound
    - mandatory:
        - dark
  duration: round

name: Endless Biting
initiative: 41
level: 8
top:
  actions:
    - custom: "Grant all your summons, in either order:"
    - custom: "%move% +0"
    - custom: "%attack% +0"
bottom:
  actions:
    - custom: "Attach this to a summon ability card in your active area. All attacks performed by summons from that ability card gain advantage, add %pierce% 2, and are unaffected by %retaliate%."
  duration: persistent

name: Oasis
initiative: 4
level: 9
top:
  actions:
    - custom: "%recover% two cards from your lost pile and immediately play them, performing at most one top and one bottom action of the cards."
    - mandatory:
        - light
  lost: t
  remove: t
bottom:
  actions:
    - move: 5
      enhancement: [circle]
    - divider
    - heal: 3
      sub:
        - custom: "%target% all your summons adjacent to any hex you entered with the move ability and"
        - self
    - mandatory:
        - light

name: Wasteland
initiative: 96
level: 9
top:
  actions:
    - custom: "Summon Rust Vermin"
    - summon:
        stats: [7, 4, 3, '-']
        name: Rust Vermin
        enhancement: [square, 0, square, 0]
        special:
          - custom: "Add %disarm% if the target has any negative conditions."
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/rust_vermin.jpg
          size: 100%
          position: '0px 0px'
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - pull: 2
      enhancement: [square]
      sub:
        - range: 3
          enhancement: [square]
        - wound
        - poison
        - disarm
    - custom: "The target suffers %damage%2."
    - mandatory:
        - dark
