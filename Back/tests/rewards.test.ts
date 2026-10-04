import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { DatabaseSync } from 'node:sqlite';
import { createApp } from '../src/app.js';
import { changeCartItem, deleteCartItem } from '../src/cart/cart.service.js';
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

function add(url: string, productId: number, quantity = 1, method = 'POST') {
  return fetch(`${url}/api/cart/items${method === 'PUT' ? `/${productId}` : ''}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(method === 'PUT' ? { quantity } : { productId, quantity }),
  });
}

test('otorga 10 puntos una sola vez por producto, aunque se elimine y vuelva a agregar', async () => {
  await withApi(async url => {
    let cart = await (await add(url, 1, 2)).json();
    assert.equal(cart.points, 10);
    assert.equal(cart.pointsGranted, 10);
    cart = await (await add(url, 1)).json();
    assert.equal(cart.points, 10);
    assert.equal(cart.pointsGranted, 0);
    cart = await (await add(url, 1, 1, 'PUT')).json();
    assert.equal(cart.pointsGranted, 0);
    await fetch(`${url}/api/cart/items/1`, { method: 'DELETE' });
    cart = await (await add(url, 1, 1, 'PUT')).json();
    assert.equal(cart.points, 10);
    assert.equal(cart.pointsGranted, 0);
    cart = await (await add(url, 2)).json();
    assert.equal(cart.points, 20);
    assert.equal(cart.pointsGranted, 10);
    const user = await (await fetch(`${url}/api/user`)).json();
    assert.equal(user.id, 1);
    assert.equal(user.points, 20);
    assert.equal((await (await fetch(`${url}/api/cart`)).json()).points, 20);
  });
});

test('solicitudes inválidas o sin stock no generan recompensas', async () => {
  await withApi(async (url, database) => {
    for (const [id, quantity] of [[4, 1], [999, 1], [1, 16], [1, -1]] as const) {
      assert.ok((await add(url, id, quantity)).status >= 400);
    }
    assert.equal((await (await fetch(`${url}/api/user`)).json()).points, 0);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM reward_events').get()?.count, 0);
  });
});

test('dos solicitudes concurrentes al mismo producto otorgan solo una recompensa', async () => {
  await withApi(async (url, database) => {
    const responses = await Promise.all([add(url, 1), add(url, 1)]);
    const carts = await Promise.all(responses.map(response => response.json()));
    assert.equal(carts.reduce((sum, cart) => sum + cart.pointsGranted, 0), 10);
    assert.equal((await (await fetch(`${url}/api/user`)).json()).points, 10);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM reward_events').get()?.count, 1);
  });
});

test('si falla el registro de la recompensa, se revierte también el cambio de carrito', async () => {
  await withApi(async (url, database) => {
    database.exec(`
      CREATE TRIGGER fail_reward BEFORE INSERT ON reward_events
      BEGIN SELECT RAISE(ABORT, 'reward test failure'); END;
    `);
    assert.throws(() => changeCartItem(database, 1, 1, 'add'), /reward test failure/);
    assert.equal((await (await fetch(`${url}/api/cart`)).json()).totalItems, 0);
    assert.equal((await (await fetch(`${url}/api/user`)).json()).points, 0);
  });
});

test('el cliente no puede asignar puntos ni modificar el saldo del usuario', async () => {
  await withApi(async url => {
    const forged = await fetch(`${url}/api/cart/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1, quantity: 1, points: 10000 }),
    });
    assert.equal(forged.status, 400);
    assert.equal((await fetch(`${url}/api/user`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ points: 10000 }),
    })).status, 404);
    assert.equal((await (await fetch(`${url}/api/user`)).json()).points, 0);
  });
});

test('el historial de recompensas persiste y evita repetir puntos después de reiniciar', () => {
  const directory = mkdtempSync(join(tmpdir(), 'proof-inter-rewards-'));
  const path = join(directory, 'store.sqlite');
  try {
    let database = openDatabase(path);
    try {
      seedDatabase(database);
      assert.equal(changeCartItem(database, 1, 1, 'add').points, 10);
      deleteCartItem(database, 1);
    } finally {
      database.close();
    }
    database = openDatabase(path);
    try {
      const cart = changeCartItem(database, 1, 1, 'add');
      assert.equal(cart.points, 10);
      assert.equal(cart.pointsGranted, 0);
    } finally {
      database.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('si falla la actualización del saldo se revierten el evento y el carrito', async () => {
  await withApi(async (url, database) => {
    database.exec(`
      CREATE TRIGGER fail_points BEFORE UPDATE OF points ON users
      BEGIN SELECT RAISE(ABORT, 'points test failure'); END;
    `);
    assert.throws(() => changeCartItem(database, 1, 1, 'add'), /points test failure/);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM reward_events').get()?.count, 0);
    assert.equal((await (await fetch(`${url}/api/cart`)).json()).totalItems, 0);
    assert.equal((await (await fetch(`${url}/api/user`)).json()).points, 0);
  });
});
