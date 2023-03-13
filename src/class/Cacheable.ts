const DESC: PropertyDescriptor = {
  configurable: true,
  writable: true,
  enumerable: false,
};

export class Cacheable<PropNames extends string> {
  cache<T>(name: PropNames, value: T): T {
    DESC.value = value;
    Object.defineProperty(this, name, DESC);
    return value;
  }

  uncache(...names: PropNames[]) {
    for (let i = 0, l = names.length; i < l; i += 1) {
      delete (this as any)[names[i]];
    }
  }
}

export const cache = <T, K extends keyof T>(
  obj: T,
  name: K,
  value: T[K]
): T[K] => {
  DESC.value = value;
  Object.defineProperty(obj, name, DESC);
  return value;
};

export const uncache = <T>(
  obj: T,
  name: (string & keyof T) | Array<keyof T>
) => {
  if (typeof name === 'string') {
    delete obj[name];
  } else {
    for (let i = 0, l = name.length; i < l; i += 1) {
      delete obj[name[i]];
    }
  }
};
