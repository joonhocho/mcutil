import { BaseSmartState, SmartState, defineSmartState } from './SmartState.js';

export type PersistentWebSocketStatus =
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'closed'
  | 'destroyed'
  | 'timeout';

export interface IPersistentWebSocketStateProps {
  status: PersistentWebSocketStatus;
  shouldReconnect: boolean;
  canConnect: boolean;
  canReconnect: boolean;
  urls: string[];
  urlIndex: number;
  url: string | undefined;
  delay0: number;
  delay: number;
  delayMin: number;
  delayMax: number;
  retryCount: number;
  maxRetryCount: number;
}

export type PersistentWebSocketStateComputedKeys =
  | 'canConnect'
  | 'canReconnect'
  | 'url';

export interface IPersistentWebSocketStateJSON
  extends Omit<
    IPersistentWebSocketStateProps,
    PersistentWebSocketStateComputedKeys
  > {}

export interface IPersistentWebSocketStateMethods {}

export interface IPersistentWebSocketStateConfig {}

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
      status: {
        type: 'string',
      },
      shouldReconnect: {
        type: 'boolean',
      },
      urls: {
        type: 'array',
        item: 'string',
        willSet(next, prev, draft) {
          if (next != null) {
            draft.urlIndex = next.length ? draft.urlIndex % next.length : 0;
          }
        },
      },
      urlIndex: {
        type: 'number',
        normalize(next, prev, { urls }) {
          return urls.length ? next % urls.length : 0;
        },
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
    },
    computed: {
      url: {
        type: 'string',
        nullable: true,
        deps: ['urls', 'urlIndex'],
        get({ urls, urlIndex }) {
          return urls[urlIndex];
        },
      },
      canConnect: {
        type: 'boolean',
        deps: ['status', 'url'],
        get({ status, url }) {
          return (
            (status === 'closed' ||
              status === 'error' ||
              status === 'initialized') &&
            url != null &&
            url.length > 0
          );
        },
      },
      canReconnect: {
        type: 'boolean',
        deps: ['status', 'retryCount', 'maxRetryCount', 'url'],
        get({ status, retryCount, maxRetryCount, url }) {
          return (
            retryCount <= maxRetryCount &&
            (status === 'closed' ||
              status === 'error' ||
              status === 'initialized') &&
            url != null &&
            url.length > 0
          );
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
