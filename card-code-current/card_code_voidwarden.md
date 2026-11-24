# Voidwarden (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Black Boon
initiative: 43
level: A
top:
  actions:
  - heal: 3
    sub:
    - range: 3
bottom:
  actions:
  - move: 4

name: Turn Out the Lights
initiative: 49
level: A
top:
  actions:
  - attack: 3
    sub:
    - range: 3
bottom:
  actions:
  - custom: "Force one enemy within %range%3 to perform."
  - attack: 2
  - custom: "targeting an enemy of your choice adjacent to them."

name: Wicked Scratch
initiative: 68
level: A
top:
  actions:
  - custom: "One ally within %range%2 may perform."
  - attack: 4
bottom:
  actions:
  - move: 2
  - divider
  - strengthen: ''
    sub:
    - range: 3

name: Suggestion
initiative: 23
level: A
top:
  actions:
  - custom: "Force one enemy within %range%3 to perform."
  - attack: 3
  - custom: "targeting an enemy of your choice adjacent to them."
bottom:
  actions:
  - move: 3
  - divider
  - muddle: ''
    sub:
    - range: 3

name: Gift of the Void
initiative: 89
level: A
top:
  actions:
  - custom: "One ally within %range%3 may perform."
  - attack: 2
    sub:
    - range: 3
bottom:
  actions:
  - heal: 2
    sub:
    - range: 3

name: Lure of the Void
initiative: 67
level: A
top:
  actions:
  - stun: ''
    sub:
    - range: 3
bottom:
  actions:
  - custom: "One ally within %range%3 may perform."
  - attack: 3
  - custom: "If they do, this ally suffers %damage%1."

name: Lure of the Void
initiative: 67
level: B
top:
  actions:
  - disarm: ''
    sub:
    - range: 3
  - custom: "Force the target to perform."
  - move: 2
  - custom: "with you controlling the action."
bottom:
  actions:
  - custom: "One ally within %range%3 may perform."
  - attack: 6
  - custom: "If they do, this ally suffers %damage%2."
  lost: t

name: Wicked Scratch
initiative: 68
level: B
top:
  actions:
  - custom: "One ally within %range%2 may perform."
  - attack: 4
bottom:
  actions:
  - loot: 1
  - divider
  - strengthen: ''
    sub:
    - range: 3

name: Signs of the Void
initiative: 15
level: 1
top:
  actions:
  - custom: "One ally within %range%3 may perform."
  - shield: 1
    enhancement: [diamondPlus]
  - custom: "This same ally may perform."
  - move: 2
    enhancement: [circle]
bottom:
  actions:
  - custom: "At the start of your next five turns, perform a \"%curse%, %range%2\" action."
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"

name: Close to the Abyss
initiative: 72
level: 1
top:
  actions:
  - heal: 2
    sub:
    - range: 2
      enhancement: [circle]
    - target: 2
      enhancement: [circle]
  - optional:
    - custom: "All allies who remove %poison% with this heal gain %bless%."
bottom:
  actions:
  - custom: "Force all enemies within %range%3 to perform."
  - move: 1
  - custom: "with you controlling the actions."

name: Gift of the Void
initiative: 89
level: 1
top:
  actions:
  - multi:
    - poison: ''
      sub:
      - range: 3
    - dark
  - custom: "One adjacent ally may perform."
  - attack: 3
    sub:
    - range: 4
  - custom: "targeting the target of the %poison%. If they do, this ally suffers %damage%2."
bottom:
  actions:
  - heal: 2
    sub:
    - range: 3

name: Black Boon
initiative: 43
level: 1
top:
  actions:
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - range: 3
    - poison
  - dark
bottom:
  actions:
  - move: 2
  - custom: "One ally within %range%3 may perform."
  - move: 2
    enhancement: [circle]

name: Freeze the Soul
initiative: 58
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - poison
  - optional:
    - consume: [ice]
    - multi:
      - attack: 1
      - custom: ","
      - muddle: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - stun: ''
    sub:
    - range: 3
      enhancement: [circle]
  - divider
  - curse: ''
    sub:
    - self
  - optional:
    - consume: [dark]
    - custom: "Ignore the %curse% instead."

name: Wicked Scratch
initiative: 68
level: 1
top:
  actions:
  - custom: "One ally within %range%2 may perform."
  - attack: 3
    enhancement: [diamond]
  - multi:
    - dark
    - custom: "%xp1%"
bottom:
  actions:
  - loot: 1
  - divider
  - strengthen: ''
    sub:
    - range: 3

name: Turn Out the Lights
initiative: 49
level: 1
top:
  actions:
  - attack: 2
    sub:
    - range: 3
      enhancement: [circle]
  - optional:
    - consume: [dark]
    - multi:
      - attack: 1
      - custom: ","
      - curse: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "<small>Force one enemy within %range%3 to perform</small>"
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "<small>targeting an enemy of your choice. The acting enemy suffers damage equal to the damage suffered by the target.</small>"
  - multi:
    - ice
    - custom: "%xp1%"
  lost: t

name: Lure of the Void
initiative: 67
level: 1
top:
  actions:
  - disarm: ''
    sub:
    - range: 3
      enhancement: [circle]
  - custom: "Force the target to perform."
  - move: 1
  - optional:
    - consume: [dark]
    - multi:
      - move: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "with you controlling the action."
bottom:
  actions:
  - custom: "One ally within %range%3 may perform."
  - attack: 5
  - optional:
    - consume: [dark]
    - multi:
      - attack: 2
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "If they do, gain %xp1% and this ally suffers %damage%2."
  lost: t

name: Grasp of Doom
initiative: 36
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - poison
    - wound
    - curse
    - stun
    - multi:
      - ice
      - dark
      - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [dark]
    - custom: "+2 %move%"

name: Master Influence
initiative: 83
level: 1
top:
  actions:
  - custom: "The first attack performed in each of your attack granting actions gains Advantage, and you may %wild% to add +1 %attack% to it. In addition, when you grant monsters attacks, they use your attack modifier deck."
  - multi:
    - custom: "%xp2%"
    - custom: "%persistent%"
  lost: t
bottom:
  actions:
  - bless: ''
    sub:
    - range: 2
  - divider
  - poison: ''
    sub:
    - range: 2
  - ice

name: Suggestion
initiative: 23
level: 1
top:
  actions:
  - custom: "<small>Force one enemy within %range%4 to perform</small>"
  - move: 3
    enhancement: [circle]
  - custom: "<small>with you controlling the action and</small>"
  - multi:
    - attack: 3
      enhancement: [diamond]
    - custom: "%xp2%"
  - custom: "<small>targeting an enemy of your choice adjacent to them.</small>"
  - optional:
    - consume: [ice]
    - custom: "%stun% the acting enemy."
    noLine: true
  lost: t
bottom:
  actions:
  - move: 3
  - optional:
    - consume: [dark]
    - curse: ''
      sub:
      - range: 3
    noLine: true

name: Resigned Frenzy
initiative: 26
level: X
top:
  actions:
  - custom: "Force all enemies within %range%3 to perform."
  - attack: 2
    enhancement: [diamond]
  - custom: "targeting enemies of your choice adjacent to them."
  - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 4
  - optional:
    - consume: [dark]
    - multi:
      - move: -1
      - custom: ","
      - custom: "%xp1%"
    - attack: 2

name: Cold Embrace
initiative: 71
level: X
top:
  actions:
  - curse: ''
    sub:
    - range: 3
    - target: 3
      enhancement: [circle]
    - custom: "%xp1%"
  - optional:
    - consume: [dark]
    - multi:
      - range: 1
      - custom: ","
      - target: 1
      - custom: ","
      - custom: "%xp1%"
  lost: t
bottom:
  actions:
  - optional:
    - consume: [ice]
    - move: 3
    noLine: true
  - custom: "All adjacent allies suffer %damage%1."
  - bless: ''
    sub:
    - target: "all adjacent allies"

name: Sap Warmth
initiative: 59
level: X
top:
  actions:
  - multi:
    - poison: ''
      enhancement: [diamond]
      sub:
      - range: 3
    - dark
  - custom: "<small>The next three times after an ally attacks an enemy with %poison%, that ally may perform a \"%heal%1, self\" action.</small>"
  - multi:
    - custom: "%persistent%"
    - tokens: [0]
    - tokens: [0]
    - tokens: [1]
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 3
    sub:
    - target: "self and all allies within 2 hexes"
  - multi:
    - ice
    - custom: "%xp1%"
  lost: t

name: Give and Take
initiative: 21
level: 2
top:
  actions:
  - poison: ''
  - optional:
    - custom: "Target self or one ally within %range%2."
  - custom: "%bless%, %strengthen%"
  - custom: "Target a different ally within %range%3."
  - dark
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - divider
  - curse: ''
  - optional:
    - custom: "Target all enemies moved through during the movement."
  - multi:
    - fire
    - ice
    - custom: "%xp1%"
  lost: t

name: Crushing Cold
initiative: 86
level: 2
top:
  actions:
  - custom: "One ally within %range%3 may perform."
  - attack: 4
    sub:
    - target: 2
  - optional:
    - consume: [ice]
    - multi:
      - muddle: ''
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "%xp1%"
  lost: t
bottom:
  actions:
  - move: 3
  - divider
  - muddle: ''
    enhancement: [diamond]
    sub:
    - range: 3
  - ice

name: Taunting Fate
initiative: 13
level: 3
top:
  actions:
  - heal: 6
    enhancement: [diamondPlus]
    sub:
    - range: 2
  - custom: "Shuffle one %bless% card into the monster attack modifier deck."
  - custom: "%xp1%"
bottom:
  actions:
  - custom: "<small>The next time you grant an attack this turn, add +1 %attack% to the entire Attack action.</small>"
  - optional:
    - consume: [ice]
    - multi:
      - custom: "Add +2 %attack% instead."
    noLine: true
  - custom: "<small>All attacks targeting you add +2 %attack% this round. This card cannot be discarded before the end of the round.</small>"
  duration: round

name: Commanding Presence
initiative: 75
level: 3
top:
  actions:
  - custom: "<small>At the start of your next five turns, one ally within %range%3 may perform an \"%attack%2\" action.</small>"
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
  - divider
  - curse: ''
    sub:
    - self
  - optional:
    - consume: [dark]
    - custom: "Ignore the %curse% instead."
  - custom: "One ally within %range%3 may perform."
  - move: 3
    enhancement: [circle]

name: Savage Instinct
initiative: 51
level: 4
top:
  actions:
  - custom: "Force one enemy within %range%3 to perform."
  - attack: 3
    enhancement: [diamond]
  - custom: "targeting all other enemies adjacent to it. The acting enemy suffers %damage%1 for each enemy targeted."
  - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - heal: 3
    sub:
    - range: 3
    - strengthen
    - poison
  - optional:
    - consume: [ice]
    - bless: ''

name: The Last Journey
initiative: 38
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
    - curse
  - dark
bottom:
  actions:
  - move: 4
  - custom: "Force one adjacent enemy to perform."
  - move: 3
  - custom: "with you controlling the action. This enemy gains %immobilize%."
  - custom: "%xp1%"
  lost: t

name: Stand Fast
initiative: 90
level: 5
top:
  actions:
  - custom: "<small>Place the Ward in an adjacent empty hex. It is considered an obstacle for all purposes. All enemies that enter a hex adjacent to the Ward gain %poison%. All enemies gain Disadvantage on all their attacks not granted by you while within %range%3 of the Ward.</small>"
  - multi:
    - earth
    - custom: "%xp2%"
    - custom: "%persistent%"
  lost: t
bottom:
  actions:
  - custom: "One ally or enemy within %range%3 may perform."
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "targeting an enemy of your choice."

name: Withering Conviction
initiative: 44
level: 6
top:
  actions:
  - custom: "<small>Two allies within %range%2 may each suffer %damage%2. Each ally who does may perform</small>"
  - attack: 6
    sub:
    - range: 3
  - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - curse: ''
    sub:
    - self
  - optional:
    - consume: [dark]
    - custom: "Ignore the %curse% instead."
  - curse: ''
    enhancement: [diamond]
    sub:
    - range: 4
    - target: 2

name: Surge of Power
initiative: 81
level: 6
top:
  actions:
  - custom: "Heal all damage on one ally within %range%3. If you do, that ally gains %muddle%."
  - multi:
    - dark
    - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - custom: "Any time you or any ally loses %poison%, that figure gains %strengthen%."
  - multi:
    - custom: "%xp2%"
    - custom: "%persistent%"
  lost: t

name: Hateful Blast
initiative: 29
level: 7
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 3
    - muddle
  - optional:
    - consume: [dark]
    - multi:
      - wound: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "<small>Force one enemy within %range%3 to perform</small>"
  - multi:
    - attack: 2
      enhancement: [diamond]
      sub:
      - range: 2
      - wound
    - custom: "%xp2%"
  - optional:
    - consume: [dark]
    - range: 1
    noLine: true
  - custom: "<small>targeting three enemies of your choice.</small>"
  lost: t

name: Spirit Hunger
initiative: 68
level: 7
top:
  actions:
  - custom: "One ally within %range%2 may perform."
  - attack: 5
    enhancement: [diamond]
  - custom: "If they do, this ally may perform."
  - multi:
    - heal: X
    - custom: "%xp2%"
  - custom: "where X is the amount of damage suffered by the target of the attack."
  lost: t
bottom:
  actions:
  - move: 4
  - divider
  - heal: 2
    sub:
    - range: 2
  - optional:
    - consume: [ice]
    - multi:
      - heal: 1
      - custom: ","
      - range: 1

name: Lull into Oblivion
initiative: 11
level: 8
top:
  actions:
  - custom: "%stun%, %curse%"
  - range: 3
  - divider
  - target: 2
  - custom: "If this card is discarded before the end of the round or either target suffers damage this round, both targets lose %stun%."
  - multi:
    - dark
    - custom: "%round%"
bottom:
  actions:
  - custom: "You and all allies within %range%2 may perform."
  - move: 3
    enhancement: [circle]
  - optional:
    - consume: [dark]
    - multi:
      - move: 1
      - custom: ","
      - custom: "%xp1%"
    noLine: true

name: Empowered Link
initiative: 59
level: 8
top:
  actions:
  - custom: "On your next three Heal abilities when possible, target an additional ally."
  - multi:
    - custom: "%persistent%"
    - tokens: [1]
    - tokens: [0]
    - tokens: [1]
    - custom: "%lost%"
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - bless: ''
    sub:
    - target: "self and all adjacent allies"
  - ice

name: Eye of the Void
initiative: 19
level: 9
top:
  actions:
  - multi:
    - poison: ''
      sub:
      - range: 4
    - dark
  - custom: "Force all other enemies within %range%3 of the target to perform."
  - multi:
    - attack: 2
      sub:
      - range: 3
    - optional:
      - custom: "targeting that target."
    - custom: "%xp2%"
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "All allies and enemies within %range%3 suffer %damage%1."
  - strengthen: ''
    sub:
    - target: "all allies within 3 hexes"

name: Possessed by Fate
initiative: 66
level: 9
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 2
    - target: 3
    - poison
    - wound
  - optional:
    - consume: [dark]
    - multi:
      - curse: ''
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "One ally within %range%3 may perform."
  - attack: 8
    sub:
    - range: 3
  - optional:
    - consume: [ice]
    - multi:
      - stun: ''
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "If they do, gain %xp1% and this ally gains %poison%."
  lost: t
