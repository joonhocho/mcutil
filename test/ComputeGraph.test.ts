import { describe, expect, test } from '@jest/globals';
import { ComputeGraph } from '../src/class/ComputeGraph';

describe('ComputeGraph', () => {
  test('ComputeGraph', async () => {
    const graph = new ComputeGraph();

    graph.addDependers('a', ['b', 'c']);
    graph.addDependees('d', ['a', 'c']);
    graph.addDependers('e', ['b', 'c']);
    graph.addDependers('f', ['a']);
    graph.addKey('g');
    graph.addDependees('g', ['c', 'd']);
    graph.addKey('h');

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
      ['a', 1],
      ['b', 3],
      ['c', 3],
      ['d', 5],
      ['e', 0],
      ['f', 0],
      ['g', 7],
      ['h', 0],
    ]);
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 3],
      ['b', 4],
      ['c', 5],
      ['d', 6],
      ['e', 0],
      ['f', 1],
      ['g', 7],
      ['h', 2],
    ]);
    expect(Array.from(graph.keys)).toEqual([
      'e',
      'f',
      'h',
      'a',
      'b',
      'c',
      'd',
      'g',
    ]);

    // run

    const calls: string[] = [];

    graph.run((key, graph) => {
      calls.push(key);
      return true;
    });

    expect(calls).toEqual(graph.keys);

    calls.length = 0;

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['a', 'f', 'd']
    );

    expect(calls).toEqual(['f', 'a', 'd']);

    calls.length = 0;

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['a', 'f', 'd'],
      true
    );

    expect(calls).toEqual(['a', 'f', 'd']);

    calls.length = 0;

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['f', 'b', 'g']
    );

    expect(calls).toEqual(['f', 'b', 'g']);

    calls.length = 0;

    const visits = new Map<string, number>();
    graph.keys.forEach((key) => visits.set(key, 0));

    graph.run(
      (key, graph) => {
        calls.push(key);
        return (visits.get(key) || 0) > 0;
      },
      ['f', 'b', 'g']
    );

    expect(calls).toEqual([
      'f',
      'b',
      'g',
      'a',
      'b',
      'c',
      'd',
      'd',
      'g',
      'g',
      'g',
    ]);
  });

  test('ComputeGraph cyclic deps', async () => {
    const graph = new ComputeGraph();

    graph.addDependers('a', ['b']);
    graph.addDependers('b', ['a']);

    graph.prepareByComplexity();

    expect(graph.dependeesMap).toEqual({ a: ['b'], b: ['a'] });
    expect(graph.dependersMap).toEqual({ a: ['b'], b: ['a'] });
    expect(Array.from(graph.complexityMap.entries())).toEqual([
      ['a', 2],
      ['b', 2],
    ]);
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 0],
      ['b', 1],
    ]);
    expect(Array.from(graph.keys)).toEqual(['a', 'b']);

    // simple call

    const calls: string[] = [];

    graph.run((key, graph) => {
      calls.push(key);
      return true;
    });

    expect(calls).toEqual(graph.keys);

    calls.length = 0;

    // simple call

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['a']
    );

    expect(calls).toEqual(['a']);

    calls.length = 0;

    // simple call

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['b']
    );

    expect(calls).toEqual(['b']);

    calls.length = 0;

    // visit count

    const visits = new Map<string, number>();
    graph.keys.forEach((key) => visits.set(key, 0));

    graph.run((key, graph) => {
      calls.push(key);
      const count = visits.get(key) || 0;
      visits.set(key, count + 1);
      return count > 0;
    });

    expect(calls).toEqual(['a', 'b', 'b', 'a']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));

    //

    graph.run(
      (key, graph) => {
        calls.push(key);
        const count = visits.get(key) || 0;
        visits.set(key, count + 1);
        return count > 0;
      },
      ['a']
    );

    expect(calls).toEqual(['a', 'b', 'a']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));

    //

    graph.run(
      (key, graph) => {
        calls.push(key);
        const count = visits.get(key) || 0;
        visits.set(key, count + 1);
        return count > 0;
      },
      ['b']
    );

    expect(calls).toEqual(['b', 'a', 'b']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));
  });

  test('ComputeGraph cyclic deps 3 keys', async () => {
    const graph = new ComputeGraph();

    graph.addDependers('a', ['b']);
    graph.addDependers('b', ['c']);
    graph.addDependers('c', ['a']);

    expect(graph.dependeesMap).toEqual({ a: ['c'], b: ['a'], c: ['b'] });
    expect(graph.dependersMap).toEqual({ a: ['b'], b: ['c'], c: ['a'] });

    graph.addDependees('b', ['a']);
    graph.addDependees('c', ['b']);
    graph.addDependees('a', ['c']);

    expect(graph.dependeesMap).toEqual({ a: ['c'], b: ['a'], c: ['b'] });
    expect(graph.dependersMap).toEqual({ a: ['b'], b: ['c'], c: ['a'] });

    graph.prepareByComplexity();

    expect(Array.from(graph.complexityMap.entries())).toEqual([
      ['a', 3],
      ['b', 3],
      ['c', 3],
    ]);
    expect(Array.from(graph.indexMap.entries())).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
    expect(Array.from(graph.keys)).toEqual(['a', 'b', 'c']);

    // simple call

    const calls: string[] = [];

    graph.run((key, graph) => {
      calls.push(key);
      return true;
    });

    expect(calls).toEqual(graph.keys);

    calls.length = 0;

    // simple call

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['a']
    );

    expect(calls).toEqual(['a']);

    calls.length = 0;

    // simple call

    graph.run(
      (key, graph) => {
        calls.push(key);
        return true;
      },
      ['b']
    );

    expect(calls).toEqual(['b']);

    calls.length = 0;

    // visit count

    const visits = new Map<string, number>();
    graph.keys.forEach((key) => visits.set(key, 0));

    graph.run((key, graph) => {
      calls.push(key);
      const count = visits.get(key) || 0;
      visits.set(key, count + 1);
      return count > 0;
    });

    expect(calls).toEqual(['a', 'b', 'c', 'b', 'c', 'a']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));

    //

    graph.run(
      (key, graph) => {
        calls.push(key);
        const count = visits.get(key) || 0;
        visits.set(key, count + 1);
        return count > 0;
      },
      ['a']
    );

    expect(calls).toEqual(['a', 'b', 'c', 'a']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));

    //

    graph.run(
      (key, graph) => {
        calls.push(key);
        const count = visits.get(key) || 0;
        visits.set(key, count + 1);
        return count > 0;
      },
      ['b']
    );

    expect(calls).toEqual(['b', 'c', 'a', 'b']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));

    //
    // clone
    //

    const clone = graph.clone();
    clone.addDependers('d', ['a']);
    clone.prepareByComplexity();
    clone.keys.forEach((key) => visits.set(key, 0));

    clone.run((key, graph) => {
      calls.push(key);
      const count = visits.get(key) || 0;
      visits.set(key, count + 1);
      return count > 0;
    });

    expect(calls).toEqual(['d', 'a', 'b', 'c', 'a', 'b', 'c', 'a']);

    calls.length = 0;
    clone.keys.forEach((key) => visits.set(key, 0));

    // check graph

    graph.run((key, graph) => {
      calls.push(key);
      const count = visits.get(key) || 0;
      visits.set(key, count + 1);
      return count > 0;
    });

    expect(calls).toEqual(['a', 'b', 'c', 'b', 'c', 'a']);

    calls.length = 0;
    graph.keys.forEach((key) => visits.set(key, 0));
  });
});
