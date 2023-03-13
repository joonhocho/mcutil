import { expect, test } from '@jest/globals';
import { SortedArray } from '../src/class/SortedArray.js';

test('SortedArray number', () => {
  const list = new SortedArray<number>();

  expect(list.array).toEqual([]);

  expect(list.length).toEqual(0);
  expect(list.indexOf(1)).toBe(-1);
  expect(list.firstIndexOf(1)).toBe(-1);
  expect(list.lastIndexOf(1)).toBe(-1);

  expect(list.pop()).toBe(undefined);
  expect(list.length).toBe(0);

  expect(list.shift()).toBe(undefined);
  expect(list.length).toBe(0);

  expect(list.insertOne(1)).toBe(0);
  expect(list.indexOf(1)).toBe(0);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.lastIndexOf(1)).toBe(0);
  expect(list.length).toBe(1);
  expect(list.array).toEqual([1]);

  expect(list.pop()).toBe(1);
  expect(list.length).toBe(0);
  expect(list.array).toEqual([]);

  expect(list.insertOne(3)).toBe(0);
  expect(list.indexOf(1)).toBe(-1);
  expect(list.firstIndexOf(1)).toBe(-1);
  expect(list.lastIndexOf(1)).toBe(-1);
  expect(list.indexOf(2)).toBe(-1);
  expect(list.firstIndexOf(2)).toBe(-1);
  expect(list.lastIndexOf(2)).toBe(-1);
  expect(list.indexOf(3)).toBe(0);
  expect(list.firstIndexOf(3)).toBe(0);
  expect(list.lastIndexOf(3)).toBe(0);
  expect(list.length).toBe(1);

  expect(list.insertOne(1)).toBe(0);
  expect(list.indexOf(1)).toBe(0);
  expect(list.indexOf(2)).toBe(-1);
  expect(list.indexOf(3)).toBe(1);
  expect(list.length).toBe(2);

  expect(list.insertOne(2)).toBe(1);
  expect(list.indexOf(1)).toBe(0);
  expect(list.indexOf(2)).toBe(1);
  expect(list.indexOf(3)).toBe(2);
  expect(list.length).toBe(3);

  expect(list.array).toEqual([1, 2, 3]);

  expect(list.shift()).toBe(1);
  expect(list.length).toBe(2);

  expect(list.pop()).toBe(3);
  expect(list.length).toBe(1);

  expect(list.insertOne(1)).toBe(0);
  expect(list.insertOne(3)).toBe(2);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.firstIndexOf(2)).toBe(1);
  expect(list.firstIndexOf(3)).toBe(2);
  expect(list.lastIndexOf(1)).toBe(0);
  expect(list.lastIndexOf(2)).toBe(1);
  expect(list.lastIndexOf(3)).toBe(2);
  expect(list.array).toEqual([1, 2, 3]);

  expect(list.insertOne(3)).toBe(3);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.firstIndexOf(2)).toBe(1);
  expect(list.firstIndexOf(3)).toBe(2);
  expect(list.lastIndexOf(1)).toBe(0);
  expect(list.lastIndexOf(2)).toBe(1);
  expect(list.lastIndexOf(3)).toBe(3);
  expect(list.array).toEqual([1, 2, 3, 3]);

  expect(list.insertOne(1)).toBe(1);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.firstIndexOf(2)).toBe(2);
  expect(list.firstIndexOf(3)).toBe(3);
  expect(list.lastIndexOf(1)).toBe(1);
  expect(list.lastIndexOf(2)).toBe(2);
  expect(list.lastIndexOf(3)).toBe(4);
  expect(list.array).toEqual([1, 1, 2, 3, 3]);

  expect(list.insertOne(1)).toBe(2);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.firstIndexOf(2)).toBe(3);
  expect(list.firstIndexOf(3)).toBe(4);
  expect(list.lastIndexOf(1)).toBe(2);
  expect(list.lastIndexOf(2)).toBe(3);
  expect(list.lastIndexOf(3)).toBe(5);
  expect(list.array).toEqual([1, 1, 1, 2, 3, 3]);

  expect(list.insertOne(2)).toBe(4);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.firstIndexOf(2)).toBe(3);
  expect(list.firstIndexOf(3)).toBe(5);
  expect(list.lastIndexOf(1)).toBe(2);
  expect(list.lastIndexOf(2)).toBe(4);
  expect(list.lastIndexOf(3)).toBe(6);
  expect(list.array).toEqual([1, 1, 1, 2, 2, 3, 3]);

  expect(list.insertOne(3)).toBe(7);
  expect(list.firstIndexOf(1)).toBe(0);
  expect(list.firstIndexOf(2)).toBe(3);
  expect(list.firstIndexOf(3)).toBe(5);
  expect(list.lastIndexOf(1)).toBe(2);
  expect(list.lastIndexOf(2)).toBe(4);
  expect(list.lastIndexOf(3)).toBe(7);
  expect(list.array).toEqual([1, 1, 1, 2, 2, 3, 3, 3]);

  list.insertMany([3, 7, 1, 5, 2, 1, 2, 4, 1]);
  expect(list.array).toEqual([
    1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 5, 7,
  ]);

  list.insertMany([9, 6, 3, 1]);
  expect(list.array).toEqual([
    1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 5, 6, 7, 9,
  ]);

  const reversed = list.reverse();
  expect(reversed.array).toEqual(list.array.slice().reverse());

  reversed.insertMany([8, 2, 4, 1]);
  expect(reversed.array).toEqual([
    9, 8, 7, 6, 5, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1,
  ]);

  expect(list.array).toEqual([
    1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 5, 6, 7, 9,
  ]);
});

test('SortedArray string', () => {
  const list = new SortedArray<string>(['a', 'c', 'b'], (a, b) =>
    a.localeCompare(b)
  );

  expect(list.array).toEqual(['a', 'b', 'c']);

  expect(list.length).toEqual(3);
  expect(list.indexOf('a')).toBe(0);

  expect(list.pop()).toBe('c');
  expect(list.length).toBe(2);
  expect(list.array).toEqual(['a', 'b']);

  expect(list.shift()).toBe('a');
  expect(list.length).toBe(1);
  expect(list.array).toEqual(['b']);

  expect(list.indexOf('a')).toBe(-1);
  expect(list.insertOne('a')).toBe(0);
  expect(list.indexOf('a')).toBe(0);
  expect(list.firstIndexOf('a')).toBe(0);
  expect(list.length).toBe(2);
  expect(list.array).toEqual(['a', 'b']);

  expect(list.indexOf('c')).toBe(-1);
  expect(list.insertOne('c')).toBe(2);
  expect(list.indexOf('c')).toBe(2);
  expect(list.firstIndexOf('c')).toBe(2);
  expect(list.length).toBe(3);
  expect(list.array).toEqual(['a', 'b', 'c']);

  expect(list.indexOf('c')).toBe(2);
  expect(list.insertOne('c')).toBe(3);
  expect(list.indexOf('c')).toBe(2);
  expect(list.firstIndexOf('c')).toBe(2);
  expect(list.length).toBe(4);
  expect(list.array).toEqual(['a', 'b', 'c', 'c']);

  expect(list.indexOf('a')).toBe(0);
  expect(list.insertOne('a')).toBe(1);
  expect(list.indexOf('a')).toBe(0);
  expect(list.firstIndexOf('a')).toBe(0);
  expect(list.length).toBe(5);
  expect(list.array).toEqual(['a', 'a', 'b', 'c', 'c']);

  expect(list.indexOf('a')).toBe(0);
  expect(list.insertOne('a')).toBe(2);
  expect(list.indexOf('a')).toBe(2);
  expect(list.firstIndexOf('a')).toBe(0);
  expect(list.length).toBe(6);
  expect(list.array).toEqual(['a', 'a', 'a', 'b', 'c', 'c']);

  const reversed = list.reverse();
  expect(reversed.array).toEqual(list.array.slice().reverse());

  reversed.insertMany(['d', 'a', 'b', 'f']);
  expect(reversed.array).toEqual([
    'f',
    'd',
    'c',
    'c',
    'b',
    'b',
    'a',
    'a',
    'a',
    'a',
  ]);

  expect(list.array).toEqual(['a', 'a', 'a', 'b', 'c', 'c']);
});

test('SortedArray find', () => {
  const list = new SortedArray<number>([1, 2, 4, 8, 16, 32, 64, 128]);

  expect(list.array).toEqual([1, 2, 4, 8, 16, 32, 64, 128]);

  expect(list.findIndex((x) => (x < 5 ? 0 : -1))).toBe(1);
  expect(list.findFirstIndex((x) => (x < 5 ? 0 : -1))).toBe(0);
  expect(list.findLastIndex((x) => (x < 5 ? 0 : -1))).toBe(2);

  expect(list.findIndex((x) => (x > 10 ? 0 : 1))).toBe(5);
  expect(list.findFirstIndex((x) => (x > 10 ? 0 : 1))).toBe(4);
  expect(list.findLastIndex((x) => (x > 10 ? 0 : 1))).toBe(7);

  expect(list.findIndex((x) => (x >= 128 ? 0 : 1))).toBe(7);
  expect(list.findFirstIndex((x) => (x >= 128 ? 0 : 1))).toBe(7);
  expect(list.findLastIndex((x) => (x >= 128 ? 0 : 1))).toBe(7);

  expect(list.findIndex((x) => (x > 128 ? 0 : 1))).toBe(-1);
  expect(list.findFirstIndex((x) => (x > 128 ? 0 : 1))).toBe(-1);
  expect(list.findLastIndex((x) => (x > 128 ? 0 : 1))).toBe(-1);
});
