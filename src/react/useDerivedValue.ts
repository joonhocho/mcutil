import { useMemo } from 'react';
import { DerivedValue, ToValue } from '../class/DerivedValue.js';
import { IValueOptions, Value } from '../class/Value.js';
import { useValue } from './useValue.js';

export const useDerivedValue = <T, Deps extends Array<any>>(
  deps: ToValue<Deps>,
  selector: (...args: Deps) => T | Value<T>,
  options?: IValueOptions<T>
) =>
  useValue(
    useMemo(
      () => new DerivedValue<T, Deps>(deps, selector, options),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      deps
    )
  );
