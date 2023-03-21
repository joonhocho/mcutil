import { addItem } from '../array.js';

export class DependencyGraph<Key extends string> {
  keys: Key[] = [];
  indexMap = new Map<Key, number>();
  complexityMap = new Map<Key, number>();
  dependeesMap = {} as Record<Key, Key[]>;
  dependersMap = {} as Record<Key, Key[]>;

  clone(graph = new DependencyGraph<Key>()): DependencyGraph<Key> {
    const { keys } = this;
    graph.keys = keys.slice();
    graph.indexMap = new Map(this.indexMap);

    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      graph.dependeesMap[key] = this.dependeesMap[key].slice();
      graph.dependersMap[key] = this.dependersMap[key].slice();
    }

    return graph;
  }

  hasKey(key: Key): boolean {
    return this.indexMap.has(key);
  }

  addKey(key: Key): void {
    if (this.indexMap.has(key)) return;

    this.indexMap.set(key, this.keys.length);
    this.keys.push(key);
    this.dependeesMap[key] = [];
    this.dependersMap[key] = [];
  }

  addDependers(dependee: Key, newDependers: Key[]): void {
    this.addKey(dependee);

    const dependers = this.dependersMap[dependee];

    for (let i = 0, il = newDependers.length; i < il; i += 1) {
      const depender = newDependers[i];
      this.addKey(depender);
      addItem(dependers, depender);
      addItem(this.dependeesMap[depender], dependee);
    }
  }

  addDependees(depender: Key, newDependees: Key[]): void {
    this.addKey(depender);

    const dependees = this.dependeesMap[depender];

    for (let i = 0, il = newDependees.length; i < il; i += 1) {
      const dependee = newDependees[i];
      this.addKey(dependee);
      addItem(dependees, dependee);
      addItem(this.dependersMap[dependee], depender);
    }
  }

  sortKeys(keys: Key[]): Key[] {
    const { indexMap } = this;
    return keys.sort((a, b) => (indexMap.get(a) || 0) - (indexMap.get(b) || 0));
  }

  calcComplexity(key: Key, complexities: Map<Key, number>): number {
    if (complexities.has(key)) return 0;

    const dependees = this.dependeesMap[key];

    let complexity = dependees.length;
    if (complexity) {
      for (let i = 0, il = dependees.length; i < il; i += 1) {
        complexities.set(key, complexity);
        complexity += this.calcComplexity(dependees[i], complexities);
      }
    }

    complexities.set(key, complexity);
    return complexity;
  }

  prepare() {
    const { dependersMap, dependeesMap, keys, indexMap } = this;

    const A_IS_BEFORE_B = -1;
    const B_IS_BEFORE_A = 1;

    keys.sort((a, b) => {
      const aDependees = dependeesMap[a];
      const bDependees = dependeesMap[b];
      const aDependers = dependersMap[a];
      const bDependers = dependersMap[b];

      if (aDependees.length === 0) {
        // a is independent
        if (bDependees.length > 0) return A_IS_BEFORE_B;

        // b is independent
        return aDependers.length - bDependers.length;
      }

      // a is not independent
      if (bDependees.length === 0) {
        // b is independent
        return B_IS_BEFORE_A;
      }

      // a nor b is not independent

      // b is dependent on a
      if (aDependers.includes(b)) return A_IS_BEFORE_B;

      // a is dependent on b
      if (bDependers.includes(a)) return B_IS_BEFORE_A;

      return (
        // shorter dependees
        aDependees.length - bDependees.length ||
        // shorter dependers
        aDependers.length - bDependers.length
      );
    });

    for (let i = 0, il = keys.length; i < il; i += 1) {
      indexMap.set(keys[i], i);
    }

    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      this.sortKeys(dependeesMap[key]);
      this.sortKeys(dependersMap[key]);
    }
  }

  prepareByComplexity() {
    const { dependersMap, dependeesMap, keys, indexMap, complexityMap } = this;

    for (let i = 0, il = keys.length; i < il; i += 1) {
      complexityMap.set(keys[i], this.calcComplexity(keys[i], new Map()));
    }

    keys.sort(
      (a, b) => (complexityMap.get(a) || 0) - (complexityMap.get(b) || 0)
    );

    for (let i = 0, il = keys.length; i < il; i += 1) {
      indexMap.set(keys[i], i);
    }

    for (let i = 0, il = keys.length; i < il; i += 1) {
      const key = keys[i];
      this.sortKeys(dependeesMap[key]);
      this.sortKeys(dependersMap[key]);
    }
  }
}
