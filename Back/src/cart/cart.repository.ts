import type { DatabaseSync } from 'node:sqlite';
import type { Product } from '../types/entities.js';

export function readCartItems(database: DatabaseSync, userId: number) {
  const rows = database.prepare(`
    SELECT p.id, p.name, p.price, p.category, p.image, p.stock, c.quantity
    FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ? ORDER BY p.id
  `).all(userId) as unknown as (Product & { quantity: number })[];
  return rows.map(({ quantity, ...product }) => ({ product, quantity, subtotal: product.price * quantity }));
}

export function readQuantity(database: DatabaseSync, userId: number, productId: number): number {
  return Number(database.prepare('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(userId, productId)?.quantity ?? 0);
}

export function writeQuantity(database: DatabaseSync, userId: number, productId: number, quantity: number): void {
  database.prepare(`
    INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
    ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = excluded.quantity
  `).run(userId, productId, quantity);
}

export function removeItem(database: DatabaseSync, userId: number, productId: number): void {
  database.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
}
