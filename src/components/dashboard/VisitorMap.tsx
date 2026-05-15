'use client';

import { memo, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function iso2(geo: { properties: Record<string, string | number | undefined> }): string | null {
  const p = geo.properties;
  const raw = (p.ISO_A2 ?? p.iso_a2 ?? p.WB_A2 ?? '') as string;
  if (!raw || raw === '-99') return null;
  return raw.toUpperCase().slice(0, 2);
}

export const VisitorMap = memo(function VisitorMap({
  countryCounts,
}: {
  countryCounts: { country: string; count: number }[];
}) {
  const map = useMemo(
    () => new Map(countryCounts.map((c) => [c.country.toUpperCase(), c.count])),
    [countryCounts]
  );
  const max = useMemo(() => Math.max(1, ...countryCounts.map((c) => c.count)), [countryCounts]);

  return (
    <div className="glass-card relative w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--glass-border)] p-2 sm:p-4">
      <p className="text-[var(--text-muted)] mb-2 px-1 font-mono text-[10px] tracking-[0.18em] uppercase">
        Visitor map
      </p>
      <div className="relative h-[220px] w-full sm:h-[300px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 118, center: [0, 18] }}
          className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:max-w-full [&_svg]:w-full"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso = iso2(geo);
                const n = iso ? map.get(iso) ?? 0 : 0;
                const t = max > 0 ? n / max : 0;
                const fill =
                  n === 0
                    ? 'rgba(255,255,255,0.04)'
                    : `color-mix(in oklch, var(--accent-blue) ${35 + t * 55}%, rgba(15,20,35,0.9))`;
                const title =
                  iso && n > 0
                    ? `${iso}: ${n} visit${n === 1 ? '' : 's'}`
                    : iso
                      ? `${iso}: no visits yet`
                      : undefined;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={0.35}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: `color-mix(in oklch, var(--accent-blue) ${50 + t * 45}%, white)` },
                      pressed: { outline: 'none' },
                    }}
                    tabIndex={-1}
                    aria-label={title}
                    data-title={title}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      <p className="text-[var(--text-muted)] mt-2 px-1 text-center text-[10px]">
        Country shading reflects total page views from that country. Location is derived from IP on the server;
        raw IPs are not stored.
      </p>
    </div>
  );
});
