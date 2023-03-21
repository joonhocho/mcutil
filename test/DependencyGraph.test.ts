import { describe, expect, test } from '@jest/globals';
import { DependencyGraph } from '../src/class/DependencyGraph';

describe('DependencyGraph', () => {
  test('DependencyGraph', async () => {
    const graph = new DependencyGraph();

    expect(graph.hasKey('a')).toBe(false);
    expect(graph.hasKey('b')).toBe(false);
    expect(graph.hasKey('c')).toBe(false);
    graph.addDependers('a', ['b', 'c']);

    expect(graph.hasKey('a')).toBe(true);
    expect(graph.hasKey('b')).toBe(true);
    expect(graph.hasKey('c')).toBe(true);
    expect(graph.dependeesMap).toEqual({ a: [], b: ['a'], c: ['a'] });
    expect(graph.dependersMap).toEqual({ a: ['b', 'c'], b: [], c: [] });
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
    expect(Array.from(graph.keys)).toEqual(['a', 'b', 'c']);

    expect(graph.hasKey('d')).toBe(false);
    graph.addDependees('d', ['a', 'c']);
    expect(graph.hasKey('d')).toBe(true);

    expect(graph.dependeesMap).toEqual({
      a: [],
      b: ['a'],
      c: ['a'],
      d: ['a', 'c'],
    });
    expect(graph.dependersMap).toEqual({
      a: ['b', 'c', 'd'],
      b: [],
      c: ['d'],
      d: [],
    });
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
      ['d', 3],
    ]);
    expect(Array.from(graph.keys)).toEqual(['a', 'b', 'c', 'd']);

    graph.addDependers('e', ['b', 'c']);
    graph.addDependers('f', ['a']);
    graph.addKey('g');
    graph.addKey('g');
    graph.addDependees('g', ['c', 'd']);
    graph.addKey('h');

    expect(graph.dependeesMap).toEqual({
      a: ['f'],
      b: ['a', 'e'],
      c: ['a', 'e'],
      d: ['a', 'c'],
      e: [],
      f: [],
      g: ['c', 'd'],
      h: [],
    });
    expect(graph.dependersMap).toEqual({
      a: ['b', 'c', 'd'],
      b: [],
      c: ['d', 'g'],
      d: ['g'],
      e: ['b', 'c'],
      f: ['a'],
      g: [],
      h: [],
    });
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
      ['d', 3],
      ['e', 4],
      ['f', 5],
      ['g', 6],
      ['h', 7],
    ]);
    expect(Array.from(graph.keys)).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
    ]);

    graph.prepare();

    expect(graph.dependeesMap).toEqual({
      a: ['f'],
      b: ['e', 'a'],
      c: ['e', 'a'],
      d: ['a', 'c'],
      e: [],
      f: [],
      g: ['c', 'd'],
      h: [],
    });
    expect(graph.dependersMap).toEqual({
      a: ['b', 'c', 'd'],
      b: [],
      c: ['d', 'g'],
      d: ['g'],
      e: ['b', 'c'],
      f: ['a'],
      g: [],
      h: [],
    });
    expect(Array.from(graph.complexityMap.entries())).toEqual([]);
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 3],
      ['b', 4],
      ['c', 5],
      ['d', 6],
      ['e', 2],
      ['f', 1],
      ['g', 7],
      ['h', 0],
    ]);
    expect(Array.from(graph.keys)).toEqual([
      'h',
      'f',
      'e',
      'a',
      'b',
      'c',
      'd',
      'g',
    ]);

    graph.prepareByComplexity();

    expect(graph.dependeesMap).toEqual({
      a: ['f'],
      b: ['e', 'a'],
      c: ['e', 'a'],
      d: ['a', 'c'],
      e: [],
      f: [],
      g: ['c', 'd'],
      h: [],
    });
    expect(graph.dependersMap).toEqual({
      a: ['b', 'c', 'd'],
      b: [],
      c: ['d', 'g'],
      d: ['g'],
      e: ['b', 'c'],
      f: ['a'],
      g: [],
      h: [],
    });
    expect(Array.from(graph.complexityMap.entries())).toEqual([
      ['h', 0],
      ['f', 0],
      ['e', 0],
      ['a', 1],
      ['b', 3],
      ['c', 3],
      ['d', 5],
      ['g', 7],
    ]);
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 3],
      ['b', 4],
      ['c', 5],
      ['d', 6],
      ['e', 2],
      ['f', 1],
      ['g', 7],
      ['h', 0],
    ]);
    expect(Array.from(graph.keys)).toEqual([
      'h',
      'f',
      'e',
      'a',
      'b',
      'c',
      'd',
      'g',
    ]);

    //
    // clone

    const clone = graph.clone();
    clone.addDependers('i', ['e']);
    clone.addDependers('g', ['h']);
    graph.prepare();
    clone.prepare();
    expect(graph.dependersMap).toEqual({
      a: ['b', 'c', 'd'],
      b: [],
      c: ['d', 'g'],
      d: ['g'],
      e: ['b', 'c'],
      f: ['a'],
      g: [],
      h: [],
    });
    expect(clone.dependersMap).toEqual({
      a: ['b', 'c', 'd'],
      b: [],
      c: ['d', 'g'],
      d: ['g'],
      e: ['b', 'c'],
      f: ['a'],
      g: ['h'],
      h: [],
      i: ['e'],
    });
    expect(graph.dependeesMap).toEqual({
      a: ['f'],
      b: ['e', 'a'],
      c: ['e', 'a'],
      d: ['a', 'c'],
      e: [],
      f: [],
      g: ['c', 'd'],
      h: [],
    });
    expect(clone.dependeesMap).toEqual({
      a: ['f'],
      b: ['e', 'a'],
      c: ['e', 'a'],
      d: ['a', 'c'],
      e: ['i'],
      f: [],
      g: ['c', 'd'],
      h: ['g'],
      i: [],
    });
    expect(graph.keys).toEqual(['h', 'f', 'e', 'a', 'b', 'c', 'd', 'g']);
    expect(clone.keys).toEqual(['f', 'i', 'h', 'e', 'a', 'b', 'c', 'd', 'g']);
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 3],
      ['b', 4],
      ['c', 5],
      ['d', 6],
      ['e', 2],
      ['f', 1],
      ['g', 7],
      ['h', 0],
    ]);
    expect(Array.from(clone.indexMap.entries())).toEqual([
      ['a', 4],
      ['b', 5],
      ['c', 6],
      ['d', 7],
      ['e', 3],
      ['f', 0],
      ['g', 8],
      ['h', 2],
      ['i', 1],
    ]);
  });
});
