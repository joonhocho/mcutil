import { expect, test } from '@jest/globals';
import { objectEmpty, objectEmptyToNull } from '../src/object.js';

test('objectEmpty', () => {
  expect(objectEmpty({})).toEqual(true);

  // eslint-disable-next-line no-new-object
  expect(objectEmpty(new Object())).toEqual(true);
  expect(objectEmpty([])).toEqual(true);

  expect(objectEmpty([1])).toEqual(false);

  expect(objectEmpty({ a: 1 })).toEqual(false);
  expect(objectEmpty({ '': 0 })).toEqual(false);

  expect(
    objectEmpty(
      new (class {
        a: number;
        constructor() {
          this.a = 1;
        }
      })()
    )
  ).toEqual(false);

  expect(
    objectEmpty(
      new (class {
        a() {}
      })()
    )
  ).toEqual(true);
});

test('objectEmptyToNull', () => {
  expect(objectEmptyToNull({})).toEqual(null);

  // eslint-disable-next-line no-new-object
  expect(objectEmptyToNull(new Object())).toEqual(null);
  expect(objectEmptyToNull([])).toEqual(null);

  expect(objectEmptyToNull([1])).toEqual([1]);

  expect(objectEmptyToNull({ a: 1 })).toEqual({ a: 1 });
  expect(objectEmptyToNull({ '': 0 })).toEqual({ '': 0 });

  expect(
    objectEmptyToNull(
      new (class {
        a: number;
        constructor() {
          this.a = 1;
        }
      })()
    )
  ).toEqual({ a: 1 });

  expect(
    objectEmptyToNull(
      new (class {
        a() {}
      })()
    )
  ).toEqual(null);
});
