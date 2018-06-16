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
  constructor(language) {
    this.registry = {}
    this.language = language || new Language();
  }

  register(langName, obj) {
    this.registry[langName] = obj;
    return this.language.build(langName, Object.keys(obj));
  }

  eval(item) {
    if (item instanceof ExprNode) {
      let rest = item.args.map(this.eval.bind(this))
      let func = this.registry[item.info.langName][item.name];
      return func(...rest);
    }
    if (item instanceof NumNode) {
      return item.value
    }
  }
}

class Language {
  build(langName, funcNames) {
    return funcNames.reduce((result, funcName) => {
      result[funcName] = this.buildExpression(funcName, langName);
      return result
    }, { _meta: { langName } });
  }

  handleArgs(args) {
    return args.map((arg) => {
      if (Number.isInteger(arg)) {
        return new NumNode(arg);
      }
      return arg;
    });
  }

  buildExpression(funcName, langName) {
    return (...args) => {
      return new ExprNode(funcName, this.handleArgs(args), { langName });
    }
  }
}


let serializers = {
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
  serializers
}
