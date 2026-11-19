import { readFileSync } from 'fs';
import { join } from 'path';

let systemPromptLoadLogged = false;

/** Next provides __dirname; plain Node ESM (the test runner) does not. */
const here = typeof __dirname === 'string' ? __dirname : process.cwd();

/**
 * Read one prompt file, trying the usual locations (dev, Next build, Vercel trace).
 * Every file read here must also be listed in next.config.ts outputFileTracingIncludes.
 */
function loadFile(relativePath: string): string {
  const parts = relativePath.split('/');
  const fallbacks = [
    join(process.cwd(), 'src', 'lib', 'api', ...parts),
    join(here, ...parts),
    join(here, '..', '..', '..', 'src', 'lib', 'api', ...parts),
  ];

  for (const p of fallbacks) {
    try {
      return readFileSync(p, 'utf-8');
    } catch {
      // try next path
    }
  }

  throw new Error(`Missing system prompt file. Searched: ${fallbacks.join(', ')}`);
}

/**
 * Persona and rules first, then the two source-of-truth documents.
 * Order matters: the whole string is one cached system block (see claude.ts).
 */
function loadPrompt(): string {
  const persona = loadFile('system-prompt.md');
  const background = loadFile('knowledge/background.md');
  const interviewAnswers = loadFile('knowledge/interview-qa.md');

  const text = [
    persona.trim(),
    `<background>\n${background.trim()}\n</background>`,
    `<interview_answers>\n${interviewAnswers.trim()}\n</interview_answers>`,
  ].join('\n\n');

  if (!systemPromptLoadLogged && process.env.NODE_ENV !== 'test') {
    systemPromptLoadLogged = true;
    const head = text.slice(0, 100).replace(/\s+/g, ' ');
    console.log(`[system-prompt] loaded ${text.length} chars first100=${head}`);
  }
  return text;
}

export const SYSTEM_PROMPT: string = loadPrompt();

export function getSystemPromptPreview(maxChars = 200): string {
  return SYSTEM_PROMPT.slice(0, Math.max(0, maxChars));
}
