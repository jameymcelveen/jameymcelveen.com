'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Page rules for Paged.js. It turns these into real letter-size pages on screen,
 * and the same pages are what print and the PDF export get.
 */
const PAGE_CSS = `
@page {
  size: letter;
  margin: 0.5in 0.5in 0.55in;
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-family: 'Public Sans', system-ui, sans-serif;
    font-size: 7pt;
    color: #8a827a;
  }
}
`;

/**
 * Renders the resume once as plain markup (the fallback, and what search engines see),
 * then lets Paged.js lay it out as letter pages with real page breaks.
 * Sets data-paged="ready" on the root when done; scripts/export-resume-pdf.mjs waits for it.
 */
export function PagedPreview({ children }: { children: ReactNode }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'pending' | 'ready' | 'failed'>('pending');

  useEffect(() => {
    const source = sourceRef.current;
    const target = pagesRef.current;
    if (!source || !target) return;
    let cancelled = false;

    (async () => {
      try {
        await document.fonts?.ready;
        const { Previewer } = await import('pagedjs');
        if (cancelled) return;
        target.innerHTML = '';
        await new Previewer().preview(source.innerHTML, [{ 'resume-pages.css': PAGE_CSS }], target);
        if (!cancelled) setState('ready');
      } catch (err) {
        console.error('[resume] paged preview failed', err);
        if (!cancelled) setState('failed');
      }
    })();

    return () => {
      cancelled = true;
      target.innerHTML = '';
      // Paged.js adds global <style> tags (including print @page rules). Take them with us.
      document.querySelectorAll('style[data-pagedjs-inserted-styles]').forEach((el) => el.remove());
    };
  }, []);

  return (
    <div className="resume-paged" data-paged={state}>
      <div ref={sourceRef} className="resume-paged__source">
        {children}
      </div>
      <div ref={pagesRef} className="resume-paged__pages" aria-hidden={state !== 'ready'} />
    </div>
  );
}
