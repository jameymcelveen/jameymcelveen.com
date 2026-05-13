'use client';

import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';
import { getSiteFooter } from '@/data';

export function SiteFooter() {
  const footer = getSiteFooter();
  const year = new Date().getFullYear();

  return (
    <footer
      className="glass-footer no-print border-t border-[var(--glass-border)]"
      style={{ willChange: 'transform' }}
    >
      <div className="text-foreground-muted mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-xs sm:flex-row sm:px-6 sm:text-left sm:text-[13px]">
        <p className="max-w-md leading-relaxed">{footer.tagline}</p>
        <div className="flex items-center gap-5">
          <Link
            href={footer.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-muted hover:text-accent transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <Link
            href={footer.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-muted hover:text-accent transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </div>
        <p className="text-foreground-muted/80 font-mono text-[11px] tracking-wide">
          © {year} {footer.copyrightName}
        </p>
      </div>
    </footer>
  );
}
