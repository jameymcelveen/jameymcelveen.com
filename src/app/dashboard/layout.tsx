import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Site Insights | Jamey McElveen',
  description:
    'Public analytics for jameymcelveen.com — visits, Ask Jamey questions, and resume interest. Built in-house.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
