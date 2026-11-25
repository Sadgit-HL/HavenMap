# Nightshroud (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Spirit of the Night
initiative: 35
level: 1
top:
  actions:
  - group:
    - curse: ''
    - hex: eeb_sttx
  - mandatory:
    - dark
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - curse: ''
    sub:
    - range: 1
      enhancement: [square]

name: Slice Through
initiative: 15
level: 1
top:
  actions:
  - custom: "Whenever you kill an enemy, you may discard this card to place one %tear% in the hex they occupied."
  - attack: 4
  - mandatory:
    - dark
  duration: persistent
bottom:
  actions:
  - optional:
    - consume: [dark]
    - teleport: 4
    - custom: "%xp1%"
    noLine: true
  - custom: "%teleport% to the hex occupied by one ally within eight hexes of you and simultaneously %teleport% that ally to the hex occupied by you."

name: Eyes of the Night
initiative: 93
level: 1
top:
  actions:
  - custom: "Reveal the top card of each monster within %range%2's ability card deck."
  - custom: "Place one %tear% in a hex within %range%2."
  - mandatory:
    - dark
bottom:
  actions:
  - move: 5
    enhancement: [square]

name: Armor of the Night
initiative: 10
level: 1
top:
  actions:
  - custom: "Place your character token on an ally within %range%3 and one %tear% in a hex adjacent to them. On the next source of %damage% that ally would suffer, negate the %damage%."
  - tokens: [0]
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - pull: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]

name: Swallowed by Fear
initiative: 44
level: 1
top:
  actions:
  - attack: 4
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - custom: "After the attack, if the target has 2 or fewer hit points, kill the target."
  xp: 1
bottom:
  actions:
  - custom: "Place one %tear% in an adjacent hex."
  - move: 5
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
  - mandatory:
    - dark
  xp: 2
  lost: t

name: Dancing Shadows
initiative: 5
level: 1
top:
  actions:
  - custom: "Enemies within %range%2 add -1 %attack% to all their attacks this round."
  - custom: "Place one %tear% in a hex within %range%2."
  - mandatory:
    - dark
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - optional:
    - consume: [dark]
    - curse: ''
      sub:
      - range: 1
    - custom: "%xp1%"
    noLine: true

name: Silent Force
initiative: 8
level: 1
top:
  actions:
  - group:
    - stun: ''
    - hex: stb
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 1

name: Black Knives
initiative: 77
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: 2
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
  - custom: "Add +1 %attack% to the second attack if the first attack kills an enemy."
  xp: 1
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 1
      enhancement: [square]
  - divider
  - loot: 1

name: Enervating Wound
initiative: 14
level: 1
top:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 2
    - wound
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Whenever an enemy dies within %range%2 (of you), you may discard this card to grant whoever killed that enemy:"
  - heal: 2
    sub:
    - self
  duration: persistent

name: Nightfall
initiative: 28
level: X
top:
  actions:
  - push: 3
    enhancement: [square]
    sub:
    - range: 1
    - immobilize
  - custom: "If the target is pushed into one or more hexes with a %tear%, they gain %muddle%, %curse%, and suffer hazardous terrain damage."
  - mandatory:
    - dark
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - optional:
    - consume: [light]
    - heal: 2
      sub:
      - self
    - dark
    noLine: true

name: Empowering Void
initiative: 11
level: X
top:
  actions:
  - custom: "You and all allies add +1 %attack%, %pierce%1 to all attacks targeting enemies within %range%1 (of you) this round."
  - custom: "Place one %tear% in an adjacent hex."
  - mandatory:
    - dark
  duration: round
bottom:
  actions:
  - move: 5
    enhancement: [square]

name: Marked for Death
initiative: 84
level: X
top:
  actions:
  - custom: "Place your character token on an enemy within %range%3 and one %tear% in a hex adjacent to them. On your next attack targeting that enemy, add +2 %attack% and gain advantage."
  - tokens: [0]
  duration: persistent
bottom:
  actions:
  - teleport: 6
    enhancement: [square]
  - custom: "This %teleport% must end in a hex containing a %tear%."
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - self

name: Unseen Dread
initiative: 12
level: 2
top:
  actions:
  - custom: "Place one %tear% in a hex within %range%2."
  - custom: "Whenever an enemy enters a hex within %range%2 (of you) this round, that enemy gains %wound%."
  - optional:
    - consume: [dark]
    - custom: "At the end of this round, all enemies that have %wound% suffer %damage%1, %xp1%."
    noLine: true
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - dark

name: Shroud in Shade
initiative: 6
level: 2
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - custom: "Negate the next source of %damage% you would suffer this round."
  - mandatory:
    - dark
  xp: 1
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - custom: "All attacks targeting you this round gain disadvantage."
  - optional:
    - consume: [dark]
    - custom: "All attacks targeting allies within %range%2 (of you) this round gain disadvantage, %xp1%."
    noLine: true
  duration: round

name: Terror Blade
initiative: 32
level: 3
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - push: 3
      enhancement: [square]
    - muddle
  - custom: "If the target is adjacent to none of its allies after the push, it suffers %damage%2."
  xp: 1
bottom:
  actions:
  - custom: "Place two %tear% in hexes within %range%3 that are not adjacent to each other and %teleport% to one those hexes."
  - custom: "On your next two attacks, double the value of the attack."
  - multi:
    - mandatory:
      - dark
    - tokens: [1]
    - tokens: [1]
  lost: t
  duration: persistent

name: Prepare for the Kill
initiative: 85
level: 3
top:
  actions:
  - custom: "Whenever you remove a %tear% you may discard this card to gain %strengthen% and have all adjacent enemies suffer %damage%2."
  - mandatory:
    - dark
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 2
    enhancement: [diamond]

name: Lurking Ruin
initiative: 4
level: 4
top:
  actions:
  - group:
    - poison: ''
    - hex: bttx_tttx_sttx
  - custom: "You and all allies gain advantage on all attacks targeting enemies that have %poison% this round."
  duration: round
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Whenever you or an ally attack an enemy within %range%2 (of you) this round, after the attack ability the attacker may perform:"
  - heal: 1
    sub:
    - self
  duration: round

name: Cursed Blades
initiative: 18
level: 4
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - curse
  - optional:
    - consume: [dark]
    - attack: 2
      sub:
      - curse
    - custom: "%xp1%"
    noLine: true
  xp: 1
bottom:
  actions:
  - move: 6
    enhancement: [circle]

name: Into the Night
initiative: 17
level: 5
top:
  actions:
  - group:
    - stun: ''
    - hex: et_sb_et
  - mandatory:
    - invisible: ''
      sub:
      - target: "all targets of the stun ability"
  - mandatory:
    - dark
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - custom: "Grant one adjacent ally:"
  - teleport: 8
    enhancement: [square]
  - custom: "This %teleport% must and in a hex containing a %tear%."

name: Seeping Tendrils
initiative: 23
level: 5
top:
  actions:
  - immobilize: ''
    sub:
    - range: 1
      enhancement: [square]
  - custom: "If you have %invisible%, place one %tear% in a hex adjacent to the target. If you do not have %invisible%, the target suffers %damage%4."
  - mandatory:
    - dark
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - push: 2
    enhancement: [square]
    sub:
    - target: "all"
    - range: 1
  - optional:
    - consume: [dark]
    - custom: "The targets suffer %damage%1, %xp1%."

name: Claws of the Night
initiative: 56
level: 6
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - custom: "At the end of your next turn, if you do not have %invisible%, you may perform:"
  - attack: 5
    enhancement: [diamond]
  - tokens: [1]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "When you next kill an enemy this round, place one %tear% in the hex they occupied."
  duration: round

name: Dark Cloud
initiative: 2
level: 6
top:
  actions:
  - muddle: ''
    sub:
    - target: "all"
    - range: 3
  - custom: "Reveal the top card of each monster within %range%3's ability card deck."
  - custom: "Place one %tear% in a hex within %range%3."
  - mandatory:
    - dark
bottom:
  actions:
  - safeguard: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - divider
  - move: 4
    enhancement: [circle]
  - divider
  - curse: ''
    sub:
    - range: 1
      enhancement: [square]
  - mandatory:
    - dark

name: Quiet Frenzy
initiative: 26
level: 7
top:
  actions:
  - group:
    - curse: ''
    - hex: ett_st
  - optional:
    - consume: [dark]
    - hex: et_ttt_est
    - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - loot: 1

name: Messenger of Death
initiative: 63
level: 7
top:
  actions:
  - move: 4
    enhancement: [square]
    sub:
    - jump
  - divider
  - attack: 2
    sub:
    - target: "all enemies moved through"
  - optional:
    - consume: [dark]
    - attack: 1
    - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - optional:
    - consume: [dark]
    - attack: 4
    - custom: "%xp1%"
    noLine: true

name: Prey on the Weak
initiative: 38
level: 8
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+3 %attack%"
  - custom: "If the target of the attack ability's current hit point value is half (rounded down) their maximum or less, gain %xp1% and perform:"
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: "that enemy"
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - divider
  - attack: 5
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
  - mandatory:
    - dark
  xp: 2
  lost: t

name: Shadowstrike
initiative: 90
level: 8
top:
  actions:
  - group:
    - custom: "Enemies in the red hexes suffer %damage%2."
    - hex: etb_stx
  - optional:
    - consume: [dark]
    - custom: "Play a card from your hand to perform the top or bottom action of the card,"
    - custom: "%xp1%"
bottom:
  actions:
  - multi:
    - ward: ''
    - strengthen: ''
      sub:
      - self
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - custom: "This attack does not cause you to gain %invisible% at the end of the round, %xp1%."
    - custom: "%round%"
  - mandatory:
    - dark

name: Swallowed by Night
initiative: 73
level: 9
top:
  actions:
  - multi:
    - stun: ''
    - custom: ","
    - curse: ''
      sub:
      - range: 1
        enhancement: [square]
  - custom: "If you have %invisible%, place one %tear% in a hex adjacent to the target. If you do not have %invisible% and the target is a normal enemy occupying a hex containing a %tear%, you may remove the %tear% and gain %invisible% to kill the target and gain %xp1%."
bottom:
  actions:
  - custom: "During this an the next four rounds, you may perform attack abilities while you have %invisible%. When this card is moved from you active area to your lost pile, you become exhausted."
  - tokens: [1, 0, 1, 0, 1]
  lost: t
  duration: persistent

name: Voice of the Night
initiative: 19
level: 9
top:
  actions:
  - group:
    - custom: "Grant all allies in the red hexes:"
    - teleport: 3
    - hex: ebx_ttx_stb
  - mandatory:
    - dark
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - push: 3
    enhancement: [square]
    sub:
    - target: "1 ally or enemy"
    - range: 1
  - custom: "If the target enters a hex containing a %tear% you may remove the %tear% to have the target gain %invisible%."
