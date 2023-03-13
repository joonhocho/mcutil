export const setDeep = <T>(
  obj: T,
  path: Array<number | string>,
  value: unknown
): T => {
  if (!path.length) return value as T;

  let cur: any = obj;
  for (let i = 0, l = path.length; i < l; i += 1) {
    cur = cur[path[i]];
  }

  // not changed
  if (cur === value) return obj;

  const root = (Array.isArray(obj) ? obj.slice() : { ...obj }) as T;
  cur = root;
  for (let i = 0, l = path.length - 1; i < l; i += 1) {
    const key = path[i];
    let next = cur[key];
    next = Array.isArray(next) ? next.slice() : { ...next };
    cur[key] = next;
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
  return root;
};
