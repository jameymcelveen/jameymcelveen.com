import { NextResponse } from 'next/server';
import { validateCareerQuestion } from '@/lib/api/career-validator';
import { checkRateLimit, resolveClientIp } from '@/lib/api/rate-limiter';
import { estimateCostUsd, resolveAnthropicModel, streamChat } from '@/lib/api/claude';
import { logChatTurn } from '@/lib/api/analytics-store';

interface ChatBody {
  message?: string;
  visitorKey?: string;
  sessionId?: string;
}

export async function POST(request: Request) {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body with a "message" field.' }, { status: 400 });
  }

  const ip = resolveClientIp(request);
  const rl = checkRateLimit(ip);
  const rateLimitHeaders = {
    'X-RateLimit-Limit': String(rl.limit),
    'X-RateLimit-Remaining': String(rl.remaining),
  };

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many interview requests from this network this hour. Please try again later.' },
      { status: 429, headers: { ...rateLimitHeaders, 'Retry-After': '3600' } },
    );
  }

  const validationError = validateCareerQuestion(body.message);
  if (validationError) {
    logChatTurn({
      visitSessionId: body.sessionId,
      visitorKey: body.visitorKey,
      userMessage: body.message ?? '',
      modelName: '',
      estimatedCostUsd: 0,
      httpStatus: 400,
      errorSummary: validationError,
    });
    return NextResponse.json({ error: validationError }, { status: 400, headers: rateLimitHeaders });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let promptTokens = 0;
      let outputTokens = 0;
      let fullText = '';
      let errorOccurred = false;
      let usageForCost: Parameters<typeof estimateCostUsd>[0] | null = null;

      try {
        for await (const event of streamChat(body.message!, request.signal)) {
          switch (event.type) {
            case 'delta': {
              fullText += event.text;
              const payload = JSON.stringify({ delta: event.text });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              break;
            }
            case 'done': {
              promptTokens = event.promptTokens;
              outputTokens = event.outputTokens;
              usageForCost = event.usage;
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            case 'error': {
              errorOccurred = true;
              const errPayload = JSON.stringify({ error: event.error });
              controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
              break;
            }
          }
        }
      } catch {
        // Client disconnected or abort — normal
      }

      const modelName = resolveAnthropicModel();
      logChatTurn({
        visitSessionId: body.sessionId,
        visitorKey: body.visitorKey,
        userMessage: body.message!,
        assistantExcerpt: fullText || null,
        modelName,
        promptTokens,
        outputTokens,
        estimatedCostUsd:
          errorOccurred || !usageForCost ? 0 : estimateCostUsd(usageForCost),
        httpStatus: errorOccurred ? 502 : 200,
        errorSummary: errorOccurred ? 'stream error' : null,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...rateLimitHeaders,
    },
  });
}
