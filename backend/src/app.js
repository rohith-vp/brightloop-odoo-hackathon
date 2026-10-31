import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';

// Builds the Express app. The database is passed in so tests can supply a fake.
export function createApp({ db, corsOrigins = [], jwtSecret })  {
  const app = express();
  app.disable('x-powered-by');

  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', healthRouter({ db }));
  app.use('/api', authRouter({ db, jwtSecret }));

  // Unknown routes return the same error shape as the rest of the API (docs/api.md).
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `No route for ${req.method} ${req.path}`,
      },
    });
  });

  // Central error handler. Express requires all four parameters.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: { code: 'MALFORMED_JSON', message: 'Request body is not valid JSON.' },
      });
    }
    console.error(err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    });
  });

  return app;
}
