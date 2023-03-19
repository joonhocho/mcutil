import type { AnyFunction } from './types/types.js';

// To avoid eslint@typescript-eslint/no-unused-expressions
export const noop = (...args: any[]) => {};

export const markAsDep = noop;

export const returnVoid =
  <T extends AnyFunction>(fn: T): ((...args: Parameters<T>) => void) =>
  (...args) => {
    fn(...args);
  };

export const logAndReturn = <T>(x: T, ...args: any[]): T => {
  console.log(x, ...args);
  return x;
};

export const debugAndReturn = <T>(x: T, ...args: any[]): T => {
  console.debug(new Error().stack);
  console.debug(x, ...args);
  return x;
};

export const isBool = (x: any): x is boolean => typeof x === 'boolean';

export const isNumber = (x: any): x is number => typeof x === 'number';

export const isFiniteNumber = (x: any): x is number =>
  typeof x === 'number' && isFinite(x);

export const isString = (x: any): x is string => typeof x === 'string';

export const isObject = (x: any): x is object =>
  x != null && typeof x === 'object';

export const dedup = <T extends number | string>(list: T[]): T[] => {
  const map: Record<string, 1> = {};
  return list.filter((x) => {
    if (map[x as string] === 1) {
      return false;
    }
    map[x as string] = 1;
    return true;
  });
};

export const round = (n: number, decimalDigits: number) => {
  const factor = Math.pow(10, decimalDigits);
  return Math.round(n * factor) / factor;
};

export const roundSignificant = (n: number, nSig: number) =>
  parseFloat(n.toPrecision(nSig));

export const isNonZeroAndFinite = (x: number) =>
  !!x && typeof x === 'number' && isFinite(x);

export type CallLimitedFn<F extends AnyFunction> = (
  ...args: Parameters<F>
) => ReturnType<F> | void;

export const funcOnce = <F extends AnyFunction>(fn: F): CallLimitedFn<F> =>
  function (this: any) {
    if (fn == null) return;
    const cacheFn = fn;
    fn = null as any;
    return cacheFn.apply(this, arguments as any);
  } as F;

export const funcLimitCallCount = <F extends AnyFunction>(
  fn: F,
  count = 1
): CallLimitedFn<F> =>
  function (this: any) {
    if (fn == null) return;

    const cacheFn = fn;

    if (--count < 1) {
      fn = null as any;
    }

    return cacheFn.apply(this, arguments as any);
  } as F;
