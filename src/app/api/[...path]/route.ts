import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Strip hop-by-hop / unsafe headers when forwarding to Railway. */
const SKIP_HEADER = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

function resolveUpstream(request: NextRequest): string | null {
  const proxy = process.env.INTERVIEW_API_PROXY_ORIGIN?.trim().replace(/\/+$/, '');
  if (proxy) return proxy;

  const fallback = process.env.INTERVIEW_API_URL?.trim().replace(/\/+$/, '');
  if (!fallback) return null;

  const reqHost = request.headers.get('host') ?? '';
  try {
    if (new URL(fallback).host === reqHost) return null;
  } catch {
    return null;
  }
  return fallback;
}

function forwardHeaders(request: NextRequest): Headers {
  const out = new Headers();
  request.headers.forEach((value, key) => {
    if (!SKIP_HEADER.has(key.toLowerCase())) {
      out.append(key, value);
    }
  });
  return out;
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const upstream = resolveUpstream(request);
  if (!upstream) {
    return NextResponse.json(
      {
        error:
          'API proxy is not configured. In Vercel → Settings → Environment Variables, set INTERVIEW_API_PROXY_ORIGIN to your Railway URL (e.g. https://xxxx.up.railway.app for the .NET service), then redeploy.',
      },
      { status: 503 }
    );
  }

  const subPath = pathSegments.join('/');
  const url = new URL(request.url);
  const target = `${upstream}/api/${subPath}${url.search}`;

  let body: ArrayBuffer | undefined;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  const upstreamRes = await fetch(target, {
    method: request.method,
    headers: forwardHeaders(request),
    body: body && body.byteLength > 0 ? body : undefined,
    redirect: 'manual',
  });

  const headers = new Headers(upstreamRes.headers);
  headers.delete('transfer-encoding');

  return new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function dispatch(request: NextRequest, ctx: RouteContext) {
  const { path } = await ctx.params;
  return proxy(request, Array.isArray(path) ? path : []);
}

export async function GET(request: NextRequest, ctx: RouteContext) {
  return dispatch(request, ctx);
}

export async function POST(request: NextRequest, ctx: RouteContext) {
  return dispatch(request, ctx);
}

export async function PUT(request: NextRequest, ctx: RouteContext) {
  return dispatch(request, ctx);
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  return dispatch(request, ctx);
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  return dispatch(request, ctx);
}

export async function OPTIONS(request: NextRequest, ctx: RouteContext) {
  return dispatch(request, ctx);
}
