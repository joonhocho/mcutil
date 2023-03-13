export interface AnyConstructor<T = any> {
  new (...args: any[]): T;
  name?: string;
  fromJSON?(json: unknown): T;
  prototype?: {
    toJSON?(): unknown;
  };
}

export class ConfigError extends Error {}

export class ToJsonError extends Error {}

export class StringifyError extends Error {}

export class ParseError extends Error {}

function getGlobal(this: any): typeof globalThis {
  return typeof globalThis === 'undefined' ? this : globalThis;
}

const CLASS_NAME_KEY = '<5Er1]';

const glob = getGlobal();

const classMap = Object.create(glob);

function isValidClassName(str?: string): str is string {
  return typeof str === 'string' && str !== '';
}

export function addClass(Class: AnyConstructor, name: string) {
  const { prototype, fromJSON } = Class;
  if (!isValidClassName(name)) {
    throw new ConfigError(
      "'Class.name' must be set to serialize custom class."
    );
  }
  if (typeof prototype?.toJSON !== 'function') {
    throw new ConfigError(
      `'${name}.prototype.toJSON()' must be implemented to serialize custom class.`
    );
  }
  if (typeof fromJSON !== 'function') {
    throw new ConfigError(
      `'${name}.fromJSON(json: unknown): ${name}' must be implemented to deserialize custom class.`
    );
  }
  if (Object.prototype.hasOwnProperty.call(classMap, name)) {
    throw new ConfigError(`'${name}' already exists in context.`);
  }
  classMap[name] = Class;
}

export function removeClass({ name }: AnyConstructor) {
  if (!isValidClassName(name)) {
    throw new ConfigError("'Class.name' not set.");
  }
  if (!Object.prototype.hasOwnProperty.call(classMap, name)) {
    throw new ConfigError(`'${name}' does not exist.`);
  }
  delete classMap[name];
}

function objectToJSON(data: object): Record<string, unknown> {
  const keys = Object.getOwnPropertyNames(data) as Array<keyof typeof data>;
  const copy = {} as Record<string, unknown>;
  for (let i = 0, il = keys.length; i < il; i += 1) {
    const key = keys[i];
    copy[key] = toJSON(data[key]);
  }
  return copy;
}

function arrayToJSON(data: unknown[]): unknown[] {
  return data.map(toJSON);
}

export function toJSON<T = unknown>(data: unknown): T {
  switch (typeof data) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'bigint':
      return data as any;
    case 'symbol':
      throw new ToJsonError(`Symbol cannot be serialized. ${String(data)}`);
    case 'function':
      throw new ToJsonError(
        `Function cannot be serialized. ${data.name || data}`
      );
    case 'object': {
      if (data == null) {
        return data as any;
      }

      const { constructor } = data;
      if (!constructor || constructor === Object) {
        return objectToJSON(data) as any;
      }

      if (Array.isArray(data)) {
        return arrayToJSON(data) as any;
      }

      // Custom class objects
      const { name } = constructor;
      if (!isValidClassName(name)) {
        throw new ToJsonError('Custom class must be added before serializing');
      }

      let json;
      if ('toJSON' in data && typeof (data as any).toJSON === 'function') {
        json = toJSON((data as any).toJSON());
      } else {
        throw new ToJsonError(
          `Custom class, ${name}, must be added before serializing`
        );
      }

      return { [CLASS_NAME_KEY]: name, p: json } as any;
    }
    default:
      throw new ToJsonError(`Unknown type. ${typeof data}`);
  }
}

export function serialize(data: unknown): string {
  return JSON.stringify(toJSON(data));
}

function objectFromJSON(data: object): Record<string, unknown> {
  const keys = Object.getOwnPropertyNames(data) as Array<keyof typeof data>;
  const copy = {} as Record<string, unknown>;
  for (let i = 0, il = keys.length; i < il; i += 1) {
    const key = keys[i];
    copy[key] = fromJSON(data[key]);
  }
  return copy;
}

function arrayFromJSON(data: unknown[]): unknown[] {
  return data.map(fromJSON);
}

export function fromJSON(data: unknown): unknown {
  switch (typeof data) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'bigint':
    case 'symbol':
    case 'function':
      return data;
    case 'object': {
      if (data == null) {
        return data;
      }

      const { constructor } = data;
      if (!constructor || constructor === Object) {
        if (CLASS_NAME_KEY in data) {
          const className = (data as any)[CLASS_NAME_KEY] as string;

          if (!(className in classMap)) {
            throw new ParseError(`Could not find '${className}' class.`);
          }

          const Class = classMap[className];
          const json = fromJSON((data as any).p);
          if (typeof Class.fromJSON === 'function') {
            // custom class
            return Class.fromJSON(json);
          }
          // built-in classes like Date
          return new Class(json);
        }

        return objectFromJSON(data);
      }

      if (Array.isArray(data)) {
        return arrayFromJSON(data);
      }

      // Custom class objects
      return data;
    }
    default:
      throw new ParseError(`Unknown type. ${typeof data}`);
  }
}

export function deserialize<T = unknown>(json: string): T {
  return fromJSON(JSON.parse(json)) as T;
}
