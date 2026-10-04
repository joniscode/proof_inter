import type { DatabaseSync } from 'node:sqlite';
import { HttpError } from '../lib/http-error.js';
import { findUser } from './user.repository.js';

const DEMO_USER_ID = 1;

export function getCurrentUser(database: DatabaseSync) {
  const user = findUser(database, DEMO_USER_ID);
  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'No existe el usuario de demostración. Ejecuta db:seed.');
  }
  return user;
}
