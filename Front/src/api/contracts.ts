import texts from '../content/texts.json';
import type { Cart, Product, ProductPage } from '../types/shop';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isInteger(value: unknown, minimum = 0): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum;
}

function isProduct(value: unknown): value is Product {
  return isRecord(value)
    && isInteger(value.id, 1)
    && typeof value.name === 'string'
    && isInteger(value.price)
    && typeof value.category === 'string'
    && typeof value.image === 'string'
    && isInteger(value.stock);
}

export function parseProductPage(value: unknown): ProductPage {
  if (!isRecord(value) || !Array.isArray(value.data) || !value.data.every(isProduct)
    || !isRecord(value.pagination) || !isInteger(value.pagination.page, 1)
    || !isInteger(value.pagination.limit, 1) || !isInteger(value.pagination.total)
    || !isInteger(value.pagination.totalPages)) {
    throw new Error(texts.errors.invalidResponse);
  }
  return { data: value.data, pagination: {
    page: value.pagination.page, limit: value.pagination.limit,
    total: value.pagination.total, totalPages: value.pagination.totalPages,
  } };
}

export function parseCategories(value: unknown): { data: string[] } {
  if (!isRecord(value) || !Array.isArray(value.data)
    || !value.data.every((category): category is string => typeof category === 'string')) {
    throw new Error(texts.errors.invalidResponse);
  }
  return { data: value.data };
}

export function parseCart(value: unknown): Cart {
  if (!isRecord(value) || !Array.isArray(value.items)
    || !isInteger(value.totalItems) || !isInteger(value.total)
    || !isInteger(value.points) || value.currency !== 'COP'
    || (value.pointsGranted !== undefined && !isInteger(value.pointsGranted))) {
    throw new Error(texts.errors.invalidResponse);
  }

  const items = value.items.map(item => {
    if (!isRecord(item) || !isProduct(item.product)
      || !isInteger(item.quantity, 1) || !isInteger(item.subtotal)) {
      throw new Error(texts.errors.invalidResponse);
    }
    return { product: item.product, quantity: item.quantity, subtotal: item.subtotal };
  });

  return {
    items, totalItems: value.totalItems, total: value.total,
    currency: value.currency, points: value.points,
    pointsGranted: value.pointsGranted,
  };
}
