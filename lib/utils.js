class Matcher {
  constructor() {
    this.patterns = [];
  }

  pattern(pattern) {
    this.patterns.push(pattern);
  }

  onNode(nodeType, func) {
    this.pattern([
      item => item instanceof nodeType,
      func
    ]);
  }

  match(value) {
    for (let pattern of this.patterns) {
      let check = pattern[0];
      if (check(value)) {
        return pattern[1](value);
      }
    }
  }
}

module.exports = { Matcher };
