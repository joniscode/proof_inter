import { useState } from 'react';

export function ProductImage({ src, name }: { src: string; name: string }) {
  const [failedSource, setFailedSource] = useState('');

  if (failedSource === src) {
    return (
      <div className="product-image product-image--fallback" role="img" aria-label={name}>
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M24 35h52l5 49H19zM36 40V28a14 14 0 0 1 28 0v12" />
          <path d="m50 48 4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
        </svg>
      </div>
    );
  }

  return <img className="product-image" src={src} alt={name} width="600" height="400" loading="lazy" onError={() => setFailedSource(src)} />;
}
