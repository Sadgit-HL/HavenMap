# Pain Conduit (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Shared Affliction
initiative: 61
level: 1
top:
  actions:
  - custom: "Whenever you perform an attack, add all negative conditions you have except %brittle%, %bane%, and %stun% to the attack."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "Remove one negative condition you have to give one adjacent enemy the same condition."
  - mandatory:
    - air

name: Line of Transference
initiative: 25
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - custom: "Remove one negative condition you have to give the target the same condition."
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Transferred Injury
initiative: 74
level: 1
top:
  actions:
  - heal: 1
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [fire]
    - custom: "+1 %heal%"
  - attack: X
    sub:
    - range: 3
      enhancement: [square]
  - custom: "where X is the amount healed with the heal ability."
bottom:
  actions:
  - heal: 3
    enhancement: [circle]
    sub:
    - range: 3
  - mandatory:
    - wound: ''
      sub:
      - self

name: The Agony of Others
initiative: 78
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - optional:
    - consume: [fire]
    - custom: "Add +1 %attack% for each negative condition you have, %xp1%."
bottom:
  actions:
  - custom: "On the next three sources of %damage% you suffer while an enemy is within %range%3, one enemy within %range%3 suffers an equal amount of %damage%."
  - tokens: [1, 1, 1]
  lost: t
  duration: persistent

name: Unending Torment
initiative: 29
level: 1
top:
  actions:
  - heal: 5
    enhancement: [square]
    sub:
    - self
  - divider
  - group:
    - immobilize: ''
      sub:
      - self
    - custom: ":"
    - multi:
      - fire
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - heal: 5
    enhancement: [square]
    sub:
    - self
  - divider
  - group:
    - muddle: ''
      sub:
      - self
    - custom: ":"
    - multi:
      - air
      - custom: ","
      - custom: "%xp1%"

name: Blood Ritual
initiative: 56
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
  - mandatory:
    - damage: 2
      sub:
      - self
bottom:
  actions:
  - custom: "Whenever an ally within %range%3 gains a negative condition, you may gain that condition instead, even if you already have it."
  xp: 2
  lost: t
  duration: persistent

name: Scarred Effigy
initiative: 19
level: 1
top:
  actions:
  - summon:
      name: Flesh Fiend
      stats: [7, 2, 1, -]
      special:
      - custom: "When attacking, ignore %retaliate%"
      enhancement: [heal, move, attack]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - retaliate: 2
    enhancement: [square]
  duration: round

name: Explosive Wounds
initiative: 43
level: 1
top:
  actions:
  - custom: "One of your allies within %range%3 and all enemies adjacent to that ally suffer %damage%2."
  - optional:
    - consume: [fire]
    - damage: 1
    - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Remove all negative conditions from an adjacent ally to gain all the conditions removed."

name: Cleansing Fire
initiative: 64
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
    - wound
  - custom: "All allies and enemies adjacent to the target suffer %damage%1."
  - mandatory:
    - fire
bottom:
  actions:
  - heal: 1
    sub:
    - self
  - divider
  - move: 2
    enhancement: [circle]
  - divider
  - heal: 2
    sub:
    - self

name: Swift Vengeance
initiative: 21
level: 1
top:
  actions:
  - curse: ''
    sub:
    - target: X
    - range: 3
      enhancement: [square]
  - custom: "where X is the number of negative conditions you have."
  xp: 1
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+2 %move%"
  - loot: 1

name: Delayed Malady
initiative: 90
level: X
top:
  actions:
  - custom: "This action may be performed while you have %stun%."
  - custom: "Remove all negative conditions you have. Play a card from your hand and perform its top action either before or after you perform the bottom action of your other card you played this round."
bottom:
  actions:
  - custom: "During this and the next four rounds, you are unaffected by negative conditions you have, and they cannot be removed."
  - tokens: [1, 0, 1, 0, 1]
  lost: t
  duration: persistent

name: Unstable Effigy
initiative: 18
level: X
top:
  actions:
  - summon:
      name: Flesh Bomb
      stats: [3, 3, 2, -]
      special:
      - custom: "%ondeath%"
      - attack: 2
        sub:
        - target: "all enemies within 2 hexes"
      - mandatory:
        - fire
      enhancement: [heal, move, attack]
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 4
  - mandatory:
    - immobilize: ''
      sub:
      - target: "all adjacent enemies and self"
  - mandatory:
    - air

name: Pleasure in Pain
initiative: 47
level: X
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: "1 adjacent ally and self"
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - mandatory:
    - poison: ''
      enhancement: [diamond]
      sub:
      - target: "1 ally within %range%4 and self"
  - custom: "All enemies within %range%3 suffer %damage%1."

name: Reversal of Fate
initiative: 23
level: 2
top:
  actions:
  - heal: 5
    enhancement: [diamondPlus]
    sub:
    - range: 4
    - bless
  - divider
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 4
    - curse
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "On the next %damage% you suffer from an attack, the attacker suffers an equal amount of %damage%."
  - tokens: [0]
  duration: persistent

name: Infection Purge
initiative: 45
level: 2
top:
  actions:
  - custom: "You and two enemies within %range%3 suffer %damage%1+X, where X is the number of negative conditions you have."
  - mandatory:
    - fire
  xp: 1
bottom:
  actions:
  - custom: "Whenever an ally within %range%3 would suffer %damage%, you may suffer that %damage% instead."
  xp: 2
  lost: t
  duration: persistent

name: Burned at Both Ends
initiative: 30
level: 3
top:
  actions:
  - custom: "Suffer up to %damage%4 to cause an enemy within %range%3 to suffer an equal amount of %damage%."
  - optional:
    - consume: [fire]
    - custom: "That enemy suffers +2 %damage%, %xp1%."
    noLine: true
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - mandatory:
    - disarm: ''
      sub:
      - target: "1 adjacent enemy and self"
  - mandatory:
    - fire

name: Reprisal
initiative: 70
level: 3
top:
  actions:
  - heal: 2
    sub:
    - self
  - divider
  - retaliate: 3
    enhancement: [square]
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+1 %retaliate%"
bottom:
  actions:
  - custom: "Whenever you suffer %damage% this round, one enemy within %range%2 suffers %damage%2."
  - move: 2
    enhancement: [circle]
  duration: round

name: Mirrored Misery
initiative: 72
level: 4
top:
  actions:
  - custom: "Designate an adjacent ally and perform:"
  - custom: "One enemy adjacent to the designated ally suffers %damage%X, where X is the difference between the ally's current and maximum hit point values, and then gains every negative condition the ally has."
  xp: 2
  lost: t
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "One adjacent enemy gains all negative conditions you have except %brittle%, %bane%, and %stun%."
  - mandatory:
    - air

name: Down to the Dirt
initiative: 39
level: 4
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "Add +3 %attack% and gain %xp1% if your current hit point value is less than half (rounded up) your maximum hit point value."
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - heal: X
    sub:
    - self
  - custom: "where X is the number of negative conditions you have."

name: Chained by Spite
initiative: 15
level: 5
top:
  actions:
  - custom: "At the start of each of your turns, you may suffer up to %damage%3 to cause one enemy within %range%3 to suffer an equal amount of %damage%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - retaliate: 2
    enhancement: [square]
    sub:
    - range: 2
  - mandatory:
    - fire
  duration: round

name: Chained by Despair
initiative: 15
level: 5
top:
  actions:
  - custom: "At the start of each of your turns, you may gain any one negative condition except %brittle% and %bane%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Whenever an enemy gives you a negative condition this round, that enemy also gains the same condition."
  - mandatory:
    - air
  duration: round

name: Hopelessness
initiative: 83
level: 6
top:
  actions:
  - bane: ''
    sub:
    - self
bottom:
  actions:
  - move: 6
    enhancement: [circle]
  - mandatory:
    - damage: 4
      sub:
      - self

name: Phantom Limb
initiative: 75
level: 6
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "This ability can be performed while you have %disarm%. If you have %disarm%, add +2 %attack% and gain %xp1%."
  - mandatory:
    - air
bottom:
  actions:
  - heal: 3
    enhancement: [circle]
    sub:
    - target: "all"
    - range: 2
  - custom: "Grant all figures whose hit point value was increased by the heal ability:"
  - attack: 3
  xp: 2
  lost: t

name: Reject the Gift
initiative: 20
level: 7
top:
  actions:
  - custom: "When you next would suffer %damage% this round while an enemy is adjacent to you, that enemy suffers that %damage% instead, and you gain %xp1%."
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Whenever you gain negative conditions this round, prevent the conditions."
  duration: round

name: Penance
initiative: 12
level: 7
top:
  actions:
  - custom: "All adjacent enemies suffer %damage%3."
  - optional:
    - consume: [fire]
    - damage: 1
    - custom: "%xp1%"
    noLine: true
  - mandatory:
    - damage: X
      sub:
      - self
    - custom: "where X is the number of enemies that suffered %damage% with this action."
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - divider
  - retaliate: 3
    enhancement: [square]
    sub:
    - range: 2
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+1 %range%"
  duration: round

name: Wave of Anguish
initiative: 68
level: 8
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [air]
    - custom: "%xp1%"
    - custom: "+2 %attack%"
  - custom: "For every %damage%2 suffered by the target from this attack, remove one negative condition you have to give the target the same condition."
bottom:
  actions:
  - move: 5
  - mandatory:
    - wound: ''
      enhancement: [diamond]
      sub:
      - self
  - mandatory:
    - fire

name: Wracked with Pain
initiative: 22
level: 8
top:
  actions:
  - multi:
    - wound: ''
    - custom: ","
    - stun: ''
      sub:
      - range: 3
  - custom: "Add %brittle% and gain %xp1% if your current hit point value is less than half your maximum hit point value (rounded up)."
bottom:
  actions:
  - heal: 5
    enhancement: [circle]
    sub:
    - self
  - optional:
    - consume: [fire]
    - custom: "%xp1%"
    - custom: "+2 %heal%"

name: Redemption
initiative: 33
level: 9
top:
  actions:
  - custom: "Whenever you suffer %damage%, one enemy within %range%2 suffers %damage%2."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "Remove all %curse% cards from your and all adjacent allies' attack modifier decks and shuffle those decks to add a number of %curse% cards to the monster attack modifier deck equal to the number %curse% cards removed."

name: The End of Everything
initiative: 99
level: 9
top:
  actions:
  - custom: "When you become exhausted, first perform:"
  - attack: 5
    sub:
    - target: 5
    - range: 5
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - custom: "This action may be performed while you have %stun%."
  - custom: "During this round, you are unaffected by negative conditions you have, and they cannot be removed."
  - move: 4
  duration: round
