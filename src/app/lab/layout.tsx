import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import { LabNav } from './LabNav';
import './lab.css';

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

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`fit-filter-root ${bricolage.variable} ${publicSans.variable}`}>
      <LabNav />
      {children}
    </div>
  );
}
