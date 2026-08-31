import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Board',
  description: 'Field telemetry. Ranked postings from the scanner.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  keywords: [],
  openGraph: {
    title: 'The Board',
    description: 'Field telemetry. Ranked postings from the scanner.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Board',
    description: 'Field telemetry. Ranked postings from the scanner.',
  },
};

export default function TheBoardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
