const chai = require('chai');
const expect = chai.expect;
const treebranch = require('../index');

describe('TreeBranch', function () {
  context('Primitives', function () {
    let t = new treebranch.TreeBranch();

    it('handles strings correctly', function () {
      let str = new treebranch.StrNode('foo');
      expect(t.eval(str)).to.equal('foo');
      expect(treebranch.serializers.toList(str)).to.deep.equal(['string', 'foo'])
    });
    it('handles numbers correctly', function () {
      let num = new treebranch.NumNode(4);
      expect(t.eval(num)).to.equal(4);
      expect(treebranch.serializers.toList(num)).to.deep.equal(['number', 4])
    });
    it('handles booleans correctly', function () {
      let bool = new treebranch.BoolNode(true);
      expect(t.eval(bool)).to.equal(true);
      expect(treebranch.serializers.toList(bool)).to.deep.equal(['boolean', true])
    });
    it('handles null correctly', function () {
      let value = new treebranch.NullNode();
      expect(t.eval(value)).to.equal(null);
      expect(treebranch.serializers.toList(value)).to.deep.equal(['null'])
    });
    it('handles undefined correctly', function () {
      let undef = new treebranch.UndefNode();
      expect(t.eval(undef)).to.equal(undefined);
      expect(treebranch.serializers.toList(undef)).to.deep.equal(['undefined'])
    });
  });
});
