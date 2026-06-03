/**
 * In-memory analytics store for Vercel serverless.
 *
 * NOTE: Vercel serverless functions are stateless — data here only lives for the
 * lifetime of a single function invocation (cold start → response). For durable
 * analytics, swap this for Vercel Postgres (Neon), Vercel KV, or an external DB.
 * The API contract stays identical.
 */

export interface VisitSession {
  id: string;
  visitorKey: string;
  startedAtUtc: string;
  endedAtUtc: string | null;
  referrer: string | null;
  referrerHost: string | null;
  landingPath: string;
  userAgent: string | null;
  acceptLanguage: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  timeZone: string | null;
  ipAddress: string | null;
}

export interface PageView {
  id: string;
  visitSessionId: string;
  path: string;
  title: string | null;
  enteredAtUtc: string;
  leftAtUtc: string | null;
  durationSeconds: number | null;
}

export interface AiChatTurn {
  id: string;
  visitSessionId: string | null;
  visitorKey: string | null;
  userMessage: string;
  assistantExcerpt: string | null;
  modelName: string;
  promptTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number;
  httpStatus: number;
  errorSummary: string | null;
  createdAtUtc: string;
}

const sessions = new Map<string, VisitSession>();
const pageViews: PageView[] = [];
const chatTurns: AiChatTurn[] = [];

function trunc(s: string | null | undefined, max: number): string | null {
  if (!s) return null;
  return s.length <= max ? s : s.slice(0, max);
}

function truncVis(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.length <= 64 ? s : s.slice(0, 64);
}

function referrerHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname || null;
  } catch {
    return null;
  }
}

export function startSession(data: {
  sessionId: string;
  visitorKey: string;
  referrer?: string | null;
  landingPath: string;
  userAgent?: string | null;
  acceptLanguage?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  timeZone?: string | null;
  ipAddress: string;
}): { sessionId: string } {
  if (sessions.has(data.sessionId)) return { sessionId: data.sessionId };

  sessions.set(data.sessionId, {
    id: data.sessionId,
    visitorKey: truncVis(data.visitorKey) ?? '',
    startedAtUtc: new Date().toISOString(),
    endedAtUtc: null,
    referrer: trunc(data.referrer, 2048),
    referrerHost: trunc(referrerHost(data.referrer), 512),
    landingPath: trunc(data.landingPath, 1024) || '/',
    userAgent: trunc(data.userAgent, 1024),
    acceptLanguage: trunc(data.acceptLanguage, 128),
    screenWidth: data.screenWidth ?? null,
    screenHeight: data.screenHeight ?? null,
    viewportWidth: data.viewportWidth ?? null,
    viewportHeight: data.viewportHeight ?? null,
    timeZone: trunc(data.timeZone, 128),
    ipAddress: trunc(data.ipAddress, 64),
  });

  return { sessionId: data.sessionId };
}

export function addPageView(data: {
  sessionId: string;
  path: string;
  title?: string | null;
}): { pageViewId: string } | null {
  if (!sessions.has(data.sessionId)) return null;

  const now = new Date().toISOString();
  closeOpenPageViews(data.sessionId, now);

  const id = crypto.randomUUID();
  pageViews.push({
    id,
    visitSessionId: data.sessionId,
    path: trunc(data.path, 2048) ?? '/',
    title: trunc(data.title, 512),
    enteredAtUtc: now,
    leftAtUtc: null,
    durationSeconds: null,
  });

  return { pageViewId: id };
}

export function endSession(sessionId: string): void {
  const now = new Date().toISOString();
  closeOpenPageViews(sessionId, now);
  const session = sessions.get(sessionId);
  if (session) session.endedAtUtc = now;
}

function closeOpenPageViews(sessionId: string, now: string): void {
  for (const pv of pageViews) {
    if (pv.visitSessionId === sessionId && !pv.leftAtUtc) {
      pv.leftAtUtc = now;
      const entered = new Date(pv.enteredAtUtc).getTime();
      const left = new Date(now).getTime();
      pv.durationSeconds = Math.max(0, Math.min(Math.round((left - entered) / 1000), 864000));
    }
  }
}

export function logChatTurn(data: {
  visitSessionId?: string | null;
  visitorKey?: string | null;
  userMessage: string;
  assistantExcerpt?: string | null;
  modelName: string;
  promptTokens?: number | null;
  outputTokens?: number | null;
  estimatedCostUsd: number;
  httpStatus: number;
  errorSummary?: string | null;
}): void {
  chatTurns.push({
    id: crypto.randomUUID(),
    visitSessionId: data.visitSessionId ?? null,
    visitorKey: truncVis(data.visitorKey),
    userMessage: trunc(data.userMessage, 8000) ?? '',
    assistantExcerpt: data.assistantExcerpt ? trunc(data.assistantExcerpt, 2000) : null,
    modelName: data.modelName || '',
    promptTokens: data.promptTokens ?? null,
    outputTokens: data.outputTokens ?? null,
    estimatedCostUsd: data.estimatedCostUsd,
    httpStatus: data.httpStatus,
    errorSummary: data.errorSummary ? trunc(data.errorSummary, 2000) : null,
    createdAtUtc: new Date().toISOString(),
  });
}

export function getStatsDashboard() {
  const successTurns = chatTurns.filter((t) => t.httpStatus === 200);
  const totalUsd = successTurns.reduce((sum, t) => sum + t.estimatedCostUsd, 0);
  const totalPrompt = successTurns.reduce((sum, t) => sum + (t.promptTokens ?? 0), 0);
  const totalOutput = successTurns.reduce((sum, t) => sum + (t.outputTokens ?? 0), 0);
  const avgPerTurn = successTurns.length === 0 ? 0 : totalUsd / successTurns.length;

  const sessionCosts = new Map<string, number>();
  for (const t of successTurns) {
    if (t.visitSessionId) {
      sessionCosts.set(t.visitSessionId, (sessionCosts.get(t.visitSessionId) ?? 0) + t.estimatedCostUsd);
    }
  }
  const costValues = [...sessionCosts.values()];
  const avgPerAiSession = costValues.length === 0 ? 0 : costValues.reduce((a, b) => a + b, 0) / costValues.length;

  const dwellSums = new Map<string, number>();
  for (const pv of pageViews) {
    if (pv.durationSeconds != null) {
      dwellSums.set(pv.visitSessionId, (dwellSums.get(pv.visitSessionId) ?? 0) + pv.durationSeconds);
    }
  }
  const dwellValues = [...dwellSums.values()];
  const avgSessionSeconds = dwellValues.length === 0 ? null : dwellValues.reduce((a, b) => a + b, 0) / dwellValues.length;

  const pathCounts = new Map<string, number>();
  for (const pv of pageViews) pathCounts.set(pv.path, (pathCounts.get(pv.path) ?? 0) + 1);
  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([path, views]) => ({ path, views }));

  const refCounts = new Map<string, number>();
  for (const s of sessions.values()) {
    if (s.referrerHost) refCounts.set(s.referrerHost, (refCounts.get(s.referrerHost) ?? 0) + 1);
  }
  const topReferrers = [...refCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([referrerHost, sessionCount]) => ({ referrerHost, sessions: sessionCount }));

  const recentChats = [...chatTurns]
    .sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc))
    .slice(0, 40)
    .map((t) => ({
      createdAtUtc: t.createdAtUtc,
      userMessage: t.userMessage,
      estimatedCostUsd: t.estimatedCostUsd,
      httpStatus: t.httpStatus,
      promptTokens: t.promptTokens,
      outputTokens: t.outputTokens,
    }));

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 13);
  cutoff.setUTCHours(0, 0, 0, 0);

  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const pv = pageViews.filter((p) => p.enteredAtUtc.slice(0, 10) === dayStr).length;
    const ss = [...sessions.values()].filter((s) => s.startedAtUtc.slice(0, 10) === dayStr).length;
    const usd = chatTurns
      .filter((t) => t.httpStatus === 200 && t.createdAtUtc.slice(0, 10) === dayStr)
      .reduce((sum, t) => sum + t.estimatedCostUsd, 0);
    last14.push({ day: dayStr, pageViews: pv, sessions: ss, llmUsd: usd });
  }

  return {
    llm: {
      totalEstimatedUsd: totalUsd,
      totalTurns: chatTurns.length,
      successfulTurns: successTurns.length,
      avgCostPerTurnUsd: avgPerTurn,
      avgCostPerAiSessionUsd: avgPerAiSession,
      totalPromptTokens: totalPrompt,
      totalOutputTokens: totalOutput,
    },
    visits: {
      totalSessions: sessions.size,
      totalPageViews: pageViews.length,
      avgSessionDurationSeconds: avgSessionSeconds,
      topPaths,
      topReferrers,
    },
    recentChats,
    last14Days: last14,
  };
}
