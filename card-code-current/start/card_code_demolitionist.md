# Demolitionist (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Implode
initiative: 88
level: A
top:
  actions:
  - attack: 3
    sub:
    - muddle
bottom:
  actions:
  - move: 2
  - custom: "Destroy one obstacle within %range%2."

name: Knock Out the Support
initiative: 20
level: A
top:
  actions:
  - attack: 3
bottom:
  actions:
  - move: 2
  - custom: "Destroy one adjacent obstacle. If you do, perform."
  - strengthen: ''
    sub:
    - self

name: Piston Punch
initiative: 42
level: A
top:
  actions:
  - attack: 3
bottom:
  actions:
  - stun: ''
    sub:
    - target: "1 adjacent enemy"

name: Explosive Blitz
initiative: 19
level: A
top:
  actions:
  - attack: 2
    sub:
    - range: 4
bottom:
  actions:
  - move: 4

name: The Big One
initiative: 37
level: A
top:
  actions:
  - attack: 2
    sub:
    - range: 2
    - target: 2
bottom:
  actions:
  - move: 3

name: One-Two Punch
initiative: 66
level: A
top:
  actions:
  - attack: 2
  - divider
  - attack: 1
bottom:
  actions:
  - attack: 1

name: The Big One
initiative: 37
level: B
top:
  actions:
  - group:
    - attack: 3
      sub:
      - range: 2
    - hex: ett_ttt_ett
  lost: t
bottom:
  actions:
  - move: 3
  - divider
  - push: 1
    sub:
    - target: "1 adjacent enemy"

name: One-Two Punch
initiative: 66
level: B
top:
  actions:
  - attack: 2
  - divider
  - attack: 1
  - optional:
    - custom: "Add %push%2 and %muddle% if this attack targets the same enemy as the previous Attack ability."
bottom:
  actions:
  - attack: 1
  - divider
  - loot: 1

name: Windup
initiative: 77
level: 1
top:
  actions:
  - custom: "On your next two attacks, add +2 %attack%."
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
bottom:
  actions:
  - custom: "Double the value of your next Move ability."
  - multi:
    - custom: "%persistent%"
    - tokens: [0]

name: Crushing Weight
initiative: 22
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to a wall."
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "One adjacent enemy that is adjacent to a wall suffers %damage%2."

name: Knock Out the Support
initiative: 20
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - custom: "All heals targeting the target have no effect this round. To signify this, place one of your character tokens on the target."
  - multi:
    - earth
    - custom: "%round%"
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and perform."
  - strengthen: ''
    sub:
    - self

name: Explode
initiative: 28
level: 1
top:
  actions:
  - custom: "Destroy one adjacent obstacle. If you do, gain %xp2% and perform."
  - stun: ''
  - custom: "Target all enemies adjacent to the destroyed obstacle."
  - custom: "Each target suffers %damage%2."
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - optional:
    - consume: [fire]
    - custom: "+2 %move%"

name: Implode
initiative: 88
level: 1
top:
  actions:
  - attack: 3
  - optional:
    - consume: [earth]
    - multi:
      - attack: 1
      - custom: ","
      - muddle: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Destroy one obstacle within %range%3."

name: Piston Punch
initiative: 42
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [diamond]
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - push: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - stun: ''
    sub:
    - target: "1 adjacent enemy"
  - optional:
    - consume: [earth]
    - poison: ''

name: Explosive Blitz
initiative: 19
level: 1
top:
  actions:
  - attack: 2
    sub:
    - range: 4
      enhancement: [circle]
  - fire
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "If you opened a door during the movement, perform."
  - stun: ''
    sub:
    - target: "all enemies within 3 hexes"
  - custom: "%xp1%"
  lost: t

name: The Big One
initiative: 37
level: 1
top:
  actions:
  - group:
    - attack: 3
      sub:
      - range: 2
      - multi:
        - fire
        - earth
        - custom: "%xp1%"
    - hex: ett_ttt_ett
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and perform."
  - bless: ''
    sub:
    - self

name: Ones-Two Punch
initiative: 66
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
  - divider
  - attack: 1
    enhancement: [diamond]
  - optional:
    - custom: "Add %push%2, %muddle% and gain %xp1% if this attack targets the same enemy as the previous Attack ability."
bottom:
  actions:
  - attack: 1
  - divider
  - loot: 1

name: Rubble
initiative: 55
level: X
top:
  actions:
  - custom: "Designate one hex within %range%3 containing a destruction token. All allies and enemies in or adjacent to that hex suffer %damage%2."
  - multi:
    - earth
    - custom: "%xp1%"
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Create one 2-damage trap in an adjacent empty hex containing a destruction token."

name: Level
initiative: 61
level: X
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - custom: "Add +3 %attack% and gain %xp1% if the target is an objective."
bottom:
  actions:
  - custom: "Add +1 %attack% to all your melee attacks this round."

name: Lobbed Charge
initiative: 52
level: X
top:
  actions:
  - custom: "Create one 3-damage %muddle% trap in an empty hex within %range%3."
  - fire
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Designate one adjacent enemy. If each hex of the movement brought you closer to that enemy, perform."
  - multi:
    - attack: X
      sub:
      - push: 2
    - custom: "%xp1%"
  - custom: "<small>targeting that enemy, where X is the number of hexes you moved.<small>"
  lost: t

name: Robotic Enhancement
initiative: 33
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - stun
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - optional:
    - custom: "This movement is unaffected by difficult terrain."

name: Crash Protocol
initiative: 74
level: 2
top:
  actions:
  - custom: "On your next four attacks targeting enemies adjacent to a wall, add +2 %attack%."
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - optional:
    - consume: [earth]
    - custom: "All enemies moved through suffer %damage%1, %xp1%."

name: Fire Bombs
initiative: 24
level: 3
top:
  actions:
  - attack: 2
    sub:
    - range: 4
      enhancement: [circle]
    - target: 2
      enhancement: [circle]
  - fire
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and all enemies adjacent to the destroyed obstacle suffer %damage%2."

name: Nowhere to Run
initiative: 39
level: 3
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - optional:
    - custom: "Add +1 %attack% for each wall hex, obstacle hex, objective, figure, or trap adjacent to the target."
  - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Move one adjacent trap to an enemy hex adjacent to you."
  - earth

name: Remote Detonation
initiative: 63
level: 4
top:
  actions:
  - custom: "Destroy one obstacle within %range%4. If you do, perform."
  - attack: 2
    enhancement: [diamond]
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "Create three 3-damage traps in an empty hex within %range%4."
  - custom: "%xp2%"
  lost: t

name: Extra Fuel
initiative: 17
level: 4
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - optional:
    - custom: "Add +2 %attack%, %wound% and gain %xp1% if the target is adjacent to a wall."
  - fire
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - optional:
    - consume: [fire]
    - attack: 1
    noLine: true

name: Mech Suit
initiative: 80
level: 5
top:
  actions:
  - custom: "Your maximum hit point value is increased by 5."
  - heal: 10
    sub:
    - self
  - multi:
    - custom: "%xp2%"
    - shield: 1
    - custom: "%persistent%"
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - loot: 1

name: Dust Cloud
initiative: 15
level: 6
top:
  actions:
  - attack: 2
    sub:
    - target: "all adjacent enemies"
    - push: 1
    - muddle
  - earth
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and perform."
  - shield: 2
  - custom: "%round%"

name: Drill Fist
initiative: 62
level: 6
top:
  actions:
  - attack: 1
  - divider
  - attack: 1
  - divider
  - attack: 2
  - optional:
    - custom: "<small>Ignore the Shield value of the target, add %poison%, and gain %xp1% if this attack targets the same enemy as the previous two Attack abilities.</small>"
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Place one of your character tokens on one adjacent normal or elite enemy. You and all allies may ignore the Shield value of this enemy this round."
  - custom: "%round%"

name: Micro Missiles
initiative: 16
level: 7
top:
  actions:
  - attack: 2
    sub:
    - range: 3
      enhancement: [circle]
    - target: 4
      enhancement: [circle]
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "All objectives within %range%3 suffer %damage%3."
  - earth

name: Insult to Injury
initiative: 64
level: 7
top:
  actions:
  - custom: "<small>On your next three attacks targeting enemies you attacked earlier in the same round, add +3 %attack%.</small>"
  - multi:
    - custom: "%persistent%"
    - tokens: [1]
    - tokens: [1]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Add %immobilize% to all your attacks this round."
  - optional:
    - consume: [earth]
    - custom: "Also add %muddle%, %xp1%."
    noLine: true
  - custom: "%round%"

name: Gut Punch
initiative: 26
level: 8
top:
  actions:
  - attack: 5
  - optional:
    - consume: [earth]
    - multi:
      - attack: 1
      - custom: ","
      - push: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - stun

name: The Bigger One
initiative: 31
level: 8
top:
  actions:
  - group:
    - attack: 4
      enhancement: [diamond]
      sub:
      - range: 2
      - multi:
        - fire
        - earth
        - custom: "%xp2%"
    - hex: ett_ttt_tttt_ttt
  - custom: "Destroy all obstacles in the targeted area. All allies in the targeted area suffer %damage%2."
  lost: t
bottom:
  actions:
  - move: 3
  - custom: "All adjacent enemies that are adjacent to a wall suffer %damage%2."

name: Collateral Damage
initiative: 15
level: 9
top:
  actions:
  - custom: "Destroy one adjacent obstacle or objective. If you do, gain %xp1% and perform."
  - attack: 4
    enhancement: [diamond]
    sub:
    - push: 2
  - custom: "Target all enemies adjacent to the destroyed obstacle or objective."
  - optional:
    - consume: [earth]
    - multi:
      - attack: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and all enemies in the same room as the destroyed obstacle suffer %damage%2."

name: Wholesale Destruction
initiative: 34
level: 9
top:
  actions:
  - attack: 2
  - divider
  - attack: 2
  - divider
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
  - optional:
    - consume: [fire]
    - multi:
      - attack: 1
      - custom: ","
      - wound: ''
bottom:
  actions:
  - custom: "You may perform any destroy obstacle ability as if one empty hex within range of the ability contains an obstacle. If you do, do not place a destruction token."
  - multi:
    - custom: "%xp2%"
    - custom: "%persistent%"
