import { describe, expect, test } from '@jest/globals';
import {
  addItem,
  arrayConcatInPlace,
  arrayFilterInPlace,
  arrayFirstItem,
  arrayIndexModulo,
  arrayIntersection,
  arrayLastItem,
  arrayMapInPlace,
  arrayRemoveLastOneInPlace,
  arrayRemoveManyInPlace,
  arrayRemoveOneInPlace,
  arraySliceInPlace,
  arraySliceLeft,
  arraySliceRight,
  arraySplit,
  arraySubtract,
  arrayToKeys,
  arrayToMap,
  arraysEqual,
  dedup,
  dedupKeys,
  findLast,
  keysIntersection,
  keysSubtract,
  keysToMap,
  moveItem,
  removeItem,
  replaceItem,
  withoutNil,
} from '../src/array.js';
import { numberRange } from '../src/number';

describe('array', () => {
  test('arrayFirstItem', () => {
    expect(arrayFirstItem([])).toEqual(undefined);
    expect(arrayFirstItem([1])).toEqual(1);
    expect(arrayFirstItem([1, 2])).toEqual(1);
    expect(arrayFirstItem([2, 1, 8])).toEqual(2);
  });

  test('arrayLastItem', () => {
    expect(arrayLastItem([])).toEqual(undefined);
    expect(arrayLastItem([1])).toEqual(1);
    expect(arrayLastItem([1, 2])).toEqual(2);
    expect(arrayLastItem([2, 1, 8])).toEqual(8);
  });

  test('arraySliceLeft', () => {
    expect(arraySliceLeft([], -1)).toEqual([]);
    expect(arraySliceLeft([], 0)).toEqual([]);
    expect(arraySliceLeft([], 1)).toEqual([]);

    expect(arraySliceLeft([1], -1)).toEqual([]);
    expect(arraySliceLeft([1], 0)).toEqual([]);
    expect(arraySliceLeft([1], 1)).toEqual([1]);
    expect(arraySliceLeft([1], 2)).toEqual([1]);

    expect(arraySliceLeft([1, 2], -1)).toEqual([]);
    expect(arraySliceLeft([1, 2], 0)).toEqual([]);
    expect(arraySliceLeft([1, 2], 1)).toEqual([1]);
    expect(arraySliceLeft([1, 2], 2)).toEqual([1, 2]);
    expect(arraySliceLeft([1, 2], 3)).toEqual([1, 2]);

    expect(arraySliceLeft([1, 2, 3], -1)).toEqual([]);
    expect(arraySliceLeft([1, 2, 3], 0)).toEqual([]);
    expect(arraySliceLeft([1, 2, 3], 1)).toEqual([1]);
    expect(arraySliceLeft([1, 2, 3], 2)).toEqual([1, 2]);
    expect(arraySliceLeft([1, 2, 3], 3)).toEqual([1, 2, 3]);
    expect(arraySliceLeft([1, 2, 3], 4)).toEqual([1, 2, 3]);
  });

  test('arraySliceRight', () => {
    expect(arraySliceRight([], -1)).toEqual([]);
    expect(arraySliceRight([], 0)).toEqual([]);
    expect(arraySliceRight([], 1)).toEqual([]);

    expect(arraySliceRight([1], -1)).toEqual([]);
    expect(arraySliceRight([1], 0)).toEqual([]);
    expect(arraySliceRight([1], 1)).toEqual([1]);
    expect(arraySliceRight([1], 2)).toEqual([1]);

    expect(arraySliceRight([1, 2], -1)).toEqual([]);
    expect(arraySliceRight([1, 2], 0)).toEqual([]);
    expect(arraySliceRight([1, 2], 1)).toEqual([2]);
    expect(arraySliceRight([1, 2], 2)).toEqual([1, 2]);
    expect(arraySliceRight([1, 2], 3)).toEqual([1, 2]);

    expect(arraySliceRight([1, 2, 3], -1)).toEqual([]);
    expect(arraySliceRight([1, 2, 3], 0)).toEqual([]);
    expect(arraySliceRight([1, 2, 3], 1)).toEqual([3]);
    expect(arraySliceRight([1, 2, 3], 2)).toEqual([2, 3]);
    expect(arraySliceRight([1, 2, 3], 3)).toEqual([1, 2, 3]);
    expect(arraySliceRight([1, 2, 3], 4)).toEqual([1, 2, 3]);
  });

  test('arrayIndexModulo', () => {
    expect(arrayIndexModulo(0, 0)).toBe(-1);
    expect(arrayIndexModulo(1, 0)).toBe(-1);
    expect(arrayIndexModulo(-1, 0)).toBe(-1);

    expect(arrayIndexModulo(-2, 1)).toBe(0);
    expect(arrayIndexModulo(-1, 1)).toBe(0);
    expect(arrayIndexModulo(0, 1)).toBe(0);
    expect(arrayIndexModulo(1, 1)).toBe(0);
    expect(arrayIndexModulo(2, 1)).toBe(0);

    expect(arrayIndexModulo(-3, 2)).toBe(1);
    expect(arrayIndexModulo(-2, 2)).toBe(0);
    expect(arrayIndexModulo(-1, 2)).toBe(1);
    expect(arrayIndexModulo(0, 2)).toBe(0);
    expect(arrayIndexModulo(1, 2)).toBe(1);
    expect(arrayIndexModulo(2, 2)).toBe(0);
    expect(arrayIndexModulo(3, 2)).toBe(1);

    expect(arrayIndexModulo(-6, 3)).toBe(0);
    expect(arrayIndexModulo(-5, 3)).toBe(1);
    expect(arrayIndexModulo(-4, 3)).toBe(2);
    expect(arrayIndexModulo(-3, 3)).toBe(0);
    expect(arrayIndexModulo(-2, 3)).toBe(1);
    expect(arrayIndexModulo(-1, 3)).toBe(2);
    expect(arrayIndexModulo(0, 3)).toBe(0);
    expect(arrayIndexModulo(1, 3)).toBe(1);
    expect(arrayIndexModulo(2, 3)).toBe(2);
    expect(arrayIndexModulo(3, 3)).toBe(0);
    expect(arrayIndexModulo(4, 3)).toBe(1);
    expect(arrayIndexModulo(5, 3)).toBe(2);
    expect(arrayIndexModulo(6, 3)).toBe(0);
  });

  test('arraySplit', () => {
    expect(arraySplit([], -1)).toEqual([[], []]);
    expect(arraySplit([], 0)).toEqual([[], []]);
    expect(arraySplit([], 1)).toEqual([[], []]);

    expect(arraySplit([1], -2)).toEqual([[], [1]]);
    expect(arraySplit([1], -1)).toEqual([[], [1]]);
    expect(arraySplit([1], 0)).toEqual([[], [1]]);
    expect(arraySplit([1], 1)).toEqual([[1], []]);
    expect(arraySplit([1], 2)).toEqual([[1], []]);

    expect(arraySplit([1, 2, 3], -5)).toEqual([[], [1, 2, 3]]);
    expect(arraySplit([1, 2, 3], -4)).toEqual([[], [1, 2, 3]]);
    expect(arraySplit([1, 2, 3], -3)).toEqual([[], [1, 2, 3]]);
    expect(arraySplit([1, 2, 3], -2)).toEqual([[1], [2, 3]]);
    expect(arraySplit([1, 2, 3], -1)).toEqual([[1, 2], [3]]);
    expect(arraySplit([1, 2, 3], 0)).toEqual([[], [1, 2, 3]]);
    expect(arraySplit([1, 2, 3], 1)).toEqual([[1], [2, 3]]);
    expect(arraySplit([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
    expect(arraySplit([1, 2, 3], 3)).toEqual([[1, 2, 3], []]);
    expect(arraySplit([1, 2, 3], 4)).toEqual([[1, 2, 3], []]);
    expect(arraySplit([1, 2, 3], 5)).toEqual([[1, 2, 3], []]);
  });

  test('addItem', () => {
    const a = [1, 3, 5];

    expect(addItem(a, 1)).toEqual(false);
    expect(a).toEqual([1, 3, 5]);

    expect(addItem(a, 2)).toEqual(true);
    expect(a).toEqual([1, 3, 5, 2]);

    expect(addItem(a, 2)).toEqual(false);
    expect(a).toEqual([1, 3, 5, 2]);
  });

  test('removeItem', () => {
    const a = [1, 3, 3, 5];

    expect(removeItem(a, 1)).toEqual(0);
    expect(a).toEqual([3, 3, 5]);

    expect(removeItem(a, 2)).toEqual(-1);
    expect(a).toEqual([3, 3, 5]);

    expect(removeItem(a, 3)).toEqual(0);
    expect(a).toEqual([3, 5]);

    expect(removeItem(a, 5)).toEqual(1);
    expect(a).toEqual([3]);

    expect(removeItem(a, 3)).toEqual(0);
    expect(a).toEqual([]);

    expect(removeItem(a, 3)).toEqual(-1);
    expect(a).toEqual([]);
  });

  test('replaceItem', () => {
    const a = [1, 3, 3, 5];

    expect(replaceItem(a, 1, 4)).toEqual(0);
    expect(a).toEqual([4, 3, 3, 5]);

    expect(replaceItem(a, 1, 4)).toEqual(-1);
    expect(a).toEqual([4, 3, 3, 5]);

    expect(replaceItem(a, 1, 4, true)).toEqual(4);
    expect(a).toEqual([4, 3, 3, 5, 4]);

    expect(replaceItem(a, 3, 1, true)).toEqual(1);
    expect(a).toEqual([4, 1, 3, 5, 4]);

    expect(replaceItem(a, 3, 1, true)).toEqual(2);
    expect(a).toEqual([4, 1, 1, 5, 4]);

    expect(replaceItem(a, 3, 1, true)).toEqual(5);
    expect(a).toEqual([4, 1, 1, 5, 4, 1]);
  });

  test('withoutNil', () => {
    const a = [1, 3, 3, 5];

    expect(withoutNil([])).toEqual([]);
    expect(withoutNil([null, undefined])).toEqual([]);
    expect(withoutNil([1, 3, 3, 5])).toEqual([1, 3, 3, 5]);
    expect(withoutNil([1, null, 3, undefined, 3, 5])).toEqual([1, 3, 3, 5]);
  });

  test('arraysEqual', () => {
    expect(arraysEqual([], [])).toEqual(true);
    expect(arraysEqual([1], [1])).toEqual(true);
    expect(arraysEqual([1, 3, 5], [1, 3, 5])).toEqual(true);
    expect(arraysEqual([1, 3, 5], [1, 3, 3, 5])).toEqual(false);
    expect(arraysEqual([1, 3, 5], [1, 2, 5])).toEqual(false);
    expect(arraysEqual([1, 3, 5], [1, 3])).toEqual(false);
    expect(arraysEqual([1, 3, 5], [1, 3, 5, 7])).toEqual(false);
  });

  test('dedup', () => {
    expect(dedup([], (x) => x)).toEqual([]);
    expect(dedup([1], (x) => x)).toEqual([1]);
    expect(dedup([1, 3, 3, 5], (x) => x)).toEqual([1, 3, 5]);
    expect(dedup([1, 3, 5], (x) => x)).toEqual([1, 3, 5]);
    expect(dedup([1, 3], (x) => x)).toEqual([1, 3]);
    expect(dedup([1, 3, 1], (x) => x)).toEqual([1, 3]);
    expect(dedup([[1], [3], [3], [5]], (x) => x[0])).toEqual([[1], [3], [5]]);
  });

  test('dedupKeys', () => {
    expect(dedupKeys([])).toEqual([]);
    expect(dedupKeys([1])).toEqual([1]);
    expect(dedupKeys([1, 3, 3, 5])).toEqual([1, 3, 5]);
    expect(dedupKeys([1, 3, 5])).toEqual([1, 3, 5]);
    expect(dedupKeys([1, 3])).toEqual([1, 3]);
    expect(dedupKeys([1, 3, 1])).toEqual([1, 3]);
  });

  test('findLast', () => {
    expect(findLast([1, 3, 3, 5], (x) => x > 10)).toEqual(undefined);
    expect(findLast([1, 3, 3, 5], (x) => x > 2)).toEqual(5);
    expect(findLast([1, 3, 3, 5], (x) => x > 4)).toEqual(5);
    expect(findLast([1, 3, 3, 5], (x) => x < 2)).toEqual(1);
    expect(findLast([1, 3, 3, 5], (x) => x < 4)).toEqual(3);
  });

  test('moveItem', () => {
    expect(moveItem([], 0, 1)).toEqual([]);
    expect(moveItem([1], 0, 1)).toEqual([1]);
    expect(moveItem([1, 2], 0, 1)).toEqual([2, 1]);
    expect(moveItem([1, 3, 3, 5], 0, -1)).toEqual([1, 3, 3, 5]);
    expect(moveItem([1, 3, 3, 5], 0, 0)).toEqual([1, 3, 3, 5]);
    expect(moveItem([1, 3, 3, 5], 0, 1)).toEqual([3, 1, 3, 5]);
    expect(moveItem([1, 3, 3, 5], 0, 2)).toEqual([3, 3, 1, 5]);
    expect(moveItem([1, 3, 3, 5], 0, 3)).toEqual([3, 3, 5, 1]);
    expect(moveItem([1, 3, 3, 5], 0, 4)).toEqual([3, 3, 5, 1]);

    expect(moveItem([1, 3, 3, 5], 3, -4)).toEqual([5, 1, 3, 3]);
    expect(moveItem([1, 3, 3, 5], 3, -3)).toEqual([5, 1, 3, 3]);
    expect(moveItem([1, 3, 3, 5], 3, -2)).toEqual([1, 5, 3, 3]);
    expect(moveItem([1, 3, 3, 5], 3, -1)).toEqual([1, 3, 5, 3]);
    expect(moveItem([1, 3, 3, 5], 3, 0)).toEqual([1, 3, 3, 5]);
    expect(moveItem([1, 3, 3, 5], 3, 1)).toEqual([1, 3, 3, 5]);
  });

  test('keysToMap', () => {
    expect(keysToMap([], 1)).toEqual({});
    expect(keysToMap([1], 1)).toEqual({ '1': 1 });
    expect(keysToMap([1, 3, 3, 5], 1)).toEqual({ '1': 1, '3': 1, '5': 1 });
    expect(keysToMap([1, 3, 3, 5], true)).toEqual({
      '1': true,
      '3': true,
      '5': true,
    });
  });

  test('arrayToMap', () => {
    expect(arrayToMap([], (x) => x)).toEqual({});
    expect(arrayToMap([1], (x) => x)).toEqual({ '1': 1 });
    expect(arrayToMap([1, 3, 3, 5], (x) => x)).toEqual({
      '1': 1,
      '3': 3,
      '5': 5,
    });
  });

  test('keysSubtract', () => {
    expect(keysSubtract([], [])).toEqual([]);
    expect(keysSubtract([1], [])).toEqual([1]);
    expect(keysSubtract([], [1])).toEqual([]);
    expect(keysSubtract([1, 3, 5], [2, 4, 6])).toEqual([1, 3, 5]);
    expect(keysSubtract([1, 2, 3, 4, 5], [2, 4, 6])).toEqual([1, 3, 5]);
    expect(keysSubtract([1, 1, 2, 3, 4, 5], [2, 4, 6])).toEqual([1, 1, 3, 5]);
    expect(keysSubtract([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], [2, 2, 4, 6])).toEqual([
      1, 1, 3, 3, 5, 5,
    ]);
  });

  test('arraySubtract', () => {
    expect(arraySubtract([], [], (x) => x)).toEqual([]);
    expect(arraySubtract([1], [], (x) => x)).toEqual([1]);
    expect(arraySubtract([], [1], (x) => x)).toEqual([]);
    expect(arraySubtract([1, 3, 5], [2, 4, 6], (x) => x)).toEqual([1, 3, 5]);
    expect(arraySubtract([1, 2, 3, 4, 5], [2, 4, 6], (x) => x)).toEqual([
      1, 3, 5,
    ]);
    expect(arraySubtract([1, 1, 2, 3, 4, 5], [2, 4, 6], (x) => x)).toEqual([
      1, 1, 3, 5,
    ]);
    expect(
      arraySubtract([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], [2, 2, 4, 6], (x) => x)
    ).toEqual([1, 1, 3, 3, 5, 5]);
  });

  test('keysIntersection', () => {
    expect(keysIntersection([], [])).toEqual([]);
    expect(keysIntersection([1], [])).toEqual([]);
    expect(keysIntersection([], [1])).toEqual([]);
    expect(keysIntersection([1, 3, 5], [2, 4, 6])).toEqual([]);
    expect(keysIntersection([1, 2, 3, 4, 5], [2, 4, 6])).toEqual([2, 4]);
    expect(keysIntersection([1, 1, 2, 3, 4, 5], [2, 4, 6])).toEqual([2, 4]);
    expect(
      keysIntersection([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], [2, 2, 4, 6])
    ).toEqual([2, 2, 4, 4]);
  });

  test('arrayIntersection', () => {
    expect(arrayIntersection([], [], (x) => x)).toEqual([]);
    expect(arrayIntersection([1], [], (x) => x)).toEqual([]);
    expect(arrayIntersection([], [1], (x) => x)).toEqual([]);
    expect(arrayIntersection([1, 3, 5], [2, 4, 6], (x) => x)).toEqual([]);
    expect(arrayIntersection([1, 2, 3, 4, 5], [2, 4, 6], (x) => x)).toEqual([
      2, 4,
    ]);
    expect(arrayIntersection([1, 1, 2, 3, 4, 5], [2, 4, 6], (x) => x)).toEqual([
      2, 4,
    ]);
    expect(
      arrayIntersection([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], [2, 2, 4, 6], (x) => x)
    ).toEqual([2, 2, 4, 4]);
  });

  test('arrayToKeys', () => {
    expect(arrayToKeys([], (x, i) => `${x},${i}`)).toEqual({});
    expect(arrayToKeys([1], (x, i) => `${x},${i}`)).toEqual({ 1: '1,0' });
    expect(arrayToKeys([1, 3, 5], (x, i) => `${x},${i}`)).toEqual({
      1: '1,0',
      3: '3,1',
      5: '5,2',
    });
  });

  test('arrayConcatInPlace', () => {
    expect(arrayConcatInPlace([])).toEqual([]);
    expect(arrayConcatInPlace([1])).toEqual([1]);
    expect(arrayConcatInPlace([1, 2])).toEqual([1, 2]);

    expect(arrayConcatInPlace([], [])).toEqual([]);
    expect(arrayConcatInPlace([], [1])).toEqual([1]);
    expect(arrayConcatInPlace([], [1], [2])).toEqual([1, 2]);
    expect(arrayConcatInPlace([], [1], [2, 3])).toEqual([1, 2, 3]);
    expect(arrayConcatInPlace([], [1, 2], [3, 4, 5])).toEqual([1, 2, 3, 4, 5]);

    expect(arrayConcatInPlace([1], [], [])).toEqual([1]);
    expect(arrayConcatInPlace([1], [1], [])).toEqual([1, 1]);
    expect(arrayConcatInPlace([1], [1])).toEqual([1, 1]);
    expect(arrayConcatInPlace([1, 2], [1], [2])).toEqual([1, 2, 1, 2]);
    expect(arrayConcatInPlace([1, 3, 2], [1], [2, 3])).toEqual([
      1, 3, 2, 1, 2, 3,
    ]);
  });

  test('arraySliceInPlace', () => {
    expect(arraySliceInPlace([])).toEqual([]);
    expect(arraySliceInPlace([1])).toEqual([1]);
    expect(arraySliceInPlace([1, 2])).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3])).toEqual([1, 2, 3]);

    expect(arraySliceInPlace([], 0)).toEqual([]);
    expect(arraySliceInPlace([1], 0)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], 0)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], 0)).toEqual([1, 2, 3]);

    expect(arraySliceInPlace([], 1)).toEqual([]);
    expect(arraySliceInPlace([1], 1)).toEqual([]);
    expect(arraySliceInPlace([1, 2], 1)).toEqual([2]);
    expect(arraySliceInPlace([1, 2, 3], 1)).toEqual([2, 3]);

    expect(arraySliceInPlace([], 2)).toEqual([]);
    expect(arraySliceInPlace([1], 2)).toEqual([]);
    expect(arraySliceInPlace([1, 2], 2)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 2)).toEqual([3]);

    expect(arraySliceInPlace([], 3)).toEqual([]);
    expect(arraySliceInPlace([1], 3)).toEqual([]);
    expect(arraySliceInPlace([1, 2], 3)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 3)).toEqual([]);

    expect(arraySliceInPlace([], -1)).toEqual([]);
    expect(arraySliceInPlace([1], -1)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], -1)).toEqual([2]);
    expect(arraySliceInPlace([1, 2, 3], -1)).toEqual([3]);

    expect(arraySliceInPlace([], -2)).toEqual([]);
    expect(arraySliceInPlace([1], -2)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], -2)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], -2)).toEqual([2, 3]);

    expect(arraySliceInPlace([], -3)).toEqual([]);
    expect(arraySliceInPlace([1], -3)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], -3)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], -3)).toEqual([1, 2, 3]);

    expect(arraySliceInPlace([], undefined, 0)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, 0)).toEqual([]);
    expect(arraySliceInPlace([1, 2], undefined, 0)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], undefined, 0)).toEqual([]);

    expect(arraySliceInPlace([], undefined, 1)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, 1)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], undefined, 1)).toEqual([1]);
    expect(arraySliceInPlace([1, 2, 3], undefined, 1)).toEqual([1]);

    expect(arraySliceInPlace([], undefined, 2)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, 2)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], undefined, 2)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], undefined, 2)).toEqual([1, 2]);

    expect(arraySliceInPlace([], undefined, 3)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, 3)).toEqual([1]);
    expect(arraySliceInPlace([1, 2], undefined, 3)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], undefined, 3)).toEqual([1, 2, 3]);

    expect(arraySliceInPlace([], undefined, -1)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, -1)).toEqual([]);
    expect(arraySliceInPlace([1, 2], undefined, -1)).toEqual([1]);
    expect(arraySliceInPlace([1, 2, 3], undefined, -1)).toEqual([1, 2]);

    expect(arraySliceInPlace([], undefined, -2)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, -2)).toEqual([]);
    expect(arraySliceInPlace([1, 2], undefined, -2)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], undefined, -2)).toEqual([1]);

    expect(arraySliceInPlace([], undefined, -3)).toEqual([]);
    expect(arraySliceInPlace([1], undefined, -3)).toEqual([]);
    expect(arraySliceInPlace([1, 2], undefined, -3)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], undefined, -3)).toEqual([]);

    expect(arraySliceInPlace([], 0, 0)).toEqual([]);
    expect(arraySliceInPlace([], 0, 1)).toEqual([]);

    expect(arraySliceInPlace([1, 2, 3], -1, -3)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], -1, -2)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], -1, -1)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], -1, 0)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], -1, 1)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], -1, 2)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], -1, 3)).toEqual([3]);

    expect(arraySliceInPlace([1, 2, 3], 0, -3)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 0, -2)).toEqual([1]);
    expect(arraySliceInPlace([1, 2, 3], 0, -1)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], 0, 0)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 0, 1)).toEqual([1]);
    expect(arraySliceInPlace([1, 2, 3], 0, 2)).toEqual([1, 2]);
    expect(arraySliceInPlace([1, 2, 3], 0, 3)).toEqual([1, 2, 3]);

    expect(arraySliceInPlace([1, 2, 3], 1, -3)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 1, -2)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 1, -1)).toEqual([2]);
    expect(arraySliceInPlace([1, 2, 3], 1, 0)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 1, 1)).toEqual([]);
    expect(arraySliceInPlace([1, 2, 3], 1, 2)).toEqual([2]);
    expect(arraySliceInPlace([1, 2, 3], 1, 3)).toEqual([2, 3]);
  });

  test('arrayMapInPlace', () => {
    expect(arrayMapInPlace(numberRange(1, 6), (x) => x * 2)).toEqual(
      numberRange(2, 12, 2)
    );
    expect(arrayMapInPlace(numberRange(1, 6), (x) => x.toString())).toEqual(
      numberRange(1, 6).map((x) => x.toString())
    );
  });

  test('arrayFilterInPlace', () => {
    expect(
      arrayFilterInPlace<{}, number[]>([], (x): x is Array<number> =>
        Array.isArray(x)
      )
    ).toEqual([]);

    expect(
      arrayFilterInPlace<{}, number[]>([[1]], (x): x is Array<number> =>
        Array.isArray(x)
      )
    ).toEqual([[1]]);

    expect(
      arrayFilterInPlace<{}, number[]>([[1], {}], (x): x is Array<number> =>
        Array.isArray(x)
      )
    ).toEqual([[1]]);

    expect(
      arrayFilterInPlace<{}, number[]>(
        [[1], {}, [2]],
        (x): x is Array<number> => Array.isArray(x)
      )
    ).toEqual([[1], [2]]);

    expect(
      arrayFilterInPlace<{}, number[]>(
        [[1], {}, [2], {}],
        (x): x is Array<number> => Array.isArray(x)
      )
    ).toEqual([[1], [2]]);

    expect(
      arrayFilterInPlace<{}, number[]>(
        [[1], {}, [2], {}, [3]],
        (x): x is Array<number> => Array.isArray(x)
      )
    ).toEqual([[1], [2], [3]]);

    expect(
      arrayFilterInPlace<{}, number[]>(
        [{}, {}, {}, [1], [2], {}, {}, [3], {}, {}],
        (x): x is Array<number> => Array.isArray(x)
      )
    ).toEqual([[1], [2], [3]]);
  });

  test('arrayRemoveOneInPlace', () => {
    expect(arrayRemoveOneInPlace([], 1)).toEqual([]);
    expect(arrayRemoveOneInPlace(numberRange(1, 4), 0)).toEqual([1, 2, 3]);
    expect(arrayRemoveOneInPlace(numberRange(1, 4), 1)).toEqual([2, 3]);
    expect(arrayRemoveOneInPlace(numberRange(1, 4), 2)).toEqual([1, 3]);
    expect(arrayRemoveOneInPlace(numberRange(1, 4), 3)).toEqual([1, 2]);
    expect(arrayRemoveOneInPlace(numberRange(1, 4), 4)).toEqual([1, 2, 3]);
    expect(arrayRemoveOneInPlace([1, 2, 3, 1, 2, 3], 1)).toEqual([
      2, 3, 1, 2, 3,
    ]);
    expect(arrayRemoveOneInPlace([1, 2, 3, 1, 2, 3], 2)).toEqual([
      1, 3, 1, 2, 3,
    ]);
    expect(arrayRemoveOneInPlace([1, 2, 3, 1, 2, 3], 3)).toEqual([
      1, 2, 1, 2, 3,
    ]);
  });

  test('arrayRemoveLastOneInPlace', () => {
    expect(arrayRemoveLastOneInPlace([], 1)).toEqual([]);
    expect(arrayRemoveLastOneInPlace(numberRange(1, 4), 0)).toEqual([1, 2, 3]);
    expect(arrayRemoveLastOneInPlace(numberRange(1, 4), 1)).toEqual([2, 3]);
    expect(arrayRemoveLastOneInPlace(numberRange(1, 4), 2)).toEqual([1, 3]);
    expect(arrayRemoveLastOneInPlace(numberRange(1, 4), 3)).toEqual([1, 2]);
    expect(arrayRemoveLastOneInPlace(numberRange(1, 4), 4)).toEqual([1, 2, 3]);
    expect(arrayRemoveLastOneInPlace([1, 2, 3, 1, 2, 3], 1)).toEqual([
      1, 2, 3, 2, 3,
    ]);
    expect(arrayRemoveLastOneInPlace([1, 2, 3, 1, 2, 3], 2)).toEqual([
      1, 2, 3, 1, 3,
    ]);
    expect(arrayRemoveLastOneInPlace([1, 2, 3, 1, 2, 3], 3)).toEqual([
      1, 2, 3, 1, 2,
    ]);
  });

  test('arrayRemoveLastOneInPlace', () => {
    expect(arrayRemoveManyInPlace([], 1)).toEqual([]);
    expect(arrayRemoveManyInPlace(numberRange(1, 4), 0)).toEqual([1, 2, 3]);
    expect(arrayRemoveManyInPlace(numberRange(1, 4), 1)).toEqual([2, 3]);
    expect(arrayRemoveManyInPlace(numberRange(1, 4), 2)).toEqual([1, 3]);
    expect(arrayRemoveManyInPlace(numberRange(1, 4), 3)).toEqual([1, 2]);
    expect(arrayRemoveManyInPlace(numberRange(1, 4), 4)).toEqual([1, 2, 3]);
    expect(arrayRemoveManyInPlace([1, 2, 3, 1, 2, 3], 1)).toEqual([2, 3, 2, 3]);
    expect(arrayRemoveManyInPlace([1, 2, 3, 1, 2, 3], 2)).toEqual([1, 3, 1, 3]);
    expect(arrayRemoveManyInPlace([1, 2, 3, 1, 2, 3], 3)).toEqual([1, 2, 1, 2]);
  });
});
