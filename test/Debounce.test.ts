import { describe, expect, jest, test } from '@jest/globals';
import { Debounce } from '../src/class/Debounce';

jest.useFakeTimers();

describe('Debounce', () => {
  test('debounces calls', () => {
    const fn = jest.fn((a: number, b: string) => a + b);

    const deb = new Debounce(fn, 1000);

    deb.debounced(1, 'a');
    deb.debounced(2, 'b');
    deb.debounced(3, 'c');

    expect(fn).toHaveBeenCalledTimes(0);

    jest.advanceTimersToNextTimer();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(3, 'c');
    expect(fn).toHaveLastReturnedWith('3c');
    fn.mockClear();

    jest.advanceTimersToNextTimer();

    expect(fn).toHaveBeenCalledTimes(0);

    deb.debounced(1, 'a');
    deb.debounced(2, 'b');
    deb.debounced(3, 'c');

    expect(fn).toHaveBeenCalledTimes(0);
    deb.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(3, 'c');
    expect(fn).toHaveLastReturnedWith('3c');
    fn.mockClear();

    jest.advanceTimersToNextTimer();

    expect(fn).toHaveBeenCalledTimes(0);

    deb.debounced(1, 'a');
    deb.debounced(2, 'b');
    deb.debounced(3, 'c');

    expect(fn).toHaveBeenCalledTimes(0);
    deb.cancel();

    jest.advanceTimersToNextTimer();

    expect(fn).toHaveBeenCalledTimes(0);

    deb.debounced(1, 'a');
    deb.debounced(2, 'b');
    deb.debounced(3, 'c');

    expect(fn).toHaveBeenCalledTimes(0);
    deb.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(3, 'c');
    expect(fn).toHaveLastReturnedWith('3c');
    fn.mockClear();

    deb.debounced(1, 'a');
    deb.debounced(2, 'b');
    deb.debounced(3, 'c');

    expect(fn).toHaveBeenCalledTimes(0);
    deb.destroy();

    jest.advanceTimersToNextTimer();

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
