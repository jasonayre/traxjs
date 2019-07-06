import isFunction from 'lodash/isFunction';
import filter from 'lodash/filter';
import map from 'lodash/map';
import clamp from 'lodash/clamp';
import set from 'lodash/set';
import each from 'lodash/each';

import {normalize} from './helpers';

export class CurveBuilder {

}

CurveBuilder.MathFunctions = {}

export function linear (t) { return t }
export function easeInQuad(t) { return t*t }
export function easeOutQuad (t) { return t*(2-t) }
export function easeInOutQuad (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }
export function easeInCubic (t) { return t*t*t }
export function easeOutCubic (t) { return (--t)*t*t+1 }
export function easeInOutCubic (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
export function easeInQuart (t) { return t*t*t*t }
export function easeOutQuart (t) { return 1-(--t)*t*t*t }
export function easeInOutQuart (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }
export function easeInQuint (t) { return t*t*t*t*t }
export function easeOutQuint (t) { return 1+(--t)*t*t*t*t }
export function easeInOutQuint (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
export function bellCurve2(x) {
  return clamp(logpdf(x,2,2) * 2, 0, 1);
}

const OtherFunctions = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeInOutCubic,
  easeOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  bellCurve2
}

//bezierCurve algorithm taken from Babylonjs
export function bezierCurve(x, x1, y1, x2, y2) {
  var f0 = 1 - 3 * x2 + 3 * x1;
  var f1 = 3 * x2 - 6 * x1;
  var f2 = 3 * x1;

  var refinedT = t;
  for (var i = 0; i < 5; i++) {
      var refinedT2 = refinedT * refinedT;
      var refinedT3 = refinedT2 * refinedT;

      var x = f0 * refinedT3 + f1 * refinedT2 + f2 * refinedT;
      var slope = 1.0 / (3.0 * f0 * refinedT2 + 2.0 * f1 * refinedT + f2);
      refinedT -= (x - t) * slope;
      refinedT = Math.min(1, Math.max(0, refinedT));

  }

  // Resolve cubic bezier for the given x
  return 3 * Math.pow(1 - refinedT, 2) * refinedT * y1 +
      3 * (1 - refinedT) * Math.pow(refinedT, 2) * y2 +
      Math.pow(refinedT, 3);
}

const AllMathFunctions = filter(map(Object.getOwnPropertyNames(Math), (k) => { return Math[k] }), (f) => { return isFunction(f)});

each([
  ...AllMathFunctions
], (f) => { CurveBuilder.MathFunctions[f.name] = f });

each(OtherFunctions, (v,k) => CurveBuilder.MathFunctions[k] = v);

const CurveFunctionsCache = {}

export const curveBuilder = (compress=2.0, expand=0.5, scale=1, offset=0.0, math_function='sin') => {
  let cache_key = JSON.stringify({compress, expand, scale, offset, math_function});
  let m = CurveBuilder.MathFunctions[math_function];
  if(CurveFunctionsCache[cache_key]) {
    return CurveFunctionsCache[cache_key];
  } else {
    let f = (x) => {
      return clamp(((m(compress * Math.PI * (x - 1/4)) + expand) * scale)+offset, 0, 1) || 0;
    }
    set(CurveFunctionsCache, cache_key, f);
    return f;
  }
}

const NormalizedCurveFunctionsCache = {};
export const normalizedCurve = (compress, expand, scale, offset, math_function, min=0, max=15) => {
  let curve = curveBuilder(compress, expand,scale, offset, math_function);
  let cache_key = JSON.stringify({compress, expand, scale, offset, math_function, min, max});

  if(NormalizedCurveFunctionsCache[cache_key]) {
    return NormalizedCurveFunctionsCache[cache_key];
  } else {
    let f = (x) => {
      return curve(normalize(x, min, max));
    }
    set(NormalizedCurveFunctionsCache, cache_key, f);
    return f;
  }
}
