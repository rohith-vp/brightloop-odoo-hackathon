import { Router } from 'express';

// GET /api/health reports whether the API can reach PostgreSQL.
// Used by Docker, the README, and the demo's "is it up?" check.
export function healthRouter({ db }) {
  const router = Router();

  router.get('/health', async (req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ data: { status: 'ok', database: 'up' } });
    } catch (err) {
      console.error('Health check failed:', err.message);
      res.status(503).json({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database is not reachable.',
        },
      });
    }
  });

  return router;
}
