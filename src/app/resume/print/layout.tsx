import type { Metadata } from 'next';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import './print.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-resume-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-resume-body',
});

export const metadata: Metadata = {
  title: 'Jamey McElveen - Resume',
  description: 'Printable resume for Jamey McElveen, Principal Architect & Engineering Leader.',
  robots: { index: false, follow: false, nocache: true },
};

export default function ResumePrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`resume-print-root ${bricolage.variable} ${publicSans.variable}`}>
      {children}
    </div>
  );
}
