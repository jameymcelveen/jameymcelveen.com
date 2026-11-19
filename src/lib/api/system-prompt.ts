import { readFileSync } from 'fs';
import { join } from 'path';

let systemPromptLoadLogged = false;

const PROMPT_PARTS = ['system-prompt.md', 'knowledge/background.md', 'knowledge/interview-qa.md'] as const;

function apiDirCandidates(): string[] {
  const dirs = [join(process.cwd(), 'src', 'lib', 'api')];
  try {
    dirs.push(__dirname);
    dirs.push(join(__dirname, '..', '..', '..', 'src', 'lib', 'api'));
  } catch {
    // ESM tests have no __dirname
  }
  return dirs;
}

function readPart(relativePath: string): string {
  const searched: string[] = [];
  for (const dir of apiDirCandidates()) {
    const p = join(dir, relativePath);
    searched.push(p);
    try {
      return readFileSync(p, 'utf-8');
    } catch {
      // try next
    }
  }
  throw new Error(`Missing system prompt file. Searched: ${searched.join(', ')}`);
}

function loadPrompt(): string {
  const text = PROMPT_PARTS.map((part) => readPart(part).trimEnd()).join('\n\n');
  if (!systemPromptLoadLogged && process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
    systemPromptLoadLogged = true;
    console.log(`[system-prompt] loaded ${text.length} chars`);
  }
  return text;
}

export const SYSTEM_PROMPT: string = loadPrompt();

export function getSystemPromptPreview(maxChars = 200): string {
  return SYSTEM_PROMPT.slice(0, Math.max(0, maxChars));
}
