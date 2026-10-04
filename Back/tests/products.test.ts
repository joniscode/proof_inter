import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
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

test('la paginación devuelve páginas distintas y metadatos correctos', async () => {
  const first = await (await fetch(`${url}/api/products?limit=3`)).json();
  const second = await (await fetch(`${url}/api/products?limit=3&page=2`)).json();
  assert.deepEqual(first.data.map((product: { id: number }) => product.id), [1, 2, 3]);
  assert.deepEqual(second.data.map((product: { id: number }) => product.id), [4, 5, 6]);
  assert.deepEqual(first.pagination, { page: 1, limit: 3, total: 12, totalPages: 4 });
});

test('combina categoría y búsqueda sin distinguir mayúsculas o tildes', async () => {
  const result = await (await fetch(`${url}/api/products?category=tecnologia&search=AUDIFONOS`)).json();
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].id, 1);
  assert.equal(result.pagination.total, 1);
  const categories = await (await fetch(`${url}/api/categories`)).json();
  assert.deepEqual(categories.data, ['deportes', 'hogar', 'tecnologia']);
});

test('las búsquedas sin coincidencias y páginas fuera del resultado devuelven listas vacías', async () => {
  for (const query of ['search=sincoincidencias', 'page=999', "search=%27%20OR%201%3D1--", 'search=%25']) {
    const response = await fetch(`${url}/api/products?${query}`);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, []);
  }
});

test('rechaza parámetros inválidos o repetidos con el mismo formato de error', async () => {
  for (const query of ['page=0', 'page=1.5', 'limit=101', 'limit=-1', 'page=1&page=2', 'search=a&search=b', 'unknown=1']) {
    const response = await fetch(`${url}/api/products?${query}`);
    assert.equal(response.status, 400, query);
    const body = await response.json();
    assert.equal(body.error.code, 'INVALID_INPUT');
    assert.equal(typeof body.error.message, 'string');
  }
});
