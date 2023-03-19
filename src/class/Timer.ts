export type Timeout = NodeJS.Timeout;

export class Timer {
  protected _timer: Timeout | null = null;
  protected _fn: VoidFunction | null = null;

  constructor(fn?: VoidFunction, delay = 0) {
    if (fn != null) {
      this.set(fn, delay);
    }
  }

  destroy() {
    this.clear();
  }

  pending(): boolean {
    return this._timer != null;
  }

  set(fn: VoidFunction, delay: number): Timeout {
    this.clear();

    this._fn = fn;

    this._timer = setTimeout(() => {
      this._timer = this._fn = null;
      fn();
    }, delay);

    return this._timer;
  }

  clear(): void {
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = this._fn = null;
    }
  }

  flush(): void {
    const { _fn } = this;
    if (_fn != null) {
      this.clear();
      _fn();
    }
  }
}
