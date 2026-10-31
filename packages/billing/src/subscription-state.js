import { createStateMachine } from './state-machine.js';

// Draft -> Confirmed -> Active -> Closed. Only Active subscriptions are billed.
// Closed is final: no future invoices, and the demo does not reactivate it.
export const subscriptionMachine = createStateMachine('subscription', {
  DRAFT: { confirm: 'CONFIRMED' },
  CONFIRMED: { activate: 'ACTIVE' },
  ACTIVE: { close: 'CLOSED' },
  CLOSED: {},
});

export const SUBSCRIPTION_ACTIONS = Object.freeze(['confirm', 'activate', 'close']);
