import type { ReactNode } from 'react';

export function SectionLabel({ children, number }: { children: ReactNode; number?: string }) {
  return <div className="section-label">{number && <span className="section-number">{number}</span>}{children}</div>;
}
