import type { DatabaseSync } from 'node:sqlite';

const migrations = [
  `
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(trim(name)) > 0),
      price INTEGER NOT NULL CHECK (price >= 0),
      category TEXT NOT NULL CHECK (length(trim(category)) > 0),
      image TEXT NOT NULL,
      stock INTEGER NOT NULL CHECK (stock >= 0)
    ) STRICT;
    CREATE INDEX products_category_idx ON products(category);
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0)
    ) STRICT;
  `,
  `
    CREATE TABLE cart_items (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 999),
      PRIMARY KEY (user_id, product_id)
    ) STRICT;
  `,
];

export function migrate(database: DatabaseSync): void {
  const row = database.prepare('PRAGMA user_version').get();
  const currentVersion = Number(row?.user_version ?? 0);
  if (currentVersion > migrations.length) {
    throw new Error('La base de datos tiene una versión más reciente que esta API.');
  }
  database.exec('BEGIN IMMEDIATE');
  try {
    for (let index = currentVersion; index < migrations.length; index++) {
      database.exec(migrations[index]!);
      database.exec(`PRAGMA user_version = ${index + 1}`);
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
