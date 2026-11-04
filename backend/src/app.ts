import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';
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

// ─── Serve Frontend Static Files ───────────────────────────────────────────
// In production (or when the frontend build exists), serve the React SPA.
// This allows deploying as a single server — no separate frontend server needed.
const candidateDistPaths = [
  path.resolve(__dirname, '..', '..', 'frontend', 'dist'),
  path.resolve(__dirname, '..', 'frontend', 'dist'),
  path.resolve(process.cwd(), 'frontend', 'dist'),
  path.resolve(process.cwd(), '..', 'frontend', 'dist')
];
const frontendDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`[App] Serving frontend static files from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback: any non-API route serves index.html (for client-side routing)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log(`[App] No frontend build found. Run 'npm run build' in frontend/ to enable single-server deployment.`);
}

// Centralized Error Handler
app.use(errorHandler);

export default app;
