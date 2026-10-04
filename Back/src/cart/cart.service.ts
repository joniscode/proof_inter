import type { DatabaseSync } from 'node:sqlite';
import { HttpError } from '../lib/http-error.js';
import { getProduct } from '../products/product.repository.js';
import { findUser, readCartItems, readQuantity, removeItem, writeQuantity } from './cart.repository.js';

const DEMO_USER_ID = 1;

function requireUser(database: DatabaseSync): number {
  if (!findUser(database, DEMO_USER_ID)) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'No existe el usuario de demostración. Ejecuta db:seed.');
  }
  return DEMO_USER_ID;
}

export function getCart(database: DatabaseSync) {
  const items = readCartItems(database, requireUser(database));
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
    currency: 'COP',
  };
}

function transaction<T>(database: DatabaseSync, action: () => T): T {
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = action();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function changeCartItem(database: DatabaseSync, productId: number, quantity: number, mode: 'add' | 'set') {
  return transaction(database, () => {
    const userId = requireUser(database);
    const product = getProduct(database, productId);
    if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.');
    const newQuantity = mode === 'add' ? readQuantity(database, userId, productId) + quantity : quantity;
    if (newQuantity > 999) {
      throw new HttpError(400, 'INVALID_INPUT', 'La cantidad por producto no puede superar 999.');
    }
    if (newQuantity > product.stock) {
      throw new HttpError(409, 'INSUFFICIENT_STOCK', 'La cantidad solicitada supera el stock disponible.');
    }
    writeQuantity(database, userId, productId, newQuantity);
    return getCart(database);
  });
}

export function deleteCartItem(database: DatabaseSync, productId: number) {
  return transaction(database, () => {
    removeItem(database, requireUser(database), productId);
    return getCart(database);
  });
}
