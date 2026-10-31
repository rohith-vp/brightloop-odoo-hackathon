import { subscriptionsRouter } from './routes/subscriptions.js';
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { productsRouter } from './routes/products.js';
import { variantsRouter } from './routes/variants.js';
import { plansRouter } from './routes/plans.js';
import { ApiError, translateDbError } from './errors.js';
import { invoicesRouter } from './routes/invoice.js';

// Default authentication: attaches no user, so protected routes return 401.
// index.js passes the JWT authenticator in.
export function noAuthentication(req, res, next) {
  next();
}

// Builds the Express app. The database, auth middleware, and JWT settings are passed in,
// so tests can supply fakes.
export function createApp({
  db,
  corsOrigins = [],
  authenticate = noAuthentication,
  jwtSecret,
  jwtExpiresMinutes = 60,
}) {
  const app = express();
  app.disable('x-powered-by');

  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(authenticate);

  app.use('/api', healthRouter({ db }));
  app.use('/api', authRouter({ db, jwtSecret, jwtExpiresMinutes }));
  app.use('/api/users', usersRouter({ db }));
  app.use('/api/products', productsRouter({ db }));
  app.use('/api/plans', plansRouter({ db }));
  app.use('/api/subscriptions', subscriptionsRouter({ db }));
  app.use('/api/invoices', invoicesRouter({ db }));
  app.use('/api', variantsRouter({ db }));

  // Unknown routes return the same error shape as the rest of the API.
  app.use((req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` },
    });
  });

  // Central error handler. Express requires all four parameters.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: { code: 'MALFORMED_JSON', message: 'Request body is not valid JSON.' },
      });
    }

    const apiError = err instanceof ApiError ? err : translateDbError(err);
    if (apiError) {
      const body = { code: apiError.code, message: apiError.message };
      if (apiError.details) body.details = apiError.details;
      return res.status(apiError.status).json({ error: body });
    }

    console.error(err);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    });
  });

  return app;
}
