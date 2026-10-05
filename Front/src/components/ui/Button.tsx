import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

export function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`btn punto-button ${className}`} {...props}>{children}</button>;
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="btn punto-button punto-button--primary" href={href}>{children}<Icon name="arrow" /></a>;
}
