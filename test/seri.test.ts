import { expect, test } from '@jest/globals';
import { addClass, deserialize, fromJSON, serialize } from '../src/seri.js';

test('Parent / Child', () => {
  class Child {
    static fromJSON(json: unknown) {
      const data = json as Child;
      const instance = new Child();
      instance.id = data.id;
      instance.date = data.date;
      return instance;
    }

    id = Math.floor(Math.random() * 1000000);

    date = new Date();

    equal(c: Child): boolean {
      return (
        c instanceof Child &&
        c.id === this.id &&
        c.date.getTime() === this.date.getTime()
      );
    }

    toJSON(): object {
      return { id: this.id, date: this.date };
    }
  }

  class Parent extends Child {
    static fromJSON(json: unknown) {
      const data = json as Parent;
      const instance = new Parent();
      instance.id = data.id;
      instance.date = data.date;
      instance.children = data.children.map(fromJSON) as Child[];
      instance.childMap = Object.keys(data.childMap).reduce((obj, key) => {
        obj[key] = fromJSON(data.childMap[key]) as Child;
        return obj;
      }, {} as Record<string, Parent | Child>);
      return instance;
    }

    children: Array<Parent | Child> = [];
    childMap: Record<string, Parent | Child> = {};

    equal(c: Parent | Child): boolean {
      return (
        super.equal(c) &&
        c instanceof Parent &&
        c.children.every((item, i) => item.equal(this.children[i])) &&
        this.children.every((item, i) => item.equal(c.children[i])) &&
        Object.keys(c.childMap).every((key) =>
          c.childMap[key].equal(this.childMap[key])
        ) &&
        Object.keys(this.childMap).every((key) =>
          this.childMap[key].equal(c.childMap[key])
        )
      );
    }

    toJSON(): object {
      const json = super.toJSON();
      return { ...json, children: this.children, childMap: this.childMap };
    }
  }

  addClass(Parent, 'Parent');
  addClass(Child, 'Child');

  const root = new Parent();
  for (let j = 0; j < 3; j += 1) {
    const p = new Parent();
    for (let i = 0; i < 5; i += 1) {
      const c = new Child();
      p.children.push(c);
      p.childMap[c.id] = c;
    }
    root.children.push(p);
    root.childMap[p.id] = p;
  }

  const json = serialize(root);
  // console.log(JSON.stringify(JSON.parse(json), null, 2));

  const copy = deserialize<Parent>(json);
  // console.log(copy);

  expect(root.equal(copy)).toBe(true);
  expect(root).not.toBe(copy);
  expect(deserialize<Parent>(serialize(copy)).equal(root)).toBe(true);
});
