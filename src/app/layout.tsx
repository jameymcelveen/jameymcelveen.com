import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { GradientMesh } from '@/components/GradientMesh';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Jamey McElveen | Senior Software Architect',
  description:
    'Senior Software Architect with 25+ years of experience in Christian tech and fintech. Expert in scalable solutions and AI-augmented engineering workflows.',
  keywords: [
    'Software Architect',
    'Senior Developer',
    'C#',
    '.NET',
    'React',
    'TypeScript',
    'Christian Tech',
    'FinTech',
  ],
  authors: [{ name: 'Jamey McElveen' }],
  openGraph: {
    title: 'Jamey McElveen | Senior Software Architect',
    description: 'Senior Software Architect with 25+ years of experience',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GradientMesh />
        <Navigation />
        <main className="min-h-screen pt-24">{children}</main>
      </body>
    </html>
  );
}
