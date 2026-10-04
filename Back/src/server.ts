import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(`API disponible en http://localhost:${env.port} (${env.nodeEnv})`);
});

server.on('error', (error) => {
  console.error('No se pudo iniciar la API:', error.message);
  process.exitCode = 1;
});

function shutdown(signal: string) {
  console.log(`${signal}: cerrando servidor.`);
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close((error) => {
    clearTimeout(timeout);
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
