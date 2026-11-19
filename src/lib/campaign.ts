/** Tagged-link helpers. No imports, so the browser and the server share one definition. */

const ALLOWED = /^[a-z0-9][a-z0-9._\-/ ]{0,98}$/;

/** Lowercase, trim and validate a tag. Returns null for anything that is not a plain short label. */
export function cleanCampaign(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase().replace(/\s+/g, '-');
  return ALLOWED.test(v) ? v : null;
}

/**
 * Build a tag from a landing URL's query string.
 *   ?utm_source=linkedin&utm_campaign=andrew-curana  ->  "linkedin/andrew-curana"
 *   ?ref=pam-apex                                    ->  "pam-apex"
 * Pieces are source, medium, campaign, in that order; missing ones are skipped.
 */
export function campaignFromSearch(search: string): string | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return null;
  }
  const ref = cleanCampaign(params.get('ref'));
  if (ref) return ref;
  const parts = ['utm_source', 'utm_medium', 'utm_campaign']
    .map((k) => cleanCampaign(params.get(k)))
    .filter((p): p is string => Boolean(p));
  return parts.length ? parts.join('/') : null;
}
