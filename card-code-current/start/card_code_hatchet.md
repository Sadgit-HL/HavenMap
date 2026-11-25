# Hatchet (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

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

name: The Favorite
initiative: 17
level: 1
top:
  actions:
  - custom: "<small>Place one of your character tokens on this card. You may add +3 %attack% to any of your ranged attacks by moving the token from this card to the target after the attack ability is resolved. When the target dies, place the token on the hex in which it died. If you loot that hex, return the token to this card.</small>"
  - custom: "%xp2%"
  lost: t
  duration: persistent
bottom:
  actions:
  - wound: ''
    sub:
    - target: "1 adjacent enemy"
  - divider
  - move: 3
    enhancement: [circle]
    sub:
    - jump

name: Retrieval
initiative: 46
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - optional:
    - custom: "If the target has your Favorite token, return the token to its card."
bottom:
  actions:
  - move: 1
  - divider
  - loot: 1

name: Close Cuts
initiative: 25
level: 1
top:
  actions:
  - group:
    - attack: 3
      sub:
      - custom: "%xp1%"
    - hex: et_st_ex
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
  - divider
  - move: 2

name: Center Mass
initiative: 24
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [circle]
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - push: 2
    enhancement: [circle]
    sub:
    - target: "1 adjacent enemy"

name: Stopping Power
initiative: 35
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [circle]
  - optional:
    - consume: [air]
    - multi:
      - range: 1
      - custom: ","
      - push: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - divider
  - immobilize: ''
  - optional:
    - custom: "Target all enemies adjacent to any hex you entered during the movement."
  - multi:
    - air
    - custom: "%xp1%"
  lost: t

name: Double Throw
initiative: 64
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
    - target: 2
      enhancement: [circle]
  - multi:
    - air
    - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - custom: "Double the value of your next attack this round."
  - multi:
    - custom: "%xp1%"
    - custom: "%round%"
  lost: t

name: Disorienting Barrage
initiative: 51
level: 1
top:
  actions:
  - attack: 1
    sub:
    - range: 3
      enhancement: [circle]
    - target: 3
      enhancement: [circle]
    - muddle
bottom:
  actions:
  - move: 2
  - custom: "All adjacent enemies suffer %damage%1."
  - move: 1
  - custom: "All adjacent enemies suffer %damage%2."
  - multi:
    - custom: "%xp1%"
    - move: 1
  lost: t

name: Power Pitch
initiative: 60
level: 1
top:
  actions:
  - attack: 6
    sub:
    - range: 3
  - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - air

name: Follow Through
initiative: 39
level: 1
top:
  actions:
  - attack: 2
    sub:
    - range: 4
      enhancement: [circle]
  - optional:
    - custom: "Add +2 %attack% and gain %xp1% if the target has your Favorite token."
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - push: 2
    sub:
    - target: "1 adjacent enemy"
  - optional:
    - consume: [air]
    - move: 2
    noLine: true

name: Second Wind
initiative: 18
level: 1
top:
  actions:
  - heal: 6
    enhancement: [diamondPlus]
    sub:
    - self
  - multi:
    - air
    - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 3
  - optional:
    - custom: "Add +2 %move% and gain %xp1% if you killed an enemy this round."

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
  - optional:
    - custom: "Target one ally adjacent to the target of the attack."
bottom:
  actions:
  - move: 3
  - divider
  - heal: 1
    sub:
    - range: 1
      enhancement: [circle]
  - earth

name: Extra Lift
initiative: 21
level: X
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [circle]
  - optional:
    - consume: [air]
    - multi:
      - attack: 1
      - custom: ","
      - range: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - multi:
    - move: 4
    - air
  - custom: "On your next four Move abilities, add +2 %move%."
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"

name: Fancy Hat
initiative: 12
level: X
top:
  actions:
  - move: 3
  - divider
  - shield: 2
    enhancement: [diamondPlus]
  - multi:
    - dark
    - custom: "%xp1%"
    - custom: "%round%"
  lost: t
bottom:
  actions:
  - custom: "Add +1 %attack% to all your attacks this round."

name: Repeat Shot
initiative: 31
level: 2
top:
  actions:
  - attack: 3
    sub:
    - range: 3
  - optional:
    - custom: "Add +2 %attack% and gain %xp1% if the target has your Favorite token."
bottom:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [circle]
  - multi:
    - air
    - custom: "%xp1%"
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
  - optional:
    - custom: "Target a different enemy within %range%2 of the target of the previous Attack ability."
bottom:
  actions:
  - custom: "On your next four attacks when possible, one enemy adjacent to the target suffers %damage%2."
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"

name: Fearsome Efficiency
initiative: 58
level: 3
top:
  actions:
  - attack: 6
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [circle]
    - multi:
      - air
      - custom: "%xp2%"
  - optional:
    - custom: "<small>If this attack kills the target, one enemy adjacent to the hex in which it died suffers X damage, where X is the amount of damage the target would have suffered in excess of what was needed to kill it.</small>"
  lost: t
bottom:
  actions:
  - attack: 1
    sub:
    - range: 3
  - optional:
    - custom: "Add +2 %attack% and gain %xp1% if you killed an enemy this round."

name: Sharpened Blades
initiative: 44
level: 3
top:
  actions:
  - custom: "On your next five attacks, add +1 %attack% and %wound%"
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - optional:
    - consume: [air]
    - custom: "+2 %move%"

name: Ripped From the Flesh
initiative: 20
level: 4
top:
  actions:
  - loot: 1
  - custom: "If an adjacent enemy has your Favorite token, you may return the token to its card. If you do, the adjacent enemy suffers %damage%2 and gains %wound%."
bottom:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 2
  - optional:
    - custom: "Add %strengthen% and gain %xp1% if you killed an enemy this round."
  - air

name: Overwatch
initiative: 40
level: 4
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [circle]
  - optional:
    - consume: [air]
    - multi:
      - attack: 1
      - custom: ","
      - range: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "<small>The next five times an enemy ends a Move ability within %range%5, perform an \"%attack%2, %range%5\" action targeting that enemy.</small>"
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"

name: The New Favorite
initiative: 15
level: 5
top:
  actions:
  - custom: "<small>Place the Axe token on this card. You may add +3 %attack%, %wound%, and %push%1 to any of your ranged attacks by moving the token from this card to the target after the attack ability is resolved. When the target dies, place the token on the hex in which it died. If you loot that hex, return the token to this card. This card cannot be active while \"The Favorite\" is active.</small>"
  - multi:
    - custom: "%xp2%"
    - custom: "%persistent%"
  lost: t
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - immobilize
  - divider
  - move: 4
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
  - multi:
    - air
    - attack: 3
      sub:
      - range: 3
    - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "All adjacent enemies suffer %damage%1."
  - push: 1
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"

name: Quick Turnaround
initiative: 11
level: 6
top:
  actions:
  - attack: 4
    sub:
    - range: 3
      enhancement: [circle]
    - push: 2
  - optional:
    - consume: [air]
    - multi:
      - range: 1
      - custom: ","
      - push: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
  - custom: "If your Favorite token is in or adjacent to your hex, you may perform."
  - loot: 1

name: Excessive Force
initiative: 47
level: 7
top:
  actions:
  - custom: "On your next five attacks targeting an enemy that has your Favorite token, add +2 %attack%."
  - multi:
    - custom: "%persistent%"
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 3
  - optional:
    - consume: [air]
    - multi:
      - attack: 2
        sub:
        - range: 2
      - custom: "%xp1%"
    noLine: true

name: Brutalize
initiative: 22
level: 7
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - optional:
    - custom: "Add +2 %attack% and gain %xp1% if the target has your Favorite token, then return the token to its card."
bottom:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 4
    - stun
  - multi:
    - air
    - custom: "%xp1%"
  lost: t

name: Shrapnel
initiative: 37
level: 8
top:
  actions:
  - attack: 2
    sub:
    - range: 3
      enhancement: [circle]
    - target: 2
    - wound
  - optional:
    - consume: [air]
    - multi:
      - target: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "<small>The next five times you kill an enemy, all enemies adjacent to the hex in which it died suffer %damage%2.</small>"
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"

name: Camaraderie
initiative: 75
level: 8
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - self
  - divider
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "1 adjacent ally"
  - air
bottom:
  actions:
  - move: 3
  - custom: "Add +2 %attack% to your next attack this turn if you are adjacent to an ally."

name: Executioner's Axe
initiative: 79
level: 9
top:
  actions:
  - custom: "One adjacent normal or elite enemy suffers %damage%12."
  - multi:
    - dark
    - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - custom: "If you killed an enemy this round, return your Favorite token to its card and gain %xp1%."

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
    - multi:
      - wound: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "<small>The next four times you kill an enemy, perform a \"%heal%3, %range%2, %bless%\" action.</small>"
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
