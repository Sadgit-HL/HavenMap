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
    - custom: "%blinkblade-1% +1 %attack%, %wound%, %xp1%"
    - custom: "%blinkblade-0% -1 %attack%, %muddle%"
bottom:
  actions:
  - multi:
    - custom: "%blinkblade-1% +2 %move%"
    - move: 3
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %move%"
  - custom: "%blinkblade-0% One adjacent enemy suffers %damage%1."

name: Twin Strike
initiative: 24
level: 1
top:
  actions:
  - multi:
    - attack: 2
      enhancement: [square]
    - custom: "%blinkblade-0% -1 %attack%"
  - custom: "%blinkblade-1% %move% 2, %xp1%"
  - multi:
    - attack: 3
      enhancement: [diamond]
    - custom: "%blinkblade-0% -1 %attack%"
bottom:
  actions:
  - multi:
    - move: 3
      enhancement: [circle]
    - custom: "%blinkblade-0% -2 %move%"
  - multi:
    - custom: "%blinkblade-1% Add %pierce% 2 to all your attacks this round. %air% %round%"
    - custom: "%blinkblade-0% %heal% 2 self, %earth%"

name: Sap Speed
initiative: 45
level: 1
top:
  actions:
  - group:
    - attack: 2
    - hex: et_st
  - custom: "%blinkblade-1% +1 %attack%, advantage, %xp1%"
bottom:
  actions:
  - multi:
    - custom: "%blinkblade-1% +2 %target%"
    - immobilize: ''
      sub:
      - range: 1
  - custom: "%blinkblade-0% Ignore the %blinkblade-0% effects of your other actions this turn."

name: Kinetic Transfer
initiative: 36
level: 1
top:
  actions:
  - multi:
    - move: 2
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %move%"
  - multi:
    - custom: "%blinkblade-1% %push% 3"
    - attack: 2
      enhancement: [diamond]
    - custom: "%blinkblade-0% +1 %range%"
  - multi:
    - custom: "%blinkblade-1% %fire%"
    - custom: "%blinkblade-0% %ice%"
bottom:
  actions:
  - multi:
    - move: 4
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %move%"
  - custom: "%blinkblade-1% All adjacent allies and enemies suffer %damage%1."
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
    - custom: "%blinkblade-0% +1 %range%"
  - custom: "%blinkblade-1% All your attacks targeting enemies that have %muddle% are unaffected by %retaliate% this round. %round%"

name: Power Leak
initiative: 17
level: 1
top:
  actions:
  - attack: 4
  - custom: "%blinkblade-1% If you do not have %poison%, gain %poison% to add +1 %target%, %xp1%."
  - custom: "%blinkblade-0% %muddle% self"
bottom:
  actions:
  - multi:
    - custom: "%blinkblade-1% +4 %move%"
    - move: 3
      enhancement: [circle]
  - custom: "%blinkblade-0% %heal% 2 all, %range% 1"
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
    - custom: "%blinkblade-0% -1 %attack%"
  - custom: "%blinkblade-1% %move% 2, %xp1%"
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
    sub:
    - self
  lost: t
bottom:
  actions:
  - multi:
    - heal: 2
      sub:
      - self
    - custom: "%blinkblade-0% %regenerate%"

name: Cascading Reaction
initiative: 19
level: 1
top:
  actions:
  - multi:
    - custom: "%blinkblade-1% %wound%, %xp1%"
    - attack: 3
      enhancement: [circle]
  - multi:
    - move: 3
    - custom: "%blinkblade-0% -1 %move%"
  - multi:
    - custom: "%blinkblade-1% %wound%, %xp1%"
    - attack: 3
  lost: t
bottom:
  actions:
  - multi:
    - move: 4
    - custom: "%blinkblade-0% -1 %move%"
  - custom: "%blinkblade-1% All allies add +1 %move% to their move abilities that move from a hex adjacent to you to a hex not adjacent to you this round. %round%"

name: Temporal Displacement
initiative: 44
level: 1
top:
  actions:
  - custom: "%blinkblade-1% %move% 2"
  - loot: 1
bottom:
  actions:
  - multi:
    - custom: "%blinkblade-1% +2 %range%"
    - attack: 3
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %attack%"

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
    - custom: "%blinkblade-1% All enemies within %range%2 suffer %damage%1."
    - custom: "%blinkblade-0% %immobilize%, %muddle%, all, %range% 2"
  - custom: "%blinkblade-1% %invisible% self"
bottom:
  actions:
  - multi:
    - move: 2
    - custom: "%blinkblade-0% +2 %move%"
  - multi:
    - custom: "%blinkblade-1% %loot% 1"
    - custom: "%blinkblade-0% %immobilize% self"

name: Sand in the Hourglass
initiative: 52
level: X
top:
  actions:
  - custom: "%blinkblade-1% %wound% %range% 1"
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
  - custom: "%blinkblade-1% -1 %fh-hourglass%: At the end of your turn, play one card from your hand to immediately perform the top or bottom action of the card."

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
    - custom: "%blinkblade-1% All allies add -1 %move% to their move abilities this round."
    - custom: "%blinkblade-0% All allies add +1 %move% to their move abilities this round."
  - custom: "%blinkblade-1% %move% X where X is twice the number of your allies."
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
  remove: t
bottom:
  actions:
  - custom: "This action may be performed while you have %stun%. Remove all negative conditions you have."
  - multi:
    - custom: "%blinkblade-1% +2 %move%"
    - move: 2
  - custom: "%blinkblade-0% -1 %fh-hourglass%: Trigger the %blinkblade-1% effects instead of the %blinkblade-0% effects of your other actions this turn."

name: Reckless Augmentation
initiative: 10
level: 2
top:
  actions:
  - multi:
    - custom: "%blinkblade-1% +2 %attack%, %pierce% 1"
    - attack: 3
      enhancement: [diamond]
  - custom: "%blinkblade-1% %damage% 1 self, %xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "%blinkblade-1% %damage% 1 self, %xp1%"
  - custom: "%blinkblade-1% %ward% self"

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
  - custom: "%blinkblade-1% +2 %heal%, -1 %target%, -1 %range%, %xp1%"
  - custom: "%blinkblade-0% %bless% self"
bottom:
  actions:
  - custom: "%blinkblade-1% %move% 2"
  - multi:
    - custom: "%blinkblade-1% %wound%"
    - attack: 2
      enhancement: [circle]
    - custom: "%blinkblade-0% %muddle%"

name: Double Time
initiative: 22
level: 3
top:
  actions:
  - multi:
    - attack: 3
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %attack%"
  - attack: 2
    enhancement: [diamond]
  - custom: "%blinkblade-1% %move% 2, %xp1%"
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
  - custom: "%blinkblade-1% %attack% 2, %xp1%"
  - multi:
    - move: 2
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %move%"

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
  - custom: "%blinkblade-0% %damage% 2 self"

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
    - custom: "%blinkblade-1% +1 %target%, +2 %range%, %xp1%"
    - custom: "%blinkblade-0% -1 %attack%"
    - hex: et_st
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
  - custom: "%blinkblade-1% %move% 2"
  - attack: 2
    enhancement: [circle]
  - custom: "%blinkblade-1% %move% 2"
  - attack: 1
    enhancement: [diamond]
  xp: 1
bottom:
  actions:
  - multi:
    - custom: "%blinkblade-1% %move% 3"
    - custom: "%blinkblade-0% %ward% self"
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
    - custom: "%blinkblade-1% %target% all adjacent enemies"
    - attack: 3
      sub:
      - wound
  - multi:
    - custom: "%blinkblade-1% Suffer %damage%1 for each enemy targeted with the attack ability."
    - custom: "%blinkblade-0% %damage% 1 self"
bottom:
  actions:
  - heal: 4
    enhancement: [square]
    sub:
    - self
  - custom: "%blinkblade-1% %move% 2"

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
    - custom: "%blinkblade-0% -1 %move%"
  - custom: "If you are adjacent to three or more enemies, gain 1 %fh-hourglass%."

name: Rushed to the End
initiative: 32
level: 7
top:
  actions:
  - multi:
    - custom: "%blinkblade-1% +1 %attack%, %xp1%"
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
    - custom: "%blinkblade-0% +2 %move%"
  - multi:
    - move: 4
      enhancement: [circle]
    - custom: "%blinkblade-0% -2 %move%"

name: Quantum Uncertainty
initiative: 35
level: 8
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - multi:
    - custom: "%blinkblade-1% Treat any %amd-null% attack modifier cards drawn as %amd-double% instead."
    - custom: "%blinkblade-0% Treat any %amd-double% attack modifier cards drawn as %amd-null% instead."
bottom:
  actions:
  - multi:
    - move: 3
      enhancement: [circle]
    - custom: "%blinkblade-0% -1 %move%"
  - multi:
    - custom: "%blinkblade-1% %invisible% self"
    - custom: "%blinkblade-0% %strengthen% self"

name: Fastest Alive
initiative: 1
level: 8
top:
  actions:
  - attack: 2
    sub:
    - target: 3
    - muddle
  - custom: "%blinkblade-1% Add +2 %attack% to all attacks targeting enemies that have %immobilize%, %stun%, or whose revealed ability card contains no move abilities."
  xp: 1
bottom:
  actions:
  - multi:
    - custom: "%blinkblade-1% +2 %move%"
    - move: 6
      enhancement: [circle]
    - custom: "%blinkblade-0% -2 %move%"

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
  remove: t

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
  - custom: "%blinkblade-0% %damage% 2 self"
