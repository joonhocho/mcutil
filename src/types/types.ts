export type KeyOf<T> = keyof T & string;

export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any;
};

export type KeyOfExcludeType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? never : P]: any;
};

export type AnyFunction = (...args: any[]) => any;

export interface IPoint {
  x: number;
  y: number;
}

export type VoidFunction = () => void;
export type VoidFn = VoidFunction;

export type KeyType = string | number | boolean | null | undefined;
