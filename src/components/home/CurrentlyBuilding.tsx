import { Hospital, Shield, Terminal } from 'lucide-react';
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
    <section className="border-steel/80 mt-14 w-full max-w-3xl rounded-xl border bg-surface/40 px-4 py-8 text-left sm:mt-16 sm:px-6">
      <h2 className="text-foreground mb-1 font-mono text-xs tracking-widest uppercase">Currently building</h2>
      <p className="text-foreground-muted mb-6 text-sm">Active products and open-source work.</p>
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {projects.map((p) => {
          const Icon = ICONS[p.icon] ?? Terminal;
          return (
            <li key={p.id}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card border-steel group flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:border-accent/35 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="bg-accent/12 text-accent flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-accent/20">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground group-hover:text-accent mb-1 text-base font-semibold tracking-tight transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-foreground-muted mb-3 text-sm leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-steel/80 bg-background/60 px-2 py-0.5 font-mono text-[10px] text-foreground-muted sm:text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
