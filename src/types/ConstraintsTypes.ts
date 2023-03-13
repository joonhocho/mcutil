export type AnyConstraints =
  | IBooleanConstraints
  | INumberConstraints
  | IColorConstraints
  | ISelectConstraints
  | IArrayConstraints
  | IObjectConstraints;

export interface IBaseConstraints {
  type: string;
  nullable?: boolean;
}

export interface IBooleanConstraints extends IBaseConstraints {
  type: 'boolean';
}

export interface INumberConstraints extends IBaseConstraints {
  type: 'number' | 'integer';
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  step?: number;
}

export interface IColorConstraints extends IBaseConstraints {
  type: 'color';
}

export interface ISelectConstraints extends IBaseConstraints {
  type: 'select';
  options: Array<number | string>;
}

export interface IArrayConstraints extends IBaseConstraints {
  type: 'array';
  minLength?: number;
  maxLength?: number;
  items: AnyConstraints;
}

export interface IObjectConstraints extends IBaseConstraints {
  type: 'object';
  items: {
    [key: string]: AnyConstraints;
  };
}
