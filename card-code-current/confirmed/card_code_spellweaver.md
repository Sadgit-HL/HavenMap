# Spellweaver (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Reviving Ether
initiative: 80
level: 1
top:
  actions:
  - custom: "%recover% all cards in your lost pile."
  - mandatory:
    - wild
  lost: t
  remove: t
bottom:
  actions:
  - move: 4
    enhancement: [square]
    sub:
    - jump

name: Fire Orbs
initiative: 69
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: 3
      enhancement: [square]
    - range: 3
  - mandatory:
    - fire
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [square]

name: Arcane Bolt
initiative: 70
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
    - multi:
      - attack: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - pierce: 3
      - custom: ","
      - custom: "%xp1%"
  xp: 1
  lost: t

name: Flame Strike
initiative: 26
level: 1
top:
  actions:
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - divider
  - loot: 1
bottom:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - wound: ''
      - custom: ","
      - custom: "%xp1%"

name: Icy Blast
initiative: 20
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [square]
      sub:
      - range: 3
    - hex: ett_ttt_ett
  - optional:
    - consume: [ice]
    - muddle: ''
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [square]

name: Aid from the Ether
initiative: 36
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 3
  - optional:
    - consume: [wild]
    - multi:
      - heal: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "When you next perform an action with %lost% this round, %wild%."
  duration: round

name: Frost Strike
initiative: 78
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [ice]
    - stun: ''
    - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - optional:
    - consume: [fire]
    - multi:
      - custom: "Gain advantage on all your attacks this round, %xp1%."
      - custom: "%round%"
    noLine: true

name: Emberfrost
initiative: 7
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
    - pierce: 1
      enhancement: [square]
  - mandatory:
    - fire
bottom:
  actions:
  - multi:
    - custom: "Grant one ally within %range%3 %enhancement-square% :"
    - shield: 1
  - mandatory:
    - ice
  duration: round

name: Flameswell
initiative: 83
level: X
top:
  actions:
  - custom: "On your next four single-target ranged attack abilities, add +2 %attack% to the attack."
  - tokens: [0, 1, 0, 1]
  - mandatory:
    - fire
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [ice]
    - multi:
      - ward: ''
      - custom: ","
      - custom: "%xp1%"

name: Ice Armor
initiative: 25
level: X
top:
  actions:
  - custom: "Place a character token on one ally within %range%3. On the next three sources of 2 or more %damage% they would suffer, negate the %damage%."
  - tokens: [1, 0, 1]
  - mandatory:
    - ice
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "On the next tree sources of 2 or more %damage% you would suffer, negate the %damage%."
  - tokens: [1, 0, 1]
  - mandatory:
    - ice
  lost: t
  duration: persistent

name: Impaling Eruption
initiative: 91
level: X
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [diamond]
      sub:
      - immobilize
    - hex: eetx_sttttx_eeext
  - mandatory:
    - earth
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [square]

name: Freezing Nova
initiative: 22
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: "the 4 enemies closest to you within 5 hexes"
    - immobilize
  - mandatory:
    - ice
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [square]

name: Etheric Echo
initiative: 50
level: 2
top:
  actions:
  - custom: "Play one Level 1 card from your lost pile other than Reviving Ether to perform an action with %lost% of the card."
  - mandatory:
    - wild
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "When you next perform an action with %lost% this round, gain %ward%."
  duration: round

name: Heatwave
initiative: 12
level: 3
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
    - hex: etx_ttx_stt
  - mandatory:
    - fire
  xp: 1
  lost: t
bottom:
  actions:
  - multi:
    - strengthen: ''
      enhancement: [diamondPlus]
      sub:
      - target: "1 ally"
      - range: 3
        enhancement: [square]
    - custom: "The target add +2 %attack% to their next attack this round."
  - mandatory:
    - fire
  duration: round

name: Arctic Shards
initiative: 24
level: 3
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
    - muddle
  - mandatory:
    - ice
bottom:
  actions:
  - heal: 10
    enhancement: [diamondPlus]
    sub:
    - range: 3
  - mandatory:
    - light
  xp: 1
  lost: t

name: Dancing Gales
initiative: 33
level: 4
top:
  actions:
  - optional:
    - consume: [fire]
    - strengthen: ''
      sub:
      - self
    noLine: true
  - attack: 3
    enhancement: [square]
    sub:
    - range: 3
  - optional:
    - consume: [ice]
    - attack: 2
      sub:
      - range: 3
      - muddle
    noLine: true
  xp: 1
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - divider
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - mandatory:
    - air
  xp: 1
  lost: t

name: Cold Fire
initiative: 67
level: 4
top:
  actions:
  - multi:
    - attack: 1
      sub:
      - range: 3
    - optional:
      - consume: [fire]
      - custom: "+2 %attack%"
    - hex: etx_tt
  - optional:
    - consume: [ice]
    - immobilize: ''
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [wild]
    - multi:
      - custom: "Add +1 %attack% to all your attacks this round, %xp1%."
      - custom: "%round%"
    noLine: true

name: Warm Up
initiative: 60
level: 5
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - custom: "On the next attack ability you perform from an action with %lost%, add +1 %attack% to all your attacks."
  - tokens: [0]
  - mandatory:
    - fire
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - loot: 2
  - mandatory:
    - wild
  lost: t

name: Cool Down
initiative: 30
level: 5
top:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
  - optional:
    - consume: [wild]
    - custom: "%xp1%"
    - custom: "+1 %heal%"
    - custom: "+1 %range%"
bottom:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
    - pierce: 1
      enhancement: [square]
  - mandatory:
    - ice

name: Elemental Rays
initiative: 15
level: 6
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - range: 3
  - optional:
    - consume: [wild]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
    - custom: "+1 %range%"
bottom:
  actions:
  - multi:
    - stun: ''
    - custom: ","
    - curse: ''
      enhancement: [diamond]
      sub:
      - target: 3
        enhancement: [square]
      - range: 3
  - mandatory:
    - dark
  xp: 1
  lost: t

name: Searing Glacier
initiative: 90
level: 6
top:
  actions:
  - multi:
    - attack: 5
      enhancement: [diamond]
      sub:
      - range: 3
    - optional:
      - consume: [fire]
      - pierce: 3
      - custom: "%xp1%"
    - hex: t_t_et_et_eet
  - mandatory:
    - ice
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "When you next perform an action with %lost% this round, %recover% one card from your discard pile."
  duration: round

name: Spell Mastery
initiative: 71
level: 7
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - range: 4
      enhancement: [square]
  - custom: "You may play one card from your discard pile to perform an action with %lost% of the card (the card is moved to your lost pile)."
  - mandatory:
    - wild
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Chromatic Explosion
initiative: 10
level: 7
top:
  actions:
  - multi:
    - attack: 4
      sub:
      - range: 3
      - poison
      - muddle
    - hex: tt_tt_ex
  - heal: 4
    sub:
    - target: "all allies in the red hexes of the attack ability"
    - strengthen
    - bless
  - mandatory:
    - consume: [fire/ice/air/earth/light/dark]
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "Choose an ally within %range%3. That ally gains %shield%3 for the next attack targeting them this round."
  - optional:
    - consume: [fire]
    - custom: "The attacker suffers %damage%3, %xp1%."
    noLine: true
  - optional:
    - consume: [ice]
    - shield: 3
    - custom: "%xp1%"
    noLine: true

name: Frostflare Orbs
initiative: 46
level: 8
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - target: 3
      enhancement: [square]
    - range: 4
  - optional:
    - consume: [ice]
    - stun: ''
    - custom: "%xp1%"
  - mandatory:
    - fire
  xp: 1
  lost: t
bottom:
  actions:
  - multi:
    - attack: 1
      sub:
      - range: 3
    - optional:
      - consume: [wild]
      - custom: "%xp1%"
      - custom: "+1 %attack%"
    - hex: etx_tt

name: Twin Beams
initiative: 19
level: 8
top:
  actions:
  - group:
    - attack: 1
      enhancement: [square]
    - hex: stt
  - optional:
    - consume: [fire]
    - wound: ''
    - custom: "+1 %attack%"
  - group:
    - attack: 1
      enhancement: [diamond]
    - hex: stt
  - optional:
    - consume: [ice]
    - push: 2
    - muddle: ''
    - custom: "+1 %attack%"
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - multi:
    - custom: "When you next perform an action with %lost% this round, after the action perform:"
    - attack: 3
      sub:
      - range: 3
  duration: round

name: Freezing Vortex
initiative: 41
level: 9
top:
  actions:
  - group:
    - attack: 5
      enhancement: [square]
      sub:
      - range: 3
    - hex: ett_ttt_ett
  - optional:
    - custom: "After the attack ability, kill each target whose hit point value is 2 or less and create one 1-hex obstacle tile in the featureless hex they occupied."
  - mandatory:
    - ice
  xp: 1
  lost: t
bottom:
  actions:
  - multi:
    - custom: "Designate a hex within %range%4."
    - pull: 3
      sub:
      - target: "all enemies within %range%4 of the designated hex"
    - custom: "Pull toward the designated hex."
  - mandatory:
    - ice

name: Inferno
initiative: 96
level: 9
top:
  actions:
  - attack: 2
    sub:
    - target: "all enemies within 2 hexes"
    - pierce: 2
  - mandatory:
    - custom: "All allies within %range%2 suffer %damage%2."
  - mandatory:
    - fire
bottom:
  actions:
  - custom: "All allies and enemies in the same room as you suffer %damage%4."
  - mandatory:
    - fire
  xp: 1
  lost: t
