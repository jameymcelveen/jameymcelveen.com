import type { BoardHit } from './types';

export const HIT_BODY_MAX = 24_000;

export function clipHitBody(body: string | null | undefined): string | null {
  const text = (body ?? '').trim();
  if (!text) return null;
  if (text.length <= HIT_BODY_MAX) return text;
  return `${text.slice(0, HIT_BODY_MAX)}\n\n[truncated]`;
}

export function hitToMarkdown(hit: BoardHit): string {
  const facts = [
    `- Score: ${hit.score}`,
    hit.comp ? `- Comp: ${hit.comp}` : null,
    hit.location ? `- Location: ${hit.location}` : null,
    `- Remote: ${hit.remote ? 'yes' : 'no'}`,
    hit.freshness ? `- Freshness: ${hit.freshness}` : null,
    `- Source: ${hit.source}`,
    hit.nearMiss && hit.deduction ? `- Near miss: ${hit.deduction}` : null,
  ].filter((line): line is string => Boolean(line));

  const parts = [`# ${hit.title}`, '', `**${hit.company}**`, '', ...facts, '', `[Original posting](${hit.url})`];

  if (hit.why.length > 0) {
    parts.push('', '## Rubric', ...hit.why.map((line) => `- ${line}`));
  }

  if (hit.body) {
    parts.push('', '## Posting', '', hit.body);
  } else {
    parts.push('', '_Full posting text was not stored on this scan. Open the original listing._');
  }

  return `${parts.join('\n')}\n`;
}
