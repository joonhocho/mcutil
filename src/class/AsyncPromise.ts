const noop = () => {};

export const isPromiseLike = <T>(x: unknown): x is PromiseLike<T> => {
  if (x == null) return false;

  if (x instanceof Promise) return true;

  const xp = x as PromiseLike<T>;
  return typeof xp.then === 'function';
};

export type PromiseState = 'pending' | 'resolved' | 'rejected';

export class AsyncPromise<T> implements PromiseLike<T> {
  protected p: Promise<T>;
  protected res!: (value: T | PromiseLike<T>) => void;
  protected rej!: (reason?: any) => void;

  state: PromiseState = 'pending';
  value?: T;
  reason?: any;

  constructor() {
    this.p = new Promise((resolve, reject): void => {
      this.res = resolve;
      this.rej = reject;
    });
  }

  destroy(): void {
    this.p = undefined as any;
    this.value = undefined;
    this.resolve = this.reject = noop;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.p.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<T | TResult> {
    return this.p.catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.p.finally(onfinally);
  }

  resolve(value: T | PromiseLike<T>): void {
    if (this.state === 'pending') {
      if (isPromiseLike(value)) {
        value.then(
          (v) => this.resolve(v),
          (r) => this.reject(r)
        );
      } else {
        const resolve = this.res;
        this.res = this.rej = noop;
        this.state = 'resolved';
        this.value = value;
        resolve(value);
      }
    }
  }

  reject(reason?: any): void {
    if (this.state === 'pending') {
      const reject = this.rej;
      this.res = this.rej = noop;
      this.state = 'rejected';
      this.reason = reason;
      reject(reason);
    }
  }
}
