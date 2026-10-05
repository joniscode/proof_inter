import texts from '../content/texts.json';
import { requestJson } from './client';

export interface HealthResponse {
  status: 'ok';
  service: string;
}

export async function getHealth(signal: AbortSignal): Promise<HealthResponse> {
  const body = await requestJson('/health', { signal });
  if (!body || typeof body !== 'object' || !('status' in body) || body.status !== 'ok'
    || !('service' in body) || typeof body.service !== 'string') {
    throw new Error(texts.errors.invalidResponse);
  }
  return { status: 'ok', service: body.service };
}
