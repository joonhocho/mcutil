import { useEffect } from 'react';
import { PubSub, PubSubHandler } from '../class/PubSub.js';

export const useSubscriber = <Params extends any[]>(
  v: PubSub<Params>,
  handler: PubSubHandler<Params>,
  deps: any[] = [v]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useEffect(() => v.on(handler), deps);
