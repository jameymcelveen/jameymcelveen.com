'use client';

/**
 * Fixed full-viewport backdrop: tile weave + tobacco grain + 135deg gradient overlay.
 * Content scrolls above so frosted glass reveals the static tile pattern behind it.
 */
export function Background() {
  return (
    <div className="site-bg" aria-hidden>
      <div className="site-bg__tile" />
      <div className="site-bg__grain" />
      <div className="site-bg__gradient" />
    </div>
  );
}
