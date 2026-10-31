import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

const startServer = async () => {
  try {
    // Attempt database connection first
    await connectDB();
  } catch (error) {
    console.warn(`[Warning] Database connection failed at startup: ${error.message}. Continuing server startup...`);
  }

  server = app.listen(env.PORT, () => {
    console.log(`[Brightloop Server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[Brightloop Server] Health check available at http://localhost:${env.PORT}/api/health`);
  });
};

const handleShutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('[Shutdown] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]:', error);
  process.exit(1);
});

startServer();
