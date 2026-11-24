Plagueherald (Gloomhaven 2nd edition), card code read from the card pictures with tools/card-extraction. A first draft, not checked against the cards.
name: Accelerated End
initiative: 76
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 4
          enhancement: [square]
    - custom: "Add %plague% and gain %xp1% if the target has %plague%."
bottom:
  actions:
    - custom: "Designate one enemy that has %plague% and perform:"
    - poison: ''
      sub:
        - custom: "%target% all figures adjacent to the designated enemy"

name: Biting Gnats
initiative: 21
level: 1
top:
  actions:
    - attack: 1
      enhancement: [square]
      sub:
        - target: 2
        - range: 5
        - plague
    - divider
    - muddle: ''
      sub:
        - custom: "%target% all enemies that have %plague%"
bottom:
  actions:
    - multi:
        - poison: ''
        - custom: ','
        - muddle: ''
      sub:
        - custom: "%target% all"
  xp: 2
  lost: t

name: Blistering Buboes
initiative: 14
level: 1
top:
  actions:
    - custom: "Choose up to four enemies that have %plague%. The first enemy suffers %damage%4, the second suffers %damage%3, the third suffers %damage%2, and the fourth suffers %damage%1."
  xp: 2
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "Each enemy adds -1 %attack% to all their attacks this round for each %plague% that enemy has."
  duration: round

name: Comorbid Sting
initiative: 61
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 4
          enhancement: [square]
        - custom: ','
        - poison
        - custom: ','
        - plague
bottom:
  actions:
    - custom: "You may give one ally within %range% 3 %poison% to grant that ally:"
    - attack: 2
      enhancement: [diamond]
      sub:
        - poison

name: Contagious Corpse
initiative: 16
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 3
          enhancement: [square]
    - custom: "If this attack kills the target, gain %xp1% and shuffle one %curse% card into the monster attack modifier deck."
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "Grant one ally within %range% 3 that has %poison%:"
    - shield: 2
  duration: round

name: Festering Sores
initiative: 11
level: 1
top:
  actions:
    - multi:
        - wound: ''
        - custom: ','
        - plague: ''
      sub:
        - range: 4
          enhancement: [square]
    - divider
    - custom: "When an enemy that has %plague% dies, you may discard this card to have two enemies within %range% 3 of the hex where it died gain %plague%."
  duration: persistent
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: "Each enemy adds -1 %move% to all their move abilities this round for each %plague% that enemy has."
  duration: round

name: Path of the Pox
initiative: 31
level: 1
top:
  actions:
    - custom: "One enemy that has %plague% suffers %damage%3, and all enemies adjacent to that enemy suffer %damage%1."
  xp: 1
bottom:
  actions:
    - plague: ''
      sub:
        - range: 4
          enhancement: [square]
    - custom: "One enemy within %range% 3 of the target gains %plague%. One enemy within %range% 2 of the second enemy gains %plague%. One enemy within %range% 1 of the third enemy gains %plague%. No enemy may gain %plague% more than once with this ability."
  xp: 2
  lost: t

name: Vile Pestilence
initiative: 27
level: 1
top:
  actions:
    - attack: 2
      sub:
        - custom: "%target% all enemies at any %range% that have %plague%"
  xp: 1
bottom:
  actions:
    - move: 4
      enhancement: [circle]

name: Virulent Strain
initiative: 72
level: 1
top:
  actions:
    - custom: "On the next three attacks performed by one of your allies that has %poison%, add +1 %attack%, %plague%."
    # check: first slot dashed, two solid slots; xp burst sits above the second circle, red marks after the last
    - tokens: [0, 1, 0]
  duration: persistent
bottom:
  actions:
    - custom: "Each enemy suffers %damage%1 for each %plague% that enemy has."

name: Wretched Yield
initiative: 84
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 3
          enhancement: [square]
    - custom: "Add +1 %attack% for each %plague% the target has."
    - divider
    - heal: X
      sub:
        - self
    - custom: "where X is the number of %plague% the target of the attack ability had before the attack."
  xp: 1
bottom:
  actions:
    - move: 4
      enhancement: [circle]

name: Delirium's Danse
initiative: 68
level: X
top:
  actions:
    - attack: 2
      enhancement: [square]
      sub:
        - range: 4
          enhancement: [square]
    - custom: "You may give one ally within %range% 3 (of you) %poison% to add %stun% and gain %xp1%."
bottom:
  actions:
    - stun: ''
      sub:
        - custom: "%target% all enemies that have %plague%"
  xp: 2
  lost: t

name: Gift of Rot
initiative: 47
level: X
top:
  actions:
    - loot: 1
    - divider
    - heal: 1
      sub:
        - custom: "%target% all allies that have %poison%"
        - range: 5
        - ward
    - custom: "For each target, you may heal that target as if they did not have %poison% (if you do, their %poison% is not removed)."
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - custom: "You may give one ally within %range% 3 %poison% to gain advantage on all your attacks this round."
  duration: round

name: Spread the Plague
initiative: 35
level: X
top:
  actions:
    - custom: "Control one enemy that has %plague%:"
    - attack: 4
      enhancement: [diamond]
      sub:
        - plague
  xp: 1
bottom:
  actions:
    - multi:
        - poison: ''
        - custom: ','
        - plague: ''
          sub:
            - custom: "%target% 1 enemy that is adjacent to one of your allies that has %poison%"
    - mandatory:
        - custom: "Remove %poison% from that ally."

name: Rot Maggots
initiative: 69
level: 2
top:
  actions:
    - attack: 4
      enhancement: [square]
      sub:
        - range: 3
          enhancement: [square]
        - poison
    - custom: "Each ally adjacent to the target gains %poison%."
bottom:
  actions:
    - custom: "At the end of this and your next three turns, each enemy suffers %damage%1 for each %plague% that enemy has."
    # check: first slot dashed, three solid slots; xp bursts at top right of the 2nd and 4th circles
    - tokens: [0, 1, 0, 1]
  duration: persistent
  lost: t

name: Sickening Strength
initiative: 19
level: 2
top:
  actions:
    - strengthen: ''
      sub:
        - custom: "%target% 2 allies that have %poison%"
        - range: 5
    - custom: "Each target may suffer %damage%2 to immediately play one card from their hand, performing either the top or bottom action of the card."
bottom:
  actions:
    - move: 4
      enhancement: [circle]

name: Cloying Miasma
initiative: 20
level: 3
top:
  actions:
    - attack: 1
      enhancement: [square]
      sub:
        - range: 4
        - disarm
        - plague
bottom:
  actions:
    - custom: "You and all allies gain advantage on all attacks targeting enemies that have %plague% this round."
  duration: round

name: Nightmarish Affliction
initiative: 43
level: 3
top:
  actions:
    - attack: 1
      enhancement: [square]
      sub:
        - range: 4
        - poison
        - curse
    - custom: "You may give one ally within %range% 3 (of you) %poison% to add +1 %target% and gain %xp1%."
bottom:
  actions:
    - custom: "On your next six ranged attack abilities, you may give one ally within %range% 3 (of you) %poison% to add +1 %target%."
    # check: which circles carry the xp 1 burst (read as circles 2, 4 and 6; the first dashed circle none)
    - tokens: [0, 1, 0, 1, 0, 1]
  duration: persistent
  lost: t

name: Rabid Bite
initiative: 70
level: 4
top:
  actions:
    - strengthen: ''
      sub:
        - custom: "%target% 1 normal or elite enemy that has %plague%"
    - divider
    - custom: "Control the target of the strengthen ability:"
    - move: 1
      enhancement: [square]
    - custom: "This movement must move toward a monster that does not have %plague%."
    - attack: 5
      sub:
        - plague
  xp: 1
bottom:
  actions:
    - move: 5
      enhancement: [circle]

name: Unwilling Sacrifice
initiative: 29
level: 4
top:
  actions:
    - custom: "One enemy suffers %damage%2 for each %plague% it has. You may remove any number of %plague% from that enemy, even if this ability kills it, to have that number of different enemies adjacent to it suffer %damage%1 and gain %plague%."
  xp: 1
bottom:
  actions:
    - poison:
      enhancement: [square]
      sub:
        - target: 3
        - range: 4

name: Compounding Infection
initiative: 62
level: 5
top:
  actions:
    - multi:
        - curse: ''
        - custom: ','
        - plague: ''
      sub:
        - range: 4
    # check: the square marker sits after the range 4 pill
    - divider
    - custom: "Whenever an enemy draws a %curse% during its attack, you may discard this card to have that enemy gain %curse%, %curse%, %plague%, %plague%."
  duration: persistent
bottom:
  actions:
    - custom: "Your character allies that have %poison% add +1 %attack% to all their attacks."
  xp: 2
  duration: persistent
  lost: t

name: Wilt and Wither
initiative: 91
level: 5
top:
  actions:
    - attack: 1
      enhancement: [square]
      sub:
        - target: 2
        - range: 5
        - plague
    - divider
    - custom: "Each enemy suffers %damage%1 for each %plague% that enemy has."
bottom:
  actions:
    - custom: "During this and your next turn, double all %damage% that enemies that have %plague% suffer."
    # check: xp 1 bursts at the upper right of both circles (dashed and solid)
    - tokens: [1, 1]
  duration: persistent
  lost: t

name: Crippling Malady
initiative: 26
level: 6
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - custom: "%target% 2 enemies at any %range% that have %plague%"
    - custom: "On each target, add +1 %attack% for each %plague% that target has."
  xp: 1
bottom:
  actions:
    - immobilize: ''
      sub:
        - custom: "%target% all enemies that have %plague%"

name: Succumb to the Gift
initiative: 81
level: 6
top:
  actions:
    - attack: 5
      enhancement: [diamond]
      sub:
        - custom: "%target% 1 enemy at any %range% that has %plague%, advantage"
    - divider
    - custom: "If the attack ability killed an enemy, gain %xp1% and create one %damage%3, %poison% trap in the featureless hex they occupied."
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - bless: ''
      sub:
        - custom: "%target% all allies that have %poison%, %range% 5"

name: Mass Extinction
initiative: 94
level: 7
top:
  actions:
    - attack: 4
      enhancement: [diamond]
      sub:
        - custom: "%target% 1 enemy at any %range% that has %plague%"
    - custom: "Whenever this ability kills an enemy, gain %xp1% and add +2 %attack%, +1 %target%."
  xp: 1
  lost: t
bottom:
  actions:
    - plague: ''
      sub:
        - range: 5

name: Tainted Offering
initiative: 33
level: 7
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 4
        - poison
    - divider
    - custom: "You may give one ally within %range% 3 (of you) %poison% to gain %xp1% and perform:"
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 3
        - poison
    - custom: "Perform the attack as if you were occupying the same hex as that ally."
bottom:
  actions:
    - heal: 2
      sub:
        - custom: "%target% all allies that have %poison%, %range% 5, %strengthen%"
    - custom: "Each target may %recover% one level 1 card from their discard pile. For each target, you may heal that target as if they did not have %poison% (if you do, their %poison% is not removed)."

name: Convert the Flock
initiative: 57
level: 8
top:
  actions:
    - custom: "Control all normal and elite enemies that have %plague%:"
    - move: 2
      enhancement: [square]
    - attack: 5
      enhancement: [diamond]
      sub:
        - poison
        - plague
  xp: 2
  lost: t
bottom:
  actions:
    - custom: "One enemy that has %poison% or %plague% gains %plague% and suffers %damage%3. If that enemy dies, gain %xp1% and you may %teleport% to the hex it occupied."

name: Creeping Lethargy
initiative: 13
level: 8
top:
  actions:
    - heal: 1
      enhancement: [square]
      sub:
        - target: all
    - divider
    - custom: "Each enemy adds -2%attack% to all their attacks this round for each %plague% that enemy has."
  duration: round
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - custom: "Negate the next %damage% one adjacent ally that has %poison% would suffer this round."
  duration: round

name: Disease Vector
initiative: 64
level: 9
top:
  actions:
    - attack: 1
      enhancement: [diamond]
      sub:
        - target: 3
        - range: 5
        - plague
    - divider
    - poison: ''
      sub:
        - custom: "%target% all enemies that have %plague%"
bottom:
  actions:
    - custom: "Each enemy suffers %damage%2 for each %plague% that enemy has."

name: Xorn's Embrace
initiative: 46
level: 9
top:
  actions:
    - custom: "Grant all allies that have %poison%:"
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 3
          enhancement: [square]
    - heal: X
      sub:
        - self
    - custom: "where X is the amount of %damage% dealt with the granted attack ability. This heal ignores %poison% (and does not remove %poison%)."
bottom:
  actions:
    - custom: "At the end of each of your turns, one enemy that has both %poison% and %plague% suffers %damage%3."
  xp: 2
  duration: persistent
  lost: t
