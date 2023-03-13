import { compile, parse } from 'subscript';

function sum(): number {
  let sum = 0;
  for (let i = 0, il = arguments.length; i < il; i += 1) {
    const arg = arguments[i];
    if (typeof arg === 'number') {
      sum += arg;
    }
  }
  return sum;
}

function avg(): number {
  let sum = 0;
  let count = 0;
  for (let i = 0, il = arguments.length; i < il; i += 1) {
    const arg = arguments[i];
    if (typeof arg === 'number') {
      sum += arg;
      count++;
    }
  }
  return sum / count;
}

export type MathExprFunc = (vars: number[]) => number;

export const compileMathExpr = (expr: string): MathExprFunc | null => {
  try {
    const ast = parse(expr);
    const run = compile(ast);
    return (vars: number[]): number => {
      const context: Record<string, number | Function> = {
        avg,
        sum,
        E: Math.E,
        LN10: Math.LN10,
        LN2: Math.LN2,
        LOG2E: Math.LOG2E,
        LOG10E: Math.LOG10E,
        PI: Math.PI,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
        abs: Math.abs,
        acos: Math.acos,
        asin: Math.asin,
        atan: Math.atan,
        atan2: Math.atan2,
        ceil: Math.ceil,
        cos: Math.cos,
        exp: Math.exp,
        floor: Math.floor,
        log: Math.log,
        max: Math.max,
        min: Math.min,
        pow: Math.pow,
        random: Math.random,
        round: Math.round,
        sin: Math.sin,
        sqrt: Math.sqrt,
        tan: Math.tan,
      };
      for (let i = 0, il = vars.length; i < il; i += 1) {
        context[`$${i + 1}`] = vars[i];
      }
      try {
        const res = run(context);
        return typeof res === 'number' && isFinite(res) ? res : NaN;
      } catch (e) {
        console.error(e);
        return NaN;
      }
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};
