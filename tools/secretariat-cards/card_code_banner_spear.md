# Banner Spear (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: At All Costs
initiative: 60
level: 1
top:
  actions:
  - heal: 3
    sub:
    - target: "all allies"
  - mandatory:
    - custom: "Suffer %damage%1 for each ally whose hit point value increased with the heal ability."
  xp: 1
bottom:
  actions:
  - summon:
      name: Reinforcement
      stats: [1, 2, -, -]
      enhancement: [heal, move]
  xp: 1
  duration: persistent

name: Rallying Cry
initiative: 71
level: 1
top:
  actions:
  - group:
    - attack: 3
      sub:
      - disarm
    - hex: ax_t_s
  xp: 1
bottom:
  actions:
  - summon:
      name: Banner Of Strength
      stats: [3, -, -, -]
      special:
      - custom: "All allies within %range%2 add +1 %attack% to one of their attacks each turn."
      enhancement: [heal]
  xp: 2
  lost: t
  duration: persistent

name: Unbreakable Wall
initiative: 83
level: 1
top:
  actions:
  - group:
    - attack: 3
      sub:
      - push: 1
    - hex: ttt_as
  xp: 1
bottom:
  actions:
  - shield: 1
  - mandatory:
    - custom: "All your ranged attacks have -1 %range%."
  xp: 2
  lost: t
  duration: persistent

name: Javelin
initiative: 21
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - mandatory:
    - air
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - pull: 2
    sub:
    - range: 3

name: Deflecting Maneuver
initiative: 15
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - optional:
    - consume: [air]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "%advantage%"
      - custom: ","
      - custom: "%xp1%"
  - custom: "All attacks targeting you this round gain disadvantage."
  duration: round
bottom:
  actions:
  - shield: 2
    enhancement: [circle]
  - custom: "This %shield% only applies to ranged attacks."
  duration: round

name: Tip of the Spear
initiative: 67
level: 1
top:
  actions:
  - group:
    - attack: 3
      sub:
      - pierce: 3
    - hex: eex_et_et_s_a
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Combined Effort
initiative: 32
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - wound
    - hex: et_sa
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Grant two allies within %range%2:"
  - move: 2
    enhancement: [square]

name: Set for the Charge
initiative: 6
level: 1
top:
  actions:
  - custom: "Whenever an enemy moves or teleports from a hex not adjacent to you to a hex adjacent to you this round, that enemy suffers %damage%2."
  duration: round
bottom:
  actions:
  - move: 4

name: Pincer Movement
initiative: 69
level: 1
top:
  actions:
  - group:
    - attack: 5
      enhancement: [diamond]
      sub:
      - muddle
    - hex: ea_t_s
  xp: 1
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - loot: 1

name: Regroup
initiative: 25
level: 1
top:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - range: 2
    - regenerate
bottom:
  actions:
  - custom: "Grant two allies within %range%3:"
  - move: 3
    enhancement: [square]

name: Resolved Courage
initiative: 10
level: X
top:
  actions:
  - group:
    - attack: 3
      sub:
      - immobilize
    - hex: eet_ast_eet
  xp: 1
bottom:
  actions:
  - custom: "Add +1 %attack% to the next attack ability performed by you or an adjacent ally this round."
  duration: round

name: Incendiary Throw
initiative: 22
level: X
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "If the target suffers %damage% from this attack, the target and all enemies adjacent to the target gain %wound%."
  - mandatory:
    - fire
bottom:
  actions:
  - summon:
      name: Torch Bearer
      stats: [5, 2, 1, -]
      special:
      - wound: ''
      enhancement: [heal, attack]
  xp: 2
  lost: t
  duration: persistent

name: Driving Inspiration
initiative: 18
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - optional:
    - custom: "%advantage%"
  - mandatory:
    - light
bottom:
  actions:
  - summon:
      name: Banner Of Hope
      stats: [4, -, -, -]
      special:
      - custom: "At the start of their turns, grant allies within %range%3:"
      - heal: 1
        sub:
        - self
      enhancement: [heal]
  xp: 2
  lost: t
  duration: persistent

name: Meat Grinder
initiative: 62
level: 2
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
      sub:
      - wound
    - hex: ea_tt_es
  xp: 1
bottom:
  actions:
  - move: 3
  - divider
  - heal: 1
    enhancement: [circle]
    sub:
    - range: 1
    - regenerate

name: Pinning Charge
initiative: 17
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [air]
    - multi:
      - range: 1
      - custom: ","
      - immobilize: ''
      - custom: ","
      - custom: "%xp1%"
  - custom: "Add +1 %attack% for each ally adjacent to the target."
bottom:
  actions:
  - custom: "Grant three allies within %range%4:"
  - move: 2
    enhancement: [square]

name: Let Them Come
initiative: 24
level: 3
top:
  actions:
  - group:
    - attack: 2
      sub:
      - poison
    - hex: tt_t_as
  - divider
  - heal: 2
    sub:
    - target: "the ally in the blue hey of the attack ability and self"
  xp: 1
bottom:
  actions:
  - summon:
      name: Banner Of Courage
      stats: [7, -, -, -]
      special:
      - custom: "All adjacent allies gain %shield%1."
      enhancement: [heal]
  xp: 2
  lost: t
  duration: persistent

name: Head of the Hammer
initiative: 87
level: 3
top:
  actions:
  - group:
    - attack: 7
      enhancement: [diamond]
      sub:
      - stun
    - hex: et_s_a
  xp: 3
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 1
  - mandatory:
    - air

name: Boldening Blow
initiative: 72
level: 4
top:
  actions:
  - group:
    - attack: 4
      sub:
      - target: "1 enemy in the red hexes"
    - hex: ett_ast_eat
  - divider
  - bless: ''
    sub:
    - target: "all allies in the blue hexes of the attack ability"
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Grant two allies within %range%3:"
  - move: 3
    enhancement: [square]

name: Air Support
initiative: 20
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
    - pierce: 2
  - mandatory:
    - air
bottom:
  actions:
  - summon:
      name: Trained Falcon
      stats: [1, 3, 2, -]
      special:
      - fly: ''
      enhancement: [heal, move, attack]
  xp: 1
  duration: persistent

name: Explosive Epicenter
initiative: 78
level: 5
top:
  actions:
  - group:
    - attack: 3
      sub:
      - push: 1
    - hex: ttt_as_ttt
  - custom: "Grant the ally in the blue hex of the attack ability and self:"
  - move: 1
  xp: 1
bottom:
  actions:
  - custom: "%data.custom.fh.banner-spear.abilities.80.2%"
  - move: 1
  xp: 2
  lost: t
  duration: persistent

name: Hold the Line
initiative: 5
level: 5
top:
  actions:
  - shield: 2
    enhancement: [diamondPlus]
  - custom: "Grant all adjacent allies:"
  - shield: 2
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - shield: 2
  - divider
  - retaliate: 3
    enhancement: [circle]
  xp: 2
  lost: t
  duration: round

name: Barricade
initiative: 16
level: 6
top:
  actions:
  - group:
    - attack: 3
      sub:
      - wound
    - hex: tttt_asa
  - custom: "Grant all allies in the blue hexes of the attack ability and self:"
  - shield: 1
  xp: 1
  duration: round
bottom:
  actions:
  - summon:
      name: Banner Of Valor
      stats: [5, -, -, -]
      special:
      - custom: "Negate the first source of %damage% to an adjacent ally each round."
      enhancement: [heal]
  xp: 2
  lost: t
  duration: persistent

name: Bolstering Shout
initiative: 75
level: 6
top:
  actions:
  - heal: 3
    sub:
    - range: 3
      enhancement: [square]
    - regenerate
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+1 %target%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - pull: 2
    sub:
    - target: 2
      enhancement: [square]
    - range: 3

name: Tri-Thrust
initiative: 27
level: 7
top:
  actions:
  - group:
    - attack: 7
      enhancement: [diamond]
      sub:
      - stun
    - hex: a_ta_s
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 1
    enhancement: [square]
    sub:
    - target: 3
  - optional:
    - consume: [air]
    - target: "3 enemies within two hexes instead"
    - custom: "%xp1%"

name: Lead from Afar
initiative: 80
level: 7
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - custom: "Add +2 %attack% for each ally adjacent to the target."
bottom:
  actions:
  - summon:
      name: Longbowman
      stats: [4, 2, 2, 4]
      special:
      - muddle: ''
      enhancement: [heal, move, range]
  xp: 2
  lost: t
  duration: persistent

name: Sweeping Aid
initiative: 73
level: 8
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
      sub:
      - pierce: 2
      - immobilize
    - hex: eet_sat_eet
  xp: 1
bottom:
  actions:
  - heal: 2
    sub:
    - range: 2
  - divider
  - move: 3
    enhancement: [circle]
  - divider
  - heal: 2
    sub:
    - range: 2

name: Taunting Howl
initiative: 11
level: 8
top:
  actions:
  - pull: 2
    enhancement: [square]
    sub:
    - target: "all"
    - range: 4
    - muddle
  - divider
  - shield: 3
  xp: 2
  lost: t
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Grant two allies within %range%3:"
  - move: 3
    enhancement: [square]

name: Take no Prisoners
initiative: 85
level: 9
top:
  actions:
  - group:
    - attack: 3
      sub:
      - poison
    - hex: ett_ttt_astt_att
  xp: 1
bottom:
  actions:
  - summon:
      name: Banner Of Doom
      stats: [9, -, -, -]
      special:
      - custom: "All enemies within %range%4 suffer %damage%1 at the start of their turns."
      enhancement: [heal]
  xp: 2
  lost: t
  duration: persistent

name: Hail of Spears
initiative: 44
level: 9
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 4
  - custom: "Add +1 %target% for each adjacent Banner summon."
  - mandatory:
    - custom: "%teleport% each adjacent Banner summon to a hex adjacent to one of the targets."
bottom:
  actions:
  - move: 4
  - custom: "%recover% up to two of your lost cards with Banner summon abilities. Immediately play the recovered cards and perform their Banner summon abilities."
  lost: t
