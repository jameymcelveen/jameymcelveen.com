'use client';

/**
 * Static hero backdrop — Clemson orange / purple at very low opacity + subtle grain (no motion).
 */
export function HomeHeroBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute -inset-[40%] opacity-[0.85]"
        style={{
          background: `
            radial-gradient(ellipse 55% 42% at 22% 18%, rgba(245, 102, 0, 0.07), transparent 58%),
            radial-gradient(ellipse 50% 44% at 82% 32%, rgba(82, 45, 128, 0.09), transparent 52%),
            radial-gradient(ellipse 42% 36% at 50% 88%, rgba(53, 126, 199, 0.05), transparent 55%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />
    </div>
  );
}
