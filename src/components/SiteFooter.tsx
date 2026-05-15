'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Linkedin } from 'lucide-react';
import { getSiteFooter } from '@/data';
import pkg from '../../package.json';

const internalNav = [
  { href: '/', label: 'Home' },
  { href: '/resume', label: 'Resume' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/components', label: 'Components' },
] as const;

export function SiteFooter({ wide = false }: { wide?: boolean }) {
  const pathname = usePathname();
  const footer = getSiteFooter();
  const year = new Date().getFullYear();
  const alumniLine =
    'alumniLine' in footer && typeof footer.alumniLine === 'string' ? footer.alumniLine : null;
  const githubUrl =
    'githubUrl' in footer && typeof footer.githubUrl === 'string'
      ? footer.githubUrl
      : 'https://github.com/jameymcelveen';

  const maxW = wide ? 'max-w-[1100px]' : 'max-w-4xl';

  return (
    <footer className="glass-footer no-print border-t border-[var(--glass-border)]">
      <div
        className={`text-foreground-muted mx-auto flex ${maxW} flex-col items-center justify-center gap-4 px-4 py-8 text-center text-xs sm:px-6 sm:text-[13px]`}
      >
        <nav
          aria-label="Footer"
          className="flex w-full max-w-3xl flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-0 sm:gap-y-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
            {internalNav.map((item, i) => {
              const active = pathname === item.href;
              return (
                <span key={item.href} className="inline-flex items-center gap-x-1">
                  {i > 0 ? (
                    <span className="text-[var(--text-muted)] select-none opacity-50" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={item.href}
                    className={`font-medium transition-colors hover:text-[var(--foreground)] ${
                      active ? 'text-[var(--accent-blue)]' : ''
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </span>
              );
            })}
          </div>
          <div className="text-[var(--text-muted)] hidden select-none sm:block" aria-hidden>
            |
          </div>
          <div className="flex items-center justify-center gap-6">
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-accent inline-flex items-center gap-1.5 font-medium transition-colors"
            >
              <Github className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              GitHub
            </Link>
            <Link
              href={footer.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-accent inline-flex items-center gap-1.5 font-medium transition-colors"
            >
              <Linkedin className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              LinkedIn
            </Link>
          </div>
        </nav>

        <p className="max-w-xl leading-relaxed">
          {footer.tagline} · v{pkg.version}
        </p>
        {alumniLine ? (
          <p className="text-[var(--text-muted)] max-w-xl text-[11px] tracking-wide">{alumniLine}</p>
        ) : null}
        <p className="text-foreground-muted/80 font-mono text-[11px] tracking-wide">
          © {year} {footer.copyrightName}
        </p>
      </div>
    </footer>
  );
}
