import { describe, expect, jest, test } from '@jest/globals';
import { funcLimitCallCount, funcMemoize, funcOnce } from '../src/fn.js';

describe('fn', () => {
  test('funcOnce', () => {
    const f1 = jest.fn((...args: any[]) => args.map((x) => 2 * x));

    const f1Once = funcOnce(f1);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Once(1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenLastCalledWith(1, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Once(1, 2, 3)).toEqual(undefined);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Once(1)).toEqual(undefined);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();
  });

  test('funcOnce', () => {
    const f1 = jest.fn((...args: any[]) => args.map((x) => 2 * x));

    const f1Limited = funcLimitCallCount(f1, 3);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Limited(1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenLastCalledWith(1, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Limited(2, 3)).toEqual([4, 6]);
    expect(f1).toHaveBeenLastCalledWith(2, 3);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Limited(3, 4, 5)).toEqual([6, 8, 10]);
    expect(f1).toHaveBeenLastCalledWith(3, 4, 5);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Limited(4, 5)).toEqual(undefined);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Limited(4, 5)).toEqual(undefined);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();
  });

  test('funcMemoize', () => {
    const f1 = jest.fn((...args: any[]) => args.map((x) => 2 * x));

    const f1Memo = funcMemoize(f1);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo(1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenLastCalledWith(1, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo(1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo(1, 2)).toEqual([2, 4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo(2, 2)).toEqual([4, 4]);
    expect(f1).toHaveBeenLastCalledWith(2, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo(2, 2)).toEqual([4, 4]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo(2, 2, 3)).toEqual([4, 4, 6]);
    expect(f1).toHaveBeenLastCalledWith(2, 2, 3);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo(2, 2, 3)).toEqual([4, 4, 6]);
    expect(f1).toHaveBeenCalledTimes(0);
    f1.mockClear();

    expect(f1Memo(2, 2)).toEqual([4, 4]);
    expect(f1).toHaveBeenLastCalledWith(2, 2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo(2)).toEqual([4]);
    expect(f1).toHaveBeenLastCalledWith(2);
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo()).toEqual([]);
    expect(f1).toHaveBeenLastCalledWith();
    expect(f1).toHaveBeenCalledTimes(1);
    f1.mockClear();

    expect(f1Memo()).toEqual([]);
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
