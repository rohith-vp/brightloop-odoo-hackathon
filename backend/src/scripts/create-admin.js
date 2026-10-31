// Creates the first admin account, or promotes an existing account to ADMIN.
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run create-admin
// An existing account keeps its password. Only its role changes.
import bcrypt from 'bcryptjs';
import { loadConfig } from '../config.js';
import { createDb } from '../db.js';
import { runMigrations } from '../migrate.js';
import { passwordSchema, signupSchema } from '../schemas/auth.js';
import { BCRYPT_ROUNDS, PUBLIC_USER_COLUMNS } from '../routes/auth.js';

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? '';
const name = (process.env.ADMIN_NAME ?? 'Administrator').trim() || 'Administrator';

const checked = signupSchema.safeParse({ name, email, password });
if (!checked.success) {
  const messages = checked.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`);
  console.error(`Cannot create admin:\n${messages.join('\n')}`);
  process.exit(1);
}

const config = loadConfig();
const db = createDb(config.databaseUrl);

try {
  await runMigrations(db);

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [checked.data.email]);
  if (existing.rows[0]) {
    const { rows } = await db.query(
      `UPDATE users SET role = 'ADMIN', updated_at = now() WHERE id = $1 RETURNING ${PUBLIC_USER_COLUMNS}`,
      [existing.rows[0].id],
    );
    console.log(`Promoted existing account to ADMIN: ${rows[0].email} (password unchanged)`);
  } else {
    const passwordHash = await bcrypt.hash(passwordSchema.parse(password), BCRYPT_ROUNDS);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'ADMIN')
       RETURNING ${PUBLIC_USER_COLUMNS}`,
      [checked.data.name, checked.data.email, passwordHash],
    );
    console.log(`Created ADMIN account: ${rows[0].email}`);
  }
} finally {
  await db.end();
}
