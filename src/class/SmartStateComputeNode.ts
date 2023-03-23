import type { KeyOf } from '../types/types.js';
import { UNSET_VALUE, UnsetValue } from './UnsetValue.js';

export class InvalidPropertyValueError extends Error {
  constructor(key: string, value: any) {
    super(`Invalid value for ${String(key)}`);
  }
}

export interface ISmartStateComputeNode<T> {
  clone(): ISmartStateComputeNode<T>;
  // returns dirty keys, true = all dependers, false = none
  run(next: T, prev: T, thisArg: any): Array<KeyOf<T>> | boolean;
}

export class SmartStateComputeNode<T> implements ISmartStateComputeNode<T> {
  constructor(
    public update: (update: Partial<T>, next: T, prev: T) => void // changed
  ) {}

  clone(): SmartStateComputeNode<T> {
    return new SmartStateComputeNode<T>(this.update);
  }

  // returns dirty keys, true = all dependers, false = none
  run(next: T, prev: T, thisArg: any): Array<KeyOf<T>> | boolean {
    const update: Partial<T> = {};

    this.update.call(thisArg, update, next, prev);

    const updateKeys: Array<KeyOf<T>> = [];
    for (let uKey in update) {
      if (update[uKey] !== next[uKey]) {
        next[uKey] = update[uKey]!;
        updateKeys.push(uKey);
      }
    }
    return updateKeys;
  }
}

export interface ISmartStateKeyComputeNodeConfig<
  T,
  Key extends KeyOf<T> = KeyOf<T>
> {
  get?: (obj: T) => T[Key];
  set?: (update: Partial<T>, value: T[Key], obj: Partial<T>) => void;
  update?: (update: Partial<T>, next: T, prev: T) => void; // changed
  normalize?: (nextVal: T[Key], prevVal: T[Key], obj: T) => T[Key];
  valid?: (a: T[Key], obj: T) => boolean;
  equals?: (a: T[Key], b: T[Key]) => boolean;
}

export class SmartStateKeyComputeNode<T, Key extends KeyOf<T> = KeyOf<T>>
  implements ISmartStateComputeNode<T>
{
  unchanged = true;
  prevValue: T[Key] | UnsetValue = UNSET_VALUE;

  public get?: (obj: T) => T[Key];
  public set?: (update: Partial<T>, value: T[Key], obj: Partial<T>) => void;
  public update?: (update: Partial<T>, next: T, prev: T) => void; // changed
  public normalize?: (nextVal: T[Key], prevVal: T[Key], obj: T) => T[Key];
  public valid?: (a: T[Key], obj: T) => boolean;
  public equals?: (a: T[Key], b: T[Key]) => boolean;

  constructor(
    public key: Key,
    public config: ISmartStateKeyComputeNodeConfig<T, Key>
  ) {
    this.get = config.get;
    this.set = config.set;
    this.update = config.update;
    this.normalize = config.normalize;
    this.valid = config.valid;
    this.equals = config.equals;
  }

  clone(): SmartStateKeyComputeNode<T, Key> {
    return new SmartStateKeyComputeNode<T, Key>(this.key, this.config);
  }

  // returns unchanged
  run(next: T, prev: T, thisArg: any): Array<KeyOf<T>> | boolean {
    const { key } = this;

    let { prevValue } = this;
    if (prevValue instanceof UnsetValue) {
      prevValue = prev[key];
    }

    // get
    let nextValue: T[Key];

    if (
      this.get == null ||
      next[key] !== prevValue // check if computed value is set directly
    ) {
      nextValue = this.prevValue = next[key];
    } else {
      nextValue = this.prevValue = next[key] = this.get.call(thisArg, next);
    }

    // check changed

    this.unchanged = nextValue === prevValue;
    if (this.unchanged) return false;

    if (this.normalize != null) {
      nextValue =
        this.prevValue =
        next[key] =
          this.normalize.call(
            thisArg,
            nextValue,
            prevValue === undefined ? nextValue : prevValue,
            next
          );

      this.unchanged = nextValue === prevValue;
      if (this.unchanged) return false;
    }

    if (this.valid != null && !this.valid.call(this, nextValue, next)) {
      throw new InvalidPropertyValueError(key, nextValue);
    }

    if (this.equals != null && prevValue !== undefined) {
      this.unchanged = !!this.equals.call(thisArg, nextValue, prevValue);
      if (this.unchanged) {
        this.prevValue = next[key] = prevValue;
        return false;
      }
    }

    //
    // changed
    //

    if (this.set == null && this.update == null) return true;

    const update: Partial<T> = {};

    if (this.set != null) {
      this.set.call(thisArg, update, nextValue, next);
    }

    if (this.update != null) {
      this.update.call(thisArg, update, next, prev);
    }

    const updateKeys: Array<KeyOf<T>> = [];
    for (let uKey in update) {
      if (update[uKey] !== next[uKey]) {
        next[uKey] = update[uKey]!;
        updateKeys.push(uKey);
      }
    }
    return updateKeys;
  }
}
