import { BaseSmartState, SmartState, defineSmartState } from './SmartState.js';

import type { WebSocket as NodeWebSocket } from 'ws';

export type BrowserWebSocket = WebSocket;

export type IsomorphicWebSocket = BrowserWebSocket | NodeWebSocket;

export type WebSocketEventType = keyof WebSocketEventMap;

export type PersistentWebSocketStatus =
  | 'initialized'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'error'
  | 'closing'
  | 'closed'
  | 'destroyed'
  | 'timedout';

export interface IPersistentWebSocketStateProps {
  ws: IsomorphicWebSocket | null;
  status: PersistentWebSocketStatus;
  shouldReconnect: boolean;
  canConnect: boolean;
  canReconnect: boolean;
  delay0: number;
  delay: number;
  delayMin: number;
  delayMax: number;
  retryCount: number;
  maxRetryCount: number;
  timeoutDelay: number;
}

export type PersistentWebSocketStateComputedKeys =
  | 'canConnect'
  | 'canReconnect';

export interface IPersistentWebSocketStateJSON
  extends Omit<
    IPersistentWebSocketStateProps,
    PersistentWebSocketStateComputedKeys
  > {}

export interface IPersistentWebSocketStateMethods {}

export interface IPersistentWebSocketStateConfig {}

export const getWebSocketReadyState = (
  ws: IsomorphicWebSocket
): 'closed' | 'closing' | 'connecting' | 'open' | null => {
  switch (ws.readyState) {
    case ws.CLOSED:
      return 'closed';
    case ws.CLOSING:
      return 'closing';
    case ws.CONNECTING:
      return 'connecting';
    case ws.OPEN:
      return 'open';
  }
  return null;
};

export const PersistentWebSocketState = defineSmartState<
  IPersistentWebSocketStateProps,
  PersistentWebSocketStateComputedKeys,
  IPersistentWebSocketStateMethods,
  IPersistentWebSocketStateConfig
>(
  {
    statics: {
      name: 'PersistentWebSocketState',
      fromJSON: (json: any): any =>
        new PersistentWebSocketState(json.state, json.config),
    },
    properties: {
      ws: {
        type: 'object',
        toJSON: false,
        didSet(next, prev, draft) {
          if (next) draft.status = getWebSocketReadyState(next) || 'connecting';
        },
      },
      status: {
        type: 'string',
      },
      shouldReconnect: {
        type: 'boolean',
      },
      delay0: {
        type: 'number',
        valid(next) {
          return typeof next === 'number' && next >= 0 && isFinite(next);
        },
        normalize(next) {
          return Math.round(next);
        },
      },
      delay: {
        type: 'number',
        valid(next) {
          return typeof next === 'number' && next >= 0 && isFinite(next);
        },
        normalize(next) {
          return Math.round(next);
        },
        willSet(next, prev, draft) {
          if (next != null) {
            if (next > draft.delayMax) {
              draft.delay = draft.delayMax;
            } else if (next < draft.delayMin) {
              draft.delay = draft.delayMin;
            }
          }
        },
      },
      delayMin: {
        type: 'number',
        willSet(next, prev, draft) {
          if (next != null) {
            if (draft.delay < next) {
              draft.delay = next;
            }
          }
        },
      },
      delayMax: {
        type: 'number',
        willSet(next, prev, draft) {
          if (next != null) {
            if (draft.delay > next) {
              draft.delay = next;
            }
          }
        },
      },
      retryCount: {
        type: 'number',
      },
      maxRetryCount: {
        type: 'number',
      },
      timeoutDelay: {
        type: 'number',
      },
    },
    computed: {
      canConnect: {
        type: 'boolean',
        deps: ['status'],
        get({ status }) {
          return (
            status !== 'connecting' &&
            status !== 'open' &&
            status !== 'reconnecting' &&
            status !== 'closing' &&
            status !== 'destroyed'
          );
        },
      },
      canReconnect: {
        type: 'boolean',
        deps: ['retryCount', 'maxRetryCount', 'canConnect'],
        get({ retryCount, maxRetryCount, canConnect }) {
          return retryCount <= maxRetryCount && !!canConnect;
        },
      },
    },
    drafts: [],
  },
  class extends BaseSmartState<
    IPersistentWebSocketStateProps,
    PersistentWebSocketStateComputedKeys,
    IPersistentWebSocketStateMethods,
    IPersistentWebSocketStateConfig
  > {}
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PersistentWebSocketState = SmartState<
  IPersistentWebSocketStateProps,
  PersistentWebSocketStateComputedKeys,
  IPersistentWebSocketStateMethods,
  IPersistentWebSocketStateConfig
>;
