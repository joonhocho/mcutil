import debounce from 'lodash.debounce';
import { IValueOptions, Value } from '../class/Value.js';

import type { DebouncedFunc } from 'lodash';

export interface ILocalStorageItemConfig<T> extends IValueOptions<T> {
  initialValue: T;

  key: string;
  serialize: (data: T) => string;
  deserialize: (str: string) => T;

  noAutoLoad?: boolean;
  noAutoSave?: boolean;
  autoSaveDelay?: number;
}

export class LocalStorageItem<T> extends Value<T> {
  key: string;
  serialize: (data: T) => string;
  deserialize: (str: string) => T;

  saveDebounced: DebouncedFunc<VoidFunction>;

  constructor({
    key,
    serialize,
    deserialize,

    noAutoLoad,
    noAutoSave,
    autoSaveDelay = 0,

    initialValue,
    ...rest
  }: ILocalStorageItemConfig<T>) {
    super(initialValue, rest);

    this.key = key;
    this.serialize = serialize;
    this.deserialize = deserialize;

    this.saveDebounced = debounce(() => {
      this.save(this.value);
    }, autoSaveDelay);

    if (!noAutoSave) {
      this.on(this.saveDebounced);
    }

    if (initialValue == null) {
      if (!noAutoLoad) {
        const loaded = this.load();
        if (loaded != null) {
          this.value = loaded;
        }
      }
    } else {
      if (!noAutoSave) {
        this.saveDebounced();
      }
    }
  }

  destroy() {
    this.saveDebounced.flush();
    super.destroy();
  }

  save(item: T): boolean {
    try {
      localStorage.setItem(this.key, this.serialize(item));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  load(): T | null {
    try {
      this.saveDebounced.flush();

      const str = localStorage.getItem(this.key);
      return str == null ? null : this.deserialize(str);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  remove(): boolean {
    try {
      this.saveDebounced.flush();

      localStorage.removeItem(this.key);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
