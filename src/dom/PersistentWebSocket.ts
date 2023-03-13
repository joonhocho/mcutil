import { findLastIndex } from '../array.js';
import {
  IPersistentWebSocketStateProps,
  PersistentWebSocketState,
} from '../class/PersistentWebSocketState.js';

export type WebSocketEventType = keyof WebSocketEventMap;

export type WebSocketListener<K extends WebSocketEventType> = (
  this: WebSocket,
  ev: WebSocketEventMap[K]
) => any;

export interface IPersistentWebSocketConfig
  extends Partial<
    Pick<
      IPersistentWebSocketStateProps,
      'shouldReconnect' | 'urls' | 'urlIndex' | 'delay0' | 'maxRetryCount'
    >
  > {
  urls: string[]; // required
  autoConnect?: boolean;
  getNextDelay?: (prevDelay: number, retries: number) => number;
}

const defaultGetNextDelay = (d: number) => 1.5 * d;

export class PersistentWebSocket {
  ws: WebSocket | null = null;

  getNextDelay: (prevDelay: number, retries: number) => number;

  state: PersistentWebSocketState;

  protected _listeners: Array<{
    type: WebSocketEventType;
    listener: WebSocketListener<WebSocketEventType>;
  }> = [];

  protected _queueId: number | null = null;

  constructor({
    autoConnect = true,
    getNextDelay = defaultGetNextDelay,
    ...initialState
  }: IPersistentWebSocketConfig) {
    this.getNextDelay = getNextDelay;

    this.state = new PersistentWebSocketState(
      {
        status: 'initialized',
        shouldReconnect: true,
        urlIndex: 0,
        delay0: 100,
        delay: 100,
        delayMin: 100,
        delayMax: (60 * 1000) / 5,
        retryCount: 0,
        maxRetryCount: Infinity,
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

    if (autoConnect) {
      this.connect();
    }
  }

  destroy() {
    this._clearQueue();

    this.close();
    this.clearListeners();

    this.state.status = 'destroyed';

    this.state.$destroy();
  }

  clearListeners() {
    const { ws, _listeners } = this;
    if (ws) {
      for (let i = 0, il = _listeners.length; i < il; i += 1) {
        const item = _listeners[i];
        ws.removeEventListener(item.type, item.listener);
      }
    }
    _listeners.length = 0;
  }

  close(code?: number, reason?: string): void {
    const { ws, _listeners } = this;
    if (ws == null) return;

    this.ws = null;

    try {
      ws.close(code, reason);
    } catch (e) {
      // ??? ignore
      console.error(e);
    }

    this.state.status = 'closed';

    ws.removeEventListener('open', this._handleOpen);
    ws.removeEventListener('close', this._handleClose);
    ws.removeEventListener('error', this._handleError);

    if (ws) {
      for (let i = 0, il = _listeners.length; i < il; i += 1) {
        const item = _listeners[i];
        ws.removeEventListener(item.type, item.listener);
      }
    }
  }

  protected _addListeners() {
    const { ws, _listeners } = this;
    if (ws == null) return;

    ws.addEventListener('open', this._handleOpen);
    ws.addEventListener('close', this._handleClose);
    ws.addEventListener('error', this._handleError);

    if (ws) {
      for (let i = 0, il = _listeners.length; i < il; i += 1) {
        const item = _listeners[i];
        ws.addEventListener(item.type, item.listener);
      }
    }
  }

  protected _createWebSocket(url: string) {
    try {
      const ws = new WebSocket(url);
      this.ws = ws;

      this._addListeners();
    } catch (e) {
      this.state.status = 'error';
    }
  }

  connect(): void {
    this._clearQueue();

    if (!this.state.canConnect) return;

    const { url } = this.state;
    if (!url) return;

    this.state.status = 'connecting';

    this._createWebSocket(url);
  }

  reconnect(force = true) {
    this._clearQueue();
    this.close();

    if (!force && !this.state.shouldReconnect) return;

    this.state.$update((prev) => ({
      retryCount: prev.retryCount + 1,
      urlIndex: prev.urlIndex + 1,
    }));

    if (!this.state.canConnect) return;

    const { url } = this.state;
    if (!url) return;

    this.state.status = 'reconnecting';

    this._createWebSocket(url);
  }

  on<K extends WebSocketEventType>(
    type: K,
    listener: WebSocketListener<K>
  ): VoidFunction {
    this._listeners.push({
      type,
      listener: listener as WebSocketListener<WebSocketEventType>,
    });
    this.ws?.addEventListener(type, listener);

    return this.off.bind(
      this,
      type,
      listener as WebSocketListener<WebSocketEventType>
    );
  }

  off<K extends WebSocketEventType>(
    type: K,
    listener: WebSocketListener<K>
  ): void {
    const index = findLastIndex(
      this._listeners,
      (item) => item.type === type && item.listener === listener
    );
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }

    this.ws?.removeEventListener(type, listener);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    try {
      return this.ws?.send(data);
    } catch (e) {
      this.state.status = 'error';
    }
  }

  protected _clearQueue() {
    if (this._queueId != null) {
      clearTimeout(this._queueId);
      this._queueId = null;
    }
  }

  protected _queueReconnect() {
    if (this._queueId != null || !this.state.canReconnect) return;

    const { delay } = this.state;

    this.state.$updateKey('delay', (delay, prev) =>
      Math.round(this.getNextDelay(delay, prev.retryCount))
    );

    this._queueId = setTimeout(() => this.reconnect(false), delay);
  }

  protected _handleOpen = (e: Event) => {
    this._clearQueue();

    this.state.$update((prev) => ({
      status: 'connected',
      retryCount: 0,
      delay: prev.delay0,
    }));
  };

  protected _handleClose = (e: CloseEvent) => {
    this.state.status = 'closed';
  };

  protected _handleError = (e: Event) => {
    this.state.status = 'error';
  };

  protected _handleTimeout = (e: Event) => {
    this.state.status = 'error';
  };
}
