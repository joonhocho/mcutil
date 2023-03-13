import type { IPoint } from './linear.js';

export class Line {
  public slope: number;
  public point: IPoint;

  constructor(p1: IPoint, p2: IPoint) {
    this.slope = (p2.y - p1.y) / (p2.x - p1.x);
    this.point = p1;
  }

  // y0 = y - mx
  get yIntercept() {
    return this.getY(0);
  }

  // 0 = mx0 + y0
  // -y0 = mx0
  // -y0 / m = x0
  get xIntercept() {
    return this.getX(0);
  }

  getY(x: number) {
    // y = p1y + (x - p1x) * slope;
    return this.point.y + (x - this.point.x) * this.slope;
  }

  getX(y: number) {
    // x = (y - p1y) / slope + p1x;
    return (y - this.point.y) / this.slope + this.point.x;
  }
}
