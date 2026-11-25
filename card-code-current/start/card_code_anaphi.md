# Anaphi (Mercenary Pack), card code read from the card pictures with tools/card-extraction. A first draft, not yet checked by the owner: look at the lines marked # check first.
# Open: the Augment icon printed inside texts is written %classToken0% (written %classToken0%, to be linked to the Augment icon in the class properties). The AUGMENT ribbon is namedAbility, a key of the half next to actions.
name: Black Claws
initiative: 79
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    - custom: "If the target has a negative condition, add +1 %target% (for a maximum of one additional target)."
    - mandatory:
        - dark
bottom:
  actions:
    - custom: "Summon Sewer Monstrosity"
    - summon:
        stats: [4, 3, 2, "-"]
        name: Sewer Monstrosity
        enhancement: [square, square, 0, 0]
        # check: the summon art is not in the assets yet; upload it as MP/images/sewer_monstrosity.jpg (like ghost_falcon.jpg) or change the url
        image:
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/sewer_monstrosity.jpg"
          size: 100%
          position: '0px 0px'
        special:
          - custom: "Add +1 %attack% to all attacks granted to this summon."
  xp: 1
  duration: persistent
  lost: t

name: Bug-Body's Bidding
initiative: 81
level: 1
top:
  actions:
    - custom: "Grant one of your summons:"
    - custom: "%move% +0"
    - custom: "%attack% +0"
    - optional:
        - consume: [dark]
        - custom: "+1 %attack%, %xp1%"
bottom:
  actions:
    - custom: "Summon Harrower's Grasp"
    - summon:
        stats: [2, 2, 1, 3]
        name: Harrower's Grasp
        enhancement: [square, square, 0, 0]
        # check: the summon art is not in the assets yet; upload it as MP/images/harrower_s_grasp.jpg (like ghost_falcon.jpg) or change the url
        image:
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/harrower_s_grasp.jpg"
          size: 100%
          position: '0px 0px'
        special:
          - custom: '%flying%'
          - custom: '%muddle%'
    - mandatory:
        - air
  xp: 1
  duration: persistent
  lost: t

name: Endless Biting
initiative: 72
level: 1
top:
  actions:
    - custom: "Summon Duskrat Swarm"
    - summon:
        stats: [7, 2, 1, "-"]
        name: Duskrat Swarm
        enhancement: [square, square, square, 0]
        # check: the summon art is not in the assets yet; upload it as MP/images/duskrat_swarm.jpg (like ghost_falcon.jpg) or change the url
        image:
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/duskrat_swarm.jpg"
          size: 100%
          position: '0px 0px'
    - custom: "Whenever this summon suffers %damage%, it performs:"
    # check: the dark banner sits left of the heal row; may belong to a different position
    - mandatory:
        - dark
    - heal: 1
      sub:
        - self
  xp: 1
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4

name: Howling Apparition
initiative: 93
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
    - mandatory:
        - air
bottom:
  actions:
    - move: 4

name: Nocturnal Feeding
initiative: 25
level: 1
top:
  actions:
    - heal: 3
      enhancement: [circle]
      sub:
        - range: 3
          enhancement: [square]
    - mandatory:
        - dark
bottom:
  actions:
    - move: 4
    - divider
    - invisible: ''
      sub:
        - custom: "%target% all of your summons and self, %range% 2"
    - mandatory:
        - dark
  xp: 1
  lost: t

name: Phantasmal Flurry
initiative: 23
level: 1
top:
  actions:
    - attack: 1
      enhancement: [diamond]
      sub:
        - target: 2
        - muddle
    - optional:
        - consume: [air]
        - custom: "+1 %attack%, you may target enemies up to two hexes away, %xp1%."
bottom:
  actions:
    - move: 4
      enhancement: [square]
      sub:
        - jump

name: Sharp Teeth
initiative: 31
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - pierce: 2
          enhancement: [square]
bottom:
  actions:
    - move: 3
    - divider
    - optional:
        - consume: [dark]
        - heal: 2
          sub:
            - range: 2
        - custom: "%xp1%"
      noLine: true

name: Sickening Betrayal
initiative: 15
level: 1
top:
  actions:
    - custom: "Control one enemy within %range% 4:"
    - attack: 2
    - poison: ''
      enhancement: [diamond]
      sub:
        - self
bottom:
  actions:
    - attack: 1
      enhancement: [diamond]
      sub:
        - range: 3
        - pull: 2
    - mandatory:
        - air

name: Surrounding Shadows
initiative: 16
level: 1
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "You may perform your melee attack abilities as if you occupied the same hex as any of your allies."
    - divider
    - attack: 2
      sub:
        - push: 1
        - immobilize
  xp: 1
  duration: persistent
bottom:
  actions:
    - invisible: ''
      sub:
        - custom: "%target% 1 of your summons"
    - divider
    - mandatory:
        - custom: "At the end of the round, the target of the invisible ability loses %invisible%."
  duration: round

name: Touch of Atrophy
initiative: 47
level: 1
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "Add %wound% to all your melee attacks."
    - divider
    - attack: 2
      enhancement: [diamond]
      sub:
        - curse
  xp: 1
  duration: persistent
bottom:
  actions:
    - move: 2
    - divider
    - poison: ''
      sub:
        - range: 1

name: Vermincall
initiative: 7
level: 1
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "Whenever you grant one of your summons an attack, afterwards grant it:"
    - custom: "%move% +0"
    - divider
    - custom: "Grant one of your summons:"
    - custom: "%move% +0"
    - custom: "%attack% +0"
  xp: 1
  duration: persistent
bottom:
  actions:
    - optional:
        - consume: [air]
        - disarm: ''
          sub:
            - range: 1
        - custom: ", %xp1%"
      noLine: true
    - divider
    - move: 3
      enhancement: [square]

name: Anguish
initiative: 33
level: X
top:
  actions:
    - custom: "Grant one of your summons:"
    - custom: "%attack% +1"
    - optional:
        - consume: [air]
        - custom: "%pierce% 3, %xp1%"
bottom:
  actions:
    - curse: ''
      sub:
        - range: 2
    - custom: "You may perform this ability as if you occupied the same hex as one of your summons."
    - mandatory:
        - dark

name: Consume with Regret
initiative: 75
level: X
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "Whenever you perform a melee attack targeting an enemy that has a negative condition, after the attack all enemies adjacent to you suffer %damage% 1."
    - divider
    - move: 3
    - divider
    - attack: 2
  xp: 1
  duration: persistent
bottom:
  actions:
    - move: 1
    - divider
    - loot: 1

name: Rat Surprise
initiative: 89
level: X
top:
  actions:
    - custom: "Play one card from your lost pile to perform a summon action of the card."
    - divider
    - custom: "Grant one of your summons:"
    - custom: "%move% +1"
    - custom: "%attack% -1"
    - optional:
        - consume: [dark]
        - custom: "%poison%, %xp1%"
  remove: t
  lost: t
bottom:
  actions:
    - custom: "Grant one of your summons:"
    - move: 4
      enhancement: [square]
      sub:
        - jump

name: Hidden Assault
initiative: 17
level: 2
top:
  actions:
    - move: 2
    - divider
    - attack: 3
      enhancement: [diamond]
    - mandatory:
        - dark
bottom:
  actions:
    - move: 3
    - divider
    - custom: "Monsters that have negative conditions treat you as though you have %invisible% this round."
  duration: round

name: Tiber's Tenacity
initiative: 12
level: 2
top:
  actions:
    - custom: "Grant one ally within %range% 2 %enhancement-square% :"
    - heal: 4
      sub:
        - self
    - shield: 1
    - mandatory:
        - fire
        - light
  duration: round
bottom:
  actions:
    - move: 3
    - divider
    - custom: "All attacks targeting you or your summons gain disadvantage this round."
  duration: round

name: Musophobia
initiative: 53
level: 3
top:
  actions:
    - custom: "Control one enemy within %range% 4:"
    - move: 3
    - custom: "If the controlled enemy ends its movement adjacent to you, it gains %stun%."
    - mandatory:
        - air
bottom:
  actions:
    - attack: 2
      sub:
        - custom: "%target% all enemies within two hexes that have a negative condition"
    - optional:
        - group:
            - consume: [air]
            - custom: "%target% all enemies within three hexes that have a negative condition instead"
        - group:
            - consume: [dark]
            - custom: "+1 %attack%, %xp1%"
  xp: 1
  lost: t

name: Seeking Strikes
initiative: 10
level: 3
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "Whenever you grant one of your summons an attack, add %pierce% 3 to the attack."
    - divider
    - custom: "Grant one of your summons:"
    - custom: "%move% +1"
    - custom: "%attack% +1"
  xp: 1
  duration: persistent
bottom:
  actions:
    - move: 5

name: Compulsive Hoarding
initiative: 62
level: 4
top:
  actions:
    - attack: 4
      enhancement: [diamond]
    - optional:
        - custom: "%darkc% : +1 %attack%, advantage"
    - custom: "If this attack kills the target, loot the hex the target occupied."
bottom:
  actions:
    - move: 1
    - optional:
        - custom: "%airc% : +2 %move%"
    - divider
    - loot: 1
    - custom: "If you loot at least two tokens, gain %strengthen%."

name: Dok's Ferocity
initiative: 35
level: 4
top:
  actions:
    - attack: 2
      enhancement: [square]
      sub:
        - range: 3
        - push: 2
        - wound
        - muddle
    - mandatory:
        - air
bottom:
  actions:
    - move: 3
      enhancement: [square]
      sub:
        - jump
    - divider
    - wound: ''
      sub:
        - range: 1

name: My Loyal Friend
initiative: 91
level: 5
top:
  actions:
    - summon:
        stats: [3, 3, 3, '-']
        name: Rosie
        enhancement: [0, square, square, 0]
        # check: the summon art is not in the assets yet; upload it as MP/images/rosie.jpg (like ghost_falcon.jpg) or change the url
        image:
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/rosie.jpg"
          size: 100%
          position: '0px 0px'
    - custom: "When this summon dies, place the miniature on this card and do not move this card to your lost pile. At the start of each of your turns, remove up to one damage from this card. Then, if there is no damage, you may resummon it."
  xp: 1
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 3
    - divider
    - heal: 2
      sub:
        - target: all
        - range: 1
    - mandatory:
        - dark

name: Nibbled to Death
initiative: 83
level: 5
top:
  actions:
    - custom: "Place the Rosie miniature on this card. At the end of each of your move abilities, you may move Rosie from this card to an adjacent enemy. At the end of each of your turns, the enemy with Rosie suffers %damage% 2. When that enemy dies, move Rosie to any enemy occupying a hex adjacent to the hex in which the enemy died or back to this card."
  xp: 1
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
    - divider
    - poison: ''
      sub:
        - range: 1

name: Diamartia's Dominance
initiative: 68
level: 6
top:
  actions:
    - custom: "Grant one ally within %range% 4 or control one enemy within %range% 4:"
    - attack: 4
    - optional:
        # check: the consume icon is the multicoloured pie (any element), written as wild
        - consume: [wild]
        - custom: "+1 %attack%, advantage"
    - mandatory:
        - ice
        - dark
bottom:
  actions:
    - heal: 5
      enhancement: [circle]
      sub:
        - range: 3
          enhancement: [square]
    - divider
    - mandatory:
        - poison: ''
          sub:
            - custom: "%target% the target of the heal ability"
    - mandatory:
        - dark

name: Revel in Misery
initiative: 22
level: 6
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "Whenever you perform a melee attack ability targeting an enemy that has a negative condition, after the attack ability perform"
    - bless: ''
      sub:
        - self
    - custom: "."
    - divider
    - attack: 3
      enhancement: [diamond]
    - divider
    - invisible: ''
      enhancement: [diamond]
      sub:
        - self
  xp: 1
  duration: persistent
bottom:
  actions:
    - move: 5
      enhancement: [square]
      sub:
        - jump

name: Rat Tide
initiative: 85
level: 7
top:
  actions:
    - move: 2
      enhancement: [square]
      sub:
        - jump
    - optional:
        - consume: [air]
        - custom: "+1 %move%, all enemies moved through gain %muddle%, %xp1%."
    - divider
    - attack: 4
      enhancement: [diamond]
    - optional:
        - consume: [dark]
        - custom: "+1 %attack%, %curse%"
bottom:
  actions:
    - move: 5
      enhancement: [square]
      sub:
        - jump
    - divider
    - custom: "Control each enemy moved through with the move ability:"
    - move: 1
    # check: poison and stun icons with a self pill, may belong to the move above
    - multi:
        - poison: ''
        - custom: ','
        - stun: ''
          sub:
            - self
  xp: 1
  lost: t

name: Twin Frenzy
initiative: 14
level: 7
top:
  actions:
    - attack: 2
      enhancement: [diamond]
    - optional:
        - consume: [air]
        - custom: "+2 %attack%"
    - divider
    - custom: "Grant one of your summons:"
    - attack: '+0'
    - optional:
        - consume: [dark]
        - custom: "+2 %attack%, %xp1%"
bottom:
  actions:
    - custom: "Grant one of your summons:"
    - heal: 3
      enhancement: [plus]
      sub:
        - self
    - move: 3
      enhancement: [square]
      sub:
        - jump
    - mandatory:
        - air

name: Pay the Piper
initiative: 49
level: 8
top:
  namedAbility:
    name: Augment
  actions:
    - custom: "Whenever you grant one of your summons an attack, add +1 %attack% to the attack."
    - divider
    - custom: "Grant one of your summons:"
    - attack: '+0'
      sub:
        - target: 2
  xp: 1
  duration: persistent
bottom:
  actions:
    - custom: "Grant one of your summons:"
    - optional:
        - consume: [air]
        - custom: "%move% +0"
      noLine: true
    - attack: '+1'

name: Powder's Ingenuity
initiative: 39
level: 8
top:
  actions:
    - group:
        - attack: 5
          enhancement: [diamond]
          sub:
            - range: 3
        - hex: ett_ttt_ett
    - mandatory:
        - fire
        - earth
  xp: 1
  lost: t
bottom:
  actions:
    - move: 2
    - divider
    - custom: "On your next two attacks, add +2 %attack%."
    - tokens: [0, 0]
  duration: persistent

name: Her Highness
initiative: 94
level: 9
top:
  actions:
    - custom: "Summon Rat Queen"
    - summon:
        stats: [7, 3, '-', '-']
        name: Rat Queen
        enhancement: [square, square, 0, 0]
        # check: the summon art is not in the assets yet; upload it as MP/images/rat_queen.jpg (like ghost_falcon.jpg) or change the url
        image:
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/images/rat_queen.jpg"
          size: 100%
          position: '0px 0px'
        special:
          - custom: "At end of turn, grant one adjacent ally: %attack% 3"
    - custom: "You control how this summon performs its abilities and you treat abilities she grants as if you granted them for your %classToken0%."
  xp: 1
  duration: persistent
  lost: t
bottom:
  actions:
    - move: 4
    - divider
    - heal: 3
      enhancement: [circle]
      sub:
        - range: 2
          enhancement: [square]
    - custom: "All enemies adjacent to you or the target suffer %damage%1."

name: Treacherous Tactics
initiative: 59
level: 9
top:
  actions:
    - custom: "Once during each of your turns, you may play one card from your hand to perform an %classToken0% action of the card."
    - mandatory:
        - custom: "During this and the next two rounds, you may have any number of %classToken0% active at once."
    - tokens: [0, 1, 0]
  duration: persistent
bottom:
  actions:
    - move: 3
      enhancement: [square]
      sub:
        - jump
    - wound: ''
      sub:
        - range: 1
    - divider
    - move: 3
      enhancement: [square]
      sub:
        - jump
    - poison: ''
      sub:
        - range: 1
