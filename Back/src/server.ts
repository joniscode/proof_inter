import { createApp } from './app.js';
import { env } from './config/env.js';
import { openDatabase } from './db/database.js';

const database = openDatabase(env.databasePath);
const app = createApp(database);

const server = app.listen(env.port, () => {
  console.log(`API disponible en http://localhost:${env.port} (${env.nodeEnv})`);
});

server.on('error', (error) => {
  database.close();
  console.error('No se pudo iniciar la API:', error.message);
  process.exitCode = 1;
});

function shutdown(signal: string) {
  console.log(`${signal}: cerrando servidor.`);
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close((error) => {
    clearTimeout(timeout);
    database.close();
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
