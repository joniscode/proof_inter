import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { allowedFields, bodyInteger, bodyObject, positiveInteger } from '../lib/validation.js';
import { changeCartItem, deleteCartItem, getCart } from './cart.service.js';

export function cartRoutes(database: DatabaseSync): Router {
  const router = Router();

  router.get('/cart', (_req, res) => res.json(getCart(database)));

  router.post('/cart/items', (req, res) => {
    const body = bodyObject(req.body);
    allowedFields(body, ['productId', 'quantity']);
    const productId = bodyInteger(body.productId, 'productId');
    const quantity = bodyInteger(body.quantity, 'quantity', 999);
    res.json(changeCartItem(database, productId, quantity, 'add'));
  });

  router.put('/cart/items/:productId', (req, res) => {
    const productId = positiveInteger(req.params.productId, 'productId');
    const body = bodyObject(req.body);
    allowedFields(body, ['quantity']);
    const quantity = bodyInteger(body.quantity, 'quantity', 999);
    res.json(changeCartItem(database, productId, quantity, 'set'));
  });

  router.delete('/cart/items/:productId', (req, res) => {
    const productId = positiveInteger(req.params.productId, 'productId');
    res.json(deleteCartItem(database, productId));
  });

  return router;
}
