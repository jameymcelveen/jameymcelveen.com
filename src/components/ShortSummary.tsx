import { Ambulance, CreditCard, Sparkles, Users, type LucideIcon } from 'lucide-react';
import type { ShortSummaryIcon } from '@/data/resume';

const ICONS: Record<ShortSummaryIcon, LucideIcon> = {
  users: Users,
  card: CreditCard,
  ambulance: Ambulance,
  sparkles: Sparkles,
};

export type ShortSummaryData = {
  headline: string;
  highlights: { icon: ShortSummaryIcon; text: string }[];
};

/**
 * The short resume summary: one headline and a few icon lines.
 * Used on /resume and on the printed resume; each passes its own class names.
 */
export function ShortSummary({
  summary,
  classes,
}: {
  summary: ShortSummaryData;
  classes: { headline: string; list: string; item: string; icon: string };
}) {
  return (
    <>
      <p className={classes.headline}>{summary.headline}</p>
      <ul className={classes.list}>
        {summary.highlights.map(({ icon, text }) => {
          const Icon = ICONS[icon];
          return (
            <li key={text} className={classes.item}>
              <Icon className={classes.icon} aria-hidden />
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
