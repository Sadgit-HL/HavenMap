# Silent Knife (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Single Out
initiative: 86
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to none of its allies."
bottom:
  actions:
  - custom: "On your next four attacks targeting enemies adjacent to none of their allies, add +3 %attack%"
  - tokens: [0, 1, 0, 1]
  lost: t
  duration: persistent

name: Flanking Strike
initiative: 4
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to any of your allies."
bottom:
  actions:
  - move: 5

name: Swift Bow
initiative: 36
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "%loot% each hex you entered with the move ability."

name: Quick Hands
initiative: 23
level: 1
top:
  actions:
  - loot: 1
  - divider
  - move: 2
    enhancement: [circle]
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
  xp: 1

name: Sinister Opportunity
initiative: 93
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +1 %attack% if the target is adjacent to any of your allies, add +1 %attack% if the target is adjacent to none of its allies, and gain advantage and %xp1% if both are true."
bottom:
  actions:
  - move: 5

name: Venom Shiv
initiative: 8
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 1
    - poison
bottom:
  actions:
  - custom: "Add %pierce%2 to all your ranged attacks this round."
  duration: round

name: Throwing Knives
initiative: 10
level: 1
top:
  actions:
  - attack: 2
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  xp: 1
bottom:
  actions:
  - pull: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]

name: Practiced Reflexes
initiative: 64
level: 1
top:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "You may choose not to spring traps in hexes you enter with this movement."
  - custom: "Destroy one trap in a hex you entered with the move ability to gain %xp1%."

name: Special Mixture
initiative: 33
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - self
  - mandatory:
    - dark
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - poison: ''
    enhancement: [diamond]
    sub:
    - range: 1

name: Backstab
initiative: 6
level: X
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to any of your allies."
  lost: t
bottom:
  actions:
  - move: 6

name: Smoke Bomb
initiative: 12
level: X
top:
  actions:
  - invisible: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "On your next attack while you have %invisible%, double the value of the attack."
  - tokens: [2]
  - mandatory:
    - dark
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
  - custom: "Control one adjacent enemy:"
  - move: 1
  - custom: "This movement must end in a hex adjacent to the Silent Knife."

name: Trickster's Reversal
initiative: 9
level: X
top:
  actions:
  - custom: "On your next melee attack targeting an enemy that has %shield%, add +(X+2)%attack%, where X is the %shield% value of the target."
  - tokens: [1]
  duration: persistent
bottom:
  actions:
  - custom: "Negate the next %damage% you would suffer this round."
  duration: round

name: Open Wound
initiative: 11
level: 2
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - custom: "Add %wound% and gain %xp1% if the target is adjacent to any of your allies."
bottom:
  actions:
  - move: 6

name: Stick to the Shadows
initiative: 26
level: 2
top:
  actions:
  - custom: "On your next tree attacks, add +1 %attack%, %poison%."
  - tokens: [0, 1, 0]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "If you are adjacent to no enemies, gain %invisible%. At the end of the round, lose %invisible%."
  duration: round

name: Hidden Daggers
initiative: 39
level: 3
top:
  actions:
  - attack: 2
    sub:
    - range: 3
  - divider
  - attack: 2
    sub:
    - range: 3
  - divider
  - attack: 2
    sub:
    - range: 3
  - divider
  - attack: 2
    sub:
    - range: 3
  - divider
  - attack: 2
    sub:
    - range: 3
  xp: 2
  lost: t
bottom:
  actions:
  - attack: 1
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  - custom: "Add +1 %attack% on each target that is adjacent to none of its allies."

name: Flintlock
initiative: 51
level: 3
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
    - muddle
  - custom: "You may place one of your money tokens in the hex occupied by the target to add +2 %attack%, %pierce%2."
  - mandatory:
    - fire
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - loot: 1
  - custom: "Create one %poison%, %immobilize% trap in the empty hex of one looted money token."

name: Flurry of Blades
initiative: 16
level: 4
top:
  actions:
  - attack: 2
    sub:
    - target: 3
      enhancement: [square]
    - range: 3
      enhancement: [square]
  xp: 1
bottom:
  actions:
  - move: 7
    enhancement: [circle]

name: Gruesome Advantage
initiative: 90
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to any of your allies or is adjacent to none of its allies."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "When you next perform a melee attack targeting an enemy that has %poison% this round, after the attack ability, perform:"
  - attack: 2
    sub:
    - range: 3
    - poison
  duration: round

name: Duelist's Advance
initiative: 7
level: 5
top:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 4
    enhancement: [diamond]
  - divider
  - move: 2
    enhancement: [circle]
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - pull: 1
    enhancement: [square]
    sub:
    - range: 2
      enhancement: [square]

name: Serrated Arrow
initiative: 95
level: 5
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
    - wound
bottom:
  actions:
  - custom: "On your next attack targeting an enemy that is both adjacent to any of your allies and none of its allies, double the value of the attack."
  - tokens: [2]
  lost: t
  duration: persistent

name: Dance of Daggers
initiative: 3
level: 6
top:
  actions:
  - custom: "Negate the %damage% and added effects of all attacks targeting you this round."
  - custom: "Immediately after each attack ability targeting you this round, gain %xp1% and perform:"
  - attack: 2
    sub:
    - target: "the enemy that attacked you"
  lost: t
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Gain advantage on all your attacks this round."
  duration: round

name: Cull the Weak
initiative: 62
level: 6
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - custom: "Add +1 %attack% and gain advantage, %xp1% if the target is a normal monster."
bottom:
  actions:
  - attack: 2
    sub:
    - target: "2 enemies whose current hit point value is 2 or less, %range%2"
  - divider
  - loot: 2

name: Stiletto Storm
initiative: 80
level: 7
top:
  actions:
  - attack: 2
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  - custom: "If all the targets of the attack ability were adjacent to none of their allies, perform:"
  - attack: 2
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [square]

name: Spring the Trap
initiative: 13
level: 7
top:
  actions:
  - custom: "This action my be performed while you have %stun%."
  - custom: "Remove all negative conditions you have."
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - custom: "Designate one adjacent trap."
  - move: 5
    enhancement: [circle]
    sub:
    - jump
  - custom: "Relocate the designated trap to an adjacent featureless hex. If that hex is occupied by an enemy, spring the trap on that enemy and gain %xp1%."

name: Visage of the Inevitable
initiative: 88
level: 8
top:
  actions:
  - attack: 4
    enhancement: [square]
  - custom: "Add %disarm% and gain %invisible%, %xp1% if the target is both adjacent to any of your allies and none of its allies."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - poison: ''
    sub:
    - target: "all"
    - range: 1

name: Crippling Poison
initiative: 4
level: 8
top:
  actions:
  - custom: "Add %poison% to all your attacks. Add +1 %attack% to all your attacks targeting enemies that have %poison%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Add %immobilize% to all your attacks targeting enemies adjacent to none of their allies this round."
  duration: round

name: Hired Help
initiative: 2
level: 9
top:
  actions:
  - custom: "You may lose one of your money tokens to place a character token on an adjacent normal enemy. For the remainder of the scenario, that enemy is an ally to you and an enemy to all other monsters. You may replace its base with a blue base to more easily identify it. When that enemy dies, it drops an additional money token."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - disarm: ''
    sub:
    - range: 1

name: Watch It Burn
initiative: 98
level: 9
top:
  actions:
  - attack: 2
    sub:
    - target: "all adjacent enemies"
    - wound
    - immobilize
  - custom: "If you attacked at least three enemies with the attack ability, gain %xp1% and perform:"
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - mandatory:
    - fire
bottom:
  actions:
  - custom: "During you turn, you may play this card from your hand to perform this action (in addition to the two cards you have played for the round)."
  - attack: 5
    enhancement: [diamond]
