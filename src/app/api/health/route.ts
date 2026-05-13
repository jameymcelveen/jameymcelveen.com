import { NextResponse } from 'next/server';
import { getSystemPromptPreview } from '@/lib/api/system-prompt';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    systemPromptHead: getSystemPromptPreview(200),
  });
}
