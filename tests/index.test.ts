import matchJsonToSchema from '../src/index';

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
      { test: 'some-text', tags: ['test', 'something'] },
      { test: { $in: 'text' }, tags: { $in: 'test' } },
      true,
    ],
    [
      { test: 'some-text', tags: ['test', 'something'] },
      { test: { $nin: 'some' }, tags: { $nin: 'test' } },
      false,
    ],
  ];

  tests.forEach(([input, schema, match], i) => {
    it(`Correctly matches ${JSON.stringify(input)} with ${JSON.stringify(
      schema
    )}`, async () => {
      expect(matchJsonToSchema(input as any, schema as any)).toBe(match);
    });
  });
});
