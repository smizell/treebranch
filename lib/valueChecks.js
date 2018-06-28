module.exports = {
  isNumber,
  isArray,
  isString,
  isBoolean,
  isNull,
  isUndefined,
  isObject,
  isFunction,
}

function isNumber(val) {
  return Number.isInteger(val);
}

function isArray(val) {
  return Array.isArray(val);
}

function isString(val) {
  return (typeof val) === 'string';
}

function isBoolean(val) {
  return (typeof val) === 'boolean';
}

function isNull(val) {
  return val === null;
}

function isUndefined(val) {
  return val === undefined;
}

function isObject(val) {
  return val.constructor === Object;
}

function isFunction(val) {
  return (typeof val) === 'function';
}
