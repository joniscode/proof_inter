import { useEffect, useState } from 'react';
import { getHealth } from '../api/health';

type ConnectionState = 'loading' | 'connected' | 'error';

export function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then(() => { if (!controller.signal.aborted) setState('connected'); })
      .catch(() => { if (!controller.signal.aborted) setState('error'); });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState('loading');
    setAttempt(current => current + 1);
  }

  const messages: Record<ConnectionState, string> = {
    loading: 'Comprobando disponibilidad…',
    connected: 'La tienda está disponible.',
    error: 'No pudimos conectar con la tienda. Intenta de nuevo.',
  };

  return (
    <section className="connection-card" aria-labelledby="connection-title" aria-busy={state === 'loading'}>
      <div className="connection-heading">
        <span className={`status-dot status-dot--${state}`} aria-hidden="true" />
        <h2 id="connection-title">Conexión con la tienda</h2>
      </div>
      <p role="status" aria-live="polite">{messages[state]}</p>
      <button type="button" onClick={retry} disabled={state === 'loading'}>
        {state === 'loading' ? 'Comprobando…' : 'Volver a comprobar'}
      </button>
    </section>
  );
}
