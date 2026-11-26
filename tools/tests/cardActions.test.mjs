import assert from 'node:assert/strict';
import { parseLine, parseWhere } from '../lib/parse-text.mjs';
import { CARD_ACTIONS } from '../../scripts/games/card_actions.js';

const p = t => parseLine(t);

export const tests = {
  'card actions: experience lines, with and without the pressure token'() {
    assert.deepEqual(p('%xp% 1'), [{ type: 'xp', value: 1 }]);
    assert.deepEqual(p('%xp% 2'), [{ type: 'xp', value: 2 }]);
    assert.deepEqual(p('%xp% 1, %gain_pressure%'), [{ type: 'xp', value: 1 }, { type: 'pressure', change: 1 }]);
    assert.deepEqual(p('%xp% 1, %lose_pressure%'), [{ type: 'xp', value: 1 }, { type: 'pressure', change: -1 }]);
  },
  'card actions: conditional experience stays free text'() {
    assert.equal(p('Gain %xp% 1 for each enemy targeted.'), null);
    assert.equal(p('Add +2 %attack% and gain %xp% 1 if the target is adjacent to any of your allies.'), null);
  },
  'card actions: recover items'() {
    assert.deepEqual(p('%recover% your items'), [{ type: 'recoverItems', who: 'self', count: 'all' }]);
    assert.deepEqual(p('%recover% all your spent items.'), [{ type: 'recoverItems', who: 'self', count: 'all', spent: true }]);
    assert.deepEqual(p("%recover% your and adjacent allies' items, %xp% 1."), [{ type: 'recoverItems', who: 'selfAndAdjacentAllies', count: 'all' }, { type: 'xp', value: 1 }]);
    assert.deepEqual(p('One adjacent ally may %recover% one of their spent items.'), [{ type: 'recoverItems', who: 'adjacentAlly', count: 1, spent: true, optional: true }]);
  },
  'card actions: recover cards'() {
    assert.deepEqual(p('%recover% up to one of your discarded cards.'), [{ type: 'recoverCards', who: 'self', from: 'discard', count: { max: 1 } }]);
    assert.deepEqual(p('%recover% one card from your lost pile.'), [{ type: 'recoverCards', who: 'self', from: 'lost', count: 1 }]);
    assert.deepEqual(p('%recover% up to two of your lost cards.'), [{ type: 'recoverCards', who: 'self', from: 'lost', count: { max: 2 } }]);
    assert.deepEqual(p('%recover% 1 card from your lost pile and up to 2 cards from you discard pile.'), [
      { type: 'recoverCards', who: 'self', from: 'lost', count: 1 }, { type: 'recoverCards', who: 'self', from: 'discard', count: { max: 2 } }]);
    assert.equal(p('%recover% one card from your lost pile and immediately play that card, performing either the top or bottom action of the card.'), null);
  },
  'card actions: the place of a created tile'() {
    assert.deepEqual(parseWhere('an adjacent empty hex.'), { rel: 'adjacent', require: ['empty'] });
    assert.deepEqual(parseWhere('a hex within %range%4 .'), { rel: 'range', range: 4 });
    assert.deepEqual(parseWhere('an adjacent featureless hex'), { rel: 'adjacent', require: ['featureless'] });
    assert.deepEqual(parseWhere('the featureless hex occupied by the target.'), { rel: 'target', require: ['featureless'] });
    assert.equal(parseWhere('each unoccupied red hex of the attack ability'), null);
  },
  'card actions: create terrain, obstacles, traps and tokens'() {
    assert.deepEqual(p('Create one 1-hex hazardous terrain tile in an adjacent empty hex.'),
      [{ type: 'create', kind: 'terrain', terrain: 'hazardous', count: 1, hexes: 1, where: { rel: 'adjacent', require: ['empty'] } }]);
    assert.deepEqual(p('Create one 1-hex water tile in an adjacent featureless hex.'),
      [{ type: 'create', kind: 'terrain', terrain: 'water', count: 1, hexes: 1, where: { rel: 'adjacent', require: ['featureless'] } }]);
    assert.deepEqual(p('Create two 1-hex obstacle tiles in empty hexes within %range%3 .'),
      [{ type: 'create', kind: 'obstacle', terrain: 'obstacle', count: 2, hexes: 1, where: { rel: 'range', range: 3, require: ['empty'] } }]);
    assert.deepEqual(p('Create one %wound% trap in an adjacent empty hex.'), [{ type: 'create', kind: 'trap', trap: 'wound', count: 1, where: { rel: 'adjacent', require: ['empty'] } }]);
    assert.deepEqual(p('Place one %rift% in a hex within %range% 2, %xp% 1.'), [{ type: 'create', kind: 'token', token: 'rift', count: 1, where: { rel: 'range', range: 2 } }, { type: 'xp', value: 1 }]);
    assert.deepEqual(p('Place one %tear% in an adjacent hex.'), [{ type: 'create', kind: 'token', token: 'tear', count: 1, where: { rel: 'adjacent' } }]);
  },
  'card actions: a line with more than the recognised part stays free text'() {
    assert.equal(p('Create a 1-hex obstacle tile in an adjacent empty hex. All allies an enemies adjacent to the created tile suffer %damage%1.'), null);
    assert.equal(p('Place one %rift% in each unoccupied red hex of the attack ability.'), null);
  },
  'card actions: the generated file has typed lines with the original text'() {
    const ids = Object.keys(CARD_ACTIONS);
    assert.ok(ids.length > 250, `${ids.length} cards with typed lines`);
    for (const id of ids) {
      for (const half of ['t', 'b']) {
        for (const line of CARD_ACTIONS[id][half] || []) {
          assert.ok(Number.isInteger(line.n) && line.n >= 0, `${id}: n`);
          assert.equal(typeof line.text, 'string');
          assert.ok(Array.isArray(line.a) && line.a.length && line.a.every(a => typeof a.type === 'string'), `${id}: a`);
          assert.deepEqual(parseLine(line.text), line.a, `${id}: the stored actions follow from the stored text`);
        }
      }
    }
  },
};
