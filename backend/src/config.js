import { z } from 'zod';

// Reads settings from environment variables (see .env.example).
// Fails fast at startup with a readable message if something is missing or invalid.
const envSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  DATABASE_URL: z
    .string({ error: 'DATABASE_URL is required' })
    .min(1, { error: 'DATABASE_URL is required' }),
    JWT_SECRET: z
  .string()
  .min(16, { error: 'JWT_SECRET must be at least 16 characters' }),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

export function loadConfig(env = process.env) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid configuration:\n${details}`);
  }

  const values = parsed.data;
  return {
    env: values.APP_ENV,
    host: values.API_HOST,
    port: values.API_PORT,
    databaseUrl: values.DATABASE_URL,
    corsOrigins: values.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  };
}
