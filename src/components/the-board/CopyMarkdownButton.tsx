'use client';

import { useState } from 'react';

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button type="button" className="board-refresh" onClick={() => void onCopy()}>
      {copied ? 'Copied' : 'Copy markdown'}
    </button>
  );
}
