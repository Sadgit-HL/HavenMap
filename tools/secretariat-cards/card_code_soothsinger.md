# Soothsinger (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Mobilizing Measure
initiative: 8
level: 1
top:
  actions:
  - custom: "%song% SONG: %low-note%"
  - custom: "At the end of each of your turns, grant the ally closest to you:"
  - move: 2
  - tokens: [1, 0, 0, 0]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - jump
  - custom: "Grant one adjacent ally:"
  - retaliate: 1
    enhancement: [square]
  duration: round

name: Bewildering Instrumental
initiative: 11
level: 1
top:
  actions:
  - custom: "%song% SONG: %high-note%"
  - custom: "At the end of each of your turns, the enemy with the highest current hit point value suffers %damage%1 and gains %muddle%."
  - tokens: [1, 0, 0, 0]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Grant one adjacent ally:"
  - shield: 1
  duration: round

name: Wearying Chant
initiative: 19
level: 1
top:
  actions:
  - custom: "%song% SONG: %high-note% %low-note%"
  - custom: "At the end of each of your turns, the closest enemy to you that does not have %disarm% or %stun% gains %disarm%."
  - tokens: [1, 0]
  duration: persistent
bottom:
  actions:
  - heal: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
  - custom: "%low-note%"

name: Power Ballad
initiative: 12
level: 1
top:
  actions:
  - custom: "%song% SONG: %high-note% %high-note% %low-note%"
  - custom: "You and each ally add +1 %attack% to your first attack each turn."
  - tokens: [1, 0, 1]
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Dissonant Rhythm
initiative: 14
level: 1
top:
  actions:
  - custom: "%song% SONG: %high-note% %low-note% %low-note%"
  - custom: "At the end of each of your turns, perform:"
  - attack: 2
    sub:
    - target: "the enemy closest to you"
    - push: 2
    - pierce: 2
  - tokens: [1, 0, 1]
  duration: persistent
bottom:
  actions:
  - muddle: ''
    sub:
    - target: 3
      enhancement: [square]
    - range: 3
      enhancement: [square]
  - custom: "%high-note%"

name: Increase Cadence
initiative: 32
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 4
    - muddle
  - custom: "%high-note%"
bottom:
  actions:
  - custom: "At the end of this an your next five turns, gain one Note of your choice in addition to any other Note gained."
  - tokens: [1, 0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Intensifying Amplitude
initiative: 56
level: 1
top:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - range: 3
    - wound
  - custom: "%low-note%"
bottom:
  actions:
  - custom: "On your allies' next five attacks, add +X%attack% where X is the number of use slots the character token has passed (0, 1, 2, 3, 4)."
  - tokens: [0, 1, 0, 1, 0]
  lost: t
  duration: persistent

name: Marching Beat
initiative: 21
level: 1
top:
  actions:
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  - custom: "%high-note%"
bottom:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - move: 4
    enhancement: [square]
  - custom: "%low-note%"

name: Tuning the Outcome
initiative: 44
level: 1
top:
  actions:
  - bless: ''
    enhancement: [diamondPlus]
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  - custom: "%low-note%"
bottom:
  actions:
  - curse: ''
    sub:
    - range: 3
      enhancement: [square]
  - custom: "%high-note%"

name: Call to Action
initiative: 27
level: 1
top:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - move: 3
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
  - custom: "%low-note%"
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Singing Arrow
initiative: 85
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3
    - curse
  - custom: "%high-note%"
bottom:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
      enhancement: [square]
  - custom: "%low-note%"

name: Defensive Ditty
initiative: 9
level: X
top:
  actions:
  - custom: "%song% SONG: %high-note% %high-note%"
  - custom: "You and all allies gain %shield%1."
  - tokens: [1, 0]
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Echoing Aria
initiative: 5
level: X
top:
  actions:
  - custom: "%song% SONG: %low-note% %low-note%"
  - custom: "You and all allies gain %retaliate%1 %range%2."
  - tokens: [1, 0, 0, 0]
  duration: persistent
bottom:
  actions:
  - attack: 1
    enhancement: [square]
    sub:
    - range: 4
  - divider
  - loot: 1
  - custom: "%high-note%"

name: Provoke Terror
initiative: 89
level: X
top:
  actions:
  - group:
    - push: 2
      enhancement: [square]
      sub:
      - range: 4
      - stun
    - hex: xtt_ttx
  - custom: "%low-note%"
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]

name: Onward to Battle
initiative: 91
level: 2
top:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - attack: 4
    enhancement: [diamond]
  - custom: "%high-note%"
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Soothing Lullaby
initiative: 20
level: 2
top:
  actions:
  - custom: "%song% SONG: %high-note%"
  - custom: "At the end of each of your turns, perform:"
  - heal: 1
    sub:
    - target: "all"
  - tokens: [1, 0, 0]
  duration: persistent
bottom:
  actions:
  - custom: "Place your character token on a monster within %range%3. At the end of that enemy's turn this round, remove your character token and that enemy gains %disarm%."
  - custom: "%low-note%"
  duration: round

name: Symphonic Medley
initiative: 62
level: 3
top:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - attack: 3
    sub:
    - range: 2
      enhancement: [square]
  - custom: "%low-note%"
bottom:
  actions:
  - custom: "You may immediately play up to three cards from your hand to perform one 1-Note %song% action, one 2-Note %song% action, and one 3-Note %song% action, ignoring the Note requirements of those actions."
  - custom: "%low-note%"
  xp: 1
  lost: t
  remove: t

name: Ode to the Gambler
initiative: 15
level: 3
top:
  actions:
  - custom: "%song% SONG: %high-note% %low-note%"
  - custom: "You and each ally may individually choose (after revealing the card) to treat the first attack modifier card drawn each turn as %rolling%."
  - tokens: [1, 0, 0, 0]
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [circle]

name: Hymn to the Oak
initiative: 10
level: 4
top:
  actions:
  - ward: ''
    enhancement: [diamondPlus]
    sub:
    - target: 2
      enhancement: [square]
    - range: 3
      enhancement: [square]
  - custom: "%low-note%"
bottom:
  actions:
  - custom: "Grant all allies:"
  - shield: 1
  - custom: "%high-note%"
  duration: round

name: Alluring Serenade
initiative: 24
level: 4
top:
  actions:
  - custom: "%song% SONG: %low-note% %low-note%"
  - custom: "At the end of each of your turns, perform:"
  - pull: 3
    sub:
    - range: 5
    - curse
  - tokens: [1, 0, 0]
  duration: persistent
bottom:
  actions:
  - heal: 3
    enhancement: [square]
    sub:
    - range: 4
    - pull: 3
  - custom: "%high-note%"

name: Change Tempo
initiative: 25
level: 5
top:
  actions:
  - group:
    - multi:
      - immobilize: ''
      - custom: ","
      - muddle: ''
        sub:
        - range: 4
    - hex: etx_tt
  - custom: "%high-note%"
bottom:
  actions:
  - curse: ''
    enhancement: [diamond]
    sub:
    - range: 4
  - divider
  - bless: ''
    enhancement: [diamondPlus]
    sub:
    - range: 4
  - custom: "%low-note%"

name: Thrilling Solo
initiative: 60
level: 5
top:
  actions:
  - custom: "%song% SONG: %high-note% %low-note% %low-note%"
  - custom: "Immediately after you perform your first attack ability from your ability cards each round, you may repeat that attack ability, adding +1 %attack% (you may choose a new target)."
  - tokens: [1, 0, 1, 0]
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "%low-note%"

name: Pull the Strings
initiative: 34
level: 6
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - custom: "Control the target of the attach ability:"
  - move: 2
    enhancement: [square]
  - custom: "%high-note%"
bottom:
  actions:
  - custom: "Control one enemy within %range%5:"
  - attack: 0

name: Disorienting Dirge
initiative: 13
level: 6
top:
  actions:
  - custom: "%song% SONG: %high-note% %high-note%"
  - custom: "All enemies gain disadvantage on all their attacks."
  - tokens: [1, 0, 0]
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Negate the next %damage% an ally within %range%2 would suffer this round."
  duration: round

name: Inspiring Anthem
initiative: 50
level: 7
top:
  actions:
  - custom: "Grant one ally:"
  - move: 5
    enhancement: [square]
    sub:
    - jump
  - divider
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - custom: "%low-note%"
bottom:
  actions:
  - custom: "Grant one ally:"
  - attack: 5
    enhancement: [diamond]

name: Wistful Wounding
initiative: 6
level: 7
top:
  actions:
  - custom: "%song% SONG: %low-note%"
  - custom: "You and each ally add %wound% to your first attack each turn."
  - tokens: [1, 0]
  duration: persistent
bottom:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - retaliate: 2
    enhancement: [square]
    sub:
    - range: 2
  - custom: "%high-note%"
  duration: round

name: Commanding Presence
initiative: 65
level: 8
top:
  actions:
  - custom: "Grant one ally within %range%3 :"
  - attack: 3
    sub:
    - target: "all adjacent enemies"
  - custom: "%high-note%"
bottom:
  actions:
  - move: 6
    enhancement: [circle]

name: Toughening Trill
initiative: 78
level: 8
top:
  actions:
  - custom: "%song% SONG: %high-note% %low-note%"
  - custom: "You and all allies gain %shield%1 and %retaliate%1 %range%2."
  - tokens: [1, 0, 0, 0]
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3

name: Grand Finale
initiative: 46
level: 9
top:
  actions:
  - move: 4
    enhancement: [circle]
    sub:
    - jump
  - custom: "Control all enemies moved through with the move ability:"
  - attack: 3
    enhancement: [diamond]
  - custom: "Gain one Note of your choice in addition to any other Note you gain this round."
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "You may immediately play any number of cards from your hand and discard pile to perform %song% actions of the cards, ignoring all Note requirements. Skip moving your character token on active %song% this round."
  lost: t
  remove: t
  duration: round

name: Captivating Performance
initiative: 71
level: 9
top:
  actions:
  - custom: "%song% SONG: %high-note% %high-note% %low-note% %low-note%"
  - custom: "At the end of each of your turns, perform:"
  - group:
    - disarm: ''
      sub:
      - range: 3
    - hex: et_tt
  - tokens: [1, 1]
  duration: persistent
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Move you character tokens on each of your active %song% abilities backward one slot."
