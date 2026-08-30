import type { Metadata } from 'next';
import './fit-filter.css';

export const metadata: Metadata = {
  title: 'The Fit Filter',
  description: 'Field inspection. Paste a posting.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  keywords: [],
  openGraph: {
    title: 'The Fit Filter',
    description: 'Field inspection. Paste a posting.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Fit Filter',
    description: 'Field inspection. Paste a posting.',
  },
};

export default function FitFilterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
