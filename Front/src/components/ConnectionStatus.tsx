import { useEffect, useState } from 'react';
import { getHealth } from '../api/health';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import texts from '../content/texts.json';

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

  return (
    <section className={`connection-strip connection-strip--${state}`} aria-label={texts.connection.label} aria-busy={state === 'loading'}>
      <div className="container-fluid page-container d-flex align-items-center justify-content-between gap-3">
        <div className="connection-message d-flex align-items-center gap-2">
          <span className={`status-dot status-dot--${state}`} aria-hidden="true" />
          <p className="mb-0" role="status" aria-live="polite">{texts.connection[state]}</p>
        </div>
        <Button className="connection-retry" onClick={retry} disabled={state === 'loading'} aria-label={texts.connection.retryLabel}>
          <span className="d-none d-sm-inline">{state === 'loading' ? texts.connection.checking : texts.connection.retry}</span><Icon name="refresh" />
        </Button>
      </div>
    </section>
  );
}
