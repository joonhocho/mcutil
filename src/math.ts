export const isPositiveInteger = (x: number): x is number =>
  typeof x === 'number' && x > 0 && Number.isInteger(x);

export const ifNotFinite = (x: number, fallback: number): number =>
  isFinite(x) ? x : fallback;

export interface IStats {
  count: number;
  min: number;
  max: number;
  range: number;
  sum: number;
  mean: number;
  variance: number;
  deviation: number;
}

export const calcStats = (list: number[]): IStats => {
  let count = list.length;
  let min = Infinity;
  let max = -Infinity;
  let range = Infinity;
  let sum = 0;
  let mean = 0;
  let variance = 0;
  let deviation = 0;

  for (let i = 0, l = list.length; i < l; i += 1) {
    const n = list[i];
    if (n < min) min = n;
    if (n > max) max = n;
    sum += n;
  }

  range = max - min;

  mean = sum / count;

  for (let i = 0, l = list.length; i < l; i += 1) {
    const n = list[i];
    variance += (n - mean) ** 2;
  }

  variance /= count;

  deviation = Math.sqrt(variance);

  return { count, min, max, range, sum, mean, variance, deviation };
};

export const calcStatsForKeys = <K extends string>(
  list: Array<Record<K, number>>,
  keys: K[]
): Record<K, IStats> => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const stats = {} as Record<K, IStats>;
  for (let i = 0, l = keys.length; i < l; i += 1) {
    const key = keys[i];
    stats[key] = calcStats(list.map((x) => x[key]).filter(isFinite));
  }
  return stats;
};

export const fibSequence = (size: number): number[] => {
  const fib = new Array<number>(size); // Initialize array!

  fib[0] = 0;
  fib[1] = 1;
  for (let i = 2; i < size; i++) {
    fib[i] = fib[i - 2] + fib[i - 1];
  }

  return size < 2 ? fib.slice(0, size) : fib;
};

// https://r-knott.surrey.ac.uk/Fibonacci/fibtable.html
export const GOLDEN_RATIO = 1.61803398875;

export const FIB_RETRACEMENTS = {
  146: 0.14589803375,
  236: 0.2360679775,
  382: 0.38196601125,
  500: 0.5,
  618: 0.61803398875,
  786: Math.sqrt(0.61803398875),
  887: Math.sqrt(Math.sqrt(0.61803398875)),
};
