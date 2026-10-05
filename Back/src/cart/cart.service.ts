import type { DatabaseSync } from 'node:sqlite';
import { HttpError } from '../lib/http-error.js';
import { getProduct } from '../products/product.repository.js';
import { clearCart, readCartItems, readQuantity, removeItem, writeQuantity } from './cart.repository.js';
import { getCurrentUser } from '../users/user.service.js';
import { awardCartAddition } from '../rewards/reward.service.js';
import { availableProduct, type Inventory } from '../simulation/inventory.js';

export function getCart(database: DatabaseSync, inventory: Inventory = new Map()) {
  const user = getCurrentUser(database);
  const items = readCartItems(database, user.id).map(item => ({
    ...item, product: availableProduct(item.product, inventory),
  }));
  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
    currency: 'COP',
    points: user.points,
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

export function changeCartItem(database: DatabaseSync, productId: number, quantity: number, mode: 'add' | 'set', inventory: Inventory = new Map()) {
  return transaction(database, () => {
    const userId = getCurrentUser(database).id;
    const product = getProduct(database, productId);
    if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.');
    const previousQuantity = readQuantity(database, userId, productId);
    const newQuantity = mode === 'add' ? previousQuantity + quantity : quantity;
    if (newQuantity > 999) {
      throw new HttpError(400, 'INVALID_INPUT', 'La cantidad por producto no puede superar 999.');
    }
    if (newQuantity > availableProduct(product, inventory).stock) {
      throw new HttpError(409, 'INSUFFICIENT_STOCK', 'La cantidad solicitada supera el stock disponible.');
    }
    writeQuantity(database, userId, productId, newQuantity);
    const pointsGranted = previousQuantity === 0 ? awardCartAddition(database, userId, productId) : 0;
    return { ...getCart(database, inventory), pointsGranted };
  });
}

export function deleteCartItem(database: DatabaseSync, productId: number, inventory: Inventory = new Map()) {
  return transaction(database, () => {
    removeItem(database, getCurrentUser(database).id, productId);
    return { ...getCart(database, inventory), pointsGranted: 0 };
  });
}

export function checkoutCart(database: DatabaseSync, inventory: Inventory) {
  const purchase = transaction(database, () => {
    const userId = getCurrentUser(database).id;
    const items = readCartItems(database, userId);
    if (items.length === 0) {
      throw new HttpError(400, 'EMPTY_CART', 'Agrega productos al carrito antes de comprar.');
    }

    for (const item of items) {
      if (item.quantity > availableProduct(item.product, inventory).stock) {
        throw new HttpError(409, 'INSUFFICIENT_STOCK', `No hay stock suficiente de ${item.product.name}.`);
      }
    }

    clearCart(database, userId);
    return { items, cart: getCart(database, inventory) };
  });
  for (const item of purchase.items) {
    inventory.set(item.product.id, (inventory.get(item.product.id) ?? 0) + item.quantity);
  }
  return { ...purchase.cart, pointsGranted: 0 };
}
