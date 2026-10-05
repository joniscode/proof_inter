import { Button } from './Button';
import texts from '../../content/texts.json';

export function Notice({ message, error = false, onRetry }: { message: string; error?: boolean; onRetry?: () => void }) {
  return (
    <div className={`shop-notice ${error ? 'shop-notice--error' : ''}`} role={error ? 'alert' : 'status'}>
      <p className="mb-0">{message}</p>
      {onRetry && <Button className="punto-button--small mt-3" onClick={onRetry}>{texts.common.retry}</Button>}
    </div>
  );
}
