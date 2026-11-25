# Boneshaper (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Life in Death
initiative: 91
level: 1
top:
  actions:
  - summon:
      name: Shambling Skeleton
      stats: [3, 2, 2, -]
      enhancement: [heal, move, attack]
  - mandatory:
    - damage: 2
      sub:
      - self
  xp: 1
  duration: persistent
bottom:
  actions:
  - custom: "On the next three sources of %damage% to you, negate the %damage%."
  - tokens: [0, 0, 1]
  lost: t
  duration: persistent

name: Returned Servant
initiative: 81
level: 1
top:
  actions:
  - summon:
      name: Shambling Skeleton
      stats: [3, 2, 2, -]
      enhancement: [heal, move, attack]
  - mandatory:
    - damage: 2
      sub:
      - self
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Damned Horde
initiative: 71
level: 1
top:
  actions:
  - summon:
      name: Shambling Skeleton
      stats: [3, 2, 2, -]
      enhancement: [heal, move, attack]
  - mandatory:
    - damage: 2
      sub:
      - self
  xp: 1
  duration: persistent
bottom:
  actions:
  - curse: ''
    sub:
    - target: 2
      enhancement: [square]
    - range: 2
      enhancement: [square]

name: Transfer of Essence
initiative: 62
level: 1
top:
  actions:
  - strengthen: ''
    sub:
    - target: "1 ally"
    - range: 3
  - optional:
    - consume: [dark]
    - multi:
      - target: 1
  - poison: ''
    sub:
    - range: 3
  - optional:
    - consume: [earth]
    - multi:
      - target: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - heal: 5
    sub:
    - target: "1 ally"
    - range: 3
  - mandatory:
    - damage: 2
      sub:
      - self
  - mandatory:
    - dark

name: Decaying Will
initiative: 46
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 5
    - poison
  - custom: "Add +1 %attack% if the target is adjacent to at least one of your summons."
  - mandatory:
    - earth
bottom:
  actions:
  - custom: "All of your summons' attacks are unaffected by %retaliate%."
  xp: 1
  lost: t
  duration: persistent

name: Dark Tidings
initiative: 43
level: 1
top:
  actions:
  - custom: "Grant three of your summons:"
  - attack: 0
    sub:
    - curse
  - optional:
    - consume: [dark]
    - multi:
      - poison: ''
      - custom: ","
      - custom: "%xp1%"
  xp: 1
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Angry Spirits
initiative: 76
level: 1
top:
  actions:
  - summon:
      name: Wraith
      stats: [1, 2, 1, 3]
      special:
      - fly: ''
      enhancement: [heal, move, range]
  - mandatory:
    - dark
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "On the next death of one of your summons due to %damage% from an attack, the attacker suffers %damage%2."
  - tokens: [0]
  duration: persistent

name: Fell Remedy
initiative: 30
level: 1
top:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3
  - optional:
    - consume: [earth]
    - multi:
      - heal: 2
  - optional:
    - consume: [dark]
    - multi:
      - heal: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - heal: 1
    sub:
    - self
  - custom: "If an enemy has died this round, perform:"
  - heal: 1
    sub:
    - self

name: Flow of the Black River
initiative: 18
level: 1
top:
  actions:
  - heal: "X+1"
    sub:
    - self
  - custom: "Where X is the number of your summons."
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Grant one of your summons:"
  - move: 2
    enhancement: [square]

name: Command the Wretched
initiative: 83
level: 1
top:
  actions:
  - custom: "Grant one of your summons:"
  - move: 0
  - attack: 0
  - optional:
    - consume: [dark]
    - multi:
      - pierce: 2
    noLine: true
bottom:
  actions:
  - custom: "Grant one ally:"
  - attack: 5
  xp: 1
  lost: t

name: Eternal Torment
initiative: 70
level: 1
top:
  actions:
  - curse: ''
    sub:
    - range: 5
  - custom: "Grant one of your summons adjacent to the target of the curse ability:"
  - attack: 0
  - mandatory:
    - dark
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - loot: 1
  - custom: "with you gaining all looted tokens and tiles."

name: Malicious Conversion
initiative: 26
level: 1
top:
  actions:
  - attack: 4
    enhancement: [circle]
  - custom: "If this attack kills the target, immediately play a card from your discard pile to perform a summon action of the card, reducing any %damage% you suffer by 2."
  - mandatory:
    - consume: [earth/dark]
  xp: 1
  lost: t
bottom:
  actions:
  - move: 3
  - optional:
    - consume: [earth]
    - multi:
      - move: 2

name: Approach Oblivion
initiative: 53
level: X
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - target: "all allies"
    - range: 2
    - bless
  - mandatory:
    - damage: 2
      sub:
      - self
  - mandatory:
    - curse: ''
      sub:
      - self
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - move: 3
    enhancement: [square]
  - mandatory:
    - air

name: Exploding Corpse
initiative: 21
level: X
top:
  actions:
  - custom: "Designate one of your summons and perform:"
  - attack: 4
    enhancement: [diamond]
    sub:
    - target: "all enemies adjacent to the designated summon"
  - mandatory:
    - custom: "Kill the designated summon."
  - mandatory:
    - fire
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "When the next enemy dies this round, all allies and enemies adjacent to the hex in which it died suffer %damage%2."
  duration: round

name: Wrath of the Turned Earth
initiative: 80
level: X
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 1
  - optional:
    - consume: [earth]
    - multi:
      - poison: ''
      - custom: ","
      - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - custom: "On the next three sources of %damage% to one of your summons, negate the %damage%."
  - tokens: [1, 0, 1]
  lost: t
  duration: persistent

name: Unearthed Horror
initiative: 94
level: 2
top:
  actions:
  - summon:
      name: Raging Corpse
      stats: [6, 2, 3, -]
      enhancement: [heal, move, attack]
  - mandatory:
    - earth
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - poison: ''
    sub:
    - target: "all"
    - range: 1
  - mandatory:
    - earth

name: Bone Dagger
initiative: 29
level: 2
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - curse
  - custom: "Add +1 %attack% for each of your summons."
  - mandatory:
    - dark
  xp: 1
  lost: t
bottom:
  actions:
  - curse: ''
    sub:
    - range: 2
      enhancement: [square]
  - optional:
    - consume: [dark]
    - multi:
      - range: 2
  - custom: "If the target dies this round, immediately play a card from your discard pile to perform a summon action of the card, reducing any %damage% you suffer by 2."
  duration: round

name: Grave Digging
initiative: 96
level: 3
top:
  actions:
  - summon:
      name: Shambling Skeleton
      stats: [3, 2, 2, -]
      enhancement: [heal, move, attack]
  - mandatory:
    - damage: 1
      sub:
      - self
  xp: 1
  duration: persistent
bottom:
  actions:
  - custom: "Play a card from your discard pile to perform a summon action of the card."
  - mandatory:
    - damage: 1
      sub:
      - self
  - mandatory:
    - earth

name: Putrid Cloud
initiative: 28
level: 3
top:
  actions:
  - custom: "Designate one of your summons and perform:"
  - attack: 2
    sub:
    - target: "all enemies adjacent to the designated summon"
    - poison
  - mandatory:
    - custom: "Kill the designated summon."
  - mandatory:
    - earth
  xp: 1
bottom:
  actions:
  - custom: "Whenever an enemy attacks you or one of your summons, that enemy gains %poison%. If that enemy already has %poison%, it suffers %damage%1 after the attack instead."
  xp: 1
  lost: t
  duration: persistent

name: Critical Failure
initiative: 95
level: 4
top:
  actions:
  - custom: "Grant one of your summons:"
  - attack: 1
  - optional:
    - consume: [dark]
    - multi:
      - custom: "Grant two of your summons the attack ability instead."
    noLine: true
bottom:
  actions:
  - custom: "If %curse% causes an enemy to deal no %damage% during its attack, grant all your summons adjacent to that enemy:"
  - attack: 0
    sub:
    - target: "that enemy"
  xp: 2
  lost: t
  duration: persistent

name: Flesh Shield
initiative: 16
level: 4
top:
  actions:
  - custom: "Grant one ally within %range%3:"
  - shield: 1
  - optional:
    - consume: [earth]
    - multi:
      - shield: 1
    noLine: true
  - retaliate: 1
    enhancement: [diamondPlus]
  - optional:
    - consume: [dark]
    - multi:
      - retaliate: 1
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  duration: round
bottom:
  actions:
  - mandatory:
    - damage: 2
      sub:
      - self
  - custom: "On the next source of %damage% to one of your summons, negate the %damage%."
  - tokens: [0]
  duration: persistent

name: Unforgivable Methods
initiative: 98
level: 5
top:
  actions:
  - summon:
      name: Stitched Atrocity
      stats: [8, 2, 3, -]
      special:
      - wound: ''
      enhancement: [heal, move, attack]
  - mandatory:
    - damage: 2
      sub:
      - self
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - heal: 3
    sub:
    - range: 2
  - optional:
    - consume: [earth]
    - multi:
      - heal: 1
      - custom: ","
      - range: 1

name: Solid Bones
initiative: 32
level: 5
top:
  actions:
  - custom: "All Shambling Skeletons have +1 %heal%, +1 %move%, and %pierce%1."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [square]
  - mandatory:
    - earth

name: Rotting Multitude
initiative: 66
level: 6
top:
  actions:
  - summon:
      name: Shambling Skeleton
      stats: [3, 2, 2, -]
      enhancement: [heal, move, attack]
  - mandatory:
    - damage: 6
      sub:
      - self
  xp: 1
  duration: persistent
bottom:
  actions:
  - optional:
    - consume: [dark]
    - multi:
      - move: 4
      - custom: ","
      - custom: "%xp1%"
    noLine: true
  - custom: "Grant one of your summons:"
  - move: 4

name: Twisted Decree
initiative: 85
level: 6
top:
  actions:
  - custom: "Grant one of your summons:"
  - move: 1
  - attack: 1
  - mandatory:
    - dark
bottom:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 4
    - poison
    - curse

name: Recycled Limbs
initiative: 52
level: 7
top:
  actions:
  - optional:
    - consume: [earth/dark]
    - multi:
      - custom: "Play a card from your discard pile to perform a summon action of the card."
    noLine: true
  - custom: "Grant all your summons:"
  - move: 0
  - attack: 1
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "On the next three deaths of any figure, perform:"
  - heal: 2
    sub:
    - target: "1 ally"
    - range: 3
  - tokens: [0, 0, 1]
  - mandatory:
    - dark
  duration: persistent

name: Soul Claim
initiative: 23
level: 7
top:
  actions:
  - custom: "On the next three monster deaths within %range%3, add 1 %curse% card to the monster attack modifier deck."
  - tokens: [0, 0, 1]
  - mandatory:
    - dark
  duration: persistent
bottom:
  actions:
  - custom: "When the next monster dies this round, immediately play a card from your discard pile to perform a summon action of the card, reducing any %damage% you suffer by 2 and acting as if you occupied the hex in which that monster died."
  duration: round

name: Endless Numbers
initiative: 86
level: 8
top:
  actions:
  - summon:
      name: Bone Horde
      stats: [7, 3, 3, -]
      special:
      - custom: "+1 %attack% for each token on this card."
      enhancement: [heal, move, attack]
  - custom: "Shambling Skeletons may end their move abilities on this summon. If they do, kill them and add a token to this card, up to a maximum of five. Whenever this summon would suffer %damage%, you may remove a token to negate the %damage%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Grant one of your summons:"
  - move: 0
  - custom: "Grant one of your summons:"
  - optional:
    - consume: [dark]
    - multi:
      - wound: ''
      - custom: ","
      - target: "all"
      - custom: ","
      - range: 1
    noLine: true

name: Wailing from Beyond
initiative: 73
level: 8
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 3
      enhancement: [square]
    - range: 4
  - optional:
    - consume: [dark]
    - multi:
      - muddle: ''
  - custom: "All targets adjacent to at least one of your summons gain %curse%."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 3
  - optional:
    - consume: [earth]
    - multi:
      - ward: ''

name: Unholy Prowess
initiative: 97
level: 9
top:
  actions:
  - summon:
      name: Skeleton Sorcerer
      stats: [6, 3, 3, 3]
      enhancement: [heal, move, attack, range]
  - custom: "All Shambling Skeletons have +1 %heal%."
  - custom: "Whenever one of your summons kills an enemy with a ranged attack, %earth%/%dark%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - multi:
    - custom: "Ignore all"
    - mandatory:
      - damage: X
        sub:
        - self
    - custom: "abilities"
  - custom: "on your ability cards."
  - mandatory:
    - consume: [earth/dark]
  xp: 1
  lost: t
  duration: persistent

name: Behold the Shrouded Sun
initiative: 10
level: 9
top:
  actions:
  - custom: "The next enemy that kills one of your summons this round gains %bane%."
  - mandatory:
    - dark
  duration: round
bottom:
  actions:
  - mandatory:
    - damage: 2
      sub:
      - self
  - custom: "All enemies within %range%5 suffer %damage%1."
  - optional:
    - consume: [earth/dark]
    - multi:
      - damage: 1
    noLine: true
