import express, { type ErrorRequestHandler } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { HttpError } from './lib/http-error.js';
import { productRoutes } from './products/product.routes.js';
import { cartRoutes } from './cart/cart.routes.js';

export function createApp(database: DatabaseSync) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'proof-inter-back' });
  });

  app.use('/api', productRoutes(database));
  app.use('/api', cartRoutes(database));

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'La ruta solicitada no existe.' },
    });
  });

  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    if (error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed') {
      res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo debe ser JSON válido.' } });
      return;
    }
    if (error instanceof Error && 'type' in error && error.type === 'entity.too.large') {
      res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'El cuerpo supera el límite permitido.' } });
      return;
    }
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error interno.' } });
  };

  app.use(errorHandler);
  return app;
}
