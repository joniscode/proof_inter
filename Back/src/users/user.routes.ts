import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { getCurrentUser } from './user.service.js';

export function userRoutes(database: DatabaseSync): Router {
  const router = Router();
  router.get('/user', (_req, res) => res.json(getCurrentUser(database)));
  return router;
}
