import { arraysEqual } from '../array.js';

import type { AnyFunction, ThisArg } from '../types/types.js';

const noop = () => {};

export class Memoize<F extends AnyFunction> {
  protected _memo: {
    thisArg: ThisArg<F>;
    args: Parameters<F>;
    ret: ReturnType<F>;
  } | null = null;

  constructor(public fn: F) {}

  destroy(): void {
    this._memo = null;
    this.fn = noop as F;
  }

  set(thisArg: ThisArg<F>, args: Parameters<F>, ret: ReturnType<F>): void {
    this._memo = { thisArg, args, ret };
  }

  clear(): void {
    this._memo = null;
  }

  apply(thisArg: ThisArg<F>, args: Parameters<F>): ReturnType<F> {
    const { _memo } = this;
    if (
      _memo != null &&
      _memo.thisArg === thisArg &&
      arraysEqual(_memo.args, args)
    ) {
      return _memo.ret;
    }

    const ret = this.fn.apply(thisArg, args as Parameters<F>);
    this._memo = { thisArg, args, ret };

    return ret;
  }

  call(thisArg: ThisArg<F>, ...args: Parameters<F>): ReturnType<F> {
    const { _memo } = this;
    if (
      _memo != null &&
      _memo.thisArg === thisArg &&
      arraysEqual(_memo.args, args)
    ) {
      return _memo.ret;
    }

    const ret = this.fn.call(thisArg, ...args);
    this._memo = { thisArg, args, ret };

    return ret;
  }
}
