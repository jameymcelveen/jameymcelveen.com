import type { Metadata } from 'next';
import { BlogShell } from '@/components/blog/BlogShell';
import { AdminHome } from './AdminHome';

export const metadata: Metadata = {
  title: 'Admin | Jamey McElveen',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <BlogShell>
      <AdminHome />
    </BlogShell>
  );
}
