import type { DatabaseSync } from 'node:sqlite';

const CART_ADD_POINTS = 10;

/** Se ejecuta dentro de la misma transacción que la modificación del carrito. */
export function awardCartAddition(database: DatabaseSync, userId: number, productId: number): number {
  const result = database.prepare(`
    INSERT INTO reward_events (user_id, product_id, action, points)
    VALUES (?, ?, 'cart_add', ?)
    ON CONFLICT (user_id, product_id, action) DO NOTHING
  `).run(userId, productId, CART_ADD_POINTS);

  if (Number(result.changes) === 0) return 0;
  database.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(CART_ADD_POINTS, userId);
  return CART_ADD_POINTS;
}
