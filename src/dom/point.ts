import { IPoint } from '../types/types.js';

export const toLocalPoint = (el: HTMLElement, point: IPoint): IPoint => {
  const stageBounds = el.getBoundingClientRect();
  return { x: point.x - stageBounds.x, y: point.y - stageBounds.y };
};
