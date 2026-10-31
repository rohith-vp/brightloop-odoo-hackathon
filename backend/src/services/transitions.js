import { ApiError, notFound } from '../errors.js';
import { InvalidTransitionError } from '../billing.js';
import { isUuid } from '../validation.js';

// Applies one state-machine action to a row. Two checks guard it:
//   1. The state machine (packages/billing) decides whether the action is allowed from the current state.
//   2. The UPDATE only succeeds if the row is still in that state, so concurrent requests cannot both move it.
// `table` and `machine` come from code, never from request input.
export async function applyTransition(db, { table, machine, id, action, label }) {
  if (!isUuid(id)) throw notFound(label);
  const { rows: current } = await db.query(`SELECT status FROM ${table} WHERE id = $1`, [id]);
  if (!current[0]) throw notFound(label);

  const from = current[0].status;
  let to;
  try {
    to = machine.next(from, action);
  } catch (err) {
    if (err instanceof InvalidTransitionError) {
      throw new ApiError(409, 'INVALID_TRANSITION', err.message, { current_status: from, action });
    }
    throw err;
  }

  const { rows } = await db.query(
    `UPDATE ${table} SET status = $2, updated_at = now() WHERE id = $1 AND status = $3 RETURNING id`,
    [id, to, from],
  );
  if (!rows[0]) {
    throw new ApiError(409, 'INVALID_TRANSITION', 'This record changed while your request was running. Reload and try again.', {
      current_status: from,
      action,
    });
  }
  return { from, to };
}
