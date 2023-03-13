import { KeyType } from './types/types.js';

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

export const arraysEqual = <T>(
  a1: T[],
  a2: T[],
  itemsEqual?: (a: T, b: T) => boolean
): boolean => {
  if (a1 === a2) return true;

  if (a1.length !== a2.length) return false;

  if (itemsEqual) {
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
  arr: T[],
  val: V
): Record<string, V> => {
  const map: Record<string, V> = {};
  for (let i = 0, il = arr.length; i < il; i += 1) {
    map[arr[i] as string] = val;
  }
  return map;
};

export const arrayToMap = <T>(
  arr: T[],
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
