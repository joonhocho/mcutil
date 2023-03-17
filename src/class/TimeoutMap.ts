import { removeItem } from '../array.js';

export type Timeout = NodeJS.Timeout;

export class TimeoutMap {
  protected _map: Map<string, Timeout[]> = new Map();

  destroy() {
    this.clearAll();
  }

  add(key: string, fn: VoidFunction, delay: number): Timeout {
    const timeout = setTimeout(() => {
      this.remove(key, timeout);
      fn();
    }, delay);

    const { _map } = this;
    const list = _map.get(key);
    if (list) {
      list.push(timeout);
    } else {
      _map.set(key, [timeout]);
    }

    return timeout;
  }

  set(key: string, fn: VoidFunction, delay: number): Timeout {
    this.clear(key);
    return this.add(key, fn, delay);
  }

  remove(key: string, timeout: Timeout): void {
    const timeouts = this._map.get(key);
    if (timeouts?.length) {
      removeItem(timeouts, timeout);
    }
  }

  clear(key: string, timeout?: Timeout): void {
    if (timeout) {
      clearTimeout(timeout);
      this.remove(key, timeout);
    } else {
      const timeouts = this._map.get(key);
      if (timeouts?.length) {
        timeouts.forEach((timeout) => clearTimeout(timeout));
        timeouts.length = 0;
      }
    }
  }

  clearAll(): void {
    this._map.forEach((fns) => fns.forEach((timeout) => clearTimeout(timeout)));
    this._map.clear();
  }
}
