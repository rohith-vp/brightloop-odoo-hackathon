import { loadConfig } from './config.js';
import { createDb } from './db.js';
import { createApp } from './app.js';

const config = loadConfig();
const db = createDb(config.databaseUrl);
const app = createApp({ db, corsOrigins: config.corsOrigins });

const server = app.listen(config.port, config.host, () => {
  console.log(`API listening on http://${config.host}:${config.port}/api (${config.env})`);
});

// Stop accepting requests, close DB connections, then exit.
// Force exit after 10 seconds if something hangs.
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
