import type { Metadata } from 'next';
import { getSiteMetadata } from '@/data';

export const metadata: Metadata = {
  title: `Components · ${getSiteMetadata().title}`,
  description: 'UI building blocks and patterns used on this site.',
};

export default function ComponentsPage() {
  return (
    <div className="page-studio">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-foreground text-[1.75rem] font-semibold tracking-tight">Components</h1>
        <p className="text-[var(--text-secondary)] mt-1 max-w-2xl text-sm leading-relaxed">
          A living gallery of controls and surfaces from the site. More pieces will land here over time.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card rounded-[var(--radius-card)] p-5 sm:p-6">
          <p className="text-[var(--text-muted)] font-mono text-[0.68rem] tracking-[0.12em] uppercase">Glass card</p>
          <p className="text-foreground mt-3 text-sm leading-relaxed">
            Frosted panel with a light brushed spec — same treatment as the dashboard and resume.
          </p>
        </div>
        <div className="glass-card rounded-[var(--radius-card)] p-5 sm:p-6">
          <p className="text-[var(--text-muted)] font-mono text-[0.68rem] tracking-[0.12em] uppercase">Controls</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-glass btn-glass--sm">
              Glass button
            </button>
            <button type="button" className="btn-glass btn-glass--sm btn-glass--accent">
              Accent glass
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
