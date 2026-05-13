import type { Metadata } from 'next';
import { InterviewConsole } from '@/components/InterviewConsole';
import { InsightsBellLink } from '@/components/InsightsBellLink';

export const metadata: Metadata = {
  title: 'Ask Jamey — Jamey McElveen’s AI Interview Twin',
  description:
    'An AI trained on Jamey’s professional background. Ask about experience, projects, or technical approach.',
  robots: { index: false, follow: false },
};

/** Unlisted route: type `/ai` manually. Primary entry is the Ask Jamey bubble on every page. */
export default function AiPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)]">
      <div className="border-b border-[#522d80]/35 bg-gradient-to-r from-[#522d80]/25 via-transparent to-[#f56600]/15 px-4 py-5 sm:px-6">
        <div className="relative mx-auto max-w-[720px] pr-12 sm:pr-14">
          <div className="absolute top-0 right-0 sm:top-0.5">
            <InsightsBellLink />
          </div>
          <p className="text-accent mb-1 font-mono text-[10px] tracking-[0.2em] uppercase">Clemson · Architect</p>
          <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">Ask Jamey</h1>
          <p className="text-foreground-muted mt-2 max-w-2xl text-sm leading-relaxed sm:text-[15px]">
            This is an AI trained on Jamey&apos;s professional background. Ask anything about his experience, projects,
            or technical approach.
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <InterviewConsole fillContainer />
      </div>
    </div>
  );
}
