import { describe, expect, test } from '@jest/globals';
import { numberRange } from '../src/number.js';

describe('number', () => {
  test('numberRange', () => {
    expect(numberRange(1, 0)).toEqual([]);
    expect(numberRange(1, 1)).toEqual([]);
    expect(numberRange(1, 1.5)).toEqual([1]);
    expect(numberRange(1, 2)).toEqual([1]);
    expect(numberRange(1, 2.5)).toEqual([1, 2]);
    expect(numberRange(1, 3)).toEqual([1, 2]);
    expect(numberRange(1, 4)).toEqual([1, 2, 3]);

    expect(numberRange(1, 1, 0.5)).toEqual([]);
    expect(numberRange(1, 1.5, 0.5)).toEqual([1]);
    expect(numberRange(1, 2, 0.5)).toEqual([1, 1.5]);
    expect(numberRange(1, 2.5, 0.5)).toEqual([1, 1.5, 2]);
    expect(numberRange(1, 3, 0.5)).toEqual([1, 1.5, 2, 2.5]);
    expect(numberRange(1, 4, 0.5)).toEqual([1, 1.5, 2, 2.5, 3, 3.5]);

    expect(numberRange(0.3, 1.7, 0.25)).toEqual([
      0.3, 0.55, 0.8, 1.05, 1.3, 1.55,
    ]);
  });
});
