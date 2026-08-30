import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Search',
  description: 'Field posting. What I build, what I am hunting, and how I decide.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  keywords: [],
  openGraph: {
    title: 'The Search',
    description: 'Field posting. What I build, what I am hunting, and how I decide.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Search',
    description: 'Field posting. What I build, what I am hunting, and how I decide.',
  },
};

export default function TheSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
