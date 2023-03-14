import { KeyOf } from '../types/types.js';

export const EVENTEMITTER_BREAK = {};

export interface IEventMap {
  [x: string]: any[];
}

export type EventEmitterHandler<Params extends any[]> = (
  ...args: Params
) => typeof EVENTEMITTER_BREAK | void;

export class EventEmitter<EventMap extends IEventMap> {
  protected cbs: {
    [Type in KeyOf<EventMap>]?: Array<EventEmitterHandler<EventMap[Type]>>;
  } = {};

  on<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): () => void {
    // ! immutable prevents callbacks to be mutated in the middle of emit
    this.cbs[type] = (this.cbs[type] || []).concat(fn);

    let offed = false;

    return () => {
      if (offed) return;
      offed = true;
      this.off(type, fn);
      fn = null as any; // free memory just in case
    };
  }

  off<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): void {
    // ! immutable prevents callbacks to be mutated in the middle of emit
    this.cbs[type] = (this.cbs[type] || []).filter((x) => x !== fn);
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

      const res = fn(...args);
      fn = null as any; // free memory just in case

      return res;
    };

    return this.on(type, wrapped);
  }

  clear(): void {
    this.cbs = {};
  }

  destroy() {
    this.clear();
  }

  emit<Type extends KeyOf<EventMap>>(
    type: Type,
    ...args: EventMap[Type]
  ): EventMap[Type] {
    const cbs = this.cbs[type];
    if (cbs?.length) {
      for (let i = 0, l = cbs.length; i < l; i += 1) {
        if (cbs[i](...args) === EVENTEMITTER_BREAK) break;
      }
    }
    return args;
  }
}
