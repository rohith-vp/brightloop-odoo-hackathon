// Creates one account per role for local demos and presentations.
// Usage: docker compose run --rm api npm run seed:demo
// Idempotent: running it again resets these three accounts to the documented role and password,
// so the README always matches the database. Do not reuse these accounts for real data.
// Refused in production, because the password below is public in this repository.
import bcrypt from 'bcryptjs';
import { loadConfig } from '../config.js';
import { createDb } from '../db.js';
import { runMigrations } from '../migrate.js';
import { passwordSchema } from '../schemas/auth.js';
import { BCRYPT_ROUNDS, PUBLIC_USER_COLUMNS } from '../routes/auth.js';

export const DEMO_PASSWORD = 'Demo!Passw0rd';

export const DEMO_ACCOUNTS = Object.freeze([
  { name: 'Demo Admin', email: 'admin@brightloop.test', role: 'ADMIN' },
  { name: 'Demo Staff', email: 'staff@brightloop.test', role: 'STAFF' },
  { name: 'Demo Customer', email: 'customer@brightloop.test', role: 'CUSTOMER' },
]);

const config = loadConfig();
if (config.env === 'production') {
  console.error('Refusing to create demo accounts in production (APP_ENV=production).');
  process.exit(1);
}
passwordSchema.parse(DEMO_PASSWORD);

const db = createDb(config.databaseUrl);
try {
  await runMigrations(db);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  for (const account of DEMO_ACCOUNTS) {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [account.email]);
    if (existing.rows[0]) {
      await db.query(
        'UPDATE users SET role = $2, password_hash = $3, updated_at = now() WHERE id = $1',
        [existing.rows[0].id, account.role, passwordHash],
      );
      console.log(`Reset   ${account.role.padEnd(8)} ${account.email}`);
    } else {
      await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING ${PUBLIC_USER_COLUMNS}`,
        [account.name, account.email, passwordHash, account.role],
      );
      console.log(`Created ${account.role.padEnd(8)} ${account.email}`);
    }
  }
} finally {
  await db.end();
}
