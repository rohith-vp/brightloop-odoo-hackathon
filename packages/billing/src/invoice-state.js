import { createStateMachine } from './state-machine.js';

// Draft -> Confirmed -> Paid, with cancel allowed before payment.
// Recording payments is not part of this machine yet. The record_full_payment
// action is reserved for the payments module.
export const invoiceMachine = createStateMachine('invoice', {
  DRAFT: { confirm: 'CONFIRMED', cancel: 'CANCELLED' },
  CONFIRMED: { record_full_payment: 'PAID', cancel: 'CANCELLED' },
  PAID: {},
  CANCELLED: {},
});

export const INVOICE_ACTIONS = Object.freeze(['confirm', 'cancel']);
