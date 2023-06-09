export type Primitive = undefined | null | boolean | number | bigint | string;

export type KeyType = Primitive;

export type TypeOfReturn =
  | 'undefined'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'string'
  | 'symbol'
  | 'object'
  | 'function';

export type KeyOf<T> = keyof T & string;

export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any;
};

export type KeyOfExcludeType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? never : P]: any;
};

export type AnyFunction = (...args: any[]) => any;

export type VoidFunction = () => void;

export type VoidFn = VoidFunction;

export type PromiseReturnType<T extends PromiseLike<T>> = T extends
  | Promise<infer Return>
  | PromiseLike<infer Return>
  ? Return
  : T;

export type ItemType<T extends any[]> = T extends Array<infer Item>
  ? Item
  : never;

export interface IPoint {
  x: number;
  y: number;
}

export type ThisArg<F extends AnyFunction> = F extends (
  this: infer T,
  ...any: any[]
) => any
  ? T
  : never;

export type WithRequiredProps<T, Key extends keyof T> = T & {
  [P in Key]-?: T[P];
};

export type WithOptionalProps<T, Key extends keyof T> = Partial<T> & {
  [P in Exclude<keyof T, Key>]: T[P];
};

export interface IEmptyInterface {}
