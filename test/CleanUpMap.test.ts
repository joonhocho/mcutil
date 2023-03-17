import { describe, expect, jest, test } from '@jest/globals';
import { CleanUpMap } from '../src/class/CleanUpMap';

describe('CleanUpMap', () => {
  test('CleanUpMap', async () => {
    const map = new CleanUpMap();

    const fns = new Array(10).fill(0).map(() => jest.fn());

    function expectCalls(times: number[]) {
      times.forEach((n, i) => {
        expect(fns[i]).toHaveBeenCalledTimes(n);
        fns[i].mockClear();
      });
    }

    map.set('a', fns[0]);

    expectCalls([0]);

    map.set('a', fns[1]);

    expectCalls([1, 0]);

    map.set('a', [fns[2], fns[3]]);

    expectCalls([0, 1, 0, 0]);

    map.set('b', [fns[4], fns[5]]);

    expectCalls([0, 0, 0, 0, 0, 0]);

    map.clear('a');

    expectCalls([0, 0, 1, 1, 0, 0]);

    map.clear('b');

    expectCalls([0, 0, 0, 0, 1, 1]);

    map.clearAll();

    expectCalls([0, 0, 0, 0, 0, 0]);

    map.set('a', [fns[2], fns[3]]);
    map.set('b', [fns[4], fns[5]]);

    expectCalls([0, 0, 0, 0, 0, 0]);

    map.clearAll();

    expectCalls([0, 0, 1, 1, 1, 1]);

    map.add('a', fns[0]);
    map.add('a', fns[1]);
    map.add('b', fns[1]);
    map.add('b', fns[2]);

    expectCalls([0, 0, 0, 0, 0, 0]);

    map.set('a', []);
    expectCalls([1, 1, 0, 0, 0, 0]);

    map.set('c', []);
    expectCalls([0, 0, 0, 0, 0, 0]);

    map.set('b', []);
    expectCalls([0, 1, 1, 0, 0, 0]);

    map.clearAll();
    expectCalls([0, 0, 0, 0, 0, 0]);
  });
});
