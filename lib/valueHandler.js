const { Matcher } = require('./utils');
const valueChecks = require('./valueChecks');
const nodes = require('./nodes');

module.exports = {
  handleValue,
}

function handleValue(arg) {
  let matcher = new Matcher();

  matcher.pattern(valueChecks.isNumber, val => new nodes.NumNode(val));
  matcher.pattern(valueChecks.isArray, val => new nodes.ArrNode(val.map(handleValue)));
  matcher.pattern(valueChecks.isString, val => new nodes.StrNode(val));
  matcher.pattern(valueChecks.isBoolean, val => new nodes.BoolNode(val));
  matcher.pattern(valueChecks.isNull, _ => new nodes.NullNode());
  matcher.pattern(valueChecks.isUndefined, _ => new nodes.UndefNode());
  matcher.pattern(valueChecks.isFunction, val => new nodes.FuncNode(val));
  matcher.onNode(nodes.ExprNode, val => val);

  matcher.pattern(valueChecks.isObject, (val) => {
    let pairs = Object.keys(val).map((key) => {
      return [handleValue(key), handleValue(arg[key])];
    })
    return new nodes.ObjNode(pairs)
  });

  return matcher.match(arg);
}
