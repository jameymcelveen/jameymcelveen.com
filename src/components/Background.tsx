'use client';

/**
 * Fixed full-viewport backdrop: tiled sand texture (source: assets/sand.jpg) + 135deg gradient.
 * Content scrolls above so frosted glass reveals the static tile pattern behind it.
 */
export function Background() {
  return (
    <div className="site-bg" aria-hidden>
      <div className="site-bg__sand" />
      <div className="site-bg__gradient" />
    </div>
  );
}
