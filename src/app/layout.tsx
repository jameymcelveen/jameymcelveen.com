import type { Metadata } from 'next';
import { Caveat, Geist, Geist_Mono, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { Background } from '@/components/Background';
import { Navigation } from '@/components/Navigation';
import { PageChrome } from '@/components/PageChrome';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { AskJameyPanelProvider } from '@/context/AskJameyPanelContext';
import { getSiteDomain, getSiteMetadata } from '@/data';
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

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: 'variable',
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['600', '700'],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${caveat.variable} antialiased`}
      >
        <AnalyticsTracker />
        <Background />
        <SiteAnalytics />
        <AskJameyPanelProvider>
          <Navigation />
          <PageChrome>{children}</PageChrome>
        </AskJameyPanelProvider>
      </body>
    </html>
  );
}
