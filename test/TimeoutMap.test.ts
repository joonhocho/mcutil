import { describe, expect, jest, test } from '@jest/globals';
import { TimeoutMap } from '../src/class/TimeoutMap';

jest.useFakeTimers();

describe('TimeoutMap', () => {
  test('TimeoutMap', async () => {
    const map = new TimeoutMap();

    const fns = new Array(10).fill(0).map(() => jest.fn());

    function expectCalls(times: number[]) {
      times.forEach((n, i) => {
        expect(fns[i]).toHaveBeenCalledTimes(n);
        fns[i].mockClear();
      });
    }

    map.add('a', fns[0], 100);

    jest.advanceTimersToNextTimer();

    expectCalls([1]);

    // add and clear
    map.clear('a', map.add('a', fns[0], 100));

    jest.advanceTimersToNextTimer();

    expectCalls([0]);

    // add and clear
    map.add('a', fns[0], 100);
    map.clear('a');

    jest.advanceTimersToNextTimer();

    expectCalls([0]);

    // add and remove
    map.remove('a', map.add('a', fns[0], 100));

    jest.advanceTimersToNextTimer();

    expectCalls([1]);

    // add wait short clear
    map.add('a', fns[0], 100);

    jest.advanceTimersByTime(50);

    map.clear('a');

    jest.advanceTimersToNextTimer();

    expectCalls([0]);

    // add wait clear
    map.add('a', fns[0], 100);

    jest.advanceTimersByTime(150);

    map.clear('a');

    jest.advanceTimersToNextTimer();

    expectCalls([1]);

    // add wait clear
    map.add('a', fns[0], 100);
    map.add('a', fns[1], 150);

    jest.advanceTimersByTime(120);

    map.clear('a');

    jest.advanceTimersToNextTimer();

    expectCalls([1, 0]);

    // add wait clear
    map.add('a', fns[0], 100);
    map.add('a', fns[1], 150);

    jest.advanceTimersByTime(180);

    map.clear('a');

    jest.advanceTimersToNextTimer();

    expectCalls([1, 1]);

    // add wait clear
    map.add('a', fns[0], 100);
    map.add('a', fns[1], 150);

    jest.advanceTimersByTime(50);

    map.clear('a');

    jest.advanceTimersToNextTimer();

    expectCalls([0, 0]);

    // set
    map.set('a', fns[0], 100);
    map.set('a', fns[1], 150);

    jest.advanceTimersToNextTimer();

    expectCalls([0, 1]);

    // set
    map.set('a', fns[0], 100);
    jest.advanceTimersByTime(50);
    map.set('a', fns[1], 100);
    jest.advanceTimersByTime(50);
    map.set('a', fns[2], 100);

    jest.advanceTimersToNextTimer();

    expectCalls([0, 0, 1]);

    // set
    map.set('a', fns[0], 100);
    jest.advanceTimersByTime(50);

    map.set('a', fns[1], 100);
    jest.advanceTimersByTime(50);

    map.set('b', fns[2], 100);
    jest.advanceTimersByTime(50);

    map.set('b', fns[3], 100);
    jest.runAllTimers();

    expectCalls([0, 1, 0, 1]);

    // set
    map.set('a', fns[0], 100);
    map.set('a', fns[1], 100);
    map.set('b', fns[2], 100);
    map.set('b', fns[3], 100);

    expectCalls([0, 0, 0, 0]);

    map.clear('a');
    jest.runAllTimers();

    expectCalls([0, 0, 0, 1]);

    // set
    map.set('a', fns[0], 100);
    map.set('a', fns[1], 100);
    map.set('b', fns[2], 100);
    map.set('b', fns[3], 100);

    expectCalls([0, 0, 0, 0]);

    map.clear('b');
    jest.runAllTimers();

    expectCalls([0, 1, 0, 0]);

    // set
    map.set('a', fns[0], 100);
    map.set('a', fns[1], 100);
    map.set('b', fns[2], 100);
    map.set('b', fns[3], 100);

    expectCalls([0, 0, 0, 0]);

    map.clearAll();
    jest.runAllTimers();

    expectCalls([0, 0, 0, 0]);
  });
});
