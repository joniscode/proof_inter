import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import type { DatabaseSync } from 'node:sqlite';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed-data.js';

async function withApi(action: (url: string, database: DatabaseSync) => Promise<void>, seed = true) {
  const database = openDatabase(':memory:');
  if (seed) seedDatabase(database);
  const server = createApp(database).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  try {
    await action(`http://127.0.0.1:${address.port}`, database);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    database.close();
  }
}

function mutate(url: string, method: string, body?: unknown, path = '/api/cart/items') {
  return fetch(`${url}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test('agregar, acumular, actualizar y quitar mantienen el total calculado en servidor', async () => {
  await withApi(async url => {
    assert.deepEqual(await (await fetch(`${url}/api/cart`)).json(), { items: [], totalItems: 0, total: 0, currency: 'COP' });
    let response = await mutate(url, 'POST', { productId: 1, quantity: 2 });
    assert.equal(response.status, 200);
    let cart = await response.json();
    assert.equal(cart.total, 259800);
    cart = await (await mutate(url, 'POST', { productId: 1, quantity: 1 })).json();
    assert.equal(cart.items.length, 1);
    assert.equal(cart.items[0].quantity, 3);
    assert.equal(cart.totalItems, 3);
    for (let repeat = 0; repeat < 2; repeat++) {
      cart = await (await mutate(url, 'PUT', { quantity: 1 }, '/api/cart/items/1')).json();
      assert.equal(cart.total, 129900);
    }
    cart = await (await mutate(url, 'POST', { productId: 2, quantity: 2 })).json();
    assert.equal(cart.total, 509700);
    cart = await (await mutate(url, 'DELETE', undefined, '/api/cart/items/1')).json();
    assert.equal(cart.total, 379800);
    assert.equal(cart.totalItems, 2);
    assert.equal((await mutate(url, 'DELETE', undefined, '/api/cart/items/1')).status, 200);
  });
});

test('stock insuficiente y producto inexistente no modifican el carrito', async () => {
  await withApi(async url => {
    await mutate(url, 'POST', { productId: 1, quantity: 15 });
    for (const product of [{ productId: 1, quantity: 1 }, { productId: 4, quantity: 1 }]) {
      const response = await mutate(url, 'POST', product);
      assert.equal(response.status, 409);
      assert.equal((await response.json()).error.code, 'INSUFFICIENT_STOCK');
    }
    const missing = await mutate(url, 'POST', { productId: 999, quantity: 1 });
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, 'PRODUCT_NOT_FOUND');
    const cart = await (await fetch(`${url}/api/cart`)).json();
    assert.equal(cart.totalItems, 15);
    assert.equal(cart.items.length, 1);
  });
});

test('rechaza cantidades inválidas y campos de precio, usuario o puntos enviados por el cliente', async () => {
  await withApi(async url => {
    for (const body of [
      null, [], {}, { productId: 1, quantity: 0 }, { productId: 1, quantity: -1 },
      { productId: 1, quantity: 1.5 }, { productId: 1, quantity: '1' },
      { productId: 1, quantity: 1000 }, { productId: 1, quantity: 1, price: 1 },
      { productId: 1, quantity: 1, points: 999 }, { productId: 1, quantity: 1, userId: 2 },
    ]) {
      const response = await mutate(url, 'POST', body);
      assert.equal(response.status, 400, JSON.stringify(body));
      assert.equal((await response.json()).error.code, body === null ? 'INVALID_JSON' : 'INVALID_INPUT');
    }
    assert.equal((await mutate(url, 'DELETE', undefined, '/api/cart/items/invalid')).status, 400);
    assert.equal((await (await fetch(`${url}/api/cart`)).json()).totalItems, 0);
  });
});

test('un incremento concurrente nunca permite superar el stock', async () => {
  await withApi(async url => {
    const results = await Promise.all([
      mutate(url, 'POST', { productId: 1, quantity: 10 }),
      mutate(url, 'POST', { productId: 1, quantity: 10 }),
    ]);
    assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
    assert.equal((await (await fetch(`${url}/api/cart`)).json()).totalItems, 10);
  });
});

test('sin datos iniciales devuelve un error de usuario y el carrito solo usa el usuario de demostración', async () => {
  await withApi(async url => {
    const response = await fetch(`${url}/api/cart`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error.code, 'USER_NOT_FOUND');
  }, false);
  await withApi(async (url, database) => {
    database.prepare('INSERT INTO users (id, name) VALUES (2, ?)').run('Segundo usuario');
    database.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (2, 1, 4)').run();
    assert.equal((await (await fetch(`${url}/api/cart`)).json()).totalItems, 0);
  });
});
