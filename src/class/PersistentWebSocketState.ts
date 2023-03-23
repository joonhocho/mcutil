import { BaseSmartState, defineSmartState } from './SmartState.js';

import type { SmartState } from './SmartStateTypes.js';

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
        set(update, next, draft) {
          if (next) {
            const status = getWebSocketReadyState(next) || 'connecting';
            if (status !== draft.status) update.status = status;
          }
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
        normalize(next, prev, draft) {
          if (next > (draft.delayMax || 0)) return draft.delayMax || 0;
          if (next < (draft.delayMin || 0)) return draft.delayMin || 0;
          return Math.round(next);
        },
      },
      delayMin: {
        type: 'number',
        set(update, next, draft) {
          if (next != null && draft.delay < next) {
            update.delay = next;
          }
        },
      },
      delayMax: {
        type: 'number',
        set(update, next, draft) {
          if (next != null && draft.delay > next) {
            update.delay = next;
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
