
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { config } from './config/env';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        config.clientUrl,
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging & Rate limiting
  app.use(requestLogger);
  app.use(globalRateLimiter);

  // Mount API Router under /api/v1 and alias /api
  app.use('/api/v1', routes);
  app.use('/api', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

