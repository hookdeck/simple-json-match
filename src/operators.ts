import { JSONType, Operator, Primitive } from '.';
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
    v = isPrimitiveType(v) ? v : JSON.stringify(v);
    compare = isPrimitiveType(compare) ? compare : JSON.stringify(compare);
    return v != compare;
  },
  $in: (v, compare) => {
    if (
      !supportedType(v, ['array', 'string']) ||
      !supportedType(compare, ['number', 'string', 'boolean'])
    ) {
      throw new Error('Unsupported types for $in operator');
    }
    return (v as string | any[]).includes(compare as any);
  },
  $nin: (v, compare) => {
    if (
      !supportedType(v, ['array', 'string']) ||
      !supportedType(compare, ['number', 'string', 'boolean', 'null'])
    ) {
      throw new Error('Unsupported types for $in operator');
    }
    return !(v as string | any[]).includes(compare as any);
  },
  $startsWith: (v, compare) => {
    if (!supportedType(v, ['string']) || !supportedType(compare, ['string'])) {
      throw new Error('Unsupported types for $in operator');
    }
    return (v as string).startsWith(compare as string);
  },
  $endsWith: (v, compare) => {
    if (!supportedType(v, ['string']) || !supportedType(compare, ['string'])) {
      throw new Error('Unsupported types for $in operator');
    }
    return (v as string).endsWith(compare as string);
  },
  $gte: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $in operator');
    }
    return v >= compare;
  },
  $gt: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $in operator');
    }
    return v > compare;
  },
  $lte: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $in operator');
    }
    return v <= compare;
  },
  $lt: (v, compare) => {
    if (
      !supportedType(v, ['string', 'number']) ||
      !supportedType(compare, ['string', 'number'])
    ) {
      throw new Error('Unsupported types for $in operator');
    }
    return v < compare;
  },
};

export const operator_keys = Object.keys(operators);

export default operators;
