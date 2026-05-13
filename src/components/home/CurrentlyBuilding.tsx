import { ArrowUpRight, Hospital, Shield, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  cross: Hospital,
  terminal: Terminal,
  shield: Shield,
};

export type HomeProjectCard = {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  stack: string[];
  href: string;
  icon: string;
};

export function CurrentlyBuilding({ projects }: { projects: HomeProjectCard[] }) {
  if (!projects?.length) return null;

  return (
    <section className="mt-16 w-full max-w-3xl text-left sm:mt-20">
      <h2 className="mb-2 font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)] uppercase">
        Currently building
      </h2>
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-secondary)] sm:mb-10 sm:text-base">
        Active products and open-source work.
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {projects.map((p) => {
          const Icon = ICONS[p.icon] ?? Terminal;
          return (
            <li key={p.id}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card-v3 group relative flex h-full flex-col p-6"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="text-accent flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-chip)] border border-[var(--glass-border)] bg-[var(--surface-2)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground group-hover:text-accent mb-1 text-base font-semibold tracking-tight transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-foreground-muted text-sm leading-[1.65]">{p.description}</p>
                  </div>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="tech-stack-pill-v3">
                      {s}
                    </span>
                  ))}
                </div>
                <span className="text-accent mt-auto flex items-center justify-end gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  View
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
