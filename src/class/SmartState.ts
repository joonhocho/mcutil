import {
  objectEmpty,
  objectHasKeyOfValue,
  objectKeys,
  objectMap,
} from '../object.js';
import { CleanUpMap } from './CleanUpMap.js';

import type { Value } from './Value.js';

import type { KeyOf, VoidFunction } from '../types/types.js';
export class PropertyNameConflictError extends Error {
  constructor(key: string) {
    super(`Property name conflict. name=${String(key)}`);
  }
}

export class InvalidPropertyValueError extends Error {
  constructor(key: string, value: any) {
    super(`Invalid value for ${String(key)}`);
  }
}

export class TooManyDirtyCheckIterationError extends Error {
  constructor() {
    super('Too many dirty check iterations');
  }
}

/*
atomic/reversable operations
undo/redo by reversing or reapplying operations
sync by applying operations
nested states: array/object
*/

export interface IStateOperation {
  type: string;
  timestamp: number;
  data: any;
}

export interface ISetMultiOperation<Props> extends IStateOperation {
  type: 'SET_MULTI';
  data: {
    prev: Partial<Props>;
    next: Partial<Props>;
  };
}

export type KeyWatcher<Props, Key extends KeyOf<Props>> = (
  next: Props[Key],
  prev: Props[Key],
  nextState: Props,
  prevState: Props
) => void;

export type StateWatcher<Props> = (nextState: Props, prevState: Props) => void;

export type WatcherInfo<Props> = {
  keys: Array<KeyOf<Props>>;
  watcher: KeyWatcher<Props, KeyOf<Props>> | StateWatcher<Props>;
  multiple: boolean;
};

export type SelectWatcherInfo<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface,
  Config extends IEmptyInterface,
  Mapped
> = {
  keys: Array<KeyOf<Props>>;
  select: (
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    nextState: Props,
    prevState: Props
  ) => Mapped;
  prev?: Mapped;
  normalize?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    next: Mapped,
    prev: Mapped | undefined
  ): Mapped;
  equals?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    a: Mapped,
    b: Mapped
  ): boolean;
  watcher: (
    next: Mapped,
    prev: Mapped,
    nextState: Props,
    prevState: Props
  ) => void;
};

export type Normalizer<T> = (val: T) => T;

export type Equal<T> = (a: T, b: T) => boolean;

export type DataType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'array'
  | 'function';

export interface IProperty<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface,
  Config extends IEmptyInterface,
  Key extends KeyOf<Props>
> {
  type: DataType | Function;
  item?: DataType | (() => Function);
  enumerable?: boolean;
  nullable?: boolean;
  willSet?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    next: Props[Key] | undefined,
    prev: Props[Key] | undefined,
    draft: Props
  ): void;
  didSet?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    next: Props[Key] | undefined,
    prev: Props[Key] | undefined,
    state: Props
  ): void;
  valid?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    val: unknown,
    draft: Props
  ): boolean;
  normalize?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    next: Props[Key],
    prev: Props[Key] | undefined,
    draft: Props
  ): Props[Key];
  equals?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    a: Props[Key],
    b: Props[Key]
  ): boolean;
  toJSON?:
    | ((
        this: SmartState<Props, ComputedKeys, Methods, Config>,
        val: Props[Key]
      ) => unknown)
    | false;
}

export interface IComputedProperty<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface,
  Config extends IEmptyInterface,
  Key extends ComputedKeys
> extends IProperty<Props, ComputedKeys, Methods, Config, Key> {
  deps: Array<Exclude<KeyOf<Props>, Key>>;
  get(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    state: Omit<Props, ComputedKeys> & Partial<Pick<Props, ComputedKeys>>
  ): Props[Key];
  set?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    val: Props[Key],
    draft: Omit<Props, ComputedKeys> & Partial<Pick<Props, ComputedKeys>>
  ): void;
}

export interface IDraftWatcher<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface,
  Config extends IEmptyInterface
> {
  deps: Array<KeyOf<Props>>;
  mutates: Array<KeyOf<Props>>;
  compute(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    nextState: Props,
    prevState: Props
  ): void;
}

export interface ISmartStateConfig<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface,
  Config extends IEmptyInterface,
  SuperPropKeys extends KeyOf<Props> = never
> {
  statics?: Record<string, any>;
  properties: {
    [Key in Exclude<KeyOf<Props>, ComputedKeys | SuperPropKeys>]: IProperty<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Key
    >;
  };
  computed: {
    [Key in Exclude<ComputedKeys, SuperPropKeys>]: IComputedProperty<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Key
    >;
  };
  drafts?: Array<IDraftWatcher<Props, ComputedKeys, Methods, Config>>;
}

export type SmartState<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface = IEmptyInterface,
  Config extends IEmptyInterface = IEmptyInterface
> = BaseSmartState<Props, ComputedKeys, Methods, Config> & Props & Methods;

export type SmartStateInitialState<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>
> = Omit<Props, ComputedKeys> & Partial<Pick<Props, ComputedKeys>>;

export interface SmartStateConstructor<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface = IEmptyInterface,
  Config extends IEmptyInterface = IEmptyInterface
> {
  new (
    initialState: SmartStateInitialState<Props, ComputedKeys>,
    config: Config
  ): SmartState<Props, ComputedKeys, Methods, Config>;
  prototype: SmartState<Props, ComputedKeys, Methods, Config>;
}

export class BaseSmartState<
  Props extends IEmptyInterface,
  ComputedKeys extends KeyOf<Props>,
  Methods extends IEmptyInterface = IEmptyInterface,
  Config extends IEmptyInterface = IEmptyInterface
> {
  static fromJSON = (json: any) =>
    new BaseSmartState<any, any, any, any>(json.state, json.config);

  $cleanup = new CleanUpMap();

  protected _state: Props;
  protected _draft: Props | null = null;

  protected _history: IStateOperation[] = [];
  protected _historyIndex = 0;
  protected _navigatingHistory = false;

  protected _maxIteration = 10;

  protected _watchers: Array<
    | WatcherInfo<Props>
    | SelectWatcherInfo<Props, ComputedKeys, Methods, Config, any>
  > = [];

  $config: Config;

  // Object.keys(_allProps)
  protected get _keys(): Array<KeyOf<Props>> {
    return [];
  }

  // Object.keys(_props)
  protected get _propKeys(): Array<Exclude<KeyOf<Props>, ComputedKeys>> {
    return [];
  }

  // Object.keys(_computed)
  protected get _computedKeys(): Array<ComputedKeys> {
    return [];
  }

  protected get _enumerableKeys(): Array<KeyOf<Props>> {
    return [];
  }

  protected get _toJSONKeys(): Array<KeyOf<Props>> {
    return [];
  }

  protected get _allProps(): {
    [Key in KeyOf<Props>]: Key extends ComputedKeys
      ? IComputedProperty<Props, ComputedKeys, Methods, Config, Key>
      : IProperty<Props, ComputedKeys, Methods, Config, Key>;
  } {
    return {} as any;
  }

  protected get _props(): {
    [Key in Exclude<KeyOf<Props>, ComputedKeys>]: IProperty<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Key
    >;
  } {
    return {} as any;
  }

  protected get _computed(): {
    [Key in ComputedKeys]: IComputedProperty<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Key
    >;
  } {
    return {} as any;
  }

  protected get _onDrafts(): Array<
    IDraftWatcher<Props, ComputedKeys, Methods, Config>
  > {
    return [];
  }

  constructor(
    initialState: SmartStateInitialState<Props, ComputedKeys>,
    config: Config
  ) {
    this.$config = config;

    const { _computedKeys, _computed } = this;

    const draft = { ...initialState };

    for (let i = 0, il = _computedKeys.length; i < il; i += 1) {
      const key = _computedKeys[i];
      draft[key] = _computed[key].get.call(this as any, draft);
    }

    for (let i = 0, il = _computedKeys.length; i < il; i += 1) {
      const key = _computedKeys[i];
      if (key in initialState) {
        _computed[key].set?.call(
          this as any,
          initialState[key] as Props[ComputedKeys],
          draft
        );
      }
    }

    this.$clearWatchers();

    this._state = {} as Props;

    this._draft = draft as Props;

    this._commitDraft();
  }

  $clearWatchers() {
    this._watchers = [];
  }

  $getState(): Props {
    return this._state;
  }

  $get<Key extends KeyOf<Props>>(keys = this._keys as Key[]): Pick<Props, Key> {
    const state = this._draft || this._state;
    const partial = {} as Pick<Props, Key>;
    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      partial[key] = state[key];
    }
    return partial;
  }

  $getKey<Key extends KeyOf<Props>>(key: Key): Props[Key] {
    return (this._draft || this._state)[key];
  }

  $set(nextState: Partial<Props>): void {
    const { _state } = this;
    if (_state === nextState || objectEmpty(nextState)) return;

    const hadDraft = this._draft != null;
    const _draft = this._draft || (this._draft = { ..._state });

    const { _keys } = this;
    for (let i = 0, il = _keys.length; i < il; i += 1) {
      const key = _keys[i];
      if (key in nextState) {
        _draft[key] = nextState[key]!;
      }
    }

    if (!hadDraft) {
      this._commitDraft();
    }
  }

  $setKey<Key extends KeyOf<Props>>(key: Key, val: Props[Key]): void {
    const { _state } = this;
    if (_state[key] === val) return;

    const hadDraft = this._draft != null;
    const _draft = this._draft || (this._draft = { ..._state });

    _draft[key] = val;

    if (!hadDraft) {
      this._commitDraft();
    }
  }

  $update(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    updater: (
      this: SmartState<Props, ComputedKeys, Methods, Config>,
      draft: Props
    ) => Partial<Props>
  ): void {
    return this.$set(updater.call(this, this._draft || this._state));
  }

  $updateKey<Key extends KeyOf<Props>>(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    key: Key,
    updater: (
      this: SmartState<Props, ComputedKeys, Methods, Config>,
      prev: Props[Key],
      state: Props
    ) => Props[Key]
  ): void {
    const state = this._draft || this._state;
    return this.$setKey(key, updater.call(this, state[key], state));
  }

  protected _normalizeProp<Key extends KeyOf<Props>>(
    _draft: Props,
    key: Key,
    prevVal: Props[Key] | undefined
  ): boolean {
    let nextVal = _draft[key];
    // unchanged
    if (nextVal === prevVal) return false;

    const { normalize, valid, equals } = this._allProps[key];
    if (typeof normalize === 'function') {
      nextVal = _draft[key] = normalize.call(
        this as any,
        nextVal as any,
        prevVal as any,
        _draft
      ) as typeof nextVal;

      // unchanged
      if (nextVal === prevVal) return false;
    }

    if (
      typeof valid === 'function' &&
      !valid.call(this as any, nextVal, _draft)
    ) {
      console.log(key, nextVal);
      throw new InvalidPropertyValueError(key, nextVal);
    }

    if (
      prevVal !== undefined &&
      nextVal !== undefined &&
      typeof equals === 'function' &&
      equals.call(this as any, nextVal as any, prevVal as any)
    ) {
      // unchanged
      _draft[key] = prevVal;
      return false;
    }

    return true;
  }

  protected _getDirtyKeys(
    draft: Props,
    prevDraft = this._state,
    keys: Array<KeyOf<Props>> = this._keys
  ) {
    const dirty: Partial<Record<KeyOf<Props>, 1 | undefined>> = {};
    const dirtyKeys: Array<KeyOf<Props>> = [];
    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      if (this._normalizeProp(draft, key, prevDraft[key])) {
        dirty[key] = 1;
        dirtyKeys.push(key);
      }
    }
    return { dirty, dirtyKeys };
  }

  protected _runWillSetAndCompute(prevState = this._state): boolean {
    const { _draft, _allProps, _onDrafts, _maxIteration } = this;
    if (_draft == null) {
      return false;
    }

    for (let i = 0, changed = false, prevDraft = prevState; true; i += 1) {
      if (i >= _maxIteration) {
        throw new TooManyDirtyCheckIterationError();
      }

      const { dirty, dirtyKeys } = this._getDirtyKeys(_draft, prevDraft);
      if (!dirtyKeys.length) {
        return changed;
      }

      changed = true;

      const pendingPrevDraft = { ..._draft };

      for (let j = 0, jl = dirtyKeys.length; j < jl; j += 1) {
        const key = dirtyKeys[j];
        const { willSet } = _allProps[key];
        if (typeof willSet === 'function') {
          willSet.call(
            this as any,
            _draft[key] as any,
            prevDraft[key] as any,
            _draft
          );
        }
      }

      for (let j = 0, jl = _onDrafts.length; j < jl; j += 1) {
        const {
          deps,
          compute,
          //mutates,
        } = _onDrafts[j];
        if (objectHasKeyOfValue(dirty, deps, 1)) {
          compute.call(this as any, _draft, prevDraft);
        }
      }

      prevDraft = pendingPrevDraft;
    }
  }

  protected _commitDraft(): boolean {
    const { _draft } = this;
    if (_draft == null) {
      return false;
    }

    const { _allProps, _maxIteration } = this;
    // const prevState = this._state;

    let changed = false;
    try {
      for (let i = 0, prevDraft = this._state; true; i += 1) {
        if (i >= _maxIteration) {
          throw new TooManyDirtyCheckIterationError();
        }

        if (!this._runWillSetAndCompute(prevDraft)) {
          break;
        }

        const { dirty, dirtyKeys } = this._getDirtyKeys(_draft, prevDraft);
        if (!dirtyKeys.length) {
          break;
        }

        changed = true;

        const pendingPrevDraft = { ..._draft };

        // didSet
        for (let j = 0, jl = dirtyKeys.length; j < jl; j += 1) {
          const key = dirtyKeys[j];
          const { didSet } = _allProps[key];
          if (typeof didSet === 'function') {
            didSet.call(
              this as any,
              _draft[key] as any,
              prevDraft[key] as any,
              _draft
            );
          }
        }

        // on changed events
        const { _watchers } = this;
        for (let wi = 0, wl = _watchers.length; wi < wl; wi += 1) {
          const watchInfo = _watchers[wi];
          const { keys, watcher } = watchInfo;
          if (objectHasKeyOfValue(dirty, keys, 1)) {
            if ('select' in watchInfo) {
              const { select, prev, normalize, equals } = watchInfo;
              let mapped = select.call(this as any, _draft, prevDraft);
              let changed = mapped !== prev;
              if (changed) {
                if (typeof normalize === 'function') {
                  mapped = normalize.call(this as any, mapped, prev);
                  changed = mapped !== prev;
                }
                if (
                  changed &&
                  prev !== undefined &&
                  typeof equals === 'function'
                ) {
                  changed = !equals.call(this as any, mapped, prev);
                }
                if (changed) {
                  watchInfo.prev = mapped;
                  watcher(mapped, prev, _draft, prevDraft);
                }
              }
            } else {
              const { multiple } = watchInfo;
              if (multiple) {
                (watcher as StateWatcher<Props>)(_draft, prevDraft);
              } else {
                const [key] = keys;
                (watcher as KeyWatcher<Props, typeof key>)(
                  _draft[key],
                  prevDraft[key],
                  _draft,
                  prevDraft
                );
              }
            }
          }
        }

        prevDraft = pendingPrevDraft;
      }
    } catch (e) {
      throw e;
    } finally {
      this._draft = null;
    }

    if (!changed) {
      return false;
    }

    this._state = _draft;

    // history
    /*
    const op: ISetMultiOperation<Props> = {
      type: 'SET_MULTI',
      timestamp: Date.now(),
      data: { prev: prevState, next: _draft },
    };
    */
    // TODO
    // this._pushHistory(op);

    return true;
  }

  $on(keys = this._keys, watcher: StateWatcher<Props>): VoidFunction {
    const item: WatcherInfo<Props> = {
      keys,
      watcher,
      multiple: true,
    };

    this._watchers = [...this._watchers, item];

    return () => {
      this._watchers = this._watchers.filter((x) => x !== item);
    };
  }

  $onKey<Key extends KeyOf<Props>>(
    key: Key,
    watcher: KeyWatcher<Props, Key>
  ): VoidFunction {
    const item: WatcherInfo<Props> = {
      keys: [key],
      watcher: watcher as KeyWatcher<Props, KeyOf<Props>>,
      multiple: false,
    };

    this._watchers = [...this._watchers, item];

    return () => {
      this._watchers = this._watchers.filter((x) => x !== item);
    };
  }

  $select<Mapped>(
    select: SelectWatcherInfo<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Mapped
    >['select']
  ): Mapped {
    return select.call(this as any, this._state, this._state);
  }

  $onSelect<Mapped>(
    keys = this._keys,
    select: SelectWatcherInfo<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Mapped
    >['select'],
    watcher: SelectWatcherInfo<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Mapped
    >['watcher'],
    config?: Omit<
      SelectWatcherInfo<Props, ComputedKeys, Methods, Config, Mapped>,
      'keys' | 'select' | 'watcher'
    >
  ): VoidFunction {
    const item: SelectWatcherInfo<
      Props,
      ComputedKeys,
      Methods,
      Config,
      Mapped
    > = {
      ...config,
      keys,
      select,
      watcher,
    };

    this._watchers = [...this._watchers, item];

    return () => {
      this._watchers = this._watchers.filter((x) => x !== item);
    };
  }

  $clear() {
    this.$clearWatchers();
  }

  $reset() {
    this._draft = null;
    this._history = [];
    this._historyIndex = 0;
    this._navigatingHistory = false;
    this.$clear();
  }

  $addOffMap(key: string, fn: VoidFunction | VoidFunction[] | undefined) {
    if (fn) this.$cleanup.add(key, fn);
  }

  $setOffMap(key: string, fn: VoidFunction | VoidFunction[] | undefined) {
    this.$cleanup.set(key, fn || []);
  }

  $clearOffMap(key: string) {
    this.$cleanup.clear(key);
  }

  $destroy() {
    // TODO
    // this._draft = {} as any;
    // this._commitDraft();

    this.$cleanup.destroy();
    this.$reset();
  }

  toJSON() {
    const { _toJSONKeys, _state, _allProps } = this;
    const state: Record<string, unknown> = {};
    for (let i = 0, il = _toJSONKeys.length; i < il; i += 1) {
      const key = _toJSONKeys[i];
      const { toJSON } = _allProps[key];
      state[key] =
        typeof toJSON === 'function'
          ? toJSON.call(this as any, _state[key] as Props[ComputedKeys])
          : _state[key];
    }
    return { config: this.$config, state };
  }

  protected _pushHistory(op: IStateOperation): void {
    if (this._navigatingHistory) {
      console.error('pushHistory called while navigating history');
      return;
    }

    const newHistory = this._history.slice(0, this._historyIndex);
    newHistory.push(op);

    this._history = newHistory;
    this._historyIndex = this._history.length;
  }

  protected _redoOperation(op: IStateOperation) {
    switch (op.type) {
      case 'SET_MULTI':
        this.$set((op as ISetMultiOperation<Props>).data.next);
        break;
    }
  }

  protected _undoOperation(op: IStateOperation) {
    switch (op.type) {
      case 'SET_MULTI':
        this.$set((op as ISetMultiOperation<Props>).data.prev);
        break;
    }
  }

  $canUndo(): boolean {
    return this._history[this._historyIndex - 1] != null;
  }

  $undo(): void {
    const toIndex = this._historyIndex - 1;
    const op = this._history[toIndex];
    if (op) {
      this._navigatingHistory = true;
      this._undoOperation(op);
      this._historyIndex = toIndex;
      this._navigatingHistory = false;
    }
  }

  $canRedo(): boolean {
    return this._history[this._historyIndex + 1] != null;
  }

  $redo(): void {
    const toIndex = this._historyIndex + 1;
    const op = this._history[toIndex];
    if (op) {
      this._navigatingHistory = true;
      this._redoOperation(op);
      this._historyIndex = toIndex;
      this._navigatingHistory = false;
    }
  }

  $syncKeyToValue<Key extends KeyOf<Props>>(
    key: Key,
    value: Value<Props[Key]>
  ): VoidFunction {
    this.$setKey(key, value.value);

    const offValue = value.on((val) => this.$setKey(key, val));
    const offState = this.$onKey(key, (val) => value.set(val));

    return () => {
      offValue();
      offState();
    };
  }

  $subKeyToStateKey<Key extends KeyOf<Props>>(
    key: Key,
    state: SmartState<any, any, any, any>,
    key2: any
  ): VoidFunction {
    this.$setKey(key, state.$getKey(key2) as unknown as Props[Key]);

    return state.$onKey(key2, (val: any) => this.$setKey(key, val));
  }

  $syncKeyToStateKey<Key extends KeyOf<Props>>(
    key: Key,
    state: SmartState<any, any, any, any>,
    key2: any
  ): VoidFunction {
    this.$setKey(key, state.$getKey(key2) as unknown as Props[Key]);

    const offValue = state.$onKey(key2, (val: any) => this.$setKey(key, val));

    const offState = this.$onKey(key, (val) => state.$setKey(key2, val));

    return () => {
      offValue();
      offState();
    };
  }
}

export interface IEmptyInterface {}

export function defineSmartState<
  Props extends IEmptyInterface = IEmptyInterface,
  ComputedKeys extends KeyOf<Props> = KeyOf<IEmptyInterface>,
  Methods extends IEmptyInterface = IEmptyInterface,
  Config extends IEmptyInterface = IEmptyInterface,
  SuperPropKeys extends KeyOf<Props> = KeyOf<IEmptyInterface>
>(
  {
    statics,
    properties,
    computed,
    drafts = [],
  }: ISmartStateConfig<Props, ComputedKeys, Methods, Config, SuperPropKeys>,
  NewSmartStateClass: new (
    initialState: SmartStateInitialState<Props, ComputedKeys>,
    config: Config
  ) => Methods = class extends BaseSmartState<
    Props,
    ComputedKeys,
    Methods,
    Config
  > {} as any
): SmartStateConstructor<Props, ComputedKeys, Methods, Config> {
  const { prototype } = NewSmartStateClass;

  if (statics) {
    Object.defineProperties(
      NewSmartStateClass,
      objectMap(statics, (value, key) => ({ value }))
    );
  }

  const superPrototype = Object.getPrototypeOf(prototype);

  const _propKeys = objectKeys(properties) as Array<
    Exclude<KeyOf<Props>, ComputedKeys | SuperPropKeys>
  >;

  const _computedKeys = objectKeys(computed) as Array<
    Exclude<ComputedKeys, SuperPropKeys>
  >;

  const _newKeys = [..._propKeys, ..._computedKeys];

  const _enumerableKeys: Array<KeyOf<Props>> = [
    ...superPrototype._enumerableKeys,
    // new enumerable keys are added later
  ];

  const _toJSONKeys: Array<KeyOf<Props>> = [...superPrototype._toJSONKeys];

  const _onDrafts: Array<IDraftWatcher<Props, ComputedKeys, Methods, Config>> =
    [...superPrototype._onDrafts];

  for (let i = 0, il = _computedKeys.length; i < il; i += 1) {
    const key = _computedKeys[i];
    const { deps, get, set } = computed[key];
    _onDrafts.push({
      deps,
      mutates: [key],
      compute(nextState, prevState) {
        nextState[key] = get.call(this, nextState);
      },
    });
    if (typeof set === 'function') {
      _onDrafts.push({
        deps: [key],
        mutates: deps,
        compute(nextState, prevState) {
          set.call(this, nextState[key], nextState);
        },
      });
    }
  }

  _onDrafts.push(...drafts);

  Object.defineProperties(prototype, {
    _propKeys: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: [...superPrototype._propKeys, ..._propKeys],
    },
    _computedKeys: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: [...superPrototype._computedKeys, ..._computedKeys],
    },
    _keys: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: [
        ...superPrototype._propKeys,
        ..._propKeys,
        ...superPrototype._computedKeys,
        ..._computedKeys,
      ],
    },
    _enumerableKeys: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: _enumerableKeys,
    },
    _toJSONKeys: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: _toJSONKeys,
    },
    _allProps: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {
        ...superPrototype._props,
        ...properties,
        ...superPrototype._computed,
        ...computed,
      },
    },
    _props: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {
        ...superPrototype._props,
        ...properties,
      },
    },
    _computed: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {
        ...superPrototype._computed,
        ...computed,
      },
    },
    _onDrafts: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: _onDrafts,
    },
  });

  for (let i = 0, il = _newKeys.length; i < il; i += 1) {
    const key = _newKeys[i];
    if ((key as string) in prototype) {
      throw new PropertyNameConflictError(key);
    }
  }

  for (let i = 0, il = _propKeys.length; i < il; i += 1) {
    const key = _propKeys[i];
    const { enumerable = true, toJSON } = properties[key];

    if (enumerable) {
      _enumerableKeys.push(key);
    }

    if (typeof toJSON === 'function' || (enumerable && toJSON !== false)) {
      _toJSONKeys.push(key);
    }

    Object.defineProperty(prototype, key, {
      configurable: true,
      enumerable,
      get(this: SmartState<Props, ComputedKeys, Methods, Config>) {
        return this.$getKey(key);
      },
      set(
        this: SmartState<Props, ComputedKeys, Methods, Config>,
        val: Props[typeof key]
      ) {
        this.$setKey(key, val);
      },
    });
  }

  for (let i = 0, il = _computedKeys.length; i < il; i += 1) {
    const key = _computedKeys[i];
    const {
      toJSON,
      enumerable = typeof toJSON === 'function',
      set,
    } = computed[key];

    if (enumerable) {
      _enumerableKeys.push(key);
    }

    if (typeof toJSON === 'function' || (enumerable && toJSON !== false)) {
      _toJSONKeys.push(key);
    }

    Object.defineProperty(prototype, key, {
      configurable: true,
      enumerable,
      get(this: SmartState<Props, ComputedKeys, Methods, Config>) {
        return this.$getKey(key);
      },
      set:
        typeof set === 'function'
          ? function set(
              this: SmartState<Props, ComputedKeys, Methods, Config>,
              val: Props[typeof key]
            ) {
              this.$setKey(key, val);
            }
          : undefined,
    });
  }

  /*
  const methodKeys = objectKeys(methods as unknown as object);
  for (let i = 0, il = methodKeys.length; i < il; i += 1) {
    const key = methodKeys[i];
    Object.defineProperty(prototype, key, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: methods[key],
    });
  }
  */

  return NewSmartStateClass as SmartStateConstructor<
    Props,
    ComputedKeys,
    Methods,
    Config
  >;
}
