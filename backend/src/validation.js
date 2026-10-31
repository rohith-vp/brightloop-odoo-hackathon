import { z } from 'zod';
import { ApiError } from './errors.js';

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

// Parses input with a Zod schema. On failure, throws a 422 with one message per field.
export function parseWith(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', toFieldErrors(result.error.issues));
}

function toFieldErrors(issues) {
  const details = {};
  for (const issue of issues) {
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) details[key] = 'Unknown field.';
      continue;
    }
    const key = issue.path.length > 0 ? issue.path.join('.') : 'body';
    if (!(key in details)) details[key] = issue.message;
  }
  return details;
}

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});
