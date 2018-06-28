const { Matcher } = require('./utils');
const nodes = require('./nodes');

module.exports = {
  toList,
}

function toList(item) {
  let matcher = new Matcher();

  matcher.onNode(nodes.ExprNode, (exprNode) => {
    return [`${exprNode.language.name}/${exprNode.name}`].concat(exprNode.args.map(toList));
  });

  matcher.onNode(nodes.NumNode, numNode => ['number', numNode.value]);
  matcher.onNode(nodes.StrNode, strNode => ['string', strNode.value]);
  matcher.onNode(nodes.BoolNode, boolNode => ['boolean', boolNode.value]);
  matcher.onNode(nodes.NullNode, _ => ['null']);
  matcher.onNode(nodes.UndefNode, _ => ['undefined']);
  matcher.onNode(nodes.ArrNode, arrNode => ['array'].concat(arrNode.items.map(toList)));
  matcher.onNode(nodes.FuncNode, _ => ['native-function']);

  matcher.onNode(nodes.ObjNode, (objNode) => {
    return ['object'].concat(objNode.pairs.map((item) => {
      return [toList(item[0]), toList(item[1])];
    }));
  });

  return matcher.match(item);
}
