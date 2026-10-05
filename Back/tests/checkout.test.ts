import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import type { DatabaseSync } from 'node:sqlite';
import { createApp } from '../src/app.js';
import { checkoutCart } from '../src/cart/cart.service.js';
import { openDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed-data.js';

async function withApi(action: (url: string, database: DatabaseSync) => Promise<void>) {
  const database = openDatabase(':memory:');
  seedDatabase(database);
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

const session = '4a4d16f8-7fe9-4aad-a883-dfc972b18300';
const otherSession = '4a4d16f8-7fe9-4aad-a883-dfc972b18301';

function request(url: string, path: string, body?: unknown, sessionId = session) {
  return fetch(`${url}/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Simulation-Session': sessionId },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test('comprar vacía el carrito y descuenta solo el inventario de esa sesión, sin cambiar puntos ni SQLite', async () => {
  await withApi(async (url, database) => {
    await request(url, '/cart/items', { productId: 1, quantity: 2 });
    await request(url, '/cart/items', { productId: 2, quantity: 1 });
    const response = await request(url, '/cart/checkout', {});
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      items: [], totalItems: 0, total: 0, currency: 'COP', points: 20, pointsGranted: 0,
    });
    let products = await (await request(url, '/products')).json();
    assert.equal(products.data[0].stock, 13);
    assert.equal(products.data[1].stock, 7);
    products = await (await request(url, '/products', undefined, otherSession)).json();
    assert.equal(products.data[0].stock, 15);
    assert.equal(database.prepare('SELECT stock FROM products WHERE id = 1').get()?.stock, 15);
    const cart = await (await request(url, '/cart/items', { productId: 1, quantity: 1 })).json();
    assert.equal(cart.points, 20);
    assert.equal(cart.pointsGranted, 0);
    assert.equal(cart.items[0].product.stock, 13);
  });
});

test('dos compras concurrentes no descuentan dos veces y no acepta un carrito vacío', async () => {
  await withApi(async url => {
    assert.equal((await request(url, '/cart/checkout', {})).status, 400);
    await request(url, '/cart/items', { productId: 1, quantity: 2 });
    const responses = await Promise.all([
      request(url, '/cart/checkout', {}), request(url, '/cart/checkout', {}),
    ]);
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 400]);
    const products = await (await request(url, '/products')).json();
    assert.equal(products.data[0].stock, 13);
  });
});

test('un producto sin stock al comprar conserva todo el carrito y no descuenta el resto', async () => {
  await withApi(async (url, database) => {
    await request(url, '/cart/items', { productId: 1, quantity: 2 });
    await request(url, '/cart/items', { productId: 2, quantity: 2 });
    database.prepare('UPDATE products SET stock = 1 WHERE id = 2').run();
    const response = await request(url, '/cart/checkout', {});
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error.code, 'INSUFFICIENT_STOCK');
    assert.equal((await (await request(url, '/cart')).json()).totalItems, 4);
    assert.equal((await (await request(url, '/products')).json()).data[0].stock, 15);
  });
});

test('tras agotar la sesión no se permiten nuevas unidades, pero otra sesión conserva su inventario', async () => {
  await withApi(async url => {
    await request(url, '/cart/items', { productId: 1, quantity: 15 });
    await request(url, '/cart/checkout', {});
    assert.equal((await request(url, '/cart/items', { productId: 1, quantity: 1 })).status, 409);
    assert.equal((await request(url, '/cart/items', { productId: 1, quantity: 1 }, otherSession)).status, 200);
  });
});

test('si no se puede vaciar el carrito, la simulación no cambia el inventario', () => {
  const database = openDatabase(':memory:');
  try {
    seedDatabase(database);
    database.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (1, 1, 2)').run();
    database.exec(`CREATE TRIGGER fail_checkout BEFORE DELETE ON cart_items
      BEGIN SELECT RAISE(ABORT, 'checkout test failure'); END;`);
    const inventory = new Map<number, number>();
    assert.throws(() => checkoutCart(database, inventory), /checkout test failure/);
    assert.equal(inventory.size, 0);
    assert.equal(database.prepare('SELECT quantity FROM cart_items').get()?.quantity, 2);
  } finally {
    database.close();
  }
});

test('rechaza precios, puntos, usuarios y sesiones inválidas enviados para la compra', async () => {
  await withApi(async url => {
    for (const body of [{ total: 1 }, { points: 1000 }, { userId: 2 }, { items: [] }]) {
      assert.equal((await request(url, '/cart/checkout', body)).status, 400);
    }
    assert.equal((await request(url, '/cart/checkout', {}, 'invalid')).status, 400);
  });
});
