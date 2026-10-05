import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { allowedFields, optionalText, positiveInteger } from '../lib/validation.js';
import { listCategories, listProducts } from './product.repository.js';
import { availableProduct, getInventorySession, type InventorySessions } from '../simulation/inventory.js';

export function productRoutes(database: DatabaseSync, sessions: InventorySessions): Router {
  const router = Router();

  router.get('/products', (req, res) => {
    allowedFields(req.query, ['page', 'limit', 'category', 'search']);
    const page = positiveInteger(req.query.page ?? '1', 'page', 1_000_000);
    const limit = positiveInteger(req.query.limit ?? '6', 'limit', 100);
    const category = optionalText(req.query.category, 'category', 50);
    const search = optionalText(req.query.search, 'search', 100);
    const inventory = getInventorySession(req, sessions);
    const result = listProducts(database, { page, limit, category, search });
    res.json({ ...result, data: result.data.map(product => availableProduct(product, inventory)) });
  });

  router.get('/categories', (_req, res) => {
    res.json({ data: listCategories(database) });
  });

  return router;
}
