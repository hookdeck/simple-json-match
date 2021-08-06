# simple-json-match

`simple-json-match` library to evaluate match a JSON document values with a simple syntax.

It was designed to be used within [hookdeck.io](https://hookdeck.io) filtering engine and provides for a simple method for users to input their desired filter.

This is not a full schema validation library like `json-schema` instead its goal is to provide a simple straitforward syntax to evalute match between values rather then type.

# Install

```
npm install simple-json-match
```

```
yarn add simple-json-match
```

Typescript definitions are provided within the package.

# Getting Started

`simple-match-json` exports a single method to evaluate the match between a JSON document and the input schema.

```js
import matchJSONToSchema from 'simple-json-match';

const product = {
  id: 123,
  title: 'A product',
};

const schema = {
  id: 123,
};

matchJSONToSchema(product, schema); // true
```

# Supported Types

matchJSONToSchema supports raw `string` `boolean` `number` or `null` and the library Schema JSON syntax.

```js
matchJSONToSchema(true, true); // true
```

```js
matchJSONToSchema(true, false); // false
```

```js
matchJSONToSchema({ test: true }, { test: false }); // false
```

# Schema Syntax

JSON filter supports matching on any value (`string` `number` `boolean` `null`), on nested objects and on arrays.

### Simple primitives

Simple primitive are `string`, `number`, `boolean` or `null` that will be matched if equal.

```js
const product = {
  type: 'order/created',
  order: {
    id: 123,
  },
};

const schema = {
  type: 'order/created',
};

matchJSONToSchema(product, schema); // true
```

### Nested Objects

Just like normal JSON, objects can be nested

```js
const product = {
  product: {
    title: 'A product',
    inventory: 0,
  },
};

const schema = {
  product: {
    inventory: 0,
  },
};

matchJSONToSchema(product, schema); // true
```

### Arrays

Arrays are always matched partially. It's effectively the same as `contains`

```js
const product = {
  product: {
    title: 'Gift Card',
    tags: ['gift', 'something'],
  },
};

const schema = {
  product: {
    tags: 'gift',
  },
};

matchJSONToSchema(product, schema); // true
```

You can also match multiple items (they must all be contained)

```js
const product = {
  product: {
    title: 'Gift Card',
    tags: ['gift', 'something', 'another'],
  },
};

const schema = {
  product: {
    tags: ['gift', 'something'],
  },
};

matchJSONToSchema(product, schema); // true
```

Or even nested objects

```js
const order = {
  order: {
    id: 123,
    items: [
      {
        id: 456,
        title: 'My product',
      },
    ],
  },
};

const schema = {
  order: {
    items: {
      id: 456,
    },
  },
};

matchJSONToSchema(order, schema); // true
```

### Operators

Sometimes you need more than simple a `equal` matching. Our syntax support different operators to allow for more complex matching strategies.

Operators can be used as an object instead of the matching primitive (value)

```js
const product = {
  product: {
    title: 'A product',
    inventory: 5,
  },
};

const schema = {
  product: {
    inventory: {
      $lte: 10,
    },
  },
};

matchJSONToSchema(product, schema); // true
```

#### All operators

| Operator    | Supported Type    | Description                   |
| ----------- | ----------------- | ----------------------------- |
| $eq         | `any`             | Equal (or deep equal)         |
| $neq        | `any`             | Not Equal (or deep not equal) |
| $in         | `string`,`array`  | Contains                      |
| $nin        | `string`,`array`  | Does not contain              |
| $gte        | `string`,`number` | Greater than or equal to      |
| $gt         | `string`,`number` | Greater than                  |
| $lte        | `string`,`number` | Less than or equal to         |
| $lt         | `string`,`number` | Less than                     |
| $startsWith | `string`          | Starts with text              |
| $endsWith   | `string`          | Ends with text                |
| $or         | `array`           | Array of conditions to match  |
| $ref        | &lt;field&gt;     | Reference a field             |

### $or Operator

The refrence `$or` is a special operator to evaluate match with an array of conditions. For the match to be true, only one of the condition needs to match. The array of condition can contain any other valid schema supported.

```js
const product = {
  product: {
    title: 'A product',
    inventory: 5,
  },
};

const schema = {
  product: {
    inventory: {
      $or: [1, 5],
    },
  },
};

matchJSONToSchema(product, schema); // true
```

```js
const exmaple = {
  "hello": "world"
}

const schema = {
  $or: [
    {  "hello": "johny"}
    {  "hello": "mark"},
  ]
}

matchJSONToSchema(example, schema); // false

```

### References

The refrence `$ref` is a special operator to reference other values in your JSON input when evaluating match. The reference input must be a `string` representing the value path. For example using this JSON input:

```js
const example = {
  type: 'example',
  nested_object: {
    hello: 'world'
    array: [1, 2, 3]
  }
};

const ref1 = 'type' // example
const ref2 = 'type.nested_object.hello' // world
const ref3 = 'type.nested_object.array[1]' // 1
```

```js
const product = {
  updated_at: '2020-04-20',
  created_at: '2020-04-20',
};

const schema = {
  updated_at: {
    $ref: 'created_at',
  },
};

matchJSONToSchema(product, schema); // true
```

A reference can also be used in conjuction with other operators

```js
const product = {
  inventory: 0,
  old_inventory: 10,
};

const schema = {
  inventory: {
    $lte: { $ref: 'old_inventory' },
  },
};

matchJSONToSchema(product, schema); // true
```
