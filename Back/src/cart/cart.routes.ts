import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { allowedFields, bodyInteger, bodyObject, positiveInteger } from '../lib/validation.js';
import { changeCartItem, checkoutCart, deleteCartItem, getCart } from './cart.service.js';
import { getInventorySession, type InventorySessions } from '../simulation/inventory.js';

export function cartRoutes(database: DatabaseSync, sessions: InventorySessions): Router {
  const router = Router();

  router.get('/cart', (req, res) => res.json(getCart(database, getInventorySession(req, sessions))));

  router.post('/cart/checkout', (req, res) => {
    const body = bodyObject(req.body);
    allowedFields(body, []);
    res.json(checkoutCart(database, getInventorySession(req, sessions)));
  });

  router.post('/cart/items', (req, res) => {
    const body = bodyObject(req.body);
    allowedFields(body, ['productId', 'quantity']);
    const productId = bodyInteger(body.productId, 'productId');
    const quantity = bodyInteger(body.quantity, 'quantity', 999);
    res.json(changeCartItem(database, productId, quantity, 'add', getInventorySession(req, sessions)));
  });

  router.put('/cart/items/:productId', (req, res) => {
    const productId = positiveInteger(req.params.productId, 'productId');
    const body = bodyObject(req.body);
    allowedFields(body, ['quantity']);
    const quantity = bodyInteger(body.quantity, 'quantity', 999);
    res.json(changeCartItem(database, productId, quantity, 'set', getInventorySession(req, sessions)));
  });

  router.delete('/cart/items/:productId', (req, res) => {
    const productId = positiveInteger(req.params.productId, 'productId');
    res.json(deleteCartItem(database, productId, getInventorySession(req, sessions)));
  });

  return router;
}
