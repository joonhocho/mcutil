// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export class PubSub<Handler extends (...args: any[]) => any> {
  static STOP = {};

  protected cbs: Array<Handler> = [];

  on(fn: Handler): () => void {
    this.cbs = this.cbs.concat(fn);
    return () => this.off(fn);
  }

  off(fn: Handler): void {
    this.cbs = this.cbs.filter((x) => x !== fn);
  }

  once(fn: Handler): () => void {
    const off = this.on(((...args) => {
      off();
      return fn(...args);
    }) as Handler);
    return off;
  }

  clear(): void {
    this.cbs = [];
  }

  destroy() {
    this.clear();
  }

  emit(...args: Parameters<Handler>): void {
    const { cbs } = this;
    const { STOP } = PubSub;
    for (let i = 0, l = cbs.length; i < l; i += 1) {
      if (cbs[i](...args) === STOP) return;
    }
  }
}
