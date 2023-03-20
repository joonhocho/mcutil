import type { KeyOf } from '../types/types.js';

export class InvalidPropertyValueError extends Error {
  constructor(key: string, value: any) {
    super(`Invalid value for ${String(key)}`);
  }
}

export class ComputeGraphNode<
  Struct,
  Key extends KeyOf<Struct> = KeyOf<Struct>
> {
  changed = false;
  checked = true;
  value!: Struct[Key];

  constructor(
    public nodeMap: Record<KeyOf<Struct>, ComputeGraphNode<Struct>>,
    public key: Key,
    public invalidates: Array<KeyOf<Struct>> = [],
    public getter?: (obj: Struct) => Struct[Key],
    public setter?: (value: Struct[Key], obj: Partial<Struct>) => void,
    public normalize?: (
      nextVal: Struct[Key],
      prevVal: Struct[Key],
      obj: Struct
    ) => Struct[Key],
    public valid?: (a: Struct[Key], obj: Struct) => boolean,
    public equals?: (a: Struct[Key], b: Struct[Key]) => boolean
  ) {}

  clone(): ComputeGraphNode<Struct, Key> {
    return new ComputeGraphNode<Struct, Key>(
      this.nodeMap,
      this.key,
      this.invalidates.slice(),
      this.getter,
      this.setter,
      this.normalize,
      this.valid,
      this.equals
    );
  }

  reset(value: Struct[Key]) {
    this.changed = false;
    this.checked = true;
    this.value = value;
  }

  check(next: Struct, thisArg: any) {
    if (this.checked) return;
    this.checked = true;

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

    this.changed = nextVal !== prevVal;
    if (!this.changed) return;

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

      this.changed = nextVal !== prevVal;
      if (!this.changed) return;
    }

    if (this.valid != null && !this.valid.call(this, nextVal, next)) {
      throw new InvalidPropertyValueError(key, nextVal);
    }

    if (this.equals != null && prevVal !== undefined) {
      this.changed = !this.equals.call(thisArg, nextVal, prevVal);
      if (!this.changed) return;
    }

    // changed
    if (this.setter != null) {
      this.setter.call(thisArg, nextVal, next);
    }

    const { invalidates } = this;
    if (invalidates.length) {
      const { nodeMap } = this;

      for (let i = 0, il = invalidates.length; i < il; i += 1) {
        nodeMap[invalidates[i]].checked = false;
      }

      for (let i = 0, il = invalidates.length; i < il; i += 1) {
        nodeMap[invalidates[i]].check(next, thisArg);
      }
    }
  }
}
