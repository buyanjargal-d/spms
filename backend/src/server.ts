import App from './app';
import { ENV } from './config/env';
import { logger } from './utils/logger';

async function startServer(): Promise<void> {
  try {
    const app = new App();
    await app.initialize();

    const PORT = ENV.PORT;
    const server = app.app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${ENV.NODE_ENV}`);
      logger.info(`API Base URL: http://localhost:${PORT}${ENV.API_PREFIX}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
