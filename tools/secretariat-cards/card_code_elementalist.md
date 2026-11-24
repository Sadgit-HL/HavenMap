# Elementalist (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Ice Spikes
initiative: 48
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [wild]
    - wild
    - custom: "%xp1%"
bottom:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
    - immobilize
  - mandatory:
    - consume: [ice/earth]
  xp: 2
  lost: t

name: Malleable Evocation
initiative: 26
level: 1
top:
  actions:
  - heal: 2
    enhancement: [circle]
    sub:
    - range: 3
      enhancement: [square]
    - optional:
      - consume: [fire]
      - strengthen: ''
      noLine: true
    - optional:
      - consume: [ice]
      - ward: ''
      noLine: true
    - optional:
      - consume: [air]
      - bless: ''
      noLine: true
    - optional:
      - consume: [earth]
      - safeguard: ''
      noLine: true
  - custom: "Add +1 %target% and gain %xp1% if you consume two or more elements."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Move one waning element to the strong column."

name: Formless Power
initiative: 45
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [wild]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
    - custom: "+1 %range%"
bottom:
  actions:
  - custom: "At the start of each of your turns, you may %wild% to add +1 %attack% to all your attacks this turn."
  xp: 2
  lost: t
  duration: persistent

name: Shaping the Ether
initiative: 54
level: 1
top:
  actions:
  - attack: 2
    enhancement: [circle]
    sub:
    - range: 3
      enhancement: [square]
    - optional:
      - consume: [fire]
      - wound: ''
      noLine: true
    - optional:
      - consume: [ice]
      - immobilize: ''
      noLine: true
    - optional:
      - consume: [air]
      - push: 3
      noLine: true
    - optional:
      - consume: [earth]
      - poison: ''
      noLine: true
  - custom: "Add +1 %target% and gain %xp1% if you consume two or more elements."
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Stoking Hail
initiative: 29
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [ice]
    - pierce: 2
    - ice
    - custom: "+1 %attack%"
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Add +1 %move% if one or more elements are strong or waning."
  - mandatory:
    - air

name: Magma Scales
initiative: 14
level: 1
top:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - move: 2
    enhancement: [square]
    sub:
    - jump
  - optional:
    - consume: [air]
    - disarm: ''
      sub:
      - range: 1
    - air
    noLine: true
bottom:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - shield: 2
    enhancement: [square]
  - divider
  - retaliate: 2
    enhancement: [square]
  - mandatory:
    - consume: [fire/earth]
  xp: 2
  lost: t
  duration: round

name: Infernal Vortex
initiative: 35
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - target: "all"
    - range: 4
  - mandatory:
    - consume: [fire/air]
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Add +1 %move% if one or more elements are strong or waning."
  - mandatory:
    - earth

name: Frigid Torrent
initiative: 39
level: 1
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 4
    - disarm
  - mandatory:
    - consume: [ice/air]
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Add +1 %move% if one or more elements are strong or waning."
  - mandatory:
    - fire

name: Pulsing Cores
initiative: 40
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [fire]
    - hex: et_tt
    - fire
bottom:
  actions:
  - custom: "At the end of this and your next five turns, in order: %fire%/%ice%, %air%/%earth%, %light%/%dark% (repeat the same order for turns 4-6)."
  - tokens: [0, 1, 0, 1, 0, 1]
  lost: t
  duration: persistent

name: Dual Nature
initiative: 27
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [earth]
    - heal: 2
      sub:
      - range: 3
    - earth
    noLine: true
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Add +1 %move% if one or more elements are strong or waning."
  - mandatory:
    - ice

name: Lingering Essence
initiative: 50
level: X
top:
  actions:
  - custom: "Whenever an enemy consumes an element, you may infuse that element."
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Flash of Brilliance
initiative: 67
level: X
top:
  actions:
  - custom: "You or one ally within %range%3 may %recover% one level 1 card from the discard pile."
  - mandatory:
    - light
bottom:
  actions:
  - loot: 1
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - self
  - mandatory:
    - wild

name: Encompassing Shadow
initiative: 12
level: X
top:
  actions:
  - invisible: ''
    sub:
    - target: "1 ally"
    - range: 4
      enhancement: [square]
  - mandatory:
    - dark
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "All attacks targeting you or adjacent allies this round gain disadvantage."
  duration: round

name: Gravel Guard
initiative: 10
level: 2
top:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - move: 2
    enhancement: [square]
  - divider
  - shield: 1
    enhancement: [square]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 1
  - mandatory:
    - earth
  duration: round
bottom:
  actions:
  - optional:
    - consume: [fire]
    - custom: "Create one %damage%2 trap in an empty hex within %range%3. All enemies adjacent to the trap suffer %damage%1."
    - fire
    noLine: true
  - move: 2
    enhancement: [circle]

name: Wave of Frost
initiative: 47
level: 2
top:
  actions:
  - group:
    - attack: 1
      sub:
      - range: 3
    - hex: xt_tt_ett_ex
  - mandatory:
    - ice
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [air]
    - air
    - custom: "+2 %move%"

name: Arresting Gale
initiative: 65
level: 3
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
    - stun
  - mandatory:
    - air
bottom:
  actions:
  - ward: ''
    enhancement: [circle]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [earth]
    - earth
    - custom: "+1 %target%"

name: Empowering Flame
initiative: 15
level: 3
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - divider
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - mandatory:
    - fire
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Grant one ally within %range%2:"
  - optional:
    - consume: [ice]
    - retaliate: 2
      sub:
      - range: 2
    - ice
    noLine: true

name: Burial
initiative: 77
level: 4
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
      sub:
      - range: 4
    - hex: t_tt_t
  - optional:
    - consume: [earth]
    - immobilize: ''
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
  - mandatory:
    - dark

name: Chain Lightning
initiative: 23
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: 3
    - range: 4
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
    - custom: "+1 %target%"
  - custom: "Add -1 %attack%, +2 %range% to each attack for each enemy already attacked with this ability. Each target after the first must be within %range%2 of the previous target."
  lost: t
bottom:
  actions:
  - heal: 4
    sub:
    - range: 2
      enhancement: [square]
  - mandatory:
    - light

name: Obsidian Shards
initiative: 19
level: 5
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: 2
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [fire/earth]
    - muddle: ''
    - custom: "%xp2%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [ice/earth]
    - custom: "On the next two sources of %damage% you or an adjacent ally would suffer, negate the %damage%."
    - multi:
      - consume: [ice/earth]
      - tokens: [0, 1]
    noLine: true

name: Winter's Edge
initiative: 43
level: 5
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [square]
  - optional:
    - consume: [ice/air]
    - pierce: 4
    - custom: "%xp2%"
    - custom: "+3 %range%"
bottom:
  actions:
  - optional:
    - consume: [fire/air]
    - multi:
      - strengthen: ''
      - custom: ","
      - bless: ''
        sub:
        - target: "2 allies"
        - range: 3
    - multi:
      - consume: [fire/air]
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "Grant one ally within %range%3 :"
  - attack: 3
    enhancement: [diamond]

name: Pragmatic Reinforcement
initiative: 13
level: 6
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 4
    - air/earth
  - optional:
    - consume: [light]
    - custom: "The target may %recover% one level 1 card from the discard pile, %air%/%earth%."
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - consume: [ice/earth]

name: Duskstorm
initiative: 17
level: 6
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
      sub:
      - range: 4
      - fire/ice
    - hex: etx_tt
  - optional:
    - consume: [dark]
    - custom: "All allies in the red hexes gain %invisible%."
    - consume: [fire/ice]
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - consume: [fire/air]

name: Elemental Juggernaut
initiative: 94
level: 7
top:
  actions:
  - summon:
      name: Chromatic Construct
      stats: [7, 3, 0, -]
      special:
      - custom: "Add +1 %attack% for each element that is strong or waning."
      enhancement: [heal, move]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - consume: [ice/air]

name: Confluence of Elements
initiative: 64
level: 7
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [wild, wild]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - consume: [fire/earth]

name: Prismatic Barrage
initiative: 33
level: 8
top:
  actions:
  - attack: 2
    sub:
    - range: 4
  - optional:
    - consume: [ice]
    - stun: ''
    - custom: "%xp1%"
  - optional:
    - consume: [fire]
    - attack: 2
      sub:
      - range: 4
    - optional:
      - custom: "Create one 1-hex hazardous terrain tile in the featureless hex occupied by the target, %xp1%."
    noLine: true
  - optional:
    - consume: [earth]
    - attack: 2
      sub:
      - range: 4
      - push: 3
    - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - heal: 2
    sub:
    - range: 3
  - optional:
    - consume: [ice]
    - ward: ''
    - ice
  - custom: "Add +1 %heal%, gain %xp1%, and %light% if you consume two or more elements."

name: Eye of the Hurricane
initiative: 25
level: 8
top:
  actions:
  - heal: 2
    sub:
    - range: 4
  - optional:
    - consume: [fire]
    - strengthen: ''
    - custom: "%xp1%"
bottom:
  actions:
  - attack: 2
    sub:
    - range: 3
  - optional:
    - consume: [fire]
    - wound: ''
    - fire
  - custom: "Add +1 %attack%, gain %xp1%, and %dark% if you consume two or more elements."

name: Ethereal Manifestation
initiative: 98
level: 9
top:
  actions:
  - summon:
      name: Elemental Conduit
      stats: [3, 3, 2, 3]
      special:
      - fly: ''
      - custom: "After each attack, %wild%."
      enhancement: [heal, move]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - mandatory:
    - wild

name: Primal Duality
initiative: 11
level: 9
top:
  actions:
  - optional:
    - consume: [fire/ice]
    - muddle: ''
      sub:
      - range: 4
    - custom: "The target suffers %damage%5."
    noLine: true
  - optional:
    - consume: [air/earth]
    - custom: "Grant one ally within %range%4:"
    - multi:
      - shield: 2
      - retaliate: 2
    noLine: true
  - optional:
    - consume: [light/dark]
    - attack: 2
      sub:
      - target: 2
      - range: 4
      - curse
    - optional:
      - custom: "advantage"
    noLine: true
bottom:
  actions:
  - optional:
    - consume: [light]
    - custom: "%recover% one card from your discard pile, %dark%."
    noLine: true
  - optional:
    - consume: [dark]
    - teleport: 4
    - light
    noLine: true
  - loot: 1
  - optional:
    - consume: [wild, wild]
    - custom: "+1 %loot%"
