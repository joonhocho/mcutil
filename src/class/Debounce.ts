import type { AnyFunction } from '../types/types.js';
import { Timer } from './Timer.js';

const noop = () => {};

export class Debounce<T extends AnyFunction> {
  constructor(public fn: T, public delay: number, public thisArg?: any) {}

  protected _timer = new Timer();
  protected _args: Parameters<T> | null = null;

  destroy(): void {
    this._args = null;
    this._timer.destroy();
    this.fn = noop as T;
  }

  debounced = (...args: Parameters<T>): void => {
    this.cancel();
    this._args = args;
    this._timer.set(this.flush, this.delay);
  };

  cancel(): void {
    this._args = null;
    this._timer.clear();
  }

  flush = (): ReturnType<T> | void => {
    const { _args } = this;
    if (_args != null) {
      this.cancel();
      return this.fn.apply(this.thisArg, _args);
    }
  };
}
