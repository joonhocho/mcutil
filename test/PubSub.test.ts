import { expect, jest, test } from '@jest/globals';
import { PUBSUB_BREAK, PubSub, PubSubHandler } from '../src/class/PubSub';

test('PubSub', () => {
  type Point = { x: number; y: number };
  type Person = { age: number; name: string };

  const ps = new PubSub<[Person, Point]>();

  const h1 = { age: 1, name: 'a' };
  const h2 = { age: 2, name: 'b' };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 2, y: 3 };

  expect(ps.emit(h1, p1)).toEqual([h1, p1]);

  const on1 = jest.fn<PubSubHandler<[Person, Point]>>();

  ps.on(on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.emit(h2, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h2, p2);
  on1.mockClear();

  ps.emit(h2, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h2, p2);
  on1.mockClear();

  ps.emit(h1, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p2);
  on1.mockClear();

  ps.off(on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // repeat on off

  ps.on(on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.emit(h2, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h2, p2);
  on1.mockClear();

  ps.off(on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // once

  ps.once(on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.emit(h2, p2);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // multiple listeners

  const on2 = jest.fn<PubSubHandler<[Person, Point]>>();
  const on3 = jest.fn<PubSubHandler<[Person, Point]>>();

  ps.on(on1);
  ps.on(on2);
  ps.on(on3);
  ps.on(on1);

  // test emit
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(1);
  expect(on2).toHaveBeenLastCalledWith(h1, p1);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(1);
  expect(on3).toHaveBeenLastCalledWith(h1, p1);
  on3.mockClear();

  // break once
  on1.mockImplementationOnce(() => PUBSUB_BREAK);
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test emit
  ps.off(on2);
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(1);
  expect(on3).toHaveBeenLastCalledWith(h1, p1);
  on3.mockClear();

  // test emit
  ps.off(on3);
  ps.off(on3);
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test emit
  ps.off(on1);
  ps.off(on3);
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test clear

  ps.on(on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.clear();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // test off
  const off1 = ps.on(on1);
  const off2 = ps.on(on2);
  const off3 = ps.on(on3);
  const off4 = ps.on(on1);

  // test emit
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(1);
  expect(on2).toHaveBeenLastCalledWith(h1, p1);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(1);
  expect(on3).toHaveBeenLastCalledWith(h1, p1);
  on3.mockClear();

  // test emit
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(1);
  expect(on2).toHaveBeenLastCalledWith(h1, p1);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(1);
  expect(on3).toHaveBeenLastCalledWith(h1, p1);
  on3.mockClear();

  // test emit
  off3();
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(1);
  expect(on2).toHaveBeenLastCalledWith(h1, p1);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test emit
  off1();
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(1);
  expect(on2).toHaveBeenLastCalledWith(h1, p1);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test emit
  off2();
  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // off all again
  off1();
  off2();
  off3();
  off4();

  ps.emit(h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();
});
