Metal Mosaic (Frosthaven), card code read from the card pictures with tools/card-extraction. A first draft, not checked against the cards. Pressure icons: gain_pressure (red up arrow), lose_pressure (blue down arrow), low_pressure (blue gauge), regular_pressure (green), high_pressure (yellow), over_pressure (red gauge). The red box with a gear star is self_dmg.
name: Ancient Drill
initiative: 90
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - pierce: 1
    # check: gauge rows; gauge icons unnamed
    - custom: "%over_pressure% +2 %attack%, +3 %pierce%, %xp1%, %damage%1, %lose_pressure%"
    - custom: "%high_pressure% +1 %attack%, +2 %pierce%, %xp1%, %lose_pressure%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "You may destroy one adjacent obstacle to %gain_pressure%."

name: Beam Axe
initiative: 29
level: 1
top:
  actions:
    - attack: 4
      enhancement: [square]
    - multi:
      - custom: "%over_pressure%"
      - hex: tt_st
      - custom: ", %xp1%, %damage%1, %lose_pressure% %lose_pressure%"
    - multi:
      - custom: "%high_pressure%"
      - hex: et_st
      - custom: ", %xp1%, %damage%1, %lose_pressure%"
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - custom: "%over_pressure% All adjacent enemies suffer %damage%1, %xp1%, %lose_pressure%"
    - custom: "%low_pressure% %heal% 1 %target% all allies, %range% 1, %xp1%, %gain_pressure%"

name: Memory Drive
initiative: 64
level: 1
top:
  actions:
    - custom: "%recover% up to one level 1 card from your discard pile."
    - custom: "%regular_pressure%"
      sub:
        - custom: "%ice%"
    # check: green row is a dashed box: consume ice, then +1 recover
    - optional:
        - consume: [ice]
        - custom: "+1 %recover%"
    - custom: "%low_pressure% +1 %recover%, %xp1%, %gain_pressure%"
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - custom: "Add +1 %move% for each pair of cards in your discard pile."

name: Power Core
initiative: 83
level: 1
top:
  actions:
    - attack: 4
      sub:
        - stun
    - custom: "%over_pressure% +1 %target%, %wound%, %xp1%, %damage%1, %lose_pressure%"
    - custom: "%high_pressure% +1 %attack%, %wound%, %xp1%, %lose_pressure%"
  xp: 1
  lost: t
bottom:
  actions:
    - heal: 3
      enhancement: [circle]
      sub:
        - self
    - custom: "%regular_pressure% +1 %heal%"
    - custom: "%low_pressure% +2 %heal%, %xp1%"
    - mandatory:
        - custom: "%gain_pressure%"

name: Pressure Build-Up
initiative: 20
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    - optional:
        - consume: [ice]
        - custom: "+2 %attack%, %xp1%"
    - mandatory:
        - custom: "%gain_pressure%"
bottom:
  actions:
    - custom: "%low_pressure% %shield% 1, %xp1%, %round%"
    - divider
    - move: 3
      enhancement: [circle]
    # check: dashed box hung by a T from the move: consume fire, then a banner with heat
    - optional:
        - consume: [fire]
        - custom: "%gain_pressure%"

name: Rocket Boots
initiative: 22
level: 1
top:
  actions:
    - attack: 3
      enhancement: [square]
      sub:
        - push: 2
    - mandatory:
        - fire
bottom:
  actions:
    - move: 3
      enhancement: [circle]
      sub:
        - jump
    - custom: "%over_pressure% +3 %move%, %xp1%, %damage%1, %lose_pressure%"
    - custom: "%high_pressure% +1 %move%"

name: Steam Armor
initiative: 17
level: 1
top:
  actions:
    - shield: 1
    - custom: "%over_pressure% +2 %shield%, %xp1%, %damage%1, %lose_pressure% %lose_pressure%"
    - custom: "%high_pressure% +1 %shield%, %xp1%, %lose_pressure%"
    - mandatory:
        - ice
  duration: round
bottom:
  actions:
    - move: 2
      enhancement: [square]
    - custom: "%regular_pressure% %gain_pressure%"
    - custom: "%low_pressure% %xp1%, %gain_pressure%"
    - mandatory:
        - fire

name: Steel Piston
initiative: 40
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - divider
    - custom: "Whenever you perform an attack ability, you may %lose_pressure% and discard this card to add +2 %attack% to one attack and gain %xp1%."
  duration: persistent
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "%over_pressure% %attack% 3, %xp1%, %damage%1, %lose_pressure% %lose_pressure%"
    - custom: "%high_pressure% %attack% 2, %xp1%, %lose_pressure%"

name: Super Heat Transfer
initiative: 25
level: 1
top:
  actions:
    - attack: 1
    - optional:
        - consume: [fire]
        - custom: "%wound%"
    # check: gauge icons are class icons: green gauge row, blue gauge row (names unknown)
    - custom: "%regular_pressure% : %gain_pressure%"
    - custom: "%low_pressure% : %xp1%, %gain_pressure%"
    - mandatory:
        - custom: "%gain_pressure%"
bottom:
  actions:
    - move: 2
    - custom: "%high_pressure% : -1 %move%, %gain_pressure%"
    - custom: "%regular_pressure% : -1 %move%, %lose_pressure%"
    - mandatory:
        - ice

name: Curious Gear
initiative: 12
level: X
top:
  actions:
    - custom: "Spring one trap within %range% 3, applying its effects to one enemy adjacent to it."
    - mandatory:
        - custom: "%gain_pressure%"
  xp: 1
bottom:
  actions:
    - custom: "Control one enemy within %range% 4:"
    - move: 1
    - custom: "%over_pressure% : +1 %move%, %lose_pressure%"

name: Processing
initiative: 95
level: X
top:
  actions:
    - custom: "At the start of the next round, discard this card to play three cards instead of two, using one as initiative. At least one top and one bottom action must still be performed."
    - custom: "%regular_pressure% : %gain_pressure%"
    - custom: "%low_pressure% : %xp1%, %gain_pressure%"
  duration: persistent
bottom:
  actions:
    - move: 1
    - divider
    - loot: 1

name: Recursion
initiative: 50
level: X
top:
  actions:
    - attack: 3
      enhancement: [square]
    - divider
    - custom: "On your next %gain_pressure%, %gain_pressure%%gain_pressure% instead."
    # check: dashed circle with a small red mark at its right edge is one token slot
    - tokens: [0]
  duration: persistent
bottom:
  actions:
    - move: 3
      enhancement: [square]
    - divider
    - custom: "On your next %lose_pressure%, %lose_pressure%%lose_pressure% instead."
    - tokens: [0]
  duration: persistent

name: Bronze Plating
initiative: 18
level: 2
top:
  actions:
    - shield: 1
    - divider
    - mandatory:
        - custom: "You cannot perform move abilities."
    - divider
    # check: the two gauge icons (blue, green) at the left of the row
    - custom: "%low_pressure%%regular_pressure% : %ward% , %xp1%, %gain_pressure%"
      sub:
        - self
  duration: persistent
bottom:
  actions:
    - custom: "Add +1 %attack% to all your melee attacks this round."
    - mandatory:
        - custom: "%gain_pressure%"
  duration: round

name: Release Valve
initiative: 30
level: 2
top:
  actions:
    - custom: "All adjacent enemies suffer %damage% 2."
    - custom: "%over_pressure% : +1 %damage%, %lose_pressure%"
    - custom: "%high_pressure% : %lose_pressure%"
    - mandatory:
        - custom: "%lose_pressure%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    # check: icon after heal 3 is a self pill, then xp 1 and cool down
    - custom: "%over_pressure% :"
    - heal: 3
      sub:
        - self
    - custom: "%xp1%, %lose_pressure%"

name: Electrical Discharge
initiative: 26
level: 3
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - stun
    - custom: "%over_pressure% : +3 %attack%, %xp1%, +2 %damage%, %lose_pressure%"
    - custom: "%high_pressure% : +1 %attack%, %lose_pressure%"
    - mandatory:
        - custom: "%lose_pressure%"
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - stun: ''
      sub:
        - range: 1
    - divider
    # check: three gauge icons (green, yellow, crossed red) before the stun and self pill
    - custom: "%regular_pressure%%high_pressure%%over_pressure% : %stun%"
      sub:
        - self
    - mandatory:
        - custom: "%lose_pressure%"

name: Stress Vents
initiative: 15
level: 3
top:
  actions:
    - custom: "Whenever you are attacked by an enemy within %range% 2, you may %lose_pressure% to cause the attacker to suffer %damage% 3 immediately after the attack."
    - custom: "Discard this card when you have %low_pressure%."
    - mandatory:
        - custom: "%gain_pressure%"
  duration: persistent
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - retaliate: 1
    - custom: "%over_pressure% : +2 %retaliate%, %xp1%, +1 %damage%, %lose_pressure%"
    - custom: "%high_pressure% : +1 %retaliate%, %lose_pressure%"
  duration: round

name: Energy Conversion
initiative: 23
level: 4
top:
  actions:
  - attack: 9
    enhancement:
    - diamond
  - optional:
    - group:
      - custom: "-1 %attack% : %gain_pressure% or %lose_pressure%"
    - group:
      - custom: "-1 %attack% : %gain_pressure% or %lose_pressure%"
    - group:
      - custom: "-1 %attack% : %gain_pressure% or %lose_pressure%"
  xp: 2
  lost: t
bottom:
  actions:
  - move: 1
    enhancement:
    - circle
  - optional:
    - consume:
      - fire
    - custom: "+2 %move%, %xp1%"
  - divider
  - custom: "Whenever you are attacked this round, %gain_pressure%."
  duration: round

name: Magnetic Field
initiative: 21
level: 4
top:
  actions:
  - attack: 3
    enhancement:
    - diamond
  - divider
  - loot: 1
  - divider
  # check: dashed box under a divider, so standalone
  - optional:
    - consume:
      - ice
    - heal: 2
      sub:
      - self
    noLine: true
  - divider
  - custom: "%low_pressure%"
  - heal: 3
    sub:
    - self
  - custom: "%xp1%, %gain_pressure%"
bottom:
  actions:
  - pull: 1
    sub:
    - custom: "%target% all, %range% 5"
  - divider
  - pull: 1
    sub:
    - custom: "%target% all, %range% 2"
  - divider
  - custom: "%over_pressure%"
  - shield: 1
  - custom: "%round%"

name: Heat Conduction
initiative: 11
level: 5
top:
  actions:
  - custom: "%over_pressure%"
  - retaliate: 3
  - custom: "%xp1%, %lose_pressure%"
  - divider
  - shield: 1
    enhancement:
    - square
  - custom: "%low_pressure%"
  - custom: "+2 %shield%, %xp1%, %gain_pressure%"
  - mandatory:
    - ice
  duration: round
bottom:
  actions:
  - custom: "Whenever an ally ends their move ability %lf% adjacent to you, you may %gain_pressure% to perform:"
  - heal: 2
    sub:
    - self
  - custom: "Discard this card when you have %over_pressure%."
  - mandatory:
    - custom: "%lose_pressure%"
  xp: 1
  duration: persistent

name: Radiation
initiative: 37
level: 5
top:
  actions:
  - attack: 5
    enhancement:
    - diamond
    sub:
    - poison
  - custom: "%high_pressure%"
  - custom: "-1 %attack%, %gain_pressure%"
  - custom: "%regular_pressure%"
  - custom: "-1 %attack%, %lose_pressure%"
bottom:
  actions:
  - move: 3
    enhancement:
    - circle
  - divider
  - custom: "On your next %self_dmg% X effect while adjacent to at least one enemy, one adjacent enemy suffers that %self_dmg% instead."
  - tokens: [0]
  duration: persistent

name: Scalding Blast
initiative: 45
level: 6
top:
  actions:
  - attack: 5
  - custom: "%over_pressure%"
  - custom: "+2 %target%, %xp1%, %self_dmg% 2, %lose_pressure% %lose_pressure%"
  - custom: "%high_pressure%"
  - custom: "+1 %target%, %xp1%, %self_dmg% 1, %lose_pressure%"
  - custom: "%regular_pressure%"
  - custom: "+1 %attack%"
bottom:
  actions:
  - attack: 3
    enhancement:
    - square
    sub:
    - pierce: 2
  - mandatory:
    - custom: "%gain_pressure%"
    - fire

name: Steam Core
initiative: 71
level: 6
top:
  actions:
  - heal: 5
    enhancement:
    - diamondPlus
    sub:
    - self
  - divider
  - custom: "%over_pressure%"
  - wound: ''
    sub:
    - custom: "%target% all, %range% 1"
  - custom: "%xp1%, %lose_pressure%"
  - custom: "%low_pressure%"
  - regenerate: ''
    sub:
    - custom: "%target% all allies, %range% 1"
  - custom: "%xp1%, %gain_pressure%"
  infuse: [fire/ice]
bottom:
  actions:
  - move: 3
    enhancement:
    - circle
  - divider
  - custom: "Whenever you perform a move ability, you may %gain_pressure% and discard this card to add +2 %move% and gain %xp1%."
  duration: persistent

name: Cryogenic Hibernation
initiative: 19
level: 7
top:
  actions:
  - shield: 2
  - divider
  - mandatory:
    - custom: "You cannot perform attack abilities."
  - divider
  - mandatory:
    - custom: "At the end of each of your turns, gain %brittle%."
  - divider
  - custom: "%low_pressure%"
  - heal: 4
    sub:
    - self
  - custom: "%xp1%, %gain_pressure%"
  duration: persistent
bottom:
  actions:
  - move: 2
  - custom: "%high_pressure%"
  - custom: "+1 %move%"
  - custom: "%regular_pressure%"
  - custom: "+2 %move%, %gain_pressure%"
  - divider
  - custom: "%low_pressure%"
  - optional:
    - consume:
      - ice
    - brittle: ''
      sub:
      - range: 1
  - custom: "%xp1%, %gain_pressure%"

name: Heated Drill
initiative: 80
level: 7
top:
  actions:
  - attack: 4
    enhancement:
    - diamond
  - optional:
    - consume:
      - fire
    - custom: "+2 %attack%, %xp1%"
  - custom: "%over_pressure%"
  - custom: "%pierce% 4, %wound%, %xp1%, %self_dmg% 1, %lose_pressure%"
  - custom: "%high_pressure%"
  - custom: "%pierce% 2, %xp1%"
bottom:
  actions:
  - custom: "%over_pressure%"
  - move: 3
  - divider
  - attack: 3
    enhancement:
    - diamond
    sub:
    - pierce: 1
  - custom: "Add +1 %pierce% for each pair of %lf% cards in your discard pile."

name: Curious Machinery
initiative: 11
level: 8
top:
  actions:
    - custom: "Control one enemy within %range%3:"
    - attack: 3
      sub:
        - stun
    - divider
    # check: red pressure effect row (gauge icon at left, red outline), icon names unknown
    - custom: "%over_pressure% %stun% %target% controlled enemy, %xp1%, %damage%2, %lose_pressure% %lose_pressure%"
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - custom: "Treat the next %damage% trap you spring during this movement as a %heal% trap instead, with a %heal% value equal to the trap's %damage% value."
    # check: yellow pressure effect row
    - custom: "%high_pressure% %ice%x : %xp1%, %lose_pressure% %lose_pressure%"
    # check: green pressure effect row
    - custom: "%regular_pressure% %fire%x : %xp1%, %gain_pressure% %gain_pressure%"

name: Piston Barrage
initiative: 33
level: 8
top:
  actions:
    - attack: 4
      enhancement: [circle]
    - divider
    # check: red pressure effect row holds two attack 3 lines separated by a thin line, with shared pills
    - custom: "%over_pressure% %attack%3, %attack%3, %xp1%, %damage%1, %lose_pressure%"
    # check: yellow pressure effect row
    - custom: "%high_pressure% %attack%3, %xp1%, %lose_pressure%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "All adjacent enemies suffer %damage%2."
    - divider
    - mandatory:
        - custom: Destroy all adjacent obstacles.
    - mandatory:
        - custom: "%gain_pressure%"

name: Polarity Shift
initiative: 79
level: 9
top:
  actions:
    - pull: 3
      sub:
        - target: all
        - range: 4
    - divider
    - optional:
        - consume: [fire]
        - custom: "All adjacent enemies suffer %damage%1."
        - custom: "! %ice%"
    - divider
    - optional:
        - consume: [ice]
        - custom: "All adjacent enemies suffer %damage%1."
        - custom: "! %fire%"
    - divider
    # check: the small square next to push may be an enhancement marker
    - push: 3
      enhancement: [square]
      sub:
        - target: all
        - range: 2
bottom:
  actions:
    - custom: "%over_pressure% %attack%5, %lose_pressure% %lose_pressure% %lose_pressure%"
    - custom: "%high_pressure% %move%5, %lose_pressure% %lose_pressure%"
    # check: last icon of this row looks like a card with a red bar and circular arrow (round bonus)
    - custom: "%regular_pressure% %shield%2, %gain_pressure% %gain_pressure% %round%"
    - custom: "%low_pressure% %heal%6 self, %gain_pressure% %gain_pressure% %gain_pressure%"

name: Unstable Core
initiative: 10
level: 9
top:
  actions:
    - custom: Play four cards from your lost pile and, for each card, perform either its top or bottom action, activating any one pressure effect on each action regardless of your current pressure.
    - divider
    - mandatory:
        - custom: You become exhausted.
  lost: t
  remove: t
bottom:
  actions:
    - custom: "Once per turn, when you perform an attack ability, you may %lose_pressure% to add +3 %attack% to one attack, or, when you perform a move ability, you may %gain_pressure% to add +3 %move%."
    - custom: "When you have %low_pressure% or %over_pressure% at the end of your turn, %damage%5 and discard this card."
  duration: persistent
