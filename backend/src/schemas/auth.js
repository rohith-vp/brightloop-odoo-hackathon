import { z } from 'zod';

export const ROLE_VALUES = ['ADMIN', 'STAFF', 'CUSTOMER'];

// Password rules from the problem statement: more than eight characters, with an
// uppercase letter, a lowercase letter, and a special character (anything that is not a letter or digit).
export const passwordSchema = z
  .string({ error: 'Password is required.' })
  .min(9, 'Password must be more than 8 characters.')
  .max(128, 'Password must be 128 characters or fewer.')
  .regex(/[A-Z]/, 'Password needs at least one uppercase letter.')
  .regex(/[a-z]/, 'Password needs at least one lowercase letter.')
  .regex(/[^A-Za-z0-9]/, 'Password needs at least one special character.');

// Trim and lowercase before validating, so "Asha@Example.com " is stored as "asha@example.com".
const normalizedEmail = (message) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.email({ error: message }).max(255, 'Email must be 255 characters or fewer.'),
  );

export const signupSchema = z
  .object({
    name: z
      .string({ error: 'Name is required.' })
      .trim()
      .min(1, 'Name is required.')
      .max(100, 'Name must be 100 characters or fewer.'),
    email: normalizedEmail('Enter a valid email address.'),
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: normalizedEmail('Enter a valid email address.'),
    password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
  })
  .strict();

// Used by admins to create an account with a chosen role (for example, a Staff member).
export const adminCreateUserSchema = signupSchema
  .extend({ role: z.enum(ROLE_VALUES, { error: 'Role must be ADMIN, STAFF, or CUSTOMER.' }) })
  .strict();

export const roleUpdateSchema = z
  .object({ role: z.enum(ROLE_VALUES, { error: 'Role must be ADMIN, STAFF, or CUSTOMER.' }) })
  .strict();
