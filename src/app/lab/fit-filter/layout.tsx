import type { Metadata } from 'next';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import './fit-filter.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '800'],
  display: 'swap',
  variable: '--font-fit-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-fit-body',
});

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
  return (
    <div className={`fit-filter-root ${bricolage.variable} ${publicSans.variable}`}>{children}</div>
  );
}
