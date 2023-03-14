import { PubSub } from './PubSub.js';

export interface IValueOptions<T> {
  valid?: (x: T) => boolean;
  equal?: (a: T, b: T) => boolean;
  normalize?: (x: T) => T;
}

export class Value<T> extends PubSub<[T, T]> {
  valid?: (x: T) => boolean;
  equal?: (a: T, b: T) => boolean;
  normalize?: (x: T) => T;

  protected _unsubs?: Array<[() => void, Value<any>]>;

  constructor(
    private _v: T,
    { valid, equal, normalize }: IValueOptions<T> = {}
  ) {
    if (valid != null && !valid(_v)) {
      throw new Error(`invalid value = ${JSON.stringify(_v, null, 2)}`);
    }
    super();
    this.valid = valid;
    this.equal = equal;
    this.normalize = normalize;
  }

  get value() {
    return this._v;
  }

  set value(v: T) {
    this.set(v);
  }

  destroy() {
    this._unsubs?.forEach(([off]) => off());
    this._unsubs = undefined;
    super.destroy();
  }

  unsubAll() {
    this._unsubs?.forEach(([off]) => off());
  }

  subTo<U>(val: Value<U>, map?: (v: U) => T) {
    const fn = map
      ? (x: U) => this.set(map(x))
      : (v: U) => this.set(v as unknown as T);

    const off = val.on(fn);

    (this._unsubs || (this._unsubs = [])).push([off, val]);

    fn(val.value);

    return off;
  }

  unsubFrom(val: Value<T>) {
    const index = this._unsubs
      ? this._unsubs.findIndex((x) => x[1] === val)
      : -1;
    if (index !== -1) {
      const [[off]] = this._unsubs!.splice(index, 1);
      off();
    }
  }

  get(): T {
    return this._v;
  }

  set(v: T): void {
    const prev = this._v;

    // strict equal || both NaN
    if (
      v === prev ||
      // eslint-disable-next-line no-self-compare
      (v !== v && prev !== prev)
    ) {
      return;
    }

    if (this.normalize != null) {
      v = this.normalize(v);
    }

    if (v === prev || (this.equal != null && this.equal(v, prev))) {
      return;
    }

    if (this.valid != null && !this.valid(v)) {
      throw new Error(`invalid value = ${JSON.stringify(v, null, 2)}`);
    }

    this._v = v;

    const { cbs } = this;
    for (let i = 0, l = cbs.length; i < l; i += 1) {
      cbs[i](v, prev);

      if (v !== this._v) {
        // value changed during callback
        // stop event to prevent calling callbacks with old values
        console.debug('value changed during callback', v, this._v);
        return;
      }
    }
  }

  update(updater: (prev: T) => T): void {
    return this.set(updater(this._v));
  }
}
