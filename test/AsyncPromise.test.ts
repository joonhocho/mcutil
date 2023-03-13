import { expect, test } from '@jest/globals';
import { AsyncPromise } from '../src/class/AsyncPromise.js';

test('AsyncPromise resolve', async () => {
  const p1 = new AsyncPromise<number>();
  expect(p1.state).toBe('pending');
  expect(p1.value).toBe(undefined);
  expect(p1.reason).toBe(undefined);

  p1.resolve(1);
  expect(p1.state).toBe('resolved');
  expect(p1.value).toBe(1);
  expect(p1.reason).toBe(undefined);

  p1.resolve(2);
  expect(p1.state).toBe('resolved');
  expect(p1.value).toBe(1);
  expect(p1.reason).toBe(undefined);

  p1.reject('bad');
  expect(p1.state).toBe('resolved');
  expect(p1.value).toBe(1);
  expect(p1.reason).toBe(undefined);

  await expect(p1).resolves.toBe(1);
});

test('AsyncPromise reject', async () => {
  const p1 = new AsyncPromise<number>();
  expect(p1.state).toBe('pending');
  expect(p1.value).toBe(undefined);
  expect(p1.reason).toBe(undefined);

  p1.reject('bad');
  expect(p1.state).toBe('rejected');
  expect(p1.value).toBe(undefined);
  expect(p1.reason).toBe('bad');

  p1.reject('bad2');
  expect(p1.state).toBe('rejected');
  expect(p1.value).toBe(undefined);
  expect(p1.reason).toBe('bad');

  p1.resolve(1);
  expect(p1.state).toBe('rejected');
  expect(p1.value).toBe(undefined);
  expect(p1.reason).toBe('bad');

  p1.resolve(2);
  expect(p1.state).toBe('rejected');
  expect(p1.value).toBe(undefined);
  expect(p1.reason).toBe('bad');

  await expect(p1).rejects.toBe('bad');
});
