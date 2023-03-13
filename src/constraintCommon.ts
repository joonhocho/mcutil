import type {
  AnyConstraints,
  IArrayConstraints,
  IBooleanConstraints,
  IColorConstraints,
  INumberConstraints,
  IObjectConstraints,
  ISelectConstraints,
} from './types/ConstraintsTypes.js';

//  settingsConstraints: AnyConstraints = {
//    type: 'object',
//    items: {
//      width: { type: 'number', nullable: true, gt: 0 },
//      color: { type: 'color', nullable: true },
//    },
//  };

//  settingsConstraints: AnyConstraints = {
//    type: 'object',
//    items: {
//      width: { type: 'number', nullable: true, gt: 0 },
//      color: { type: 'color', nullable: true },
//      retracements: {
//        type: 'array',
//        items: {
//          type: 'object',
//          items: {
//            width: { type: 'number', nullable: true, gt: 0 },
//            color: { type: 'color', nullable: true },
//            retracement: { type: 'number' },
//          },
//        },
//      },
//    },
//  };
export const getCommonAnyConstraints = (
  a: AnyConstraints,
  b: AnyConstraints
): AnyConstraints | null => {
  if (a === b) return a;
  if (a.type !== b.type) return null;

  switch (a.type) {
    case 'boolean':
      return getCommonBooleanConstraints(a, b as any);
    case 'number':
    case 'integer':
      return getCommonNumberConstraints(a, b as any);
    case 'color':
      return getCommonColorConstraints(a, b as any);
    case 'select':
      return getCommonSelectConstraints(a, b as any);
    case 'array':
      return getCommonArrayConstraints(a, b as any);
    case 'object':
      return getCommonObjectConstraints(a, b as any);
  }
};

export const getCommonAnyConstraintsFromList = (
  list: AnyConstraints[]
): AnyConstraints | null => {
  if (!list.length) return null;

  if (list.length === 1) return list[0];

  let common: AnyConstraints | null = list[0];
  for (let i = 1, il = list.length; common != null && i < il; i += 1) {
    common = getCommonAnyConstraints(common, list[i]);
  }
  return common;
};

export const getCommonBooleanConstraints = (
  a: IBooleanConstraints,
  b: IBooleanConstraints
): IBooleanConstraints | null => {
  if (a === b) return a;
  if (a.type !== 'boolean' || b.type !== 'boolean') return null;

  const common: IBooleanConstraints = {
    type: 'boolean',
    nullable: Boolean(a.nullable && b.nullable),
  };
  return common;
};

export const getCommonNumberConstraints = (
  a: INumberConstraints,
  b: INumberConstraints
): INumberConstraints | null => {
  if (a === b) return a;
  if (
    (a.type !== 'number' && a.type !== 'integer') ||
    (b.type !== 'number' && b.type !== 'integer')
  )
    return null;

  const common: INumberConstraints = {
    type: a.type === 'integer' || b.type === 'integer' ? 'integer' : 'number',
    nullable: Boolean(a.nullable && b.nullable),
  };

  if (a.gt != null || b.gt != null) {
    common.gt =
      a.gt == null ? b.gt : b.gt == null ? a.gt : Math.max(a.gt, b.gt);
  }

  if (a.gte != null || b.gte != null) {
    common.gte =
      a.gte == null ? b.gte : b.gte == null ? a.gte : Math.max(a.gte, b.gte);
  }

  if (a.lt != null || b.lt != null) {
    common.lt =
      a.lt == null ? b.lt : b.lt == null ? a.lt : Math.min(a.lt, b.lt);
  }

  if (a.lte != null || b.lte != null) {
    common.lte =
      a.lte == null ? b.lte : b.lte == null ? a.lte : Math.min(a.lte, b.lte);
  }

  if (a.step != null || b.step != null) {
    common.step =
      a.step == null
        ? b.step
        : b.step == null
        ? a.step
        : Math.max(a.step, b.step);
  }

  return common;
};

export const getCommonColorConstraints = (
  a: IColorConstraints,
  b: IColorConstraints
): IColorConstraints | null => {
  if (a === b) return a;
  if (a.type !== 'color' || b.type !== 'color') return null;

  const common: IColorConstraints = {
    type: 'color',
    nullable: Boolean(a.nullable && b.nullable),
  };
  return common;
};

export const getCommonSelectConstraints = (
  a: ISelectConstraints,
  b: ISelectConstraints
): ISelectConstraints | null => {
  if (a === b) return a;
  if (a.type !== 'select' || b.type !== 'select') return null;

  const options = a.options.filter((x) => b.options.includes(x));
  if (!options.length) return null;

  const common: ISelectConstraints = {
    type: 'select',
    nullable: Boolean(a.nullable && b.nullable),
    options,
  };

  return common;
};

export const getCommonArrayConstraints = (
  a: IArrayConstraints,
  b: IArrayConstraints
): IArrayConstraints | null => {
  if (a === b) return a;
  if (a.type !== 'array' || b.type !== 'array') return null;

  const items = getCommonAnyConstraints(a.items, b.items);
  if (!items) return null;

  const common: IArrayConstraints = {
    type: 'array',
    nullable: Boolean(a.nullable && b.nullable),
    items,
  };

  if (a.minLength != null || b.minLength != null) {
    common.minLength =
      a.minLength == null
        ? b.minLength
        : b.minLength == null
        ? a.minLength
        : Math.max(a.minLength, b.minLength);
  }

  if (a.maxLength != null || b.maxLength != null) {
    common.maxLength =
      a.maxLength == null
        ? b.maxLength
        : b.maxLength == null
        ? a.maxLength
        : Math.min(a.maxLength, b.maxLength);
  }

  return common;
};

export const getCommonObjectConstraints = (
  a: IObjectConstraints,
  b: IObjectConstraints
): IObjectConstraints | null => {
  if (a === b) return a;
  if (a.type !== 'object' || b.type !== 'object') return null;

  const items = {} as Record<string, AnyConstraints>;

  const aKeys = Object.keys(a.items);
  for (let i = 0, il = aKeys.length; i < il; i += 1) {
    const key = aKeys[i];
    const value =
      a.items[key] && b.items[key]
        ? getCommonAnyConstraints(a.items[key], b.items[key])
        : null;
    if (value) {
      items[key] = value;
    }
  }

  const common: IObjectConstraints = {
    type: 'object',
    nullable: Boolean(a.nullable && b.nullable),
    items,
  };

  return common;
};
