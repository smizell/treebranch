const chai = require('chai');
const expect = chai.expect;
const treebranch = require('../index');

describe('TreeBranch', function () {
  describe('Serializers', function () {
    context('primitive values', function () {
      it('serializes strings correctly', function () {
        let str = new treebranch.StrNode('foo');
        expect(treebranch.serializers.toList(str)).to.deep.equal(['string', 'foo'])
      });
      it('serializes numbers correctly', function () {
        let num = new treebranch.NumNode(4);
        expect(treebranch.serializers.toList(num)).to.deep.equal(['number', 4])
      });
      it('serializes booleans correctly', function () {
        let bool = new treebranch.BoolNode(true);
        expect(treebranch.serializers.toList(bool)).to.deep.equal(['boolean', true])
      });
      it('serializes null correctly', function () {
        let value = new treebranch.NullNode();
        expect(treebranch.serializers.toList(value)).to.deep.equal(['null'])
      });
      it('serializes undefined correctly', function () {
        let undef = new treebranch.UndefNode();
        expect(treebranch.serializers.toList(undef)).to.deep.equal(['undefined'])
      });
      it('serializes functions correctly', function () {
        let func = new treebranch.FuncNode(x => x);
        expect(treebranch.serializers.toList(func)).to.deep.equal(['native-function'])
      });
    });
  });
});
