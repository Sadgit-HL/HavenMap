name: Bizarre Antics
initiative: 13
level: 1
top:
  actions:
    - teleport: 3
      enhancement: [circle]
      margin: 0px 0px 8px 0px   
    - divider
    - mandatory:
      - muddle:
        sub:
        - custom: "%target% all allies, enemies, and self"
      margin: 0px 0px 8px 0px      
    - optional:
      - custom: "-1 %resol% :%nbsp2%"
      - custom: "You and all allies gain %lf% %strengthen% instead of %muddle%, %xp1%."
        margin: 8px 0px 8px 0px
        lineHeight: 22px      
bottom:
  actions:
    - attack: '1'
      enhancement: [circle]
      sub:
      - range: 3
      - wound
    - divider
    - mandatory:
      - wound:
        sub:
        - custom: "%target% all allies adjacent to the target %lf% of the attack ability and self"
          margin: 0px 10px 0px 10px
    - optional:
      - custom: "-1 %resol% :%nbsp1%"
      - custom: "%ward% instead of %wound%, %xp1%"
        margin: 8px 0px 8px 0px
      margin: 15px 0px 8px 0px

name: Somewhere to Be
initiative: 10
level: 1
top:
  actions:
    - custom: '%teleport% any normal or elite enemy to a hex %lf% occupied by a different normal or elite%lf% enemy and simultaneously %teleport% that enemy %lf%to the hex occupied by the first.%lf% Both enemies gain %poison%. '
      margin: 0px -5px 0px -5px
      lineHeight: 22px 
    - mandatory:
      - air
      margin: 10px 0px -30px 0px
bottom:
  actions:
    - teleport: '3'
      enhancement: [circle]
    - optional:
      - custom: "-1 %resol% : +3 %teleport%, %xp1%"
      margin: 15px 0px -0px 0px

name: Gather Reagents
initiative: 21
level: 1
top:
  actions:
    - attack: 1
      enhancement: [diamond]
      sub:
      - range: 4
      - immobilize:
    - optional:
      - custom: "-1 %resol% :"
      - custom: "%nbsp1%+1 %target%, %xp1%"
      margin: 10px 0px 0px 0px
      padding: 5px 10px 5px 10px
bottom:
  actions:
    - move: 1
      margin: 0px 0px 5px 0px    
    - divider
    - loot: 1
      margin: 5px 0px 5px 0px    
    - optional:
      - custom: "-2 %resol% : +1 %loot%, %xp1%"
        margin: 5px 5px 5px 5px    
  name: Minor Inconvenience
initiative: 28
level: 1
top:
  actions:
    - heal: 4
      enhancement: [plus]
      sub:
      - range: 2
    - divider
    - mandatory:
        - wound:
          sub:
          - custom: "%target% the target of %lf% the heal ability"
            margin: 2px 0px 2px 0px
      margin: -5px 0px 5px 0px
    - divider
    - optional:
      - custom: "-1 %resol% :%nbsp1%"
      - heal: 3 
        sub:
        - range: 2
        - safeguard
      - custom: "%nbsp1%,%xp1%"
        transform: scale(1.3)
      noLine: t
      margin: 5px 0px 5px 0px
      padding: 2px 10px 2px 10px

bottom:
  actions:
    - wound:
      enhancement: [diamond]
      sub:
      - range: 3
      margin: 0px 0px 10px 0px
    - divider
    - optional:
      - custom: "-2 %resol% :%nbsp1%"
      - stun:
        sub:
        - range: 3
      - custom: "%nbsp1%,%xp1%"
        transform: scale(1.3)
      noLine: t
      margin: 10px 0px 0px 0px
      padding: 2px 10px 2px 10px
name: Perpetual Annoyance
initiative: 30
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
      - range: 3
      - curse:
    - optional:
      - custom: "-1 %resol% :"
      - custom: "%nbsp1%%push% 3, %xp1%"
      margin: 10px 0px 0px 0px
      padding: 5px 10px 5px 10px
bottom:
  actions:
   - move: 4
     enhancement: [circle]

name: Not Amused
initiative: 47
level: 1
top:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub:
      - range: 3
      - muddle:
    - optional:
      - custom: "-2 %resol% :"
      - custom: "%nbsp1%+5 %attack%, %xp1%"
      margin: 10px 0px 0px 0px
      padding: 5px 10px 5px 10px
bottom:
  actions:
    - stun:
      enhancement: [diamond]
      sub:
      - target: 3
      - range: 3
      margin: 0px 0px 10px 0px 
    - optional:
      - group:
        - custom: "-1 %resol% : %poison%, %xp1%"
          margin: 10px 0px 0px 0px 
      - group:
        - custom: "-1 %resol% : %wound%"
          margin: 10px 30px 10px 0px 
      flexDirection: column
  xp: 2
  lost: t
      

name: Cant't Be Bothered
initiative: 75
level: 1
top:
  actions:
    - optional:
      - custom: "-X %resol% : %nbsp2%"
      - group:
        - custom: Instead of once, perform the %lf% following grant ability X+1 times.
          margin: 3px 2px 3px 0px 
      noLine: true
    - custom: "Grant one ally within %range% 3:"
      margin: 10px 0px 18px 0px
    - move: 2
    - attack: 2
  xp: 1  
bottom:
  actions:
    - group:
      - custom: '%banner_b%'
        transform: scale(6)
        position: absolute
        left: 80px
        top: -20px
      - custom: '%irri%'
        transform: scale(0.9)
        position: absolute
        left: 45px
        top: -20px
      - custom: 'IRRITATION'
        transform: scale(0.90)
        position: absolute
        left: 70px
        top: -17px
    - custom: At the end of each of your turns, if you %lf% end your turn occupying the same hex %lf% you started the turn occupying, gain 1 %resol%.
      margin: -20px -10px 10px -10px  
    - custom: Increase all printed %range% values on %lf%your ability cards by 1.
      margin: 0px -10px 1px -10px
  duration: persistent    
name: Fleeting Interest
initiative: 76
level: 1
top:
  actions:
    - attack: 5
      enhancement: [square]
      sub:
      - range: 4
      - wound:
    - divider
    - optional:
      - custom: "-2 %resol% : Ignore %lost% on this card."
      noLine: t
      margin: 10px 0px 0px 0px
      padding: 5px 10px 5px 10px
  xp: 1
  lost: t
bottom:
  actions:
    - teleport: 3
      enhancement: [circle]
    - divider
    - optional:
      - custom: "-1 %resol% :%nbsp1%"
      - heal: 2
        sub:
        - range: 3
      noLine: t
      margin: 5px 0px 5px 0px
      padding: 2px 10px 2px 10px
    - divider
    - optional:
      - custom: "-1 %resol% :%nbsp1%"
      - attack: 2
        sub:
        - range: 3
      - custom: "%nbsp1%,%xp1%"
        transform: scale(1.3)
      noLine: t
      margin: 5px 0px 5px 0px
      padding: 2px 10px 2px 10px
name: Interesting Specimen
initiative: 80
level: 1
top:
  actions:
    - group:
      - custom: '%banner_t%'
        transform: scale(6)
        position: absolute
        left: 70px
        top: 15px
      - custom: '%irri%'
        transform: scale(0.9)
        position: absolute
        left: 31px
        top: 7px
      - custom: 'IRRITATION'
        transform: scale(0.9)
        position: absolute
        left: 57px
        top: 9px
    - custom: Gain 1 %resol%.
    - divider
    - custom: The first time each round you %lf% loot any number of tokens, %lf% gain 1 %resol%.
      margin: 0px -10px 0px -10px   
    - custom: "At the start of each of your turns, %lf% perform %move% 2."
      margin: 0px -10px 0px -10px  

  duration: persistent
bottom:

  actions:
      - group:
        - group:
          - heal: 1
            sub:
              - custom: '%range% 2'
            margin: -10px 0px 5px 0px          
          - optional:
            - custom: "-1 %resol% : +1 %heal%, %xp1%"  
          flexDirection: column
          margin: 0px 0px 0px 0px
        - hex: ett_ttt_ett
          margin: 0px 0px 0px 0px
        flexDirection: row
        margin: -20px 0px 0px 0px   
name: Leave Me Alone
initiative: 70
level: X
top:
  actions:
    - group:
      - custom: '%banner_t%'
        transform: scale(6)
        position: absolute
        left: 70px
        top: 15px
      - custom: '%irri%'
        transform: scale(0.9)
        position: absolute
        left: 31px
        top: 7px
      - custom: 'IRRITATION'
        transform: scale(0.9)
        position: absolute
        left: 57px
        top: 9px
    - custom: Gain 1 %resol%.
    - divider
    - custom: At the end of each of your turns, if there are %lf% no allies or enemies within %range% 2, gain 1 %resol%.
      margin: 0px -10px 0px -10px   
    - divider
    - custom: "Whenever you are attacked by an adjacent enemy, after the 
attack perform:"
      margin: 0px -10px 0px -10px  
    - push: 1
      sub:
      - target: the attacker
  duration: persistent
bottom:
  actions:
    - custom: "Grant one ally within %range% 2:"
    - move: 2 
      enhancement: [square]
    - custom: "This movement cannot enter %lf% a hex adjacent to Hail."
    - attack: 2 
      enhancement: [diamond]
name: Abundant Nuisance
initiative: 90
level: X
top:
  actions:
    - custom: "One enemy within %range% 3 %enhancement-square% suffers %damage% 1%lf% for each occupied hex adjacent to it."
      margin: 1px -10px 1px -10px 
bottom:
  actions:
    - group:
      - custom: '%banner_b%'
        transform: scale(6)
        position: absolute
        left: 70px
        top: -8px
      - custom: '%irri%'
        transform: scale(0.9)
        position: absolute
        left: 35px
        top: -20px
      - custom: 'IRRITATION'
        transform: scale(0.90)
        position: absolute
        left: 60px
        top: -17px
    - custom: The first time each round you perform an %lf% ability that gives any negative condition %lf% to an enemy who already had a different negative condition, gain 1 %resol%.
      margin: -20px -10px 10px -10px  
    - custom: Enemy healing does not remove negative %lf% conditions.
      margin: 0px -10px 1px -10px
  duration: persistent    
name: Trial and Success
initiative: 95
level: X
top:
  actions:
    - custom: '%range3%'
      transform: scale(2.0)
      position: absolute
      left: 310px
      top: 65px
    - group:
      - attack: 3
        margin: -5px -10px 10px -70px        
      - group:
        - group:
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
        - group:
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
        - group:
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
          - custom: "%enhancement-square%"
            margin: 10px -33px 15px 0px
        flexDirection: column           
      flexDirection: row
      margin: 10px 0px 5px 0px        

    - custom: Whenever this attack kills an enemy, place %lf% one %enhance1% sticker on one of the enhancement %lf% dots.
      margin: -10px -10px 0px -10px  
  xp: 2
  remove: t
  lost: t
bottom:
  actions:
   - teleport: 4
     enhancement: [circle]

name: Experimental Insights
initiative: 24
level: 2
top:
  actions:
    - mandatory:
      - poison:   
        sub:
        - self
    - optional:
      - custom: "-1 %resol% :%nbsp3%"
      - custom  : Add %poison% to your next attack %lf% this turn instead, %xp1%.
        margin: 8px 0px 5px 0px  
      margin: 10px 0px 10px 0px  
    - divider
    - attack: 3
      enhancement: [diamond]
      sub:
      - range: 4
      margin: 10px 0px 0px 0px  
bottom:
  actions:
    - teleport: 6
      enhancement: [circle]
      margin: 0px 0px 8px 0px
    - divider
    - mandatory:
      - custom: Add one %bless% to the monster %lf% attack modifier deck
        margin: 8px 0px 5px 0px
      noLine: t   

name: Outsource
initiative: 68
level: 2
top:
  actions:
    - custom: 'Grant one ally within %range% 3:'
    - attack: 4
      enhancement: [diamond]  
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - strengthen:
      sub:
      - target: 1 ally 
      - range: 1
    - optional:
      - custom: "-1 %resol% : %safeguard%, %ward%, %xp1%"
        margin: 7px 0px 7px 0px   

name: Fading Presence
initiative: 15
level: 3
top:
  actions:
    - stun: ''
      sub:
      - range: 3
      margin: 40px 0px 10px 0px 
    - custom: "When the next enemy dies this round, %lf% the target suffers %damage% 2."
      margin: 10px 0px 10px 0px 
    - mandatory:
      - dark
      margin: 20px 0px 0px 0px 
  duration: round 
bottom:
  actions:
    - custom: "Designate the hex you are occupying."
    - divider
    - teleport: 3
      enhancement: [circle]
    - optional:
      - custom: "-1 %resol% : +2 %teleport%, %xp1%"
      margin: 10px 0px 10px 0px 
    - divider
    - custom: "At the end of your turn, you %lf% may %teleport% to the designated hex."
      margin: 5px 0px 0px 0px 

name: Beneath Me
initiative: 85
level: 3
top:
  actions:
    - group:
      - custom: '%banner_t%'
        transform: scale(6)
        position: absolute
        left: 70px
        top: 15px
      - custom: '%irri%'
        transform: scale(0.9)
        position: absolute
        left: 31px
        top: 7px
      - custom: 'IRRITATION'
        transform: scale(0.9)
        position: absolute
        left: 57px
        top: 9px
    - custom: Gain 1 %resol%.
      margin: 5px 0px 0px 0px 
    - divider
    - custom: The first time each round one of your allies %lf% within %range% 3 attacks, they gain advantage %lf% on the attack and you gain 1 %resol%.
      margin: 5px -10px -5px -10px 
    - divider
    - mandatory:
      - custom: You cannot perform %lf% attack abilities.
      margin: -5px 0px 0px 0px  
  duration: persistent
bottom:
  actions:
    - attack: 6
      enhancement: [diamond]
      sub: 
      - range: 3
      margin: -15px 0px 5px 0px 
    - optional:
      - group:
        - custom: "-1 %resol% : +3 %attack%, %xp1%"
          margin: 5px 0px 0px 0px 
      - group:
        - custom: "-1 %resol% : +3 %attack%"
          margin: 10px 30px 5px 0px 
      flexDirection: column
  xp: 2
  lost: t
   name: Fool's Errand
initiative: 26
level: 4
top:
  actions:
    - attack: 1
      sub:
      - target: 2
      - range: 3
      - wound
    - optional:
      - group:
        - custom: "-1 %resol% : +1 %attack%, %xp1%"
          margin: 10px 0px 0px 0px 
      - group:
        - custom: "-1 %resol% : +1 %target%"
          margin: 10px 30px 10px 0px 
      flexDirection: column
bottom:
  actions:
    - custom: 'Grant one adjacent ally:'
      margin: 0px 0px 10px 0px
    - move: 3
      enhancement: [square]
      margin: 0px 0px 5px 0px
    - divider
    - custom: "%teleport% to an empty hex adjacent to %lf% the target of the grant ability."
      margin: 10px 0px 0px 0px  

name: Miniaturize
initiative: 86
level: 4
top:
  actions:
    - invisible:
      enhancement: [plus]
      sub:
      - self
    - divider
    - custom: Replace all adjacent traps and 1-hex %lf% obstacles with money tokens.
    - divider
    - loot: 1
bottom:
  actions:
    - muddle:
      enhancement: [diamond]
      sub:
      - range: 3
    - optional:
        - group: 
          - custom: "-2%nbsp1%"
        - group: 
          - custom: "%resol%"
        - group: 
          - custom: "%nbsp1%:"
        - group:
          - custom: If the target is a normal monster, it %lf% suffer %damage% equal to half (rounded up)%lf% its maximum hit point value. If the %lf% target is a elite monster, replace it %lf% with a normal monster of the same set, retaining its damage and conditions, %xp1%. 
            margin: 2px 0px 3px 0px   
 name: Don't Be a Baby
initiative: 33
level: 5
top:
  actions:
    - heal: 3
      enhancement: [square] 
      sub:
      - target: 2
      - range: 3
    - custom: If one or more of the heals would cause the %lf% target's current hit point value to increase %lf% beyond their maximum, gain %resol%.
      margin: 10px -10px 0px -10px         
bottom:
  actions:
    - move: 2
      enhancement: [circle]
      margin: 0px 0px 10px 0px    
    - divider
    - custom: "All enemies that have %wound% suffer %damage% 1."
      margin: 15px 0px 5px 0px    
    - optional:
      - custom: "-1 %resol% : +1 %damage%, %xp1%"
        margin: 5px 5px 5px 5px    

name: Trying to Remember
initiative: 55
level: 5
top:
  actions:
    - custom: You may gain %curse% to gain 1 %resol%.
    - divider
    - strengthen: 
      enhancement: [plus]
      sub:
      - self
    - divider
    - attack: 2 
      enhancement: [diamond]
      sub:
      - range: 3
      - muddle    
bottom:
  actions:
    - move: 3
      enhancement: [circle]
    - divider
    - custom: Immediately play one level 1 card from your %lf% discard pile to perform its bottom action.
      margin: 5px -10px 5px -10px  
    - optional:
      - group:
        - custom: "-1 %resol% : Play any level card instead, %xp1%."
          margin: 5px 0px 3px 0px  
      - group:
        - custom: "-1 %resol% : Perform the top action instead."
          margin: 2px 0px 5px 0px  
      flexDirection: column
      margin: 3px 0px 0px 0px  
name: Dismissive Comment
initiative: 20
level: 6
top:
  actions:
    - push: 2
      sub:
      - target: 1 ally
      - range: 1
      margin: 10px 0px 0px 0px 
    - optional:
      - custom: "-1 %resol% : +1 %push%, +1 %range%, %xp1%"
        margin: 7px 0px 3px 0px 
      margin: 8px 0px 10px 0px 
    - divider
    - custom: "Grant the target of the push ability:"
      margin: 10px 0px 0px 0px 
    - attack: 2
      enhancement: [diamond]
    - custom: "Add +2 %attack% for each hex pushed." 
      margin: 5px 0px 0px 0px 
bottom:
  actions:
    - teleport: 5
      enhancement: [circle]

name: Withering Stare
initiative: 38
level: 6
top:
  actions:
    - group:
      - group:
        - muddle:
          margin: 0px 0px 7px 0px
        - optional:
          - group:
            - custom: "-1 %resol% : %immobilize%"
              margin: 7px 5px 0px 5px
          - group:
            - custom: "-2 %resol% : %stun%"
              margin: 7px 0px 7px 0px
          flexDirection: column
        flexDirection: column
        margin: 10px 0px 0px 0px
      - hex: ett_st
        margin: -20px 0px 0px 20px
      flexDirection: row
      margin: -20px 0px 0px 0px  
  xp: 1

bottom:
  actions:
    - teleport: 6
      enhancement: [circle]
      margin: -20px 0px 5px 0px  
    - custom: This %teleport% must end adjacent %lf% to at least one enemy.
    - divider
    - push: 2
      enhancement: [square]
      sub: 
      - target: all
      - range: 1
      margin: 5px 0px 0px 0px        


name: Tear a New One
initiative: 19
level: 7
top:
  actions:
    - group:
      - group:
        - attack: 3
          margin: 0px 0px 7px 0px
          sub:
            - custom: '%range% 3'
        - optional:
          - custom: "-1 %resol% : +1 %attack%, %pierce% 1, %xp1%"
            margin: 7px 0px 7px 0px
        flexDirection: column
        margin: 10px 0px 0px 0px
      - hex: ett_ttt_ett
        margin: 10px 0px 0px 0px
      flexDirection: row
      margin: -20px 0px 0px 0px  
    - divider
    - optional:
      - custom: "-2 %resol% : Ignore %lost%  on this card."
        margin: 7px 0px 7px 0px 
      noLine: true
  xp: 1
  lost: t
bottom:
  actions:
    - custom: Gain 5 %resol%. 
      margin: 0px 0px 10px 0px
    - divider
    - optional:
      - custom: "-4 %resol% : Ignore %lost%  on this card."
        margin: 5px 0px 5px 0px
      margin: 10px 0px 0px 0px
      noLine: t
  lost: t

name: Collect Essence
initiative: 41
level: 7
top:
  actions:
    - attack: 3
      enhancement: [square]
      sub:
      - range: 3
    - optional:
      - group:
        - custom: "-1 %resol% : +3 %attack%, %xp1%"
          margin: 10px 0px 0px 0px 
      - group:
        - custom: "-1 %resol% : +3 %attack%"
          margin: 10px 30px 10px 0px 
      flexDirection: column
    - divider 
    - custom: "If the attack killed an enemy, %lf% perform:"
    - bless:
      enhancement: [plus]
      sub:
      - self
bottom:
  actions:
    - move: 2
      enhancement: [circle]
    - divider
    - loot: 1
    - optional:
        - group: 
          - custom: "-1%nbsp1%"
            margin: 0px -0px 0px -2px   
        - group: 
          - custom: "%resol%"
          margin: 0px 0px 0px 0px   
        - group: 
          - custom: ":"
          margin: 0px 0px 0px 2px   
        - group:
          - custom: Place one damage token on this %lf% card for each token looted. %lf% Whenever you attack, you may %ls% discard this card and add +2 %attack% %lf% for each damage token.
          margin: 0px -7px 0px -2px   
        - group:
           - custom: "%persistent%"
             transform: scale(1.5)
          margin: 0px 0px 0px 12px  

name: Kill That One First
initiative: 07
level: 8
top:
  actions:
    - multi:
      - poison: ''
      - custom: ','
        margin: 5px -5px -20px -8px
      - strengthen: ''
        enhancement: [diamond]
        sub:
        - target: 1 enemy
        - range: 3
          padding: 2px 5px 2px 5px 
    - divider
    - custom: "Your allies add +2 %attack% to all attacks %lf% targeting enemies that have %strengthen%. The next %lf% time an enemy that has %strengthen% is killed by %lf% one of your allies, move this card to your %lf% discard pile and that ally performs:"
      margin: 2px -5px 0px -5px
      lineHeight: 22px 
    - heal: 6
      sub:
      - self
      - safeguard
      - ward 
      - strengthen
      - bless
      margin: 0px 0px 0px -15px
  duration: persistent  
bottom:
  actions:
    - attack: 2
      enhancement: [diamond]
      sub: 
      - range: 3
      - pierce: 3
        padding: 3px 2px 3px 4px    
      padding: 0px 0px 10px 0px    

    - optional:
        - group: 
          - custom: "-1%nbsp1%"
          margin: 0px 0px 0px -30px   
        - group: 
          - custom: "%resol%"
          margin: 0px 0px 0px 0px   
        - group: 
          - custom: ":"
          margin: 0px 0px 0px 2px   
        - group:
          - custom: Your allies gain advantage%lf% on and add %pierce% 3 to all %lf% attacks targeting the target %lf% this round, %xp1%.
            lineHeight: 22px  
          margin: 0px -5px 0px -2px
          padding: 0px 5px 0px 10px
        - group:
           - custom: "%persistent%"
             transform: scale(1.5)
          margin: 0px -20px 0px 20px
      padding: 5px 30px 5px 30px


name: Closed for Business
initiative: 23
level: 8
top:
  actions:
    - custom: At the end of this and your next three %lf% turns, place a damage token on one of the following abilities without a damage token %lf% and perform that ability. At the start of your %lf% turn, if there are four damage tokens on this %lf% card, remove it to your lost pile. When this %lf% card is moved to your lost pile, you exhaust.
      margin: 8px -15px 0px -15px
      lineHeight: 18px 
    - group:
      - attack: 10
        sub:
        - range: 3
        margin: 0px 10px 0px 0px 
      - heal: 10
        sub:
        - range: 3
        margin: 0px 10px 0px 5px 
      - teleport: 10
        margin: 0px 0px 0px 5px 
    - loot: 3
  xp: 2
  duration: persistent
  lost: t    
bottom:
  actions:
    - custom: '%recover% all your spent items.'
    - divider
    - custom: "The next two times an enemy ends their %lf% move ability adjacent to you, perform:"
    - push: 3
      sub:
      - target: the enemy
    - tokens: [0,0]
  duration: persistent  

name: Fired Up
initiative: 70
level: 9
top:
  actions:
    - group:
      - custom: '%banner_t%'
        transform: scale(6)
        position: absolute
        left: 70px
        top: 15px
      - custom: '%irri%'
        transform: scale(0.9)
        position: absolute
        left: 31px
        top: 7px
      - custom: 'IRRITATION'
        transform: scale(0.9)
        position: absolute
        left: 57px
        top: 9px

    - custom: At the end of each of your turns, if you %lf%have 0 %resol%,  place one damage token on %lf% this card and then gain 1 %resol% for each %lf% damage token. Otherwise, move this card %lf% to your  discard pile. 
      margin: 20px -20px 0px -20px
      fontSize: 22px   
    - custom: When this card is moved to your discard %lf% pile, lose all %resol% and suffer %damage% 1 for each %lf% damage token on this card.
      margin: 0px -20px 0px -20px
      fontSize: 22px   
  duration: persistent    
bottom:
  actions:
    - attack: 4
      enhancement: [diamond]
      sub:
      - range: 4
    - optional:
      - group:
        - custom: "-1 %resol% : +1 %attack%, %wound%, %xp1%"
          margin: 5px 25px 0px 0px 
      - group:
        - custom: "-1 %resol% : +1 %attack%, advantage"
          margin: 10px 5px 5px 0px 
      flexDirection: column
    - mandatory:
      - fire
      margin: 20px 0px 0px 0px 
      
 name: The Power of Enhancement
initiative: 98
level: 9
top:
  actions:
    - custom: The first time each turn an ally performs %lf% an action with an enhancement, if there are less than five damage tokens on this %lf% card, add one.
    - custom: At the end of any of your turns, you may %lf% discard this card to have one enemy %lf% within %range% 3 suffer %damage% 2 for each damage %lf% token on this card.
      margin: 10px 0px 0px 0px 
  duration: persistent
bottom:
  actions:
    - custom: Your allies perform all their abilities as if %lf% they had a %enhance1% sticker on all empty %lf% enhancement dots except on summon stats.
      margin: -10px -10px 0px -10px 
  duration: persistent


