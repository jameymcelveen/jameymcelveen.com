import { NextResponse } from 'next/server';
import { endSession } from '@/lib/api/analytics-store';

interface EndSessionBody {
  sessionId?: string;
}

export async function POST(request: Request) {
  let body: EndSessionBody;
  try {
    body = (await request.json()) as EndSessionBody;
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  if (!body.sessionId) {
    return NextResponse.json(null, { status: 400 });
  }

  endSession(body.sessionId);
  return NextResponse.json(null, { status: 200 });
}
