import { useEffect, useState } from 'react';

import type {
  KeyWatcher,
  SelectWatcherInfo,
  SmartState,
  StateWatcher,
} from '../class/SmartState.js';

import type { KeyOf } from '../types/types.js';

export const useSmartState = <
  Props extends object,
  Keys extends KeyOf<Props> = KeyOf<Props>,
  ComputedKeys extends KeyOf<Props> = never,
  Methods extends object = object,
  Config extends object = object
>(
  state: SmartState<Props, ComputedKeys, Methods, Config>,
  keys: Keys[],
  deps: any[] = [state]
): Pick<Props, Keys> => {
  const [value, setValue] = useState(() => state.$get(keys));

  useEffect(() => {
    setValue(state.$get(keys)); // ! necessary since value may have changed since init
    return state.$on(keys, (nextState, prevState) => {
      setValue(nextState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};

export const useSmartStateEffect = <
  Props extends object,
  ComputedKeys extends KeyOf<Props> = never,
  Methods extends object = object,
  Config extends object = object
>(
  state: SmartState<Props, ComputedKeys, Methods, Config>,
  keys: Array<KeyOf<Props>> | undefined = undefined,
  watcher: StateWatcher<Props>,
  deps: any[] = [state]
): void =>
  useEffect(
    () => state.$on(keys, watcher),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

export const useSmartStateKey = <
  Props extends object,
  Key extends KeyOf<Props>,
  ComputedKeys extends KeyOf<Props> = never,
  Methods extends object = object,
  Config extends object = object
>(
  state: SmartState<Props, ComputedKeys, Methods, Config>,
  key: Key,
  deps: any[] = [state, key]
): Props[Key] => {
  const [value, setValue] = useState(() => state.$getKey(key));

  useEffect(() => {
    const v = state.$getKey(key);
    setValue(typeof v === 'function' ? () => v : v); // ! necessary since value may have changed since init

    return state.$onKey(key, (next) =>
      setValue(typeof next === 'function' ? () => next : next)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};

export const useSmartStateKeyEffect = <
  Props extends object,
  Key extends KeyOf<Props>,
  ComputedKeys extends KeyOf<Props> = never,
  Methods extends object = object,
  Config extends object = object
>(
  state: SmartState<Props, ComputedKeys, Methods, Config>,
  key: Key,
  watcher: KeyWatcher<Props, Key>,
  deps: any[] = [state, key]
): void =>
  useEffect(
    () => state.$onKey(key, watcher),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

export const useSmartStateKeyMaybe = <
  Props extends object,
  Key extends KeyOf<Props>,
  ComputedKeys extends KeyOf<Props> = never,
  Methods extends object = object,
  Config extends object = object
>(
  state: SmartState<Props, ComputedKeys, Methods, Config> | null | undefined,
  key: Key,
  deps: any[] = [state, key]
): Props[Key] | undefined => {
  const [value, setValue] = useState(() => state?.$getKey(key));

  useEffect(() => {
    const v = state?.$getKey(key);
    setValue(typeof v === 'function' ? () => v : v); // ! necessary since value may have changed since init

    return state?.$onKey(key, (next) =>
      setValue(typeof next === 'function' ? () => next : next)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};

export const useSelectSmartState = <
  Mapped,
  Props extends object,
  Keys extends KeyOf<Props> = KeyOf<Props>,
  ComputedKeys extends KeyOf<Props> = never,
  Methods extends object = object,
  Config extends object = object
>(
  state: SmartState<Props, ComputedKeys, Methods, Config>,
  keys: Keys[],
  select: SelectWatcherInfo<
    Props,
    ComputedKeys,
    Methods,
    Config,
    Mapped
  >['select'],
  options?: Omit<
    SelectWatcherInfo<Props, ComputedKeys, Methods, Config, Mapped>,
    'keys' | 'select' | 'watcher'
  >,
  deps: any[] = [state]
): Mapped => {
  const [value, setValue] = useState(() => state.$select(select));

  useEffect(() => {
    const v = state.$select(select);
    setValue(typeof v === 'function' ? () => v : v); // ! necessary since value may have changed since init

    return state.$onSelect(
      keys,
      select,
      (next) => setValue(typeof next === 'function' ? () => next : next),
      options
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
};
