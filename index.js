class ExprNode {
  constructor(name, args = [], info = {}) {
    this.name = name;
    this.args = args;
    this.info = info;
  }
}

class StrNode {
  constructor(value) {
    this.value = value;
  }
}

class NumNode {
  constructor(value) {
    this.value = value;
  }
}

class BoolNode {
  constructor(value) {
    this.value = value;
  }
}

class ArrNode {
  constructor(items) {
    this.items = items;
  }
}

class ObjNode {
  constructor(pairs = []) {
    this.pairs = pairs;
  }
}

class NullNode { }

class UndefNode { }

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
    if (Array.isArray(arg)) {
      return new ArrNode(arg.map(this.handleArg.bind(this)));
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
    if (arg.constructor == Object) {
      let pairs = [];
      for (let key in arg) {
        pairs.push(this.handleArg(key));
        pairs.push(this.handleArg(arg[key]));
      }
      return new ObjNode(pairs)
    }
    return arg;
  }

  buildExpression(funcName, langName) {
    return (...args) => {
      return new ExprNode(funcName, args.map(this.handleArg.bind(this)), { langName });
    }
  }
}


let serializers = {
  toList(item) {
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
  }
}

module.exports = {
  TreeBranch,
  Language,
  serializers,
  ExprNode,
  StrNode,
  NumNode,
  BoolNode,
  NullNode,
  UndefNode,
  ArrNode,
  ObjNode,
}
