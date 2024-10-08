import { Operator } from '.';
import { isPrimitiveType, supportedType } from './utils';

const operators: {
  [k in Operator]: (v, compare) => boolean;
} = {
  $eq: (v, compare) => {
    v = isPrimitiveType(v) ? v : JSON.stringify(v);
    compare = isPrimitiveType(compare) ? compare : JSON.stringify(compare);
    return v == compare;
  },
  $neq: (v, compare) => {
    return !operators.$eq(v, compare);
  },
  $in: (v, compare) => {
    if (
      !supportedType(compare, ['array', 'string', 'number']) ||
      !supportedType(v, ['number', 'string', 'boolean', 'null'])
    ) {
      throw new Error('Unsupported types for $in or $nin operator');
    }
    if (Array.isArray(compare)) {
      if (compare.some((c) => !supportedType(c, ['number', 'string']))) {
        throw new Error('Unsupported types for $in or $nin operator');
      }
      return (compare as (string | number)[]).includes(v as any);
    }
    return (v as string | any[]).includes(compare as any);
  },
  $nin: (v, compare) => {
    return !operators.$in(v, compare);
  },
  $startsWith: (v, compare) => {
    if (
      !supportedType(v, ['string']) ||
      !supportedType(compare, ['string', 'array'])
    ) {
      throw new Error('Unsupported types for $startsWith operator');
    }
    if (Array.isArray(compare)) {
      if (compare.some((c) => !supportedType(c, ['string']))) {
        throw new Error('Unsupported types for $startsWith operator');
      }
      return (compare as string[]).some((c) => v.startsWith(c as string));
    }
    return (v as string).startsWith(compare as string);
  },
  $endsWith: (v, compare) => {
    if (
      !supportedType(v, ['string']) ||
      !supportedType(compare, ['string', 'array'])
    ) {
      throw new Error('Unsupported types for $endsWith operator');
    }
    if (Array.isArray(compare)) {
      if (compare.some((c) => !supportedType(c, ['string']))) {
        throw new Error('Unsupported types for $endsWith operator');
      }
      return (compare as string[]).some((c) => v.endsWith(c as string));
    }
    return (v as string).endsWith(compare as string);
  },
  $gte: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $gte operator');
    }
    return v >= compare;
  },
  $gt: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $gt operator');
    }
    return v > compare;
  },
  $lte: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $lte operator');
    }
    return v <= compare;
  },
  $lt: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $lt operator');
    }
    return v < compare;
  },
  $exist: (v, compare) => {
    if (!supportedType(compare, ['boolean'])) {
      throw new Error('Unsupported type for $exist operator');
    }
    if (compare === true && v !== undefined) {
      return true;
    }
    if (compare === false && v === undefined) {
      return true;
    }
    return false;
  },
};

export const operator_keys = Object.keys(operators);

export default operators;
