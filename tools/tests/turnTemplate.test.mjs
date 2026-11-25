import assert from 'node:assert/strict';
import { halfLines, textCode, flagsLine } from '../../scripts/turnTemplate.js';
import { TURN } from '../../scripts/games/turn_templates.js';
import { CARDS } from '../../scripts/games/gh2_cards.js';

const A = '[ImageID=7410466 inline]', M = '[ImageID=7410469 inline]', R = '[ImageID=7410470 inline]';
const hail = CARDS.filter(c => c.cls === 9);

export const tests = {
  'turn template: every Hail card has a template with both halves'() {
    assert.equal(hail.length, 28);
    for (const c of hail) {
      const t = TURN[c.id];
      assert.ok(t, `template for ${c.slug}`);
      assert.ok(t.t.length && t.b.length, `both halves of ${c.slug}`);
    }
  },
  'turn template: an action line has icon, value, range and the target placeholder'() {
    const t = TURN[hail.find(c => c.slug === 'perpetual-annoyance').id];
    const top = halfLines(t.t);
    assert.ok(top[0].startsWith(`${A} 2 ${R} 3 `), 'attack 2 range 3');
    assert.ok(top[0].includes(' on X (-1 '), 'the target placeholder, then the pill in parentheses');
    assert.equal(halfLines(t.b)[0], `${M} 4 to X`, 'a move ends at a destination placeholder');
  },
  'turn template: a +1 sticker adds to the value of the line it lies on, any other sticker is written after the action'() {
    const t = TURN[hail.find(c => c.slug === 'perpetual-annoyance').id];
    assert.ok(halfLines(t.t, [{ k: 'plus_one', ry: 0.4 }])[0].startsWith(`${A} 2+1 `));
    assert.ok(halfLines(t.t, [{ k: 'plus_one', ry: 0.4 }, { k: 'plus_one', ry: 0.5 }])[0].startsWith(`${A} 2+2 `), 'two stickers add up');
    assert.ok(halfLines(t.b, [{ k: 'plus_one', ry: 0.5 }])[0].startsWith(`${M} 4+1 `));
    const hex = halfLines(t.b, [{ k: 'hex_attack', ry: 0.5 }])[0];
    assert.ok(hex.endsWith('+hex'));
    assert.ok(halfLines(t.b, [{ k: 'wound', ry: 0.5 }])[0].endsWith('+[ImageID=4113446 inline]'), 'a condition sticker becomes its icon');
    assert.ok(halfLines(t.t, [{ k: 'jump', ry: 0.5 }])[0].includes('+[ImageID=7410473 inline] on X') === false, 'the sticker comes before the pill, after the action');
  },
  'turn template: the place of a sticker picks the line with enhancement dots'() {
    const t = TURN[hail.find(c => c.slug === 'bizarre-antics').id];          // top: teleport 3 (a dot), a mandatory line; bottom: attack 1 (a dot)
    assert.ok(halfLines(t.t, [{ k: 'plus_one', ry: 0.9 }])[0].includes(' 3+1 '), 'only one dotted line: any place points to it');
    const two = TURN[hail.find(c => c.slug === 'withering-stare').id];        // bottom: teleport 6 (a dot), a text line, push 2 (a dot)
    const low = halfLines(two.b, [{ k: 'plus_one', ry: 0.9 }]), high = halfLines(two.b, [{ k: 'plus_one', ry: 0.1 }]);
    assert.ok(high[0].includes(' 6+1 ') && !high[2].includes('+1'), 'a sticker high in the half goes to the first dotted line');
    assert.ok(!low[0].includes('+1') && low[2].includes(' 2+1 '), 'a low one to the last');
  },
  'turn template: a range written inside a card text takes a +1 too (Outsource, "within range 3")'() {
    const t = TURN[hail.find(c => c.slug === 'outsource').id];
    assert.equal(halfLines(t.t, [{ k: 'plus_one', ry: 0.5 }])[1].startsWith(`${A} 4+1 `), true, 'the attack line has the dot, the text line has none');
    assert.equal(halfLines(t.t)[0].endsWith(`${R} 3:`), true);
  },
  'turn template: an optional pill joins the line of its action, not the mandatory banner'() {
    const t = TURN[hail.find(c => c.slug === 'bizarre-antics').id];
    const l = halfLines(t.t);
    assert.equal(l.length, 2);
    assert.ok(l[0].includes('(-1 ') && !l[1].includes('(-1 '));
  },
  'turn template: texts keep their words and turn tokens into icons or words'() {
    assert.equal(textCode('gain %xp1% and %lf% go'), `gain [ImageID=4184470 inline] 1 and go`);
    assert.equal(textCode('x %amd-double% y %nosuchtoken%'), 'x 2x y nosuchtoken');
  },
  'turn template: Trial and Success: the range printed apart joins the attack line, eight +1 stickers add up'() {
    const t = TURN[hail.find(c => c.slug === 'trial-and-success').id];
    const all = Array.from({ length: 8 }, (_, i) => ({ k: 'plus_one', ry: i / 8 }));
    assert.equal(halfLines(t.t)[0], `${A} 3 ${R} 3 on X`);
    assert.equal(halfLines(t.t, all)[0], `${A} 3+8 ${R} 3 on X`);
    assert.ok(halfLines(t.t)[1].includes(' +1 sticker'), 'the enhance1 token reads +1');
  },
  'turn template: the last line of an action says experience, persistent, round, lost and removed'() {
    const t = TURN[hail.find(c => c.slug === 'trial-and-success').id];
    assert.deepEqual(t.tf, ['xp2', 'lost', 'removed']);
    assert.equal(flagsLine(t.tf), '[ImageID=4184470 inline] 2 [ImageID=9944319 inline] [ImageID=9944321 inline]', 'experience, lost, removed as icons');
    assert.equal(flagsLine(['xp1']), '[ImageID=4184470 inline] 1');
    assert.equal(flagsLine(['persistent']), '[ImageID=9944320 inline]');
    assert.equal(flagsLine(['round', 'nosuchflag']), '[ImageID=9944322 inline], nosuchflag', 'a flag without an icon is a word');
    assert.equal(flagsLine([]), '');
    const count = f => hail.reduce((n, c) => n + (TURN[c.id].tf || []).concat(TURN[c.id].bf || []).filter(x => x === f).length, 0);
    assert.equal(count('lost'), 7, 'seven Hail halves are lost');
    assert.equal(count('persistent'), 11);
  },
  'turn template: Cragheart, Mindthief and Tinkerer have a template for every card, and no augment ribbon line'() {
    for (const cls of [6, 10, 21]) {
      const mine = CARDS.filter(c => c.cls === cls);
      assert.ok(mine.length >= 28);
      for (const c of mine) assert.ok(TURN[c.id] && TURN[c.id].t.length + TURN[c.id].b.length > 0, `template for ${c.slug}`);
    }
    const mt = CARDS.filter(c => c.cls === 10).flatMap(c => [...TURN[c.id].t, ...TURN[c.id].b]);
    assert.ok(!JSON.stringify(mt).includes('%augment% Augment'));
    const summons = CARDS.filter(c => c.cls === 21).flatMap(c => TURN[c.id].t.concat(TURN[c.id].b)).filter(l => JSON.stringify(l).includes('Summon '));
    assert.ok(summons.length >= 1, 'a summon is a line "Summon <name>"');
  },
  'turn template: no template, no lines'() {
    assert.deepEqual(halfLines(undefined), []);
    assert.deepEqual(halfLines([]), []);
  },
};
