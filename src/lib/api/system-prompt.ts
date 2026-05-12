import { readFileSync } from 'fs';
import { join } from 'path';

function loadPrompt(): string {
  try {
    return readFileSync(join(process.cwd(), 'src', 'lib', 'api', 'system-prompt.md'), 'utf-8');
  } catch {
    throw new Error('Missing system prompt file: src/lib/api/system-prompt.md');
  }
}

export const SYSTEM_PROMPT: string = loadPrompt();
