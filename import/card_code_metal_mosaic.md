Metal Mosaic (Frosthaven), card code read from the card pictures with tools/card-extraction. A first draft, not checked against the cards.
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
    - custom: "%?gauge icon, needle in red zone% +2 %attack%, +3 %pierce%, %xp1%, %damage%1, %classToken0%"
    - custom: "%?gauge icon, needle in yellow zone% +1 %attack%, +2 %pierce%, %xp1%, %classToken0%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "You may destroy one adjacent obstacle to %classToken1%."

name: Beam Axe
initiative: 29
level: 1
top:
  actions:
    - attack: 4
      enhancement: [square]
    # check: small hex areas inside the gauge rows (table says none): red row 4 hexes (3 red, 1 grey), yellow row 3 hexes (2 red, 1 grey)
    - custom: "%?gauge icon, needle in red zone% %?small hex area, 3 red hexes and 1 grey hex%, %xp1%, %damage%1, %classToken0% %classToken0%"
    - custom: "%?gauge icon, needle in yellow zone% %?small hex area, 2 red hexes and 1 grey hex%, %xp1%, %damage%1, %classToken0%"
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - custom: "%?gauge icon, needle in red zone% All adjacent enemies suffer %damage%1, %xp1%, %classToken0%"
    - custom: "%?gauge icon, needle in blue zone% %heal% 1 %target% all allies, %range% 1, %xp1%, %classToken1%"

name: Memory Drive
initiative: 64
level: 1
top:
  actions:
    - custom: "%recover% up to one level 1 card from your discard pile."
    - custom: "%?gauge icon, needle in green zone%"
      sub:
        - custom: "%ice%"
    # check: green row is a dashed box: consume ice, then +1 recover
    - optional:
        - consume: [ice]
        - custom: "+1 %recover%"
    - custom: "%?gauge icon, needle in blue zone% +1 %recover%, %xp1%, %classToken1%"
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
    - custom: "%?gauge icon, needle in red zone% +1 %target%, %wound%, %xp1%, %damage%1, %classToken0%"
    - custom: "%?gauge icon, needle in yellow zone% +1 %attack%, %wound%, %xp1%, %classToken0%"
  xp: 1
  lost: t
bottom:
  actions:
    - heal: 3
      enhancement: [circle]
      sub:
        - self
    - custom: "%?gauge icon, needle in green zone% +1 %heal%"
    - custom: "%?gauge icon, needle in blue zone% +2 %heal%, %xp1%"
    - mandatory:
        - custom: "%classToken1%"

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
        - custom: "%classToken1%"
bottom:
  actions:
    - custom: "%?gauge icon, needle in blue zone% %shield% 1, %xp1%, %round%"
    - divider
    - move: 3
      enhancement: [circle]
    # check: dashed box hung by a T from the move: consume fire, then a banner with heat
    - optional:
        - consume: [fire]
        - custom: "%classToken1%"

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
    - custom: "%?gauge icon, needle in red zone% +3 %move%, %xp1%, %damage%1, %classToken0%"
    - custom: "%?gauge icon, needle in yellow zone% +1 %move%"

name: Steam Armor
initiative: 17
level: 1
top:
  actions:
    - shield: 1
    - custom: "%?gauge icon, needle in red zone% +2 %shield%, %xp1%, %damage%1, %classToken0% %classToken0%"
    - custom: "%?gauge icon, needle in yellow zone% +1 %shield%, %xp1%, %classToken0%"
    - mandatory:
        - ice
  duration: round
bottom:
  actions:
    - move: 2
      enhancement: [square]
    - custom: "%?gauge icon, needle in green zone% %classToken1%"
    - custom: "%?gauge icon, needle in blue zone% %xp1%, %classToken1%"
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
    - custom: "Whenever you perform an attack ability, you may %classToken0% and discard this card to add +2 %attack% to one attack and gain %xp1%."
  duration: persistent
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "%?gauge icon, needle in red zone% %attack% 3, %xp1%, %damage%1, %classToken0% %classToken0%"
    - custom: "%?gauge icon, needle in yellow zone% %attack% 2, %xp1%, %classToken0%"

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
    - custom: "%?green gauge% : %?red flame with up arrow%"
    - custom: "%?blue gauge% : %xp1%, %?red flame with up arrow%"
    - mandatory:
        - custom: "%?red flame with up arrow%"
bottom:
  actions:
    - move: 2
    - custom: "%?yellow gauge% : -1 %move%, %?red flame with up arrow%"
    - custom: "%?green gauge% : -1 %move%, %?blue flame with down arrow%"
    - mandatory:
        - ice

name: Curious Gear
initiative: 12
level: X
top:
  actions:
    - custom: "Spring one trap within %range% 3, applying its effects to one enemy adjacent to it."
    - mandatory:
        - custom: "%?red flame with up arrow%"
  xp: 1
bottom:
  actions:
    - custom: "Control one enemy within %range% 4:"
    - move: 1
    - custom: "%?crossed red gauge% : +1 %move%, %?blue flame with down arrow%"

name: Processing
initiative: 95
level: X
top:
  actions:
    - custom: "At the start of the next round, discard this card to play three cards instead of two, using one as initiative. At least one top and one bottom action must still be performed."
    - custom: "%?green gauge% : %?red flame with up arrow%"
    - custom: "%?blue gauge% : %xp1%, %?red flame with up arrow%"
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
    - custom: "On your next %?red flame with up arrow%, %?red flame with up arrow%%?red flame with up arrow% instead."
    # check: dashed circle with a small red mark at its right edge is one token slot
    - tokens: [0]
  duration: persistent
bottom:
  actions:
    - move: 3
      enhancement: [square]
    - divider
    - custom: "On your next %?blue flame with down arrow%, %?blue flame with down arrow%%?blue flame with down arrow% instead."
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
    - custom: "%?blue gauge%%?green gauge% : %ward% , %xp1%, %?red flame with up arrow%"
      sub:
        - self
  duration: persistent
bottom:
  actions:
    - custom: "Add +1 %attack% to all your melee attacks this round."
    - mandatory:
        - custom: "%?red flame with up arrow%"
  duration: round

name: Release Valve
initiative: 30
level: 2
top:
  actions:
    - custom: "All adjacent enemies suffer %damage% 2."
    - custom: "%?crossed red gauge% : +1 %damage%, %?blue flame with down arrow%"
    - custom: "%?yellow gauge% : %?blue flame with down arrow%"
    - mandatory:
        - custom: "%?blue flame with down arrow%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    # check: icon after heal 3 is a self pill, then xp 1 and cool down
    - custom: "%?crossed red gauge% :"
    - heal: 3
      sub:
        - self
    - custom: "%xp1%, %?blue flame with down arrow%"

name: Electrical Discharge
initiative: 26
level: 3
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - stun
    - custom: "%?crossed red gauge% : +3 %attack%, %xp1%, +2 %damage%, %?blue flame with down arrow%"
    - custom: "%?yellow gauge% : +1 %attack%, %?blue flame with down arrow%"
    - mandatory:
        - custom: "%?blue flame with down arrow%"
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
    - custom: "%?green gauge%%?yellow gauge%%?crossed red gauge% : %stun%"
      sub:
        - self
    - mandatory:
        - custom: "%?blue flame with down arrow%"

name: Stress Vents
initiative: 15
level: 3
top:
  actions:
    - custom: "Whenever you are attacked by an enemy within %range% 2, you may %?blue flame with down arrow% to cause the attacker to suffer %damage% 3 immediately after the attack."
    - custom: "Discard this card when you have %?blue gauge%."
    - mandatory:
        - custom: "%?red flame with up arrow%"
  duration: persistent
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - retaliate: 1
    - custom: "%?crossed red gauge% : +2 %retaliate%, %xp1%, +1 %damage%, %?blue flame with down arrow%"
    - custom: "%?yellow gauge% : +1 %retaliate%, %?blue flame with down arrow%"
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
      - custom: "-1 %attack% : %classToken0% or %classToken1%"
    - group:
      - custom: "-1 %attack% : %classToken0% or %classToken1%"
    - group:
      - custom: "-1 %attack% : %classToken0% or %classToken1%"
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
  - custom: "Whenever you are attacked this round, %classToken0%."
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
  # check: banner row with the gauge icon (blue)
  - custom: "%classToken2%"
  - heal: 3
    sub:
    - self
  - custom: "%xp1%, %classToken0%"
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
  # check: banner row with the gauge icon (red)
  - custom: "%classToken2%"
  - shield: 1
  - custom: "%round%"

name: Heat Conduction
initiative: 11
level: 5
top:
  actions:
  # check: banner row with the gauge icon (red)
  - custom: "%classToken2%"
  - retaliate: 3
  - custom: "%xp1%, %classToken1%"
  - divider
  - shield: 1
    enhancement:
    - square
  # check: banner row with the gauge icon (blue)
  - custom: "%classToken2%"
  - custom: "+2 %shield%, %xp1%, %classToken0%"
  - mandatory:
    - ice
  duration: round
bottom:
  actions:
  - custom: "Whenever an ally ends their move ability %lf% adjacent to you, you may %classToken0% to perform:"
  - heal: 2
    sub:
    - self
  - custom: "Discard this card when you have %classToken2%."
  - mandatory:
    - custom: "%classToken1%"
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
  # check: banner row with the gauge icon (yellow)
  - custom: "%classToken2%"
  - custom: "-1 %attack%, %classToken0%"
  # check: banner row with the gauge icon (green)
  - custom: "%classToken2%"
  - custom: "-1 %attack%, %classToken1%"
bottom:
  actions:
  - move: 3
    enhancement:
    - circle
  - divider
  - custom: "On your next %?red box with gear star% X effect while adjacent to at least one enemy, one adjacent enemy suffers that %?gear star in red box% instead."
  - tokens: [0]
  duration: persistent

name: Scalding Blast
initiative: 45
level: 6
top:
  actions:
  - attack: 5
  # check: banner row with the gauge icon (red)
  - custom: "%classToken2%"
  - custom: "+2 %target%, %xp1%, %?red box with gear star% 2, %classToken1% %classToken1%"
  # check: banner row with the gauge icon (yellow)
  - custom: "%classToken2%"
  - custom: "+1 %target%, %xp1%, %?red box with gear star% 1, %classToken1%"
  # check: banner row with the gauge icon (green)
  - custom: "%classToken2%"
  - custom: "+1 %attack%"
bottom:
  actions:
  - attack: 3
    enhancement:
    - square
    sub:
    - pierce: 2
  - mandatory:
    - custom: "%classToken0%"
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
  # check: banner row with the gauge icon (red)
  - custom: "%classToken2%"
  - wound: ''
    sub:
    - custom: "%target% all, %range% 1"
  - custom: "%xp1%, %classToken1%"
  # check: banner row with the gauge icon (blue); the purple diamond may be empower or ward
  - custom: "%classToken2%"
  - empower: ''
    sub:
    - custom: "%target% all allies, %range% 1"
  - custom: "%xp1%, %classToken0%"
  infuse: [fire/ice]
bottom:
  actions:
  - move: 3
    enhancement:
    - circle
  - divider
  - custom: "Whenever you perform a move ability, you may %classToken0% and discard this card to add +2 %move% and gain %xp1%."
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
  # check: banner row with the gauge icon (blue)
  - custom: "%classToken2%"
  - heal: 4
    sub:
    - self
  - custom: "%xp1%, %classToken0%"
  duration: persistent
bottom:
  actions:
  - move: 2
  # check: banner row with the gauge icon (yellow)
  - custom: "%classToken2%"
  - custom: "+1 %move%"
  # check: banner row with the gauge icon (green)
  - custom: "%classToken2%"
  - custom: "+2 %move%, %classToken0%"
  - divider
  # check: banner row with the gauge icon (blue)
  - custom: "%classToken2%"
  - optional:
    - consume:
      - ice
    - brittle: ''
      sub:
      - range: 1
  - custom: "%xp1%, %classToken0%"

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
  # check: banner row with the gauge icon (red)
  - custom: "%classToken2%"
  - custom: "%pierce% 4, %wound%, %xp1%, %?red box with gear star% 1, %classToken1%"
  # check: banner row with the gauge icon (yellow)
  - custom: "%classToken2%"
  - custom: "%pierce% 2, %xp1%"
bottom:
  actions:
  # check: banner row with the gauge icon (red)
  - custom: "%classToken2%"
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
    - custom: "%?pressure gauge dial, red row% %stun% %target% controlled enemy, %xp1%, %damage%2, %?pressure down% %?pressure down%"
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - custom: "Treat the next %damage% trap you spring during this movement as a %heal% trap instead, with a %heal% value equal to the trap's %damage% value."
    # check: yellow pressure effect row
    - custom: "%?pressure gauge dial, yellow row% %ice%x : %xp1%, %?pressure down% %?pressure down%"
    # check: green pressure effect row
    - custom: "%?pressure gauge dial, green row% %fire%x : %xp1%, %?pressure up% %?pressure up%"

name: Piston Barrage
initiative: 33
level: 8
top:
  actions:
    - attack: 4
      enhancement: [circle]
    - divider
    # check: red pressure effect row holds two attack 3 lines separated by a thin line, with shared pills
    - custom: "%?pressure gauge dial, red row% %attack%3, %attack%3, %xp1%, %damage%1, %?pressure down%"
    # check: yellow pressure effect row
    - custom: "%?pressure gauge dial, yellow row% %attack%3, %xp1%, %?pressure down%"
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
        - custom: "%?pressure up%"

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
    - custom: "%?pressure gauge dial, red row% %attack%5, %?pressure down% %?pressure down% %?pressure down%"
    - custom: "%?pressure gauge dial, yellow row% %move%5, %?pressure down% %?pressure down%"
    # check: last icon of this row looks like a card with a red bar and circular arrow (round bonus)
    - custom: "%?pressure gauge dial, green row% %shield%2, %?pressure up% %?pressure up% %round%"
    - custom: "%?pressure gauge dial, blue row% %heal%6 self, %?pressure up% %?pressure up% %?pressure up%"

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
    - custom: "Once per turn, when you perform an attack ability, you may %?pressure down% to add +3 %attack% to one attack, or, when you perform a move ability, you may %?pressure up% to add +3 %move%."
    - custom: "When you have %?pressure gauge dial, blue% or %?pressure gauge dial, red% at the end of your turn, %damage%5 and discard this card."
  duration: persistent
