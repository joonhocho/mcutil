import { BigNumber } from 'bignumber.js';
import { expect, test } from '@jest/globals';
import {
  ceilTo,
  equalBigNumbers,
  floorTo,
  roundTo,
} from '../../src/lib/bignumber';

test('roundTo', () => {
  expect(roundTo(10, 3).toNumber()).toBe(9); // Rounds 10 to a nearest multiple of 3 (9)
  expect(roundTo(-10, -3).toNumber()).toBe(-9); // Rounds -10 to a nearest multiple of -3 (-9)

  expect(roundTo(1.3, 0.2).toNumber()).toBe(1.4); // Rounds 1.3 to a nearest multiple of 0.2 (1.2)
  expect(roundTo(-1.3, 0.2).toNumber()).toBe(-1.2); // Rounds -1.3 to a nearest multiple of 0.2 (-1.2)
  expect(roundTo(5, -2).toNumber()).toBe(4); // Returns an error, because -2 and 5 have different signs
});

test('ceilTo', () => {
  expect(ceilTo(10, 3).toNumber()).toBe(12);
  expect(ceilTo(-10, -3).toNumber()).toBe(-12);

  expect(ceilTo(1.3, 0.2).toNumber()).toBe(1.4);
  expect(ceilTo(-1.3, 0.2).toNumber()).toBe(-1.2);
  expect(ceilTo(5, -2).toNumber()).toBe(4);
});

test('floorTo', () => {
  expect(floorTo(10, 3).toNumber()).toBe(9);
  expect(floorTo(-10, -3).toNumber()).toBe(-9);

  expect(floorTo(1.3, 0.2).toNumber()).toBe(1.2);
  expect(floorTo(-1.3, 0.2).toNumber()).toBe(-1.4);
  expect(floorTo(5, -2).toNumber()).toBe(6);
});

test('equalBigNumbers', () => {
  expect(equalBigNumbers(BigNumber(0.1).plus(0.2), BigNumber(0.3))).toBe(true);
  expect(equalBigNumbers(BigNumber(0.1).plus(0.2), BigNumber('0.3'))).toBe(
    true
  );
});
