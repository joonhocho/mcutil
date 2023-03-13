export type Comparator<T> = (a: T, b: T) => number;

export type ComparisonOperator = '<' | '<=' | '==' | '>' | '>=' | '!=';

const defaultNumberComparator = (a: number, b: number) => a - b;

export class SortedArray<T> {
  protected _list: T[];
  protected _comparator?: Comparator<T>;

  constructor(list?: T[], comparator?: Comparator<T>, alreadySorted = false) {
    this._list = list?.length
      ? alreadySorted
        ? list.slice()
        : list.slice().sort(comparator || (defaultNumberComparator as any))
      : [];
    this._comparator = comparator;
  }

  destroy(): void {
    this._list.length = 0;
    this._comparator = undefined;
  }

  get array(): T[] {
    return this._list.slice();
  }

  set array(list: T[]) {
    this._list = list
      .slice()
      .sort(this._comparator || (defaultNumberComparator as any));
  }

  get length(): number {
    return this._list.length;
  }

  pop(): T | undefined {
    return this._list.pop();
  }

  shift(): T | undefined {
    return this._list.shift();
  }

  // comparator returning > 0 -> continue search right side
  // comparator returning < 0 -> continue search left side
  // comparator returning == 0 -> found match
  findIndex(customComparator: (a: T) => number): number {
    const { _list } = this;

    // In most languages, inner variable declaration makes the code slower.
    let left = 0;
    let right = _list.length - 1;
    let mid = 0;
    let ordering = 0;

    while (left <= right) {
      mid = ((left + right) / 2) >>> 0;

      ordering = customComparator(_list[mid]);
      if (ordering === 0) {
        return mid;
      }
      if (ordering < 0) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return -1;
  }

  findFirstIndex(customComparator: (a: T) => number): number {
    const index = this.findIndex(customComparator);
    if (index <= 0) return index;

    const { _list } = this;
    for (let i = index - 1; i >= 0; i -= 1) {
      if (customComparator(_list[i]) !== 0) {
        return i + 1;
      }
    }

    return 0;
  }

  findLastIndex(customComparator: (a: T) => number): number {
    const index = this.findIndex(customComparator);
    if (index === -1) return index;

    const { _list } = this;
    for (let i = index + 1, il = _list.length; i < il; i += 1) {
      if (customComparator(_list[i]) !== 0) {
        return i - 1;
      }
    }

    return _list.length - 1;
  }

  indexOf(item: T): number {
    const { _list, _comparator } = this;

    // In most languages, inner variable declaration makes the code slower.
    let left = 0;
    let right = _list.length - 1;
    let mid = 0;
    let ordering = 0;

    if (_comparator) {
      while (left <= right) {
        mid = ((left + right) / 2) >>> 0;

        ordering = item === _list[mid] ? 0 : _comparator(item, _list[mid]);

        if (ordering === 0) {
          return mid;
        }
        if (ordering < 0) {
          // item is left side of mid
          right = mid - 1;
        } else {
          // item is right side of mid
          left = mid + 1;
        }
      }
    } else {
      while (left <= right) {
        mid = ((left + right) / 2) >>> 0;
        ordering = (item as number) - (_list[mid] as number);

        if (ordering === 0) {
          return mid;
        }
        if (ordering < 0) {
          // item is left side of mid
          right = mid - 1;
        } else {
          // item is right side of mid
          left = mid + 1;
        }
      }
    }

    return -1;
  }

  firstIndexOf(item: T): number {
    const index = this.indexOf(item);
    if (index <= 0) return index;

    const { _list, _comparator } = this;
    if (_comparator) {
      for (let i = index - 1; i >= 0; i -= 1) {
        if ((item === _list[i] ? 0 : _comparator(item, _list[i])) !== 0) {
          return i + 1;
        }
      }
    } else {
      for (let i = index - 1; i >= 0; i -= 1) {
        if ((item as number) - (_list[i] as number) !== 0) {
          return i + 1;
        }
      }
    }

    return 0;
  }

  lastIndexOf(item: T): number {
    const index = this.indexOf(item);
    if (index === -1) return index;

    const { _list, _comparator } = this;
    if (_comparator) {
      for (let i = index + 1, il = _list.length; i < il; i += 1) {
        if ((item === _list[i] ? 0 : _comparator(item, _list[i])) !== 0) {
          return i - 1;
        }
      }
    } else {
      for (let i = index + 1, il = _list.length; i < il; i += 1) {
        if ((item as number) - (_list[i] as number) !== 0) {
          return i - 1;
        }
      }
    }

    return _list.length - 1;
  }

  insertOne(item: T, left = 0, right = this._list.length - 1): number {
    const { _list, _comparator } = this;

    // In most languages, inner variable declaration makes the code slower.
    let mid = 0;
    let ordering = 0;
    let pos = -1;

    if (_comparator) {
      while (left <= right) {
        mid = ((left + right) / 2) >>> 0;

        ordering = item === _list[mid] ? 0 : _comparator(item, _list[mid]);

        if (ordering === 0) {
          pos = mid;
          break;
        }
        if (ordering < 0) {
          // item is left side of mid
          right = mid - 1;
        } else {
          // item is right side of mid
          left = mid + 1;
        }
      }
    } else {
      while (left <= right) {
        mid = ((left + right) / 2) >>> 0;
        ordering = (item as number) - (_list[mid] as number);

        if (ordering === 0) {
          pos = mid;
          break;
        }
        if (ordering < 0) {
          // item is left side of mid
          right = mid - 1;
        } else {
          // item is right side of mid
          left = mid + 1;
        }
      }
    }

    if (pos === -1) {
      // if element was not found, left > right.
      pos = left;
    } else {
      // This assures that equal elements inserted after will be in a higher position in array.
      // They can be equal for comparison purposes, but different objects with different data.
      // Respecting the chronological order can be important for many applications.
      pos += 1;
      if (_comparator) {
        for (let il = _list.length; pos < il; pos += 1) {
          if ((item === _list[pos] ? 0 : _comparator(item, _list[pos])) !== 0) {
            break;
          }
        }
      } else {
        for (let il = _list.length; pos < il; pos += 1) {
          if ((item as number) - (_list[pos] as number) !== 0) {
            break;
          }
        }
      }
    }

    let index = _list.length;

    // Just to increase array size.
    _list.push(item);

    // Much faster. No need to elements swap.
    while (index > pos) {
      _list[index] = _list[--index];
    }

    // Set the new element on its correct position.
    _list[pos] = item;

    return pos;
  }

  insertMany(items: T[]): void {
    if (!items.length) return;

    let lastPos = -1;
    const { _comparator } = this;
    if (_comparator) {
      for (let i = 0, il = items.length; i < il; i += 1) {
        const item = items[i];
        if (i === 0) {
          lastPos = this.insertOne(item);
        } else {
          const order =
            item === items[i - 1] ? 0 : _comparator(item, items[i - 1]);
          if (order === 0) {
            this._list.splice(lastPos + 1, 0, item);
          } else if (order < 0) {
            lastPos = this.insertOne(item, undefined, lastPos - 1);
          } else {
            lastPos = this.insertOne(item, lastPos + 1);
          }
        }
      }
    } else {
      for (let i = 0, il = items.length; i < il; i += 1) {
        const item = items[i];
        if (i === 0) {
          lastPos = this.insertOne(item);
        } else {
          const order = (item as number) - (items[i - 1] as number);
          if (order === 0) {
            this._list.splice(lastPos + 1, 0, item);
          } else if (order < 0) {
            lastPos = this.insertOne(item, undefined, lastPos - 1);
          } else {
            lastPos = this.insertOne(item, lastPos + 1);
          }
        }
      }
    }
  }

  removeOne(item: T): number {
    const index = this.indexOf(item);
    if (index >= 0) {
      this._list.splice(index, 1);
    }
    return index;
  }

  removeFirst(item: T): number {
    const index = this.firstIndexOf(item);
    if (index >= 0) {
      this._list.splice(index, 1);
    }
    return index;
  }

  removeLast(item: T): number {
    const index = this.lastIndexOf(item);
    if (index >= 0) {
      this._list.splice(index, 1);
    }
    return index;
  }

  removeMany(items: T[]): void {
    if (!items.length) return;

    for (let i = 0, il = items.length; i < il; i += 1) {
      this.removeOne(items[i]);
    }
  }

  reverse(): SortedArray<T> {
    const { _comparator } = this;

    return new SortedArray(
      this._list.slice().reverse(),
      _comparator
        ? (a, b) => _comparator(b, a)
        : (a, b) => (b as number) - (a as number),
      true
    );
  }

  filterInPlace(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): void {
    this._list = this._list.filter(predicate, thisArg);
  }

  arraySlice(start?: number, end?: number): T[] {
    return this._list.slice(start, end);
  }

  every(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): boolean {
    return this._list.every(predicate, thisArg);
  }

  some(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): boolean {
    return this._list.some(predicate, thisArg);
  }

  forEach(
    callbackfn: (value: T, index: number, array: T[]) => void,
    thisArg?: any
  ): void {
    return this._list.forEach(callbackfn, thisArg);
  }

  map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U,
    thisArg?: any
  ): U[] {
    return this._list.map(callbackfn, thisArg);
  }
}
