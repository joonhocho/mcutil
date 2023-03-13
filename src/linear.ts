export interface IPoint {
  x: number;
  y: number;
}

export interface ILinearEquation {
  a: number;
  b: number;
  c: number;
  denominator: number;
}

export interface ISlopeEquation {
  slope: number;
  xIntercept: number;
  yIntercept: number;
}

export const calcLinearEquationFromTwoPoints = (
  p1: IPoint,
  p2: IPoint,
  { yIntercept: yInterceptOffset = 0 }: { yIntercept?: number } = {}
): ILinearEquation & ISlopeEquation => {
  // slope form
  // y = mx + y0

  const slope = (p2.y - p1.y) / (p2.x - p1.x);

  // y0 = y - mx
  const yIntercept = p1.y - slope * p1.x + yInterceptOffset;

  // 0 = mx0 + y0
  // -y0 = mx0
  // -y0 / m = x0
  const xIntercept = -yIntercept / slope;

  // linear equation
  // ax + by + c = 0
  // mx - y + y0 = 0

  const a = slope;
  const b = -1;
  const c = yIntercept;

  const denominator = -Math.sqrt(a ** 2 + b ** 2);

  return { slope, xIntercept, yIntercept, a, b, c, denominator };
};

// https://brilliant.org/wiki/dot-product-distance-between-point-and-a-line/
export const calcDistanceBetweenPointAndLine = (
  { x, y }: IPoint,
  { a, b, c }: ILinearEquation
) => -(a * x + b * y + c) / Math.sqrt(a * a + b * b);
