import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { subscriptionMachine, invoiceMachine, InvalidTransitionError } from '../src/index.js';

describe('subscription state machine: Draft -> Confirmed -> Active -> Closed', () => {
  test('follows the forward path one step at a time', () => {
    assert.equal(subscriptionMachine.next('DRAFT', 'confirm'), 'CONFIRMED');
    assert.equal(subscriptionMachine.next('CONFIRMED', 'activate'), 'ACTIVE');
    assert.equal(subscriptionMachine.next('ACTIVE', 'close'), 'CLOSED');
  });

  test('rejects skipping a step, such as Draft directly to Active', () => {
    assert.throws(() => subscriptionMachine.next('DRAFT', 'activate'), InvalidTransitionError);
    assert.throws(() => subscriptionMachine.next('DRAFT', 'close'), InvalidTransitionError);
  });

  test('rejects going backwards', () => {
    assert.throws(() => subscriptionMachine.next('ACTIVE', 'confirm'), InvalidTransitionError);
    assert.throws(() => subscriptionMachine.next('CONFIRMED', 'confirm'), InvalidTransitionError);
  });

  test('Closed is final, so no action is allowed from it', () => {
    assert.deepEqual(subscriptionMachine.actionsFrom('CLOSED'), []);
    for (const action of ['confirm', 'activate', 'close']) {
      assert.throws(() => subscriptionMachine.next('CLOSED', action), InvalidTransitionError);
    }
  });

  test('unknown states and inherited names are rejected', () => {
    assert.equal(subscriptionMachine.canTransition('SUSPENDED', 'activate'), false);
    assert.equal(subscriptionMachine.canTransition('DRAFT', 'constructor'), false);
    assert.equal(subscriptionMachine.canTransition('constructor', 'confirm'), false);
    assert.throws(() => subscriptionMachine.next('DRAFT', '__proto__'), InvalidTransitionError);
  });

  test('the error carries the entity, state, and action for the API response', () => {
    try {
      subscriptionMachine.next('DRAFT', 'close');
      assert.fail('expected an error');
    } catch (err) {
      assert.equal(err.code, 'INVALID_TRANSITION');
      assert.equal(err.entity, 'subscription');
      assert.equal(err.from, 'DRAFT');
      assert.equal(err.action, 'close');
      assert.equal(err.message, 'Cannot close a subscription that is draft.');
    }
  });

  test('the machine is frozen, so code cannot add or change transitions at runtime', () => {
    assert.throws(() => {
      'use strict';
      subscriptionMachine.extra = 1;
    }, TypeError);
  });
});

describe('invoice state machine: Draft -> Confirmed -> Paid, with cancel', () => {
  test('confirm then record payment reaches Paid', () => {
    assert.equal(invoiceMachine.next('DRAFT', 'confirm'), 'CONFIRMED');
    assert.equal(invoiceMachine.next('CONFIRMED', 'record_full_payment'), 'PAID');
  });

  test('cancel is allowed from Draft and Confirmed, but not after Paid', () => {
    assert.equal(invoiceMachine.next('DRAFT', 'cancel'), 'CANCELLED');
    assert.equal(invoiceMachine.next('CONFIRMED', 'cancel'), 'CANCELLED');
    assert.throws(() => invoiceMachine.next('PAID', 'cancel'), InvalidTransitionError);
  });

  test('a Draft invoice cannot be marked paid without being confirmed', () => {
    assert.throws(() => invoiceMachine.next('DRAFT', 'record_full_payment'), InvalidTransitionError);
  });

  test('a cancelled invoice cannot be confirmed again', () => {
    assert.throws(() => invoiceMachine.next('CANCELLED', 'confirm'), InvalidTransitionError);
  });
});
