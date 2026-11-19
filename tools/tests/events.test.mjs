import assert from 'node:assert/strict';
import { emptyRecord } from '../../scripts/campaign/record.js';
import { eventPool, eventPlace, nextEvent, PILES, EVENT_TABLE } from '../../scripts/campaign/events.js';
import { setEventPlace } from '../../scripts/campaign/edit.js';

export const tests = {
  'the pool starts as the whole deck'() {
    assert.equal(eventPool(emptyRecord(), 'city').length, EVENT_TABLE.city.length);
  },
  'a draw takes the top pile first, then the pool'() {
    let r = emptyRecord(); const id = EVENT_TABLE.city[3].id;
    r = setEventPlace(r, 'city', id, 'top');
    assert.deepEqual(nextEvent(r, 'city'), { id, from: 'top' });
    r = setEventPlace(r, 'city', id, '');
    assert.equal(nextEvent(r, 'city', () => 0).from, '');
  },
  'bottom pile is used only when the pool is empty'() {
    let r = emptyRecord();
    for (const e of EVENT_TABLE.road) r = setEventPlace(r, 'road', e.id, 'bottom');
    assert.equal(nextEvent(r, 'road').from, 'bottom');
  },
  'a card is in one pile only'() {
    let r = emptyRecord(); const id = EVENT_TABLE.city[0].id;
    for (const p of PILES) r = setEventPlace(r, 'city', id, p);
    assert.equal(PILES.filter(p => r.events.city[p].includes(id)).length, 1);
    assert.equal(eventPlace(r, 'city', id), PILES[PILES.length - 1]);
  },
  'an empty deck gives no draw'() {
    let r = emptyRecord();
    for (const e of EVENT_TABLE.city) r = setEventPlace(r, 'city', e.id, 'out');
    assert.equal(nextEvent(r, 'city'), null);
  },
};
