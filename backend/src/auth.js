import { ApiError } from './errors.js';

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
});

export const WRITE_ROLES = Object.freeze([ROLES.ADMIN, ROLES.STAFF]);

// Expects req.user = { id, role } to be set by the authentication middleware.
// Until JWT auth is merged, req.user is never set, so protected routes return 401.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'UNAUTHENTICATED', 'Sign in to continue.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'You do not have permission to do this.'));
    }
    return next();
  };
}

// Any signed-in user, regardless of role.
export const requireAuth = requireRole(...Object.values(ROLES));
