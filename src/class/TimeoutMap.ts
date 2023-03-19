import { removeItem } from '../array.js';

export type Timeout = NodeJS.Timeout;

export class TimeoutMap<Keys extends string = string> {
  protected _map: Map<Keys, Timeout[]> = new Map();

  destroy() {
    this.clearAll();
  }

  has(key: Keys): boolean {
    return !!this._map.get(key)?.length;
  }

  add(key: Keys, fn: VoidFunction, delay: number): Timeout {
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

  set(key: Keys, fn: VoidFunction, delay: number): Timeout {
    this.clear(key);
    return this.add(key, fn, delay);
  }

  remove(key: Keys, timeout: Timeout): void {
    const timeouts = this._map.get(key);
    if (timeouts?.length) {
      removeItem(timeouts, timeout);
    }
  }

  clear(key: Keys, timeout?: Timeout): void {
    if (timeout) {
      clearTimeout(timeout);
      this.remove(key, timeout);
    } else {
      const timeouts = this._map.get(key);
      if (timeouts?.length) {
        for (let ti = 0, tl = timeouts.length; ti < tl; ti += 1) {
          clearTimeout(timeouts[ti]);
        }
        timeouts.length = 0;
      }
    }
  }

  clearAll(): void {
    const { _map } = this;
    for (let entry of _map) {
      const timeouts = entry[1];
      for (let ti = 0, tl = timeouts.length; ti < tl; ti += 1) {
        clearTimeout(timeouts[ti]);
      }
      timeouts.length = 0;
    }
    _map.clear();
  }
}
