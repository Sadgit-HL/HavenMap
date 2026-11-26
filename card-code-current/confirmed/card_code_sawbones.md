# Sawbones (Gloomhaven 2nd edition), card code converted from the Gloomhaven Secretariat data (data/gh2e) with tools/convert-secretariat-cards.py.
# Not checked against the cards. Level X cards are level 1 there; custom hexes on the board are written as blank hexes (b); a sentence under an ability is a dashed box without cost.

name: Battlefield Medicine
initiative: 83
level: 1
top:
  actions:
  - disarm: ''
    sub:
    - range: 1
  - custom: "Give one adjacent ally one medical pack to gain %xp1%."
bottom:
  actions:
  - move: 5

name: First Aid
initiative: 19
level: 1
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 1
bottom:
  actions:
  - move: 4

name: Curative Mixture
initiative: 8
level: 1
top:
  actions:
  - heal: 3
    enhancement: [diamondPlus]
    sub:
    - range: 1
  - custom: "Before the heal, remove one negative condition from the target."
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Remove one negative condition from one adjacent ally."

name: Bloody Saw
initiative: 25
level: 1
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Add +1 %attack%, %wound% and gain %xp1% if an ally has an active %prescription%."
bottom:
  actions:
  - safeguard: ''
    enhancement: [diamondPlus]
    sub:
    - self
  - divider
  - loot: 1

name: Prevention Is Key
initiative: 13
level: 1
top:
  actions:
  - multi:
    - wound: ''
    - custom: ","
    - disarm: ''
      enhancement: [diamond]
      sub:
      - target: "all"
      - range: 1
  - safeguard: ''
    enhancement: [diamondPlus]
    sub:
    - target: "all"
    - range: 1
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "When you next perform a %prescription% action this round, grant all adjacent allies and self:"
  - shield: 1
  duration: round

name: Hand of the Surgeon
initiative: 62
level: 1
top:
  actions:
  - attack: 4
    enhancement: [diamond]
bottom:
  actions:
  - move: 1
    enhancement: [circle]
  - custom: "Give one adjacent ally one medical pack to gain %xp1%."

name: Booster Shot
initiative: 42
level: 1
top:
  actions:
  - custom: "%prescription% Prescription"
  - custom: "On the next four source of %damage% from attacks targeting you, gain %shield%1 for the attack."
  - tokens: [0, 0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - divider
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 1

name: Syringe
initiative: 57
level: 1
top:
  actions:
  - custom: "%prescription% Prescription"
  - custom: "On the next four attacks, add +1 %attack%."
  - tokens: [0, 0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - wound: ''
    sub:
    - range: 1

name: Needle Gun
initiative: 44
level: 1
top:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - range: 3
    - pierce: 1
      enhancement: [square]
    - poison
bottom:
  actions:
  - attack: 1
    enhancement: [diamond]
    sub:
    - poison
    - stun
  - divider
  - attack: 1
    enhancement: [diamond]
    sub:
    - poison
    - stun
  - divider
  - attack: 1
    sub:
    - poison
    - stun
  xp: 2
  lost: t

name: Vital Strikes
initiative: 53
level: 1
top:
  actions:
  - custom: "Add +1 %attack% to all your attacks targeting damaged enemies."
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - move: 5

name: Vaccine
initiative: 15
level: X
top:
  actions:
  - attack: 3
    enhancement: [square]
  - custom: "Add +1 %target% and gain %xp1% if the target is damaged (for a maximum of one additional target)."
bottom:
  actions:
  - custom: "On the next three negative conditions an enemy would apply to you, prevent the condition."
  - tokens: [0, 0, 0]
  xp: 1
  duration: persistent

name: Teamwork
initiative: 89
level: X
top:
  actions:
  - attack: 2
    enhancement: [square]
  - custom: "Grant one adjacent ally:"
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - move: 2
    enhancement: [circle]
  - custom: "Grant one adjacent ally:"
  - move: 3
    enhancement: [square]

name: Prep for Surgery
initiative: 22
level: X
top:
  actions:
  - attack: 2
    enhancement: [square]
  - custom: "Add %stun% and gain %xp1% if the target is damaged."
bottom:
  actions:
  - custom: "You may treat all your attack abilities and move abilities from your ability cards as heal abilities of equal value plus one. In such cases, ignore all added effects of those abilities. When treating a move ability as a heal ability, it has %range%1."
  xp: 2
  lost: t
  duration: persistent

name: Hamstring
initiative: 72
level: 2
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - immobilize
  xp: 1
bottom:
  actions:
  - move: 6
  - mandatory:
    - immobilize: ''
      sub:
      - self

name: Precaution
initiative: 9
level: 2
top:
  actions:
  - custom: "Grant all allies and self:"
  - shield: 1
  - custom: "Each ally may move the character token backward one slot on one active %prescription% they have."
  duration: round
bottom:
  actions:
  - ward: ''
    sub:
    - target: 2
    - range: 1

name: Regenerative Tissue
initiative: 52
level: 3
top:
  actions:
  - heal: 4
    enhancement: [diamondPlus]
    sub:
    - range: 1
    - ward
bottom:
  actions:
  - custom: "At the start of your next three turns where your current hit point value is less than your maximum hit point value, perform:"
  - heal: 2
    sub:
    - self
  - tokens: [0, 0, 0]
  xp: 1
  duration: persistent

name: Blood Transfusion
initiative: 79
level: 3
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - divider
  - heal: X
    sub:
    - target: "1 ally"
    - range: 1
  - custom: "Where X is the amount of %damage% enemies suffered from the attack ability."
bottom:
  actions:
  - safeguard: ''
    sub:
    - range: 1
  - custom: "Remove all negative conditions from the target and give them one medical pack."
  xp: 1

name: Experimental Stimulants
initiative: 12
level: 4
top:
  actions:
  - custom: "Grant one adjacent ally:"
  - retaliate: 2
    enhancement: [square]
  - custom: "If the target has an active %prescription%, gain %xp1% and negate the next %damage% they would suffer this round."
  duration: round
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - divider
  - heal: 3
    enhancement: [square]
    sub:
    - range: 1

name: Do No Harm
initiative: 18
level: 4
top:
  actions:
  - attack: 4
    sub:
    - wound
    - stun
  - custom: "Place a character token on the target. The next three times they lose %stun%, they gain %stun%."
  - tokens: [0, 0, 0]
  - mandatory:
    - disarm: ''
      sub:
      - self
  xp: 2
  lost: t
  duration: persistent
bottom:
  actions:
  - attack: 2
    enhancement: [diamond]
    sub:
    - poison

name: Hack to Bits
initiative: 38
level: 5
top:
  actions:
  - attack: 2
    enhancement: [square]
  - divider
  - attack: 2
    enhancement: [diamond]
  - custom: "If this attack kills the target, all enemies adjacent to the hex the target occupied gain %wound%."
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - divider
  - muddle: ''
    enhancement: [diamond]
    sub:
    - range: 1
  - divider
  - strengthen: ''
    enhancement: [diamondPlus]
    sub:
    - target: "1 ally"
    - range: 1

name: Fortifying Injection
initiative: 5
level: 5
top:
  actions:
  - custom: "%prescription% Prescription"
  - custom: "At the start of your next four turns where you do not have %ward%, perform:"
  - ward: ''
    sub:
    - self
  - tokens: [0, 0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 5
    enhancement: [circle]
  - custom: "Whenever an adjacent ally would suffer %damage% this round, negate the %damage%."
  xp: 2
  lost: t
  duration: round

name: Amputate
initiative: 86
level: 6
top:
  actions:
  - attack: 4
    enhancement: [diamond]
    sub:
    - wound
    - immobilize
  xp: 1
bottom:
  actions:
  - heal: 7
    sub:
    - target: "1 ally, enemy, or self"
    - range: 1
  - mandatory:
    - stun: ''
      sub:
      - target: "the target of the heal ability"

name: Return the Favor
initiative: 40
level: 6
top:
  actions:
  - attack: 3
    enhancement: [diamond]
  - custom: "Grant one adjacent ally who has an active %prescription%:"
  - move: 3
    enhancement: [square]
  - divider
  - attack: 3
    enhancement: [diamond]
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Remove one negative condition from one adjacent ally. If you do, gain %xp1% and you may give one adjacent enemey the negative condition you removed."

name: Surgeon's Satchel
initiative: 14
level: 7
top:
  actions:
  - loot: 1
  - divider
  - heal: 3
    sub:
    - target: "all"
    - range: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - custom: "Give one adjacent ally one medical pack to gain %xp1%."

name: Exacting Anger
initiative: 49
level: 7
top:
  actions:
  - attack: 4
    enhancement: [square]
    sub:
    - disarm
bottom:
  actions:
  - custom: "%prescription% Prescription"
  - custom: "At the start of your next three turns, perform:"
  - strengthen: ''
    sub:
    - self
  - tokens: [0, 0, 0]
  xp: 1
  duration: persistent

name: Take Your Medicine
initiative: 6
level: 8
top:
  actions:
  - custom: "%prescription% Prescription"
  - custom: "At the start of your next three turns, gain one medical pack."
  - tokens: [0, 0, 0]
  xp: 1
  duration: persistent
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "In initiative order, each of your allies may immediately play one \"Medical Pack\" ability card from their hand to perform one action of the card."

name: Euthanize
initiative: 27
level: 8
top:
  actions:
  - custom: "Kill one adjacent damaged enemy that has at least two negative conditions and whose current hit point value is 8 or less."
  xp: 1
bottom:
  actions:
  - move: 4
    enhancement: [circle]
  - multi:
    - wound: ''
    - custom: ","
    - poison: ''
    - custom: ","
    - muddle: ''
    - custom: ","
    - range: 1
  - custom: "The target suffers %damage%1."

name: Secret of the Oak
initiative: 10
level: 9
top:
  actions:
  - heal: 6
    enhancement: [diamondPlus]
    sub:
    - range: 1
    - safeguard
  - custom: "Before the heal, remove all negative conditions from the target."
  - custom: "If the target of the heal ability has an active %prescription%, gain %xp1% and grant them:"
  - shield: 2
  duration: round
bottom:
  actions:
  - custom: "Whenever you or an ally perform a heal ability on a \"Medical Pack\" ability card, that character may add +4 %attack% to their next attack that round of +4 %move% to their next move ability that round."
  xp: 2
  lost: t
  duration: persistent

name: Grisly Trauma
initiative: 81
level: 9
top:
  actions:
  - attack: 5
    enhancement: [diamond]
    sub:
    - target: "all adjacent enemies"
    - wound
    - poison
    - stun
  xp: 2
  lost: t
bottom:
  actions:
  - move: 3
    enhancement: [circle]
  - custom: "Add +1 %target% to your next melee attack ability this round."
  duration: round

name: Medical Pack
initiative: 50
level: M
top:
  actions:
  - heal: 4
    sub:
    - self
bottom:
  actions:
  - heal: 6
    sub:
    - self
  - mandatory:
    - immobilize: ''
      sub:
      - self

name: Medical Pack
initiative: 50
level: M
top:
  actions:
  - heal: 4
    sub:
    - self
bottom:
  actions:
  - heal: 2
    sub:
    - self
    - ward

name: Medical Pack
initiative: 50
level: M
top:
  actions:
  - heal: 4
    sub:
    - self
bottom:
  actions:
  - heal: 3
    sub:
    - self
    - safeguard

name: Medical Pack
initiative: 50
level: M
top:
  actions:
  - heal: 4
    sub:
    - self
bottom:
  actions:
  - heal: 3
    sub:
    - self
    - bless

name: Medical Pack
initiative: 50
level: M
top:
  actions:
  - heal: 4
    sub:
    - self
bottom:
  actions:
  - heal: 1
    sub:
    - self
    - strengthen
  - mandatory:
    - poison: ''
      sub:
      - self

name: Medical Pack
initiative: 50
level: M
top:
  actions:
  - heal: 4
    sub:
    - self
bottom:
  actions:
  - custom: "Remove one negative condition you have."
  - heal: 3
    sub:
    - self
