import { BigNumber } from 'bignumber.js';

export const roundTo = (
  n: BigNumber | number | string,
  step: BigNumber | number | string,
  mode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_CEIL
): BigNumber => {
  const v = n instanceof BigNumber ? n : new BigNumber(n);
  return v.div(step).decimalPlaces(0, mode).times(step);
};

export const ceilTo = (
  n: BigNumber | number | string,
  step: BigNumber | number | string,
  mode: BigNumber.RoundingMode = BigNumber.ROUND_CEIL
): BigNumber => roundTo(n, step, mode);

export const floorTo = (
  n: BigNumber | number | string,
  step: BigNumber | number | string,
  mode: BigNumber.RoundingMode = BigNumber.ROUND_FLOOR
): BigNumber => roundTo(n, step, mode);

export const equalBigNumbers = (
  a?: BigNumber | null,
  b?: BigNumber | null
): boolean => {
  if (a === b) return true;
  if (a == null) return b == null;
  if (b == null) return false;
  return a.eq(b);
};
