export type BoardHit = {
  id: string;
  score: number;
  title: string;
  company: string;
  url: string;
  comp: string | null;
  remote: boolean;
  freshness: string | null;
  source: string;
  nearMiss: boolean;
  deduction: string | null;
};

export type BoardSourceStat = {
  source: string;
  fetched: number;
  ok: boolean;
  cached: boolean;
  blocked: string | null;
  error: string | null;
};

export type BoardReject = {
  reason: string;
  count: number;
};

export type BoardScanStats = {
  fetched: number;
  displayed: number;
  nearMisses: number;
  rejected: number;
};

export type BoardPayload = {
  profile: 'jamey';
  generated: string;
  hits: BoardHit[];
  stats?: BoardScanStats;
  sources?: BoardSourceStat[];
  rejectedByReason?: BoardReject[];
};

export type BoardViewModel = {
  hits: BoardHit[];
  fetchedAt: string | null;
  lastScanLabel: string;
  stale: boolean;
  scannerUnreachable: boolean;
  empty: boolean;
  error: string | null;
  stats: BoardScanStats | null;
  sources: BoardSourceStat[];
  sourceCountsFromHits: boolean;
  rejectedByReason: BoardReject[];
};
