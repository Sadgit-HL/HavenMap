# Blinkblade (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Blurry Jab
initiative: 20
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 1, "valueType": "add", "small": true}, {"type": "condition", "value": "wound", "small": true}, {"type": "card", "value": "experience:1", "small": true}]}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}, {"type": "condition", "value": "muddle", "small": true}]}]}
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2, "valueType": "add", "small": true}]}
    - move: 3
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.32.1%", "small": true}]}

name: Twin Strike
initiative: 24
level: 1
top:
  actions:
  - multi:
    - attack: 2
      enhancement: [square]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "move", "value": 2}, {"type": "card", "value": "experience:1", "small": true}]}]}
  - multi:
    - attack: 3
      enhancement: [diamond]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}]}
bottom:
  actions:
  - multi:
    - move: 3
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 2, "valueType": "subtract", "small": true}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.33.1%", "small": true}, {"type": "concatenation", "value": "", "subActions": [{"type": "element", "value": "air"}, {"type": "card", "value": "round", "small": true}]}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "heal", "value": 2, "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}, {"type": "element", "value": "earth"}]}

name: Sap Speed
initiative: 45
level: 1
top:
  actions:
  - group:
    - attack: 2
    - hex: et_st
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 1, "valueType": "add", "small": true}, {"type": "custom", "value": "%game.custom.advantage%", "small": true}, {"type": "card", "value": "experience:1", "small": true}]}], "noDivider": true}
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "target", "value": 2, "valueType": "add", "small": true}]}
    - immobilize: ''
      sub:
      - range: 1
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.34.1%", "small": true}]}

name: Kinetic Transfer
initiative: 36
level: 1
top:
  actions:
  - multi:
    - move: 2
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "push", "value": 3}]}
    - attack: 2
      enhancement: [diamond]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "range", "value": 1, "valueType": "add", "small": true}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "element", "value": "fire"}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "element", "value": "ice"}]}
bottom:
  actions:
  - multi:
    - move: 4
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.35.1%", "small": true}]}
  - group:
    - custom: "-1 %fh-hourglass%:"
    - push: 3
      sub:
      - target: "all"
      - range: 1

name: Overdrive
initiative: 60
level: 1
top:
  actions:
  - custom: "Gain %shield%1 while %blinkblade-1%."
  - custom: "Add %jump% to all your move abilities while %blinkblade-0%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - multi:
    - muddle: ''
      sub:
      - target: "all"
      - range: 2
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "range", "value": 1, "valueType": "add", "small": true}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.36.3%", "small": true}, {"type": "card", "value": "round"}]}

name: Power Leak
initiative: 17
level: 1
top:
  actions:
  - attack: 4
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.37.1%", "small": true}], "noDivider": true}
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "muddle", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 4, "valueType": "add", "small": true}]}
    - move: 3
      enhancement: [circle]
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "heal", "value": 2, "subActions": [{"type": "specialTarget", "value": "all", "small": true}, {"type": "range", "value": 1, "small": true}]}]}
  xp: 1
  lost: t

name: Hit and Run
initiative: 41
level: 1
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [circle]
      sub:
      - immobilize
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "move", "value": 2}, {"type": "card", "value": "experience:1", "small": true}]}]}
bottom:
  actions:
  - custom: "On your next five attack actions while %blinkblade-0%, perform %move%3 at the end of the action."
  - tokens: [0, 0, 1, 0, 1]
  lost: t
  duration: persistent

name: Drive Recharge
initiative: 69
level: 1
top:
  actions:
  - custom: "Gain 2 %fh-hourglass%."
  - multi:
    - ward: ''
    - custom: ","
    - bless: ''
    - custom: ","
    - target: "self"
  lost: t
bottom:
  actions:
  - multi:
    - heal: 2
      sub:
      - self
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "regenerate"}]}

name: Cascading Reaction
initiative: 19
level: 1
top:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "condition", "value": "wound"}, {"type": "card", "value": "experience:1", "small": true}]}]}
    - attack: 3
      enhancement: [circle]
  - multi:
    - move: 3
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "condition", "value": "wound"}, {"type": "card", "value": "experience:1", "small": true}]}]}
    - attack: 3
  lost: t
bottom:
  actions:
  - multi:
    - move: 4
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.40.1%", "small": true}, {"type": "card", "value": "round"}]}

name: Temporal Displacement
initiative: 44
level: 1
top:
  actions:
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2}]}
  - loot: 1
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "range", "value": 2, "valueType": "add", "small": true}]}
    - attack: 3
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}]}

name: Experimental Adjustment
initiative: 12
level: X
top:
  actions:
  - mandatory:
    - damage: 2
      sub:
      - self
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.42.1%", "small": true}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "condition", "value": "immobilize"}, {"type": "condition", "value": "muddle"}]}, {"type": "concatenation", "value": ",", "subActions": [{"type": "specialTarget", "value": "all", "small": true}, {"type": "range", "value": 2, "small": true}]}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "condition", "value": "invisible", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
bottom:
  actions:
  - multi:
    - move: 2
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 2, "valueType": "add", "small": true}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "loot", "value": 1}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "immobilize", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}

name: Sand in the Hourglass
initiative: 52
level: X
top:
  actions:
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "condition", "value": "wound", "subActions": [{"type": "range", "value": 1, "small": true}]}]}
  - custom: "All enemies that have %wound% suffer %damage%2."
  - optional:
    - consume: [light]
    - multi:
      - dark
    noLine: true
  - optional:
    - consume: [dark]
    - multi:
      - light
    noLine: true
bottom:
  actions:
  - heal: 2
    enhancement: [circle]
    sub:
    - target: "all"
    - range: 1
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "box", "value": "", "subActions": [{"type": "concatenation", "value": "", "subActions": [{"type": "custom", "value": "-1 %data.action.custom.fh-hourglass%:", "small": true}, {"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.43.2%", "small": true}]}]}]}

name: Borrowed Time
initiative: 2
level: X
top:
  actions:
  - custom: "On your next six actions while %blinkblade-1%, ignore all %blinkblade-1% effects and perform %immobilize% %range%3 at the end of the action."
  - tokens: [0, 1, 0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.44.2%", "small": true}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.44.3%", "small": true}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": "X"}, {"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.44.4%", "small": true}]}
  duration: round

name: Systems Reboot
initiative: 57
level: 2
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "%recover% one of your lost cards."
  lost: t
bottom:
  actions:
  - custom: "This action may be performed while you have %stun%. Remove all negative conditions you have."
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2, "valueType": "add", "small": true}]}
    - move: 2
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "boxFhSubActions", "subActions": [{"type": "grid", "subActions": [{"type": "custom", "value": "-1 %data.action.custom.fh-hourglass%: ", "small": true}, {"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.45.3%", "small": true}]}]}]}

name: Reckless Augmentation
initiative: 10
level: 2
top:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 2, "valueType": "add", "small": true}, {"type": "pierce", "value": 1, "small": true}]}]}
    - attack: 3
      enhancement: [diamond]
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "damage", "value": 1, "small": true, "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}, {"type": "card", "value": "experience:1", "small": true}]}]}
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "damage", "value": 1, "small": true, "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}, {"type": "card", "value": "experience:1", "small": true}]}]}
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "condition", "value": "ward", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}

name: Make It Count
initiative: 51
level: 3
top:
  actions:
  - heal: 1
    enhancement: [circle]
    sub:
    - target: 3
    - range: 3
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "heal", "value": 2, "valueType": "add", "small": true}, {"type": "target", "value": 1, "valueType": "subtract", "small": true}, {"type": "range", "value": 1, "valueType": "subtract", "small": true}, {"type": "card", "value": "experience:1", "small": true}]}], "noDivider": true}
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "bless", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
bottom:
  actions:
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 1}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "condition", "value": "wound"}]}
    - attack: 2
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "muddle"}]}

name: Double Time
initiative: 22
level: 3
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}]}
  - attack: 2
    enhancement: [diamond]
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "move", "value": 2}, {"type": "card", "value": "experience:1", "small": true}]}]}
bottom:
  actions:
  - custom: "On your next three turns while %blinkblade-0%, trigger all %blinkblade-0% effects twice."
  - tokens: [0, 0, 0]
  lost: t
  duration: persistent

name: Precision Timing
initiative: 15
level: 4
top:
  actions:
  - custom: "Add +1 %attack% to all your attacks while %blinkblade-1%."
  - custom: "Add +1 %move% to all your move abilities while %blinkblade-0%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 2}, {"type": "card", "value": "experience:1", "small": true}]}]}
  - multi:
    - move: 2
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}

name: Potential Energy
initiative: 32
level: 4
top:
  actions:
  - attack: "X+2"
    enhancement: [diamond]
  - custom: "where X is the number of %fh-hourglass% you have."
  xp: 1
bottom:
  actions:
  - move: "X+2"
    enhancement: [circle]
  - custom: "where X is the number of %fh-hourglass% you have."

name: Breakneck Speed
initiative: 3
level: 5
top:
  actions:
  - custom: "On the start of the next four rounds during which you are not performing a long rest, suffer %damage%2 and play three cards instead of two, using one card as initiative. At least one top and one bottom action must still be performed."
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 5
    enhancement: [circle]
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "damage", "value": 2, "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}

name: Flashing Flurry
initiative: 40
level: 5
top:
  actions:
  - attack: 3
  - optional:
    - consume: [wild]
    - multi:
      - attack: 1
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "target", "value": 1, "valueType": "add", "small": true}, {"type": "range", "value": 2, "valueType": "add", "small": true}, {"type": "card", "value": "experience:1", "small": true}]}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 1, "valueType": "subtract", "small": true}, {"type": "area", "value": "(0,1,active)|(1,0,target)|(1,1,target)"}]}]}
bottom:
  actions:
  - stun: ''
    enhancement: [diamond]
    sub:
    - target: "all"
    - range: 1
  - custom: "Gain 1 %fh-hourglass% for each enemy targeted."
  xp: 1
  lost: t

name: Stab Them All
initiative: 4
level: 6
top:
  actions:
  - attack: 2
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2}]}
  - attack: 2
    enhancement: [circle]
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2}]}
  - attack: 1
    enhancement: [diamond]
  xp: 1
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 3}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "ward", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
  - custom: "Whenever an enemy ends its teleport or move ability adjacent to you, after their ability, perform:"
  - attack: 2
    sub:
    - target: "that enemy"
  duration: round

name: The Knife's Edge
initiative: 65
level: 6
top:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "specialTarget", "value": "enemiesAdjacent", "small": true}]}
    - attack: 3
      sub:
      - wound
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.54.1%", "small": true}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "damage", "value": 1, "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
bottom:
  actions:
  - heal: 4
    enhancement: [square]
    sub:
    - self
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2}]}

name: Phasing Blades
initiative: 63
level: 7
top:
  actions:
  - custom: "Add %pierce%3 to all your attacks."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - multi:
    - move: 4
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  - custom: "If you are adjacent to three or more enemies, gain 1 %fh-hourglass%."

name: Rushed to the End
initiative: 32
level: 7
top:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "concatenation", "value": ",", "subActions": [{"type": "attack", "value": 1, "valueType": "add", "small": true}, {"type": "card", "value": "experience:1", "small": true}]}]}
    - attack: 4
      enhancement: [diamond]
  - group:
    - custom: "-1 %fh-hourglass%:"
    - multi:
      - attack: 3
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "Grant one ally within %range%2:"
  - multi:
    - move: 4
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 2, "valueType": "add", "small": true}]}
  - multi:
    - move: 4
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 2, "valueType": "subtract", "small": true}]}

name: Quantum Uncertainty
initiative: 35
level: 8
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.57.1%", "small": true}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.57.2%", "small": true}]}
bottom:
  actions:
  - multi:
    - move: 3
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 1, "valueType": "subtract", "small": true}]}
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "condition", "value": "invisible", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "condition", "value": "strengthen", "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}

name: Fastest Alive
initiative: 1
level: 8
top:
  actions:
  - attack: 2
    sub:
    - target: 3
    - muddle
  # raw: {"type": "identity", "value": 0, "subActions": [{"type": "custom", "value": "%data.custom.fh.blinkblade.abilities.58.1%", "small": true}], "noDivider": true}
  xp: 1
bottom:
  actions:
  - multi:
    # raw: {"type": "identity", "value": 0, "subActions": [{"type": "move", "value": 2, "valueType": "add", "small": true}]}
    - move: 6
      enhancement: [circle]
    # raw: {"type": "identity", "value": 1, "subActions": [{"type": "move", "value": 2, "valueType": "subtract", "small": true}]}

name: Reverse the Flow
initiative: 58
level: 9
top:
  actions:
  - custom: "You may perform any move abilities as attack abilities of equal value this round."
  - custom: "Play a card from your discard pile to perform the bottom action of the card."
  xp: 1
  duration: round
bottom:
  actions:
  - custom: "%teleport% to a starting hex."
  - heal: 10
    sub:
    - self
  - custom: "%recover% up to two of your lost cards."
  lost: t

name: Fractured Timeline
initiative: 55
level: 9
top:
  actions:
  - custom: "Spawn a monster with a blue base in an adjacent empty hex that is identical (except standee number) to a normal adjacent enemy, including its current hit point value and conditions. This monster is an ally to you and an enemy to all other monsters. It uses your attack modifier deck."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - teleport: 7
    enhancement: [circle]
  # raw: {"type": "identity", "value": 1, "subActions": [{"type": "damage", "value": 2, "small": true, "subActions": [{"type": "specialTarget", "value": "self", "small": true}]}]}
