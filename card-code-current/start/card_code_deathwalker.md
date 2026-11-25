# Deathwalker (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Call to the Abyss
initiative: 82
level: 1
top:
  actions:
  - custom: "During your and your summons' attacks, before drawing an attack modifier card, you may place one character token on the target of the attack. When that enemy dies, place one %fh-shadow% in or adjacent to the hex it occupied."
  - custom: "Whenever you place a character token with this ability, remove any other character token placed with this ability."
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Place one %fh-shadow% in a hex within %range%2."

name: Anger of the Dead
initiative: 14
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 2
    - group:
      - custom: "Remove any number of %fh-shadow% within %range%3 (of yourself). For each %fh-shadow% removed:"
      - multi:
        - attack: 1
        - custom: ","
        - range: 1
        - custom: ","
        - pierce: 1
        - custom: ","
        - custom: "%xp1%"
bottom:
  actions:
  - wound: ''
    sub:
    - target: "all enemies occupying a hex with a %fh-shadow%"
  - custom: "Whenever an enemy enters a hex with a %fh-shadow% this round, that enemy gains %wound%."
  duration: round

name: Sunless Apparition
initiative: 96
level: 1
top:
  actions:
  - summon:
      name: Shadow Beast
      stats: [1, 3, 3, -]
      enhancement: [heal]
  - custom: "This ability can only be performed if you remove one %fh-shadow% from an adjacent hex."
  xp: 1
  duration: persistent
bottom:
  actions:
  - loot: 1
  - multi:
    - teleport: ''
    - custom: "to a hex with a %fh-shadow%."

name: Fluid night
initiative: 24
level: 1
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - custom: "Perform the attack as if you were occupying a hex with a %fh-shadow%, then remove the %fh-shadow%."
  - mandatory:
    - dark
  xp: 1
bottom:
  actions:
  - custom: "Whenever you would suffer %damage%, you may instead %teleport% to a hex with a %fh-shadow%, remove the %fh-shadow%, negate the %damage%, and discard this card."
  duration: persistent

name: Dark fog
initiative: 46
level: 1
top:
  actions:
  - group:
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 3
      - curse
    - hex: et_tt
  - mandatory:
    - dark
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "Move one %fh-shadow% up to 5 hexes."

name: Black Barrage
initiative: 28
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
    - custom: "+1 %range%"
bottom:
  actions:
  - custom: "Move all %fh-shadow% up to 2 hexes."

name: Call of Doom
initiative: 32
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - target: "all adjacent enemies"
  - optional:
    - consume: [dark]
    - muddle: ''
  - custom: "Perform the attacks as if you were occupying a hex with a %fh-shadow%."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - mandatory:
    - dark

name: Eclipse
initiative: 86
level: 1
top:
  actions:
  - custom: "Place three %fh-shadow% in hexes within %range%3."
  - mandatory:
    - dark
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Lingering Rot
initiative: 64
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
    - poison
  - custom: "Perform the attacks as if you where occupying a hex with a %fh-shadow%, then remove the %fh-shadow%."
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - poison: ''
    sub:
    - range: 1

name: Shadow Step
initiative: 19
level: 1
top:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "This movement must end in a hex with a %fh-shadow%."
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - custom: "Place one %fh-shadow% in the hex you are occupying."
  lost: t

name: Strength of the Abyss
initiative: 50
level: 1
top:
  actions:
  - attack: "X+1"
  - custom: "where X is the number of %fh-shadow% on the map."
bottom:
  actions:
  - custom: "Once during each of your move or attack abilities, you may remove one %fh-shadow% within %range%3 to gain %xp1% and add<br/><br/>+2 %move% to your move ability<br/>or<br/>+2 %attack% to one of your attacks."
  lost: t
  duration: persistent

name: Wave of Anguish
initiative: 58
level: X
top:
  actions:
  - custom: "For each %fh-shadow% on the map at the start of this action, perform:"
  - attack: 3
  - custom: "Perform the attacks as if you where occupying the hex with the %fh-shadow%."
  xp: 1
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Move all %fh-shadow% up to 1 hex."

name: Forceful Spirits
initiative: 34
level: X
top:
  actions:
  - attack: 2
    sub:
    - target: 2
    - range: 2
  - optional:
    - consume: [dark]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - custom: "%teleport% to a hex with a %fh-shadow% or adjacent to a %fh-shadow%."

name: Rest in the Shade
initiative: 26
level: X
top:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - target: "allies occupying hexes with %fh-shadow% and self"
  - mandatory:
    - dark
bottom:
  actions:
  - custom: "Move all %fh-shadow% up to 6 hexes."
  lost: t

name: Restless Spirits
initiative: 20
level: 2
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - curse
    - group:
      - custom: "If you are occupying a hex with a %fh-shadow%, you may remove it:"
      - multi:
        - attack: 3
        - custom: ","
        - custom: "%xp1%"
bottom:
  actions:
  - custom: "Move one %fh-shadow% up to 4 hexes."
  - custom: "If the moved %fh-shadow% is in the same hex as an enemy, that enemy suffers %damage%3, remove the %fh-shadow%, and gain %xp1%."

name: Deepening Despair
initiative: 11
level: 2
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: "1 enemy at any %range% adjacent to at least two %fh-shadow%"
  - mandatory:
    - dark
bottom:
  actions:
  - custom: "You and all allies may treat each hex with a %fh-shadow% as being adjacent to each other hex with a %fh-shadow% during move abilities this round."
  - move: 3
    enhancement: [circle]
  xp: 1
  lost: t
  duration: round

name: Dead Bolt
initiative: 88
level: 3
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
  - optional:
    - consume: [dark]
    - curse: ''
    - custom: "%xp1%"
bottom:
  actions:
  - custom: "Move all %fh-shadow% up to 3 hexes."

name: Ritual Sacrifice
initiative: 13
level: 3
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +1 %attack% for each %fh-shadow% in or adjacent to the hex occupied by the target."
bottom:
  actions:
  - custom: "Remove any number of %fh-shadow% within %range%3. For each %fh-shadow% removed, gain %xp1% and grant one ally or self:"
  - shield: 1
  - divider
  - move: 2
    enhancement: [square]
  - mandatory:
    - dark
  duration: round

name: Fleeting Dusk
initiative: 36
level: 4
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
    - wound
  - custom: "Perform the attacks as if you where occupying a hex with a %fh-shadow%."
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "Place one %fh-shadow% in an adjacent hex."

name: Pulled Across
initiative: 77
level: 4
top:
  actions:
  - bane: ''
    sub:
    - target: "one normal or elite enemy occupying a hex with a %fh-shadow%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - invisible: ''
    sub:
    - self
  - mandatory:
    - dark

name: Medium
initiative: 55
level: 5
top:
  actions:
  - attack: 3
    enhancement: [square]
  - optional:
    - consume: [dark]
    - custom: "+2 %attack%"
  - custom: "If the attack kills an enemy, place one %fh-shadow% in a hex adjacent to the hex the killed enemey occupied."
bottom:
  actions:
  - custom: "At the start of each of your turns, move one %fh-shadow% up to 3 hexes."
  xp: 1
  lost: t
  duration: persistent

name: Dominate
initiative: 29
level: 5
top:
  actions:
  - attack: 6
    enhancement: [diamond]
  - optional:
    - consume: [dark]
    - disarm: ''
  - custom: "Perform the attack as if you were occupying the hex with a %fh-shadow%, then remove the %fh-shadow%."
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - mandatory:
    - dark

name: The night Takes Shape
initiative: 94
level: 6
top:
  actions:
  - summon:
      name: Shadow Horror
      stats: [5, 3, 3, -]
      enhancement: [heal, attack]
  - custom: "This ability can only be performed if you remove two %fh-shadow% from adjacent hexes."
  - custom: "All attacks targeting your summons gain disadvantage."
  xp: 2
  duration: persistent
bottom:
  actions:
  - custom: "Move one %fh-shadow% up to 3 hexes to an unoccupied hex."
  - custom: "%teleport% to the hex with the moved %fh-shadow%, then remove the %fh-shadow% and gain %xp1%."
  - attack: 3

name: Vengeful Storm
initiative: 18
level: 6
top:
  actions:
  - attack: 3
    sub:
    - range: 4
      enhancement: [square]
    - group:
      - custom: "Remove any number of %fh-shadow% within %range%3 (of yourself). For each %fh-shadow% removed:"
      - multi:
        - target: 1
        - custom: ","
        - custom: "%xp1%"
bottom:
  actions:
  - multi:
    - wound: ''
    - custom: ","
    - stun: ''
      sub:
      - target: "all"
      - range: 1
  - custom: "Perform this ability as if you were occupying a hex with a %fh-shadow%."
  xp: 1
  lost: t

name: Proliferation of the Abyss
initiative: 38
level: 7
top:
  actions:
  - optional:
    - consume: [dark]
    - custom: "Place one %fh-shadow% in an adjacent hex."
    noLine: true
  - custom: "Whenever you or an ally would suffer %damage% while occupying or adjacent to a hex with a %fh-shadow%, you may remove the %fh-shadow%, gain %xp1%, discard this card, and negate the %damage%."
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - optional:
    - consume: [dark]
    - custom: "+2 %move%"
  - custom: "Move two %fh-shadow% up to 4 hexes."

name: Hungry Grasps
initiative: 25
level: 7
top:
  actions:
  - custom: "For up to two %fh-shadow% on the map at the start of this action, perform:"
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [square]
    - pull: 2
      enhancement: [square]
  - custom: "Perform each attack as if you were occupying the hex with the %fh-shadow%."
bottom:
  actions:
  - custom: "For each %fh-shadow% on the map at the start of this action, perform:"
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 1
    - bless
  - custom: "Perform each heal as if you were occupying the hex with the %fh-shadow%."
  xp: 2
  lost: t

name: Lashing Tendrils
initiative: 80
level: 8
top:
  actions:
  - custom: "You and all allies gain %retaliate%2, %range%2 while occupying hexes with %fh-shadow%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Move two %fh-shadow% up to 3 hexes."
  - custom: "One enemy adjacent to both moved %fh-shadow% suffers %damage%3."
  - optional:
    - consume: [dark]
    - damage: 2
    noLine: true

name: Frozen in Fear
initiative: 21
level: 8
top:
  actions:
  - immobilize: ''
    sub:
    - target: "all"
    - range: 1
  - custom: "Perform this ability as if you were occupying a hex with a %fh-shadow%."
  - custom: "All enemies that have %immobilize% suffer %damage%1."
  - optional:
    - consume: [dark]
    - damage: 1
    noLine: true
  xp: 1
bottom:
  actions:
  - custom: "Place two %fh-shadow% in adjacent hexes."
  - custom: "Move all %fh-shadow% up to 5 hexes."
  - mandatory:
    - dark
  xp: 1
  lost: t

name: When Your Time Comes
initiative: 72
level: 9
top:
  actions:
  - custom: "Place one character token on an enemey within %range%4. When that enemy dies, all enemies adjacent to it suffer %damage%4."
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - curse
  - mandatory:
    - dark
  duration: persistent
bottom:
  actions:
  - custom: "Whenever an enemy dies, you may %dark% to place one %fh-shadow% in the hex that enemy occupied."
  xp: 2
  lost: t
  duration: persistent

name: Black Lance
initiative: 16
level: 9
top:
  actions:
  - move: 3
  - divider
  - attack: 4
    sub:
    - custom: "Remove any number of %fh-shadow% from hexes you entered with the move ability. For each %fh-shadow% removed:"
    - multi:
      - attack: 3
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - custom: "All enemies moved through gain %curse%."
  - mandatory:
    - dark
