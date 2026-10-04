import type { DatabaseSync } from 'node:sqlite';
import type { User } from '../types/entities.js';

export function findUser(database: DatabaseSync, id: number): User | undefined {
  return database.prepare('SELECT id, name, points FROM users WHERE id = ?').get(id) as unknown as User | undefined;
}
