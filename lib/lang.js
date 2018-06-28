const { ExprNode } = require('./nodes');
const { handleValue } = require('./valueHandler');

module.exports = {
  createLanguage,
}

function createLanguage(language) {
  let exprBuilder = (funcName) => {
    return (...args) => {
      return new ExprNode(funcName, args.map(handleValue), language);
    }
  };

  return language.methods.reduce((result, funcName) => {
    result[funcName] = exprBuilder(funcName, language);
    return result
  }, { _meta: language });
}
