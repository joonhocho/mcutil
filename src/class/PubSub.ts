export const PUBSUB_BREAK = {};

export type PubSubHandler<Params extends any[]> = (
  ...args: Params
) => typeof PUBSUB_BREAK | void;

export class PubSub<Params extends any[]> {
  protected cbs: Array<PubSubHandler<Params>> = [];

  on(fn: PubSubHandler<Params>): () => void {
    // ! immutable prevents callbacks to be mutated in the middle of emit
    this.cbs = this.cbs.concat(fn);

    let offed = false;

    return () => {
      if (offed) return;
      offed = true;
      this.off(fn);
      fn = null as any; // free memory just in case
    };
  }

  off(fn: PubSubHandler<Params>): void {
    // ! immutable prevents callbacks to be mutated in the middle of emit
    this.cbs = this.cbs.filter((x) => x !== fn);
  }

  once(fn: PubSubHandler<Params>): () => void {
    let wrapped: PubSubHandler<Params> | null = (...args: Params) => {
      if (!wrapped) return;

      this.off(wrapped);
      wrapped = null;

      const res = fn(...args);
      fn = null as any; // free memory just in case

      return res;
    };

    return this.on(wrapped);
  }

  clear(): void {
    this.cbs = [];
  }

  destroy() {
    this.clear();
  }

  emit(...args: Params): Params {
    const { cbs } = this;
    for (let i = 0, l = cbs.length; i < l; i += 1) {
      if (cbs[i](...args) === PUBSUB_BREAK) break;
    }
    return args;
  }
}
