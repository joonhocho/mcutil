import { useEffect } from 'react';
import { PubSub } from '../class/PubSub.js';

export const useSubscriber = <Handler extends (...args: any[]) => any>(
  v: PubSub<Handler>,
  handler: Handler,
  deps: any[] = [v]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useEffect(() => v.on(handler), deps);
