import { expect, jest, test } from '@jest/globals';
import { EventEmitter } from '../src/class/EventEmitter';
import { IPersistentWebSocketStateProps } from '../src/class/PersistentWebSocketState';
import {
  IsomorphicWebSocket,
  PersistentWebSocket,
} from '../src/dom/PersistentWebSocket';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

test('PubSub', () => {
  const emitter = new EventEmitter();

  let ws = {
    readyState: 0,
    addEventListener(type, fn) {
      emitter.on(type, fn);
    },
    removeEventListener(type, fn) {
      emitter.off(type, fn);
    },
    send: jest.fn() as any,
    close: jest.fn() as any,
  } as IsomorphicWebSocket;

  const onMessage = jest.fn();

  const settings: Partial<IPersistentWebSocketStateProps> = {
    delay0: 100,
    delayMax: 12000,
    delayMin: 100,
    maxRetryCount: Infinity,
    timeoutDelay: 0,
  };

  const pws = new PersistentWebSocket({
    createWebSocket: jest.fn(
      () =>
        (ws = {
          readyState: 0,
          addEventListener(type, fn) {
            emitter.on(type, fn);
          },
          removeEventListener(type, fn) {
            emitter.off(type, fn);
          },
          send: jest.fn() as any,
          close: jest.fn() as any,
        } as IsomorphicWebSocket)
    ),
    getNextDelay(prev) {
      return prev * 3;
    },
    ...settings,
  });

  pws.on('message', onMessage as any);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'connecting',
  });

  const openMessaage = {};
  emitter.emit('open', openMessaage);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'open',
  });

  const errorMsg = {};
  emitter.emit('error', errorMsg);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 0,
    shouldReconnect: true,
    status: 'closed',
  });

  // Fast-forward until all timers have been executed
  jest.advanceTimersToNextTimer();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 1,
    shouldReconnect: true,
    status: 'connecting',
  });

  // no timeout wait forever
  jest.advanceTimersToNextTimer();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 1,
    shouldReconnect: true,
    status: 'connecting',
  });

  // no timeout wait forever
  jest.advanceTimersByTime(60000);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 1,
    shouldReconnect: true,
    status: 'connecting',
  });

  emitter.emit('open', openMessaage);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'open',
  });

  expect(onMessage).toHaveBeenCalledTimes(0);

  emitter.emit('message', 'hi');

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith('hi');
  onMessage.mockClear();

  emitter.emit('message', 2);

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith(2);
  onMessage.mockClear();

  // close

  emitter.emit('close', openMessaage);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 0,
    shouldReconnect: true,
    status: 'closed',
  });

  // message when closed

  emitter.emit('message', 3);

  expect(onMessage).toHaveBeenCalledTimes(0);
  onMessage.mockClear();

  // no timeout wait forever
  jest.advanceTimersByTime(60000);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 1,
    shouldReconnect: true,
    status: 'connecting',
  });

  emitter.emit('message', 4);

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith(4);
  onMessage.mockClear();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'open',
  });

  emitter.emit('message', 5);

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith(5);
  onMessage.mockClear();
});

test('PubSub timeout', () => {
  const emitter = new EventEmitter();

  let ws = {
    readyState: 0,
    addEventListener(type, fn) {
      emitter.on(type, fn);
    },
    removeEventListener(type, fn) {
      emitter.off(type, fn);
    },
    send: jest.fn() as any,
    close: jest.fn() as any,
  } as IsomorphicWebSocket;

  const onMessage = jest.fn();

  const settings: Partial<IPersistentWebSocketStateProps> = {
    delay0: 100,
    delayMax: 12000,
    delayMin: 100,
    maxRetryCount: Infinity,
    timeoutDelay: 10000,
  };

  const pws = new PersistentWebSocket({
    createWebSocket: jest.fn(
      () =>
        (ws = {
          readyState: 0,
          addEventListener(type, fn) {
            emitter.on(type, fn);
          },
          removeEventListener(type, fn) {
            emitter.off(type, fn);
          },
          send: jest.fn() as any,
          close: jest.fn() as any,
        } as IsomorphicWebSocket)
    ),
    getNextDelay(prev) {
      return prev * 3;
    },
    ...settings,
  });

  pws.on('message', onMessage as any);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'connecting',
  });

  const openMessaage = {};
  emitter.emit('open', openMessaage);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'open',
  });

  const errorMsg = {};
  emitter.emit('error', errorMsg);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 0,
    shouldReconnect: true,
    status: 'closed',
  });

  // Fast-forward until all timers have been executed
  jest.advanceTimersToNextTimer();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 1,
    shouldReconnect: true,
    status: 'connecting',
  });

  // no timeout wait forever
  jest.advanceTimersToNextTimer();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 900,
    retryCount: 1,
    shouldReconnect: true,
    status: 'closed',
  });

  // no timeout wait forever
  jest.advanceTimersToNextTimer();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 900,
    retryCount: 2,
    shouldReconnect: true,
    status: 'connecting',
  });

  emitter.emit('open', openMessaage);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'open',
  });

  expect(onMessage).toHaveBeenCalledTimes(0);

  emitter.emit('message', 'hi');

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith('hi');
  onMessage.mockClear();

  emitter.emit('message', 2);

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith(2);
  onMessage.mockClear();

  // close

  emitter.emit('close', openMessaage);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 300,
    retryCount: 0,
    shouldReconnect: true,
    status: 'closed',
  });

  // message when closed

  emitter.emit('message', 3);

  expect(onMessage).toHaveBeenCalledTimes(0);
  onMessage.mockClear();

  // no timeout wait forever
  jest.advanceTimersByTime(60000);

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 12000,
    retryCount: 5,
    shouldReconnect: true,
    status: 'connecting',
  });

  emitter.emit('message', 4);

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith(4);
  onMessage.mockClear();

  expect(pws.state.toJSON().state).toEqual({
    ...settings,
    delay: 100,
    retryCount: 0,
    shouldReconnect: true,
    status: 'open',
  });

  emitter.emit('message', 5);

  expect(onMessage).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenLastCalledWith(5);
  onMessage.mockClear();
});
