import { cyrb53 } from './hash.js';

export const robohash = (text: string, set = 'set4', size = 200): string =>
  `https://robohash.org/${cyrb53(
    text
  )}?set=${set}&bgset=bg1&size=${size}x${size}`;

export const uiAvatars = (text: string) =>
  `https://ui-avatars.com/api/?name=${cyrb53(text)}`;
