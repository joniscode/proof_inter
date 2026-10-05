import texts from '../content/texts.json';
import { isRecord } from './contracts';
import { simulationSession } from './session';

export async function requestJson(path: string, options: RequestInit = {}): Promise<unknown> {
  const timeout = AbortSignal.timeout(8000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Simulation-Session', simulationSession);
  if (options.body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers, signal, cache: 'no-store' });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(texts.connection.error);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = isRecord(body) && isRecord(body.error) && typeof body.error.message === 'string'
      ? body.error.message : texts.connection.error;
    throw new Error(message);
  }
  if (body === null) throw new Error(texts.errors.invalidResponse);
  return body;
}
