import type {
  KeyOf,
  VoidFunction,
  WithOptionalProps,
  IEmptyInterface,
} from '../types/types.ts';
import type { BaseSmartState } from './SmartState.ts';

export type KeyWatcher<Props, Key extends KeyOf<Props>> = (
  next: Props[Key],
  prev: Props[Key],
  nextState: Props,
  prevState: Props
) => void;

export type StateWatcher<Props> = (nextState: Props, prevState: Props) => void;

export type WatcherInfo<Props> =
  | {
      key: KeyOf<Props>;
      watcher: KeyWatcher<Props, KeyOf<Props>>;
      multiple: false;
    }
  | {
      keys: Array<KeyOf<Props>>;
      watcher: StateWatcher<Props>;
      multiple: true;
    };

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
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface,
  Key extends KeyOf<Props>
> {
  type: DataType | Function;
  item?: DataType | (() => Function);

  // configuration
  enumerable?: boolean;
  nullable?: boolean;

  // validation
  normalize?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    next: Props[Key],
    prev: Props[Key] | undefined,
    draft: Props
  ): Props[Key];
  valid?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    val: unknown,
    draft: Props
  ): boolean;
  equals?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    a: Props[Key],
    b: Props[Key]
  ): boolean;

  // mutation
  mutates?: Array<Exclude<KeyOf<Props>, Key>>;
  set?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    update: Partial<Props>,
    val: Props[Key],
    draft: WithOptionalProps<Props, ComputedKeys>
  ): void;
  update?(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    update: Partial<Props>,
    next: WithOptionalProps<Props, ComputedKeys>,
    prev: WithOptionalProps<Props, ComputedKeys>
  ): void;

  // side effect
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

  // serialization
  toJSON?:
    | ((
        this: SmartState<Props, ComputedKeys, Methods, Config>,
        val: Props[Key]
      ) => unknown)
    | false;
}

export interface IComputedProperty<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface,
  Key extends ComputedKeys
> extends IProperty<Props, ComputedKeys, Methods, Config, Key> {
  deps: Array<Exclude<KeyOf<Props>, Key>>;
  get(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    state: WithOptionalProps<Props, ComputedKeys>
  ): Props[Key];
}

export interface IDraftWatcher<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface
> {
  id?: string;
  deps: Array<KeyOf<Props>>;
  mutates: Array<KeyOf<Props>>;
  compute(
    this: SmartState<Props, ComputedKeys, Methods, Config>,
    update: Partial<Props>,
    nextState: Props,
    prevState: Props
  ): void;
}

export interface ISmartStateConfig<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface,
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
  computes?: Array<IDraftWatcher<Props, ComputedKeys, Methods, Config>>;
  drafts?: Array<IDraftWatcher<Props, ComputedKeys, Methods, Config>>;
}

export type SmartState<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface
> = BaseSmartState<Props, ComputedKeys, Methods, Config> & Props & Methods;

export type SmartStateInitialState<
  Props,
  ComputedKeys extends KeyOf<Props> = never
> = WithOptionalProps<Props, ComputedKeys>;

export interface SmartStateConstructor<
  Props,
  ComputedKeys extends KeyOf<Props> = never,
  Methods = IEmptyInterface,
  Config = IEmptyInterface
> {
  new (
    initialState: SmartStateInitialState<Props, ComputedKeys>,
    config: Config
  ): SmartState<Props, ComputedKeys, Methods, Config>;
  prototype: SmartState<Props, ComputedKeys, Methods, Config>;
}
