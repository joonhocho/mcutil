import { expect, test } from '@jest/globals';
import { arraysEqual } from '../src/array.js';
import {
  BaseSmartState,
  SmartState,
  defineSmartState,
} from '../src/class/SmartState.js';

test('SmartState', () => {
  interface Props {
    left: number;
    width: number;
    right: number;
    firstName: string;
    lastName: string;
    fullName: string;
    LAST_NAME: string;
  }

  type ComputedKeys = 'right' | 'fullName' | 'LAST_NAME';

  interface Methods {
    width2(): number;
    hi(): string;
  }

  const MyState = defineSmartState<Props, ComputedKeys, Methods>(
    {
      properties: {
        left: { type: 'number' },
        width: { type: 'number' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
      computed: {
        right: {
          type: 'number',
          deps: ['left', 'width'],
          enumerable: true,
          get({ left, width }) {
            return left + width;
          },
        },
        LAST_NAME: {
          type: 'string',
          deps: ['lastName'],
          get({ lastName }) {
            return lastName.toUpperCase();
          },
        },
        fullName: {
          type: 'string',
          deps: ['firstName', 'lastName'],
          normalize: (x) => x.trim().replace(/\s+/g, ' '),
          valid: (x) =>
            typeof x === 'string' && x.length >= 1 && x.length <= 10,
          toJSON(x) {
            return x;
          },
          get({ firstName, lastName }) {
            return [firstName, lastName].filter((x) => x).join(' ');
          },
          set(fullName, draft) {
            const [firstName, lastName] = fullName.trim().split(/\s+/g);
            draft.firstName = firstName;
            draft.lastName = lastName;
          },
        },
      },
    },
    class extends BaseSmartState<Props, ComputedKeys, Methods> {
      width2(this: SmartState<Props, ComputedKeys, Methods>) {
        return this.width * 2;
      }
      hi(this: SmartState<Props, ComputedKeys, Methods>) {
        return `Hello, I'm ${this.fullName}`;
      }
    }
  );

  const MyState2 = defineSmartState<
    Props & {
      top: number;
      height: number;
      bottom: number;
      leftTop: number[];
      desc: boolean;
    },
    ComputedKeys | 'bottom',
    Methods & { area(): number },
    {},
    keyof Props
  >(
    {
      properties: {
        top: { type: 'number' },
        height: { type: 'number' },
        leftTop: {
          type: 'array',
          item: 'number',
          equals: arraysEqual,
          enumerable: false,
        },
        desc: { type: 'boolean', enumerable: false },
      },
      computed: {
        bottom: {
          type: 'number',
          deps: ['top', 'height'],
          enumerable: true,
          get({ top, height }) {
            return top + height;
          },
        },
      },
      drafts: [
        {
          deps: ['left', 'top', 'desc'],
          mutates: ['leftTop'],
          compute(draft) {
            draft.leftTop = [draft.left, draft.top].sort(
              draft.desc ? (a, b) => b - a : (a, b) => a - b
            );
          },
        },
      ],
    },
    class extends MyState {
      area(
        this: SmartState<
          Props & { top: number; height: number; bottom: number },
          ComputedKeys | 'bottom',
          Methods & { area(): number }
        >
      ) {
        return this.width * this.height;
      }
      hi(this: SmartState<Props, ComputedKeys, Methods>) {
        return super.hi() + '!';
      }
    }
  );

  const state = new MyState2(
    {
      left: 10,
      width: 100,
      top: 5,
      height: 50,
      firstName: 'John',
      lastName: 'Doe',
      leftTop: [5, 10],
      desc: false,
    },
    {}
  );

  expect(state.fullName).toBe('John Doe');
  expect(state.firstName).toBe('John');
  expect(state.lastName).toBe('Doe');
  expect(state.right).toBe(110);

  state.fullName = 'Mike Jack';
  expect(state.fullName).toBe('Mike Jack');
  expect(state.firstName).toBe('Mike');
  expect(state.lastName).toBe('Jack');

  expect(state.width2()).toBe(state.width * 2);
  expect(state.area()).toBe(state.width * state.height);
  expect(state.hi().includes(state.fullName)).toBe(true);
  expect(state.hi()).toBe("Hello, I'm Mike Jack!");

  let count = 0;
  const lefts: number[] = [];
  const firstNames: string[] = [];

  const watcherOff = state.$on(['left', 'firstName'], (next, prev) => {
    count++;
    if (next.left !== prev.left) {
      lefts.push(next.left);
    }
    if (next.firstName !== prev.firstName) {
      firstNames.push(next.firstName);
    }
  });

  const fullNames: string[] = [];
  const watcher2Off = state.$onKey('fullName', (next, prev) =>
    fullNames.push(next)
  );

  state.fullName = 'F L';

  expect(state.fullName).toBe('F L');
  expect(state.firstName).toBe('F');
  expect(state.lastName).toBe('L');

  expect(count).toBe(1);
  expect(lefts).toEqual([]);
  expect(firstNames).toEqual(['F']);
  expect(fullNames).toEqual(['F L']);

  state.left = 5;

  expect(count).toBe(2);
  expect(lefts).toEqual([5]);
  expect(firstNames).toEqual(['F']);
  expect(fullNames).toEqual(['F L']);

  state.width = 80;

  expect(count).toBe(2);
  expect(lefts).toEqual([5]);
  expect(firstNames).toEqual(['F']);
  expect(fullNames).toEqual(['F L']);

  state.left = 10;

  expect(count).toBe(3);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F']);
  expect(fullNames).toEqual(['F L']);

  expect(() => {
    state.right = 100;
  }).toThrow();

  expect(() => {
    state.fullName = 'this full name is too long';
  }).toThrow();

  expect(state.fullName).toBe('F L');
  expect(state.firstName).toBe('F');
  expect(state.lastName).toBe('L');
  expect(count).toBe(3);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F']);
  expect(fullNames).toEqual(['F L']);

  state.fullName = 'ABC DEF';

  expect(state.fullName).toBe('ABC DEF');
  expect(state.firstName).toBe('ABC');
  expect(state.lastName).toBe('DEF');
  expect(count).toBe(4);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F', 'ABC']);
  expect(fullNames).toEqual(['F L', 'ABC DEF']);

  state.fullName = 'ABC DEF';

  expect(state.firstName).toBe('ABC');
  expect(state.lastName).toBe('DEF');
  expect(count).toBe(4);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F', 'ABC']);
  expect(fullNames).toEqual(['F L', 'ABC DEF']);

  state.fullName = '  ABC  DEF  ';

  expect(state.fullName).toBe('ABC DEF');
  expect(state.firstName).toBe('ABC');
  expect(state.lastName).toBe('DEF');
  expect(count).toBe(4);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F', 'ABC']);
  expect(fullNames).toEqual(['F L', 'ABC DEF']);

  state.firstName = 'aaa';

  expect(state.fullName).toBe('aaa DEF');
  expect(state.firstName).toBe('aaa');
  expect(state.lastName).toBe('DEF');
  expect(count).toBe(5);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F', 'ABC', 'aaa']);
  expect(fullNames).toEqual(['F L', 'ABC DEF', 'aaa DEF']);

  state.lastName = 'lll';

  expect(state.fullName).toBe('aaa lll');
  expect(state.firstName).toBe('aaa');
  expect(state.lastName).toBe('lll');
  expect(count).toBe(5);
  expect(lefts).toEqual([5, 10]);
  expect(firstNames).toEqual(['F', 'ABC', 'aaa']);
  expect(fullNames).toEqual(['F L', 'ABC DEF', 'aaa DEF', 'aaa lll']);

  state.$set({ firstName: 'fff', lastName: 'LLL', left: 20, width: 50 });

  expect(state.fullName).toBe('fff LLL');
  expect(state.firstName).toBe('fff');
  expect(state.lastName).toBe('LLL');
  expect(count).toBe(6);
  expect(lefts).toEqual([5, 10, 20]);
  expect(firstNames).toEqual(['F', 'ABC', 'aaa', 'fff']);
  expect(fullNames).toEqual([
    'F L',
    'ABC DEF',
    'aaa DEF',
    'aaa lll',
    'fff LLL',
  ]);

  watcherOff();

  state.fullName = '123 456';

  expect(state.fullName).toBe('123 456');
  expect(state.firstName).toBe('123');
  expect(state.lastName).toBe('456');
  expect(count).toBe(6);
  expect(lefts).toEqual([5, 10, 20]);
  expect(firstNames).toEqual(['F', 'ABC', 'aaa', 'fff']);
  expect(fullNames).toEqual([
    'F L',
    'ABC DEF',
    'aaa DEF',
    'aaa lll',
    'fff LLL',
    '123 456',
  ]);

  watcher2Off();

  state.fullName = '567 890';

  expect(state.fullName).toBe('567 890');
  expect(state.firstName).toBe('567');
  expect(state.lastName).toBe('890');
  expect(count).toBe(6);
  expect(lefts).toEqual([5, 10, 20]);
  expect(firstNames).toEqual(['F', 'ABC', 'aaa', 'fff']);
  expect(fullNames).toEqual([
    'F L',
    'ABC DEF',
    'aaa DEF',
    'aaa lll',
    'fff LLL',
    '123 456',
  ]);

  expect(Object.keys(Object.getPrototypeOf(state))).toEqual([
    'top',
    'height',
    'bottom',
  ]);

  expect(
    Object.keys(Object.getPrototypeOf(Object.getPrototypeOf(state)))
  ).toEqual(['left', 'width', 'firstName', 'lastName', 'right', 'fullName']);

  expect(state.toJSON()).toEqual({
    config: {},
    state: {
      bottom: 55,
      firstName: '567',
      fullName: '567 890',
      height: 50,
      lastName: '890',
      left: 20,
      right: 70,
      top: 5,
      width: 50,
    },
  });

  expect(state.$get()).toEqual({
    LAST_NAME: '890',
    bottom: 55,
    desc: false,
    firstName: '567',
    fullName: '567 890',
    height: 50,
    lastName: '890',
    left: 20,
    leftTop: [5, 20],
    right: 70,
    top: 5,
    width: 50,
  });

  state.$set({
    firstName: 'FFF',
    lastName: 'LLL',
  });

  expect(state.$get(['lastName', 'LAST_NAME', 'right', 'width'])).toEqual({
    LAST_NAME: 'LLL',
    lastName: 'LLL',
    right: 70,
    width: 50,
  });

  state.hi();

  state.left = 25;
  expect(state.leftTop).toEqual([5, 25]);

  state.top = 20;
  expect(state.leftTop).toEqual([20, 25]);

  state.left = 10;
  expect(state.leftTop).toEqual([10, 20]);

  state.desc = true;
  expect(state.leftTop).toEqual([20, 10]);

  state.$set({
    left: 15,
    top: 5,
  });
  expect(state.leftTop).toEqual([15, 5]);

  state.$set({
    left: 1,
    top: 3,
    desc: false,
  });
  expect(state.leftTop).toEqual([1, 3]);
});

test('Chained Computed', () => {
  interface Props {
    x: number;
    x2: number;
    x4: number;
    x8: number;
  }

  const MyState = defineSmartState<Props, 'x4'>({
    properties: {
      x: { type: 'number' },
      x2: { type: 'number' },
      x8: { type: 'number' },
    },
    computed: {
      x4: {
        type: 'number',
        deps: ['x2'],
        get(s) {
          return 2 * s.x2;
        },
        set(x4, s) {
          s.x2 = x4 / 2;
        },
      },
    },
    drafts: [
      {
        deps: ['x4'],
        mutates: ['x8'],
        compute(draft) {
          draft.x8 = 2 * draft.x4;
        },
      },
      {
        deps: ['x8'],
        mutates: ['x4'],
        compute(draft) {
          draft.x4 = draft.x8 / 2;
        },
      },
      {
        deps: ['x'],
        mutates: ['x2'],
        compute(draft) {
          draft.x2 = 2 * draft.x;
        },
      },
      {
        deps: ['x2'],
        mutates: ['x'],
        compute(draft) {
          draft.x = draft.x2 / 2;
        },
      },
    ],
  });

  const state = new MyState({ x: 1, x2: 2, x8: 8 }, {});
  expect((state as any)._draft).toBe(null);

  let x = 1;
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);

  x = state.x = 2;
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);

  x = 3;
  state.x2 = 2 * x;
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);

  x = 4;
  state.$updateKey('x4', (x4) => x4 + 4);
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);

  x = 5;
  state.x8 = 8 * x;
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);

  x = 6;
  state.$update(({ x, x4 }) => ({ x: x + 1, x4: x4 + 4 }));
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);

  x = 7;
  state.$set({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect(state.$get()).toEqual({ x, x2: 2 * x, x4: 4 * x, x8: 8 * x });
  expect((state as any)._draft).toBe(null);
});

test('willSet mutates state', () => {
  interface Props {
    a: number;
    a2: number;
    a4: number;
  }

  const log = [] as any[];

  const MyState = defineSmartState<Props, 'a2'>({
    properties: {
      a: {
        type: 'number',
        willSet(next, prev, draft) {
          log.push(['a.willSet', next, prev]);
        },
        didSet(next, prev, draft) {
          log.push(['a.didSet', next, prev]);
        },
      },
      a4: {
        type: 'number',
        willSet(next, prev, draft) {
          log.push(['a4.willSet', next, prev]);
        },
        didSet(next, prev, draft) {
          log.push(['a4.didSet', next, prev]);
        },
      },
    },
    computed: {
      a2: {
        type: 'number',
        deps: ['a'],
        enumerable: true,
        get(s) {
          log.push(['a2.get', 2 * s.a]);
          return 2 * s.a;
        },
        set(a2, s) {
          log.push(['a2.set', a2]);
          s.a = a2 / 2;
        },
        willSet(next, prev, draft) {
          log.push(['a2.willSet', next, prev]);
        },
        didSet(next, prev, draft) {
          log.push(['a2.didSet', next, prev]);
        },
      },
    },
    drafts: [
      {
        deps: ['a'],
        mutates: [],
        compute(draft) {
          log.push(['a.draft', draft.a]);
        },
      },
      {
        deps: ['a2'],
        mutates: ['a4'],
        compute(draft) {
          log.push(['a2.draft', draft.a2]);
          draft.a4 = 2 * draft.a2;
        },
      },
    ],
  });

  const state = new MyState({ a: 1, a4: 4 }, {});

  expect(log).toEqual([
    ['a2.get', 2],
    ['a.willSet', 1, undefined],
    ['a4.willSet', 4, undefined],
    ['a2.willSet', 2, undefined],
    ['a2.get', 2],
    ['a2.set', 2],
    ['a.draft', 1],
    ['a2.draft', 2],
    ['a.didSet', 1, undefined],
    ['a4.didSet', 4, undefined],
    ['a2.didSet', 2, undefined],
  ]);

  log.length = 0;

  expect(state.toJSON()).toEqual({ config: {}, state: { a: 1, a2: 2, a4: 4 } });

  state.a = 2;
  expect(state.toJSON()).toEqual({ config: {}, state: { a: 2, a2: 4, a4: 8 } });

  expect(log).toEqual([
    ['a.willSet', 2, 1],
    ['a2.get', 4],
    ['a.draft', 2],
    ['a2.willSet', 4, 2],
    ['a2.set', 4],
    ['a2.draft', 4],
    ['a4.willSet', 8, 4],
    ['a.didSet', 2, 1],
    ['a4.didSet', 8, 4],
    ['a2.didSet', 4, 2],
  ]);
});
