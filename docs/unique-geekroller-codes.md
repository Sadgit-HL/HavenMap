# Unique perk GeekRoller codes (implemented)

Implemented in `scripts/amd/uniqueFaceText.js`, used by `scripts/amd/heroDeck.js`'s `faceText()`. Bless/Curse shortened to `B`/`C` in `scripts/attackMods.js` (AM_SPECIAL.face).

Abbreviation vocabulary (from the monster-ability-card convention): M/A/H/S/R/L/T single-letter stats, `>` for Rolling (also used for decorated/shared-card faces, e.g. "+0 Pierce 3 >"), `immo`/`inv` for the two long condition names, everything else spelled out. `>` is reserved exclusively for Rolling -- the 3 cards that used an arrow for a different meaning (a causal "in order to" / "moves into") are reworded with a plain word (`for`, `to`) instead, to avoid implying a reshuffle that doesn't happen. The card's own value is separated from the rest by a colon (`+1: effect`) -- the same "label: content" pattern already used for a granted action (`ally R3: M2`). `A` (Attack) only appears when describing an action granted to a summon/ally (e.g. "DS: A2 R5"), never for the card's own attack bonus, since every card in an attack modifier deck already modifies attack by definition. The word `target` is kept in full when it refers to the attacked enemy as a noun ("adj target"); bare `T` is reserved for the numeric target-count modifier (`T2`, `T+1`). Named token items are abbreviated: `TT`=Time Token, `TrT`=Tear Token, `PgT`=Plague Token. A class name referenced within a perk uses that class's existing 2-letter unique-code prefix, uppercased: `DS`=Doomstalker, `BO`=Boneshaper, `WF`=Wildfury.

BGG's GeekRoller caps an entire roll at 241 characters total across all faces, and the `;` character is reserved as the face separator (checked: none of these 68 labels contain one). These cut the total for unique-card faces from 3117 to 1711 characters (1406 saved) across all 68 cards combined. Max single label: 45 chars.

12 cards (bb1, bo2, br1, ca3, ph2, py1, sa3, sh2, sd2, ss2, ta4, wf1) have no colon-separated value prefix: their source text never states the resulting card's own value, so one was not guessed.

| Class | Edition | Code | Previous | Implemented | Raw text |
|---|---|---|---|---|---|
| Anaphi | MP | an2 | Add + 1 attack when drawn by a summon | +1: +1 if drawn by summon | Replace two +0 cards with one +1 "Add + 1 %attack% when drawn by a summon" card |
| Anaphi | MP | an1 | strengthen, target 1 of your summons | +2: strengthen T1 summon | Add one +2 "%strengthen%, %target% 1 of your summons" card |
| Banner Spear | FH | bn1 | Add + 1 attack for each ally adjacent to the target | +1: +1/adj ally | Replace one +0 card with one +1 "Add + 1 %attack% for each ally adjacent to the target" card |
| Berserker | GH2E | be1 | You may suffer damage 2 to add + 2 attack | +1: suffer dmg2 for +2 | Replace two +0 card with one +1 "You may suffer %damage% 2 to add + 2 %attack%" card |
| Berserker | GH2E | be2 | Suffer damage equal to half your current hit point value ... | 2x: suffer dmg = half current HP | Add one 2x "Suffer %damage% equal to half your current hit point value (rounded down)" card |
| Bladeswarm | GH2E | bs1 | Add + 1attack for each card with a lost icon in Bladeswar... | +0: +1/lost card in area | Replace one +0 card with one +0 "Add + 1%attack% for each card with a lost icon in Bladeswarm's active area" card |
| Blinkblade | FH | bb1 | Place this card in your active area. On your next attack,... | active area, next atk: +2A > | Replace one +0 card with one "Place this card in your active area. On your next attack, discard this card to add + 2 %attack%" %flip% card |
| Blinkblade | FH | bb2 | Gain 1 Time token | -1: gain 1 TT | Add one -1 "Gain 1 Time token" |
| Boneshaper | FH | bo1 | Kill the attacking summon to instead add +4 | +1: kill summon: +4 instead | Replace one +0 with one +1 "Kill the attacking summon to instead add +4" card |
| Boneshaper | FH | bo2 | heal1, target Boneshaper | H1 T:BO > | Add three "%heal%1, %target% Boneshaper"%flip% cards |
| Bruiser | GH2E | br1 | Add this card to your active area. On the next attack tar... | active area, next atk on you by adj e: Ret2 > | Replace one +0 with one "Add this card to your active area. On the next attack targeting you performed by an adjacent enemy, discard this card to gain %retaliate% 2 for the attack"%flip% card |
| Cassandra | MP | ca1 | bless, target self or 1 ally | +0: bless T:self or 1 ally | Replace one -1 card with one +0 "%bless%, %target% self or 1 ally" card |
| Cassandra | MP | ca2 | Add +1 attack if the top card of the monster attack modif... | +2: +1 if monster top card revealed | Replace one +0 card with one +2 "Add +1 %attack% if the top card of the monster attack modifier deck is revealed" |
| Cassandra | MP | ca3 | Place this card in your active area. When you next place ... | active area, next rift: +1 more R1 > | Add one +1 "Place this card in your active area. When you next place a rift, discard this card to place another rift within %range% 1 of it"%flip% |
| Cragheart | GH2E | ch1 | Create one 1-hex obstacle tile in an empty hex adjacent t... | +1: create 1-hex obstacle adj target > | Replace one +0 card with one +1 "Create one 1-hex obstacle tile in an empty hex adjacent to the target"%flip% card |
| Crashing Tide | FH | cr1 | If you performed a tide action this round, +2 instead | +1: tide this round: +2 instead | Add two +1 "If you performed a tide action this round, +2 instead" cards |
| Deepwraith | FH | dt1 | Gain one trophy | +1: gain 1 trophy | add two +1 "Gain one trophy" cards |
| Demolitionist | JotL | de1 | all adjacent enemies suffer 1 damage | +0: all adj e suffer dmg1 | Add one +0 "all adjacent enemies suffer 1 damage" card |
| Doomstalker | GH2E | ds1 | Doomstalker performs: attack 2, range 5 | -1: DS: A2 R5 | Replace one -1 card with one -1 "Doomstalker performs: %attack% 2, %range% 5" card |
| Doomstalker | GH2E | ds2 | Grant one of your summons adjacent to the target: attack+ 0 | +0: summon adj target: A+0 | Add one +0 "Grant one of your summons adjacent to the target: %attack%+ 0" card |
| Drifter | FH | df1 | Move one of your character tokens backward one slot | +0: move token back 1 slot | Replace one +1 card with two +0 "Move one of your character tokens backward one slot" cards |
| Frozen Fist | FH | ff1 | Create one 1-hex icy terrain tile in a featureless hex ad... | +2: create 1-hex icy terrain adj target | Replace one +0 cards with one +2 "Create one 1-hex icy terrain tile in a featureless hex adjacent to the target" card |
| Geminate | FH | ge1 | brittle, self | 2x: brittle(self) | Add one 2x "%brittle%, self" card |
| H.I.V.E. | FH | hv1 | After this attack ability, grant one of your summons: move 2 | +0: summon: M2 | Replace one -1 card with one +0 "After this attack ability, grant one of your summons: %move% 2" card |
| H.I.V.E. | FH | hv2 | After this attack ability, Transfer | +1: Transfer | Replace one +0 card with one +1 "After this attack ability, Transfer" card |
| Hail | MP | ha1 | Replace one -1 card with one +0 wound or immobilize | +0: wound/immo | Replace one -1 card with one +0 %wound% or %immobilize% |
| Hail | MP | ha2 | Replace two +0 cards with one +1 poison or muddle card | +1: poison/muddle | Replace two +0 cards with one +1 %poison% or %muddle% card |
| Infuser | FH | if1 | Move one waning element to strong | +0: move waning elem to strong > | Replace one +0 with three "Move one waning element to strong"%flip% cards |
| Infuser | FH | if2 | + 1 attack for each pair of active infusions | +1: per 2 active infusions > | add two "+ 1 %attack% for each pair of active infusions"%flip% cards |
| Metal Mosaic | FH | me1 | gain or lose pressure | +0: gain/lose pressure | Replace one -1 card with one +0 "gain or lose pressure" card |
| Metal Mosaic | FH | me2 | The target and all enemies adjacent to it suffer damage 1 | +0: target+adj e suffer dmg1 | Replace one +0 card with one +0 "The target and all enemies adjacent to it suffer %damage% 1" card |
| Mindthief | GH2E | mt1 | After the attack ability, control the target: move 1 | +0: control target: M1 | Replace two -1 cards with one +0 "After the attack ability, control the target: %move% 1" card |
| Mindthief | GH2E | mt2 | Add + 1 attack for each negative condition the target has | +1: +1/neg cond target has | Replace one +0 card with one +1 "Add + 1 %attack% for each negative condition the target has" card |
| Nightshroud | GH2E | ns1 | After the attack ability, grant one adjacent ally or self... | +0: adj ally/self: TP2 > | Replace one -1 card with two "After the attack ability, grant one adjacent ally or self: %teleport% 2"%flip% cards |
| Nightshroud | GH2E | ns2 | Replace one null card with one -2 shuffle card | -2: shuffle | Replace one null card with one -2 shuffle card |
| Nightshroud | GH2E | ns3 | If this attack kills the target, shuffle one curse card i... | +1: if kills target: curse to monster deck | Replace two +0 cards with two +1 "If this attack kills the target, shuffle one %curse% card into the monster attack modifier deck" cards |
| Nightshroud | GH2E | ns4 | Place one Tear Token in a hex adjacent to the target | +1: place TrT adj target | Replace one +1 card with one "Place one Tear Token in a hex adjacent to the target" card |
| Pain Conduit | FH | pc1 | add + 1 attack for each negative condition you have | +0: +1/neg condition you have | Add one +0 "add + 1 %attack% for each negative condition you have" card |
| Plagueherald | GH2E | ph1 | give the target or one enemy within range 2 of the target... | +0: PgT: target/e R2 | Replace one -1 card with one +0 "give the target or one enemy within %range% 2 of the target a Plague Token" cards |
| Plagueherald | GH2E | ph2 | Give the target or one enemy within range 2 of the target... | poison: target/e R2 > | Add three "Give the target or one enemy within %range% 2 of the target %poison%"%flip% cards |
| Pyroclast | FH | py1 | Create one 1-hex hazardous terrain tile in a featureless ... | create 1-hex hazard terrain adj target | Replace one -1 card with one "Create one 1-hex hazardous terrain tile in a featureless hex adjacent to the target" card |
| Quartermaster | GH2E | qm1 | Gain 10 Supplies | +0: gain 10 Supplies | Replace one +0 card with one +0 "Gain 10 Supplies" card |
| Quartermaster | GH2E | qm2 | Gain the Barbed Strip or Iron Plate item | +0: gain Barbed Strip or Iron Plate | Replace one +1 card with two +0 "Gain the Barbed Strip or Iron Plate item" cards |
| Quartermaster | GH2E | qm3 | Gain the Scroll of Relocation or Sharpened Dirk item | +0: gain Scroll of Reloc. or Sharp. Dirk > | Add one +0"Gain the Scroll of Relocation or Sharpened Dirk item"%flip% card |
| Satha | MP | sa1 | heal 1, target 1 ally and self | +1: H1 T1 ally+self | Replace two +0 cards with one +1 "%heal% 1, %target% 1 ally and self" card |
| Satha | MP | sa2 | Grant one ally within range 3: attack 2 range 3 or attack 3 | +0: ally R3: A2 R3 or A3 | Add one +0 "Grant one ally within %range% 3: %attack% 2 %range% 3 or %attack% 3" card |
| Satha | MP | sa3 | Grant one ally within range 3: move 2 | disarm > + +0 ally R3: M2 > | Add one %disarm%%flip% and one +0 "Grant one ally within %range% 3: %move% 2"%flip% card |
| Sawbones | GH2E | sb1 | Give one adjacent ally or self one medical pack | -2: adj ally/self: medical pack | Replace one -2 card with one -2 "Give one adjacent ally or self one medical pack" card |
| Sawbones | GH2E | sb2 | You may gain disarm to add stun | +1: disarm for stun | Replace two +0 cards with one +1 "You may gain %disarm% to add %stun%" card |
| Sawbones | GH2E | sb3 | Add + 1attack if an ally has an active Prescription | +1: +1 if ally has Prescription | Add two +1 "Add + 1%attack% if an ally has an active Prescription" cards |
| Shattersong | FH | sh1 | Reveal the top card of the target's monster ability deck | +0: reveal target's next monster card | Replace two -1 cards with two +0 "Reveal the top card of the target's monster ability deck" cards |
| Shattersong | FH | sh2 | heal 2 bless, target 1 ally | H2 bless T1 ally > | Add one "%heal% 2 %bless%, %target% 1 ally"%flip% card |
| Shattersong | FH | sh3 | Gain one Resonance | +1: gain 1 Resonance > | Add one +1 "Gain one Resonance"%flip% card |
| Silent Knife | GH2E | sn1 | Gain one money token if this attack targeted an adjacent ... | +1: gain 1 money if atk adj e | Replace one +0 card with one +1 "Gain one money token if this attack targeted an adjacent enemy" card |
| Snowdancer | FH | sd1 | if this action forces the target to move, it suffers dama... | +0: if forces move: dmg1 > | Replace two +0 cards with two "if this action forces the target to move, it suffers %damage% 1" %flip% cards |
| Snowdancer | FH | sd2 | heal 1, ward, target 1 ally | H1 ward T1 ally > | Add one "%heal% 1, %ward%, %target% 1 ally" %flip% card |
| Soothsinger | GH2E | ss1 | Skip moving your character tokens on each active Song at ... | +0: skip moving tokens on active Song | Replace one -1 card with one +0 "Skip moving your character tokens on each active Song at the rend of this round%" card |
| Soothsinger | GH2E | ss2 | Grant one ally: move 2 or attack 2 | ally: M2 or A2 > | Add one "Grant one ally: %move% 2 or %attack% 2"%flip% card |
| Soultether | GH2E | so1 | After the attack ability, grant one of your summons: tele... | +0: summon: TP2 | Replace one -1 card with one +0 "After the attack ability, grant one of your summons: %teleport% 2" card |
| Soultether | GH2E | so2 | invisible, target 1 of your summons | +1: inv T1 summon | Replace one +0 card with one +1 "%invisible%, %target% 1 of your summons" card |
| Spellweaver | GH2E | sw1 | Add + 2 attack if drawn during a lost action | +1: +2 if drawn during lost | Replace one +0 with one +1 "Add + 2 %attack% if drawn during a lost action" card |
| Sunkeeper | GH2E | sk1 | You or an adjacent ally may recover one level 1 card from... | +1: recover lvl1 card (you/adj ally) | Add one +1 "You or an adjacent ally may recover one level 1 card from the discard pile" card |
| Trapper | FH | ta1 | create one heal 2 trap in an empty hex adjacent to the ta... | +0: create H2 trap adj target | Replace one -1 cards with one +0 "create one %heal% 2 trap in an empty hex adjacent to the target" card |
| Trapper | FH | ta2 | create one damage 1 trap in an empty hex adjacent to the ... | +0: create dmg1 trap adj target | Replace one -1 cards with one +0 "create one %damage% 1 trap in an empty hex adjacent to the target" card |
| Trapper | FH | ta3 | Add damage 2 or heal 2 to a trap within range 2 of you | +0: trap: +dmg2 or +H2, you R2 | Replace two +0 cards with two +0 "Add %damage% 2 or %heal% 2 to a trap within %range% 2 of you" cards |
| Trapper | FH | ta4 | Add push 2 or pull 2 | push2/pull2 to trap > | Add two "Add %push% 2 or %pull% 2"%flip% cards |
| Wildfury | GH2E | wf1 | heal 2, target the Bear | H2 T:Bear > | Replace one -1 card with one "%heal% 2, %target% the Bear"%flip% card |
| Wildfury | GH2E | wf2 | Add + 1attack if the Wildfury and the Bear are within ran... | +2: +1 if WF+Bear within R4 | Replace one +0 card with one +2 "Add + 1%attack% if the Wildfury and the Bear are within %range% 4 of each other" card |
