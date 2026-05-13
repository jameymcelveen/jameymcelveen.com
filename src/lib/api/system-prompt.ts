import { readFileSync } from 'fs';
import { join } from 'path';

let systemPromptLoadLogged = false;

function loadPrompt(): string {
  const cwd = process.cwd();
  const primary = join(cwd, 'src', 'lib', 'api', 'system-prompt.md');
  const fallbacks = [
    primary,
    join(__dirname, 'system-prompt.md'),
    join(__dirname, '..', '..', '..', 'src', 'lib', 'api', 'system-prompt.md'),
  ];

  for (const p of fallbacks) {
    try {
      const text = readFileSync(p, 'utf-8');
      if (!systemPromptLoadLogged && process.env.NODE_ENV !== 'test') {
        systemPromptLoadLogged = true;
        const head = text.slice(0, 100).replace(/\s+/g, ' ');
        console.log(`[system-prompt] loaded from ${p} first100=${head}`);
      }
      return text;
    } catch {
      // try next path
    }
  }

  throw new Error(`Missing system prompt file. Searched: ${fallbacks.join(', ')}`);
}

export const SYSTEM_PROMPT: string = loadPrompt();

export function getSystemPromptPreview(maxChars = 200): string {
  return SYSTEM_PROMPT.slice(0, Math.max(0, maxChars));
}
