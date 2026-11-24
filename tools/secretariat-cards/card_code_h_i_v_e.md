# H.I.V.E. (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Plated Defense
initiative: 80
level: 1
top:
  actions:
  - summon:
      name: Armored Tank
      stats: [6, 2, 2, -]
      special:
      - shield: 1
      enhancement: [heal, move, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - shield: 1
  - custom: "+"
  - custom: "Add -1 %move% to all your move abilities."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - shield: 1
    enhancement: [square]
  - divider
  - retaliate: 1
    enhancement: [square]
  duration: round

name: Reconstructive Aid
initiative: 90
level: 1
top:
  actions:
  - summon:
      name: Repair Drone
      stats: [3, 2, 1, 3]
      special:
      - custom: "At the end of turn perform:"
      - heal: 1
        sub:
        - range: 3
      enhancement: [heal, move, range]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "At the start of each of your turns, perform:"
  - heal: 2
    sub:
    - self
  - custom: "+"
  - custom: "All your ranged attacks have -1 %range%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 3
    enhancement: [circle]
    sub:
    - self
    - regenerate

name: Hunter Killer
initiative: 84
level: 1
top:
  actions:
  - summon:
      name: Jackal Mech
      stats: [4, 3, 2, -]
      special:
      - wound: ''
      enhancement: [heal, move, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "At the start of each of your turns, suffer %damage%2."
  - custom: "+"
  - custom: "Add +1 %attack% to all your melee attacks."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 1
    enhancement: [square]

name: Coiled Limbs
initiative: 82
level: 1
top:
  actions:
  - summon:
      name: Leaper
      stats: [7, 5, 1, -]
      special:
      - shield: 1
      enhancement: [heal, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "Add %jump% to all your move abilities."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump

name: Aimed Assault
initiative: 88
level: 1
top:
  actions:
  - summon:
      name: Sniper Turret
      stats: [3, -, 2, 4]
      enhancement: [heal, range]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "All your single-target melee attack abilities have +2 %range%."
  - custom: "+"
  - custom: "Add -1 %move% to all your move abilities."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - attack: 1
    sub:
    - range: 4
      enhancement: [square]

name: Launch Pod
initiative: 77
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "Play one card from your hand to perform a summon action of the card as if you were occupying a hex occupied by a target of the attack ability."
bottom:
  actions:
  - custom: "%fh-mode%"
  - heal: 2
    enhancement: [circle]
    sub:
    - self

name: Faceless Entity
initiative: 12
level: 1
top:
  actions:
  - attack: 2
  - custom: "%fh-mode%"
  - attack: 2
bottom:
  actions:
  - move: 2
  - custom: "%fh-mode%"
  - move: 2

name: Prepare for Deployment
initiative: 64
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
  - move: 4
    enhancement: [circle]

name: Reaper Function
initiative: 32
level: 1
top:
  actions:
  - group:
    - attack: 2
    - hex: xt_st_et
  xp: 1
bottom:
  actions:
  - custom: "%fh-mode%"
  - loot: 1

name: High Impact Projectiles
initiative: 16
level: 1
top:
  actions:
  - attack: 2
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
bottom:
  actions:
  - custom: "Grant two of your summons:"
  - move: 3
    enhancement: [square]
    sub:
    - jump

name: Interference
initiative: 21
level: 1
top:
  actions:
  - custom: "%fh-mode%"
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "All adjacent allies and enemies suffer %damage%1."
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "All enemies that target one of your adjacent summons with an attack this round target you with the attack instead, regardless of range or line-of-sight."
  duration: round

name: Shocking Pulse
initiative: 86
level: X
top:
  actions:
  - summon:
      name: Arcing Generator
      stats: [5, 4, 2, -]
      special:
      - target: "all adjacent enemies"
      enhancement: [heal, move]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "Add -1 %attack% and %pierce%5 to all your attacks."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - muddle: ''
    sub:
    - target: "all"
    - range: 1
  - custom: "All adjacent allies and enemies suffer %damage%1."

name: Remote Control
initiative: 48
level: X
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 1
  xp: 1
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - move: 1

name: Reassemble
initiative: 27
level: X
top:
  actions:
  - custom: "%fh-mode%"
  - custom: "Instead of placing your previous %prism-mode% card's standee on the map as a summon, move that card to your discard pile."
bottom:
  actions:
  - custom: "Play one card from your lost pile to perform a summon action of the card."
  - custom: "%fh-mode%"
  - move: 2
    enhancement: [circle]
  lost: t
  remove: t

name: Force Field
initiative: 78
level: 2
top:
  actions:
  - summon:
      name: Dampening Unit
      stats: [5, 2, 1, 2]
      special:
      - custom: "All adjacent allies gain %shield%1."
      enhancement: [heal, move, range]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "Gain %shield%2 for the first attack that damages you each round."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Long Range Missile
initiative: 19
level: 2
top:
  actions:
  - attack: 3
    sub:
    - range: 5
bottom:
  actions:
  - custom: "Whenever one of your summons would suffer %damage%, you may instead suffer that amount of %damage% minus 1, %fh-mode% with that summon, discard this card, and gain %xp1%."
  duration: persistent

name: Rapid Fire
initiative: 92
level: 3
top:
  actions:
  - summon:
      name: Machine Bolter
      stats: [3, -, 2, 3]
      special:
      - target: 2
      enhancement: [heal]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "Add +1 %target% to all your ranged attack abilities."
  - custom: "+"
  - custom: "All your ranged attacks have -1 %range%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Grant two of your summons:"
  - move: 2
    enhancement: [square]

name: Hijack
initiative: 40
level: 3
top:
  actions:
  - custom: "%fh-mode%"
  - custom: "Grant the summon placed by the transfer ability:"
  - attack: 1
  xp: 1
bottom:
  actions:
  - custom: "Control one enemy within %range%4:"
  - move: 1
  - divider
  - attack: 2

name: Plague Protocol
initiative: 98
level: 4
top:
  actions:
  - summon:
      name: Toxin Distributor
      stats: [6, 2, 2, -]
      special:
      - poison: ''
      enhancement: [heal, move, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "Heals targeting you do not increase your hit point value."
  - custom: "+"
  - custom: "Add %poison% to all your attacks."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - custom: "%fh-mode%"
  - shield: 2
  duration: round

name: Divergent Destruction
initiative: 22
level: 4
top:
  actions:
  - attack: 2
  - custom: "%fh-mode%"
  - attack: 3
  xp: 1
bottom:
  actions:
  - custom: "%fh-mode%"
  - move: 3
    enhancement: [circle]
  - custom: "All adjacent allies and enemies suffer %damage%1."

name: Net Dispersal
initiative: 94
level: 5
top:
  actions:
  - summon:
      name: Trapping Unit
      stats: [7, 3, 2, -]
      special:
      - custom: "When attacked reduce %damage% by 1 for each negative condition the attacker has."
      enhancement: [heal, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "You cannot perform move abilities."
  - custom: "+"
  - custom: "Add %immobilize% to all your attacks."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - immobilize: ''
    sub:
    - target: 3
    - range: 3

name: Code Geminate
initiative: 28
level: 5
top:
  actions:
  - custom: "If you have two %prism-mode%, you may move one %prism-mode% card from your active area to your discard pile."
  - custom: "If you have one %prism-mode%, you may place one card with a summon action from your hand in your active area (without gaining the experience) and place a %prism-mode% token on it. Treat this card as an additional active %prism-mode%."
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Grant one of your summons:"
  - move: 4
    enhancement: [square]

name: Spinning Blades
initiative: 79
level: 6
top:
  actions:
  - summon:
      name: Sword Propeller
      stats: [1, 5, 2, -]
      special:
      - custom: "Give %wound% to all adjacent figures and self at the end of turn."
      enhancement: [heal, move, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "At the end of each of your turns, one adjacent enemy suffers %damage%2 and you suffer %damage%1."
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 1
    sub:
    - target: 2

name: Triage Program
initiative: 13
level: 6
top:
  actions:
  - custom: "%fh-mode%"
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "%fh-mode%"
  xp: 1
bottom:
  actions:
  - custom: "%fh-mode%"
  - loot: 1
  - divider
  - heal: 2
    enhancement: [circle]
    sub:
    - self

name: Mortar Shells
initiative: 85
level: 7
top:
  actions:
  - summon:
      name: Bombardier
      stats: [5, 1, 2, 4]
      special:
      - hex: tt_t
      enhancement: [heal, range]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "Whenever you suffer %damage%, one adjacent ally suffers %damage%1."
  - custom: "+"
  - custom: "Add %push%2 to all your attacks."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - attack: 2
    sub:
    - range: 4
      enhancement: [square]

name: Recall
initiative: 91
level: 7
top:
  actions:
  - custom: "Play two cards from your lost pile to perform the summon actions of both cards without gaining the experience."
  lost: t
  remove: t
bottom:
  actions:
  - move: 3
  - custom: "Grant one of your summons:"
  - teleport: 8
  - custom: "This teleport must end in a hex adjacent to you."

name: Swarming Bulwark
initiative: 96
level: 8
top:
  actions:
  - summon:
      name: Shield Spider
      stats: [7, 3, 2, -]
      special:
      - custom: "At the end of turn perform:"
      - ward: ''
        sub:
        - range: 4
      enhancement: [heal, move, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "At the start of each of your turns, perform:"
  - ward: ''
    sub:
    - self
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "%fh-mode%"
  - move: 3
    enhancement: [square]

name: Burning Slash
initiative: 29
level: 8
top:
  actions:
  - group:
    - attack: 3
      sub:
      - wound
    - hex: xt_st_et
  xp: 1
bottom:
  actions:
  - custom: "%fh-mode%"
  - move: 1
    enhancement: [circle]
  - divider
  - wound: ''
    sub:
    - target: "all"
    - range: 1

name: Heavy metal
initiative: 76
level: 9
top:
  actions:
  - summon:
      name: Sledge Driver
      stats: [9, 2, 4, -]
      special:
      - shield: 1
      enhancement: [heal, move, attack]
  - custom: "%prism-mode%"
  - custom: ":"
  - custom: "During ordering of initiative each round, increase your initiative value by 15."
  - custom: "+"
  - custom: "Add +3 %attack% to your first attack each turn."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "All adjacent allies and enemies suffer %damage%2."
  - shield: 2
  duration: round

name: Disassemble
initiative: 20
level: 9
top:
  actions:
  - attack: 2
    enhancement: [square]
  - custom: "%fh-mode%"
  - attack: 2
    enhancement: [square]
  - custom: "%fh-mode%"
  - attack: 3
bottom:
  actions:
  - custom: "Kill all of your summons from actions with lost icons. For each summon killed, perform:"
  - multi:
    - brittle: ''
    - custom: ","
    - bane: ''
      sub:
      - target: "1 normal or elite enemy"
      - range: 4
