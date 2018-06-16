# Tree Branch

Create DSLs. Execute them as code. Serialize them as JSON. Build your own funcitonality around them.

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

In this example, the `treeList` will be:

```javascript
['math/add',
  ['math/subtract', ['number', 4], ['number', 2]],
  ['number' 8]]]
```

### Running as Code

New languages can be created from existing objects, where the property name is the function name and the value and the value is the function to use. After you have built your tree, you can then pass it back in to be evaluated using the defined functions.

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
