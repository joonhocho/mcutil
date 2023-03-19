import { IValueOptions, Value } from './Value.js';

export type ToValue<T> = { [P in keyof T]: Value<T[P]> };

const getValue = <T>(x: Value<T>): T => x.value;

export class DerivedValue<T, Deps extends Array<any>> extends Value<T> {
  private _value?: Value<T>;
  private _off?: () => void;
  private _offs: Array<() => void>;

  constructor(
    public deps: ToValue<Deps>,
    public selector: (...args: Deps) => T | Value<T>,
    options?: IValueOptions<T>
  ) {
    const value = selector(...(deps.map(getValue) as Deps));

    super(value instanceof Value ? value.value : value, options);

    if (value instanceof Value) {
      this._value = value;
      this._off = value.on((v) => this.set(v));
    }

    this._offs = deps.map((x) => x.on(this.syncValue));
  }

  destroy(): void {
    if (this._value) {
      this._value = undefined;
    }

    if (this._off) {
      this._off();
      this._off = undefined;
    }

    const { _offs } = this;
    for (let i = 0, il = _offs.length; i < il; i += 1) {
      _offs[i]();
    }
    this._offs.length = 0;

    super.destroy();
  }

  syncValue = (): void => {
    const value = this.selector(...(this.deps.map(getValue) as Deps));
    if (value instanceof Value) {
      if (value !== this._value) {
        if (this._off) {
          this._off();
          this._off = undefined;
        }
        this._value = value;
        this._off = value.on((v) => this.set(v));
      }
      this.value = value.value;
    } else {
      if (this._off) {
        this._off();
        this._off = undefined;
      }
      this.value = value;
    }
  };
}
