const chai = require('chai');
const expect = chai.expect;
const { TreeBranch, createLanguage, serializers } = require('../index');

describe('TreeBranch', function () {
  let mathLang = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b
  };

  context('running code', function () {
    let treebranch = new TreeBranch();

    let m = treebranch.register('math', {
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      multiply: (a, b) => a * b
    });

    it('returns the correct value', function () {
      let code = m.multiply(
        m.add(6, 2),
        m.subtract(6, 4));

      let result = treebranch.eval(code);

      expect(result).to.equal(16);
    });

    it('exposes the registry', function () {
      expect(treebranch.registry.math).to.not.be.null;
    });

    it('exposes the languages', function () {
      expect(treebranch.languages.math).to.not.be.null;
    });
  });

  context('serializers', function () {
    it('returns the correct values', function () {
      let m = createLanguage('math', ['multiply', 'add', 'subtract']);

      let tree = m.multiply(
        m.add(6, 2),
        m.subtract(6, 4));

      expect(serializers.toList(tree)).to.deep.equal(
        ['math/multiply',
          ['math/add', ['number', 6], ['number', 2]],
          ['math/subtract', ['number', 6], ['number', 4]]]);
    });
  });
});
