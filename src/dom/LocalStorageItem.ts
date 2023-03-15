import { Debounce } from '../class/Debounce.js';
import { IValueOptions, Value } from '../class/Value.js';

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

  saveDebounced: Debounce<VoidFunction>;

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

    this.saveDebounced = new Debounce(() => {
      this.save(this.value);
    }, autoSaveDelay);

    if (!noAutoSave) {
      this.on(this.saveDebounced.debounced);
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
        this.saveDebounced.debounced();
      }
    }
  }

  destroy() {
    this.saveDebounced.destroy();
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
