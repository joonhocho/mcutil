import { arraysEqual, removeItem } from '../array.js';

export class Array2<T> extends Array<T> {
  get first(): T | undefined {
    return this[0];
  }

  get last(): T | undefined {
    return this[this.length - 1];
  }

  equals(arr: Array<T>): boolean {
    return arraysEqual(this, arr);
  }

  remove(item: T): number {
    return removeItem(this, item);
  }

  removeAt(index: number): T | undefined {
    if (index < this.length) {
      return this.splice(index, 1)[0];
    }
    return undefined;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  empty(): void {
    this.length = 0;
  }
}
