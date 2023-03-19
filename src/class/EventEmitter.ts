import { funcOnce } from '../fn.js';
import { KeyOf } from '../types/types.js';

export const EVENTEMITTER_BREAK = {};

export interface IEventMap {
  [x: string]: any[];
}

export type EventEmitterHandler<Params extends any[]> = (
  ...args: Params
) => typeof EVENTEMITTER_BREAK | void;

export class EventEmitter<EventMap extends IEventMap> {
  protected _map = new Map<
    KeyOf<EventMap>,
    Array<EventEmitterHandler<EventMap[any]>>
  >();

  on<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): () => void {
    // ! immutable prevents callbacks to be mutated in the middle of emit
    const { _map } = this;
    const list = _map.get(type);
    _map.set(type, list?.length ? list.concat(fn) : [fn]);

    return funcOnce(() => this.off(type, fn));
  }

  off<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): void {
    // ! immutable prevents callbacks to be mutated in the middle of emit
    const { _map } = this;
    const list = _map.get(type);
    if (list?.length) {
      _map.set(
        type,
        list.filter((x) => x !== fn)
      );
    }
  }

  once<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): () => void {
    let wrapped: EventEmitterHandler<EventMap[Type]> | null = (
      ...args: EventMap[Type]
    ) => {
      if (!wrapped) return;

      this.off(type, wrapped);
      wrapped = null;

      const cacheFn = fn;
      fn = null as any; // free memory just in case
      return cacheFn(...args);
    };

    return this.on(type, wrapped);
  }

  clear(): void {
    this._map.clear();
  }

  destroy() {
    this.clear();
  }

  emit<Type extends KeyOf<EventMap>>(
    type: Type,
    ...args: EventMap[Type]
  ): EventMap[Type] {
    const cbs = this._map.get(type);
    if (cbs?.length) {
      for (let i = 0, l = cbs.length; i < l; i += 1) {
        if (cbs[i](...args) === EVENTEMITTER_BREAK) break;
      }
    }
    return args;
  }
}
