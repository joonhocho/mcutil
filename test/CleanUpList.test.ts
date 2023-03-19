import { describe, expect, jest, test } from '@jest/globals';
import { CleanUpList } from '../src/class/CleanUpList';

describe('CleanUpList', () => {
  test('CleanUpList', async () => {
    const map = new CleanUpList();

    const fns = new Array(10).fill(0).map(() => jest.fn());

    function expectCalls(times: number[]) {
      times.forEach((n, i) => {
        expect(fns[i]).toHaveBeenCalledTimes(n);
        fns[i].mockClear();
      });
    }

    map.set(fns[0]);

    expectCalls([0]);

    map.set(fns[1]);

    expectCalls([1, 0]);

    map.set([fns[2], fns[3]]);

    expectCalls([0, 1, 0, 0]);

    map.set([fns[4], fns[5]]);

    expectCalls([0, 0, 1, 1, 0, 0]);

    //

    map.clear();

    expectCalls([0, 0, 0, 0, 1, 1]);

    map.add(fns[0]);

    expectCalls([0]);

    map.add(fns[1]);

    expectCalls([0, 0]);

    map.add([fns[2], fns[3]]);

    expectCalls([0, 0, 0, 0]);

    map.add([fns[4], fns[5]]);

    expectCalls([0, 0, 0, 0, 0, 0]);

    //

    map.destroy();

    expectCalls([1, 1, 1, 1, 1, 1]);

    //

    map.set(fns[0]);

    expectCalls([0]);

    //

    map.set([]);

    expectCalls([1]);

    //

    map.set(fns[1]);

    expectCalls([0, 0]);

    //

    map.set(fns[1]);

    expectCalls([0, 1]);

    //

    map.set(fns[0]);

    expectCalls([0, 1]);

    //

    map.set(fns[0]);

    expectCalls([1, 0]);

    //

    map.add(fns[0]);

    expectCalls([0, 0]);

    map.add(fns[0]);

    expectCalls([0, 0]);

    map.clear();

    expectCalls([3, 0]);
  });
});
