# Trapper (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Caltrops
initiative: 25
level: 1
top:
  actions:
  - custom: "Create two %damage%1 traps in empty hexes within %range%2 ."
  xp: 1
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Furry facade
initiative: 85
level: 1
top:
  actions:
  - move: 1
  - divider
  - invisible: ''
    sub:
    - self
bottom:
  actions:
  - summon:
      name: Shaggy Lure
      stats: [2, -, -, -]
      special:
      - custom: "Perform:"
      - pull: 2
        sub:
        - range: 3
      - custom: "at end of turn."
      enhancement: [square, 0, 0, 0]
  - mandatory:
    - disarm: ''
      sub:
      - self
  duration: persistent

name: Boar Catcher
initiative: 20
level: 1
top:
  actions:
  - custom: "Create one %damage%4 trap in an empty hex within %range%2."
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump

name: Spike Pit
initiative: 47
level: 1
top:
  actions:
  - custom: "Create one %damage%3 , %immobilize% trap in an empty hex within %range%2."
  xp: 1
bottom:
  actions:
  - custom: "Relocate up to two traps within %range%2 to empty hexes within %range%4."

name: Electrified net
initiative: 53
level: 1
top:
  actions:
  - custom: "Create three %damage%2, %stun% traps in empty hexes within %range%2."
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "Create one %strengthen% trap in an adjacent empty hex."

name: Honeypot
initiative: 18
level: 1
top:
  actions:
  - loot: 1
  - custom: "You may choose to not collect any number of loot tokens with this ability. For each empty hex with a loot token you did not collect, create one %damage%2 trap in that hex."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Create one %heal%2 trap in an adjacent empty hex."

name: Enticing Bait
initiative: 30
level: 1
top:
  actions:
  - custom: "Create one %heal%4 trap in an adjacent empty hex."
  xp: 1
bottom:
  actions:
  - muddle: ''
    sub:
    - target: "all"
    - range: 3
  - custom: "Control all enemies targeted by the muddle ability:"
  - move: 2
  xp: 2
  lost: t

name: Exploding Decoy
initiative: 62
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
    - pull: 2
      enhancement: [square]
bottom:
  actions:
  - custom: "Designate the hex you are occupying and perform:"
  - move: 3
    enhancement: [circle]
  - custom: "If the designated hex is empty, create one %damage%2 trap in that hex, regardless of line-of-sight."

name: Flurry of Nails
initiative: 68
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [square]
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - custom: "Increase the %damage% or %heal% value of up to two traps you move through by 1."

name: Dismantle
initiative: 72
level: X
top:
  actions:
  - custom: "Destroy one adjacent trap to perform:"
  - attack: X
    sub:
    - range: 3
      enhancement: [square]
  - custom: "where X is the %damage% value of the destroyed trap. Also add all conditions of the destroyed trap to the attack."
bottom:
  actions:
  - custom: "Destroy one adjacent trap."
  - move: 3
  - custom: "Add the effects of the destroyed trap to an adjacent trap."

name: Spring Loaded
initiative: 15
level: X
top:
  actions:
  - custom: "Whenever you or an ally springs a trap during a move ability, add +2 %move% and %jump% to that move ability."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Place a character token on an enemy with %flying% within %range%3. That enemy no longer has %flying%. When that enemy dies, discard this card."
  duration: persistent

name: Improvised Improvement
initiative: 58
level: X
top:
  actions:
  - custom: "Replace one adjacent trap with a %damage%5 , %wound% trap."
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Create one %bless% trap in an adjacent empty hex."

name: Unavoidable Outcome
initiative: 45
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "If the target is adjacent to a trap, spring the trap, applying its effects to the target."
bottom:
  actions:
  - custom: "On the next instance of an enemy ending its movement in a hex adjacent to any trap, regardless of your line-of-sight, spring one trap adjacent to that enemy and apply its effects to that enemy."
  - tokens: [0]
  duration: persistent

name: Path of Pain
initiative: 38
level: 2
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - push: 2
      enhancement: [square]
  - custom: "For each trap the target springs due to this attack, add +2 %push%."
bottom:
  actions:
  - custom: "Create one %wound% trap in an adjacent empty hex."
  - move: 2
    enhancement: [circle]
  - custom: "Create one %wound% trap in an adjacent empty hex."

name: Extra Teeth
initiative: 22
level: 3
top:
  actions:
  - custom: "Create one %damage%5 trap in an empty hex within %range%3."
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Destroy all adjacent traps to create a trap in an empty hex within %range%2 that has the effects of all the destroyed traps added together. The new trap cannot apply the same condition more than once."

name: Pyrotechnics
initiative: 80
level: 3
top:
  actions:
  - custom: "Create one %heal%3 , %strengthen%, %bless% trap in an adjacent empty hex."
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Increase the %damage% or %heal% value of the next trap you create this round by 3."
  duration: round

name: Dangerous Ground
initiative: 31
level: 4
top:
  actions:
  - custom: "Create two %damage%3 traps in empty hexes within %range%2 ."
  xp: 1
bottom:
  actions:
  - custom: "Regardless of your line-of-sight, spring all traps and apply the effects of each individual trap to one figure within %range%2 of that trap."
  xp: 2
  lost: t

name: Stalker's Spoils
initiative: 10
level: 4
top:
  actions:
  - custom: "Create two %heal%3 traps in empty hexes within %range%2 ."
  xp: 1
bottom:
  actions:
  - move: 2
  - divider
  - loot: 1
  - divider
  - heal: "X+1"
    sub:
    - self
  - custom: "where X is the number of loot tokens gained with the loot ability."

name: Lure of the Snare
initiative: 59
level: 5
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 4
      enhancement: [square]
    - pull: 3
      enhancement: [square]
bottom:
  actions:
  - custom: "Designate a hex containing a trap within %range%3. Spring the trap and apply its effects to one figure adjacent to the trap."
  - move: 3
    enhancement: [square]
    sub:
    - jump
  - custom: "This movement must end in or adjacent to the designated hex."

name: Proficient Hunter
initiative: 26
level: 5
top:
  actions:
  - custom: "Increase the %damage% or %heal% value of one trap you create each round by 2."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - custom: "Create one %regenerate% trap in an adjacent empty hex."

name: Persistent Pitfalls
initiative: 13
level: 6
top:
  actions:
  - custom: "Replace one adjacent trap with one %damage%6 , %stun% trap."
  xp: 1
bottom:
  actions:
  - custom: "Immediately after any trap with a %damage% value of 2 or more is sprung this round and its effects are applied, create a trap that has half the %damage% value (rounded down) and all conditions of the sprung trap in the empty hex nearest to the sprung trap."
  duration: round

name: Cage of Thorns
initiative: 55
level: 6
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
      enhancement: [square]
  - custom: "Create one %damage%1 trap in each empty hex adjacent to the target."
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Relocate up to two traps within %range%4 to empty hexes adjacent to one enemy within %range%2."

name: Grasping Hazards
initiative: 8
level: 7
top:
  actions:
  - custom: "Create one %damage%2, %wound%, %poison%, %muddle%, %curse% trap in an adjacent empty hex."
  xp: 1
bottom:
  actions:
  - custom: "All traps affect figures with %flying% and %jump% movements this round. If any figure with %flying% is currently occupying a hex with a trap, it springs the trap."
  - move: 2
    enhancement: [circle]
  duration: round

name: Foxhole
initiative: 90
level: 7
top:
  actions:
  - custom: "Destroy one adjacent %damage% trap to perform:"
  - group:
    - attack: "X-1"
      sub:
      - range: 3
        enhancement: [square]
    - hex: et_t
  - custom: "where X is the %damage% value of the destroyed trap. Also add all conditions of the destroyed trap to the attacks."
  xp: 1
bottom:
  actions:
  - summon:
      name: Defense Grid
      stats: [8, -, 2, 3]
      special:
      - custom: "Create one %damage%2 trap in an adjacent empty hex at end of turn."
  xp: 2
  lost: t
  duration: persistent

name: Spike Strip
initiative: 67
level: 8
top:
  actions:
  - custom: "Designate an empty hex within %range%4. Create one %damage%2 trap in that hex and each empty hex on a direct path to it."
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Create one %immobilize% trap in each empty hex you leave during the movement."

name: Magnetic Shards
initiative: 37
level: 8
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 3
    - range: 3
    - push: 2
      enhancement: [square]
  xp: 1
bottom:
  actions:
  - custom: "Create two %heal%1 , %regenerate%, %ward% traps in adjacent empty hexes."
  xp: 1

name: Dangerous Cargo
initiative: 23
level: 9
top:
  actions:
  - custom: "Once each round, during one of your move abilities, place one %damage%3 trap in one empty hex you leave."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Designate all traps within %range%3."
  - move: 4
    enhancement: [square]
  - custom: "Regardless of your line-of-sight, relocate any number of designated traps to adjacent empty hexes."

name: Mother of All Traps
initiative: 86
level: 9
top:
  actions:
  - custom: "Destroy three traps within %range%3 to create one %damage%9 , %wound%, %poison%, %stun% trap in an empty hex within %range%3."
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "During this movement, you may apply any effects of traps sprung to any figure adjacent to the sprung trap instead of yourself."
