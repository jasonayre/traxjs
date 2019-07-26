import get from 'lodash/get';
import set from 'lodash/set';
import some from 'lodash/some';
import isFunction from 'lodash/isFunction';
import map from 'lodash/map';
import includes from 'lodash/includes';
import pick from 'lodash/pick';
import clamp from 'lodash/clamp';
import UUID from 'uuid-js';

export function evaluatePropertyOn(path, binding, ...rest) {
  let value = get(binding, path);

  if(isFunction(value)) {
    let bound = value.bind(binding);
    return some(rest) ?  bound(...rest) : bound();
  } else {
    return value;
  }
}

export function fetch(object, path, resolver) {
  let result = get(object, path);
  if(result != null) return result;
  set(object, path, resolver());
  return get(object, path);
}

export function isRequired(param='param') { throw new Error(`param ${param} is required`) };

export function setProperty(obj, path, value) {
  let segs = path.split(".");
  let property = segs.pop();
  let target_path = segs.join(".");
  let target = get(obj, target_path);

  if(!target && target !== 0) {
    set(obj, path, value);
    return get(obj, path);
  } else if(segs.length === 0) {
    obj[path] = value;
    return value;
  } else {
    target[property] = value;
    return target[property];
  }
}


export function isGetter (obj, prop) {
  return !!obj.__lookupGetter__(prop)
}

export const getInstanceMethods = (obj, excluded=[]) => {
  let keys = []
  let topObject = obj

  const onlyOriginalMethods = (p, i, arr) => {
    return !_.includes(excluded, p) &&
           !isGetter(topObject, p) &&
    typeof topObject[p] === 'function' &&
    p !== 'constructor' &&
    (i === 0 || p !== arr[i - 1]) &&
    keys.indexOf(p) === -1
  }

  do {
    const l = Object.getOwnPropertyNames(obj)
      .sort()
      .filter(onlyOriginalMethods)
    keys = keys.concat(l)

    // walk-up the prototype chain
    obj = Object.getPrototypeOf(obj)
  } while (
    // not the the Object prototype methods (hasOwnProperty, etc...)
    obj && Object.getPrototypeOf(obj)
  )

  return keys
}

export const getInstancePropertyNames = (obj, excluded=[], exclude_private=true) => {
  let keys = [];
  let topObject = obj;

  const onlyProperties = (p, i, arr) => {
    return !includes(excluded, p) &&
    typeof topObject[p] !== 'function' &&
    (exclude_private ? (p[0] !== '_' && p[0] !== '$') : true) &&
    p !== 'constructor' &&
    (i === 0 || p !== arr[i - 1]) &&
    keys.indexOf(p) === -1
  }

  do {
    const l = Object.getOwnPropertyNames(obj)
      .sort()
      .filter(onlyProperties)
    keys = keys.concat(l)

    // walk-up the prototype chain
    obj = Object.getPrototypeOf(obj)
  } while (
    // not the the Object prototype methods (hasOwnProperty, etc...)
    obj && Object.getPrototypeOf(obj)
  )

  return keys
}

export function getInstanceProperties(instance) {
  let property_names = getInstancePropertyNames(instance);
  return pick(instance, property_names);
}

function objectToUrlParams(params) {
  return Object.keys(params).map(key => key + '=' + params[key]).join('&');
}

export function normalize(val, min, max) { return Math.abs(clamp((val - min) / (max - min), 0, 1)) }

//Serialization
//Don't use this unless you know what you're doing
function functionLoader(key, value) {
  if(_.startsWith(value, 'function(')) {
    let template = `this['${key}'] = ${value}`;
    console.log(template, 'template');
    return eval(template);
  } else if(_.startsWith(value, '$$F:')) {
    value = value.replace('$$F:', '');
    let template = `this['${key}'] = ${value}`;
    return eval(template);
  } else {
    return value
  }
}

function functionSerializer(key, value) {
  if(isFunction(value)) {
    return `$$F:${value.toString()}`;
  } else {
    return value
  }
}

export function serialize(data) {
  return JSON.stringify(data, functionSerializer);
}

export function deserialize(data) {
  return JSON.parse(data, functionLoader);
}

export function uuid() {
  return UUID.create().toString();
}
