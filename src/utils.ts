import { JSONType, JSONTypeKey } from '.';

export const getJSONType = (v: JSONType): JSONTypeKey => {
  if (v === null) {
    return 'null';
  }
  const js_type = typeof v;
  const primitive_type = ['number', 'string', 'boolean'].find(
    (type) => type === js_type
  );
  if (primitive_type) {
    return primitive_type as 'number', 'string', 'boolean';
  }
  if (Array.isArray(js_type)) {
    return 'array';
  }
  return 'object';
};

export const isPrimitiveType = (v: JSONType): boolean =>
  ['null', 'number', 'string', 'boolean'].includes(getJSONType(v));

export const supportedType = (
  value: JSONType,
  types: JSONTypeKey[]
): boolean => {
  return types.includes(getJSONType(value));
};
