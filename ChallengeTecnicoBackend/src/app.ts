import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { automotoresRouter } from './routes/automotores.routes';
import { sujetosRouter } from './routes/sujetos.routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/automotores', automotoresRouter);
  app.use('/api/sujetos', sujetosRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
