import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  productCreateSchema,
  productUpdateSchema,
  variantCreateSchema,
  variantUpdateSchema,
  planCreateSchema,
  planUpdateSchema,
} from '../../src/schemas/catalog.js';
import { paginationQuery, parseWith } from '../../src/validation.js';
import { ApiError } from '../../src/errors.js';

const validProduct = { name: 'Workspace', sale_price: '100.00' };
const validPlan = {
  name: 'Monthly Workspace',
  product_variant_id: '6f1c2e0a-3b4d-4e5f-8a9b-0c1d2e3f4a5b',
  billing_interval: 'MONTH',
  end_behavior: 'AUTO_CLOSE',
};

function fieldErrors(schema, input) {
  try {
    parseWith(schema, input);
  } catch (err) {
    assert.ok(err instanceof ApiError, 'expected an ApiError');
    assert.equal(err.status, 422);
    return err.details;
  }
  return null;
}

describe('product schemas', () => {
  test('accepts a minimal product and trims the name', () => {
    const parsed = parseWith(productCreateSchema, { ...validProduct, name: '  Workspace  ' });
    assert.equal(parsed.name, 'Workspace');
  });

  test('rejects negative and over-precise prices with a field message', () => {
    assert.ok(fieldErrors(productCreateSchema, { ...validProduct, sale_price: '-5.00' }).sale_price);
    assert.ok(fieldErrors(productCreateSchema, { ...validProduct, sale_price: '10.005' }).sale_price);
    assert.ok(fieldErrors(productCreateSchema, { ...validProduct, sale_price: 100 }).sale_price);
  });

  test('requires a name', () => {
    assert.ok(fieldErrors(productCreateSchema, { sale_price: '1.00' }).name);
    assert.ok(fieldErrors(productCreateSchema, { name: '   ', sale_price: '1.00' }).name);
  });

  test('rejects unknown fields', () => {
    assert.equal(fieldErrors(productCreateSchema, { ...validProduct, colour: 'red' }).colour, 'Unknown field.');
  });

  test('update requires at least one field', () => {
    assert.ok(fieldErrors(productUpdateSchema, {}).body);
  });

  test('update does not invent defaults for omitted fields', () => {
    assert.deepEqual(parseWith(productUpdateSchema, { notes: 'hi' }), { notes: 'hi' });
  });
});

describe('variant schemas', () => {
  test('create defaults price_extra to 0.00', () => {
    const parsed = parseWith(variantCreateSchema, { attribute: 'Brand', value: 'Odoo' });
    assert.equal(parsed.price_extra, '0.00');
  });

  test('update does not add a default price_extra (regression: would wipe the +560)', () => {
    assert.deepEqual(parseWith(variantUpdateSchema, { value: 'Odoo Enterprise' }), { value: 'Odoo Enterprise' });
  });

  test('requires attribute and value', () => {
    const errors = fieldErrors(variantCreateSchema, { price_extra: '560.00' });
    assert.ok(errors.attribute);
    assert.ok(errors.value);
  });
});

describe('plan schemas', () => {
  test('defaults minimum_quantity to 1 on create', () => {
    assert.equal(parseWith(planCreateSchema, validPlan).minimum_quantity, 1);
  });

  test('update does not add a default minimum_quantity (regression: would reset it)', () => {
    assert.deepEqual(parseWith(planUpdateSchema, { name: 'Renamed' }), { name: 'Renamed' });
  });

  test('rejects an unknown billing interval', () => {
    assert.ok(fieldErrors(planCreateSchema, { ...validPlan, billing_interval: 'QUARTER' }).billing_interval);
  });

  test('rejects a minimum quantity below 1', () => {
    assert.ok(fieldErrors(planCreateSchema, { ...validPlan, minimum_quantity: 0 }).minimum_quantity);
  });

  test('rejects an impossible calendar date', () => {
    assert.ok(fieldErrors(planCreateSchema, { ...validPlan, available_from: '2026-02-30' }).available_from);
  });

  test('rejects availability that ends before it starts, on available_to', () => {
    const errors = fieldErrors(planCreateSchema, {
      ...validPlan,
      available_from: '2026-06-01',
      available_to: '2026-05-31',
    });
    assert.ok(errors.available_to);
  });

  test('accepts an open-ended availability window', () => {
    assert.ok(parseWith(planCreateSchema, { ...validPlan, available_from: '2026-06-01' }));
  });

  test('rejects an invalid variant id', () => {
    assert.ok(fieldErrors(planCreateSchema, { ...validPlan, product_variant_id: 'abc' }).product_variant_id);
  });
});

describe('pagination', () => {
  test('defaults to page 1 and 20 items', () => {
    assert.deepEqual(parseWith(paginationQuery, {}), { page: 1, page_size: 20 });
  });

  test('parses query strings and rejects oversized pages', () => {
    assert.deepEqual(parseWith(paginationQuery, { page: '3', page_size: '50' }), { page: 3, page_size: 50 });
    assert.ok(fieldErrors(paginationQuery, { page_size: '500' }).page_size);
    assert.ok(fieldErrors(paginationQuery, { page: '0' }).page);
  });
});
