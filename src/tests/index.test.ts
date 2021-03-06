import matchJsonToSchema from '../index';

describe('matchJsonToSchema.test.ts', () => {
  const tests = [
    [{ type: 'created' }, { type: 'created' }, true],
    [{}, { type: 'created' }, false],
    [{ type: 'updated' }, { type: 'created' }, false],
    [{ type: 1 }, { type: 'created' }, false],
    [{ type: 1 }, { type: 1 }, true],
    [{ count: 1, type: 'created' }, { count: 1 }, true],
    [{ count: 1, type: 'created' }, { count: 1, type: 'created' }, true],
    [{ count: 1 }, { count: 1, type: 'created' }, false],
    [{ count: 0 }, { count: { $lt: 1 } }, true],
    [{ count: 2 }, { count: { $lt: 1 } }, false],
    [{ count: 2 }, { count: { $eq: 2 } }, true],
    [{ count: 2 }, { count: { $neq: 2 } }, false],
    [{ count: 2 }, { count: { $gt: 1, $lt: 3 } }, true],
    [{ title: 'a' }, { title: { $gt: 'b' } }, false],
    [{ title: 'c' }, { title: { $gt: 'b' } }, true],
    [{ type: 'created' }, { type: { $neq: 'created' } }, false],
    [{ type: 'created' }, { type: { $eq: 'created' } }, true],
    [
      { type: { something: 'created' } },
      { type: { something: 'created' } },
      true,
    ],
    [
      { type: { something: 'created' } },
      { type: { something: 'updated' } },
      false,
    ],
    [{ type: { something: 'created' } }, { type: 1 }, false],
    [{ tags: ['test', 'other'] }, { tags: 'test' }, true],
    [{ tags: ['test', 'other'] }, { tags: 'nope' }, false],
    [{ items: [{ sku: 'test' }] }, { items: { sku: 'test' } }, true],
    [{ items: [{ sku: 'test' }] }, { items: { sku: '1' } }, false],
    [
      { items: [{ inventory: 9 }, { inventory: 11 }] },
      { items: { inventory: { $lte: 10 } } },
      true,
    ],
    [
      { items: [{ inventory: 12 }, { inventory: 11 }] },
      { items: { inventory: { $lte: 10 } } },
      false,
    ],
    [{ tags: ['test', 'other', 'more'] }, { tags: ['test', 'other'] }, true],
    [
      { tags: ['test', 'other', 'more'] },
      { tags: ['test', 'whatever'] },
      false,
    ],
    [{ tags: ['test', 'other'] }, { tags: { $eq: ['test', 'other'] } }, true],
    [
      { tags: ['test', 'other', 'more'] },
      { tags: { $eq: ['test', 'other'] } },
      false,
    ],
    [{ exist: true }, { exist: true }, true],
    [{ exist: true }, { exist: false }, false],
    [{ exist: null }, { exist: null }, true],
    [{ exist: null }, { exist: false }, false],
    [{ exist: null }, { exist: { $eq: null } }, true],
    [{ exist: null }, { exist: { $neq: null } }, false],
    ['created', 'created', true],
    [1, 2, false],
    [10, { $gte: 5 }, true],
    [{ test: true }, true, false],
    [{ test: 'some-text' }, { test: { $startsWith: 'some' } }, true],
    [{ test: 'some-text' }, { test: { $endsWith: 'some' } }, false],
    [{ test: 'some-text' }, { test: { $endsWith: 'text' } }, true],
    [{ test: 'some-text' }, { test: { something: 'text' } }, false],
    [{ test: { more: true } }, { test: { $startsWith: 'text' } }, false],
    [
      { test: 'some-text', id: 123 },
      { test: { $in: 'text' }, id: { $in: [123, 456] } },
      true,
    ],
    [{ id: 123 }, { id: { $in: [123, 456] } }, true],
    [{ id: 123 }, { id: { $nin: [123, 456] } }, false],
    [{ test: 'some-text' }, { test: { $in: 'text' } }, true],
    [{ test: 'some-text' }, { test: { $nin: 'some' } }, false],
    [{ tags: ['test', 'something'] }, { tags: { $nin: 'test' } }, false],
    [{ test: true, test2: true }, { test2: { $ref: 'test' } }, true],
    [{ test: true, test2: false }, { test2: { $ref: 'test' } }, false],
    [{ test: 1, test2: 2 }, { test2: { $gt: { $ref: 'test' } } }, true],
    [
      { types: ['something', 'else'], test2: 'else' },
      { types: { $ref: 'test2' } },
      true,
    ],
    [
      { types: ['something', 'else'], test2: 'else' },
      { test2: { $ref: 'types[1]' } },
      true,
    ],
    [
      { current: { something: true }, another: { thing: true } },
      { another: { thing: { $ref: 'current.something' } } },
      true,
    ],
    [
      { current: { something: true }, another: { thing: true } },
      { another: { thing: { $ref: { bad: 'ref' } } } },
      false,
    ],
    [{ test: 1 }, { test: { $gt: [1, 2, 3] } }, false],
  ];

  tests.forEach(([input, schema, match]) => {
    it(`Correctly matches ${JSON.stringify(input)} with ${JSON.stringify(
      schema
    )}`, async () => {
      expect(matchJsonToSchema(input as any, schema as any)).toBe(match);
    });
  });
});
