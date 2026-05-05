// Monster stats for Gloomhaven 2nd Edition
// Extracted from Gloomhaven 2nd Edition.json
// Level ranges: 0-7
// Each monster has: count (level-independent) and levels object with health values

const MONSTER_STATS = {
  'Alpha Lurker (2e)': {
    count: 6,
    levels: {
      0: { health: '7xC' },
      1: { health: '9xC' },
      2: { health: '11xC' },
      3: { health: '13xC' },
      4: { health: '13xC' },
      5: { health: '15xC' },
      6: { health: '19xC' },
      7: { health: '27xC' }
    }
  },

  'Ancient Artillery (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 6, elite: 9 },
      2: { normal: 8, elite: 12 },
      3: { normal: 9, elite: 14 },
      4: { normal: 12, elite: 16 },
      5: { normal: 15, elite: 21 },
      6: { normal: 18, elite: 26 },
      7: { normal: 21, elite: 34 }
    }
  },

  'Arcane Construct (2e)': {
    count: 4,
    levels: {
      0: { health: '10xC' },
      1: { health: '11xC' },
      2: { health: '14xC' },
      3: { health: '15xC' },
      4: { health: '17xC' },
      5: { health: '19xC' },
      6: { health: '23xC' },
      7: { health: '26xC' }
    }
  },

  'Bandit Archer (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 6 },
      1: { normal: 5, elite: 7 },
      2: { normal: 6, elite: 9 },
      3: { normal: 6, elite: 10 },
      4: { normal: 8, elite: 10 },
      5: { normal: 9, elite: 12 },
      6: { normal: 9, elite: 13 },
      7: { normal: 12, elite: 17 }
    }
  },

  'Bandit Commander (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx13' },
      1: { health: 'Cx17' },
      2: { health: 'Cx19' },
      3: { health: 'Cx21' },
      4: { health: 'Cx25' },
      5: { health: 'Cx28' },
      6: { health: 'Cx33' },
      7: { health: 'Cx40' }
    }
  },

  'Bandit Scout (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 7 },
      1: { normal: 6, elite: 8 },
      2: { normal: 7, elite: 9 },
      3: { normal: 10, elite: 12 },
      4: { normal: 11, elite: 14 },
      5: { normal: 11, elite: 15 },
      6: { normal: 16, elite: 18 },
      7: { normal: 19, elite: 22 }
    }
  },

  'Black Imp (2e)': {
    count: 10,
    levels: {
      0: { normal: 3, elite: 3 },
      1: { normal: 3, elite: 5 },
      2: { normal: 4, elite: 7 },
      3: { normal: 4, elite: 7 },
      4: { normal: 5, elite: 7 },
      5: { normal: 7, elite: 9 },
      6: { normal: 9, elite: 12 },
      7: { normal: 13, elite: 18 }
    }
  },

  'Black Imp 99 (2e)': {
    count: 10,
    levels: {
      0: { normal: 3, elite: 3 },
      1: { normal: 3, elite: 5 },
      2: { normal: 4, elite: 7 },
      3: { normal: 4, elite: 7 },
      4: { normal: 5, elite: 7 },
      5: { normal: 7, elite: 9 },
      6: { normal: 9, elite: 12 },
      7: { normal: 13, elite: 18 }
    }
  },

  'Bloated Victim (2e)': {
    count: 6,
    levels: {
      0: { health: '10xC' },
      1: { health: '11xC' },
      2: { health: '15xC' },
      3: { health: '15xC' },
      4: { health: '19xC' },
      5: { health: '21xC' },
      6: { health: '31xC' },
      7: { health: '36xC' }
    }
  },

  'Candlekeeper Trice': {
    count: 1,
    levels: {
      0: { health: 'Cx18' },
      1: { health: 'Cx20' },
      2: { health: 'Cx24' },
      3: { health: 'Cx25' },
      4: { health: 'Cx29' },
      5: { health: 'Cx31' },
      6: { health: 'Cx37' },
      7: { health: 'Cx44' }
    }
  },

  'Candlekeeper Trice 56': {
    count: 1,
    levels: {
      0: { health: '6' },
      1: { health: '9' },
      2: { health: '12' },
      3: { health: '15' },
      4: { health: '18' },
      5: { health: '21' },
      6: { health: '24' },
      7: { health: '27' }
    }
  },

  'Cave Bear (2e)': {
    count: 4,
    levels: {
      0: { normal: 7, elite: 11 },
      1: { normal: 9, elite: 14 },
      2: { normal: 11, elite: 17 },
      3: { normal: 13, elite: 20 },
      4: { normal: 15, elite: 21 },
      5: { normal: 17, elite: 24 },
      6: { normal: 21, elite: 29 },
      7: { normal: 27, elite: 37 }
    }
  },

  'Cave Bear 58 (2e)': {
    count: 4,
    levels: {
      0: { normal: 7, elite: 11 },
      1: { normal: 9, elite: 14 },
      2: { normal: 11, elite: 17 },
      3: { normal: 13, elite: 20 },
      4: { normal: 15, elite: 21 },
      5: { normal: 17, elite: 24 },
      6: { normal: 21, elite: 29 },
      7: { normal: 27, elite: 37 }
    }
  },

  'Chaos Demon (2e)': {
    count: 4,
    levels: {
      0: { normal: 7, elite: 10 },
      1: { normal: 8, elite: 12 },
      2: { normal: 11, elite: 14 },
      3: { normal: 12, elite: 18 },
      4: { normal: 14, elite: 21 },
      5: { normal: 16, elite: 26 },
      6: { normal: 20, elite: 33 },
      7: { normal: 25, elite: 39 }
    }
  },

  'City Archer (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 6 },
      1: { normal: 5, elite: 6 },
      2: { normal: 6, elite: 7 },
      3: { normal: 6, elite: 8 },
      4: { normal: 8, elite: 10 },
      5: { normal: 8, elite: 11 },
      6: { normal: 10, elite: 14 },
      7: { normal: 11, elite: 16 }
    }
  },

  'City Guard (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 6 },
      1: { normal: 5, elite: 6 },
      2: { normal: 7, elite: 9 },
      3: { normal: 8, elite: 9 },
      4: { normal: 9, elite: 10 },
      5: { normal: 10, elite: 13 },
      6: { normal: 13, elite: 15 },
      7: { normal: 17, elite: 20 }
    }
  },

  'City Guard 17 (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 6 },
      1: { normal: 5, elite: 6 },
      2: { normal: 7, elite: 9 },
      3: { normal: 8, elite: 9 },
      4: { normal: 9, elite: 10 },
      5: { normal: 10, elite: 13 },
      6: { normal: 13, elite: 15 },
      7: { normal: 17, elite: 20 }
    }
  },

  'Corrupt City Guard (2e)': {
    count: 6,
    levels: {
      0: { health: '6xC' },
      1: { health: '6xC' },
      2: { health: '9xC' },
      3: { health: '9xC' },
      4: { health: '10xC' },
      5: { health: '13xC' },
      6: { health: '15xC' },
      7: { health: '20xC' }
    }
  },

  'Crystal Rot (2e)': {
    count: 4,
    levels: {
      0: { normal: 5, elite: 8 },
      1: { normal: 6, elite: 9 },
      2: { normal: 7, elite: 11 },
      3: { normal: 10, elite: 16 },
      4: { normal: 11, elite: 18 },
      5: { normal: 13, elite: 21 },
      6: { normal: 18, elite: 29 },
      7: { normal: 21, elite: 33 }
    }
  },

  'Cultist (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 6, elite: 9 },
      2: { normal: 7, elite: 11 },
      3: { normal: 8, elite: 15 },
      4: { normal: 9, elite: 16 },
      5: { normal: 11, elite: 20 },
      6: { normal: 16, elite: 26 },
      7: { normal: 18, elite: 30 }
    }
  },

  'Cultist 54 (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 6, elite: 9 },
      2: { normal: 7, elite: 11 },
      3: { normal: 8, elite: 15 },
      4: { normal: 9, elite: 16 },
      5: { normal: 11, elite: 20 },
      6: { normal: 16, elite: 26 },
      7: { normal: 18, elite: 30 }
    }
  },

  'Cultist 82 (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 6, elite: 9 },
      2: { normal: 7, elite: 11 },
      3: { normal: 8, elite: 15 },
      4: { normal: 9, elite: 16 },
      5: { normal: 11, elite: 20 },
      6: { normal: 16, elite: 26 },
      7: { normal: 18, elite: 30 }
    }
  },

  'Dark Ritual Cultist (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 6, elite: 9 },
      2: { normal: 7, elite: 11 },
      3: { normal: 8, elite: 15 },
      4: { normal: 9, elite: 16 },
      5: { normal: 11, elite: 20 },
      6: { normal: 16, elite: 26 },
      7: { normal: 18, elite: 30 }
    }
  },

  'Deep Terror (2e)': {
    count: 10,
    levels: {
      0: { normal: 3, elite: 5 },
      1: { normal: 4, elite: 6 },
      2: { normal: 4, elite: 7 },
      3: { normal: 5, elite: 8 },
      4: { normal: 7, elite: 9 },
      5: { normal: 7, elite: 11 },
      6: { normal: 9, elite: 13 },
      7: { normal: 9, elite: 16 }
    }
  },

  'Deep Terror 51 (2e)': {
    count: 10,
    levels: {
      0: { normal: 3, elite: 5 },
      1: { normal: 4, elite: 6 },
      2: { normal: 4, elite: 7 },
      3: { normal: 5, elite: 8 },
      4: { normal: 7, elite: 9 },
      5: { normal: 7, elite: 11 },
      6: { normal: 9, elite: 13 },
      7: { normal: 9, elite: 16 }
    }
  },

  'Disjointed Twin (2e)': {
    count: 4,
    levels: {
      0: { health: '13xC' },
      1: { health: '15xC' },
      2: { health: '18xC' },
      3: { health: '21xC' },
      4: { health: '25xC' },
      5: { health: '30xC' },
      6: { health: '40xC' },
      7: { health: '50xC' }
    }
  },

  'Doomcannon (2e)': {
    count: 6,
    levels: {
      0: { health: '14xC' },
      1: { health: '18xC' },
      2: { health: '24xC' },
      3: { health: '28xC' },
      4: { health: '32xC' },
      5: { health: '42xC' },
      6: { health: '52xC' },
      7: { health: '68xC' }
    }
  },

  'Earth Demon (2e)': {
    count: 6,
    levels: {
      0: { normal: 7, elite: 10 },
      1: { normal: 9, elite: 13 },
      2: { normal: 12, elite: 18 },
      3: { normal: 13, elite: 20 },
      4: { normal: 15, elite: 21 },
      5: { normal: 17, elite: 25 },
      6: { normal: 21, elite: 32 },
      7: { normal: 25, elite: 42 }
    }
  },

  'Egg 50': {
    count: 10,
    levels: {
      0: { health: '4' },
      1: { health: '5' },
      2: { health: '5' },
      3: { health: '6' },
      4: { health: '6' },
      5: { health: '7' },
      6: { health: '7' },
      7: { health: '8' }
    }
  },

  'First Shield Harmon (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx10' },
      1: { health: 'Cx12' },
      2: { health: 'Cx14' },
      3: { health: 'Cx16' },
      4: { health: 'Cx20' },
      5: { health: 'Cx23' },
      6: { health: 'Cx28' },
      7: { health: 'Cx34' }
    }
  },

  'First Shield Harmon 56 (2e)': {
    count: 1,
    levels: {
      0: { health: '6' },
      1: { health: '8' },
      2: { health: '10' },
      3: { health: '12' },
      4: { health: '14' },
      5: { health: '16' },
      6: { health: '18' },
      7: { health: '20' }
    }
  },

  'Flame Demon (2e)': {
    count: 6,
    levels: {
      0: { normal: 2, elite: 3 },
      1: { normal: 2, elite: 3 },
      2: { normal: 3, elite: 4 },
      3: { normal: 3, elite: 5 },
      4: { normal: 3, elite: 5 },
      5: { normal: 4, elite: 6 },
      6: { normal: 4, elite: 7 },
      7: { normal: 6, elite: 9 }
    }
  },

  'Forest Imp (2e)': {
    count: 10,
    levels: {
      0: { normal: 1, elite: 4 },
      1: { normal: 2, elite: 5 },
      2: { normal: 2, elite: 6 },
      3: { normal: 3, elite: 7 },
      4: { normal: 3, elite: 7 },
      5: { normal: 4, elite: 8 },
      6: { normal: 5, elite: 10 },
      7: { normal: 8, elite: 14 }
    }
  },

  'Frost Demon (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 10 },
      1: { normal: 6, elite: 10 },
      2: { normal: 7, elite: 12 },
      3: { normal: 8, elite: 14 },
      4: { normal: 11, elite: 19 },
      5: { normal: 13, elite: 22 },
      6: { normal: 18, elite: 29 },
      7: { normal: 25, elite: 40 }
    }
  },

  'Giant Ooze (2e)': {
    count: 10,
    levels: {
      0: { health: '8xC' },
      1: { health: '9xC' },
      2: { health: '11xC' },
      3: { health: '11xC' },
      4: { health: '12xC' },
      5: { health: '15xC' },
      6: { health: '21xC' },
      7: { health: '27xC' }
    }
  },

  'Giant Viper (2e)': {
    count: 10,
    levels: {
      0: { normal: 2, elite: 3 },
      1: { normal: 3, elite: 5 },
      2: { normal: 4, elite: 7 },
      3: { normal: 4, elite: 8 },
      4: { normal: 6, elite: 11 },
      5: { normal: 7, elite: 13 },
      6: { normal: 9, elite: 16 },
      7: { normal: 12, elite: 20 }
    }
  },

  'Harrower Infester (2e)': {
    count: 4,
    levels: {
      0: { normal: 6, elite: 12 },
      1: { normal: 7, elite: 12 },
      2: { normal: 8, elite: 14 },
      3: { normal: 10, elite: 17 },
      4: { normal: 12, elite: 19 },
      5: { normal: 12, elite: 21 },
      6: { normal: 15, elite: 27 },
      7: { normal: 18, elite: 32 }
    }
  },

  'Harrower Infester 99 (2e)': {
    count: 4,
    levels: {
      0: { normal: 6, elite: 12 },
      1: { normal: 7, elite: 12 },
      2: { normal: 8, elite: 14 },
      3: { normal: 10, elite: 17 },
      4: { normal: 12, elite: 19 },
      5: { normal: 12, elite: 21 },
      6: { normal: 15, elite: 27 },
      7: { normal: 18, elite: 32 }
    }
  },

  'Hound (2e)': {
    count: 10,
    levels: {
      0: { normal: 4, elite: 6 },
      1: { normal: 4, elite: 6 },
      2: { normal: 6, elite: 7 },
      3: { normal: 8, elite: 8 },
      4: { normal: 9, elite: 11 },
      5: { normal: 10, elite: 13 },
      6: { normal: 14, elite: 17 },
      7: { normal: 17, elite: 23 }
    }
  },

  'Inox Archer (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 7 },
      1: { normal: 6, elite: 9 },
      2: { normal: 8, elite: 12 },
      3: { normal: 8, elite: 13 },
      4: { normal: 10, elite: 16 },
      5: { normal: 14, elite: 22 },
      6: { normal: 16, elite: 25 },
      7: { normal: 23, elite: 35 }
    }
  },

  'Inox Bodyguard (2e)': {
    count: 2,
    levels: {
      0: { health: 'Cx9' },
      1: { health: 'Cx10' },
      2: { health: 'Cx12' },
      3: { health: 'Cx13' },
      4: { health: 'Cx16' },
      5: { health: 'Cx17' },
      6: { health: 'Cx21' },
      7: { health: 'Cx24' }
    }
  },

  'Inox Guard (2e)': {
    count: 6,
    levels: {
      0: { normal: 7, elite: 11 },
      1: { normal: 8, elite: 13 },
      2: { normal: 12, elite: 15 },
      3: { normal: 13, elite: 20 },
      4: { normal: 16, elite: 23 },
      5: { normal: 20, elite: 28 },
      6: { normal: 28, elite: 34 },
      7: { normal: 32, elite: 40 }
    }
  },

  'Inox Priest (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 7 },
      1: { normal: 7, elite: 10 },
      2: { normal: 8, elite: 12 },
      3: { normal: 11, elite: 16 },
      4: { normal: 12, elite: 18 },
      5: { normal: 15, elite: 24 },
      6: { normal: 20, elite: 32 },
      7: { normal: 25, elite: 36 }
    }
  },

  'Jekserah (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx11' },
      1: { health: 'Cx15' },
      2: { health: 'Cx17' },
      3: { health: 'Cx19' },
      4: { health: 'Cx23' },
      5: { health: 'Cx26' },
      6: { health: 'Cx32' },
      7: { health: 'Cx41' }
    }
  },

  'Jekserah 23 (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx11' },
      1: { health: 'Cx15' },
      2: { health: 'Cx17' },
      3: { health: 'Cx19' },
      4: { health: 'Cx23' },
      5: { health: 'Cx26' },
      6: { health: 'Cx32' },
      7: { health: 'Cx41' }
    }
  },

  'Jekserah 56 (2e)': {
    count: 1,
    levels: {
      0: { health: '4' },
      1: { health: '7' },
      2: { health: '10' },
      3: { health: '13' },
      4: { health: '16' },
      5: { health: '19' },
      6: { health: '22' },
      7: { health: '25' }
    }
  },

  'Living Bomb (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 10 },
      1: { normal: 8, elite: 11 },
      2: { normal: 10, elite: 15 },
      3: { normal: 11, elite: 15 },
      4: { normal: 12, elite: 19 },
      5: { normal: 14, elite: 21 },
      6: { normal: 18, elite: 31 },
      7: { normal: 26, elite: 36 }
    }
  },

  'Living Bones (2e)': {
    count: 10,
    levels: {
      0: { normal: 5, elite: 6 },
      1: { normal: 5, elite: 6 },
      2: { normal: 5, elite: 7 },
      3: { normal: 7, elite: 9 },
      4: { normal: 7, elite: 10 },
      5: { normal: 9, elite: 13 },
      6: { normal: 12, elite: 18 },
      7: { normal: 15, elite: 21 }
    }
  },

  'Living Corpse (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 10 },
      1: { normal: 8, elite: 11 },
      2: { normal: 10, elite: 15 },
      3: { normal: 11, elite: 15 },
      4: { normal: 12, elite: 19 },
      5: { normal: 14, elite: 21 },
      6: { normal: 18, elite: 31 },
      7: { normal: 26, elite: 36 }
    }
  },

  'Living Spirit (2e)': {
    count: 6,
    levels: {
      0: { normal: 2, elite: 3 },
      1: { normal: 2, elite: 3 },
      2: { normal: 2, elite: 3 },
      3: { normal: 3, elite: 4 },
      4: { normal: 3, elite: 4 },
      5: { normal: 4, elite: 5 },
      6: { normal: 6, elite: 8 },
      7: { normal: 7, elite: 10 }
    }
  },

  'Lurker Soldier (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 7 },
      1: { normal: 7, elite: 9 },
      2: { normal: 9, elite: 11 },
      3: { normal: 10, elite: 13 },
      4: { normal: 10, elite: 13 },
      5: { normal: 11, elite: 15 },
      6: { normal: 16, elite: 19 },
      7: { normal: 20, elite: 27 }
    }
  },

  'Merciless Taskmaster (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx21' },
      1: { health: 'Cx25' },
      2: { health: 'Cx28' },
      3: { health: 'Cx31' },
      4: { health: 'Cx34' },
      5: { health: 'Cx36' },
      6: { health: 'Cx43' },
      7: { health: 'Cx49' }
    }
  },

  'Night Demon (2e)': {
    count: 6,
    levels: {
      0: { normal: 3, elite: 5 },
      1: { normal: 5, elite: 8 },
      2: { normal: 6, elite: 11 },
      3: { normal: 7, elite: 13 },
      4: { normal: 8, elite: 15 },
      5: { normal: 11, elite: 17 },
      6: { normal: 16, elite: 23 },
      7: { normal: 20, elite: 30 }
    }
  },

  'Ooze (2e)': {
    count: 10,
    levels: {
      0: { normal: 4, elite: 8 },
      1: { normal: 5, elite: 9 },
      2: { normal: 7, elite: 11 },
      3: { normal: 8, elite: 11 },
      4: { normal: 9, elite: 12 },
      5: { normal: 10, elite: 15 },
      6: { normal: 13, elite: 21 },
      7: { normal: 17, elite: 27 }
    }
  },

  'Rending Drake (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 7 },
      1: { normal: 6, elite: 7 },
      2: { normal: 7, elite: 9 },
      3: { normal: 7, elite: 10 },
      4: { normal: 9, elite: 12 },
      5: { normal: 10, elite: 15 },
      6: { normal: 14, elite: 19 },
      7: { normal: 18, elite: 24 }
    }
  },

  'Savvas Icestorm (2e)': {
    count: 4,
    levels: {
      0: { normal: 7, elite: 12 },
      1: { normal: 10, elite: 12 },
      2: { normal: 12, elite: 15 },
      3: { normal: 12, elite: 17 },
      4: { normal: 13, elite: 17 },
      5: { normal: 15, elite: 20 },
      6: { normal: 16, elite: 26 },
      7: { normal: 20, elite: 33 }
    }
  },

  'Savvas Icestorm 40 (2e)': {
    count: 4,
    levels: {
      0: { normal: 7, elite: 12 },
      1: { normal: 10, elite: 12 },
      2: { normal: 12, elite: 15 },
      3: { normal: 12, elite: 17 },
      4: { normal: 13, elite: 17 },
      5: { normal: 15, elite: 20 },
      6: { normal: 16, elite: 26 },
      7: { normal: 20, elite: 33 }
    }
  },

  'Savvas Lavaflow (2e)': {
    count: 4,
    levels: {
      0: { normal: 8, elite: 13 },
      1: { normal: 9, elite: 15 },
      2: { normal: 11, elite: 18 },
      3: { normal: 14, elite: 21 },
      4: { normal: 16, elite: 25 },
      5: { normal: 20, elite: 30 },
      6: { normal: 28, elite: 40 },
      7: { normal: 35, elite: 50 }
    }
  },

  'Savvas Lavaflow 40 (2e)': {
    count: 4,
    levels: {
      0: { normal: 8, elite: 13 },
      1: { normal: 9, elite: 15 },
      2: { normal: 11, elite: 18 },
      3: { normal: 14, elite: 21 },
      4: { normal: 16, elite: 25 },
      5: { normal: 20, elite: 30 },
      6: { normal: 28, elite: 40 },
      7: { normal: 35, elite: 50 }
    }
  },

  'Spitting Drake (2e)': {
    count: 6,
    levels: {
      0: { normal: 4, elite: 7 },
      1: { normal: 5, elite: 9 },
      2: { normal: 7, elite: 10 },
      3: { normal: 8, elite: 13 },
      4: { normal: 9, elite: 16 },
      5: { normal: 12, elite: 19 },
      6: { normal: 16, elite: 27 },
      7: { normal: 22, elite: 34 }
    }
  },

  'Spymaster Argeise': {
    count: 1,
    levels: {
      0: { health: '4' },
      1: { health: '7' },
      2: { health: '10' },
      3: { health: '13' },
      4: { health: '16' },
      5: { health: '19' },
      6: { health: '22' },
      7: { health: '25' }
    }
  },

  'Stone Construct (2e)': {
    count: 4,
    levels: {
      0: { normal: 10, elite: 10 },
      1: { normal: 10, elite: 11 },
      2: { normal: 11, elite: 14 },
      3: { normal: 11, elite: 15 },
      4: { normal: 12, elite: 17 },
      5: { normal: 13, elite: 19 },
      6: { normal: 19, elite: 23 },
      7: { normal: 22, elite: 26 }
    }
  },

  'Sun Demon (2e)': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 9 },
      1: { normal: 8, elite: 12 },
      2: { normal: 10, elite: 13 },
      3: { normal: 11, elite: 16 },
      4: { normal: 13, elite: 18 },
      5: { normal: 13, elite: 18 },
      6: { normal: 16, elite: 25 },
      7: { normal: 19, elite: 27 }
    }
  },

  'The Betrayer (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx22' },
      1: { health: 'Cx26' },
      2: { health: 'Cx29' },
      3: { health: 'Cx34' },
      4: { health: 'Cx37' },
      5: { health: 'Cx42' },
      6: { health: 'Cx46' },
      7: { health: 'Cx53' }
    }
  },

  'The Colorless (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx12' },
      1: { health: 'Cx15' },
      2: { health: 'Cx16' },
      3: { health: 'Cx19' },
      4: { health: 'Cx20' },
      5: { health: 'Cx23' },
      6: { health: 'Cx27' },
      7: { health: 'Cx32' }
    }
  },

  'The Convergence (2e)': {
    count: 4,
    levels: {
      0: { health: '14xC' },
      1: { health: '16xC' },
      2: { health: '22xC' },
      3: { health: '24xC' },
      4: { health: '28xC' },
      5: { health: '32xC' },
      6: { health: '40xC' },
      7: { health: '50xC' }
    }
  },

  'The Dark Rider (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx16' },
      1: { health: 'Cx20' },
      2: { health: 'Cx23' },
      3: { health: 'Cx29' },
      4: { health: 'Cx30' },
      5: { health: 'Cx36' },
      6: { health: 'Cx45' },
      7: { health: 'Cx52' }
    }
  },

  'The Elder Drake (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx26' },
      1: { health: 'Cx31' },
      2: { health: 'Cx37' },
      3: { health: 'Cx41' },
      4: { health: 'Cx47' },
      5: { health: 'Cx52' },
      6: { health: 'Cx62' },
      7: { health: 'Cx75' }
    }
  },

  'The Gloom (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx21' },
      1: { health: 'Cx27' },
      2: { health: 'Cx33' },
      3: { health: 'Cx37' },
      4: { health: 'Cx43' },
      5: { health: 'Cx48' },
      6: { health: 'Cx58' },
      7: { health: 'Cx70' }
    }
  },

  'The Harvester (2e)': {
    count: 6,
    levels: {
      0: { health: '6+C' },
      1: { health: '7+C' },
      2: { health: '11+C' },
      3: { health: '12+C' },
      4: { health: '14+C' },
      5: { health: '18+C' },
      6: { health: '21+C' },
      7: { health: '27+C' }
    }
  },

  'The Prime Demon (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx17' },
      1: { health: 'Cx22' },
      2: { health: 'Cx25' },
      3: { health: 'Cx31' },
      4: { health: 'Cx35' },
      5: { health: 'Cx41' },
      6: { health: 'Cx50' },
      7: { health: 'Cx60' }
    }
  },

  'The Prime Demon 56 (2e)': {
    count: 1,
    levels: {
      0: { health: '8' },
      1: { health: '11' },
      2: { health: '14' },
      3: { health: '17' },
      4: { health: '20' },
      5: { health: '23' },
      6: { health: '26' },
      7: { health: '29' }
    }
  },

  'The Sightless Eye (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx21' },
      1: { health: 'Cx23' },
      2: { health: 'Cx28' },
      3: { health: 'Cx30' },
      4: { health: 'Cx35' },
      5: { health: 'Cx38' },
      6: { health: 'Cx47' },
      7: { health: 'Cx54' }
    }
  },

  'The Winged Horror (2e)': {
    count: 1,
    levels: {
      0: { health: 'Cx19' },
      1: { health: 'Cx22' },
      2: { health: 'Cx24' },
      3: { health: 'Cx27' },
      4: { health: 'Cx30' },
      5: { health: 'Cx32' },
      6: { health: 'Cx38' },
      7: { health: 'Cx44' }
    }
  },

  'Training Dummy': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 6 },
      1: { normal: 5, elite: 6 },
      2: { normal: 7, elite: 9 },
      3: { normal: 8, elite: 9 },
      4: { normal: 9, elite: 10 },
      5: { normal: 10, elite: 13 },
      6: { normal: 13, elite: 15 },
      7: { normal: 17, elite: 20 }
    }
  },

  'Training Partner': {
    count: 6,
    levels: {
      0: { normal: 5, elite: 6 },
      1: { normal: 5, elite: 6 },
      2: { normal: 7, elite: 9 },
      3: { normal: 8, elite: 9 },
      4: { normal: 9, elite: 10 },
      5: { normal: 10, elite: 13 },
      6: { normal: 13, elite: 15 },
      7: { normal: 17, elite: 20 }
    }
  },

  'Tyrant of the Tides (2e)': {
    count: 4,
    levels: {
      0: { health: '12xC' },
      1: { health: '12xC' },
      2: { health: '15xC' },
      3: { health: '17xC' },
      4: { health: '17xC' },
      5: { health: '20xC' },
      6: { health: '26xC' },
      7: { health: '33xC' }
    }
  },

  'Usurper': {
    count: 6,
    levels: {
      0: { health: '9' },
      1: { health: '12xC' },
      2: { health: '13xC' },
      3: { health: '16xC' },
      4: { health: '18xC' },
      5: { health: '18xC' },
      6: { health: '25xC' },
      7: { health: '27xC' }
    }
  },

  'Vermling Priest (2e)': {
    count: 6,
    levels: {
      0: { normal: 2, elite: 3 },
      1: { normal: 2, elite: 3 },
      2: { normal: 3, elite: 4 },
      3: { normal: 3, elite: 5 },
      4: { normal: 3, elite: 5 },
      5: { normal: 4, elite: 6 },
      6: { normal: 5, elite: 8 },
      7: { normal: 8, elite: 11 }
    }
  },

  'Vermling Scout (2e)': {
    count: 10,
    levels: {
      0: { normal: 2, elite: 4 },
      1: { normal: 3, elite: 5 },
      2: { normal: 3, elite: 5 },
      3: { normal: 4, elite: 7 },
      4: { normal: 5, elite: 8 },
      5: { normal: 7, elite: 11 },
      6: { normal: 10, elite: 16 },
      7: { normal: 15, elite: 23 }
    }
  },

  'Wind Demon (2e)': {
    count: 6,
    levels: {
      0: { normal: 3, elite: 5 },
      1: { normal: 3, elite: 5 },
      2: { normal: 4, elite: 7 },
      3: { normal: 5, elite: 8 },
      4: { normal: 7, elite: 10 },
      5: { normal: 10, elite: 14 },
      6: { normal: 11, elite: 16 },
      7: { normal: 14, elite: 21 }
    }
  }
};

export default MONSTER_STATS;
