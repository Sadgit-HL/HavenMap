# Wildfury (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Concentrated Rage
initiative: 51
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - range: 3
    - disarm
bottom:
  actions:
  - custom: "Whenever %bear-summon% attacks or suffers %damage% from %retaliate%, place one damage token on this card. Whenever %bear-summon% attacks and there are already three or more damage tokens on this card, instead of adding one, remove three to add +3 %attack% to the attack."
  xp: 2
  lost: t
  duration: persistent

name: Maul
initiative: 67
level: 1
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 4
    enhancement: [diamond]
  xp: 1
bottom:
  actions:
  - custom: "%command% COMMAND"
  - attack: 6
    enhancement: [diamond]
  xp: 2
  lost: t

name: Howling Bolts
initiative: 31
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - target: 3
    - range: 4
    - pierce: 3
  - mandatory:
    - air
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "%command% COMMAND"
  - heal: 3
    enhancement: [square]
    sub:
    - self
  - mandatory:
    - earth

name: Nature's Gift
initiative: 42
level: 1
top:
  actions:
  - heal: 2
    enhancement: [diamondPlus]
    sub:
    - range: 3
    - safeguard
  - mandatory:
    - earth
bottom:
  actions:
  - multi:
    - poison: ''
    - custom: ","
    - muddle: ''
      sub:
      - range: 5
  - mandatory:
    - earth

name: Focused Aggression
initiative: 14
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - mandatory:
    - air
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - custom: "Grant one adjacent ally:"
  - shield: 1
  - custom: "If the target of the grant ability is %bear-summon%, also grant them:"
  - retaliate: 1
  duration: round

name: Gnaw
initiative: 20
level: 1
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 2
    enhancement: [diamond]
  - divider
  - loot: 1
  - custom: "The Wildfury gains all looted tokens and tiles."
bottom:
  actions:
  - custom: "%command% COMMAND"
  - attack: 2
  xp: 1

name: Disorienting Roar
initiative: 17
level: 1
top:
  actions:
  - custom: "%command% COMMAND"
  - muddle: ''
    sub:
    - target: "all"
    - range: 2
  - custom: "All enemies within %range%2 that have %muddle% add -1 %attack% to their attacks this round."
  xp: 1
  duration: round
bottom:
  actions:
  - custom: "! %air%:"
  - custom: "After each of %bear-summon%'s next three attacks, triggering no more than once each round, %command%:"
  - move: 3
    sub:
    - jump
  - tokens: [1, 0, 0]
  duration: persistent

name: Vitality Siphon
initiative: 56
level: 1
top:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [air]
    - multi:
      - attack: 2
      - custom: ","
      - custom: "%xp1%"
  - heal: 1
    enhancement: [diamondPlus]
    sub:
    - range: 3
      enhancement: [square]
  - optional:
    - consume: [earth]
    - multi:
      - heal: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 5
    enhancement: [square]

name: Spirit Swap
initiative: 27
level: 1
top:
  actions:
  - custom: "%command% COMMAND"
  - move: 1
    enhancement: [circle]
  - consume: [air/earth]
  - attack: 2
    enhancement: [diamond]
    sub:
    - wound
bottom:
  actions:
  - custom: "%teleport% any normal or elite enemy to a hex occupied by a different normal or elite enemy and simultaneously %teleport% that enemy to the hex occupied by the first."
  - mandatory:
    - air

name: Invocation of Endurance
initiative: 71
level: 1
top:
  actions:
  - custom: "! %earth%:"
  - custom: "After each of %bear-summon%'s next three attacks, triggering no more than once each round, %command%:"
  - heal: 2
    sub:
    - self
  - tokens: [1, 0, 0]
  duration: persistent
bottom:
  actions:
  - custom: "%command% COMMAND"
  - move: 3
    enhancement: [square]
    sub:
    - jump

name: Invocation of Spirit
initiative: 62
level: X
top:
  actions:
  - custom: "! %air%/%earth%:"
  - custom: "After each of %bear-summon%'s next three attacks, triggering no more than once each round, perform the following as if you occupied the same hex as %bear-summon%:"
  - attack: 2
    sub:
    - target: "1 enemy within 3 hexes"
  - tokens: [1, 0, 0]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - range: 2
      enhancement: [square]
  - optional:
    - consume: [earth]
    - multi:
      - heal: 1
      - custom: ","
      - custom: "%xp1%"
  - custom: "Add +1 %heal% if the target is %bear-summon%."

name: Gust Sigil
initiative: 22
level: X
top:
  actions:
  - custom: "! %air%:"
  - summon:
      name: Wind Idol
      stats: [1, -, -, -]
      special:
      - custom: "All allies within %range%3 add %pierce%1 to all their attacks."
      enhancement: [square, 0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [square]

name: Forceful Swipe
initiative: 35
level: X
top:
  actions:
  - custom: "%command% COMMAND"
  - group:
    - attack: 2
      enhancement: [square]
      sub:
      - push: 1
    - hex: xt_st_et
  xp: 1
bottom:
  actions:
  - custom: "%command% COMMAND"
  - move: 4
    enhancement: [square]

name: Energizing Strike
initiative: 48
level: 2
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 4
    enhancement: [diamond]
  - custom: "If you performed the attack ability, perform:"
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - self
bottom:
  actions:
  - heal: 1
    sub:
    - target: "all allies"

name: Earthen Spikes
initiative: 11
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - immobilize
  - mandatory:
    - earth
bottom:
  actions:
  - move: 5
    enhancement: [square]

name: Punch Through
initiative: 29
level: 3
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 3
    enhancement: [diamond]
    sub:
    - pierce: 2
  - optional:
    - consume: [air]
    - multi:
      - attack: 1
      - custom: ","
      - pierce: 2
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "%command% COMMAND"
  - move: 3
    enhancement: [circle]
  - custom: "Add +1 %attack% to all your attacks this round."
  duration: round

name: Stone Sigil
initiative: 15
level: 3
top:
  actions:
  - custom: "! %earth%:"
  - summon:
      name: Monolith
      stats: [2, -, -, -]
      special:
      - custom: "All allies within %range%3 gain %shield%1."
      enhancement: [square, 0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "If you are adjacent to %bear-summon%, perform:"
  - attack: 1
    enhancement: [diamond]
    sub:
    - range: 3
    - pierce: 1
    - muddle
  - optional:
    - consume: [air]
    - multi:
      - attack: 1
      - custom: ","
      - pierce: 1
      - custom: ","
      - custom: "%xp1%"

name: Unstoppable Beast
initiative: 32
level: 4
top:
  actions:
  - custom: "%command% COMMAND"
  - group:
    - attack: 3
      enhancement: [diamond]
    - hex: et_st_ex
  - optional:
    - consume: [earth]
    - multi:
      - attack: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - custom: "%command% COMMAND"
  - move: 5
    enhancement: [circle]

name: Forest's Blessing
initiative: 44
level: 4
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 3
      enhancement: [square]
    - bless
  - mandatory:
    - air
bottom:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - target: 2
      enhancement: [square]
    - range: 4
    - poison
  - divider
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - target: 2
      enhancement: [square]
    - range: 4
    - strengthen
  - mandatory:
    - consume: [air/earth]
  xp: 2
  lost: t

name: Rampage
initiative: 16
level: 5
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 2
    enhancement: [square]
  - divider
  - move: 2
  - divider
  - attack: 3
    enhancement: [diamond]
  - divider
  - move: 2
  - divider
  - attack: 4
    enhancement: [diamond]
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "%command% COMMAND"
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - muddle
  xp: 1

name: Invocation of Domination
initiative: 10
level: 5
top:
  actions:
  - custom: "! %air%:"
  - custom: "After each of %bear-summon%'s next four attacks, triggering no more than once each round, control the target of the attack:"
  - move: 2
  - divider
  - attack: 2
  - tokens: [1, 0, 0, 0]
  duration: persistent
bottom:
  actions:
  - custom: "Grant one ally within %range%4:"
  - shield: 1
    enhancement: [square]
  - poison: ''
    sub:
    - target: "all enemies adjacent to the target of the grant ability"
  - mandatory:
    - earth
  duration: round

name: Blood Hunger
initiative: 41
level: 6
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 3
    enhancement: [diamond]
    sub:
    - wound
  - custom: "If you performed the attack ability, perform:"
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - self
  xp: 1
bottom:
  actions:
  - custom: "%command% COMMAND"
  - mandatory:
    - custom: "At the end of each round, if you neither attacked nor were attacked that round, move this card to the lost pile."
  - shield: 1
  - divider
  - retaliate: 2
  xp: 2
  lost: t
  duration: persistent

name: Ancient Ward
initiative: 59
level: 6
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - disarm
  - optional:
    - consume: [air/earth]
    - custom: "+1 %target%, %xp2%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - heal: 1
    enhancement: [square]
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
    - air/earth

name: Invocation of Absorption
initiative: 24
level: 7
top:
  actions:
  - custom: "! %earth%:"
  - custom: "After each of %bear-summon%'s next three attacks, triggering no more than once each round, all enemies within %range%2 of %bear-summon% suffer %damage%1 and %bear-summon% performs:"
  - heal: X
    sub:
    - self
  - custom: "Where X is the number of enemies that suffered %damage%."
  - tokens: [1, 0, 0]
  duration: persistent
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
    - push: 2
      enhancement: [square]
  - mandatory:
    - air

name: Unleashed Fury
initiative: 65
level: 7
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 3
    enhancement: [diamond]
  - custom: "Double the value of all %attack% bonuses from your ability cards on this attack."
bottom:
  actions:
  - custom: "%command% COMMAND"
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]

name: Lash Out
initiative: 46
level: 8
top:
  actions:
  - custom: "%command% COMMAND"
  - attack: 4
    sub:
    - target: "all adjacent enemies"
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "%teleport% to the hex occupied by %bear-summon% and simultaneously %teleport% %bear-summon% to the hex occupied by you."
  - move: 3
    enhancement: [circle]

name: Unbreakable Bond
initiative: 55
level: 8
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - divider
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - custom: "Perform this attack as if you occupied the same hex as %bear-summon%."
  - mandatory:
    - consume: [air/earth]
bottom:
  actions:
  - custom: "On the next three rounds, skip your card selection and your turn. Your character token does not advance on any of your other persistent abilities. %bear-summon% performs their turn twice at initiative 14 each round with you controlling it."
  - tokens: [1, 0, 1]
  lost: t
  duration: persistent

name: Spirit Sigil
initiative: 85
level: 9
top:
  actions:
  - custom: "! %air% %earth%:"
  - summon:
      name: Vital Force
      stats: [3, -, -, -]
      special:
      - custom: "All allies within %range%3 add +2 %attack% to their first attack each round."
      enhancement: [square, 0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - multi:
    - safeguard: ''
    - custom: ","
    - bless: ''
      sub:
      - target: "1 ally"
      - range: 1
        enhancement: [square]
  - mandatory:
    - consume: [air/earth]

name: Jaws of Death
initiative: 18
level: 9
top:
  actions:
  - custom: "%command% COMMAND"
  - move: 4
    enhancement: [circle]
  - divider
  - attack: 6
    enhancement: [diamond]
  - custom: "If this attack kills an enemy, gain %xp1% and repeat this action."
  lost: t
bottom:
  actions:
  - custom: "%command% COMMAND"
  - attack: 3
    enhancement: [diamond]
    sub:
    - push: 3
  - divider
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [diamond]
  xp: 1
