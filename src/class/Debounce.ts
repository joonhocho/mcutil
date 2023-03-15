import type { AnyFunction } from '../types/types.js';

const noop = () => {};

export class Debounce<T extends AnyFunction> {
  constructor(public fn: T, public delay: number, public thisArg?: any) {}

  protected _timer: NodeJS.Timeout | null = null;
  protected _args: Parameters<T> | null = null;

  destroy(): void {
    this.cancel();
    this.fn = noop as any;
  }

  debounced = (...args: Parameters<T>): void => {
    this.cancel();
    this._args = args;
    this._timer = setTimeout(this.flush, this.delay);
  };

  cancel(): void {
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = this._args = null;
    }
  }

  flush = (): ReturnType<T> | void => {
    const { _args } = this;
    if (_args != null) {
      this.cancel();
      return this.fn.apply(this.thisArg, _args);
    }
  };
}
