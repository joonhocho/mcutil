export class CleanUpMap {
  protected _map: Map<string, VoidFunction[]> = new Map();

  destroy() {
    this.clearAll();
  }

  add(key: string, fn: VoidFunction | VoidFunction[] | undefined | null): void {
    if (fn == null) return;

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

  set(key: string, fn: VoidFunction | VoidFunction[] | undefined | null): void {
    this.clear(key);
    this.add(key, fn);
  }

  clear(key: string): void {
    const { _map } = this;
    if (_map.has(key)) {
      _map.get(key)?.forEach((fn) => fn());
      _map.delete(key);
    }
  }

  clearAll(): void {
    this._map.forEach((fns) => fns.forEach((fn) => fn()));
    this._map.clear();
  }
}
