# Hatchet (Jaws of the Lion, Gloomhaven 2nd edition update). The regular cards (level 1 to 9 and X) are read from the card pictures (blind reading,
# 2026-11-26, Claude readers;  comments mark the readers' doubts). The tutorial cards (level A and B) are the Secretariat conversion, not checked and not used.

name: Center Mass
initiative: 24
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        # check: the square marker sits after the range value inside the pill
        - range: 3
          enhancement: [square]
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - push: 2
      enhancement: [diamond]
      sub:
        - range: 1

name: Close Cuts
initiative: 25
level: 1
top:
  actions:
    - group:
        - attack: 3
        - hex: et_st_ex
  xp: 1
bottom:
  actions:
    - attack: 2
      enhancement: [diamond]
    - divider
    - move: 2

name: Disorienting Barrage
initiative: 51
level: 1
top:
  actions:
    - attack: 1
      sub:
        # check: square markers after the target and range values inside the pill
        - target: 3
          enhancement: [square]
        - range: 3
          enhancement: [square]
        - muddle
bottom:
  actions:
    - move: 2
    - divider
    - custom: "All adjacent enemies suffer %damage%1."
    - divider
    - move: 1
    - divider
    - custom: "All adjacent enemies suffer %damage%2."
    - divider
    - move: 1
  xp: 1
  lost: t

name: Double Throw
initiative: 64
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        # check: square marker after the target value inside the pill
        - target: 2
          enhancement: [square]
        - range: 4
    - mandatory:
        - air
  xp: 2
  lost: t
bottom:
  actions:
    - custom: "Double the value of your next attack this round."
  xp: 1
  duration: round
  lost: t

name: Follow Through
initiative: 39
level: 1
top:
  actions:
    - attack: 2
      sub:
        - range: 4
          enhancement: [square]
    - custom: "Add +2 %attack% and gain %xp1% if the target has your Favorite Token."
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - push: 2
      sub:
        - range: 1
    - divider
    - optional:
        - consume: [air]
        - move: 2

name: Power Pitch
initiative: 60
level: 1
top:
  actions:
    - attack: 6
      sub:
        - range: 3
  xp: 2
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - mandatory:
        - air

name: Retrieval
initiative: 46
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    # check: the icon is a card with a red check mark, read as recover
    - custom: "%recover% if the target has your Favorite Token."
bottom:
  actions:
    - move: 1
    - divider
    - loot: 1

name: Second Wind
initiative: 18
level: 1
top:
  actions:
    - heal: 6
      enhancement: [diamondPlus]
      sub:
        - self
    - mandatory:
        - air
  xp: 2
  lost: t
bottom:
  actions:
    - move: 3
    - custom: "Add +2 %move% and gain %xp1% if you killed an enemy this round."

name: Stopping Power
initiative: 35
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 2
          enhancement: [square]
    - optional:
        - consume: [air]
        - custom: "+1 %range%, %push% 2, %xp1%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
      sub:
        - jump
    - divider
    - immobilize: ''
      sub:
        - custom: "%target% all enemies adjacent to any hex you entered with the move ability"
    - mandatory:
        - air
  xp: 1
  lost: t

name: The Favorite
initiative: 17
level: 1
top:
  actions:
    - custom: "Place a +3 %attack% Favorite Token on your character mat while this card is active."
    # check: the token is a hatchet circle with +3 attack, no name known
    - custom: "%?hatchet circle token with +3 attack%"
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - wound: ''
      sub:
        - range: 1
    - divider
    - move: 3
      enhancement: [circle]
      sub:
        - jump

name: Care Package
initiative: 30
level: X
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 3
    - divider
    - heal: 2
      enhancement: [diamondPlus]
      sub:
        - custom: "%target% 1 ally adjacent to the target of the attack"
bottom:
  actions:
    - move: 3
    - divider
    - heal: 1
      sub:
        - range: 1
          enhancement: [square]
    - mandatory:
        - earth
  # check: the banner shows a green leaf, read as earth

name: Extra Lift
initiative: 21
level: X
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 3
          enhancement: [square]
    - optional:
        - consume: [air]
        - custom: "+1 %attack%, +2 %range%, %xp1%"
bottom:
  actions:
    - move: 4
    - divider
    - custom: "On your next four move abilities, add +2 %move%."
    # check: first circle dashed, three solid; xp over the 2nd and 4th circle; small red marks beside the last circle ignored
    - tokens: [0, 1, 0, 1]
    - mandatory:
        - air
  duration: persistent
  lost: t

name: Fancy Hat
initiative: 12
level: X
top:
  actions:
    - move: 3
    - divider
    # check: the marker after the shield value is a small diamond with a cross, may be plus
    - shield: 2
      enhancement: [diamondPlus]
    # check: the banner icon is a dark circle with a crescent, read as dark
    - mandatory:
        - dark
  xp: 1
  duration: round
  lost: t
bottom:
  actions:
    - custom: "Add +1 %attack% to all your attacks this round."
  duration: round

name: Repeat Shot
initiative: 31
level: 2
top:
  actions:
    - attack: 3
      sub:
        - range: 3
    - custom: "Add +2 %attack% and gain %xp1% if the target has your Favorite Token."
bottom:
  actions:
    - attack: 5
      enhancement: [diamond]
      sub:
        - range: 3
          enhancement: [square]
    - mandatory:
        - air
  xp: 1
  lost: t

name: Ricochet
initiative: 56
level: 2
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 3
    - divider
    - attack: 2
      enhancement: [diamond]
      sub:
        - custom: "%target% a different enemy within %range% 2 of the target of the previous attack ability"
bottom:
  actions:
    - custom: "On your next four attacks targeting an enemy adjacent to any other enemy, one enemy adjacent to the target suffers %damage%2."
    - tokens: [0, 1, 0, 1]
  duration: persistent
  lost: t

name: Fearsome Efficiency
initiative: 58
level: 3
top:
  actions:
    - attack: 6
      enhancement: [diamond]
      sub:
        - range: 4
          enhancement: [square]
    - custom: "If this attack kills the target, one enemy adjacent to the hex in which it died suffers %damage%X, where X is the amount of %damage% the target would have suffered in excess of what was needed to kill it."
    - mandatory:
        - air
  xp: 2
  lost: t
bottom:
  actions:
    - attack: 1
      sub:
        - range: 3
    - custom: "Add +2 %attack% and gain %xp1% if you killed an enemy this round."

name: Sharpened Blades
initiative: 44
level: 3
top:
  actions:
    - custom: "On your next five attacks, add +1 %attack% and %wound%."
    - tokens: [0, 0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - optional:
        - consume: [air]
        - custom: "+2 %move%"

name: Overwatch
initiative: 40
level: 4
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 4
          enhancement: [square]
    - optional:
        - consume: [air]
        - custom: "+1 %attack%, +1 %range%, %xp1%"
bottom:
  actions:
    - custom: "The next five times an enemy ends a move ability within %range% 5, perform %attack% 2 %range% 5 targeting that enemy."
    - tokens: [0, 0, 1, 0, 1]
  duration: persistent
  lost: t

name: Ripped from the Flesh
initiative: 20
level: 4
top:
  actions:
    - loot: 1
    - divider
    # check: the Favorite Token recall icon (hatchet with red check mark) is unnamed
    - custom: "If an adjacent enemy has your Favorite Token, you may %?hatchet with red check mark%. If you do, the adjacent enemy suffers %damage%2 and gains %wound%."
bottom:
  actions:
    # check: the marker after heal is a small diamond with a dot, read as diamondPlus
    - heal: 3
      enhancement: [diamondPlus]
      sub:
        - range: 2
    - custom: "Add %strengthen% and gain %xp1% if you killed an enemy this round."
    - mandatory:
        - air

name: The New Favorite
initiative: 15
level: 5
top:
  actions:
    # check: the attack bonus sits in a pill with wound and push 1
    - custom: "Place a +3 %attack%, %wound%, %push% 1 Favorite Token on your character mat while this card is active."
    # check: the round token picture under the text repeats "+3 attack, wound, push 1"; written as text only
    - custom: "This card cannot be active while The Favorite is active."
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - immobilize
    - divider
    - move: 4
    - mandatory:
        - air

name: Bombardment
initiative: 54
level: 6
top:
  actions:
    - attack: 3
      sub:
        - range: 3
    - divider
    - attack: 3
      sub:
        - range: 3
    - divider
    - attack: 3
      sub:
        - range: 3
    - mandatory:
        - air
  xp: 2
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "All adjacent enemies suffer %damage%1."
    - divider
    - push: 1
      enhancement: [diamond]
      sub:
        - target: all
        - range: 1

name: Quick Turnaround
initiative: 11
level: 6
top:
  actions:
    - attack: 4
      sub:
        - range: 3
          enhancement: [square]
        - push: 2
    - optional:
        - consume: [air]
        - custom: "+1 %range%, +2 %push%, %xp1%"
bottom:
  actions:
    - move: 3
    - divider
    - custom: "If your Favorite Token is in or adjacent to your hex, you may perform"
    - loot: 1

name: Brutalize
initiative: 22
level: 7
top:
  actions:
    - attack: 4
      enhancement: [diamond]
    # check: the recall icon (hatchet with red check mark) is unnamed
    - custom: "Add +2 %attack% and gain %xp1% if the target has your Favorite Token, then %?hatchet with red check mark%."
bottom:
  actions:
    - attack: 5
      enhancement: [diamond]
      sub:
        - range: 4
        - stun
    - mandatory:
        - air
  xp: 1
  lost: t

name: Excessive Force
initiative: 47
level: 7
top:
  actions:
    - custom: "On your next five attacks targeting an enemy that has your Favorite Token, add +2 %attack%."
    # check: first circle is dashed; xp bursts on circles 1, 3 and 5 (a small red mark beside the last circle)
    - tokens: [1, 0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 3
    - divider
    - optional:
        - consume: [air]
        - attack: 2
          sub:
            - range: 2
            - custom: "%xp1%"
      noLine: true

name: Camaraderie
initiative: 75
level: 8
top:
  actions:
    # check: heal marker is a diamond with a plus, written diamondPlus
    - heal: 3
      enhancement: [diamondPlus]
      sub:
        - self
    - divider
    # check: heal marker is a diamond with a plus, written diamondPlus
    - heal: 3
      enhancement: [diamondPlus]
      sub:
        - target: 1 ally
        - range: 1
    - mandatory:
        - air
bottom:
  actions:
    - move: 3
    - divider
    - custom: "Add +2 %attack% to your next attack this turn if you are adjacent to an ally."

name: Shrapnel
initiative: 37
level: 8
top:
  actions:
    - attack: 2
      sub:
        - target: 2
        - range: 3
          enhancement: [square]
        - wound
    - optional:
        - consume: [air]
        - custom: "+1 %target%, %xp1%"
bottom:
  actions:
    - custom: "The next five times you kill an enemy, all enemies adjacent to the hex in which it died suffer %damage% 2."
    # check: first circle is dashed, xp on the 3rd and 5th circle
    - tokens: [0, 0, 1, 0, 1]
  duration: persistent
  lost: t

name: Executioner's Axe
initiative: 79
level: 9
top:
  actions:
    - custom: "One adjacent normal or elite enemy suffers %damage% 12."
    - mandatory:
        - dark
  xp: 2
  lost: t
bottom:
  actions:
    - custom: "If you killed an enemy this round, %recover% and gain %xp1%."

name: Heart Seeker
initiative: 32
level: 9
top:
  actions:
    - attack: 4
      enhancement: [diamond]
      sub:
        - range: 4
        - stun
    - optional:
        - consume: [air]
        - custom: "%wound%, %xp1%"
bottom:
  actions:
    - custom: "The next four times you kill an enemy, perform"
    - heal: 3
      sub:
        - range: 2
        - bless
    # check: first circle is dashed, xp on the 2nd and 4th circle
    - tokens: [0, 1, 0, 1]
  duration: persistent
  lost: t

name: Stopping Power
initiative: 35
level: A
top:
  actions:
  - attack: 3
    sub:
    - range: 3
bottom:
  actions:
  - immobilize: ''
    sub:
    - target: "1 adjacent enemy"
  - divider
  - move: 3

name: Double Throw
initiative: 64
level: A
top:
  actions:
  - attack: 2
    sub:
    - range: 3
    - target: 2
bottom:
  actions:
  - custom: "Add +1 %attack% to all your attacks this turn."

name: Disorienting Barrage
initiative: 51
level: A
top:
  actions:
  - attack: 1
    sub:
    - range: 3
    - target: 3
    - muddle
bottom:
  actions:
  - move: 2
  - custom: "All adjacent enemies suffer %damage%1."

name: Second Wind
initiative: 18
level: A
top:
  actions:
  - heal: 3
    sub:
    - self
bottom:
  actions:
  - move: 5

name: Center Mass
initiative: 24
level: A
top:
  actions:
  - attack: 3
    sub:
    - range: 3
bottom:
  actions:
  - move: 3

name: Close Cuts
initiative: 25
level: A
top:
  actions:
  - attack: 3
bottom:
  actions:
  - move: 4

name: Center Mass
initiative: 24
level: B
top:
  actions:
  - attack: 3
    sub:
    - range: 3
bottom:
  actions:
  - move: 3
  - divider
  - push: 2
    sub:
    - target: "1 adjacent enemy"

name: Close Cuts
initiative: 25
level: B
top:
  actions:
  - group:
    - attack: 3
    - hex: et_st
bottom:
  actions:
  - move: 4
  - divider
  - loot: 1
  lost: t
