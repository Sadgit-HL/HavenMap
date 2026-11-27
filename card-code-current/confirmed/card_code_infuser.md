Infuser (Frosthaven), card code read from the card pictures with tools/card-extraction. A first draft, not checked against the cards.
name: Boon of the Tempest
initiative: 28
level: 1
top:
  namedAbility:
    name: Infusion
  consume: [air, wild]
  actions:
    - custom: "Add +1 %move% and %jump% to all your move abilities."
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - attack: 3
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [square]
    - optional:
        - custom: "-1 %move% : %air%"

name: Bounty of the Earth
initiative: 23
level: 1
top:
  actions:
    - shield: 2
    - optional:
        - custom: "-1 %shield% : %earth%, %xp1%"
  duration: round
bottom:
  namedAbility:
    name: Infusion
  consume: [earth, wild]
  actions:
    - retaliate: 1
      sub:
        - range: 2
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - heal: 3
      sub:
        - self
  xp: 2
  duration: persistent
  lost: t

name: Caress of the Night
initiative: 87
level: 1
top:
  namedAbility:
    name: Infusion
  consume: [dark, wild]
  actions:
    - custom: "Add %wound% and %muddle% to all your melee attacks."
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - strengthen: ''
      sub:
        - self
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - attack: 3
    - optional:
        - custom: "-1 %attack% : %dark%, %xp1%"

name: Emerald Edge
initiative: 70
level: 1
top:
  actions:
    - mandatory:
        - custom: "%earthc% %darkc% :"
    - attack: 5
    - divider
    - ward: ''
      sub:
        - self
  xp: 1
bottom:
  actions:
    - heal: 2
      sub:
        - target: 2
        - range: 2
    - optional:
        - custom: "-1 %target% : %earth%"

name: Formless Bladestorm
initiative: 33
level: 1
top:
  actions:
    - group:
        - attack: 3
          sub:
            - pierce: 2
        - hex: sttt
    - divider
    - custom: "%teleport% to any unoccupied hex adjacent to the furthest enemy targeted by the attack ability."
  infuse: [air/dark]
  xp: 1
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [square]
    - divider
    - pull: 2
      sub:
        - range: 3
    - optional:
        - custom: "-1 %pull%, -1 %range% : %air%"

name: Onyx Shards
initiative: 20
level: 1
top:
  actions:
    - disarm: ''
      enhancement: [diamond]
      sub:
        - range: 4
          enhancement: [square]
    - optional:
        - custom: "-2 %range% : %dark%"
bottom:
  actions:
    - custom: "Create four 1-hex obstacles in empty hexes within %range%3."
    - divider
    - custom: "All enemies adjacent to at least two of the created obstacles suffer %damage%2."
  infuse: [earth/dark]
  xp: 1
  lost: t

name: Rising Momentum
initiative: 25
level: 1
top:
  actions:
    - attack: 3
      enhancement: [square]
    - custom: "+1 %attack% for each pair of active %infusion%."
    - optional:
        - consume: [earth]
        - custom: "%earth%"
bottom:
  actions:
    - move: 3
      enhancement: [square]
    - custom: "+1 %move% for each pair of active %infusion%."
    - optional:
        - consume: [air]
        - custom: "%air%"

name: Slashing Cyclone
initiative: 14
level: 1
top:
  actions:
    - attack: 2
      enhancement: [square]
      sub:
        - target: all adjacent enemies
    - optional:
        - custom: "-1 %attack% : %air%, %xp1%"
bottom:
  actions:
    - move: 5
      enhancement: [circle]
    - custom: "All enemies adjacent to any hex you enter during this movement suffer %damage%1."
  infuse: [air/earth]
  xp: 1
  lost: t

name: Stoic Vigilance
initiative: 12
level: 1
top:
  actions:
    - attack: 2
      enhancement: [square]
    - divider
    - shield: 1
      enhancement: [square]
  duration: round
bottom:
  actions:
    - move: 1
      enhancement: [circle]
    - divider
    - custom: "All enemies within %range% 3 that target one of your adjacent allies with an attack this round target you with that attack instead, regardless of the attack's range."
  duration: round

name: Torrential Cleave
initiative: 83
level: 1
top:
  actions:
    - mandatory:
        - consume: [air, earth]
    - group:
        - attack: 4
          sub:
            - push: 2
              enhancement: [square]
        - hex: etx_ts
  xp: 1
bottom:
  actions:
    - move: 3
    - optional:
        - custom: "-1 %move% : %earth%"
    - divider
    - group:
        - immobilize: ''
        - hex: etx_ts

name: Unstoppable Impulse
initiative: 56
level: 1
top:
  actions:
    - attack: 4
      enhancement: [square]
    - optional:
        - custom: "-1 %attack% : %dark%"
bottom:
  actions:
    - mandatory:
        - consume: [air, dark]
    - push: 2
      sub:
        - range: 1
    - divider
    - move: 2
    - divider
    - push: 2
      sub:
        - range: 1
    - divider
    - move: 2
      enhancement: [square]
  xp: 1

name: Battle Prowess
initiative: 78
level: X
top:
  actions:
    - custom: "Grant one of your summons or self:"
    - attack: 3
      enhancement: [square]
    - optional:
        - consume: [dark]
        - custom: "%dark%"
bottom:
  actions:
    - move: 2
    - optional:
        - custom: "-1 %move% : %wild%, %xp1%"
    - divider
    - loot: 2
  lost: t

name: Crystalline Aegis
initiative: 17
level: X
top:
  actions:
    - brittle: ''
      sub:
        - range: 1
    - custom: "Add +1 %target% for each pair of active %infusion%."
  xp: 1
bottom:
  actions:
    - multi:
        - regenerate: ''
        - custom: ","
        - ward: ''
          sub:
            - self

name: Imbue with Life
initiative: 42
level: X
top:
  actions:
    - mandatory:
        - consume: [earth]
        - custom: "Summon Animated Claymore"
    - summon:
        stats: [2, 3, 3, '-']
        name: Animated Claymore
        enhancement: [square, square, 0, 0]
        special:
          - custom: '%shield% 1'
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/animated_claymore.jpg
          size: 100%
          position: '0px 0px'
    - mandatory:
        - custom: "Whenever you do not have %disarm%, gain %disarm%."
    - divider
    - custom: "This summon is affected by all your active %infusion%."
  duration: persistent
bottom:
  actions:
    - heal: 7
      # check: the marker after the 7 is a small diamond with a plus (diamondPlus)
      enhancement: [diamondPlus]
      sub:
        - self
    - optional:
        - group:
            - custom: "-2 %heal% : %air%, %xp1%"
        - group:
            - custom: "-2 %heal% : %earth%, %xp1%"
        - group:
            - custom: "-2 %heal% : %dark%"
  lost: t

name: Remote Impact
initiative: 72
level: 2
top:
  actions:
    - group:
        - group:
            - attack: 3
              enhancement: [square]
            - optional:
                - custom: "-1 %attack% : %push% 1, %air%, %xp1%"
        - hex: ettx_t_x
bottom:
  actions:
    - mandatory:
        - consume: [earth]
        - consume: [air]
        - custom: ":"
    - custom: "Create one 1-hex obstacle in an empty hex within %range% 5."
    - divider
    - immobilize: ''
      sub:
        - custom: "%target% all enemies adjacent to the created obstacle"
  xp: 1

name: Veil of Protection
initiative: 47
level: 2
top:
  actions:
    - heal: 5
      sub:
        - range: 3
          enhancement: [square]
    - optional:
        - custom: "-2 %heal% : %earth%, %xp1%"
bottom:
  namedAbility:
    name: Infusion
  consume: [earth, dark]
  actions:
    - custom: "Your current and maximum hit point values are increased by 3. You are immune to %curse%."
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - ward: ''
      sub:
        - self
  xp: 2
  duration: persistent
  lost: t

name: Guide the Flow
initiative: 35
level: 3
top:
  actions:
    - move: 3
      enhancement: [square]
    - optional:
        - group:
            - consume: [air]
            - custom: '%dark%'
        - group:
            - consume: [earth]
            - custom: '%air%'
        - group:
            - consume: [dark]
            - custom: "%earth%, %xp1%"
bottom:
  actions:
    - attack: 3
      enhancement: [square]
    - optional:
        - group:
            - consume: [air]
            - custom: '%earth%'
        - group:
            - consume: [earth]
            - custom: '%dark%'
        - group:
            - consume: [dark]
            - custom: "%air%, %xp1%"

name: Reinforced Riposte
initiative: 18
level: 3
top:
  actions:
    - retaliate: 1
      sub:
        - range: 2
    - custom: "Add +1 %retaliate% for each pair of active %infusion%."
    - optional:
        - consume: [dark]
        - custom: '%dark%'
  duration: round
bottom:
  actions:
    - move: 2
    - divider
    - wound: ''
      sub:
        - range: 1
    - divider
    - move: 2
      enhancement: [square]

name: Coalescing Darkness
initiative: 85
level: 4
top:
  namedAbility:
    name: Infusion
  consume: [air, dark]
  actions:
    - custom: "After an adjacent enemy attacks you, that enemy gains %curse%."
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - disarm: ''
      sub:
        - range: 1
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - pull: 2
      enhancement: [square]
      sub:
        - target: 2
        - range: 3
          enhancement: [square]
        - muddle
    - optional:
        - group:
            - custom: "-1 %pull%, -1 %range% :"
            - custom: '%air%'
        - group:
            - custom: "-1 %target% :"
            - custom: '%dark%'

name: Desperate Throw
initiative: 16
level: 4
top:
  actions:
    - attack: 5
      enhancement: [diamond]
      sub:
        - custom: "%target% 1 enemy within 4 hexes"
    - optional:
        - custom: "-1 %attack% : %earth%"
    - divider
    # check: banner with disarm icon, a small plus enhancement spot and a self pill
    - mandatory:
        - disarm: ''
          enhancement: [diamondPlus]
          sub:
            - self
bottom:
  actions:
    - move: 2
      enhancement: [square]
    - divider
    - loot: 1
    - divider
    - custom: "Move any waning element to the strong column."

name: Gemstone Resonance
initiative: 30
level: 5
top:
  namedAbility:
    name: Infusion
  consume: [earth]
  actions:
    - custom: "Add %regenerate% to all your heal abilities."
    - divider
    - heal: 2
      enhancement: [square]
      sub:
        - target: 1 ally
        - range: 3
  xp: 1
  duration: round
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "While this card is in your active area this round, your abilities and attack modifier cards treat it as a pair of active %infusion%."
  duration: round

name: Obsidian Spear
initiative: 84
level: 5
top:
  actions:
    - group:
        - group:
            - attack: 4
              enhancement: [diamond]
            - optional:
                - custom: "-1 %attack% : %pull% 1, %dark%, %xp1%"
        - hex: sbttx
bottom:
  actions:
    - mandatory:
        - consume: [earth, dark]
    - attack: 4
      enhancement: [square]
      sub:
        - range: 3
          enhancement: [square]
        - stun
  xp: 1

name: Gale Barrage
initiative: 44
level: 6
top:
  actions:
    - mandatory:
        - consume: [air, dark]
    - attack: 2
      sub:
        - target: 3
        - pierce: 2
          enhancement: [square]
    - custom: "You may target the same enemy multiple times with this ability."
  xp: 1
bottom:
  actions:
    - move: 1
      enhancement: [square]
    - divider
    - custom: "Add +2 %attack% to your next attack ability this round."
    - optional:
        - custom: "Add +1 %attack% instead: %air%, %xp1%"
  duration: round

name: Propulsive Tailwind
initiative: 91
level: 6
top:
  namedAbility:
    name: Infusion
  consume: [air, earth]
  actions:
    - custom: "After each of your attack abilities, perform %move% 2."
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - push: 2
      sub:
        - range: 1
        - immobilize
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
    - optional:
        - custom: "-1 %move% : %earth%"
    - divider
    - custom: "Grant one adjacent ally:"
    - move: 3
      enhancement: [square]
    - optional:
        - custom: "-1 %move% : %air%"

name: Diamondization
initiative: 10
level: 7
top:
  actions:
    - shield: 1
      enhancement: [square]
    - custom: "Add +1 %shield% for each pair of active %infusion%."
    - divider
    - ward: ''
      sub:
        - self
  infuse: [earth/dark]
  duration: round
bottom:
  actions:
    - group:
        - multi:
            - wound: ''
            - custom: ','
            - immobilize: ''
          sub:
            - range: 2
        - hex: et_tt_ttt_tt_et
  infuse: [earth/dark]
  xp: 1
  lost: t

name: Malachite Shockwave
initiative: 68
level: 7
top:
  actions:
    - group:
        - attack: 4
          enhancement: [diamond]
          sub:
            - stun
        - hex: t_t_et
  infuse: [earth/dark]
  xp: 1
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [square]
    - optional:
        - custom: "-1 %move% : %earth%/%dark%"
    - divider
    - custom: "All adjacent enemies suffer %damage% 1."

name: Swift Pivot
initiative: 8
level: 8
top:
  actions:
    - custom: "Negate the next %damage% you would suffer from a melee attack this round, and the attacker suffers %damage% 4."
  infuse: [air/earth]
  xp: 1
  duration: round
bottom:
  actions:
    - move: 2
      enhancement: [square]
    - divider
    - group:
        - attack: 4
          enhancement: [diamond]
        - hex: t_t_st_ex
    - divider
    - move: 2
  infuse: [air/earth]
  xp: 1
  lost: t

name: Untether the Shackles
initiative: 61
level: 8
top:
  actions:
    - summon:
        stats: [6, 3, 4, '-']
        name: Spiritbound Falchion
        enhancement: [square, square, 0, 0]
        special:
          - custom: '%shield% 1'
          # check: the wing icon after the summon name suggests flying
          - custom: '%flying%'
        # check: the summon art is not in the assets yet
        image:
          url: https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/spiritbound_falchion.jpg
          size: 100%
          position: '0px 0px'
    - custom: "Whenever you play an %infusion%, you may have this summon perform all abilities triggered by that %infusion% instead of you."
    - custom: "This summon is affected by all your active %infusion%."
  xp: 1
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 5
      enhancement: [square]
      sub:
        - jump
  infuse: [air/dark]

name: Ancient Rites of Power
initiative: 94
level: 9
top:
  namedAbility:
    name: Infusion
  consume: [air, earth, dark]
  actions:
    - custom: "Add +1 %target% to all your melee attack abilities."
    - divider
    - custom: "When this %infusion% or another %infusion% is played, perform:"
    - bless: ''
      sub:
        - self
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - heal: 3
      enhancement: [diamondPlus]
      sub:
        - target: 3
        - range: 3
    - optional:
        - group:
            - custom: "-1 %heal% :"
            - custom: "%dark%"
        - group:
            - custom: "-1 %target% :"
            - custom: "%earth%"
        - group:
            - custom: "-2 %range% :"
            - custom: "%air%"

name: Sky-Splitting Strike
initiative: 50
level: 9
top:
  actions:
    - attack: 6
      enhancement: [diamond]
    - optional:
        - group:
            - consume: [air]
            - custom: "%pierce% 5, %xp1%"
        - group:
            - consume: [earth]
            - custom: "+1 %attack%, %wound%"
        - group:
            - consume: [dark]
            - custom: "%disarm%"
bottom:
  actions:
    - custom: "Create one 3-hex obstacle in empty hexes within %range% 4."
    - divider
    - custom: "All enemies adjacent to the created obstacle suffer %damage% 4 and gain %stun%."
    - mandatory:
        - air
        - earth
        - dark
  xp: 1
  lost: t
