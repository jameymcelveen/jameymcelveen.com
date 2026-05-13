'use client';

/**
 * Subtle animated mesh behind the homepage hero — Clemson orange / purple thread, low contrast.
 */
export function HomeHeroBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.55]"
      aria-hidden
    >
      <div className="home-hero-mesh absolute -inset-[45%] bg-[radial-gradient(ellipse_55%_40%_at_25%_15%,rgba(245,102,0,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_78%_35%,rgba(82,45,128,0.2),transparent_50%),radial-gradient(ellipse_40%_35%_at_50%_85%,rgba(53,126,199,0.08),transparent_55%)]" />
      <div className="home-hero-drift absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(230,237,243,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
    </div>
  );
}
