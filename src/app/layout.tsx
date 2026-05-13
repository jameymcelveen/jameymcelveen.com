import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { GradientMesh } from '@/components/GradientMesh';
import { Navigation } from '@/components/Navigation';
import { PageChrome } from '@/components/PageChrome';
import { AskJameyPanelProvider } from '@/context/AskJameyPanelContext';
import { getSiteDomain, getSiteMetadata } from '@/data';
import { Analytics } from '@vercel/analytics/next';
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
const siteDomain = getSiteDomain();

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteDomain.canonical}`),
  title: siteMetadata.title,
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  openGraph: {
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
    type: siteMetadata.openGraph.type as 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
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
        <Analytics />
        <AskJameyPanelProvider>
          <PageChrome>{children}</PageChrome>
        </AskJameyPanelProvider>
      </body>
    </html>
  );
}
