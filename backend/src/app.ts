import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import apiRouter from './routes';
import { rateLimiter } from './middlewares/rateLimitMiddleware';
import { errorHandler } from './middlewares/errorMiddleware';
import swaggerDocument from './docs/swagger.json';

const app = express();

// Security and Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allows inline scripts for swagger-ui and dev
}));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev proxy)
      if (!origin || origin === env.CLIENT_ORIGIN || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev permissive
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiter
app.use('/api', rateLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    title: env.GAME_TITLE,
    veloopMode: env.VELOOP_MODE,
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes (support both /api/v1 and /api for compatibility)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Centralized Error Handler
app.use(errorHandler);

export default app;
