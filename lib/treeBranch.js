const { Matcher } = require('./utils');
const nodes = require('./nodes');
const { createLanguage } = require('./lang');

// Create a sort of runtime with a way to register code and create a language
// from it. Once the code is registered, the languages create, the tree built,
// it can then be passed into eval to execute.
class TreeBranch {
  constructor(language) {
    this.registry = {}
    this.languages = {}
  }

  register(definition) {
    let lang = createLanguage({
      name: definition.name,
      methods: Object.keys(definition.methods)
    });

    this.registry[definition.name] = definition.methods;
    this.languages[definition.name] = lang;
    return lang;
  }

  eval(item) {
    let matcher = new Matcher();

    matcher.onNode(nodes.ExprNode, (exprNode) => {
      let rest = exprNode.args.map(this.eval.bind(this))
      let func = this.registry[exprNode.language.name][exprNode.name];
      return func(...rest);
    });

    matcher.onNode(nodes.NumNode, numNode => numNode.value);
    matcher.onNode(nodes.StrNode, strNode => strNode.value);
    matcher.onNode(nodes.BoolNode, boolNode => boolNode.value);
    matcher.onNode(nodes.NullNode, _ => null);
    matcher.onNode(nodes.UndefNode, _ => undefined);
    matcher.onNode(nodes.ArrNode, (arrNode) => arrNode.items.map(this.eval.bind(this)));
    matcher.onNode(nodes.FuncNode, funcNode => funcNode.func);

    matcher.onNode(nodes.ObjNode, (objNode) => {
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

module.exports = { TreeBranch };
