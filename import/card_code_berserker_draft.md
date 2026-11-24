name: Blood Pact
initiative: 76
level: 1
top:
  actions:
    - mandatory:
        - custom: "Suffer %damage% equal to half your current hit point value (rounded down)."
    - divider
    - attack: 6
      enhancement: [diamond]
  xp: 1
bottom:
  actions:
    - custom: "Add +1 %attack% to all your attacks."
    - divider
    - mandatory:
        - custom: "At the start of each of your turns, if your current hit point value is greater than 1, suffer %damage%1."
  xp: 2
  duration: persistent
  lost: t

name: Glass Hammer
initiative: 43
level: X
top:
  actions:
    - attack: X
    - custom: "where X is your current hit point value. Gain %xp1% for every 5 %damage% an enemy suffers from this attack."
    - divider
    - mandatory:
        - custom: "Set your current hit point value to 1."
  lost: t
bottom:
  actions:
    - move: 3
      enhancement: [circle]
      sub:
        # check: the pill holds a curved arrow landing on a base, read as jump
        - jump

name: Flurry of Axes
initiative: 17
level: 6
top:
  actions:
    - custom: "You may suffer up to %damage%4."
    - attack: X
      sub:
        - target: all enemies within 3 hexes
    - custom: "where X is the amount of %damage% you chose to suffer."
  xp: 2
  # check: stack of cards with red X (remove) and white card with red X (lost) are both printed
  remove: t
  lost: t
bottom:
  actions:
    - move: 5
      enhancement: [circle]
