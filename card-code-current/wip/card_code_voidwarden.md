# Voidwarden (Jaws of the Lion, Gloomhaven 2nd edition update). The regular cards (level 1 to 9 and X) are read from the card pictures (blind reading,
# 2026-11-26, Claude readers;  comments mark the readers' doubts). The tutorial cards (level A and B) are the Secretariat conversion, not checked and not used.

name: Black Boon
initiative: 43
level: 1
top:
  actions:
    - heal: 5
      enhancement: [diamondPlus]
      sub:
        - range: 3
        # check: a banner with poison inside the pill after "range 3,"; may be a condition removed/applied, written as plain poison
        - poison
    - mandatory:
        - dark
bottom:
  actions:
    - move: 2
    - divider
    - custom: "One ally within %range% 3 may perform:"
    - move: 2
      enhancement: [circle]

name: Close to the Abyss
initiative: 72
level: 1
top:
  actions:
    - heal: 2
      sub:
        - target: 2
          enhancement: [square]
        - range: 2
          enhancement: [square]
    - custom: "All allies who remove %poison% with this heal gain %bless%."
bottom:
  actions:
    - custom: "Control all enemies within %range% 3:"
    - move: 1

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
        - custom: "+1 %attack%, %muddle%, %xp1%"
bottom:
  actions:
    - stun: ''
      sub:
        - range: 3
          enhancement: [square]
    - divider
    - mandatory:
        - curse: ''
          sub:
            - self
    - optional:
        - consume: [dark]
        - custom: "Ignore the %curse% instead."

name: Gift of the Void
initiative: 89
level: 1
top:
  actions:
    - poison: ''
      sub:
        - range: 3
    - divider
    - custom: "One adjacent ally may perform:"
    - attack: 3
      sub:
        - custom: '%target% the same enemy, %range% 4'
    - mandatory:
        - custom: "If they do, that ally suffers %damage% 2."
    - mandatory:
        - dark
bottom:
  actions:
    - heal: 2
      sub:
        - range: 3

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
    - mandatory:
        - ice
        - dark
  xp: 2
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - optional:
        - consume: [dark]
        - custom: "+2 %move%"

name: Lure of the Void
initiative: 67
level: 1
top:
  actions:
    - disarm: ''
      sub:
        - range: 3
          enhancement: [square]
    - divider
    - custom: "Control the target of the disarm ability:"
    - move: 1
    - optional:
        - consume: [dark]
        - custom: "+2 %move%, %xp1%"
bottom:
  actions:
    - custom: "One ally within %range% 3 may perform:"
    - attack: 5
    - optional:
        - consume: [dark]
        - custom: "+2 %attack%, %xp1%"
    - mandatory:
        - custom: "If they do, gain %xp1% and that ally suffers %damage% 2."
  lost: t

name: Master Influence
initiative: 83
level: 1
top:
  actions:
    # check: the any-element consume icon is written %wildc%
    - custom: "The first attack performed in each of your attack granting actions gains advantage, and you may %wildc% to +1 %attack% to it."
    - divider
    - custom: "Whenever you control enemies to attack, they use your attack modifier deck."
  xp: 2
  duration: persistent
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
    - mandatory:
        - ice

name: Signs of the Void
initiative: 15
level: 1
top:
  actions:
    - custom: "One ally within %range% 3 may perform:"
    # check: the shield marker is a small diamond with a cross, may be diamondPlus or plus
    - shield: 1
      enhancement: [diamondPlus]
    - move: 2
      enhancement: [circle]
  duration: round
bottom:
  actions:
    - custom: "At the start of your next five turns, perform %curse% %range% 2."
    # check: first circle dashed (no xp), 3rd and 5th circles carry xp 1
    - tokens: [0, 0, 1, 0, 1]
  duration: persistent
  lost: t

name: Suggestion
initiative: 23
level: 1
top:
  actions:
    - custom: "Designate one enemy within %range% 4. Control the designated enemy:"
    - move: 3
      enhancement: [circle]
    - attack: 3
      enhancement: [diamond]
    - divider
    - optional:
        - consume: [ice]
        - stun: ''
          sub:
            - custom: "%target% the designated enemy"
      noLine: true
  xp: 2
  lost: t
bottom:
  actions:
    - move: 3
    - divider
    - optional:
        - consume: [dark]
        - curse: ''
          sub:
            - range: 3
      noLine: true

name: Turn Out the Lights
initiative: 49
level: 1
top:
  actions:
    - attack: 2
      sub:
        - range: 3
      enhancement: [square]
    - optional:
        - consume: [dark]
        - custom: "+1 %attack%, %curse%, %xp1%"
bottom:
  actions:
    - custom: "Control one enemy within %range% 3:"
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 3
    - custom: "The controlled enemy suffers %damage% equal to the %damage% suffered by the target of the attack."
    - mandatory:
        - ice
  xp: 1
  lost: t

name: Wicked Scratch
initiative: 68
level: 1
top:
  actions:
    - custom: "One ally within %range% 2 may perform:"
    - attack: 3
      enhancement: [diamond]
    - mandatory:
        - dark
  xp: 1
bottom:
  actions:
    - loot: 1
    - divider
    - strengthen: ''
      sub:
        - range: 3

name: Cold Embrace
initiative: 71
level: X
top:
  actions:
    - curse: ''
      sub:
        - target: 3
          enhancement: [square]
        - range: 3
    - optional:
        - consume: [dark]
        - custom: "+1 %target%, +1 %range%, %xp1%"
  xp: 1
  lost: t
bottom:
  actions:
    - optional:
        - consume: [ice]
        - move: 3
      noLine: true
    - divider
    - mandatory:
        - custom: "All adjacent allies suffer %damage%1."
    - divider
    - bless: ''
      sub:
        - target: all allies
        - range: 1

name: Resigned Frenzy
initiative: 26
level: X
top:
  actions:
    - custom: "Control all enemies within %range% 3:"
    - attack: 2
      enhancement: [diamond]
  xp: 2
  lost: t
bottom:
  actions:
    - move: 4
    # check: the dashed box has a short line above it, may be standalone (divider and noLine) instead of attached to the move
    - optional:
        - consume: [dark]
        - custom: "-1 %move%, %xp1%"
    - divider
    - custom: "If you consumed %dark% as part of the move ability, perform:"
    - attack: 2

name: Sap Warmth
initiative: 59
level: X
top:
  actions:
    - poison: ''
      enhancement: [diamond]
      sub:
        - custom: '%range% 3'
    - divider
    - custom: "Immediately after the next three attacks by an ally targeting an enemy with %poison%, that ally may perform"
    - heal: 1
      sub:
        - self
    - custom: "."
    # check: three circles (dashed, solid, solid with xp 1); the last has a red persistent mark
    - tokens: [0, 0, 1]
    - mandatory:
        - dark
  duration: persistent
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - heal: 3
      sub:
        - target: all
        - range: 2
    - mandatory:
        - ice
  xp: 1
  lost: t

name: Crushing Cold
initiative: 86
level: 2
top:
  actions:
    - custom: "One ally within %range% 3 may perform:"
    - attack: 4
      sub:
        - target: 2
    - optional:
        - consume: [ice]
        - custom: "%muddle%, %xp1%"
  xp: 1
  lost: t
bottom:
  actions:
    - move: 3
    - divider
    - muddle: ''
      enhancement: [diamond]
      sub:
        - range: 3
    - mandatory:
        - ice

name: Give and Take
initiative: 21
level: 2
top:
  actions:
    - mandatory:
        - poison: ''
          sub:
            - custom: "%target% one ally or self, %range% 2"
    - divider
    - multi:
        - bless: ''
        - custom: ','
        - strengthen: ''
          sub:
            - custom: "%target% a different ally, %range% 3"
    - mandatory:
        - dark
bottom:
  actions:
    - move: 4
      enhancement: [circle]
      sub:
        - jump
    - divider
    - curse: ''
      sub:
        - custom: "%target% all enemies moved through with the move ability"
    - mandatory:
        - fire
        - ice
  xp: 1
  lost: t

name: Commanding Presence
initiative: 75
level: 3
top:
  actions:
    - custom: "At the start of your next five turns, one ally within %range% 3 may perform %attack% 2."
    # check: five circles (dashed, then four solid, xp 1 on the third and fifth); the fifth has a red persistent mark
    - tokens: [0, 0, 1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
      enhancement: [circle]
    - divider
    - mandatory:
        - curse: ''
          sub:
            - self
    - optional:
        - consume: [dark]
        - custom: "Ignore the %curse% instead."
    - divider
    - custom: "One ally within %range% 3 may perform:"
    - move: 3
      enhancement: [circle]

name: Taunting Fate
initiative: 13
level: 3
top:
  actions:
    # check: the enhancement marker after the heal value may be a diamond with a dot (diamondPlus)
    - heal: 6
      enhancement: [diamondPlus]
      sub:
        - range: 2
    - divider
    - mandatory:
        - custom: "Shuffle one %bless% card into the monster attack modifier deck."
  xp: 1
bottom:
  actions:
    - custom: "The next time you grant an attack this turn, add +1 %attack% to the entire attack action."
    - optional:
        - consume: [ice]
        - custom: "Add +2 %attack% instead"
    - divider
    - mandatory:
        - custom: "All attacks targeting you add +2 %attack% this round."
  duration: round

name: Savage Instinct
initiative: 51
level: 4
top:
  actions:
    - custom: "Control one enemy within %range%3."
    - attack: 3
      enhancement: [diamond]
      sub:
        - custom: "%target% all adjacent enemies of you"
    # check: the damage icon is read as %damage%
    - custom: "The controlled enemy suffers %damage%1 for each of its allies it targets."
  xp: 2
  lost: t
bottom:
  actions:
    - heal: 3
      sub:
        - custom: "%range%3"
        - strengthen
        # check: the dark banner with a poison icon inside the pill is written as a plain sub item
        - poison
    - optional:
        - consume: [ice]
        - custom: "%bless%"

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
    - mandatory:
        - dark
bottom:
  actions:
    - move: 4
    - divider
    - custom: "Control an adjacent enemy:"
    - move: 3
    - custom: "then the controlled enemy gains %immobilize%."
  xp: 1
  lost: t

name: Stand Fast
initiative: 90
level: 5
top:
  actions:
    - custom: "Place your Ward in an adjacent empty hex."
    - mandatory:
        - earth
  xp: 2
  duration: persistent
  lost: t
bottom:
  actions:
    - custom: "Control one ally or enemy within %range%3:"
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 3

name: Surge of Power
initiative: 81
level: 6
top:
  actions:
    - heal: X
      sub:
        - target: 1 ally
        - range: 3
        # check: the dark banner with a muddle icon inside the pill is written as a plain sub item
        - muddle
    # check: the gear-like star icon may be a class token rather than damage
    - custom: "where X is all %damage% on the target."
    - mandatory:
        - dark
  xp: 2
  lost: t
bottom:
  actions:
    - custom: "Any time you or any ally loses %poison%, that figure gains %strengthen%."
  xp: 2
  duration: persistent
  lost: t

name: Withering Conviction
initiative: 44
level: 6
top:
  actions:
    - custom: "Two allies within %range%2 may each suffer %damage%2. Each ally who does may perform:"
    - attack: 6
      sub:
        - range: 3
  xp: 2
  lost: t
bottom:
  actions:
    - mandatory:
        - curse:
          sub:
            - self
    - optional:
        - consume: [dark]
        - custom: "Ignore the %curse% instead."
    - divider
    - curse: ''
      enhancement: [diamond]
      sub:
        - target: 2
        - range: 4

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
        - custom: "%wound%, %xp1%"
bottom:
  actions:
    - custom: "Control one enemy within %range%3:"
    - attack: 2
      enhancement: [diamond]
      sub:
        - target: 3
        - range: 2
        - wound
    - optional:
        - consume: [dark]
        - custom: "+1 %range%"
  xp: 2
  lost: t

name: Spirit Hunger
initiative: 68
level: 7
top:
  actions:
    - custom: "One ally within %range% 2 may perform:"
    - attack: 5
      enhancement: [diamond]
    - heal: X
      sub:
        - self
    - custom: "where X is the amount of %damage% suffered %lf% by the target of the attack."
  xp: 2
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
        - custom: "+1 %heal%, +1 %range%"

name: Empowered Link
initiative: 59
level: 8
top:
  actions:
    - custom: "On your next three %heal% abilities when possible, %target% an additional ally."
    # check: xp bursts sit at the top right of the first (dashed) and third circles; the first circle may be the dashed one that gives xp
    - tokens: [1, 0, 1]
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - bless: ''
      sub:
        - custom: "%target% all, %range% 1"
    - mandatory:
        - ice

name: Lull into Oblivion
initiative: 11
level: 8
top:
  actions:
    - multi:
        - stun: ''
        - custom: ','
        - curse: ''
      sub:
        - target: 2
        - range: 3
    - custom: "If this card is discarded before the end of the round or either target suffers damage this round, both targets lose %stun%."
    - mandatory:
        - dark
  duration: round
bottom:
  actions:
    - custom: "You and all allies within %range% 2 may perform:"
    - move: 3
      enhancement: [circle]
    - optional:
        - consume: [dark]
        - custom: "+1 %move%, %xp1%"

name: Eye of the Void
initiative: 19
level: 9
top:
  actions:
    - poison: ''
      sub:
        - range: 4
    - divider
    - custom: "Control all enemies within %range% 3 of the target of the poison ability:"
    - attack: 2
      sub:
        - custom: "%target% the target of the poison ability, %range% 3"
    - mandatory:
        - dark
  xp: 2
  lost: t
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - mandatory:
        - custom: "All allies and enemies within %range% 3 suffer %damage% 1."
    - divider
    - strengthen: ''
      sub:
        - custom: "%target% all allies, %range% 3"

name: Possessed by Fate
initiative: 66
level: 9
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - target: 3
        - range: 2
        - poison
        - wound
    - optional:
        - consume: [dark]
        - custom: "%curse%, %xp1%"
bottom:
  actions:
    - custom: "One ally within %range% 3 may perform:"
    - attack: 8
      sub:
        - range: 3
    - optional:
        - consume: [ice]
        - custom: "%stun%, %xp1%"
    - mandatory:
        - custom: "If they do, gain %xp1% and this ally gains %poison%."
  lost: t

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
