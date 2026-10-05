import type { Request } from 'express';
import type { Product } from '../types/entities.js';
import { HttpError } from '../lib/http-error.js';

export type Inventory = Map<number, number>;
export type InventorySessions = Map<string, Inventory>;

export function getInventorySession(request: Request, sessions: InventorySessions): Inventory {
  const sessionId = request.get('X-Simulation-Session') ?? 'demo';
  if (sessionId !== 'demo' && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
    throw new HttpError(400, 'INVALID_INPUT', 'La sesión de simulación no es válida.');
  }
  let inventory = sessions.get(sessionId);
  if (!inventory) {
    inventory = new Map();
    sessions.set(sessionId, inventory);
  }
  return inventory;
}

export function availableProduct(product: Product, inventory: Inventory): Product {
  return { ...product, stock: Math.max(0, product.stock - (inventory.get(product.id) ?? 0)) };
}
