import type { DatabaseSync } from 'node:sqlite';

const products = [
  { id: 1, name: 'Audífonos inalámbricos', price: 129900, category: 'tecnologia', stock: 15 },
  { id: 2, name: 'Teclado mecánico', price: 189900, category: 'tecnologia', stock: 8 },
  { id: 3, name: 'Mouse inalámbrico', price: 59900, category: 'tecnologia', stock: 20 },
  { id: 4, name: 'Parlante portátil', price: 159900, category: 'tecnologia', stock: 0 },
  { id: 5, name: 'Lámpara de escritorio', price: 79900, category: 'hogar', stock: 12 },
  { id: 6, name: 'Botella térmica', price: 45900, category: 'hogar', stock: 25 },
  { id: 7, name: 'Organizador de escritorio', price: 34900, category: 'hogar', stock: 10 },
  { id: 8, name: 'Cojín decorativo', price: 39900, category: 'hogar', stock: 18 },
  { id: 9, name: 'Mochila deportiva', price: 99900, category: 'deportes', stock: 9 },
  { id: 10, name: 'Banda de resistencia', price: 29900, category: 'deportes', stock: 30 },
  { id: 11, name: 'Tapete de yoga', price: 69900, category: 'deportes', stock: 14 },
  { id: 12, name: 'Cuerda para saltar', price: 24900, category: 'deportes', stock: 22 },
];

export function seedDatabase(database: DatabaseSync): void {
  database.exec('BEGIN IMMEDIATE');
  try {
    const insertProduct = database.prepare(
      'INSERT OR IGNORE INTO products (id, name, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)',
    );
    for (const product of products) {
      insertProduct.run(product.id, product.name, product.price, product.category,
        `https://placehold.co/600x400?text=${encodeURIComponent(product.name)}`, product.stock);
    }
    database.prepare('INSERT OR IGNORE INTO users (id, name, points) VALUES (?, ?, ?)')
      .run(1, 'Usuario de demostración', 0);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
