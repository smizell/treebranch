const chai = require('chai');
const expect = chai.expect;
const treebranch = require('../index');

describe('TreeBranch', function () {
  context('Nodes', function () {
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

    it('handles arrays correctly', function () {
      let arr = new treebranch.ArrNode([
        new treebranch.NumNode(1),
        new treebranch.StrNode('foo')]);
      expect(t.eval(arr)).to.deep.equal([1, 'foo']);
      expect(treebranch.serializers.toList(arr)).to.deep.equal(['array', ['number', 1], ['string', 'foo']])
    });

    it('handles objects correctly', function () {
      let arr = new treebranch.ObjNode([
        [new treebranch.StrNode('foo'), new treebranch.StrNode('bar')]]);
      expect(t.eval(arr)).to.deep.equal({ foo: 'bar' });
      expect(treebranch.serializers.toList(arr)).to.deep.equal(['object', [['string', 'foo'], ['string', 'bar']]]);
    });

    it('handles functions correctly', function () {
      let func = new treebranch.FuncNode((x) => x + 1);
      expect(t.eval(func)(2)).to.equal(3);
      expect(treebranch.serializers.toList(func)).to.deep.equal(['native-function'])
    });
  });

  context('Language', function () {
    let l = treebranch.createLanguage({ name: 'foo', methods: ['bar'] });
    let typer = (code) => code.constructor.name;

    it('handles strings correctly', function () {
      let code = l.bar('baz');
      expect(typer(code.args[0])).to.equal('StrNode');
    });

    it('handles numbers correctly', function () {
      let code = l.bar(4);
      expect(typer(code.args[0])).to.equal('NumNode');
    });

    it('handles booleans correctly', function () {
      let code = l.bar(true);
      expect(typer(code.args[0])).to.equal('BoolNode');
    });

    it('handles null correctly', function () {
      let code = l.bar(null);
      expect(typer(code.args[0])).to.equal('NullNode');
    });

    it('handles undefined correctly', function () {
      let code = l.bar(undefined);
      expect(typer(code.args[0])).to.equal('UndefNode');
    });

    it('handles arrays correctly', function () {
      let code = l.bar([1, 'foo']);
      expect(typer(code.args[0])).to.equal('ArrNode');
      expect(code.args[0].items.map(typer)).to.deep.equal(['NumNode', 'StrNode'])
    });

    it('handles objects correctly', function () {
      let code = l.bar({ foo: 4 });
      expect(typer(code.args[0])).to.equal('ObjNode');
      expect(code.args[0].pairs[0].map(typer)).to.deep.equal(['StrNode', 'NumNode']);
    });

    it('handles functions correctly', function () {
      let code = l.bar((x) => x + 1);
      expect(typer(code.args[0])).to.equal('FuncNode');
    });
  })
});
