import { describe, expect, jest, test } from '@jest/globals';
import { Timer } from '../src/class/Timer';

jest.useFakeTimers();

describe('Timer', () => {
  test('Timer', async () => {
    const timer = new Timer();

    const fns = new Array(10).fill(0).map(() => jest.fn());

    function expectCalls(times: number[]) {
      times.forEach((n, i) => {
        expect(fns[i]).toHaveBeenCalledTimes(n);
        fns[i].mockClear();
      });
    }

    expect(timer.pending()).toBe(false);
    timer.set(fns[0], 100);
    expect(timer.pending()).toBe(true);

    jest.advanceTimersToNextTimer();
    expect(timer.pending()).toBe(false);

    expectCalls([1]);

    // add and clear
    timer.set(fns[0], 100);
    expect(timer.pending()).toBe(true);

    timer.clear();
    expect(timer.pending()).toBe(false);

    jest.advanceTimersToNextTimer();

    expectCalls([0]);

    // add and clear
    timer.set(fns[0], 100);
    expect(timer.pending()).toBe(true);
    jest.advanceTimersByTime(99);
    expect(timer.pending()).toBe(true);
    timer.clear();
    expect(timer.pending()).toBe(false);

    jest.advanceTimersToNextTimer();

    expectCalls([0]);

    // add and remove
    timer.set(fns[0], 100);
    jest.advanceTimersToNextTimer();

    expectCalls([1]);

    // add wait short clear
    timer.set(fns[0], 100);

    jest.advanceTimersByTime(150);

    timer.clear();

    jest.advanceTimersToNextTimer();

    expectCalls([1]);

    // add wait clear
    timer.set(fns[0], 100);
    timer.set(fns[1], 150);

    jest.advanceTimersByTime(120);

    timer.clear();

    jest.advanceTimersToNextTimer();

    expectCalls([0, 0]);

    // add wait clear
    timer.set(fns[0], 100);
    timer.set(fns[1], 150);

    jest.advanceTimersByTime(180);

    timer.clear();

    jest.advanceTimersToNextTimer();

    expectCalls([0, 1]);

    // add wait clear
    timer.set(fns[0], 100);
    timer.set(fns[1], 150);

    jest.advanceTimersByTime(50);

    timer.clear();

    jest.advanceTimersToNextTimer();

    expectCalls([0, 0]);

    // set
    timer.set(fns[0], 100);
    timer.set(fns[1], 150);

    jest.advanceTimersToNextTimer();

    expectCalls([0, 1]);

    // set
    timer.set(fns[0], 100);
    jest.advanceTimersByTime(50);
    timer.set(fns[1], 100);
    jest.advanceTimersByTime(50);
    timer.set(fns[2], 100);

    jest.advanceTimersToNextTimer();

    expectCalls([0, 0, 1]);

    // set
    timer.set(fns[0], 100);
    jest.advanceTimersByTime(50);

    timer.set(fns[1], 100);
    jest.advanceTimersByTime(50);

    timer.set(fns[2], 100);
    jest.advanceTimersByTime(50);

    timer.set(fns[3], 100);
    jest.runAllTimers();

    expectCalls([0, 0, 0, 1]);

    // set
    timer.set(fns[0], 100);
    timer.set(fns[1], 100);
    timer.set(fns[2], 100);
    timer.set(fns[3], 100);

    expectCalls([0, 0, 0, 0]);

    timer.clear();
    jest.runAllTimers();

    expectCalls([0, 0, 0, 0]);

    timer.set(fns[0], 100);
    timer.set(fns[1], 100);
    timer.set(fns[2], 100);
    timer.set(fns[3], 100);

    jest.runAllTimers();
    expectCalls([0, 0, 0, 1]);

    timer.set(fns[0], 100);
    timer.flush();
    expectCalls([1, 0, 0, 0]);

    jest.runAllTimers();

    expectCalls([0, 0, 0, 0]);

    timer.set(fns[0], 100);
    jest.advanceTimersByTime(50);
    timer.set(fns[0], 200);
    jest.advanceTimersByTime(100);
    timer.set(fns[0], 200);

    jest.runAllTimers();
    expectCalls([1]);

    timer.set(fns[0], 100);
    jest.advanceTimersByTime(150);
    timer.set(fns[0], 200);
    jest.advanceTimersByTime(250);
    timer.set(fns[0], 200);
    jest.advanceTimersByTime(150);

    expectCalls([2]);

    timer.flush();
    expectCalls([1]);

    jest.runAllTimers();
    expectCalls([0]);

    timer.set(fns[0], 100);
    timer.destroy();

    jest.runAllTimers();
    expectCalls([0]);
  });

  test('Timer constructor', async () => {
    const fns = new Array(10).fill(0).map(() => jest.fn());

    const timer = new Timer(fns[0], 100);

    function expectCalls(times: number[]) {
      times.forEach((n, i) => {
        expect(fns[i]).toHaveBeenCalledTimes(n);
        fns[i].mockClear();
      });
    }

    expect(timer.pending()).toBe(true);
    expectCalls([0]);

    jest.advanceTimersToNextTimer();

    expectCalls([1]);
    expect(timer.pending()).toBe(false);
  });
});
