import { readFileSync } from 'fs';
import { join } from 'path';

function loadPrompt(): string {
  const paths = [
    join(process.cwd(), 'src', 'lib', 'api', 'system-prompt.md'),
    join(__dirname, 'system-prompt.md'),
    join(__dirname, '..', '..', '..', 'src', 'lib', 'api', 'system-prompt.md'),
  ];

  for (const p of paths) {
    try {
      return readFileSync(p, 'utf-8');
    } catch {
      // try next path
    }
  }

  throw new Error(`Missing system prompt file. Searched: ${paths.join(', ')}`);
}

export const SYSTEM_PROMPT: string = loadPrompt();
