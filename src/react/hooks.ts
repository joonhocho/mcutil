import { useCallback, useEffect, useState } from 'react';

export const useWindowEvent = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  deps: any[],
  options?: boolean | AddEventListenerOptions
) =>
  useEffect(() => {
    window.addEventListener(type, listener, options);
    return () => window.removeEventListener(type, listener, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

export const useDocumentEvent = <K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any,
  deps: any[],
  options?: boolean | AddEventListenerOptions | undefined
) =>
  useEffect(() => {
    document.addEventListener(type, listener, options);
    return () => document.removeEventListener(type, listener, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

export const useRerender = () => {
  const [, set] = useState<any>();
  return useCallback(() => set({}), [set]);
};

export const useToggle = (
  initialValue = false,
  stopEvent = true
): [boolean, () => void, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(
    (e?: MouseEvent | React.MouseEvent) => {
      if (stopEvent && e) {
        if (typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        if (typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
        if (typeof (e as MouseEvent).stopImmediatePropagation === 'function') {
          (e as MouseEvent).stopImmediatePropagation();
        }
      }
      setValue((x) => !x);
    },
    [setValue, stopEvent]
  );
  return [value, toggle, setValue];
};
