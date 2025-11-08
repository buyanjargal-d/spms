import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { ENV, validateEnv } from './config/env';
import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { logger } from './utils/logger';

// Import routes (will create these)
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import studentRoutes from './routes/student.routes';
import pickupRoutes from './routes/pickup.routes';
import debugRoutes from './routes/debug.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(
      cors({
        origin: ENV.ALLOWED_ORIGINS,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (ENV.isDevelopment()) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }));
    }

    // Trust proxy (for rate limiting, real IP detection)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    const apiPrefix = ENV.API_PREFIX;

    // Health check - both root and API prefix
    const healthCheck = (_req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: ENV.NODE_ENV,
        version: '1.0.0',
      });
    };

    this.app.get('/health', healthCheck);
    this.app.get(`${apiPrefix}/health`, healthCheck);

    // API routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/students`, studentRoutes);
    this.app.use(`${apiPrefix}/pickup`, pickupRoutes);

    // Debug routes (TEMPORARY - REMOVE AFTER DEBUGGING!)
    // Enabled temporarily to diagnose database issues
    this.app.use(`${apiPrefix}/debug`, debugRoutes);

    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Student Pickup Management System (SPMS) API',
        version: '1.0.0',
        thesis: 'Paradigm shift from DevOps to DevSecOps',
        author: 'Д.Буянжаргал',
        documentation: `${apiPrefix}/docs`,
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // Validate environment variables
      validateEnv();

      // Initialize database
      await initializeDatabase();

      logger.info('✅ Application initialized successfully');
    } catch (error) {
      logger.error('❌ Application initialization failed:', error);
      throw error;
    }
  }
}

export default App;
