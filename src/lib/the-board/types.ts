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
};

export type BoardPayload = {
  profile: 'jamey';
  generated: string;
  hits: BoardHit[];
};

export type BoardViewModel = {
  hits: BoardHit[];
  fetchedAt: string | null;
  lastScanLabel: string;
  stale: boolean;
  scannerUnreachable: boolean;
  empty: boolean;
  error: string | null;
};
