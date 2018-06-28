class ExprNode {
  constructor(name, args = [], language) {
    this.name = name;
    this.args = args;
    this.language = language;
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

class FuncNode {
  constructor(func) {
    this.func = func;
  }
}

module.exports = {
  ExprNode,
  StrNode,
  NumNode,
  BoolNode,
  NullNode,
  UndefNode,
  ArrNode,
  ObjNode,
  FuncNode,
}
