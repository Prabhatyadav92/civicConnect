import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import metaRoutes from './routes/meta.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));
  if (config.env !== 'test') app.use(morgan('dev'));

  app.use(
    '/uploads',
    express.static(config.uploadDir, {
      maxAge: '7d',
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    })
  );

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/meta', metaRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
