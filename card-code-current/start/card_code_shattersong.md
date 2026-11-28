# Shattersong (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Unrelenting Wail
initiative: 26
level: 1
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - group:
    - attack: X
      enhancement: [circle]
    - hex: et_tt_stt
  xp: 2
  lost: t
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - group:
    - custom: "-1 %fh-resonance%:"
    - push: 2
      sub:
      - range: 1

name: Lifting Voice
initiative: 29
level: 1
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "Grant all allies within %range%3 and self:"
  - move: X
  - mandatory:
    - air
  xp: 1
bottom:
  actions:
  - muddle: ''
    sub:
    - target: "all"
    - range: 2
    - group:
      - custom: "-1 %fh-resonance%: +3 %range%"

name: Heartening Harmony
initiative: 30
level: 1
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - heal: "X+2"
    enhancement: [square]
    sub:
    - range: "X+1"
  - mandatory:
    - light
  xp: 1
bottom:
  actions:
  - move: 1
  - divider
  - group:
    - custom: "-1 %fh-resonance%:"
    - strengthen: ''
      sub:
      - self

name: Forceful Vibrations
initiative: 27
level: 1
top:
  actions:
  - attack: 3
    enhancement: [square]
    sub:
    - range: 2
    - group:
      - custom: "-1 %fh-resonance%: +1 %range%, %push% 2, %muddle%"
bottom:
  actions:
  - move: 5
    enhancement: [circle]
    sub:
    - jump
  - custom: "Gain 2 %fh-resonance%."
  - mandatory:
    - light
  xp: 1
  lost: t

name: Resonant frequency
initiative: 88
level: 1
top:
  actions:
  - custom: "Destroy one obstacle within %range%3 to perform:"
  - attack: 2
    sub:
    - target: "all enemies adjacent to the destroyed obstacle"
  - optional:
    - consume: [earth]
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - custom: "Gain 2 %fh-resonance%."
  - mandatory:
    - damage: 2
      sub:
      - self
  - mandatory:
    - brittle: ''
      sub:
      - self

name: Foreboding Tremors
initiative: 21
level: 1
top:
  actions:
  - group:
    - attack: 2
      enhancement: [diamond]
      sub:
      - immobilize
      - group:
        - custom: "-2 %fh-resonance%:"
        - multi:
          - attack: 1
          - custom: ","
          - push: 1
          - custom: ","
          - custom: "%xp1%"
    - hex: et_st
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 1

name: Sonic Shock
initiative: 58
level: 1
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3
      enhancement: [square]
    - group:
      - custom: "-1 %fh-resonance%, %air%:"
      - multi:
        - brittle: ''
        - custom: ","
        - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Gain 1 %fh-resonance% if you are adjacent to at least four empty hexes."

name: Precious Gems
initiative: 10
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - divider
  - group:
    - custom: "-1 %fh-resonance%:"
    - multi:
      - loot: 1
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - custom: "Reveal the top card of the monster ability deck of one monster within %range%2."
  - optional:
    - consume: [air]
    - custom: "+3 %range%, %xp1%"
    noLine: true

name: Empowering Pulse
initiative: 22
level: 1
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - range: 2
  - custom: "Gain 2 %fh-resonance%."
  - mandatory:
    - air
  xp: 1
  lost: t
bottom:
  actions:
  - custom: "Grant one ally within %range%2:"
  - strengthen: ''
    sub:
    - self
  - shield: 1
  duration: round

name: Devastating Shout
initiative: 68
level: 1
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - attack: "X+1"
    sub:
    - range: 3
      enhancement: [square]
  - mandatory:
    - air
  xp: 1
bottom:
  actions:
  - group:
    - custom: "-1 %fh-resonance%:"
    - custom: "Destroy one adjacent obstacle or trap."
  - divider
  - move: 3
    enhancement: [circle]
  - divider
  - group:
    - custom: "-1 %fh-resonance%:"
    - custom: "Destroy one adjacent obstacle or trap."

name: Calamitous Yawp
initiative: 65
level: X
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "All allies and enemies within %range%2 suffer %damage%X/2 (rounded up)."
  - mandatory:
    - earth
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [square]
  - divider
  - group:
    - custom: "-1 %fh-resonance%:"
    - stun: ''
      sub:
      - range: 1
    - optional:
      - consume: [light]
      - custom: "+1 %target%"

name: Din of Battle
initiative: 14
level: X
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - muddle
  - custom: "Gain 1 %fh-resonance% if the attack ability targeted at least two enemies."
bottom:
  actions:
  - custom: "You and all allies within %range%1 each add +1 %attack% to one of your attacks this round."
  - group:
    - custom: "-X %fh-resonance%: +X %range%"
  duration: round

name: Illuminative Tone
initiative: 72
level: X
top:
  actions:
  - attack: 3
    enhancement: [diamond]
    sub:
    - range: 2
  - optional:
    - consume: [light]
    - custom: "%advantage%"
    - custom: "%xp1%"
    - custom: "+1 %attack%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - attack: 3
    enhancement: [square]
    sub:
    - target: "all adjacent enemies"
  lost: t

name: Transparency
initiative: 13
level: 2
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 4
  - custom: "Reveal the top card of the target's monster ability deck."
  - group:
    - custom: "-1 %fh-resonance%:"
    - multi:
      - attack: 1
      - custom: ","
      - pierce: 1
bottom:
  actions:
  - move: 3
  - custom: "All attacks targeting you this round gain disadvantage."
  - mandatory:
    - light
  duration: round

name: Befuddling Bellow
initiative: 18
level: 2
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "Grant all allies within %range%2 and self:"
  - shield: "X/2"
  - custom: "(rounded up)"
  - mandatory:
    - air
  xp: 1
  duration: round
bottom:
  actions:
  - immobilize: ''
    sub:
    - target: "all"
    - range: 2
    - group:
      - custom: "-1 %fh-resonance%: +1 %range%"

name: Shape the Path
initiative: 40
level: 3
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "For each %fh-resonance% spent, perform:"
  - bless: ''
    sub:
    - range: 1
  - mandatory:
    - light
  xp: 1
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Gain 1 %fh-resonance%."

name: Stealth Vibrations
initiative: 35
level: 3
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
  - custom: "Gain 1 %fh-resonance%."
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - group:
    - custom: "-2 %fh-resonance%:"
    - multi:
      - invisible: ''
        sub:
        - self
      - custom: ","
      - custom: "%xp1%"

name: Concentrated Blast
initiative: 38
level: 4
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - range: 3
    - group:
      - custom: "-1 %fh-resonance%: +1 %target%"
      - custom: "-2 %fh-resonance%:"
      - multi:
        - stun: ''
        - custom: ","
        - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [square]
  - divider
  - group:
    - custom: "-1 %fh-resonance%: One adjacent enemy suffers %damage%2."
  - mandatory:
    - air

name: Elemental Pulse
initiative: 25
level: 4
top:
  actions:
  - attack: 4
    enhancement: [diamond]
  - optional:
    - consume: [air]
    - custom: "+3 %range%"
  - optional:
    - consume: [light]
    - custom: "Gain 1 %fh-resonance%."
    noLine: true
  xp: 1
bottom:
  actions:
  - move: 4
  - optional:
    - consume: [air]
    - jump: ''
    - custom: "+1 %move%"
  - optional:
    - consume: [earth]
    - custom: "Gain 1 %fh-resonance%."
    noLine: true

name: Shrieking Chakram
initiative: 8
level: 5
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - attack: 4
    sub:
    - target: X
    - range: 4
  - mandatory:
    - air
  xp: 2
  lost: t
bottom:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "For each %fh-resonance% spent, perform:"
  - move: 1
  - custom: "One adjacent enemy that has not suffered %damage% from this action this turn suffers %damage%2."

name: Empowering note
initiative: 45
level: 5
top:
  actions:
  - custom: "Once for each non-persistent, non-loot ability you perform from one of your ability cards, you may spend 1 %fh-resonance% to increase any one value of a numeral written on that ability except experience by 1."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Destroy one adjacent obstacle to gain 1 %fh-resonance%."
  - mandatory:
    - earth

name: Unsustainable Wave
initiative: 36
level: 6
top:
  actions:
  - attack: 3
    sub:
    - range: 3
  - custom: "Two enemies within %range%2 of the target suffer %damage%X-2, where X is equal to the %damage% the target suffered from this attack."
  - optional:
    - consume: [earth]
    - attack: 1
    - custom: "%xp1%"
    noLine: true
bottom:
  actions:
  - custom: "Suffer up to %damage%5 to gain the same amount of %fh-resonance%."

name: Future Sense
initiative: 28
level: 6
top:
  actions:
  - attack: 2
    enhancement: [square]
    sub:
    - target: 2
    - range: 4
      enhancement: [square]
  - custom: "Reveal the top cards of the monster ability decks of all targets."
  - group:
    - custom: "-1 %fh-resonance%: +1 %target%"
bottom:
  actions:
  - move: 7
    enhancement: [circle]
    sub:
    - jump
  - custom: "Gain 3 %fh-resonance%."
  - mandatory:
    - earth
  xp: 1
  lost: t

name: Sound Therapy
initiative: 73
level: 7
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "One ally within %range%2 may %recover% up to X cards from their discard pile."
  xp: 1
bottom:
  actions:
  - heal: 4
    enhancement: [square]
    sub:
    - range: 3
  - mandatory:
    - light

name: Cloaking Refraction
initiative: 11
level: 7
top:
  actions:
  - attack: 5
    enhancement: [diamond]
  - divider
  - group:
    - custom: "-2 %fh-resonance%:"
    - multi:
      - invisible: ''
        sub:
        - self
      - custom: ","
      - custom: "%xp1%"
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Grant all adjacent allies and self:"
  - shield: 1
  - optional:
    - consume: [light]
    - shield: 1
    - custom: "%xp1%"
    noLine: true
  duration: round

name: Soft Spots
initiative: 47
level: 8
top:
  actions:
  - brittle: ''
    sub:
    - target: 2
    - range: 2
      enhancement: [square]
    - group:
      - custom: "-1 %fh-resonance%, %air%: +1 %target%, %xp1%"
bottom:
  actions:
  - move: 5
    enhancement: [circle]
    sub:
    - group:
      - custom: "-1 %fh-resonance%:"
      - jump: ''
  - divider
  - push: 2
    sub:
    - target: 2
    - range: 1

name: Feedback
initiative: 24
level: 8
top:
  actions:
  - custom: "Immediately after each WAVE ability, gain 1 %fh-resonance%."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - muddle: ''
    sub:
    - target: "all"
    - range: 2
    - group:
      - custom: "-1 %fh-resonance%: +3 %range%"
  - mandatory:
    - air

name: Barbaric Yawp
initiative: 66
level: 9
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "All allies and enemies within %range%2 suffer %damage%X."
  - optional:
    - consume: [wild]
    - custom: "+1 %range%"
    noLine: true
  - optional:
    - consume: [wild]
    - custom: "+1 %range%"
    noLine: true
  xp: 1
bottom:
  actions:
  - move: 3
    enhancement: [circle]
    sub:
    - group:
      - custom: "-1 %fh-resonance%:"
      - move: 2
  - custom: "You and all adjacent allies gain advantage on all your attacks this round."
  duration: round

name: Violent Vibrations
initiative: 5
level: 9
top:
  actions:
  - custom: "WAVE: -X %fh-resonance%"
  - custom: "Grant all allies within %range%2 and self:"
  - shield: "X+1"
  - retaliate: "X+1"
  xp: 2
  lost: t
  duration: round
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - wound: ''
    sub:
    - target: "all"
    - range: 2
  - mandatory:
    - wild
