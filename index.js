class ExprNode {
  constructor(name, args = [], info = {}) {
    this.name = name;
    this.args = args;
    this.info = info;
  }
}

class NumNode {
  constructor(value) {
    this.value = value;
  }
}

class TreeBranch {
  constructor() {
    this.languages = {}
  }

  register(name, obj) {
    this.languages[name] = obj;
    return new Language(Object.keys(obj), { name });
  }

  eval(value) {
    if (!(value instanceof ExprNode)) return value;
    let rest = value.rest.map(this.eval.bind(this))
    return this.functions[value.name](...rest);
  }
}

class Language {
  build(langName, funcNames) {
    return funcNames.reduce((result, funcName) => {
      result[funcName] = this.buildExpression(funcName, langName);
      return result
    }, { _meta: { langName } });
  }

  handleArg(arg) {
    if (Number.isInteger(arg)) {
      return new NumNode(arg);
    }
    return arg;
  }

  buildExpression(funcName, langName) {
    return (...args) => {
      return new ExprNode(funcName, args.map(this.handleArg.bind(this)), { langName });
    }
  }
}


class Serializer {
  toList(item) {
    if (item instanceof ExprNode) {
      return [`${item.info.langName}/${item.name}`].concat(item.args.map(this.toList.bind(this)));
    }
    if (item instanceof NumNode) {
      return ['number', item.value]
    }
  }
}

module.exports = {
  TreeBranch,
  Language,
  Serializer
}
