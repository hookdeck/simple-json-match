import { Operator } from '.';
import { isPrimitiveType, supportedType } from './utils';

const operators: {
  [k in Operator]: (v, compare, operator?) => boolean;
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
      !supportedType(compare, ['array', 'string']) ||
      !supportedType(v, ['number', 'string', 'boolean', 'null'])
    ) {
      throw new Error('Unsupported types for $in or $nin operator');
    }
    if (Array.isArray(compare)) {
      return (compare as string | any[]).includes(v as any);
    }
    return (v as string | any[]).includes(compare as any);
  },
  $nin: (v, compare) => {
    return !operators.$in(v, compare);
  },
  $startsWith: (v, compare) => {
    if (!supportedType(v, ['string']) || !supportedType(compare, ['string'])) {
      throw new Error('Unsupported types for $startsWith operator');
    }
    return (v as string).startsWith(compare as string);
  },
  $endsWith: (v, compare) => {
    if (!supportedType(v, ['string']) || !supportedType(compare, ['string'])) {
      throw new Error('Unsupported types for $endsWith operator');
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
    if (
      !supportedType(v, ['number', 'string', 'boolean', 'null']) ||
      !supportedType(compare, ['boolean'])
    ) {
      throw new Error('Unsupported types for $exist operator');
    }
    if (compare && v !== undefined) {
      return true;
    }
    if (!compare && v === undefined) {
      return true;
    }
    return false;
  },
};

export const operator_keys = Object.keys(operators);

export default operators;
