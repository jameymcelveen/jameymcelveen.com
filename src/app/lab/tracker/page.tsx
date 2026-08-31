import { TrackerClient } from '@/components/lab/TrackerClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tracker',
  description: 'Personal application pipeline.',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default function TrackerPage() {
  return <TrackerClient />;
}
