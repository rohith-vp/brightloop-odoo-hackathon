// An error with an HTTP status and a stable code. The central error handler
// turns it into the { error: { code, message, details } } shape from docs/api.md.
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(what) {
  return new ApiError(404, 'NOT_FOUND', `${what} was not found.`);
}

// Maps PostgreSQL constraint errors to API errors, so routes don't need try/catch.
export function translateDbError(err) {
  switch (err?.code) {
    case '23505':
      return new ApiError(409, 'CONFLICT', 'A record with the same unique value already exists.');
    // 23001 is restrict_violation (ON DELETE RESTRICT). 23503 is a plain foreign-key violation.
    case '23001':
    case '23503':
      return new ApiError(409, 'CONFLICT', 'This record is still in use and cannot be changed or deleted.');
    case '23514':
    case '23502':
      return new ApiError(422, 'VALIDATION_ERROR', 'A value violates a database rule.');
    default:
      return null;
  }
}
