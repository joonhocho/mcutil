import { expect, jest, test } from '@jest/globals';
import {
  EVENTEMITTER_BREAK,
  EventEmitter,
  EventEmitterHandler,
} from '../src/class/EventEmitter';

test('EventEmitter', () => {
  type Point = { x: number; y: number };
  type Person = { age: number; name: string };

  const ps = new EventEmitter<{ e1: [Person, Point]; e2: [Point] }>();

  const h1 = { age: 1, name: 'a' };
  const h2 = { age: 2, name: 'b' };
  const p1 = { x: 1, y: 2 };
  const p2 = { x: 2, y: 3 };

  expect(ps.emit('e1', h1, p1)).toEqual([h1, p1]);

  const on1 = jest.fn<EventEmitterHandler<[Person, Point]>>();

  ps.on('e1', on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.emit('e1', h2, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h2, p2);
  on1.mockClear();

  ps.emit('e1', h2, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h2, p2);
  on1.mockClear();

  ps.emit('e1', h1, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p2);
  on1.mockClear();

  ps.off('e1', on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // repeat on off

  ps.on('e1', on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.emit('e1', h2, p2);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h2, p2);
  on1.mockClear();

  ps.off('e1', on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // once

  ps.once('e1', on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.emit('e1', h2, p2);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // multiple listeners

  const on2 = jest.fn<EventEmitterHandler<[Person, Point]>>();
  const on3 = jest.fn<EventEmitterHandler<[Person, Point]>>();

  ps.on('e1', on1);
  ps.on('e1', on2);
  ps.on('e1', on3);
  ps.on('e1', on1);

  // test emit
  ps.emit('e1', h1, p1);

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
  on1.mockImplementationOnce(() => EVENTEMITTER_BREAK);
  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test emit
  ps.off('e1', on2);
  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(1);
  expect(on3).toHaveBeenLastCalledWith(h1, p1);
  on3.mockClear();

  // test emit
  ps.off('e1', on3);
  ps.off('e1', on3);
  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(2);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test emit
  ps.off('e1', on1);
  ps.off('e1', on3);
  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(on2).toHaveBeenCalledTimes(0);
  on2.mockClear();

  expect(on3).toHaveBeenCalledTimes(0);
  on3.mockClear();

  // test clear

  ps.on('e1', on1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  ps.clear();

  ps.emit('e1', h1, p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  // test multi event

  const onE2_1 = jest.fn<EventEmitterHandler<[Point]>>();

  ps.on('e1', on1);
  ps.on('e2', onE2_1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(onE2_1).toHaveBeenCalledTimes(0);
  onE2_1.mockClear();

  ps.emit('e1', h1, p1);
  ps.emit('e2', p1);

  expect(on1).toHaveBeenCalledTimes(1);
  expect(on1).toHaveBeenLastCalledWith(h1, p1);
  on1.mockClear();

  expect(onE2_1).toHaveBeenCalledTimes(1);
  expect(onE2_1).toHaveBeenLastCalledWith(p1);
  onE2_1.mockClear();

  ps.clear();

  ps.emit('e1', h1, p1);
  ps.emit('e2', p1);

  expect(on1).toHaveBeenCalledTimes(0);
  on1.mockClear();

  expect(onE2_1).toHaveBeenCalledTimes(0);
  onE2_1.mockClear();
});
