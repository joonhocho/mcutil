import { CleanUpMap } from './CleanUpMap.js';
import { IValueOptions, Value } from './Value.js';

export type ToValue<T> = { [P in keyof T]: Value<T[P]> };

const getValue = <T>(x: Value<T>): T => x.value;

export class DerivedValue<T, Deps extends Array<any>> extends Value<T> {
  protected _val?: Value<T>;
  protected _cleaup = new CleanUpMap();

  constructor(
    public deps: ToValue<Deps>,
    public selector: (...args: Deps) => T | Value<T>,
    options?: IValueOptions<T>
  ) {
    const value = selector(...(deps.map(getValue) as Deps));

    super(value instanceof Value ? value.value : value, options);

    if (value instanceof Value) {
      this._val = value;
      this._cleaup.set(
        'value',
        value.on((v) => this.set(v))
      );
    }

    this._cleaup.set(
      'deps',
      deps.map((x) => x.on(this.syncValue))
    );
  }

  destroy(): void {
    if (this._val) this._val = undefined;
    this._cleaup.destroy();
    super.destroy();
  }

  syncValue = (): void => {
    const value = this.selector(...(this.deps.map(getValue) as Deps));
    if (value instanceof Value) {
      if (value !== this._val) {
        this._val = value;
        this._cleaup.set(
          'value',
          value.on((v) => this.set(v))
        );
      }

      this.value = value.value;
    } else {
      this._cleaup.clear('value');
      this.value = value;
    }
  };
}
