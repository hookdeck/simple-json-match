import { query } from 'jsonpath';
import operators, { operator_keys } from './operators';
import { isPrimitiveType } from './utils';

export type Operator =
  | '$gte'
  | '$gt'
  | '$lt'
  | '$lte'
  | '$eq'
  | '$neq'
  | '$startsWith'
  | '$endsWith'
  | '$in'
  | '$nin';

export type JSONTypeKey =
  | 'null'
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array';

export type Primitive = number | null | string | boolean;
export type JSONType =
  | Primitive
  | Primitive[]
  | Record<string, unknown>
  | Record<string, unknown>[];

export type SchemaObject =
  | {
      [k: string]: SchemaObject | Primitive;
    }
  | {
      [k in Operator]: Primitive;
    };

export type Schema = JSONType | SchemaObject;

const getReferenceValueInInput = (
  root_input: JSONType,
  reference: string,
  indexes: number[]
): JSONType => {
  if (typeof reference !== 'string') {
    throw new Error('Invalid Reference');
  }
  if (reference.includes('[$index]')) {
    indexes.forEach((index) => {
      reference = reference.replace('$index', `${index}`);
    });
  }
  const results = query(
    root_input,
    reference.startsWith('[') ? `$${reference}` : reference,
    1
  );

  return results && results.length > 0 ? results[0] : null;
};

const recursivelyMatchValue = (
  input: JSONType,
  schema: Schema,
  root_input: JSONType,
  indexes: number[]
): boolean => {
  if (isPrimitiveType(schema)) {
    if (isPrimitiveType(input)) {
      return input != schema;
    }
    if (Array.isArray(input)) {
      return !(input as JSONType[]).some(
        (v, i) => !recursivelyMatchValue(v, schema, root_input, [...indexes, i])
      );
    }
    if (typeof input === 'object') {
      return true;
    }
  }

  if (Array.isArray(input)) {
    if (Array.isArray(schema)) {
      return schema.some(
        (sub_schema) =>
          !input.some(
            (array_input, i) =>
              !recursivelyMatchValue(array_input, sub_schema, root_input, [
                ...indexes,
                i,
              ])
          )
      );
    }
    const schema_ops = Object.entries(schema).filter(([key]) =>
      operator_keys.includes(key)
    );
    if (schema_ops.length > 0) {
      return schema_ops.some(([key, value]) => {
        try {
          return !operators[key](input, value);
        } catch {
          return true;
        }
      });
    }
    return !(input as JSONType[]).some(
      (v, i) => !recursivelyMatchValue(v, schema, root_input, [...indexes, i])
    );
  }

  if (typeof schema === 'object') {
    if (schema['$or'] && Array.isArray(schema['$or'])) {
      return !schema['$or'].some((condition_schema) =>
        matchJsonToSchema(input, condition_schema, root_input, indexes)
      );
    }
    if (schema['$ref']) {
      return recursivelyMatchValue(
        input,
        getReferenceValueInInput(root_input, schema['$ref'], indexes),
        root_input,
        indexes
      );
    }
    const schema_ops = Object.entries(schema).filter(([key]) =>
      operator_keys.includes(key)
    );
    if (schema_ops.length > 0) {
      return schema_ops.some(([key, value]) => {
        if (typeof value === 'object' && value && value['$ref']) {
          value = getReferenceValueInInput(root_input, value['$ref'], indexes);
        }
        try {
          return !operators[key](input, value);
        } catch {
          return true;
        }
      });
    }
    if (isPrimitiveType(input)) {
      return true;
    }
    return !matchJsonToSchema(input, schema, root_input, indexes);
  }

  return true;
};

const matchJsonToSchema = (
  input: JSONType,
  schema: Schema,
  root_input?: JSONType,
  indexes: number[] = []
): boolean => {
  try {
    if (!root_input) {
      root_input = input;
    }
    if (isPrimitiveType(input) || Array.isArray(input)) {
      return !recursivelyMatchValue(input, schema, input, indexes);
    }

    if (typeof schema === 'object') {
      return !Object.entries(schema as SchemaObject).some(([key, schema]) => {
        if (key === '$or' && Array.isArray(schema)) {
          return !schema.some((condition_schema) =>
            matchJsonToSchema(input, condition_schema, root_input, indexes)
          );
        }
        if (
          !Array.isArray(input) &&
          (input as { [k: string]: JSONType })[key] === undefined
        ) {
          return true;
        }
        return recursivelyMatchValue(input[key], schema, root_input, indexes);
      });
    }

    return !recursivelyMatchValue(input, schema, input, indexes);
  } catch (e) {
    return false;
  }
};

export default matchJsonToSchema;
