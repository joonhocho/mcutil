export const deepEqual = (a: unknown, b: unknown) => {
  if (a === b) return true;
  // eslint-disable-next-line no-self-compare
  if (a !== a && b !== b) return true; // both NaN

  if (
    a == null ||
    b == null ||
    typeof a !== typeof b ||
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)
  )
    return false;

  if (Array.isArray(a)) {
    // both array
    const bArr = b as Array<unknown>;
    if (a.length !== bArr.length) return false;

    for (let i = 0, l = a.length; i < l; i += 1) {
      if (!deepEqual(a[i], bArr[i])) return false;
    }

    return true;
  }

  // both object
  const aKeys = Object.keys(a) as Array<keyof typeof a>;
  const bKeys = Object.keys(b) as Array<keyof typeof b>;
  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0, l = aKeys.length; i < l; i += 1) {
    const key = aKeys[i];
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
};
