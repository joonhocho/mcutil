import {
  objectEmpty,
  objectHasKeyOfValue,
  objectKeys,
  objectMap,
} from '../object.js';
import { randomString } from '../string.js';
import { CleanUpMap } from './CleanUpMap.js';
import { ComputeGraph } from './ComputeGraph.js';
import {
  ISmartStateComputeNode,
  ISmartStateKeyComputeNodeConfig,
  SmartStateComputeNode,
  SmartStateKeyComputeNode,
} from './SmartStateComputeNode.js';

import type { IEmptyInterface, KeyOf, VoidFunction } from '../types/types.js';
import type {
  IComputedProperty,
  IDraftWatcher,
  IProperty,
  ISmartStateConfig,
  KeyWatcher,
  SmartState,
  SmartStateConstructor,
  SmartStateInitialState,
  StateWatcher,
  WatcherInfo,
} from './SmartStateTypes.js';

export class PropertyNameConflictError extends Error {
  constructor(key: string) {
    super(`Property name conflict. name=${String(key)}`);
  }
}

export class TooManyDirtyCheckIterationError extends Error {
  constructor() {
    super('Too many dirty check iterations');
  }
}

/*
TODO
atomic/reversable operations
undo/redo by reversing or reapplying operations
nested states: array/object
*/

export class BaseSmartState<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface
> {
  static fromJSON = (json: any) =>
    new BaseSmartState<any, any, any, any>(json.state, json.config);

  $cleanup = new CleanUpMap();

  // committed stable state
  protected _state: Props;

  // uncommitted latest state
  protected _draft: Props | null = null;

  protected _maxIteration = 10;

  protected _watchers: Array<WatcherInfo<Props>> = [];

  protected _destroyed = false;

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

  protected get _computeGraph(): ComputeGraph<string> {
    return new ComputeGraph<string>();
  }

  protected get _computesNodes(): Record<
    string,
    ISmartStateComputeNode<Props>
  > {
    return {};
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

    this._watchers = [];

    this._state = {} as Props;

    this._draft = { ...initialState } as Props;

    const { _draft, _state } = this;

    // clone computeNodes to keep track of prevValue separately for each instance
    Object.defineProperty(this, '_computesNodes', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: objectMap(this._computesNodes, (node) => node.clone()),
    });

    this._computeGraph.run(
      (key) => this._computesNodes[key].run(_draft, _state, this),
      objectKeys(_draft as object),
      false
    );

    this._commitDraft();
  }

  $clearWatchers() {
    this._watchers = [];
  }

  get $state(): Props {
    return this._draft || this._state;
  }

  $getState(): Props {
    return this._draft || this._state;
  }

  $get<Key extends KeyOf<Props>>(keys = this._keys as Key[]): Pick<Props, Key> {
    const { $state } = this;
    const partial = {} as Pick<Props, Key>;
    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      partial[key] = $state[key];
    }
    return partial;
  }

  $getKey<Key extends KeyOf<Props>>(key: Key): Props[Key] {
    return this.$state[key];
  }

  $set(nextState: Partial<Props>): void {
    if (this._destroyed || objectEmpty(nextState)) return;

    const isNewCommit = this._draft == null;
    const draft = this._draft || (this._draft = { ...this._state });
    const prevState = { ...draft };

    const changeKeys: KeyOf<Props>[] = [];
    for (let key in nextState) {
      if (nextState[key] !== prevState[key]) {
        changeKeys.push(key);
        draft[key] = nextState[key]!;
      }
    }

    if (changeKeys.length === 0) {
      if (isNewCommit) this._draft = null;
      return;
    }

    try {
      this._computeGraph.run(
        (key) => this._computesNodes[key].run(draft, prevState, this),
        changeKeys,
        false
      );
    } catch (e) {
      if (isNewCommit) this._draft = null;
      else this._draft = prevState;
      throw e;
    }

    if (isNewCommit) this._commitDraft();
  }

  $setKey<Key extends KeyOf<Props>>(key: Key, val: Props[Key]): void {
    if (this._destroyed || this.$state[key] === val) return;

    const isNewCommit = this._draft == null;
    const draft = this._draft || (this._draft = { ...this._state });
    const prevState = { ...draft };

    draft[key] = val;

    try {
      this._computeGraph.run(
        (key) => this._computesNodes[key].run(draft, prevState, this),
        [key],
        false
      );
    } catch (e) {
      if (isNewCommit) this._draft = null;
      else this._draft = prevState;
      throw e;
    }

    if (isNewCommit) this._commitDraft();
  }

  $update(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    updater: (
      this: SmartState<Props, ComputedKeys, Methods, Config>,
      draft: Props
    ) => Partial<Props>
  ): void {
    if (this._destroyed) return;

    return this.$set(updater.call(this, this.$state));
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
    if (this._destroyed) return;

    const { $state } = this;
    return this.$setKey(key, updater.call(this, $state[key], $state));
  }

  protected _checkDirtyQuick(
    draft: Props,
    prevDraft: Props,
    keys: Array<KeyOf<Props>> = this._keys
  ) {
    const dirty: Partial<Record<KeyOf<Props>, 1>> = {};
    const dirtyKeys: Array<KeyOf<Props>> = [];
    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      if (draft[key] !== prevDraft[key]) {
        dirty[key] = 1;
        dirtyKeys.push(key);
      }
    }
    return { dirty, dirtyKeys };
  }

  protected _commitDraft(): boolean {
    const { _draft } = this;
    if (_draft == null) return false;

    // const prevState = this._state;

    let changed = false;

    try {
      const { _allProps, _maxIteration, _onDrafts } = this;

      let prevDraft = this._state;

      for (let iter = 0; true; iter += 1) {
        if (iter >= _maxIteration) {
          throw new TooManyDirtyCheckIterationError();
        }

        this._computeGraph.run((key) =>
          this._computesNodes[key].run(_draft, prevDraft, this)
        );

        // all props already normalized, just need to quick dirty check
        const { dirty, dirtyKeys } = this._checkDirtyQuick(_draft, prevDraft);
        if (!dirtyKeys.length) break;

        changed = true;

        const draftSnapshot = { ..._draft };

        for (let di = 0, dl = dirtyKeys.length; di < dl; di += 1) {
          const key = dirtyKeys[di];
          const { willSet } = _allProps[key];
          if (willSet != null) {
            willSet.call(
              this as any,
              _draft[key] as any,
              prevDraft[key] as any,
              _draft
            );
          }
        }

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

        for (let j = 0, jl = _onDrafts.length; j < jl; j += 1) {
          const {
            deps,
            compute,
            //mutates,
          } = _onDrafts[j];

          if (objectHasKeyOfValue(dirty, deps, 1)) {
            compute.call(this as any, {}, _draft, prevDraft);
          }
        }

        // on changed events
        const { _watchers } = this;
        for (let wi = 0, wl = _watchers.length; wi < wl; wi += 1) {
          const wItem = _watchers[wi];
          if (wItem.multiple) {
            if (!objectHasKeyOfValue(dirty, wItem.keys, 1)) continue;
            wItem.watcher(_draft, prevDraft);
          } else {
            const { key } = wItem;
            if (dirty[key] !== 1) continue;
            wItem.watcher(_draft[key], prevDraft[key], _draft, prevDraft);
          }
        }

        prevDraft = draftSnapshot;
      }
    } catch (e) {
      throw e;
    } finally {
      this._draft = null;
    }

    if (!changed) return false;

    this._state = _draft;

    return true;
  }

  $on(keys = this._keys, watcher: StateWatcher<Props>): VoidFunction {
    if (this._destroyed) return () => {};

    const item: WatcherInfo<Props> = {
      keys,
      watcher,
      multiple: true,
    };

    // use immutable to avoid change during event calls
    this._watchers = [...this._watchers, item];

    return () => {
      this._watchers = this._watchers.filter((x) => x !== item);
    };
  }

  $onKey<Key extends KeyOf<Props>>(
    key: Key,
    watcher: KeyWatcher<Props, Key>
  ): VoidFunction {
    if (this._destroyed) return () => {};

    const item: WatcherInfo<Props> = {
      key,
      watcher: watcher as KeyWatcher<Props, KeyOf<Props>>,
      multiple: false,
    };

    // use immutable to avoid change during event calls
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
    this.$clear();
  }

  $destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

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

  $subKeyToStateKey<Key extends KeyOf<Props>>(
    key: Key,
    state: SmartState<any, any, any, any>,
    key2: any
  ): VoidFunction {
    if (this._destroyed) return () => {};

    this.$setKey(key, state.$getKey(key2));

    return state.$onKey(key2, (val: any) => this.$setKey(key, val));
  }

  $syncKeyToStateKey<Key extends KeyOf<Props>>(
    key: Key,
    state: SmartState<any, any, any, any>,
    key2: any
  ): VoidFunction {
    if (this._destroyed) return () => {};

    this.$setKey(key, state.$getKey(key2));

    const offValue = state.$onKey(key2, (val: any) => this.$setKey(key, val));

    const offState = this.$onKey(key, (val) => state.$setKey(key2, val));

    return () => {
      offValue();
      offState();
    };
  }
}

export function defineSmartState<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface,
  SuperPropKeys extends KeyOf<Props> = never
>(
  {
    statics,
    properties,
    computed,
    computes = [],
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

  const _enumerableKeys: Array<KeyOf<Props>> = [
    ...superPrototype._enumerableKeys,
    // new enumerable keys are added later
  ];

  const _toJSONKeys: Array<KeyOf<Props>> = [...superPrototype._toJSONKeys];

  const computesNodes: Record<string, ISmartStateComputeNode<Props>> = {
    ...superPrototype._computesNodes,
  };

  const onDrafts: Array<IDraftWatcher<Props, ComputedKeys, Methods, Config>> = [
    ...superPrototype._onDrafts,
  ];

  const computeGraph = (
    superPrototype._computeGraph as ComputeGraph<string>
  ).clone();

  for (let i = 0, il = _propKeys.length; i < il; i += 1) {
    const key = _propKeys[i];

    computeGraph.addKey(key);

    const { mutates, set, update } = properties[key];
    if (mutates != null && (set != null || update != null)) {
      computeGraph.addDependers(key, mutates);
    }

    computesNodes[key] = new SmartStateKeyComputeNode(
      key,
      properties[key] as ISmartStateKeyComputeNodeConfig<Props, typeof key>
    );
  }

  for (let i = 0, il = _computedKeys.length; i < il; i += 1) {
    const key = _computedKeys[i];
    const { deps, mutates = deps, set, update } = computed[key];

    computeGraph.addDependees(key, deps);

    if (set != null || update != null) {
      computeGraph.addDependers(key, mutates);
    }

    computesNodes[key] = new SmartStateKeyComputeNode(
      key,
      computed[key] as ISmartStateKeyComputeNodeConfig<Props, typeof key>
    );
  }

  for (let i = 0, il = computes.length; i < il; i += 1) {
    const { id = randomString(), deps, mutates, compute } = computes[i];

    computesNodes[id] = new SmartStateComputeNode<Props>(compute);

    computeGraph.addDependees(id, deps);
    computeGraph.addDependers(id, mutates);
  }

  onDrafts.push(...drafts);
  computeGraph.prepareByComplexity();

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
    _computeGraph: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: computeGraph,
    },
    _computesNodes: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: computesNodes,
    },
    _onDrafts: {
      configurable: true,
      enumerable: false,
      writable: true,
      value: onDrafts,
    },
  });

  for (let i = 0, il = _propKeys.length; i < il; i += 1) {
    const key = _propKeys[i];

    if (key in prototype) {
      throw new PropertyNameConflictError(key);
    }

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

    if (key in prototype) {
      throw new PropertyNameConflictError(key);
    }

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
