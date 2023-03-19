export class CleanUpList {
  protected _list: VoidFunction[] = [];

  destroy() {
    this.clear();
  }

  get length(): number {
    return this._list.length;
  }

  add(fn: VoidFunction | VoidFunction[]): void {
    if (typeof fn === 'function') {
      this._list.push(fn);
    } else if (fn.length) {
      this._list.push(...fn);
    }
  }

  set(fn: VoidFunction | VoidFunction[]): void {
    this.clear();
    this.add(fn);
  }

  clear(): void {
    const { _list } = this;
    for (let i = 0, il = _list.length; i < il; i += 1) {
      _list[i]();
    }
    _list.length = 0;
  }
}
