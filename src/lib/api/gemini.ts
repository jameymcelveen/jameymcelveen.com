import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './system-prompt';

/** Default chat model (GA). Override with GEMINI_MODEL. */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/** Public pricing — https://ai.google.dev/gemini-api/docs/pricing (per 1M tokens, USD). */
export const GEMINI_25_FLASH_COST = {
  inputPerMillionUsd: 0.3,
  outputPerMillionUsd: 2.5,
} as const;

export const GEMINI_25_FLASH_LITE_COST = {
  inputPerMillionUsd: 0.1,
  outputPerMillionUsd: 0.4,
} as const;

const LEGACY_MODEL_ALIASES = ['models/gemini-2.0-flash', 'gemini-2.0-flash'] as const;

/**
 * Context caching (verified 2026-06): system prompt ≈5.3k tokens — above the 1,024-token
 * minimum for gemini-2.5-flash implicit/explicit caching per ai.google.dev/gemini-api/docs/caching.
 * Implicit caching is on by default for 2.5+; we keep systemInstruction on every request.
 * Explicit CachedContent is not wired: @google/generative-ai has no cache API, and at
 * portfolio traffic explicit TTL storage + per-instance cache lifecycle on serverless
 * does not beat implicit prefix hits — see .cursor/session-notes.md.
 */
export function resolveGeminiModel(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (!fromEnv) return DEFAULT_GEMINI_MODEL;
  if (LEGACY_MODEL_ALIASES.some((alias) => alias.toLowerCase() === fromEnv.toLowerCase())) {
    return DEFAULT_GEMINI_MODEL;
  }
  return fromEnv;
}

export function costRatesForModel(modelName: string): {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
} {
  const m = modelName.toLowerCase();
  if (m.includes('flash-lite')) return GEMINI_25_FLASH_LITE_COST;
  return GEMINI_25_FLASH_COST;
}

export function estimateCostUsd(
  promptTokens: number,
  outputTokens: number,
  modelName: string = resolveGeminiModel(),
): number {
  const rates = costRatesForModel(modelName);
  const input = Math.max(0, promptTokens) * (rates.inputPerMillionUsd / 1_000_000);
  const output = Math.max(0, outputTokens) * (rates.outputPerMillionUsd / 1_000_000);
  return Math.round((input + output) * 1e8) / 1e8;
}

export async function* streamChat(
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<
  | { type: 'delta'; text: string }
  | { type: 'done'; promptTokens: number; outputTokens: number }
  | { type: 'error'; error: string }
> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    yield { type: 'error', error: 'Server configuration error: missing Gemini API key.' };
    return;
  }

  const modelName = resolveGeminiModel();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 1024,
    },
  });

  try {
    const result = await model.generateContentStream(message, { signal });
    let fullText = '';

    for await (const chunk of result.stream) {
      const delta = chunk.text();
      if (delta) {
        fullText += delta;
        yield { type: 'delta', text: delta };
      }
    }

    const response = await result.response;
    const usage = response.usageMetadata;
    const promptTokens = usage?.promptTokenCount ?? 0;
    const outputTokens =
      usage?.candidatesTokenCount ??
      (usage?.totalTokenCount ? (usage.totalTokenCount ?? 0) - (usage.promptTokenCount ?? 0) : 0);

    if (!fullText.trim()) {
      yield { type: 'error', error: 'The model returned an empty response. Try rephrasing your question.' };
      return;
    }

    yield { type: 'done', promptTokens, outputTokens };
  } catch (err) {
    if (signal?.aborted) return;
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[gemini] stream error:', detail, err);
    const isDev = process.env.NODE_ENV === 'development';
    yield {
      type: 'error',
      error: isDev
        ? `Gemini error: ${detail}`
        : 'The interview service is temporarily unavailable. Please try again shortly.',
    };
  }
}
