import pg from 'pg';

export function createDb(connectionString) {
  const pool = new pg.Pool({ connectionString, max: 10 });

  // Without this handler, an idle connection error would crash the process.
  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
  });

  return pool;
}
