import { env } from '../config/env.js';
import { openDatabase } from './database.js';
import { seedDatabase } from './seed-data.js';

const database = openDatabase(env.databasePath);
try {
  seedDatabase(database);
  console.log('Datos de demostración cargados: 12 productos y usuario 1.');
} finally {
  database.close();
}
