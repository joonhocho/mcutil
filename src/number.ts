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
