import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function authRouter({ db, jwtSecret }) {
  const router = Router();

  // Sign up
  router.post('/auth/signup', async (req, res, next) => {
    try {
      const parsed = signupSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0].message,
          },
        });
      }

      const { name, email, password } = parsed.data;
      const passwordHash = await bcrypt.hash(password, 12);

      const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'CUSTOMER')
         RETURNING id, name, email, role`,
        [name, email.toLowerCase(), passwordHash]
      );

      return res.status(201).json({
        user: result.rows[0],
      });
    } catch (error) {
      // PostgreSQL unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email already exists.',
          },
        });
      }

      next(error);
    }
  });

  // Login
  router.post('/auth/login', async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'A valid email and password are required.',
          },
        });
      }

      const { email, password } = parsed.data;

      const result = await db.query(
        `SELECT id, name, email, password_hash, role
         FROM users
         WHERE email = $1`,
        [email.toLowerCase()]
      );

      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}