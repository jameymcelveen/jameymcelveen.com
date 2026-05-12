import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './system-prompt';

const INPUT_PER_MILLION_USD = 0.075;
const OUTPUT_PER_MILLION_USD = 0.3;

export function estimateCostUsd(promptTokens: number, outputTokens: number): number {
  const input = Math.max(0, promptTokens) * (INPUT_PER_MILLION_USD / 1_000_000);
  const output = Math.max(0, outputTokens) * (OUTPUT_PER_MILLION_USD / 1_000_000);
  return Math.round((input + output) * 1e8) / 1e8;
}

function resolveModel(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (!fromEnv) return 'gemini-2.0-flash';
  const legacy = ['models/gemini-2.0-flash', 'gemini-2.0-flash'];
  if (legacy.some((a) => a.toLowerCase() === fromEnv.toLowerCase())) return 'gemini-2.0-flash';
  return fromEnv;
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

  const modelName = resolveModel();
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
    const outputTokens = usage?.candidatesTokenCount ?? usage?.totalTokenCount
      ? (usage?.totalTokenCount ?? 0) - (usage?.promptTokenCount ?? 0)
      : 0;

    if (!fullText.trim()) {
      yield { type: 'error', error: 'The model returned an empty response. Try rephrasing your question.' };
      return;
    }

    yield { type: 'done', promptTokens, outputTokens };
  } catch (err) {
    if (signal?.aborted) return;
    console.error('[gemini] stream error:', err);
    yield { type: 'error', error: 'The interview service is temporarily unavailable. Please try again shortly.' };
  }
}
