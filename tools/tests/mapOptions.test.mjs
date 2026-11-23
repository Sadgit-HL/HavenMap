import assert from 'node:assert/strict';
import { mapOption, setMapOption, subscribeMapOptions } from '../../scripts/mapOptions.js';

export const tests = {
  'map options: both deck features are shown by default'() {
    assert.equal(mapOption('abilities'), true);
    assert.equal(mapOption('am'), true);
  },
  'map options: a change is applied, announced to the subscribers, and unknown names are ignored'() {
    let calls = 0;
    subscribeMapOptions(() => { calls += 1; });
    setMapOption('abilities', false);
    assert.equal(mapOption('abilities'), false);
    assert.equal(mapOption('am'), true, 'the other option is untouched');
    assert.equal(calls, 1);
    setMapOption('nothing', false);
    assert.equal(calls, 1, 'an unknown name changes nothing');
    setMapOption('abilities', true);
    assert.equal(mapOption('abilities'), true);
  },
};
