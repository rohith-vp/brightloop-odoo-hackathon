import { Router } from 'express';
import { parseWith } from '../validation.js';
import { requireRole, WRITE_ROLES } from '../auth.js';
import { sendData } from '../response.js';
import { billingRunSchema } from '../schemas/billing.js';
import { runBilling } from '../services/billing-run.js';

export function billingRouter({ db }) {
  const router = Router();

  // Creates every invoice due as of the given date, in one transaction.
  // Safe to repeat: a second run for the same date creates nothing.
  router.post('/run', requireRole(...WRITE_ROLES), async (req, res) => {
    const { as_of } = parseWith(billingRunSchema, req.body);
    sendData(res, await runBilling(db, { asOf: as_of }));
  });

  return router;
}
