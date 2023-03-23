import { DependencyGraph } from './DependencyGraph.js';

export class ComputeGraph<Key extends string> extends DependencyGraph<Key> {
  clone(graph = new ComputeGraph<Key>()): ComputeGraph<Key> {
    super.clone(graph);
    return graph;
  }

  run(
    // returns dirty keys, true = all dependers, false = none
    callback: (key: Key, graph: ComputeGraph<Key>) => Key[] | boolean,
    keys?: Array<Key>,
    shouldNotSortKeys?: boolean
  ): void {
    // https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/

    const sortedKeys = keys
      ? shouldNotSortKeys
        ? keys
        : this.sortKeys(keys)
      : this.keys;

    const queue: Array<Key> = [];
    for (let ki = 0, kl = sortedKeys.length; ki < kl; ki += 1) {
      queue.push(sortedKeys[ki]);
    }

    const { dependersMap } = this;

    let curKey: Key | undefined;
    while ((curKey = queue.shift())) {
      const res = callback(curKey, this);
      if (res) {
        const dependers = res === true ? dependersMap[curKey] : res;
        for (let di = 0, dl = dependers.length; di < dl; di += 1) {
          queue.push(dependers[di]);
        }
      }
    }
  }
}
