export interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_TURNS = 8;
const MAX_CHARS = 2000;

/**
 * Clean the conversation history the browser sends. Keeps the last few turns, drops anything
 * malformed, and makes sure the first turn is the visitor's (the API requires it).
 */
export function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const turns: HistoryTurn[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const text = content.trim().slice(0, MAX_CHARS);
    if (text) turns.push({ role, content: text });
  }
  const recent = turns.slice(-MAX_TURNS);
  while (recent.length && recent[0].role !== 'user') recent.shift();
  return recent;
}
