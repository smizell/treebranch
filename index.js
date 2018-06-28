const {
  ExprNode,
  StrNode,
  NumNode,
  BoolNode,
  NullNode,
  UndefNode,
  ArrNode,
  ObjNode,
  FuncNode,
} = require('./lib/nodes');

const { Matcher } = require('./lib/utils');
const valueChecks = require('./lib/valueChecks');


// Create a sort of runtime with a way to register code and create a language
// from it. Once the code is registered, the languages create, the tree built,
// it can then be passed into eval to execute.
class TreeBranch {
  constructor(language) {
    this.registry = {}
    this.languages = {}
  }

  register(langName, obj) {
    let lang = createLanguage(langName, Object.keys(obj));
    this.registry[langName] = obj;
    this.languages[langName] = lang;
    return lang;
  }

  eval(item) {
    let matcher = new Matcher();

    matcher.onNode(ExprNode, (exprNode) => {
      let rest = exprNode.args.map(this.eval.bind(this))
      let func = this.registry[exprNode.info.langName][exprNode.name];
      return func(...rest);
    });

    matcher.onNode(NumNode, numNode => numNode.value);
    matcher.onNode(StrNode, strNode => strNode.value);
    matcher.onNode(BoolNode, boolNode => boolNode.value);
    matcher.onNode(NullNode, _ => null);
    matcher.onNode(UndefNode, _ => undefined);
    matcher.onNode(ArrNode, (arrNode) => arrNode.items.map(this.eval.bind(this)));
    matcher.onNode(FuncNode, funcNode => funcNode.func);

    matcher.onNode(ObjNode, (objNode) => {
      return objNode.pairs.reduce((result, member) => {
        let key = this.eval(member[0]);
        let value = this.eval(member[1]);
        result[key] = value;
        return result;
      }, {});
    });

    return matcher.match(item);
  }
}

function createLanguage(langName, funcNames, expressionBuilder) {
  let expr = expressionBuilder || buildExpression;

  return funcNames.reduce((result, funcName) => {
    result[funcName] = expr(funcName, langName);
    return result
  }, { _meta: { langName } });
}

// Allows for converting JavaScript primitives to node types
function handleValue(arg) {
  let matcher = new Matcher();

  matcher.pattern(valueChecks.isNumber, val => new NumNode(val));
  matcher.pattern(valueChecks.isArray, val => new ArrNode(val.map(handleValue)));
  matcher.pattern(valueChecks.isString, val => new StrNode(val));
  matcher.pattern(valueChecks.isBoolean, val => new BoolNode(val));
  matcher.pattern(valueChecks.isNull, _ => new NullNode());
  matcher.pattern(valueChecks.isUndefined, _ => new UndefNode());
  matcher.pattern(valueChecks.isFunction, val => new FuncNode(val));
  matcher.onNode(ExprNode, val => val);

  matcher.pattern(valueChecks.isObject, (val) => {
    let pairs = Object.keys(val).map((key) => {
      return [handleValue(key), handleValue(arg[key])];
    })
    return new ObjNode(pairs)
  });

  return matcher.match(arg);

}

// Used for creating the language. It takes arguments and converts them to
// nodes.
function buildExpression(funcName, langName) {
  return (...args) => {
    return new ExprNode(funcName, args.map(handleValue), { langName });
  }
}

// Converts a tree of nodes to some other representation
let serializers = {
  toList
}

function toList(item) {
  let matcher = new Matcher();

  matcher.onNode(ExprNode, (exprNode) => {
    return [`${exprNode.info.langName}/${exprNode.name}`].concat(exprNode.args.map(toList));
  });

  matcher.onNode(NumNode, numNode => ['number', numNode.value]);
  matcher.onNode(StrNode, strNode => ['string', strNode.value]);
  matcher.onNode(BoolNode, boolNode => ['boolean', boolNode.value]);
  matcher.onNode(NullNode, _ => ['null']);
  matcher.onNode(UndefNode, _ => ['undefined']);
  matcher.onNode(ArrNode, arrNode => ['array'].concat(arrNode.items.map(toList)));
  matcher.onNode(FuncNode, _ => ['native-function']);

  matcher.onNode(ObjNode, (objNode) => {
    return ['object'].concat(objNode.pairs.map((item) => {
      return [toList(item[0]), toList(item[1])];
    }));
  });

  return matcher.match(item);
}

module.exports = {
  TreeBranch,
  createLanguage,
  serializers,
  ExprNode,
  StrNode,
  NumNode,
  BoolNode,
  NullNode,
  UndefNode,
  ArrNode,
  ObjNode,
  FuncNode,
  handleValue,
}
