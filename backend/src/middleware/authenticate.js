import jwt from 'jsonwebtoken';
import { ApiError } from '../errors.js';

// Reads "Authorization: Bearer <token>" and sets req.user from the database.
// Requests without a header pass through as anonymous. Requests with a bad token get 401.
// The role comes from the database on every request, so a role change applies at once.
export function createAuthenticator({ db, jwtSecret }) {
  return async function authenticate(req, res, next) {
    const header = req.get('authorization');
    if (!header) return next();

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new ApiError(401, 'INVALID_TOKEN', 'Use a bearer token in the Authorization header.'));
    }

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch {
      return next(new ApiError(401, 'INVALID_TOKEN', 'Your session is invalid or has expired. Sign in again.'));
    }

    try {
      const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);
      if (!rows[0]) {
        return next(new ApiError(401, 'INVALID_TOKEN', 'Your session is invalid or has expired. Sign in again.'));
      }
      req.user = rows[0];
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
