import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './system-prompt';

/** Default Bill / Ask Jamey model (GA). Override with ANTHROPIC_MODEL. */
export const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5';

/** https://platform.claude.com/docs/en/about-claude/pricing — USD per 1M tokens */
export const CLAUDE_HAIKU_45_COST = {
  inputPerMillionUsd: 1.0,
  outputPerMillionUsd: 5.0,
  cacheReadPerMillionUsd: 0.1,
  cacheWrite5mPerMillionUsd: 1.25,
} as const;

export const MAX_OUTPUT_TOKENS = 1024;

export function resolveAnthropicModel(): string {
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  return fromEnv || DEFAULT_ANTHROPIC_MODEL;
}

export type AnthropicUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

export function estimateCostUsd(usage: AnthropicUsage): number {
  const rates = CLAUDE_HAIKU_45_COST;
  const input = Math.max(0, usage.input_tokens) * (rates.inputPerMillionUsd / 1_000_000);
  const output = Math.max(0, usage.output_tokens) * (rates.outputPerMillionUsd / 1_000_000);
  const cacheRead = Math.max(0, usage.cache_read_input_tokens ?? 0) * (rates.cacheReadPerMillionUsd / 1_000_000);
  const cacheWrite =
    Math.max(0, usage.cache_creation_input_tokens ?? 0) * (rates.cacheWrite5mPerMillionUsd / 1_000_000);
  return Math.round((input + output + cacheRead + cacheWrite) * 1e8) / 1e8;
}

/** Cached system + KB (~5.3k tokens) — above Haiku 4.5 4,096-token cache minimum. */
const CACHED_SYSTEM: Anthropic.Messages.TextBlockParam[] = [
  {
    type: 'text',
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' },
  },
];

export async function* streamChat(
  message: string,
  signal?: AbortSignal,
): AsyncGenerator<
  | { type: 'delta'; text: string }
  | { type: 'done'; promptTokens: number; outputTokens: number; usage: AnthropicUsage }
  | { type: 'error'; error: string }
> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    yield { type: 'error', error: 'Server configuration error: missing Anthropic API key.' };
    return;
  }

  const model = resolveAnthropicModel();
  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream(
      {
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.65,
        system: CACHED_SYSTEM,
        messages: [{ role: 'user', content: message }],
      },
      { signal },
    );

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        if (text) yield { type: 'delta', text };
      }
    }

    const finalMessage = await stream.finalMessage();
    const text = finalMessage.content
      .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    if (!text.trim()) {
      yield { type: 'error', error: 'The model returned an empty response. Try rephrasing your question.' };
      return;
    }

    const usage: AnthropicUsage = {
      input_tokens: finalMessage.usage.input_tokens,
      output_tokens: finalMessage.usage.output_tokens,
      cache_creation_input_tokens: finalMessage.usage.cache_creation_input_tokens,
      cache_read_input_tokens: finalMessage.usage.cache_read_input_tokens,
    };

    const promptTokens =
      usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);

    yield {
      type: 'done',
      promptTokens,
      outputTokens: usage.output_tokens,
      usage,
    };
  } catch (err) {
    if (signal?.aborted) return;
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[claude] stream error:', detail, err);
    const isDev = process.env.NODE_ENV === 'development';
    yield {
      type: 'error',
      error: isDev
        ? `Claude error: ${detail}`
        : 'The interview service is temporarily unavailable. Please try again shortly.',
    };
  }
}
