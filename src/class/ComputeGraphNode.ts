import type { KeyOf } from '../types/types.js';

export class InvalidPropertyValueError extends Error {
  constructor(key: string, value: any) {
    super(`Invalid value for ${String(key)}`);
  }
}

export class ComputeGraphNode<T, Key extends KeyOf<T> = KeyOf<T>> {
  unchanged = true;
  dirty = false;
  value!: T[Key];

  constructor(
    public nodeMap: Record<KeyOf<T>, ComputeGraphNode<T>>,
    public key: Key,
    public invalidates: Array<KeyOf<T>> = [],
    public getter?: (obj: T) => T[Key],
    public setter?: (value: T[Key], obj: Partial<T>) => void,
    public normalize?: (nextVal: T[Key], prevVal: T[Key], obj: T) => T[Key],
    public valid?: (a: T[Key], obj: T) => boolean,
    public equals?: (a: T[Key], b: T[Key]) => boolean,
    public compute?: (next: T, thisArg: any) => void
  ) {}

  clone(): ComputeGraphNode<T, Key> {
    return new ComputeGraphNode<T, Key>(
      this.nodeMap,
      this.key,
      this.invalidates.slice(),
      this.getter,
      this.setter,
      this.normalize,
      this.valid,
      this.equals,
      this.compute
    );
  }

  reset(value: T[Key]) {
    this.unchanged = true;
    this.dirty = false;
    this.value = value;
  }

  // returns unchanged
  checkUnchanged(next: T, thisArg: any): boolean {
    // already clean
    if (!this.dirty) return true;

    // set clean
    this.dirty = false;

    const { key } = this;

    const prevVal = this.value;

    // get
    let nextVal = next[key];
    if (nextVal === prevVal && this.getter != null) {
      nextVal = this.value = next[key] = this.getter.call(thisArg, next);
    } else {
      this.value = nextVal;
    }

    // check changed

    this.unchanged = nextVal === prevVal;
    if (this.unchanged) return true;

    if (this.normalize != null) {
      nextVal =
        this.value =
        next[key] =
          this.normalize.call(
            thisArg,
            nextVal,
            prevVal === undefined ? nextVal : prevVal,
            next
          );

      this.unchanged = nextVal === prevVal;
      if (this.unchanged) return true;
    }

    if (this.valid != null && !this.valid.call(this, nextVal, next)) {
      throw new InvalidPropertyValueError(key, nextVal);
    }

    if (this.equals != null && prevVal !== undefined) {
      this.unchanged = !!this.equals.call(thisArg, nextVal, prevVal);
      if (this.unchanged) {
        this.value = next[key] = prevVal;
        return true;
      }
    }

    // changed
    if (this.setter != null) {
      this.setter.call(thisArg, nextVal, next);
    }

    return false;
  }

  checkDeep(next: T, thisArg: any): void {
    if (this.checkUnchanged(next, thisArg)) return;

    const { invalidates } = this;
    if (invalidates.length) {
      const { nodeMap } = this;

      for (let i = 0, il = invalidates.length; i < il; i += 1) {
        nodeMap[invalidates[i]].dirty = true;
      }

      for (let i = 0, il = invalidates.length; i < il; i += 1) {
        nodeMap[invalidates[i]].checkDeep(next, thisArg);
      }
    }
  }
}
