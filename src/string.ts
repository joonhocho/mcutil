export const normalizeTag = (tag: string | null | undefined): string | null =>
  tag?.trim().replace(/\s+/g, ' ') || null;

export const capitalize = (s: string): string =>
  s[0].toUpperCase() + s.substring(1);

export const labelize = (s: string): string =>
  s
    .split(/[-_\s]+/g)
    .map(capitalize)
    .join(' ');

export const randomString = (): string => Math.random().toString();
