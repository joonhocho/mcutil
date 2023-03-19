export const parseInteger = (str: string | null | undefined): number | null => {
  if (!str) return null;
  try {
    const res = parseInt(str.trim(), 10);
    return isFinite(res) ? res : null;
  } catch (e) {
    return null;
  }
};

export const parseNumber = (str: string | null | undefined): number | null => {
  if (!str) return null;
  try {
    const res = parseFloat(str.trim());
    return isFinite(res) ? res : null;
  } catch (e) {
    return null;
  }
};

export const numberRange = (start: number, end: number, step = 1): number[] => {
  const length = Math.ceil((end - start) / step);
  if (length < 1) return [];

  const arr: number[] = new Array(length);

  let i = 0;
  for (let n = start; n < end; n += step) {
    arr[i] = n;
    i += 1;
  }

  return arr;
};
