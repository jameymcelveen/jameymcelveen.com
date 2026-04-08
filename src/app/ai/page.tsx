import type { Metadata } from 'next';
import { InterviewConsole } from '@/components/InterviewConsole';

export const metadata: Metadata = {
  title: 'AI Interview | Jamey McElveen',
  description:
    'Private preview—career Q&A grounded in public resume context. Not linked from site navigation.',
  robots: { index: false, follow: false },
};

/** Unlisted route: type `/ai` manually; no nav link. */
export default function AiPage() {
  return <InterviewConsole />;
}
