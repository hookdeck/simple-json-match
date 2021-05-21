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
  reference: string
): JSONType => {
  if (typeof reference !== 'string') {
    throw new Error('Invalid Reference');
  }
  const results = query(root_input, reference, 1);
  return results && results.length > 0 ? results[0] : null;
};

const recursivelyMatchValue = (
  input: JSONType,
  schema: Schema,
  root_input: JSONType
): boolean => {
  if (isPrimitiveType(schema)) {
    if (isPrimitiveType(input)) {
      return input != schema;
    }
    if (Array.isArray(input)) {
      return !(input as JSONType[]).some(
        (v) => !recursivelyMatchValue(v, schema, root_input)
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
            (array_input) =>
              !recursivelyMatchValue(array_input, sub_schema, root_input)
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
    return !input.some(
      (array_input) => !recursivelyMatchValue(array_input, schema, root_input)
    );
  }

  if (typeof schema === 'object') {
    if (schema['$ref']) {
      return recursivelyMatchValue(
        input,
        getReferenceValueInInput(root_input, schema['$ref']),
        root_input
      );
    }
    const schema_ops = Object.entries(schema).filter(([key]) =>
      operator_keys.includes(key)
    );
    if (schema_ops.length > 0) {
      return schema_ops.some(([key, value]) => {
        if (typeof value === 'object' && value && value['$ref']) {
          value = getReferenceValueInInput(root_input, value['$ref']);
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
    return !matchJsonToSchema(input, schema, root_input);
  }

  return true;
};

const matchJsonToSchema = (
  input: JSONType,
  schema: Schema,
  root_input?: JSONType
): boolean => {
  try {
    if (!root_input) {
      root_input = input;
    }
    if (isPrimitiveType(input)) {
      return !recursivelyMatchValue(input, schema, input);
    }

    if (isPrimitiveType(schema)) {
      return false;
    }

    if (Array.isArray(schema)) {
      return !recursivelyMatchValue(input, schema, input);
    }

    return !Object.entries(schema as SchemaObject).some(([key, schema]) => {
      if (
        !Array.isArray(input) &&
        (input as { [k: string]: JSONType })[key] === undefined
      ) {
        return true;
      }
      return recursivelyMatchValue(input[key], schema, root_input);
    });
  } catch {
    return false;
  }
};

export default matchJsonToSchema;
