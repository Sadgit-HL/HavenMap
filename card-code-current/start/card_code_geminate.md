# Geminate (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Icebound Quills
initiative: 14
level: 1
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - pierce: 1
  - optional:
    - consume: [ice]
    - multi:
      - attack: 1
      - custom: ","
      - pierce: 1
      - custom: ","
      - custom: "%xp1%"
  xp: 1
  lost: t
bottom:
  actions:
  - shield: 1
  - divider
  - retaliate: 1
    enhancement: [square]
  duration: round

name: Draining Pincers
initiative: 72
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: sttt
  - optional:
    - consume: [light]
    - multi:
      - custom: "%advantage%"
      - custom: ","
      - custom: "%xp1%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [square]
    sub:
    - jump
  - mandatory:
    - custom: "%fh-switch-range%"

name: Hornet Stingers
initiative: 23
level: 1
top:
  actions:
  - group:
    - attack: 1
      sub:
      - pierce: 3
      - poison
    - hex: ttt_st_et
  - mandatory:
    - poison: ''
      sub:
      - target: "all allies in the red hexes of the attack ability"
  - mandatory:
    - custom: "%fh-switch-range%"
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "All attacks targeting you this round gain disadvantage."
  duration: round

name: Changeling's Boon
initiative: 40
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
bottom:
  actions:
  - bless: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "At the end of each of your turns, you may %wild% to %fire%/%light%."
  - mandatory:
    - custom: "%fh-switch-range%"
  xp: 1
  lost: t
  duration: persistent

name: Flailing Tendrils
initiative: 12
level: 1
top:
  actions:
  - group:
    - attack: 1
      sub:
      - muddle
    - hex: eeet_ext_ttsx_ext_eeet
  - optional:
    - consume: [light]
    - multi:
      - attack: 1
  - mandatory:
    - muddle: ''
      sub:
      - target: "all allies in the red hexes of the attack ability"
bottom:
  actions:
  - wound: ''
    sub:
    - target: "all"
    - range: 2
  - mandatory:
    - wound: ''
      sub:
      - target: "all allies"
      - range: 2
  - mandatory:
    - fire
  xp: 1
  lost: t

name: Drag Down
initiative: 34
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [square]
      sub:
      - immobilize
    - hex: tt_et_es
  - mandatory:
    - custom: "%fh-switch-range%"
bottom:
  actions:
  - move: 4
    enhancement: [square]
    sub:
    - jump
  - divider
  - disarm: ''
    sub:
    - target: 2
    - range: 1
  xp: 1
  lost: t

name: Hornbeetle Carapace
initiative: 20
level: 1
top:
  actions:
  - custom: "On your next four attacks, add +1 %attack% if you are in %geminate-0% or +2 %attack% if you are in %geminate-1%."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 1
    enhancement: [square]
  - divider
  - shield: 1
  - optional:
    - consume: [ice]
    - multi:
      - shield: 1
      - custom: ","
      - custom: "%xp1%"
  duration: round

name: Reckless Jab
initiative: 38
level: X
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - group:
      - custom: "If you do not have %wound%, gain %wound% to add %disarm%."
      - custom: "If you do not have %poison%, gain %poison% to add +2 %attack%."
bottom:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - ice/light
  xp: 1
  lost: t

name: Feeding Frenzy
initiative: 62
level: X
top:
  actions:
  - custom: "Whenever you kill one or more enemies during your turn, you may switch forms or ignore any switch form icons at the end of this turn."
  - mandatory:
    - light
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "All adjacent allies and enemies suffer %damage%1."
  - loot: 1

name: Selfless Offering
initiative: 27
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3
  - optional:
    - consume: [fire]
    - multi:
      - regenerate: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - mandatory:
    - custom: "%fh-switch-melee%"

name: Into My Embrace
initiative: 36
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pull: 2
  - optional:
    - custom: "only %range%3/4"
  - mandatory:
    - custom: "%fh-switch-melee%"
bottom:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - self
    - regenerate
    - fire/light
  xp: 1
  lost: t

name: Firefly Swarm
initiative: 76
level: 1
top:
  actions:
  - group:
    - attack: 3
    - hex: tt_t
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "%xp1%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4

name: Scarab flight
initiative: 30
level: 1
top:
  actions:
  - group:
    - attack: 2
      sub:
      - push: 1
        enhancement: [square]
    - optional:
      - custom: "only %range%3/4"
    - hex: xttt
bottom:
  actions:
  - custom: "On the next four sources of %damage% from attacks targeting you, gain %shield%1 if you are in %geminate-1% or %shield%2 if you are in %geminate-0%."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent

name: Mind Spike
initiative: 18
level: 1
top:
  actions:
  - immobilize: ''
    sub:
    - target: 3
  - optional:
    - custom: "only %range%4/5"
  - custom: "All targets of the immobilize ability suffer %damage%1."
  - optional:
    - consume: [light]
    - multi:
      - damage: 1
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  xp: 1
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [square]
  - optional:
    - custom: "only %range%3/4"
  - mandatory:
    - custom: "%fh-switch-melee%"

name: Harvest the Essence
initiative: 60
level: 1
top:
  actions:
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "At the end of each of your turns, you may %wild% to %ice%/%light%."
  - mandatory:
    - custom: "%fh-switch-melee%"
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
  - divider
  - heal: 2
    enhancement: [square]
    sub:
    - self

name: Hail of Thorns
initiative: 88
level: 1
top:
  actions:
  - attack: 2
    sub:
    - target: "all"
    - range: 2
    - muddle
  - mandatory:
    - muddle: ''
      sub:
      - target: "all allies"
      - range: 2
  - mandatory:
    - ice
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - wound: ''
        sub:
        - range: 1
    noLine: true

name: Smoldering Hatred
initiative: 32
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - group:
      - group:
        - multi:
          - muddle: ''
            sub:
            - self
          - custom: ":"
        - attack: 2
        - multi:
          - curse: ''
            sub:
            - self
          - custom: ":"
        - hex: tt
  - optional:
    - custom: "only %range%4/5"
bottom:
  actions:
  - immobilize: ''
    sub:
    - target: 2
    - range: 1
  - divider
  - move: 4
    enhancement: [square]
    sub:
    - jump
  xp: 1
  lost: t

name: Reshape the Guise
initiative: 38
level: X
top:
  actions:
  - loot: 1
  - divider
  - regenerate: ''
    sub:
    - self
bottom:
  actions:
  - custom: "During your short rests, you may choose which discarded card to lose instead of losing a discarded card at random and you may switch forms."
  - mandatory:
    - light
  xp: 1
  lost: t
  duration: persistent

name: Venomous Barbs
initiative: 17
level: 2
top:
  actions:
  - retaliate: 2
    sub:
    - range: 2
    - group:
      - multi:
        - disarm: ''
          sub:
          - self
        - custom: ":"
      - multi:
        - retaliate: 1
        - custom: ","
        - range: 1
  - custom: "Gain %xp1% whenever you retaliate this round."
  lost: t
  duration: round
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - poison

name: Locust Host
initiative: 23
level: 2
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
      sub:
      - group:
        - group:
          - multi:
            - curse: ''
              sub:
              - self
            - custom: ":"
          - hex: tttt_tttt
    - hex: tt_ttt
  - optional:
    - custom: "only %range%2/3"
  xp: 2
  lost: t
  duration: round
bottom:
  actions:
  - move: 1
    enhancement: [square, square]
  - divider
  - push: 2
    sub:
    - target: "all"
  - optional:
    - custom: "only %range%2"

name: Mandible Storm
initiative: 30
level: 3
top:
  actions:
  - group:
    - attack: 3
      sub:
      - immobilize
    - hex: tt_s_tt
  - mandatory:
    - muddle: ''
      sub:
      - self
  - mandatory:
    - custom: "%fh-switch-range%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - shield: 2
    sub:
    - ice/light
  xp: 1
  lost: t
  duration: round

name: Dragonfly Surge
initiative: 50
level: 3
top:
  actions:
  - attack: 6
    enhancement: [diamond]
    sub:
    - fire/light
  - optional:
    - custom: "only %range%4/5"
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "Gain advantage on and add %pierce%2 to all your attacks this round."
  - mandatory:
    - poison: ''
      sub:
      - self
  - mandatory:
    - custom: "%fh-switch-melee%"
  duration: round

name: Thresh and Flail
initiative: 43
level: 4
top:
  actions:
  - attack: 4
  - divider
  - attack: 3
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
  - mandatory:
    - light
  xp: 1
  lost: t
bottom:
  actions:
  - pull: 3
    enhancement: [square]
    sub:
    - range: 4
      enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - target: 1
      - custom: ","
      - consume: [fire/ice]
      - custom: ","
      - custom: "%xp1%"

name: Luminous Descent
initiative: 67
level: 4
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [light]
    - multi:
      - target: 1
      - custom: ","
      - consume: [fire/ice]
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 5
    enhancement: [circle]
    sub:
    - jump
  - divider
  - stun: ''
    sub:
    - target: 2
    - range: 1
  - mandatory:
    - light
  xp: 1
  lost: t

name: Formless Grace
initiative: 75
level: 5
top:
  actions:
  - heal: 2
    sub:
    - target: "all allies"
    - range: 1
  - custom: "Once during each of your turns, you may suffer %damage%2 to %fire%/%light%."
  - mandatory:
    - custom: "%fh-switch-range%"
  xp: 1
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [square]
    sub:
    - jump
  - optional:
    - consume: [ice]
    - multi:
      - ward: ''
        sub:
        - self
    noLine: true

name: Chitinous Horde
initiative: 15
level: 5
top:
  actions:
  - custom: "Grant one ally within %range%3:"
  - shield: 2
    enhancement: [square]
  - optional:
    - consume: [fire]
    - multi:
      - strengthen: ''
        sub:
        - self
    noLine: true
  duration: round
bottom:
  actions:
  - custom: "All adjacent enemies suffer %damage%2."
  - custom: "Once during each of your turns, you may have one adjacent ally suffer %damage%2 to %ice%/%light%."
  - mandatory:
    - custom: "%fh-switch-melee%"
  xp: 1
  lost: t
  duration: persistent

name: Corrosive Acids
initiative: 28
level: 6
top:
  actions:
  - group:
    - attack: 2
      enhancement: [square]
      sub:
      - group:
        - multi:
          - brittle: ''
            sub:
            - self
          - custom: ":"
        - brittle: ''
        - multi:
          - impair: ''
            sub:
            - self
          - custom: ":"
        - poison: ''
    - hex: xt_st_et
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "All figures gain -2 %shield% this round while adjacent to you."
  - mandatory:
    - custom: "%fh-switch-range%"
  duration: round

name: Hirudotherapy
initiative: 92
level: 6
top:
  actions:
  - custom: "Up to two enemies at exactly %range%2/3 suffer %damage%2."
  - heal: X
    sub:
    - self
  - custom: "where X is equal to the %damage% enemies suffered with the damage ability."
  - mandatory:
    - custom: "%fh-switch-melee%"
bottom:
  actions:
  - move: 3
  - divider
  - attack: 2
    enhancement: [square]
    sub:
    - group:
      - multi:
        - immobilize: ''
          sub:
          - self
        - custom: ":"
      - immobilize: ''
      - multi:
        - curse: ''
          sub:
          - self
        - custom: ":"
      - target: 1
  - optional:
    - custom: "only %range%3/4"

name: Two Pronged Entrapment
initiative: 21
level: 7
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - divider
  - shield: 1
  - optional:
    - consume: [wild]
    - multi:
      - mandatory:
        - consume: [ice/light]
    noLine: true
  duration: round
bottom:
  actions:
  - group:
    - push: 2
      sub:
      - brittle
      - group:
        - optional:
          - consume: [ice]
          - multi:
            - immobilize: ''
            - custom: ","
            - custom: "%xp1%"
          noLine: true
        - optional:
          - consume: [light]
          - multi:
            - disarm: ''
          noLine: true
    - hex: stt_t_et
  xp: 1
  lost: t

name: Alluring Pheromones
initiative: 49
level: 7
top:
  actions:
  - group:
    - attack: 3
      sub:
      - pull: 2
    - hex: et_xt_et
  - optional:
    - custom: "only %range%4/5"
  - optional:
    - consume: [wild]
    - multi:
      - mandatory:
        - consume: [fire/light]
    noLine: true
bottom:
  actions:
  - group:
    - heal: 2
      sub:
      - regenerate
      - bless
      - group:
        - optional:
          - consume: [fire]
          - multi:
            - strengthen: ''
          noLine: true
        - optional:
          - consume: [light]
          - multi:
            - bless: ''
            - custom: ","
            - custom: "%xp1%"
          noLine: true
    - hex: et_tt_stt
  xp: 1
  lost: t

name: Accelerated Metabolism
initiative: 85
level: 8
top:
  actions:
  - consume: [fire/ice]
  - attack: 3
    sub:
    - target: 2
    - pierce: 3
bottom:
  actions:
  - move: 6
    enhancement: [circle, circle]
  - custom: "At the start of your next turn, play one %geminate-0% card from your hand and immediately perform the top or bottom action of the card, then lose this card."
  - mandatory:
    - custom: "%fh-switch-range%"
  lost: t
  duration: persistent

name: Oscillating Entity
initiative: 55
level: 8
top:
  actions:
  - attack: 4
    enhancement: [diamond, diamond]
  - optional:
    - custom: "only %range%2/3"
  - custom: "At the start of your next turn, play one %geminate-1% card from your hand and immediately perform the top or bottom action of the card, then lose this card."
  - mandatory:
    - custom: "%fh-switch-melee%"
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - divider
  - bless: ''
    sub:
    - self
    - fire/ice

name: Harbinger of Ruin
initiative: 11
level: 9
top:
  actions:
  - custom: "On the next four sources of %damage% from melee attacks targeting you, gain %ward%, then the attacking enemy suffers %damage%5."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - attack: 4
    sub:
    - immobilize
  - divider
  - retaliate: 2
    enhancement: [square]
  duration: round

name: Voice of Salvation
initiative: 39
level: 9
top:
  actions:
  - custom: "All allies within %range%3 add +2 %attack% to all their attacks and all enemies within %range%3 add -1 %attack% to all their attacks this round."
  duration: round
bottom:
  actions:
  - custom: "On the next four cards allies would lose to negate %damage%, they instead do not lose a card."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent
