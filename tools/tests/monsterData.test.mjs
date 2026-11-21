import assert from 'node:assert/strict';
import { GH2_MONSTERS, GH2_MONSTER_DECKS } from '../../scripts/games/gh2_monsters.js';
import gh from '../../scripts/games/gh.js';

const DIRS = [[0, -1], [0, 1], [1, 0], [1, -1], [-1, 0], [-1, 1]];
const areas = [];
const walk = (nodes, where) => { for (const n of nodes) { if (n.area) areas.push({ ...n.area, where }); if (n.sub) walk(n.sub, where); } };
for (const [deck, cards] of Object.entries(GH2_MONSTER_DECKS)) for (const c of cards) walk(c.actions, `${deck} / ${c.name ?? c.id}`);

export const tests = {
  'monster data: 95 monsters, 62 decks, 339 ability cards, every monster has its deck'() {
    assert.equal(Object.keys(GH2_MONSTERS).length, 95);
    assert.equal(Object.keys(GH2_MONSTER_DECKS).length, 62);
    assert.equal(Object.values(GH2_MONSTER_DECKS).reduce((n, c) => n + c.length, 0), 339);
    for (const [slug, m] of Object.entries(GH2_MONSTERS)) assert.ok(GH2_MONSTER_DECKS[m.deck], `${slug}: deck ${m.deck}`);
  },
  'monster data: every stat entry has health, move and attack'() {
    for (const [slug, m] of Object.entries(GH2_MONSTERS)) {
      assert.ok(Object.keys(m.stats).length, `${slug}: stats`);
      for (const [kind, levels] of Object.entries(m.stats)) for (const [lvl, s] of Object.entries(levels)) {
        assert.ok(s.health !== undefined && s.move !== undefined && s.attack !== undefined, `${slug} ${kind} ${lvl}`);
      }
    }
  },
  'monster data: the hit points agree with the stats in scripts/games/gh.js (576 values)'() {
    let n = 0;
    for (const [name, st] of Object.entries(gh.monsterStats)) {
      const m = GH2_MONSTERS[name.replace(/ /g, '-')];
      assert.ok(m, `${name} has no Secretariat record`);
      for (const [lvl, v] of Object.entries(st.levels)) for (const kind of ['normal', 'elite']) {
        if (v[kind] === undefined) continue;
        assert.equal(m.stats[kind]?.[lvl]?.health, v[kind], `${name} level ${lvl} ${kind}`);
        n++;
      }
    }
    assert.equal(n, 576);
  },
  'monster data: the standee counts differ in three places (lurker soldier, night demon, vermling scout), to be settled by the owner'() {
    const diff = Object.entries(gh.monsterStats).filter(([name, st]) => st.count !== undefined && GH2_MONSTERS[name.replace(/ /g, '-')].count !== st.count).map(([name]) => name);
    assert.deepEqual(diff.sort(), ['lurker soldier', 'night demon', 'vermling scout']);
  },
  'monster data: the 35 area patterns of the decks are connected shapes (checks the hex conversion), 26 of them melee'() {
    assert.equal(areas.length, 35);
    assert.equal(areas.filter(a => a.melee).length, 26);
    for (const a of areas) {
      const set = new Set(a.cells.map(c => c.join(',')));
      if (a.melee) set.add('0,0');                                                   // the monster's own hex
      const first = [...set][0], seen = new Set([first]), todo = [first.split(',').map(Number)];
      while (todo.length) {
        const [q, r] = todo.pop();
        for (const [dq, dr] of DIRS) { const k = `${q + dq},${r + dr}`; if (set.has(k) && !seen.has(k)) { seen.add(k); todo.push([q + dq, r + dr]); } }
      }
      assert.equal(seen.size, set.size, `${a.where}: ${JSON.stringify(a.cells)}`);
    }
  },
  'monster data: a card with its action tree and its text'() {
    const longShot = GH2_MONSTER_DECKS['ancient-artillery'].find(c => c.name === 'Long Shot');
    assert.deepEqual([longShot.id, longShot.init], [600, 46]);
    assert.equal(longShot.actions[0].txt, 'Focus on the enemy farthest away within range 7');
    const attack = longShot.actions[1];
    assert.deepEqual([attack.t, attack.v, attack.vt, attack.sub[0].t, attack.sub[0].v], ['attack', 1, 'minus', 'range', 7]);
    const grenade = GH2_MONSTER_DECKS['ancient-artillery'].find(c => c.name === 'Grenade');
    const area = JSON.stringify(grenade).match(/"area":\{[^}]*\}/)[0];
    assert.match(area, /"melee":false/);
  },
  'monster data: stat card values, immobile and flying monsters, boss formulas'() {
    const art = GH2_MONSTERS['ancient-artillery'];
    assert.deepEqual([art.title, art.count, art.stats.normal[3].health, art.stats.normal[3].move, art.stats.elite[3].attack, art.stats.normal[0].immunities], ['Ancient Artillery', 6, 9, 0, 4, ['muddle']]);
    assert.equal(Object.values(GH2_MONSTERS).filter(m => m.flying).length, 9);
    const bosses = Object.values(GH2_MONSTERS).filter(m => m.boss);
    assert.equal(bosses.length, 34);
    assert.ok(bosses.some(b => typeof b.stats.boss[0].health === 'string'), 'a boss scales with the number of characters (string health)');
  },
};
