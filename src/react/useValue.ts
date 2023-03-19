import { useEffect, useState } from 'react';
import { Value } from '../class/Value.js';

export const useValue = <T>(v: Value<T>, deps: any[] = [v]): T => {
  const [value, setValue] = useState(
    typeof v.value === 'function' ? () => v.value : v.value
  );

  useEffect(() => {
    setValue(typeof v.value === 'function' ? () => v.value : v.value); // ! necessary since value may have changed since init
    return v.on((x) => setValue(typeof x === 'function' ? () => x : x));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};

export const useValueMaybe = <T>(
  v: Value<T> | undefined,
  deps: any[] = [v]
): T | undefined => {
  const [value, setValue] = useState(
    typeof v?.value === 'function' ? () => v.value : v?.value
  );

  useEffect(() => {
    setValue(typeof v?.value === 'function' ? () => v.value : v?.value); // ! necessary since value may have changed since init
    return v?.on((x) => setValue(typeof x === 'function' ? () => x : x));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};

export const useValueListener = <T>(
  v: Value<T>,
  handler: (v: T, prev: T) => void,
  deps: any[] = [v]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useEffect(() => v.on(handler), deps);

export const useValueListeners = <T>(
  vs: Array<Value<T>>,
  handler: (v: T, prev: T) => void,
  deps: any[] = [vs]
) =>
  useEffect(() => {
    const offs = vs.map((v) => v.on(handler));

    return () => {
      for (let i = 0, il = offs.length; i < il; i += 1) {
        offs[i]();
      }
      offs.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

export const useValueMapping = <T, U>(
  v: Value<T>,
  mapper: (v: T) => U,
  deps: any[] = [v]
) => {
  const [value, setValue] = useState(() => mapper(v.value));

  useEffect(() => {
    setValue(mapper(v.value)); // ! necessary since value may have changed since init
    return v.on((x) => setValue(mapper(x)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};
