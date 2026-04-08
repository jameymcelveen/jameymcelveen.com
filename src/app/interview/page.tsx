'use client';

import { useEffect } from 'react';

/** Legacy `/interview` → `/ai`. */
export default function InterviewPage() {
  useEffect(() => {
    window.location.replace('/ai');
  }, []);

  return (
    <p className="text-foreground-muted p-8 text-center text-sm">Redirecting…</p>
  );
}
