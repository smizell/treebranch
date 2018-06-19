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
    if (item instanceof ExprNode) {
      let rest = item.args.map(this.eval.bind(this))
      let func = this.registry[item.info.langName][item.name];
      return func(...rest);
    }
    if (item instanceof NumNode ||
      item instanceof StrNode ||
      item instanceof BoolNode) {
      return item.value
    }
    if (item instanceof NullNode) {
      return null;
    }
    if (item instanceof UndefNode) {
      return undefined;
    }
    if (item instanceof ArrNode) {
      return item.items.map(this.eval.bind(this));
    }
    if (item instanceof FuncNode) {
      return item.func;
    }
    if (item instanceof ObjNode) {
      let result = {};
      let index = 0;

      while (index < item.pairs.length) {
        let key = this.eval(item.pairs[index])
        let value = this.eval(item.pairs[index + 1])
        result[key] = value;
        index = index + 2;
      }

      return result;
    }
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
    let pairs = [];
    for (let key in arg) {
      pairs.push(handleValue(key));
      pairs.push(handleValue(arg[key]));
    }
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
  toList(item) {
    // Expressions are namespaced with the language name
    if (item instanceof ExprNode) {
      return [`${item.info.langName}/${item.name}`].concat(item.args.map(this.toList.bind(this)));
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
      return ['array'].concat(item.items.map(this.toList.bind(this)));
    }
    if (item instanceof ObjNode) {
      return ['object'].concat(item.pairs.map(this.toList.bind(this)));
    }
    // Native functions cannot be serialized
    if (item instanceof FuncNode) {
      return ['native-function']
    }
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
