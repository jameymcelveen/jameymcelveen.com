import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Board sources',
  description: 'Job boards the scanner hits, and how many postings each returned.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  keywords: [],
  openGraph: {
    title: 'Board sources',
    description: 'Job boards the scanner hits, and how many postings each returned.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Board sources',
    description: 'Job boards the scanner hits, and how many postings each returned.',
  },
};

export default function BoardSourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
