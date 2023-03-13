import { KeyOf } from './types/types.js';

export const objectEmpty = <T extends object>(obj: T): boolean => {
  for (let i in obj) return false;
  return true;
};

export const objectEmptyToNull = <T extends object>(obj: T): T | null => {
  for (let i in obj) return obj;
  return null;
};

export const objectKeys = <T extends object>(obj: T): Array<KeyOf<T>> =>
  Object.keys(obj) as Array<KeyOf<T>>;

export const objectHasOwn = (obj: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

export const objectOwnKeys = <T extends object>(obj: T): Array<KeyOf<T>> =>
  Object.getOwnPropertyNames(obj) as Array<KeyOf<T>>;

export const objectMap = <T extends object, U>(
  obj: T,
  fn: (value: T[KeyOf<T>], key: KeyOf<T>, obj: T) => U
): { [K in KeyOf<T>]: U } => {
  const dest = {} as { [K in KeyOf<T>]: U };
  const { hasOwnProperty } = Object.prototype;
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      dest[key] = fn(obj[key], key, obj);
    }
  }
  return dest;
};

export const objectShallowEqual = (
  a: object | null | undefined,
  b: object | null | undefined
): boolean => {
  if (a === b) return true;
  if (a == null) return b == null;
  if (b == null) return false;

  const aKeys = Object.getOwnPropertyNames(a) as Array<KeyOf<typeof a>>;
  const bKeys = Object.getOwnPropertyNames(b) as Array<KeyOf<typeof b>>;
  if (aKeys.length !== bKeys.length) return false;

  const { hasOwnProperty } = Object.prototype;
  for (let i = 0, l = aKeys.length; i < l; i += 1) {
    const key = aKeys[i];
    if (!hasOwnProperty.call(b, key) || a[key] !== b[key]) return false;
  }

  return true;
};

export const objectHasKeyOfValue = (
  obj: Record<string, unknown>,
  keys: string[],
  value: unknown
): boolean => {
  for (let i = 0, l = keys.length; i < l; i += 1) {
    if (obj[keys[i]] === value) return true;
  }
  return false;
};

export type JSValueType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function';

export const objectPick = <T extends object, K extends keyof T>(
  obj: T,
  keys: Array<K>
): Pick<T, K> => {
  const dest = {} as Pick<T, K>;
  for (let i = 0, il = keys.length; i < il; i += 1) {
    const key = keys[i];
    if (key in obj) {
      dest[key] = obj[key];
    }
  }
  return dest;
};

export const objectOmit = <T extends object, K extends keyof T>(
  obj: T,
  keys: Array<K>
): Omit<T, K> => {
  const dest = { ...obj };
  for (let i = 0, il = keys.length; i < il; i += 1) {
    delete dest[keys[i]];
  }
  return dest;
};

export const objectToArray = <T>(
  obj: T,
  filter: (value: T[KeyOf<T>], key: KeyOf<T>, obj: T) => unknown
): Array<T[KeyOf<T>]> => {
  const arr: Array<T[KeyOf<T>]> = [];
  for (const key in obj) {
    if (filter(obj[key], key, obj)) {
      arr.push(obj[key]);
    }
  }
  return arr;
};
