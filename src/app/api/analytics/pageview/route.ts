import { NextResponse } from 'next/server';
import { addPageView } from '@/lib/api/analytics-store';

interface PageViewBody {
  sessionId?: string;
  path?: string;
  title?: string | null;
}

export async function POST(request: Request) {
  let body: PageViewBody;
  try {
    body = (await request.json()) as PageViewBody;
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  if (!body.sessionId || !body.path) {
    return NextResponse.json(null, { status: 400 });
  }

  const result = addPageView({
    sessionId: body.sessionId,
    path: body.path,
    title: body.title,
  });

  if (!result) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(result);
}
