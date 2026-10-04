export interface HealthResponse {
  status: 'ok';
  service: string;
}

export async function getHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch('/health', {
    signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('La tienda no está disponible.');
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || !('status' in body) || body.status !== 'ok'
    || !('service' in body) || typeof body.service !== 'string') {
    throw new Error('La respuesta de la tienda no es válida.');
  }
  return { status: 'ok', service: body.service };
}
