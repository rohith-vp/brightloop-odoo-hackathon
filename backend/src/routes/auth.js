import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../errors.js';
import { parseWith } from '../validation.js';
import { requireAuth } from '../auth.js';
import { sendData } from '../response.js';
import { signupSchema, loginSchema } from '../schemas/auth.js';

export const PUBLIC_USER_COLUMNS = 'id, name, email, role, created_at';
export const BCRYPT_ROUNDS = 12;

// Compared against unknown emails, so a login's response time does not reveal which accounts exist.
let dummyHashPromise;
function dummyHash() {
  dummyHashPromise ??= bcrypt.hash('unused-placeholder-password', BCRYPT_ROUNDS);
  return dummyHashPromise;
}

// Inserts a user with a hashed password. Duplicate emails become 409 with a field message.
export async function insertUser(db, { name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${PUBLIC_USER_COLUMNS}`,
      [name, email, passwordHash, role],
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.', {
        email: 'This email is already registered.',
      });
    }
    throw err;
  }
}

export function authRouter({ db, jwtSecret, jwtExpiresMinutes = 60 }) {
  const router = Router();

  // Public sign-up always creates a CUSTOMER. Only an admin can create staff.
  router.post('/auth/signup', async (req, res) => {
    const input = parseWith(signupSchema, req.body);
    const user = await insertUser(db, { ...input, role: 'CUSTOMER' });
    sendData(res, user, 201);
  });

  router.post('/auth/login', async (req, res) => {
    const { email, password } = parseWith(loginSchema, req.body);

    const { rows } = await db.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email],
    );
    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : await dummyHash());

    if (!user || !passwordMatches) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const expiresIn = jwtExpiresMinutes * 60;
    const accessToken = jwt.sign({ role: user.role }, jwtSecret, {
      subject: user.id,
      expiresIn,
      algorithm: 'HS256',
    });

    sendData(res, {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });

  router.get('/auth/me', requireAuth, (req, res) => {
    sendData(res, req.user);
  });

  return router;
}
