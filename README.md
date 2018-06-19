# Tree Branch

Create domain specific languages. Execute them as code. Serialize them as JSON. Build your own functionality around them.

## Overview

Programmers spend a lot of time trying to squeeze a domain language into a programming language. Sometimes it doesn't fit and they have to start over. Sometimes the domain language gets popular and finds it way into a standardized JSON or YAML format. Sometimes—more often than not—the domain language isn't considered before writing code and is figured out along the way, leading to inconsistencies in the domain language and implementation.

Tree Branch is an idea for building domain specific languages in JavaScript that can be evaluated or serialized. Programmers can design the semantics of a language before writing code and later evaluate the code around it or define serializers and deserializers. Because these DSLs can be serialized to something like JSON, they can be shared across the web and across programming languages. Even logic can be shared and evaluated at runtime across networks and platforms given the right design. 

## Usage

```sh
npm install treebranch
```

### Create a Language

```javascript
const treebranch = require('treebranch');

// Create a language with a name and semantics
const l = treebranch.createLanguage('math', ['add', 'subtract']);

// Build a tree from our DSL
const tree = l.add(l.subtract(4, 2), 8);

// Serialize the tree
const treeList = treebranch.serializers.toList(tree);
```

The `tree` value will contain the tree of nodes built from the language. That value will be the equivalent to the following.

```javascript
const tree = new ExprNode('add',
  new ExprNode('subtract', new NumNode(4), new NumNode(2)),
  new NumNode(8));
```

This abstract tree provides the power of this method, because it allows developers to write code that represents the abstract tree one-to-one. Trees can be built on the fly or wrapped with additional functionality.

In the example above, the `treeList` constant will be the serialized version of the defined tree, with each language node prefixed with the name of the language like below.

```javascript
['math/add',
  ['math/subtract', ['number', 4], ['number', 2]],
  ['number' 8]]]
```

### Running as Code

New languages can be created from existing objects, where the property name is the function name and the value is the function to use. After you have built your tree, you can then pass it back in to be evaluated using the defined functions.

```javascript
const treebranch = require('treebranch');

const runtime = treebranch.TreeBranch();

// Pass in a name and functions, which will register your code and create a language for you.
const l = runtime.register('math', {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
});

const tree = l.add(l.subtract(4, 2), 8);

const result = runtime.eval(tree); // will be 10
```

## License

This code is licensed under the MIT license.
