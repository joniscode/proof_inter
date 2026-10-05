import { requestJson } from './client';
import { parseCart, parseCategories, parseProductPage } from './contracts';

export function getProducts(page: number, category: string, search: string, signal: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), limit: '6' });
  if (category) query.set('category', category);
  if (search.trim()) query.set('search', search.trim());
  return requestJson(`/api/products?${query}`, { signal }).then(parseProductPage);
}

export function getCart(signal: AbortSignal) {
  return requestJson('/api/cart', { signal }).then(parseCart);
}

export function setCartItem(productId: number, quantity: number) {
  return requestJson(`/api/cart/items/${productId}`, {
    method: 'PUT', body: JSON.stringify({ quantity }),
  }).then(parseCart);
}

export function removeCartItem(productId: number) {
  return requestJson(`/api/cart/items/${productId}`, { method: 'DELETE' }).then(parseCart);
}

export function getCategories(signal: AbortSignal) {
  return requestJson('/api/categories', { signal }).then(parseCategories);
}

export function checkoutCart() {
  return requestJson('/api/cart/checkout', {
    method: 'POST', body: JSON.stringify({}),
  }).then(parseCart);
}
