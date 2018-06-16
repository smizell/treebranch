function build(name, funcNames) {
  return funcNames.reduce((result, func) => {
    result[func] = (...rest) => new ExprNode(func, rest);
    return result
  }, {});
}
