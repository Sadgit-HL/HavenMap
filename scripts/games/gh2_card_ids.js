// Which Secretariat card (the id printed in the bottom left corner of the card image, scripts/games/gh2_monsters.js) a map card is, for the cards whose
// initiative is shared with another card of the same deck: the map's card numbers (gh_decks.js, the image suffix) are not the Secretariat's ids, and
// initiative and shuffle mark alone cannot tell such cards apart. Hand-maintained, not generated: read from the images in images/monster-abilities/gh2 (the id
// in the corner, checked against the card title and against the initiative) on 2026-11-22. tools/tests/monsterCard.test.mjs fails when a card that needs an
// entry has none, or an entry does not fit its card. Used by cardCandidates() in scripts/monsterCard.js.
//   GH2_CARD_IDS[deck slug][map card number] = Secretariat card id

export const GH2_CARD_IDS = {
  'ancient-artillery': { 4: 600, 7: 607 },   // Long Shot, Concussive Burst
  'deep-terror': { 3: 637, 4: 636 },   // Disruptive Frenzy, Rooted Fear
  'frost-demon': { 2: 560, 4: 562, 5: 563, 6: 667, 8: 566 },   // Gather the Frost, Frozen Shards, Nothing Special, Ice Barrier, Chilled to the Bone
  'harrower-infester': { 1: 688, 4: 695, 5: 692, 7: 690 },   // Biting Gnats, Clouds of Hate, Spiked Mandibles, Restore the Swarm
  'imp': { 2: 700, 7: 702 },   // Rotten Sting, Dark Charm
  'lurker-soldier': { 2: 626, 4: 627 },   // Nothing Special, Focused Strikes
  'ooze': { 5: 743, 8: 740 },   // Feed, Calculated Strike
  'stone-construct': { 2: 783, 5: 777 },   // Runic Draw, Taxing Advance
  'priest': { 1: 656, 8: 657 },   // Drain Speed, Drain Strength
  'savvas-icestorm': { 2: 682, 4: 684, 7: 681, 8: 685 },   // Call to the Frost, Freezing Winds, Call to the Wind, Frozen Shell
  'savvas-lavaflow': { 3: 672, 4: 673, 6: 679, 7: 675 },   // Call to the Flame, Call to the Earth, Fire Bolts, Rock Bomb
  'wind-demon': { 2: 573, 6: 574 },   // Cutting Blast, Blast of Air
};
