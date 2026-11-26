'use client';

import { memo, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { NAME_TO_ISO2, NUMERIC_TO_ISO2 } from '@/lib/dashboard/iso-numeric';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/**
 * world-atlas@2 shapes carry a numeric ISO id and a name, and no alpha-2 property.
 * Analytics stores alpha-2, so translate here (the old ISO_A2 lookup never matched,
 * which is why the map never shaded anything).
 */
function iso2(geo: { id?: string | number; properties?: Record<string, string | number | undefined> }): string | null {
  const id = geo.id != null ? String(geo.id).padStart(3, '0') : '';
  if (id && NUMERIC_TO_ISO2[id]) return NUMERIC_TO_ISO2[id];
  const name = String(geo.properties?.name ?? '');
  return NAME_TO_ISO2[name] ?? null;
}

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
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
  const top = useMemo(
    () => [...countryCounts].sort((a, b) => b.count - a.count).slice(0, 6),
    [countryCounts]
  );

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
                if (iso === 'AQ') return null;
                const n = iso ? map.get(iso) ?? 0 : 0;
                const t = n / max;
                // Light page: land is a quiet gray, visited countries ramp up in the accent color.
                const fill =
                  n === 0
                    ? 'rgba(28, 30, 36, 0.09)'
                    : `color-mix(in srgb, var(--accent-blue) ${40 + Math.round(t * 55)}%, white)`;
                const title = iso ? `${countryName(iso)}: ${n > 0 ? `${n} visit${n === 1 ? '' : 's'}` : 'no visits yet'}` : undefined;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="rgba(28, 30, 36, 0.22)"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        outline: 'none',
                        fill: n > 0 ? 'var(--accent-blue)' : 'rgba(28, 30, 36, 0.16)',
                      },
                      pressed: { outline: 'none' },
                    }}
                    tabIndex={-1}
                    aria-label={title}
                  >
                    {title ? <title>{title}</title> : null}
                  </Geography>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      {top.length ? (
        <p className="text-[var(--text-secondary)] mt-2 px-1 text-center text-[0.78rem]">
          {top.map((c) => `${countryName(c.country.toUpperCase())} ${c.count}`).join(' · ')}
        </p>
      ) : (
        <p className="text-[var(--text-muted)] mt-2 px-1 text-center text-[0.78rem]">No located visits yet.</p>
      )}
      <p className="text-[var(--text-muted)] mt-1 px-1 text-center text-[10px]">
        Shading reflects page views by country. Location is derived from IP on the server; raw IPs are not stored.
      </p>
    </div>
  );
});
