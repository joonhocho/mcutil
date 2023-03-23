import { KeyType } from './types/types.js';

export const arrayFirstItem = <T>(arr: T[] | ArrayLike<T>): T | undefined =>
  arr[0];

export const arrayLastItem = <T>(arr: T[] | ArrayLike<T>): T | undefined =>
  arr[arr.length - 1];

export function arrayConcatInPlace<T>(arr: T[], ...lists: T[][]): T[];
export function arrayConcatInPlace<T>(arr: T[]): T[] {
  for (let i = 1, il = arguments.length; i < il; i++) {
    arr.push(...arguments[i]);
  }
  return arr;
}

export const arraySliceInPlace = <T>(
  arr: T[],
  start = 0,
  end = arr.length
): T[] => {
  const { length } = arr;

  // already empty, nothing to do
  if (length < 1) return arr;

  const lastIndex = length - 1;

  if (start < 0) start = length + start;
  if (start <= 0) start = 0;
  if (start > length) start = length;

  if (end < 0) end = length + end;
  if (end <= 0) end = 0;
  if (end > length) end = length;

  if (start >= end) {
    // end - start is new length
    arr.length = 0;
    return arr;
  }

  if (end < length) {
    arr.splice(end, length - end);
  }

  if (start > 0) {
    arr.splice(0, start);
  }

  return arr;
};

export const arrayMapInPlace = <T, U>(
  arr: T[],
  mapFn: (value: T, index: number, array: T[]) => U,
  thisArg?: any
): U[] => {
  const newArr = arr as unknown as U[];
  for (let i = 0, il = arr.length; i < il; i += 1) {
    newArr[i] = mapFn.call(thisArg, arr[i], i, arr);
  }
  return newArr;
};

export function arrayFilterInPlace<T, S extends T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => value is S,
  thisArg?: any
): S[];
export function arrayFilterInPlace<T>(
  arr: T[],
  predicate: (value: T, index: number, array: T[]) => unknown,
  thisArg?: any
): T[] {
  for (let i = 0; i < arr.length; ) {
    if (predicate.call(thisArg, arr[i], i, arr)) {
      i++;
    } else {
      arr.splice(i, 1);
    }
  }
  return arr;
}

export const arrayRemoveOneInPlace = <T>(arr: T[], item: T): T[] => {
  const i = arr.indexOf(item);
  if (i >= 0) {
    arr.splice(i, 1);
  }
  return arr;
};

export const arrayRemoveLastOneInPlace = <T>(arr: T[], item: T): T[] => {
  const i = arr.lastIndexOf(item);
  if (i >= 0) {
    arr.splice(i, 1);
  }
  return arr;
};

export const arrayRemoveManyInPlace = <T>(arr: T[], item: T): T[] => {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (arr[i] === item) {
      arr.splice(i, 1);
    }
  }
  return arr;
};

export const arraySliceLeft = <T>(arr: T[], count: number): T[] =>
  count < 1 || arr.length <= 0
    ? []
    : count >= arr.length
    ? arr.slice()
    : arr.slice(0, count);

export const arraySliceRight = <T>(arr: T[], count: number): T[] =>
  count < 1 || arr.length <= 0
    ? []
    : count >= arr.length
    ? arr.slice()
    : arr.slice(arr.length - count);

export const arrayIndexModulo = (index: number, length: number): number => {
  if (length < 1) return -1;
  const mod = index % length;
  // check -0
  return mod == 0 ? 0 : mod > 0 ? mod : length + mod;
};

export const arraySplit = <T>(arr: T[], index: number): [T[], T[]] => {
  // index could be interpreted as length of left side array
  const { length } = arr;

  if (length < 1) return [[], []];

  if (0 <= index) return [arr.slice(0, index), arr.slice(index)];

  if (index <= -length) return [[], arr.slice()];

  return [arr.slice(0, length + index), arr.slice(length + index)];
};

export const addItem = <T>(arr: T[], item: T): boolean => {
  if (arr.indexOf(item) === -1) {
    arr.push(item);
    return true;
  }
  return false;
};

export const removeItem = <T>(arr: T[], item: T): number => {
  const index = arr.indexOf(item);
  if (index !== -1) {
    arr.splice(index, 1);
  }
  return index;
};

export const replaceItem = <T>(
  arr: T[],
  oldItem: T,
  newItem: T,
  pushIfNotFound?: boolean
): number => {
  const index = arr.indexOf(oldItem);
  if (index === -1) {
    // not found
    if (pushIfNotFound) {
      arr.push(newItem);
      return arr.length - 1;
    }
  } else {
    // found
    arr[index] = newItem;
  }
  return index;
};

export const withoutNil = <T>(arr: Array<T | null | undefined>): T[] =>
  arr.filter((x) => x != null) as T[];

export interface ArrayLike<T> {
  [index: number]: T;
  length: number;
}

export const arraysEqual = <T>(
  a1: T[] | ArrayLike<T>,
  a2: T[] | ArrayLike<T>,
  itemsEqual?: (a: T, b: T) => boolean
): boolean => {
  if (a1 === a2) return true;

  if (a1.length !== a2.length) return false;

  if (itemsEqual != null) {
    for (let i = 0, l = a1.length; i < l; i += 1) {
      if (!itemsEqual(a1[i], a2[i])) return false;
    }
  } else {
    for (let i = 0, l = a1.length; i < l; i += 1) {
      if (a1[i] !== a2[i]) return false;
    }
  }

  return true;
};

export const dedup = <T>(arr: T[], toId: (item: T) => KeyType) => {
  if (arr.length <= 1) return arr.slice();

  const ids: Record<string, 1> = {};
  return arr.filter((item) => {
    const id = toId(item);
    if (ids[id as string] === 1) return false;
    ids[id as string] = 1;
    return true;
  });
};

export const dedupKeys = <T extends KeyType>(arr: T[]) => {
  if (arr.length <= 1) return arr.slice();

  const ids: Record<string, 1> = {};
  return arr.filter((item) => {
    if (ids[item as string] === 1) return false;
    ids[item as string] = 1;
    return true;
  });
};

export const findLast = <T>(
  arr: T[],
  predicate: (item: T, index: number, list: T[]) => any
) => {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const item = arr[i];
    if (predicate(item, i, arr)) {
      return item;
    }
  }
  return undefined;
};

export const findLastIndex = <T>(
  arr: T[],
  predicate: (item: T, index: number, list: T[]) => any
) => {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const item = arr[i];
    if (predicate(item, i, arr)) {
      return i;
    }
  }
  return -1;
};

export const emptyToNull = <T>(arr: T[]): T[] | null =>
  arr.length ? arr : null;

export const moveItem = <T>(arr: T[], index: number, delta: number): T[] => {
  if (arr.length <= 1) return arr;

  let newIndex = index + delta;
  newIndex =
    newIndex <= 0 ? 0 : newIndex >= arr.length - 1 ? arr.length - 1 : newIndex;

  if (newIndex === index) return arr;

  const [item] = arr.splice(index, 1);
  arr.splice(newIndex, 0, item);

  return arr;
};

export const keysToMap = <T extends KeyType, V>(
  arr: T[] | ArrayLike<T>,
  val: V
): Record<string, V> => {
  const map: Record<string, V> = {};
  for (let i = 0, il = arr.length; i < il; i += 1) {
    map[arr[i] as string] = val;
  }
  return map;
};

export const arrayToMap = <T>(
  arr: T[] | ArrayLike<T>,
  getKey: (item: T) => string | number
): Record<string, T> => {
  const map: Record<string, T> = {};
  for (let i = 0, il = arr.length; i < il; i += 1) {
    const item = arr[i];
    map[getKey(item)] = item;
  }
  return map;
};

// a - b
export const keysSubtract = <T extends KeyType>(a: T[], b: T[]): T[] => {
  if (!a.length || !b.length) return a.slice();
  const bMap = keysToMap(b, 1);
  return a.filter((x) => bMap[x as string] !== 1);
};

export const arraySubtract = <T>(
  a: T[],
  b: T[],
  getKey: (item: T) => string | number
): T[] => {
  if (!a.length || !b.length) return a.slice();
  const bMap = arrayToMap(b, getKey);
  return a.filter((x) => !(getKey(x) in bMap));
};

export const keysIntersection = <T extends KeyType>(a: T[], b: T[]): T[] => {
  if (!a.length || !b.length) return [];
  const bMap = keysToMap(b, 1);
  return a.filter((x) => bMap[x as string] === 1);
};

export const arrayIntersection = <T>(
  a: T[],
  b: T[],
  getKey: (item: T) => string | number
): T[] => {
  if (!a.length || !b.length) return [];
  const bMap = arrayToMap(b, getKey);
  return a.filter((x) => getKey(x) in bMap);
};

export const arrayToKeys = <T extends KeyType, V>(
  list: T[],
  map: (item: T, index: number, list: T[]) => V
): Record<string, V> => {
  const obj: Record<string, V> = {};
  for (let i = 0, il = list.length; i < il; i += 1) {
    const item = list[i];
    obj[item as string] = map(item, i, list);
  }
  return obj;
};

export const arrayMutate = <Out, T>(
  out: Out,
  arr: T[],
  mutate: (out: Out, item: T, index: number, list: T[]) => void
): Out => {
  for (let i = 0, il = arr.length; i < il; i += 1) {
    mutate(out, arr[i], i, arr);
  }
  return out;
};

export const arrayFindClosest = <T>(
  unsortedArr: T[],
  diff: (item: T) => number
): number => {
  const { length } = unsortedArr;
  if (length < 1) return -1;

  if (length === 1) return 0;

  let minDiff = Infinity;
  let minIndex = -1;
  for (let i = 0, il = unsortedArr.length; i < il; i += 1) {
    const d = Math.abs(diff(unsortedArr[i]));
    if (d < minDiff) {
      minDiff = d;
      minIndex = i;
    }
  }
  return minIndex;
};

// find closest to given target using binary search.
// Returns element closest to target in arr[]
// https://www.geeksforgeeks.org/find-closest-number-array/
export const arrayBinarySearchClosest = <T>(
  sortedArr: T[],
  diff: (item: T) => number // negative=search left, 0=match, positive=search right
): number => {
  const { length } = sortedArr;
  if (length < 1) return -1;

  if (length === 1) return 0;

  // Corner cases
  if (diff(sortedArr[0]) <= 0) return 0;

  const lastIndex = length - 1;
  if (diff(sortedArr[lastIndex]) >= 0) return lastIndex;

  // Doing binary search
  let low = 0,
    high = length,
    mid = 0;
  while (low <= high) {
    mid = Math.floor((low + high) / 2);

    const d = diff(sortedArr[mid]);
    if (d === 0) return mid;
    if (d < 0) {
      // search left
      high = mid - 1;
    } else {
      // search right
      low = mid + 1;
    }
  }

  return Math.abs(diff(sortedArr[low])) <= Math.abs(diff(sortedArr[high]))
    ? low
    : high;
};
