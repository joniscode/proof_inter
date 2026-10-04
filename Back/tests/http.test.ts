import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, mock, test } from 'node:test';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed-data.js';

const database = openDatabase(':memory:');
seedDatabase(database);
const server = createApp(database).listen(0, '127.0.0.1');
let url: string;

before(async () => {
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  url = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  database.close();
});

test('health responde 200 y las rutas inexistentes devuelven un error 404 uniforme', async () => {
  const health = await fetch(`${url}/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('x-powered-by'), null);
  assert.deepEqual(await health.json(), { status: 'ok', service: 'proof-inter-back' });
  const missing = await fetch(`${url}/missing`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'NOT_FOUND');
});

test('el JSON inválido y un cuerpo demasiado grande devuelven errores 400 y 413', async () => {
  for (const [body, expectedStatus, code] of [
    ['{broken', 400, 'INVALID_JSON'],
    [JSON.stringify({ text: 'x'.repeat(110000) }), 413, 'PAYLOAD_TOO_LARGE'],
  ] as const) {
    const response = await fetch(`${url}/api/cart/items`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    assert.equal(response.status, expectedStatus);
    assert.equal((await response.json()).error.code, code);
  }
});

test('un fallo interno devuelve 500 sin exponer detalles de SQLite al cliente', async () => {
  const log = mock.method(console, 'error', () => {});
  database.exec('ALTER TABLE products RENAME TO products_unavailable');
  try {
    const response = await fetch(`${url}/api/products`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error interno.' },
    });
    assert.equal(log.mock.callCount(), 1);
  } finally {
    database.exec('ALTER TABLE products_unavailable RENAME TO products');
    log.mock.restore();
  }
});
