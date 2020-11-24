import { JSONType, JSONTypeKey } from '.';

export const getJSONType = (v: JSONType): JSONTypeKey => {
  if (v === null) {
    return 'null';
  }
  if (['number', 'string', 'boolean'].includes(typeof v)) {
    return typeof v as 'number' | 'string' | 'boolean';
  }
  if (Array.isArray(v)) {
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
