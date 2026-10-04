import type { DatabaseSync } from 'node:sqlite';
import type { Product } from '../types/entities.js';

export interface ProductFilters {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}

export function listProducts(database: DatabaseSync, filters: ProductFilters) {
  const conditions: string[] = [];
  const values: string[] = [];
  if (filters.category) {
    conditions.push('category = ?');
    values.push(filters.category);
  }
  if (filters.search) {
    conditions.push('instr(normalize_text(name), normalize_text(?)) > 0');
    values.push(filters.search);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const total = Number(database.prepare(`SELECT COUNT(*) AS total FROM products ${where}`).get(...values)?.total);
  const data = database.prepare(
    `SELECT id, name, price, category, image, stock FROM products ${where} ORDER BY id LIMIT ? OFFSET ?`,
  ).all(...values, filters.limit, (filters.page - 1) * filters.limit) as unknown as Product[];
  return {
    data,
    pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  };
}

export function listCategories(database: DatabaseSync): string[] {
  return database.prepare('SELECT DISTINCT category FROM products ORDER BY category').all()
    .map(row => String(row.category));
}

export function getProduct(database: DatabaseSync, id: number): Product | undefined {
  return database.prepare('SELECT id, name, price, category, image, stock FROM products WHERE id = ?')
    .get(id) as unknown as Product | undefined;
}
