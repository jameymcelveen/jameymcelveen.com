'use client';

/**
 * Fixed full-viewport backdrop: tileable tobacco grain + 135deg light gradient.
 * Content scrolls above so frosted glass reveals motion behind it (no background-attachment: fixed).
 */
export function Background() {
  return (
    <div className="site-bg" aria-hidden>
      <div className="site-bg__grain" />
      <div className="site-bg__gradient" />
    </div>
  );
}
