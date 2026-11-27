name: Cursed Ground
initiative: 05
level: 1
top:
  actions:
    - custom: "Place one %classToken0% in an hex within %range%4 %enhancement-square% ."
      fontSize: 21px       
    - divider
    - curse:   
      margin: 10px 50px 10px 50px  
      sub:
      - custom: "%target% all enemies occupying hexes containing %classToken0%"
        margin: 5px 0px 5px 0px 
    - mandatory:
      - dark
  margin: 40px 0px 10px 0px    
bottom:
  actions:
    - custom: You and all allies add
      lineHeight: 22px
    - group:
      - custom: '"'
      - heal: 1
        sub:
        - self
      - custom: '"'
      flexDirection: row
    - custom: to %lf% all positive and %amd-double% attack modifier %lf% cards this round. %lf% Enemies add "suffer %damage% 1" to all %lf%negative and %amd-null% attack modifier %lf%cards this round.
      lineHeight: 22px
  duration: round

name: Envision the Course
initiative: 08
level: 1
top:
  actions:
    - attack: 3
      enhancement: [diamond]
      sub:
        - range: 3
          enhancement: [square]
    - custom: "Add +1 %attack%,%pierce% 2, and gain %xp1% if the top card of the monster attack deck is revealed."
      margin: 20px 30px 5px 30px

bottom:
  actions:
    - optional:
      - consume: [light]
      - custom: "Place one %classToken0% in an occupied %lf% hex within %range% 4, %xp1%"
        fontSize: 19px
      noLine: true
      padding: 1px 15px 1px 15px
              
    - divider
    - heal: 2
      sub:
        - custom: "%target% 1 ally occupying a %lf%hex containing  a %classToken0%"
          fontSize: 19px
          padding: 0px 15px 0px 15px
      padding: 5px 0px 5px 0px
    - divider
    - custom: "Your allies treat hexes %lf% containing %classToken0% as linked%lf% hexes this round."
      fontSize: 19px
  duration: round
name: Void Snare
initiative: 17
level: 1
top:
  actions:
    - custom: "Place one %classToken0% in an hex within %range%3 %enhancement-square% ."

      fontSize: 20px
    - divider
    - immobilize:   
      margin: 10px 50px 10px 50px  
      sub:
      - custom: "%target% all allies occupying hexes containing %classToken0%"
bottom:
  actions:
    - teleport: 3
      enhancement: [circle]  
    - divider
    - pull: 2
      margin: 15px 
      sub:
      - custom: "%target% 1 ally or enemy, %range%2"
    - custom: "Perform this ability as if you occupied a hex containing a %classToken0%."     
      margin: 15px 

name: Approach of the Void
initiative: 21
level: 1
top:
  actions:
    - custom: "Place one %classToken0% in an hex within %range%3 %enhancement-square% ."
      fontSize: 21px       
    - divider
    - custom: "All enemies occupying hexes %lf% containing %classToken0% suffer%lf%2 %damage% and gain %muddle%." 
      fontSize: 21px  
      marginTop: 5px
       
bottom:
  actions:
    - teleport: 4
      enhancement: [circle]

name: Otherworldly Journey
initiative: 34
level: 1
top:
  actions:
    - optional:
      - consume: [light]
        fontSize: 32px
      - teleport: 2
        fontSize: 36px
      noLine: true
    - divider
    - loot: 1
    - divider
    - optional:
      - consume: [dark]
      - teleport: 2, 
      - xp: 1
        height: 25px
      noLine: true
bottom:
 actions:
    - custom: "Grant one ally within %range% 3 or%lf%control one enemy within %range% 3 "   
    - teleport: 2
      enhancement: [square]
    - divider
    - optional:
      - consume: [dark]
      - custom: "Place one %classToken0% in an unoccupied%lf% hex within %range% 4,  %xp1%"
      noLine: true
      padding: 5px
name: Duality Shards
initiative: 39
level: 1
top:
  actions:
    - attack: 3
      sub:
        - range: 3
          enhancement: [square]
        - push: 1
          enhancement: [square]
      margin: 60px 0px 50px 0px
    - mandatory:
      - light
      
bottom:
  actions:
    - attack: 2
      enhancement: [square]
      sub:
        - range: 4
        - pull: 1
          enhancement: [square]
      margin: 60px 0px 50px 0px
    - mandatory:
      - dark

name: Ray of Light
initiative: 48
level: 1
top:
  actions:
    - heal: 3
      enhancement: [diamondPlus]
      sub:
        - range: 3
          enhancement: [circle]
        - custom: '%scry% 2'

      margin: 50px
    - mandatory:
      - light

bottom:
  actions:
    - teleport: 2
      enhancement: [circle]
    - optional:
      - consume: [light]
      - custom: +2 %teleport%, %xp1%  
    - divider
    - optional:
      - consume: [dark]
      - custom: '%scry% 2'
        fontSize: 36px
        sub:
        - custom: "%target% 1 ally or enemy, %range%3"
      noLine: true
      padding: 2px 5px
    - divider
    - attack: 1
      enhancement: [square]
      sub:
        - range: 3
          enhancement: [square]

name: Dimensional Transfer
initiative: 57
level: 1
top:
  actions:
    - custom: "%stun%"
      padding: 5px
      sub:
        - custom: "%target% 1 ally or enemy, %range% 3 %enhancement-square%"
    - custom: "Place one %classToken0% in the hex the target is occupying."
      fontSize: 18px
      padding: 10px
    - divider
    - mandatory:
      - invisible:
        sub:
        - custom: "%target% the target of %lf% the stun ability"
          padding: 0px 10px 0px 10px
    - mandatory:
      - dark
bottom:
  actions:
    - teleport: 4
      enhancement: [circle]

name: Anticipate Intricacies
initiative: 79
level: 1
top:
  actions:
    - curse: ''
      enhancement: [diamond]
      margin: 10px 0px -2px 0px
      sub:
      - range: 4
    - divider
    - custom: "%scry% 3"
      fontSize: 38px
      margin: +-5px 0px 0px -5px  
      sub:
      - custom: "%target% 1 enemy, %range% 4"  
    - optional:
      - consume: [dark]
      - custom: +2 %scry%, %xp1%
    - custom: After arranging the cards, if the top card %lf% of the monster attack modifier deck is%lf% positive or %amd-double%, add %disarm%. If it is negative %lf%or %amd-null%, add %wound%.
      fontSize: 21px
      lineHeight: 20px
          
bottom:
  actions:
    - teleport: 4
      enhancement: [circle]
      margin: 20px 0px 10px 0px
    - custom: This %teleport% must end adjacent %lf%to at least one ally
      fontSize: 21px
      margin: 0px 0px 32px 0px
    - mandatory:
      - dark

name: Peer into Battle
initiative: 82
level: 1
top:
  actions:
    - bless: ''
      enhancement: [diamondPlus]
      sub:
      - range: 3
    - divider
    - custom: "%scry% 3"
      fontSize: 38px
      sub:
      - custom: "%target% 1 ally or self, %range% 3"  
    - optional:
      - consume: [light]
      - custom: +2 %scry%, %xp1%  
bottom:
  actions:
    - heal: 1
      enhancement: [square]
      fontSize: 38px
      sub:
        - range: 3
          enhancement: [square]
        - regenerate
      margin: 60px 0px 50px 0px
    - mandatory:
      - light

name: Inspiration from Beyond
initiative: 13
level: X
top:
  actions:
    - custom: "Place one %classToken0% in an hex within %range%4 %enhancement-square% ."  
      fontSize: 20px      
      margin: 10px 0px 0px 0px
    - divider
    - bless: 
      margin: 10px 50px 10px 50px  
      sub:
      - custom: "%target% all allies occupying hexes containing %classToken0%"           
    - mandatory:
      - light
      margin: 25px 0px 0px 0px  
   
bottom:
  actions:
    - teleport: 2
      enhancement: [circle]
    - divider
    - custom: '%scry% 2'
      fontSize: 38px
      sub:
      - custom: "%target% 1 ally, %range% 3 %enhancement-square%"
    - divider
    - custom: "Grant the target of the divination ability:"
    - teleport: 2
      enhancement: [square]
      fontSize: 38px  

 name: Recurrence
initiative: 18
level: X
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      margin: 10px 10px 10px 30px
      sub:
        - range: 4
          enhancement: [square]
    - custom: "Add +1 %attack%, %light% if the top card of an %lf% ally's attack modifier deck is revealed."
    - custom: "Add +1 %attack%, %dark% if the top card of the monster attack modifier deck is revealed."
      margin: 0px 10px 5px 30px

bottom:
  actions:
    - custom: In initiative order, each character who has %lf% a revealed card in their attack modifier %lf%deck may %recover% one card for their discard%lf% pile to immediately play that card and%lf% perform its top or bottom action. 
      fontSize: 21px
      margin: 20px 0px 10px 0px
    - mandatory:
      - light
  
  lost: true
  xp: 2
name: Call of the Nether
initiative: 87
level: X
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
        - range: 5
        - custom: '%scry% 2'

      margin: 50px
    - mandatory:
      - dark


bottom:
  actions:
    - custom: "Now and at the end of your next two %lf% turns, place one %classToken0% in an occupied hex %lf% and all enemies occupying hexes %lf% containing %classToken0% suffer %damage% 1."    
      fontSize: 22px
      margin: 0px 0px -5px 0px 
    - tokens: [1,0,1]
      margin: 0px 0px -5px 0px 
    - mandatory:
      - dark
  duration: persistent
  lost: t
name: Cleansing Rite
initiative: 23
level: 2
top:
  actions:
    - strengthen:
      margin: 30px 10px 10px 0px
      sub:
      - target: all
      - range: 2
    - divider
    - bless: 
      margin: 10px 0px 20px 0px
      enhancement: [diamondPlus]  
      sub:
      - range: 2   
    - mandatory:
      - light

bottom:
  actions:
    - heal: 2
      enhancement: [square]
      margin: 0px 0px 0px 0px
      sub:
        - range: 3 %enhancement-square%
    - custom: "Remove all %curse% cards from the %lf% target's attack modifier deck.%lf% Shuffle the target's deck."
      fontSize: 22px
      margin: 10px 0px 0px 0px
name: Dimensional Divide
initiative: 52
level: 2
top:
  actions:
    - attack: 2
      margin: 5px 0px 5px
      sub:
        - target: 2
        - range: 3 %enhancement-square%
    - custom: "Add %push% 1 to one attack and %pull% 1%lf% to the other attack."
    - optional:
      - consume: [light/dark]
      - custom: +1%push%, +1%pull%, %xp1%
bottom:
  actions:
    - teleport: 4
      enhancement: [circle]
      margin: 20px 0px 10px 0px
    - divider
    - invisible:
      sub:  
      - self
    - divider
    - mandatory:
      - disarm: ""
        sub:
        - self
name: Past and Future
initiative: 40
level: 3
top:
  actions:
    - curse:
      margin: 0px 0px 10px 0px 
      sub:
      - custom: "%target% 2"
      - range: 4 %enhancement-square%
    - custom: Each target that has already acted %lf% this round gains %poison% and suffers %damage% 1.%lf% Each target that has not acted this %lf% round gains %wound%, %muddle%.
      lineHeight: 22px
    - mandatory:
      - dark
bottom:
  actions:
    - custom: "%scry% 3"
      fontSize: 38px
      sub:
      - custom: "%target% 1 ally, enemy, or self, %range% 4"  
    - optional:
      - group:
        - consume: [light]
        - custom: +2 %scry%, %xp1%
      - group:
        - consume: [dark]
        - custom: Place up to 2 of the %lf% revealed cards on the bottom of the deck.
      flexDirection: column
      margin: 10px 50px 0px 50px
- name: Ethereal Vortex
initiative: 72
level: 3
top:
  actions:
    - group:
      - group:
        - attack: 1
          sub:
            - custom: '%range% 3, %muddle%'
          margin: 2px 0px -7px 0px
        - divider
        - custom: "Place one %classToken0% in each %lf% unoccupied red hex of %lf% the attack ability."
          lineHeight: 19px
          margin: -3px 0px -7px 0px 
        - divider
        flexDirection: column
      - hex: ett_ttt_ett
        margin: 0px 12px 0px -15px
    - pull: 2
      marginTop: -3px
      sub:
        - target: all
        - range: 2 
    - custom: Perform this ability as if you %lf% occupied the center hex of the%lf% attack ability.
      lineHeight: 19px
  lost: t
  xp: 2

bottom:
  actions:
    - custom: Place one %classToken0% in a hex within %range% 3 %enhancement-square%. 
    - divider
    - optional:
      - consume: [light]
      - custom: "%nbsp1%%strengthen%"
        transform: scale(1.2)
      - group:
        sub:
            - custom: "%target% all allies occupying%lf%hexes containing %classToken0%"
      - custom: ",%xp1%"
        transform: scale(1.5)
        padding: 0px 8px 0px 8px
      noLine: true
      padding: 0px 10px 0px 20px
    - divider
    - optional:
      - consume: [dark]
      - attack: 1 
        sub:
          - custom: "%target% all enemies occupying%lf%hexes containing %classToken0%, %pierce% 2"
      noLine: true

name: Protective Aura
initiative: 11
level: 4
top:
  actions:
    - custom: "Place one %classToken0% in an hex within %range%3 %enhancement-square% ."
      fontSize: 21px     
      margin: 40px 0px 00px 0px  
    - divider
    - custom: "Allies occupying hexes containing  %lf% %classToken0% this round gain %shield% 2. " 
      fontSize: 21px  
      marginTop: 5px
    - mandatory:
      - light       
      margin: 15px 0px 0px 0px
  duration: round
bottom:
  actions:
    - teleport: 5
      enhancement: [circle]

name: Enfeebling Hex
initiative: 25
level: 4
top:
  actions:
    - attack: 4
      enhancement: [diamond]
      margin: 30px 0px 5px 0px
      sub:
        - range: 3 %enhancement-square%
    - divider:
    - custom: If you performed the attack ability, %lf%shuffle one %amd-minus-1% card into the monster attack modifier deck.
      fontSize: 22 
      margin: 5px
    - mandatory:
      - dark
bottom:
  actions:
    - stun: ''
      enhancement: [diamond]
      sub:
      - target: all
      - custom: "%scry% 3"
      margin: 5px 0px 15px 0px
    - divider
    - mandatory:
      - stun: ""
        enhancement: [diamondPlus]
        sub:
        - target: all allies
        - custom: "%scry% 3"
      margin: 5px 0px 15px 0px
    - mandatory:
      - dark
  lost: t
  xp: 2

name: Seal Their Fate
initiative: 20
level: 5
top:
  actions:
    - custom: "%scry% 7" 
      sub:
      - custom: "%target% all allies, enemies, and self"
      fontSize: 38px
    - custom: One enemy suffers %damage% X, where X is equal to %lf% the number of revealed negative and %amd-null% cards in the monster attack modifier deck.
      fontSize: 22px
      margin: 0px -10px 0px -10px  
    - divider
    - custom: Each character performs
      fontSize: 22px
    - heal: X
      sub:
      - self
    - custom: ", where %lf% X ist equal the number of revealed positive %lf% and %amd-double% cards in that character's attack %lf% modifier deck."
      margin: 0px -10px 0px -10px 
      fontSize: 22px
      lineHeight: 20px
  lost: t
  xp: 2
bottom:
  actions:
    - attack: 1
      enhancement: [diamond]
      sub:
      - range: 4
    - custom: Add +1 %attack% for each revealed negative %lf%and %amd-null% cards in the monster %lf% attack modifier deck.
      fontSize: 22px
  infuse: [light/dark]
name: Constant Flux
initiative: 37
level: 5
top:
  actions:

    - heal: 2
      enhancement: [square]
      margin: 10px 10px 10px 30px
      sub:
        - target: all
    - custom: You may either add %regenerate%, %light% or remove %lf%all negative conditions from the targets before the heal and add %dark%.
      lineHeight: 21px

bottom:
  actions:
    - pull: 2
      sub: 
      - target: 2 allies or enemies
      - range: 3
    - custom: Perform this ability as if you occupied a %lf% hex containing a %classToken0%.
    - divider
    - disarm:
      enhancement: [diamond]  
      sub:  
      - custom: "%target% 1 enemy occupying %lf% a hex containing a %classToken0%"
        padding: 0px 10px 0px 10px
    - optional:
      - consume: [dark]
      - custom: "%curse%,%xp1%"
  xp: 1


name: Tether the Planes
initiative: 19
level: 6
top:
  actions:
    - optional:
      - consume: [light]
      - custom: "%scry% 4"
        fontSize: 32px
      - self:
        transform: scale(2.3)
        margin: 0px 20px 10px 25px
        fontSize: 26
      noLine: true
    - divider
    - attack: 4
      enhancement: [diamond]
      sub:
      - range: 4
      - custom: "%scry% 3"
    - optional:
      - consume: [dark]
        transform: scale(1.2)
        margin: 0px 10px 0px 5px
      - custom: +3 %scry%, place up to 3 of %lf% the revealed cards on the %lf% bottom of the deck, %xp1%.   
      
bottom:
 actions:
    - custom: "Place one %classToken0% in a hex within %range% 4 %enhancement-square%."
      margin: 0px 0px 0px -1px   
    - divider:
    - custom: "Simultaneously %teleport% any numer of figures %lf%occupying hexes containing %classToken0% to other %lf%hexes containing %classToken0% (figures may exchange hexes with other figures)."
 margin: 0px 0px 20px 0px
 infuse: [light/dark]

name: Careful Attunement
initiative: 80
level: 6
top:
  actions:
    - multi:
      - group:
        - attack: 2
          sub:
          - range: 3
          - custom: "%scry% 2"
          margin: 10px 0px 5px 0px
        - custom: 'You may place one revealed %lf% card from each target on %lf% the bottom of their deck.'
          fontSize: 20px
          marginLeft: -10px
        - divider   
        flexDirection: column
      - hex: etx_xtt_etx
        marginLeft: -35px
        marginRight: 0px
        marginBottom: 5px
    - heal: 2
      sub:
        - custom: "%target% all allies in the red hexes of %lf% the attack ability, %scry% 2"
          fontSize: 20px
    - custom: You may place one revealed card from %lf% each target on the bottom of their deck.
      fontSize: 20px


bottom:
  actions:
  - custom: "Summon 2 Ghost Falcons"
    fontSize: 20px
    marginBottom: -18px
    marginTop: 16px
  - summon: 
      stats: [4,3,2,'-']
      special:
        - custom: '%flying%'
          transform: scale(1)
          margin: 0px 0px 10px
        - custom: '%pierce% 1'
          transform: scale(1.1)
          marginBottom: 2px
      name: "Ghost Falcon"
      enhancement: [square, square, square, 0]
      image: 
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/d091e10d258d4def8a9bb1e621363ff241fd51a9/MP/ghost_falcon.jpg"
          size: 110%
          position: '-7px -5px '
      width: 75px
      hpColor: '#73859A'
      hpTextColor: '#FFFFFF'
  - custom: 'You control how these summons perform %lf% their abilities. They treat hexes containing %classToken0% %lf% as linked hexes and may only attack enemies'
    lineHeight: 16px
    fontSize: 20px
    margin: -10px -18px 0px -18px
  - custom: "occupying hexes %lf% containing %classToken0%."
    fontSize: 20px
    margin: 0px -0px 5px -50px
    lineHeight: 16px
  xp: 2
  lost: 1
  duration: persistent

name: Time and Again
initiative: 07
level: 7
top:
  actions:
    - custom: '%scry% 4'
      margin: 5px 0px -5px 0px
      fontSize: 38px 
      sub:
      - custom: "%target% 1 ally, enemy, or self, %range% 4"
    - divider  
    - custom: Each character who has a revealed card in %lf% their attack modifier deck may %recover% one card %lf% from their discard pile.
      margin: 0px -23px -5px -23px
      fontSize: 22px 
    - divider  
    - custom: You may place up to one revealed card %lf% from each deck on the bottom of that deck.
      margin: 0px -20px -10px -20px
      fontSize: 22px   
    - mandatory:
      - light
bottom:
  actions:
    - teleport: 4
      margin: -30px 0px 5px 0px
      fontSize: 38px
      enhancement: [circle]
    - divider
    - custom: Whenever an ally within %range% 3 is attacked %lf% this round, treat all positive and %amd-double%%lf% attack modifier cards as %amd-minus-1% instead.
      margin: 5px 0px 5px 0px
      lineHeight: 20px
      fontSize: 22px
  duration: round 

name: Tear Reality
initiative: 59
level: 7
top:
  actions:
    - multi:
      - group:
        - attack: 1
          sub:
          - pierce: 2
          marginBottom: 10px
        - custom: 'Perform this ability as if you occupied a hex containing a %classToken0%.'
        - optional:
          - consume: [light/dark]
          - custom: +1 %attack%, %xp1%
        flexDirection: column
      - hex: ete_tt_tst_tt_ete
        marginLeft: -10px
        marginRight: 5px
      marginBottom: 15px
bottom:
   actions:

    - custom: '%scry% 2'
      fontSize: 36px
      sub:
      - custom: "%target% 2 enemies, %range%4"
    - custom: "You may %scry% each target's monster ability %lf% card deck instead."
      margin: 0px -5px 0px 0px 
      fontSize: 22px
    - divider
    - custom: 'You may place up to one revealed card from %lf% each deck on the bottom of that deck.'
      margin: 0px -10px 0px -10px
      fontSize: 22px
    - mandatory:
       - dark

name: Planar Chaos
initiative: 14
level: 8
top:
  actions:
    - custom: "Place one %classToken0% in an hex within %range%4 %enhancement-square% ."
      fontSize: 21px     
      margin: px 0px 00px 0px  
    - divider
    - custom: "Each enemy occupying a hex containing a %lf%%classToken0% gains one of the following conditions of your choice:"
      fontSize: 21px  
      marginTop: 5px
    - custom: "%wound%,%poison%,%disarm%,%stun%,%muddle%,%curse%." 
      marginTop: 5px
    - custom: Each condition may only be chosen once. 
      margin: 5px -10px 00px 0px
  xp: 1
bottom:
 actions:
    - teleport: 4
      enhancement: [circle]
    - divider
    - optional:
      - consume: [light]
      - custom: Place one %classToken0% in a hex %lf%within %range% 2, %xp1%.  
      noLine: true
      margin: 5px 0px 5px 0px 
    - divider
    - custom: "%teleport% one ally to an unoccupied %lf% hex containing a %classToken0%."


name: Deep Contemplation
initiative: 75
level: 8
top:
  actions:
    - attack: 2
      enhancement: [diamond] 
      sub:
      - custom: "%range% 4, %scry% 3"
      fontSize: 34px
      margin: -2px 0px -5px 0px
    - custom: Place up to 2 the the revealed cards %lf% on the bottom of the deck.
      fontSize: 22px
      margin: -2px 0px -10px 0px
    - divider
    - attack: 2
      enhancement: [diamond] 
      sub:
      - custom: "%range% 4, %scry% 3"
      fontSize: 34px
      margin: -2px 0px -5px 0px
    - custom: You may %scry% the target's monster %lf%ability card deck instead.
      fontSize: 22px
      margin: -2px 0px -10px 0px
    - divider
    - heal: 2
      enhancement: [diamondPlus] 
      sub:
      - custom: "%range% 4, %scry% 3"
      fontSize: 34px
      margin: -5px 0px -5px 0px
    - custom: Place up to 2 the the revealed cards %lf% on the bottom of the deck.
      fontSize: 22px
      margin: 0px 0px -10px 0px
  transform: scale(.91)
bottom:
  actions:
    - custom: "%scry% 8"
      fontSize: 40px
      sub:
      - self
    - custom: Place any number of the revealed cards %lf%on the bottom of the deck deck.
    - divider
    - custom: "%recover% 1 card from your lost pile and up to %lf% 2 cards from you discard pile." 
  infuse: [light/dark]
  lost: 1
  remove: true
  name: Convergence
initiative: 91
level: 9
top:
 actions:
  - custom: "Summon Twilight Archon"
    fontSize: 21px
    marginBottom: -18px
    marginTop: 16px
  - summon: 
      stats: [5,3,2,3]
      name: "Twilight Archon"
      enhancement: [square, square, square, square]
      image: 
          url: "https://raw.githubusercontent.com/Sadgit-HL/Wordhaven_Assets/refs/heads/main/MP/twilight_archon.jpg"
          size: 150%
          position: -25px -5px
      width: 75px
      hpColor: '#73859A'
      hpTextColor: '#FFFFFF'
  - custom: "Whenever this summon attacks, if %light% %lf% or %dark% is strong or waning, you may place%lf% one %classToken0% in the hex the target is%lf% occupying."
    lineHeight: 22px
    fontSize: 21px
    margin: -10px -14px 0px -18px
 lost: true
 xp: 2
 duration: persistent
bottom:
 actions:
  - custom: "%classToken0%"
    transform: scale(0.9)
    position: absolute
    top: 0px
    left: 245px 
  - custom: "%classToken0%"
    transform: scale(0.9)
    position: absolute
    top: 19px
    left: 235px
  - custom: "%classToken0%"
    transform: scale(0.9)
    position: absolute
    top: 56px
    left: 172px
  - custom: "%classToken0%"
    transform: scale(0.9)
    position: absolute
    top: 92px
    left: 287px    
  - custom: You may place more than one %nbsp7% in the same %lf% hex. Whenever you place a %nbsp7%, any enemy %lf% occupying that hex suffers %damage% 1%lf% for each %nbsp7% in that hex. %lf% Whenever you perform an ability that affects %lf% figures occupying hexes containing %nbsp7%, each %lf% figure is affected by the ability a number of %lf% times equal to the number of %nbsp7% %lf% in their hex.
    lineHeight: 18px
    fontSize: 21px
    margin: -24px -14px 0px -16px
 lost: true
 xp: 2
 duration: persistent

name: Hand of Destiny
initiative: 96
level: 9
top:
  actions:
    - custom: "%shuffle%"
      transform: scale(0.75)
      position: absolute
      top: 60px
      left: 92px
    - custom: "%shuffle%"
      transform: scale(0.75)
      position: absolute
      top: 163px
      left: 95px
    - custom: "%stun%,%curse%"
      enhancement: [diamond]
      sub:
      - range: 4
      fontSize: 40px
    - custom: Remove one revealed attack modifier card%lf% without %nbsp7% from the monster attack modifier %lf% deck or discard pile from the scenario.
      fontSize: 21px
      margin: 0px -12px -5px -8px 
    - divider
    - custom: "%regenerate%,%bless%"
      enhancement: [diamondPlus]
      sub:
      - range: 4
      fontSize: 40px
    - custom: Remove one revealed attack modifier card%lf% without %nbsp7% from the target's attack modifier %lf% deck or discard pile from the scenario.
      fontSize: 21px
      margin: 0px -12px -5px -8px 

bottom:
  actions:
    - custom: Search any monster ability card deck for a %lf%card of your choice and remove it from that %lf% deck for the remainder of the scenario.
      margin: -40px -10px 0px -10px 
    - optional:
      - consume: [light, dark]
        margin: 0px 0px 0px 3px 
        transform: scale(1.1)
      - custom: "%shuffle%"
        transform: scale(0.6)
        position: absolute
        top: 38px
        left: 234px 
      - custom: Remove an additional card from the same deck. This card may not have %nbsp6%, %xp1%.
      margin: 7px 5px 0px 5px

  lost: true
  xp: 2
  remove: t 
