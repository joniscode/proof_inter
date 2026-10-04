import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const envModule = pathToFileURL(resolve('src/config/env.ts')).href;
const loader = import.meta.resolve('tsx');

function readConfiguration(overrides: Record<string, string> = {}, envFile?: string) {
  const directory = mkdtempSync(join(tmpdir(), 'proof-inter-env-'));
  const environment = { ...process.env };
  delete environment.PORT;
  delete environment.NODE_ENV;
  delete environment.DATABASE_PATH;
  try {
    if (envFile !== undefined) writeFileSync(join(directory, '.env'), envFile);
    return spawnSync(process.execPath, [
      '--import', loader, '--input-type=module', '-e',
      `import { env } from ${JSON.stringify(envModule)}; console.log(JSON.stringify(env));`,
    ], { cwd: directory, env: { ...environment, ...overrides }, encoding: 'utf8', timeout: 10000 });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('sin archivo de entorno utiliza los valores predeterminados', () => {
  const result = readConfiguration();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { port: 3000, nodeEnv: 'development', databasePath: 'data/store.sqlite' });
});

test('carga .env y da prioridad a las variables del proceso', () => {
  const file = 'PORT=3100\nNODE_ENV=production\nDATABASE_PATH=data/demo.sqlite\n';
  const fileResult = readConfiguration({}, file);
  assert.equal(fileResult.status, 0, fileResult.stderr);
  assert.deepEqual(JSON.parse(fileResult.stdout), { port: 3100, nodeEnv: 'production', databasePath: 'data/demo.sqlite' });
  const override = readConfiguration({ PORT: '3200', NODE_ENV: 'test' }, file);
  assert.equal(override.status, 0, override.stderr);
  assert.deepEqual(JSON.parse(override.stdout), { port: 3200, nodeEnv: 'test', databasePath: 'data/demo.sqlite' });
});

test('rechaza una configuración inválida antes de iniciar el servidor', () => {
  for (const configuration of [
    { PORT: '0' }, { PORT: '65536' }, { PORT: 'abc' }, { PORT: '1.5' },
    { NODE_ENV: 'unknown' }, { DATABASE_PATH: '   ' },
  ]) {
    const result = readConfiguration(configuration);
    assert.notEqual(result.status, 0, JSON.stringify(configuration));
    assert.match(result.stderr, /PORT debe|NODE_ENV debe|DATABASE_PATH no/);
  }
});
