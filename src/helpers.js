import get from 'lodash/get';
import set from 'lodash/set';
import some from 'lodash/some';
import isFunction from 'lodash/isFunction';
import map from 'lodash/map';
import includes from 'lodash/includes';
import pick from 'lodash/pick';

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


function isGetter (obj, prop) {
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
    (exclude_private ? p[0] !== '_' : true) &&
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
  // return reduce(property_names, (result, prop) => {
  //   result = instance[prop]
  // })
  // return map(property_names, (prop) => { return instance[prop] })
}
