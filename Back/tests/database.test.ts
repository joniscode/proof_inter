import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { openDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed-data.js';

test('los datos persisten al cerrar y volver a abrir SQLite', () => {
  const directory = mkdtempSync(join(tmpdir(), 'proof-inter-db-'));
  try {
    const path = join(directory, 'store.sqlite');
    let database = openDatabase(path);
    seedDatabase(database);
    database.prepare('UPDATE users SET points = 20 WHERE id = 1').run();
    database.close();
    database = openDatabase(path);
    try {
      assert.equal(database.prepare('SELECT points FROM users WHERE id = 1').get()?.points, 20);
      assert.equal(database.prepare('SELECT COUNT(*) AS count FROM products').get()?.count, 12);
    } finally {
      database.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('repetir el seed no duplica registros ni reemplaza stock o puntos', () => {
  const database = openDatabase(':memory:');
  try {
    seedDatabase(database);
    database.prepare('UPDATE products SET stock = 2 WHERE id = 1').run();
    database.prepare('UPDATE users SET points = 30 WHERE id = 1').run();
    seedDatabase(database);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM products').get()?.count, 12);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM users').get()?.count, 1);
    assert.equal(database.prepare('SELECT stock FROM products WHERE id = 1').get()?.stock, 2);
    assert.equal(database.prepare('SELECT points FROM users WHERE id = 1').get()?.points, 30);
  } finally {
    database.close();
  }
});

test('el esquema rechaza valores negativos en stock, precio y puntos', () => {
  const database = openDatabase(':memory:');
  try {
    seedDatabase(database);
    assert.throws(() => database.prepare('UPDATE products SET stock = -1 WHERE id = 1').run());
    assert.throws(() => database.prepare('UPDATE products SET price = -1 WHERE id = 1').run());
    assert.throws(() => database.prepare('UPDATE users SET points = -1 WHERE id = 1').run());
  } finally {
    database.close();
  }
});
