# Demolitionist (Jaws of the Lion, Gloomhaven 2nd edition update). The regular cards (level 1 to 9 and X) are read from the card pictures (blind reading,
# 2026-11-26, Claude readers; the pictures were checked again for every reader doubt on 2026-11-28 and the enhancement marker shapes were confirmed on
# the review page). The check comments left only note how a dark banner inside a pill is written (as a plain sub item). The tutorial cards (level A and B) are the Secretariat conversion, not checked and not used.

name: Crushing Weight
initiative: 22
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - custom: "Add +2 %attack% and gain %xp1% if the target is adjacent to a wall."
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "One adjacent enemy that is adjacent to a wall suffers %damage% 2."

name: Explode
initiative: 28
level: 1
top:
  actions:
    - custom: "Destroy one adjacent obstacle."
    - divider
    - stun: ''
      sub:
        - custom: "%target% all enemies adjacent to the destroyed obstacle"
    - custom: "Each target suffers %damage% 2."
  xp: 2
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - optional:
        - consume: [fire]
        - custom: "+2 %move%"

name: Explosive Blitz
initiative: 19
level: 1
top:
  actions:
    - attack: 2
      sub:
        - range: 4
          enhancement: [square]
    - mandatory:
        - fire
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "If you opened a door during the move ability, perform:"
    - stun: ''
      sub:
        - target: all
        - range: 3
  xp: 1
  lost: t

name: Implode
initiative: 88
level: 1
top:
  actions:
    - attack: 3
    - optional:
        - consume: [earth]
        - custom: "+1 %attack%, %muddle%, %xp1%"
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - optional:
        - consume: [earth]
        - custom: "Designate an adjacent hex containing an obstacle and destroy the obstacle in that hex to create two single-hex obstacles in empty hexes adjacent to the designated hex."
      noLine: true

name: Knock Out the Support
initiative: 20
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - divider
    - custom: "Place a character token on the target of the attack ability. Heals targeting this enemy this round have no effect."
    - mandatory:
        - earth
  duration: round
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "Destroy one adjacent obstacle."
    - custom: "If you do, gain %strengthen% and %xp1%."

name: One-Two Punch
initiative: 66
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    - divider
    - attack: 1
      enhancement: [diamond]
    - custom: "If this attack targets the same enemy as the previous attack ability, add %push% 2, %muddle%, %xp1%."
bottom:
  actions:
    - attack: 1
    - divider
    - loot: 1

name: Piston Punch
initiative: 42
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - push: 2
          enhancement: [square]
    - optional:
        - consume: [fire]
        - custom: "+1 %attack%, +1 %push%, %xp1%"
bottom:
  actions:
    - stun: ''
      sub:
        - range: 1
    - optional:
        - consume: [earth]
        - poison

name: The Big One
initiative: 37
level: 1
top:
  actions:
    - group:
        - attack: 3
          sub:
            - range: 2
        - hex: ett_ttt_ett
    - mandatory:
        - fire
        - earth
  xp: 1
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "Destroy one adjacent obstacle. If you do, gain %bless% and %xp1%."

name: Windup
initiative: 77
level: 1
top:
  actions:
    - custom: "On your next two attacks, add +2 %attack%."
    - tokens: [0, 1]
  duration: persistent
bottom:
  actions:
    - custom: "Double the value of your next move ability."
    - tokens: [0]
  duration: persistent

name: Level
initiative: 61
level: X
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - custom: "Add +3 %attack% and gain %xp1% if the target is an objective."
bottom:
  actions:
    - custom: "Add +1 %attack% to all of your melee attacks this round."
  duration: round

name: Lobbed Charge
initiative: 52
level: X
top:
  actions:
    - custom: "Create one %damage% 3, %muddle% trap in an empty hex within %range% 3."
    - mandatory:
        - fire
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - custom: "Designate one adjacent enemy. If each hex you entered with the move ability brought you closer to that enemy, perform:"
    - attack: X
      sub:
        - custom: "%target% the designated enemy, %push% 2"
    - custom: "where X is the number of hexes you moved."
  xp: 1
  lost: t

name: Rubble
initiative: 55
level: X
top:
  actions:
    - move: 2
      sub:
        - jump
    - custom: "This movement may end in a hex containing an obstacle. If it does, gain %xp1%, destroy the obstacle, and perform:"
    - attack: 4
    - mandatory:
        - earth
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - optional:
        - consume: [fire]
        - custom: "If you are adjacent to a wall, create one single-hex obstacle in an adjacent empty hex."
      noLine: true

name: Crash Protocol
initiative: 74
level: 2
top:
  actions:
    - custom: "On your next four attacks targeting enemies adjacent to a wall, add +2 %attack%."
    - tokens: [0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
      sub:
        - jump
    - custom: "Each time you enter a hex containing an obstacle with this movement, destroy that obstacle and add +1 %move%."
    - optional:
        - consume: [earth]
        - custom: "All enemies moved through with the move ability suffer %damage%1, %xp1%"

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
    - custom: "This movement is unaffected by difficult terrain."

name: Fire Bombs
initiative: 24
level: 3
top:
  actions:
    - attack: 2
      sub:
        - target: 2
          enhancement: [square]
        - range: 4
          enhancement: [square]
    - mandatory:
        - fire
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and all enemies adjacent to the destroyed obstacle suffer %damage%2."

name: Nowhere to Run
initiative: 39
level: 3
top:
  actions:
    - attack: 4
      enhancement: [diamond]
    - custom: "Add +1 %attack% for each wall hex, obstacle hex, objective, figure, or trap adjacent to the target."
  xp: 2
  lost: t
bottom:
  actions:
    - custom: "Designate an adjacent obstacle."
    - divider
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "Relocate the designated obstacle to an empty hex adjacent to you."
    - mandatory:
        - earth

name: Extra Fuel
initiative: 17
level: 4
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - custom: "Add +2 %attack%, %wound% and gain %xp1% if the target is adjacent to a wall."
    - mandatory:
        - fire
bottom:
  actions:
    - move: 5
      enhancement: [circle]
    - divider
    - optional:
        - consume: [fire]
        - attack: 1
      noLine: true

name: Remote Detonation
initiative: 63
level: 4
top:
  actions:
    - custom: "Destroy one obstacle within %range%4. If you do, perform:"
    - attack: 2
      enhancement: [diamond]
      sub:
        - custom: "%target% all enemies adjacent to the destroyed obstacle"
    - optional:
        - consume: [fire]
        - custom: "+1 %attack%, %xp1%"
bottom:
  actions:
    - custom: "Create three %damage%3 traps in empty hexes within %range%4."
  xp: 2
  lost: t

name: Mech Suit
initiative: 80
level: 5
top:
  actions:
    - custom: "Your current and maximum hit point values are increased by 5."
    - divider
    - custom: "%recover% all your discarded cards."
    - divider
    - shield: 1
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - attack: 2
    - custom: "If the target is adjacent to a wall, you may create one single-hex obstacle in an empty hex adjacent to the target."

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
    - custom: "If this attack targets the same enemy as the previous two attack abilities, ignore the %shield% of the target, add %poison%, and gain %xp1%."
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "Place one of your character tokens on one adjacent normal or elite enemy. You and all allies may ignore the %shield% of this enemy this round."
  duration: round

name: Dust Cloud
initiative: 15
level: 6
top:
  actions:
    - attack: 2
      sub:
        - target: all adjacent enemies
        - push: 1
        - muddle
    - mandatory:
        - earth
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "Destroy one adjacent obstacle. If you do, gain %xp1% and perform:"
    - shield: 2
  duration: round

name: Insult to Injury
initiative: 64
level: 7
top:
  actions:
    - custom: "On your next three attacks targeting enemies you attacked earlier in the same round, add +3 %attack%."
    - tokens: [1, 1, 1]
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - custom: "Add %immobilize% to all your attacks this round."
    - optional:
        - consume: [earth]
        - custom: "also add %muddle%, %xp1%"
  duration: round

name: Micro Missiles
initiative: 16
level: 7
top:
  actions:
    - attack: 2
      sub:
        - target: 4
          enhancement: [square]
        - range: 3
          enhancement: [square]
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "All objectives within %range%3 suffer %damage%3."
    - mandatory:
        - earth

name: Gut Punch
initiative: 26
level: 8
top:
  actions:
    - attack: 5
    - optional:
        - group:
            - consume: [earth]
            - custom: "+1 %attack%, %push% 2, %xp1%"
        - group:
            - consume: [fire]
            - custom: "+1 %attack%, %immobilize%, %xp1%"
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
    - group:
      - attack: 4
        enhancement:
        - diamond
        sub:
        - range: 2
      - custom: "Destroy all obstacles in the targeted area."
      - mandatory:
        - custom: "All allies in the targeted area suffer %damage%2."
    - hex: ett_ttt_tttt_ttt
  - mandatory:
    - fire
    - earth
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
  - divider
  - custom: "All adjacent enemies that are adjacent to a wall suffer %damage%2."

name: Collateral Damage
initiative: 15
level: 9
top:
  actions:
  - custom: "Destroy one adjacent obstacle or objective. If you do, gain %xp1% and perform:"
  - attack: 4
    enhancement:
    - diamond
    sub:
    - custom: "%target% all enemies adjacent to the destroyed obstacle or objective,"
    - push: 2
  - optional:
    - consume:
      - earth
    - custom: "+2 %attack%, %xp1%"
  lost: t
bottom:
  actions:
  - move: 2
    enhancement:
    - circle
  - divider
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
    enhancement:
    - circle
  - divider
  - attack: 3
    enhancement:
    - diamond
  - optional:
    - consume:
      - fire
    - custom: "+1 %attack%, %wound%"
bottom:
  actions:
  - custom: "You may perform any destroy obstacle ability as if one empty hex within range of the ability contains an obstacle."
  xp: 2
  duration: persistent

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
