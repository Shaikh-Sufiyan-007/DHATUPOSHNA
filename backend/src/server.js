
import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import logger from './utils/logger.js';

let server;


const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      logger.info('================================================================');
      logger.info(` Ayurvedic Dhatu Knowledge & Information Platform (Backend API)`);
      logger.info(` Environment: ${config.env}`);
      logger.info(` Server Listening on: http://localhost:${config.port}`);
      logger.info(` Health Check:       http://localhost:${config.port}/api/v1/health`);
      logger.info(` Dhatu API (v1):     http://localhost:${config.port}/api/v1/dhatus`);
      logger.info(` Reference API (v1): http://localhost:${config.port}/api/v1/references`);
      logger.info('================================================================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};


const gracefulShutdown = async (signal) => {
  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed successfully.');
      await disconnectDB();
      logger.info('Database connections closed. Process terminating cleanly.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception occurred:', error.stack || error.message);
  process.exit(1);
});

startServer();
