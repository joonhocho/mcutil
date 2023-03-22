import { describe, expect, jest, test } from '@jest/globals';
import { Memoize } from '../src/class/Memoize';

describe('Memoize', () => {
  test('Memoize', () => {
    const f1 = jest.fn((...args: any[]) => args.map((x) => 2 * x));

    const f1Memo = new Memoize(f1);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(null, 1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenLastCalledWith(1, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(null, 1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(null, 1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(null, 2, 2)).toEqual([4, 4]);
    expect(f1).toHaveBeenLastCalledWith(2, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(null, 2, 2)).toEqual([4, 4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(null, 2, 2, 3)).toEqual([4, 4, 6]);
    expect(f1).toHaveBeenLastCalledWith(2, 2, 3);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(null, 2, 2, 3)).toEqual([4, 4, 6]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(null, 2, 2)).toEqual([4, 4]);
    expect(f1).toHaveBeenLastCalledWith(2, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(null, 2)).toEqual([4]);
    expect(f1).toHaveBeenLastCalledWith(2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(null)).toEqual([]);
    expect(f1).toHaveBeenLastCalledWith();
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(null)).toEqual([]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(1)).toEqual([]);
    expect(f1).toHaveBeenLastCalledWith();
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(1)).toEqual([]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.call(1, 2)).toEqual([4]);
    expect(f1).toHaveBeenLastCalledWith(2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.call(1, 2)).toEqual([4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.apply(1, [2])).toEqual([4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.apply(0, [2])).toEqual([4]);
    expect(f1).toHaveBeenLastCalledWith(2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo.apply(0, [2])).toEqual([4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    f1Memo.clear();

    expect(f1Memo.apply(0, [2])).toEqual([4]);
    expect(f1).toHaveBeenLastCalledWith(2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    f1Memo.set(3, [4], [5]);

    expect(f1Memo.apply(3, [4])).toEqual([5]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    f1Memo.destroy();

    expect(f1Memo.apply(3, [4])).toEqual(undefined);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo.apply(1, [2])).toEqual(undefined);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();
  });
});
