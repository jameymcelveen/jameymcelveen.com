/**
 * The model appends this marker (alone, at the very end of a reply) when it is inviting the
 * visitor to leave contact details for Jamey. The chat panel hides it and shows the lead card.
 */
export const OFFER_MARKER = '[[offer_contact]]';

export function hasOffer(text: string): boolean {
  return text.includes(OFFER_MARKER);
}

/** Remove the marker for display. While streaming, also hide a half-arrived marker like "[[offer_". */
export function stripOffer(text: string, streaming = false): string {
  let out = text.split(OFFER_MARKER).join('');
  if (streaming) {
    const m = out.match(/\[\[?[a-z_]*\]?$/);
    if (m && OFFER_MARKER.startsWith(m[0].replace(/\]$/, ''))) out = out.slice(0, m.index);
  }
  return out.replace(/\s+$/, '');
}
