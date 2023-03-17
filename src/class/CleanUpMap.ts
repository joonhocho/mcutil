export class CleanUpMap {
  protected _map: Map<string, VoidFunction[]> = new Map();

  destroy() {
    this.clearAll();
  }

  add(key: string, fn: VoidFunction | VoidFunction[]): void {
    const fns = typeof fn === 'function' ? [fn] : fn.slice();
    if (!fns.length) return;

    const { _map } = this;
    const list = _map.get(key);
    if (list) {
      list.push(...fns);
    } else {
      _map.set(key, fns);
    }
  }

  set(key: string, fn: VoidFunction | VoidFunction[]): void {
    this.clear(key);
    this.add(key, fn);
  }

  clear(...keys: string[]): void {
    const { _map } = this;
    for (let ki = 0, kl = keys.length; ki < kl; ki += 1) {
      const key = keys[ki];
      const fns = _map.get(key);
      if (fns?.length) {
        fns.forEach((fn) => fn());
        fns.length = 0;
      }
    }
  }

  clearAll(): void {
    this._map.forEach((fns) => fns.forEach((fn) => fn()));
    this._map.clear();
  }
}
