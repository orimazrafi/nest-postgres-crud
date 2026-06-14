import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Shared centered card layout for auth pages. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="page">
      <section className="card">
        <header className="card-header">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </header>
        {children}
        <footer className="card-footer">{footer}</footer>
      </section>
    </main>
  );
}

type FooterLinkProps = {
  text: string;
  linkText: string;
  to: string;
};

/** Footer prompt with a router link. */
export function AuthFooterLink({ text, linkText, to }: FooterLinkProps) {
  return (
    <p className="muted">
      {text} <Link to={to}>{linkText}</Link>
    </p>
  );
}
