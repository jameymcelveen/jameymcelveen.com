import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { Navigation } from '@/components/Navigation';
import { GradientMesh } from '@/components/GradientMesh';
import { getSiteMetadata } from '@/data';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

const siteMetadata = getSiteMetadata();

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  openGraph: {
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
    type: siteMetadata.openGraph.type as 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AnalyticsTracker />
        <GradientMesh />
        <Navigation />
        <main className="min-h-screen pt-12">
          <div className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
