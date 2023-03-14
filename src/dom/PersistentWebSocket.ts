import {
  EventEmitter,
  EventEmitterHandler,
  IEventMap,
} from '../class/EventEmitter.js';
import {
  IPersistentWebSocketStateProps,
  PersistentWebSocketState,
  getWebSocketReadyState,
} from '../class/PersistentWebSocketState.js';
import { AnyFunction, KeyOf } from '../types/types.js';

import type { WebSocket as NodeWebSocket } from 'ws';
export type BrowserWebSocket = WebSocket;

export type IsomorphicWebSocket = BrowserWebSocket | NodeWebSocket;

export type WebSocketEventType = KeyOf<WebSocketEventMap>;

export type WebSocketListener<K extends WebSocketEventType> = (
  this: WebSocket,
  ev: WebSocketEventMap[K]
) => any;

export interface IPersistentWebSocketConfig<WS extends IsomorphicWebSocket>
  extends Partial<
    Pick<
      IPersistentWebSocketStateProps,
      'shouldReconnect' | 'delay0' | 'maxRetryCount' | 'timeoutDelay'
    >
  > {
  createWebSocket(): WS;
  noAutoConnect?: boolean;
  getNextDelay?: (prevDelay: number, retries: number) => number;
}

const defaultGetNextDelay = (d: number) => 1.5 * d;

const DEFAULT_EVENTS: Record<WebSocketEventType, 1> = {
  close: 1,
  error: 1,
  message: 1,
  open: 1,
};

export class PersistentWebSocket<
  WS extends IsomorphicWebSocket,
  EventMap extends IEventMap
> extends EventEmitter<EventMap> {
  _createWebSocket: () => WS;

  getNextDelay: (prevDelay: number, retries: number) => number;

  state: PersistentWebSocketState;

  protected _handlers: {
    [key in KeyOf<EventMap>]?: (...args: any) => void;
  };

  protected _reconnectTimer: NodeJS.Timer | null = null;
  protected _timeoutTimer: NodeJS.Timer | null = null;

  constructor({
    createWebSocket,
    noAutoConnect = false,
    getNextDelay = defaultGetNextDelay,
    timeoutDelay = 0,
    ...initialState
  }: IPersistentWebSocketConfig<WS>) {
    super();

    this._createWebSocket = createWebSocket;
    this.getNextDelay = getNextDelay;

    this.state = new PersistentWebSocketState(
      {
        ws: null,
        status: 'initialized',
        shouldReconnect: true,
        delay0: 100,
        delay: 100,
        delayMin: 100,
        delayMax: (60 * 1000) / 5,
        retryCount: 0,
        maxRetryCount: Infinity,
        timeoutDelay,
        ...initialState,
      },
      {}
    );

    this.state.$onKey('status', (status) => {
      console.debug('PersistentWebSocket.status', status);
      switch (status) {
        case 'closed':
        case 'error':
        case 'timeout':
          this.close();
          break;
      }
    });

    this.state.$on(
      ['shouldReconnect', 'status'],
      ({ shouldReconnect, status }, prev) => {
        if (shouldReconnect && (status === 'closed' || status === 'error')) {
          this._queueReconnect();
        }
      }
    );

    this._handlers = {
      open: this._handleOpen,
      message: this._handleMessage,
      close: this._handleClose,
      error: this._handleError,
    };

    if (!noAutoConnect) {
      this.connect();
    }
  }

  destroy() {
    this._clearTimeoutTimer();
    this._clearReconnectTimer();

    this.close();
    // this._removeListeners();

    this._handlers = {};
    this.state.status = 'destroyed';
    this.state.$destroy();
  }

  on<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): () => void {
    if (!this._handlers[type]) {
      const handler = (...args: any) => {
        this.emit(type, ...args);
      };

      this._handlers[type] = handler;

      (this.state.ws as BrowserWebSocket)?.addEventListener(type, handler);
    }
    return super.on(type, fn);
  }

  once<Type extends KeyOf<EventMap>>(
    type: Type,
    fn: EventEmitterHandler<EventMap[Type]>
  ): () => void {
    if (!this._handlers[type]) {
      const handler = (...args: any) => {
        this.emit(type, ...args);
      };

      this._handlers[type] = handler;

      (this.state.ws as BrowserWebSocket)?.addEventListener(type, handler);
    }
    return super.once(type, fn);
  }

  protected _addListeners(ws = this.state.ws) {
    if (ws == null) return;

    const events = this._handlers;
    for (const type in events) {
      const fn = events[type];
      if (fn) (ws as BrowserWebSocket).addEventListener(type, fn);
    }
  }

  protected _removeListeners(ws = this.state.ws) {
    if (ws == null) return;

    const events = this._handlers;
    for (const type in events) {
      const fn = events[type];
      if (fn) (ws as BrowserWebSocket).removeEventListener(type, fn);
    }
  }

  protected _initWebSocket() {
    try {
      this._clearTimeoutTimer();

      const ws = this._createWebSocket();
      this.state.ws = ws;

      this._addListeners(ws);

      const { timeoutDelay } = this.state;
      if (timeoutDelay > 0) {
        this._timeoutTimer = setTimeout(this._handleTimeout, timeoutDelay);
      }
    } catch (e) {
      this.state.status = 'error';
    }
  }

  close(code?: number, reason?: string): void {
    const { ws } = this.state;
    if (ws == null) return;

    this._clearTimeoutTimer();
    this.state.$set({ ws: null, status: 'closing' });

    try {
      const status = getWebSocketReadyState(ws);
      if (!(status === 'closed' || status === 'closing')) {
        ws.close(code, reason);
      }
    } catch (e) {
      // ??? ignore
      console.error(e);
    }

    this._removeListeners(ws);

    this.state.status = 'closed';
  }

  connect(): boolean {
    this._clearTimeoutTimer();
    this._clearReconnectTimer();

    if (!this.state.canConnect) return false;

    this.state.status = 'connecting';

    this._initWebSocket();

    return true;
  }

  reconnect(force = true): boolean {
    this._clearTimeoutTimer();
    this._clearReconnectTimer();
    this.close();

    if (!force && !this.state.shouldReconnect) return false;

    this.state.$update((prev) => ({
      retryCount: prev.retryCount + 1,
    }));

    if (!this.state.canConnect) return false;

    this.state.status = 'reconnecting';

    this._initWebSocket();

    return true;
  }

  send(...data: any): void {
    (this.state.ws?.send as AnyFunction)(...data);
  }

  protected _clearTimeoutTimer() {
    if (this._timeoutTimer != null) {
      clearTimeout(this._timeoutTimer);
      this._timeoutTimer = null;
    }
  }

  protected _clearReconnectTimer() {
    if (this._reconnectTimer != null) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  protected _queueReconnect() {
    if (this._reconnectTimer != null || !this.state.canReconnect) return;

    const { delay } = this.state;

    this.state.$updateKey('delay', (delay, prev) =>
      Math.round(this.getNextDelay(delay, prev.retryCount))
    );

    this._reconnectTimer = setTimeout(() => this.reconnect(false), delay);
  }

  protected _handleOpen = (...args: any) => {
    this._clearTimeoutTimer();
    this._clearReconnectTimer();

    this.state.$update((prev) => ({
      status: 'open',
      retryCount: 0,
      delay: prev.delay0,
    }));

    this.emit('open', ...args);
  };

  protected _handleMessage = (...args: any) => {
    if (this.state.status !== 'open') {
      this._clearTimeoutTimer();
      this._clearReconnectTimer();

      this.state.$update((prev) => ({
        status: 'open',
        retryCount: 0,
        delay: prev.delay0,
      }));
    }

    this.emit('message', ...args);
  };

  protected _handleClose = (...args: any) => {
    this._clearTimeoutTimer();
    this.state.status = 'closed';
    this.emit('closed', ...args);
  };

  protected _handleError = (...args: any) => {
    this._clearTimeoutTimer();
    this.state.status = 'error';
    this.emit('error', ...args);
  };

  protected _handleTimeout = (...args: any) => {
    this._clearTimeoutTimer();
    this.state.status = 'timeout';
    this.emit('timeout', ...args);
  };
}
