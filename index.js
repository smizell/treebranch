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

    let val = matcher.match(item);
    return val;
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
  if (Number.isInteger(arg)) {
    return new NumNode(arg);
  }
  if (Array.isArray(arg)) {
    return new ArrNode(arg.map(handleValue));
  }
  if ((typeof arg) === 'string') {
    return new StrNode(arg);
  }
  if ((typeof arg) === 'boolean') {
    return new BoolNode(arg);
  }
  if (arg === null) {
    return new NullNode();
  }
  if (arg === undefined) {
    return new UndefNode();
  }
  if (arg.constructor === Object) {
    let pairs = Object.keys(arg).map((key) => {
      return [handleValue(key), handleValue(arg[key])];
    })
    return new ObjNode(pairs)
  }
  if ((typeof arg) === 'function') {
    return new FuncNode(arg);
  }
  if (arg instanceof ExprNode) {
    return arg
  }

  throw TypeError(`Cannot handle arg ${arg}`)
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
  // Expressions are namespaced with the language name
  if (item instanceof ExprNode) {
    return [`${item.info.langName}/${item.name}`].concat(item.args.map(toList));
  }
  if (item instanceof NumNode) {
    return ['number', item.value];
  }
  if (item instanceof StrNode) {
    return ['string', item.value];
  }
  if (item instanceof BoolNode) {
    return ['boolean', item.value];
  }
  if (item instanceof NullNode) {
    return ['null'];
  }
  if (item instanceof UndefNode) {
    return ['undefined'];
  }
  if (item instanceof ArrNode) {
    return ['array'].concat(item.items.map(toList));
  }
  if (item instanceof ObjNode) {
    return ['object'].concat(item.pairs.map((item) => {
      return [toList(item[0]), toList(item[1])];
    }));
  }
  // Native functions cannot be serialized
  if (item instanceof FuncNode) {
    return ['native-function']
  }

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
